import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, BookOpen, Star, Scroll, MessageCircle, Calendar, Newspaper, Scissors, Shield, Image, Mail, Settings, Activity, LayoutDashboard, Flame, Globe, Crown, ShoppingCart, DollarSign, GitBranch, Eye, Sparkles, Scale, PenTool, Monitor, Compass, ClipboardList, Truck, Trophy, Contact, Printer, MessageSquareText } from 'lucide-react';
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

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // Access is already enforced by ProtectedRoute in App.tsx

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'landing', label: 'Landing Page', icon: Globe },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'authors', label: 'Authors', icon: Users },
    { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
    { id: 'constellations', label: 'Constellations', icon: Star },
    { id: 'journeys', label: 'Journeys', icon: Scroll },
    { id: 'community', label: 'Community', icon: MessageCircle },
    { id: 'forge', label: 'Forge & Connect', icon: Flame },
    { id: 'editorial', label: 'Editorial', icon: Scissors },
    { id: 'rights', label: 'Rights', icon: Shield },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'posts', label: 'Posts', icon: Newspaper },
    { id: 'membership', label: 'Membership', icon: Crown },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'royalties', label: 'Royalties', icon: DollarSign },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'beta-readers', label: 'Beta Readers', icon: Eye },
    { id: 'reader-tools', label: 'Reader Tools', icon: Sparkles },
    { id: 'pages', label: 'Pages', icon: Globe },
    { id: 'legal', label: 'Legal', icon: Scale },
    { id: 'author-tools', label: 'Author Tools', icon: PenTool },
    { id: 'reader-exp', label: 'Reader Exp', icon: Monitor },
    { id: 'onboarding', label: 'Onboarding', icon: Compass },
    { id: 'imprints', label: 'Imprints & Genres', icon: BookOpen },
    { id: 'sops', label: 'SOPs', icon: ClipboardList },
    { id: 'distribution', label: 'Distribution', icon: Truck },
    { id: 'awards', label: 'Awards', icon: Trophy },
    { id: 'contacts', label: 'Contacts', icon: Contact },
    { id: 'production', label: 'Production', icon: Printer },
    { id: 'reviews', label: 'Reviews', icon: MessageSquareText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="bg-void-black min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-surface border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto hide-scrollbar py-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-ui text-sm whitespace-nowrap transition-all ${isActive
                    ? 'bg-starforge-gold text-void-black font-medium'
                    : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-elevated/80 border border-border/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'landing' && <AdminLandingPage />}
          {activeTab === 'submissions' && <AdminSubmissions />}
          {activeTab === 'authors' && <AdminAuthors />}
          {activeTab === 'catalogue' && <AdminCatalogue />}
          {activeTab === 'constellations' && <AdminConstellations />}
          {activeTab === 'journeys' && <AdminJourneys />}
          {activeTab === 'community' && <AdminCommunity />}
          {activeTab === 'forge' && <AdminForge />}
          {activeTab === 'editorial' && <AdminEditorial />}
          {activeTab === 'rights' && <AdminRights />}
          {activeTab === 'media' && <AdminMedia />}
          {activeTab === 'newsletter' && <AdminNewsletter />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'events' && <AdminEvents />}
          {activeTab === 'posts' && <AdminPosts />}
          {activeTab === 'membership' && <AdminMembership />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'royalties' && <AdminRoyalties />}
          {activeTab === 'pipeline' && <AdminPipeline />}
          {activeTab === 'beta-readers' && <AdminBetaReaders />}
          {activeTab === 'reader-tools' && <AdminReaderTools />}
          {activeTab === 'pages' && <AdminPages />}
          {activeTab === 'legal' && <AdminLegal />}
          {activeTab === 'author-tools' && <AdminAuthorTools />}
          {activeTab === 'reader-exp' && <AdminReaderExp />}
          {activeTab === 'onboarding' && <AdminOnboarding />}
          {activeTab === 'imprints' && <AdminImprints />}
          {activeTab === 'sops' && <AdminSOPs />}
          {activeTab === 'distribution' && <AdminDistribution />}
          {activeTab === 'awards' && <AdminAwards />}
          {activeTab === 'contacts' && <AdminContacts />}
          {activeTab === 'production' && <AdminProduction />}
          {activeTab === 'reviews' && <AdminReviewTracker />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'activity' && <AdminActivity />}
        </motion.div>
      </main>
    </div>
  );
}
