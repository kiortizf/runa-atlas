import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Vote, BookOpen, MessageCircle, ArrowRight, X, LogIn, ChevronDown, ChevronUp,
  Calendar, ThumbsUp, Send, Plus, BarChart3, Star, Target, Trophy, Flame, CheckCircle
} from 'lucide-react';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, increment, onSnapshot, query, orderBy, serverTimestamp, Timestamp, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ──────────────────────────────────────────
type PollOption = { id: string; text: string; votes: number };
type Poll = {
  id: string; type: string; title: string; description: string;
  options: PollOption[]; totalVotes: number; daysLeft: number;
};
type ReaderCircle = {
  id: string; name: string; focus: string; members: number; status: string;
  description: string; currentRead?: string; schedule?: string[];
};
type BookClubGuide = {
  id: string; title: string; description: string; fileUrl: string;
  discussionQuestions?: string[]; readingSchedule?: { week: number; chapters: string; date?: string }[];
};
type QASession = {
  id: string; title: string; author: string; date: Timestamp; link: string; isPersistent?: boolean;
};
type QAQuestion = {
  id: string; text: string; author: string; upvotes: number; answer?: string; createdAt: any;
};
type Discussion = {
  id: string; text: string; author: string; createdAt: any;
};

export default function Community() {
  const { user, signIn } = useAuth();
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [circles, setCircles] = useState<ReaderCircle[]>([]);
  const [guides, setGuides] = useState<BookClubGuide[]>([]);
  const [qaSessions, setQaSessions] = useState<QASession[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Expansion
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<ReaderCircle | null>(null);
  const [applicationForm, setApplicationForm] = useState({ name: '', email: '', whyJoin: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [expandedCircle, setExpandedCircle] = useState<string | null>(null);
  const [expandedQA, setExpandedQA] = useState<string | null>(null);

  // Circle discussions
  const [circleDiscussions, setCircleDiscussions] = useState<Record<string, Discussion[]>>({});
  const [newDiscPost, setNewDiscPost] = useState('');

  // Q&A questions
  const [qaQuestions, setQaQuestions] = useState<Record<string, QAQuestion[]>>({});
  const [newQuestion, setNewQuestion] = useState('');
  const [votedQuestions, setVotedQuestions] = useState<string[]>([]);

  // Community Stats
  const [communityStats, setCommunityStats] = useState({ members: 0, reviews: 0, discussions: 0, booksRead: 0 });

  // Reading Challenge
  const [challengeGoal, setChallengeGoal] = useState(12);
  const [challengeCompleted, setChallengeCompleted] = useState(0);
  const [showGoalEditor, setShowGoalEditor] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<{ name: string; reviews: number; helpful: number }[]>([]);

  // Hardcoded fallbacks
  const [hardcodedPoll] = useState<Poll>({
    id: 'winter-2027-theme', type: 'Anthology Theme', title: 'Winter 2027 Anthology Theme',
    description: 'Vote for the central theme of our upcoming Winter 2027 short story collection.',
    options: [
      { id: 'opt1', text: 'Cyberpunk Fairytales', votes: 142 },
      { id: 'opt2', text: 'Gothic Space Opera', votes: 89 },
      { id: 'opt3', text: 'Solarpunk Mysteries', votes: 215 },
    ],
    totalVotes: 446, daysLeft: 12,
  });

  const hardcodedCircles: ReaderCircle[] = [
    {
      id: 'circle-1', name: 'The Obsidian Spire', focus: 'Dark Fantasy & Horror', members: 24, status: 'Accepting Applications',
      description: 'Dive into the darker side of the Runeweave. We focus on atmospheric horror, grimdark fantasy, and psychological thrillers.',
      currentRead: 'The Hollow Crown by Maren Voss', schedule: ['Ch. 1-5 by Mar 15', 'Ch. 6-12 by Mar 28', 'Final Discussion Apr 5']
    },
    {
      id: 'circle-2', name: 'Neon Horizons', focus: 'Cyberpunk & Sci-Fi', members: 38, status: 'Closed',
      description: 'Exploring the intersection of humanity and technology. Join us for discussions on AI, cybernetics, and dystopian futures.',
      currentRead: 'Signal Bloom by Ada Chen', schedule: ['Part I by Mar 20', 'Part II by Apr 3', 'Wrap-up Apr 10']
    },
  ];

  const hardcodedGuides: BookClubGuide[] = [
    {
      id: 'guide-1', title: 'The Hollow Crown Discussion Kit', description: 'A complete guide for discussing Maren Voss\'s dark fantasy epic', fileUrl: '#',
      discussionQuestions: [
        'How does the protagonist\'s relationship with power reflect modern societal structures?',
        'Discuss the role of sacrifice in the narrative. Is it glorified or critiqued?',
        'The magic system is tied to memory. What does this suggest about identity?',
        'Compare the political structures in the novel to real-world empires.',
        'How does the ending recontextualize the opening chapter?',
      ],
      readingSchedule: [
        { week: 1, chapters: 'Prologue – Chapter 4', date: 'Mar 10–16' },
        { week: 2, chapters: 'Chapters 5–9', date: 'Mar 17–23' },
        { week: 3, chapters: 'Chapters 10–14', date: 'Mar 24–30' },
        { week: 4, chapters: 'Chapters 15–End + Epilogue', date: 'Mar 31–Apr 6' },
      ],
    },
  ];

  const hardcodedQA: QASession = {
    id: 'qa-1', title: 'Worldbuilding in the Void', author: 'Elena Rostova',
    date: Timestamp.fromDate(new Date(Date.now() + 86400000 * 3)), link: '#', isPersistent: true,
  };

  // ─── Load Data ────────────────────────────────────
  useEffect(() => {
    const savedVotes = localStorage.getItem('votedPolls');
    if (savedVotes) setVotedPolls(JSON.parse(savedVotes));
    const savedQVotes = localStorage.getItem('votedQuestions');
    if (savedQVotes) setVotedQuestions(JSON.parse(savedQVotes));

    const unsubs = [
      onSnapshot(collection(db, 'polls'), s => setPolls(s.docs.map(d => ({ id: d.id, ...d.data() } as Poll))),
        (e: any) => handleFirestoreError(e, OperationType.LIST, 'polls')),
      onSnapshot(collection(db, 'readerCircles'), s => setCircles(s.docs.map(d => ({ id: d.id, ...d.data() } as ReaderCircle))),
        (e: any) => handleFirestoreError(e, OperationType.LIST, 'readerCircles')),
      onSnapshot(collection(db, 'bookClubGuides'), s => setGuides(s.docs.map(d => ({ id: d.id, ...d.data() } as BookClubGuide))),
        (e: any) => handleFirestoreError(e, OperationType.LIST, 'bookClubGuides')),
      onSnapshot(collection(db, 'qaSessions'), s => { setQaSessions(s.docs.map(d => ({ id: d.id, ...d.data() } as QASession))); setLoading(false); },
        (e: any) => { handleFirestoreError(e, OperationType.LIST, 'qaSessions'); setLoading(false); }),
    ];

    // Community stats
    const statsUnsubs = [
      onSnapshot(collection(db, 'users'), s => setCommunityStats(prev => ({ ...prev, members: s.docs.length || 156 })), () => setCommunityStats(prev => ({ ...prev, members: 156 }))),
      onSnapshot(collection(db, 'reviews'), s => setCommunityStats(prev => ({ ...prev, reviews: s.docs.length || 342 })), () => setCommunityStats(prev => ({ ...prev, reviews: 342 }))),
      onSnapshot(collection(db, 'bookshelfEntries'), s => {
        const readCount = s.docs.filter(d => d.data().status === 'read').length;
        setCommunityStats(prev => ({ ...prev, booksRead: readCount || 89 }));
      }, () => setCommunityStats(prev => ({ ...prev, booksRead: 89 }))),
    ];

    // Leaderboard from reviews
    const lbUnsub = onSnapshot(collection(db, 'reviews'), s => {
      const byUser: Record<string, { name: string; reviews: number; helpful: number }> = {};
      s.docs.forEach(d => {
        const data = d.data();
        const name = data.displayName || 'Anonymous';
        if (!byUser[name]) byUser[name] = { name, reviews: 0, helpful: 0 };
        byUser[name].reviews++;
        byUser[name].helpful += data.helpfulVotes || 0;
      });
      const sorted = Object.values(byUser).sort((a, b) => b.reviews - a.reviews || b.helpful - a.helpful).slice(0, 5);
      setLeaderboard(sorted.length > 0 ? sorted : [
        { name: 'Morgan Blake', reviews: 28, helpful: 142 },
        { name: 'Avery Okonkwo', reviews: 24, helpful: 89 },
        { name: 'Sam Chen', reviews: 19, helpful: 67 },
        { name: 'Jordan Kim', reviews: 15, helpful: 45 },
        { name: 'Riley Torres', reviews: 12, helpful: 38 },
      ]);
    }, () => setLeaderboard([
      { name: 'Morgan Blake', reviews: 28, helpful: 142 },
      { name: 'Avery Okonkwo', reviews: 24, helpful: 89 },
      { name: 'Sam Chen', reviews: 19, helpful: 67 },
      { name: 'Jordan Kim', reviews: 15, helpful: 45 },
      { name: 'Riley Torres', reviews: 12, helpful: 38 },
    ]));

    return () => { unsubs.forEach(u => typeof u === 'function' && u()); statsUnsubs.forEach(u => u()); lbUnsub(); };
  }, []);

  // Load circle discussions when expanded
  useEffect(() => {
    if (!expandedCircle) return;
    const unsub = onSnapshot(query(collection(db, `readerCircles/${expandedCircle}/discussions`), orderBy('createdAt', 'asc')),
      s => setCircleDiscussions(prev => ({ ...prev, [expandedCircle]: s.docs.map(d => ({ id: d.id, ...d.data() } as Discussion)) })),
      () => { });
    return () => unsub();
  }, [expandedCircle]);

  // Load Q&A questions when expanded
  useEffect(() => {
    if (!expandedQA) return;
    const unsub = onSnapshot(query(collection(db, `qaSessions/${expandedQA}/questions`), orderBy('upvotes', 'desc')),
      s => setQaQuestions(prev => ({ ...prev, [expandedQA]: s.docs.map(d => ({ id: d.id, ...d.data() } as QAQuestion)) })),
      () => { });
    return () => unsub();
  }, [expandedQA]);

  // Load reading challenge
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, `users/${user.uid}/readingChallenge`, '2027'), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setChallengeGoal(data.goal || 12);
        setChallengeCompleted(data.completed || 0);
      }
    }, () => { });
    return () => unsub();
  }, [user]);

  const updateChallengeGoal = async (goal: number) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/readingChallenge`, '2027'), { goal, completed: challengeCompleted, updatedAt: serverTimestamp() }, { merge: true });
      setChallengeGoal(goal);
      setShowGoalEditor(false);
    } catch { /* ignore */ }
  };

  const markBookCompleted = async () => {
    if (!user) return;
    const newCount = challengeCompleted + 1;
    try {
      await setDoc(doc(db, `users/${user.uid}/readingChallenge`, '2027'), { goal: challengeGoal, completed: newCount, updatedAt: serverTimestamp() }, { merge: true });
      setChallengeCompleted(newCount);
    } catch { /* ignore */ }
  };

  // ─── Handlers ─────────────────────────────────────
  const handleVote = async (pollId: string, optionId: string) => {
    if (!user || votedPolls.includes(pollId)) return;
    try {
      const pollRef = doc(db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);
      if (pollSnap.exists()) {
        const data = pollSnap.data() as Poll;
        await updateDoc(pollRef, {
          options: data.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o),
          totalVotes: increment(1),
        });
      }
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `polls/${pollId}`); }
    const newVoted = [...votedPolls, pollId];
    setVotedPolls(newVoted);
    localStorage.setItem('votedPolls', JSON.stringify(newVoted));
  };

  const handleApplyClick = (circle: ReaderCircle) => {
    setSelectedCircle(circle); setIsModalOpen(true); setSubmitStatus('idle');
    setApplicationForm({ name: '', email: '', whyJoin: '' });
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    try {
      await addDoc(collection(db, 'circleApplications'), {
        circleId: selectedCircle?.id, ...applicationForm, userId: user?.uid,
        createdAt: serverTimestamp(),
      });
      setSubmitStatus('success');
      setTimeout(() => { setIsModalOpen(false); setSelectedCircle(null); }, 2000);
    } catch {
      setSubmitStatus('success');
      setTimeout(() => { setIsModalOpen(false); setSelectedCircle(null); }, 2000);
    }
  };

  const postDiscussion = async (circleId: string) => {
    if (!user || !newDiscPost.trim()) return;
    try {
      await addDoc(collection(db, `readerCircles/${circleId}/discussions`), {
        text: newDiscPost.trim(), author: user.displayName || 'Anonymous', createdAt: serverTimestamp(),
      });
      setNewDiscPost('');
    } catch { /* ignore */ }
  };

  const submitQuestion = async (sessionId: string) => {
    if (!user || !newQuestion.trim()) return;
    try {
      await addDoc(collection(db, `qaSessions/${sessionId}/questions`), {
        text: newQuestion.trim(), author: user.displayName || 'Anonymous',
        upvotes: 0, createdAt: serverTimestamp(),
      });
      setNewQuestion('');
    } catch { /* ignore */ }
  };

  const upvoteQuestion = async (sessionId: string, questionId: string) => {
    if (votedQuestions.includes(questionId)) return;
    try {
      const q = qaQuestions[sessionId]?.find(x => x.id === questionId);
      if (q) {
        await updateDoc(doc(db, `qaSessions/${sessionId}/questions`, questionId), { upvotes: (q.upvotes || 0) + 1 });
        const updated = [...votedQuestions, questionId];
        setVotedQuestions(updated);
        localStorage.setItem('votedQuestions', JSON.stringify(updated));
      }
    } catch { /* ignore */ }
  };

  const allPolls = [hardcodedPoll, ...polls.filter(p => p.id !== hardcodedPoll.id)];
  const allCircles = circles.length > 0 ? circles : hardcodedCircles;
  const allGuides = guides.length > 0 ? guides : hardcodedGuides;
  const allQA = qaSessions.length > 0 ? qaSessions : [hardcodedQA];

  const getDate = (d: any) => {
    if (!d) return '';
    if (d instanceof Timestamp) return d.toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    if (d?.seconds) return new Date(d.seconds * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    return '';
  };

  if (loading) return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Loading community data...</div>;

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            The <span className="text-starforge-gold italic font-heading normal-case">Runeweave</span>
          </h1>
          <p className="font-ui text-text-secondary tracking-widest uppercase text-sm">Shape the stories you read</p>
        </div>

        {/* ════════════ COMMUNITY STATS BANNER ════════════ */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Community Members', value: communityStats.members, icon: Users, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10' },
              { label: 'Reviews Written', value: communityStats.reviews, icon: Star, color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10' },
              { label: 'Books Read', value: communityStats.booksRead, icon: CheckCircle, color: 'text-aurora-teal', bg: 'bg-aurora-teal/10' },
              { label: 'Active Circles', value: (circles.length || 2), icon: MessageCircle, color: 'text-queer-pink', bg: 'bg-queer-pink/10' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-surface border border-border rounded-sm p-5 text-center">
                <div className={`w-10 h-10 rounded-sm ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="font-display text-2xl text-text-primary">{stat.value.toLocaleString()}</p>
                <p className="font-ui text-[9px] text-text-muted uppercase tracking-wider mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════ READING CHALLENGE ════════════ */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-6 h-6 text-starforge-gold" />
            <h2 className="font-heading text-3xl text-text-primary">2027 Reading Challenge</h2>
          </div>
          <div className="bg-surface border border-border rounded-sm p-8">
            {user ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-heading text-xl text-text-primary">{challengeCompleted} of {challengeGoal} books</p>
                    <p className="font-ui text-xs text-text-muted mt-1">Keep reading. You're {challengeGoal - challengeCompleted > 0 ? `${challengeGoal - challengeCompleted} away from your goal` : 'at your goal! 🎉'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowGoalEditor(!showGoalEditor)} className="px-3 py-1.5 border border-border rounded-sm font-ui text-[10px] text-text-muted uppercase tracking-wider hover:text-starforge-gold hover:border-starforge-gold/30 transition-colors">
                      Edit Goal
                    </button>
                    <button onClick={markBookCompleted} className="flex items-center gap-1.5 px-3 py-1.5 bg-starforge-gold text-void-black rounded-sm font-ui text-[10px] uppercase tracking-wider hover:bg-yellow-500 transition-colors">
                      <Plus className="w-3 h-3" /> Finished a Book
                    </button>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="relative h-4 bg-deep-space rounded-full overflow-hidden border border-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((challengeCompleted / Math.max(challengeGoal, 1)) * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-starforge-gold to-aurora-teal rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono text-[10px] text-text-muted">0</span>
                  <span className="font-mono text-[10px] text-starforge-gold">{Math.round(Math.min((challengeCompleted / Math.max(challengeGoal, 1)) * 100, 100))}%</span>
                  <span className="font-mono text-[10px] text-text-muted">{challengeGoal}</span>
                </div>
                {/* Milestone Badges */}
                <div className="flex gap-3 mt-6">
                  {[5, 10, 25, 50].map(milestone => (
                    <div key={milestone} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border ${challengeCompleted >= milestone ? 'border-starforge-gold/30 bg-starforge-gold/5' : 'border-border'}`}>
                      <Flame className={`w-3 h-3 ${challengeCompleted >= milestone ? 'text-starforge-gold' : 'text-text-muted/30'}`} />
                      <span className={`font-mono text-[9px] ${challengeCompleted >= milestone ? 'text-starforge-gold' : 'text-text-muted/30'}`}>{milestone} Books</span>
                    </div>
                  ))}
                </div>
                {showGoalEditor && (
                  <div className="mt-4 flex items-center gap-3 bg-deep-space border border-border rounded-sm p-3">
                    <span className="font-ui text-xs text-text-muted">New goal:</span>
                    <input type="number" min={1} max={365} value={challengeGoal} onChange={e => setChallengeGoal(parseInt(e.target.value) || 1)}
                      className="w-20 bg-void-black border border-border rounded-sm px-2 py-1 text-text-primary font-mono text-sm text-center outline-none focus:border-starforge-gold" />
                    <button onClick={() => updateChallengeGoal(challengeGoal)} className="px-3 py-1 bg-starforge-gold text-void-black font-ui text-[10px] uppercase rounded-sm hover:bg-yellow-500">Save</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-10 h-10 text-text-muted/20 mx-auto mb-4" />
                <p className="font-heading text-lg text-text-primary mb-2">Set Your 2027 Reading Goal</p>
                <p className="font-ui text-xs text-text-muted mb-4">Track your progress and earn milestone badges</p>
                <button onClick={signIn} className="flex items-center gap-2 px-4 py-2 border border-starforge-gold/30 text-starforge-gold font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-starforge-gold/5 mx-auto">
                  <LogIn className="w-3.5 h-3.5" /> Sign In to Start
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ════════════ POLLS ════════════ */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Vote className="w-6 h-6 text-starforge-gold" />
            <h2 className="font-heading text-3xl text-text-primary">Active Constellations (Voting)</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {allPolls.map(poll => {
              const hasVoted = votedPolls.includes(poll.id);
              return (
                <div key={poll.id} className="bg-surface border border-border rounded-sm p-6 md:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-ui text-xs uppercase tracking-wider text-aurora-teal bg-aurora-teal/10 px-3 py-1 rounded-full">{poll.type}</span>
                    <span className="font-ui text-xs text-text-muted">{poll.daysLeft} days left</span>
                  </div>
                  <h3 className="font-heading text-2xl text-text-primary mb-2">{poll.title}</h3>
                  <p className="font-body text-text-secondary mb-8">{poll.description}</p>
                  <div className="space-y-4">
                    {poll.options.map(option => {
                      const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                      return (
                        <div key={option.id} className="relative">
                          <button onClick={() => user ? handleVote(poll.id, option.id) : signIn()} disabled={hasVoted}
                            className={`w-full text-left p-4 rounded-sm border transition-all relative z-10 ${hasVoted ? 'border-border bg-transparent cursor-default' : 'border-border bg-deep-space hover:border-starforge-gold/50 cursor-pointer'}`}>
                            <div className="flex justify-between items-center relative z-20">
                              <span className="font-ui text-sm text-text-primary">{option.text}</span>
                              {hasVoted && <span className="font-mono text-xs text-starforge-gold">{pct}%</span>}
                            </div>
                          </button>
                          {hasVoted && (
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                              className="absolute top-0 left-0 h-full bg-starforge-gold/10 rounded-sm z-0" />
                          )}
                        </div>
                      );
                    })}
                    {!user && (
                      <button onClick={signIn} className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-sm border border-dashed border-starforge-gold/30 text-starforge-gold font-ui text-sm hover:bg-starforge-gold/5 transition-colors">
                        <LogIn className="w-4 h-4" /> Sign in to vote
                      </button>
                    )}
                  </div>
                  {hasVoted && <p className="mt-4 font-ui text-xs text-starforge-gold text-center">Thank you for shaping the Runeweave.</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════ READER CIRCLES ════════════ */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-6 h-6 text-starforge-gold" />
            <h2 className="font-heading text-3xl text-text-primary">Reader Circles</h2>
          </div>
          <div className="space-y-6">
            {allCircles.map(circle => {
              const isExpanded = expandedCircle === circle.id;
              const discussions = circleDiscussions[circle.id] || [];
              return (
                <div key={circle.id} className="bg-deep-space border border-border rounded-sm overflow-hidden hover:border-starforge-gold/20 transition-colors">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-heading text-xl text-text-primary">{circle.name}</h3>
                        <p className="font-ui text-xs text-starforge-gold uppercase tracking-wider mt-1">{circle.focus}</p>
                      </div>
                      <span className={`font-ui text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${circle.status === 'Accepting Applications' ? 'bg-aurora-teal/20 text-aurora-teal' : 'bg-surface-elevated text-text-muted'
                        }`}>{circle.status}</span>
                    </div>
                    <p className="font-body text-text-secondary mb-4">{circle.description}</p>

                    {circle.currentRead && (
                      <div className="bg-void-black border border-border rounded-sm p-3 mb-4">
                        <p className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-1">Currently Reading</p>
                        <p className="font-heading text-sm text-starforge-gold">{circle.currentRead}</p>
                      </div>
                    )}

                    {/* Schedule */}
                    {circle.schedule && circle.schedule.length > 0 && (
                      <div className="mb-4">
                        <p className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-2">Reading Schedule</p>
                        <div className="flex gap-2 flex-wrap">
                          {circle.schedule.map((s, i) => (
                            <span key={i} className="font-mono text-[10px] text-text-secondary bg-void-black px-2 py-1 rounded-sm border border-border">
                              <Calendar className="w-2.5 h-2.5 inline mr-1 text-text-muted" />{s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <span className="font-ui text-xs text-text-muted">{circle.members} Active Members</span>
                        <button onClick={() => setExpandedCircle(isExpanded ? null : circle.id)}
                          className="flex items-center gap-1 font-ui text-xs text-text-muted hover:text-starforge-gold transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" /> Discussion
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                      <button onClick={() => user ? handleApplyClick(circle) : signIn()}
                        disabled={circle.status !== 'Accepting Applications'}
                        className={`font-ui text-sm flex items-center gap-2 transition-colors ${circle.status === 'Accepting Applications' ? 'text-text-primary hover:text-starforge-gold' : 'text-text-muted cursor-not-allowed'
                          }`}>
                        {!user ? <><LogIn className="w-4 h-4" /> Sign in to Apply</> : <>Apply Now <ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </div>
                  </div>

                  {/* Discussion Thread */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="border-t border-border p-6 bg-void-black/30">
                          <h4 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-4">Circle Discussion</h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                            {discussions.length === 0 && (
                              <p className="font-ui text-xs text-text-muted text-center py-4">No discussions yet. Start the conversation!</p>
                            )}
                            {discussions.map(d => (
                              <div key={d.id} className="bg-surface border border-border rounded-sm p-3">
                                <p className="font-body text-sm text-text-secondary">{d.text}</p>
                                <p className="font-ui text-[9px] text-text-muted mt-1">{d.author} · {getDate(d.createdAt)}</p>
                              </div>
                            ))}
                          </div>
                          {user ? (
                            <div className="flex gap-2">
                              <input type="text" value={newDiscPost} onChange={e => setNewDiscPost(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && postDiscussion(circle.id)}
                                placeholder="Share your thoughts..."
                                className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui outline-none focus:border-starforge-gold" />
                              <button onClick={() => postDiscussion(circle.id)}
                                className="px-3 py-2 bg-starforge-gold text-void-black rounded-sm hover:bg-yellow-500 transition-colors">
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={signIn} className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-border rounded-sm text-text-muted font-ui text-xs hover:text-starforge-gold hover:border-starforge-gold/30 transition-colors">
                              <LogIn className="w-3 h-3" /> Sign in to discuss
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════ BOOK CLUB GUIDES ════════════ */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-6 h-6 text-cosmic-purple" />
            <h2 className="font-heading text-3xl text-text-primary">Book Club Guides</h2>
          </div>
          <p className="font-body text-text-secondary mb-8">Download discussion guides, access reading schedules, and explore curated questions for all our major releases.</p>

          <div className="space-y-4">
            {allGuides.map(guide => {
              const isExp = expandedGuide === guide.id;
              return (
                <div key={guide.id} className="bg-surface border border-border rounded-sm overflow-hidden">
                  <div className="p-6 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-heading text-lg text-text-primary mb-1">{guide.title}</h3>
                      <p className="font-ui text-xs text-text-secondary">{guide.description}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <a href={guide.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-aurora-teal hover:text-white font-ui text-xs uppercase tracking-wider transition-colors">Download</a>
                      {(guide.discussionQuestions || guide.readingSchedule) && (
                        <button onClick={() => setExpandedGuide(isExp ? null : guide.id)}
                          className="text-text-muted hover:text-starforge-gold transition-colors">
                          {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="border-t border-border p-6 bg-void-black/30 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Discussion Questions */}
                          {guide.discussionQuestions && guide.discussionQuestions.length > 0 && (
                            <div>
                              <h4 className="font-ui text-[10px] uppercase tracking-wider text-cosmic-purple mb-3">Discussion Questions</h4>
                              <ol className="space-y-2">
                                {guide.discussionQuestions.map((q, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="font-mono text-[10px] text-cosmic-purple w-5 shrink-0">{i + 1}.</span>
                                    <span className="font-body text-sm text-text-secondary leading-relaxed">{q}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {/* Reading Schedule */}
                          {guide.readingSchedule && guide.readingSchedule.length > 0 && (
                            <div>
                              <h4 className="font-ui text-[10px] uppercase tracking-wider text-cosmic-purple mb-3">Reading Schedule</h4>
                              <div className="space-y-2">
                                {guide.readingSchedule.map(s => (
                                  <div key={s.week} className="flex items-center gap-3 bg-surface border border-border rounded-sm p-3">
                                    <div className="w-8 h-8 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-sm flex items-center justify-center font-mono text-xs text-cosmic-purple">
                                      W{s.week}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-ui text-xs text-text-primary">{s.chapters}</p>
                                      {s.date && <p className="font-ui text-[10px] text-text-muted">{s.date}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Start Your Own Club */}
          <div className="mt-8 bg-cosmic-purple/5 border border-cosmic-purple/20 rounded-sm p-6 text-center">
            <Plus className="w-6 h-6 text-cosmic-purple mx-auto mb-2" />
            <h3 className="font-heading text-lg text-text-primary mb-1">Start Your Own Club</h3>
            <p className="font-ui text-xs text-text-secondary max-w-md mx-auto">
              Want to lead a reading group for a Rüna Atlas title? Contact us with your proposal and we'll provide you with exclusive club materials, author access, and discussion guides.
            </p>
          </div>
        </section>

        {/* ════════════ Q&A SESSIONS ════════════ */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <MessageCircle className="w-6 h-6 text-queer-pink" />
            <h2 className="font-heading text-3xl text-text-primary">Author Q&A Sessions</h2>
          </div>
          <p className="font-body text-text-secondary mb-8">
            Join live digital events or submit questions in advance. Community-upvoted questions get answered first.
          </p>

          <div className="space-y-4">
            {allQA.map(qa => {
              const isExp = expandedQA === qa.id;
              const questions = qaQuestions[qa.id] || [];
              const isFuture = qa.date && qa.date.toDate() > new Date();
              return (
                <div key={qa.id} className="bg-surface border border-border rounded-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-heading text-lg text-text-primary">{qa.title}</h3>
                        <p className="font-ui text-xs text-text-muted">with {qa.author} · {getDate(qa.date)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {isFuture && qa.link && (
                          <a href={qa.link} target="_blank" rel="noopener noreferrer"
                            className="text-queer-pink hover:text-white font-ui text-xs uppercase tracking-wider transition-colors">Join Live</a>
                        )}
                        <span className={`font-ui text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${isFuture ? 'bg-queer-pink/10 text-queer-pink' : 'bg-surface-elevated text-text-muted'
                          }`}>{isFuture ? 'Upcoming' : 'Archived'}</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedQA(isExp ? null : qa.id)}
                      className="flex items-center gap-1 font-ui text-xs text-text-muted hover:text-queer-pink transition-colors mt-3">
                      <BarChart3 className="w-3.5 h-3.5" /> {questions.length} Questions
                      {isExp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="border-t border-border p-6 bg-void-black/30">
                          <h4 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-4">Community Questions</h4>

                          {/* Submit Question */}
                          {user ? (
                            <div className="flex gap-2 mb-4">
                              <input type="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submitQuestion(qa.id)}
                                placeholder="Ask a question..."
                                className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui outline-none focus:border-queer-pink" />
                              <button onClick={() => submitQuestion(qa.id)}
                                className="px-3 py-2 bg-queer-pink text-white rounded-sm hover:bg-pink-500 transition-colors">
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={signIn} className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-border rounded-sm text-text-muted font-ui text-xs hover:text-queer-pink hover:border-queer-pink/30 mb-4 transition-colors">
                              <LogIn className="w-3 h-3" /> Sign in to ask a question
                            </button>
                          )}

                          {/* Questions List */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {questions.length === 0 && (
                              <p className="font-ui text-xs text-text-muted text-center py-4">No questions yet. Be the first to ask!</p>
                            )}
                            {questions.map(q => (
                              <div key={q.id} className="bg-surface border border-border rounded-sm p-3">
                                <div className="flex gap-3">
                                  <button onClick={() => user ? upvoteQuestion(qa.id, q.id) : signIn()}
                                    disabled={votedQuestions.includes(q.id)}
                                    className={`flex flex-col items-center shrink-0 transition-colors ${votedQuestions.includes(q.id) ? 'text-queer-pink' : 'text-text-muted hover:text-queer-pink'
                                      }`}>
                                    <ThumbsUp className={`w-3.5 h-3.5 ${votedQuestions.includes(q.id) ? 'fill-queer-pink' : ''}`} />
                                    <span className="font-mono text-[10px]">{q.upvotes || 0}</span>
                                  </button>
                                  <div className="flex-1">
                                    <p className="font-body text-sm text-text-primary">{q.text}</p>
                                    <p className="font-ui text-[9px] text-text-muted mt-1">{q.author}</p>
                                    {q.answer && (
                                      <div className="mt-2 bg-queer-pink/5 border-l-2 border-queer-pink p-2 rounded-sm">
                                        <p className="font-ui text-[9px] text-queer-pink uppercase tracking-wider mb-1">Author Response</p>
                                        <p className="font-body text-xs text-text-secondary">{q.answer}</p>
                                      </div>
                                    )}
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
          </div>
        </section>

        {/* ════════════ LEADERBOARD ════════════ */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-6 h-6 text-starforge-gold" />
            <h2 className="font-heading text-3xl text-text-primary">Community Champions</h2>
          </div>
          <div className="bg-surface border border-border rounded-sm overflow-hidden">
            <div className="divide-y divide-border">
              {leaderboard.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-4 p-4 hover:bg-void-black/30 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm shrink-0 ${i === 0 ? 'bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30' :
                    i === 1 ? 'bg-text-muted/10 text-text-secondary border border-border' :
                      i === 2 ? 'bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/30' :
                        'bg-surface-elevated text-text-muted border border-border'
                    }`}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-heading text-sm text-text-primary">{entry.name}</p>
                    <p className="font-ui text-[9px] text-text-muted">{entry.reviews} reviews · {entry.helpful} helpful votes</p>
                  </div>
                  {i === 0 && <Trophy className="w-4 h-4 text-starforge-gold" />}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* ════════════ APPLICATION MODAL ════════════ */}
      <AnimatePresence>
        {isModalOpen && selectedCircle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border rounded-sm p-6 md:p-8 max-w-md w-full relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-heading text-2xl text-text-primary mb-2">Apply to Join</h3>
              <p className="font-ui text-sm text-starforge-gold mb-6">{selectedCircle.name}</p>
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-aurora-teal/20 flex items-center justify-center mx-auto mb-4">
                    <Vote className="w-6 h-6 text-aurora-teal" />
                  </div>
                  <h4 className="font-heading text-xl text-text-primary mb-2">Application Received</h4>
                  <p className="font-ui text-sm text-text-secondary">We'll review your application and get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div>
                    <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-1">Name</label>
                    <input type="text" required value={applicationForm.name} onChange={e => setApplicationForm({ ...applicationForm, name: e.target.value })}
                      className="w-full bg-deep-space border border-border rounded-sm px-4 py-2 text-text-primary font-ui text-sm focus:outline-none focus:border-starforge-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-1">Email</label>
                    <input type="email" required value={applicationForm.email} onChange={e => setApplicationForm({ ...applicationForm, email: e.target.value })}
                      className="w-full bg-deep-space border border-border rounded-sm px-4 py-2 text-text-primary font-ui text-sm focus:outline-none focus:border-starforge-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-1">Why do you want to join?</label>
                    <textarea required rows={4} value={applicationForm.whyJoin} onChange={e => setApplicationForm({ ...applicationForm, whyJoin: e.target.value })}
                      className="w-full bg-deep-space border border-border rounded-sm px-4 py-2 text-text-primary font-ui text-sm focus:outline-none focus:border-starforge-gold transition-colors resize-none" />
                  </div>
                  <button type="submit" disabled={submitStatus === 'submitting'}
                    className="w-full bg-starforge-gold text-void-black font-ui font-medium text-sm py-3 rounded-sm hover:bg-starforge-gold/90 transition-colors disabled:opacity-70">
                    {submitStatus === 'submitting' ? <span className="animate-pulse">Submitting...</span> : 'Submit Application'}
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
