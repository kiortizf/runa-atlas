import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FileBarChart, Microscope, Scissors, GitBranch, MessageSquare,
    Activity, Columns, Play, Loader2, Download, TrendingUp,
    TrendingDown, AlertTriangle, CheckCircle2, BarChart3
} from 'lucide-react';
import { useNarrativeAnalysis } from '../../hooks/useNarrativeAnalysis';
import { useCompression } from '../../hooks/useCompression';
import { useThreads } from '../../hooks/useThreads';
import { useCuts } from '../../hooks/useCuts';
import { usePacing } from '../../hooks/usePacing';

interface Props {
    manuscriptId?: string;
    chapters: { id: string; title: string; content: string; plainText: string }[];
    totalWords: number;
    targetWords?: number;
}

type HealthGrade = 'excellent' | 'good' | 'needs-work' | 'critical';

interface HealthScore {
    grade: HealthGrade;
    score: number;
    label: string;
    issues: string[];
    strengths: string[];
}

const GRADE_STYLES: Record<HealthGrade, { color: string; bg: string; label: string }> = {
    excellent: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Excellent' },
    good: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', label: 'Good' },
    'needs-work': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Needs Work' },
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Critical' },
};

export default function AnalysisReport({ manuscriptId, chapters, totalWords, targetWords = 80000 }: Props) {
    const { analyses, analyzing: xrayAnalyzing, analyzeChapters, overallStats } = useNarrativeAnalysis(manuscriptId);
    const { suggestions, analyzing: compAnalyzing, analyze: compAnalyze, stats: compStats } = useCompression();
    const { threads, gaps, autoDetect, addThread } = useThreads(manuscriptId);
    const { cuts, stats: cutStats } = useCuts(manuscriptId);
    const { profile, analyzing: pacingAnalyzing, analyze: pacingAnalyze } = usePacing();

    const [running, setRunning] = useState(false);

    // Run all analyses
    const runFullAnalysis = async () => {
        setRunning(true);
        await Promise.all([
            analyzeChapters(chapters),
            compAnalyze(chapters.map(c => ({ id: c.id, title: c.title, plainText: c.plainText }))),
            pacingAnalyze(chapters.map(c => ({ id: c.id, title: c.title, plainText: c.plainText }))),
        ]);
        // Auto-detect threads
        const detected = autoDetect(chapters.map(c => ({ id: c.id, title: c.title, plainText: c.plainText })));
        for (const t of detected) await addThread(t);
        setRunning(false);
    };

    const isAnalyzing = running || xrayAnalyzing || compAnalyzing || pacingAnalyzing;

    // Compute overall health score
    const healthScore = useMemo((): HealthScore | null => {
        if (!overallStats && !profile && compStats.total === 0) return null;

        let score = 70; // Start at good baseline
        const issues: string[] = [];
        const strengths: string[] = [];

        // Word count health
        const wordPct = totalWords / targetWords;
        if (wordPct > 1.4) {
            score -= 15;
            issues.push(`${Math.round((wordPct - 1) * 100)}% over target word count`);
        } else if (wordPct > 1.2) {
            score -= 8;
            issues.push(`${Math.round((wordPct - 1) * 100)}% over target`);
        } else if (wordPct >= 0.85 && wordPct <= 1.15) {
            score += 10;
            strengths.push('Word count within target range');
        }

        // Narrative density
        if (overallStats) {
            if (overallStats.avgDensity > 0.7) {
                score += 10;
                strengths.push('High narrative density');
            } else if (overallStats.avgDensity < 0.3) {
                score -= 10;
                issues.push('Low narrative density — many paragraphs lack clear purpose');
            }
            if (overallStats.avgRedundancy > 0.3) {
                score -= 10;
                issues.push('High redundancy detected between passages');
            } else if (overallStats.avgRedundancy < 0.1) {
                score += 5;
                strengths.push('Low redundancy');
            }
        }

        // Compression opportunities
        if (compStats.pending > 10) {
            score -= 8;
            issues.push(`${compStats.pending} unresolved compression suggestions`);
        } else if (compStats.pending > 5) {
            score -= 4;
            issues.push(`${compStats.pending} compression suggestions pending`);
        }

        // Thread coverage
        if (gaps.length > 3) {
            score -= 10;
            issues.push(`${gaps.length} narrative thread gaps detected`);
        } else if (gaps.length > 0) {
            score -= 5;
            issues.push(`${gaps.length} thread gap(s) — subplots disappearing for too long`);
        } else if (threads.length > 0) {
            score += 5;
            strengths.push(`${threads.length} threads well-tracked`);
        }

        // Pacing
        if (profile) {
            if (profile.dragZones.length > 3) {
                score -= 12;
                issues.push(`${profile.dragZones.length} pacing drag zones`);
            } else if (profile.dragZones.length > 0) {
                score -= 5;
                issues.push(`${profile.dragZones.length} drag zone(s)`);
            }
            if (profile.avgTension > 40 && profile.avgTension < 70) {
                score += 5;
                strengths.push('Good average tension level');
            }
        }

        // Cuts resolution
        if (cutStats.proposed > 0 && cutStats.accepted === 0) {
            score -= 5;
            issues.push('Editorial cuts pending — no author responses yet');
        }

        score = Math.max(0, Math.min(100, score));

        const grade: HealthGrade =
            score >= 85 ? 'excellent' :
                score >= 65 ? 'good' :
                    score >= 40 ? 'needs-work' : 'critical';

        return { grade, score, label: GRADE_STYLES[grade].label, issues, strengths };
    }, [overallStats, profile, compStats, gaps, threads, cuts, cutStats, totalWords, targetWords]);

    // Word count tracking
    const wordOverage = totalWords - targetWords;
    const wordPct = Math.round((totalWords / targetWords) * 100);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileBarChart className="w-4 h-4 text-starforge-gold" />
                    <h3 className="text-sm font-semibold text-white">Analysis Report</h3>
                </div>
                <button onClick={runFullAnalysis} disabled={isAnalyzing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-starforge-gold/10 border border-starforge-gold/20 rounded text-starforge-gold hover:bg-starforge-gold/20 transition-colors disabled:opacity-50">
                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {isAnalyzing ? 'Running…' : 'Run All Tools'}
                </button>
            </div>

            {/* Health grade */}
            {healthScore && (
                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: GRADE_STYLES[healthScore.grade].bg, border: `1px solid ${GRADE_STYLES[healthScore.grade].color}30` }}>
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold" style={{ color: GRADE_STYLES[healthScore.grade].color }}>
                                Manuscript Health: {healthScore.label}
                            </p>
                            <p className="text-[10px] text-text-secondary mt-0.5">{healthScore.issues.length} issues · {healthScore.strengths.length} strengths</p>
                        </div>
                        <div className="relative w-12 h-12">
                            <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                                <circle cx="24" cy="24" r="20" fill="none"
                                    stroke={GRADE_STYLES[healthScore.grade].color} strokeWidth="4" strokeLinecap="round"
                                    strokeDasharray={`${healthScore.score * 1.256} 999`} />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: GRADE_STYLES[healthScore.grade].color }}>
                                {healthScore.score}
                            </span>
                        </div>
                    </div>
                    {healthScore.issues.length > 0 && (
                        <div className="px-4 pb-3 space-y-1">
                            {healthScore.issues.map((issue, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-amber-400/80">
                                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {issue}
                                </div>
                            ))}
                        </div>
                    )}
                    {healthScore.strengths.length > 0 && (
                        <div className="px-4 pb-3 space-y-1 border-t border-white/[0.04] pt-2">
                            {healthScore.strengths.map((s, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-emerald-400/80">
                                    <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" /> {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Word Count Tracker */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Word Count</span>
                    <span className={`text-xs font-semibold ${wordOverage > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {totalWords.toLocaleString()} / {targetWords.toLocaleString()}
                    </span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${wordPct > 120 ? 'bg-red-500' : wordPct > 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(wordPct, 150)}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] text-text-secondary">{wordPct}% of target</span>
                    {wordOverage > 0 && (
                        <span className="text-[9px] text-red-400 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> {wordOverage.toLocaleString()} over
                        </span>
                    )}
                    {wordOverage < 0 && (
                        <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> {Math.abs(wordOverage).toLocaleString()} under
                        </span>
                    )}
                </div>
                {compStats.totalWordsSaveable > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                        <span className="text-[9px] text-text-secondary">Potential savings from compression</span>
                        <span className="text-[9px] text-amber-400 font-medium">-{compStats.totalWordsSaveable.toLocaleString()} words</span>
                    </div>
                )}
            </div>

            {/* Tool Summaries */}
            <div className="space-y-2">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Tool Summaries</p>

                {/* Narrative X-Ray */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded">
                    <Microscope className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-white font-medium">Narrative X-Ray</span>
                        {overallStats ? (
                            <p className="text-[9px] text-text-secondary">{overallStats.totalParagraphs} paragraphs · {Math.round(overallStats.avgDensity * 100)}% density · {Math.round(overallStats.avgRedundancy * 100)}% redundancy</p>
                        ) : (
                            <p className="text-[9px] text-text-secondary">Not yet run</p>
                        )}
                    </div>
                </div>

                {/* Compression */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded">
                    <Scissors className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-white font-medium">Compression Engine</span>
                        {compStats.total > 0 ? (
                            <p className="text-[9px] text-text-secondary">{compStats.pending} pending · {compStats.totalWordsSaveable} words saveable · {compStats.byType.redundancy} redundancies</p>
                        ) : (
                            <p className="text-[9px] text-text-secondary">Not yet run</p>
                        )}
                    </div>
                </div>

                {/* Threads */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded">
                    <GitBranch className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-white font-medium">Thread Tracker</span>
                        <p className="text-[9px] text-text-secondary">{threads.length} threads · {gaps.length} gaps detected</p>
                    </div>
                </div>

                {/* Diplomatic Cuts */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-white font-medium">Diplomatic Cuts</span>
                        <p className="text-[9px] text-text-secondary">{cutStats.proposed} proposed · {cutStats.accepted} accepted · {cutStats.overridden} overridden</p>
                    </div>
                </div>

                {/* Pacing */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded">
                    <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-white font-medium">Pacing Analyzer</span>
                        {profile ? (
                            <p className="text-[9px] text-text-secondary">Avg tension {Math.round(profile.avgTension)} · {profile.dragZones.length} drag zones · {profile.overallTempo} tempo</p>
                        ) : (
                            <p className="text-[9px] text-text-secondary">Not yet run</p>
                        )}
                    </div>
                </div>

                {/* Structure */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded">
                    <Columns className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-white font-medium">Structural Architect</span>
                        <p className="text-[9px] text-text-secondary">{chapters.length} chapters · {totalWords.toLocaleString()} total words</p>
                    </div>
                </div>
            </div>

            {!healthScore && !isAnalyzing && (
                <div className="text-center py-6">
                    <FileBarChart className="w-8 h-8 text-starforge-gold/30 mx-auto mb-2" />
                    <p className="text-xs text-text-secondary">Hit "Run All Tools" to generate a full manuscript analysis report.</p>
                </div>
            )}
        </div>
    );
}
