import { useState, useRef, useCallback, useTransition } from 'react';
import {
  FileText, Users, BookOpen, Star, Scroll, MessageCircle, Calendar, Newspaper,
  Scissors, Shield, Image, Mail, Settings, Activity, LayoutDashboard, Flame,
  Globe, Crown, ShoppingCart, DollarSign, GitBranch, Eye, Sparkles, Scale,
  PenTool, Monitor, Compass, ClipboardList, Truck, Trophy, Contact, Printer,
  MessageSquareText, ChevronDown, Search, Menu, X, Fingerprint, Archive
} from 'lucide-react';
// Import Admin Tab Components
import AdminSubmissions from '../components/admin/AdminSubmissions';
import AdminAuthors from '../components/admin/AdminAuthors';
import AdminCatalogue from '../components/admin/AdminCatalogue';
import AdminConstellations from '../components/admin/AdminConstellations';
import AdminJourneys from '../components/admin/AdminJourneys';
import AdminCommunity from '../components/admin/AdminCommunity';
import AdminEvents from '../components/admin/AdminEvents';
import AdminPosts from '../components/admin/AdminPosts';
import AdminEditorial from '../components/admin/AdminEditorial';
import AdminRights from '../components/admin/AdminRights';
import AdminUsers from '../components/admin/AdminUsers';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminMedia from '../components/admin/AdminMedia';
import AdminNewsletter from '../components/admin/AdminNewsletter';
import AdminSettings from '../components/admin/AdminSettings';
import AdminActivity from '../components/admin/AdminActivity';
import AdminForge from '../components/admin/AdminForge';
import AdminLandingPage from '../components/admin/AdminLandingPage';
import AdminMembership from '../components/admin/AdminMembership';
import AdminOrders from '../components/admin/AdminOrders';
import AdminRoyalties from '../components/admin/AdminRoyalties';
import AdminPipeline from '../components/admin/AdminPipeline';
import AdminBetaReaders from '../components/admin/AdminBetaReaders';
import AdminReaderTools from '../components/admin/AdminReaderTools';
import AdminPages from '../components/admin/AdminPages';
import AdminLegal from '../components/admin/AdminLegal';
import AdminAuthorTools from '../components/admin/AdminAuthorTools';
import AdminReaderExp from '../components/admin/AdminReaderExp';
import AdminOnboarding from '../components/admin/AdminOnboarding';
import AdminImprints from '../components/admin/AdminImprints';
import AdminSOPs from '../components/admin/AdminSOPs';
import AdminDistribution from '../components/admin/AdminDistribution';
import AdminAwards from '../components/admin/AdminAwards';
import AdminContacts from '../components/admin/AdminContacts';
import AdminProduction from '../components/admin/AdminProduction';
import AdminReviewTracker from '../components/admin/AdminReviewTracker';
import AdminNDA from '../components/admin/AdminNDA';
import AdminArchive from '../components/admin/AdminArchive';
import AdminKnowledgeBase from '../components/admin/AdminKnowledgeBase';
import React from 'react';

// ── Tab Error Boundary ──────────────────────────
class TabErrorBoundary extends React.Component<
  { tabId: string; children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error) { console.error(`[Admin Tab Error]`, error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface border border-forge-red/30 rounded-xl p-8 text-center">
          <h3 className="font-heading text-lg text-forge-red mb-2">Tab Error</h3>
          <p className="font-ui text-sm text-text-muted mb-4">This panel encountered an error. Try switching away and back.</p>
          <pre className="font-mono text-[10px] text-text-muted bg-void-black p-3 rounded-lg overflow-auto max-h-24 text-left mb-4">{this.state.error?.message}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-starforge-gold text-void-black rounded-lg font-ui text-sm font-medium">Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Tab component map ──────────────────────────
const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  dashboard: AdminDashboard, landing: AdminLandingPage, submissions: AdminSubmissions,
  authors: AdminAuthors, catalogue: AdminCatalogue, constellations: AdminConstellations,
  journeys: AdminJourneys, community: AdminCommunity, forge: AdminForge,
  editorial: AdminEditorial, rights: AdminRights, media: AdminMedia,
  newsletter: AdminNewsletter, users: AdminUsers, events: AdminEvents,
  posts: AdminPosts, membership: AdminMembership, orders: AdminOrders,
  royalties: AdminRoyalties, pipeline: AdminPipeline, 'beta-readers': AdminBetaReaders,
  'reader-tools': AdminReaderTools, pages: AdminPages, legal: AdminLegal,
  'author-tools': AdminAuthorTools, 'reader-exp': AdminReaderExp,
  onboarding: AdminOnboarding, imprints: AdminImprints, sops: AdminSOPs,
  distribution: AdminDistribution, awards: AdminAwards, contacts: AdminContacts,
  production: AdminProduction, reviews: AdminReviewTracker, nda: AdminNDA,
  archive: AdminArchive, 'knowledge-base': AdminKnowledgeBase,
  settings: AdminSettings, activity: AdminActivity,
};

// ── Grouped navigation ──────────────────────────
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'activity', label: 'Activity Log', icon: Activity },
      { id: 'landing', label: 'Landing Page', icon: Globe },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
      { id: 'authors', label: 'Authors', icon: Users },
      { id: 'constellations', label: 'Constellations', icon: Star },
      { id: 'journeys', label: 'Journeys', icon: Scroll },
      { id: 'posts', label: 'Blog Posts', icon: Newspaper },
      { id: 'imprints', label: 'Imprints & Genres', icon: BookOpen },
      { id: 'pages', label: 'Pages', icon: Globe },
    ],
  },
  {
    label: 'Publishing',
    items: [
      { id: 'submissions', label: 'Submissions', icon: FileText },
      { id: 'editorial', label: 'Editorial', icon: Scissors },
      { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
      { id: 'production', label: 'Production', icon: Printer },
      { id: 'distribution', label: 'Distribution', icon: Truck },
      { id: 'sops', label: 'SOPs', icon: ClipboardList },
      { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    ],
  },
  {
    label: 'Community',
    items: [
      { id: 'community', label: 'Community', icon: MessageCircle },
      { id: 'forge', label: 'Forge & Connect', icon: Flame },
      { id: 'beta-readers', label: 'Beta Readers', icon: Eye },
      { id: 'events', label: 'Events', icon: Calendar },
      { id: 'reader-tools', label: 'Reader Tools', icon: Sparkles },
      { id: 'reader-exp', label: 'Reader Experience', icon: Monitor },
      { id: 'archive', label: 'Archive', icon: Archive },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { id: 'orders', label: 'Orders', icon: ShoppingCart },
      { id: 'membership', label: 'Membership', icon: Crown },
      { id: 'royalties', label: 'Royalties', icon: DollarSign },
    ],
  },
  {
    label: 'People',
    items: [
      { id: 'users', label: 'Users & Staff', icon: Users },
      { id: 'contacts', label: 'Industry Contacts', icon: Contact },
      { id: 'newsletter', label: 'Newsletter', icon: Mail },
      { id: 'onboarding', label: 'Onboarding', icon: Compass },
    ],
  },
  {
    label: 'Legal & Rights',
    items: [
      { id: 'rights', label: 'Rights & Licensing', icon: Shield },
      { id: 'legal', label: 'Legal', icon: Scale },
      { id: 'nda', label: 'NDA Signatures', icon: Fingerprint },
      { id: 'awards', label: 'Awards', icon: Trophy },
      { id: 'reviews', label: 'Reviews', icon: MessageSquareText },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'media', label: 'Media Library', icon: Image },
      { id: 'author-tools', label: 'Author Tools', icon: PenTool },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

// ── All item labels for search ──────────────────
const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items.map(i => ({ ...i, group: g.label })));

// ── Sidebar Group ──────────────────────────
function SidebarGroup({ label, items, activeTab, onSelect, defaultOpen = false }: {
  label: string;
  items: { id: string; label: string; icon: any }[];
  activeTab: string;
  onSelect: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const hasActive = items.some(i => i.id === activeTab);
  const [open, setOpen] = useState(defaultOpen || hasActive);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left group hover:bg-surface-elevated/50 transition-colors"
      >
        <span className={`font-ui text-[10px] uppercase tracking-[0.15em] font-semibold ${hasActive ? 'text-starforge-gold' : 'text-text-muted'}`}>
          {label}
        </span>
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="ml-1 mt-0.5 space-y-0.5">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm font-ui ${
                  isActive
                    ? 'bg-starforge-gold/10 text-starforge-gold border-l-2 border-starforge-gold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/30'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-starforge-gold' : 'text-text-muted'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Component ──────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(new Set(['dashboard']));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTabSwitch = useCallback((tabId: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        setActiveTab(tabId);
        setMountedTabs(prev => {
          if (prev.has(tabId)) return prev;
          const next = new Set(prev);
          next.add(tabId);
          return next;
        });
      });
      // Close sidebar on mobile after selection
      if (window.innerWidth < 1024) setSidebarOpen(false);
    }, 80);
  }, []);

  // Filtered items for search
  const searchResults = searchQuery.trim()
    ? ALL_ITEMS.filter(i =>
        i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.group.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const currentLabel = ALL_ITEMS.find(i => i.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="bg-void-black min-h-screen flex">
      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-auto
        w-64 h-screen bg-surface border-r border-border/50
        flex flex-col overflow-hidden
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-border/30 flex items-center justify-between">
          <h2 className="font-display text-sm text-starforge-gold uppercase tracking-[0.2em]">Admin Console</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick search */}
        <div className="px-3 py-3 border-b border-border/20">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Quick find..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-void-black/50 border border-border/30 rounded-lg pl-8 pr-3 py-2 text-text-primary font-ui text-xs outline-none focus:border-starforge-gold/40 transition-colors placeholder:text-text-muted"
            />
          </div>
          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-1 bg-surface-elevated border border-border/30 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {searchResults.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { handleTabSwitch(item.id); setSearchQuery(''); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-starforge-gold/10 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-text-muted" />
                    <div>
                      <span className="font-ui text-xs text-text-primary">{item.label}</span>
                      <span className="font-ui text-[9px] text-text-muted ml-2">{item.group}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
          {NAV_GROUPS.map(group => (
            <SidebarGroup
              key={group.label}
              label={group.label}
              items={group.items}
              activeTab={activeTab}
              onSelect={handleTabSwitch}
              defaultOpen={group.label === 'Overview'}
            />
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-3 border-t border-border/30">
          <p className="font-mono text-[9px] text-text-muted text-center">RÜNA ATLAS PRESS v2.0</p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-sm border-b border-border/30 px-4 sm:px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-text-muted hover:text-text-primary">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-heading text-lg text-text-primary flex-1 truncate">{currentLabel}</h1>
          {isPending && (
            <div className="w-4 h-4 border-2 border-starforge-gold/30 border-t-starforge-gold rounded-full animate-spin" />
          )}
        </header>

        {/* Content area — keep-alive: mount once, show/hide */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          {Array.from(mountedTabs).map(tabId => {
            const Component = TAB_COMPONENTS[tabId];
            if (!Component) return null;
            const props: any = tabId === 'dashboard' ? { onNavigate: handleTabSwitch } : {};
            return (
              <div key={tabId} style={{ display: activeTab === tabId ? 'block' : 'none' }}>
                <TabErrorBoundary tabId={tabId}>
                  <Component {...props} />
                </TabErrorBoundary>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
