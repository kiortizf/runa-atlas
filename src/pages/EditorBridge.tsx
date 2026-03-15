import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Users, MessageCircle, CheckCircle2, Eye, Edit3,
    ChevronDown, ArrowRight, AlertCircle, Star, Target, Zap,
    BookOpen, Filter, Download, ExternalLink, Layers, Shield,
    GitMerge, BarChart3, Send, ChevronRight, Check, X
} from 'lucide-react';

// ═══════════════════════════════════════════════
// EDITOR FEEDBACK BRIDGE — View & Import Beta Reader Consensus
// ═══════════════════════════════════════════════

interface BetaNote {
    id: string;
    reader: string;
    readerTier: string;
    chapter: number;
    chapterTitle: string;
    category: 'character' | 'pacing' | 'plot' | 'prose' | 'worldbuilding' | 'overall';
    text: string;
    timestamp: string;
    imported: boolean;
    highlighted: boolean;
    agreement: number; // how many readers agree
}

interface ConsensusItem {
    chapter: number;
    chapterTitle: string;
    total: number;
    flagged: boolean;
    topIssue: string;
    category: string;
    agreementPct: number;
}

const CATEGORY_COLORS: Record<string, string> = {
    character: '#8b5cf6',
    pacing: '#3b82f6',
    plot: '#ef4444',
    prose: '#10b981',
    worldbuilding: '#f97316',
    overall: '#f59e0b',
};

const CATEGORY_ICONS: Record<string, any> = {
    character: Users,
    pacing: Zap,
    plot: Target,
    prose: Edit3,
    worldbuilding: Layers,
    overall: Star,
};

export default function EditorBridge() {
    const [viewTab, setViewTab] = useState<'consensus' | 'notes' | 'import_log'>('consensus');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [importedNotes, setImportedNotes] = useState<Set<string>>(new Set());
    const [expandedConsensus, setExpandedConsensus] = useState<number | null>(null);
    const [notes, setNotes] = useState<BetaNote[]>([]);
    const [consensus, setConsensus] = useState<ConsensusItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (u) => {
            if (!u) { setLoading(false); return; }
            const unsub = onSnapshot(
                query(collection(db, 'editor_feedback'), where('authorId', '==', u.uid)),
                (snap) => {
                    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setNotes(data.filter((d: any) => d.type === 'note') as any as BetaNote[]);
                    setConsensus(data.filter((d: any) => d.type === 'consensus') as any as ConsensusItem[]);
                    setLoading(false);
                },
                () => setLoading(false)
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const handleImport = (id: string) => {
        setImportedNotes(prev => { const n = new Set(prev); n.add(id); return n; });
    };

    const filteredNotes = filterCategory === 'all' ? notes : notes.filter(n => n.category === filterCategory);
    const importedCount = notes.filter(n => importedNotes.has(n.id)).length;

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <GitMerge className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">Editor Feedback Bridge</h1>
                                <p className="text-xs text-text-secondary">
                                    <span className="text-white/70">Wrath & Reverie</span> · Beta feedback from 5 readers · {importedCount}/{notes.length} notes imported to editorial
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary">{importedCount} imported</span>
                            <button onClick={() => alert(`${importedCount} notes exported to editor workflow!`)} className="px-4 py-2 bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20 rounded hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5" /> Export to Editor
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {[
                            { id: 'consensus' as const, label: 'Chapter Consensus', icon: BarChart3 },
                            { id: 'notes' as const, label: 'Individual Notes', icon: MessageCircle, count: notes.length },
                            { id: 'import_log' as const, label: 'Import Log', icon: Download, count: importedCount },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setViewTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 text-sm border-b-2 transition-colors
                                    ${viewTab === tab.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-text-secondary hover:text-white'}`}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] rounded-full">{tab.count}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {/* ═══ CHAPTER consensus ═══ */}
                    {viewTab === 'consensus' && (
                        <motion.div key="consensus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="mb-4">
                                <p className="text-xs text-text-secondary">Chapters sorted by feedback volume and consensus. Flagged issues need editor attention.</p>
                            </div>
                            <div className="space-y-2">
                                {consensus.sort((a, b) => b.total - a.total).map((item, idx) => {
                                    const CategoryIcon = CATEGORY_ICONS[item.category] || Star;
                                    const color = CATEGORY_COLORS[item.category] || '#6b7280';
                                    const chapterNotes = notes.filter(n => n.chapter === item.chapter);
                                    return (
                                        <motion.div key={item.chapter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.06 }}
                                            className={`border rounded-xl overflow-hidden transition-all
                                                ${expandedConsensus === item.chapter ? 'bg-white/[0.03] border-cyan-400/20' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                                            <button onClick={() => setExpandedConsensus(expandedConsensus === item.chapter ? null : item.chapter)}
                                                className="w-full text-left p-4 flex items-center gap-3">
                                                <span className="text-xs font-mono text-text-secondary w-8">Ch.{item.chapter}</span>
                                                <span className="text-sm text-white flex-1">{item.chapterTitle}</span>
                                                {item.flagged && <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-none" />}
                                                <div className="flex items-center gap-2 flex-none">
                                                    <CategoryIcon className="w-3 h-3" style={{ color }} />
                                                    <span className="text-[10px]" style={{ color }}>{item.topIssue}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-none w-20">
                                                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${item.agreementPct}%`, backgroundColor: item.agreementPct >= 80 ? '#22c55e' : item.agreementPct >= 40 ? '#f59e0b' : '#ef4444' }} />
                                                    </div>
                                                    <span className="text-[9px] text-text-secondary">{item.agreementPct}%</span>
                                                </div>
                                                <span className="text-[10px] text-text-secondary flex-none">{item.total} notes</span>
                                                <ChevronDown className={`w-3.5 h-3.5 text-white/20 flex-none transition-transform ${expandedConsensus === item.chapter ? 'rotate-180' : ''}`} />
                                            </button>
                                            <AnimatePresence>
                                                {expandedConsensus === item.chapter && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04] space-y-2">
                                                            {chapterNotes.map(note => {
                                                                const NoteIcon = CATEGORY_ICONS[note.category] || Star;
                                                                const noteColor = CATEGORY_COLORS[note.category];
                                                                const isImported = importedNotes.has(note.id);
                                                                return (
                                                                    <div key={note.id} className={`p-3 rounded-lg border ${isImported ? 'bg-cyan-500/[0.03] border-cyan-500/10' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                                                                        <div className="flex items-center gap-2 mb-1.5">
                                                                            <NoteIcon className="w-3 h-3" style={{ color: noteColor }} />
                                                                            <span className="text-[10px] font-semibold capitalize" style={{ color: noteColor }}>{note.category}</span>
                                                                            <span className="text-[9px] text-text-secondary">by {note.reader}</span>
                                                                            <span className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] rounded border border-white/[0.06] text-text-secondary">{note.readerTier}</span>
                                                                            {note.agreement >= 3 && <span className="text-[9px] text-amber-400">🔥 {note.agreement}/5 agree</span>}
                                                                            <span className="text-[9px] text-text-secondary ml-auto">{note.timestamp}</span>
                                                                        </div>
                                                                        <p className="text-xs text-white/70 leading-relaxed mb-2 pl-5">{note.text}</p>
                                                                        <div className="flex items-center gap-2 pl-5">
                                                                            {isImported ? (
                                                                                <span className="text-[9px] text-cyan-400 flex items-center gap-1">
                                                                                    <Check className="w-3 h-3" /> Imported to Editor
                                                                                </span>
                                                                            ) : (
                                                                                <button onClick={() => handleImport(note.id)}
                                                                                    className="text-[10px] px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded hover:bg-cyan-500/20 transition-colors flex items-center gap-1">
                                                                                    <Download className="w-3 h-3" /> Import to Editor
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
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

                    {/* ═══ INDIVIDUAL NOTES ═══ */}
                    {viewTab === 'notes' && (
                        <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex items-center gap-3 mb-6">
                                <Filter className="w-4 h-4 text-text-secondary" />
                                <button onClick={() => setFilterCategory('all')}
                                    className={`text-xs px-3 py-1.5 rounded border ${filterCategory === 'all' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>All</button>
                                {Object.keys(CATEGORY_COLORS).map(cat => (
                                    <button key={cat} onClick={() => setFilterCategory(cat)}
                                        className={`text-xs px-3 py-1.5 rounded border capitalize transition-colors
                                            ${filterCategory === cat ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-white/[0.02] text-text-secondary border-white/[0.06]'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {filteredNotes.map((note, idx) => {
                                    const NoteIcon = CATEGORY_ICONS[note.category] || Star;
                                    const noteColor = CATEGORY_COLORS[note.category];
                                    const isImported = importedNotes.has(note.id);
                                    return (
                                        <motion.div key={note.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`p-4 rounded-xl border transition-all
                                                ${isImported ? 'bg-cyan-500/[0.02] border-cyan-500/10' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <NoteIcon className="w-3.5 h-3.5" style={{ color: noteColor }} />
                                                <span className="text-xs font-semibold capitalize" style={{ color: noteColor }}>{note.category}</span>
                                                <span className="text-[10px] text-text-secondary">Ch. {note.chapter} — {note.chapterTitle}</span>
                                                <span className="text-[9px] text-text-secondary ml-auto">{note.reader} ({note.readerTier}) · {note.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-white/70 leading-relaxed mb-3 pl-5">{note.text}</p>
                                            <div className="flex items-center justify-between pl-5">
                                                <div className="flex items-center gap-2">
                                                    {note.agreement >= 3 && <span className="text-[9px] text-amber-400 flex items-center gap-1">🔥 {note.agreement}/5 readers agree</span>}
                                                    {note.highlighted && <span className="text-[9px] text-emerald-400 flex items-center gap-1">⭐ Key insight</span>}
                                                </div>
                                                {isImported ? (
                                                    <span className="text-[9px] text-cyan-400 flex items-center gap-1"><Check className="w-3 h-3" /> Imported</span>
                                                ) : (
                                                    <button onClick={() => handleImport(note.id)}
                                                        className="text-[10px] px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded hover:bg-cyan-500/20 transition-colors flex items-center gap-1">
                                                        <Download className="w-3 h-3" /> Import to Editor
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ IMPORT LOG ═══ */}
                    {viewTab === 'import_log' && (
                        <motion.div key="import_log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-white mb-1">Imported to Editor</h3>
                                <p className="text-xs text-text-secondary">{importedCount} beta reader notes pulled into the editorial workflow</p>
                            </div>
                            <div className="space-y-2">
                                {notes.filter(n => importedNotes.has(n.id)).map((note, idx) => {
                                    const NoteIcon = CATEGORY_ICONS[note.category] || Star;
                                    const noteColor = CATEGORY_COLORS[note.category];
                                    return (
                                        <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.06 }}
                                            className="p-4 bg-cyan-500/[0.02] border border-cyan-500/10 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Check className="w-3.5 h-3.5 text-cyan-400 flex-none" />
                                                <NoteIcon className="w-3.5 h-3.5" style={{ color: noteColor }} />
                                                <span className="text-xs font-semibold capitalize" style={{ color: noteColor }}>{note.category}</span>
                                                <span className="text-[10px] text-text-secondary">Ch. {note.chapter} — {note.chapterTitle}</span>
                                                <span className="text-[9px] text-text-secondary ml-auto">{note.reader}</span>
                                            </div>
                                            <p className="text-sm text-white/70 leading-relaxed pl-5">{note.text}</p>
                                        </motion.div>
                                    );
                                })}
                                {importedCount === 0 && (
                                    <div className="text-center py-12 text-text-secondary text-sm">No notes imported yet. Go to the Consensus or Notes tab and import key feedback.</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
