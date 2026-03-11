import { useState, useEffect } from 'react';
import {
  GitBranch, Plus, Edit2, Trash2, Save, ChevronDown, ChevronRight,
  AlertCircle, Clock, AlertTriangle, Settings, Send, Eye, Users, FileText,
  Printer, Package, Sparkles, ArrowUp, ArrowDown, Bell, Zap
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import AdminModal, { FormSection, FormField } from './AdminModal';

// ─── Types ──────────────────────────────────────
interface PipelineStageConfig {
  id: string;
  stageKey: string;
  label: string;
  icon: string;
  color: string;
  slaWarningDays: number;
  slaOverdueDays: number;
  autoNotify: boolean;
  notifyRoles: string[];
  description: string;
  order: number;
  enabled: boolean;
}

interface PipelineSettings {
  id: string;
  maxConcurrentManuscripts: number;
  autoAssignEditor: boolean;
  defaultBetaReaderCount: number;
  requireBetaReading: boolean;
  bottleneckThreshold: number;
  overdueAlertEnabled: boolean;
  overdueAlertRecipients: string;
  weeklyDigestEnabled: boolean;
}

// ─── Collapsible Panel ──────────────────────────
function Panel({ title, icon: Icon, count, children, defaultOpen = false }: {
  title: string; icon: any; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20 flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-starforge-gold" />
        </div>
        <h3 className="font-heading text-lg text-text-primary flex-1">{title}</h3>
        {count !== undefined && <span className="font-mono text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full border border-border/50">{count}</span>}
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

const STAGE_ICONS = [
  { value: 'Send', label: '📤 Send' }, { value: 'Eye', label: '👁 Eye' },
  { value: 'Users', label: '👥 Users' }, { value: 'FileText', label: '📝 FileText' },
  { value: 'Printer', label: '🖨 Printer' }, { value: 'Package', label: '📦 Package' },
  { value: 'Sparkles', label: '✨ Sparkles' }, { value: 'Clock', label: '🕐 Clock' },
  { value: 'Edit3', label: '✏️ Edit' },
];

// ─── Main Component ─────────────────────────────
export default function AdminPipeline() {
  const [stages, setStages] = useState<PipelineStageConfig[]>([]);
  const [settings, setSettings] = useState<PipelineSettings>({
    id: 'main', maxConcurrentManuscripts: 20, autoAssignEditor: false,
    defaultBetaReaderCount: 5, requireBetaReading: true, bottleneckThreshold: 5,
    overdueAlertEnabled: true, overdueAlertRecipients: '', weeklyDigestEnabled: true,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [stageModal, setStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStageConfig | null>(null);
  const [stageForm, setStageForm] = useState<Partial<PipelineStageConfig>>({
    stageKey: '', label: '', icon: 'Send', color: '#6366f1', slaWarningDays: 14,
    slaOverdueDays: 30, autoNotify: true, notifyRoles: ['admin', 'editor'],
    description: '', order: 0, enabled: true,
  });

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'pipeline_stages'), (snap) => {
      setStages(snap.docs.map(d => ({ id: d.id, ...d.data() } as PipelineStageConfig)).sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pipeline_stages')));
    unsubs.push(onSnapshot(collection(db, 'pipeline_settings'), (snap) => {
      if (snap.docs.length > 0) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as PipelineSettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pipeline_settings')));
    return () => unsubs.forEach(u => u());
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'pipeline_settings', settings.id), { ...settings, updatedAt: serverTimestamp() });
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'pipeline_settings'); }
  };

  const openStageModal = (s?: PipelineStageConfig) => {
    if (s) { setEditingStage(s); setStageForm(s); }
    else {
      setEditingStage(null);
      setStageForm({ stageKey: '', label: '', icon: 'Send', color: '#6366f1', slaWarningDays: 14, slaOverdueDays: 30, autoNotify: true, notifyRoles: ['admin', 'editor'], description: '', order: stages.length, enabled: true });
    }
    setStageModal(true);
  };

  const saveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        stageKey: stageForm.stageKey, label: stageForm.label, icon: stageForm.icon,
        color: stageForm.color, slaWarningDays: stageForm.slaWarningDays, slaOverdueDays: stageForm.slaOverdueDays,
        autoNotify: stageForm.autoNotify ?? true, notifyRoles: stageForm.notifyRoles || [],
        description: stageForm.description, order: stageForm.order ?? 0, enabled: stageForm.enabled ?? true,
      };
      if (editingStage) await setDoc(doc(db, 'pipeline_stages', editingStage.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'pipeline_stages')), { ...data, createdAt: serverTimestamp() });
      setStageModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'pipeline_stages'); }
  };

  const deleteStage = async (id: string) => {
    if (window.confirm('Delete this pipeline stage? Manuscripts currently in this stage will need to be reassigned.')) {
      try { await deleteDoc(doc(db, 'pipeline_stages', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'pipeline_stages'); }
    }
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <GitBranch className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-heading text-2xl text-text-primary">Manuscript Pipeline</h2>
            <p className="font-ui text-text-secondary text-sm">Configure pipeline stages, SLAs, and bottleneck alerts.</p>
          </div>
        </div>
        <button onClick={() => openStageModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all">
          <Plus className="w-4 h-4" /> New Stage
        </button>
      </div>

      {/* ═══ 1. Pipeline Stages ═══ */}
      <Panel title="Pipeline Stages" icon={Zap} count={stages.length} defaultOpen>
        <div className="space-y-2">
          <p className="font-ui text-xs text-text-muted mb-3">Stages a manuscript passes through from submission to publication. Order matters.</p>
          {stages.length === 0 && (
            <div className="text-center py-8 text-text-muted font-ui text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" /> No stages configured. Hardcoded defaults (8 stages) will be used.
            </div>
          )}
          {stages.map((stage, idx) => (
            <div key={stage.id} className={`flex items-center gap-4 bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 ${!stage.enabled ? 'opacity-50' : ''}`}>
              <span className="font-mono text-xs text-text-muted w-6 text-center">{idx + 1}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stage.color}15` }}>
                <span className="text-sm" style={{ color: stage.color }}>●</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading text-sm text-text-primary">{stage.label}</h4>
                <p className="text-[11px] text-text-muted truncate">{stage.description || 'No description'}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <span className="text-[9px] text-text-muted uppercase block">Warning</span>
                  <span className="font-mono text-xs text-amber-400">{stage.slaWarningDays}d</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-text-muted uppercase block">Overdue</span>
                  <span className="font-mono text-xs text-red-400">{stage.slaOverdueDays}d</span>
                </div>
                {stage.autoNotify && <Bell className="w-3.5 h-3.5 text-aurora-teal" />}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openStageModal(stage)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteStage(stage.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ═══ 2. Pipeline Settings ═══ */}
      <Panel title="Pipeline Settings" icon={Settings}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Max Concurrent Manuscripts</label>
              <input type="number" min="1" value={settings.maxConcurrentManuscripts} onChange={e => setSettings({ ...settings, maxConcurrentManuscripts: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Default Beta Reader Count</label>
              <input type="number" min="1" max="20" value={settings.defaultBetaReaderCount} onChange={e => setSettings({ ...settings, defaultBetaReaderCount: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Bottleneck Threshold</label>
              <input type="number" min="1" value={settings.bottleneckThreshold} onChange={e => setSettings({ ...settings, bottleneckThreshold: Number(e.target.value) })} className={inputClass} />
              <p className="text-[10px] text-text-muted mt-1">Alert when X manuscripts stuck in one stage</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settings.autoAssignEditor} onChange={e => setSettings({ ...settings, autoAssignEditor: e.target.checked })} className="accent-starforge-gold" />
              <span className="text-sm text-text-secondary">Auto-assign editor on submission</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={settings.requireBetaReading} onChange={e => setSettings({ ...settings, requireBetaReading: e.target.checked })} className="accent-starforge-gold" />
              <span className="text-sm text-text-secondary">Require beta reading stage</span>
            </label>
          </div>
        </div>
      </Panel>

      {/* ═══ 3. Alerts & Notifications ═══ */}
      <Panel title="Alerts & Notifications" icon={Bell}>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.overdueAlertEnabled} onChange={e => setSettings({ ...settings, overdueAlertEnabled: e.target.checked })} className="accent-starforge-gold" />
            <span className="text-sm text-text-secondary">Enable overdue manuscript alerts</span>
          </label>
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Alert Recipients (emails, comma-separated)</label>
            <input type="text" value={settings.overdueAlertRecipients} onChange={e => setSettings({ ...settings, overdueAlertRecipients: e.target.value })} className={inputClass} placeholder="admin@runaatlas.com, editor@runaatlas.com" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.weeklyDigestEnabled} onChange={e => setSettings({ ...settings, weeklyDigestEnabled: e.target.checked })} className="accent-starforge-gold" />
            <span className="text-sm text-text-secondary">Send weekly pipeline digest email</span>
          </label>
          <button onClick={saveSettings}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${settingsSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}>
            <Save className="w-4 h-4" /> {settingsSaved ? 'Saved!' : 'Save All Settings'}
          </button>
        </div>
      </Panel>

      {/* Stage Modal */}
      <AdminModal isOpen={stageModal} onClose={() => setStageModal(false)}
        title={editingStage ? 'Edit Pipeline Stage' : 'Add Pipeline Stage'}>
        <form onSubmit={saveStage} className="space-y-6">
          <FormSection title="Stage Identity">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Stage Key (unique identifier)">
                <input type="text" required value={stageForm.stageKey} onChange={e => setStageForm({ ...stageForm, stageKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className={`${inputClass} font-mono`} placeholder="e.g. editorial_review" />
              </FormField>
              <FormField label="Display Label">
                <input type="text" required value={stageForm.label} onChange={e => setStageForm({ ...stageForm, label: e.target.value })} className={inputClass} placeholder="e.g. Editorial Review" />
              </FormField>
            </div>
            <FormField label="Description">
              <textarea value={stageForm.description} onChange={e => setStageForm({ ...stageForm, description: e.target.value })} className={`${inputClass} h-16 resize-none`} placeholder="What happens in this stage..." />
            </FormField>
          </FormSection>
          <FormSection title="Appearance">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Icon">
                <select value={stageForm.icon} onChange={e => setStageForm({ ...stageForm, icon: e.target.value })} className={inputClass}>
                  {STAGE_ICONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </FormField>
              <FormField label="Color">
                <div className="flex items-center gap-3">
                  <input type="color" value={stageForm.color} onChange={e => setStageForm({ ...stageForm, color: e.target.value })} className="w-10 h-10 bg-transparent border-none cursor-pointer" />
                  <input type="text" value={stageForm.color} onChange={e => setStageForm({ ...stageForm, color: e.target.value })} className={`${inputClass} font-mono`} />
                </div>
              </FormField>
            </div>
          </FormSection>
          <FormSection title="SLA & Notifications">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Warning After (days)">
                <input type="number" min="1" value={stageForm.slaWarningDays} onChange={e => setStageForm({ ...stageForm, slaWarningDays: Number(e.target.value) })} className={inputClass} />
              </FormField>
              <FormField label="Overdue After (days)">
                <input type="number" min="1" value={stageForm.slaOverdueDays} onChange={e => setStageForm({ ...stageForm, slaOverdueDays: Number(e.target.value) })} className={inputClass} />
              </FormField>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={stageForm.autoNotify} onChange={e => setStageForm({ ...stageForm, autoNotify: e.target.checked })} className="accent-starforge-gold" />
                <span className="text-sm text-text-secondary">Auto-notify on stage entry</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={stageForm.enabled} onChange={e => setStageForm({ ...stageForm, enabled: e.target.checked })} className="accent-starforge-gold" />
                <span className="text-sm text-text-secondary">Enabled</span>
              </label>
            </div>
          </FormSection>
          <FormSection title="Order">
            <FormField label="Sort Order">
              <input type="number" value={stageForm.order} onChange={e => setStageForm({ ...stageForm, order: Number(e.target.value) })} className={inputClass} />
            </FormField>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">
              {editingStage ? 'Update Stage' : 'Add Stage'}
            </button>
            <button type="button" onClick={() => setStageModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
