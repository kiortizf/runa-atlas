import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Plus, Trash2, Sparkles, AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useThreads, type NarrativeThread, type ThreadType } from '../../hooks/useThreads';

interface Props {
    manuscriptId?: string;
    chapters: { id: string; title: string; plainText: string }[];
}

export default function ThreadTracker({ manuscriptId, chapters }: Props) {
    const { threads, loading, addThread, removeThread, autoDetect, gaps, THREAD_COLORS, THREAD_TYPE_LABELS } = useThreads(manuscriptId);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<ThreadType>('subplot');
    const [newDesc, setNewDesc] = useState('');
    const [expandedThread, setExpandedThread] = useState<string | null>(null);
    const [detecting, setDetecting] = useState(false);

    const handleAutoDetect = useCallback(async () => {
        setDetecting(true);
        const detected = autoDetect(chapters);
        for (const thread of detected) { await addThread(thread); }
        setDetecting(false);
    }, [chapters, autoDetect, addThread]);

    const handleAddThread = async () => {
        if (!newName.trim()) return;
        await addThread({ name: newName.trim(), type: newType, color: THREAD_COLORS[threads.length % THREAD_COLORS.length], description: newDesc.trim(), scenes: [], status: 'active', importance: 'major' });
        setNewName(''); setNewDesc(''); setShowAddForm(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">Thread Tracker</h3>
                    <span className="text-[9px] text-text-secondary bg-white/[0.04] px-1.5 py-0.5 rounded">{threads.length}</span>
                </div>
                <div className="flex gap-1.5">
                    <button onClick={handleAutoDetect} disabled={detecting}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50">
                        {detecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Auto-Detect
                    </button>
                    <button onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-1 px-2 py-1.5 text-[10px] bg-white/[0.04] border border-white/[0.08] rounded text-text-secondary hover:text-white transition-colors">
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="bg-white/[0.03] border border-blue-500/20 rounded p-3 space-y-2 overflow-hidden">
                        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Thread name..."
                            className="w-full bg-void-black border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-white placeholder:text-text-secondary focus:border-blue-500/40 focus:outline-none" />
                        <select value={newType} onChange={e => setNewType(e.target.value as ThreadType)}
                            className="w-full bg-void-black border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-white focus:border-blue-500/40 focus:outline-none">
                            {(Object.entries(THREAD_TYPE_LABELS) as [ThreadType, string][]).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description..."
                            className="w-full bg-void-black border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-white placeholder:text-text-secondary focus:border-blue-500/40 focus:outline-none resize-none" rows={2} />
                        <button onClick={handleAddThread}
                            className="w-full px-3 py-1.5 text-xs bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 hover:bg-blue-500/20 transition-colors font-medium">
                            Add Thread
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subway Map */}
            {threads.length > 0 && (
                <div className="relative">
                    <div className="flex gap-0.5 mb-2 px-24">
                        {chapters.slice(0, 15).map((_, i) => (
                            <div key={i} className="flex-1 text-center"><span className="text-[7px] text-text-secondary">{i + 1}</span></div>
                        ))}
                    </div>
                    {threads.map(thread => {
                        const chapterIds = new Set(thread.scenes.map(s => s.chapterId));
                        return (
                            <div key={thread.id} className="flex items-center gap-0.5 mb-1">
                                <span className="text-[8px] w-20 truncate text-right pr-2 shrink-0" style={{ color: thread.color }}>{thread.name}</span>
                                <div className="w-3 shrink-0"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: thread.color }} /></div>
                                <div className="flex gap-0.5 flex-1">
                                    {chapters.slice(0, 15).map(ch => {
                                        const present = chapterIds.has(ch.id);
                                        return (
                                            <div key={ch.id} className="flex-1 flex justify-center">
                                                {present
                                                    ? <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: thread.color, backgroundColor: thread.color + '40' }} />
                                                    : <div className="w-px h-2.5" style={{ backgroundColor: thread.color + '20' }} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Thread List */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {threads.map(thread => {
                    const isExpanded = expandedThread === thread.id;
                    const typeLabel = THREAD_TYPE_LABELS[thread.type];
                    return (
                        <div key={thread.id} className="bg-white/[0.02] border border-white/[0.06] rounded overflow-hidden">
                            <button onClick={() => setExpandedThread(isExpanded ? null : thread.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.03] transition-colors">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: thread.color }} />
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-medium text-white">{thread.name}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[8px] text-text-secondary">{typeLabel}</span>
                                        <span className="text-[8px] text-text-secondary">·</span>
                                        <span className="text-[8px] text-text-secondary">{thread.scenes.length} scenes</span>
                                        <span className={`text-[8px] px-1 py-0.5 rounded ${thread.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : thread.status === 'resolved' ? 'text-blue-400 bg-blue-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                            {thread.status}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); removeThread(thread.id); }} className="text-white/10 hover:text-red-400 transition-colors p-1">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                {isExpanded ? <ChevronUp className="w-3 h-3 text-text-secondary" /> : <ChevronDown className="w-3 h-3 text-text-secondary" />}
                            </button>
                            {isExpanded && (
                                <div className="px-3 pb-3 border-t border-white/[0.04] pt-2 space-y-2">
                                    {thread.description && <p className="text-[10px] text-text-secondary">{thread.description}</p>}
                                    {thread.scenes.length > 0 && (
                                        <div className="space-y-1">
                                            {thread.scenes.map((scene, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${scene.role === 'intro' ? 'bg-emerald-500/10 text-emerald-400' : scene.role === 'climax' ? 'bg-red-500/10 text-red-400' : scene.role === 'resolve' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/[0.04] text-text-secondary'}`}>
                                                        {scene.role}
                                                    </span>
                                                    <span className="text-white/60">{scene.chapterTitle}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {gaps.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-[9px] text-amber-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Thread Gaps
                    </p>
                    {gaps.map((gap, i) => (
                        <div key={i} className="text-[10px] text-amber-400/70 bg-amber-500/5 p-2 rounded border border-amber-500/10">
                            &quot;{gap.threadName}&quot; disappears for {gap.gapLength} chapters
                        </div>
                    ))}
                </div>
            )}

            {threads.length === 0 && !loading && (
                <div className="text-center py-8">
                    <GitBranch className="w-8 h-8 text-blue-400/30 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">No threads yet. Auto-detect from your manuscript or add manually.</p>
                </div>
            )}
        </div>
    );
}
