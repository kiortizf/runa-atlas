import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, BookOpen, Star, Scroll, MessageCircle, Calendar, Newspaper } from 'lucide-react';
// Import Admin Tab Components
import AdminSubmissions from '../components/admin/AdminSubmissions';
import AdminAuthors from '../components/admin/AdminAuthors';
import AdminCatalogue from '../components/admin/AdminCatalogue';
import AdminConstellations from '../components/admin/AdminConstellations';
import AdminJourneys from '../components/admin/AdminJourneys';
import AdminCommunity from '../components/admin/AdminCommunity';
import AdminEvents from '../components/admin/AdminEvents';
import AdminPosts from '../components/admin/AdminPosts';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('submissions');
  // Access is already enforced by ProtectedRoute in App.tsx

  const tabs = [
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'authors', label: 'Authors', icon: Users },
    { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
    { id: 'constellations', label: 'Constellations', icon: Star },
    { id: 'journeys', label: 'Journeys', icon: Scroll },
    { id: 'community', label: 'Community', icon: MessageCircle },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'posts', label: 'Posts', icon: Newspaper },
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
          {activeTab === 'submissions' && <AdminSubmissions />}
          {activeTab === 'authors' && <AdminAuthors />}
          {activeTab === 'catalogue' && <AdminCatalogue />}
          {activeTab === 'constellations' && <AdminConstellations />}
          {activeTab === 'journeys' && <AdminJourneys />}
          {activeTab === 'community' && <AdminCommunity />}
          {activeTab === 'events' && <AdminEvents />}
          {activeTab === 'posts' && <AdminPosts />}
        </motion.div>
      </main>
    </div>
  );
}
