import { useState, useMemo } from 'react';
import {
  Info, Swords, ArrowRight, CheckCircle, AlertTriangle,
  Star, Activity, PieChart, Share2, GitBranch, Network, Globe, Calendar,
  TrendingUp, TrendingDown, Minus, Trophy, Shield, Target
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   COMPARATIVE MANUSCRIPT WAR ROOM
   ────────────────────────────────────────────────────────────
   Side-by-side comparison of two manuscripts across all
   intelligence dimensions. Dual radar overlay, head-to-head
   verdicts, resource allocation analysis.

   NO PUBLISHING TOOL COMPARES MANUSCRIPTS ACROSS 8 SIMULTANEOUS
   ANALYTICAL DIMENSIONS WITH AUTOMATED VERDICTS.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

const DIMENSIONS = [
  { id: 'rubric', label: 'Rubric', icon: Star, color: '#d4a853' },
  { id: 'genome', label: 'Narrative', icon: Activity, color: '#a855f7' },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart, color: '#3b82f6' },
  { id: 'reader', label: 'Reader', icon: Share2, color: '#06b6d4' },
  { id: 'decision', label: 'Decision', icon: GitBranch, color: '#8b5cf6' },
  { id: 'synergy', label: 'Synergy', icon: Network, color: '#ec4899' },
  { id: 'zeitgeist', label: 'Zeitgeist', icon: Globe, color: '#f59e0b' },
  { id: 'trajectory', label: 'Trajectory', icon: Calendar, color: '#22c55e' },
];

interface ManuscriptProfile {
  title: string;
  author: string;
  genre: string;
  wordCount: number;
  scores: Record<string, number>;
}

export default function MSWarRoom() {
  const [msA, setMsA] = useState<ManuscriptProfile>({
    title: 'The Ember Codex',
    author: 'Elena Voss',
    genre: 'Fantasy',
    wordCount: 92000,
    scores: { rubric: 72, genome: 78, portfolio: 55, reader: 80, decision: 65, synergy: 85, zeitgeist: 70, trajectory: 58 },
  });

  const [msB, setMsB] = useState<ManuscriptProfile>({
    title: 'Whispers in the Aether',
    author: 'Marcus Chen',
    genre: 'Sci-Fi',
    wordCount: 78000,
    scores: { rubric: 68, genome: 65, portfolio: 75, reader: 62, decision: 72, synergy: 60, zeitgeist: 82, trajectory: 70 },
  });

  const updateScore = (ms: 'A' | 'B', dim: string, value: number) => {
    const setter = ms === 'A' ? setMsA : setMsB;
    setter(prev => ({ ...prev, scores: { ...prev.scores, [dim]: value } }));
  };

  const analysis = useMemo(() => {
    // Composite scores
    const compositeA = DIMENSIONS.reduce((s, d) => s + (msA.scores[d.id] || 0), 0) / DIMENSIONS.length;
    const compositeB = DIMENSIONS.reduce((s, d) => s + (msB.scores[d.id] || 0), 0) / DIMENSIONS.length;

    // Head-to-head: dimension-by-dimension winner
    const headToHead = DIMENSIONS.map(d => {
      const a = msA.scores[d.id] || 0;
      const b = msB.scores[d.id] || 0;
      const diff = a - b;
      return {
        ...d,
        scoreA: a,
        scoreB: b,
        diff,
        winner: diff > 3 ? 'A' : diff < -3 ? 'B' : 'TIE',
      };
    });

    const winsA = headToHead.filter(h => h.winner === 'A').length;
    const winsB = headToHead.filter(h => h.winner === 'B').length;
    const ties = headToHead.filter(h => h.winner === 'TIE').length;

    const overallWinner = compositeA > compositeB + 2 ? 'A'
      : compositeB > compositeA + 2 ? 'B' : 'TIE';

    // Variance (consistency)
    const varianceA = Math.sqrt(DIMENSIONS.reduce((s, d) => s + Math.pow((msA.scores[d.id] || 0) - compositeA, 2), 0) / DIMENSIONS.length);
    const varianceB = Math.sqrt(DIMENSIONS.reduce((s, d) => s + Math.pow((msB.scores[d.id] || 0) - compositeB, 2), 0) / DIMENSIONS.length);

    // Strengths
    const bestDimA = [...headToHead].sort((a, b) => b.scoreA - a.scoreA)[0];
    const bestDimB = [...headToHead].sort((a, b) => b.scoreB - a.scoreB)[0];
    const worstDimA = [...headToHead].sort((a, b) => a.scoreA - b.scoreA)[0];
    const worstDimB = [...headToHead].sort((a, b) => a.scoreB - b.scoreB)[0];

    return {
      compositeA, compositeB, headToHead, winsA, winsB, ties,
      overallWinner, varianceA, varianceB, bestDimA, bestDimB,
      worstDimA, worstDimB
    };
  }, [msA, msB]);

  // Dual radar
  const radarPoints = (scores: number[]) => {
    const n = scores.length;
    return scores.map((val, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r = (val / 100) * 120;
      return { x: 200 + Math.cos(angle) * r, y: 160 + Math.sin(angle) * r };
    });
  };

  const ptsA = radarPoints(DIMENSIONS.map(d => msA.scores[d.id] || 0));
  const ptsB = radarPoints(DIMENSIONS.map(d => msB.scores[d.id] || 0));

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-red-500/5 via-amber-500/5 to-red-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-400" /> Comparative Manuscript War Room
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Head-to-head comparison across {DIMENSIONS.length} intelligence dimensions.
          Determine which manuscript deserves acquisition resources when you can only choose one.
          <strong className="text-red-400"> The first multi-dimensional manuscript comparison engine for publishing.</strong>
        </p>
      </div>

      {/* ═══ MANUSCRIPT PROFILES ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[{ ms: msA, setMs: setMsA, label: 'Manuscript A', color: '#d4a853', key: 'A' as const },
          { ms: msB, setMs: setMsB, label: 'Manuscript B', color: '#3b82f6', key: 'B' as const }].map(({ ms, setMs, label, color, key }) => (
          <div key={key} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <h4 className="font-heading text-sm mb-3 flex items-center gap-2" style={{ color }}>
              {key === 'A' ? <Star className="w-4 h-4" /> : <Target className="w-4 h-4" />} {label}
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[8px] text-text-muted uppercase">Title</label>
                <input type="text" value={ms.title}
                  onChange={e => setMs(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-void-black border border-white/[0.06] rounded px-2 py-1 text-xs text-text-primary" />
              </div>
              <div>
                <label className="text-[8px] text-text-muted uppercase">Author</label>
                <input type="text" value={ms.author}
                  onChange={e => setMs(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full bg-void-black border border-white/[0.06] rounded px-2 py-1 text-xs text-text-primary" />
              </div>
              <div>
                <label className="text-[8px] text-text-muted uppercase">Genre</label>
                <input type="text" value={ms.genre}
                  onChange={e => setMs(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full bg-void-black border border-white/[0.06] rounded px-2 py-1 text-xs text-text-primary" />
              </div>
              <div>
                <label className="text-[8px] text-text-muted uppercase">Word Count</label>
                <input type="number" value={ms.wordCount}
                  onChange={e => setMs(prev => ({ ...prev, wordCount: +e.target.value }))}
                  className="w-full bg-void-black border border-white/[0.06] rounded px-2 py-1 text-xs text-text-primary" />
              </div>
            </div>
            <div className="space-y-1.5">
              {DIMENSIONS.map(dim => (
                <div key={dim.id} className="flex items-center gap-1.5">
                  <dim.icon className="w-3 h-3" style={{ color: dim.color }} />
                  <span className="text-[9px] text-text-muted w-14">{dim.label}</span>
                  <input type="range" min={0} max={100} value={ms.scores[dim.id] || 0}
                    onChange={e => updateScore(key, dim.id, +e.target.value)}
                    className="flex-1" style={{ accentColor: color }} />
                  <span className="text-[10px] font-mono w-6 text-right" style={{ color }}>{ms.scores[dim.id]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ DUAL RADAR OVERLAY ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" /> Dual Radar Overlay
          <TIP text="Gold = Manuscript A. Blue = Manuscript B. Where one polygon extends beyond the other, that manuscript is stronger in that dimension." />
        </h4>
        <div className="bg-void-black rounded-lg p-3 border border-white/[0.06]">
          <svg viewBox="0 0 400 320" className="w-full" style={{ height: 280 }}>
            {/* Background rings */}
            {[0.25, 0.5, 0.75, 1.0].map(scale => {
              const n = DIMENSIONS.length;
              const pts = Array.from({ length: n }, (_, i) => {
                const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                return `${200 + Math.cos(a) * 120 * scale},${160 + Math.sin(a) * 120 * scale}`;
              }).join(' ');
              return <polygon key={scale} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />;
            })}

            {/* Axis lines + labels */}
            {DIMENSIONS.map((dim, i) => {
              const n = DIMENSIONS.length;
              const a = (i / n) * Math.PI * 2 - Math.PI / 2;
              const ex = 200 + Math.cos(a) * 140;
              const ey = 160 + Math.sin(a) * 140;
              return (
                <g key={dim.id}>
                  <line x1={200} y1={160} x2={200 + Math.cos(a) * 120} y2={160 + Math.sin(a) * 120}
                    stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <text x={ex} y={ey + 3} fill={dim.color} fontSize="7" textAnchor="middle" fontWeight="600">{dim.label}</text>
                </g>
              );
            })}

            {/* Manuscript B (blue, behind) */}
            <polygon points={ptsB.map(p => `${p.x},${p.y}`).join(' ')}
              fill="rgba(59,130,246,0.10)" stroke="#3b82f6" strokeWidth="1.5" opacity="0.8" />

            {/* Manuscript A (gold, front) */}
            <polygon points={ptsA.map(p => `${p.x},${p.y}`).join(' ')}
              fill="rgba(212,168,83,0.10)" stroke="#d4a853" strokeWidth="2" opacity="0.9" />

            {/* Dots */}
            {ptsA.map((pt, i) => <circle key={`a${i}`} cx={pt.x} cy={pt.y} r="3.5" fill="#d4a853" stroke="#000" strokeWidth="1" />)}
            {ptsB.map((pt, i) => <circle key={`b${i}`} cx={pt.x} cy={pt.y} r="3" fill="#3b82f6" stroke="#000" strokeWidth="1" />)}
          </svg>
          <div className="flex gap-4 justify-center text-[9px] text-text-muted mt-1">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-starforge-gold inline-block" /> {msA.title}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> {msB.title}</span>
          </div>
        </div>
      </div>

      {/* ═══ HEAD TO HEAD ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Swords className="w-4 h-4 text-red-400" /> Head-to-Head Breakdown
        </h4>
        <div className="space-y-2">
          {analysis.headToHead.map(h => {
            const Icon = DIMENSIONS.find(d => d.id === h.id)?.icon || Star;
            return (
              <div key={h.id} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" style={{ color: h.color }} />
                <span className="text-[9px] text-text-muted w-16">{h.label}</span>

                {/* A score */}
                <span className={`text-[10px] font-mono w-6 text-right ${h.winner === 'A' ? 'text-starforge-gold font-bold' : 'text-text-muted'}`}>
                  {h.scoreA}
                </span>

                {/* Bar battle */}
                <div className="flex-1 flex items-center gap-0.5 h-4">
                  <div className="flex-1 flex justify-end">
                    <div className="h-3 rounded-l bg-starforge-gold/20 border-r border-white/[0.1]" style={{ width: `${h.scoreA}%` }}>
                      <div className="h-full rounded-l bg-starforge-gold/40" style={{ width: `${Math.min(100, h.scoreA)}%` }} />
                    </div>
                  </div>
                  <div className="w-px h-4 bg-white/[0.2]" />
                  <div className="flex-1">
                    <div className="h-3 rounded-r bg-blue-500/20 border-l border-white/[0.1]" style={{ width: `${h.scoreB}%` }}>
                      <div className="h-full rounded-r bg-blue-500/40" style={{ width: `${Math.min(100, h.scoreB)}%` }} />
                    </div>
                  </div>
                </div>

                {/* B score */}
                <span className={`text-[10px] font-mono w-6 ${h.winner === 'B' ? 'text-blue-400 font-bold' : 'text-text-muted'}`}>
                  {h.scoreB}
                </span>

                {/* Winner indicator */}
                <span className="w-4">
                  {h.winner === 'A' && <TrendingUp className="w-3 h-3 text-starforge-gold" />}
                  {h.winner === 'B' && <TrendingDown className="w-3 h-3 text-blue-400" />}
                  {h.winner === 'TIE' && <Minus className="w-3 h-3 text-text-muted" />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ VERDICT CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Dimension Wins</p>
          <div className="flex justify-center gap-3">
            <div>
              <p className="font-heading text-2xl text-starforge-gold">{analysis.winsA}</p>
              <p className="text-[8px] text-text-muted">A wins</p>
            </div>
            <div className="w-px h-10 bg-white/[0.1] self-center" />
            <div>
              <p className="font-heading text-2xl text-text-muted">{analysis.ties}</p>
              <p className="text-[8px] text-text-muted">Ties</p>
            </div>
            <div className="w-px h-10 bg-white/[0.1] self-center" />
            <div>
              <p className="font-heading text-2xl text-blue-400">{analysis.winsB}</p>
              <p className="text-[8px] text-text-muted">B wins</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Composites</p>
          <div className="flex justify-center gap-4 items-baseline">
            <p className="font-heading text-2xl text-starforge-gold">{analysis.compositeA.toFixed(0)}%</p>
            <p className="text-xs text-text-muted">vs</p>
            <p className="font-heading text-2xl text-blue-400">{analysis.compositeB.toFixed(0)}%</p>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Consistency</p>
          <div className="flex justify-center gap-4">
            <div>
              <p className="font-heading text-xl text-starforge-gold">σ {analysis.varianceA.toFixed(1)}</p>
              <p className="text-[8px] text-text-muted">A variance</p>
            </div>
            <div>
              <p className="font-heading text-xl text-blue-400">σ {analysis.varianceB.toFixed(1)}</p>
              <p className="text-[8px] text-text-muted">B variance</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ OVERALL WINNER ═══ */}
      <div className={`border rounded-xl p-5 ${analysis.overallWinner === 'A' ? 'bg-starforge-gold/5 border-starforge-gold/20' : analysis.overallWinner === 'B' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-purple-500/5 border-purple-500/20'}`}>
        <div className="flex items-center gap-4">
          <Trophy className={`w-8 h-8 ${analysis.overallWinner === 'A' ? 'text-starforge-gold' : analysis.overallWinner === 'B' ? 'text-blue-400' : 'text-purple-400'}`} />
          <div>
            <p className={`text-sm font-heading ${analysis.overallWinner === 'A' ? 'text-starforge-gold' : analysis.overallWinner === 'B' ? 'text-blue-400' : 'text-purple-400'}`}>
              {analysis.overallWinner === 'TIE'
                ? 'TOO CLOSE TO CALL — ACQUIRE BOTH OR CONVENE EDITORIAL BOARD'
                : `RECOMMENDATION: ACQUIRE ${analysis.overallWinner === 'A' ? `"${msA.title}"` : `"${msB.title}"`}`}
            </p>
            <p className="text-[10px] text-text-secondary mt-1">
              {analysis.overallWinner === 'TIE'
                ? `Both manuscripts score within 2% of each other (${analysis.compositeA.toFixed(0)}% vs ${analysis.compositeB.toFixed(0)}%). Decision should be based on strategic priorities and catalog needs.`
                : analysis.overallWinner === 'A'
                ? `"${msA.title}" leads by ${(analysis.compositeA - analysis.compositeB).toFixed(0)}pts composite, wins ${analysis.winsA}/${DIMENSIONS.length} dimensions. Strongest in ${analysis.bestDimA.label} (${analysis.bestDimA.scoreA}%).`
                : `"${msB.title}" leads by ${(analysis.compositeB - analysis.compositeA).toFixed(0)}pts composite, wins ${analysis.winsB}/${DIMENSIONS.length} dimensions. Strongest in ${analysis.bestDimB.label} (${analysis.bestDimB.scoreB}%).`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
