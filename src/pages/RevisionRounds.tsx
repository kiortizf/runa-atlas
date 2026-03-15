import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitBranch, Edit3, CheckCircle2, Clock, AlertCircle, Eye,
    MessageCircle, ChevronDown, ArrowRight, Send, FileText,
    RotateCcw, Layers, Star, Target, Zap, BarChart3, Check,
    X, BookOpen, Users, Shield, ChevronRight, Circle
} from 'lucide-react';

// ═══════════════════════════════════════════════
// REVISION ROUNDS — Version-Tracked Editorial Workflow
// ═══════════════════════════════════════════════

type RoundStatus = 'active' | 'completed' | 'awaiting_revision' | 'review_pending';
type NoteStatus = 'open' | 'resolved' | 'deferred' | 'disputed';

interface EditorialNote {
    id: string;
    chapter: number;
    chapterTitle: string;
    category: string;
    text: string;
    editor: string;
    status: NoteStatus;
    authorResponse?: string;
    source?: string; // 'editorial' | 'beta_imported'
    priority: 'low' | 'medium' | 'high' | 'critical';
}

interface RevisionRound {
    id: string;
    round: number;
    status: RoundStatus;
    startDate: string;
    endDate?: string;
    editor: string;
    notesGiven: number;
    notesResolved: number;
    decision: string;
    summary: string;
    notes: EditorialNote[];
}

const statusConfig: Record<NoteStatus, { color: string; label: string; icon: any }> = {
    open: { color: '#f59e0b', label: 'Open', icon: Circle },
    resolved: { color: '#22c55e', label: 'Resolved', icon: CheckCircle2 },
    deferred: { color: '#6b7280', label: 'Deferred', icon: Clock },
    disputed: { color: '#ef4444', label: 'Disputed', icon: AlertCircle },
};

const priorityColors: Record<string, string> = {
    low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444',
};

export default function RevisionRounds() {
    const [rounds, setRounds] = useState<RevisionRound[]>([]);
    const [selectedRound, setSelectedRound] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<NoteStatus | 'all'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (u) => {
            if (!u) { setLoading(false); return; }
            const unsub = onSnapshot(
                query(collection(db, 'revision_rounds'), where('authorId', '==', u.uid)),
                (snap) => {
                    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as RevisionRound));
                    setRounds(data);
                    if (data.length > 0 && !selectedRound) setSelectedRound(data[0].id);
                    setLoading(false);
                },
                () => setLoading(false)
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const activeRound = rounds.find(r => r.id === selectedRound);

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <RotateCcw className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">Revision Rounds</h1>
                                <p className="text-xs text-text-secondary">
                                    <span className="text-white/70">Wrath & Reverie</span> · <span className="text-white/70">Elara Vance</span> · Editor: Marcus Reid
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Round Tabs */}
                    <div className="flex items-center gap-3">
                        {rounds.map(r => (
                            <button key={r.id} onClick={() => { setSelectedRound(r.id); setFilterStatus('all'); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs transition-all
                                    ${selectedRound === r.id ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06] hover:border-white/[0.1]'}`}>
                                <span className="font-semibold">Round {r.round}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border capitalize
                                    ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        r.status === 'active' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{r.status.replace('_', ' ')}</span>
                            </button>
                        ))}
                        <button onClick={() => alert('New revision round creation coming soon!')} className="px-3 py-2 bg-white/[0.02] text-text-secondary text-xs border border-dashed border-white/[0.1] rounded-lg hover:border-white/[0.15] transition-colors">
                            + New Round
                        </button>
                    </div>
                </div>
            </div>

            {activeRound && (
                <div className="max-w-6xl mx-auto px-6 py-8">
                    {/* Round Summary Card */}
                    <motion.div key={activeRound.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-8">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-1">Round {activeRound.round} — Editorial Assessment</h3>
                                <p className="text-[10px] text-text-secondary">
                                    {activeRound.startDate} {activeRound.endDate ? `— ${activeRound.endDate}` : '— Ongoing'} · Editor: {activeRound.editor}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {activeRound.decision !== 'Pending' && (
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded border
                                        ${activeRound.decision === 'Accept' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            activeRound.decision === 'Revise & Resubmit' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-white/[0.04] text-text-secondary border-white/[0.06]'}`}>
                                        {activeRound.decision}
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed mb-4">{activeRound.summary}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-3.5 h-3.5 text-violet-400" />
                                <span className="text-xs text-white">{activeRound.notesGiven} notes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs text-white">{activeRound.notesResolved} resolved</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden w-32">
                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(activeRound.notesResolved / activeRound.notesGiven) * 100}%` }} />
                                </div>
                                <span className="text-[10px] text-text-secondary">{Math.round((activeRound.notesResolved / activeRound.notesGiven) * 100)}%</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notes Filter */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs text-text-secondary font-semibold">Filter:</span>
                        <button onClick={() => setFilterStatus('all')}
                            className={`text-xs px-3 py-1.5 rounded border ${filterStatus === 'all' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>All</button>
                        {(Object.keys(statusConfig) as NoteStatus[]).map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`text-xs px-3 py-1.5 rounded border capitalize transition-colors
                                    ${filterStatus === s ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>
                                {statusConfig[s].label}
                            </button>
                        ))}
                    </div>

                    {/* Editorial Notes */}
                    <div className="space-y-2">
                        {(filterStatus === 'all' ? activeRound.notes : activeRound.notes.filter(n => n.status === filterStatus)).map((note, idx) => {
                            const sc = statusConfig[note.status];
                            const StatusIcon = sc.icon;
                            return (
                                <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.06 }}
                                    className={`p-4 rounded-xl border transition-all
                                        ${note.status === 'open' ? 'bg-white/[0.02] border-amber-500/10' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <StatusIcon className="w-3.5 h-3.5 flex-none" style={{ color: sc.color }} />
                                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: sc.color }}>{sc.label}</span>
                                        <span className="text-[10px] text-text-secondary">Ch. {note.chapter} — {note.chapterTitle}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-text-secondary capitalize">{note.category}</span>
                                        <div className="w-1.5 h-1.5 rounded-full flex-none" style={{ backgroundColor: priorityColors[note.priority] }} />
                                        <span className="text-[9px] capitalize" style={{ color: priorityColors[note.priority] }}>{note.priority}</span>
                                        {note.source === 'beta_imported' && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400/70 border border-cyan-500/20 rounded flex items-center gap-1">
                                                <Users className="w-2.5 h-2.5" /> Beta Imported
                                            </span>
                                        )}
                                        <span className="text-[9px] text-text-secondary ml-auto">{note.editor}</span>
                                    </div>

                                    <p className="text-sm text-white/70 leading-relaxed pl-5 mb-2">{note.text}</p>

                                    {note.authorResponse && (
                                        <div className="ml-5 pl-3 border-l-2 border-violet-500/20 bg-violet-500/[0.03] rounded-r-lg py-2 px-3">
                                            <p className="text-[10px] text-violet-400 font-semibold mb-1 flex items-center gap-1">
                                                <Edit3 className="w-3 h-3" /> Author Response
                                            </p>
                                            <p className="text-xs text-white/50 italic">{note.authorResponse}</p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
