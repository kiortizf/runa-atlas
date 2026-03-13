import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Vote, ArrowRight, ChevronDown, ChevronUp, Send, Users, Clock,
  Trophy, Heart, MessageCircle, Sparkles, Plus, ThumbsUp, CheckCircle, LogIn,
  X, Target, Calendar, BookOpen, Archive, BarChart3
} from 'lucide-react';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, increment, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';

// ─── Types ──────────────────────────────────────────
type ForgeProject = {
  id: string; type: 'anthology_vote' | 'cover_reveal' | 'story_poll';
  title: string; description: string;
  options: { id: string; label: string; imageUrl?: string; votes: number; description?: string }[];
  totalVotes: number; deadline: Timestamp; status: 'active' | 'closed' | 'upcoming';
  bookId?: string; createdAt?: any;
};

type ReaderCircle = {
  id: string; name: string; focus: string; members: number; status: string;
  description: string; currentRead?: string; schedule?: string[];
};
type QASession = { id: string; title: string; author: string; date: Timestamp; link: string; isPersistent?: boolean };
type QAQuestion = { id: string; text: string; author: string; upvotes: number; answer?: string; createdAt: any };
type Discussion = { id: string; text: string; author: string; createdAt: any };

type TabId = 'votes' | 'archive' | 'circles' | 'qa' | 'challenges';

// ─── Seed Data ──────────────────────────────────────
const _seedProjects: ForgeProject[] = [];

const hardcodedCircles: ReaderCircle[] = [
  { id: 'circle-1', name: 'The Obsidian Spire', focus: 'Dark Fantasy & Horror', members: 24, status: 'Accepting Applications',
    description: 'Dive into the darker side of speculative fiction — atmospheric horror, grimdark fantasy, and psychological thrillers.',
    currentRead: 'The Hollow Crown by Maren Voss', schedule: ['Ch. 1-5 by Mar 15', 'Ch. 6-12 by Mar 28', 'Final Discussion Apr 5'] },
  { id: 'circle-2', name: 'Neon Horizons', focus: 'Cyberpunk & Sci-Fi', members: 38, status: 'Closed',
    description: 'Exploring the intersection of humanity and technology. Discussions on AI, cybernetics, and dystopian futures.',
    currentRead: 'Signal Bloom by Ada Chen', schedule: ['Part I by Mar 20', 'Part II by Apr 3', 'Wrap-up Apr 10'] },
];
const hardcodedQA: QASession = {
  id: 'qa-1', title: 'Worldbuilding in the Void', author: 'Elena Rostova',
  date: Timestamp.fromDate(new Date(Date.now() + 86400000 * 3)), link: '#', isPersistent: true,
};

export default function Forge() {
  usePageSEO({ title: 'The Forge', description: 'Shape the future of Rüna Atlas — vote on anthology themes, join reader circles, participate in author Q&As, and take on reading challenges.' });
  const { user, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('votes');

  // ─── Votes state ───
  const [projects, setProjects] = useState<ForgeProject[]>([]);
  const [votedProjects, setVotedProjects] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState('all');



  // ─── Reader Circles state ───
  const [circles, setCircles] = useState<ReaderCircle[]>([]);
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);
  const [circleDiscussions, setCircleDiscussions] = useState<Record<string, Discussion[]>>({});
  const [newDiscPost, setNewDiscPost] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<ReaderCircle | null>(null);
  const [applicationForm, setApplicationForm] = useState({ name: '', email: '', whyJoin: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // ─── Q&A state ───
  const [qaSessions, setQaSessions] = useState<QASession[]>([]);
  const [expandedQA, setExpandedQA] = useState<string | null>(null);
  const [qaQuestions, setQaQuestions] = useState<Record<string, QAQuestion[]>>({});
  const [newQuestion, setNewQuestion] = useState('');
  const [votedQuestions, setVotedQuestions] = useState<string[]>([]);

  // ─── Reading Challenge state ───
  const [challengeGoal, setChallengeGoal] = useState(12);
  const [challengeCompleted, setChallengeCompleted] = useState(0);
  const [showGoalEditor, setShowGoalEditor] = useState(false);

  const [loading, setLoading] = useState(true);


  // ─── Load Data ───
  useEffect(() => {
    const savedQVotes = localStorage.getItem('votedQuestions');
    if (savedQVotes) setVotedQuestions(JSON.parse(savedQVotes));

    const unsubs = [
      onSnapshot(collection(db, 'forgeProjects'), s => setProjects(s.docs.length > 0 ? s.docs.map(d => ({ id: d.id, ...d.data() } as ForgeProject)) : _seedProjects), () => setProjects(_seedProjects)),

      onSnapshot(collection(db, 'readerCircles'), s => setCircles(s.docs.length > 0 ? s.docs.map(d => ({ id: d.id, ...d.data() } as ReaderCircle)) : hardcodedCircles), () => setCircles(hardcodedCircles)),
      onSnapshot(collection(db, 'qaSessions'), s => { setQaSessions(s.docs.length > 0 ? s.docs.map(d => ({ id: d.id, ...d.data() } as QASession)) : [hardcodedQA]); setLoading(false); }, () => { setQaSessions([hardcodedQA]); setLoading(false); }),
    ];
    return () => unsubs.forEach(u => typeof u === 'function' && u());
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadVotes = async () => { try { const s = await getDoc(doc(db, 'users', user.uid, 'forgeVotes', 'all')); if (s.exists()) setVotedProjects(s.data() as Record<string, string>); } catch {} };
    loadVotes();
  }, [user]);

  useEffect(() => {
    if (!expandedCircle) return;
    const unsub = onSnapshot(query(collection(db, `readerCircles/${expandedCircle}/discussions`), orderBy('createdAt', 'asc')),
      s => setCircleDiscussions(prev => ({ ...prev, [expandedCircle]: s.docs.map(d => ({ id: d.id, ...d.data() } as Discussion)) })), () => {});
    return () => unsub();
  }, [expandedCircle]);

  useEffect(() => {
    if (!expandedQA) return;
    const unsub = onSnapshot(query(collection(db, `qaSessions/${expandedQA}/questions`), orderBy('upvotes', 'desc')),
      s => setQaQuestions(prev => ({ ...prev, [expandedQA]: s.docs.map(d => ({ id: d.id, ...d.data() } as QAQuestion)) })), () => {});
    return () => unsub();
  }, [expandedQA]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, `users/${user.uid}/readingChallenge`, '2027'), snap => {
      if (snap.exists()) { setChallengeGoal(snap.data().goal || 12); setChallengeCompleted(snap.data().completed || 0); }
    }, () => {});
    return () => unsub();
  }, [user]);

  // ─── Handlers ───
  const handleVote = async (projectId: string, optionId: string) => {
    if (!user) { signIn(); return; }
    if (votedProjects[projectId]) return;
    const newVoted = { ...votedProjects, [projectId]: optionId };
    setVotedProjects(newVoted);
    setProjects(prev => prev.map(p => p.id !== projectId ? p : { ...p, totalVotes: p.totalVotes + 1, options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) }));
    try { await setDoc(doc(db, 'users', user.uid, 'forgeVotes', 'all'), newVoted, { merge: true }); await updateDoc(doc(db, 'forgeProjects', projectId), { totalVotes: increment(1) }); } catch (e) { handleFirestoreError(e, OperationType.UPDATE, 'forgeProjects'); }
  };



  const postDiscussion = async (circleId: string) => {
    if (!user || !newDiscPost.trim()) return;
    try { await addDoc(collection(db, `readerCircles/${circleId}/discussions`), { text: newDiscPost.trim(), author: user.displayName || 'Anonymous', createdAt: serverTimestamp() }); setNewDiscPost(''); } catch {}
  };

  const handleApplyClick = (circle: ReaderCircle) => { setSelectedCircle(circle); setIsModalOpen(true); setSubmitStatus('idle'); setApplicationForm({ name: '', email: '', whyJoin: '' }); };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitStatus('submitting');
    try { await addDoc(collection(db, 'circleApplications'), { circleId: selectedCircle?.id, ...applicationForm, userId: user?.uid, createdAt: serverTimestamp() }); } catch {}
    setSubmitStatus('success'); setTimeout(() => { setIsModalOpen(false); setSelectedCircle(null); }, 2000);
  };

  const submitQuestion = async (sessionId: string) => {
    if (!user || !newQuestion.trim()) return;
    try { await addDoc(collection(db, `qaSessions/${sessionId}/questions`), { text: newQuestion.trim(), author: user.displayName || 'Anonymous', upvotes: 0, createdAt: serverTimestamp() }); setNewQuestion(''); } catch {}
  };

  const upvoteQuestion = async (sessionId: string, questionId: string) => {
    if (votedQuestions.includes(questionId)) return;
    try { const q = qaQuestions[sessionId]?.find(x => x.id === questionId); if (q) { await updateDoc(doc(db, `qaSessions/${sessionId}/questions`, questionId), { upvotes: (q.upvotes || 0) + 1 }); const updated = [...votedQuestions, questionId]; setVotedQuestions(updated); localStorage.setItem('votedQuestions', JSON.stringify(updated)); } } catch {}
  };

  const updateChallengeGoal = async (goal: number) => {
    if (!user) return;
    try { await setDoc(doc(db, `users/${user.uid}/readingChallenge`, '2027'), { goal, completed: challengeCompleted, updatedAt: serverTimestamp() }, { merge: true }); setChallengeGoal(goal); setShowGoalEditor(false); } catch {}
  };

  const markBookCompleted = async () => {
    if (!user) return; const n = challengeCompleted + 1;
    try { await setDoc(doc(db, `users/${user.uid}/readingChallenge`, '2027'), { goal: challengeGoal, completed: n, updatedAt: serverTimestamp() }, { merge: true }); setChallengeCompleted(n); } catch {}
  };

  const filteredProjects = filterType === 'all' ? projects : projects.filter(p => p.type === filterType);
  const getDeadlineText = (d: Timestamp) => { const diff = Math.ceil((d.toDate().getTime() - Date.now()) / 86400000); return diff < 0 ? 'Closed' : diff === 0 ? 'Last day!' : `${diff} days left`; };
  const getTypeLabel = (t: string) => ({ anthology_vote: 'Anthology Vote', cover_reveal: 'Cover Reveal', story_poll: 'Story Poll' }[t] || t);
  const getTypeColor = (t: string) => ({ anthology_vote: 'text-starforge-gold bg-starforge-gold/10 border-starforge-gold/30', cover_reveal: 'text-queer-pink bg-queer-pink/10 border-queer-pink/30', story_poll: 'text-aurora-teal bg-aurora-teal/10 border-aurora-teal/30' }[t] || 'text-text-muted bg-surface border-border');
  const getDate = (d: any) => { if (!d) return ''; if (d instanceof Timestamp) return d.toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); if (d?.seconds) return new Date(d.seconds * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); return ''; };

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'votes', label: 'Shape the Future', icon: Vote },
    { id: 'archive', label: 'Runeweave Archive', icon: Archive },
    { id: 'circles', label: 'Reader Circles', icon: Users },
    { id: 'qa', label: 'Author Q&A', icon: MessageCircle },
    { id: 'challenges', label: 'Challenges', icon: Target },

  ];

  if (loading) return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Loading…</div>;

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-forge-red/10 text-forge-red border border-forge-red/30 px-4 py-1.5 rounded-full font-ui text-[10px] uppercase tracking-widest mb-6">
            <Flame className="w-3 h-3" /> Reader-Shaped Publishing
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            The <span className="text-starforge-gold italic font-heading normal-case">Forge</span>
          </h1>
          <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Vote on what gets published. Join reader circles. Ask authors anything. Take on challenges. Build worlds together.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-ui text-sm transition-all ${activeTab === tab.id ? 'bg-starforge-gold text-void-black font-medium' : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-starforge-gold/30'}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ═══ VOTES TAB ═══ */}
        {activeTab === 'votes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {['all', 'anthology_vote', 'cover_reveal', 'story_poll'].map(type => (
                <button key={type} onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-full font-ui text-xs uppercase tracking-wider transition-all ${filterType === type ? 'bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30' : 'bg-surface border border-border text-text-muted hover:text-text-primary'}`}>
                  {type === 'all' ? 'All Projects' : getTypeLabel(type)}
                </button>
              ))}
            </div>
            {filteredProjects.length === 0 && (
              <div className="bg-surface border border-border rounded-sm p-12 text-center">
                <Vote className="w-10 h-10 text-text-muted/20 mx-auto mb-4" />
                <p className="font-heading text-lg text-text-primary mb-2">No Active Votes</p>
                <p className="font-ui text-xs text-text-muted">Check back soon — new polls and votes are added regularly.</p>
              </div>
            )}
            {filteredProjects.map((project, idx) => {
              const hasVoted = !!votedProjects[project.id]; const userChoice = votedProjects[project.id]; const maxVotes = Math.max(...project.options.map(o => o.votes));
              return (
                <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-surface border border-border rounded-sm overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-ui mb-2 ${getTypeColor(project.type)}`}>{getTypeLabel(project.type)}</span>
                        <h3 className="font-heading text-xl md:text-2xl text-text-primary">{project.title}</h3>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display text-xl text-starforge-gold">{project.totalVotes.toLocaleString()}</p>
                        <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider">total votes</p>
                      </div>
                    </div>
                    <p className="font-body text-sm text-text-secondary mb-6 leading-relaxed">{project.description}</p>
                    <div className={`${project.type === 'cover_reveal' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : 'space-y-3'}`}>
                      {project.options.map(option => {
                        const pct = project.totalVotes > 0 ? Math.round((option.votes / project.totalVotes) * 100) : 0;
                        const isWinning = option.votes === maxVotes; const isUserChoice = userChoice === option.id;

                        if (project.type === 'cover_reveal') {
                          return (
                            <button key={option.id} onClick={() => handleVote(project.id, option.id)} disabled={hasVoted}
                              className={`relative group rounded-sm overflow-hidden border transition-all ${isUserChoice ? 'border-starforge-gold ring-2 ring-starforge-gold/30' : 'border-border hover:border-starforge-gold/50'}`}>
                              {option.imageUrl && <img src={option.imageUrl} alt={option.label} className="w-full aspect-[2/3] object-cover" referrerPolicy="no-referrer" />}
                              <div className="absolute inset-0 bg-gradient-to-t from-void-black/90 via-transparent to-transparent flex flex-col justify-end p-4">
                                <p className="font-heading text-sm text-text-primary">{option.label}</p>
                                {option.description && <p className="font-ui text-[10px] text-text-muted mt-1">{option.description}</p>}
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="font-display text-lg text-starforge-gold">{pct}%</span>
                                  <span className="font-ui text-[10px] text-text-muted">{option.votes} votes</span>
                                </div>
                                {hasVoted && (
                                  <div className="w-full bg-void-black/50 rounded-full h-1.5 mt-2">
                                    <div className="h-full rounded-full bg-starforge-gold transition-all duration-700" style={{ width: `${pct}%` }} />
                                  </div>
                                )}
                              </div>
                              {isUserChoice && <div className="absolute top-2 right-2 bg-starforge-gold rounded-full p-1"><CheckCircle className="w-4 h-4 text-void-black" /></div>}
                            </button>
                          );
                        }

                        return (
                          <button key={option.id} onClick={() => handleVote(project.id, option.id)} disabled={hasVoted}
                            className={`w-full text-left rounded-sm border p-4 transition-all relative overflow-hidden ${isUserChoice ? 'border-starforge-gold bg-starforge-gold/5' : hasVoted ? 'border-border bg-surface/50' : 'border-border hover:border-starforge-gold/50 bg-surface/50'}`}>
                            {hasVoted && <div className={`absolute inset-0 ${isWinning ? 'bg-starforge-gold/10' : 'bg-surface-elevated/30'} transition-all duration-700`} style={{ width: `${pct}%` }} />}
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {isUserChoice && <CheckCircle className="w-4 h-4 text-starforge-gold" />}
                                <p className={`font-heading text-sm ${isWinning && hasVoted ? 'text-starforge-gold' : 'text-text-primary'}`}>{option.label}</p>
                              </div>
                              {hasVoted && <div className="flex items-center gap-3"><span className="font-display text-lg text-text-primary">{pct}%</span><span className="font-ui text-[10px] text-text-muted">{option.votes}</span></div>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 font-ui text-xs text-text-muted"><Clock className="w-3 h-3" /> {getDeadlineText(project.deadline)}</div>
                      {!user && <button onClick={signIn} className="flex items-center gap-1 font-ui text-xs text-starforge-gold hover:text-white transition-colors"><LogIn className="w-3 h-3" /> Sign in to vote</button>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ═══ ARCHIVE TAB ═══ */}
        {activeTab === 'archive' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="bg-surface border border-starforge-gold/20 rounded-sm p-12 text-center">
              <Archive className="w-12 h-12 text-starforge-gold mx-auto mb-4" />
              <h2 className="font-display text-3xl text-text-primary uppercase tracking-widest mb-3">The Runeweave <span className="text-starforge-gold italic font-heading normal-case">Archive</span></h2>
              <p className="font-body text-text-secondary max-w-xl mx-auto mb-8">Reader-made artifacts from the Atlas — glossaries, playlists, moodboards, curated lists, craft essays, quizzes, and more. Non-canon. Community-driven. Never fanfiction.</p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/archive" className="inline-flex items-center gap-2 px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
                  <BookOpen className="w-4 h-4" /> Browse the Archive
                </Link>
                <Link to="/archive/submit" className="inline-flex items-center gap-2 px-6 py-3 border border-starforge-gold/30 text-starforge-gold font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-starforge-gold/5 transition-colors">
                  <Plus className="w-4 h-4" /> Submit an Artifact
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{ icon: '📜', title: 'Field Notes & Letters', desc: 'Found documents, glossaries, postcards set in book worlds' },
                { icon: '🎨', title: 'Moodboards & Palettes', desc: 'Visual and aesthetic companions for published titles' },
                { icon: '🧩', title: 'Quizzes & Challenges', desc: 'Interactive community games tied to themes and motifs' },
              ].map(c => (
                <div key={c.title} className="bg-surface border border-border rounded-sm p-6">
                  <span className="text-2xl mb-3 block">{c.icon}</span>
                  <h3 className="font-heading text-sm text-text-primary mb-1">{c.title}</h3>
                  <p className="font-ui text-xs text-text-muted">{c.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ READER CIRCLES TAB ═══ */}
        {activeTab === 'circles' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="font-body text-sm text-text-secondary">Join themed reading groups, discuss books in real time, and connect with other readers.</p>
              <Link to="/book-clubs" className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors shrink-0">
                <Users className="w-4 h-4" /> Browse All Circles
              </Link>
            </div>
            {circles.map(circle => {
              const isExpanded = expandedCircle === circle.id; const discussions = circleDiscussions[circle.id] || [];
              return (
                <div key={circle.id} className="bg-deep-space border border-border rounded-sm overflow-hidden hover:border-starforge-gold/20 transition-colors">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-heading text-xl text-text-primary">{circle.name}</h3>
                        <p className="font-ui text-xs text-starforge-gold uppercase tracking-wider mt-1">{circle.focus}</p>
                      </div>
                      <span className={`font-ui text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${circle.status === 'Accepting Applications' ? 'bg-aurora-teal/20 text-aurora-teal' : 'bg-surface-elevated text-text-muted'}`}>{circle.status}</span>
                    </div>
                    <p className="font-body text-text-secondary mb-4">{circle.description}</p>
                    {circle.currentRead && (
                      <div className="bg-void-black border border-border rounded-sm p-3 mb-4">
                        <p className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-1">Currently Reading</p>
                        <p className="font-heading text-sm text-starforge-gold">{circle.currentRead}</p>
                      </div>
                    )}
                    {circle.schedule && circle.schedule.length > 0 && (
                      <div className="mb-4">
                        <p className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-2">Schedule</p>
                        <div className="flex gap-2 flex-wrap">
                          {circle.schedule.map((s, i) => <span key={i} className="font-mono text-[10px] text-text-secondary bg-void-black px-2 py-1 rounded-sm border border-border"><Calendar className="w-2.5 h-2.5 inline mr-1 text-text-muted" />{s}</span>)}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <span className="font-ui text-xs text-text-muted">{circle.members} Active Members</span>
                        <button onClick={() => setExpandedCircle(isExpanded ? null : circle.id)} className="flex items-center gap-1 font-ui text-xs text-text-muted hover:text-starforge-gold transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" /> Discussion {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                      <button onClick={() => user ? handleApplyClick(circle) : signIn()} disabled={circle.status !== 'Accepting Applications'}
                        className={`font-ui text-sm flex items-center gap-2 transition-colors ${circle.status === 'Accepting Applications' ? 'text-text-primary hover:text-starforge-gold' : 'text-text-muted cursor-not-allowed'}`}>
                        {!user ? <><LogIn className="w-4 h-4" /> Sign in to Apply</> : <>Apply Now <ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="border-t border-border p-6 bg-void-black/30">
                          <h4 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-4">Circle Discussion</h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                            {discussions.length === 0 && <p className="font-ui text-xs text-text-muted text-center py-4">No discussions yet. Start the conversation!</p>}
                            {discussions.map(d => <div key={d.id} className="bg-surface border border-border rounded-sm p-3"><p className="font-body text-sm text-text-secondary">{d.text}</p><p className="font-ui text-[9px] text-text-muted mt-1">{d.author} · {getDate(d.createdAt)}</p></div>)}
                          </div>
                          {user ? (
                            <div className="flex gap-2">
                              <input type="text" value={newDiscPost} onChange={e => setNewDiscPost(e.target.value)} onKeyDown={e => e.key === 'Enter' && postDiscussion(circle.id)} placeholder="Share your thoughts…" className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui outline-none focus:border-starforge-gold" />
                              <button onClick={() => postDiscussion(circle.id)} className="px-3 py-2 bg-starforge-gold text-void-black rounded-sm hover:bg-yellow-500 transition-colors"><Send className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <button onClick={signIn} className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-border rounded-sm text-text-muted font-ui text-xs hover:text-starforge-gold hover:border-starforge-gold/30 transition-colors"><LogIn className="w-3 h-3" /> Sign in to discuss</button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ═══ Q&A TAB ═══ */}
        {activeTab === 'qa' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <p className="font-body text-sm text-text-secondary">Join live digital events or submit questions in advance. Community-upvoted questions get answered first.</p>
            {qaSessions.map(qa => {
              const isExp = expandedQA === qa.id; const questions = qaQuestions[qa.id] || [];
              const isFuture = qa.date && qa.date.toDate() > new Date();
              return (
                <div key={qa.id} className="bg-surface border border-border rounded-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div><h3 className="font-heading text-lg text-text-primary">{qa.title}</h3><p className="font-ui text-xs text-text-muted">with {qa.author} · {getDate(qa.date)}</p></div>
                      <div className="flex items-center gap-3">
                        {isFuture && qa.link && <a href={qa.link} target="_blank" rel="noopener noreferrer" className="text-queer-pink hover:text-white font-ui text-xs uppercase tracking-wider transition-colors">Join Live</a>}
                        <span className={`font-ui text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${isFuture ? 'bg-queer-pink/10 text-queer-pink' : 'bg-surface-elevated text-text-muted'}`}>{isFuture ? 'Upcoming' : 'Archived'}</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedQA(isExp ? null : qa.id)} className="flex items-center gap-1 font-ui text-xs text-text-muted hover:text-queer-pink transition-colors mt-3">
                      <BarChart3 className="w-3.5 h-3.5" /> {questions.length} Questions {isExp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="border-t border-border p-6 bg-void-black/30">
                          {user ? (
                            <div className="flex gap-2 mb-4">
                              <input type="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitQuestion(qa.id)} placeholder="Ask a question…" className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui outline-none focus:border-queer-pink" />
                              <button onClick={() => submitQuestion(qa.id)} className="px-3 py-2 bg-queer-pink text-white rounded-sm hover:bg-pink-500 transition-colors"><Send className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : (
                            <button onClick={signIn} className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-border rounded-sm text-text-muted font-ui text-xs hover:text-queer-pink hover:border-queer-pink/30 mb-4 transition-colors"><LogIn className="w-3 h-3" /> Sign in to ask</button>
                          )}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {questions.length === 0 && <p className="font-ui text-xs text-text-muted text-center py-4">No questions yet. Be the first!</p>}
                            {questions.map(q => (
                              <div key={q.id} className="bg-surface border border-border rounded-sm p-3">
                                <div className="flex gap-3">
                                  <button onClick={() => user ? upvoteQuestion(qa.id, q.id) : signIn()} disabled={votedQuestions.includes(q.id)}
                                    className={`flex flex-col items-center shrink-0 transition-colors ${votedQuestions.includes(q.id) ? 'text-queer-pink' : 'text-text-muted hover:text-queer-pink'}`}>
                                    <ThumbsUp className={`w-3.5 h-3.5 ${votedQuestions.includes(q.id) ? 'fill-queer-pink' : ''}`} /><span className="font-mono text-[10px]">{q.upvotes || 0}</span>
                                  </button>
                                  <div className="flex-1">
                                    <p className="font-body text-sm text-text-primary">{q.text}</p>
                                    <p className="font-ui text-[9px] text-text-muted mt-1">{q.author}</p>
                                    {q.answer && <div className="mt-2 bg-queer-pink/5 border-l-2 border-queer-pink p-2 rounded-sm"><p className="font-ui text-[9px] text-queer-pink uppercase tracking-wider mb-1">Author Response</p><p className="font-body text-xs text-text-secondary">{q.answer}</p></div>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ═══ CHALLENGES TAB ═══ */}
        {activeTab === 'challenges' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="bg-surface border border-border rounded-sm p-8">
              <div className="flex items-center gap-3 mb-6"><Target className="w-6 h-6 text-starforge-gold" /><h2 className="font-heading text-2xl text-text-primary">2027 Reading Challenge</h2></div>
              {user ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="font-heading text-xl text-text-primary">{challengeCompleted} of {challengeGoal} books</p>
                      <p className="font-ui text-xs text-text-muted mt-1">{challengeGoal - challengeCompleted > 0 ? `${challengeGoal - challengeCompleted} away from your goal` : 'At your goal! 🎉'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowGoalEditor(!showGoalEditor)} className="px-3 py-1.5 border border-border rounded-sm font-ui text-[10px] text-text-muted uppercase tracking-wider hover:text-starforge-gold hover:border-starforge-gold/30 transition-colors">Edit Goal</button>
                      <button onClick={markBookCompleted} className="flex items-center gap-1.5 px-3 py-1.5 bg-starforge-gold text-void-black rounded-sm font-ui text-[10px] uppercase tracking-wider hover:bg-yellow-500 transition-colors"><Plus className="w-3 h-3" /> Finished a Book</button>
                    </div>
                  </div>
                  <div className="relative h-4 bg-deep-space rounded-full overflow-hidden border border-border">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((challengeCompleted / Math.max(challengeGoal, 1)) * 100, 100)}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-starforge-gold to-aurora-teal rounded-full" />
                  </div>
                  <div className="flex justify-between mt-2"><span className="font-mono text-[10px] text-text-muted">0</span><span className="font-mono text-[10px] text-starforge-gold">{Math.round(Math.min((challengeCompleted / Math.max(challengeGoal, 1)) * 100, 100))}%</span><span className="font-mono text-[10px] text-text-muted">{challengeGoal}</span></div>
                  <div className="flex gap-3 mt-6">
                    {[5, 10, 25, 50].map(m => (
                      <div key={m} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border ${challengeCompleted >= m ? 'border-starforge-gold/30 bg-starforge-gold/5' : 'border-border'}`}>
                        <Flame className={`w-3 h-3 ${challengeCompleted >= m ? 'text-starforge-gold' : 'text-text-muted/30'}`} />
                        <span className={`font-mono text-[9px] ${challengeCompleted >= m ? 'text-starforge-gold' : 'text-text-muted/30'}`}>{m} Books</span>
                      </div>
                    ))}
                  </div>
                  {showGoalEditor && (
                    <div className="mt-4 flex items-center gap-3 bg-deep-space border border-border rounded-sm p-3">
                      <span className="font-ui text-xs text-text-muted">New goal:</span>
                      <input type="number" min={1} max={365} value={challengeGoal} onChange={e => setChallengeGoal(parseInt(e.target.value) || 1)} className="w-20 bg-void-black border border-border rounded-sm px-2 py-1 text-text-primary font-mono text-sm text-center outline-none focus:border-starforge-gold" />
                      <button onClick={() => updateChallengeGoal(challengeGoal)} className="px-3 py-1 bg-starforge-gold text-void-black font-ui text-[10px] uppercase rounded-sm hover:bg-yellow-500">Save</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-10 h-10 text-text-muted/20 mx-auto mb-4" />
                  <p className="font-heading text-lg text-text-primary mb-2">Set Your 2027 Reading Goal</p>
                  <p className="font-ui text-xs text-text-muted mb-4">Track your progress and earn milestone badges</p>
                  <button onClick={signIn} className="flex items-center gap-2 px-4 py-2 border border-starforge-gold/30 text-starforge-gold font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-starforge-gold/5 mx-auto"><LogIn className="w-3.5 h-3.5" /> Sign In to Start</button>
                </div>
              )}
            </div>
            <div className="bg-surface border border-border rounded-sm p-6 text-center">
              <Trophy className="w-8 h-8 text-starforge-gold mx-auto mb-3" />
              <h3 className="font-heading text-lg text-text-primary mb-2">Community Champions</h3>
              <p className="font-ui text-xs text-text-muted mb-4">See who's leading the community — top reviewers, archive weavers, and founding members.</p>
              <Link to="/champions" className="inline-flex items-center gap-2 text-starforge-gold hover:text-yellow-300 font-ui text-xs uppercase tracking-widest transition-colors"><Trophy className="w-3.5 h-3.5" /> View Champions →</Link>
            </div>
          </motion.div>
        )}

      </div>

      {/* ═══ Circle Application Modal ═══ */}
      <AnimatePresence>
        {isModalOpen && selectedCircle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-surface border border-border rounded-sm p-6 md:p-8 max-w-md w-full relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"><X className="w-5 h-5" /></button>
              {submitStatus === 'success' ? (
                <div className="text-center py-8"><CheckCircle className="w-12 h-12 text-aurora-teal mx-auto mb-4" /><h3 className="font-heading text-xl text-text-primary mb-2">Application Submitted!</h3><p className="font-ui text-xs text-text-muted">You'll hear back from the circle leader soon.</p></div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <h3 className="font-heading text-xl text-text-primary mb-1">Apply to {selectedCircle.name}</h3>
                  <p className="font-ui text-xs text-text-muted mb-4">{selectedCircle.focus}</p>
                  <input value={applicationForm.name} onChange={e => setApplicationForm({ ...applicationForm, name: e.target.value })} placeholder="Your name" required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                  <input value={applicationForm.email} onChange={e => setApplicationForm({ ...applicationForm, email: e.target.value })} placeholder="Email" type="email" required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
                  <textarea value={applicationForm.whyJoin} onChange={e => setApplicationForm({ ...applicationForm, whyJoin: e.target.value })} placeholder="Why do you want to join?" rows={3} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold resize-none" />
                  <button type="submit" disabled={submitStatus === 'submitting'} className="w-full py-2.5 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors disabled:opacity-50">
                    {submitStatus === 'submitting' ? 'Submitting…' : 'Submit Application'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
