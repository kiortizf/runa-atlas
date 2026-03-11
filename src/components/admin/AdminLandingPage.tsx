import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Zap, Activity, Quote, Sparkles, Compass, Plus, Edit2, Trash2,
  Save, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown, ChevronDown, ChevronRight,
  Heart, Dna, BookMarked, Star, PenTool, Users, TrendingUp, Clock, AlertCircle
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import AdminModal, { FormSection, FormField } from './AdminModal';

// ─── Types ──────────────────────────────────────────────────
interface BannerConfig {
  id: string;
  title: string;
  linkText: string;
  linkPath: string;
  enabled: boolean;
  updatedAt?: any;
}

interface ActivityItem {
  id: string;
  text: string;
  icon: string;
  time: string;
  color: string;
  order: number;
  enabled: boolean;
}

interface PullQuoteItem {
  id: string;
  quote: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  constellationName: string;
  constellationIcon: string;
  constellationColor: string;
  order: number;
  enabled: boolean;
}

interface SpotlightConfig {
  id: string;
  mode: 'auto' | 'manual';
  constellationId: string;
  constellationName: string;
  overrideDescription: string;
  enabled: boolean;
}

interface GatewayCard {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: string;
  gradient: string;
  accentColor: string;
  order: number;
  enabled: boolean;
}

// ─── Icon Options for dropdowns ──────────────────────────────
const ICON_OPTIONS = [
  { value: 'PenTool', label: '✏️ PenTool' },
  { value: 'Star', label: '⭐ Star' },
  { value: 'Sparkles', label: '✨ Sparkles' },
  { value: 'Eye', label: '👁 Eye' },
  { value: 'TrendingUp', label: '📈 TrendingUp' },
  { value: 'Users', label: '👥 Users' },
  { value: 'BookMarked', label: '📖 BookMarked' },
  { value: 'Activity', label: '📊 Activity' },
  { value: 'Heart', label: '❤️ Heart' },
  { value: 'Dna', label: '🧬 Dna' },
  { value: 'Compass', label: '🧭 Compass' },
  { value: 'Clock', label: '🕐 Clock' },
  { value: 'Zap', label: '⚡ Zap' },
];

const GRADIENT_OPTIONS = [
  { value: 'from-pink-500/20 to-purple-600/20', label: 'Pink → Purple' },
  { value: 'from-emerald-500/20 to-teal-600/20', label: 'Emerald → Teal' },
  { value: 'from-amber-500/20 to-orange-600/20', label: 'Amber → Orange' },
  { value: 'from-blue-500/20 to-indigo-600/20', label: 'Blue → Indigo' },
  { value: 'from-red-500/20 to-rose-600/20', label: 'Red → Rose' },
  { value: 'from-violet-500/20 to-purple-600/20', label: 'Violet → Purple' },
];

// ─── Collapsible Section ─────────────────────────────────────
function SectionPanel({ title, icon: Icon, count, children, defaultOpen = false }: {
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
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-lg text-text-primary">{title}</h3>
        </div>
        {count !== undefined && (
          <span className="font-mono text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full border border-border/50">
            {count}
          </span>
        )}
        {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-border/30">{children}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function AdminLandingPage() {
  // ── Banner State ──
  const [banner, setBanner] = useState<BannerConfig>({
    id: 'main-banner', title: 'Spring 2026 Forgings — 4 new manuscripts entering the Runeweave',
    linkText: 'Preview Now', linkPath: '/catalog', enabled: true,
  });
  const [bannerSaved, setBannerSaved] = useState(false);

  // ── Activity Feed State ──
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityModal, setActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [activityForm, setActivityForm] = useState<Partial<ActivityItem>>({
    text: '', icon: 'Star', time: '', color: '#d4a853', order: 0, enabled: true,
  });

  // ── Pull Quotes State ──
  const [quotes, setQuotes] = useState<PullQuoteItem[]>([]);
  const [quoteModal, setQuoteModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<PullQuoteItem | null>(null);
  const [quoteForm, setQuoteForm] = useState<Partial<PullQuoteItem>>({
    quote: '', bookTitle: '', bookAuthor: '', bookCover: '',
    constellationName: '', constellationIcon: '✨', constellationColor: '#a855f7',
    order: 0, enabled: true,
  });

  // ── Spotlight State ──
  const [spotlight, setSpotlight] = useState<SpotlightConfig>({
    id: 'main-spotlight', mode: 'auto', constellationId: '', constellationName: '',
    overrideDescription: '', enabled: true,
  });
  const [spotlightSaved, setSpotlightSaved] = useState(false);
  const [constellations, setConstellations] = useState<{ id: string; name: string; icon?: string }[]>([]);

  // ── Gateway Cards State ──
  const [gateways, setGateways] = useState<GatewayCard[]>([]);
  const [gatewayModal, setGatewayModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<GatewayCard | null>(null);
  const [gatewayForm, setGatewayForm] = useState<Partial<GatewayCard>>({
    title: '', description: '', path: '', icon: 'Heart',
    gradient: 'from-pink-500/20 to-purple-600/20', accentColor: '#ec4899', order: 0, enabled: true,
  });

  // ── Load Data ──
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    // Banner
    unsubs.push(onSnapshot(collection(db, 'landingPage_banner'), (snap) => {
      if (snap.docs.length > 0) {
        const d = snap.docs[0];
        setBanner({ id: d.id, ...d.data() } as BannerConfig);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'landingPage_banner')));

    // Activities
    unsubs.push(onSnapshot(collection(db, 'landingPage_activities'), (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityItem))
        .sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'landingPage_activities')));

    // Pull Quotes
    unsubs.push(onSnapshot(collection(db, 'landingPage_quotes'), (snap) => {
      setQuotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as PullQuoteItem))
        .sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'landingPage_quotes')));

    // Spotlight
    unsubs.push(onSnapshot(collection(db, 'landingPage_spotlight'), (snap) => {
      if (snap.docs.length > 0) {
        const d = snap.docs[0];
        setSpotlight({ id: d.id, ...d.data() } as SpotlightConfig);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'landingPage_spotlight')));

    // Gateways
    unsubs.push(onSnapshot(collection(db, 'landingPage_gateways'), (snap) => {
      setGateways(snap.docs.map(d => ({ id: d.id, ...d.data() } as GatewayCard))
        .sort((a, b) => a.order - b.order));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'landingPage_gateways')));

    // Constellations (for spotlights dropdown)
    unsubs.push(onSnapshot(collection(db, 'constellations'), (snap) => {
      setConstellations(snap.docs.map(d => ({ id: d.id, name: (d.data() as any).name, icon: (d.data() as any).icon })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'constellations')));

    return () => unsubs.forEach(u => u());
  }, []);

  // ── Banner Save ──
  const saveBanner = async () => {
    try {
      await setDoc(doc(db, 'landingPage_banner', banner.id), {
        title: banner.title, linkText: banner.linkText, linkPath: banner.linkPath,
        enabled: banner.enabled, updatedAt: serverTimestamp(),
      });
      setBannerSaved(true);
      setTimeout(() => setBannerSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'landingPage_banner'); }
  };

  // ── Activity CRUD ──
  const openActivityModal = (item?: ActivityItem) => {
    if (item) { setEditingActivity(item); setActivityForm(item); }
    else { setEditingActivity(null); setActivityForm({ text: '', icon: 'Star', time: '', color: '#d4a853', order: activities.length, enabled: true }); }
    setActivityModal(true);
  };
  const saveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { text: activityForm.text, icon: activityForm.icon, time: activityForm.time, color: activityForm.color, order: activityForm.order ?? 0, enabled: activityForm.enabled ?? true };
      if (editingActivity) await setDoc(doc(db, 'landingPage_activities', editingActivity.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'landingPage_activities')), { ...data, createdAt: serverTimestamp() });
      setActivityModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'landingPage_activities'); }
  };
  const deleteActivity = async (id: string) => {
    if (window.confirm('Delete this activity item?')) {
      try { await deleteDoc(doc(db, 'landingPage_activities', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'landingPage_activities'); }
    }
  };

  // ── Quote CRUD ──
  const openQuoteModal = (item?: PullQuoteItem) => {
    if (item) { setEditingQuote(item); setQuoteForm(item); }
    else {
      setEditingQuote(null);
      setQuoteForm({ quote: '', bookTitle: '', bookAuthor: '', bookCover: '', constellationName: '', constellationIcon: '✨', constellationColor: '#a855f7', order: quotes.length, enabled: true });
    }
    setQuoteModal(true);
  };
  const saveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        quote: quoteForm.quote, bookTitle: quoteForm.bookTitle, bookAuthor: quoteForm.bookAuthor,
        bookCover: quoteForm.bookCover, constellationName: quoteForm.constellationName,
        constellationIcon: quoteForm.constellationIcon, constellationColor: quoteForm.constellationColor,
        order: quoteForm.order ?? 0, enabled: quoteForm.enabled ?? true,
      };
      if (editingQuote) await setDoc(doc(db, 'landingPage_quotes', editingQuote.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'landingPage_quotes')), { ...data, createdAt: serverTimestamp() });
      setQuoteModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'landingPage_quotes'); }
  };
  const deleteQuote = async (id: string) => {
    if (window.confirm('Delete this pull quote?')) {
      try { await deleteDoc(doc(db, 'landingPage_quotes', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'landingPage_quotes'); }
    }
  };

  // ── Spotlight Save ──
  const saveSpotlight = async () => {
    try {
      await setDoc(doc(db, 'landingPage_spotlight', spotlight.id), {
        mode: spotlight.mode, constellationId: spotlight.constellationId,
        constellationName: spotlight.constellationName, overrideDescription: spotlight.overrideDescription,
        enabled: spotlight.enabled, updatedAt: serverTimestamp(),
      });
      setSpotlightSaved(true);
      setTimeout(() => setSpotlightSaved(false), 2000);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'landingPage_spotlight'); }
  };

  // ── Gateway CRUD ──
  const openGatewayModal = (item?: GatewayCard) => {
    if (item) { setEditingGateway(item); setGatewayForm(item); }
    else {
      setEditingGateway(null);
      setGatewayForm({ title: '', description: '', path: '', icon: 'Heart', gradient: 'from-pink-500/20 to-purple-600/20', accentColor: '#ec4899', order: gateways.length, enabled: true });
    }
    setGatewayModal(true);
  };
  const saveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: gatewayForm.title, description: gatewayForm.description, path: gatewayForm.path,
        icon: gatewayForm.icon, gradient: gatewayForm.gradient, accentColor: gatewayForm.accentColor,
        order: gatewayForm.order ?? 0, enabled: gatewayForm.enabled ?? true,
      };
      if (editingGateway) await setDoc(doc(db, 'landingPage_gateways', editingGateway.id), data, { merge: true });
      else await setDoc(doc(collection(db, 'landingPage_gateways')), { ...data, createdAt: serverTimestamp() });
      setGatewayModal(false);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'landingPage_gateways'); }
  };
  const deleteGateway = async (id: string) => {
    if (window.confirm('Delete this gateway card?')) {
      try { await deleteDoc(doc(db, 'landingPage_gateways', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, 'landingPage_gateways'); }
    }
  };

  // ── Shared input class ──
  const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all';
  const selectClass = inputClass;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20">
          <LayoutDashboard className="w-6 h-6 text-starforge-gold" />
        </div>
        <div>
          <h2 className="font-heading text-2xl text-text-primary">Landing Page Manager</h2>
          <p className="font-ui text-text-secondary text-sm">Control every element of the Runeweave landing page.</p>
        </div>
      </div>

      {/* ═══ 1. Seasonal Transmission Banner ═══ */}
      <SectionPanel title="Seasonal Transmission Banner" icon={Zap} defaultOpen={true}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider">Visibility</label>
            <button onClick={() => setBanner({ ...banner, enabled: !banner.enabled })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-ui transition-all ${banner.enabled ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30' : 'bg-surface-elevated text-text-muted border border-border/50'}`}>
              {banner.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {banner.enabled ? 'Visible' : 'Hidden'}
            </button>
          </div>
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Banner Title</label>
            <input type="text" value={banner.title} onChange={e => setBanner({ ...banner, title: e.target.value })} className={inputClass} placeholder="Spring 2026 Forgings..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Link Text</label>
              <input type="text" value={banner.linkText} onChange={e => setBanner({ ...banner, linkText: e.target.value })} className={inputClass} placeholder="Preview Now" />
            </div>
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Link Path</label>
              <input type="text" value={banner.linkPath} onChange={e => setBanner({ ...banner, linkPath: e.target.value })} className={inputClass} placeholder="/catalog" />
            </div>
          </div>
          <button onClick={saveBanner}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${bannerSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}>
            <Save className="w-4 h-4" /> {bannerSaved ? 'Saved!' : 'Save Banner'}
          </button>
        </div>
      </SectionPanel>

      {/* ═══ 2. Live Activity Feed ═══ */}
      <SectionPanel title="Live Activity Feed" icon={Activity} count={activities.length}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-ui text-xs text-text-muted">Rotating activity items shown in the live ticker.</p>
            <button onClick={() => openActivityModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-starforge-gold text-void-black rounded-xl font-ui text-sm font-medium hover:bg-starforge-gold/90 transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Activity
            </button>
          </div>
          {activities.length === 0 && (
            <div className="text-center py-8 text-text-muted font-ui text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No activity items. Hardcoded defaults will be used.
            </div>
          )}
          {activities.map(item => (
            <div key={item.id} className={`flex items-center gap-3 bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 ${!item.enabled ? 'opacity-50' : ''}`}>
              <GripVertical className="w-4 h-4 text-text-muted flex-shrink-0 cursor-grab" />
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-ui text-sm text-text-primary flex-1 truncate">{item.text}</span>
              <span className="font-mono text-[10px] text-text-muted flex-shrink-0">{item.time}</span>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openActivityModal(item)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteActivity(item.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>

      {/* ═══ 3. Pull Quotes ═══ */}
      <SectionPanel title="Pull Quotes Carousel" icon={Quote} count={quotes.length}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-ui text-xs text-text-muted">Rotating quotes from your catalog — sells the writing.</p>
            <button onClick={() => openQuoteModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-starforge-gold text-void-black rounded-xl font-ui text-sm font-medium hover:bg-starforge-gold/90 transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Quote
            </button>
          </div>
          {quotes.length === 0 && (
            <div className="text-center py-8 text-text-muted font-ui text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No quotes configured. Hardcoded defaults will be used.
            </div>
          )}
          {quotes.map(q => (
            <div key={q.id} className={`bg-surface-elevated border border-border/50 rounded-xl p-4 ${!q.enabled ? 'opacity-50' : ''}`}>
              <p className="font-heading text-sm text-text-primary italic leading-relaxed mb-2 line-clamp-2">"{q.quote}"</p>
              <div className="flex items-center justify-between">
                <span className="font-ui text-xs text-text-secondary">— {q.bookTitle} by {q.bookAuthor}</span>
                <div className="flex gap-1">
                  <button onClick={() => openQuoteModal(q)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteQuote(q.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>

      {/* ═══ 4. Featured Constellation Spotlight ═══ */}
      <SectionPanel title="Featured Constellation Spotlight" icon={Sparkles}>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider">Enabled</label>
            <button onClick={() => setSpotlight({ ...spotlight, enabled: !spotlight.enabled })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-ui transition-all ${spotlight.enabled ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30' : 'bg-surface-elevated text-text-muted border border-border/50'}`}>
              {spotlight.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {spotlight.enabled ? 'Visible' : 'Hidden'}
            </button>
          </div>
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Rotation Mode</label>
            <select value={spotlight.mode} onChange={e => setSpotlight({ ...spotlight, mode: e.target.value as 'auto' | 'manual' })} className={selectClass}>
              <option value="auto">Auto-Rotate (Weekly)</option>
              <option value="manual">Manual Selection</option>
            </select>
          </div>
          {spotlight.mode === 'manual' && (
            <div>
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Select Constellation</label>
              <select value={spotlight.constellationId}
                onChange={e => {
                  const c = constellations.find(c => c.id === e.target.value);
                  setSpotlight({ ...spotlight, constellationId: e.target.value, constellationName: c?.name || '' });
                }} className={selectClass}>
                <option value="">Choose a constellation...</option>
                {constellations.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Override Description (optional)</label>
            <textarea value={spotlight.overrideDescription}
              onChange={e => setSpotlight({ ...spotlight, overrideDescription: e.target.value })}
              className={`${inputClass} h-20 resize-none`} placeholder="Leave empty to use the constellation's default description..." />
          </div>
          <button onClick={saveSpotlight}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui text-sm font-medium transition-all ${spotlightSaved ? 'bg-aurora-teal text-void-black' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}>
            <Save className="w-4 h-4" /> {spotlightSaved ? 'Saved!' : 'Save Spotlight'}
          </button>
        </div>
      </SectionPanel>

      {/* ═══ 5. Reader's Gateway Cards ═══ */}
      <SectionPanel title="Reader's Gateway Cards" icon={Compass} count={gateways.length}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-ui text-xs text-text-muted">Entry-point cards shown below the star map.</p>
            <button onClick={() => openGatewayModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-starforge-gold text-void-black rounded-xl font-ui text-sm font-medium hover:bg-starforge-gold/90 transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Card
            </button>
          </div>
          {gateways.length === 0 && (
            <div className="text-center py-8 text-text-muted font-ui text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No gateway cards configured. Hardcoded defaults will be used.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {gateways.map(g => (
              <div key={g.id} className={`bg-surface-elevated border border-border/50 rounded-xl p-4 ${!g.enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${g.accentColor}15` }}>
                    <span className="text-sm" style={{ color: g.accentColor }}>●</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openGatewayModal(g)} className="p-1 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => deleteGateway(g.id)} className="p-1 text-text-muted hover:text-forge-red"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <h4 className="font-heading text-sm text-text-primary mb-1">{g.title}</h4>
                <p className="font-ui text-[11px] text-text-secondary line-clamp-2">{g.description}</p>
                <span className="font-mono text-[10px] text-text-muted mt-2 block">{g.path}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionPanel>

      {/* ══════════ MODALS ══════════ */}

      {/* Activity Modal */}
      <AdminModal isOpen={activityModal} onClose={() => setActivityModal(false)}
        title={editingActivity ? 'Edit Activity Item' : 'Add Activity Item'}>
        <form onSubmit={saveActivity} className="space-y-6">
          <FormSection title="Content">
            <FormField label="Activity Text">
              <input type="text" required value={activityForm.text} onChange={e => setActivityForm({ ...activityForm, text: e.target.value })}
                className={inputClass} placeholder='e.g. "Nneka Achebe submitted Chapter 18"' />
            </FormField>
            <FormField label="Time Label">
              <input type="text" required value={activityForm.time} onChange={e => setActivityForm({ ...activityForm, time: e.target.value })}
                className={inputClass} placeholder="e.g. 12 min ago" />
            </FormField>
          </FormSection>
          <FormSection title="Appearance">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Icon">
                <select value={activityForm.icon} onChange={e => setActivityForm({ ...activityForm, icon: e.target.value })} className={selectClass}>
                  {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </FormField>
              <FormField label="Accent Color">
                <div className="flex items-center gap-3">
                  <input type="color" value={activityForm.color} onChange={e => setActivityForm({ ...activityForm, color: e.target.value })} className="w-10 h-10 bg-transparent border-none cursor-pointer" />
                  <input type="text" value={activityForm.color} onChange={e => setActivityForm({ ...activityForm, color: e.target.value })} className={`${inputClass} font-mono`} />
                </div>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Sort Order">
                <input type="number" value={activityForm.order} onChange={e => setActivityForm({ ...activityForm, order: Number(e.target.value) })} className={inputClass} />
              </FormField>
              <FormField label="Enabled">
                <select value={activityForm.enabled ? 'true' : 'false'} onChange={e => setActivityForm({ ...activityForm, enabled: e.target.value === 'true' })} className={selectClass}>
                  <option value="true">Yes</option><option value="false">No</option>
                </select>
              </FormField>
            </div>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">
              {editingActivity ? 'Update Activity' : 'Add Activity'}
            </button>
            <button type="button" onClick={() => setActivityModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>

      {/* Quote Modal */}
      <AdminModal isOpen={quoteModal} onClose={() => setQuoteModal(false)}
        title={editingQuote ? 'Edit Pull Quote' : 'Add Pull Quote'}>
        <form onSubmit={saveQuote} className="space-y-6">
          <FormSection title="The Quote">
            <FormField label="Quote Text">
              <textarea required value={quoteForm.quote} onChange={e => setQuoteForm({ ...quoteForm, quote: e.target.value })}
                className={`${inputClass} h-28 resize-none`} placeholder="The stars don't forget..." />
            </FormField>
          </FormSection>
          <FormSection title="Source Book">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Book Title">
                <input type="text" required value={quoteForm.bookTitle} onChange={e => setQuoteForm({ ...quoteForm, bookTitle: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Author">
                <input type="text" required value={quoteForm.bookAuthor} onChange={e => setQuoteForm({ ...quoteForm, bookAuthor: e.target.value })} className={inputClass} />
              </FormField>
            </div>
            <FormField label="Book Cover URL">
              <input type="text" value={quoteForm.bookCover} onChange={e => setQuoteForm({ ...quoteForm, bookCover: e.target.value })} className={inputClass} placeholder="https://..." />
            </FormField>
          </FormSection>
          <FormSection title="Constellation">
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Name">
                <input type="text" value={quoteForm.constellationName} onChange={e => setQuoteForm({ ...quoteForm, constellationName: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Icon">
                <input type="text" value={quoteForm.constellationIcon} onChange={e => setQuoteForm({ ...quoteForm, constellationIcon: e.target.value })} className={inputClass} placeholder="✨" />
              </FormField>
              <FormField label="Color">
                <div className="flex items-center gap-2">
                  <input type="color" value={quoteForm.constellationColor} onChange={e => setQuoteForm({ ...quoteForm, constellationColor: e.target.value })} className="w-10 h-10 bg-transparent border-none cursor-pointer" />
                  <input type="text" value={quoteForm.constellationColor} onChange={e => setQuoteForm({ ...quoteForm, constellationColor: e.target.value })} className={`${inputClass} font-mono`} />
                </div>
              </FormField>
            </div>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">
              {editingQuote ? 'Update Quote' : 'Add Quote'}
            </button>
            <button type="button" onClick={() => setQuoteModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>

      {/* Gateway Modal */}
      <AdminModal isOpen={gatewayModal} onClose={() => setGatewayModal(false)}
        title={editingGateway ? 'Edit Gateway Card' : 'Add Gateway Card'}>
        <form onSubmit={saveGateway} className="space-y-6">
          <FormSection title="Card Content">
            <FormField label="Title">
              <input type="text" required value={gatewayForm.title} onChange={e => setGatewayForm({ ...gatewayForm, title: e.target.value })} className={inputClass} placeholder="Find Your Next Obsession" />
            </FormField>
            <FormField label="Description">
              <textarea required value={gatewayForm.description} onChange={e => setGatewayForm({ ...gatewayForm, description: e.target.value })} className={`${inputClass} h-20 resize-none`} />
            </FormField>
            <FormField label="Link Path">
              <input type="text" required value={gatewayForm.path} onChange={e => setGatewayForm({ ...gatewayForm, path: e.target.value })} className={inputClass} placeholder="/mood-matcher" />
            </FormField>
          </FormSection>
          <FormSection title="Appearance">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Icon">
                <select value={gatewayForm.icon} onChange={e => setGatewayForm({ ...gatewayForm, icon: e.target.value })} className={selectClass}>
                  {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </FormField>
              <FormField label="Accent Color">
                <div className="flex items-center gap-3">
                  <input type="color" value={gatewayForm.accentColor} onChange={e => setGatewayForm({ ...gatewayForm, accentColor: e.target.value })} className="w-10 h-10 bg-transparent border-none cursor-pointer" />
                  <input type="text" value={gatewayForm.accentColor} onChange={e => setGatewayForm({ ...gatewayForm, accentColor: e.target.value })} className={`${inputClass} font-mono`} />
                </div>
              </FormField>
            </div>
            <FormField label="Background Gradient">
              <select value={gatewayForm.gradient} onChange={e => setGatewayForm({ ...gatewayForm, gradient: e.target.value })} className={selectClass}>
                {GRADIENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Sort Order">
                <input type="number" value={gatewayForm.order} onChange={e => setGatewayForm({ ...gatewayForm, order: Number(e.target.value) })} className={inputClass} />
              </FormField>
              <FormField label="Enabled">
                <select value={gatewayForm.enabled ? 'true' : 'false'} onChange={e => setGatewayForm({ ...gatewayForm, enabled: e.target.value === 'true' })} className={selectClass}>
                  <option value="true">Yes</option><option value="false">No</option>
                </select>
              </FormField>
            </div>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">
              {editingGateway ? 'Update Card' : 'Add Card'}
            </button>
            <button type="button" onClick={() => setGatewayModal(false)} className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
