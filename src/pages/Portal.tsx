import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, DollarSign, Settings, MessageSquare, Bell, LogOut, User, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface Submission {
  id: string;
  trackingId?: string;
  title: string;
  status: string;
  createdAt: Timestamp;
}

interface PublishedBook {
  id: string;
  title: string;
  pubDate: string;
  sales: number;
  royalties: string;
}

export default function Portal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, userRole, isAuthReady, signIn, logOut } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'submissions'), where('authorId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <Star className="w-12 h-12 text-starforge-gold animate-spin-slow" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-void-black flex flex-col items-center justify-center p-6">
        <div className="bg-surface border border-border p-10 rounded-sm max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-starforge-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-starforge-gold" />
          </div>
          <h1 className="font-display text-2xl text-text-primary mb-2 uppercase tracking-widest">Author Portal</h1>
          <p className="font-ui text-text-secondary mb-8">Access your manuscripts, royalties, and messages.</p>
          <button
            onClick={signIn}
            className="w-full px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider font-semibold rounded-sm hover:bg-yellow-600 transition-colors"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-black flex flex-col md:flex-row">

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-deep-space border-r border-border flex flex-col h-auto md:h-screen sticky top-0">
        <div className="p-6 border-b border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface border border-starforge-gold/30 flex items-center justify-center overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Author'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-6 h-6 text-starforge-gold" />
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-heading text-lg text-text-primary truncate">{user.displayName || 'Author'}</h2>
            <p className="font-ui text-xs text-starforge-gold uppercase tracking-wider">{userRole === 'admin' ? 'Admin' : 'Author'}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
          >
            <BookOpen className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('manuscripts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === 'manuscripts' ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
          >
            <FileText className="w-4 h-4" /> Manuscripts
          </button>
          <button
            onClick={() => setActiveTab('royalties')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === 'royalties' ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
          >
            <DollarSign className="w-4 h-4" /> Royalties
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === 'messages' ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
          >
            <MessageSquare className="w-4 h-4" /> Messages
            <span className="ml-auto bg-forge-red text-white text-[10px] px-2 py-0.5 rounded-full">2</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === 'profile' ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
          >
            <User className="w-4 h-4" /> Profile
          </button>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={logOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm text-text-muted hover:text-forge-red transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* Topbar */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-border">
          <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-text-secondary hover:text-starforge-gold transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-forge-red rounded-full"></span>
            </button>
            <button className="p-2 text-text-secondary hover:text-starforge-gold transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface border border-border p-6 rounded-sm shadow-sm">
                <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">Active Submissions</p>
                <p className="font-display text-3xl text-text-primary">{submissions.length}</p>
              </div>
              <div className="bg-surface border border-border p-6 rounded-sm shadow-sm">
                <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">Accepted</p>
                <p className="font-display text-3xl text-text-primary">{submissions.filter(s => s.status === 'accepted').length}</p>
              </div>
              <div className="bg-surface border border-border p-6 rounded-sm shadow-sm">
                <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">Pending Review</p>
                <p className="font-display text-3xl text-starforge-gold">{submissions.filter(s => s.status === 'pending' || s.status === 'reviewing').length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-surface border border-border rounded-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-deep-space">
                  <h3 className="font-heading text-lg text-text-primary font-semibold">Recent Activity</h3>
                </div>
                <div className="p-0">
                  <div className="p-4 border-b border-border last:border-0 flex gap-4 items-start hover:bg-void-black transition-colors">
                    <div className="w-8 h-8 rounded-full bg-aurora-teal/20 flex items-center justify-center shrink-0 mt-1">
                      <MessageSquare className="w-4 h-4 text-aurora-teal" />
                    </div>
                    <div>
                      <p className="font-ui text-sm text-text-primary mb-1">Editorial notes received for <span className="text-starforge-gold">Whispers of the Deep</span></p>
                      <p className="font-ui text-xs text-text-muted">2 hours ago</p>
                    </div>
                  </div>
                  <div className="p-4 border-b border-border last:border-0 flex gap-4 items-start hover:bg-void-black transition-colors">
                    <div className="w-8 h-8 rounded-full bg-starforge-gold/20 flex items-center justify-center shrink-0 mt-1">
                      <DollarSign className="w-4 h-4 text-starforge-gold" />
                    </div>
                    <div>
                      <p className="font-ui text-sm text-text-primary mb-1">Q3 Royalty Statement generated</p>
                      <p className="font-ui text-xs text-text-muted">Yesterday</p>
                    </div>
                  </div>
                  <div className="p-4 border-b border-border last:border-0 flex gap-4 items-start hover:bg-void-black transition-colors">
                    <div className="w-8 h-8 rounded-full bg-cosmic-purple/20 flex items-center justify-center shrink-0 mt-1">
                      <BookOpen className="w-4 h-4 text-cosmic-purple" />
                    </div>
                    <div>
                      <p className="font-ui text-sm text-text-primary mb-1">Pre-order campaign launched for <span className="text-starforge-gold">The Obsidian Crown</span></p>
                      <p className="font-ui text-xs text-text-muted">Oct 12, 2025</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-surface border border-border rounded-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-deep-space">
                  <h3 className="font-heading text-lg text-text-primary font-semibold">Action Items</h3>
                </div>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-forge-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-forge-red" />
                  </div>
                  <h4 className="font-ui text-md text-text-primary mb-2">Sign Contract Amendment</h4>
                  <p className="font-body text-sm text-text-secondary mb-6">Please review and sign the audiobook rights amendment for The Obsidian Crown.</p>
                  <button className="px-6 py-2 bg-forge-red text-white font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-red-700 transition-colors">
                    Review Document
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Manuscripts Content */}
        {activeTab === 'manuscripts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl text-text-primary">Your Submissions</h2>
              <button className="px-4 py-2 border border-starforge-gold text-starforge-gold font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-starforge-gold hover:text-void-black transition-colors">
                New Submission
              </button>
            </div>

            <div className="bg-surface border border-border rounded-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-deep-space border-b border-border font-ui text-xs uppercase tracking-wider text-text-muted">
                    <th className="p-4 font-medium">Tracking ID</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Submitted</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-ui text-sm">
                  {submissions.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-text-muted">No submissions yet. <button onClick={() => navigate('/submissions')} className="text-starforge-gold hover:underline">Submit your first manuscript</button></td></tr>
                  ) : submissions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-void-black transition-colors">
                      <td className="p-4 text-starforge-gold font-mono">{sub.trackingId || sub.id.slice(0, 10)}</td>
                      <td className="p-4 text-text-primary font-medium">{sub.title}</td>
                      <td className="p-4 text-text-secondary">{sub.createdAt?.toDate?.()?.toLocaleDateString() || '—'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${sub.status === 'accepted' ? 'bg-aurora-teal/20 text-aurora-teal' :
                            sub.status === 'reviewing' ? 'bg-ember-orange/20 text-ember-orange' :
                              sub.status === 'rejected' ? 'bg-forge-red/20 text-forge-red' :
                                'bg-surface-elevated text-text-secondary'
                          }`}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-text-muted hover:text-starforge-gold transition-colors">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === 'royalties' || activeTab === 'messages' || activeTab === 'profile') && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 text-center">
            <Star className="w-12 h-12 text-starforge-gold/30 mb-6 animate-pulse" />
            <h2 className="font-heading text-2xl text-text-primary mb-2">Section Under Construction</h2>
            <p className="font-ui text-text-secondary max-w-md">The Starforge is currently expanding this section. Check back soon for updates.</p>
          </motion.div>
        )}

      </main>
    </div>
  );
}
