import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, TrendingUp, Users, Brain, DollarSign, Flame, Target,
    BookOpen, PenTool, Sparkles, Eye, Clock, Zap, Award, Star,
    ChevronRight, ArrowUpRight, ArrowDownRight, Calendar, Activity,
    MessageSquare, ThumbsUp, AlertTriangle, CheckCircle2, XCircle,
    Feather, Heart, Shield, Layers, Hash, Type, FileText, Mic,
    Plus, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWritingSessions } from '../hooks/useWritingSessions';


// ── Seed Data: Beta Reader Hub ──
const BETA_READERS = [
    { id: 1, name: 'Aria Chen', avatar: '🧬', genres: ['Fantasy', 'Sci-Fi'], responseTime: '3 days', rating: 4.9, feedbackStyle: 'Detailed line edits', matchScore: 97, completionRate: 98, booksRead: 23, strengths: ['Worldbuilding critique', 'Pacing analysis', 'Character arcs'], status: 'available' },
    { id: 2, name: 'Marcus Webb', avatar: '📚', genres: ['Literary Fiction', 'Historical'], responseTime: '5 days', rating: 4.7, feedbackStyle: 'Big-picture narrative', matchScore: 92, completionRate: 95, booksRead: 18, strengths: ['Prose style', 'Theme development', 'Historical accuracy'], status: 'available' },
    { id: 3, name: 'Luna Okafor', avatar: '🌙', genres: ['Fantasy', 'Romance'], responseTime: '2 days', rating: 4.8, feedbackStyle: 'Emotional resonance focus', matchScore: 89, completionRate: 100, booksRead: 31, strengths: ['Dialogue', 'Emotional beats', 'Romantic tension'], status: 'reading' },
    { id: 4, name: 'Dev Patel', avatar: '🔮', genres: ['Sci-Fi', 'Thriller'], responseTime: '4 days', rating: 4.6, feedbackStyle: 'Plot structure & logic', matchScore: 85, completionRate: 91, booksRead: 15, strengths: ['Plot holes', 'Tension building', 'Tech accuracy'], status: 'available' },
    { id: 5, name: 'Sage Blackwood', avatar: '🌿', genres: ['Fantasy', 'Young Adult'], responseTime: '6 days', rating: 4.5, feedbackStyle: 'Voice & authenticity', matchScore: 81, completionRate: 88, booksRead: 27, strengths: ['Voice', 'Representation', 'Age-appropriate content'], status: 'unavailable' },
];

const FEEDBACK_PIPELINE = [
    { manuscript: 'The Obsidian Crown, Ch. 12-18', reader: 'Aria Chen', status: 'in-progress', dueDate: 'Mar 15', progress: 65 },
    { manuscript: 'The Obsidian Crown, Ch. 1-11', reader: 'Luna Okafor', status: 'completed', dueDate: 'Mar 2', progress: 100 },
    { manuscript: 'Ember Codex Outline', reader: 'Marcus Webb', status: 'pending', dueDate: 'Mar 20', progress: 0 },
    { manuscript: 'Short Story: "The Last Cartographer"', reader: 'Dev Patel', status: 'completed', dueDate: 'Feb 28', progress: 100 },
];

// ── Seed Data: Manuscript Intelligence ──
const MANUSCRIPT_HEALTH = {
    title: 'The Obsidian Crown',
    overallScore: 87,
    wordCount: 94200,
    chapters: 24,
    readability: { score: 72, grade: 'Grade 8-9', fleschKincaid: 8.3 },
    pacing: { score: 91, fastChapters: [3, 7, 14, 19], slowChapters: [9, 16] },
    dialogue: { ratio: 38, score: 85, avgExchangeLength: 4.2 },
    prose: { avgSentenceLength: 16.2, vocabularyRichness: 78, adverbDensity: 2.1, passiveVoice: 8 },
    chapters_data: [
        { num: 1, title: 'The Dust of Ages', words: 3200, pacing: 82, dialogue: 22, tension: 45, health: 88 },
        { num: 2, title: 'Whispers in the Dark', words: 4100, pacing: 78, dialogue: 35, tension: 62, health: 85 },
        { num: 3, title: 'The Order of Eclipse', words: 3800, pacing: 95, dialogue: 42, tension: 88, health: 94 },
        { num: 4, title: 'Flight from Athenaeum', words: 4500, pacing: 88, dialogue: 31, tension: 75, health: 90 },
        { num: 5, title: 'The Desert Crossing', words: 3600, pacing: 65, dialogue: 18, tension: 40, health: 72 },
        { num: 6, title: 'Oasis of Whispers', words: 3900, pacing: 71, dialogue: 45, tension: 55, health: 78 },
        { num: 7, title: 'The Marrow Awakens', words: 5200, pacing: 96, dialogue: 28, tension: 92, health: 95 },
        { num: 8, title: 'Bonds of Fire', words: 4200, pacing: 82, dialogue: 52, tension: 68, health: 86 },
    ],
};

// ── Seed Data: Audience Insights ──
const AUDIENCE_DATA = {
    totalReaders: 2847,
    activeReaders: 1203,
    avgCompletionRate: 78,
    avgReadingTime: '4.2 hrs',
    readerDemographics: [
        { label: '18-24', percent: 22 }, { label: '25-34', percent: 38 }, { label: '35-44', percent: 24 },
        { label: '45-54', percent: 11 }, { label: '55+', percent: 5 },
    ],
    topHighlightedPassages: [
        { chapter: 1, paragraph: 'Ignis. Vita. Mors.', highlights: 89, reactions: 142 },
        { chapter: 3, paragraph: 'The fire within could not be extinguished...', highlights: 67, reactions: 98 },
        { chapter: 7, paragraph: 'The marrow remembered what the mind forgot.', highlights: 54, reactions: 76 },
    ],
    readingVelocity: [
        { chapter: 1, avgMinutes: 12, dropoff: 2 },
        { chapter: 2, avgMinutes: 15, dropoff: 5 },
        { chapter: 3, avgMinutes: 11, dropoff: 1 },
        { chapter: 4, avgMinutes: 14, dropoff: 3 },
        { chapter: 5, avgMinutes: 18, dropoff: 8 },
        { chapter: 6, avgMinutes: 16, dropoff: 4 },
        { chapter: 7, avgMinutes: 10, dropoff: 1 },
        { chapter: 8, avgMinutes: 13, dropoff: 2 },
    ],
    sentimentTimeline: [
        { chapter: 1, curiosity: 82, tension: 45, wonder: 68, joy: 20, sadness: 15 },
        { chapter: 2, curiosity: 70, tension: 62, wonder: 55, joy: 10, sadness: 30 },
        { chapter: 3, curiosity: 45, tension: 88, wonder: 40, joy: 5, sadness: 20 },
        { chapter: 4, curiosity: 60, tension: 75, wonder: 50, joy: 25, sadness: 15 },
        { chapter: 5, curiosity: 55, tension: 40, wonder: 72, joy: 45, sadness: 10 },
        { chapter: 6, curiosity: 65, tension: 55, wonder: 60, joy: 30, sadness: 25 },
        { chapter: 7, curiosity: 40, tension: 92, wonder: 85, joy: 15, sadness: 35 },
        { chapter: 8, curiosity: 75, tension: 68, wonder: 70, joy: 40, sadness: 20 },
    ],
};

// ── Seed Data: Revenue ──
const REVENUE_DATA = {
    totalEarnings: 12480,
    monthlyEarnings: 2340,
    projectedAnnual: 28080,
    royaltyRate: 70,
    salesByChannel: [
        { channel: 'Direct (runaatlaspress.com)', sales: 342, revenue: 5814, percent: 47 },
        { channel: 'Amazon Kindle', sales: 289, revenue: 3468, percent: 28 },
        { channel: 'Apple Books', sales: 156, revenue: 1872, percent: 15 },
        { channel: 'Print-on-Demand', sales: 78, revenue: 1326, percent: 10 },
    ],
    monthlyRevenue: [
        { month: 'Jul', revenue: 1200 }, { month: 'Aug', revenue: 1450 }, { month: 'Sep', revenue: 1100 },
        { month: 'Oct', revenue: 1800 }, { month: 'Nov', revenue: 2100 }, { month: 'Dec', revenue: 2800 },
        { month: 'Jan', revenue: 1950 }, { month: 'Feb', revenue: 2340 }, { month: 'Mar', revenue: 1740 },
    ],
};

type Tab = 'analytics' | 'beta' | 'manuscript' | 'audience' | 'revenue';

const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'analytics', label: 'Writing Analytics', icon: BarChart3 },
    { id: 'beta', label: 'Beta Reader Hub', icon: Users },
    { id: 'manuscript', label: 'Manuscript Intelligence', icon: Brain },
    { id: 'audience', label: 'Audience Insights', icon: Eye },
    { id: 'revenue', label: 'Revenue & Reach', icon: DollarSign },
];

// ── Helper Components ──
function StatCard({ icon: Icon, label, value, change, changeType, sub }: { icon: any; label: string; value: string; change?: string; changeType?: 'up' | 'down'; sub?: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-5">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-sm bg-starforge-gold/10"><Icon className="w-4 h-4 text-starforge-gold" /></div>
                {change && (
                    <span className={`flex items-center gap-0.5 text-xs ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {change}
                    </span>
                )}
            </div>
            <p className="text-2xl font-semibold text-white mb-0.5">{value}</p>
            <p className="text-[11px] text-text-secondary">{label}</p>
            {sub && <p className="text-[10px] text-text-secondary/60 mt-1">{sub}</p>}
        </div>
    );
}

function ProgressBar({ value, max, color = 'bg-starforge-gold', height = 'h-1.5' }: { value: number; max: number; color?: string; height?: string }) {
    return (
        <div className={`w-full ${height} rounded-full bg-white/[0.06]`}>
            <div className={`${height} rounded-full ${color} transition-all`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
        </div>
    );
}

function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
    const circumference = 2 * Math.PI * (size / 2 - 6);
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 90 ? '#34d399' : score >= 75 ? '#d4a853' : score >= 60 ? '#fb923c' : '#f87171';
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={size / 2 - 6} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
                <circle cx={size / 2} cy={size / 2} r={size / 2 - 6} fill="none" stroke={color} strokeWidth={4} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                <span className="text-lg font-bold text-white">{score}</span>
            </div>
            {label && <span className="text-[10px] text-text-secondary uppercase tracking-wider">{label}</span>}
        </div>
    );
}

// ── Main Component ──
export default function CreatorStudio() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('analytics');

    return (
        <div className="min-h-screen bg-void-black pt-6 pb-24">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-starforge-gold/20 to-cosmic-purple/20 border border-starforge-gold/30 flex items-center justify-center">
                        <Feather className="w-6 h-6 text-starforge-gold" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display text-white uppercase tracking-widest">Creator Studio</h1>
                        <p className="text-xs text-text-secondary font-ui">Your command center for writing, readers, and revenue</p>
                    </div>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="max-w-7xl mx-auto px-6 mb-8">
                <div className="flex gap-1 bg-white/[0.02] rounded-sm p-1 border border-white/[0.06] overflow-x-auto">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-ui uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-starforge-gold/15 text-starforge-gold border border-starforge-gold/30'
                                : 'text-text-secondary hover:text-white hover:bg-white/[0.03]'
                                }`}>
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-6">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'analytics' && <WritingAnalytics />}
                        {activeTab === 'beta' && <BetaReaderHub />}
                        {activeTab === 'manuscript' && <ManuscriptIntelligence />}
                        {activeTab === 'audience' && <AudienceInsights />}
                        {activeTab === 'revenue' && <RevenueReach />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════
// TAB 1: Writing Analytics (LIVE FROM FIRESTORE)
// ════════════════════════════════════════════════════════
function WritingAnalytics() {
    const {
        sessions, loading, logSession,
        dailyData, getCurrentStreak, getLongestStreak,
        monthlyData, totalWordsYear, avgDailyWords, totalSessions
    } = useWritingSessions();
    const [showLogModal, setShowLogModal] = useState(false);
    const [logForm, setLogForm] = useState({ words: '', minutes: '', manuscript: '', date: new Date().toISOString().split('T')[0] });
    const [saving, setSaving] = useState(false);

    const daily = dailyData();
    const monthly = monthlyData();
    const streak = getCurrentStreak();
    const longest = getLongestStreak();
    const yearWords = totalWordsYear();
    const avgDaily = avgDailyWords();
    const bestDay = Math.max(...daily.map(d => d.words));

    const handleLogSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!logForm.words || !logForm.manuscript) return;
        setSaving(true);
        await logSession(Number(logForm.words), Number(logForm.minutes) || Math.ceil(Number(logForm.words) / 15), logForm.manuscript, logForm.date);
        setShowLogModal(false);
        setLogForm({ words: '', minutes: '', manuscript: '', date: new Date().toISOString().split('T')[0] });
        setSaving(false);
    };

    return (
        <div className="space-y-8">
            {/* Log Session Button */}
            <div className="flex justify-end">
                <button onClick={() => setShowLogModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-sm bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-wider hover:bg-starforge-gold/90 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Log Writing Session
                </button>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Flame} label="Current Streak" value={`${streak} days`} sub={`Longest: ${longest} days`} />
                <StatCard icon={Type} label="Words This Year" value={yearWords.toLocaleString()} sub={sessions.length > 0 ? `${sessions.length} sessions total` : 'Start writing to track!'} />
                <StatCard icon={Clock} label="Avg Daily Words" value={avgDaily.toLocaleString()} sub={bestDay > 0 ? `Best day: ${bestDay.toLocaleString()} words` : 'Last 30 days'} />
                <StatCard icon={Zap} label="Writing Sessions" value={totalSessions.toLocaleString()} sub={`Avg ${totalSessions > 0 ? Math.round(sessions.reduce((s, x) => s + (x.minutes || 0), 0) / totalSessions) : 0} min/session`} />
            </div>

            {/* Streak Heatmap */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-starforge-gold" /> Writing Activity (365 days)
                    {loading && <span className="text-[10px] text-text-secondary normal-case tracking-normal animate-pulse">Loading...</span>}
                </h3>
                <div className="flex gap-[3px] flex-wrap">
                    {daily.map((day, i) => {
                        const intensity = day.words === 0 ? 0 : day.words < 500 ? 1 : day.words < 1500 ? 2 : day.words < 2500 ? 3 : 4;
                        const colors = ['bg-white/[0.04]', 'bg-emerald-900/60', 'bg-emerald-700/60', 'bg-emerald-500/60', 'bg-emerald-400/80'];
                        return (
                            <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${colors[intensity]} transition-colors`}
                                title={`${day.date}: ${day.words.toLocaleString()} words`} />
                        );
                    })}
                </div>
                <div className="flex items-center gap-2 mt-3 text-[10px] text-text-secondary">
                    <span>Less</span>
                    {['bg-white/[0.04]', 'bg-emerald-900/60', 'bg-emerald-700/60', 'bg-emerald-500/60', 'bg-emerald-400/80'].map((c, i) => (
                        <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
                    ))}
                    <span>More</span>
                </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-starforge-gold" /> Monthly Word Count
                </h3>
                <div className="flex items-end gap-3" style={{ height: 160 }}>
                    {monthly.map((m, i) => {
                        const maxWords = Math.max(...monthly.map(d => d.words), 1);
                        const barHeight = Math.round((m.words / maxWords) * 120);
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2" style={{ height: '100%' }}>
                                <span className="text-[9px] text-text-secondary">{m.words > 0 ? `${(m.words / 1000).toFixed(1)}k` : '0'}</span>
                                <div className="w-full rounded-t-sm bg-gradient-to-t from-starforge-gold/30 to-starforge-gold/60 transition-all"
                                    style={{ height: barHeight }} />
                                <span className="text-[10px] text-text-secondary">{m.month}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Writing Goals */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-starforge-gold" /> Active Goals
                </h3>
                <div className="space-y-4">
                    {[
                        { goal: 'Complete The Obsidian Crown draft', target: 100000, current: yearWords, unit: 'words', deadline: 'Apr 2027' },
                        { goal: 'Daily writing streak', target: 30, current: streak, unit: 'days', deadline: 'Ongoing' },
                        { goal: 'Short stories for anthology', target: 5, current: 3, unit: 'stories', deadline: 'Jun 2027' },
                    ].map((g, i) => (
                        <div key={i}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm text-white">{g.goal}</span>
                                <span className="text-[10px] text-text-secondary">{g.current.toLocaleString()}/{g.target.toLocaleString()} {g.unit}</span>
                            </div>
                            <ProgressBar value={g.current} max={g.target} />
                            <p className="text-[10px] text-text-secondary/60 mt-1">Deadline: {g.deadline}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Sessions */}
            {sessions.length > 0 && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                    <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-starforge-gold" /> Recent Sessions
                    </h3>
                    <div className="space-y-2">
                        {sessions.slice(0, 10).map(s => (
                            <div key={s.id} className="flex items-center gap-3 p-3 rounded-sm bg-white/[0.02] border border-white/[0.04]">
                                <div className={`w-2 h-2 rounded-full ${s.source === 'episode' ? 'bg-starforge-gold' : 'bg-aurora-teal'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{s.manuscript}</p>
                                    <p className="text-[10px] text-text-secondary">{s.date} &middot; {s.source === 'episode' ? 'Episode save' : 'Manual log'}</p>
                                </div>
                                <span className="text-sm font-semibold text-starforge-gold">{s.words.toLocaleString()}</span>
                                <span className="text-[10px] text-text-secondary">words</span>
                                {s.minutes > 0 && (
                                    <span className="text-[10px] text-text-secondary">&middot; {s.minutes}m</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Log Session Modal */}
            {showLogModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLogModal(false)}>
                    <div className="bg-deep-space border border-white/[0.1] rounded-sm p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-ui text-white uppercase tracking-widest flex items-center gap-2">
                                <PenTool className="w-4 h-4 text-starforge-gold" /> Log Writing Session
                            </h3>
                            <button onClick={() => setShowLogModal(false)} className="text-text-secondary hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleLogSession} className="space-y-4">
                            <div>
                                <label className="text-[10px] text-text-secondary uppercase tracking-wider block mb-1">Word Count *</label>
                                <input type="number" required min={1} value={logForm.words}
                                    onChange={e => setLogForm(f => ({ ...f, words: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-sm bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-starforge-gold/40"
                                    placeholder="1200" />
                            </div>
                            <div>
                                <label className="text-[10px] text-text-secondary uppercase tracking-wider block mb-1">Minutes Spent</label>
                                <input type="number" min={1} value={logForm.minutes}
                                    onChange={e => setLogForm(f => ({ ...f, minutes: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-sm bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-starforge-gold/40"
                                    placeholder="45 (auto-estimated if blank)" />
                            </div>
                            <div>
                                <label className="text-[10px] text-text-secondary uppercase tracking-wider block mb-1">Manuscript / Project *</label>
                                <input type="text" required value={logForm.manuscript}
                                    onChange={e => setLogForm(f => ({ ...f, manuscript: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-sm bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-starforge-gold/40"
                                    placeholder="The Obsidian Crown" />
                            </div>
                            <div>
                                <label className="text-[10px] text-text-secondary uppercase tracking-wider block mb-1">Date</label>
                                <input type="date" value={logForm.date}
                                    onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-sm bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-starforge-gold/40" />
                            </div>
                            <button type="submit" disabled={saving}
                                className="w-full py-2.5 rounded-sm bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-wider hover:bg-starforge-gold/90 transition-colors disabled:opacity-50">
                                {saving ? 'Saving...' : 'Log Session'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════
// TAB 2: Beta Reader Hub
// ════════════════════════════════════════════════════════
function BetaReaderHub() {
    const [selectedReader, setSelectedReader] = useState<typeof BETA_READERS[0] | null>(null);

    return (
        <div className="space-y-8">
            {/* Feedback Pipeline */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-starforge-gold" /> Feedback Pipeline
                </h3>
                <div className="space-y-3">
                    {FEEDBACK_PIPELINE.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-sm bg-white/[0.02] border border-white/[0.04]">
                            <div className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-emerald-400' : item.status === 'in-progress' ? 'bg-starforge-gold animate-pulse' : 'bg-white/20'}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{item.manuscript}</p>
                                <p className="text-[10px] text-text-secondary">{item.reader} &middot; Due {item.dueDate}</p>
                            </div>
                            <div className="w-24">
                                <ProgressBar value={item.progress} max={100} color={item.status === 'completed' ? 'bg-emerald-400' : 'bg-starforge-gold'} />
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : item.status === 'in-progress' ? 'bg-starforge-gold/10 text-starforge-gold' : 'bg-white/5 text-text-secondary'}`}>
                                {item.status === 'in-progress' ? 'Reading' : item.status === 'completed' ? 'Done' : 'Queued'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Beta Reader Matching */}
            <div>
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-starforge-gold" /> Matched Beta Readers
                    <span className="text-[10px] text-text-secondary font-normal normal-case tracking-normal ml-2">Ranked by compatibility with your writing style</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {BETA_READERS.map(reader => {
                        const isExpanded = selectedReader?.id === reader.id;
                        return (
                            <div key={reader.id}
                                className={`bg-white/[0.03] border rounded-sm p-5 cursor-pointer transition-all hover:-translate-y-0.5 ${isExpanded ? 'border-starforge-gold/40' : 'border-white/[0.06] hover:border-white/[0.12]'}`}
                                onClick={() => setSelectedReader(isExpanded ? null : reader)}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-lg">{reader.avatar}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-white font-semibold">{reader.name}</p>
                                            <span className={`w-2 h-2 rounded-full ${reader.status === 'available' ? 'bg-emerald-400' : reader.status === 'reading' ? 'bg-starforge-gold' : 'bg-red-400'}`} />
                                        </div>
                                        <p className="text-[10px] text-text-secondary">{reader.genres.join(' / ')}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-starforge-gold">{reader.matchScore}%</div>
                                        <div className="text-[9px] text-text-secondary uppercase">Match</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-3 text-[10px] text-text-secondary">
                                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{reader.rating}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{reader.responseTime}</span>
                                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{reader.booksRead} books</span>
                                </div>

                                <p className="text-xs text-text-secondary mb-3"><strong className="text-white/70">Style:</strong> {reader.feedbackStyle}</p>

                                {isExpanded && (
                                    <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-2">
                                        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Strengths</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {reader.strengths.map(s => (
                                                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/20">{s}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-[10px] text-text-secondary">Completion rate: {reader.completionRate}%</span>
                                            <button onClick={(e) => { e.stopPropagation(); }} className="text-[10px] px-3 py-1 rounded-sm bg-starforge-gold text-void-black font-semibold uppercase tracking-wider hover:bg-starforge-gold/90">
                                                {reader.status === 'available' ? 'Request Read' : 'Join Waitlist'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════
// TAB 3: Manuscript Intelligence
// ════════════════════════════════════════════════════════
function ManuscriptIntelligence() {
    const ms = MANUSCRIPT_HEALTH;
    return (
        <div className="space-y-8">
            {/* Overall Score */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="relative flex items-center justify-center">
                        <ScoreRing score={ms.overallScore} size={100} />
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-bold text-white">{ms.overallScore}</span>
                            <span className="text-[8px] text-text-secondary uppercase">Health</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg text-white font-semibold mb-1">{ms.title}</h3>
                        <p className="text-xs text-text-secondary mb-3">{ms.wordCount.toLocaleString()} words across {ms.chapters} chapters</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Readability', value: ms.readability.score, detail: `Grade ${ms.readability.fleschKincaid}` },
                                { label: 'Pacing', value: ms.pacing.score, detail: `${ms.pacing.fastChapters.length} fast, ${ms.pacing.slowChapters.length} slow` },
                                { label: 'Dialogue', value: ms.dialogue.score, detail: `${ms.dialogue.ratio}% dialogue ratio` },
                                { label: 'Prose Style', value: ms.prose.vocabularyRichness, detail: `${ms.prose.avgSentenceLength} avg words/sentence` },
                            ].map(m => (
                                <div key={m.label} className="text-center p-3 rounded-sm bg-white/[0.02]">
                                    <div className={`text-xl font-bold ${m.value >= 85 ? 'text-emerald-400' : m.value >= 70 ? 'text-starforge-gold' : 'text-orange-400'}`}>{m.value}</div>
                                    <div className="text-[10px] text-white/60 uppercase tracking-wider">{m.label}</div>
                                    <div className="text-[9px] text-text-secondary">{m.detail}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Prose Diagnostics */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                    <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-starforge-gold" /> Prose Diagnostics
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Adverb Density', value: ms.prose.adverbDensity, max: 5, target: 2, unit: '%', good: ms.prose.adverbDensity < 3 },
                            { label: 'Passive Voice', value: ms.prose.passiveVoice, max: 20, target: 8, unit: '%', good: ms.prose.passiveVoice < 10 },
                            { label: 'Vocabulary Richness', value: ms.prose.vocabularyRichness, max: 100, target: 75, unit: '/100', good: ms.prose.vocabularyRichness >= 70 },
                            { label: 'Avg Sentence Length', value: ms.prose.avgSentenceLength, max: 25, target: 16, unit: ' words', good: ms.prose.avgSentenceLength < 20 },
                        ].map(d => (
                            <div key={d.label}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-white/70 flex items-center gap-1.5">
                                        {d.good ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-orange-400" />}
                                        {d.label}
                                    </span>
                                    <span className="text-xs text-text-secondary">{d.value}{d.unit}</span>
                                </div>
                                <ProgressBar value={d.value} max={d.max} color={d.good ? 'bg-emerald-400' : 'bg-orange-400'} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                    <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" /> AI Suggestions
                    </h3>
                    <div className="space-y-3">
                        {[
                            { severity: 'warning', text: 'Chapter 5 pacing score (65) is significantly below average. Consider trimming the desert crossing sequence or adding a subplot beat.', chapter: 5 },
                            { severity: 'info', text: 'Dialogue ratio drops below 20% in Chapters 1 and 5. Readers report these chapters feel "dense." Consider breaking up exposition with character interaction.', chapter: null },
                            { severity: 'success', text: 'Chapters 3 and 7 have the highest tension and pacing scores. Your action sequences are consistently strong.', chapter: null },
                            { severity: 'info', text: 'Vocabulary richness (78) is above average for the genre. Your prose style is distinctive without being inaccessible.', chapter: null },
                        ].map((s, i) => (
                            <div key={i} className={`flex gap-3 p-3 rounded-sm text-xs ${s.severity === 'warning' ? 'bg-orange-400/5 border border-orange-400/15' : s.severity === 'success' ? 'bg-emerald-400/5 border border-emerald-400/15' : 'bg-white/[0.02] border border-white/[0.05]'}`}>
                                {s.severity === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" /> :
                                    s.severity === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> :
                                        <Sparkles className="w-3.5 h-3.5 text-starforge-gold shrink-0 mt-0.5" />}
                                <p className="text-text-secondary leading-relaxed">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chapter Health Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6 overflow-x-auto">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-starforge-gold" /> Chapter-by-Chapter Analysis
                </h3>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="text-text-secondary text-left">
                            <th className="pb-3 font-normal">#</th>
                            <th className="pb-3 font-normal">Title</th>
                            <th className="pb-3 font-normal text-center">Words</th>
                            <th className="pb-3 font-normal text-center">Pacing</th>
                            <th className="pb-3 font-normal text-center">Dialogue %</th>
                            <th className="pb-3 font-normal text-center">Tension</th>
                            <th className="pb-3 font-normal text-center">Health</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ms.chapters_data.map(ch => (
                            <tr key={ch.num} className="border-t border-white/[0.04]">
                                <td className="py-2.5 text-text-secondary">{ch.num}</td>
                                <td className="py-2.5 text-white">{ch.title}</td>
                                <td className="py-2.5 text-center text-text-secondary">{ch.words.toLocaleString()}</td>
                                <td className="py-2.5 text-center">
                                    <span className={ch.pacing >= 85 ? 'text-emerald-400' : ch.pacing >= 70 ? 'text-starforge-gold' : 'text-orange-400'}>{ch.pacing}</span>
                                </td>
                                <td className="py-2.5 text-center text-text-secondary">{ch.dialogue}%</td>
                                <td className="py-2.5 text-center">
                                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] mx-auto max-w-[60px]">
                                        <div className="h-1.5 rounded-full bg-red-400/80 transition-all" style={{ width: `${ch.tension}%` }} />
                                    </div>
                                </td>
                                <td className="py-2.5 text-center">
                                    <span className={`font-semibold ${ch.health >= 90 ? 'text-emerald-400' : ch.health >= 80 ? 'text-starforge-gold' : 'text-orange-400'}`}>{ch.health}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════
// TAB 4: Audience Insights
// ════════════════════════════════════════════════════════
function AudienceInsights() {
    const a = AUDIENCE_DATA;
    return (
        <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Readers" value={a.totalReaders.toLocaleString()} change="+156" changeType="up" />
                <StatCard icon={Eye} label="Active Readers (30d)" value={a.activeReaders.toLocaleString()} change="+12%" changeType="up" />
                <StatCard icon={Target} label="Avg Completion Rate" value={`${a.avgCompletionRate}%`} change="+3%" changeType="up" />
                <StatCard icon={Clock} label="Avg Reading Time" value={a.avgReadingTime} />
            </div>

            {/* Reading Velocity & Drop-off */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                    <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-starforge-gold" /> Reading Velocity by Chapter
                    </h3>
                    <p className="text-[10px] text-text-secondary mb-4">Minutes spent per chapter (lower = faster reading = better pacing)</p>
                    <div className="flex items-end gap-3" style={{ height: 144 }}>
                        {a.readingVelocity.map((ch, i) => {
                            const maxMin = Math.max(...a.readingVelocity.map(c => c.avgMinutes));
                            const barHeight = Math.round((ch.avgMinutes / maxMin) * 100);
                            const isSlowChapter = ch.avgMinutes >= 16;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ height: '100%' }}>
                                    <span className="text-[9px] text-text-secondary">{ch.avgMinutes}m</span>
                                    <div className={`w-full rounded-t-sm transition-all ${isSlowChapter ? 'bg-gradient-to-t from-orange-400/30 to-orange-400/60' : 'bg-gradient-to-t from-aurora-teal/30 to-aurora-teal/60'}`}
                                        style={{ height: barHeight }} />
                                    <span className="text-[10px] text-text-secondary">Ch.{ch.chapter}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                    <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-400" /> Chapter Drop-off Funnel
                    </h3>
                    <p className="text-[10px] text-text-secondary mb-4">Percentage of readers who stop reading at each chapter</p>
                    <div className="space-y-2">
                        {a.readingVelocity.map(ch => (
                            <div key={ch.chapter} className="flex items-center gap-3">
                                <span className="text-[10px] text-text-secondary w-10">Ch.{ch.chapter}</span>
                                <div className="flex-1 h-3 rounded-full bg-white/[0.04]">
                                    <div className={`h-3 rounded-full transition-all ${ch.dropoff >= 6 ? 'bg-red-400/70' : ch.dropoff >= 3 ? 'bg-orange-400/50' : 'bg-emerald-400/40'}`}
                                        style={{ width: `${ch.dropoff * 3}%` }} />
                                </div>
                                <span className={`text-[10px] w-8 text-right ${ch.dropoff >= 6 ? 'text-red-400' : 'text-text-secondary'}`}>{ch.dropoff}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sentiment Timeline */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" /> Reader Sentiment Timeline
                </h3>
                <p className="text-[10px] text-text-secondary mb-4">How readers emotionally experienced your story, based on highlight reactions and annotations</p>
                <div className="space-y-3">
                    {(['curiosity', 'tension', 'wonder', 'joy', 'sadness'] as const).map(emotion => {
                        const colors: Record<string, string> = { curiosity: 'bg-blue-400', tension: 'bg-red-400', wonder: 'bg-purple-400', joy: 'bg-emerald-400', sadness: 'bg-cyan-400' };
                        return (
                            <div key={emotion} className="flex items-center gap-3">
                                <span className="text-[10px] text-text-secondary w-16 capitalize">{emotion}</span>
                                <div className="flex-1 flex items-center gap-1">
                                    {a.sentimentTimeline.map((ch, i) => (
                                        <div key={i} className="flex-1 flex items-end h-6">
                                            <div className={`w-full rounded-t-sm ${colors[emotion]}`} style={{ height: `${ch[emotion]}%`, opacity: 0.6 }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    <div className="flex items-center gap-1 pt-2 pl-[76px]">
                        {a.sentimentTimeline.map((_, i) => (
                            <span key={i} className="flex-1 text-center text-[9px] text-text-secondary">Ch.{i + 1}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Most Highlighted Passages */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-starforge-gold" /> Most Resonant Passages
                </h3>
                <div className="space-y-3">
                    {a.topHighlightedPassages.map((p, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-sm bg-white/[0.02] border border-white/[0.04]">
                            <div className="w-8 h-8 rounded-full bg-starforge-gold/10 flex items-center justify-center text-sm font-bold text-starforge-gold">#{i + 1}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white italic">"{p.paragraph}"</p>
                                <p className="text-[10px] text-text-secondary mt-1">Chapter {p.chapter}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm font-semibold text-starforge-gold">{p.highlights}</p>
                                <p className="text-[9px] text-text-secondary">highlights</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm font-semibold text-cosmic-purple">{p.reactions}</p>
                                <p className="text-[9px] text-text-secondary">reactions</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════
// TAB 5: Revenue & Reach
// ════════════════════════════════════════════════════════
function RevenueReach() {
    const r = REVENUE_DATA;
    return (
        <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={DollarSign} label="Total Earnings" value={`$${r.totalEarnings.toLocaleString()}`} change="+22%" changeType="up" />
                <StatCard icon={TrendingUp} label="This Month" value={`$${r.monthlyEarnings.toLocaleString()}`} change="+8%" changeType="up" />
                <StatCard icon={Target} label="Projected Annual" value={`$${r.projectedAnnual.toLocaleString()}`} />
                <StatCard icon={Award} label="Royalty Rate" value={`${r.royaltyRate}%`} sub="Industry avg: 12-25%" />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-starforge-gold" /> Monthly Revenue
                </h3>
                <div className="flex items-end gap-3" style={{ height: 176 }}>
                    {r.monthlyRevenue.map((m, i) => {
                        const maxRev = Math.max(...r.monthlyRevenue.map(d => d.revenue));
                        const barHeight = Math.round((m.revenue / maxRev) * 140);
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2" style={{ height: '100%' }}>
                                <span className="text-[9px] text-text-secondary">${(m.revenue / 1000).toFixed(1)}k</span>
                                <div className="w-full rounded-t-sm bg-gradient-to-t from-emerald-500/30 to-emerald-400/60 transition-all"
                                    style={{ height: barHeight }} />
                                <span className="text-[10px] text-text-secondary">{m.month}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sales by Channel */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-sm p-6">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-starforge-gold" /> Sales by Channel
                </h3>
                <div className="space-y-4">
                    {r.salesByChannel.map(ch => (
                        <div key={ch.channel}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm text-white">{ch.channel}</span>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="text-text-secondary">{ch.sales} sales</span>
                                    <span className="text-emerald-400 font-semibold">${ch.revenue.toLocaleString()}</span>
                                </div>
                            </div>
                            <ProgressBar value={ch.percent} max={100} color="bg-gradient-to-r from-emerald-500 to-emerald-400" height="h-2" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Royalty Comparison */}
            <div className="bg-gradient-to-r from-starforge-gold/5 to-cosmic-purple/5 border border-starforge-gold/15 rounded-sm p-6">
                <h3 className="text-sm font-ui text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-starforge-gold" /> The Runa Atlas Advantage
                </h3>
                <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-xs text-text-secondary mb-1">Traditional Press</p>
                        <p className="text-2xl font-bold text-white/40">12%</p>
                        <p className="text-[10px] text-text-secondary">royalty rate</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary mb-1">Self-Published (Amazon)</p>
                        <p className="text-2xl font-bold text-white/60">35%</p>
                        <p className="text-[10px] text-text-secondary">royalty rate</p>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-2 bg-starforge-gold/5 rounded-sm border border-starforge-gold/20" />
                        <div className="relative">
                            <p className="text-xs text-starforge-gold mb-1">Runa Atlas Press</p>
                            <p className="text-2xl font-bold text-starforge-gold">70%</p>
                            <p className="text-[10px] text-starforge-gold/70">royalty rate</p>
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-text-secondary text-center mt-4">
                    With the same 865 total sales, you would have earned $2,138 at a traditional press, $5,969 self-published on Amazon, or <strong className="text-starforge-gold">${r.totalEarnings.toLocaleString()}</strong> with Runa Atlas.
                </p>
            </div>
        </div>
    );
}
