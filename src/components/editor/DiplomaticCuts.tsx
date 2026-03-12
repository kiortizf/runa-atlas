import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Check, Edit3, Shield, ArrowRight, ChevronDown, ChevronUp, Gavel } from 'lucide-react';
import { useCuts, type EditorialCut, type CutCategory } from '../../hooks/useCuts';

interface Props {
    manuscriptId?: string;
    isEditor?: boolean;
    manuscriptTitle?: string;
    authorName?: string;
}

const CAT_STYLES: Record<CutCategory, { label: string; color: string; bg: string }> = {
    keep: { label: 'KEEP', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    compress: { label: 'COMPRESS', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    archive: { label: 'ARCHIVE', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
};

export default function DiplomaticCuts({ manuscriptId, isEditor, manuscriptTitle, authorName }: Props) {
    const { cuts, loading, authorRespond, editorOverride, archiveCut, stats, byCategory, RATIONALE_LABELS } = useCuts(manuscriptId);
    const [activeTab, setActiveTab] = useState<CutCategory | 'all'>('all');
    const [expandedCut, setExpandedCut] = useState<string | null>(null);
    const [responseNote, setResponseNote] = useState('');
    const [counterText, setCounterText] = useState('');
    const [overrideNote, setOverrideNote] = useState('');

    const displayed = activeTab === 'all' ? cuts : byCategory[activeTab] || [];

    const renderCut = (cut: EditorialCut) => {
        const isExpanded = expandedCut === cut.id;
        const catStyle = CAT_STYLES[cut.category];
        return (
            <div key={cut.id} className="bg-white/[0.02] border border-white/[0.06] rounded overflow-hidden">
                <button onClick={() => setExpandedCut(isExpanded ? null : cut.id)}
                    className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-white/[0.03]">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ color: catStyle.color, backgroundColor: catStyle.bg }}>
                        {catStyle.label}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-text-secondary line-clamp-1">{cut.originalText.substring(0, 100)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] text-text-secondary">{cut.chapterTitle}</span>
                            {cut.authorResponse && (
                                <span className={`text-[8px] px-1.5 py-0.5 rounded ${cut.authorResponse === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' : cut.authorResponse === 'defend' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {cut.authorResponse}
                                </span>
                            )}
                            {cut.editorOverride && <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">overridden</span>}
                        </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-3 h-3 text-text-secondary shrink-0" /> : <ChevronDown className="w-3 h-3 text-text-secondary shrink-0" />}
                </button>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-3 pb-3 border-t border-white/[0.04] pt-2 space-y-3">
                                <div>
                                    <p className="text-[9px] text-text-secondary uppercase mb-1">Original</p>
                                    <p className="text-[10px] text-white/70 bg-red-500/5 p-2 rounded border border-red-500/10 leading-relaxed">{cut.originalText}</p>
                                </div>
                                {cut.proposedText && (
                                    <div>
                                        <p className="text-[9px] text-text-secondary uppercase mb-1">Editor&apos;s Version</p>
                                        <p className="text-[10px] text-white/70 bg-emerald-500/5 p-2 rounded border border-emerald-500/10 leading-relaxed">{cut.proposedText}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[9px] text-text-secondary uppercase mb-1">Rationale</p>
                                    <p className="text-[10px] text-amber-400/80">{RATIONALE_LABELS[cut.rationaleTag]}</p>
                                    <p className="text-[10px] text-text-secondary mt-1">{cut.rationale}</p>
                                </div>
                                {cut.authorNote && (
                                    <div className="bg-blue-500/5 p-2 rounded border border-blue-500/10">
                                        <p className="text-[9px] text-blue-400 uppercase mb-0.5">Author&apos;s Response</p>
                                        <p className="text-[10px] text-white/70">{cut.authorNote}</p>
                                    </div>
                                )}
                                {cut.editorOverrideNote && (
                                    <div className="bg-red-500/5 p-2 rounded border border-red-500/10">
                                        <p className="text-[9px] text-red-400 uppercase mb-0.5">Editor Override</p>
                                        <p className="text-[10px] text-white/70">{cut.editorOverrideNote}</p>
                                    </div>
                                )}
                                {!isEditor && cut.status === 'proposed' && !cut.authorResponse && (
                                    <div className="space-y-2">
                                        <textarea value={responseNote} onChange={e => setResponseNote(e.target.value)} placeholder="Your response..."
                                            className="w-full bg-void-black border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-white placeholder:text-text-secondary focus:outline-none resize-none" rows={2} />
                                        <div className="grid grid-cols-4 gap-1.5">
                                            <button onClick={() => { authorRespond(cut.id, 'accepted', responseNote); setResponseNote(''); }}
                                                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 hover:bg-emerald-500/20"><Check className="w-3 h-3" />Accept</button>
                                            <button onClick={() => { authorRespond(cut.id, 'counter', responseNote, counterText); setResponseNote(''); setCounterText(''); }}
                                                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 hover:bg-blue-500/20"><Edit3 className="w-3 h-3" />Counter</button>
                                            <button onClick={() => { authorRespond(cut.id, 'defend', responseNote); setResponseNote(''); }}
                                                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 hover:bg-amber-500/20"><Shield className="w-3 h-3" />Defend</button>
                                            <button onClick={() => { authorRespond(cut.id, 'relocate', responseNote); setResponseNote(''); }}
                                                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[9px] bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 hover:bg-purple-500/20"><ArrowRight className="w-3 h-3" />Move</button>
                                        </div>
                                    </div>
                                )}
                                {isEditor && cut.authorResponse === 'defend' && !cut.editorOverride && (
                                    <div className="space-y-2">
                                        <textarea value={overrideNote} onChange={e => setOverrideNote(e.target.value)} placeholder="Override rationale..."
                                            className="w-full bg-void-black border border-white/[0.08] rounded px-2.5 py-1.5 text-xs text-white placeholder:text-text-secondary focus:outline-none resize-none" rows={2} />
                                        <div className="flex gap-2">
                                            <button onClick={() => { authorRespond(cut.id, 'accepted'); }}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 hover:bg-emerald-500/20">
                                                <Check className="w-3 h-3" /> Accept Defense</button>
                                            <button onClick={() => { editorOverride(cut.id, overrideNote); setOverrideNote(''); archiveCut(cut.id, manuscriptTitle || '', authorName || ''); }}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20">
                                                <Gavel className="w-3 h-3" /> Override &amp; Archive</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Diplomatic Cuts</h3>
                </div>
                <div className="flex gap-1 text-[8px]">
                    <span className="px-1.5 py-0.5 bg-white/[0.04] rounded text-text-secondary">{stats.proposed} pending</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 rounded text-emerald-400">{stats.accepted} accepted</span>
                    {stats.wordsToRemove > 0 && <span className="px-1.5 py-0.5 bg-amber-500/10 rounded text-amber-400">-{stats.wordsToRemove}w</span>}
                </div>
            </div>
            <div className="flex gap-1">
                {(['all', 'keep', 'compress', 'archive'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-2.5 py-1 rounded text-[9px] font-medium transition-colors ${activeTab === tab ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.03] text-text-secondary hover:text-white'}`}>
                        {tab === 'all' ? `All (${cuts.length})` : `${CAT_STYLES[tab].label} (${byCategory[tab]?.length || 0})`}
                    </button>
                ))}
            </div>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {displayed.map(cut => renderCut(cut))}
            </div>
            {cuts.length === 0 && !loading && (
                <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-emerald-400/30 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">{isEditor ? 'No cuts proposed yet. Use the Compression Engine to generate suggestions.' : 'No editorial cuts pending. Check back after your editor reviews the manuscript.'}</p>
                </div>
            )}
        </div>
    );
}
