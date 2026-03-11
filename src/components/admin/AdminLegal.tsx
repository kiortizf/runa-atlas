import { useState, useEffect } from 'react';
import {
  Scale, Save, ChevronDown, ChevronRight, Eye, AlertCircle,
  Shield, FileText, Newspaper, Globe2, Lock
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

// ─── Types ──────────────────────────────────────
interface LegalPage {
  id: string;
  slug: string;
  title: string;
  lastUpdated: string;
  content: string;
  enabled: boolean;
}

interface LegalSettings {
  id: string;
  cookieBannerEnabled: boolean;
  cookieBannerText: string;
  gdprEnabled: boolean;
  dataRetentionDays: number;
  rightToDeleteEnabled: boolean;
}

// ─── Panel ──────────────────────────────────────
function Panel({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 flex-shrink-0"><Icon className="w-4.5 h-4.5 text-rose-400" /></div>
        <h3 className="font-heading text-lg text-text-primary flex-1">{title}</h3>
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

const LEGAL_PAGES = [
  { slug: 'privacy', title: 'Privacy Policy', icon: '🔒' },
  { slug: 'terms', title: 'Terms of Service', icon: '📋' },
  { slug: 'accessibility', title: 'Accessibility Statement', icon: '♿' },
  { slug: 'rights', title: 'Foreign Rights', icon: '🌐' },
  { slug: 'press', title: 'Press Kit', icon: '📰' },
];

export default function AdminLegal() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [settings, setSettings] = useState<LegalSettings>({
    id: 'main', cookieBannerEnabled: true,
    cookieBannerText: 'We use cookies to improve your experience. By continuing, you agree to our Privacy Policy.',
    gdprEnabled: true, dataRetentionDays: 730, rightToDeleteEnabled: true,
  });
  const [activeSlug, setActiveSlug] = useState('privacy');
  const [saved, setSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'legal_pages'), (snap) => {
      setPages(snap.docs.map(d => ({ id: d.id, ...d.data() } as LegalPage)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'legal_pages')));
    unsubs.push(onSnapshot(collection(db, 'legal_settings'), (snap) => {
      if (snap.docs.length > 0) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as LegalSettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'legal_settings')));
    return () => unsubs.forEach(u => u());
  }, []);

  const getPage = (slug: string): LegalPage | undefined => pages.find(p => p.slug === slug);

  const savePage = async (slug: string, data: Partial<LegalPage>) => {
    try {
      const existing = getPage(slug);
      const doc_id = existing?.id || slug;
      await setDoc(doc(db, 'legal_pages', doc_id), { slug, ...data, updatedAt: serverTimestamp() }, { merge: true });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'legal_pages'); }
  };

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, 'legal_settings', settings.id), { ...settings, updatedAt: serverTimestamp() });
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'legal_settings'); }
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';
  const activeDef = LEGAL_PAGES.find(p => p.slug === activeSlug)!;
  const activePage = getPage(activeSlug);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20"><Scale className="w-6 h-6 text-rose-400" /></div>
        <div><h2 className="font-heading text-2xl text-text-primary">Legal & Text Pages</h2><p className="font-ui text-text-secondary text-sm">Edit Privacy, Terms, Accessibility, Foreign Rights, and Press Kit content.</p></div>
      </div>

      {/* Page Selector */}
      <div className="flex gap-2 flex-wrap">
        {LEGAL_PAGES.map(p => (
          <button key={p.slug} onClick={() => setActiveSlug(p.slug)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui text-sm border transition-all ${activeSlug === p.slug ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-surface border-border/50 text-text-secondary hover:border-border'}`}>
            <span>{p.icon}</span> {p.title}
          </button>
        ))}
      </div>

      {/* Page Content Editor */}
      <Panel title={`${activeDef.icon} ${activeDef.title}`} icon={FileText} defaultOpen>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Page Title</label><input type="text" value={activePage?.title || activeDef.title} onChange={e => savePage(activeSlug, { title: e.target.value })} className={inputClass} /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Last Updated Label</label><input type="text" value={activePage?.lastUpdated || ''} onChange={e => savePage(activeSlug, { lastUpdated: e.target.value })} className={inputClass} placeholder="e.g. October 2026" /></div>
          </div>
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Content (Markdown supported)</label>
            <textarea value={activePage?.content || ''}
              onChange={e => {
                const existing = getPage(activeSlug);
                if (existing) { setPages(pages.map(p => p.slug === activeSlug ? { ...p, content: e.target.value } : p)); }
                else { setPages([...pages, { id: activeSlug, slug: activeSlug, title: activeDef.title, lastUpdated: '', content: e.target.value, enabled: true }]); }
              }}
              className={`${inputClass} h-64 resize-y font-mono text-sm`}
              placeholder={`Enter the full content for the ${activeDef.title} page. You can use Markdown formatting:\n\n## Section Header\nParagraph text...\n\n### Subsection\n- Bullet points\n- More details`}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={activePage?.enabled ?? true} onChange={e => savePage(activeSlug, { enabled: e.target.checked })} className="accent-starforge-gold" />
              <span className="text-sm text-text-secondary">Published (visible to visitors)</span>
            </label>
            <button onClick={() => savePage(activeSlug, { content: activePage?.content || '', title: activePage?.title || activeDef.title, lastUpdated: activePage?.lastUpdated || '', enabled: activePage?.enabled ?? true })}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${saved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}><Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save Page'}</button>
          </div>
        </div>
      </Panel>

      {/* Cookie & GDPR Settings */}
      <Panel title="Cookie Banner & GDPR" icon={Lock}>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={settings.cookieBannerEnabled} onChange={e => setSettings({ ...settings, cookieBannerEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Show cookie consent banner</span></label>
          <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Banner Text</label><textarea value={settings.cookieBannerText} onChange={e => setSettings({ ...settings, cookieBannerText: e.target.value })} className={`${inputClass} h-16 resize-none`} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2"><input type="checkbox" checked={settings.gdprEnabled} onChange={e => setSettings({ ...settings, gdprEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">GDPR compliance mode</span></label>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2"><input type="checkbox" checked={settings.rightToDeleteEnabled} onChange={e => setSettings({ ...settings, rightToDeleteEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Enable right to delete (account self-deletion)</span></label>
            </div>
          </div>
          <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Data Retention Period (days)</label><input type="number" min="30" value={settings.dataRetentionDays} onChange={e => setSettings({ ...settings, dataRetentionDays: Number(e.target.value) })} className={inputClass} /></div>
          <button onClick={saveSettings} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${settingsSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}><Save className="w-4 h-4" />{settingsSaved ? 'Saved!' : 'Save GDPR Settings'}</button>
        </div>
      </Panel>
    </div>
  );
}
