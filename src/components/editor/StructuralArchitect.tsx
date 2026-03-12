import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Columns, GripVertical, Split, Clock, Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface Chapter {
    id: string;
    title: string;
    plainText: string;
    wordCount?: number;
}

interface Props {
    chapters: Chapter[];
    onReorderChapters?: (newOrder: string[]) => void;
}

interface SplitPoint {
    afterChapter: number;
    reason: string;
    confidence: number;
}

type ActStructure = '3-act' | '5-act' | 'hero-journey';

const ACT_STRUCTURES: Record<ActStructure, { name: string; acts: { label: string; color: string; pct: [number, number] }[] }> = {
    '3-act': {
        name: 'Three-Act',
        acts: [
            { label: 'Act I — Setup', color: '#3b82f6', pct: [0, 25] },
            { label: 'Act II — Confrontation', color: '#f59e0b', pct: [25, 75] },
            { label: 'Act III — Resolution', color: '#22c55e', pct: [75, 100] },
        ]
    },
    '5-act': {
        name: 'Five-Act',
        acts: [
            { label: 'Exposition', color: '#3b82f6', pct: [0, 15] },
            { label: 'Rising Action', color: '#8b5cf6', pct: [15, 40] },
            { label: 'Climax', color: '#ef4444', pct: [40, 60] },
            { label: 'Falling Action', color: '#f59e0b', pct: [60, 80] },
            { label: 'Dénouement', color: '#22c55e', pct: [80, 100] },
        ]
    },
    'hero-journey': {
        name: "Hero's Journey",
        acts: [
            { label: 'Ordinary World', color: '#6b7280', pct: [0, 10] },
            { label: 'Call to Adventure', color: '#3b82f6', pct: [10, 18] },
            { label: 'Crossing Threshold', color: '#8b5cf6', pct: [18, 30] },
            { label: 'Tests & Allies', color: '#f59e0b', pct: [30, 50] },
            { label: 'Ordeal', color: '#ef4444', pct: [50, 62] },
            { label: 'Reward', color: '#22c55e', pct: [62, 72] },
            { label: 'Road Back', color: '#06b6d4', pct: [72, 85] },
            { label: 'Resurrection', color: '#ec4899', pct: [85, 95] },
            { label: 'Return', color: '#14b8a6', pct: [95, 100] },
        ]
    },
};

export default function StructuralArchitect({ chapters, onReorderChapters }: Props) {
    const [selectedStructure, setSelectedStructure] = useState<ActStructure>('3-act');
    const [sandboxOrder, setSandboxOrder] = useState<string[]>(chapters.map(c => c.id));
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [showSplits, setShowSplits] = useState(true);

    // Calculate word counts
    const chapterData = useMemo(() => {
        return chapters.map(ch => ({
            ...ch,
            wordCount: (ch.plainText || '').split(/\s+/).filter(Boolean).length,
        }));
    }, [chapters]);

    const totalWords = useMemo(() => chapterData.reduce((s, c) => s + c.wordCount, 0), [chapterData]);

    // Detect natural split points for duology/trilogy
    const splitPoints = useMemo((): SplitPoint[] => {
        if (chapters.length < 10) return [];
        const points: SplitPoint[] = [];
        let cumWords = 0;

        for (let i = 0; i < chapters.length - 1; i++) {
            cumWords += chapterData[i].wordCount;
            const pct = cumWords / totalWords;

            // Look for splits near 50% (duology) or 33%/66% (trilogy)
            if (Math.abs(pct - 0.5) < 0.08) {
                points.push({
                    afterChapter: i,
                    reason: `Natural midpoint split (${Math.round(pct * 100)}% of total). Each book ~${Math.round(totalWords / 2).toLocaleString()} words.`,
                    confidence: 1 - Math.abs(pct - 0.5) * 10,
                });
            }
            if (Math.abs(pct - 0.33) < 0.06) {
                points.push({
                    afterChapter: i,
                    reason: `Trilogy split point 1/3 (${Math.round(pct * 100)}%). Book 1 ~${cumWords.toLocaleString()} words.`,
                    confidence: 1 - Math.abs(pct - 0.33) * 12,
                });
            }
            if (Math.abs(pct - 0.66) < 0.06) {
                points.push({
                    afterChapter: i,
                    reason: `Trilogy split point 2/3 (${Math.round(pct * 100)}%). Book 2 ends ~${cumWords.toLocaleString()} words in.`,
                    confidence: 1 - Math.abs(pct - 0.66) * 12,
                });
            }
        }

        return points.sort((a, b) => b.confidence - a.confidence);
    }, [chapters, chapterData, totalWords]);

    // Drag handlers for sandbox reorder
    const handleDragStart = (idx: number) => setDragIdx(idx);
    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) return;
        const newOrder = [...sandboxOrder];
        const [moved] = newOrder.splice(dragIdx, 1);
        newOrder.splice(idx, 0, moved);
        setSandboxOrder(newOrder);
        setDragIdx(idx);
    };
    const handleDragEnd = () => setDragIdx(null);
    const resetOrder = () => setSandboxOrder(chapters.map(c => c.id));

    // Act structure overlay
    const structure = ACT_STRUCTURES[selectedStructure];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Columns className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Structural Architect</h3>
                </div>
            </div>

            {/* Act Structure Overlay */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Act Structure</p>
                    <div className="flex gap-1">
                        {(Object.keys(ACT_STRUCTURES) as ActStructure[]).map(key => (
                            <button key={key} onClick={() => setSelectedStructure(key)}
                                className={`px-2 py-1 rounded text-[9px] font-medium transition-colors ${selectedStructure === key ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.03] text-text-secondary hover:text-white'}`}>
                                {ACT_STRUCTURES[key].name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex h-6 rounded overflow-hidden border border-white/[0.06]">
                    {structure.acts.map((act, i) => (
                        <div key={i} className="relative flex items-center justify-center"
                            style={{ width: `${act.pct[1] - act.pct[0]}%`, backgroundColor: act.color + '20' }}>
                            <span className="text-[7px] font-medium whitespace-nowrap px-1 truncate" style={{ color: act.color }}>{act.label}</span>
                        </div>
                    ))}
                </div>
                {/* Chapter positions on the structure */}
                <div className="flex mt-1">
                    {chapterData.map((ch, i) => {
                        const pct = chapterData.slice(0, i).reduce((s, c) => s + c.wordCount, 0) / Math.max(1, totalWords) * 100;
                        const act = structure.acts.find(a => pct >= a.pct[0] && pct < a.pct[1]);
                        return (
                            <div key={ch.id} className="flex-1 text-center">
                                <div className="w-1.5 h-1.5 rounded-full mx-auto" style={{ backgroundColor: act?.color || '#555' }} />
                                <span className="text-[7px] text-text-secondary">{i + 1}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chapter Reorder Sandbox */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Reorder Sandbox
                    </p>
                    <button onClick={resetOrder} className="text-[9px] text-text-secondary hover:text-white transition-colors">Reset</button>
                </div>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {sandboxOrder.map((chId, idx) => {
                        const ch = chapterData.find(c => c.id === chId);
                        if (!ch) return null;
                        const originalIdx = chapters.findIndex(c => c.id === chId);
                        const moved = originalIdx !== idx;
                        return (
                            <div key={chId}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded border cursor-grab active:cursor-grabbing transition-colors ${moved ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/[0.02] border-white/[0.06]'} ${dragIdx === idx ? 'opacity-50' : ''}`}>
                                <GripVertical className="w-3 h-3 text-text-secondary shrink-0" />
                                <span className="text-[10px] text-text-secondary w-5 shrink-0">{idx + 1}.</span>
                                <span className="text-[10px] text-white flex-1 truncate">{ch.title}</span>
                                <span className="text-[8px] text-text-secondary shrink-0">{ch.wordCount.toLocaleString()}w</span>
                                {moved && <span className="text-[8px] text-indigo-400 shrink-0">←{originalIdx + 1}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Split Detector */}
            {splitPoints.length > 0 && (
                <div>
                    <button onClick={() => setShowSplits(!showSplits)}
                        className="flex items-center gap-1.5 text-[10px] text-text-secondary uppercase tracking-widest font-semibold mb-2 hover:text-white transition-colors">
                        <Split className="w-3 h-3" /> Split Detector
                        {showSplits ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {showSplits && (
                        <div className="space-y-1.5">
                            {splitPoints.map((sp, i) => (
                                <div key={i} className="text-[10px] p-2 rounded bg-indigo-500/5 border border-indigo-500/10">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="font-medium text-indigo-400">After Ch. {sp.afterChapter + 1}: {chapters[sp.afterChapter]?.title}</span>
                                        <span className="text-[8px] text-text-secondary">{Math.round(sp.confidence * 100)}% conf</span>
                                    </div>
                                    <p className="text-text-secondary">{sp.reason}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {chapters.length === 0 && (
                <div className="text-center py-8">
                    <Columns className="w-8 h-8 text-indigo-400/30 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">Add chapters to the Forge to use structural analysis tools.</p>
                </div>
            )}
        </div>
    );
}
