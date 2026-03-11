import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, Plus, ChevronDown, ChevronRight, Search, Edit3, Save, X,
  Trash2, BookOpen, Package, Hash, Ruler, FileText, CheckCircle, Clock,
  AlertCircle, Calendar, Layers, Eye
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

// ─── Types ──────────────────────────────────────────────

interface BookProduction {
  id: string;
  bookTitle: string;
  authorName: string;
  imprint: 'runa-atlas' | 'bohio-press' | 'void-noir';
  status: 'pre-production' | 'in-production' | 'proofing' | 'approved' | 'live';
  // ISBNs
  isbnPrint?: string;
  isbnEbook?: string;
  isbnAudiobook?: string;
  // Print Specs
  trimSize?: string;
  pageCount?: number;
  paperType?: string;
  bindingType?: string;
  interiorColor?: string;
  coverFinish?: string;
  spineWidth?: string;
  // Pricing
  printPrice?: string;
  ebookPrice?: string;
  wholesaleDiscount?: string;
  // Dates
  pubDate?: string;
  printReadyDate?: string;
  proofOrderDate?: string;
  proofApprovedDate?: string;
  // Files
  filesReady: {
    interiorPdf?: boolean;
    coverPdf?: boolean;
    epub?: boolean;
    spineCalculated?: boolean;
    barcodeAdded?: boolean;
  };
  // Metadata
  bisacCodes?: string[];
  keywords?: string[];
  description?: string;
  notes?: string;
  createdAt?: Timestamp;
}

// ─── Config ─────────────────────────────────────────────

const PRODUCTION_STATUS = {
  'pre-production': { label: 'Pre-Production', color: 'text-text-muted bg-white/5', icon: Clock },
  'in-production': { label: 'In Production', color: 'text-cyan-400 bg-cyan-500/10', icon: Layers },
  proofing: { label: 'Proofing', color: 'text-amber-400 bg-amber-500/10', icon: Eye },
  approved: { label: 'Approved', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle },
  live: { label: 'Live', color: 'text-starforge-gold bg-starforge-gold/10', icon: CheckCircle },
};

const IMPRINT_CONFIG = {
  'runa-atlas': { label: 'Rüna Atlas', color: 'text-starforge-gold' },
  'bohio-press': { label: 'Bohío Press', color: 'text-orange-400' },
  'void-noir': { label: 'Void Noir', color: 'text-red-400' },
};

const TRIM_SIZES = ['5" x 8"', '5.25" x 8"', '5.5" x 8.5"', '6" x 9"', '8.5" x 11"', 'Custom'];
const PAPER_TYPES = ['Cream (50#)', 'White (50#)', 'Cream (60#)', 'White (60#)', 'Groundwood', 'Coated (for image-heavy)'];
const BINDING_TYPES = ['Perfect Bound', 'Case Laminate (Hardcover)', 'Dust Jacket Hardcover', 'Saddle Stitch', 'Spiral Bound'];
const INTERIOR_COLORS = ['Black & White', 'Standard Color', 'Premium Color'];
const COVER_FINISHES = ['Matte Laminate', 'Gloss Laminate', 'Matte + Spot UV', 'Soft Touch', 'Uncoated'];

export default function AdminProduction() {
  const [books, setBooks] = useState<BookProduction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const resetForm = () => { setFormData({}); setShowAddForm(false); setEditing(null); };
  const updateForm = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  // ─── Firestore Sync ──────────────────────────────────

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'book_production'), orderBy('bookTitle')),
      (snap) => setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() } as BookProduction))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'book_production')
    );
    return () => unsub();
  }, []);

  // ─── CRUD ────────────────────────────────────────────

  const addBook = async () => {
    if (!formData.bookTitle?.trim()) return;
    try {
      await addDoc(collection(db, 'book_production'), {
        ...formData,
        status: formData.status || 'pre-production',
        imprint: formData.imprint || 'runa-atlas',
        filesReady: { interiorPdf: false, coverPdf: false, epub: false, spineCalculated: false, barcodeAdded: false },
        createdAt: serverTimestamp(),
      });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'book_production');
    }
  };

  const updateBook = async (id: string) => {
    try {
      await updateDoc(doc(db, 'book_production', id), { ...formData });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'book_production');
    }
  };

  const deleteBook = async (id: string) => {
    if (!confirm('Delete this production record?')) return;
    try {
      await deleteDoc(doc(db, 'book_production', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'book_production');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'book_production', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'book_production');
    }
  };

  const toggleFileReady = async (bookId: string, fileKey: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const updated = { ...book.filesReady, [fileKey]: !book.filesReady[fileKey as keyof typeof book.filesReady] };
    try {
      await updateDoc(doc(db, 'book_production', bookId), { filesReady: updated });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'book_production');
    }
  };

  const startEdit = (book: BookProduction) => {
    const { id, createdAt, filesReady, ...rest } = book;
    setFormData(rest);
    setEditing(id);
    setShowAddForm(true);
  };

  // ─── Computed ────────────────────────────────────────

  const filtered = books.filter(b => {
    if (filterStatus && b.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.bookTitle.toLowerCase().includes(q) || b.authorName?.toLowerCase().includes(q);
    }
    return true;
  });

  const FILE_CHECKS = [
    { key: 'interiorPdf', label: 'Interior PDF (300dpi)', icon: FileText },
    { key: 'coverPdf', label: 'Cover PDF (CMYK)', icon: Layers },
    { key: 'epub', label: 'EPUB File', icon: BookOpen },
    { key: 'spineCalculated', label: 'Spine Width Calculated', icon: Ruler },
    { key: 'barcodeAdded', label: 'ISBN Barcode Added', icon: Hash },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-text-primary flex items-center gap-3">
            <Printer className="w-6 h-6 text-starforge-gold" /> Production Specs
          </h2>
          <p className="text-sm text-text-secondary mt-1">ISBNs, trim sizes, print specifications, and production status per title.</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Title
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(PRODUCTION_STATUS).map(([key, conf]) => {
          const count = books.filter(b => b.status === key).length;
          const Icon = conf.icon;
          return (
            <button key={key} onClick={() => setFilterStatus(filterStatus === key ? null : key)}
              className={`p-3 rounded-xl border text-center transition-all ${filterStatus === key
                ? `${conf.color} border-current/20` : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <p className="font-display text-lg">{count}</p>
              <p className="text-[9px] uppercase tracking-widest">{conf.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search titles..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-xl bg-surface border border-starforge-gold/20">
            <h3 className="font-heading text-lg text-text-primary mb-4">{editing ? 'Edit' : 'Add'} Production Record</h3>

            {/* Basic Info */}
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Book Info</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Title *</label>
                <input value={formData.bookTitle || ''} onChange={e => updateForm('bookTitle', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Author</label>
                <input value={formData.authorName || ''} onChange={e => updateForm('authorName', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Imprint</label>
                <select value={formData.imprint || 'runa-atlas'} onChange={e => updateForm('imprint', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  {Object.entries(IMPRINT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>

            {/* ISBNs */}
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">ISBNs</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Print ISBN</label>
                <input value={formData.isbnPrint || ''} onChange={e => updateForm('isbnPrint', e.target.value)} placeholder="978-..."
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white font-mono focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">eBook ISBN</label>
                <input value={formData.isbnEbook || ''} onChange={e => updateForm('isbnEbook', e.target.value)} placeholder="978-..."
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white font-mono focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Audiobook ISBN</label>
                <input value={formData.isbnAudiobook || ''} onChange={e => updateForm('isbnAudiobook', e.target.value)} placeholder="978-..."
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white font-mono focus:border-starforge-gold outline-none" />
              </div>
            </div>

            {/* Print Specs */}
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Print Specifications</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Trim Size</label>
                <select value={formData.trimSize || ''} onChange={e => updateForm('trimSize', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="">Select...</option>
                  {TRIM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Page Count</label>
                <input type="number" value={formData.pageCount || ''} onChange={e => updateForm('pageCount', Number(e.target.value))}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Paper Type</label>
                <select value={formData.paperType || ''} onChange={e => updateForm('paperType', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="">Select...</option>
                  {PAPER_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Binding</label>
                <select value={formData.bindingType || ''} onChange={e => updateForm('bindingType', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="">Select...</option>
                  {BINDING_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Interior Color</label>
                <select value={formData.interiorColor || ''} onChange={e => updateForm('interiorColor', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="">Select...</option>
                  {INTERIOR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Cover Finish</label>
                <select value={formData.coverFinish || ''} onChange={e => updateForm('coverFinish', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="">Select...</option>
                  {COVER_FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Spine Width</label>
                <input value={formData.spineWidth || ''} onChange={e => updateForm('spineWidth', e.target.value)} placeholder="e.g., 0.87&quot;"
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
            </div>

            {/* Pricing */}
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Pricing</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Print Price (USD)</label>
                <input value={formData.printPrice || ''} onChange={e => updateForm('printPrice', e.target.value)} placeholder="$16.99"
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">eBook Price (USD)</label>
                <input value={formData.ebookPrice || ''} onChange={e => updateForm('ebookPrice', e.target.value)} placeholder="$9.99"
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Wholesale Discount</label>
                <input value={formData.wholesaleDiscount || ''} onChange={e => updateForm('wholesaleDiscount', e.target.value)} placeholder="55%"
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
            </div>

            {/* Dates */}
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Key Dates</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Publication Date</label>
                <input type="date" value={formData.pubDate || ''} onChange={e => updateForm('pubDate', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Print-Ready Deadline</label>
                <input type="date" value={formData.printReadyDate || ''} onChange={e => updateForm('printReadyDate', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Proof Ordered</label>
                <input type="date" value={formData.proofOrderDate || ''} onChange={e => updateForm('proofOrderDate', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Proof Approved</label>
                <input type="date" value={formData.proofApprovedDate || ''} onChange={e => updateForm('proofApprovedDate', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs text-text-secondary mb-1">Notes</label>
              <textarea value={formData.notes || ''} onChange={e => updateForm('notes', e.target.value)} rows={2}
                className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none resize-y" />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-sm text-text-secondary hover:text-white">Cancel</button>
              <button onClick={() => editing ? updateBook(editing) : addBook()} disabled={!formData.bookTitle?.trim()}
                className="px-4 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50">
                <Save className="w-4 h-4 inline mr-1" /> {editing ? 'Update' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ BOOK LIST ═══ */}
      {filtered.length === 0 && !showAddForm ? (
        <div className="text-center py-16 text-text-muted">
          <Printer className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">No production records yet. Add your first title.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(book => {
            const statusConf = PRODUCTION_STATUS[book.status];
            const StatusIcon = statusConf.icon;
            const imprintConf = IMPRINT_CONFIG[book.imprint] || IMPRINT_CONFIG['runa-atlas'];
            const isExpanded = expandedBook === book.id;
            const filesComplete = book.filesReady ? Object.values(book.filesReady).filter(Boolean).length : 0;

            return (
              <motion.div key={book.id} layout className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <button onClick={() => setExpandedBook(isExpanded ? null : book.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-text-primary truncate">{book.bookTitle}</h4>
                      <span className={`text-[10px] ${imprintConf.color}`}>{imprintConf.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-0.5">
                      {book.authorName && <span>{book.authorName}</span>}
                      {book.isbnPrint && <span className="font-mono text-text-muted">{book.isbnPrint}</span>}
                      {book.trimSize && <span className="text-text-muted">{book.trimSize}</span>}
                      {book.pubDate && <span className="text-text-muted flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{book.pubDate}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">{filesComplete}/5 files</span>
                    <span className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full ${statusConf.color}`}>
                      <StatusIcon className="w-3 h-3" /> {statusConf.label}
                    </span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.04]">
                      <div className="p-5 space-y-5">
                        {/* Status + Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-text-muted uppercase tracking-wider">Status:</span>
                          {(Object.keys(PRODUCTION_STATUS) as (keyof typeof PRODUCTION_STATUS)[]).map(s => {
                            const conf = PRODUCTION_STATUS[s];
                            const Icon = conf.icon;
                            return (
                              <button key={s} onClick={() => updateStatus(book.id, s)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all border ${book.status === s
                                  ? `${conf.color} border-current/20` : 'text-text-muted border-transparent hover:text-white'}`}>
                                <Icon className="w-2.5 h-2.5" /> {conf.label}
                              </button>
                            );
                          })}
                          <button onClick={() => startEdit(book)} className="ml-auto text-text-muted hover:text-white transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteBook(book.id)} className="text-text-muted hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* ISBNs */}
                          <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1"><Hash className="w-3 h-3" /> ISBNs</h4>
                            <div className="space-y-1.5">
                              {[
                                { label: 'Print', value: book.isbnPrint },
                                { label: 'eBook', value: book.isbnEbook },
                                { label: 'Audio', value: book.isbnAudiobook },
                              ].map(isbn => (
                                <div key={isbn.label} className="flex items-center justify-between text-xs">
                                  <span className="text-text-muted">{isbn.label}</span>
                                  <span className={`font-mono ${isbn.value ? 'text-text-primary' : 'text-text-muted italic'}`}>
                                    {isbn.value || 'Not assigned'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Print Specs */}
                          <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1"><Ruler className="w-3 h-3" /> Print Specs</h4>
                            <div className="space-y-1.5">
                              {[
                                { label: 'Trim', value: book.trimSize },
                                { label: 'Pages', value: book.pageCount },
                                { label: 'Paper', value: book.paperType },
                                { label: 'Binding', value: book.bindingType },
                                { label: 'Interior', value: book.interiorColor },
                                { label: 'Cover', value: book.coverFinish },
                                { label: 'Spine', value: book.spineWidth },
                              ].filter(s => s.value).map(spec => (
                                <div key={spec.label} className="flex items-center justify-between text-xs">
                                  <span className="text-text-muted">{spec.label}</span>
                                  <span className="text-text-secondary">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* File Readiness */}
                          <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1"><FileText className="w-3 h-3" /> File Checklist</h4>
                            <div className="space-y-1.5">
                              {FILE_CHECKS.map(check => {
                                const isReady = book.filesReady?.[check.key as keyof typeof book.filesReady] || false;
                                const CheckIcon = check.icon;
                                return (
                                  <button key={check.key} onClick={() => toggleFileReady(book.id, check.key)}
                                    className={`w-full flex items-center gap-2 text-xs text-left transition-colors ${isReady ? 'text-emerald-400' : 'text-text-muted hover:text-text-secondary'}`}>
                                    <span className={`w-4 h-4 rounded flex items-center justify-center border flex-none ${isReady
                                      ? 'bg-emerald-500/30 border-emerald-500/40' : 'border-white/[0.15]'}`}>
                                      {isReady && <CheckCircle className="w-2.5 h-2.5" />}
                                    </span>
                                    <span className={isReady ? 'line-through' : ''}>{check.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Pricing + Dates */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Print Price', value: book.printPrice },
                            { label: 'eBook Price', value: book.ebookPrice },
                            { label: 'Wholesale', value: book.wholesaleDiscount },
                            { label: 'Pub Date', value: book.pubDate },
                          ].filter(d => d.value).map(detail => (
                            <div key={detail.label} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                              <p className="text-[9px] text-text-muted uppercase">{detail.label}</p>
                              <p className="text-xs text-starforge-gold font-medium mt-0.5">{detail.value}</p>
                            </div>
                          ))}
                        </div>

                        {book.notes && <p className="text-xs text-text-secondary italic">{book.notes}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
