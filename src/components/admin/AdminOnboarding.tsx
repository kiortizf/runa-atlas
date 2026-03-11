import { useState, useEffect } from 'react';
import {
  Compass, Save, ChevronDown, ChevronRight, Plus, Edit2, Trash2,
  AlertCircle, CheckCircle, Settings, Zap
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import AdminModal, { FormSection, FormField } from './AdminModal';

// ─── Types ──────────────────────────────────────
interface OnboardingStep {
  id: string;
  stepKey: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  order: number;
  enabled: boolean;
}

interface OnboardingSettings {
  id: string;
  enabled: boolean;
  skipAllowed: boolean;
  welcomeTitle: string;
  welcomeBody: string;
  completionTitle: string;
  completionBody: string;
  autoRedirectAfter: string;
  requireGenres: boolean;
  requireBio: boolean;
  requireAvatar: boolean;
  showProgressBar: boolean;
}

// ─── Panel ──────────────────────────────────────
function Panel({ title, icon: Icon, count, children, defaultOpen = false }: {
  title: string; icon: any; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 flex-shrink-0"><Icon className="w-4.5 h-4.5 text-amber-400" /></div>
        <h3 className="font-heading text-lg text-text-primary flex-1">{title}</h3>
        {count !== undefined && <span className="font-mono text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full border border-border/50">{count}</span>}
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

export default function AdminOnboarding() {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [settings, setSettings] = useState<OnboardingSettings>({
    id: 'main', enabled: true, skipAllowed: false,
    welcomeTitle: 'Welcome to Rüna Atlas', welcomeBody: 'Let\'s set up your author profile in just a few quick steps.',
    completionTitle: 'You\'re All Set!', completionBody: 'Your author profile is ready. Start writing, exploring, and connecting.',
    autoRedirectAfter: '/creator', requireGenres: true, requireBio: false,
    requireAvatar: false, showProgressBar: true,
  });
  const [saved, setSaved] = useState(false);
  const [stepModal, setStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<OnboardingStep | null>(null);
  const [stepForm, setStepForm] = useState<Partial<OnboardingStep>>({
    stepKey: '', title: '', description: '', icon: '📝', required: false, order: 0, enabled: true,
  });

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'onboarding_steps'), (snap) => {
      setSteps(snap.docs.map(d => ({ id: d.id, ...d.data() } as OnboardingStep)).sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'onboarding_steps')));
    unsubs.push(onSnapshot(collection(db, 'onboarding_settings'), (snap) => {
      if (snap.docs.length > 0) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as OnboardingSettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'onboarding_settings')));
    return () => unsubs.forEach(u => u());
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'onboarding_settings', settings.id), { ...settings, updatedAt: serverTimestamp() });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'onboarding_settings'); }
  };

  const openStepModal = (s?: OnboardingStep) => {
    if (s) { setEditingStep(s); setStepForm(s); }
    else { setEditingStep(null); setStepForm({ stepKey: '', title: '', description: '', icon: '📝', required: false, order: steps.length, enabled: true }); }
    setStepModal(true);
  };

  const saveStep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { stepKey: stepForm.stepKey, title: stepForm.title, description: stepForm.description, icon: stepForm.icon, required: stepForm.required ?? false, order: stepForm.order ?? 0, enabled: stepForm.enabled ?? true };
      if (editingStep) await setDoc(doc(db, 'onboarding_steps', editingStep.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'onboarding_steps')), { ...data, createdAt: serverTimestamp() });
      setStepModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'onboarding_steps'); }
  };

  const deleteStep = async (id: string) => {
    if (window.confirm('Delete this onboarding step?')) {
      try { await deleteDoc(doc(db, 'onboarding_steps', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'onboarding_steps'); }
    }
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20"><Compass className="w-6 h-6 text-amber-400" /></div>
          <div><h2 className="font-heading text-2xl text-text-primary">Onboarding</h2><p className="font-ui text-text-secondary text-sm">Configure the author onboarding flow: welcome text, steps, and requirements.</p></div>
        </div>
        <button onClick={() => openStepModal()} className="flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all"><Plus className="w-4 h-4" /> Add Step</button>
      </div>

      {/* Onboarding Steps */}
      <Panel title="Onboarding Steps" icon={Zap} count={steps.length} defaultOpen>
        <div className="space-y-2">
          <p className="font-ui text-xs text-text-muted mb-3">Steps authors complete when creating their profile. Order matters.</p>
          {steps.length === 0 && <div className="text-center py-8 text-text-muted font-ui text-sm"><AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />No steps configured. Hardcoded defaults will be used.</div>}
          {steps.map((step, idx) => (
            <div key={step.id} className={`flex items-center gap-4 bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 ${!step.enabled ? 'opacity-50' : ''}`}>
              <span className="font-mono text-xs text-text-muted w-6 text-center">{idx + 1}</span>
              <span className="text-xl">{step.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="font-heading text-sm text-text-primary">{step.title}</span>{step.required && <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded uppercase">Required</span>}</div>
                <p className="text-[11px] text-text-muted truncate">{step.description || 'No description'}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openStepModal(step)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteStep(step.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Flow Settings */}
      <Panel title="Flow Settings" icon={Settings}>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.enabled} onChange={e => setSettings({ ...settings, enabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Enable onboarding flow for new authors</span></label>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Welcome Title</label><input type="text" value={settings.welcomeTitle} onChange={e => setSettings({ ...settings, welcomeTitle: e.target.value })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Completion Title</label><input type="text" value={settings.completionTitle} onChange={e => setSettings({ ...settings, completionTitle: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Welcome Body</label><textarea value={settings.welcomeBody} onChange={e => setSettings({ ...settings, welcomeBody: e.target.value })} className={`${inputClass} h-20 resize-none`} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Completion Body</label><textarea value={settings.completionBody} onChange={e => setSettings({ ...settings, completionBody: e.target.value })} className={`${inputClass} h-20 resize-none`} /></div>
          </div>
          <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Redirect After Completion</label><input type="text" value={settings.autoRedirectAfter} onChange={e => setSettings({ ...settings, autoRedirectAfter: e.target.value })} className={`${inputClass} font-mono`} placeholder="/creator" /></div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.skipAllowed} onChange={e => setSettings({ ...settings, skipAllowed: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Allow skipping onboarding</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.showProgressBar} onChange={e => setSettings({ ...settings, showProgressBar: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Show progress bar</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.requireGenres} onChange={e => setSettings({ ...settings, requireGenres: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Require genres selection</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.requireBio} onChange={e => setSettings({ ...settings, requireBio: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Require bio</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.requireAvatar} onChange={e => setSettings({ ...settings, requireAvatar: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Require avatar</span></label>
          </div>
          <button onClick={saveSettings} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${saved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}><Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save Settings'}</button>
        </div>
      </Panel>

      {/* Step Modal */}
      <AdminModal isOpen={stepModal} onClose={() => setStepModal(false)} title={editingStep ? 'Edit Onboarding Step' : 'Add Onboarding Step'}>
        <form onSubmit={saveStep} className="space-y-6">
          <FormSection title="Step Details">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Step Key"><input type="text" required value={stepForm.stepKey} onChange={e => setStepForm({ ...stepForm, stepKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className={`${inputClass} font-mono`} placeholder="e.g. genre_selection" /></FormField>
              <FormField label="Title"><input type="text" required value={stepForm.title} onChange={e => setStepForm({ ...stepForm, title: e.target.value })} className={inputClass} placeholder="e.g. Choose Your Genres" /></FormField>
            </div>
            <FormField label="Description"><textarea value={stepForm.description} onChange={e => setStepForm({ ...stepForm, description: e.target.value })} className={`${inputClass} h-16 resize-none`} placeholder="What this step asks the author to do..." /></FormField>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Icon (emoji)"><input type="text" value={stepForm.icon} onChange={e => setStepForm({ ...stepForm, icon: e.target.value })} className={inputClass} placeholder="📝" /></FormField>
              <FormField label="Sort Order"><input type="number" value={stepForm.order} onChange={e => setStepForm({ ...stepForm, order: Number(e.target.value) })} className={inputClass} /></FormField>
              <FormField label="Required"><select value={stepForm.required ? 'true' : 'false'} onChange={e => setStepForm({ ...stepForm, required: e.target.value === 'true' })} className={inputClass}><option value="false">Optional</option><option value="true">Required</option></select></FormField>
            </div>
            <FormField label="Enabled"><select value={stepForm.enabled ? 'true' : 'false'} onChange={e => setStepForm({ ...stepForm, enabled: e.target.value === 'true' })} className={inputClass}><option value="true">Yes</option><option value="false">No</option></select></FormField>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90">{editingStep ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setStepModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50">Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
