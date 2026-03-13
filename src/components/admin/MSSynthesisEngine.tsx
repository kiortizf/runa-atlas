import { useState, useMemo } from 'react';
import {
  Info, Radar, Shield, AlertTriangle, CheckCircle, TrendingUp,
  Activity, PieChart, Share2, GitBranch, Network, Globe, Calendar,
  Star, Zap, Target, Eye, ArrowRight, Sparkles, BarChart3
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CROSS-SYSTEM SYNTHESIS ENGINE
   ────────────────────────────────────────────────────────────
   Mission control for all intelligence systems. Pulls scores
   from every analytical layer and synthesizes them into a
   single unified verdict with confidence assessment.

   This is THE KEYSTONE — the connective tissue that makes
   all 7 systems more than the sum of their parts.

   NOBODY HAS BUILT A MULTI-SYSTEM SYNTHESIS ENGINE
   FOR PUBLISHING DECISIONS.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

// ═══ THE 7 INTELLIGENCE SYSTEMS ═══
interface SystemScore {
  id: string;
  label: string;
  shortLabel: string;
  icon: any;
  color: string;
  score: number; // 0-100
  confidence: number; // 0-100
  weight: number; // relative weight in composite
  verdict: string;
  keyMetric: string;
  keyMetricValue: string;
  flags: string[];
}

export default function MSSynthesisEngine() {
  // Each system's score can be adjusted by the user (or auto-populated by running each tab)
  const [systemScores, setSystemScores] = useState<SystemScore[]>([
    { id: 'rubric', label: 'Manuscript Rubric', shortLabel: 'Rubric', icon: Star, color: '#d4a853', score: 68, confidence: 90, weight: 25, verdict: 'CONSIDER', keyMetric: 'Composite', keyMetricValue: '68%', flags: [] },
    { id: 'genome', label: 'Narrative Genome', shortLabel: 'Narrative', icon: Activity, color: '#a855f7', score: 72, confidence: 75, weight: 15, verdict: 'Strong arc match', keyMetric: 'Arc Match', keyMetricValue: 'Rags to Riches', flags: [] },
    { id: 'portfolio', label: 'Portfolio Theory', shortLabel: 'Portfolio', icon: PieChart, color: '#3b82f6', score: 55, confidence: 70, weight: 10, verdict: 'Moderate fit', keyMetric: 'Sharpe Ratio', keyMetricValue: '0.82', flags: ['Portfolio concentration risk'] },
    { id: 'reader', label: 'Reader Genome', shortLabel: 'Reader', icon: Share2, color: '#06b6d4', score: 78, confidence: 65, weight: 10, verdict: 'Strong funnel', keyMetric: 'LTV/CAC', keyMetricValue: '3.2×', flags: [] },
    { id: 'decision', label: 'Decision Genome', shortLabel: 'Decision', icon: GitBranch, color: '#8b5cf6', score: 65, confidence: 80, weight: 15, verdict: 'Moderate ROI', keyMetric: 'Expected Rev', keyMetricValue: '$22,400', flags: ['High risk multiple (1.8×)'] },
    { id: 'synergy', label: 'Catalog Synergy', shortLabel: 'Synergy', icon: Network, color: '#ec4899', score: 82, confidence: 85, weight: 10, verdict: 'Excellent fit', keyMetric: 'Synergy Score', keyMetricValue: '82/100', flags: [] },
    { id: 'zeitgeist', label: 'Cultural Zeitgeist', shortLabel: 'Zeitgeist', icon: Globe, color: '#f59e0b', score: 74, confidence: 60, weight: 10, verdict: 'Good alignment', keyMetric: 'Resonance', keyMetricValue: '74%', flags: ['1 theme declining'] },
    { id: 'trajectory', label: 'Author Trajectory', shortLabel: 'Trajectory', icon: Calendar, color: '#22c55e', score: 60, confidence: 55, weight: 5, verdict: 'Promising arc', keyMetric: 'Break-even', keyMetricValue: 'Book 3', flags: [] },
  ]);

  const updateScore = (id: string, field: 'score' | 'confidence', value: number) => {
    setSystemScores(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const analysis = useMemo(() => {
    const totalWeight = systemScores.reduce((s, sys) => s + sys.weight, 0);

    // ═══ WEIGHTED COMPOSITE ═══
    const compositeScore = systemScores.reduce((s, sys) =>
      s + sys.score * (sys.weight / totalWeight), 0);

    // ═══ CONFIDENCE-WEIGHTED COMPOSITE ═══
    // Systems with higher confidence get more weight
    const confWeightedTotal = systemScores.reduce((s, sys) =>
      s + sys.weight * (sys.confidence / 100), 0);
    const confComposite = systemScores.reduce((s, sys) =>
      s + sys.score * (sys.weight * (sys.confidence / 100)) / confWeightedTotal, 0);

    // ═══ SIGNAL ALIGNMENT ═══
    // How many systems agree on the same directional verdict?
    const positiveSignals = systemScores.filter(s => s.score >= 65).length;
    const negativeSignals = systemScores.filter(s => s.score < 45).length;
    const neutralSignals = systemScores.length - positiveSignals - negativeSignals;
    const alignmentPct = Math.round((positiveSignals / systemScores.length) * 100);
    const consensus = positiveSignals >= 6 ? 'STRONG CONSENSUS — ACQUIRE'
      : positiveSignals >= 4 ? 'MAJORITY POSITIVE — FAVORABLE'
      : negativeSignals >= 4 ? 'MAJORITY NEGATIVE — PASS'
      : 'MIXED SIGNALS — NEEDS DISCUSSION';

    // ═══ RISK vs. OPPORTUNITY MATRIX ═══
    // X-axis: average score (opportunity)
    // Y-axis: score variance (risk)
    const avgScore = compositeScore;
    const variance = Math.sqrt(
      systemScores.reduce((s, sys) => s + Math.pow(sys.score - avgScore, 2), 0) / systemScores.length
    );
    const riskLevel = variance > 20 ? 'HIGH' : variance > 12 ? 'MODERATE' : 'LOW';

    // ═══ RED FLAGS ═══
    // Cross-system contradictions
    const redFlags: string[] = [];
    const allFlags = systemScores.flatMap(s => s.flags);
    redFlags.push(...allFlags);

    // Divergence detection
    const highScores = systemScores.filter(s => s.score >= 75);
    const lowScores = systemScores.filter(s => s.score <= 40);
    if (highScores.length > 0 && lowScores.length > 0) {
      redFlags.push(`Signal divergence: ${highScores.map(s => s.shortLabel).join(', ')} are strong, but ${lowScores.map(s => s.shortLabel).join(', ')} are weak.`);
    }

    // Low confidence warning
    const lowConf = systemScores.filter(s => s.confidence < 50);
    if (lowConf.length > 0) {
      redFlags.push(`Low confidence in: ${lowConf.map(s => s.shortLabel).join(', ')} — data may be insufficient.`);
    }

    // ═══ STRATEGIC GRADE ═══
    const grade = compositeScore >= 85 ? 'A+' : compositeScore >= 80 ? 'A'
      : compositeScore >= 75 ? 'B+' : compositeScore >= 70 ? 'B'
      : compositeScore >= 65 ? 'B−' : compositeScore >= 60 ? 'C+'
      : compositeScore >= 55 ? 'C' : compositeScore >= 50 ? 'C−'
      : compositeScore >= 45 ? 'D' : 'F';

    const recommendation = compositeScore >= 75 ? 'STRONG ACQUIRE — move to offer stage immediately.'
      : compositeScore >= 65 ? 'ACQUIRE — present to editorial board with positive recommendation.'
      : compositeScore >= 55 ? 'CONDITIONAL — consider with targeted improvements or author development plan.'
      : compositeScore >= 45 ? 'DEVELOP — promising but needs significant revision before acquisition.'
      : 'PASS — does not meet current acquisition thresholds.';

    // ═══ EXECUTIVE SUMMARY ═══
    const topSystem = [...systemScores].sort((a, b) => b.score - a.score)[0];
    const weakSystem = [...systemScores].sort((a, b) => a.score - b.score)[0];

    const execSummary = [
      `This manuscript scores ${compositeScore.toFixed(0)}% composite across ${systemScores.length} intelligence systems (Grade: ${grade}). ${positiveSignals} of ${systemScores.length} systems signal positively, indicating ${consensus.toLowerCase()}.`,
      `Strongest dimension: ${topSystem.label} (${topSystem.score}%) — ${topSystem.verdict}. Weakest: ${weakSystem.label} (${weakSystem.score}%) — ${weakSystem.verdict}. Cross-system variance is ${variance.toFixed(1)}% (${riskLevel} divergence risk).`,
      `${recommendation} ${redFlags.length > 0 ? `Note: ${redFlags.length} flag(s) require attention before proceeding.` : 'No critical flags detected.'}`
    ];

    return {
      compositeScore, confComposite, positiveSignals, negativeSignals,
      neutralSignals, alignmentPct, consensus, avgScore, variance,
      riskLevel, redFlags, grade, recommendation, execSummary,
      topSystem, weakSystem,
    };
  }, [systemScores]);

  // Radar chart geometry
  const radarPoints = (scores: number[]) => {
    const n = scores.length;
    return scores.map((val, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r = (val / 100) * 130;
      return { x: 200 + Math.cos(angle) * r, y: 170 + Math.sin(angle) * r };
    });
  };

  const scoreValues = systemScores.map(s => s.score);
  const confValues = systemScores.map(s => s.confidence);
  const radarPts = radarPoints(scoreValues);
  const radarConfPts = radarPoints(confValues);

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-starforge-gold/5 via-purple-500/5 to-emerald-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <Radar className="w-5 h-5 text-starforge-gold" /> Cross-System Synthesis Engine
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Mission control for all intelligence systems. Synthesizes {systemScores.length} analytical dimensions
          into a single unified assessment with consensus analysis, risk quantification, and strategic verdict.
          <strong className="text-starforge-gold"> The first multi-system intelligence synthesis engine for publishing.</strong>
        </p>
      </div>

      {/* ═══ TOP-LINE METRICS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center col-span-1">
          <p className="text-[8px] text-text-muted uppercase mb-1">Composite</p>
          <p className={`font-heading text-3xl ${analysis.compositeScore >= 65 ? 'text-emerald-400' : analysis.compositeScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {analysis.compositeScore.toFixed(0)}%
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Grade</p>
          <p className="font-heading text-3xl text-starforge-gold">{analysis.grade}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Signals</p>
          <p className="font-heading text-xl">
            <span className="text-emerald-400">{analysis.positiveSignals}↑</span>{' '}
            <span className="text-text-muted">{analysis.neutralSignals}→</span>{' '}
            <span className="text-red-400">{analysis.negativeSignals}↓</span>
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Alignment</p>
          <p className={`font-heading text-3xl ${analysis.alignmentPct >= 70 ? 'text-emerald-400' : analysis.alignmentPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {analysis.alignmentPct}%
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Variance</p>
          <p className={`font-heading text-3xl ${analysis.variance <= 12 ? 'text-emerald-400' : analysis.variance <= 20 ? 'text-amber-400' : 'text-red-400'}`}>
            {analysis.variance.toFixed(0)}
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Risk Level</p>
          <p className={`font-heading text-xl ${analysis.riskLevel === 'LOW' ? 'text-emerald-400' : analysis.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-red-400'}`}>
            {analysis.riskLevel}
          </p>
        </div>
      </div>

      {/* ═══ Two-Column: Radar + System Inputs ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Radar Chart */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" /> Intelligence Radar
            <TIP text="Gold polygon shows system scores. Purple polygon shows confidence levels. Where they diverge, the score is uncertain." />
          </h4>
          <div className="bg-void-black rounded-lg p-3 border border-white/[0.06]">
            <svg viewBox="0 0 400 340" className="w-full" style={{ height: 280 }}>
              {/* Background rings */}
              {[0.25, 0.5, 0.75, 1.0].map(scale => {
                const n = systemScores.length;
                const pts = Array.from({ length: n }, (_, i) => {
                  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                  return `${200 + Math.cos(a) * 130 * scale},${170 + Math.sin(a) * 130 * scale}`;
                }).join(' ');
                return <polygon key={scale} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />;
              })}

              {/* Axis lines + labels */}
              {systemScores.map((sys, i) => {
                const n = systemScores.length;
                const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                const ex = 200 + Math.cos(a) * 145;
                const ey = 170 + Math.sin(a) * 145;
                return (
                  <g key={sys.id}>
                    <line x1={200} y1={170} x2={200 + Math.cos(a) * 130} y2={170 + Math.sin(a) * 130}
                      stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                    <text x={ex} y={ey + 4} fill={sys.color} fontSize="7" textAnchor="middle" fontWeight="600">
                      {sys.shortLabel}
                    </text>
                  </g>
                );
              })}

              {/* Confidence polygon (purple, behind) */}
              <polygon
                points={radarConfPts.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeWidth="1" opacity="0.5"
              />

              {/* Score polygon (gold, front) */}
              <polygon
                points={radarPts.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(212,168,83,0.12)" stroke="#d4a853" strokeWidth="2" opacity="0.9"
              />

              {/* Score dots */}
              {radarPts.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4"
                  fill={systemScores[i].color} stroke="#000" strokeWidth="1" />
              ))}
            </svg>
            <div className="flex gap-3 justify-center text-[9px] text-text-muted mt-1">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-starforge-gold inline-block" /> System Scores</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-500 inline-block" /> Confidence</span>
            </div>
          </div>
        </div>

        {/* System Score Inputs */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> System Score Inputs
            <TIP text="Adjust each system's score and confidence to match the results from that system's dedicated tab. These feed into the composite calculation." />
          </h4>
          <div className="space-y-2.5">
            {systemScores.map(sys => {
              const Icon = sys.icon;
              return (
                <div key={sys.id} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: sys.color }} />
                  <span className="text-[10px] text-text-primary w-20 truncate">{sys.shortLabel}</span>
                  <div className="flex-1 flex items-center gap-1.5">
                    <span className="text-[7px] text-text-muted w-6">Score</span>
                    <input type="range" min={0} max={100} value={sys.score}
                      onChange={e => updateScore(sys.id, 'score', +e.target.value)}
                      className="flex-1 accent-starforge-gold" style={{ minHeight: 'auto', minWidth: 'auto' }} />
                    <span className="text-[10px] font-mono w-8 text-right" style={{ color: sys.color }}>{sys.score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] text-text-muted">Conf</span>
                    <input type="range" min={0} max={100} value={sys.confidence}
                      onChange={e => updateScore(sys.id, 'confidence', +e.target.value)}
                      className="w-14 accent-purple-400" style={{ minHeight: 'auto', minWidth: 'auto' }} />
                    <span className="text-[9px] font-mono text-purple-400 w-6 text-right">{sys.confidence}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ CONSENSUS BANNER ═══ */}
      <div className={`border rounded-xl p-4 ${analysis.positiveSignals >= 5 ? 'bg-emerald-500/5 border-emerald-500/20' : analysis.negativeSignals >= 4 ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
        <div className="flex items-center gap-4">
          {analysis.positiveSignals >= 5 ? <CheckCircle className="w-6 h-6 text-emerald-400" /> :
           analysis.negativeSignals >= 4 ? <AlertTriangle className="w-6 h-6 text-red-400" /> :
           <Eye className="w-6 h-6 text-amber-400" />}
          <div>
            <p className={`text-sm font-heading ${analysis.positiveSignals >= 5 ? 'text-emerald-400' : analysis.negativeSignals >= 4 ? 'text-red-400' : 'text-amber-400'}`}>
              {analysis.consensus}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              {analysis.positiveSignals} systems positive · {analysis.neutralSignals} neutral · {analysis.negativeSignals} negative
            </p>
          </div>
        </div>
      </div>

      {/* ═══ SYSTEM-BY-SYSTEM BREAKDOWN ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-starforge-gold" /> System-by-System Intelligence
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {systemScores.map(sys => {
            const Icon = sys.icon;
            return (
              <div key={sys.id} className={`rounded-lg p-3 border ${sys.score >= 65 ? 'bg-emerald-500/5 border-emerald-500/10' : sys.score >= 45 ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-red-500/5 border-red-500/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color: sys.color }} />
                  <span className="text-[10px] text-text-primary font-medium">{sys.shortLabel}</span>
                  <span className="text-[10px] font-mono ml-auto" style={{ color: sys.color }}>{sys.score}%</span>
                </div>
                <p className="text-[9px] text-text-muted mb-1">{sys.verdict}</p>
                <div className="flex justify-between text-[8px]">
                  <span className="text-text-muted">{sys.keyMetric}: <span className="text-text-primary">{sys.keyMetricValue}</span></span>
                  <span className="text-purple-400/60">{sys.confidence}% conf</span>
                </div>
                {sys.flags.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {sys.flags.map((flag, i) => (
                      <p key={i} className="text-[7px] text-amber-400/80 flex items-center gap-1">
                        <AlertTriangle className="w-2 h-2" /> {flag}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ RED FLAGS ═══ */}
      {analysis.redFlags.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <h4 className="font-heading text-sm text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Cross-System Red Flags ({analysis.redFlags.length})
          </h4>
          <div className="space-y-1.5">
            {analysis.redFlags.map((flag, i) => (
              <p key={i} className="text-[10px] text-text-secondary flex items-start gap-2">
                <span className="text-red-400 mt-0.5">▸</span> {flag}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ═══ EXECUTIVE SUMMARY ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-starforge-gold" /> Executive Summary
          <TIP text="Auto-generated synthesis of all intelligence systems. This is what goes to the editorial board." />
        </h4>
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          {analysis.execSummary.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      {/* ═══ STRATEGIC VERDICT ═══ */}
      <div className={`border rounded-xl p-5 ${analysis.compositeScore >= 65 ? 'bg-emerald-500/5 border-emerald-500/20' : analysis.compositeScore >= 50 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Unified Verdict</p>
            <p className={`font-heading text-4xl ${analysis.compositeScore >= 65 ? 'text-emerald-400' : analysis.compositeScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {analysis.grade}
            </p>
          </div>
          <div className="w-px h-12 bg-white/[0.1]" />
          <div className="flex-1 text-xs text-text-secondary">
            <p className="font-medium text-text-primary mb-1">{analysis.recommendation}</p>
            <p>
              Strongest: <strong style={{ color: analysis.topSystem.color }}>{analysis.topSystem.label}</strong> ({analysis.topSystem.score}%).
              Weakest: <strong className="text-text-muted">{analysis.weakSystem.label}</strong> ({analysis.weakSystem.score}%).
              Confidence-adjusted composite: {analysis.confComposite.toFixed(0)}%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
