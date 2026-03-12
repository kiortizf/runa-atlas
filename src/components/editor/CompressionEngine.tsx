import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Play, Check, X, Edit3, Send, AlertTriangle, BarChart3, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCompression, type CompressionSuggestion } from '../../hooks/useCompression';

interface Props {
    chapters: { id: string; title: string; plainText: string }[];
    onCreateCut?: (suggestion: CompressionSuggestion) => void;
}

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
    redundancy: { label: 'Redundancy', color: '#ef4444', icon: '🔁' },
    tightening: { label: 'Tightening', color: '#f59e0b', icon: '✏️' },
    'scene-level': { label: 'Scene Issue', color: '#8b5cf6', icon: '📐' },
};

export default function CompressionEngine({ chapters, onCreateCut }: Props) {
    const { suggestions, analyzing, analyze, updateStatus, stats } = useCompression();
    const [filterType, setFilterType] = useState<'all' | 'redundancy' | 'tightening' | 'scene-level'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let items = suggestions.filter(s => s.status === 'pending');
        if (filterType !== 'all') items = items.filter(s => s.type === filterType);
        return items;
    }, [suggestions, filterType]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">Compression Engine</h3>
                </div>
                <button
                    onClick={() => analyze(chapters)}
                    disabled={analyzing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                    {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {analyzing ? 'Analyzing...' : 'Scan'}
                </button>
            </div>

            {/* Stats */}
            {stats.total > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                        <p className="text-lg font-semibold text-white">{stats.pending}</p>
                        <p className="text-[9px] text-text-secondary uppercase">Pending</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                        <p className="text-lg font-semibold text-amber-400">{stats.totalWordsSaveable.toLocaleString()}</p>
                        <p className="text-[9px] text-text-secondary uppercase">Words Saveable</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                        <div className="flex justify-center gap-1 mt-0.5">
                            <span className="text-[8px] px-1 py-0.5 bg-red-500/10 text-red-400 rounded">{stats.byType.redundancy}</span>
                            <span className="text-[8px] px-1 py-0.5 bg-amber-500/10 text-amber-400 rounded">{stats.byType.tightening}</span>
                            <span className="text-[8px] px-1 py-0.5 bg-purple-500/10 text-purple-400 rounded">{stats.byType.sceneLevel}</span>
                        </div>
                        <p className="text-[9px] text-text-secondary uppercase mt-1">By Type</p>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-1">
                {(['all', 'redundancy', 'tightening', 'scene-level'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${filterType === type ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.03] text-text-secondary hover:text-white'}`}
                    >
                        {type === 'all' ? 'All' : TYPE_LABELS[type]?.label}
                    </button>
                ))}
            </div>

            {/* Suggestions */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filtered.map(s => {
                    const typeInfo = TYPE_LABELS[s.type];
                    const isExpanded = expandedId === s.id;
                    return (
                        <div key={s.id} className="bg-white/[0.02] border border-white/[0.06] rounded overflow-hidden">
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
                            >
                                <span className="text-sm mt-0.5">{typeInfo?.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: typeInfo?.color }}>{typeInfo?.label}</span>
                                        <span className="text-[8px] text-text-secondary">in {s.chapterTitle}</span>
                                    </div>
                                    <p className="text-[10px] text-text-secondary line-clamp-1">{s.reason}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {s.wordsSaved > 0 && (
                                        <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">-{s.wordsSaved}w</span>
                                    )}
                                    <div className="flex items-center gap-0.5">
                                        <BarChart3 className="w-2.5 h-2.5 text-text-secondary" />
                                        <span className="text-[9px] text-text-secondary">{s.impactScore.overall}/10</span>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-3 h-3 text-text-secondary" /> : <ChevronDown className="w-3 h-3 text-text-secondary" />}
                                </div>
                            </button>

                            {isExpanded && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-white/[0.04] overflow-hidden">
                                    <div className="px-3 py-3 space-y-3">
                                        {/* Original text */}
                                        <div>
                                            <p className="text-[9px] text-text-secondary uppercase tracking-wider mb-1">Original</p>
                                            <p className="text-[10px] text-white/70 leading-relaxed bg-red-500/5 p-2 rounded border border-red-500/10">{s.originalText.substring(0, 300)}{s.originalText.length > 300 ? '...' : ''}</p>
                                        </div>

                                        {/* Reason */}
                                        <div>
                                            <p className="text-[9px] text-text-secondary uppercase tracking-wider mb-1">Reason</p>
                                            <p className="text-[10px] text-amber-400/80">{s.reason}</p>
                                        </div>

                                        {/* Impact scores */}
                                        <div className="grid grid-cols-5 gap-1">
                                            {(['plot', 'character', 'worldbuilding', 'emotion', 'pacing'] as const).map(key => (
                                                <div key={key} className="text-center">
                                                    <div className={`text-xs font-semibold ${s.impactScore[key] > 6 ? 'text-red-400' : s.impactScore[key] > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                        {s.impactScore[key]}
                                                    </div>
                                                    <p className="text-[7px] text-text-secondary uppercase">{key}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateStatus(s.id, 'accepted')}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                            >
                                                <Check className="w-3 h-3" /> Accept
                                            </button>
                                            <button
                                                onClick={() => updateStatus(s.id, 'rejected')}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                                            >
                                                <X className="w-3 h-3" /> Dismiss
                                            </button>
                                            {onCreateCut && (
                                                <button
                                                    onClick={() => onCreateCut(s)}
                                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 hover:bg-purple-500/20 transition-colors"
                                                >
                                                    <Send className="w-3 h-3" /> Send to Author
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            {stats.total === 0 && !analyzing && (
                <div className="text-center py-8">
                    <Scissors className="w-8 h-8 text-amber-400/30 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">Scan the manuscript to find compression opportunities.</p>
                </div>
            )}
        </div>
    );
}
