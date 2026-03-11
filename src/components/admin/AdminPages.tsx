import { useState, useEffect } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Save, ChevronDown, ChevronRight, AlertCircle,
  Globe, Users, BookOpen, Mail, Info, Eye, EyeOff
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import AdminModal, { FormSection, FormField } from './AdminModal';

// ─── Types ──────────────────────────────────────
interface PageSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string;
  body: string;
  buttonLabel: string;
  buttonLink: string;
  imageUrl: string;
  enabled: boolean;
  order: number;
}

interface PageConfig {
  id: string;
  pageSlug: string;
  pageTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
  enabled: boolean;
  sections: PageSection[];
}

interface ContactSettings {
  id: string;
  recipientEmail: string;
  notifySlack: boolean;
  autoReplyEnabled: boolean;
  autoReplyMessage: string;
  mapEmbedEnabled: boolean;
  address: string;
  phone: string;
}

// ─── Panel ──────────────────────────────────────
function Panel({ title, icon: Icon, badge, children, defaultOpen = false }: {
  title: string; icon: any; badge?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-surface-elevated/50 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-aurora-teal/10 flex items-center justify-center border border-aurora-teal/20 flex-shrink-0"><Icon className="w-4.5 h-4.5 text-aurora-teal" /></div>
        <h3 className="font-heading text-lg text-text-primary flex-1">{title}</h3>
        {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border/50 text-text-muted">{badge}</span>}
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

const PAGES = [
  { slug: 'for-authors', label: 'For Authors', icon: '✍️' },
  { slug: 'for-readers', label: 'For Readers', icon: '📖' },
  { slug: 'for-beta-readers', label: 'For Beta Readers', icon: '🔍' },
  { slug: 'about', label: 'About', icon: '🏛️' },
];

export default function AdminPages() {
  const [pages, setPages] = useState<PageConfig[]>([]);
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    id: 'main', recipientEmail: '', notifySlack: false, autoReplyEnabled: true,
    autoReplyMessage: 'Thank you for contacting Rüna Atlas Press. We\'ll respond within 48 hours.',
    mapEmbedEnabled: false, address: '', phone: '',
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [sectionModal, setSectionModal] = useState(false);
  const [activePageSlug, setActivePageSlug] = useState('for-authors');
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [sectionForm, setSectionForm] = useState<Partial<PageSection>>({
    sectionKey: '', title: '', subtitle: '', body: '', buttonLabel: '', buttonLink: '',
    imageUrl: '', enabled: true, order: 0,
  });

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    unsubs.push(onSnapshot(collection(db, 'page_configs'), (snap) => {
      setPages(snap.docs.map(d => ({ id: d.id, ...d.data() } as PageConfig)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'page_configs')));
    unsubs.push(onSnapshot(collection(db, 'contact_settings'), (snap) => {
      if (snap.docs.length > 0) setContactSettings({ id: snap.docs[0].id, ...snap.docs[0].data() } as ContactSettings);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'contact_settings')));
    return () => unsubs.forEach(u => u());
  }, []);

  const getPageConfig = (slug: string): PageConfig | undefined => pages.find(p => p.pageSlug === slug);

  const savePageHero = async (slug: string, data: Partial<PageConfig>) => {
    try {
      const existing = getPageConfig(slug);
      if (existing) { await setDoc(doc(db, 'page_configs', existing.id), { ...data, updatedAt: serverTimestamp() }, { merge: true }); }
      else { await setDoc(doc(collection(db, 'page_configs')), { pageSlug: slug, ...data, sections: [], createdAt: serverTimestamp() }); }
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'page_configs'); }
  };

  const saveContactSettings = async () => {
    try {
      await setDoc(doc(db, 'contact_settings', contactSettings.id), { ...contactSettings, updatedAt: serverTimestamp() });
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'contact_settings'); }
  };

  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';

  const activePage = getPageConfig(activePageSlug);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-aurora-teal/10 flex items-center justify-center border border-aurora-teal/20"><Globe className="w-6 h-6 text-aurora-teal" /></div>
        <div><h2 className="font-heading text-2xl text-text-primary">Pages CMS</h2><p className="font-ui text-text-secondary text-sm">Manage content for For Authors, For Readers, For Beta Readers, About, and Contact pages.</p></div>
      </div>

      {/* Page Selector */}
      <div className="flex gap-2 flex-wrap">
        {PAGES.map(p => (
          <button key={p.slug} onClick={() => setActivePageSlug(p.slug)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui text-sm border transition-all ${activePageSlug === p.slug ? 'bg-aurora-teal/10 border-aurora-teal/30 text-aurora-teal' : 'bg-surface border-border/50 text-text-secondary hover:border-border'}`}>
            <span>{p.icon}</span> {p.label}
          </button>
        ))}
        <button onClick={() => setActivePageSlug('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-ui text-sm border transition-all ${activePageSlug === 'contact' ? 'bg-aurora-teal/10 border-aurora-teal/30 text-aurora-teal' : 'bg-surface border-border/50 text-text-secondary hover:border-border'}`}>
          <Mail className="w-4 h-4" /> Contact
        </button>
      </div>

      {/* Landing Page Editor */}
      {activePageSlug !== 'contact' && (
        <Panel title={`${PAGES.find(p => p.slug === activePageSlug)?.label || ''} Page Editor`} icon={FileText} defaultOpen>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Page Title</label><input type="text" value={activePage?.pageTitle || ''} onChange={e => savePageHero(activePageSlug, { pageTitle: e.target.value })} className={inputClass} placeholder="e.g. For Authors" /></div>
              <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Meta Title (SEO)</label><input type="text" value={activePage?.metaTitle || ''} onChange={e => savePageHero(activePageSlug, { metaTitle: e.target.value })} className={inputClass} placeholder="e.g. Publish with Rüna Atlas" /></div>
            </div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Hero Title</label><input type="text" value={activePage?.heroTitle || ''} onChange={e => savePageHero(activePageSlug, { heroTitle: e.target.value })} className={inputClass} placeholder="The main heading of the hero banner" /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Hero Subtitle</label><textarea value={activePage?.heroSubtitle || ''} onChange={e => savePageHero(activePageSlug, { heroSubtitle: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="Supporting text under the hero heading" /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Meta Description (SEO)</label><textarea value={activePage?.metaDescription || ''} onChange={e => savePageHero(activePageSlug, { metaDescription: e.target.value })} className={`${inputClass} h-16 resize-none`} placeholder="155 character search engine description" /></div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Hero Image URL</label><input type="text" value={activePage?.heroImage || ''} onChange={e => savePageHero(activePageSlug, { heroImage: e.target.value })} className={inputClass} placeholder="https://..." /></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={activePage?.enabled ?? true} onChange={e => savePageHero(activePageSlug, { enabled: e.target.checked })} className="accent-starforge-gold" />
              <span className="text-sm text-text-secondary">Page published (visible to visitors)</span>
            </label>
          </div>
        </Panel>
      )}

      {/* Contact Settings */}
      {activePageSlug === 'contact' && (
        <Panel title="Contact Page Settings" icon={Mail} defaultOpen>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Recipient Email</label><input type="email" value={contactSettings.recipientEmail} onChange={e => setContactSettings({ ...contactSettings, recipientEmail: e.target.value })} className={inputClass} placeholder="contact@runaatlas.com" /></div>
              <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Phone</label><input type="text" value={contactSettings.phone} onChange={e => setContactSettings({ ...contactSettings, phone: e.target.value })} className={inputClass} placeholder="+1 (555) 000-0000" /></div>
            </div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Address</label><input type="text" value={contactSettings.address} onChange={e => setContactSettings({ ...contactSettings, address: e.target.value })} className={inputClass} placeholder="123 Literary Lane, New York, NY 10001" /></div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={contactSettings.autoReplyEnabled} onChange={e => setContactSettings({ ...contactSettings, autoReplyEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Auto-reply to submissions</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={contactSettings.notifySlack} onChange={e => setContactSettings({ ...contactSettings, notifySlack: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Send Slack notification</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={contactSettings.mapEmbedEnabled} onChange={e => setContactSettings({ ...contactSettings, mapEmbedEnabled: e.target.checked })} className="accent-starforge-gold" /><span className="text-sm text-text-secondary">Show embedded map</span></label>
            </div>
            <div><label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Auto-Reply Message</label><textarea value={contactSettings.autoReplyMessage} onChange={e => setContactSettings({ ...contactSettings, autoReplyMessage: e.target.value })} className={`${inputClass} h-20 resize-none`} /></div>
            <button onClick={saveContactSettings} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${settingsSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}><Save className="w-4 h-4" />{settingsSaved ? 'Saved!' : 'Save Contact Settings'}</button>
          </div>
        </Panel>
      )}
    </div>
  );
}
