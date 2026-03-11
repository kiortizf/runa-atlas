import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Inbox, FileText, Users, Clock, AlertCircle, Eye, Edit3,
    CheckCircle2, ChevronDown, ArrowRight, MessageCircle, Star,
    Filter, Search, Calendar, BarChart3, Zap, BookOpen, Target,
    Shield, Layers, GitMerge, Send, Flame, ChevronRight, UserPlus
} from 'lucide-react';

// ═══════════════════════════════════════════════
// MANUSCRIPT INBOX — Editor's Queue & Submission Dashboard
// ═══════════════════════════════════════════════

type InboxStatus = 'new' | 'under_review' | 'awaiting_beta' | 'revision_needed' | 'ready_to_advance';
type InboxPriority = 'normal' | 'high' | 'urgent';

interface InboxItem {
    id: string;
    title: string;
    author: string;
    genre: string;
    wordCount: string;
    submittedDate: string;
    status: InboxStatus;
    priority: InboxPriority;
    cover: string;
    synopsis: string;
    betaReaderCount: number;
    betaFeedbackSummary?: string;
    betaSentiment?: string;
    revisionRound: number;
    lastUpdate: string;
    actionNeeded: string;
    tags: string[];
}

const STATUS_CONFIG: Record<InboxStatus, { color: string; label: string; bg: string }> = {
    new: { color: '#6366f1', label: 'New Submission', bg: 'bg-indigo-500/10' },
    under_review: { color: '#8b5cf6', label: 'Under Review', bg: 'bg-violet-500/10' },
    awaiting_beta: { color: '#f59e0b', label: 'Awaiting Beta', bg: 'bg-amber-500/10' },
    revision_needed: { color: '#ef4444', label: 'Revision Needed', bg: 'bg-red-500/10' },
    ready_to_advance: { color: '#22c55e', label: 'Ready to Advance', bg: 'bg-emerald-500/10' },
};

const INBOX_ITEMS: InboxItem[] = [
    {
        id: 'i1', title: 'Wrath & Reverie', author: 'Elara Vance', genre: 'Dark Fantasy', wordCount: '94,000',
        submittedDate: 'Oct 12, 2025', status: 'under_review', priority: 'high',
        cover: 'https://picsum.photos/seed/wrath-inbox/60/80',
        synopsis: 'The sequel to The Obsidian Crown. When the throne shatters, magic demands a blood price no one expected to pay.',
        betaReaderCount: 5, betaFeedbackSummary: 'Strong character work. Pacing issue in Ch. 14 — 3/5 flags. Twist in Ch. 10 universally praised.',
        betaSentiment: 'Mostly Positive', revisionRound: 2, lastUpdate: '2h ago',
        actionNeeded: 'Review R2 author revisions for Ch. 12b and Ch. 20',
        tags: ['Sequel', 'Priority', 'Has Beta Feedback']
    },
    {
        id: 'i2', title: 'The Hollow Garden', author: 'Sera Nighthollow', genre: 'Magical Realism', wordCount: '67,000',
        submittedDate: 'Jan 5, 2026', status: 'under_review', priority: 'normal',
        cover: 'https://picsum.photos/seed/hollow-inbox/60/80',
        synopsis: 'A botanical illustrator discovers her grandmother\'s garden grows memories — and some of them aren\'t hers.',
        betaReaderCount: 0, revisionRound: 0, lastUpdate: '1d ago',
        actionNeeded: 'Complete initial developmental read (60% through)',
        tags: ['Debut Author']
    },
    {
        id: 'i3', title: 'Signal to Noise', author: 'Kael Thornwood', genre: 'Sci-Fi', wordCount: '82,000',
        submittedDate: 'Aug 22, 2025', status: 'revision_needed', priority: 'urgent',
        cover: 'https://picsum.photos/seed/signal-inbox/60/80',
        synopsis: 'In a future where silence is currency, a deaf coder discovers she can hear the frequency that controls the world.',
        betaReaderCount: 4, betaFeedbackSummary: 'Worldbuilding praised. Plot structure in Act III needs work. Character voices distinct.',
        betaSentiment: 'Mixed', revisionRound: 2, lastUpdate: '3d ago',
        actionNeeded: 'Author revision overdue by 2 weeks — follow up',
        tags: ['R2 Overdue', 'Has Beta Feedback']
    },
    {
        id: 'i4', title: 'Bone Lace', author: 'Althea Priory', genre: 'Gothic Horror', wordCount: '71,000',
        submittedDate: 'May 1, 2025', status: 'ready_to_advance', priority: 'normal',
        cover: 'https://picsum.photos/seed/bone-inbox/60/80',
        synopsis: 'When a taxidermist inherits a Victorian house, she discovers the previous owner\'s collection is still alive.',
        betaReaderCount: 3, betaFeedbackSummary: 'Universally positive. Atmospheric prose highlighted. Strong debut voice.',
        betaSentiment: 'Very Positive', revisionRound: 1, lastUpdate: '5h ago',
        actionNeeded: 'Advance to copyedit — all R1 notes resolved',
        tags: ['Ready for Copyedit']
    },
    {
        id: 'i5', title: 'The Cartography of Grief', author: 'Min-Ji Song', genre: 'Literary Fiction', wordCount: '58,000',
        submittedDate: 'Mar 1, 2026', status: 'new', priority: 'normal',
        cover: 'https://picsum.photos/seed/carto-inbox/60/80',
        synopsis: 'A mapmaker charts the geography of her mother\'s dementia, tracing boundaries between memory and invention.',
        betaReaderCount: 0, revisionRound: 0, lastUpdate: 'Just now',
        actionNeeded: 'Initial assessment — assign editor and schedule developmental read',
        tags: ['New', 'Unassigned']
    },
    {
        id: 'i6', title: 'Ash & Anthem', author: 'Devon Cross', genre: 'Epic Fantasy', wordCount: '118,000',
        submittedDate: 'Feb 15, 2026', status: 'awaiting_beta', priority: 'normal',
        cover: 'https://picsum.photos/seed/ash-inbox/60/80',
        synopsis: 'A revolution told in four voices, where the anthem of the oppressed becomes the spell that unravels an empire.',
        betaReaderCount: 0, revisionRound: 0, lastUpdate: '1w ago',
        actionNeeded: 'Recruit beta readers — Book DNA suggests overlap with Wrath & Reverie audience',
        tags: ['Awaiting Beta', 'High Word Count']
    },
];

const STATS = {
    total: INBOX_ITEMS.length,
    needsAction: INBOX_ITEMS.filter(i => i.priority === 'urgent' || i.priority === 'high').length,
    inReview: INBOX_ITEMS.filter(i => i.status === 'under_review').length,
    awaitingBeta: INBOX_ITEMS.filter(i => i.status === 'awaiting_beta').length,
    readyToAdvance: INBOX_ITEMS.filter(i => i.status === 'ready_to_advance').length,
};

export default function ManuscriptInbox() {
    const [filterStatus, setFilterStatus] = useState<InboxStatus | 'all'>('all');
    const [expandedItem, setExpandedItem] = useState<string | null>('i1');
    const [sortBy, setSortBy] = useState<'priority' | 'date' | 'status'>('priority');

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const unsub = onSnapshot(
                query(collection(db, 'manuscripts'), where('editorId', '==', user.uid)),
                (snap) => {
                    if (snap.docs.length > 0) {
                        // Manuscript inbox data available from Firestore
                    }
                },
                () => { }
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const filtered = filterStatus === 'all' ? INBOX_ITEMS : INBOX_ITEMS.filter(i => i.status === filterStatus);
    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'priority') {
            const p = { urgent: 0, high: 1, normal: 2 };
            return p[a.priority] - p[b.priority];
        }
        return 0;
    });

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                <Inbox className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">Manuscript Inbox</h1>
                                <p className="text-xs text-text-secondary">Your assigned manuscripts, submissions, and editorial queue.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-text-secondary">Sort:</span>
                            {(['priority', 'date', 'status'] as const).map(s => (
                                <button key={s} onClick={() => setSortBy(s)}
                                    className={`px-3 py-1.5 rounded border capitalize ${sortBy === s ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-xs">
                        {[
                            { label: 'Total', value: STATS.total, color: 'text-white' },
                            { label: 'Needs Action', value: STATS.needsAction, color: 'text-red-400' },
                            { label: 'In Review', value: STATS.inReview, color: 'text-violet-400' },
                            { label: 'Awaiting Beta', value: STATS.awaitingBeta, color: 'text-amber-400' },
                            { label: 'Ready to Advance', value: STATS.readyToAdvance, color: 'text-emerald-400' },
                        ].map(s => (
                            <div key={s.label} className="flex items-center gap-2">
                                <span className={`font-semibold ${s.color}`}>{s.value}</span>
                                <span className="text-text-secondary">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="flex items-center gap-3 mb-6">
                    <Filter className="w-4 h-4 text-text-secondary" />
                    <button onClick={() => setFilterStatus('all')}
                        className={`text-xs px-3 py-1.5 rounded border ${filterStatus === 'all' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>All</button>
                    {(Object.keys(STATUS_CONFIG) as InboxStatus[]).map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`text-xs px-3 py-1.5 rounded border transition-colors
                                ${filterStatus === s ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>
                            {STATUS_CONFIG[s].label}
                        </button>
                    ))}
                </div>

                {/* Inbox Items */}
                <div className="space-y-2">
                    {sorted.map((item, idx) => {
                        const sc = STATUS_CONFIG[item.status];
                        const isExpanded = expandedItem === item.id;
                        return (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`rounded-xl border overflow-hidden transition-all
                                    ${isExpanded ? 'bg-white/[0.03] border-white/[0.1]' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'}`}>
                                <button onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                    className="w-full text-left p-4 flex items-center gap-4">
                                    {/* Priority indicator */}
                                    <div className={`w-1 h-10 rounded-full flex-none
                                        ${item.priority === 'urgent' ? 'bg-red-400' : item.priority === 'high' ? 'bg-amber-400' : 'bg-white/10'}`} />

                                    <img src={item.cover} alt="" className="w-8 h-11 rounded object-cover flex-none" />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                                            {item.tags.slice(0, 2).map(t => (
                                                <span key={t} className="text-[8px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-text-secondary">{t}</span>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-text-secondary">{item.author} · {item.genre} · {item.wordCount}</p>
                                    </div>

                                    <div className="flex-none text-right">
                                        <span className="text-[10px] font-semibold" style={{ color: sc.color }}>{sc.label}</span>
                                        <p className="text-[9px] text-text-secondary">{item.lastUpdate}</p>
                                    </div>

                                    <ChevronDown className={`w-4 h-4 text-white/20 flex-none transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <div className="px-4 pb-5 pt-2 border-t border-white/[0.04]">
                                                <div className="grid grid-cols-3 gap-6">
                                                    {/* Synopsis & Action */}
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Synopsis</p>
                                                        <p className="text-xs text-white/60 leading-relaxed italic mb-4">{item.synopsis}</p>
                                                        <div className="p-3 bg-amber-500/[0.05] border border-amber-500/10 rounded-lg">
                                                            <p className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold mb-1 flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" /> Action Needed
                                                            </p>
                                                            <p className="text-xs text-white/60">{item.actionNeeded}</p>
                                                        </div>
                                                    </div>

                                                    {/* Beta Reader Summary */}
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Beta Reader Insights</p>
                                                        {item.betaReaderCount > 0 ? (
                                                            <div className="space-y-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="w-3 h-3 text-amber-400" />
                                                                    <span className="text-xs text-white">{item.betaReaderCount} beta readers</span>
                                                                    {item.betaSentiment && (
                                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border
                                                                            ${item.betaSentiment === 'Very Positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                                item.betaSentiment === 'Mostly Positive' ? 'bg-emerald-500/10 text-emerald-400/70 border-emerald-500/20' :
                                                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{item.betaSentiment}</span>
                                                                    )}
                                                                </div>
                                                                {item.betaFeedbackSummary && (
                                                                    <p className="text-xs text-white/50 leading-relaxed">{item.betaFeedbackSummary}</p>
                                                                )}
                                                                <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                                                                    <GitMerge className="w-3 h-3" /> Open in Feedback Bridge
                                                                </button>
                                                                <Link to="/editor-beta-manager" className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 mt-1">
                                                                    <UserPlus className="w-3 h-3" /> Manage Beta Readers
                                                                </Link>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-text-secondary py-3">
                                                                No beta readers assigned yet.
                                                                <Link to="/editor-beta-manager" className="block text-amber-400 hover:text-amber-300 mt-1.5 flex items-center gap-1">
                                                                    <UserPlus className="w-3 h-3" /> Recruit Beta Readers
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quick Actions */}
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Quick Actions</p>
                                                        <div className="space-y-1.5">
                                                            <button className="w-full text-left px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2">
                                                                <Eye className="w-3.5 h-3.5" /> Open in Editor
                                                            </button>
                                                            {item.revisionRound > 0 && (
                                                                <button className="w-full text-left px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2">
                                                                    <Layers className="w-3.5 h-3.5" /> View Revision Rounds (R{item.revisionRound})
                                                                </button>
                                                            )}
                                                            <button className="w-full text-left px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2">
                                                                <MessageCircle className="w-3.5 h-3.5" /> Message Author
                                                            </button>
                                                            {item.status === 'ready_to_advance' && (
                                                                <button className="w-full text-left px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-2">
                                                                    <ArrowRight className="w-3.5 h-3.5" /> Advance to Next Stage
                                                                </button>
                                                            )}
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
            </div>
        </div>
    );
}
