import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Clock, MessageCircle, CheckCircle2, Star, AlertCircle,
    FileText, BarChart3, Send, ChevronRight, Eye, Bookmark,
    Calendar, Users, Award, Target, TrendingUp, Flame,
    ThumbsUp, ThumbsDown, ChevronDown, Filter, Plus,
    Sparkles, Shield, ArrowRight, Zap, Heart, Edit3
} from 'lucide-react';

// ═══════════════════════════════════════════════════
// BETA READER HUB — Manuscript Queue & Feedback Dashboard
// ═══════════════════════════════════════════════════

interface Manuscript {
    id: string;
    title: string;
    author: string;
    authorAvatar: string;
    genre: string;
    wordCount: string;
    deadline: string;
    daysLeft: number;
    status: 'active' | 'pending' | 'completed' | 'overdue';
    progress: number; // 0–100 chapter progress
    chaptersRead: number;
    totalChapters: number;
    feedbackSubmitted: number;
    feedbackRequired: number;
    cover: string;
    synopsis: string;
    tags: string[];
    priority: 'high' | 'normal' | 'low';
}

interface FeedbackItem {
    id: string;
    manuscript: string;
    chapter: number;
    type: 'overall' | 'character' | 'pacing' | 'plot' | 'prose' | 'worldbuilding';
    content: string;
    timestamp: string;
    authorResponse?: string;
}

const BETA_STATS = { totalRead: 0, feedbackGiven: 0, authorsHelped: 0, avgRating: 0, streak: 0, tier: '', nextTier: '', tierProgress: 0 };

const FEEDBACK_TYPES = [
    { id: 'overall', label: 'Overall', icon: Star, color: '#f59e0b' },
    { id: 'character', label: 'Character', icon: Users, color: '#8b5cf6' },
    { id: 'pacing', label: 'Pacing', icon: Clock, color: '#3b82f6' },
    { id: 'plot', label: 'Plot', icon: Target, color: '#ef4444' },
    { id: 'prose', label: 'Prose', icon: Edit3, color: '#10b981' },
    { id: 'worldbuilding', label: 'World', icon: Sparkles, color: '#f97316' },
];

export default function BetaReaderHub() {
    const [activeTab, setActiveTab] = useState<'queue' | 'feedback' | 'stats'>('queue');
    const [expandedManuscript, setExpandedManuscript] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
    const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const unsubMs = onSnapshot(
                query(collection(db, 'beta_manuscripts'), where('readerId', '==', user.uid)),
                (snap) => {
                    setManuscripts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Manuscript)));
                    setLoading(false);
                },
                () => setLoading(false)
            );
            const unsubFb = onSnapshot(
                query(collection(db, 'beta_feedback'), where('readerId', '==', user.uid), orderBy('createdAt', 'desc')),
                (snap) => {
                    setFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FeedbackItem)));
                },
                () => { }
            );
            return () => { unsubMs(); unsubFb(); };
        });
        return () => unsubAuth();
    }, []);

    const filteredManuscripts = filterStatus === 'all'
        ? manuscripts
        : manuscripts.filter(m => m.status === filterStatus);

    const statusColors = {
        active: 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const priorityColors = {
        high: 'text-red-400',
        normal: 'text-text-secondary',
        low: 'text-white/20',
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                                    Beta Reader Hub
                                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                                        {BETA_STATS.tier}
                                    </span>
                                </h1>
                                <p className="text-xs text-text-secondary">Your manuscript queue, feedback log, and reader stats.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] text-text-secondary">Reader Streak</p>
                                <p className="text-sm font-semibold text-amber-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {BETA_STATS.streak} days</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-6">
                        {[
                            { id: 'queue' as const, label: 'Manuscript Queue', icon: FileText, count: manuscripts.filter(m => m.status !== 'completed').length },
                            { id: 'feedback' as const, label: 'Feedback Log', icon: MessageCircle, count: feedback.length },
                            { id: 'stats' as const, label: 'My Stats', icon: BarChart3 },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 text-sm border-b-2 transition-colors
                                    ${activeTab === tab.id ? 'border-amber-400 text-amber-400' : 'border-transparent text-text-secondary hover:text-white'}`}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] rounded-full">{tab.count}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {/* ═══ MANUSCRIPT QUEUE ═══ */}
                    {activeTab === 'queue' && (
                        <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Filter Bar */}
                            <div className="flex items-center gap-3 mb-6">
                                <Filter className="w-4 h-4 text-text-secondary" />
                                {(['all', 'active', 'overdue', 'completed'] as const).map(f => (
                                    <button key={f} onClick={() => setFilterStatus(f)}
                                        className={`text-xs px-3 py-1.5 rounded border transition-colors capitalize
                                            ${filterStatus === f ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06] hover:border-white/[0.1]'}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                {filteredManuscripts.map((ms, idx) => {
                                    const isExpanded = expandedManuscript === ms.id;
                                    return (
                                        <motion.div key={ms.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                            className={`border rounded-xl overflow-hidden transition-all
                                                ${isExpanded ? 'bg-white/[0.03] border-amber-400/20' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'}`}>
                                            <button onClick={() => setExpandedManuscript(isExpanded ? null : ms.id)}
                                                className="w-full text-left p-5 flex items-center gap-4">
                                                <img src={ms.cover} alt={ms.title} className="w-12 h-16 rounded object-cover flex-none" />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-semibold text-white">{ms.title}</span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border capitalize ${statusColors[ms.status]}`}>{ms.status}</span>
                                                        {ms.priority === 'high' && <Flame className="w-3.5 h-3.5 text-red-400" />}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                                                        <span>{ms.author}</span>
                                                        <span>•</span>
                                                        <span>{ms.genre}</span>
                                                        <span>•</span>
                                                        <span>{ms.wordCount} words</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden max-w-[200px]">
                                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${ms.progress}%` }} />
                                                        </div>
                                                        <span className="text-[10px] text-text-secondary">{ms.chaptersRead}/{ms.totalChapters} chapters</span>
                                                    </div>
                                                </div>

                                                <div className="flex-none text-right">
                                                    <p className={`text-xs font-semibold ${ms.daysLeft < 0 ? 'text-red-400' : ms.daysLeft <= 7 ? 'text-amber-400' : 'text-text-secondary'}`}>
                                                        {ms.status === 'completed' ? '✓ Done' : ms.daysLeft < 0 ? `${Math.abs(ms.daysLeft)}d overdue` : `${ms.daysLeft}d left`}
                                                    </p>
                                                    <p className="text-[10px] text-text-secondary mt-0.5">Due {ms.deadline}</p>
                                                </div>

                                                <ChevronDown className={`w-4 h-4 text-white/20 flex-none transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                                                        className="overflow-hidden">
                                                        <div className="px-5 pb-5 border-t border-white/[0.04]">
                                                            <div className="grid grid-cols-3 gap-6 py-4">
                                                                {/* Synopsis */}
                                                                <div>
                                                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Synopsis</p>
                                                                    <p className="text-xs text-white/70 leading-relaxed italic">{ms.synopsis}</p>
                                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                                        {ms.tags.map(tag => (
                                                                            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-text-secondary">{tag}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Feedback Progress */}
                                                                <div>
                                                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Feedback Progress</p>
                                                                    <div className="space-y-2">
                                                                        <div>
                                                                            <div className="flex justify-between text-xs mb-1">
                                                                                <span className="text-text-secondary">Chapters Read</span>
                                                                                <span className="text-white font-semibold">{ms.chaptersRead}/{ms.totalChapters}</span>
                                                                            </div>
                                                                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                                                <div className="h-full bg-aurora-teal rounded-full" style={{ width: `${(ms.chaptersRead / ms.totalChapters) * 100}%` }} />
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex justify-between text-xs mb-1">
                                                                                <span className="text-text-secondary">Feedback Notes</span>
                                                                                <span className="text-white font-semibold">{ms.feedbackSubmitted}/{ms.feedbackRequired}</span>
                                                                            </div>
                                                                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(ms.feedbackSubmitted / ms.feedbackRequired) * 100}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Quick Feedback Categories */}
                                                                <div>
                                                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Submit Feedback</p>
                                                                    <div className="grid grid-cols-3 gap-1.5">
                                                                        {FEEDBACK_TYPES.map(ft => {
                                                                            const Icon = ft.icon;
                                                                            return (
                                                                                <button key={ft.id}
                                                                                    className="flex flex-col items-center gap-1 p-2 bg-white/[0.02] border border-white/[0.06] rounded hover:border-amber-400/20 transition-colors">
                                                                                    <Icon className="w-3.5 h-3.5" style={{ color: ft.color }} />
                                                                                    <span className="text-[9px] text-text-secondary">{ft.label}</span>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-3 pt-3 border-t border-white/[0.04]">
                                                                <button className="px-4 py-2 bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors flex items-center gap-1.5">
                                                                    <BookOpen className="w-3.5 h-3.5" /> Continue Reading
                                                                </button>
                                                                <button className="px-4 py-2 bg-white/[0.04] text-white text-xs border border-white/[0.1] rounded hover:bg-white/[0.08] transition-colors flex items-center gap-1.5">
                                                                    <MessageCircle className="w-3.5 h-3.5" /> Message Author
                                                                </button>
                                                                <button className="px-4 py-2 bg-white/[0.04] text-white text-xs border border-white/[0.1] rounded hover:bg-white/[0.08] transition-colors flex items-center gap-1.5">
                                                                    <Eye className="w-3.5 h-3.5" /> View Guidelines
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ FEEDBACK LOG ═══ */}
                    {activeTab === 'feedback' && (
                        <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="space-y-3">
                                {feedback.map((fb, idx) => (
                                    <motion.div key={fb.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-7 h-7 rounded flex items-center justify-center"
                                                style={{ backgroundColor: `${FEEDBACK_TYPES.find(f => f.id === fb.type)?.color}15` }}>
                                                {(() => {
                                                    const FbIcon = FEEDBACK_TYPES.find(f => f.id === fb.type)?.icon || Star;
                                                    const color = FEEDBACK_TYPES.find(f => f.id === fb.type)?.color || '#f59e0b';
                                                    return <FbIcon className="w-3.5 h-3.5" style={{ color }} />;
                                                })()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white font-medium">{fb.manuscript}</span>
                                                    <span className="text-[10px] text-text-secondary">Chapter {fb.chapter}</span>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded capitalize text-text-secondary">{fb.type}</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-text-secondary">{fb.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-white/70 leading-relaxed mb-3 pl-10">{fb.content}</p>
                                        {fb.authorResponse && (
                                            <div className="ml-10 p-3 bg-amber-500/[0.04] border border-amber-500/10 rounded-lg">
                                                <p className="text-[10px] text-amber-400/70 mb-1 font-semibold flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Author Response
                                                </p>
                                                <p className="text-xs text-white/60 italic">{fb.authorResponse}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ STATS ═══ */}
                    {activeTab === 'stats' && (
                        <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Tier Card */}
                            <div className="p-6 bg-gradient-to-r from-amber-500/[0.06] to-transparent border border-amber-500/10 rounded-xl mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <Award className="w-8 h-8 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-1">Current Tier</p>
                                        <h2 className="text-2xl font-display text-white tracking-wide">{BETA_STATS.tier}</h2>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="w-32 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${BETA_STATS.tierProgress}%` }} />
                                            </div>
                                            <span className="text-[10px] text-text-secondary">{BETA_STATS.tierProgress}% to {BETA_STATS.nextTier}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Manuscripts Read', value: BETA_STATS.totalRead, icon: BookOpen, color: '#f59e0b' },
                                    { label: 'Feedback Notes', value: BETA_STATS.feedbackGiven, icon: MessageCircle, color: '#8b5cf6' },
                                    { label: 'Authors Helped', value: BETA_STATS.authorsHelped, icon: Users, color: '#3b82f6' },
                                    { label: 'Avg Rating', value: BETA_STATS.avgRating, icon: Star, color: '#10b981' },
                                ].map((stat, idx) => (
                                    <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                                        <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                                        <p className="text-2xl font-display text-white">{stat.value}</p>
                                        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Tier Benefits */}
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-semibold">Tier Benefits</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { tier: 'New Reader', perks: ['Access to open manuscripts', 'Basic feedback tools', 'Community forums'], unlocked: true },
                                        { tier: 'Trusted Reader', perks: ['Priority manuscript access', 'Direct author messaging', 'Feedback analytics', 'Reader streak badges'], unlocked: true },
                                        { tier: 'Elite Reviewer', perks: ['First-look at new acquisitions', 'Author acknowledgment credits', 'Exclusive beta reader events', 'Advanced feedback templates'], unlocked: false },
                                        { tier: 'Inner Circle', perks: ['Manuscript veto/champion power', 'Editorial meeting observer access', 'Named dedication opportunities', 'Annual beta reader summit invite'], unlocked: false },
                                    ].map((t, idx) => (
                                        <motion.div key={t.tier} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2 + idx * 0.1 }}
                                            className={`p-4 rounded-xl border ${t.unlocked ? 'bg-amber-500/[0.04] border-amber-500/10' : 'bg-white/[0.02] border-white/[0.06] opacity-60'}`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                {t.unlocked ? <CheckCircle2 className="w-4 h-4 text-amber-400" /> : <Shield className="w-4 h-4 text-white/20" />}
                                                <h4 className={`text-sm font-semibold ${t.unlocked ? 'text-amber-400' : 'text-white/40'}`}>{t.tier}</h4>
                                            </div>
                                            <ul className="space-y-1.5">
                                                {t.perks.map(p => (
                                                    <li key={p} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                                                        <ChevronRight className="w-3 h-3 flex-none mt-0.5" /> {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
