import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, ChevronDown, ChevronRight, Check, Clock, User,
  BookOpen, Package, MessageCircle, Scissors, Megaphone, Trash2, Copy,
  PlayCircle, CheckCircle, AlertCircle, Edit3, Save, X, FileText, Search,
  Filter, ArrowRight, RotateCcw
} from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ──────────────────────────────────────────────

interface SOPStep {
  id: string;
  title: string;
  description: string;
  role: string; // editor, designer, admin, author, marketing
  resources?: string[]; // links, template names
  checklist?: string[];
}

interface SOPTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  steps: SOPStep[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isDefault?: boolean;
}

interface SOPInstance {
  id: string;
  templateId: string;
  templateTitle: string;
  bookTitle: string;
  bookId?: string;
  assignedTo?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  stepProgress: Record<string, {
    completed: boolean;
    completedBy?: string;
    completedAt?: Timestamp;
    notes?: string;
    checklistProgress?: Record<string, boolean>;
  }>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ─── Import expanded SOP templates ──────────────────────
import { SOP_TEMPLATES_SEED } from '../../data/sopTemplatesSeed';

const DEFAULT_TEMPLATES: Omit<SOPTemplate, 'id'>[] = SOP_TEMPLATES_SEED.map(t => ({
  title: t.title,
  category: t.category,
  icon: t.icon,
  description: t.description,
  isDefault: true,
  steps: t.steps,
}));

// ─── Role config ────────────────────────────────────────

const ROLES = [
  { id: 'editor', label: 'Editor', color: 'text-purple-400 bg-purple-500/10' },
  { id: 'designer', label: 'Designer', color: 'text-cyan-400 bg-cyan-500/10' },
  { id: 'admin', label: 'Admin', color: 'text-starforge-gold bg-starforge-gold/10' },
  { id: 'author', label: 'Author', color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'marketing', label: 'Marketing', color: 'text-pink-400 bg-pink-500/10' },
  { id: 'Acquisitions Editor', label: 'Acquisitions', color: 'text-orange-400 bg-orange-500/10' },
  { id: 'Editor-in-Chief', label: 'Editor-in-Chief', color: 'text-purple-300 bg-purple-400/10' },
  { id: 'Publisher / Legal', label: 'Publisher/Legal', color: 'text-red-400 bg-red-500/10' },
  { id: 'Publisher', label: 'Publisher', color: 'text-red-300 bg-red-400/10' },
  { id: 'Developmental Editor', label: 'Dev Editor', color: 'text-violet-400 bg-violet-500/10' },
  { id: 'Copy Editor', label: 'Copy Editor', color: 'text-sky-400 bg-sky-500/10' },
  { id: 'Line Editor', label: 'Line Editor', color: 'text-indigo-400 bg-indigo-500/10' },
  { id: 'Sensitivity Reader(s)', label: 'Sensitivity Reader', color: 'text-rose-400 bg-rose-500/10' },
  { id: 'Proofreader', label: 'Proofreader', color: 'text-teal-400 bg-teal-500/10' },
  { id: 'Proofreader (2nd)', label: 'Proofreader 2', color: 'text-teal-300 bg-teal-400/10' },
  { id: 'Book Designer', label: 'Book Designer', color: 'text-cyan-300 bg-cyan-400/10' },
  { id: 'Art Director', label: 'Art Director', color: 'text-fuchsia-400 bg-fuchsia-500/10' },
  { id: 'Cover Designer', label: 'Cover Designer', color: 'text-blue-400 bg-blue-500/10' },
  { id: 'eBook Formatter', label: 'eBook Formatter', color: 'text-lime-400 bg-lime-500/10' },
  { id: 'Production Manager', label: 'Production', color: 'text-amber-400 bg-amber-500/10' },
  { id: 'Rights Manager', label: 'Rights Manager', color: 'text-orange-300 bg-orange-400/10' },
  { id: 'Editor / Legal', label: 'Editor/Legal', color: 'text-red-300 bg-red-400/10' },
  { id: 'Producer', label: 'Producer', color: 'text-yellow-400 bg-yellow-500/10' },
  { id: 'Audio Engineer', label: 'Audio Engineer', color: 'text-green-400 bg-green-500/10' },
  { id: 'Narrator / Producer', label: 'Narrator', color: 'text-yellow-300 bg-yellow-400/10' },
  { id: 'Narrator', label: 'Narrator', color: 'text-yellow-300 bg-yellow-400/10' },
  { id: 'Marketing Director', label: 'Mktg Director', color: 'text-pink-300 bg-pink-400/10' },
  { id: 'Marketing Coordinator', label: 'Mktg Coord', color: 'text-pink-300 bg-pink-400/10' },
  { id: 'Marketing / Editor', label: 'Mktg/Editor', color: 'text-pink-400 bg-pink-500/10' },
  { id: 'Sales / Marketing', label: 'Sales/Mktg', color: 'text-pink-400 bg-pink-500/10' },
  { id: 'Social Media Manager', label: 'Social Media', color: 'text-pink-400 bg-pink-500/10' },
  { id: 'Events Coordinator', label: 'Events', color: 'text-emerald-300 bg-emerald-400/10' },
  { id: 'Finance / Operations', label: 'Finance/Ops', color: 'text-amber-300 bg-amber-400/10' },
  { id: 'Finance', label: 'Finance', color: 'text-amber-300 bg-amber-400/10' },
  { id: 'Publisher / Finance', label: 'Publisher/Finance', color: 'text-red-300 bg-red-400/10' },
  { id: 'Editor / Operations', label: 'Editor/Ops', color: 'text-purple-300 bg-purple-400/10' },
  { id: 'Operations', label: 'Operations', color: 'text-starforge-gold bg-starforge-gold/10' },
  { id: 'Operations / Legal', label: 'Ops/Legal', color: 'text-red-300 bg-red-400/10' },
  { id: 'Operations / Marketing', label: 'Ops/Mktg', color: 'text-pink-300 bg-pink-400/10' },
  { id: 'Community Manager', label: 'Community', color: 'text-indigo-400 bg-indigo-500/10' },
  { id: 'Content Manager', label: 'Content', color: 'text-violet-300 bg-violet-400/10' },
  { id: 'Publisher / Acquisitions', label: 'Publisher/Acq', color: 'text-red-300 bg-red-400/10' },
  { id: 'Marketing / Designer', label: 'Mktg/Design', color: 'text-cyan-300 bg-cyan-400/10' },
  { id: 'Anthology Editor', label: 'Anthology Ed', color: 'text-purple-400 bg-purple-500/10' },
  { id: 'Community Manager / Editor', label: 'Community/Ed', color: 'text-indigo-300 bg-indigo-400/10' },
  { id: 'Technical Lead', label: 'Technical', color: 'text-green-400 bg-green-500/10' },
  { id: 'QA / Technical Lead', label: 'QA/Tech', color: 'text-green-300 bg-green-400/10' },
];

const CATEGORIES = ['editorial', 'design', 'marketing', 'operations', 'community', 'Design', 'Distribution', 'Author Relations', 'Editorial', 'Marketing'];

const STATUS_CONFIG = {
  'not-started': { label: 'Not Started', color: 'text-text-muted bg-white/5', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'text-cyan-400 bg-cyan-500/10', icon: PlayCircle },
  'completed': { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle },
  'paused': { label: 'Paused', color: 'text-amber-400 bg-amber-500/10', icon: AlertCircle },
};

type SubView = 'templates' | 'instances';

export default function AdminSOPs() {
  const { user } = useAuth();
  const [subView, setSubView] = useState<SubView>('templates');
  const [templates, setTemplates] = useState<SOPTemplate[]>([]);
  const [instances, setInstances] = useState<SOPInstance[]>([]);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [expandedInstance, setExpandedInstance] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showNewInstance, setShowNewInstance] = useState(false);
  const [newInstanceTemplate, setNewInstanceTemplate] = useState('');
  const [newInstanceBook, setNewInstanceBook] = useState('');
  const [seeding, setSeeding] = useState(false);

  // ─── Firestore Sync ──────────────────────────────────

  useEffect(() => {
    const unsubTemplates = onSnapshot(
      query(collection(db, 'sop_templates'), orderBy('title')),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as SOPTemplate));
        setTemplates(data);
        // Auto-seed defaults if empty
        if (data.length === 0 && !seeding) {
          seedDefaults();
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'sop_templates')
    );
    const unsubInstances = onSnapshot(
      query(collection(db, 'sop_instances'), orderBy('createdAt', 'desc')),
      (snap) => setInstances(snap.docs.map(d => ({ id: d.id, ...d.data() } as SOPInstance))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'sop_instances')
    );
    return () => { unsubTemplates(); unsubInstances(); };
  }, []);

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      for (const tmpl of DEFAULT_TEMPLATES) {
        await addDoc(collection(db, 'sop_templates'), { ...tmpl, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'sop_templates');
    } finally {
      setSeeding(false);
    }
  };

  // ─── Instance Actions ────────────────────────────────

  const createInstance = async () => {
    if (!newInstanceTemplate || !newInstanceBook.trim()) return;
    const tmpl = templates.find(t => t.id === newInstanceTemplate);
    if (!tmpl) return;
    const stepProgress: SOPInstance['stepProgress'] = {};
    tmpl.steps.forEach(s => {
      const checklistProgress: Record<string, boolean> = {};
      s.checklist?.forEach(c => { checklistProgress[c] = false; });
      stepProgress[s.id] = { completed: false, checklistProgress };
    });
    try {
      await addDoc(collection(db, 'sop_instances'), {
        templateId: tmpl.id, templateTitle: tmpl.title, bookTitle: newInstanceBook.trim(),
        status: 'not-started', stepProgress, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      setShowNewInstance(false);
      setNewInstanceTemplate('');
      setNewInstanceBook('');
      setSubView('instances');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'sop_instances');
    }
  };

  const toggleStepComplete = async (instance: SOPInstance, stepId: string) => {
    const current = instance.stepProgress[stepId];
    const newProgress = { ...instance.stepProgress };
    newProgress[stepId] = {
      ...current,
      completed: !current.completed,
      completedBy: !current.completed ? (user?.displayName || user?.email || 'Unknown') : undefined,
      completedAt: !current.completed ? Timestamp.now() : undefined,
    };
    const allDone = Object.values(newProgress).every(s => s.completed);
    const anyDone = Object.values(newProgress).some(s => s.completed);
    try {
      await updateDoc(doc(db, 'sop_instances', instance.id), {
        stepProgress: newProgress,
        status: allDone ? 'completed' : anyDone ? 'in-progress' : 'not-started',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'sop_instances');
    }
  };

  const toggleChecklistItem = async (instance: SOPInstance, stepId: string, item: string) => {
    const current = instance.stepProgress[stepId];
    const newChecklist = { ...current.checklistProgress, [item]: !current.checklistProgress?.[item] };
    const newProgress = { ...instance.stepProgress };
    newProgress[stepId] = { ...current, checklistProgress: newChecklist };
    try {
      await updateDoc(doc(db, 'sop_instances', instance.id), { stepProgress: newProgress, updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'sop_instances');
    }
  };

  const updateInstanceStatus = async (instanceId: string, status: SOPInstance['status']) => {
    try {
      await updateDoc(doc(db, 'sop_instances', instanceId), { status, updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'sop_instances');
    }
  };

  const deleteInstance = async (instanceId: string) => {
    if (!confirm('Delete this SOP instance? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'sop_instances', instanceId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'sop_instances');
    }
  };

  // ─── Computed ────────────────────────────────────────

  const filteredTemplates = templates.filter(t => {
    if (filterCategory && t.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  const getProgress = (instance: SOPInstance) => {
    const steps = Object.values(instance.stepProgress);
    const done = steps.filter(s => s.completed).length;
    return { done, total: steps.length, pct: steps.length ? Math.round((done / steps.length) * 100) : 0 };
  };

  const getRoleConfig = (roleId: string) => ROLES.find(r => r.id === roleId) || ROLES[0];

  // ─── Render ──────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-text-primary flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-starforge-gold" /> Standard Operating Procedures
          </h2>
          <p className="text-sm text-text-secondary mt-1">Interactive workflows with step tracking, checklists, and per-book instances.</p>
        </div>
        <button onClick={() => setShowNewInstance(true)}
          className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
          <Plus className="w-4 h-4" /> Start SOP for Book
        </button>
      </div>

      {/* Sub-Navigation */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-4">
        {([
          { id: 'templates' as SubView, label: 'SOP Templates', count: templates.length },
          { id: 'instances' as SubView, label: 'Active SOPs', count: instances.filter(i => i.status !== 'completed').length },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setSubView(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-ui uppercase tracking-wider transition-all border ${subView === tab.id
              ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30'
              : 'bg-white/[0.02] text-text-secondary border-white/[0.04] hover:text-white'}`}>
            {tab.label}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08]">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* New Instance Modal */}
      <AnimatePresence>
        {showNewInstance && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-xl bg-surface border border-starforge-gold/20">
            <h3 className="font-heading text-lg text-text-primary mb-4">Start SOP for a Book</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-ui uppercase tracking-wider">SOP Template</label>
                <select value={newInstanceTemplate} onChange={e => setNewInstanceTemplate(e.target.value)}
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-starforge-gold outline-none">
                  <option value="">Select template...</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.icon} {t.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-ui uppercase tracking-wider">Book Title</label>
                <input value={newInstanceBook} onChange={e => setNewInstanceBook(e.target.value)} placeholder="Enter book title..."
                  className="w-full bg-void-black border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-starforge-gold outline-none" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewInstance(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors">Cancel</button>
              <button onClick={createInstance} disabled={!newInstanceTemplate || !newInstanceBook.trim()}
                className="px-4 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50">
                <PlayCircle className="w-4 h-4 inline mr-1" /> Start
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TEMPLATES VIEW ═══ */}
      {subView === 'templates' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
            </div>
            <div className="flex gap-1">
              <button onClick={() => setFilterCategory(null)}
                className={`px-3 py-2 rounded-lg text-xs font-ui transition-all ${!filterCategory ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-muted hover:text-white'}`}>
                All
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-ui transition-all ${filterCategory === cat ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-muted hover:text-white'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template Cards */}
          {filteredTemplates.map(tmpl => {
            const isExpanded = expandedTemplate === tmpl.id;
            return (
              <motion.div key={tmpl.id} layout className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <button onClick={() => setExpandedTemplate(isExpanded ? null : tmpl.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors text-left">
                  <span className="text-2xl">{tmpl.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-heading text-base text-text-primary">{tmpl.title}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">{tmpl.description}</p>
                  </div>
                  <span className="text-[10px] text-text-muted px-2 py-1 rounded-full bg-white/[0.04] uppercase tracking-wider">{tmpl.category}</span>
                  <span className="text-xs text-text-muted font-mono">{tmpl.steps.length} steps</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.04]">
                      <div className="p-5 space-y-3">
                        {tmpl.steps.map((step, i) => {
                          const roleConf = getRoleConfig(step.role);
                          return (
                            <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                              <span className="text-xs text-text-muted font-mono mt-1 w-6 text-center">{i + 1}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium text-text-primary">{step.title}</h4>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleConf.color}`}>{roleConf.label}</span>
                                </div>
                                <p className="text-xs text-text-secondary">{step.description}</p>
                                {step.checklist && step.checklist.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {step.checklist.map(item => (
                                      <span key={item} className="text-[10px] text-text-muted px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]">
                                        ☐ {item}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => { setNewInstanceTemplate(tmpl.id); setShowNewInstance(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-starforge-gold/10 text-starforge-gold text-xs font-ui rounded-lg hover:bg-starforge-gold/20 transition-colors">
                            <PlayCircle className="w-3.5 h-3.5" /> Use This Template
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

      {/* ═══ INSTANCES VIEW ═══ */}
      {subView === 'instances' && (
        <div className="space-y-4">
          {instances.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No active SOPs yet. Start one from a template above.</p>
            </div>
          ) : (
            instances.map(inst => {
              const isExpanded = expandedInstance === inst.id;
              const progress = getProgress(inst);
              const statusConf = STATUS_CONFIG[inst.status];
              const StatusIcon = statusConf.icon;
              const tmpl = templates.find(t => t.id === inst.templateId);

              return (
                <motion.div key={inst.id} layout className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedInstance(isExpanded ? null : inst.id)}
                    className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors text-left">
                    <div className="flex-1">
                      <h3 className="font-heading text-base text-text-primary">{inst.bookTitle}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">{inst.templateTitle}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full ${statusConf.color}`}>
                      <StatusIcon className="w-3 h-3" /> {statusConf.label}
                    </div>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full bg-starforge-gold rounded-full transition-all" style={{ width: `${progress.pct}%` }} />
                      </div>
                      <span className="text-xs text-text-muted font-mono">{progress.done}/{progress.total}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && tmpl && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/[0.04]">
                        <div className="p-5 space-y-3">
                          {/* Status Controls */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider">Status:</span>
                            {(Object.keys(STATUS_CONFIG) as SOPInstance['status'][]).map(s => {
                              const conf = STATUS_CONFIG[s];
                              const Icon = conf.icon;
                              return (
                                <button key={s} onClick={() => updateInstanceStatus(inst.id, s)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-ui transition-all border ${inst.status === s
                                    ? `${conf.color} border-current/20` : 'text-text-muted border-white/[0.04] hover:text-white'}`}>
                                  <Icon className="w-3 h-3" /> {conf.label}
                                </button>
                              );
                            })}
                            <button onClick={() => deleteInstance(inst.id)}
                              className="ml-auto text-text-muted hover:text-red-400 transition-colors p-1.5">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Steps with Progress */}
                          {tmpl.steps.map((step, i) => {
                            const sp = inst.stepProgress[step.id] || { completed: false, checklistProgress: {} };
                            const roleConf = getRoleConfig(step.role);
                            return (
                              <div key={step.id} className={`p-4 rounded-lg border transition-all ${sp.completed
                                ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                                <div className="flex items-start gap-3">
                                  <button onClick={() => toggleStepComplete(inst, step.id)}
                                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-all flex-none ${sp.completed
                                      ? 'bg-emerald-500 border-emerald-500 text-void-black' : 'border-white/[0.2] hover:border-starforge-gold'}`}>
                                    {sp.completed && <Check className="w-3 h-3" />}
                                  </button>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-text-muted font-mono">{i + 1}.</span>
                                      <h4 className={`text-sm font-medium ${sp.completed ? 'text-emerald-400 line-through' : 'text-text-primary'}`}>{step.title}</h4>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleConf.color}`}>{roleConf.label}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary">{step.description}</p>
                                    {sp.completed && sp.completedBy && (
                                      <p className="text-[10px] text-emerald-400/60 mt-1 flex items-center gap-1">
                                        <User className="w-2.5 h-2.5" /> {sp.completedBy}
                                        {sp.completedAt && <> · {sp.completedAt.toDate().toLocaleDateString()}</>}
                                      </p>
                                    )}
                                    {/* Checklist Items */}
                                    {step.checklist && step.checklist.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {step.checklist.map(item => {
                                          const checked = sp.checklistProgress?.[item] || false;
                                          return (
                                            <button key={item} onClick={() => toggleChecklistItem(inst, step.id, item)}
                                              className={`flex items-center gap-2 text-[11px] transition-colors ${checked ? 'text-emerald-400/60 line-through' : 'text-text-muted hover:text-text-secondary'}`}>
                                              <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-none ${checked
                                                ? 'bg-emerald-500/30 border-emerald-500/40' : 'border-white/[0.15]'}`}>
                                                {checked && <Check className="w-2 h-2" />}
                                              </span>
                                              {item}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
