import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Play, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';
import { usePacing, type SceneTempo } from '../../hooks/usePacing';

interface Props {
    chapters: { id: string; title: string; plainText: string }[];
}

const TEMPO_STYLES: Record<SceneTempo, { label: string; color: string; icon: string }> = {
    fast: { label: 'Fast', color: '#ef4444', icon: '⚡' },
    moderate: { label: 'Moderate', color: '#f59e0b', icon: '🔄' },
    slow: { label: 'Slow', color: '#3b82f6', icon: '🌊' },
    reflective: { label: 'Reflective', color: '#8b5cf6', icon: '💭' },
};

export default function PacingAnalyzer({ chapters }: Props) {
    const { profile, analyzing, analyze, selectedGenre, setSelectedGenre, genreBenchmark, availableGenres } = usePacing();
    const [showGenre, setShowGenre] = useState(false);

    // SVG dimensions for tension curve
    const W = 440, H = 120, PAD = 20;

    const tensionToY = (t: number) => PAD + ((100 - t) / 100) * (H - 2 * PAD);
    const idxToX = (i: number, total: number) => PAD + (i / Math.max(1, total - 1)) * (W - 2 * PAD);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">Pacing Analyzer</h3>
                </div>
                <button onClick={() => analyze(chapters)} disabled={analyzing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50">
                    {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {analyzing ? 'Analyzing...' : 'Analyze Pacing'}
                </button>
            </div>

            {profile && (
                <>
                    {/* Overview stats */}
                    <div className="grid grid-cols-4 gap-2">
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                            <p className="text-lg font-semibold text-cyan-400">{Math.round(profile.avgTension)}</p>
                            <p className="text-[9px] text-text-secondary uppercase">Avg Tension</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                            <p className="text-sm font-semibold" style={{ color: TEMPO_STYLES[profile.overallTempo].color }}>
                                {TEMPO_STYLES[profile.overallTempo].icon} {TEMPO_STYLES[profile.overallTempo].label}
                            </p>
                            <p className="text-[9px] text-text-secondary uppercase">Overall</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                            <p className="text-sm font-semibold text-emerald-400">Ch. {profile.peakChapter + 1}</p>
                            <p className="text-[9px] text-text-secondary uppercase">Peak</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded p-2 text-center">
                            <p className="text-sm font-semibold text-red-400">{profile.dragZones.length}</p>
                            <p className="text-[9px] text-text-secondary uppercase">Drag Zones</p>
                        </div>
                    </div>

                    {/* Genre benchmark selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-text-secondary">Benchmark:</span>
                        <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}
                            className="bg-void-black border border-white/[0.08] rounded px-2 py-1 text-[10px] text-white focus:outline-none">
                            {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    {/* Tension curve SVG */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded p-2 overflow-x-auto">
                        <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`}>
                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map(v => (
                                <g key={v}>
                                    <line x1={PAD} y1={tensionToY(v)} x2={W - PAD} y2={tensionToY(v)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2,4" />
                                    <text x={PAD - 4} y={tensionToY(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="7">{v}</text>
                                </g>
                            ))}

                            {/* Drag zones (red bands) */}
                            {profile.dragZones.map((dz, i) => (
                                <rect key={i}
                                    x={idxToX(dz.startChapter, profile.tensionCurve.length) - 4}
                                    y={PAD}
                                    width={idxToX(dz.endChapter, profile.tensionCurve.length) - idxToX(dz.startChapter, profile.tensionCurve.length) + 8}
                                    height={H - 2 * PAD}
                                    fill={dz.severity === 'severe' ? 'rgba(239,68,68,0.12)' : dz.severity === 'moderate' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.04)'}
                                    rx={4}
                                />
                            ))}

                            {/* Genre benchmark (dashed) */}
                            {genreBenchmark.length > 0 && (
                                <polyline
                                    fill="none"
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth="1"
                                    strokeDasharray="4,3"
                                    points={genreBenchmark.map((v, i) => {
                                        const x = idxToX(i * (profile.tensionCurve.length - 1) / Math.max(1, genreBenchmark.length - 1), profile.tensionCurve.length);
                                        return `${x},${tensionToY(v)}`;
                                    }).join(' ')}
                                />
                            )}

                            {/* Actual tension curve */}
                            <polyline
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="2"
                                strokeLinejoin="round"
                                points={profile.tensionCurve.map((v, i) => `${idxToX(i, profile.tensionCurve.length)},${tensionToY(v)}`).join(' ')}
                            />

                            {/* Data points */}
                            {profile.tensionCurve.map((v, i) => (
                                <circle key={i}
                                    cx={idxToX(i, profile.tensionCurve.length)}
                                    cy={tensionToY(v)}
                                    r={3} fill="#06b6d4" stroke="#0e1116" strokeWidth="1.5" />
                            ))}

                            {/* Chapter labels */}
                            {profile.tensionCurve.map((_, i) => (
                                <text key={i} x={idxToX(i, profile.tensionCurve.length)} y={H - 4}
                                    textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7">{i + 1}</text>
                            ))}
                        </svg>
                        <div className="flex items-center gap-4 mt-1 px-2">
                            <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-cyan-400 rounded" /><span className="text-[8px] text-text-secondary">Tension</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-0.5 border-t border-dashed border-white/20" /><span className="text-[8px] text-text-secondary">{selectedGenre}</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-2 bg-red-500/10 rounded" /><span className="text-[8px] text-text-secondary">Drag Zone</span></div>
                        </div>
                    </div>

                    {/* Chapter cards */}
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {profile.chapters.map(ch => {
                            const style = TEMPO_STYLES[ch.tempo];
                            return (
                                <div key={ch.chapterId} className="flex items-center gap-2 px-2 py-1.5 bg-white/[0.02] border border-white/[0.04] rounded">
                                    <span className="text-[9px] text-text-secondary w-14 shrink-0 truncate">{ch.chapterTitle}</span>
                                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${ch.tensionScore}%`, backgroundColor: style.color }} />
                                    </div>
                                    <span className="text-[8px] shrink-0" style={{ color: style.color }}>{style.icon} {ch.tensionScore}</span>
                                    <span className="text-[8px] text-text-secondary shrink-0">{ch.readingMinutes}m</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Drag zone warnings */}
                    {profile.dragZones.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[9px] text-red-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Drag Zones
                            </p>
                            {profile.dragZones.map((dz, i) => (
                                <div key={i} className={`text-[10px] p-2 rounded border ${dz.severity === 'severe' ? 'bg-red-500/5 border-red-500/10 text-red-400/80' : dz.severity === 'moderate' ? 'bg-amber-500/5 border-amber-500/10 text-amber-400/80' : 'bg-white/[0.02] border-white/[0.04] text-text-secondary'}`}>
                                    <span className="font-medium">Ch. {dz.startChapter + 1}–{dz.endChapter + 1}</span>: {dz.suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {!profile && !analyzing && (
                <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-cyan-400/30 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">Analyze pacing to see tension curves and identify drag zones.</p>
                </div>
            )}
        </div>
    );
}
