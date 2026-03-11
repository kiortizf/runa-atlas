import { useState, useEffect } from 'react';
import {
  PenTool, Save, ChevronDown, ChevronRight, AlertCircle,
  Settings, Zap, Target, Calendar, Rocket, BookOpen,
  FileText, BarChart3, Users, Award, Shield, Clock
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

// ─── Types ──────────────────────────────────────
interface AuthorToolsSettings {
  id: string;
  // Creator Studio
  creatorStudioEnabled: boolean;
  maxDraftsPerAuthor: number;
  autoSaveIntervalSeconds: number;
  exportFormats: string[];
  // Forge Editor
  forgeEditorEnabled: boolean;
  spellcheckEnabled: boolean;
  grammarSuggestionsEnabled: boolean;
  focusModeEnabled: boolean;
  versionHistoryDays: number;
  maxFileUploadMB: number;
  // Writing Goals
  writingGoalsEnabled: boolean;
  defaultDailyWordGoal: number;
  defaultWeeklyWordGoal: number;
  streakBonusEnabled: boolean;
  leaderboardEnabled: boolean;
  // Launch Planner
  launchPlannerEnabled: boolean;
  defaultLaunchLeadTimeDays: number;
  socialMediaIntegration: boolean;
  arcDeadlineDefault: number;
  // ARC Manager
  arcManagerEnabled: boolean;
  maxArcReaders: number;
  arcNDARequired: boolean;
  arcAutoReminder: boolean;
  arcReminderDaysBefore: number;
  // Submission Tracker
  submissionTrackerEnabled: boolean;
  maxActiveSubmissions: number;
  autoFollowUpDays: number;
}

// ─── Panel ──────────────────────────────────────
function Panel({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0"><Icon className="w-4.5 h-4.5 text-emerald-400" /></div>
        <h3 className="font-heading text-lg text-text-primary flex-1">{title}</h3>
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

export default function AdminAuthorTools() {
  const [settings, setSettings] = useState<AuthorToolsSettings>({
    id: 'main',
    creatorStudioEnabled: true, maxDraftsPerAuthor: 20, autoSaveIntervalSeconds: 30,
    exportFormats: ['EPUB', 'PDF', 'DOCX', 'Markdown'],
    forgeEditorEnabled: true, spellcheckEnabled: true, grammarSuggestionsEnabled: true,
    focusModeEnabled: true, versionHistoryDays: 90, maxFileUploadMB: 50,
    writingGoalsEnabled: true, defaultDailyWordGoal: 1000, defaultWeeklyWordGoal: 5000,
    streakBonusEnabled: true, leaderboardEnabled: true,
    launchPlannerEnabled: true, defaultLaunchLeadTimeDays: 90, socialMediaIntegration: false,
    arcDeadlineDefault: 30,
    arcManagerEnabled: true, maxArcReaders: 30, arcNDARequired: false,
    arcAutoReminder: true, arcReminderDaysBefore: 7,
    submissionTrackerEnabled: true, maxActiveSubmissions: 10, autoFollowUpDays: 30,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'author_tools_settings'), (snap) => {
      if (snap.docs.length > 0) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as AuthorToolsSettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'author_tools_settings'));
    return unsub;
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'author_tools_settings', settings.id), { ...settings, updatedAt: serverTimestamp() });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'author_tools_settings'); }
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><PenTool className="w-6 h-6 text-emerald-400" /></div>
        <div><h2 className="font-heading text-2xl text-text-primary">Author Tools</h2><p className="font-ui text-text-secondary text-sm">Configure Creator Studio, Forge Editor, Writing Goals, Launch Planner, ARC Manager, and Submission Tracker.</p></div>
      </div>

      {/* Feature Toggles */}
      <Panel title="Feature Toggles" icon={Zap} defaultOpen>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {([
            { key: 'creatorStudioEnabled', label: 'Creator Studio', desc: 'Main author dashboard' },
            { key: 'forgeEditorEnabled', label: 'Forge Editor', desc: 'In-app manuscript editor' },
            { key: 'writingGoalsEnabled', label: 'Writing Goals', desc: 'Daily/weekly word targets' },
            { key: 'launchPlannerEnabled', label: 'Launch Planner', desc: 'Pre-launch campaign builder' },
            { key: 'arcManagerEnabled', label: 'ARC Manager', desc: 'Advance review copies' },
            { key: 'submissionTrackerEnabled', label: 'Submission Tracker', desc: 'Query tracking dashboard' },
          ] as const).map(feat => (
            <label key={feat.key} className="flex items-start gap-3 p-3 bg-surface-elevated border border-border/50 rounded-xl cursor-pointer hover:border-emerald-500/30 transition-all">
              <input type="checkbox" checked={(settings as any)[feat.key]} onChange={e => setSettings({ ...settings, [feat.key]: e.target.checked })} className="accent-starforge-gold mt-1" />
              <div><span className="text-sm text-text-primary block">{feat.label}</span><span className="text-[10px] text-text-muted">{feat.desc}</span></div>
            </label>
          ))}
        </div>
      </Panel>

      {/* Creator Studio */}
      <Panel title="Creator Studio" icon={PenTool}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Max Drafts per Author</label><input type="number" min="1" max="100" value={settings.maxDraftsPerAuthor} onChange={e => setSettings({ ...settings, maxDraftsPerAuthor: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Auto-Save Interval (seconds)</label><input type="number" min="5" max="300" value={settings.autoSaveIntervalSeconds} onChange={e => setSettings({ ...settings, autoSaveIntervalSeconds: Number(e.target.value) })} className={inputClass} /></div>
          </div>
          <div className="bg-surface-elevated border border-border/30 rounded-xl p-3">
            <p className="font-ui text-xs text-text-muted mb-2 uppercase tracking-wider">Export Formats</p>
            <div className="flex flex-wrap gap-2">{settings.exportFormats.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-surface border border-border/30 rounded-lg px-2.5 py-1 text-xs text-text-primary font-mono">{f}</span>
            ))}</div>
          </div>
        </div>
      </Panel>

      {/* Forge Editor */}
      <Panel title="Forge Editor" icon={FileText}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Version History (days)</label><input type="number" min="7" max="365" value={settings.versionHistoryDays} onChange={e => setSettings({ ...settings, versionHistoryDays: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Max Upload Size (MB)</label><input type="number" min="1" max="200" value={settings.maxFileUploadMB} onChange={e => setSettings({ ...settings, maxFileUploadMB: Number(e.target.value) })} className={inputClass} /></div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.spellcheckEnabled} onChange={e => setSettings({ ...settings, spellcheckEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Spellcheck</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.grammarSuggestionsEnabled} onChange={e => setSettings({ ...settings, grammarSuggestionsEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Grammar suggestions</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.focusModeEnabled} onChange={e => setSettings({ ...settings, focusModeEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Focus/zen mode</span></label>
          </div>
        </div>
      </Panel>

      {/* Writing Goals */}
      <Panel title="Writing Goals" icon={Target}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Default Daily Word Goal</label><input type="number" min="100" max="10000" value={settings.defaultDailyWordGoal} onChange={e => setSettings({ ...settings, defaultDailyWordGoal: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Default Weekly Word Goal</label><input type="number" min="500" max="50000" value={settings.defaultWeeklyWordGoal} onChange={e => setSettings({ ...settings, defaultWeeklyWordGoal: Number(e.target.value) })} className={inputClass} /></div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.streakBonusEnabled} onChange={e => setSettings({ ...settings, streakBonusEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Streak bonuses (badges, rewards)</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.leaderboardEnabled} onChange={e => setSettings({ ...settings, leaderboardEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Community leaderboard</span></label>
          </div>
        </div>
      </Panel>

      {/* Launch Planner */}
      <Panel title="Launch Planner" icon={Rocket}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Default Lead Time (days)</label><input type="number" min="14" max="365" value={settings.defaultLaunchLeadTimeDays} onChange={e => setSettings({ ...settings, defaultLaunchLeadTimeDays: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">ARC Deadline Default (days)</label><input type="number" min="7" max="90" value={settings.arcDeadlineDefault} onChange={e => setSettings({ ...settings, arcDeadlineDefault: Number(e.target.value) })} className={inputClass} /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.socialMediaIntegration} onChange={e => setSettings({ ...settings, socialMediaIntegration: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Social media integration (auto-post on launch milestones)</span></label>
        </div>
      </Panel>

      {/* ARC Manager */}
      <Panel title="ARC Manager" icon={Award}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Max ARC Readers per Title</label><input type="number" min="1" max="100" value={settings.maxArcReaders} onChange={e => setSettings({ ...settings, maxArcReaders: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Reminder Days Before Deadline</label><input type="number" min="1" max="14" value={settings.arcReminderDaysBefore} onChange={e => setSettings({ ...settings, arcReminderDaysBefore: Number(e.target.value) })} className={inputClass} /></div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.arcNDARequired} onChange={e => setSettings({ ...settings, arcNDARequired: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Require NDA</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.arcAutoReminder} onChange={e => setSettings({ ...settings, arcAutoReminder: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Auto-send deadline reminders</span></label>
          </div>
        </div>
      </Panel>

      {/* Submission Tracker */}
      <Panel title="Submission Tracker" icon={BarChart3}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Max Active Submissions</label><input type="number" min="1" max="50" value={settings.maxActiveSubmissions} onChange={e => setSettings({ ...settings, maxActiveSubmissions: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Auto Follow-Up (days)</label><input type="number" min="7" max="90" value={settings.autoFollowUpDays} onChange={e => setSettings({ ...settings, autoFollowUpDays: Number(e.target.value) })} className={inputClass} /></div>
          </div>
        </div>
      </Panel>

      {/* Save */}
      <button onClick={saveSettings} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${saved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}><Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save All Settings'}</button>
    </div>
  );
}
