import { useState, useEffect } from 'react';
import {
  Sparkles, Plus, Edit2, Trash2, Save, ChevronDown, ChevronRight, AlertCircle,
  Compass, Shield, BookOpen, Heart, Eye, Bookmark, BarChart3,
  Settings, Zap, Target, Award, Palette
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import AdminModal, { FormSection, FormField } from './AdminModal';

// ─── Types ──────────────────────────────────────
interface MoodAxis {
  id: string;
  axisId: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftIcon: string;
  rightIcon: string;
  enabled: boolean;
  order: number;
}

interface MoodPreset {
  id: string;
  label: string;
  emoji: string;
  values: Record<string, number>;
  enabled: boolean;
  order: number;
}

interface ContentWarningCategory {
  id: string;
  categoryId: string;
  label: string;
  icon: string;
  color: string;
  enabled: boolean;
  order: number;
}

interface ReaderToolsSettings {
  id: string;
  moodMatcherEnabled: boolean;
  bookDnaEnabled: boolean;
  compatibilityEnabled: boolean;
  spoilerShieldEnabled: boolean;
  wrappedEnabled: boolean;
  passagesEnabled: boolean;
  compassEnabled: boolean;
  wrappedPeriod: string;
  wrappedDesignTheme: string;
  compassRequireVerification: boolean;
  compassMinVerifiers: number;
  spoilerShieldDefaultMode: string;
  passageMaxPerUser: number;
}

// ─── Panel ──────────────────────────────────────
function Panel({ title, icon: Icon, badge, children, defaultOpen = false }: {
  title: string; icon: any; badge?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 flex-shrink-0"><Icon className="w-4.5 h-4.5 text-violet-400" /></div>
        <h3 className="font-heading text-lg text-text-primary flex-1">{title}</h3>
        {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border/50 text-text-muted">{badge}</span>}
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

export default function AdminReaderTools() {
  const [moodAxes, setMoodAxes] = useState<MoodAxis[]>([]);
  const [presets, setPresets] = useState<MoodPreset[]>([]);
  const [warningCats, setWarningCats] = useState<ContentWarningCategory[]>([]);
  const [settings, setSettings] = useState<ReaderToolsSettings>({
    id: 'main', moodMatcherEnabled: true, bookDnaEnabled: true, compatibilityEnabled: true,
    spoilerShieldEnabled: true, wrappedEnabled: true, passagesEnabled: true, compassEnabled: true,
    wrappedPeriod: 'yearly', wrappedDesignTheme: 'cosmic', compassRequireVerification: true,
    compassMinVerifiers: 3, spoilerShieldDefaultMode: 'safe', passageMaxPerUser: 50,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [axisModal, setAxisModal] = useState(false);
  const [editingAxis, setEditingAxis] = useState<MoodAxis | null>(null);
  const [axisForm, setAxisForm] = useState<Partial<MoodAxis>>({ axisId: '', label: '', leftLabel: '', rightLabel: '', leftIcon: 'Sun', rightIcon: 'Moon', enabled: true, order: 0 });
  const [presetModal, setPresetModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<MoodPreset | null>(null);
  const [presetForm, setPresetForm] = useState<Partial<MoodPreset>>({ label: '', emoji: '', values: {}, enabled: true, order: 0 });

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'mood_axes'), (snap) => {
      setMoodAxes(snap.docs.map(d => ({ id: d.id, ...d.data() } as MoodAxis)).sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'mood_axes')));
    unsubs.push(onSnapshot(collection(db, 'mood_presets'), (snap) => {
      setPresets(snap.docs.map(d => ({ id: d.id, ...d.data() } as MoodPreset)).sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'mood_presets')));
    unsubs.push(onSnapshot(collection(db, 'content_warning_categories'), (snap) => {
      setWarningCats(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentWarningCategory)).sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'content_warning_categories')));
    unsubs.push(onSnapshot(collection(db, 'reader_tools_settings'), (snap) => {
      if (snap.docs.length > 0) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as ReaderToolsSettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reader_tools_settings')));
    return () => unsubs.forEach(u => u());
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'reader_tools_settings', settings.id), { ...settings, updatedAt: serverTimestamp() });
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'reader_tools_settings'); }
  };

  const saveAxis = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { axisId: axisForm.axisId, label: axisForm.label, leftLabel: axisForm.leftLabel, rightLabel: axisForm.rightLabel, leftIcon: axisForm.leftIcon, rightIcon: axisForm.rightIcon, enabled: axisForm.enabled ?? true, order: axisForm.order ?? 0 };
      if (editingAxis) await setDoc(doc(db, 'mood_axes', editingAxis.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'mood_axes')), { ...data, createdAt: serverTimestamp() });
      setAxisModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'mood_axes'); }
  };

  const savePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { label: presetForm.label, emoji: presetForm.emoji, values: presetForm.values, enabled: presetForm.enabled ?? true, order: presetForm.order ?? 0 };
      if (editingPreset) await setDoc(doc(db, 'mood_presets', editingPreset.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'mood_presets')), { ...data, createdAt: serverTimestamp() });
      setPresetModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'mood_presets'); }
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20"><Sparkles className="w-6 h-6 text-violet-400" /></div>
        <div><h2 className="font-heading text-2xl text-text-primary">Reader Tools</h2><p className="font-ui text-text-secondary text-sm">Configure Mood Matcher, Book DNA, Compatibility, Spoiler Shield, Wrapped, Passages & Content Compass.</p></div>
      </div>

      {/* Feature Toggles */}
      <Panel title="Feature Toggles" icon={Zap} defaultOpen>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([
            { key: 'moodMatcherEnabled', label: 'Mood Matcher', desc: 'Feelings-first book discovery' },
            { key: 'bookDnaEnabled', label: 'Book DNA', desc: 'Taste profile analysis' },
            { key: 'compatibilityEnabled', label: 'Reader Compatibility', desc: 'Social matching' },
            { key: 'spoilerShieldEnabled', label: 'Spoiler Shield', desc: 'Spoiler protection' },
            { key: 'wrappedEnabled', label: 'Reading Wrapped', desc: 'Year-in-review stats' },
            { key: 'passagesEnabled', label: 'Passage Collections', desc: 'Curated excerpts' },
            { key: 'compassEnabled', label: 'Content Compass', desc: 'Content warnings' },
          ] as const).map(feat => (
            <label key={feat.key} className="flex items-start gap-3 p-3 bg-surface-elevated border border-border/50 rounded-xl cursor-pointer hover:border-violet-500/30 transition-all">
              <input type="checkbox" checked={(settings as any)[feat.key]} onChange={e => setSettings({ ...settings, [feat.key]: e.target.checked })} className="accent-starforge-gold mt-1" />
              <div><span className="text-sm text-text-primary block">{feat.label}</span><span className="text-[10px] text-text-muted">{feat.desc}</span></div>
            </label>
          ))}
        </div>
      </Panel>

      {/* Mood Matcher Axes */}
      <Panel title="Mood Matcher — Axes" icon={Palette} badge={`${moodAxes.length} axes`}>
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <p className="font-ui text-xs text-text-muted">Sliders users adjust to find books.</p>
            <button onClick={() => { setEditingAxis(null); setAxisForm({ axisId: '', label: '', leftLabel: '', rightLabel: '', leftIcon: 'Sun', rightIcon: 'Moon', enabled: true, order: moodAxes.length }); setAxisModal(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-starforge-gold text-void-black rounded-xl font-ui text-sm font-medium hover:bg-starforge-gold/90"><Plus className="w-3.5 h-3.5" /> Add Axis</button>
          </div>
          {moodAxes.length === 0 && <div className="text-center py-6 text-text-muted text-sm"><AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />Hardcoded defaults will be used.</div>}
          {moodAxes.map(a => (
            <div key={a.id} className={`flex items-center gap-4 bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 ${!a.enabled ? 'opacity-50' : ''}`}>
              <span className="font-mono text-xs text-text-muted w-6 text-center">{a.order}</span>
              <span className="font-heading text-sm text-text-primary w-28">{a.label}</span>
              <span className="text-xs text-text-muted flex-1">{a.leftLabel} ← → {a.rightLabel}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditingAxis(a); setAxisForm(a); setAxisModal(true); }} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={async () => { if (window.confirm('Delete?')) { try { await deleteDoc(doc(db, 'mood_axes', a.id)); } catch (err) { handleFirestoreError(err, OperationType.DELETE, 'mood_axes'); } } }} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Mood Presets */}
      <Panel title="Mood Matcher — Quick Presets" icon={Sparkles} badge={`${presets.length} presets`}>
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <p className="font-ui text-xs text-text-muted">One-click mood shortcuts for users.</p>
            <button onClick={() => { setEditingPreset(null); setPresetForm({ label: '', emoji: '', values: {}, enabled: true, order: presets.length }); setPresetModal(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-starforge-gold text-void-black rounded-xl font-ui text-sm font-medium hover:bg-starforge-gold/90"><Plus className="w-3.5 h-3.5" /> Add Preset</button>
          </div>
          {presets.length === 0 && <div className="text-center py-6 text-text-muted text-sm"><AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />Hardcoded defaults will be used.</div>}
          {presets.map(p => (
            <div key={p.id} className={`flex items-center gap-3 bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 ${!p.enabled ? 'opacity-50' : ''}`}>
              <span className="text-xl">{p.emoji}</span>
              <span className="font-heading text-sm text-text-primary flex-1">{p.label}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditingPreset(p); setPresetForm(p); setPresetModal(true); }} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={async () => { if (window.confirm('Delete?')) { try { await deleteDoc(doc(db, 'mood_presets', p.id)); } catch (err) { handleFirestoreError(err, OperationType.DELETE, 'mood_presets'); } } }} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Content Compass */}
      <Panel title="Content Compass — Warning Categories" icon={Compass}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Min. Verifiers Required</label><input type="number" min="1" max="20" value={settings.compassMinVerifiers} onChange={e => setSettings({ ...settings, compassMinVerifiers: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Default Spoiler Mode</label><select value={settings.spoilerShieldDefaultMode} onChange={e => setSettings({ ...settings, spoilerShieldDefaultMode: e.target.value })} className={inputClass}><option value="safe">Safe (hide spoilers)</option><option value="spoiler">Spoiler (show all)</option></select></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.compassRequireVerification} onChange={e => setSettings({ ...settings, compassRequireVerification: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Require community verification before publishing warnings</span></label>
        </div>
      </Panel>

      {/* Wrapped & Passages */}
      <Panel title="Wrapped & Passages Config" icon={Award}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Wrapped Period</label><select value={settings.wrappedPeriod} onChange={e => setSettings({ ...settings, wrappedPeriod: e.target.value })} className={inputClass}><option value="yearly">Yearly</option><option value="quarterly">Quarterly</option><option value="monthly">Monthly</option></select></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Wrapped Theme</label><select value={settings.wrappedDesignTheme} onChange={e => setSettings({ ...settings, wrappedDesignTheme: e.target.value })} className={inputClass}><option value="cosmic">Cosmic</option><option value="aurora">Aurora</option><option value="ember">Ember</option><option value="midnight">Midnight</option></select></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Max Passages per User</label><input type="number" min="1" value={settings.passageMaxPerUser} onChange={e => setSettings({ ...settings, passageMaxPerUser: Number(e.target.value) })} className={inputClass} /></div>
          </div>
        </div>
      </Panel>

      {/* Save All */}
      <button onClick={saveSettings} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${settingsSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}><Save className="w-4 h-4" />{settingsSaved ? 'Saved!' : 'Save All Settings'}</button>

      {/* Axis Modal */}
      <AdminModal isOpen={axisModal} onClose={() => setAxisModal(false)} title={editingAxis ? 'Edit Mood Axis' : 'Add Mood Axis'}>
        <form onSubmit={saveAxis} className="space-y-6">
          <FormSection title="Axis Details">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Axis Key"><input type="text" required value={axisForm.axisId} onChange={e => setAxisForm({ ...axisForm, axisId: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className={`${inputClass} font-mono`} placeholder="e.g. darkness" /></FormField>
              <FormField label="Label"><input type="text" required value={axisForm.label} onChange={e => setAxisForm({ ...axisForm, label: e.target.value })} className={inputClass} placeholder="e.g. Tone" /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Left Label"><input type="text" required value={axisForm.leftLabel} onChange={e => setAxisForm({ ...axisForm, leftLabel: e.target.value })} className={inputClass} placeholder="e.g. Light & Hopeful" /></FormField>
              <FormField label="Right Label"><input type="text" required value={axisForm.rightLabel} onChange={e => setAxisForm({ ...axisForm, rightLabel: e.target.value })} className={inputClass} placeholder="e.g. Dark & Haunting" /></FormField>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Sort Order"><input type="number" value={axisForm.order} onChange={e => setAxisForm({ ...axisForm, order: Number(e.target.value) })} className={inputClass} /></FormField>
              <FormField label="Enabled"><select value={axisForm.enabled ? 'true' : 'false'} onChange={e => setAxisForm({ ...axisForm, enabled: e.target.value === 'true' })} className={inputClass}><option value="true">Yes</option><option value="false">No</option></select></FormField>
            </div>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest">{editingAxis ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setAxisModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50">Cancel</button>
          </div>
        </form>
      </AdminModal>

      {/* Preset Modal */}
      <AdminModal isOpen={presetModal} onClose={() => setPresetModal(false)} title={editingPreset ? 'Edit Preset' : 'Add Preset'}>
        <form onSubmit={savePreset} className="space-y-6">
          <FormSection title="Preset Details">
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Label"><input type="text" required value={presetForm.label} onChange={e => setPresetForm({ ...presetForm, label: e.target.value })} className={inputClass} placeholder="e.g. Haunt me" /></FormField>
              <FormField label="Emoji"><input type="text" required value={presetForm.emoji} onChange={e => setPresetForm({ ...presetForm, emoji: e.target.value })} className={inputClass} placeholder="👻" /></FormField>
              <FormField label="Sort Order"><input type="number" value={presetForm.order} onChange={e => setPresetForm({ ...presetForm, order: Number(e.target.value) })} className={inputClass} /></FormField>
            </div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={presetForm.enabled} onChange={e => setPresetForm({ ...presetForm, enabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Enabled</span></label>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest">{editingPreset ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setPresetModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50">Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
