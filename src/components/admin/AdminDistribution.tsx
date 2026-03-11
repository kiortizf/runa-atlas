import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Plus, ChevronDown, ChevronRight, Search, Edit3, Save, X,
  Trash2, MapPin, Phone, Mail, ExternalLink, BookOpen, Building2,
  Library, Store, Globe, Package, CheckCircle, Clock, AlertCircle,
  ArrowRight, Filter
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

// ─── Types ──────────────────────────────────────────────

interface DistributionChannel {
  id: string;
  name: string;
  type: 'print-distributor' | 'ebook-distributor' | 'direct-sales' | 'online-retailer';
  status: 'active' | 'pending' | 'inactive';
  website?: string;
  accountId?: string;
  notes?: string;
  createdAt?: Timestamp;
}

interface LibraryRecord {
  id: string;
  name: string;
  system?: string; // library system/network name
  location: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: 'researching' | 'pitched' | 'ordered' | 'stocked' | 'featured' | 'declined';
  notes?: string;
  lastContact?: string;
  titlesCarried?: string[];
  createdAt?: Timestamp;
}

interface BookstoreRecord {
  id: string;
  name: string;
  type: 'indie' | 'chain' | 'online' | 'specialty';
  location: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  status: 'researching' | 'pitched' | 'carries' | 'featured' | 'consignment' | 'declined';
  terms?: string;
  notes?: string;
  lastContact?: string;
  titlesCarried?: string[];
  createdAt?: Timestamp;
}

// ─── Status Configs ─────────────────────────────────────

const CHANNEL_STATUS = {
  active: { label: 'Active', color: 'text-emerald-400 bg-emerald-500/10' },
  pending: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10' },
  inactive: { label: 'Inactive', color: 'text-text-muted bg-white/5' },
};

const LIBRARY_STATUS = {
  researching: { label: 'Researching', color: 'text-text-muted bg-white/5' },
  pitched: { label: 'Pitched', color: 'text-cyan-400 bg-cyan-500/10' },
  ordered: { label: 'Ordered', color: 'text-amber-400 bg-amber-500/10' },
  stocked: { label: 'Stocked', color: 'text-emerald-400 bg-emerald-500/10' },
  featured: { label: 'Featured', color: 'text-starforge-gold bg-starforge-gold/10' },
  declined: { label: 'Declined', color: 'text-red-400 bg-red-500/10' },
};

const BOOKSTORE_STATUS = {
  researching: { label: 'Researching', color: 'text-text-muted bg-white/5' },
  pitched: { label: 'Pitched', color: 'text-cyan-400 bg-cyan-500/10' },
  carries: { label: 'Carries', color: 'text-emerald-400 bg-emerald-500/10' },
  featured: { label: 'Featured', color: 'text-starforge-gold bg-starforge-gold/10' },
  consignment: { label: 'Consignment', color: 'text-purple-400 bg-purple-500/10' },
  declined: { label: 'Declined', color: 'text-red-400 bg-red-500/10' },
};

const CHANNEL_TYPES = {
  'print-distributor': { label: 'Print Distributor', icon: Package },
  'ebook-distributor': { label: 'eBook Distributor', icon: BookOpen },
  'direct-sales': { label: 'Direct Sales', icon: Store },
  'online-retailer': { label: 'Online Retailer', icon: Globe },
};

const BOOKSTORE_TYPES = {
  indie: { label: 'Independent', color: 'text-emerald-400' },
  chain: { label: 'Chain', color: 'text-cyan-400' },
  online: { label: 'Online', color: 'text-purple-400' },
  specialty: { label: 'Specialty', color: 'text-amber-400' },
};

// ─── Default Channels ───────────────────────────────────

const DEFAULT_CHANNELS: Omit<DistributionChannel, 'id'>[] = [
  { name: 'IngramSpark', type: 'print-distributor', status: 'active', website: 'https://ingramspark.com', notes: 'Primary print-on-demand distributor. 55% wholesale discount, returnable.' },
  { name: 'IngramSpark eBooks', type: 'ebook-distributor', status: 'active', website: 'https://ingramspark.com', notes: 'eBook distribution through Ingram. Covers Apple Books, B&N, Kobo, etc.' },
  { name: 'Amazon KDP', type: 'online-retailer', status: 'pending', website: 'https://kdp.amazon.com', notes: 'Consider for eBook-only. Print through Ingram preferred for wider distribution.' },
  { name: 'Direct Sales (Website)', type: 'direct-sales', status: 'pending', website: '', notes: 'Sell direct from runaatlas.com. Higher margins. Requires fulfillment solution.' },
  { name: 'Bookshop.org', type: 'online-retailer', status: 'pending', website: 'https://bookshop.org', notes: 'Indie-supporting online retailer. Affiliate program available.' },
];

type SubTab = 'channels' | 'libraries' | 'bookstores';

export default function AdminDistribution() {
  const [subTab, setSubTab] = useState<SubTab>('channels');
  const [channels, setChannels] = useState<DistributionChannel[]>([]);
  const [libraries, setLibraries] = useState<LibraryRecord[]>([]);
  const [bookstores, setBookstores] = useState<BookstoreRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  // ─── Form state ──────────────────────────────────────
  const [formData, setFormData] = useState<Record<string, string>>({});

  const resetForm = () => { setFormData({}); setShowAddForm(false); setEditing(null); };
  const updateForm = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  // ─── Firestore Sync ──────────────────────────────────

  useEffect(() => {
    const unsubs = [
      onSnapshot(query(collection(db, 'distribution_channels'), orderBy('name')),
        (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as DistributionChannel));
          setChannels(data);
          if (data.length === 0 && !seeded) seedChannels();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'distribution_channels')
      ),
      onSnapshot(query(collection(db, 'libraries'), orderBy('name')),
        (snap) => setLibraries(snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryRecord))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'libraries')
      ),
      onSnapshot(query(collection(db, 'bookstores'), orderBy('name')),
        (snap) => setBookstores(snap.docs.map(d => ({ id: d.id, ...d.data() } as BookstoreRecord))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'bookstores')
      ),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const seedChannels = async () => {
    setSeeded(true);
    try {
      for (const ch of DEFAULT_CHANNELS) {
        await addDoc(collection(db, 'distribution_channels'), { ...ch, createdAt: serverTimestamp() });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'distribution_channels');
    }
  };

  // ─── CRUD ────────────────────────────────────────────

  const addRecord = async () => {
    const coll = subTab === 'channels' ? 'distribution_channels' : subTab;
    try {
      await addDoc(collection(db, coll), { ...formData, status: formData.status || 'researching', createdAt: serverTimestamp() });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, coll);
    }
  };

  const updateRecord = async (id: string) => {
    const coll = subTab === 'channels' ? 'distribution_channels' : subTab;
    try {
      await updateDoc(doc(db, coll, id), { ...formData });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, coll);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    const coll = subTab === 'channels' ? 'distribution_channels' : subTab;
    try {
      await deleteDoc(doc(db, coll, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, coll);
    }
  };

  const startEdit = (record: Record<string, any>) => {
    const { id, createdAt, ...rest } = record;
    setFormData(Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, String(v ?? '')])));
    setEditing(id);
    setShowAddForm(true);
  };

  // ─── Filter ──────────────────────────────────────────
  const filterBySearch = <T extends { name: string }>(items: T[]) =>
    searchQuery ? items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())) : items;

  // ─── Stats ───────────────────────────────────────────
  const activeChannels = channels.filter(c => c.status === 'active').length;
  const stockedLibraries = libraries.filter(l => ['stocked', 'featured'].includes(l.status)).length;
  const carryingStores = bookstores.filter(b => ['carries', 'featured', 'consignment'].includes(b.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-text-primary flex items-center gap-3">
            <Truck className="w-6 h-6 text-starforge-gold" /> Distribution Tracker
          </h2>
          <p className="text-sm text-text-secondary mt-1">Track distribution channels, library partnerships, and bookstore relationships.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Channels', value: activeChannels, total: channels.length, color: 'text-emerald-400' },
          { label: 'Libraries Stocked', value: stockedLibraries, total: libraries.length, color: 'text-cyan-400' },
          { label: 'Bookstores Carrying', value: carryingStores, total: bookstores.length, color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className={`font-display text-2xl ${stat.color}`}>{stat.value}<span className="text-text-muted text-sm">/{stat.total}</span></p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-4">
        {([
          { id: 'channels' as SubTab, label: 'Channels', icon: Package, count: channels.length },
          { id: 'libraries' as SubTab, label: 'Libraries', icon: Library, count: libraries.length },
          { id: 'bookstores' as SubTab, label: 'Bookstores', icon: Store, count: bookstores.length },
        ]).map(tab => (
          <button key={tab.id} onClick={() => { setSubTab(tab.id); resetForm(); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-ui uppercase tracking-wider transition-all border ${subTab === tab.id
              ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30'
              : 'bg-white/[0.02] text-text-secondary border-white/[0.04] hover:text-white'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08]">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={`Search ${subTab}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
        </div>
        <button onClick={() => { resetForm(); setShowAddForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black font-ui text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* ═══ Add/Edit Form ═══ */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-xl bg-surface border border-starforge-gold/20">
            <h3 className="font-heading text-lg text-text-primary mb-4">{editing ? 'Edit' : 'Add'} {subTab === 'channels' ? 'Channel' : subTab === 'libraries' ? 'Library' : 'Bookstore'}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Name *</label>
                <input value={formData.name || ''} onChange={e => updateForm('name', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              {subTab === 'channels' && (
                <div>
                  <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Type</label>
                  <select value={formData.type || ''} onChange={e => updateForm('type', e.target.value)}
                    className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                    <option value="">Select...</option>
                    {Object.entries(CHANNEL_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              )}
              {subTab === 'bookstores' && (
                <div>
                  <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Type</label>
                  <select value={formData.type || ''} onChange={e => updateForm('type', e.target.value)}
                    className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                    <option value="">Select...</option>
                    {Object.entries(BOOKSTORE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              )}
              {(subTab === 'libraries' || subTab === 'bookstores') && (
                <div>
                  <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Location</label>
                  <input value={formData.location || ''} onChange={e => updateForm('location', e.target.value)} placeholder="City, State"
                    className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                </div>
              )}
              {subTab === 'libraries' && (
                <div>
                  <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Library System</label>
                  <input value={formData.system || ''} onChange={e => updateForm('system', e.target.value)} placeholder="e.g., NYPL, Chicago PL"
                    className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                </div>
              )}
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Contact Name</label>
                <input value={formData.contactName || ''} onChange={e => updateForm('contactName', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Contact Email</label>
                <input value={formData.contactEmail || ''} onChange={e => updateForm('contactEmail', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
              {(subTab === 'bookstores' || subTab === 'channels') && (
                <div>
                  <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Website</label>
                  <input value={formData.website || ''} onChange={e => updateForm('website', e.target.value)} placeholder="https://..."
                    className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                </div>
              )}
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Status</label>
                <select value={formData.status || ''} onChange={e => updateForm('status', e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="">Select...</option>
                  {Object.entries(subTab === 'channels' ? CHANNEL_STATUS : subTab === 'libraries' ? LIBRARY_STATUS : BOOKSTORE_STATUS).map(([k, v]) =>
                    <option key={k} value={k}>{v.label}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Notes</label>
              <textarea value={formData.notes || ''} onChange={e => updateForm('notes', e.target.value)} rows={2}
                className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none resize-y" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-sm text-text-secondary hover:text-white">Cancel</button>
              <button onClick={() => editing ? updateRecord(editing) : addRecord()} disabled={!formData.name?.trim()}
                className="px-4 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50">
                <Save className="w-4 h-4 inline mr-1" /> {editing ? 'Update' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CHANNELS VIEW ═══ */}
      {subTab === 'channels' && (
        <div className="space-y-3">
          {filterBySearch(channels).map(ch => {
            const status = CHANNEL_STATUS[ch.status];
            const typeConf = CHANNEL_TYPES[ch.type] || { label: ch.type, icon: Package };
            const TypeIcon = typeConf.icon;
            return (
              <div key={ch.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                <TypeIcon className="w-5 h-5 text-text-muted flex-none" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-text-primary">{ch.name}</h4>
                    <span className="text-[10px] text-text-muted">{typeConf.label}</span>
                  </div>
                  {ch.notes && <p className="text-xs text-text-secondary mt-0.5">{ch.notes}</p>}
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                {ch.website && (
                  <a href={ch.website} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-starforge-gold transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => startEdit(ch)} className="text-text-muted hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => deleteRecord(ch.id)} className="text-text-muted hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ LIBRARIES VIEW ═══ */}
      {subTab === 'libraries' && (
        <div className="space-y-3">
          {filterBySearch(libraries).length === 0 && !showAddForm ? (
            <div className="text-center py-16 text-text-muted">
              <Library className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No libraries tracked yet. Add your first library partnership.</p>
            </div>
          ) : (
            filterBySearch(libraries).map(lib => {
              const status = LIBRARY_STATUS[lib.status];
              return (
                <div key={lib.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-start gap-4">
                    <Library className="w-5 h-5 text-cyan-400 mt-0.5 flex-none" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-text-primary">{lib.name}</h4>
                        {lib.system && <span className="text-[10px] text-text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">{lib.system}</span>}
                        <span className={`text-[10px] px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        {lib.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{lib.location}</span>}
                        {lib.contactName && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lib.contactName}</span>}
                        {lib.contactEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lib.contactEmail}</span>}
                      </div>
                      {lib.notes && <p className="text-xs text-text-muted mt-1">{lib.notes}</p>}
                    </div>
                    <button onClick={() => startEdit(lib)} className="text-text-muted hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteRecord(lib.id)} className="text-text-muted hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ BOOKSTORES VIEW ═══ */}
      {subTab === 'bookstores' && (
        <div className="space-y-3">
          {filterBySearch(bookstores).length === 0 && !showAddForm ? (
            <div className="text-center py-16 text-text-muted">
              <Store className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No bookstores tracked yet. Add your first bookstore relationship.</p>
            </div>
          ) : (
            filterBySearch(bookstores).map(bs => {
              const status = BOOKSTORE_STATUS[bs.status];
              const typeConf = BOOKSTORE_TYPES[bs.type] || { label: bs.type, color: 'text-text-muted' };
              return (
                <div key={bs.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-start gap-4">
                    <Store className="w-5 h-5 text-purple-400 mt-0.5 flex-none" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-text-primary">{bs.name}</h4>
                        <span className={`text-[10px] ${typeConf.color}`}>{typeConf.label}</span>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        {bs.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{bs.location}</span>}
                        {bs.contactName && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{bs.contactName}</span>}
                      </div>
                      {bs.terms && <p className="text-xs text-text-muted mt-1">Terms: {bs.terms}</p>}
                      {bs.notes && <p className="text-xs text-text-muted mt-0.5">{bs.notes}</p>}
                    </div>
                    {bs.website && (
                      <a href={bs.website} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-starforge-gold"><ExternalLink className="w-4 h-4" /></a>
                    )}
                    <button onClick={() => startEdit(bs)} className="text-text-muted hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteRecord(bs.id)} className="text-text-muted hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
