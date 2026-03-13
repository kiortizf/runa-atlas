import { useState, useMemo } from 'react';
import {
  Info, Globe, TrendingUp, Calendar, Sparkles, Target,
  ArrowUp, ArrowDown, Zap, Eye, BarChart3, Clock, Flame
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CULTURAL ZEITGEIST MAPPER
   ────────────────────────────────────────────────────────────
   Maps a manuscript's themes against the cultural conversation
   landscape to identify optimal alignment windows.

   Based on:
   • Rogers (1962) — Diffusion of Innovations S-curve
   • Topic modeling concepts (Blei — LDA, adapted to structured input)
   • Publishing seasonality research (Greco, 2019)
   • Cultural sentiment wave analysis
   • Trend lifecycle modeling (innovators → early adopters → majority)

   NOBODY HAS BUILT A CULTURAL RESONANCE ENGINE
   FOR MANUSCRIPT TIMING.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

// ═══ CULTURAL CONVERSATION AXES ═══
interface CulturalAxis {
  id: string;
  label: string;
  emoji: string;
  description: string;
  lifecycle: 'emerging' | 'accelerating' | 'peak' | 'mainstream' | 'declining';
  momentum: number; // -10 to +10 (declining to surging)
  monthsToRelevance: number; // months remaining in cultural window
  searchTrend: number; // 0-100 (Google Trends proxy)
}

const CULTURAL_AXES: CulturalAxis[] = [
  { id: 'ai_anxiety', label: 'AI & Human Identity', emoji: '🤖', description: 'AI consciousness, job displacement, creative authenticity, deepfakes, algorithmic control.', lifecycle: 'peak', momentum: 9, monthsToRelevance: 24, searchTrend: 92 },
  { id: 'climate', label: 'Climate & Ecological Grief', emoji: '🌍', description: 'Climate anxiety, solarpunk hope, environmental justice, extinction grief, eco-activism.', lifecycle: 'accelerating', momentum: 7, monthsToRelevance: 60, searchTrend: 78 },
  { id: 'identity', label: 'Identity & Intersectionality', emoji: '🪞', description: 'Gender fluidity, racial identity, neurodivergence, disability justice, decolonization.', lifecycle: 'mainstream', momentum: 5, monthsToRelevance: 48, searchTrend: 70 },
  { id: 'democracy', label: 'Democracy & Authoritarianism', emoji: '🏛️', description: 'Democratic erosion, surveillance states, political polarization, disinformation, resistance.', lifecycle: 'accelerating', momentum: 8, monthsToRelevance: 36, searchTrend: 85 },
  { id: 'mental_health', label: 'Mental Health & Healing', emoji: '🧠', description: 'Therapy culture, trauma recovery, generational healing, burnout, inner child work.', lifecycle: 'mainstream', momentum: 4, monthsToRelevance: 36, searchTrend: 75 },
  { id: 'loneliness', label: 'Loneliness & Connection', emoji: '💔', description: 'Digital isolation, community building, found family, parasocial relationships, third places.', lifecycle: 'accelerating', momentum: 7, monthsToRelevance: 30, searchTrend: 68 },
  { id: 'surveillance', label: 'Privacy & Surveillance', emoji: '👁️', description: 'Data harvesting, social credit, facial recognition, digital rights, right to be forgotten.', lifecycle: 'accelerating', momentum: 6, monthsToRelevance: 42, searchTrend: 62 },
  { id: 'class', label: 'Class & Economic Justice', emoji: '⚖️', description: 'Wealth inequality, late capitalism, housing crisis, labor movements, universal basic income.', lifecycle: 'peak', momentum: 8, monthsToRelevance: 30, searchTrend: 80 },
  { id: 'body', label: 'Body Autonomy & Medicine', emoji: '🫀', description: 'Reproductive rights, disability rights, biohacking, longevity, medical access, bodily sovereignty.', lifecycle: 'peak', momentum: 7, monthsToRelevance: 24, searchTrend: 72 },
  { id: 'posthuman', label: 'Post-Humanism & Transhumanism', emoji: '🧬', description: 'Gene editing, consciousness upload, cyborg identity, species boundary, enhancement ethics.', lifecycle: 'emerging', momentum: 5, monthsToRelevance: 60, searchTrend: 45 },
  { id: 'indigenous', label: 'Indigenous Futurism & Decolonization', emoji: '🌿', description: 'Indigenous knowledge systems, land back, decolonized futures, ancestral technology, sovereignty.', lifecycle: 'accelerating', momentum: 6, monthsToRelevance: 48, searchTrend: 55 },
  { id: 'queer_joy', label: 'Queer Joy & Liberation', emoji: '🌈', description: 'Beyond trauma narratives. Queer happiness, chosen family, normalization, celebration, radical joy.', lifecycle: 'accelerating', momentum: 7, monthsToRelevance: 36, searchTrend: 65 },
];

const LIFECYCLE_ORDER = ['emerging', 'accelerating', 'peak', 'mainstream', 'declining'];
const LIFECYCLE_COLORS: Record<string, string> = {
  emerging: '#3b82f6', accelerating: '#06b6d4', peak: '#22c55e',
  mainstream: '#f59e0b', declining: '#ef4444',
};
const LIFECYCLE_LABELS: Record<string, string> = {
  emerging: 'Emerging — innovators & early adopters only',
  accelerating: 'Accelerating — catching mainstream attention',
  peak: 'Peak — maximum cultural saturation',
  mainstream: 'Mainstream — established but still relevant',
  declining: 'Declining — audience fatigue setting in',
};

// ═══ PUBLISHING SEASONALITY ═══
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEASONAL_STRENGTH = [40, 50, 75, 80, 70, 55, 45, 35, 85, 90, 80, 60]; // relative month strength

export default function MSCulturalResonance() {
  // Manuscript thematic weights (0-10 for each axis)
  const [themeWeights, setThemeWeights] = useState<Record<string, number>>(
    Object.fromEntries(CULTURAL_AXES.map(axis => [
      axis.id,
      axis.id === 'ai_anxiety' ? 8 :
      axis.id === 'identity' ? 7 :
      axis.id === 'loneliness' ? 6 :
      axis.id === 'queer_joy' ? 5 : 0,
    ]))
  );
  const [targetPubMonth, setTargetPubMonth] = useState(8); // September (0-indexed)

  const analysis = useMemo(() => {
    // Active themes (weight > 0)
    const activeThemes = CULTURAL_AXES.filter(axis => (themeWeights[axis.id] || 0) > 0)
      .map(axis => ({
        ...axis,
        weight: themeWeights[axis.id] || 0,
      }))
      .sort((a, b) => b.weight - a.weight);

    const totalWeight = activeThemes.reduce((s, t) => s + t.weight, 0);

    // ═══ RESONANCE SCORE ═══
    // Weighted combination of: theme momentum × weight × lifecycle position
    const lifecycleMultiplier: Record<string, number> = {
      emerging: 0.6, accelerating: 1.2, peak: 1.0, mainstream: 0.7, declining: 0.3,
    };

    const themeResonances = activeThemes.map(t => {
      const normalizedWeight = totalWeight > 0 ? t.weight / totalWeight : 0;
      const momentumNorm = (t.momentum + 10) / 20; // normalize -10..+10 to 0..1
      const lcMult = lifecycleMultiplier[t.lifecycle] || 0.5;
      const resonance = normalizedWeight * momentumNorm * lcMult * t.searchTrend / 100;
      return { ...t, resonance, normalizedWeight };
    });

    const totalResonance = themeResonances.reduce((s, t) => s + t.resonance, 0);
    const resonanceScore = Math.min(100, Math.round(totalResonance * 150));

    // ═══ TIMING ANALYSIS ═══
    // How does each month interact with theme momentum?
    const monthScores = MONTHS.map((month, i) => {
      const seasonalStrength = SEASONAL_STRENGTH[i] / 100;
      // Theme momentum decays over time from current state
      const monthsOut = i >= new Date().getMonth() ? i - new Date().getMonth() : 12 - new Date().getMonth() + i;
      const momentumDecay = activeThemes.reduce((s, t) => {
        const decayRate = t.lifecycle === 'emerging' ? 0.01 : t.lifecycle === 'declining' ? 0.08 : 0.03;
        const futureScore = t.momentum * Math.exp(-decayRate * monthsOut);
        return s + futureScore * (t.weight / (totalWeight || 1));
      }, 0);
      const compositeScore = seasonalStrength * 50 + (momentumDecay / 10) * 50;
      return { month, index: i, seasonalStrength, momentumDecay, compositeScore };
    });

    const bestMonth = monthScores.reduce((best, m) => m.compositeScore > best.compositeScore ? m : best, monthScores[0]);
    const targetMonth = monthScores[targetPubMonth];

    // ═══ TREND LIFECYCLE CHART DATA ═══
    // Rogers S-curve for each active theme
    const lifecycleCurves = activeThemes.map(t => {
      const lcIdx = LIFECYCLE_ORDER.indexOf(t.lifecycle);
      const points = Array.from({ length: 20 }, (_, i) => {
        const x = i / 19;
        // S-curve: logistic function centered at lifecycle position
        const center = (lcIdx + 0.5) / 5;
        const y = 1 / (1 + Math.exp(-12 * (x - center)));
        return { x, y, phase: x < 0.16 ? 'Innovators' : x < 0.34 ? 'Early Adopters' : x < 0.5 ? 'Early Majority' : x < 0.84 ? 'Late Majority' : 'Laggards' };
      });
      return { theme: t, points, currentX: (lcIdx + 0.5) / 5 };
    });

    // ═══ ALIGNMENT WINDOW ═══
    // How many months until the window closes for each theme?
    const windowAnalysis = activeThemes.map(t => {
      const urgency = t.lifecycle === 'peak' ? 'HIGH' : t.lifecycle === 'accelerating' ? 'MEDIUM' : t.lifecycle === 'emerging' ? 'LOW' : t.lifecycle === 'mainstream' ? 'MEDIUM' : 'CRITICAL';
      return { ...t, urgency, monthsLeft: t.monthsToRelevance };
    });

    return {
      activeThemes, totalWeight, themeResonances, resonanceScore,
      monthScores, bestMonth, targetMonth,
      lifecycleCurves, windowAnalysis,
    };
  }, [themeWeights, targetPubMonth]);

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-amber-500/5 via-pink-500/5 to-purple-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-400" /> Cultural Zeitgeist Mapper
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Map your manuscript's themes against the cultural conversation landscape. Identify optimal alignment
          windows using Rogers' Diffusion of Innovations S-curve and publishing seasonality analysis.
          <strong className="text-starforge-gold"> No one has built a cultural resonance engine for manuscript timing.</strong>
        </p>
      </div>

      {/* ═══ THEMATIC FINGERPRINT INPUT ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" /> Manuscript Thematic Fingerprint
          <TIP text="Rate how strongly your manuscript engages with each cultural conversation axis (0 = not present, 10 = central theme). This creates your manuscript's 'thematic DNA fingerprint.'" />
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CULTURAL_AXES.map(axis => {
            const weight = themeWeights[axis.id] || 0;
            const lcColor = LIFECYCLE_COLORS[axis.lifecycle];
            return (
              <div key={axis.id} className={`rounded-lg p-3 border transition-all ${
                weight > 0 ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white/[0.01] border-white/[0.04]'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{axis.emoji}</span>
                  <span className="text-[10px] text-text-primary font-medium flex-1">{axis.label}</span>
                  <span className={`text-[7px] px-1 py-0.5 rounded font-ui uppercase`}
                    style={{ backgroundColor: `${lcColor}20`, color: lcColor }}>
                    {axis.lifecycle}
                  </span>
                </div>
                <p className="text-[8px] text-text-muted mb-2 leading-relaxed">{axis.description}</p>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={10} step={1} value={weight}
                    onChange={e => setThemeWeights(prev => ({ ...prev, [axis.id]: +e.target.value }))}
                    className="flex-1 accent-starforge-gold" style={{ minHeight: 'auto', minWidth: 'auto' }} />
                  <span className={`text-xs font-mono w-6 text-right ${weight >= 7 ? 'text-starforge-gold' : weight > 0 ? 'text-text-primary' : 'text-text-muted'}`}>
                    {weight}
                  </span>
                </div>
                <div className="flex justify-between text-[7px] text-text-muted mt-0.5">
                  <span>Momentum: {axis.momentum > 0 ? '+' : ''}{axis.momentum}</span>
                  <span>Trend: {axis.searchTrend}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ RADAR CHART — Thematic Fingerprint vs Cultural Momentum ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" /> Resonance Radar — Manuscript vs. Culture
          <TIP text="Gold polygon = your manuscript's thematic weight. Purple polygon = current cultural momentum. Where they overlap = maximum resonance. Gaps show missed opportunities or misalignment." />
        </h4>
        <div className="bg-void-black rounded-lg p-3 border border-white/[0.06]">
          <svg viewBox="0 0 500 400" className="w-full" style={{ height: 300 }}>
            {/* Radar background rings */}
            {[0.25, 0.5, 0.75, 1.0].map(scale => {
              const axes = CULTURAL_AXES.length;
              const points = CULTURAL_AXES.map((_, i) => {
                const angle = (i / axes) * Math.PI * 2 - Math.PI / 2;
                return `${250 + Math.cos(angle) * 150 * scale},${200 + Math.sin(angle) * 150 * scale}`;
              }).join(' ');
              return <polygon key={scale} points={points} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />;
            })}

            {/* Axis lines */}
            {CULTURAL_AXES.map((axis, i) => {
              const angle = (i / CULTURAL_AXES.length) * Math.PI * 2 - Math.PI / 2;
              const ex = 250 + Math.cos(angle) * 160;
              const ey = 200 + Math.sin(angle) * 160;
              return (
                <g key={axis.id}>
                  <line x1={250} y1={200} x2={ex} y2={ey} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <text x={250 + Math.cos(angle) * 175} y={200 + Math.sin(angle) * 175}
                    fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle"
                    dominantBaseline="middle">
                    {axis.emoji}
                  </text>
                </g>
              );
            })}

            {/* Cultural momentum polygon (purple) */}
            <polygon
              points={CULTURAL_AXES.map((axis, i) => {
                const angle = (i / CULTURAL_AXES.length) * Math.PI * 2 - Math.PI / 2;
                const val = (axis.momentum + 10) / 20; // normalize
                return `${250 + Math.cos(angle) * 150 * val},${200 + Math.sin(angle) * 150 * val}`;
              }).join(' ')}
              fill="rgba(168,85,247,0.1)" stroke="#a855f7" strokeWidth="1.5" opacity="0.6"
            />

            {/* Manuscript thematic polygon (gold) */}
            <polygon
              points={CULTURAL_AXES.map((axis, i) => {
                const angle = (i / CULTURAL_AXES.length) * Math.PI * 2 - Math.PI / 2;
                const val = (themeWeights[axis.id] || 0) / 10;
                return `${250 + Math.cos(angle) * 150 * val},${200 + Math.sin(angle) * 150 * val}`;
              }).join(' ')}
              fill="rgba(212,168,83,0.1)" stroke="#d4a017" strokeWidth="2" opacity="0.8"
            />

            {/* Data points for manuscript */}
            {CULTURAL_AXES.map((axis, i) => {
              const angle = (i / CULTURAL_AXES.length) * Math.PI * 2 - Math.PI / 2;
              const val = (themeWeights[axis.id] || 0) / 10;
              if (val === 0) return null;
              return <circle key={axis.id} cx={250 + Math.cos(angle) * 150 * val} cy={200 + Math.sin(angle) * 150 * val}
                r="3" fill="#d4a017" stroke="#000" strokeWidth="0.5" />;
            })}
          </svg>
          <div className="flex gap-4 justify-center text-[9px] text-text-muted mt-1">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-starforge-gold inline-block" /> Manuscript Themes</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-500 inline-block" /> Cultural Momentum</span>
          </div>
        </div>
      </div>

      {/* ═══ Three-Column: Resonance Score + Timing + Window ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Resonance Score */}
        <div className={`border rounded-xl p-5 ${analysis.resonanceScore >= 60 ? 'bg-emerald-500/5 border-emerald-500/20' : analysis.resonanceScore >= 35 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className="text-center mb-3">
            <p className="text-[9px] text-text-muted uppercase mb-1">Cultural Resonance</p>
            <p className={`font-heading text-5xl ${analysis.resonanceScore >= 60 ? 'text-emerald-400' : analysis.resonanceScore >= 35 ? 'text-amber-400' : 'text-red-400'}`}>
              {analysis.resonanceScore}
            </p>
          </div>
          <div className="space-y-1.5">
            {analysis.themeResonances.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-2 text-[10px]">
                <span>{t.emoji}</span>
                <span className="text-text-muted flex-1 truncate">{t.label}</span>
                <div className="w-16 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-starforge-gold/60 rounded-full" style={{ width: `${t.resonance * 300}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimal Timing */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-xs text-text-primary mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" /> Publication Timing
          </h4>
          <div className="mb-2">
            <label className="text-[8px] text-text-muted uppercase font-ui block mb-1">Target Month</label>
            <select value={targetPubMonth} onChange={e => setTargetPubMonth(+e.target.value)}
              className="w-full bg-void-black border border-border rounded px-2 py-1 text-xs text-white focus:border-starforge-gold outline-none"
              style={{ minHeight: 'auto' }}>
              {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>

          <div className="bg-void-black rounded-lg p-2 border border-white/[0.06]">
            <svg viewBox="0 0 200 100" className="w-full h-20">
              {analysis.monthScores.map((m, i) => {
                const maxScore = Math.max(...analysis.monthScores.map(m => m.compositeScore));
                const barH = maxScore > 0 ? (m.compositeScore / maxScore * 70) : 0;
                const x = 10 + (i / 12) * 180;
                const isBest = i === analysis.bestMonth.index;
                const isTarget = i === targetPubMonth;
                return (
                  <g key={i}>
                    <rect x={x} y={80 - barH} width="12" height={barH}
                      fill={isBest ? '#22c55e' : isTarget ? '#d4a017' : 'rgba(168,85,247,0.3)'}
                      rx="1" opacity={isBest || isTarget ? 1 : 0.5} />
                    <text x={x + 6} y={93} fill={isBest ? '#22c55e' : isTarget ? '#d4a017' : 'rgba(255,255,255,0.3)'}
                      fontSize="6" textAnchor="middle">{m.month}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-2 space-y-1 text-[10px]">
            <p className="text-text-secondary">Best month: <strong className="text-emerald-400">{analysis.bestMonth.month}</strong> (score: {analysis.bestMonth.compositeScore.toFixed(0)})</p>
            <p className="text-text-secondary">Your target: <strong className="text-starforge-gold">{analysis.targetMonth?.month}</strong> (score: {analysis.targetMonth?.compositeScore.toFixed(0)})</p>
            {analysis.targetMonth && analysis.bestMonth.compositeScore - analysis.targetMonth.compositeScore > 10 && (
              <p className="text-amber-400 text-[9px]">⚠️ Consider shifting to {analysis.bestMonth.month} for +{(analysis.bestMonth.compositeScore - analysis.targetMonth.compositeScore).toFixed(0)}pts timing advantage</p>
            )}
          </div>
        </div>

        {/* Alignment Windows */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-xs text-text-primary mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-pink-400" /> Theme Alignment Windows
          </h4>
          <div className="space-y-2">
            {analysis.windowAnalysis.map(t => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-sm">{t.emoji}</span>
                <div className="flex-1">
                  <p className="text-[9px] text-text-primary">{t.label}</p>
                  <p className="text-[7px] text-text-muted">{t.monthsLeft}mo window remaining</p>
                </div>
                <span className={`text-[7px] font-ui uppercase px-1.5 py-0.5 rounded ${
                  t.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                  t.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                  t.urgency === 'MEDIUM' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>{t.urgency}</span>
              </div>
            ))}
          </div>
          {analysis.windowAnalysis.some(t => t.urgency === 'CRITICAL') && (
            <p className="text-[9px] text-red-400 mt-2">⚠️ Some themes are in declining lifecycle — publish soon or risk missing the cultural window.</p>
          )}
        </div>
      </div>

      {/* ═══ DIFFUSION S-CURVES ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Rogers Diffusion Curves — Theme Lifecycle Positions
          <TIP text="Each theme plotted on Rogers' Innovation Diffusion S-curve. Shows where in the adoption lifecycle each cultural conversation currently sits. Ideal publishing aligns with 'Early Majority' adoption (16-50% of the curve)." />
        </h4>
        <div className="bg-void-black rounded-lg p-3 border border-white/[0.06]">
          <svg viewBox="0 0 700 200" className="w-full h-40">
            {/* Phase labels */}
            {[
              { label: 'Innovators', x: 70, w: 112 },
              { label: 'Early Adopters', x: 182, w: 126 },
              { label: 'Early Majority', x: 308, w: 112 },
              { label: 'Late Majority', x: 420, w: 238 },
              { label: 'Laggards', x: 560, w: 100 },
            ].map(phase => (
              <g key={phase.label}>
                <text x={phase.x + phase.w / 2} y={15} fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle">{phase.label}</text>
                <line x1={phase.x} y1={20} x2={phase.x} y2={180} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
              </g>
            ))}

            {/* S-curves for each active theme */}
            {analysis.lifecycleCurves.map((curve, ci) => {
              const color = LIFECYCLE_COLORS[curve.theme.lifecycle] || '#6b7280';
              const points = curve.points.map(p =>
                `${70 + p.x * 560},${175 - p.y * 150}`
              ).join(' ');

              // Current position marker
              const cx = 70 + curve.currentX * 560;
              const cy = 175 - (1 / (1 + Math.exp(-12 * 0))) * 150; // at midpoint of logistics

              return (
                <g key={curve.theme.id}>
                  <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" />
                  {/* Current position dot */}
                  <circle cx={cx} cy={175 - curve.points[Math.floor(curve.currentX * 19)]?.y * 150 || 100}
                    r="4" fill={color} stroke="#000" strokeWidth="1" />
                  <text x={cx + 8} y={175 - (curve.points[Math.floor(curve.currentX * 19)]?.y || 0.5) * 150 + 3}
                    fill={color} fontSize="7">{curve.theme.emoji} {curve.theme.label.split(' ')[0]}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {Object.entries(LIFECYCLE_COLORS).map(([key, color]) => (
            <span key={key} className="flex items-center gap-1 text-[8px] text-text-muted">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {key}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ STRATEGIC VERDICT ═══ */}
      <div className={`border rounded-xl p-5 ${analysis.resonanceScore >= 60 ? 'bg-emerald-500/5 border-emerald-500/20' : analysis.resonanceScore >= 35 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Zeitgeist Alignment</p>
            <p className={`font-heading text-4xl ${analysis.resonanceScore >= 60 ? 'text-emerald-400' : analysis.resonanceScore >= 35 ? 'text-amber-400' : 'text-red-400'}`}>
              {analysis.resonanceScore >= 70 ? '🔥' : analysis.resonanceScore >= 40 ? '📈' : '📉'} {analysis.resonanceScore}%
            </p>
          </div>
          <div className="w-px h-12 bg-white/[0.1]" />
          <div className="flex-1 text-xs text-text-secondary space-y-1">
            <p>
              Manuscript engages {analysis.activeThemes.length} cultural axes.
              Strongest resonance with <strong className="text-starforge-gold">{analysis.themeResonances[0]?.emoji} {analysis.themeResonances[0]?.label}</strong>
              {analysis.themeResonances[0] && ` (${analysis.themeResonances[0].lifecycle}, momentum +${analysis.themeResonances[0].momentum})`}.
            </p>
            <p>
              Optimal pub window: <strong className="text-emerald-400">{analysis.bestMonth.month}</strong>.
              {analysis.windowAnalysis.filter(t => t.urgency === 'HIGH' || t.urgency === 'CRITICAL').length > 0 &&
                ` ⚠️ ${analysis.windowAnalysis.filter(t => t.urgency === 'HIGH' || t.urgency === 'CRITICAL').length} theme(s) have urgent alignment windows.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
