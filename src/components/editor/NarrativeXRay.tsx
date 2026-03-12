import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, Play, Filter, ChevronDown, ChevronUp, Link2, AlertTriangle, BarChart3, Loader2 } from 'lucide-react';
import { useNarrativeAnalysis, NARRATIVE_TAGS, type ChapterAnalysis, type NarrativeTagId } from '../../hooks/useNarrativeAnalysis';

interface Props {
    manuscriptId?: string;
    chapters: { id: string; title: string; content: string; plainText: string }[];
    onHighlightParagraph?: (chapterId: string, paragraphIndex: number) => void;
}

export default function NarrativeXRay({ manuscriptId, chapters, onHighlightParagraph }: Props) {
    const { analyses, analyzing, progress, analyzeChapters, overallStats } = useNarrativeAnalysis(manuscriptId);
    const [selectedTag, setSelectedTag] = useState<NarrativeTagId | 'all'>('all');
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
    const [showDeps, setShowDeps] = useState(false);

    const filteredAnalyses = useMemo(() => {
        const result: Record<string, ChapterAnalysis> = {};
        Object.entries(analyses).forEach(([chId, analysis]) => {
            if (selectedTag === 'all') {
                result[chId] = analysis;
            } else {
                result[chId] = {
                    ...analysis,
                    paragraphs: analysis.paragraphs.filter(p => p.tags.includes(selectedTag)),
                };
            }
        });
        return result;
    }, [analyses, selectedTag]);

    const tagForId = (id: string) => NARRATIVE_TAGS.find(t => t.id === id);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-white">Narrative X-Ray</h3>
                </div>
                <button
                    onClick={() => analyzeChapters(chapters)}
                    disabled={analyzing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                >
                    {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {analyzing ? `Analyzing... ${progress}%` : 'Run Analysis'}
                </button>
            </div>

            {/* Progress bar */}
            {analyzing && (
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Overall Stats */}
            {overallStats && (
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                        <p className="text-lg font-semibold text-white">{overallStats.totalParagraphs}</p>
                        <p className="text-[9px] text-text-secondary uppercase tracking-wider">Paragraphs</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                        <p className="text-lg font-semibold text-purple-400">{Math.round(overallStats.avgDensity * 100)}%</p>
                        <p className="text-[9px] text-text-secondary uppercase tracking-wider">Density</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                        <p className="text-lg font-semibold text-amber-400">{Math.round(overallStats.avgRedundancy * 100)}%</p>
                        <p className="text-[9px] text-text-secondary uppercase tracking-wider">Redundancy</p>
                    </div>
                </div>
            )}

            {/* Tag Distribution */}
            {overallStats && (
                <div className="space-y-1.5">
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Tag Distribution</p>
                    {Object.entries(overallStats.tagDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([tag, count]) => {
                            const tagDef = tagForId(tag);
                            if (!tagDef) return null;
                            const pct = Math.round((count / overallStats.totalParagraphs) * 100);
                            return (
                                <div key={tag} className="flex items-center gap-2">
                                    <span className="text-[10px] w-24 truncate" style={{ color: tagDef.color }}>{tagDef.label}</span>
                                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: tagDef.color }} />
                                    </div>
                                    <span className="text-[9px] text-text-secondary w-6 text-right">{count}</span>
                                </div>
                            );
                        })}
                </div>
            )}

            {/* Tag Filter */}
            <div className="flex flex-wrap gap-1">
                <button
                    onClick={() => setSelectedTag('all')}
                    className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${selectedTag === 'all' ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-text-secondary hover:text-white'}`}
                >
                    All
                </button>
                {NARRATIVE_TAGS.map(tag => (
                    <button
                        key={tag.id}
                        onClick={() => setSelectedTag(tag.id)}
                        className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${selectedTag === tag.id ? 'text-white' : 'text-text-secondary hover:text-white'}`}
                        style={selectedTag === tag.id ? { backgroundColor: tag.bg, color: tag.color } : {}}
                    >
                        {tag.label.split(' ')[0]}
                    </button>
                ))}
            </div>

            {/* Chapter-by-chapter results */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {chapters.map(ch => {
                    const analysis = filteredAnalyses[ch.id];
                    if (!analysis || analysis.paragraphs.length === 0) return null;
                    const isExpanded = expandedChapter === ch.id;

                    return (
                        <div key={ch.id} className="bg-white/[0.02] border border-white/[0.06] rounded overflow-hidden">
                            <button
                                onClick={() => setExpandedChapter(isExpanded ? null : ch.id)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.03] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-white">{ch.title}</span>
                                    <span className="text-[9px] text-text-secondary">{analysis.paragraphs.length} passages</span>
                                </div>
                                {/* Mini heatmap */}
                                <div className="flex gap-px">
                                    {analysis.paragraphs.slice(0, 20).map((p, i) => {
                                        const primaryTag = tagForId(p.tags[0]);
                                        return (
                                            <div
                                                key={i}
                                                className="w-1.5 h-3 rounded-sm"
                                                style={{ backgroundColor: primaryTag?.color || '#333', opacity: p.confidence }}
                                                title={`${primaryTag?.label || 'Unknown'} (${Math.round(p.confidence * 100)}%)`}
                                            />
                                        );
                                    })}
                                </div>
                                {isExpanded ? <ChevronUp className="w-3 h-3 text-text-secondary" /> : <ChevronDown className="w-3 h-3 text-text-secondary" />}
                            </button>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-3 pb-3 space-y-2 border-t border-white/[0.04]">
                                            {analysis.paragraphs.map((para) => (
                                                <div
                                                    key={para.index}
                                                    className="p-2 rounded bg-white/[0.02] border border-white/[0.04] cursor-pointer hover:border-purple-500/30 transition-colors"
                                                    onClick={() => onHighlightParagraph?.(ch.id, para.index)}
                                                >
                                                    <p className="text-[10px] text-text-secondary line-clamp-2 mb-1.5">{para.text.substring(0, 120)}...</p>
                                                    <div className="flex items-center gap-1 flex-wrap">
                                                        {para.tags.map(tag => {
                                                            const t = tagForId(tag);
                                                            return t ? (
                                                                <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full border font-medium" style={{ color: t.color, backgroundColor: t.bg, borderColor: t.color + '30' }}>
                                                                    {t.label}
                                                                </span>
                                                            ) : null;
                                                        })}
                                                        <span className="text-[8px] text-text-secondary ml-auto">{Math.round(para.confidence * 100)}% conf</span>
                                                    </div>
                                                    {para.dependencies.length > 0 && (
                                                        <div className="mt-1.5 pt-1.5 border-t border-white/[0.04]">
                                                            {para.dependencies.map((dep, i) => (
                                                                <div key={i} className="flex items-center gap-1 text-[9px] text-amber-400">
                                                                    <Link2 className="w-2.5 h-2.5" />
                                                                    <span>{dep.description}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {Object.keys(analyses).length === 0 && !analyzing && (
                <div className="text-center py-8">
                    <Microscope className="w-8 h-8 text-purple-400/30 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">Run analysis to see narrative function tags for every paragraph.</p>
                </div>
            )}
        </div>
    );
}
