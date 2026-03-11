import { useState, useEffect } from 'react';
import {
  Users, Plus, Edit2, Trash2, Save, ChevronDown, ChevronRight, AlertCircle,
  Eye, Shield, BookOpen, Clock, Star, Target, Award, Bell, Settings, Zap,
  Upload, MessageSquare, FileUp
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import AdminModal, { FormSection, FormField } from './AdminModal';

// ─── Types ──────────────────────────────────────
interface BetaReaderProfile {
  id: string;
  name: string;
  email: string;
  genres: string[];
  status: 'active' | 'inactive' | 'vetted' | 'pending';
  skillTags: string[];
  completedReviews: number;
  avgRating: number;
  enrolled: string;
  notes: string;
}

interface CampaignOverview {
  id: string;
  manuscriptTitle: string;
  author: string;
  status: 'recruiting' | 'active' | 'closed';
  totalSlots: number;
  filledSlots: number;
  deadline: string;
  feedbackRequired: number;
  feedbackReceived: number;
}

interface BetaSettings {
  id: string;
  maxReadersPerCampaign: number;
  autoApproveVetted: boolean;
  requireNDA: boolean;
  defaultFeedbackDeadlineDays: number;
  feedbackRubricEnabled: boolean;
  feedbackCategories: string[];
  overdueAlertDays: number;
  escalationEmail: string;
}

// ─── Panel ──────────────────────────────────────
function Panel({ title, icon: Icon, count, children, defaultOpen = false }: {
  title: string; icon: any; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20 flex-shrink-0"><Icon className="w-4.5 h-4.5 text-starforge-gold" /></div>
        <h3 className="font-heading text-lg text-text-primary flex-1">{title}</h3>
        {count !== undefined && <span className="font-mono text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full border border-border/50">{count}</span>}
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400', inactive: 'bg-red-500/20 text-red-400',
  vetted: 'bg-indigo-500/20 text-indigo-400', pending: 'bg-amber-500/20 text-amber-400',
  recruiting: 'bg-blue-500/20 text-blue-400', closed: 'bg-gray-500/20 text-gray-400',
};

export default function AdminBetaReaders() {
  const [readers, setReaders] = useState<BetaReaderProfile[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOverview[]>([]);
  const [feedback, setFeedback] = useState<{ id: string; readerId: string; readerName: string; campaignId: string; campaignTitle: string; rating: number; categories: Record<string, number>; notes: string; createdAt: any }[]>([]);
  const [settings, setSettings] = useState<BetaSettings>({
    id: 'main', maxReadersPerCampaign: 8, autoApproveVetted: true, requireNDA: false,
    defaultFeedbackDeadlineDays: 21, feedbackRubricEnabled: true,
    feedbackCategories: ['Overall Impression', 'Character', 'Pacing', 'Plot', 'Prose', 'Worldbuilding'],
    overdueAlertDays: 3, escalationEmail: '',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [readerModal, setReaderModal] = useState(false);
  const [editingReader, setEditingReader] = useState<BetaReaderProfile | null>(null);
  const [readerForm, setReaderForm] = useState<Partial<BetaReaderProfile>>({
    name: '', email: '', genres: [], status: 'pending', skillTags: [], completedReviews: 0,
    avgRating: 0, enrolled: '', notes: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [catInput, setCatInput] = useState('');
  // Feedback import state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    readerId: '', campaignId: '', rating: 4, notes: '', categories: {} as Record<string, number>,
  });

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'beta_readers'), (snap) => {
      setReaders(snap.docs.map(d => ({ id: d.id, ...d.data() } as BetaReaderProfile)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'beta_readers')));
    unsubs.push(onSnapshot(collection(db, 'beta_campaigns'), (snap) => {
      setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() } as CampaignOverview)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'beta_campaigns')));
    unsubs.push(onSnapshot(collection(db, 'beta_settings'), (snap) => {
      if (snap.docs.length > 0) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as BetaSettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'beta_settings')));
    unsubs.push(onSnapshot(collection(db, 'beta_feedback'), (snap) => {
      setFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'beta_feedback')));
    return () => unsubs.forEach(u => u());
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'beta_settings', settings.id), { ...settings, updatedAt: serverTimestamp() });
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'beta_settings'); }
  };

  const openReaderModal = (r?: BetaReaderProfile) => {
    if (r) { setEditingReader(r); setReaderForm(r); }
    else { setEditingReader(null); setReaderForm({ name: '', email: '', genres: [], status: 'pending', skillTags: [], completedReviews: 0, avgRating: 0, enrolled: new Date().toISOString().split('T')[0], notes: '' }); }
    setTagInput(''); setGenreInput('');
    setReaderModal(true);
  };

  const saveReader = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { name: readerForm.name, email: readerForm.email, genres: readerForm.genres, status: readerForm.status, skillTags: readerForm.skillTags, completedReviews: readerForm.completedReviews ?? 0, avgRating: readerForm.avgRating ?? 0, enrolled: readerForm.enrolled, notes: readerForm.notes };
      if (editingReader) await setDoc(doc(db, 'beta_readers', editingReader.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'beta_readers')), { ...data, createdAt: serverTimestamp() });
      setReaderModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'beta_readers'); }
  };

  const deleteReader = async (id: string) => {
    if (window.confirm('Remove this beta reader?')) {
      try { await deleteDoc(doc(db, 'beta_readers', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'beta_readers'); }
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const reader = readers.find(r => r.id === feedbackForm.readerId);
    const campaign = campaigns.find(c => c.id === feedbackForm.campaignId);
    try {
      await addDoc(collection(db, 'beta_feedback'), {
        readerId: feedbackForm.readerId,
        readerName: reader?.name || 'Unknown',
        campaignId: feedbackForm.campaignId,
        campaignTitle: campaign?.manuscriptTitle || 'Unknown',
        rating: feedbackForm.rating,
        categories: feedbackForm.categories,
        notes: feedbackForm.notes,
        createdAt: serverTimestamp(),
      });
      setShowFeedbackModal(false);
      setFeedbackForm({ readerId: '', campaignId: '', rating: 4, notes: '', categories: {} });
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'beta_feedback'); }
  };

  const deleteFeedback = async (id: string) => {
    if (window.confirm('Delete this feedback entry?')) {
      try { await deleteDoc(doc(db, 'beta_feedback', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'beta_feedback'); }
    }
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20"><Users className="w-6 h-6 text-amber-400" /></div>
          <div><h2 className="font-heading text-2xl text-text-primary">Beta Readers</h2><p className="font-ui text-text-secondary text-sm">Manage the beta reader pool, campaigns, and feedback rules.</p></div>
        </div>
        <button onClick={() => openReaderModal()} className="flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all"><Plus className="w-4 h-4" /> Add Reader</button>
      </div>

      {/* Reader Pool */}
      <Panel title="Reader Pool" icon={Users} count={readers.length} defaultOpen>
        <div className="space-y-2">
          {readers.length === 0 && <div className="text-center py-8 text-text-muted font-ui text-sm"><AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />No beta readers registered.</div>}
          {readers.map(r => (
            <div key={r.id} className="group flex items-center gap-4 bg-surface-elevated border border-border/50 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-semibold text-sm">{r.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="font-heading text-sm text-text-primary">{r.name}</span><span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ${STATUS_COLORS[r.status]}`}>{r.status}</span></div>
                <p className="text-[11px] text-text-muted">{r.email} · {r.completedReviews} reviews · {r.avgRating}★</p>
              </div>
              <div className="flex gap-1 flex-wrap max-w-[200px]">{(r.genres || []).slice(0, 3).map(g => <span key={g} className="text-[9px] px-1.5 py-0.5 bg-surface border border-border/30 rounded text-text-muted">{g}</span>)}</div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openReaderModal(r)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteReader(r.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Campaign Oversight */}
      <Panel title="Campaign Oversight" icon={Target} count={campaigns.length}>
        <div className="space-y-2">
          {campaigns.length === 0 && <div className="text-center py-8 text-text-muted font-ui text-sm"><AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />No active campaigns.</div>}
          {campaigns.map(c => (
            <div key={c.id} className="flex items-center gap-4 bg-surface-elevated border border-border/50 rounded-xl px-4 py-3">
              <BookOpen className="w-5 h-5 text-starforge-gold flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="font-heading text-sm text-text-primary">{c.manuscriptTitle}</span><span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ${STATUS_COLORS[c.status]}`}>{c.status}</span></div>
                <p className="text-[11px] text-text-muted">{c.author} · {c.filledSlots}/{c.totalSlots} readers · Deadline: {c.deadline}</p>
              </div>
              <div className="text-right flex-shrink-0"><span className="font-mono text-xs text-text-muted">{c.feedbackReceived}/{c.feedbackRequired}</span><p className="text-[9px] text-text-muted">feedback</p></div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Settings */}
      <Panel title="Feedback & Assignment Rules" icon={Settings}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Max Readers / Campaign</label><input type="number" min="1" max="20" value={settings.maxReadersPerCampaign} onChange={e => setSettings({ ...settings, maxReadersPerCampaign: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Default Deadline (days)</label><input type="number" min="7" max="90" value={settings.defaultFeedbackDeadlineDays} onChange={e => setSettings({ ...settings, defaultFeedbackDeadlineDays: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Overdue Alert (days before)</label><input type="number" min="1" max="14" value={settings.overdueAlertDays} onChange={e => setSettings({ ...settings, overdueAlertDays: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Escalation Email</label><input type="email" value={settings.escalationEmail} onChange={e => setSettings({ ...settings, escalationEmail: e.target.value })} className={inputClass} placeholder="editor@runaatlas.com" /></div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.autoApproveVetted} onChange={e => setSettings({ ...settings, autoApproveVetted: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Auto-approve vetted readers</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.requireNDA} onChange={e => setSettings({ ...settings, requireNDA: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Require NDA for all campaigns</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.feedbackRubricEnabled} onChange={e => setSettings({ ...settings, feedbackRubricEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Use structured feedback rubric</span></label>
          </div>
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Feedback Categories</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={catInput} onChange={e => setCatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (catInput.trim()) { setSettings({ ...settings, feedbackCategories: [...settings.feedbackCategories, catInput.trim()] }); setCatInput(''); } } }} className={`${inputClass} flex-1`} placeholder="Add category..." />
              <button type="button" onClick={() => { if (catInput.trim()) { setSettings({ ...settings, feedbackCategories: [...settings.feedbackCategories, catInput.trim()] }); setCatInput(''); } }} className="px-4 py-2 bg-surface-elevated text-text-primary rounded-xl border border-border/50 font-ui text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">{settings.feedbackCategories.map((c, i) => (
              <span key={i} className="flex items-center gap-1 bg-surface-elevated border border-border/30 rounded-lg px-2.5 py-1 text-xs text-text-primary">{c}<button onClick={() => setSettings({ ...settings, feedbackCategories: settings.feedbackCategories.filter((_, idx) => idx !== i) })} className="text-text-muted hover:text-forge-red ml-1"><Trash2 className="w-3 h-3" /></button></span>
            ))}</div>
          </div>
          <button onClick={saveSettings} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${settingsSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}><Save className="w-4 h-4" />{settingsSaved ? 'Saved!' : 'Save Settings'}</button>
        </div>
      </Panel>

      {/* Feedback Import */}
      <Panel title="Feedback Import" icon={Upload} count={feedback.length}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-ui text-sm text-text-muted">Manually record beta reader feedback for campaigns.</p>
            <button onClick={() => { setShowFeedbackModal(true); setFeedbackForm({ readerId: '', campaignId: '', rating: 4, notes: '', categories: {} }); }}
              className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black rounded-full font-ui text-sm font-medium hover:bg-starforge-gold/90 transition-all">
              <FileUp className="w-4 h-4" /> Add Feedback
            </button>
          </div>
          {feedback.length === 0 && <div className="text-center py-8 text-text-muted font-ui text-sm"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />No feedback entries yet.</div>}
          {feedback.map(fb => (
            <div key={fb.id} className="flex items-center gap-4 bg-surface-elevated border border-border/50 rounded-xl px-4 py-3">
              <MessageSquare className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm text-text-primary">{fb.readerName}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-starforge-gold/10 text-starforge-gold rounded">{'★'.repeat(fb.rating)}</span>
                </div>
                <p className="text-[11px] text-text-muted">{fb.campaignTitle} · {fb.notes ? fb.notes.slice(0, 80) + (fb.notes.length > 80 ? '...' : '') : 'No notes'}</p>
              </div>
              <button onClick={() => deleteFeedback(fb.id)} className="p-1.5 text-text-muted hover:text-forge-red transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Feedback Modal */}
      <AdminModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} title="Import Beta Feedback">
        <form onSubmit={submitFeedback} className="space-y-6">
          <FormSection title="Feedback Details">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Reader">
                <select required value={feedbackForm.readerId} onChange={e => setFeedbackForm({ ...feedbackForm, readerId: e.target.value })} className={inputClass}>
                  <option value="">Select reader...</option>
                  {readers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </FormField>
              <FormField label="Campaign">
                <select required value={feedbackForm.campaignId} onChange={e => setFeedbackForm({ ...feedbackForm, campaignId: e.target.value })} className={inputClass}>
                  <option value="">Select campaign...</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.manuscriptTitle}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Overall Rating">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setFeedbackForm({ ...feedbackForm, rating: n })}
                    className={`w-10 h-10 rounded-lg font-ui text-sm font-bold transition-all border ${feedbackForm.rating >= n ? 'bg-starforge-gold text-void-black border-starforge-gold' : 'bg-surface-elevated text-text-muted border-border/50 hover:border-starforge-gold/30'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </FormField>
          </FormSection>
          <FormSection title="Category Scores">
            <div className="grid grid-cols-2 gap-3">
              {settings.feedbackCategories.map(cat => (
                <div key={cat}>
                  <label className="font-ui text-xs text-text-muted block mb-1">{cat}</label>
                  <input type="number" min="1" max="5" value={feedbackForm.categories[cat] || ''}
                    onChange={e => setFeedbackForm({ ...feedbackForm, categories: { ...feedbackForm.categories, [cat]: Number(e.target.value) } })}
                    className={inputClass} placeholder="1-5" />
                </div>
              ))}
            </div>
          </FormSection>
          <FormSection title="Notes">
            <textarea value={feedbackForm.notes} onChange={e => setFeedbackForm({ ...feedbackForm, notes: e.target.value })}
              className={`${inputClass} h-24 resize-none`} placeholder="Detailed feedback notes..." />
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">Save Feedback</button>
            <button type="button" onClick={() => setShowFeedbackModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>

      {/* Reader Modal */}
      <AdminModal isOpen={readerModal} onClose={() => setReaderModal(false)} title={editingReader ? 'Edit Beta Reader' : 'Add Beta Reader'}>
        <form onSubmit={saveReader} className="space-y-6">
          <FormSection title="Reader Info">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Name"><input type="text" required value={readerForm.name} onChange={e => setReaderForm({ ...readerForm, name: e.target.value })} className={inputClass} /></FormField>
              <FormField label="Email"><input type="email" required value={readerForm.email} onChange={e => setReaderForm({ ...readerForm, email: e.target.value })} className={inputClass} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Status"><select value={readerForm.status} onChange={e => setReaderForm({ ...readerForm, status: e.target.value as any })} className={inputClass}><option value="pending">Pending</option><option value="vetted">Vetted</option><option value="active">Active</option><option value="inactive">Inactive</option></select></FormField>
              <FormField label="Enrolled Date"><input type="date" value={readerForm.enrolled} onChange={e => setReaderForm({ ...readerForm, enrolled: e.target.value })} className={inputClass} /></FormField>
            </div>
          </FormSection>
          <FormSection title="Genres">
            <div className="flex gap-2 mb-2">
              <input type="text" value={genreInput} onChange={e => setGenreInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (genreInput.trim()) { setReaderForm({ ...readerForm, genres: [...(readerForm.genres || []), genreInput.trim()] }); setGenreInput(''); } } }} className={`${inputClass} flex-1`} placeholder="Add genre..." />
              <button type="button" onClick={() => { if (genreInput.trim()) { setReaderForm({ ...readerForm, genres: [...(readerForm.genres || []), genreInput.trim()] }); setGenreInput(''); } }} className="px-4 py-2 bg-surface-elevated text-text-primary rounded-xl border border-border/50 font-ui text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">{(readerForm.genres || []).map((g, i) => <span key={i} className="flex items-center gap-1 bg-surface-elevated border border-border/30 rounded-lg px-2.5 py-1 text-xs text-text-primary">{g}<button type="button" onClick={() => setReaderForm({ ...readerForm, genres: (readerForm.genres || []).filter((_, idx) => idx !== i) })} className="text-text-muted hover:text-forge-red ml-1"><Trash2 className="w-3 h-3" /></button></span>)}</div>
          </FormSection>
          <FormSection title="Skill Tags">
            <div className="flex gap-2 mb-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim()) { setReaderForm({ ...readerForm, skillTags: [...(readerForm.skillTags || []), tagInput.trim()] }); setTagInput(''); } } }} className={`${inputClass} flex-1`} placeholder="e.g. Sensitivity Reading, Prose Analysis..." />
              <button type="button" onClick={() => { if (tagInput.trim()) { setReaderForm({ ...readerForm, skillTags: [...(readerForm.skillTags || []), tagInput.trim()] }); setTagInput(''); } }} className="px-4 py-2 bg-surface-elevated text-text-primary rounded-xl border border-border/50 font-ui text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">{(readerForm.skillTags || []).map((t, i) => <span key={i} className="flex items-center gap-1 bg-surface-elevated border border-border/30 rounded-lg px-2.5 py-1 text-xs text-text-primary">{t}<button type="button" onClick={() => setReaderForm({ ...readerForm, skillTags: (readerForm.skillTags || []).filter((_, idx) => idx !== i) })} className="text-text-muted hover:text-forge-red ml-1"><Trash2 className="w-3 h-3" /></button></span>)}</div>
          </FormSection>
          <FormSection title="Notes"><textarea value={readerForm.notes} onChange={e => setReaderForm({ ...readerForm, notes: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="Admin notes..." /></FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">{editingReader ? 'Update Reader' : 'Add Reader'}</button>
            <button type="button" onClick={() => setReaderModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
