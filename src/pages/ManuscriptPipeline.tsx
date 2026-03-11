import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Send, Eye, Edit3, BookOpen, CheckCircle2, Users,
    Clock, AlertCircle, ChevronRight, ArrowRight, Zap, Star,
    BarChart3, MessageCircle, Shield, Filter, Search, Calendar,
    Layers, GitBranch, Printer, Package, Sparkles, TrendingUp
} from 'lucide-react';

// ═══════════════════════════════════════════════
// MANUSCRIPT PIPELINE — Unified Lifecycle Dashboard
// ═══════════════════════════════════════════════

type PipelineStage = 'submission' | 'editorial_review' | 'beta_reading' | 'revision' | 'copyedit' | 'proof' | 'production' | 'published';

interface ManuscriptEntry {
    id: string;
    title: string;
    author: string;
    genre: string;
    wordCount: string;
    currentStage: PipelineStage;
    stageProgress: number; // 0-100 within current stage
    assignedEditor: string;
    betaReaders: number;
    submittedDate: string;
    targetPubDate: string;
    lastActivity: string;
    flags: string[];
    cover: string;
    stageHistory: { stage: PipelineStage; entered: string; completed?: string }[];
}

const STAGES: { id: PipelineStage; label: string; icon: any; color: string }[] = [
    { id: 'submission', label: 'Submission', icon: Send, color: '#6366f1' },
    { id: 'editorial_review', label: 'Editorial Review', icon: Eye, color: '#8b5cf6' },
    { id: 'beta_reading', label: 'Beta Reading', icon: Users, color: '#f59e0b' },
    { id: 'revision', label: 'Author Revision', icon: Edit3, color: '#3b82f6' },
    { id: 'copyedit', label: 'Copyedit', icon: FileText, color: '#10b981' },
    { id: 'proof', label: 'Proof', icon: Printer, color: '#06b6d4' },
    { id: 'production', label: 'Production', icon: Package, color: '#f97316' },
    { id: 'published', label: 'Published', icon: Sparkles, color: '#22c55e' },
];

const MANUSCRIPTS: ManuscriptEntry[] = [
    {
        id: 'p1', title: 'Wrath & Reverie', author: 'Elara Vance', genre: 'Dark Fantasy',
        wordCount: '94,000', currentStage: 'beta_reading', stageProgress: 62,
        assignedEditor: 'Marcus Reid', betaReaders: 5, submittedDate: 'Oct 12, 2025',
        targetPubDate: 'Jul 2026', lastActivity: '2h ago', flags: ['Priority', 'Sequel'],
        cover: 'https://picsum.photos/seed/wrath-pipe/60/80',
        stageHistory: [
            { stage: 'submission', entered: 'Oct 12, 2025', completed: 'Oct 28, 2025' },
            { stage: 'editorial_review', entered: 'Oct 28, 2025', completed: 'Dec 15, 2025' },
            { stage: 'beta_reading', entered: 'Jan 10, 2026' },
        ]
    },
    {
        id: 'p2', title: 'The Hollow Garden', author: 'Sera Nighthollow', genre: 'Magical Realism',
        wordCount: '67,000', currentStage: 'editorial_review', stageProgress: 40,
        assignedEditor: 'Lydia Chen', betaReaders: 0, submittedDate: 'Jan 5, 2026',
        targetPubDate: 'Nov 2026', lastActivity: '1d ago', flags: ['Debut'],
        cover: 'https://picsum.photos/seed/hollow-pipe/60/80',
        stageHistory: [
            { stage: 'submission', entered: 'Jan 5, 2026', completed: 'Jan 20, 2026' },
            { stage: 'editorial_review', entered: 'Jan 20, 2026' },
        ]
    },
    {
        id: 'p3', title: 'Signal to Noise', author: 'Kael Thornwood', genre: 'Sci-Fi',
        wordCount: '82,000', currentStage: 'revision', stageProgress: 30,
        assignedEditor: 'Marcus Reid', betaReaders: 4, submittedDate: 'Aug 22, 2025',
        targetPubDate: 'May 2026', lastActivity: '3d ago', flags: ['R2', 'Overdue'],
        cover: 'https://picsum.photos/seed/signal-pipe/60/80',
        stageHistory: [
            { stage: 'submission', entered: 'Aug 22, 2025', completed: 'Sep 10, 2025' },
            { stage: 'editorial_review', entered: 'Sep 10, 2025', completed: 'Oct 30, 2025' },
            { stage: 'beta_reading', entered: 'Nov 5, 2025', completed: 'Dec 20, 2025' },
            { stage: 'revision', entered: 'Jan 2, 2026' },
        ]
    },
    {
        id: 'p4', title: 'Bone Lace', author: 'Althea Priory', genre: 'Gothic Horror',
        wordCount: '71,000', currentStage: 'copyedit', stageProgress: 75,
        assignedEditor: 'Lydia Chen', betaReaders: 3, submittedDate: 'May 1, 2025',
        targetPubDate: 'Apr 2026', lastActivity: '5h ago', flags: [],
        cover: 'https://picsum.photos/seed/bone-pipe/60/80',
        stageHistory: [
            { stage: 'submission', entered: 'May 1, 2025', completed: 'May 15, 2025' },
            { stage: 'editorial_review', entered: 'May 15, 2025', completed: 'Jul 20, 2025' },
            { stage: 'beta_reading', entered: 'Aug 1, 2025', completed: 'Sep 15, 2025' },
            { stage: 'revision', entered: 'Sep 20, 2025', completed: 'Nov 10, 2025' },
            { stage: 'copyedit', entered: 'Nov 15, 2025' },
        ]
    },
    {
        id: 'p5', title: 'The Obsidian Crown', author: 'Elara Vance', genre: 'Dark Fantasy',
        wordCount: '102,000', currentStage: 'published', stageProgress: 100,
        assignedEditor: 'Marcus Reid', betaReaders: 6, submittedDate: 'Jan 10, 2024',
        targetPubDate: 'Oct 2025', lastActivity: 'Published', flags: ['Bestseller'],
        cover: 'https://picsum.photos/seed/obsidian-pipe/60/80',
        stageHistory: [
            { stage: 'submission', entered: 'Jan 10, 2024', completed: 'Feb 1, 2024' },
            { stage: 'editorial_review', entered: 'Feb 1, 2024', completed: 'Apr 15, 2024' },
            { stage: 'beta_reading', entered: 'May 1, 2024', completed: 'Jun 30, 2024' },
            { stage: 'revision', entered: 'Jul 5, 2024', completed: 'Aug 20, 2024' },
            { stage: 'copyedit', entered: 'Aug 25, 2024', completed: 'Sep 30, 2024' },
            { stage: 'proof', entered: 'Oct 1, 2024', completed: 'Oct 15, 2024' },
            { stage: 'production', entered: 'Oct 16, 2024', completed: 'Oct 28, 2024' },
            { stage: 'published', entered: 'Oct 2025' },
        ]
    },
];

const STATS = {
    total: 12,
    inPipeline: 8,
    inBetaReading: 3,
    published2025: 4,
    avgTimeToPublish: '14 months',
};

export default function ManuscriptPipeline() {
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [selectedManuscript, setSelectedManuscript] = useState<string | null>(null);
    const [filterStage, setFilterStage] = useState<PipelineStage | 'all'>('all');

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const unsub = onSnapshot(
                query(collection(db, 'manuscripts'), where('authorId', '==', user.uid)),
                (snap) => {
                    if (snap.docs.length > 0) {
                        // Pipeline manuscripts available from Firestore
                    }
                },
                () => { }
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const filteredManuscripts = filterStage === 'all'
        ? MANUSCRIPTS
        : MANUSCRIPTS.filter(m => m.currentStage === filterStage);

    const stageIdx = (stage: PipelineStage) => STAGES.findIndex(s => s.id === stage);

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">Manuscript Pipeline</h1>
                                <p className="text-xs text-text-secondary">Track every manuscript from submission to publication.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {(['board', 'list'] as const).map(mode => (
                                <button key={mode} onClick={() => setViewMode(mode)}
                                    className={`text-xs px-3 py-1.5 rounded border capitalize transition-colors
                                        ${viewMode === mode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex items-center gap-6 text-xs">
                        {[
                            { label: 'Total Manuscripts', value: STATS.total, color: 'text-white' },
                            { label: 'In Pipeline', value: STATS.inPipeline, color: 'text-indigo-400' },
                            { label: 'In Beta Reading', value: STATS.inBetaReading, color: 'text-amber-400' },
                            { label: 'Published (2025)', value: STATS.published2025, color: 'text-emerald-400' },
                            { label: 'Avg. Time to Publish', value: STATS.avgTimeToPublish, color: 'text-text-secondary' },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-center gap-2">
                                <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                                <span className="text-text-secondary">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {viewMode === 'board' ? (
                    /* ═══ BOARD VIEW ═══ */
                    <div className="flex gap-3 overflow-x-auto pb-4">
                        {STAGES.map(stage => {
                            const StageIcon = stage.icon;
                            const stageManuscripts = MANUSCRIPTS.filter(m => m.currentStage === stage.id);
                            return (
                                <div key={stage.id} className="flex-none w-[220px]">
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <StageIcon className="w-3.5 h-3.5" style={{ color: stage.color }} />
                                        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: stage.color }}>{stage.label}</span>
                                        <span className="text-[10px] text-white/20 ml-auto">{stageManuscripts.length}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {stageManuscripts.map(ms => (
                                            <motion.button key={ms.id}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                onClick={() => setSelectedManuscript(selectedManuscript === ms.id ? null : ms.id)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all
                                                    ${selectedManuscript === ms.id ? 'bg-white/[0.06] border-indigo-400/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <img src={ms.cover} alt="" className="w-6 h-8 rounded object-cover flex-none" />
                                                    <div className="min-w-0">
                                                        <h4 className="text-xs font-semibold text-white truncate">{ms.title}</h4>
                                                        <p className="text-[9px] text-text-secondary">{ms.author}</p>
                                                    </div>
                                                </div>
                                                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mb-1.5">
                                                    <div className="h-full rounded-full" style={{ width: `${ms.stageProgress}%`, backgroundColor: stage.color }} />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] text-text-secondary">{ms.lastActivity}</span>
                                                    <div className="flex gap-1">
                                                        {ms.flags.map(f => (
                                                            <span key={f} className="text-[8px] px-1 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-text-secondary">{f}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                        {stageManuscripts.length === 0 && (
                                            <div className="p-4 border border-dashed border-white/[0.06] rounded-lg text-center">
                                                <p className="text-[9px] text-white/20">No manuscripts</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ═══ LIST VIEW ═══ */
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Filter className="w-4 h-4 text-text-secondary" />
                            <button onClick={() => setFilterStage('all')}
                                className={`text-xs px-3 py-1.5 rounded border ${filterStage === 'all' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>All</button>
                            {STAGES.map(s => (
                                <button key={s.id} onClick={() => setFilterStage(s.id)}
                                    className={`text-xs px-3 py-1.5 rounded border transition-colors
                                        ${filterStage === s.id ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {filteredManuscripts.map((ms, idx) => {
                                const curStage = STAGES.find(s => s.id === ms.currentStage)!;
                                const CurIcon = curStage.icon;
                                return (
                                    <motion.div key={ms.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setSelectedManuscript(selectedManuscript === ms.id ? null : ms.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all
                                            ${selectedManuscript === ms.id ? 'bg-white/[0.04] border-indigo-400/20' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'}`}>
                                        <div className="flex items-center gap-4">
                                            <img src={ms.cover} alt="" className="w-8 h-11 rounded object-cover flex-none" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-semibold text-white">{ms.title}</h4>
                                                    {ms.flags.map(f => (
                                                        <span key={f} className="text-[8px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-text-secondary">{f}</span>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-text-secondary">{ms.author} · {ms.genre} · {ms.wordCount}</p>
                                            </div>

                                            {/* Pipeline Progress Mini */}
                                            <div className="flex-none flex items-center gap-0.5">
                                                {STAGES.map((s, i) => {
                                                    const cur = stageIdx(ms.currentStage);
                                                    const isPast = i < cur;
                                                    const isCurrent = i === cur;
                                                    return (
                                                        <div key={s.id} className="flex items-center">
                                                            <div className={`w-2.5 h-2.5 rounded-full border ${isPast ? 'border-emerald-400 bg-emerald-400' : isCurrent ? 'border-indigo-400 bg-indigo-400/30' : 'border-white/10 bg-transparent'}`} />
                                                            {i < STAGES.length - 1 && <div className={`w-3 h-px ${isPast ? 'bg-emerald-400/40' : 'bg-white/[0.06]'}`} />}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex-none text-right w-24">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <CurIcon className="w-3 h-3" style={{ color: curStage.color }} />
                                                    <span className="text-[10px] font-semibold" style={{ color: curStage.color }}>{curStage.label}</span>
                                                </div>
                                                <p className="text-[9px] text-text-secondary">{ms.lastActivity}</p>
                                            </div>
                                        </div>

                                        {/* Expanded Detail */}
                                        <AnimatePresence>
                                            {selectedManuscript === ms.id && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="pt-4 mt-4 border-t border-white/[0.04] grid grid-cols-4 gap-6">
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Pipeline History</p>
                                                            <div className="space-y-1.5">
                                                                {ms.stageHistory.map((h, i) => {
                                                                    const s = STAGES.find(st => st.id === h.stage)!;
                                                                    return (
                                                                        <div key={i} className="flex items-center gap-2 text-[10px]">
                                                                            <CheckCircle2 className="w-3 h-3" style={{ color: h.completed ? '#22c55e' : s.color }} />
                                                                            <span className="text-white/70">{s.label}</span>
                                                                            <span className="text-text-secondary ml-auto">{h.entered}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Details</p>
                                                            <div className="space-y-1.5 text-[11px]">
                                                                <div className="flex justify-between"><span className="text-text-secondary">Editor</span><span className="text-white">{ms.assignedEditor}</span></div>
                                                                <div className="flex justify-between"><span className="text-text-secondary">Beta Readers</span><span className="text-white">{ms.betaReaders}</span></div>
                                                                <div className="flex justify-between"><span className="text-text-secondary">Submitted</span><span className="text-white">{ms.submittedDate}</span></div>
                                                                <div className="flex justify-between"><span className="text-text-secondary">Target Pub</span><span className="text-white">{ms.targetPubDate}</span></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Stage Progress</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                                                    <div className="h-full rounded-full" style={{ width: `${ms.stageProgress}%`, backgroundColor: curStage.color }} />
                                                                </div>
                                                                <span className="text-xs font-semibold" style={{ color: curStage.color }}>{ms.stageProgress}%</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Actions</p>
                                                            <div className="space-y-1.5">
                                                                <button className="w-full text-left px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2">
                                                                    <Eye className="w-3 h-3" /> View in Editor
                                                                </button>
                                                                <button className="w-full text-left px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2">
                                                                    <MessageCircle className="w-3 h-3" /> Message Team
                                                                </button>
                                                                <button className="w-full text-left px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center gap-2">
                                                                    <ArrowRight className="w-3 h-3" /> Advance Stage
                                                                </button>
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
                )}
            </div>
        </div>
    );
}
