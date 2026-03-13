import { useState, useMemo } from 'react';
import {
  Info, Users, TrendingUp, DollarSign, Target, Zap, Share2,
  ArrowRight, ArrowDown, BarChart3, Heart, MessageCircle, Eye, Sparkles,
  ArrowUpRight
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   THE READER ACQUISITION GENOME
   ────────────────────────────────────────────────────────────
   The complete reader journey, modeled as a conversion funnel
   with viral coefficients and network effects.

   Based on:
   • SaaS customer acquisition modeling (adapted for publishing)
   • Viral loop theory (K-factor, viral coefficient)
   • Customer Lifetime Value (LTV) modeling
   • Dave McClure's AARRR Pirate Metrics (adapted)
   • Network effect mathematics from Metcalfe's Law

   Stages modeled:
   1. AWARENESS — how many people encounter the book
   2. INTEREST — how many stop and look closer
   3. CONSIDERATION — how many read the sample / reviews
   4. PURCHASE — how many buy
   5. CONSUMPTION — how many actually read it
   6. SATISFACTION — how many enjoy it
   7. ADVOCACY — how many recommend / review
   8. NETWORK EFFECT — each advocate creates new awareness

   THIS IS THE FIRST TIME ANYONE HAS MODELED THE FULL
   READER JOURNEY AS A METRICS-DRIVEN FUNNEL WITH VIRAL LOOPS.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

interface Channel {
  name: string; spent: number; impressions: number;
  ctr: number; // click-through rate (awareness → interest)
  conversionRate: number; // interest → purchase
}

const FUNNEL_STAGES = [
  { id: 'awareness', label: 'Awareness', icon: Eye, color: '#a855f7', tip: 'How many people encounter the book (see cover, ad, post, bookstore display).' },
  { id: 'interest', label: 'Interest', icon: Sparkles, color: '#3b82f6', tip: 'How many stop and engage (click through, pick up, read blurb).' },
  { id: 'consideration', label: 'Consideration', icon: Target, color: '#06b6d4', tip: 'How many read sample pages, check reviews, add to TBR.' },
  { id: 'purchase', label: 'Purchase', icon: DollarSign, color: '#22c55e', tip: 'How many actually buy the book.' },
  { id: 'consumption', label: 'Read', icon: BarChart3, color: '#eab308', tip: 'How many actually read it (not all purchased books are read — avg 60%).' },
  { id: 'satisfaction', label: 'Satisfaction', icon: Heart, color: '#f97316', tip: 'How many enjoy the book enough to rate favorably.' },
  { id: 'advocacy', label: 'Advocacy', icon: MessageCircle, color: '#ec4899', tip: 'How many actively recommend, review, or share.' },
  { id: 'viral', label: 'Viral Loop', icon: Share2, color: '#d4a017', tip: 'Each advocate generates new awareness, completing the viral loop.' },
];

export default function MSReaderGenome() {
  // Channel inputs
  const [channels, setChannels] = useState<Channel[]>([
    { name: 'BookTok/TikTok', spent: 800, impressions: 50000, ctr: 3.5, conversionRate: 2.0 },
    { name: 'Bookstagram', spent: 500, impressions: 25000, ctr: 2.8, conversionRate: 1.8 },
    { name: 'Amazon Ads', spent: 1200, impressions: 80000, ctr: 1.2, conversionRate: 4.5 },
    { name: 'Goodreads', spent: 300, impressions: 15000, ctr: 4.0, conversionRate: 2.5 },
    { name: 'Newsletter', spent: 200, impressions: 5000, ctr: 22.0, conversionRate: 8.0 },
    { name: 'Bookstore Browse', spent: 0, impressions: 3000, ctr: 15.0, conversionRate: 12.0 },
    { name: 'Word of Mouth', spent: 0, impressions: 2000, ctr: 40.0, conversionRate: 15.0 },
    { name: 'ARC Reviews', spent: 400, impressions: 8000, ctr: 5.0, conversionRate: 3.0 },
  ]);

  // Funnel conversion rates
  const [considerationRate, setConsiderationRate] = useState(35); // interest → consideration
  const [completionRate, setCompletionRate] = useState(60); // purchase → actually read
  const [satisfactionRate, setSatisfactionRate] = useState(75); // read → satisfied
  const [advocacyRate, setAdvocacyRate] = useState(20); // satisfied → advocate
  const [viralReach, setViralReach] = useState(8); // people each advocate tells
  const [viralConversion, setViralConversion] = useState(5); // % of viral reach that converts
  const [revenuePerUnit, setRevenuePerUnit] = useState(12.00); // avg revenue per purchase
  const [seriesMultiplier, setSeriesMultiplier] = useState(1.8); // lifetime value multiplier
  const [retentionYears, setRetentionYears] = useState(5);

  const updateChannel = (idx: number, field: keyof Channel, value: string | number) => {
    setChannels(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const analysis = useMemo(() => {
    // Per-channel metrics
    const channelMetrics = channels.map(ch => {
      const interested = Math.round(ch.impressions * ch.ctr / 100);
      const considering = Math.round(interested * considerationRate / 100);
      const purchased = Math.round(interested * ch.conversionRate / 100);
      const cac = purchased > 0 ? ch.spent / purchased : Infinity;
      const revenue = purchased * revenuePerUnit;
      const roas = ch.spent > 0 ? revenue / ch.spent : Infinity;
      return { ...ch, interested, considering, purchased, cac, revenue, roas };
    });

    // Total funnel
    const totalImpressions = channelMetrics.reduce((s, c) => s + c.impressions, 0);
    const totalInterested = channelMetrics.reduce((s, c) => s + c.interested, 0);
    const totalConsidering = Math.round(totalInterested * considerationRate / 100);
    const totalPurchased = channelMetrics.reduce((s, c) => s + c.purchased, 0);
    const totalRead = Math.round(totalPurchased * completionRate / 100);
    const totalSatisfied = Math.round(totalRead * satisfactionRate / 100);
    const totalAdvocates = Math.round(totalSatisfied * advocacyRate / 100);

    // Viral loop
    const viralReachTotal = totalAdvocates * viralReach;
    const viralPurchases = Math.round(viralReachTotal * viralConversion / 100);
    const kFactor = totalPurchased > 0 ? (viralPurchases / totalPurchased) : 0;
    const isViral = kFactor >= 1;

    // Total with viral effect (geometric series for sustained virality)
    const totalWithViral = kFactor >= 1
      ? totalPurchased * 10 // capped at 10× for k≥1 (theoretical infinite)
      : Math.round(totalPurchased / (1 - Math.min(kFactor, 0.99)));

    // Funnel data for visualization
    const funnelData = [
      { ...FUNNEL_STAGES[0], value: totalImpressions },
      { ...FUNNEL_STAGES[1], value: totalInterested },
      { ...FUNNEL_STAGES[2], value: totalConsidering },
      { ...FUNNEL_STAGES[3], value: totalPurchased },
      { ...FUNNEL_STAGES[4], value: totalRead },
      { ...FUNNEL_STAGES[5], value: totalSatisfied },
      { ...FUNNEL_STAGES[6], value: totalAdvocates },
      { ...FUNNEL_STAGES[7], value: viralPurchases },
    ];

    // Financial
    const totalSpent = channels.reduce((s, c) => s + c.spent, 0);
    const firstYearRevenue = totalWithViral * revenuePerUnit;
    const ltv = revenuePerUnit * seriesMultiplier * retentionYears * 0.4; // 40% retention curve
    const blendedCAC = totalPurchased > 0 ? totalSpent / totalPurchased : 0;
    const ltvCacRatio = blendedCAC > 0 ? ltv / blendedCAC : Infinity;

    // Channel efficiency ranking
    const channelRanked = [...channelMetrics]
      .filter(c => c.purchased > 0)
      .sort((a, b) => a.cac - b.cac);

    // Optimal budget reallocation (shift budget to lowest CAC)
    const optimalBudget = (() => {
      const totalBudget = totalSpent;
      const sorted = channelRanked.filter(c => c.cac < Infinity && c.cac > 0);
      if (sorted.length === 0) return [];
      // Allocate inversely proportional to CAC
      const inverseCACs = sorted.map(c => 1 / c.cac);
      const totalInverse = inverseCACs.reduce((s, v) => s + v, 0);
      return sorted.map((c, i) => ({
        name: c.name,
        currentSpent: c.spent,
        optimalSpent: Math.round(totalBudget * (inverseCACs[i] / totalInverse)),
        currentPurchased: c.purchased,
        optimalPurchased: Math.round((totalBudget * (inverseCACs[i] / totalInverse)) / c.cac),
        cac: c.cac,
      }));
    })();

    const optimalTotalPurchased = optimalBudget.reduce((s, c) => s + c.optimalPurchased, 0);
    const reallocationGain = optimalTotalPurchased - totalPurchased;

    return {
      channelMetrics, funnelData, totalImpressions, totalInterested,
      totalConsidering, totalPurchased, totalRead, totalSatisfied,
      totalAdvocates, viralReachTotal, viralPurchases, kFactor, isViral,
      totalWithViral, totalSpent, firstYearRevenue, ltv, blendedCAC,
      ltvCacRatio, channelRanked, optimalBudget, optimalTotalPurchased,
      reallocationGain,
    };
  }, [channels, considerationRate, completionRate, satisfactionRate, advocacyRate,
      viralReach, viralConversion, revenuePerUnit, seriesMultiplier, retentionYears]);

  const inputClass = "w-full bg-void-black border border-border rounded px-2 py-1 text-[11px] text-white focus:border-starforge-gold outline-none font-mono";
  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(0);

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <Share2 className="w-5 h-5 text-pink-400" /> The Reader Acquisition Genome
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          The complete reader journey as a conversion funnel with viral loop mathematics.
          Model awareness → interest → consideration → purchase → read → satisfaction → advocacy → viral spread.
          Calculate viral coefficient (K-factor), lifetime reader value, and optimal channel allocation.
          <strong className="text-starforge-gold"> No one has modeled the full reader journey as a tech startup would model user acquisition.</strong>
        </p>
      </div>

      {/* ═══ VISUAL FUNNEL ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
          <ArrowDown className="w-4 h-4 text-purple-400" /> Reader Journey Funnel
        </h4>
        <div className="space-y-1">
          {analysis.funnelData.map((stage, i) => {
            const maxVal = Math.max(...analysis.funnelData.map(s => s.value));
            const widthPct = maxVal > 0 ? Math.max(5, (stage.value / maxVal * 100)) : 5;
            const Icon = stage.icon;
            const dropoff = i > 0 && analysis.funnelData[i - 1].value > 0
              ? ((1 - stage.value / analysis.funnelData[i - 1].value) * 100).toFixed(0) : null;

            return (
              <div key={stage.id}>
                {i > 0 && dropoff && (
                  <div className="flex items-center px-8 py-0.5">
                    <span className="text-[8px] text-red-400/60 font-mono">↓ {dropoff}% drop-off</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-20 flex items-center gap-1">
                    <Icon className="w-3 h-3" style={{ color: stage.color }} />
                    <span className="text-[9px] text-text-muted truncate">{stage.label}</span>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-6 rounded-sm flex items-center justify-center transition-all"
                      style={{ width: `${widthPct}%`, backgroundColor: `${stage.color}22`, borderLeft: `3px solid ${stage.color}` }}>
                      <span className="text-[10px] font-mono text-text-primary px-2">{fmt(stage.value)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Viral loop indicator */}
        <div className={`mt-3 rounded-lg p-3 text-center ${analysis.isViral ? 'bg-starforge-gold/10 border border-starforge-gold/20' : 'bg-white/[0.02] border border-white/[0.06]'}`}>
          <p className="text-[9px] text-text-muted uppercase mb-1">Viral Coefficient (K-Factor)</p>
          <p className={`font-heading text-3xl ${analysis.kFactor >= 1 ? 'text-starforge-gold' : analysis.kFactor >= 0.5 ? 'text-amber-400' : 'text-text-muted'}`}>
            K = {analysis.kFactor.toFixed(2)}
          </p>
          <p className="text-[10px] text-text-secondary mt-1">
            {analysis.kFactor >= 1 ? '🚀 VIRAL — each reader generates ≥1 new reader. Self-sustaining growth.' :
             analysis.kFactor >= 0.5 ? '📈 Strong word-of-mouth. Amplifies paid marketing significantly.' :
             analysis.kFactor >= 0.2 ? '📊 Moderate organic spread. Standard for literary fiction.' :
             '📉 Low organic spread. Heavily dependent on paid channels.'}
          </p>
          <p className="text-[9px] text-text-muted mt-0.5">
            Each advocate tells {viralReach} people · {viralConversion}% convert · {fmt(analysis.viralPurchases)} viral purchases
          </p>
        </div>
      </div>

      {/* ═══ Funnel Parameters ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Funnel Conversion Parameters
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          <div><label className="block text-[8px] text-text-muted uppercase mb-0.5">Interest→Consider</label><div className="flex items-center gap-1"><input type="number" min={1} max={100} value={considerationRate} onChange={e => setConsiderationRate(+e.target.value)} className={inputClass} /><span className="text-[9px] text-text-muted">%</span></div></div>
          <div><label className="block text-[8px] text-text-muted uppercase mb-0.5">Read Rate</label><div className="flex items-center gap-1"><input type="number" min={1} max={100} value={completionRate} onChange={e => setCompletionRate(+e.target.value)} className={inputClass} /><span className="text-[9px] text-text-muted">%</span></div></div>
          <div><label className="block text-[8px] text-text-muted uppercase mb-0.5">Satisfaction</label><div className="flex items-center gap-1"><input type="number" min={1} max={100} value={satisfactionRate} onChange={e => setSatisfactionRate(+e.target.value)} className={inputClass} /><span className="text-[9px] text-text-muted">%</span></div></div>
          <div><label className="block text-[8px] text-text-muted uppercase mb-0.5">Advocacy Rate</label><div className="flex items-center gap-1"><input type="number" min={1} max={100} value={advocacyRate} onChange={e => setAdvocacyRate(+e.target.value)} className={inputClass} /><span className="text-[9px] text-text-muted">%</span></div></div>
          <div><label className="block text-[8px] text-text-muted uppercase mb-0.5">Viral Reach</label><input type="number" min={1} max={50} value={viralReach} onChange={e => setViralReach(+e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[8px] text-text-muted uppercase mb-0.5">Viral Conv %</label><input type="number" min={0.1} max={50} step={0.5} value={viralConversion} onChange={e => setViralConversion(+e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[8px] text-text-muted uppercase mb-0.5">Rev/Unit ($)</label><input type="number" min={1} max={50} step={0.5} value={revenuePerUnit} onChange={e => setRevenuePerUnit(+e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[8px] text-text-muted uppercase mb-0.5">Series ×</label><input type="number" min={1} max={5} step={0.1} value={seriesMultiplier} onChange={e => setSeriesMultiplier(+e.target.value)} className={inputClass} /></div>
          <div><label className="block text-[8px] text-text-muted uppercase mb-0.5">Retention Yrs</label><input type="number" min={1} max={10} value={retentionYears} onChange={e => setRetentionYears(+e.target.value)} className={inputClass} /></div>
        </div>
      </div>

      {/* ═══ Two-Column: Channel + Financial ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Channel Table */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Channel Performance
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[9px]">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left px-1 py-1 text-text-muted font-ui uppercase">Channel</th>
                <th className="px-1 py-1 text-text-muted font-ui uppercase">Spend</th>
                <th className="px-1 py-1 text-text-muted font-ui uppercase">Impr.</th>
                <th className="px-1 py-1 text-text-muted font-ui uppercase">CTR</th>
                <th className="px-1 py-1 text-text-muted font-ui uppercase">Conv</th>
                <th className="px-1 py-1 text-text-muted font-ui uppercase">Readers</th>
                <th className="px-1 py-1 text-text-muted font-ui uppercase">CAC <TIP text="Customer Acquisition Cost — cost per reader acquired." /></th>
                <th className="px-1 py-1 text-text-muted font-ui uppercase">ROAS <TIP text="Return On Ad Spend — revenue / spend." /></th>
              </tr></thead>
              <tbody>{analysis.channelMetrics.map((ch, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="px-1 py-0.5"><input type="text" value={ch.name} onChange={e => updateChannel(i, 'name', e.target.value)} className="bg-transparent text-text-primary text-[10px] w-full outline-none" /></td>
                  <td className="px-1 py-0.5"><input type="number" min={0} step={100} value={ch.spent} onChange={e => updateChannel(i, 'spent', +e.target.value)} className={inputClass} /></td>
                  <td className="px-1 py-0.5"><input type="number" min={0} step={1000} value={ch.impressions} onChange={e => updateChannel(i, 'impressions', +e.target.value)} className={inputClass} /></td>
                  <td className="px-1 py-0.5"><input type="number" min={0} max={100} step={0.1} value={ch.ctr} onChange={e => updateChannel(i, 'ctr', +e.target.value)} className={inputClass} /></td>
                  <td className="px-1 py-0.5"><input type="number" min={0} max={100} step={0.1} value={ch.conversionRate} onChange={e => updateChannel(i, 'conversionRate', +e.target.value)} className={inputClass} /></td>
                  <td className="px-1 py-0.5 font-mono text-emerald-400 text-center">{ch.purchased}</td>
                  <td className="px-1 py-0.5 font-mono text-center"><span className={ch.cac <= 5 ? 'text-emerald-400' : ch.cac <= 15 ? 'text-amber-400' : 'text-red-400'}>{ch.cac === Infinity ? '∞' : `$${ch.cac.toFixed(2)}`}</span></td>
                  <td className="px-1 py-0.5 font-mono text-center"><span className={ch.roas >= 3 ? 'text-emerald-400' : ch.roas >= 1 ? 'text-amber-400' : 'text-red-400'}>{ch.roas === Infinity ? '∞' : `${ch.roas.toFixed(1)}×`}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        {/* Unit Economics */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Reader Unit Economics
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Total Readers (Paid)</p><p className="font-heading text-xl text-emerald-400">{fmt(analysis.totalPurchased)}</p></div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Readers (+ Viral)</p><p className="font-heading text-xl text-starforge-gold">{fmt(analysis.totalWithViral)}</p></div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Blended CAC</p><p className={`font-heading text-xl ${analysis.blendedCAC <= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>${analysis.blendedCAC.toFixed(2)}</p></div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Lifetime Value</p><p className="font-heading text-xl text-purple-400">${analysis.ltv.toFixed(2)}</p></div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">LTV:CAC Ratio <TIP text="Healthy ratio ≥3×. Under 1× means you lose money acquiring readers." /></p><p className={`font-heading text-xl ${analysis.ltvCacRatio >= 3 ? 'text-emerald-400' : analysis.ltvCacRatio >= 1 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.ltvCacRatio === Infinity ? '∞' : `${analysis.ltvCacRatio.toFixed(1)}×`}</p></div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">1st-Year Revenue</p><p className="font-heading text-xl text-starforge-gold">${Math.round(analysis.firstYearRevenue).toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {/* ═══ Budget Reallocation Optimizer ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-starforge-gold" /> Optimal Budget Reallocation
          <TIP text="Reallocates the same total budget ($${analysis.totalSpent.toLocaleString()}) to maximize reader acquisition by weighting toward lowest-CAC channels." />
        </h4>
        {analysis.optimalBudget.length > 0 ? (
          <>
            <div className="space-y-2">
              {analysis.optimalBudget.map((ch, i) => {
                const increase = ch.optimalSpent > ch.currentSpent;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted w-28 truncate">{ch.name}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <span className="text-[9px] font-mono text-text-muted w-14">${ch.currentSpent}</span>
                      <ArrowRight className={`w-3 h-3 ${increase ? 'text-emerald-400' : 'text-red-400'}`} />
                      <span className={`text-[9px] font-mono w-14 ${increase ? 'text-emerald-400' : 'text-red-400'}`}>${ch.optimalSpent}</span>
                    </div>
                    <span className="text-[9px] font-mono text-text-muted w-16">{ch.currentPurchased}→{ch.optimalPurchased}</span>
                    <span className="text-[8px] font-mono text-text-muted w-14">CAC ${ch.cac.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className={`mt-3 rounded-lg p-3 text-center ${analysis.reallocationGain > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03]'}`}>
              <p className="text-xs text-text-primary">
                Same ${analysis.totalSpent.toLocaleString()} budget → <strong className={analysis.reallocationGain > 0 ? 'text-emerald-400' : 'text-text-primary'}>+{analysis.reallocationGain} additional readers</strong>
                ({analysis.totalPurchased} → {analysis.optimalTotalPurchased})
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs text-text-muted">Add channels with spend to see optimization.</p>
        )}
      </div>
    </div>
  );
}
