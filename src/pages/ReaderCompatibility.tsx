import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Heart, BookOpen, MessageCircle, Star, Sparkles,
    ArrowRight, ChevronDown, ChevronRight, Eye, Clock,
    Bookmark, Zap, Target, BarChart3, Send, Check,
    X, Dna, Quote, Flame, Award
} from 'lucide-react';
import AuthGatedCTA from '../components/AuthGatedCTA';

// ═══════════════════════════════════════════════
// READER COMPATIBILITY — Find Your Book Buddy
// ═══════════════════════════════════════════════

interface ReaderMatch {
    id: string;
    username: string;
    avatar: string;
    personality: string;
    overallMatch: number;
    dnaMatch: number;
    highlightOverlap: number;
    paceMatch: number;
    sharedBooks: number;
    totalBooks: number;
    topGenres: string[];
    favBook: string;
    recentRead: string;
    sharedHighlights: string[];
    status: 'online' | 'reading' | 'idle';
    badge?: string;
}

export default function ReaderCompatibility() {
    const { user } = useAuth();
    const [matches, setMatches] = useState<ReaderMatch[]>([]);
    const [buddyReads, setBuddyReads] = useState<any[]>([]);
    const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'matches' | 'buddy-reads' | 'invites'>('matches');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (u) => {
            if (!u) { setLoading(false); return; }
            const unsub = onSnapshot(
                query(collection(db, 'reader_matches'), where('userId', '==', u.uid)),
                (snap) => {
                    setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReaderMatch)));
                    setLoading(false);
                },
                () => setLoading(false)
            );
            const unsubBuddy = onSnapshot(
                query(collection(db, 'buddy_reads'), where('userId', '==', u.uid)),
                (snap) => {
                    setBuddyReads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                },
                () => { }
            );
            return () => { unsub(); unsubBuddy(); };
        });
        return () => unsubAuth();
    }, []);

    const statusColors = {
        online: 'bg-emerald-400',
        reading: 'bg-aurora-teal',
        idle: 'bg-white/20',
    };
    const statusLabels = {
        online: 'Online',
        reading: 'Currently Reading',
        idle: 'Away',
    };

    // State 1: Not logged in → full-page CTA
    if (!loading && !user) {
        return (
            <div className="min-h-screen bg-void-black text-white">
                <AuthGatedCTA
                    icon={Users}
                    title="Find Your Book Buddy"
                    subtitle="Reader Compatibility matches you with people who read like you — same genres, same tastes, same obsessions. Start buddy reads and discover books through shared reading."
                    ctaText="Sign In to Find Matches"
                    accentColor="rose"
                />
            </div>
        );
    }

    // State 2: Logged in but no matches → encouraging CTA
    if (!loading && user && matches.length === 0) {
        return (
            <div className="min-h-screen bg-void-black text-white">
                <AuthGatedCTA
                    icon={Heart}
                    title="Your Matches Are Coming"
                    subtitle="Read and rate more books to build your Book DNA. The more we know about your taste, the better we can match you with compatible readers for buddy reads and discussions."
                    ctaText="Browse the Catalog"
                    ctaLink="/catalog"
                    accentColor="rose"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">Reader Compatibility</h1>
                                <p className="text-xs text-text-secondary">Find readers who see the world the way you do.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-text-secondary flex items-center gap-1.5">
                                <Dna className="w-3.5 h-3.5 text-violet-400" />
                                Powered by your Book DNA
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-6">
                        {[
                            { id: 'matches' as const, label: 'Your Matches', icon: Heart, count: matches.length },
                            { id: 'buddy-reads' as const, label: 'Buddy Reads', icon: BookOpen, count: buddyReads.length },
                            { id: 'invites' as const, label: 'Invitations', icon: Send, count: 2 },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 text-sm border-b-2 transition-colors
                                    ${activeTab === tab.id ? 'border-rose-400 text-rose-400' : 'border-transparent text-text-secondary hover:text-white'}`}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] rounded-full">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {/* ═══ matches TAB ═══ */}
                    {activeTab === 'matches' && (
                        <motion.div key="matches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="space-y-3">
                                {matches.map((match, idx) => {
                                    const isExpanded = expandedMatch === match.id;
                                    return (
                                        <motion.div key={match.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                            className={`border rounded-xl overflow-hidden transition-all
                                                ${isExpanded ? 'bg-white/[0.03] border-rose-400/20' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'}`}>
                                            {/* Summary Row */}
                                            <button onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                                                className="w-full text-left p-5 flex items-center gap-4">
                                                {/* Avatar + Status */}
                                                <div className="relative flex-none">
                                                    <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-2xl">
                                                        {match.avatar}
                                                    </div>
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-void-black ${statusColors[match.status]}`} />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-semibold text-white">{match.username}</span>
                                                        <span className="text-[10px] text-text-secondary">{match.personality}</span>
                                                        {match.badge && (
                                                            <span className="text-[9px] px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20">{match.badge}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[10px] text-text-secondary">
                                                        <span>{match.sharedBooks} shared books</span>
                                                        <span>{match.highlightOverlap}% highlight overlap</span>
                                                        <span className="flex items-center gap-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${statusColors[match.status]}`} />
                                                            {statusLabels[match.status]}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Match Score */}
                                                <div className="flex items-center gap-3 flex-none">
                                                    <div className="text-right">
                                                        <p className={`text-xl font-display ${match.overallMatch >= 85 ? 'text-rose-400' : match.overallMatch >= 75 ? 'text-amber-400' : 'text-text-secondary'}`}>
                                                            {match.overallMatch}%
                                                        </p>
                                                        <p className="text-[9px] text-text-secondary uppercase tracking-widest">Match</p>
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>

                                            {/* Expanded Detail */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                                                        className="overflow-hidden">
                                                        <div className="px-5 pb-5 border-t border-white/[0.04]">
                                                            <div className="grid grid-cols-3 gap-4 py-4">
                                                                {/* Compatibility Breakdown */}
                                                                <div className="space-y-3">
                                                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">Compatibility</p>
                                                                    {[
                                                                        { label: 'DNA Match', value: match.dnaMatch, color: 'bg-violet-400' },
                                                                        { label: 'Highlight Overlap', value: match.highlightOverlap, color: 'bg-rose-400' },
                                                                        { label: 'Pace Match', value: match.paceMatch, color: 'bg-aurora-teal' },
                                                                    ].map(metric => (
                                                                        <div key={metric.label}>
                                                                            <div className="flex items-center justify-between text-xs mb-1">
                                                                                <span className="text-text-secondary">{metric.label}</span>
                                                                                <span className="text-white font-semibold">{metric.value}%</span>
                                                                            </div>
                                                                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                                                <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.value}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Reading Info */}
                                                                <div className="space-y-3">
                                                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">Reading Profile</p>
                                                                    <div>
                                                                        <p className="text-[10px] text-text-secondary mb-0.5">Favorite Book</p>
                                                                        <p className="text-xs text-white">{match.favBook}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] text-text-secondary mb-0.5">Currently Reading</p>
                                                                        <p className="text-xs text-white">{match.recentRead}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] text-text-secondary mb-0.5">Top Genres</p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {match.topGenres.map(g => (
                                                                                <span key={g} className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-text-secondary">{g}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Shared Highlights */}
                                                                <div className="space-y-3">
                                                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">Shared Highlights</p>
                                                                    {match.sharedHighlights.length > 0 ? (
                                                                        match.sharedHighlights.slice(0, 2).map((h, i) => (
                                                                            <div key={i} className="flex gap-2">
                                                                                <Quote className="w-3 h-3 text-rose-400/30 flex-none mt-0.5" />
                                                                                <p className="text-[11px] text-white/60 italic leading-relaxed line-clamp-2">{h}</p>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-xs text-text-secondary italic">No shared highlights yet</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-3 pt-3 border-t border-white/[0.04]">
                                                                <button onClick={() => alert('Buddy Read invitation sent! They will receive a notification.')} className="px-4 py-2 bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20 rounded hover:bg-rose-500/20 transition-colors flex items-center gap-1.5">
                                                                    <BookOpen className="w-3.5 h-3.5" /> Start Buddy Read
                                                                </button>
                                                                <button onClick={() => alert('Direct messaging coming soon!')} className="px-4 py-2 bg-white/[0.04] text-white text-xs border border-white/[0.1] rounded hover:bg-white/[0.08] transition-colors flex items-center gap-1.5">
                                                                    <MessageCircle className="w-3.5 h-3.5" /> Message
                                                                </button>
                                                                <button onClick={() => alert('Full DNA profile view coming soon!')} className="px-4 py-2 bg-white/[0.04] text-white text-xs border border-white/[0.1] rounded hover:bg-white/[0.08] transition-colors flex items-center gap-1.5">
                                                                    <Eye className="w-3.5 h-3.5" /> View Full DNA
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

                    {/* ═══ BUDDY READS TAB ═══ */}
                    {activeTab === 'buddy-reads' && (
                        <motion.div key="buddy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="space-y-4 mb-8">
                                {buddyReads.map((read, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-white">{read.title}</h3>
                                                <p className="text-xs text-text-secondary">{read.participants} readers • {read.pace}</p>
                                            </div>
                                            <span className="text-xs text-aurora-teal">{read.progress}</span>
                                        </div>
                                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                            <div className="h-full bg-aurora-teal rounded-full" style={{ width: `${parseInt(read.progress) / parseInt(read.progress.split('/')[1]) * 100}%` }} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="text-center p-10 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-xl">
                                <BookOpen className="w-8 h-8 text-rose-400/40 mx-auto mb-3" />
                                <h3 className="text-sm font-semibold text-white mb-1">Start a New Buddy Read</h3>
                                <p className="text-xs text-text-secondary mb-4">Pick a book, invite a match, read together with shared annotations</p>
                                <button onClick={() => navigate('/catalog')} className="px-6 py-2.5 bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20 rounded hover:bg-rose-500/20 transition-colors">
                                    Browse Books
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ INVITES TAB ═══ */}
                    {activeTab === 'invites' && (
                        <motion.div key="invites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="space-y-3">
                                {[
                                    { from: 'midnight_ink', avatar: '🖋️', book: 'Wrath & Reverie', message: 'Our DNA says we should read this together 👀', time: '2h ago' },
                                    { from: 'theory_crafter', avatar: '🧠', book: 'Signal to Noise', message: 'I need someone who actually appreciates hard sci-fi to discuss this with', time: '1d ago' },
                                ].map((invite, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-xl">{invite.avatar}</span>
                                            <div className="flex-1">
                                                <p className="text-sm text-white font-medium">{invite.from} <span className="text-text-secondary font-normal">invited you to read</span> {invite.book}</p>
                                                <p className="text-[10px] text-text-secondary">{invite.time}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-white/70 italic mb-4 pl-9">"{invite.message}"</p>
                                        <div className="flex items-center gap-2 pl-9">
                                            <button onClick={() => alert('Invitation accepted! Check your Buddy Reads tab.')} className="px-4 py-2 bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20 rounded hover:bg-rose-500/20 transition-colors flex items-center gap-1.5">
                                                <Check className="w-3.5 h-3.5" /> Accept
                                            </button>
                                            <button onClick={() => alert('Invitation declined.')} className="px-4 py-2 bg-white/[0.04] text-text-secondary text-xs border border-white/[0.06] rounded hover:bg-white/[0.08] transition-colors flex items-center gap-1.5">
                                                <X className="w-3.5 h-3.5" /> Decline
                                            </button>
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
