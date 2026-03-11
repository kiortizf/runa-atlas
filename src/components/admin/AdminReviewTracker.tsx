import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Plus, ChevronDown, ChevronRight, Search, Edit3, Save, X,
  Trash2, Star, ExternalLink, BookOpen, Calendar, Quote, ThumbsUp,
  ThumbsDown, Minus, Eye, Award, Send, Hash
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

// ─── Types ──────────────────────────────────────────────

interface ReviewRecord {
  id: string;
  bookTitle: string;
  bookId?: string;
  reviewerName: string;
  platform: string;
  rating?: number; // 1-5 stars
  sentiment: 'positive' | 'mixed' | 'negative';
  reviewUrl?: string;
  date: string;
  excerpt?: string;
  pullQuote?: string; // marketing-ready quote
  isArc: boolean;
  isVerified: boolean;
  notes?: string;
  createdAt?: Timestamp;
}

interface ArcRecord {
  id: string;
  bookTitle: string;
  recipientName: string;
  recipientType: string; // bookstagrammer, reviewer, etc.
  format: 'digital' | 'print';
  sentDate: string;
  status: 'sent' | 'received' | 'reviewed' | 'no-response' | 'declined';
  reviewLink?: string;
  notes?: string;
  createdAt?: Timestamp;
}

// ─── Config ─────────────────────────────────────────────

const PLATFORMS = [
  'Goodreads', 'Amazon', 'Barnes & Noble', 'BookTok', 'Bookstagram',
  'BookTube', 'Blog', 'Podcast', 'Kirkus', 'Publishers Weekly', 'Library Journal',
  'Foreword Reviews', 'NetGalley', 'StoryGraph', 'Other'
];

const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', icon: ThumbsUp, color: 'text-emerald-400 bg-emerald-500/10' },
  mixed: { label: 'Mixed', icon: Minus, color: 'text-amber-400 bg-amber-500/10' },
  negative: { label: 'Negative', icon: ThumbsDown, color: 'text-red-400 bg-red-500/10' },
};

const ARC_STATUS = {
  sent: { label: 'Sent', color: 'text-cyan-400 bg-cyan-500/10' },
  received: { label: 'Received', color: 'text-amber-400 bg-amber-500/10' },
  reviewed: { label: 'Reviewed', color: 'text-emerald-400 bg-emerald-500/10' },
  'no-response': { label: 'No Response', color: 'text-text-muted bg-white/5' },
  declined: { label: 'Declined', color: 'text-red-400 bg-red-500/10' },
};

type SubView = 'reviews' | 'arcs' | 'pull-quotes';

export default function AdminReviewTracker() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [arcs, setArcs] = useState<ArcRecord[]>([]);
  const [subView, setSubView] = useState<SubView>('reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const resetForm = () => { setFormData({}); setShowAddForm(false); setEditing(null); };
  const updateForm = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  // ─── Firestore Sync ──────────────────────────────────

  useEffect(() => {
    const unsubs = [
      onSnapshot(query(collection(db, 'book_reviews'), orderBy('date', 'desc')),
        (snap) => setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReviewRecord))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'book_reviews')
      ),
      onSnapshot(query(collection(db, 'arc_tracking'), orderBy('sentDate', 'desc')),
        (snap) => setArcs(snap.docs.map(d => ({ id: d.id, ...d.data() } as ArcRecord))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'arc_tracking')
      ),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  // ─── CRUD: Reviews ───────────────────────────────────

  const addReview = async () => {
    if (!formData.bookTitle?.trim()) return;
    try {
      await addDoc(collection(db, 'book_reviews'), {
        ...formData,
        rating: formData.rating ? Number(formData.rating) : null,
        sentiment: formData.sentiment || 'positive',
        isArc: formData.isArc || false,
        isVerified: formData.isVerified || false,
        date: formData.date || new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'book_reviews');
    }
  };

  const updateReview = async (id: string) => {
    try {
      await updateDoc(doc(db, 'book_reviews', id), { ...formData, rating: formData.rating ? Number(formData.rating) : null });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'book_reviews');
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try { await deleteDoc(doc(db, 'book_reviews', id)); } catch (err) { handleFirestoreError(err, OperationType.DELETE, 'book_reviews'); }
  };

  // ─── CRUD: ARCs ──────────────────────────────────────

  const addArc = async () => {
    if (!formData.bookTitle?.trim()) return;
    try {
      await addDoc(collection(db, 'arc_tracking'), {
        ...formData, status: formData.status || 'sent',
        format: formData.format || 'digital',
        sentDate: formData.sentDate || new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'arc_tracking');
    }
  };

  const updateArcStatus = async (id: string, status: string) => {
    try { await updateDoc(doc(db, 'arc_tracking', id), { status }); } catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'arc_tracking'); }
  };

  const deleteArc = async (id: string) => {
    if (!confirm('Delete this ARC record?')) return;
    try { await deleteDoc(doc(db, 'arc_tracking', id)); } catch (err) { handleFirestoreError(err, OperationType.DELETE, 'arc_tracking'); }
  };

  // ─── Computed ────────────────────────────────────────

  const pullQuotes = useMemo(() => reviews.filter(r => r.pullQuote), [reviews]);
  const avgRating = useMemo(() => {
    const rated = reviews.filter(r => r.rating);
    return rated.length ? (rated.reduce((sum, r) => sum + (r.rating || 0), 0) / rated.length).toFixed(1) : '—';
  }, [reviews]);
  const arcResponseRate = useMemo(() => {
    if (arcs.length === 0) return '—';
    const responded = arcs.filter(a => ['reviewed', 'declined'].includes(a.status)).length;
    return `${Math.round((responded / arcs.length) * 100)}%`;
  }, [arcs]);

  const filteredReviews = searchQuery
    ? reviews.filter(r => r.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) || r.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()))
    : reviews;

  // Star display helper
  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? 'text-starforge-gold fill-starforge-gold' : 'text-white/[0.1]'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-text-primary flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-starforge-gold" /> Review Tracker
          </h2>
          <p className="text-sm text-text-secondary mt-1">Monitor reviews, track ARCs, and collect pull quotes for marketing.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Reviews', value: reviews.length, color: 'text-text-primary' },
          { label: 'Avg Rating', value: avgRating, color: 'text-starforge-gold' },
          { label: 'Pull Quotes', value: pullQuotes.length, color: 'text-purple-400' },
          { label: 'ARCs Sent', value: arcs.length, color: 'text-cyan-400' },
          { label: 'ARC Response', value: arcResponseRate, color: 'text-emerald-400' },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className={`font-display text-xl ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-4">
        {([
          { id: 'reviews' as SubView, label: 'Reviews', count: reviews.length },
          { id: 'arcs' as SubView, label: 'ARC Tracking', count: arcs.length },
          { id: 'pull-quotes' as SubView, label: 'Pull Quotes', count: pullQuotes.length },
        ]).map(tab => (
          <button key={tab.id} onClick={() => { setSubView(tab.id); resetForm(); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-ui uppercase tracking-wider transition-all border ${subView === tab.id
              ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30'
              : 'bg-white/[0.02] text-text-secondary border-white/[0.04] hover:text-white'}`}>
            {tab.label}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08]">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ═══ REVIEWS ═══ */}
      {subView === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by title or reviewer..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
            </div>
            <button onClick={() => { resetForm(); setShowAddForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black font-ui text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
              <Plus className="w-4 h-4" /> Log Review
            </button>
          </div>

          {/* Add Review Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-xl bg-surface border border-starforge-gold/20">
                <h3 className="font-heading text-lg text-text-primary mb-4">{editing ? 'Edit' : 'Log'} Review</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Book Title *</label>
                    <input value={formData.bookTitle || ''} onChange={e => updateForm('bookTitle', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Reviewer</label>
                    <input value={formData.reviewerName || ''} onChange={e => updateForm('reviewerName', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Platform</label>
                    <select value={formData.platform || ''} onChange={e => updateForm('platform', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                      <option value="">Select...</option>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Rating (1-5)</label>
                    <select value={formData.rating || ''} onChange={e => updateForm('rating', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                      <option value="">No rating</option>
                      {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r}/5)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Sentiment</label>
                    <select value={formData.sentiment || 'positive'} onChange={e => updateForm('sentiment', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                      {Object.entries(SENTIMENT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Date</label>
                    <input type="date" value={formData.date || ''} onChange={e => updateForm('date', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Review URL</label>
                    <input value={formData.reviewUrl || ''} onChange={e => updateForm('reviewUrl', e.target.value)} placeholder="https://..."
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                      <input type="checkbox" checked={formData.isArc || false} onChange={e => updateForm('isArc', e.target.checked)}
                        className="w-4 h-4 rounded border-border bg-void-black" /> ARC Review
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Review Excerpt</label>
                    <textarea value={formData.excerpt || ''} onChange={e => updateForm('excerpt', e.target.value)} rows={2}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none resize-y" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Pull Quote (marketing-ready)</label>
                    <textarea value={formData.pullQuote || ''} onChange={e => updateForm('pullQuote', e.target.value)} rows={2}
                      placeholder="A concise, punchy quote for cover/marketing use"
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none resize-y" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={resetForm} className="px-4 py-2 text-sm text-text-secondary hover:text-white">Cancel</button>
                  <button onClick={() => editing ? updateReview(editing) : addReview()} disabled={!formData.bookTitle?.trim()}
                    className="px-4 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50">
                    <Save className="w-4 h-4 inline mr-1" /> {editing ? 'Update' : 'Save'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Review List */}
          {filteredReviews.length === 0 && !showAddForm ? (
            <div className="text-center py-16 text-text-muted">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No reviews logged yet.</p>
            </div>
          ) : (
            filteredReviews.map(review => {
              const sentConf = SENTIMENT_CONFIG[review.sentiment];
              const SentIcon = sentConf.icon;
              return (
                <div key={review.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${sentConf.color}`}>
                      <SentIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-medium text-text-primary">{review.bookTitle}</h4>
                        <span className="text-xs text-text-secondary">by {review.reviewerName}</span>
                        {review.platform && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-text-muted">{review.platform}</span>}
                        {review.isArc && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">ARC</span>}
                      </div>
                      <div className="flex items-center gap-3 mb-1">
                        {review.rating && renderStars(review.rating)}
                        <span className="text-[10px] text-text-muted font-mono">{review.date}</span>
                      </div>
                      {review.excerpt && <p className="text-xs text-text-secondary mt-1 italic">"{review.excerpt}"</p>}
                      {review.pullQuote && (
                        <div className="mt-2 p-2 rounded-lg bg-starforge-gold/5 border border-starforge-gold/10">
                          <p className="text-[10px] text-starforge-gold/60 uppercase tracking-wider mb-0.5 flex items-center gap-1"><Quote className="w-2.5 h-2.5" /> Pull Quote</p>
                          <p className="text-xs text-starforge-gold italic">"{review.pullQuote}"</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-none">
                      {review.reviewUrl && (
                        <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-starforge-gold transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => deleteReview(review.id)} className="text-text-muted hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ ARC TRACKING ═══ */}
      {subView === 'arcs' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search ARCs..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
            </div>
            <button onClick={() => { resetForm(); setFormData({ sentDate: new Date().toISOString().split('T')[0] }); setShowAddForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black font-ui text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
              <Send className="w-4 h-4" /> Log ARC
            </button>
          </div>

          {/* Add ARC Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-xl bg-surface border border-starforge-gold/20">
                <h3 className="font-heading text-lg text-text-primary mb-4">Log ARC</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Book Title *</label>
                    <input value={formData.bookTitle || ''} onChange={e => updateForm('bookTitle', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Recipient *</label>
                    <input value={formData.recipientName || ''} onChange={e => updateForm('recipientName', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Recipient Type</label>
                    <input value={formData.recipientType || ''} onChange={e => updateForm('recipientType', e.target.value)} placeholder="e.g., Bookstagrammer"
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Format</label>
                    <select value={formData.format || 'digital'} onChange={e => updateForm('format', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                      <option value="digital">Digital</option>
                      <option value="print">Print</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Sent Date</label>
                    <input type="date" value={formData.sentDate || ''} onChange={e => updateForm('sentDate', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={resetForm} className="px-4 py-2 text-sm text-text-secondary hover:text-white">Cancel</button>
                  <button onClick={addArc} disabled={!formData.bookTitle?.trim() || !formData.recipientName?.trim()}
                    className="px-4 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50">
                    <Save className="w-4 h-4 inline mr-1" /> Save
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ARC List */}
          {arcs.length === 0 && !showAddForm ? (
            <div className="text-center py-16 text-text-muted">
              <Send className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No ARCs tracked yet.</p>
            </div>
          ) : (
            arcs
              .filter(a => !searchQuery || a.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) || a.recipientName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(arc => {
              const statusConf = ARC_STATUS[arc.status];
              return (
                <div key={arc.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-4">
                    <Send className="w-5 h-5 text-cyan-400 flex-none" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-text-primary">{arc.bookTitle}</h4>
                        <span className="text-xs text-text-secondary">→ {arc.recipientName}</span>
                        {arc.recipientType && <span className="text-[10px] text-text-muted">({arc.recipientType})</span>}
                      </div>
                      <div className="text-[10px] text-text-muted flex items-center gap-2">
                        <span>{arc.format === 'digital' ? '📧 Digital' : '📦 Print'}</span>
                        <span>Sent: {arc.sentDate}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        {(Object.keys(ARC_STATUS) as (keyof typeof ARC_STATUS)[]).map(s => (
                          <button key={s} onClick={() => updateArcStatus(arc.id, s)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] transition-all ${arc.status === s
                              ? `${ARC_STATUS[s].color}` : 'text-text-muted hover:text-white'}`}>
                            {ARC_STATUS[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => deleteArc(arc.id)} className="text-text-muted hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ PULL QUOTES ═══ */}
      {subView === 'pull-quotes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-starforge-gold/5 border border-starforge-gold/20">
            <h3 className="font-heading text-sm text-starforge-gold mb-1 flex items-center gap-2">
              <Quote className="w-4 h-4" /> Marketing-Ready Pull Quotes
            </h3>
            <p className="text-xs text-text-secondary">Curated quotes from reviews, ready for covers, marketing materials, and social media.</p>
          </div>

          {pullQuotes.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <Quote className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No pull quotes yet. Add them when logging reviews.</p>
            </div>
          ) : (
            pullQuotes.map(review => (
              <div key={review.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-base text-text-primary italic leading-relaxed mb-3">"{review.pullQuote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-secondary">— {review.reviewerName}</p>
                    <p className="text-[10px] text-text-muted">{review.platform} · Re: <span className="text-starforge-gold">{review.bookTitle}</span></p>
                  </div>
                  {review.rating && renderStars(review.rating)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
