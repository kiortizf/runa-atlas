import { useMemo } from 'react';
import {
  FileText, Info, DollarSign, Shield, Zap, TrendingUp, Target,
  AlertTriangle, CheckCircle, ArrowRight, Calendar, BookOpen, Star, ChevronDown
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ACQUISITION MEMO & DEAL FRAMEWORK
   Auto-generated memo • Deal structure • Launch tier
   Risk mitigation • Contract terms • Revenue model • Sensitivity
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

interface MSAcquisitionMemoProps {
  titleName: string;
  authorName: string;
  genre: string;
  wordCount: number;
  compositeScore: number;
  decision: string;
  catScores: { category: string; pct: number }[];
  scores: Record<string, number>;
  strengths: { label: string; score: number }[];
  weaknesses: { label: string; score: number }[];
  editType: string;
  editCostEstimate: string;
  estimatedSales: number;
  estimatedRevenue: number;
  recommendedAdvance: number;
  totalFixedCosts: number;
  breakEvenUnits: number;
  riskLevel: string;
}

// Contract term recommendations
const CONTRACT_TERMS = [
  { term: 'Initial Print Run', category: 'Production', getRecommendation: (score: number) => score >= 70 ? '3,000-5,000 copies' : score >= 50 ? '1,500-3,000 copies' : '1,000-1,500 (print-on-demand primary)', getRisk: (s: number) => s < 50 ? 'HIGH' : 'LOW' },
  { term: 'Rights Term', category: 'Rights', getRecommendation: (score: number) => score >= 70 ? '7 years, auto-revert clause' : '5 years with performance clause', getRisk: () => 'LOW' as const },
  { term: 'Option Clause', category: 'Rights', getRecommendation: (score: number) => score >= 70 ? 'Option on next 2 books (30-day exclusive)' : 'Right of first refusal on next book', getRisk: () => 'LOW' as const },
  { term: 'Subsidiary Rights', category: 'Rights', getRecommendation: (score: number) => score >= 70 ? 'Acquire all subrights (foreign, audio, film/TV)' : 'Acquire print + eBook. Audio/film negotiable.', getRisk: (s: number) => s >= 70 ? 'LOW' : 'MODERATE' },
  { term: 'Advance Structure', category: 'Financial', getRecommendation: (score: number) => score >= 70 ? '50% on signing / 25% on D&A / 25% on pub' : 'One-third each: signing / D&A / publication', getRisk: () => 'LOW' as const },
  { term: 'Royalty Escalators', category: 'Financial', getRecommendation: (score: number) => score >= 70 ? '10% to 5K, 12.5% to 15K, 15% beyond' : '8% to 5K, 10% beyond', getRisk: () => 'LOW' as const },
  { term: 'Marketing Commitment', category: 'Marketing', getRecommendation: (score: number) => score >= 70 ? 'Guaranteed $5K+ marketing, co-op advertising, blog tour, conference appearances' : '$2K-3K digital marketing minimum', getRisk: (s: number) => s < 50 ? 'MODERATE' : 'LOW' },
  { term: 'Out-of-Print Clause', category: 'Rights', getRecommendation: () => 'Rights revert when <50 copies sold in 2 consecutive royalty periods. POD keeps title "in print."', getRisk: () => 'LOW' as const },
  { term: 'Non-Compete', category: 'Author Obligations', getRecommendation: (score: number) => score >= 70 ? 'Limited: no directly competing work within 12 months of pub' : 'Standard: no competing work in same series during contract term', getRisk: () => 'LOW' as const },
  { term: 'Author Copies', category: 'Production', getRecommendation: (score: number) => score >= 70 ? '50 complimentary + at-cost ordering' : '25 complimentary + at-cost ordering', getRisk: () => 'LOW' as const },
];

export default function MSAcquisitionMemo(props: MSAcquisitionMemoProps) {
  const { titleName, authorName, genre, wordCount, compositeScore, decision,
          catScores, scores, strengths, weaknesses, editType, editCostEstimate,
          estimatedSales, estimatedRevenue, recommendedAdvance, totalFixedCosts,
          breakEvenUnits, riskLevel } = props;

  const analysis = useMemo(() => {
    // Launch tier classification
    const launchTier = compositeScore >= 80 ? { tier: 'LEAD TITLE', color: 'text-starforge-gold', bg: 'bg-starforge-gold/10 border-starforge-gold/20', desc: 'Full marketing push. Conference presence. Major review outlets. Trade advertising. Author tour budget.' }
      : compositeScore >= 65 ? { tier: 'MAJOR TITLE', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', desc: 'Strong digital marketing + targeted trade advertising. Blog tour. ARC distribution to 100+ reviewers.' }
      : compositeScore >= 50 ? { tier: 'MIDLIST', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', desc: 'Standard marketing package. Digital ads, NetGalley ARCs, social media posts. Author drives grassroots.' }
      : { tier: 'QUIET RELEASE', color: 'text-text-muted', bg: 'bg-white/[0.02] border-white/[0.06]', desc: 'Minimal marketing. POD primary. Author-driven promotion. Focus on building backlist for long-tail value.' };

    // Resource allocation by tier
    const resourceAlloc = compositeScore >= 80
      ? { editorial: '$8K-12K', design: '$3K-5K', marketing: '$5K-10K', arcs: '150-300', events: '3-5', adBudget: '$3K-5K' }
      : compositeScore >= 65
      ? { editorial: '$5K-8K', design: '$2K-3K', marketing: '$3K-5K', arcs: '75-150', events: '1-2', adBudget: '$1.5K-3K' }
      : compositeScore >= 50
      ? { editorial: '$3K-5K', design: '$1.5K-2.5K', marketing: '$1.5K-3K', arcs: '30-75', events: '0-1', adBudget: '$500-1.5K' }
      : { editorial: '$2K-3K', design: '$1K-1.5K', marketing: '$500-1K', arcs: '15-30', events: '0', adBudget: '$0-500' };

    // Risk mitigation playbook
    const riskMitigation = [
      { risk: 'Low sales volume', severity: scores['comps'] < 5 ? 'HIGH' : 'LOW', mitigation: 'Extend marketing window to 6+ months pre-pub. Increase ARC distribution. Consider pre-order campaign with bonus content.', condition: scores['comps'] < 6 || scores['genre_fit'] < 5 },
      { risk: 'High editorial investment', severity: scores['prose'] < 5 ? 'HIGH' : 'MODERATE', mitigation: 'Phase editing: developmental first, pause for R&R, then line/copy. Reduces risk of investing full edit on manuscript that may not improve.', condition: scores['prose'] < 6 },
      { risk: 'Author platform gap', severity: scores['social'] < 4 && scores['email'] < 4 ? 'HIGH' : 'MODERATE', mitigation: 'Include platform-building guidance in contract. Require author social media/newsletter setup 6 months pre-pub. Consider co-marketing partnerships.', condition: (scores['social'] || 5) < 5 },
      { risk: 'Genre market cooling', severity: scores['genre_fit'] < 4 ? 'HIGH' : 'MODERATE', mitigation: 'Accelerate publication timeline. Consider repositioning with cross-genre marketing. Develop strong non-genre angles for broader audience.', condition: (scores['genre_fit'] || 5) < 6 },
      { risk: 'Earn-out failure', severity: breakEvenUnits > estimatedSales ? 'HIGH' : 'LOW', mitigation: 'Reduce advance or shift to fully-out structure. Increase eBook pricing. Cut non-essential production costs.', condition: breakEvenUnits > estimatedSales * 0.7 },
      { risk: 'No series potential', severity: scores['series'] < 4 ? 'MODERATE' : 'LOW', mitigation: 'Focus marketing on standalone brand. Explore anthology or collaborative universe angles. Maximize single-title revenue with premium editions.', condition: (scores['series'] || 5) < 5 },
      { risk: 'Mission misalignment', severity: scores['diversity'] < 4 ? 'MODERATE' : 'LOW', mitigation: 'Consider if acquisition serves catalog diversity goals even without explicit representation. Explore sensitivity reader engagement.', condition: (scores['diversity'] || 5) < 5 },
      { risk: 'Returns risk (print)', severity: compositeScore < 50 ? 'HIGH' : 'MODERATE', mitigation: 'Start with POD model (no warehousing risk). Offer non-returnable terms with higher discount. Monitor sell-through before offset run.', condition: compositeScore < 60 },
    ].filter(r => r.condition);

    // 5-year revenue model
    const yearlyModel = Array.from({ length: 5 }, (_, yr) => {
      const decayFactor = yr === 0 ? 1.0 : Math.pow(0.65, yr);
      const rev = estimatedRevenue * decayFactor;
      const costs = yr === 0 ? totalFixedCosts + recommendedAdvance : estimatedRevenue * decayFactor * 0.10; // ongoing royalties only
      return { year: yr + 1, revenue: rev, costs, profit: rev - costs };
    });
    const totalLifetimeRev = yearlyModel.reduce((s, y) => s + y.revenue, 0);
    const totalLifetimeCost = yearlyModel.reduce((s, y) => s + y.costs, 0);
    const totalLifetimeProfit = totalLifetimeRev - totalLifetimeCost;

    // Sensitivity: which rubric improvement has most $$ impact
    const sensitivityItems = [
      { label: 'Genre Heat +2 pts', impact: estimatedSales * 0.15 * 2.32, tip: 'Genre trending up means more casual readers discover the title.' },
      { label: 'Comp Strength +2 pts', impact: estimatedSales * 0.12 * 2.32, tip: 'Stronger comps = more confident buyer orders.' },
      { label: 'Author Platform +2 pts', impact: estimatedSales * 0.10 * 2.32, tip: 'Converts passive interest to purchase.' },
      { label: 'Hook Clarity +2 pts', impact: estimatedSales * 0.08 * 2.32, tip: 'Better pitch = better conversion in all channels.' },
      { label: 'Series Commitment', impact: estimatedSales * 0.20 * 2.32, tip: 'Series backlist compound. Each new book lifts all previous titles 15-25%.' },
      { label: 'eBook Price $4.99→$6.99', impact: estimatedSales * 1.5 * 1.40, tip: 'eBook margin increase (higher net per unit).' },
    ].sort((a, b) => b.impact - a.impact);

    // Auto-generated acquisition memo
    const memoDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const catLit = catScores.find(c => c.category === 'Literary Merit');
    const catMkt = catScores.find(c => c.category === 'Market Potential');
    const catPlat = catScores.find(c => c.category === 'Author Platform');

    const memo = `
ACQUISITION MEMORANDUM
═══════════════════════════════════════════
Date: ${memoDate}
Title: ${titleName || '[Title TBD]'}
Author: ${authorName || '[Author TBD]'}
Genre: ${genre}
Word Count: ${wordCount.toLocaleString()}
Composite Score: ${compositeScore.toFixed(1)}% | Decision: ${decision}
Launch Tier: ${launchTier.tier}

─── EVALUATION SUMMARY ───

Literary Merit: ${catLit?.pct.toFixed(0)}% — ${(catLit?.pct || 0) >= 70 ? 'Strong craft supports premium positioning' : (catLit?.pct || 0) >= 50 ? 'Solid writing with room for editorial enhancement' : 'Significant editorial investment required'}
Market Potential: ${catMkt?.pct.toFixed(0)}% — ${(catMkt?.pct || 0) >= 70 ? 'Clear commercial hook in trending space' : (catMkt?.pct || 0) >= 50 ? 'Moderate market positioning, comp-validated' : 'Niche audience, limited comp support'}
Author Platform: ${catPlat?.pct.toFixed(0)}% — ${(catPlat?.pct || 0) >= 70 ? 'Established presence supports launch' : (catPlat?.pct || 0) >= 50 ? 'Growing platform needs publisher support' : 'Platform building required pre-launch'}

Top Strengths: ${strengths.map(s => `${s.label} (${s.score}/10)`).join(', ')}
Key Risks: ${weaknesses.map(s => `${s.label} (${s.score}/10)`).join(', ')}

─── FINANCIAL PROJECTION ───

Estimated First-Year Print Sales: ${estimatedSales.toLocaleString()} units
Estimated First-Year Revenue: $${Math.round(estimatedRevenue).toLocaleString()}
Total Fixed Costs: $${totalFixedCosts.toLocaleString()}
Recommended Advance: $${recommendedAdvance.toLocaleString()}
Break-Even: ${breakEvenUnits.toLocaleString()} units
5-Year Lifetime Revenue: $${Math.round(totalLifetimeRev).toLocaleString()}
5-Year Lifetime Profit: $${Math.round(totalLifetimeProfit).toLocaleString()}

─── EDITORIAL PLAN ───

Required: ${editType}
Estimated Cost: ${editCostEstimate}
Timeline: ${scores['prose'] >= 7 ? '3-4 months' : scores['prose'] >= 5 ? '5-7 months' : '8-12 months'}

─── RECOMMENDATION ───

${decision === 'ACQUIRE' || decision === 'CONSIDER'
  ? `This manuscript ${decision === 'ACQUIRE' ? 'is recommended for acquisition' : 'merits serious consideration'}. ${launchTier.desc}

Advance: $${recommendedAdvance.toLocaleString()} (${(recommendedAdvance / estimatedRevenue * 100).toFixed(0)}% of est. first-year revenue)
Risk Level: ${riskLevel}

${riskMitigation.length > 0 ? 'Key risks to monitor:\n' + riskMitigation.map(r => `• ${r.risk} (${r.severity}): ${r.mitigation}`).join('\n') : 'No significant risks identified.'}`
  : `This manuscript is ${decision === 'REVISE & RESUBMIT' ? 'recommended for R&R with specific feedback' : 'not recommended for acquisition at this time'}.

${decision === 'REVISE & RESUBMIT'
  ? `Priority improvements:\n${weaknesses.map(w => `• ${w.label}: Currently ${w.score}/10, target 7+`).join('\n')}\n\nInvite resubmission after revisions with a 90-day exclusive window.`
  : `Primary concerns:\n${weaknesses.map(w => `• ${w.label}: ${w.score}/10`).join('\n')}`}`}`.trim();

    return { launchTier, resourceAlloc, riskMitigation, yearlyModel, totalLifetimeRev, totalLifetimeProfit, sensitivityItems, memo };
  }, [compositeScore, decision, scores, estimatedSales, estimatedRevenue, recommendedAdvance, totalFixedCosts, breakEvenUnits, riskLevel, catScores, strengths, weaknesses, editType, editCostEstimate, titleName, authorName, genre, wordCount]);

  const fmt = (n: number) => n < 0 ? `-$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* ─── Launch Tier Classification ─── */}
      <div className={`border rounded-xl p-5 ${analysis.launchTier.bg}`}>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[9px] text-text-muted uppercase mb-1">Launch Tier Classification</p>
            <p className={`font-heading text-2xl ${analysis.launchTier.color}`}>{analysis.launchTier.tier}</p>
          </div>
          <div className="w-px h-12 bg-white/[0.1]" />
          <p className="text-xs text-text-secondary flex-1">{analysis.launchTier.desc}</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
          {Object.entries(analysis.resourceAlloc).map(([key, val]) => (
            <div key={key} className="bg-white/[0.03] rounded-lg p-2 text-center">
              <p className="text-[8px] text-text-muted uppercase">{key === 'adBudget' ? 'Ad Budget' : key.charAt(0).toUpperCase() + key.slice(1)}</p>
              <p className="text-[11px] text-text-primary font-mono">{val as string}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Two-Column: 5-Year Model + Contract Terms ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 5-Year Revenue Model */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> 5-Year Title Revenue Model
            <TIP text="Revenue decays ~35%/year (industry average backlist decay). Year 1 includes launch. Costs include advance in Y1, ongoing royalties thereafter." />
          </h3>
          <div className="space-y-2">
            {analysis.yearlyModel.map(yr => {
              const maxRev = Math.max(...analysis.yearlyModel.map(y => y.revenue));
              const barPct = maxRev > 0 ? (yr.revenue / maxRev * 100) : 0;
              return (
                <div key={yr.year} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-8 font-mono">Y{yr.year}</span>
                  <div className="flex-1 h-5 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500/40 to-emerald-500/80 rounded-full" style={{ width: `${barPct}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 w-14 text-right">{fmt(yr.revenue)}</span>
                  <span className={`text-[9px] font-mono w-14 text-right ${yr.profit >= 0 ? 'text-text-secondary' : 'text-red-400'}`}>{fmt(yr.profit)}</span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">5-Year Revenue</p><p className="font-heading text-base text-emerald-400">{fmt(analysis.totalLifetimeRev)}</p></div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">5-Year Profit</p><p className={`font-heading text-base ${analysis.totalLifetimeProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(analysis.totalLifetimeProfit)}</p></div>
          </div>
        </div>

        {/* Contract Terms */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Contract Term Recommendations
            <TIP text="Recommended deal terms based on manuscript score and market position. Green = favorable, yellow = negotiate carefully, red = high risk." />
          </h3>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {CONTRACT_TERMS.map(ct => {
              const rec = ct.getRecommendation(compositeScore);
              const risk = ct.getRisk(compositeScore);
              return (
                <div key={ct.term} className="flex items-start gap-2 py-1.5 border-b border-white/[0.04]">
                  <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${risk === 'HIGH' ? 'bg-red-500' : risk === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1">
                    <p className="text-[10px] text-text-primary font-medium">{ct.term} <span className="text-[8px] text-text-muted font-mono">({ct.category})</span></p>
                    <p className="text-[10px] text-text-secondary">{rec}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Risk Mitigation + Sensitivity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Risk Mitigation Playbook */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Risk Mitigation Playbook
            <TIP text="Specific, actionable mitigation strategies for each identified risk. Generated from rubric scores and financial projections." />
          </h3>
          {analysis.riskMitigation.length === 0 ? (
            <p className="text-xs text-emerald-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> No significant risks identified. All factors within acceptable ranges.</p>
          ) : (
            <div className="space-y-3">
              {analysis.riskMitigation.map((r, i) => (
                <div key={i} className={`rounded-lg p-3 ${r.severity === 'HIGH' ? 'bg-red-500/5 border border-red-500/10' : r.severity === 'MODERATE' ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-white/[0.02] border border-white/[0.04]'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-ui uppercase px-1.5 py-0.5 rounded ${r.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : r.severity === 'MODERATE' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{r.severity}</span>
                    <span className="text-[11px] text-text-primary font-medium">{r.risk}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary">{r.mitigation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Score Sensitivity */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" /> Revenue Sensitivity
            <TIP text="Shows which improvements would have the largest financial impact. Focus on high-leverage changes first." />
          </h3>
          <div className="space-y-2">
            {analysis.sensitivityItems.map((item, i) => {
              const maxImpact = Math.max(...analysis.sensitivityItems.map(s => s.impact));
              const barPct = maxImpact > 0 ? (item.impact / maxImpact * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-36 truncate" title={item.label}>{item.label}</span>
                  <div className="flex-1 h-4 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500/40 to-purple-500/80 rounded-full" style={{ width: `${barPct}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 w-16 text-right">+{fmt(Math.round(item.impact))}</span>
                  <TIP text={item.tip} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Auto-Generated Acquisition Memo ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-sm text-text-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-starforge-gold" /> Acquisition Memorandum
            <TIP text="Auto-generated professional acquisition memo. Copy and distribute to acquisition committee. Updates in real-time as you adjust scores." />
          </h3>
          <button onClick={() => navigator.clipboard.writeText(analysis.memo)} className="px-3 py-1 bg-starforge-gold/10 text-starforge-gold text-[10px] font-ui rounded-lg hover:bg-starforge-gold/20 transition-colors">
            📋 Copy to Clipboard
          </button>
        </div>
        <pre className="bg-void-black border border-white/[0.06] rounded-lg p-4 text-[11px] text-text-secondary font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
          {analysis.memo}
        </pre>
      </div>
    </div>
  );
}
