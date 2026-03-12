import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Send, Eye, Edit3, CheckCircle2, Users,
    AlertCircle, ArrowRight, X,
    MessageCircle, Filter, Search, Calendar,
    Layers, GitBranch, Printer, Package, Sparkles, TrendingUp,
    AlertTriangle, Plus, Trash2, Clock
} from 'lucide-react';

// ═══════════════════════════════════════════════
// MANUSCRIPT PIPELINE — Full Lifecycle Dashboard
// Drag-and-drop · Stage advancement · Comments · Deadlines
// ═══════════════════════════════════════════════

type PipelineStage = string;

interface StageHistoryEntry { stage: PipelineStage; entered: string; completed?: string }

interface ManuscriptEntry {
    id: string;
    title: string;
    author: string;
    genre: string;
    wordCount: string;
    currentStage: PipelineStage;
    stageProgress: number;
    assignedEditor: string;
    betaReaders: number;
    submittedDate: string;
    targetPubDate: string;
    lastActivity: string;
    deadline?: string;
    flags: string[];
    cover: string;
    stageHistory: StageHistoryEntry[];
}

interface Comment {
    id: string;
    author: string;
    authorEmail: string;
    text: string;
    createdAt: any;
}

// ── Icon mapping for Firestore stage configs ──
const ICON_MAP: Record<string, any> = {
    Send, Eye, Users, FileText, Printer, Package, Sparkles, Clock,
    Edit3: Edit3 as any, AlertCircle, Layers, GitBranch, TrendingUp, AlertTriangle, X,
};

const DEFAULT_STAGES: { id: PipelineStage; label: string; icon: any; color: string }[] = [
    { id: 'submission', label: 'Submission', icon: Send, color: '#6366f1' },
    { id: 'editorial_review', label: 'Editorial Review', icon: Eye, color: '#8b5cf6' },
    { id: 'analysis', label: 'AI Analysis', icon: Sparkles, color: '#a855f7' },
    { id: 'beta_reading', label: 'Beta Reading', icon: Users, color: '#f59e0b' },
    { id: 'revision', label: 'Author Revision', icon: Edit3, color: '#3b82f6' },
    { id: 'copyedit', label: 'Copyedit', icon: FileText, color: '#10b981' },
    { id: 'proof', label: 'Proof', icon: Printer, color: '#06b6d4' },
    { id: 'production', label: 'Production', icon: Package, color: '#f97316' },
    { id: 'published', label: 'Published', icon: Sparkles, color: '#22c55e' },
];

// ───────── Deadline helpers ─────────
function parseDeadline(d?: string): Date | null {
    if (!d) return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
}
function isOverdue(d?: string): boolean {
    const dt = parseDeadline(d);
    return dt ? dt < new Date() : false;
}
function daysUntil(d?: string): number | null {
    const dt = parseDeadline(d);
    if (!dt) return null;
    return Math.ceil((dt.getTime() - Date.now()) / 86400000);
}
function deadlineLabel(d?: string): string {
    const days = daysUntil(d);
    if (days === null) return '';
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    if (days <= 7) return `${days}d left`;
    return `${Math.ceil(days / 7)}w left`;
}

export default function ManuscriptPipeline() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [selectedManuscript, setSelectedManuscript] = useState<string | null>(null);
    const [filterStage, setFilterStage] = useState<PipelineStage | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [manuscripts, setManuscripts] = useState<ManuscriptEntry[]>([]);
    const [STAGES, setSTAGES] = useState(DEFAULT_STAGES);
    const [loading, setLoading] = useState(true);

    // Load pipeline stages from Firestore (fallback to defaults)
    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'pipeline_stages'), orderBy('order', 'asc')),
            (snap) => {
                if (snap.docs.length > 0) {
                    const firestoreStages = snap.docs
                        .map(d => ({ id: d.id, ...d.data() } as any))
                        .filter((s: any) => s.enabled !== false)
                        .map((s: any) => ({
                            id: s.stageKey || s.id,
                            label: s.label,
                            icon: ICON_MAP[s.icon] || Sparkles,
                            color: s.color || '#6366f1',
                        }));
                    setSTAGES(firestoreStages);
                }
            },
            () => { /* keep defaults on error */ }
        );
        return () => unsub();
    }, []);

    // Drag state
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

    // Stage advancement modal
    const [advanceModal, setAdvanceModal] = useState<{ ms: ManuscriptEntry; targetStage: PipelineStage } | null>(null);
    const [advancing, setAdvancing] = useState(false);

    // Comments
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Load manuscripts from Firestore
    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'manuscripts'), orderBy('createdAt', 'desc')),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ManuscriptEntry));
                setManuscripts(data);
                setLoading(false);
            },
            () => { setLoading(false); }
        );
        return () => unsub();
    }, []);

    // Load comments when a manuscript is expanded
    useEffect(() => {
        if (!selectedManuscript) { setComments([]); return; }
        setLoadingComments(true);
        const unsub = onSnapshot(
            query(collection(db, 'manuscripts', selectedManuscript, 'comments'), orderBy('createdAt', 'desc')),
            (snap) => {
                setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
                setLoadingComments(false);
            },
            () => { setLoadingComments(false); }
        );
        return () => unsub();
    }, [selectedManuscript]);

    // Compute stats dynamically
    const stats = useMemo(() => {
        const total = manuscripts.length;
        const published = manuscripts.filter(m => m.currentStage === 'published').length;
        const inPipeline = total - published;
        const overdueCount = manuscripts.filter(m => isOverdue(m.deadline)).length;
        return { total, inPipeline, overdueCount, published };
    }, [manuscripts]);

    // Filter & search
    const filteredManuscripts = useMemo(() => {
        let result = manuscripts;
        if (filterStage !== 'all') result = result.filter(m => m.currentStage === filterStage);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(m => m.title.toLowerCase().includes(q) || m.author.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q));
        }
        return result;
    }, [manuscripts, filterStage, searchQuery]);

    const stageIdx = (stage: PipelineStage) => STAGES.findIndex(s => s.id === stage);

    const flagColor = (flag: string) => {
        if (flag === 'Urgent' || flag === 'Overdue') return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (flag === 'Priority') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (flag === 'Bestseller') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (flag === 'New' || flag === 'New Author') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        return 'bg-white/[0.04] text-text-secondary border-white/[0.06]';
    };

    // ═══ DRAG-AND-DROP ═══
    const handleDragStart = useCallback((msId: string) => { setDragId(msId); }, []);
    const handleDragEnd = useCallback(() => { setDragId(null); setDragOverStage(null); }, []);
    const handleDragOver = useCallback((e: React.DragEvent, stage: PipelineStage) => {
        e.preventDefault();
        setDragOverStage(stage);
    }, []);
    const handleDrop = useCallback((targetStage: PipelineStage) => {
        if (!dragId) return;
        const ms = manuscripts.find(m => m.id === dragId);
        if (!ms || ms.currentStage === targetStage) { handleDragEnd(); return; }
        // Only allow advancing forward (or to any stage for admin flexibility)
        setAdvanceModal({ ms, targetStage });
        handleDragEnd();
    }, [dragId, manuscripts, handleDragEnd]);

    // ═══ STAGE ADVANCEMENT ═══
    const advanceStage = async () => {
        if (!advanceModal) return;
        setAdvancing(true);
        const { ms, targetStage } = advanceModal;
        const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        // Close current stage in history
        const updatedHistory = [...(ms.stageHistory || [])];
        if (updatedHistory.length > 0) {
            const last = updatedHistory[updatedHistory.length - 1];
            if (!last.completed) updatedHistory[updatedHistory.length - 1] = { ...last, completed: now };
        }
        // Add new stage entry
        updatedHistory.push({ stage: targetStage, entered: now });
        try {
            await updateDoc(doc(db, 'manuscripts', ms.id), {
                currentStage: targetStage,
                stageProgress: targetStage === 'published' ? 100 : 10,
                stageHistory: updatedHistory,
                lastActivity: 'Just now',
            });
        } catch (e) { console.error('Stage advance failed:', e); }
        setAdvancing(false);
        setAdvanceModal(null);
    };

    // ═══ COMMENTS ═══
    const addComment = async () => {
        if (!newComment.trim() || !selectedManuscript || !user) return;
        setSubmittingComment(true);
        try {
            await addDoc(collection(db, 'manuscripts', selectedManuscript, 'comments'), {
                author: user.displayName || 'Unknown',
                authorEmail: user.email || '',
                text: newComment.trim(),
                createdAt: Timestamp.now(),
            });
            setNewComment('');
        } catch (e) { console.error('Add comment failed:', e); }
        setSubmittingComment(false);
    };
    const deleteComment = async (commentId: string) => {
        if (!selectedManuscript) return;
        try { await deleteDoc(doc(db, 'manuscripts', selectedManuscript, 'comments', commentId)); }
        catch (e) { console.error('Delete comment failed:', e); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    <p className="text-text-muted text-sm font-ui">Loading pipeline…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* ═══ STAGE ADVANCEMENT MODAL ═══ */}
            <AnimatePresence>
                {advanceModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => !advancing && setAdvanceModal(null)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#111318] border border-white/[0.08] rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-semibold text-white">Advance Stage</h3>
                                <button onClick={() => !advancing && setAdvanceModal(null)} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="flex items-center gap-3 mb-5">
                                <img src={advanceModal.ms.cover} alt="" className="w-10 h-14 rounded object-cover shadow-sm" />
                                <div>
                                    <h4 className="text-sm font-semibold text-white">{advanceModal.ms.title}</h4>
                                    <p className="text-[10px] text-text-secondary">{advanceModal.ms.author}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06] mb-5">
                                {(() => {
                                    const from = STAGES.find(s => s.id === advanceModal.ms.currentStage)!;
                                    const to = STAGES.find(s => s.id === advanceModal.targetStage)!;
                                    const FromIcon = from.icon;
                                    const ToIcon = to.icon;
                                    return (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <FromIcon className="w-4 h-4" style={{ color: from.color }} />
                                                <span className="text-xs" style={{ color: from.color }}>{from.label}</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-white/20" />
                                            <div className="flex items-center gap-2">
                                                <ToIcon className="w-4 h-4" style={{ color: to.color }} />
                                                <span className="text-xs font-semibold" style={{ color: to.color }}>{to.label}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            {stageIdx(advanceModal.targetStage) < stageIdx(advanceModal.ms.currentStage) && (
                                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-5 text-xs text-amber-400">
                                    <AlertTriangle className="w-4 h-4 flex-none" />
                                    <span>You are moving this manuscript <strong>backward</strong> in the pipeline.</span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button onClick={() => !advancing && setAdvanceModal(null)}
                                    className="flex-1 px-4 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-text-secondary hover:text-white hover:bg-white/[0.08] transition-colors">
                                    Cancel
                                </button>
                                <button onClick={advanceStage} disabled={advancing}
                                    className="flex-1 px-4 py-2 text-xs bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-500/30 transition-colors disabled:opacity-50 font-semibold">
                                    {advancing ? 'Advancing…' : 'Confirm Advance'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ HEADER ═══ */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/20">
                                <GitBranch className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">Manuscript Pipeline</h1>
                                <p className="text-xs text-text-secondary">Track every manuscript from submission to publication.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
                                <input type="text" placeholder="Search title, author…"
                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded-md text-white placeholder:text-text-secondary focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 w-48" />
                            </div>
                            {(['board', 'list'] as const).map(mode => (
                                <button key={mode} onClick={() => setViewMode(mode)}
                                    className={`text-xs px-3 py-1.5 rounded border capitalize transition-colors
                                        ${viewMode === mode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06] hover:border-white/[0.12]'}`}>
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Total Manuscripts', value: stats.total, icon: Layers, color: 'text-white', bg: 'bg-white/[0.03]', border: 'border-white/[0.06]' },
                            { label: 'In Pipeline', value: stats.inPipeline, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/[0.06]', border: 'border-indigo-500/10' },
                            { label: 'Overdue', value: stats.overdueCount, icon: AlertTriangle, color: stats.overdueCount > 0 ? 'text-red-400' : 'text-emerald-400', bg: stats.overdueCount > 0 ? 'bg-red-500/[0.06]' : 'bg-emerald-500/[0.06]', border: stats.overdueCount > 0 ? 'border-red-500/10' : 'border-emerald-500/10' },
                            { label: 'Published', value: stats.published, icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/10' },
                        ].map(stat => {
                            const StatIcon = stat.icon;
                            return (
                                <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-lg px-4 py-3 flex items-center gap-3`}>
                                    <StatIcon className={`w-4 h-4 ${stat.color}`} />
                                    <div>
                                        <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
                                        <p className="text-[10px] text-text-secondary uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {manuscripts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                            <GitBranch className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-2">No Manuscripts in Pipeline</h2>
                        <p className="text-sm text-text-secondary max-w-md">
                            Manuscripts will appear here once they enter the editorial pipeline. Seed the data from the member dashboard.
                        </p>
                    </div>
                ) : viewMode === 'board' ? (
                    /* ═══ BOARD VIEW (KANBAN WITH DRAG-AND-DROP) ═══ */
                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
                        {STAGES.map(stage => {
                            const StageIcon = stage.icon;
                            const stageManuscripts = manuscripts.filter(m => m.currentStage === stage.id);
                            const isDragTarget = dragOverStage === stage.id && dragId !== null;
                            return (
                                <div key={stage.id} className="flex-none w-[220px]"
                                    onDragOver={(e) => handleDragOver(e, stage.id)}
                                    onDragLeave={() => setDragOverStage(null)}
                                    onDrop={() => handleDrop(stage.id)}>
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <StageIcon className="w-3.5 h-3.5" style={{ color: stage.color }} />
                                        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: stage.color }}>{stage.label}</span>
                                        <span className="text-[10px] text-white/30 ml-auto font-mono">{stageManuscripts.length}</span>
                                    </div>
                                    <div className={`space-y-2 min-h-[120px] rounded-lg transition-colors p-1 -m-1
                                        ${isDragTarget ? 'bg-indigo-500/10 ring-1 ring-indigo-500/20' : ''}`}>
                                        {stageManuscripts.map(ms => (
                                            <motion.div key={ms.id}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                draggable
                                                onDragStart={() => handleDragStart(ms.id)}
                                                onDragEnd={handleDragEnd}
                                                onClick={() => setSelectedManuscript(selectedManuscript === ms.id ? null : ms.id)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all group cursor-grab active:cursor-grabbing
                                                    ${dragId === ms.id ? 'opacity-40 scale-95' : ''}
                                                    ${selectedManuscript === ms.id ? 'bg-white/[0.06] border-indigo-400/30 shadow-lg shadow-indigo-500/5' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]'}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <img src={ms.cover} alt="" className="w-6 h-8 rounded object-cover flex-none shadow-sm" />
                                                    <div className="min-w-0">
                                                        <h4 className="text-xs font-semibold text-white truncate">{ms.title}</h4>
                                                        <p className="text-[9px] text-text-secondary">{ms.author}</p>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                                                    <motion.div
                                                        initial={{ width: 0 }} animate={{ width: `${ms.stageProgress}%` }}
                                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                                        className="h-full rounded-full" style={{ backgroundColor: stage.color }} />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] text-text-secondary">{ms.lastActivity}</span>
                                                    <div className="flex gap-1">
                                                        {isOverdue(ms.deadline) && (
                                                            <span className="text-[7px] px-1 py-0.5 border rounded font-medium bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-0.5">
                                                                <AlertTriangle className="w-2 h-2" />{deadlineLabel(ms.deadline)}
                                                            </span>
                                                        )}
                                                        {ms.flags.slice(0, 1).map(f => (
                                                            <span key={f} className={`text-[7px] px-1 py-0.5 border rounded font-medium ${flagColor(f)}`}>{f}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {stageManuscripts.length === 0 && (
                                            <div className={`p-6 border border-dashed rounded-lg text-center transition-colors
                                                ${isDragTarget ? 'border-indigo-400/30 bg-indigo-500/5' : 'border-white/[0.06]'}`}>
                                                <StageIcon className="w-4 h-4 mx-auto mb-1.5" style={{ color: stage.color, opacity: isDragTarget ? 0.6 : 0.3 }} />
                                                <p className="text-[9px] text-white/20">{isDragTarget ? 'Drop here' : 'No manuscripts'}</p>
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
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <Filter className="w-4 h-4 text-text-secondary flex-none" />
                            <button onClick={() => setFilterStage('all')}
                                className={`text-xs px-3 py-1.5 rounded border transition-colors ${filterStage === 'all' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06] hover:border-white/[0.12]'}`}>All</button>
                            {STAGES.map(s => (
                                <button key={s.id} onClick={() => setFilterStage(s.id)}
                                    className={`text-xs px-3 py-1.5 rounded border transition-colors
                                        ${filterStage === s.id ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06] hover:border-white/[0.12]'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {filteredManuscripts.map((ms, idx) => {
                                const curStage = STAGES.find(s => s.id === ms.currentStage)!;
                                const CurIcon = curStage.icon;
                                const overdue = isOverdue(ms.deadline);
                                return (
                                    <motion.div key={ms.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        onClick={() => setSelectedManuscript(selectedManuscript === ms.id ? null : ms.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all
                                            ${overdue ? 'border-red-500/20' : ''}
                                            ${selectedManuscript === ms.id ? 'bg-white/[0.04] border-indigo-400/20 shadow-lg shadow-indigo-500/5' : `bg-white/[0.02] ${overdue ? 'border-red-500/10' : 'border-white/[0.06]'} hover:border-white/[0.1] hover:bg-white/[0.03]`}`}>
                                        <div className="flex items-center gap-4">
                                            <img src={ms.cover} alt="" className="w-8 h-11 rounded object-cover flex-none shadow-sm" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-semibold text-white">{ms.title}</h4>
                                                    {overdue && (
                                                        <span className="text-[8px] px-1.5 py-0.5 border rounded font-medium bg-red-500/10 text-red-400 border-red-500/20 flex items-center gap-0.5">
                                                            <AlertTriangle className="w-2.5 h-2.5" />{deadlineLabel(ms.deadline)}
                                                        </span>
                                                    )}
                                                    {!overdue && ms.deadline && (
                                                        <span className="text-[8px] px-1.5 py-0.5 border rounded font-medium bg-white/[0.04] text-text-secondary border-white/[0.06] flex items-center gap-0.5">
                                                            <Clock className="w-2.5 h-2.5" />{deadlineLabel(ms.deadline)}
                                                        </span>
                                                    )}
                                                    {ms.flags.map(f => (
                                                        <span key={f} className={`text-[8px] px-1.5 py-0.5 border rounded font-medium ${flagColor(f)}`}>{f}</span>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-text-secondary">{ms.author} · {ms.genre} · {ms.wordCount} words</p>
                                            </div>

                                            {/* Pipeline Progress Mini */}
                                            <div className="flex-none flex items-center gap-0.5">
                                                {STAGES.map((s, i) => {
                                                    const cur = stageIdx(ms.currentStage);
                                                    const isPast = i < cur;
                                                    const isCurrent = i === cur;
                                                    return (
                                                        <div key={s.id} className="flex items-center">
                                                            <div className={`w-2.5 h-2.5 rounded-full border transition-colors ${isPast ? 'border-emerald-400 bg-emerald-400' : isCurrent ? 'border-indigo-400 bg-indigo-400/30' : 'border-white/10 bg-transparent'}`} />
                                                            {i < STAGES.length - 1 && <div className={`w-3 h-px ${isPast ? 'bg-emerald-400/40' : 'bg-white/[0.06]'}`} />}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex-none text-right w-28">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <CurIcon className="w-3 h-3" style={{ color: curStage.color }} />
                                                    <span className="text-[10px] font-semibold" style={{ color: curStage.color }}>{curStage.label}</span>
                                                </div>
                                                <p className="text-[9px] text-text-secondary">{ms.lastActivity}</p>
                                            </div>
                                        </div>

                                        {/* ═══ EXPANDED DETAIL ═══ */}
                                        <AnimatePresence>
                                            {selectedManuscript === ms.id && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                                                    <div className="pt-4 mt-4 border-t border-white/[0.04]">
                                                        <div className="grid grid-cols-4 gap-6 mb-5">
                                                            {/* Pipeline History */}
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Pipeline History</p>
                                                                <div className="space-y-1.5">
                                                                    {(ms.stageHistory || []).map((h, i) => {
                                                                        const s = STAGES.find(st => st.id === h.stage);
                                                                        if (!s) return null;
                                                                        return (
                                                                            <div key={i} className="flex items-center gap-2 text-[10px]">
                                                                                <CheckCircle2 className="w-3 h-3 flex-none" style={{ color: h.completed ? '#22c55e' : s.color }} />
                                                                                <span className="text-white/70">{s.label}</span>
                                                                                <span className="text-text-secondary ml-auto">{h.entered}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            {/* Details */}
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Details</p>
                                                                <div className="space-y-1.5 text-[11px]">
                                                                    <div className="flex justify-between"><span className="text-text-secondary">Editor</span><span className="text-white">{ms.assignedEditor || '—'}</span></div>
                                                                    <div className="flex justify-between"><span className="text-text-secondary">Beta Readers</span><span className="text-white">{ms.betaReaders}</span></div>
                                                                    <div className="flex justify-between"><span className="text-text-secondary">Submitted</span><span className="text-white">{ms.submittedDate}</span></div>
                                                                    <div className="flex justify-between"><span className="text-text-secondary">Target Pub</span><span className="text-white">{ms.targetPubDate}</span></div>
                                                                    <div className="flex justify-between"><span className="text-text-secondary">Word Count</span><span className="text-white">{ms.wordCount}</span></div>
                                                                    {ms.deadline && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-text-secondary">Deadline</span>
                                                                            <span className={overdue ? 'text-red-400 font-semibold' : 'text-white'}>{ms.deadline}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Stage Progress */}
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Stage Progress</p>
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${ms.stageProgress}%` }}
                                                                            transition={{ duration: 0.8 }} className="h-full rounded-full"
                                                                            style={{ backgroundColor: curStage.color }} />
                                                                    </div>
                                                                    <span className="text-xs font-semibold" style={{ color: curStage.color }}>{ms.stageProgress}%</span>
                                                                </div>
                                                                <p className="text-[10px] text-text-secondary">
                                                                    Overall: stage {stageIdx(ms.currentStage) + 1} of {STAGES.length}
                                                                </p>
                                                            </div>
                                                            {/* Actions */}
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-2">Actions</p>
                                                                <div className="space-y-1.5">
                                                                    {ms.currentStage !== 'published' && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const nextIdx = stageIdx(ms.currentStage) + 1;
                                                                                if (nextIdx < STAGES.length) setAdvanceModal({ ms, targetStage: STAGES[nextIdx].id });
                                                                            }}
                                                                            className="w-full text-left px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-xs text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center gap-2">
                                                                            <ArrowRight className="w-3 h-3" /> Advance to {STAGES[stageIdx(ms.currentStage) + 1]?.label}
                                                                        </button>
                                                                    )}
                                                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/forge-editor/${ms.id}`); }}
                                                                        className="w-full text-left px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white hover:bg-white/[0.08] transition-colors flex items-center gap-2">
                                                                        <Eye className="w-3 h-3" /> View in Editor
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* ═══ COMMENTS SECTION ═══ */}
                                                        <div className="border-t border-white/[0.04] pt-4">
                                                            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-3 flex items-center gap-1.5">
                                                                <MessageCircle className="w-3 h-3" /> Notes & Comments
                                                                <span className="text-white/20 font-mono ml-1">{comments.length}</span>
                                                            </p>
                                                            {/* Add comment */}
                                                            <div className="flex gap-2 mb-3">
                                                                <input type="text" placeholder="Add a note…"
                                                                    value={newComment} onChange={e => setNewComment(e.target.value)}
                                                                    onKeyDown={e => e.key === 'Enter' && addComment()}
                                                                    onClick={e => e.stopPropagation()}
                                                                    className="flex-1 px-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.08] rounded text-white placeholder:text-text-secondary focus:outline-none focus:border-indigo-500/40" />
                                                                <button onClick={(e) => { e.stopPropagation(); addComment(); }} disabled={submittingComment || !newComment.trim()}
                                                                    className="px-3 py-1.5 text-xs bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400 hover:bg-indigo-500/20 transition-colors disabled:opacity-30">
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            {/* Comment list */}
                                                            {loadingComments ? (
                                                                <p className="text-[10px] text-text-secondary">Loading…</p>
                                                            ) : comments.length > 0 ? (
                                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                                    {comments.map(c => (
                                                                        <div key={c.id} className="flex items-start gap-2 p-2 bg-white/[0.02] rounded border border-white/[0.04]">
                                                                            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[8px] text-indigo-400 font-semibold flex-none mt-0.5">
                                                                                {c.author?.[0]?.toUpperCase() || '?'}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[10px] text-white font-semibold">{c.author}</span>
                                                                                    <span className="text-[9px] text-text-secondary">
                                                                                        {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : ''}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-[11px] text-white/70 mt-0.5">{c.text}</p>
                                                                            </div>
                                                                            <button onClick={(e) => { e.stopPropagation(); deleteComment(c.id); }}
                                                                                className="text-white/10 hover:text-red-400 transition-colors flex-none">
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-[10px] text-white/20 text-center py-2">No notes yet. Add one above.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                            {filteredManuscripts.length === 0 && manuscripts.length > 0 && (
                                <div className="text-center py-12">
                                    <Search className="w-6 h-6 text-text-secondary mx-auto mb-2" />
                                    <p className="text-sm text-text-secondary">No manuscripts match your filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
