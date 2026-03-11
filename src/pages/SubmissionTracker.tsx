import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FileText, Clock, Check, Eye, MessageSquare, AlertTriangle,
    ChevronRight, BookOpen, Send, Star, ArrowRight, Bell,
    CheckCircle2, XCircle, RefreshCw, Inbox, Pen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

interface TrackedSubmission {
    id: string;
    trackingId?: string;
    title: string;
    genre: string;
    status: string;
    wordCount?: number;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

const PIPELINE_STAGES = [
    { key: 'pending', label: 'Submitted', icon: Send, color: 'text-white/40', bg: 'bg-white/[0.04]', description: 'Your manuscript has been received and is in our queue.' },
    { key: 'reviewing', label: 'Under Review', icon: Eye, color: 'text-aurora-teal', bg: 'bg-aurora-teal/10', description: 'An editor is reading your manuscript.' },
    { key: 'revision_requested', label: 'Revisions', icon: RefreshCw, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', description: 'We\'ve sent editorial feedback. Please revise and resubmit.' },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', description: 'Congratulations! Your manuscript has been accepted for publication.' },
    { key: 'in_production', label: 'In Production', icon: BookOpen, color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10', description: 'Your book is being prepared for publication.' },
    { key: 'published', label: 'Published', icon: Star, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', description: 'Your book is live and available to readers!' },
];

// Demo submissions for when not logged in
const DEMO_SUBMISSIONS: TrackedSubmission[] = [
    { id: '1', trackingId: 'RA-2026-0142', title: 'The Ember Codex', genre: 'Dark Fantasy', status: 'accepted', wordCount: 92400, createdAt: Timestamp.fromDate(new Date('2025-11-15')), updatedAt: Timestamp.fromDate(new Date('2026-03-01')) },
    { id: '2', trackingId: 'RA-2026-0287', title: 'Whispers in the Aether', genre: 'Magical Realism', status: 'reviewing', wordCount: 68000, createdAt: Timestamp.fromDate(new Date('2026-01-20')), updatedAt: Timestamp.fromDate(new Date('2026-02-28')) },
    { id: '3', trackingId: 'RA-2026-0341', title: 'The Last Cartographer (Short Story)', genre: 'Science Fiction', status: 'pending', wordCount: 12000, createdAt: Timestamp.fromDate(new Date('2026-03-05')) },
];

export default function SubmissionTracker() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<TrackedSubmission[]>(DEMO_SUBMISSIONS);
    const [selectedSubmission, setSelectedSubmission] = useState<TrackedSubmission | null>(null);
    const [loading, setLoading] = useState(false);

    // Load real submissions if logged in
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const q = query(
            collection(db, 'submissions'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q,
            (snap) => {
                const subs = snap.docs.map(d => ({ id: d.id, ...d.data() } as TrackedSubmission));
                if (subs.length > 0) setSubmissions(subs);
                setLoading(false);
            },
            (err) => {
                handleFirestoreError(err, OperationType.GET, 'submissions');
                setLoading(false);
            }
        );
        return unsubscribe;
    }, [user]);

    const active = selectedSubmission || submissions[0];
    const activeStageIdx = active ? PIPELINE_STAGES.findIndex(s => s.key === active.status) : 0;

    return (
        <div className="bg-void-black min-h-screen py-24">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-2">Submission Tracker</span>
                        <h1 className="font-display text-3xl text-white tracking-wide">
                            TRACK YOUR <span className="text-starforge-gold">MANUSCRIPTS</span>
                        </h1>
                    </div>
                    <Link to="/submissions" className="flex items-center gap-2 px-5 py-2.5 bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-starforge-gold/90 transition-colors">
                        <Send className="w-3 h-3" /> New Submission
                    </Link>
                </div>

                {/* Submission List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {submissions.map(sub => {
                        const stage = PIPELINE_STAGES.find(s => s.key === sub.status) || PIPELINE_STAGES[0];
                        const isActive = active?.id === sub.id;
                        return (
                            <motion.button key={sub.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setSelectedSubmission(sub)}
                                className={`text-left p-5 rounded-lg border transition-all
                  ${isActive ? 'bg-starforge-gold/[0.04] border-starforge-gold/20' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <stage.icon className={`w-4 h-4 ${stage.color}`} />
                                    <span className={`text-[9px] px-2 py-0.5 rounded ${stage.bg} ${stage.color} uppercase tracking-wider font-semibold`}>
                                        {stage.label}
                                    </span>
                                </div>
                                <h3 className="text-sm text-white font-semibold">{sub.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-white/20">{sub.genre}</span>
                                    {sub.wordCount && <span className="text-[10px] text-white/15">• {(sub.wordCount / 1000).toFixed(0)}k words</span>}
                                </div>
                                {sub.trackingId && <p className="text-[9px] text-white/10 mt-2 font-mono">{sub.trackingId}</p>}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Pipeline Visualization */}
                {active && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg text-white font-semibold">{active.title}</h2>
                            {active.trackingId && <span className="text-xs text-white/15 font-mono">{active.trackingId}</span>}
                        </div>

                        {/* Visual Pipeline */}
                        <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
                            {PIPELINE_STAGES.map((stage, idx) => {
                                const isComplete = idx < activeStageIdx;
                                const isCurrent = idx === activeStageIdx;
                                const isFuture = idx > activeStageIdx;
                                return (
                                    <div key={stage.key} className="flex items-center flex-1 min-w-0">
                                        <div className={`flex flex-col items-center w-full`}>
                                            {/* Node */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                        ${isComplete ? 'bg-emerald-500/20 border-emerald-500/40' :
                                                    isCurrent ? 'bg-starforge-gold/20 border-starforge-gold/40 ring-4 ring-starforge-gold/10' :
                                                        'bg-white/[0.02] border-white/[0.06]'}`}>
                                                {isComplete ? <Check className="w-4 h-4 text-emerald-400" /> :
                                                    isCurrent ? <stage.icon className="w-4 h-4 text-starforge-gold" /> :
                                                        <stage.icon className="w-4 h-4 text-white/15" />}
                                            </div>
                                            {/* Label */}
                                            <span className={`text-[9px] mt-2 text-center uppercase tracking-wider font-semibold
                        ${isComplete ? 'text-emerald-400/60' : isCurrent ? 'text-starforge-gold' : 'text-white/15'}`}>
                                                {stage.label}
                                            </span>
                                        </div>
                                        {/* Connector */}
                                        {idx < PIPELINE_STAGES.length - 1 && (
                                            <div className={`h-0.5 flex-1 min-w-4 -mx-1 mt-[-1rem]
                        ${isComplete ? 'bg-emerald-500/30' : 'bg-white/[0.04]'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Current Status Description */}
                        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-5">
                            <div className="flex items-start gap-3">
                                {(() => {
                                    const currentStage = PIPELINE_STAGES[activeStageIdx];
                                    return (
                                        <>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${currentStage.bg}`}>
                                                <currentStage.icon className={`w-4 h-4 ${currentStage.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-semibold mb-1">
                                                    Status: <span className={currentStage.color}>{currentStage.label}</span>
                                                </p>
                                                <p className="text-xs text-white/40">{currentStage.description}</p>
                                                {active.updatedAt && (
                                                    <p className="text-[10px] text-white/15 mt-2">
                                                        Last updated: {active.updatedAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                            <Link to="/portal" className="flex items-center gap-2 px-4 py-2 border border-white/[0.06] text-white/50 text-xs uppercase tracking-wider rounded-sm hover:border-white/20 hover:text-white transition-colors">
                                <MessageSquare className="w-3 h-3" /> Message Editor
                            </Link>
                            {active.status === 'revision_requested' && (
                                <Link to={`/forge-editor/${active.id}`} className="flex items-center gap-2 px-4 py-2 bg-starforge-gold/10 border border-starforge-gold/20 text-starforge-gold text-xs uppercase tracking-wider rounded-sm hover:bg-starforge-gold/20 transition-colors">
                                    <Pen className="w-3 h-3" /> Open in Forge
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
