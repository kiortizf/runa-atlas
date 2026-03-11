import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, DollarSign, Settings, MessageSquare, Bell, LogOut, User, Star, X, Send, ExternalLink, Clock, CheckCircle, AlertCircle, Circle, ChevronRight, Loader2, Save, Folder, Download, Globe, Twitter, Instagram, BookMarked, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, setDoc, serverTimestamp, Timestamp, orderBy, updateDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

// ─── Types ──────────────────────────────────────────
interface Submission {
  id: string;
  trackingId?: string;
  title: string;
  status: string;
  genre?: string;
  wordCount?: number;
  compTitles?: string;
  authorName?: string;
  penName?: string;
  email?: string;
  pronouns?: string;
  bio?: string;
  synopsis?: string;
  queryLetter?: string;
  contentWarnings?: string;
  representationStatus?: string;
  previouslyPublished?: string;
  targetAudience?: string;
  synopsisFileUrl?: string;
  sampleFileUrl?: string;
  createdAt: Timestamp;
}

interface AdminNote {
  id: string;
  text: string;
  author: string;
  createdAt: Timestamp;
}

interface Message {
  id: string;
  text: string;
  sender: 'author' | 'admin';
  senderName: string;
  read: boolean;
  createdAt: Timestamp;
}

interface UserProfile {
  legalName: string;
  penName: string;
  email: string;
  pronouns: string;
  bio: string;
  website: string;
  twitter: string;
  instagram: string;
  goodreads: string;
}

interface AuthorDocument {
  id: string;
  name: string;
  type: 'contract' | 'tax' | 'editorial' | 'other';
  url: string;
  uploadedAt: any;
  description?: string;
}

interface RoyaltyStatement {
  id: string;
  quarter: string;
  year: number;
  bookTitle: string;
  unitsSold: number;
  grossRevenue: number;
  netRoyalty: number;
  paidAt?: Timestamp;
}

// ─── Status Config ──────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Circle }> = {
  draft: { label: 'Draft', color: 'text-text-muted', bg: 'bg-surface', icon: Circle },
  pending: { label: 'Submitted', color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', icon: Clock },
  reviewing: { label: 'Under Review', color: 'text-ember-orange', bg: 'bg-ember-orange/10', icon: AlertCircle },
  accepted: { label: 'Accepted', color: 'text-aurora-teal', bg: 'bg-aurora-teal/10', icon: CheckCircle },
  rejected: { label: 'Declined', color: 'text-forge-red', bg: 'bg-forge-red/10', icon: X },
  revision_requested: { label: 'Revisions Requested', color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10', icon: FileText },
};

const TIMELINE_STAGES = ['pending', 'reviewing', 'accepted'];

export default function Portal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, userRole, isAuthReady, signIn, logOut } = useAuth();
  const navigate = useNavigate();

  // Data
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals & state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState<AdminNote[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ legalName: '', penName: '', email: '', pronouns: '', bio: '', website: '', twitter: '', instagram: '', goodreads: '' });
  const [documents, setDocuments] = useState<AuthorDocument[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [royalties, setRoyalties] = useState<RoyaltyStatement[]>([]);

  // Messages
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Load Submissions ─────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'submissions'), where('authorId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // ─── Load Messages ────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'messages'), where('uid', '==', user.uid), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
      setUnreadCount(msgs.filter(m => !m.read && m.sender === 'admin').length);
    });
    return () => unsub();
  }, [user]);

  // ─── Load Profile ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            legalName: data.legalName || user.displayName || '',
            penName: data.penName || '',
            email: data.email || user.email || '',
            pronouns: data.pronouns || '',
            bio: data.bio || '',
            website: data.website || '',
            twitter: data.twitter || '',
            instagram: data.instagram || '',
            goodreads: data.goodreads || '',
          });
        } else {
          setProfile({
            legalName: user.displayName || '',
            penName: '',
            email: user.email || '',
            pronouns: '',
            bio: '',
            website: '',
            twitter: '',
            instagram: '',
            goodreads: '',
          });
        }
      } catch { /* ignore */ }
    };
    loadProfile();
  }, [user]);

  // ─── Load Royalties ───────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'royalties'), where('authorId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setRoyalties(snap.docs.map(d => ({ id: d.id, ...d.data() } as RoyaltyStatement)));
    });
    return () => unsub();
  }, [user]);

  // ─── Load Documents ────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'authorDocuments'), where('authorId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuthorDocument));
      setDocuments(docs.length > 0 ? docs : [
        { id: 'demo-1', name: 'Publishing Agreement: The Hollow Crown', type: 'contract', url: '#', uploadedAt: new Date('2027-01-15'), description: 'Standard publishing contract' },
        { id: 'demo-2', name: 'W-9 Tax Form (2027)', type: 'tax', url: '#', uploadedAt: new Date('2027-01-20'), description: 'Required for US royalty payments' },
        { id: 'demo-3', name: 'Style Guide: Rüna Atlas', type: 'editorial', url: '#', uploadedAt: new Date('2027-02-01'), description: 'House style and formatting guide' },
        { id: 'demo-4', name: 'Developmental Edit Report', type: 'editorial', url: '#', uploadedAt: new Date('2027-03-10'), description: 'Dev edit notes for The Hollow Crown' },
      ]);
    });
    return () => unsub();
  }, [user]);

  // ─── Load Submission Notes ────────────────────────
  const loadNotes = async (subId: string) => {
    try {
      const q = query(collection(db, `submissions/${subId}/notes`), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      setSubmissionNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminNote)));
    } catch { setSubmissionNotes([]); }
  };

  // ─── Send Message ─────────────────────────────────
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    setSendingMessage(true);
    try {
      await addDoc(collection(db, 'messages'), {
        uid: user.uid,
        text: newMessage.trim(),
        sender: 'author',
        senderName: user.displayName || 'Author',
        read: false,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    } finally {
      setSendingMessage(false);
    }
  };

  // ─── Mark Messages Read ───────────────────────────
  useEffect(() => {
    if (activeTab !== 'messages' || !user) return;
    const unreadMsgs = messages.filter(m => !m.read && m.sender === 'admin');
    unreadMsgs.forEach(async (m) => {
      try { await updateDoc(doc(db, 'messages', m.id), { read: true }); } catch { /* ignore */ }
    });
  }, [activeTab, messages, user]);

  // ─── Save Profile ─────────────────────────────────
  const saveProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── Auth Gates ───────────────────────────────────
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <Star className="w-12 h-12 text-starforge-gold animate-pulse" />
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
          <button onClick={signIn}
            className="w-full px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider font-semibold rounded-sm hover:bg-yellow-500 transition-colors">
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  // ─── Nav items ────────────────────────────────────
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'manuscripts', label: 'Manuscripts', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'royalties', label: 'Royalties', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // ─── Submission Detail Modal ──────────────────────
  const SubmissionModal = () => {
    if (!selectedSubmission) return null;
    const sub = selectedSubmission;
    const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;

    const currentStageIdx = TIMELINE_STAGES.indexOf(sub.status);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSubmission(null)}>
        <div className="absolute inset-0 bg-void-black/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-deep-space border border-border rounded-sm max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-deep-space border-b border-border p-6 flex justify-between items-start z-10">
            <div>
              <p className="font-mono text-xs text-starforge-gold mb-1">{sub.trackingId || sub.id.slice(0, 10)}</p>
              <h2 className="font-heading text-2xl text-text-primary">{sub.title}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-semibold ${cfg.bg} ${cfg.color}`}>
                  <StatusIcon className="w-3 h-3" /> {cfg.label}
                </span>
                {sub.genre && <span className="font-ui text-xs text-text-muted">{sub.genre}</span>}
                {sub.wordCount && <span className="font-ui text-xs text-text-muted">{sub.wordCount?.toLocaleString()} words</span>}
              </div>
            </div>
            <button onClick={() => setSelectedSubmission(null)} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Status Timeline */}
            <div>
              <h3 className="font-ui text-xs text-text-muted uppercase tracking-wider mb-4">Status Timeline</h3>
              <div className="flex items-center gap-0">
                {TIMELINE_STAGES.map((stage, i) => {
                  const stageCfg = STATUS_CONFIG[stage];
                  const isPast = currentStageIdx >= i;
                  const isCurrent = sub.status === stage;
                  return (
                    <div key={stage} className="flex items-center flex-1">
                      <div className={`flex flex-col items-center ${i > 0 ? 'flex-1' : ''}`}>
                        {i > 0 && (
                          <div className={`h-0.5 w-full mb-2 ${isPast ? 'bg-aurora-teal' : 'bg-border'}`} />
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isCurrent ? 'border-starforge-gold bg-starforge-gold/20 scale-110' :
                          isPast ? 'border-aurora-teal bg-aurora-teal/10' : 'border-border bg-surface'
                          }`}>
                          {isPast ? <CheckCircle className={`w-4 h-4 ${isCurrent ? 'text-starforge-gold' : 'text-aurora-teal'}`} /> :
                            <Circle className="w-4 h-4 text-text-muted" />}
                        </div>
                        <span className={`font-ui text-[10px] mt-1.5 uppercase tracking-wider ${isCurrent ? 'text-starforge-gold font-semibold' : isPast ? 'text-aurora-teal' : 'text-text-muted'}`}>
                          {stageCfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(sub.status === 'rejected' || sub.status === 'revision_requested') && (
                <div className={`mt-4 p-3 rounded-sm border ${sub.status === 'rejected' ? 'border-forge-red/30 bg-forge-red/5' : 'border-cosmic-purple/30 bg-cosmic-purple/5'}`}>
                  <p className={`font-ui text-sm ${sub.status === 'rejected' ? 'text-forge-red' : 'text-cosmic-purple'}`}>
                    {sub.status === 'rejected' ? 'This submission was declined.' : 'Revisions have been requested.'}
                  </p>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div>
              <h3 className="font-ui text-xs text-text-muted uppercase tracking-wider mb-4">Submission Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {sub.compTitles && <DetailField label="Comp Titles" value={sub.compTitles} />}
                {sub.targetAudience && <DetailField label="Target Audience" value={sub.targetAudience} />}
                {sub.representationStatus && <DetailField label="Representation" value={sub.representationStatus} />}
                {sub.previouslyPublished && <DetailField label="Previously Published" value={sub.previouslyPublished} />}
                {sub.contentWarnings && <DetailField label="Content Warnings" value={sub.contentWarnings} />}
                <DetailField label="Submitted" value={sub.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'} />
              </div>
            </div>

            {/* Synopsis */}
            {sub.synopsis && (
              <div>
                <h3 className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">Synopsis</h3>
                <p className="font-body text-sm text-text-secondary leading-relaxed whitespace-pre-line">{sub.synopsis}</p>
              </div>
            )}

            {/* Files */}
            {(sub.synopsisFileUrl || sub.sampleFileUrl) && (
              <div>
                <h3 className="font-ui text-xs text-text-muted uppercase tracking-wider mb-3">Uploaded Files</h3>
                <div className="flex gap-3">
                  {sub.synopsisFileUrl && (
                    <a href={sub.synopsisFileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-sm font-ui text-sm text-text-primary hover:border-starforge-gold/50 transition-colors">
                      <FileText className="w-4 h-4 text-starforge-gold" /> Synopsis PDF <ExternalLink className="w-3 h-3 text-text-muted" />
                    </a>
                  )}
                  {sub.sampleFileUrl && (
                    <a href={sub.sampleFileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-sm font-ui text-sm text-text-primary hover:border-starforge-gold/50 transition-colors">
                      <FileText className="w-4 h-4 text-starforge-gold" /> Manuscript Sample <ExternalLink className="w-3 h-3 text-text-muted" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {submissionNotes.length > 0 && (
              <div>
                <h3 className="font-ui text-xs text-text-muted uppercase tracking-wider mb-3">Editorial Notes</h3>
                <div className="space-y-3">
                  {submissionNotes.map(note => (
                    <div key={note.id} className="bg-surface border border-border rounded-sm p-4">
                      <p className="font-body text-sm text-text-secondary">{note.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-ui text-[10px] text-starforge-gold">{note.author}</span>
                        <span className="font-ui text-[10px] text-text-muted">{note.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  const DetailField = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-surface p-3 rounded-sm border border-border">
      <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="font-ui text-sm text-text-primary capitalize">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-void-black flex flex-col md:flex-row">

      {/* ─── Sidebar ─── */}
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
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === item.id ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}>
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.badge ? <span className="ml-auto bg-forge-red text-white text-[10px] px-2 py-0.5 rounded-full">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          {userRole === 'admin' && (
            <button onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm text-starforge-gold hover:bg-starforge-gold/10 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
            </button>
          )}
          <button onClick={logOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm text-text-muted hover:text-forge-red transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* Topbar */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-border">
          <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('messages')} className="p-2 text-text-secondary hover:text-starforge-gold transition-colors relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-forge-red rounded-full" />}
            </button>
            <button onClick={() => setActiveTab('profile')} className="p-2 text-text-secondary hover:text-starforge-gold transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ──────────────────────────────────────────── */}
        {/* DASHBOARD TAB                                */}
        {/* ──────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Submissions', value: submissions.filter(s => s.status !== 'draft').length, color: 'text-text-primary' },
                { label: 'Pending Review', value: submissions.filter(s => s.status === 'pending' || s.status === 'reviewing').length, color: 'text-starforge-gold' },
                { label: 'Accepted', value: submissions.filter(s => s.status === 'accepted').length, color: 'text-aurora-teal' },
                { label: 'Unread Messages', value: unreadCount, color: unreadCount > 0 ? 'text-forge-red' : 'text-text-primary' },
              ].map(stat => (
                <div key={stat.label} className="bg-surface border border-border p-6 rounded-sm">
                  <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className={`font-display text-3xl ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Submissions */}
            <div className="bg-surface border border-border rounded-sm">
              <div className="p-4 border-b border-border bg-deep-space flex justify-between items-center">
                <h3 className="font-heading text-lg text-text-primary font-semibold">Recent Submissions</h3>
                <button onClick={() => navigate('/submissions')}
                  className="font-ui text-xs text-starforge-gold uppercase tracking-wider hover:text-yellow-400 transition-colors flex items-center gap-1">
                  New Submission <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {submissions.filter(s => s.status !== 'draft').length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                  <p className="font-ui text-sm text-text-muted mb-3">No submissions yet.</p>
                  <button onClick={() => navigate('/submissions')}
                    className="px-4 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors">
                    Submit Your First Manuscript
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {submissions.filter(s => s.status !== 'draft').slice(0, 5).map(sub => {
                    const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
                    return (
                      <button key={sub.id} onClick={() => { setSelectedSubmission(sub); loadNotes(sub.id); }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-void-black/50 transition-colors text-left">
                        <div className="flex-1 min-w-0">
                          <p className="font-heading text-sm text-text-primary truncate">{sub.title}</p>
                          <p className="font-mono text-[10px] text-text-muted">{sub.trackingId || sub.id.slice(0, 10)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => setActiveTab('messages')}
                className="bg-surface border border-border rounded-sm p-6 text-left hover:border-starforge-gold/30 transition-colors group">
                <MessageSquare className="w-6 h-6 text-starforge-gold mb-3" />
                <h4 className="font-heading text-lg text-text-primary group-hover:text-starforge-gold transition-colors">Messages</h4>
                <p className="font-ui text-sm text-text-secondary">
                  {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No new messages'}
                </p>
              </button>
              <button onClick={() => setActiveTab('royalties')}
                className="bg-surface border border-border rounded-sm p-6 text-left hover:border-starforge-gold/30 transition-colors group">
                <DollarSign className="w-6 h-6 text-starforge-gold mb-3" />
                <h4 className="font-heading text-lg text-text-primary group-hover:text-starforge-gold transition-colors">Royalties</h4>
                <p className="font-ui text-sm text-text-secondary">
                  {royalties.length > 0 ? `${royalties.length} statements available` : 'No royalty statements yet'}
                </p>
              </button>
            </div>
          </motion.div>
        )}

        {/* ──────────────────────────────────────────── */}
        {/* MANUSCRIPTS TAB                              */}
        {/* ──────────────────────────────────────────── */}
        {activeTab === 'manuscripts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl text-text-primary">Your Submissions</h2>
              <button onClick={() => navigate('/submissions')}
                className="px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors">
                New Submission
              </button>
            </div>

            {/* Drafts section */}
            {submissions.filter(s => s.status === 'draft').length > 0 && (
              <div className="mb-6">
                <h3 className="font-ui text-xs text-text-muted uppercase tracking-wider mb-3">Drafts</h3>
                <div className="space-y-2">
                  {submissions.filter(s => s.status === 'draft').map(sub => (
                    <div key={sub.id} className="bg-surface/50 border border-dashed border-border rounded-sm p-4 flex items-center justify-between">
                      <div>
                        <p className="font-heading text-sm text-text-secondary">{sub.title}</p>
                        <p className="font-ui text-[10px] text-text-muted">Saved {sub.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                      </div>
                      <span className="font-ui text-[10px] text-text-muted uppercase tracking-wider bg-surface px-2 py-1 rounded-sm">Draft</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submitted table */}
            <div className="bg-surface border border-border rounded-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-deep-space border-b border-border font-ui text-xs uppercase tracking-wider text-text-muted">
                    <th className="p-4 font-medium">Tracking ID</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Genre</th>
                    <th className="p-4 font-medium">Submitted</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-ui text-sm">
                  {submissions.filter(s => s.status !== 'draft').length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-text-muted">
                      No submissions yet. <button onClick={() => navigate('/submissions')} className="text-starforge-gold hover:underline">Submit your first manuscript</button>
                    </td></tr>
                  ) : submissions.filter(s => s.status !== 'draft').map(sub => {
                    const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-void-black/50 transition-colors">
                        <td className="p-4 text-starforge-gold font-mono text-xs">{sub.trackingId || sub.id.slice(0, 10)}</td>
                        <td className="p-4 text-text-primary font-medium">{sub.title}</td>
                        <td className="p-4 text-text-secondary capitalize">{sub.genre || 'N/A'}</td>
                        <td className="p-4 text-text-secondary">{sub.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => { setSelectedSubmission(sub); loadNotes(sub.id); }}
                            className="text-text-muted hover:text-starforge-gold transition-colors font-ui text-xs uppercase tracking-wider">
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ──────────────────────────────────────────── */}
        {/* MESSAGES TAB                                 */}
        {/* ──────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-12 h-12 text-text-muted/20 mb-4" />
                  <h3 className="font-heading text-xl text-text-primary mb-2">No Messages Yet</h3>
                  <p className="font-ui text-sm text-text-secondary max-w-sm">
                    Send a message to your editorial team. They'll respond here.
                  </p>
                </div>
              ) : messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'author' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md rounded-sm p-4 ${msg.sender === 'author'
                    ? 'bg-starforge-gold/10 border border-starforge-gold/20'
                    : 'bg-surface border border-border'
                    }`}>
                    <p className="font-body text-sm text-text-primary leading-relaxed">{msg.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`font-ui text-[10px] ${msg.sender === 'author' ? 'text-starforge-gold' : 'text-aurora-teal'}`}>
                        {msg.senderName}
                      </span>
                      <span className="font-ui text-[10px] text-text-muted">
                        {msg.createdAt?.toDate?.()?.toLocaleString() || ''}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Compose */}
            <div className="border-t border-border pt-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message to the editorial team..."
                  className="flex-1 bg-void-black border border-border rounded-sm px-4 py-3 text-text-primary focus:border-starforge-gold outline-none font-ui text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ──────────────────────────────────────────── */}
        {/* ROYALTIES TAB                                */}
        {/* ──────────────────────────────────────────── */}
        {activeTab === 'royalties' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {royalties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-starforge-gold/5 rounded-full flex items-center justify-center mb-6">
                  <DollarSign className="w-10 h-10 text-starforge-gold/30" />
                </div>
                <h3 className="font-heading text-2xl text-text-primary mb-2">No Royalty Statements Yet</h3>
                <p className="font-ui text-sm text-text-secondary max-w-md">
                  Once your book is published and sales begin, quarterly royalty statements will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-surface border border-border p-6 rounded-sm">
                    <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">Total Earned</p>
                    <p className="font-display text-3xl text-starforge-gold">
                      ${royalties.reduce((s, r) => s + r.netRoyalty, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-surface border border-border p-6 rounded-sm">
                    <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">Total Units Sold</p>
                    <p className="font-display text-3xl text-text-primary">
                      {royalties.reduce((s, r) => s + r.unitsSold, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-surface border border-border p-6 rounded-sm">
                    <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-2">Statements</p>
                    <p className="font-display text-3xl text-text-primary">{royalties.length}</p>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-surface border border-border rounded-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-deep-space border-b border-border font-ui text-xs uppercase tracking-wider text-text-muted">
                        <th className="p-4 font-medium">Period</th>
                        <th className="p-4 font-medium">Book</th>
                        <th className="p-4 font-medium text-right">Units Sold</th>
                        <th className="p-4 font-medium text-right">Gross Revenue</th>
                        <th className="p-4 font-medium text-right">Net Royalty</th>
                      </tr>
                    </thead>
                    <tbody className="font-ui text-sm">
                      {royalties.map(r => (
                        <tr key={r.id} className="border-b border-border last:border-0 hover:bg-void-black/50 transition-colors">
                          <td className="p-4 text-text-primary">{r.quarter} {r.year}</td>
                          <td className="p-4 text-text-primary font-medium">{r.bookTitle}</td>
                          <td className="p-4 text-text-secondary text-right">{r.unitsSold.toLocaleString()}</td>
                          <td className="p-4 text-text-secondary text-right">${r.grossRevenue.toFixed(2)}</td>
                          <td className="p-4 text-starforge-gold text-right font-semibold">${r.netRoyalty.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ──────────────────────────────────────────── */}
        {/* DOCUMENTS TAB                                */}
        {/* ──────────────────────────────────────────── */}
        {activeTab === 'documents' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <p className="font-ui text-sm text-text-secondary">Contracts, tax forms, and editorial documents shared with you.</p>

            {/* Group by type */}
            {(['contract', 'tax', 'editorial', 'other'] as const).map(type => {
              const typeDocs = documents.filter(d => d.type === type);
              if (typeDocs.length === 0) return null;
              const typeLabels = { contract: 'Contracts', tax: 'Tax Forms', editorial: 'Editorial Documents', other: 'Other' };
              const typeColors = { contract: 'text-starforge-gold', tax: 'text-forge-red', editorial: 'text-cosmic-purple', other: 'text-text-secondary' };
              return (
                <div key={type}>
                  <h3 className={`font-ui text-xs uppercase tracking-wider mb-3 ${typeColors[type]}`}>{typeLabels[type]}</h3>
                  <div className="space-y-2">
                    {typeDocs.map(d => (
                      <div key={d.id} className="bg-surface border border-border rounded-sm p-4 flex items-center justify-between group hover:border-starforge-gold/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className={`w-5 h-5 shrink-0 ${typeColors[d.type]}`} />
                          <div className="min-w-0">
                            <p className="font-heading text-sm text-text-primary truncate">{d.name}</p>
                            {d.description && <p className="font-ui text-[10px] text-text-muted">{d.description}</p>}
                          </div>
                        </div>
                        <a href={d.url} className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted hover:text-starforge-gold font-ui text-xs uppercase tracking-wider transition-colors shrink-0">
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {documents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center mb-6">
                  <Folder className="w-10 h-10 text-text-muted/30" />
                </div>
                <h3 className="font-heading text-2xl text-text-primary mb-2">No Documents Yet</h3>
                <p className="font-ui text-sm text-text-secondary max-w-md">Once contracts or editorial documents are shared with you, they'll appear here.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ──────────────────────────────────────────── */}
        {/* PROFILE TAB                                  */}
        {/* ──────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-full bg-surface border-2 border-starforge-gold/30 flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-10 h-10 text-starforge-gold" />
                )}
              </div>
              <div>
                <h2 className="font-heading text-2xl text-text-primary">{user.displayName}</h2>
                <p className="font-ui text-sm text-text-muted">{user.email}</p>
                <p className="font-ui text-[10px] text-starforge-gold uppercase tracking-wider mt-1">Profile photo synced from Google</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-ui text-sm text-text-secondary mb-2">Legal Name</label>
                  <input type="text" value={profile.legalName} onChange={e => setProfile({ ...profile, legalName: e.target.value })}
                    className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold outline-none font-ui" />
                </div>
                <div>
                  <label className="block font-ui text-sm text-text-secondary mb-2">Pen Name</label>
                  <input type="text" value={profile.penName} onChange={e => setProfile({ ...profile, penName: e.target.value })}
                    className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold outline-none font-ui" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-ui text-sm text-text-secondary mb-2">Email</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold outline-none font-ui" />
                </div>
                <div>
                  <label className="block font-ui text-sm text-text-secondary mb-2">Pronouns</label>
                  <input type="text" value={profile.pronouns} onChange={e => setProfile({ ...profile, pronouns: e.target.value })}
                    placeholder="e.g., she/they"
                    className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold outline-none font-ui" />
                </div>
              </div>
              <div>
                <label className="block font-ui text-sm text-text-secondary mb-2">Author Bio</label>
                <textarea rows={5} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself and your writing journey..."
                  className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold outline-none font-body resize-none" />
                <p className="font-ui text-xs text-text-muted mt-1 text-right">
                  {profile.bio.split(/\s+/).filter(Boolean).length} words
                </p>
              </div>

              {/* Social Links */}
              <div className="border-t border-border pt-6">
                <h3 className="font-ui text-xs text-text-muted uppercase tracking-wider mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-ui text-sm text-text-secondary mb-2 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Website</label>
                    <input type="url" value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })}
                      placeholder="https://yoursite.com"
                      className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold outline-none font-ui" />
                  </div>
                  <div>
                    <label className="font-ui text-sm text-text-secondary mb-2 flex items-center gap-2"><Twitter className="w-3.5 h-3.5" /> Twitter / X</label>
                    <input type="text" value={profile.twitter} onChange={e => setProfile({ ...profile, twitter: e.target.value })}
                      placeholder="@handle"
                      className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold outline-none font-ui" />
                  </div>
                  <div>
                    <label className="font-ui text-sm text-text-secondary mb-2 flex items-center gap-2"><Instagram className="w-3.5 h-3.5" /> Instagram</label>
                    <input type="text" value={profile.instagram} onChange={e => setProfile({ ...profile, instagram: e.target.value })}
                      placeholder="@handle"
                      className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold outline-none font-ui" />
                  </div>
                  <div>
                    <label className="font-ui text-sm text-text-secondary mb-2 flex items-center gap-2"><BookMarked className="w-3.5 h-3.5" /> Goodreads</label>
                    <input type="text" value={profile.goodreads} onChange={e => setProfile({ ...profile, goodreads: e.target.value })}
                      placeholder="https://goodreads.com/author/..."
                      className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold outline-none font-ui" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button onClick={saveProfile} disabled={profileLoading}
                  className="px-8 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider font-semibold rounded-sm hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
                {profileSaved && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 font-ui text-sm text-aurora-teal">
                    <CheckCircle className="w-4 h-4" /> Saved!
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && <SubmissionModal />}
      </AnimatePresence>
    </div>
  );
}
