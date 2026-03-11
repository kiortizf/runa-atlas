import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserPlus, UserMinus, MessageCircle, Send, Eye, Shield,
    ChevronDown, ChevronRight, Search, Filter, Target, Star,
    Clock, CheckCircle2, AlertCircle, Zap, BookOpen, BarChart3,
    Bell, ArrowRight, Edit3, Flame, Plus, X, Check, Dna,
    Activity, GitMerge, FileText, ExternalLink
} from 'lucide-react';

// ═══════════════════════════════════════════════
// EDITOR BETA MANAGER — Co-manage Beta Readers (Author + Editor)
// ═══════════════════════════════════════════════

interface BetaReader {
    id: string;
    name: string;
    avatar: string;
    tier: string;
    dnaMatch: number;
    chaptersRead: number;
    totalChapters: number;
    feedbackSubmitted: number;
    status: 'reading' | 'reviewing' | 'completed' | 'invited' | 'inactive';
    lastActive: string;
    invitedBy: 'author' | 'editor';
    invitedDate: string;
    nda: boolean;
    email: string;
}

interface RecruitCandidate {
    id: string;
    name: string;
    avatar: string;
    tier: string;
    dnaMatch: number;
    booksRead: number;
    feedbackRating: number;
    topGenres: string[];
    status: 'available' | 'busy' | 'invited';
    lastActive: string;
}

interface ActivityEntry {
    id: string;
    action: 'invited' | 'removed' | 'nudged' | 'reassigned' | 'nda_signed' | 'completed' | 'message';
    actor: string;
    actorRole: 'author' | 'editor';
    target: string;
    manuscript: string;
    timestamp: string;
    detail?: string;
}

const STATUS_COLORS: Record<string, string> = {
    reading: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    reviewing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-white/[0.04] text-text-secondary border-white/[0.06]',
    invited: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    inactive: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    invited: { icon: UserPlus, color: '#22c55e', label: 'Invited' },
    removed: { icon: UserMinus, color: '#ef4444', label: 'Removed' },
    nudged: { icon: Bell, color: '#f59e0b', label: 'Nudged' },
    reassigned: { icon: ArrowRight, color: '#8b5cf6', label: 'Reassigned' },
    nda_signed: { icon: Shield, color: '#22d3ee', label: 'NDA Signed' },
    completed: { icon: CheckCircle2, color: '#10b981', label: 'Completed' },
    message: { icon: MessageCircle, color: '#3b82f6', label: 'Messaged' },
};

const MANUSCRIPT = {
    title: 'Wrath & Reverie',
    author: 'Elara Vance',
    genre: 'Dark Fantasy',
    totalChapters: 24,
    chaptersReleased: 15,
};

const ACTIVE_READERS: BetaReader[] = [
    { id: 'br1', name: 'Taylor Park', avatar: '📗', tier: 'Trusted', dnaMatch: 94, chaptersRead: 15, totalChapters: 24, feedbackSubmitted: 12, status: 'reading', lastActive: '2h ago', invitedBy: 'author', invitedDate: 'Jan 8, 2026', nda: true, email: 'taylor.p@email.com' },
    { id: 'br2', name: 'Nia Blackwood', avatar: '📕', tier: 'Inner Circle', dnaMatch: 91, chaptersRead: 15, totalChapters: 24, feedbackSubmitted: 14, status: 'reading', lastActive: '5h ago', invitedBy: 'author', invitedDate: 'Jan 6, 2026', nda: true, email: 'nia.b@email.com' },
    { id: 'br3', name: 'Marcus Chen', avatar: '📘', tier: 'Trusted', dnaMatch: 87, chaptersRead: 12, totalChapters: 24, feedbackSubmitted: 8, status: 'reading', lastActive: '1d ago', invitedBy: 'editor', invitedDate: 'Jan 15, 2026', nda: true, email: 'marcus.c@email.com' },
    { id: 'br4', name: 'Lena Ortega', avatar: '📙', tier: 'Elite', dnaMatch: 82, chaptersRead: 10, totalChapters: 24, feedbackSubmitted: 9, status: 'reviewing', lastActive: '3d ago', invitedBy: 'editor', invitedDate: 'Jan 20, 2026', nda: true, email: 'lena.o@email.com' },
    { id: 'br5', name: 'Jordan Mills', avatar: '📓', tier: 'Trusted', dnaMatch: 79, chaptersRead: 8, totalChapters: 24, feedbackSubmitted: 4, status: 'inactive', lastActive: '12d ago', invitedBy: 'author', invitedDate: 'Jan 10, 2026', nda: false, email: 'jordan.m@email.com' },
];

const RECRUIT_CANDIDATES: RecruitCandidate[] = [
    { id: 'rc1', name: 'Ivy Delacroix', avatar: '🌿', tier: 'Elite', dnaMatch: 93, booksRead: 24, feedbackRating: 4.9, topGenres: ['Dark Fantasy', 'Romantasy', 'Gothic'], status: 'available', lastActive: '1h ago' },
    { id: 'rc2', name: 'Kai Nakamura', avatar: '⚡', tier: 'Trusted', dnaMatch: 88, booksRead: 18, feedbackRating: 4.7, topGenres: ['Dark Fantasy', 'Epic Fantasy', 'Sci-Fi'], status: 'available', lastActive: '3h ago' },
    { id: 'rc3', name: 'Priya Sharma', avatar: '🔮', tier: 'Inner Circle', dnaMatch: 86, booksRead: 31, feedbackRating: 4.8, topGenres: ['Literary Fiction', 'Dark Fantasy', 'Magical Realism'], status: 'busy', lastActive: '6h ago' },
    { id: 'rc4', name: 'Rowan Ashwick', avatar: '🍂', tier: 'Trusted', dnaMatch: 84, booksRead: 15, feedbackRating: 4.5, topGenres: ['Dark Fantasy', 'Horror', 'Mystery'], status: 'available', lastActive: '1d ago' },
    { id: 'rc5', name: 'Zara Moonveil', avatar: '🌙', tier: 'Elite', dnaMatch: 81, booksRead: 22, feedbackRating: 4.6, topGenres: ['Dark Fantasy', 'Romantasy', 'Historical Fantasy'], status: 'invited', lastActive: '2d ago' },
];

const ACTIVITY_LOG: ActivityEntry[] = [
    { id: 'a1', action: 'nudged', actor: 'You (Editor)', actorRole: 'editor', target: 'Jordan Mills', manuscript: 'Wrath & Reverie', timestamp: '1h ago', detail: 'Gentle reminder to continue reading — hasn\'t logged in for 12 days' },
    { id: 'a2', action: 'invited', actor: 'Elara Vance', actorRole: 'author', target: 'Taylor Park', manuscript: 'Wrath & Reverie', timestamp: '2h ago', detail: 'High DNA match (94%), Trusted tier reader' },
    { id: 'a3', action: 'nda_signed', actor: 'System', actorRole: 'editor', target: 'Taylor Park', manuscript: 'Wrath & Reverie', timestamp: '2h ago' },
    { id: 'a4', action: 'message', actor: 'You (Editor)', actorRole: 'editor', target: 'Nia Blackwood', manuscript: 'Wrath & Reverie', timestamp: '5h ago', detail: 'Thank you for the detailed Ch. 14 pacing notes — incredibly helpful!' },
    { id: 'a5', action: 'invited', actor: 'You (Editor)', actorRole: 'editor', target: 'Marcus Chen', manuscript: 'Wrath & Reverie', timestamp: '6w ago', detail: 'Recruited for worldbuilding perspective — 87% DNA match' },
    { id: 'a6', action: 'invited', actor: 'You (Editor)', actorRole: 'editor', target: 'Lena Ortega', manuscript: 'Wrath & Reverie', timestamp: '5w ago', detail: 'Elite tier, strong prose feedback history' },
    { id: 'a7', action: 'completed', actor: 'System', actorRole: 'editor', target: 'Sage Whitmore', manuscript: 'Bone Lace', timestamp: '2w ago', detail: 'All 16 chapters read, 8 feedback notes submitted' },
    { id: 'a8', action: 'removed', actor: 'Elara Vance', actorRole: 'author', target: 'Alex Rivera', manuscript: 'Wrath & Reverie', timestamp: '1mo ago', detail: 'Unresponsive after 30 days — mutual decision to remove' },
];

export default function EditorBetaManager() {
    const [activeTab, setActiveTab] = useState<'readers' | 'recruit' | 'activity'>('readers');
    const [expandedReader, setExpandedReader] = useState<string | null>('br1');
    const [searchQuery, setSearchQuery] = useState('');
    const [nudgedReaders, setNudgedReaders] = useState<Set<string>>(new Set());
    const [invitedCandidates, setInvitedCandidates] = useState<Set<string>>(new Set(['rc5']));

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const unsub = onSnapshot(
                query(collection(db, 'beta_readers'), orderBy('lastActive', 'desc')),
                (snap) => {
                    if (snap.docs.length > 0) {
                        // Beta readers data available from Firestore
                    }
                },
                () => { }
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);
    const [filterTier, setFilterTier] = useState<string>('all');

    const handleNudge = (id: string) => {
        setNudgedReaders(prev => { const n = new Set(prev); n.add(id); return n; });
    };

    const handleInvite = (id: string) => {
        setInvitedCandidates(prev => { const n = new Set(prev); n.add(id); return n; });
    };

    const filteredReaders = ACTIVE_READERS.filter(r =>
        (searchQuery === '' || r.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterTier === 'all' || r.tier === filterTier)
    );

    const filteredCandidates = RECRUIT_CANDIDATES.filter(r =>
        searchQuery === '' || r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                                    Beta Reader Manager
                                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                                        Co-Managed
                                    </span>
                                </h1>
                                <p className="text-xs text-text-secondary">
                                    <span className="text-white/70">{MANUSCRIPT.title}</span> by {MANUSCRIPT.author} · {ACTIVE_READERS.length} active readers · {MANUSCRIPT.chaptersReleased}/{MANUSCRIPT.totalChapters} chapters released
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded text-[10px] text-text-secondary">
                                <Shield className="w-3 h-3 text-cyan-400/60" />
                                Editor + Author access
                            </div>
                            <button className="px-4 py-2 bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20 rounded hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5">
                                <UserPlus className="w-3.5 h-3.5" /> Invite Reader
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-6">
                        {[
                            { id: 'readers' as const, label: 'Active Readers', icon: Users, count: ACTIVE_READERS.length },
                            { id: 'recruit' as const, label: 'Recruit', icon: UserPlus, count: RECRUIT_CANDIDATES.filter(c => c.status === 'available').length },
                            { id: 'activity' as const, label: 'Activity Log', icon: Activity, count: ACTIVITY_LOG.length },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 text-sm border-b-2 transition-colors
                                    ${activeTab === tab.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-text-secondary hover:text-white'}`}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] rounded-full">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {/* ═══ ACTIVE READERS ═══ */}
                    {activeTab === 'readers' && (
                        <motion.div key="readers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Filter + Search */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text" placeholder="Search readers..."
                                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full max-w-xs pl-9 pr-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded text-xs text-white placeholder:text-text-secondary focus:outline-none focus:border-cyan-500/30"
                                    />
                                </div>
                                <Filter className="w-4 h-4 text-text-secondary" />
                                {['all', 'Trusted', 'Elite', 'Inner Circle'].map(t => (
                                    <button key={t} onClick={() => setFilterTier(t)}
                                        className={`text-xs px-3 py-1.5 rounded border transition-colors capitalize
                                            ${filterTier === t ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Reader Cards */}
                            <div className="space-y-2">
                                {filteredReaders.map((reader, idx) => {
                                    const isExpanded = expandedReader === reader.id;
                                    const isNudged = nudgedReaders.has(reader.id);
                                    return (
                                        <motion.div key={reader.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`border rounded-xl overflow-hidden transition-all
                                                ${isExpanded ? 'bg-white/[0.03] border-cyan-400/20' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'}`}>
                                            <button onClick={() => setExpandedReader(isExpanded ? null : reader.id)}
                                                className="w-full text-left p-4 flex items-center gap-4">
                                                <span className="text-xl flex-none">{reader.avatar}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-semibold text-white">{reader.name}</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">{reader.tier}</span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border capitalize ${STATUS_COLORS[reader.status]}`}>{reader.status}</span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${reader.invitedBy === 'editor' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-violet-500/10 text-violet-400 border-violet-500/20'}`}>
                                                            {reader.invitedBy === 'editor' ? '✎ Editor Invited' : '✦ Author Invited'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                                                        <span className="flex items-center gap-1"><Dna className="w-3 h-3 text-violet-400" /> {reader.dnaMatch}% match</span>
                                                        <span>{reader.chaptersRead}/{reader.totalChapters} ch.</span>
                                                        <span>{reader.feedbackSubmitted} notes</span>
                                                        <span>Last active: {reader.lastActive}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-none">
                                                    <div className="w-20">
                                                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(reader.chaptersRead / reader.totalChapters) * 100}%` }} />
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-text-secondary w-8 text-right">{Math.round((reader.chaptersRead / reader.totalChapters) * 100)}%</span>
                                                    <ChevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
                                                            <div className="grid grid-cols-3 gap-6">
                                                                {/* Reader Details */}
                                                                <div className="space-y-3">
                                                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">Reader Details</p>
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex justify-between text-xs">
                                                                            <span className="text-text-secondary">Invited by</span>
                                                                            <span className={reader.invitedBy === 'editor' ? 'text-cyan-400' : 'text-violet-400'}>{reader.invitedBy === 'editor' ? 'Editor' : 'Author'}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-xs">
                                                                            <span className="text-text-secondary">Invited on</span>
                                                                            <span className="text-white">{reader.invitedDate}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-xs">
                                                                            <span className="text-text-secondary">NDA</span>
                                                                            <span className={reader.nda ? 'text-emerald-400 flex items-center gap-1' : 'text-amber-400 flex items-center gap-1'}>
                                                                                {reader.nda ? <><Check className="w-3 h-3" /> Signed</> : <><AlertCircle className="w-3 h-3" /> Pending</>}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between text-xs">
                                                                            <span className="text-text-secondary">Contact</span>
                                                                            <span className="text-white/60">{reader.email}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Reading Progress */}
                                                                <div className="space-y-3">
                                                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">Progress</p>
                                                                    <div className="space-y-2">
                                                                        <div>
                                                                            <div className="flex justify-between text-xs mb-1">
                                                                                <span className="text-text-secondary">Chapters Read</span>
                                                                                <span className="text-white font-semibold">{reader.chaptersRead}/{reader.totalChapters}</span>
                                                                            </div>
                                                                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                                                <div className="h-full bg-aurora-teal rounded-full" style={{ width: `${(reader.chaptersRead / reader.totalChapters) * 100}%` }} />
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex justify-between text-xs mb-1">
                                                                                <span className="text-text-secondary">Feedback Notes</span>
                                                                                <span className="text-white font-semibold">{reader.feedbackSubmitted}</span>
                                                                            </div>
                                                                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min((reader.feedbackSubmitted / 15) * 100, 100)}%` }} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="space-y-3">
                                                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold">Editor Actions</p>
                                                                    <div className="space-y-1.5">
                                                                        <button className="w-full text-left px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2">
                                                                            <MessageCircle className="w-3.5 h-3.5 text-cyan-400" /> Message Reader
                                                                        </button>
                                                                        {reader.status === 'inactive' && !isNudged ? (
                                                                            <button onClick={(e) => { e.stopPropagation(); handleNudge(reader.id); }}
                                                                                className="w-full text-left px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center gap-2">
                                                                                <Bell className="w-3.5 h-3.5" /> Send Nudge
                                                                            </button>
                                                                        ) : reader.status === 'inactive' && isNudged ? (
                                                                            <div className="w-full text-left px-3 py-2 bg-amber-500/[0.05] border border-amber-500/10 rounded text-xs text-amber-400/60 flex items-center gap-2">
                                                                                <Check className="w-3.5 h-3.5" /> Nudge Sent
                                                                            </div>
                                                                        ) : null}
                                                                        <button className="w-full text-left px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2">
                                                                            <ArrowRight className="w-3.5 h-3.5 text-violet-400" /> Reassign Manuscript
                                                                        </button>
                                                                        <button className="w-full text-left px-3 py-2 bg-red-500/[0.05] border border-red-500/10 rounded text-xs text-red-400/70 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                                                                            <UserMinus className="w-3.5 h-3.5" /> Remove Reader
                                                                        </button>
                                                                    </div>
                                                                </div>
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

                    {/* ═══ RECRUIT ═══ */}
                    {activeTab === 'recruit' && (
                        <motion.div key="recruit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white mb-1">Recruit Beta Readers</h3>
                                        <p className="text-xs text-text-secondary">Readers with high Book DNA match for <span className="text-white/70">{MANUSCRIPT.title}</span>. Invite directly as the editor.</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded text-[10px] text-text-secondary">
                                        <Dna className="w-3 h-3 text-violet-400" /> Sorted by DNA match
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {filteredCandidates.map((candidate, idx) => {
                                    const isInvited = invitedCandidates.has(candidate.id);
                                    return (
                                        <motion.div key={candidate.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.06 }}
                                            className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl flex-none">{candidate.avatar}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-semibold text-white">{candidate.name}</h4>
                                                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">{candidate.tier}</span>
                                                        {candidate.status === 'busy' && (
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] text-text-secondary rounded border border-white/[0.06]">Currently reading</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[10px] text-text-secondary">
                                                        <span className="flex items-center gap-1"><Dna className="w-3 h-3 text-violet-400" /> <strong className="text-violet-400">{candidate.dnaMatch}%</strong> DNA match</span>
                                                        <span>{candidate.booksRead} books beta-read</span>
                                                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {candidate.feedbackRating} rating</span>
                                                        <span>Last active: {candidate.lastActive}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {candidate.topGenres.map(g => (
                                                            <span key={g} className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-text-secondary">{g}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-none">
                                                    {isInvited ? (
                                                        <div className="px-4 py-2 bg-cyan-500/[0.05] border border-cyan-500/10 rounded text-xs text-cyan-400/60 flex items-center gap-1.5">
                                                            <Check className="w-3.5 h-3.5" /> Invited
                                                        </div>
                                                    ) : candidate.status === 'busy' ? (
                                                        <button onClick={() => handleInvite(candidate.id)}
                                                            className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white/60 hover:bg-white/[0.08] transition-colors flex items-center gap-1.5">
                                                            <UserPlus className="w-3.5 h-3.5" /> Queue Invite
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleInvite(candidate.id)}
                                                            className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-xs hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5">
                                                            <UserPlus className="w-3.5 h-3.5" /> Invite as Editor
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ ACTIVITY LOG ═══ */}
                    {activeTab === 'activity' && (
                        <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-white mb-1">Management Activity</h3>
                                <p className="text-xs text-text-secondary">All beta reader management actions by both author and editor — full transparency</p>
                            </div>

                            <div className="space-y-1">
                                {ACTIVITY_LOG.map((entry, idx) => {
                                    const config = ACTION_CONFIG[entry.action];
                                    const ActionIcon = config.icon;
                                    return (
                                        <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors group">
                                            {/* Timeline dot */}
                                            <div className="flex-none mt-0.5">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${config.color}15` }}>
                                                    <ActionIcon className="w-3.5 h-3.5" style={{ color: config.color }} />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs text-white">
                                                        <span className={entry.actorRole === 'editor' ? 'text-cyan-400' : 'text-violet-400'}>{entry.actor}</span>
                                                        {' '}{config.label.toLowerCase()}{' '}
                                                        <span className="text-white font-medium">{entry.target}</span>
                                                    </span>
                                                    <span className={`text-[8px] px-1 py-0.5 rounded ${entry.actorRole === 'editor' ? 'bg-cyan-500/10 text-cyan-400/60' : 'bg-violet-500/10 text-violet-400/60'}`}>
                                                        {entry.actorRole}
                                                    </span>
                                                </div>
                                                {entry.detail && (
                                                    <p className="text-[11px] text-white/40 leading-relaxed">{entry.detail}</p>
                                                )}
                                            </div>

                                            {/* Timestamp */}
                                            <span className="text-[10px] text-text-secondary flex-none">{entry.timestamp}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
