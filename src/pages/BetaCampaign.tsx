import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Users, Clock, MessageCircle, CheckCircle2, Send,
    Plus, ChevronDown, Eye, Star, Target, AlertCircle, Calendar,
    BarChart3, Zap, Shield, Search, Edit3, Sparkles, Filter,
    ChevronRight, ArrowRight, FileText, Flame, Heart, Lock
} from 'lucide-react';

// ═══════════════════════════════════════════════
// BETA CAMPAIGN MANAGER — Author-Side Beta Reading Campaigns
// ═══════════════════════════════════════════════

interface BetaReader {
    id: string;
    name: string;
    avatar: string;
    tier: string;
    dnaMatch: number;
    chaptersRead: number;
    feedbackSubmitted: number;
    status: 'reading' | 'reviewing' | 'completed' | 'invited';
    lastActive: string;
}

interface ChapterRelease {
    chapter: number;
    title: string;
    releaseDate: string;
    status: 'released' | 'scheduled' | 'draft';
    readBy: number;
    feedbackCount: number;
    questions: string[];
}

interface FeedbackSummary {
    category: string;
    color: string;
    count: number;
    consensus: string;
    sentiment: 'positive' | 'mixed' | 'needs_work';
}

const CAMPAIGN = {
    title: '',
    status: 'active' as const,
    startDate: '',
    deadline: '',
    chaptersReleased: 0,
    totalChapters: 0,
    activeBetaReaders: 0,
    totalFeedback: 0,
};

export default function BetaCampaign() {
    const [activeTab, setActiveTab] = useState<'overview' | 'readers' | 'chapters' | 'feedback'>('overview');
    const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
    const [campaign, setCampaign] = useState<any>(CAMPAIGN);
    const [betaReaders, setBetaReaders] = useState<BetaReader[]>([]);
    const [chapters, setChapters] = useState<ChapterRelease[]>([]);
    const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (u) => {
            if (!u) { setLoading(false); return; }
            const unsub = onSnapshot(
                query(collection(db, 'beta_campaigns'), where('authorId', '==', u.uid)),
                (snap) => {
                    if (snap.docs.length > 0) {
                        const data = snap.docs[0].data();
                        if (data.campaign) setCampaign(data.campaign);
                        if (data.readers) setBetaReaders(data.readers);
                        if (data.chapters) setChapters(data.chapters);
                        if (data.feedbackSummary) setFeedbackSummary(data.feedbackSummary);
                    }
                    setLoading(false);
                },
                () => setLoading(false)
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const sentimentColors = { positive: 'text-emerald-400', mixed: 'text-amber-400', needs_work: 'text-red-400' };
    const sentimentLabels = { positive: 'Positive', mixed: 'Mixed', needs_work: 'Needs Work' };

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                                    Beta Campaign: {campaign.title}
                                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">Active</span>
                                </h1>
                                <p className="text-xs text-text-secondary">{campaign.startDate} — {campaign.deadline} · {campaign.chaptersReleased}/{campaign.totalChapters} chapters released</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" /> Invite Beta Readers
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        {[
                            { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
                            { id: 'readers' as const, label: 'Beta Readers', icon: Users, count: campaign.activeBetaReaders },
                            { id: 'chapters' as const, label: 'Chapter Releases', icon: BookOpen, count: campaign.chaptersReleased },
                            { id: 'feedback' as const, label: 'Aggregate Feedback', icon: MessageCircle, count: campaign.totalFeedback },
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
                    {/* ═══ OVERVIEW ═══ */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Beta Readers', value: campaign.activeBetaReaders, icon: Users, color: '#f59e0b' },
                                    { label: 'Chapters Released', value: `${campaign.chaptersReleased}/${campaign.totalChapters}`, icon: BookOpen, color: '#8b5cf6' },
                                    { label: 'Total Feedback', value: campaign.totalFeedback, icon: MessageCircle, color: '#3b82f6' },
                                    { label: 'Avg Completion', value: '68%', icon: BarChart3, color: '#10b981' },
                                ].map((stat, idx) => (
                                    <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                                        <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                                        <p className="text-2xl font-display text-white">{stat.value}</p>
                                        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Consensus Summary */}
                            <div className="mb-8">
                                <h3 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4">Feedback Consensus</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {feedbackSummary.map((fb, idx) => (
                                        <motion.div key={fb.category} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2 + idx * 0.06 }}
                                            className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fb.color }} />
                                                    <span className="text-xs font-semibold text-white">{fb.category}</span>
                                                    <span className="text-[10px] text-text-secondary">{fb.count} notes</span>
                                                </div>
                                                <span className={`text-[9px] uppercase tracking-wider font-semibold ${sentimentColors[fb.sentiment]}`}>
                                                    {sentimentLabels[fb.sentiment]}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-white/60 leading-relaxed">{fb.consensus}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Reader Progress */}
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4">Reader Progress</h3>
                                <div className="space-y-2">
                                    {betaReaders.map(r => (
                                        <div key={r.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                            <span className="text-lg flex-none">{r.avatar}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-white font-medium">{r.name}</span>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400/70 rounded border border-amber-500/20">{r.tier}</span>
                                                    <span className="text-[9px] text-text-secondary ml-auto">{r.lastActive}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden max-w-[200px]">
                                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(r.chaptersRead / campaign.totalChapters) * 100}%` }} />
                                                    </div>
                                                    <span className="text-[10px] text-text-secondary">{r.chaptersRead}/{campaign.totalChapters} ch.</span>
                                                    <span className="text-[10px] text-text-secondary ml-2">{r.feedbackSubmitted} notes</span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-aurora-teal/10 text-aurora-teal rounded">{r.dnaMatch}% match</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ BETA READERS ═══ */}
                    {activeTab === 'readers' && (
                        <motion.div key="readers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-semibold text-white">Active Beta Readers</h3>
                                <button className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors flex items-center gap-1.5">
                                    <Search className="w-3 h-3" /> Browse by Book DNA Match
                                </button>
                            </div>
                            <div className="space-y-3">
                                {betaReaders.map((r, idx) => (
                                    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{r.avatar}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-semibold text-white">{r.name}</h4>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">{r.tier}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border capitalize
                                                        ${r.status === 'reading' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            r.status === 'reviewing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                'bg-white/[0.04] text-text-secondary border-white/[0.06]'}`}>{r.status}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] text-text-secondary">
                                                    <span>DNA Match: <span className="text-aurora-teal font-semibold">{r.dnaMatch}%</span></span>
                                                    <span>Chapters: {r.chaptersRead}/{campaign.totalChapters}</span>
                                                    <span>Feedback: {r.feedbackSubmitted} notes</span>
                                                    <span>Last active: {r.lastActive}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 bg-white/[0.04] text-white/70 text-xs border border-white/[0.06] rounded hover:bg-white/[0.08] transition-colors">
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="px-3 py-1.5 bg-white/[0.04] text-white/70 text-xs border border-white/[0.06] rounded hover:bg-white/[0.08] transition-colors">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ CHAPTER RELEASES ═══ */}
                    {activeTab === 'chapters' && (
                        <motion.div key="chapters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-semibold text-white">Chapter Release Schedule</h3>
                                <button className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors flex items-center gap-1.5">
                                    <Plus className="w-3 h-3" /> Schedule Release
                                </button>
                            </div>
                            <div className="space-y-2">
                                {chapters.map((ch, idx) => (
                                    <motion.div key={ch.chapter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`border rounded-xl overflow-hidden transition-all
                                            ${expandedChapter === ch.chapter ? 'bg-white/[0.03] border-amber-400/20' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'}`}>
                                        <button onClick={() => setExpandedChapter(expandedChapter === ch.chapter ? null : ch.chapter)}
                                            className="w-full text-left p-4 flex items-center gap-3">
                                            <span className="text-xs font-mono text-text-secondary w-8 flex-none">Ch.{ch.chapter}</span>
                                            <span className="text-sm text-white font-medium flex-1">{ch.title}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded border capitalize
                                                ${ch.status === 'released' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    ch.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-white/[0.04] text-text-secondary border-white/[0.06]'}`}>{ch.status}</span>
                                            <span className="text-[10px] text-text-secondary">{ch.releaseDate}</span>
                                            {ch.status === 'released' && <span className="text-[10px] text-text-secondary">{ch.readBy} read · {ch.feedbackCount} notes</span>}
                                            {ch.questions.length > 0 && <Target className="w-3 h-3 text-amber-400/50" />}
                                            <ChevronDown className={`w-3.5 h-3.5 text-white/20 flex-none transition-transform ${expandedChapter === ch.chapter ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {expandedChapter === ch.chapter && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="px-4 pb-4 border-t border-white/[0.04]">
                                                        {ch.questions.length > 0 && (
                                                            <div className="pt-3 mb-3">
                                                                <p className="text-[10px] uppercase tracking-widest text-amber-400/60 font-semibold mb-2 flex items-center gap-1.5">
                                                                    <Target className="w-3 h-3" /> Author Questions for This Chapter
                                                                </p>
                                                                <ul className="space-y-1.5">
                                                                    {ch.questions.map((q, i) => (
                                                                        <li key={i} className="text-xs text-white/70 flex items-start gap-2 pl-4">
                                                                            <span className="text-amber-400/40 text-[10px] mt-0.5">Q{i + 1}</span> {q}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 pt-2">
                                                            <button className="px-3 py-1.5 bg-white/[0.04] text-white text-xs border border-white/[0.06] rounded hover:bg-white/[0.08] transition-colors flex items-center gap-1.5">
                                                                <Edit3 className="w-3 h-3" /> Edit Questions
                                                            </button>
                                                            <button className="px-3 py-1.5 bg-white/[0.04] text-white text-xs border border-white/[0.06] rounded hover:bg-white/[0.08] transition-colors flex items-center gap-1.5">
                                                                <Eye className="w-3 h-3" /> View Feedback
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ AGGREGATE FEEDBACK ═══ */}
                    {activeTab === 'feedback' && (
                        <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-white mb-1">Aggregate Beta Reader Feedback</h3>
                                <p className="text-xs text-text-secondary">Consensus across {campaign.activeBetaReaders} readers · {campaign.totalFeedback} total feedback notes</p>
                            </div>
                            <div className="space-y-4">
                                {feedbackSummary.map((fb, idx) => (
                                    <motion.div key={fb.category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${fb.color}15` }}>
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fb.color }} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-white">{fb.category}</h4>
                                                <p className="text-[10px] text-text-secondary">{fb.count} feedback notes</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded border font-semibold uppercase tracking-wider
                                                ${fb.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    fb.sentiment === 'mixed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {sentimentLabels[fb.sentiment]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed pl-11">{fb.consensus}</p>
                                        <div className="flex items-center gap-4 mt-3 pl-11">
                                            <div className="h-1.5 flex-1 bg-white/[0.06] rounded-full overflow-hidden max-w-[300px]">
                                                <div className="h-full rounded-full" style={{
                                                    width: `${(fb.count / campaign.totalFeedback) * 100}%`,
                                                    backgroundColor: fb.color
                                                }} />
                                            </div>
                                            <span className="text-[10px] text-text-secondary">{Math.round((fb.count / campaign.totalFeedback) * 100)}% of all feedback</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
