import { useState, useMemo, useCallback } from 'react';
import {
  Info, GitBranch, DollarSign, Target, Zap, BarChart3,
  Calendar, Image, Layers, TrendingUp, Shuffle, ChevronRight,
  ArrowRight, Sparkles, AlertTriangle, CheckCircle
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   THE TITLE DECISION GENOME
   ────────────────────────────────────────────────────────────
   Every publishing decision mapped as a probabilistic cascade
   tree. Like a chess engine for book publishing — each decision
   has downstream effects that compound.

   Based on:
   • Decision analysis (Raiffa, Hammond & Keeney — Smart Choices)
   • Monte Carlo simulation of publishing outcomes
   • Game theory (competitive pub slot analysis)
   • Expected value with conditional probabilities
   • Sensitivity analysis (tornado diagrams)

   NO ONE HAS BUILT A PROBABILISTIC DECISION CASCADE
   ENGINE FOR PUBLISHING.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

// ═══ DECISION NODES ═══
// Each node has options with probabilistic outcomes
interface DecisionOption {
  id: string;
  label: string;
  description: string;
  costDelta: number;       // $ change to production cost
  revenueMultiplier: number; // multiplier on base revenue
  riskMultiplier: number;  // multiplier on risk (variance)
  timeWeeks: number;       // weeks added/saved
  conditionalEffects: Record<string, number>; // how this affects other nodes' multipliers
}

interface DecisionNode {
  id: string;
  label: string;
  icon: any;
  color: string;
  tip: string;
  baseImpact: number; // 0-100, how much this decision matters
  options: DecisionOption[];
}

const DECISION_NODES: DecisionNode[] = [
  {
    id: 'cover', label: 'Cover Strategy', icon: Image, color: '#a855f7',
    tip: 'Cover is the #1 sales driver. 80% of purchase decisions start with the cover. Illustrated vs. typographic vs. photo-based dramatically shifts audience reach and production cost.',
    baseImpact: 95,
    options: [
      { id: 'illustrated', label: 'Custom Illustration', description: 'Full illustrated cover by a commissioned artist. Highest cost, highest differentiation.', costDelta: 3500, revenueMultiplier: 1.35, riskMultiplier: 0.85, timeWeeks: 6, conditionalEffects: { pricing: 1.10, marketing: 1.15 } },
      { id: 'typographic', label: 'Typographic/Design', description: 'Typography-driven cover with design elements. Lower cost, literary positioning.', costDelta: 1200, revenueMultiplier: 1.05, riskMultiplier: 1.0, timeWeeks: 3, conditionalEffects: { pricing: 0.95, marketing: 0.90 } },
      { id: 'stock_enhanced', label: 'Enhanced Stock', description: 'Manipulated stock imagery with strong design. Good balance of cost and impact.', costDelta: 800, revenueMultiplier: 0.90, riskMultiplier: 1.10, timeWeeks: 2, conditionalEffects: { pricing: 0.90, marketing: 0.95 } },
      { id: 'ai_assisted', label: 'AI-Assisted Design', description: 'AI-generated base with designer finishing. Fastest, cheapest, but controversy risk.', costDelta: 400, revenueMultiplier: 0.75, riskMultiplier: 1.30, timeWeeks: 1, conditionalEffects: { pricing: 0.85, marketing: 0.80 } },
    ],
  },
  {
    id: 'pricing', label: 'Price Point', icon: DollarSign, color: '#22c55e',
    tip: 'Pricing signals genre positioning and perceived value. Too low = perceived as low quality. Too high = price resistance. Sweet spot depends on format, genre, and audience.',
    baseImpact: 85,
    options: [
      { id: 'premium', label: '$18.99-$22.99', description: 'Premium positioning. Higher margins but lower volume. Works for literary/special editions.', costDelta: 0, revenueMultiplier: 1.25, riskMultiplier: 1.20, timeWeeks: 0, conditionalEffects: { format: 1.05, cover: 1.10 } },
      { id: 'standard', label: '$15.99-$17.99', description: 'Genre standard. Maximizes sell-through for established categories.', costDelta: 0, revenueMultiplier: 1.0, riskMultiplier: 1.0, timeWeeks: 0, conditionalEffects: { format: 1.0, cover: 1.0 } },
      { id: 'competitive', label: '$12.99-$14.99', description: 'Competitive pricing. Higher volume, lower margins. Good for debuts.', costDelta: 0, revenueMultiplier: 0.85, riskMultiplier: 0.85, timeWeeks: 0, conditionalEffects: { format: 0.95, marketing: 1.05 } },
      { id: 'loss_leader', label: '$9.99-$11.99', description: 'Loss leader / series hook. Sacrifice margin to maximize readership. Series strategy.', costDelta: 0, revenueMultiplier: 0.65, riskMultiplier: 0.70, timeWeeks: 0, conditionalEffects: { format: 0.90, marketing: 1.15 } },
    ],
  },
  {
    id: 'format', label: 'Format Mix', icon: Layers, color: '#3b82f6',
    tip: 'Format mix determines total addressable market. eBook-first vs. print-first vs. simultaneous has massive implications for cash flow, discoverability, and audience.',
    baseImpact: 75,
    options: [
      { id: 'all_simultaneous', label: 'All Formats Day 1', description: 'Print + eBook + Audio simultaneously. Maximum reach, maximum cost.', costDelta: 8000, revenueMultiplier: 1.40, riskMultiplier: 1.15, timeWeeks: 4, conditionalEffects: { marketing: 1.10, timing: 0.95 } },
      { id: 'print_ebook', label: 'Print + eBook', description: 'Standard launch. Audio 6-12 months later.', costDelta: 2000, revenueMultiplier: 1.0, riskMultiplier: 1.0, timeWeeks: 0, conditionalEffects: { marketing: 1.0, timing: 1.0 } },
      { id: 'ebook_first', label: 'eBook First', description: 'Digital-first strategy. Lower upfront cost. Print on demand later.', costDelta: 500, revenueMultiplier: 0.70, riskMultiplier: 0.80, timeWeeks: -4, conditionalEffects: { marketing: 0.85, timing: 1.10 } },
      { id: 'special_edition', label: 'Collector + Standard', description: 'Special edition with standard edition. Higher margin, lower volume. BookTok bait.', costDelta: 5000, revenueMultiplier: 1.55, riskMultiplier: 1.35, timeWeeks: 6, conditionalEffects: { marketing: 1.25, cover: 1.15 } },
    ],
  },
  {
    id: 'timing', label: 'Publication Timing', icon: Calendar, color: '#f59e0b',
    tip: 'Pub date determines competitive landscape, seasonal buying patterns, and review cycle alignment. Spring and Fall are peak. January and August are dead zones.',
    baseImpact: 70,
    options: [
      { id: 'spring_lead', label: 'Spring (Mar-May)', description: 'Spring list. Award consideration season begins. Strong review window.', costDelta: 0, revenueMultiplier: 1.10, riskMultiplier: 1.0, timeWeeks: 0, conditionalEffects: { marketing: 1.05, printrun: 1.0 } },
      { id: 'fall_peak', label: 'Fall (Sep-Nov)', description: 'Fall list. Holiday buying. Highest competitive density. Biggest potential.', costDelta: 0, revenueMultiplier: 1.25, riskMultiplier: 1.25, timeWeeks: 0, conditionalEffects: { marketing: 1.15, printrun: 1.10 } },
      { id: 'summer', label: 'Summer (Jun-Aug)', description: 'Summer reading. Beach reads. Lower competition, lighter fare preferred.', costDelta: 0, revenueMultiplier: 0.90, riskMultiplier: 0.90, timeWeeks: 0, conditionalEffects: { marketing: 0.95, printrun: 0.90 } },
      { id: 'winter_quiet', label: 'Winter (Dec-Feb)', description: 'Quiet season. Gift giving spill. Low competition = standout potential.', costDelta: 0, revenueMultiplier: 0.80, riskMultiplier: 0.85, timeWeeks: 0, conditionalEffects: { marketing: 0.85, printrun: 0.85 } },
    ],
  },
  {
    id: 'printrun', label: 'Print Run', icon: BarChart3, color: '#ec4899',
    tip: 'Print run is the highest-stakes gamble. Overprint = returns and pulping. Underprint = missed sales and lost momentum. Per-unit cost drops dramatically at scale.',
    baseImpact: 80,
    options: [
      { id: 'conservative', label: '1,000-2,000', description: 'Conservative debut. Low risk. Higher per-unit cost. May miss demand.', costDelta: 3000, revenueMultiplier: 0.80, riskMultiplier: 0.60, timeWeeks: 0, conditionalEffects: { pricing: 1.05, marketing: 0.90 } },
      { id: 'moderate', label: '3,000-5,000', description: 'Standard first printing. Balanced risk. Good economy of scale.', costDelta: 5500, revenueMultiplier: 1.0, riskMultiplier: 1.0, timeWeeks: 0, conditionalEffects: { pricing: 1.0, marketing: 1.0 } },
      { id: 'confident', label: '5,000-10,000', description: 'Confident print run. Lower per-unit. Requires strong pre-orders or comps.', costDelta: 8000, revenueMultiplier: 1.20, riskMultiplier: 1.30, timeWeeks: 2, conditionalEffects: { pricing: 0.95, marketing: 1.10 } },
      { id: 'aggressive', label: '10,000+', description: 'Aggressive. Major commitment. If it hits, margins are excellent. If not, catastrophic.', costDelta: 14000, revenueMultiplier: 1.50, riskMultiplier: 2.0, timeWeeks: 4, conditionalEffects: { pricing: 0.90, marketing: 1.25 } },
    ],
  },
  {
    id: 'marketing', label: 'Marketing Strategy', icon: TrendingUp, color: '#06b6d4',
    tip: 'Marketing allocation and channel strategy. Digital-first vs. trade marketing vs. grassroots. Each has different cost curves, timelines, and audience reach profiles.',
    baseImpact: 90,
    options: [
      { id: 'digital_heavy', label: 'Digital-First', description: 'BookTok, Instagram, targeted ads, newsletter swaps. Fastest ROI tracking.', costDelta: 3000, revenueMultiplier: 1.15, riskMultiplier: 1.10, timeWeeks: -2, conditionalEffects: { cover: 1.05, pricing: 1.0 } },
      { id: 'trade', label: 'Trade Marketing', description: 'Bookstore events, trade reviews, library marketing, ARCs. Slow build, long tail.', costDelta: 4000, revenueMultiplier: 1.10, riskMultiplier: 0.90, timeWeeks: 4, conditionalEffects: { cover: 1.0, pricing: 1.05 } },
      { id: 'grassroots', label: 'Grassroots/Community', description: 'Street teams, reader circles, convention presence. Low cost, authentic.', costDelta: 1500, revenueMultiplier: 0.95, riskMultiplier: 0.80, timeWeeks: 2, conditionalEffects: { cover: 0.95, pricing: 0.95 } },
      { id: 'blitz', label: 'Full Blitz', description: 'All channels simultaneously. Maximum saturation. Maximum cost.', costDelta: 8000, revenueMultiplier: 1.45, riskMultiplier: 1.30, timeWeeks: 0, conditionalEffects: { cover: 1.10, pricing: 1.05 } },
      { id: 'minimal', label: 'Organic Only', description: 'No paid marketing. Rely on organic discovery and word-of-mouth.', costDelta: 0, revenueMultiplier: 0.55, riskMultiplier: 0.70, timeWeeks: 0, conditionalEffects: { cover: 0.90, pricing: 0.90 } },
    ],
  },
];

export default function MSDecisionGenome() {
  const [baseRevenue, setBaseRevenue] = useState(15000);
  const [selections, setSelections] = useState<Record<string, string>>({
    cover: 'illustrated',
    pricing: 'standard',
    format: 'print_ebook',
    timing: 'spring_lead',
    printrun: 'moderate',
    marketing: 'digital_heavy',
  });

  const selectOption = useCallback((nodeId: string, optionId: string) => {
    setSelections(prev => ({ ...prev, [nodeId]: optionId }));
  }, []);

  const analysis = useMemo(() => {
    // Get selected options
    const selected = DECISION_NODES.map(node => {
      const option = node.options.find(o => o.id === selections[node.id]) || node.options[0];
      return { node, option };
    });

    // Calculate cascade effects (each decision's conditionalEffects modify other decisions)
    const cascadeMultipliers: Record<string, number> = {};
    DECISION_NODES.forEach(n => { cascadeMultipliers[n.id] = 1.0; });

    selected.forEach(({ node, option }) => {
      Object.entries(option.conditionalEffects).forEach(([targetId, mult]) => {
        if (cascadeMultipliers[targetId] !== undefined) {
          cascadeMultipliers[targetId] *= mult;
        }
      });
    });

    // Calculate final metrics
    let totalCostDelta = 0;
    let combinedRevenueMultiplier = 1.0;
    let combinedRiskMultiplier = 1.0;
    let totalTimeWeeks = 0;

    selected.forEach(({ node, option }) => {
      const cascade = cascadeMultipliers[node.id] || 1.0;
      totalCostDelta += option.costDelta;
      combinedRevenueMultiplier *= (option.revenueMultiplier * (0.5 + 0.5 * cascade));
      combinedRiskMultiplier *= option.riskMultiplier;
      totalTimeWeeks += option.timeWeeks;
    });

    const expectedRevenue = Math.round(baseRevenue * combinedRevenueMultiplier);
    const expectedProfit = expectedRevenue - totalCostDelta;
    const riskAdjustedRevenue = Math.round(expectedRevenue / combinedRiskMultiplier);
    const roi = totalCostDelta > 0 ? ((expectedRevenue - totalCostDelta) / totalCostDelta * 100) : 0;

    // Sensitivity analysis: how much does each decision swing revenue?
    const sensitivity = DECISION_NODES.map(node => {
      const options = node.options;
      const revenues = options.map(opt => {
        // Simulate choosing this option with current other selections
        const tempSelected = selected.map(s =>
          s.node.id === node.id ? { node, option: opt } : s
        );
        let tempMult = 1.0;
        tempSelected.forEach(({ option: o }) => { tempMult *= o.revenueMultiplier; });
        return baseRevenue * tempMult;
      });
      const spread = Math.max(...revenues) - Math.min(...revenues);
      const bestOption = options[revenues.indexOf(Math.max(...revenues))];
      const worstOption = options[revenues.indexOf(Math.min(...revenues))];
      return { node, spread, bestOption, worstOption, maxRev: Math.max(...revenues), minRev: Math.min(...revenues) };
    }).sort((a, b) => b.spread - a.spread);

    // Monte Carlo-style confidence distribution (simplified)
    const simResults = Array.from({ length: 500 }, () => {
      let simMult = 1.0;
      selected.forEach(({ option }) => {
        // Add random noise based on risk
        const noise = 1 + (Math.random() - 0.5) * 0.4 * option.riskMultiplier;
        simMult *= option.revenueMultiplier * noise;
      });
      return Math.round(baseRevenue * simMult);
    }).sort((a, b) => a - b);

    const p10 = simResults[Math.floor(simResults.length * 0.1)];
    const p50 = simResults[Math.floor(simResults.length * 0.5)];
    const p90 = simResults[Math.floor(simResults.length * 0.9)];

    // Build histogram buckets for distribution
    const minSim = Math.min(...simResults);
    const maxSim = Math.max(...simResults);
    const bucketCount = 20;
    const bucketSize = (maxSim - minSim) / bucketCount || 1;
    const histogram = Array.from({ length: bucketCount }, (_, i) => {
      const lo = minSim + i * bucketSize;
      const hi = lo + bucketSize;
      const count = simResults.filter(v => v >= lo && v < hi).length;
      return { lo, hi, count, mid: (lo + hi) / 2 };
    });
    const maxBucket = Math.max(...histogram.map(h => h.count));

    return {
      selected, cascadeMultipliers, totalCostDelta, combinedRevenueMultiplier,
      combinedRiskMultiplier, totalTimeWeeks, expectedRevenue, expectedProfit,
      riskAdjustedRevenue, roi, sensitivity,
      p10, p50, p90, histogram, maxBucket, minSim, maxSim,
    };
  }, [selections, baseRevenue]);

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-purple-500/5 via-amber-500/5 to-cyan-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-400" /> The Title Decision Genome
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          A chess engine for publishing decisions. Every choice — cover, price, format, timing, print run, marketing —
          has downstream effects that cascade through the entire system. Each decision shifts the probability space.
          <strong className="text-starforge-gold"> No publishing platform has ever built a probabilistic decision cascade engine.</strong>
        </p>
      </div>

      {/* ═══ BASE REVENUE INPUT ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
        <label className="text-[10px] text-text-muted uppercase font-ui whitespace-nowrap">Base Expected Revenue</label>
        <input type="number" min={1000} max={500000} step={1000} value={baseRevenue}
          onChange={e => setBaseRevenue(+e.target.value)}
          className="w-32 bg-void-black border border-border rounded px-2 py-1 text-sm text-starforge-gold focus:border-starforge-gold outline-none font-mono" />
        <TIP text="The baseline revenue estimate before any strategic decisions. This is the 'neutral' expected revenue for this manuscript given genre, comps, and author platform — before cover, pricing, format, timing, and marketing choices modify it." />
      </div>

      {/* ═══ DECISION NODES ═══ */}
      <div className="space-y-3">
        {DECISION_NODES.map(node => {
          const selectedOpt = node.options.find(o => o.id === selections[node.id]) || node.options[0];
          const cascade = analysis.cascadeMultipliers[node.id] || 1;
          const Icon = node.icon;

          return (
            <div key={node.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-4 h-4" style={{ color: node.color }} />
                <h4 className="font-heading text-sm text-text-primary flex-1">{node.label}</h4>
                <span className="text-[8px] font-ui uppercase text-text-muted">Impact: {node.baseImpact}%</span>
                {Math.abs(cascade - 1) > 0.01 && (
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${cascade > 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    Cascade: {cascade > 1 ? '+' : ''}{((cascade - 1) * 100).toFixed(0)}%
                  </span>
                )}
                <TIP text={node.tip} />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {node.options.map(opt => {
                  const isSelected = selections[node.id] === opt.id;
                  return (
                    <button key={opt.id} onClick={() => selectOption(node.id, opt.id)}
                      className={`text-left rounded-lg p-3 border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-starforge-gold/10 to-transparent border-starforge-gold/30'
                          : 'bg-white/[0.01] border-white/[0.04] hover:border-white/10'
                      }`}>
                      <p className="text-[11px] text-text-primary font-medium mb-1">{opt.label}</p>
                      <p className="text-[9px] text-text-muted leading-relaxed mb-2">{opt.description}</p>
                      <div className="space-y-0.5 text-[8px] font-mono">
                        {opt.costDelta > 0 && <p className="text-red-400/70">+{fmt(opt.costDelta)} cost</p>}
                        <p className={opt.revenueMultiplier >= 1 ? 'text-emerald-400/70' : 'text-red-400/70'}>
                          {opt.revenueMultiplier >= 1 ? '▲' : '▼'} {((opt.revenueMultiplier - 1) * 100).toFixed(0)}% revenue
                        </p>
                        <p className={opt.riskMultiplier <= 1 ? 'text-emerald-400/70' : 'text-amber-400/70'}>
                          {opt.riskMultiplier <= 1 ? '▽' : '△'} {((opt.riskMultiplier - 1) * 100).toFixed(0)}% risk
                        </p>
                        {opt.timeWeeks !== 0 && (
                          <p className="text-text-muted">{opt.timeWeeks > 0 ? '+' : ''}{opt.timeWeeks}w timeline</p>
                        )}
                      </div>
                      {isSelected && <p className="text-[7px] text-starforge-gold mt-1 font-ui uppercase">★ Selected</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ OUTCOME DASHBOARD ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Expected Revenue</p>
          <p className={`font-heading text-xl ${analysis.expectedRevenue >= baseRevenue ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(analysis.expectedRevenue)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Total Added Cost</p>
          <p className="font-heading text-xl text-red-400">{fmt(analysis.totalCostDelta)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Expected Profit</p>
          <p className={`font-heading text-xl ${analysis.expectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(analysis.expectedProfit)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Risk-Adjusted</p>
          <p className="font-heading text-xl text-amber-400">{fmt(analysis.riskAdjustedRevenue)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">ROI</p>
          <p className={`font-heading text-xl ${analysis.roi >= 50 ? 'text-emerald-400' : analysis.roi >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.roi.toFixed(0)}%</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Risk Multiple</p>
          <p className={`font-heading text-xl ${analysis.combinedRiskMultiplier <= 1 ? 'text-emerald-400' : analysis.combinedRiskMultiplier <= 1.5 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.combinedRiskMultiplier.toFixed(2)}×</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Timeline Δ</p>
          <p className="font-heading text-xl text-text-primary">{analysis.totalTimeWeeks > 0 ? '+' : ''}{analysis.totalTimeWeeks}w</p>
        </div>
      </div>

      {/* ═══ Two-Column: Monte Carlo Distribution + Sensitivity Tornado ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monte Carlo Revenue Distribution */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-purple-400" /> Revenue Distribution (500 Simulations)
            <TIP text="Monte Carlo simulation: 500 runs with random variance proportional to each decision's risk multiplier. Shows the probability distribution of revenue outcomes." />
          </h4>
          <div className="bg-void-black rounded-lg p-3 border border-white/[0.06]">
            <svg viewBox="0 0 400 160" className="w-full h-36">
              {/* Histogram bars */}
              {analysis.histogram.map((bucket, i) => {
                const barHeight = analysis.maxBucket > 0 ? (bucket.count / analysis.maxBucket) * 120 : 0;
                const x = 30 + (i / analysis.histogram.length) * 350;
                const width = 350 / analysis.histogram.length - 1;
                const isP10 = bucket.mid <= analysis.p10;
                const isP90 = bucket.mid >= analysis.p90;
                const color = isP10 || isP90 ? 'rgba(239,68,68,0.4)' : 'rgba(168,85,247,0.5)';
                return (
                  <rect key={i} x={x} y={140 - barHeight} width={width} height={barHeight}
                    fill={color} rx="1" />
                );
              })}
              {/* P10, P50, P90 lines */}
              {[
                { val: analysis.p10, label: 'P10', color: '#ef4444' },
                { val: analysis.p50, label: 'P50', color: '#d4a017' },
                { val: analysis.p90, label: 'P90', color: '#22c55e' },
              ].map(({ val, label, color }) => {
                const x = 30 + ((val - analysis.minSim) / (analysis.maxSim - analysis.minSim || 1)) * 350;
                return (
                  <g key={label}>
                    <line x1={x} y1={5} x2={x} y2={140} stroke={color} strokeWidth="1.5" strokeDasharray="3,3" />
                    <text x={x} y={155} fill={color} fontSize="8" textAnchor="middle" fontWeight="bold">{label}: {fmt(val)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center"><p className="text-[8px] text-text-muted uppercase">Bearish (P10)</p><p className="text-sm font-mono text-red-400">{fmt(analysis.p10)}</p></div>
            <div className="text-center"><p className="text-[8px] text-text-muted uppercase">Expected (P50)</p><p className="text-sm font-mono text-starforge-gold">{fmt(analysis.p50)}</p></div>
            <div className="text-center"><p className="text-[8px] text-text-muted uppercase">Bullish (P90)</p><p className="text-sm font-mono text-emerald-400">{fmt(analysis.p90)}</p></div>
          </div>
        </div>

        {/* Sensitivity Tornado */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Decision Sensitivity (Tornado)
            <TIP text="Shows which decision has the most leverage on revenue. Wider bar = higher impact. Change that decision first to maximize outcome." />
          </h4>
          <div className="space-y-2">
            {analysis.sensitivity.map((s, i) => {
              const maxSpread = analysis.sensitivity[0]?.spread || 1;
              const widthPct = (s.spread / maxSpread * 100);
              const Icon = s.node.icon;
              return (
                <div key={s.node.id} className="flex items-center gap-2">
                  <div className="w-24 flex items-center gap-1">
                    <Icon className="w-3 h-3" style={{ color: s.node.color }} />
                    <span className="text-[9px] text-text-muted truncate">{s.node.label}</span>
                  </div>
                  <div className="flex-1 h-5 bg-white/[0.03] rounded-sm overflow-hidden relative">
                    <div className="absolute h-full bg-gradient-to-r from-red-500/30 to-emerald-500/30 rounded-sm"
                      style={{ width: `${widthPct}%` }} />
                    <div className="absolute inset-0 flex items-center justify-between px-1">
                      <span className="text-[7px] font-mono text-red-400">{fmt(s.minRev)}</span>
                      <span className="text-[7px] font-mono text-emerald-400">{fmt(s.maxRev)}</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-text-muted w-14 text-right">Δ{fmt(s.spread)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-text-muted mt-3">
            <strong className="text-starforge-gold">{analysis.sensitivity[0]?.node.label}</strong> has the most leverage.
            Changing it swings revenue by {fmt(analysis.sensitivity[0]?.spread || 0)}.
          </p>
        </div>
      </div>

      {/* ═══ CASCADE VISUALIZATION ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-starforge-gold" /> Decision Cascade Flow
          <TIP text="Visual map of how each decision influences other decisions through conditional probabilities. Arrows show the cascade direction and magnitude." />
        </h4>
        <div className="bg-void-black rounded-lg p-4 border border-white/[0.06]">
          <svg viewBox="0 0 800 200" className="w-full h-40">
            {/* Node positions */}
            {DECISION_NODES.map((node, i) => {
              const x = 70 + (i * 120);
              const y = 100;
              const isSelected = selections[node.id];
              const opt = node.options.find(o => o.id === isSelected) || node.options[0];

              // Draw cascade arrows to other nodes
              const arrows = Object.entries(opt.conditionalEffects).map(([targetId, mult]) => {
                const targetIdx = DECISION_NODES.findIndex(n => n.id === targetId);
                if (targetIdx === -1) return null;
                const tx = 70 + (targetIdx * 120);
                const ty = 100;
                const color = mult > 1 ? '#22c55e' : mult < 1 ? '#ef4444' : '#6b7280';
                const opacity = Math.min(0.8, Math.abs(mult - 1) * 4);
                return (
                  <g key={`${node.id}-${targetId}`}>
                    <line x1={x + 20} y1={y - 25} x2={tx - 20} y2={ty - 25}
                      stroke={color} strokeWidth="1.5" opacity={opacity} markerEnd="url(#arrowhead)" />
                    <text x={(x + tx) / 2} y={y - 32} fill={color} fontSize="7" textAnchor="middle" opacity={opacity}>
                      {mult > 1 ? '+' : ''}{((mult - 1) * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              });

              return (
                <g key={node.id}>
                  {arrows}
                  <rect x={x - 30} y={y - 20} width="60" height="40" rx="6"
                    fill={`${node.color}15`} stroke={node.color} strokeWidth="1" opacity="0.8" />
                  <text x={x} y={y - 4} fill="rgba(255,255,255,0.8)" fontSize="7" textAnchor="middle" fontWeight="600">
                    {node.label.split(' ')[0]}
                  </text>
                  <text x={x} y={y + 8} fill={node.color} fontSize="6" textAnchor="middle">
                    {opt.label.split(' ')[0]}
                  </text>
                  <text x={x} y={y + 32} fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="middle">
                    {(opt.revenueMultiplier >= 1 ? '↑' : '↓')}{((opt.revenueMultiplier - 1) * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="rgba(255,255,255,0.4)" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* ═══ STRATEGIC VERDICT ═══ */}
      <div className={`border rounded-xl p-5 ${analysis.expectedProfit >= baseRevenue * 0.3 ? 'bg-emerald-500/5 border-emerald-500/20' : analysis.expectedProfit >= 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Strategic Grade</p>
            <p className={`font-heading text-4xl ${analysis.roi >= 100 ? 'text-emerald-400' : analysis.roi >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {analysis.roi >= 150 ? 'A+' : analysis.roi >= 100 ? 'A' : analysis.roi >= 75 ? 'B+' : analysis.roi >= 50 ? 'B' : analysis.roi >= 25 ? 'C' : analysis.roi >= 0 ? 'D' : 'F'}
            </p>
          </div>
          <div className="w-px h-12 bg-white/[0.1]" />
          <div className="flex-1 text-xs text-text-secondary space-y-1">
            <p>
              Current decisions produce <strong className={analysis.expectedRevenue >= baseRevenue ? 'text-emerald-400' : 'text-red-400'}>{fmt(analysis.expectedRevenue)}</strong> expected revenue
              ({analysis.combinedRevenueMultiplier >= 1 ? '+' : ''}{((analysis.combinedRevenueMultiplier - 1) * 100).toFixed(0)}% vs. base)
              at <strong className="text-amber-400">{analysis.combinedRiskMultiplier.toFixed(2)}×</strong> risk.
            </p>
            <p>
              P10/P50/P90 range: {fmt(analysis.p10)} → {fmt(analysis.p50)} → {fmt(analysis.p90)}.
              Highest-leverage decision: <strong className="text-starforge-gold">{analysis.sensitivity[0]?.node.label}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
