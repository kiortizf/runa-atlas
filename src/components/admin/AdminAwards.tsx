import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Plus, ChevronDown, ChevronRight, Search, Edit3, Save, X,
  Trash2, Calendar, ExternalLink, BookOpen, Clock, CheckCircle,
  AlertTriangle, Star, ArrowRight, Filter, Award, Target, DollarSign
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

// ─── Types ──────────────────────────────────────────────

interface AwardRecord {
  id: string;
  name: string;
  organization: string;
  website?: string;
  categories: string[];
  eligibility: string;
  submissionFormat: string;
  fee?: string;
  keyDates: {
    submissionsOpen?: string;
    deadline?: string;
    longlist?: string;
    shortlist?: string;
    winner?: string;
  };
  notes?: string;
  relevance: 'high' | 'medium' | 'low';
  createdAt?: Timestamp;
}

interface NominationRecord {
  id: string;
  awardId: string;
  awardName: string;
  bookTitle: string;
  bookId?: string;
  category: string;
  status: 'researching' | 'preparing' | 'submitted' | 'longlisted' | 'shortlisted' | 'winner' | 'not-selected';
  submissionDate?: string;
  confirmationRef?: string;
  materialsSent?: string[];
  notes?: string;
  year: number;
  createdAt?: Timestamp;
}

// ─── Status Config ──────────────────────────────────────

const NOM_STATUS = {
  researching: { label: 'Researching', color: 'text-text-muted bg-white/5', icon: Search },
  preparing: { label: 'Preparing', color: 'text-cyan-400 bg-cyan-500/10', icon: Clock },
  submitted: { label: 'Submitted', color: 'text-blue-400 bg-blue-500/10', icon: CheckCircle },
  longlisted: { label: 'Longlisted', color: 'text-amber-400 bg-amber-500/10', icon: Star },
  shortlisted: { label: 'Shortlisted', color: 'text-starforge-gold bg-starforge-gold/10', icon: Trophy },
  winner: { label: 'Winner! 🎉', color: 'text-emerald-400 bg-emerald-500/10', icon: Award },
  'not-selected': { label: 'Not Selected', color: 'text-text-muted bg-white/5', icon: X },
};

const RELEVANCE_CONFIG = {
  high: { label: 'High Priority', color: 'text-starforge-gold bg-starforge-gold/10 border-starforge-gold/20' },
  medium: { label: 'Medium', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  low: { label: 'Worth Watching', color: 'text-text-muted bg-white/5 border-white/[0.06]' },
};

// ─── Import expanded awards seed data ───────────────────
import { AWARDS_SEED } from '../../data/operationsSeedData';

const DEFAULT_AWARDS: Omit<AwardRecord, 'id'>[] = AWARDS_SEED.map(aw => ({
  name: aw.name,
  organization: aw.organization,
  website: aw.website,
  categories: aw.categories,
  eligibility: aw.eligibility,
  submissionFormat: aw.submissionFormat,
  fee: aw.fee,
  keyDates: aw.keyDates,
  notes: aw.notes,
  relevance: aw.relevance,
}));

type SubView = 'awards' | 'nominations' | 'calendar';

export default function AdminAwards() {
  const [subView, setSubView] = useState<SubView>('awards');
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [nominations, setNominations] = useState<NominationRecord[]>([]);
  const [expandedAward, setExpandedAward] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [seeded, setSeeded] = useState(false);

  const resetForm = () => { setFormData({}); setShowAddForm(false); setEditing(null); };
  const updateForm = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  // ─── Firestore Sync ──────────────────────────────────

  useEffect(() => {
    const unsubs = [
      onSnapshot(query(collection(db, 'awards'), orderBy('name')),
        (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AwardRecord));
          setAwards(data);
          if (data.length === 0 && !seeded) seedAwards();
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'awards')
      ),
      onSnapshot(query(collection(db, 'award_submissions'), orderBy('year', 'desc')),
        (snap) => setNominations(snap.docs.map(d => ({ id: d.id, ...d.data() } as NominationRecord))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'award_submissions')
      ),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const seedAwards = async () => {
    setSeeded(true);
    try {
      for (const aw of DEFAULT_AWARDS) {
        await addDoc(collection(db, 'awards'), { ...aw, createdAt: serverTimestamp() });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'awards');
    }
  };

  // ─── CRUD ────────────────────────────────────────────

  const addNomination = async () => {
    try {
      await addDoc(collection(db, 'award_submissions'), {
        ...formData,
        year: formData.year || new Date().getFullYear(),
        status: formData.status || 'researching',
        createdAt: serverTimestamp(),
      });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'award_submissions');
    }
  };

  const updateNomination = async (id: string) => {
    try {
      await updateDoc(doc(db, 'award_submissions', id), { ...formData });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'award_submissions');
    }
  };

  const updateNomStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'award_submissions', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'award_submissions');
    }
  };

  const deleteNomination = async (id: string) => {
    if (!confirm('Delete this nomination?')) return;
    try {
      await deleteDoc(doc(db, 'award_submissions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'award_submissions');
    }
  };

  // ─── Computed ────────────────────────────────────────

  const activeSubs = nominations.filter(n => !['not-selected', 'winner'].includes(n.status));
  const wins = nominations.filter(n => n.status === 'winner');

  const filteredAwards = useMemo(() =>
    searchQuery ? awards.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.organization.toLowerCase().includes(searchQuery.toLowerCase()))
    : awards, [awards, searchQuery]);

  // Group nominations by status for calendar-like view
  const nomsByMonth = useMemo(() => {
    const months: Record<string, { award: string; deadline: string; type: string }[]> = {};
    awards.forEach(aw => {
      Object.entries(aw.keyDates || {}).forEach(([type, dateStr]) => {
        if (dateStr) {
          const month = dateStr.split(' ')[0] || dateStr;
          if (!months[month]) months[month] = [];
          months[month].push({ award: aw.name, deadline: dateStr, type });
        }
      });
    });
    return months;
  }, [awards]);

  const MONTH_ORDER = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-text-primary flex items-center gap-3">
            <Trophy className="w-6 h-6 text-starforge-gold" /> Awards Tracker
          </h2>
          <p className="text-sm text-text-secondary mt-1">Track award submissions, deadlines, and results for your titles.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Awards Tracked', value: awards.length, color: 'text-starforge-gold' },
          { label: 'Active Submissions', value: activeSubs.length, color: 'text-cyan-400' },
          { label: 'Shortlisted', value: nominations.filter(n => n.status === 'shortlisted').length, color: 'text-amber-400' },
          { label: 'Wins', value: wins.length, color: 'text-emerald-400' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-4">
        {([
          { id: 'awards' as SubView, label: 'Awards Database', count: awards.length },
          { id: 'nominations' as SubView, label: 'Nominations', count: nominations.length },
          { id: 'calendar' as SubView, label: 'Deadline Calendar', count: null },
        ]).map(tab => (
          <button key={tab.id} onClick={() => { setSubView(tab.id); resetForm(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-ui uppercase tracking-wider transition-all border ${subView === tab.id
              ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30'
              : 'bg-white/[0.02] text-text-secondary border-white/[0.04] hover:text-white'}`}>
            {tab.label}
            {tab.count !== null && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08]">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ═══ AWARDS DATABASE ═══ */}
      {subView === 'awards' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search awards..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
          </div>

          {filteredAwards.map(aw => {
            const isExpanded = expandedAward === aw.id;
            const relConf = RELEVANCE_CONFIG[aw.relevance];
            const awNoms = nominations.filter(n => n.awardId === aw.id);
            return (
              <motion.div key={aw.id} layout className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <button onClick={() => setExpandedAward(isExpanded ? null : aw.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors text-left">
                  <Trophy className="w-5 h-5 text-starforge-gold flex-none" />
                  <div className="flex-1">
                    <h3 className="font-heading text-base text-text-primary">{aw.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">{aw.organization}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border ${relConf.color}`}>{relConf.label}</span>
                  {awNoms.length > 0 && (
                    <span className="text-[10px] text-text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">{awNoms.length} nom{awNoms.length !== 1 ? 's' : ''}</span>
                  )}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.04]">
                      <div className="p-5 space-y-4">
                        {/* Categories */}
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Categories</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {aw.categories.map(cat => (
                              <span key={cat} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] text-text-secondary border border-white/[0.06]">{cat}</span>
                            ))}
                          </div>
                        </div>
                        {/* Eligibility */}
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Eligibility</h4>
                          <p className="text-xs text-text-secondary">{aw.eligibility}</p>
                        </div>
                        {/* Submission Format */}
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-1">How to Submit</h4>
                          <p className="text-xs text-text-secondary">{aw.submissionFormat}</p>
                        </div>
                        {/* Key Dates */}
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Key Dates</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {Object.entries(aw.keyDates || {}).filter(([, v]) => v).map(([key, val]) => (
                              <div key={key} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] text-center">
                                <p className="text-[9px] text-text-muted uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                                <p className="text-xs text-starforge-gold font-medium mt-0.5">{val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Fee */}
                        {aw.fee && (
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <DollarSign className="w-3 h-3" /> Fee: {aw.fee}
                          </div>
                        )}
                        {/* Notes */}
                        {aw.notes && (
                          <div className="p-3 rounded-lg bg-starforge-gold/5 border border-starforge-gold/10">
                            <p className="text-xs text-text-secondary italic">{aw.notes}</p>
                          </div>
                        )}
                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          {aw.website && (
                            <a href={aw.website} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-starforge-gold transition-colors">
                              <ExternalLink className="w-3 h-3" /> Website
                            </a>
                          )}
                          <button onClick={() => {
                            setSubView('nominations');
                            setShowAddForm(true);
                            setFormData({ awardId: aw.id, awardName: aw.name, year: String(new Date().getFullYear()) });
                          }} className="flex items-center gap-1.5 text-xs text-starforge-gold hover:text-yellow-400 transition-colors ml-auto">
                            <Plus className="w-3 h-3" /> Submit a Title
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══ NOMINATIONS ═══ */}
      {subView === 'nominations' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search nominations..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
            </div>
            <button onClick={() => { resetForm(); setFormData({ year: String(new Date().getFullYear()) }); setShowAddForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black font-ui text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
              <Plus className="w-4 h-4" /> New Nomination
            </button>
          </div>

          {/* Add/Edit Nomination Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-xl bg-surface border border-starforge-gold/20">
                <h3 className="font-heading text-lg text-text-primary mb-4">{editing ? 'Edit' : 'New'} Nomination</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Award *</label>
                    <select value={formData.awardId || ''} onChange={e => {
                      const aw = awards.find(a => a.id === e.target.value);
                      updateForm('awardId', e.target.value);
                      if (aw) updateForm('awardName', aw.name);
                    }} className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                      <option value="">Select award...</option>
                      {awards.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Book Title *</label>
                    <input value={formData.bookTitle || ''} onChange={e => updateForm('bookTitle', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Category</label>
                    <input value={formData.category || ''} onChange={e => updateForm('category', e.target.value)} placeholder="e.g., Best Novel"
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Year</label>
                    <input type="number" value={formData.year || ''} onChange={e => updateForm('year', Number(e.target.value))}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Submission Date</label>
                    <input type="date" value={formData.submissionDate || ''} onChange={e => updateForm('submissionDate', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1 font-ui uppercase tracking-wider">Status</label>
                    <select value={formData.status || 'researching'} onChange={e => updateForm('status', e.target.value)}
                      className="w-full bg-void-black border border-border rounded-lg px-4 py-2 text-sm text-white focus:border-starforge-gold outline-none">
                      {Object.entries(NOM_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
                  <button onClick={() => editing ? updateNomination(editing) : addNomination()} disabled={!formData.awardId || !formData.bookTitle}
                    className="px-4 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50">
                    <Save className="w-4 h-4 inline mr-1" /> {editing ? 'Update' : 'Save'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nominations List */}
          {nominations.length === 0 && !showAddForm ? (
            <div className="text-center py-16 text-text-muted">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No nominations yet. Submit your first title for an award.</p>
            </div>
          ) : (
            nominations
              .filter(n => !searchQuery || n.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) || n.awardName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(nom => {
              const statusConf = NOM_STATUS[nom.status];
              const StatusIcon = statusConf.icon;
              return (
                <div key={nom.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-start gap-4">
                    <Trophy className="w-5 h-5 text-starforge-gold mt-0.5 flex-none" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-medium text-text-primary">{nom.bookTitle}</h4>
                        <ArrowRight className="w-3 h-3 text-text-muted" />
                        <span className="text-sm text-starforge-gold">{nom.awardName}</span>
                        {nom.category && <span className="text-[10px] text-text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">{nom.category}</span>}
                        <span className="text-[10px] text-text-muted font-mono">{nom.year}</span>
                      </div>
                      {nom.submissionDate && <p className="text-[10px] text-text-muted mt-0.5">Submitted: {nom.submissionDate}</p>}
                      {nom.notes && <p className="text-xs text-text-secondary mt-1">{nom.notes}</p>}
                      {/* Status buttons */}
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {(Object.keys(NOM_STATUS) as (keyof typeof NOM_STATUS)[]).map(s => {
                          const conf = NOM_STATUS[s];
                          const Icon = conf.icon;
                          return (
                            <button key={s} onClick={() => updateNomStatus(nom.id, s)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all border ${nom.status === s
                                ? `${conf.color} border-current/20` : 'text-text-muted border-transparent hover:text-white'}`}>
                              <Icon className="w-2.5 h-2.5" /> {conf.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button onClick={() => deleteNomination(nom.id)} className="text-text-muted hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ DEADLINE CALENDAR ═══ */}
      {subView === 'calendar' && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-starforge-gold" /> Award Deadlines by Month
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MONTH_ORDER.filter(m => nomsByMonth[m]).map(month => (
              <div key={month} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <h4 className="font-heading text-sm text-starforge-gold mb-3">{month}</h4>
                <div className="space-y-2">
                  {nomsByMonth[month].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className={`text-[9px] uppercase tracking-wider w-20 flex-none ${
                        item.type === 'deadline' ? 'text-red-400' : item.type === 'winner' ? 'text-emerald-400' : 'text-text-muted'
                      }`}>{item.type.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-text-secondary">{item.award}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
