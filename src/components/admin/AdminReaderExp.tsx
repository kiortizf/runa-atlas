import { useState, useEffect } from 'react';
import {
  BookOpen, Save, ChevronDown, ChevronRight,
  Settings, Eye, Lock, Volume2, Type, Palette,
  Layout, Monitor, Bookmark, Clock, Moon
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

// ─── Types ──────────────────────────────────────
interface ReaderExpSettings {
  id: string;
  // Book Reader
  readerEnabled: boolean;
  defaultFontFamily: string;
  defaultFontSize: number;
  nightModeEnabled: boolean;
  sepiaEnabled: boolean;
  textToSpeechEnabled: boolean;
  highlightingEnabled: boolean;
  annotationsEnabled: boolean;
  readingProgressSync: boolean;
  scrollMode: 'paginated' | 'scroll';
  marginSize: 'compact' | 'comfortable' | 'wide';
  // Library
  libraryEnabled: boolean;
  shelvesMaxPerUser: number;
  readingListMaxBooks: number;
  readingStatsEnabled: boolean;
  recommendationsEnabled: boolean;
  socialSharingEnabled: boolean;
  // Auth / Portal
  portalEnabled: boolean;
  emailSignupEnabled: boolean;
  googleAuthEnabled: boolean;
  guestBrowsingEnabled: boolean;
  sessionTimeoutMinutes: number;
  requireEmailVerification: boolean;
  loginPageMessage: string;
}

// ─── Panel ──────────────────────────────────────
function Panel({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0"><Icon className="w-4.5 h-4.5 text-blue-400" /></div>
        <h3 className="font-heading text-lg text-text-primary flex-1">{title}</h3>
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

export default function AdminReaderExp() {
  const [settings, setSettings] = useState<ReaderExpSettings>({
    id: 'main',
    readerEnabled: true, defaultFontFamily: 'Georgia', defaultFontSize: 18,
    nightModeEnabled: true, sepiaEnabled: true, textToSpeechEnabled: false,
    highlightingEnabled: true, annotationsEnabled: true, readingProgressSync: true,
    scrollMode: 'paginated', marginSize: 'comfortable',
    libraryEnabled: true, shelvesMaxPerUser: 20, readingListMaxBooks: 200,
    readingStatsEnabled: true, recommendationsEnabled: true, socialSharingEnabled: true,
    portalEnabled: true, emailSignupEnabled: true, googleAuthEnabled: true,
    guestBrowsingEnabled: true, sessionTimeoutMinutes: 1440,
    requireEmailVerification: true, loginPageMessage: 'Welcome to the Rüna Atlas universe.',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reader_exp_settings'), (snap) => {
      if (snap.docs.length > 0) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as ReaderExpSettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reader_exp_settings'));
    return unsub;
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'reader_exp_settings', settings.id), { ...settings, updatedAt: serverTimestamp() });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'reader_exp_settings'); }
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><BookOpen className="w-6 h-6 text-blue-400" /></div>
        <div><h2 className="font-heading text-2xl text-text-primary">Reader Experience</h2><p className="font-ui text-text-secondary text-sm">Configure the book reader, library, and authentication settings.</p></div>
      </div>

      {/* Book Reader */}
      <Panel title="Book Reader" icon={Eye} defaultOpen>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.readerEnabled} onChange={e => setSettings({ ...settings, readerEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Enable in-app book reader</span></label>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Default Font</label><select value={settings.defaultFontFamily} onChange={e => setSettings({ ...settings, defaultFontFamily: e.target.value })} className={inputClass}><option value="Georgia">Georgia (Serif)</option><option value="Inter">Inter (Sans)</option><option value="Merriweather">Merriweather (Serif)</option><option value="Lora">Lora (Serif)</option><option value="OpenDyslexic">OpenDyslexic</option></select></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Default Font Size (px)</label><input type="number" min="12" max="32" value={settings.defaultFontSize} onChange={e => setSettings({ ...settings, defaultFontSize: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Scroll Mode</label><select value={settings.scrollMode} onChange={e => setSettings({ ...settings, scrollMode: e.target.value as any })} className={inputClass}><option value="paginated">Paginated</option><option value="scroll">Continuous Scroll</option></select></div>
          </div>
          <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Margin Size</label><select value={settings.marginSize} onChange={e => setSettings({ ...settings, marginSize: e.target.value as any })} className={inputClass}><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="wide">Wide</option></select></div>
          <div className="flex flex-wrap gap-4">
            {([
              { key: 'nightModeEnabled', label: 'Night mode' },
              { key: 'sepiaEnabled', label: 'Sepia mode' },
              { key: 'textToSpeechEnabled', label: 'Text-to-speech' },
              { key: 'highlightingEnabled', label: 'Highlighting' },
              { key: 'annotationsEnabled', label: 'Annotations' },
              { key: 'readingProgressSync', label: 'Cross-device progress sync' },
            ] as const).map(feat => (
              <label key={feat.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(settings as any)[feat.key]} onChange={e => setSettings({ ...settings, [feat.key]: e.target.checked })} className="accent-starforge-gold" />
                <span className="text-sm text-text-secondary">{feat.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Panel>

      {/* Library */}
      <Panel title="Library & Collections" icon={Bookmark}>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.libraryEnabled} onChange={e => setSettings({ ...settings, libraryEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Enable personal library</span></label>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Max Shelves per User</label><input type="number" min="1" max="50" value={settings.shelvesMaxPerUser} onChange={e => setSettings({ ...settings, shelvesMaxPerUser: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Max Books in Reading List</label><input type="number" min="10" max="500" value={settings.readingListMaxBooks} onChange={e => setSettings({ ...settings, readingListMaxBooks: Number(e.target.value) })} className={inputClass} /></div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.readingStatsEnabled} onChange={e => setSettings({ ...settings, readingStatsEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Reading statistics</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.recommendationsEnabled} onChange={e => setSettings({ ...settings, recommendationsEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Personalized recommendations</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.socialSharingEnabled} onChange={e => setSettings({ ...settings, socialSharingEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Social sharing</span></label>
          </div>
        </div>
      </Panel>

      {/* Auth / Portal */}
      <Panel title="Auth & Portal" icon={Lock}>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.portalEnabled} onChange={e => setSettings({ ...settings, portalEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Enable portal (login/signup page)</span></label>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Session Timeout (minutes)</label><input type="number" min="30" max="10080" value={settings.sessionTimeoutMinutes} onChange={e => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Login Page Message</label><input type="text" value={settings.loginPageMessage} onChange={e => setSettings({ ...settings, loginPageMessage: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.emailSignupEnabled} onChange={e => setSettings({ ...settings, emailSignupEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Email signup</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.googleAuthEnabled} onChange={e => setSettings({ ...settings, googleAuthEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Google sign-in</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.guestBrowsingEnabled} onChange={e => setSettings({ ...settings, guestBrowsingEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Guest browsing</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.requireEmailVerification} onChange={e => setSettings({ ...settings, requireEmailVerification: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Require email verification</span></label>
          </div>
        </div>
      </Panel>

      {/* Save */}
      <button onClick={saveSettings} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${saved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}><Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save All Settings'}</button>
    </div>
  );
}
