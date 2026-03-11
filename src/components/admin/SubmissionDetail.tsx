import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, ExternalLink, Flag, UserPlus, Star, Send, Download, CheckCircle } from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import {
    STATUS_MAP, NEXT_STATUS, COMM_TEMPLATES, EVAL_CRITERIA, normalizeStatus,
    type EditorSubmission, type SubmissionStatus, type Evaluation, type EvalCriterionId, STATUSES
} from './submissionLifecycle';

interface Props {
    submission: EditorSubmission;
    onClose: () => void;
    onStatusChange: (id: string, status: SubmissionStatus) => void;
    onUpdate: (id: string, data: Partial<EditorSubmission>) => void;
}

export default function SubmissionDetail({ submission: sub, onClose, onStatusChange, onUpdate }: Props) {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [notes, setNotes] = useState<{ id: string; text: string; author: string; createdAt: any }[]>([]);
    const [showEvalForm, setShowEvalForm] = useState(false);
    const [evalScores, setEvalScores] = useState<Record<string, number>>({});
    const [evalRec, setEvalRec] = useState<'pass' | 'consider' | 'decline'>('consider');
    const [evalNotes, setEvalNotes] = useState('');
    const [newNote, setNewNote] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [templateMessage, setTemplateMessage] = useState('');
    const [sendingTemplate, setSendingTemplate] = useState(false);
    const [templateSent, setTemplateSent] = useState(false);

    const cfg = STATUS_MAP[sub.status] || STATUS_MAP.received;
    const StatusIcon = cfg.icon;
    const nextStatus = NEXT_STATUS[sub.status];

    // Load evaluations and notes
    useEffect(() => {
        const load = async () => {
            try {
                const evalSnap = await getDocs(query(collection(db, `submissions/${sub.id}/evaluations`), orderBy('createdAt', 'desc')));
                setEvaluations(evalSnap.docs.map(d => ({ id: d.id, ...d.data() } as Evaluation)));
                const noteSnap = await getDocs(query(collection(db, `submissions/${sub.id}/notes`), orderBy('createdAt', 'asc')));
                setNotes(noteSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
            } catch { /* ignore */ }
        };
        load();
    }, [sub.id]);

    // Template selection
    const selectTemplate = (id: string) => {
        setTemplateId(id);
        const tpl = COMM_TEMPLATES.find(t => t.id === id);
        if (tpl) {
            let body = tpl.body
                .replace(/{authorName}/g, sub.penName || sub.authorName)
                .replace(/{title}/g, sub.title)
                .replace(/{trackingId}/g, sub.trackingId || sub.id.slice(0, 10));
            setTemplateMessage(body);
        }
    };

    // Send template message
    const sendTemplateMessage = async () => {
        if (!templateMessage.trim() || !sub.authorId) return;
        setSendingTemplate(true);
        try {
            await addDoc(collection(db, 'messages'), {
                uid: sub.authorId,
                text: templateMessage,
                sender: 'admin',
                senderName: auth.currentUser?.displayName || 'Editorial Team',
                read: false,
                createdAt: serverTimestamp(),
            });
            setTemplateSent(true);
            setTimeout(() => { setTemplateSent(false); setTemplateMessage(''); setTemplateId(''); }, 2000);
        } catch { /* ignore */ } finally { setSendingTemplate(false); }
    };

    // Add note
    const addNote = async () => {
        if (!newNote.trim()) return;
        try {
            await addDoc(collection(db, `submissions/${sub.id}/notes`), {
                text: newNote, author: auth.currentUser?.displayName || 'Editor', createdAt: serverTimestamp(),
            });
            setNotes(prev => [...prev, { id: Date.now().toString(), text: newNote, author: auth.currentUser?.displayName || 'Editor', createdAt: new Date() }]);
            setNewNote('');
        } catch { /* ignore */ }
    };

    // Submit evaluation
    const submitEval = async () => {
        try {
            await addDoc(collection(db, `submissions/${sub.id}/evaluations`), {
                criteria: evalScores, recommendation: evalRec, notes: evalNotes,
                evaluatorName: auth.currentUser?.displayName || 'Editor', createdAt: serverTimestamp(),
            });
            setShowEvalForm(false);
            setEvalScores({}); setEvalNotes('');
            // Reload evaluations
            const snap = await getDocs(query(collection(db, `submissions/${sub.id}/evaluations`), orderBy('createdAt', 'desc')));
            setEvaluations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Evaluation)));
        } catch { /* ignore */ }
    };

    const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => onChange(s)}
                    className={`p-0.5 ${s <= value ? 'text-starforge-gold' : 'text-text-muted/30'} hover:text-starforge-gold transition-colors`}>
                    <Star className="w-4 h-4 fill-current" />
                </button>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            <div className="absolute inset-0 bg-void-black/80 backdrop-blur-sm" />
            <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative ml-auto w-full max-w-6xl bg-deep-space border-l border-border flex flex-col h-full"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-surface shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
                        <div className="min-w-0">
                            <h2 className="font-heading text-xl text-text-primary truncate">{sub.title}</h2>
                            <p className="font-mono text-[10px] text-text-muted">{sub.trackingId || sub.id.slice(0, 10)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${cfg.bg} ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                        {sub.priority && <Flag className="w-4 h-4 text-forge-red fill-forge-red" />}
                    </div>
                </div>

                {/* 3-Column Body */}
                <div className="flex-1 overflow-hidden flex">
                    {/* LEFT: Materials Reader */}
                    <div className="w-1/3 border-r border-border overflow-y-auto p-4 space-y-6">
                        <div>
                            <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-2">Query Letter</h3>
                            <div className="font-body text-sm text-text-secondary leading-relaxed whitespace-pre-line bg-void-black p-4 rounded-sm border border-border max-h-60 overflow-y-auto">
                                {sub.queryLetter || 'No query letter provided.'}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-2">Synopsis</h3>
                            <div className="font-body text-sm text-text-secondary leading-relaxed whitespace-pre-line bg-void-black p-4 rounded-sm border border-border max-h-60 overflow-y-auto">
                                {sub.synopsis || 'No synopsis provided.'}
                            </div>
                        </div>
                        {(sub.synopsisFileUrl || sub.sampleFileUrl) && (
                            <div>
                                <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-2">Files</h3>
                                <div className="space-y-2">
                                    {sub.synopsisFileUrl && (
                                        <a href={sub.synopsisFileUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 bg-void-black border border-border rounded-sm text-text-primary hover:border-starforge-gold/50 transition-colors font-ui text-xs">
                                            <Download className="w-3.5 h-3.5 text-starforge-gold" /> Synopsis PDF <ExternalLink className="w-3 h-3 text-text-muted ml-auto" />
                                        </a>
                                    )}
                                    {sub.sampleFileUrl && (
                                        <a href={sub.sampleFileUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 bg-void-black border border-border rounded-sm text-text-primary hover:border-starforge-gold/50 transition-colors font-ui text-xs">
                                            <Download className="w-3.5 h-3.5 text-starforge-gold" /> Manuscript Sample <ExternalLink className="w-3 h-3 text-text-muted ml-auto" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CENTER: Metadata & Evaluation */}
                    <div className="w-1/3 border-r border-border overflow-y-auto p-4 space-y-6">
                        <div>
                            <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Manuscript Info</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    ['Genre', sub.genre], ['Words', sub.wordCount?.toLocaleString()],
                                    ['Comp Titles', sub.compTitles], ['Audience', sub.targetAudience],
                                    ['Representation', sub.representationStatus], ['Prev. Published', sub.previouslyPublished],
                                ].map(([label, val]) => val ? (
                                    <div key={label as string} className="bg-void-black p-2 rounded-sm border border-border">
                                        <p className="font-ui text-[9px] text-text-muted uppercase tracking-wider">{label}</p>
                                        <p className="font-ui text-xs text-text-primary capitalize mt-0.5">{val}</p>
                                    </div>
                                ) : null)}
                            </div>
                            {sub.contentWarnings && (
                                <div className="mt-2 bg-forge-red/5 border border-forge-red/20 p-2 rounded-sm">
                                    <p className="font-ui text-[9px] text-forge-red uppercase tracking-wider">Content Warnings</p>
                                    <p className="font-ui text-xs text-text-secondary mt-0.5">{sub.contentWarnings}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Author</h3>
                            <div className="bg-void-black p-3 rounded-sm border border-border space-y-1">
                                <p className="font-heading text-sm text-text-primary">{sub.authorName}</p>
                                {sub.penName && <p className="font-ui text-xs text-text-muted">Pen name: {sub.penName}</p>}
                                <p className="font-ui text-xs text-text-muted">{sub.email}</p>
                            </div>
                        </div>

                        {/* Evaluations */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted">Evaluations</h3>
                                <button onClick={() => setShowEvalForm(!showEvalForm)}
                                    className="font-ui text-[10px] text-starforge-gold uppercase tracking-wider hover:text-yellow-400">
                                    {showEvalForm ? 'Cancel' : '+ New'}
                                </button>
                            </div>

                            {showEvalForm && (
                                <div className="bg-void-black border border-starforge-gold/20 rounded-sm p-3 mb-3 space-y-3">
                                    {EVAL_CRITERIA.map(c => (
                                        <div key={c.id} className="flex items-center justify-between">
                                            <span className="font-ui text-xs text-text-secondary">{c.label}</span>
                                            <StarRating value={evalScores[c.id] || 0} onChange={v => setEvalScores(p => ({ ...p, [c.id]: v }))} />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="font-ui text-[10px] text-text-muted uppercase tracking-wider block mb-1">Recommendation</label>
                                        <div className="flex gap-2">
                                            {(['pass', 'consider', 'decline'] as const).map(r => (
                                                <button key={r} type="button" onClick={() => setEvalRec(r)}
                                                    className={`flex-1 py-1.5 font-ui text-[10px] uppercase tracking-wider rounded-sm border transition-colors ${evalRec === r
                                                        ? r === 'pass' ? 'border-aurora-teal bg-aurora-teal/10 text-aurora-teal'
                                                            : r === 'decline' ? 'border-forge-red bg-forge-red/10 text-forge-red'
                                                                : 'border-starforge-gold bg-starforge-gold/10 text-starforge-gold'
                                                        : 'border-border text-text-muted'
                                                        }`}>
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea rows={2} value={evalNotes} onChange={e => setEvalNotes(e.target.value)}
                                        placeholder="Notes..." className="w-full bg-deep-space border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui resize-none outline-none focus:border-starforge-gold" />
                                    <button onClick={submitEval} className="w-full py-1.5 bg-starforge-gold text-void-black font-ui text-[10px] uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors">
                                        Submit Evaluation
                                    </button>
                                </div>
                            )}

                            {evaluations.map(ev => (
                                <div key={ev.id} className="bg-void-black border border-border rounded-sm p-3 mb-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-ui text-[10px] text-text-muted">{ev.evaluatorName}</span>
                                        <span className={`font-ui text-[10px] uppercase tracking-wider font-semibold ${ev.recommendation === 'pass' ? 'text-aurora-teal' : ev.recommendation === 'decline' ? 'text-forge-red' : 'text-starforge-gold'
                                            }`}>{ev.recommendation}</span>
                                    </div>
                                    {ev.criteria && Object.entries(ev.criteria).map(([k, v]) => (
                                        <div key={k} className="flex items-center justify-between py-0.5">
                                            <span className="font-ui text-[9px] text-text-muted capitalize">{k.replace(/_/g, ' ')}</span>
                                            <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= (v as number) ? 'text-starforge-gold fill-starforge-gold' : 'text-text-muted/20'}`} />)}</div>
                                        </div>
                                    ))}
                                    {ev.notes && <p className="font-ui text-[10px] text-text-secondary mt-2 border-t border-border pt-2">{ev.notes}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Workflow */}
                    <div className="w-1/3 overflow-y-auto p-4 space-y-6">
                        {/* Status Actions */}
                        <div>
                            <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Workflow Actions</h3>
                            <div className="space-y-2">
                                {nextStatus && (
                                    <button onClick={() => onStatusChange(sub.id, nextStatus)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors">
                                        <ChevronRight className="w-4 h-4" /> Advance to {STATUS_MAP[nextStatus]?.label}
                                    </button>
                                )}
                                {sub.status !== 'declined' && sub.status !== 'withdrawn' && sub.status !== 'published' && (
                                    <button onClick={() => onStatusChange(sub.id, 'declined')}
                                        className="w-full py-2 border border-forge-red/30 text-forge-red font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-forge-red/10 transition-colors">
                                        Decline
                                    </button>
                                )}
                            </div>
                            {/* Manual Status Override */}
                            <details className="mt-3">
                                <summary className="font-ui text-[10px] text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary">
                                    Manual Status Override
                                </summary>
                                <select onChange={e => e.target.value && onStatusChange(sub.id, e.target.value as SubmissionStatus)} value=""
                                    className="w-full mt-2 bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui outline-none appearance-none">
                                    <option value="">Select status...</option>
                                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
                                </select>
                            </details>
                        </div>

                        {/* Assignment & Priority */}
                        <div>
                            <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Assignment</h3>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Assign to editor..." value={sub.assignedTo || ''} onChange={e => onUpdate(sub.id, { assignedTo: e.target.value })}
                                        className="flex-1 bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui outline-none focus:border-starforge-gold" />
                                    <button onClick={() => onUpdate(sub.id, { assignedTo: auth.currentUser?.displayName || '' })}
                                        className="px-3 py-2 border border-border rounded-sm text-text-muted hover:text-starforge-gold hover:border-starforge-gold/30 transition-colors">
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button onClick={() => onUpdate(sub.id, { priority: !sub.priority })}
                                    className={`w-full flex items-center justify-center gap-2 py-2 border rounded-sm font-ui text-xs uppercase tracking-wider transition-colors ${sub.priority ? 'border-forge-red text-forge-red bg-forge-red/5' : 'border-border text-text-muted hover:text-forge-red hover:border-forge-red/30'
                                        }`}>
                                    <Flag className={`w-3.5 h-3.5 ${sub.priority ? 'fill-forge-red' : ''}`} /> {sub.priority ? 'Priority Flagged' : 'Flag Priority'}
                                </button>
                            </div>
                        </div>

                        {/* Communication Templates */}
                        <div>
                            <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Message Author</h3>
                            <select value={templateId} onChange={e => selectTemplate(e.target.value)}
                                className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui outline-none appearance-none mb-2">
                                <option value="">Select template...</option>
                                {COMM_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                            {templateMessage && (
                                <div className="space-y-2">
                                    <textarea rows={6} value={templateMessage} onChange={e => setTemplateMessage(e.target.value)}
                                        className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-secondary text-xs font-body resize-y outline-none focus:border-starforge-gold" />
                                    <button onClick={sendTemplateMessage} disabled={sendingTemplate || templateSent}
                                        className="w-full flex items-center justify-center gap-2 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors disabled:opacity-50">
                                        {templateSent ? <><CheckCircle className="w-3.5 h-3.5" /> Sent!</> : <><Send className="w-3.5 h-3.5" /> Send to Author</>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Editor Notes</h3>
                            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                                {notes.map(n => (
                                    <div key={n.id} className="bg-void-black p-2 rounded-sm border border-border">
                                        <p className="font-ui text-xs text-text-secondary">{n.text}</p>
                                        <p className="font-ui text-[9px] text-text-muted mt-1">{n.author} • {n.createdAt?.toDate?.()?.toLocaleDateString?.() || ''}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()}
                                    placeholder="Add a note..."
                                    className="flex-1 bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui outline-none focus:border-starforge-gold" />
                                <button onClick={addNote} className="px-3 py-2 bg-surface border border-border rounded-sm text-text-muted hover:text-starforge-gold transition-colors">
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
