import { useState, useMemo } from 'react';
import { Layers, Info, TrendingUp, DollarSign, Target, ArrowRight, Zap, Calendar, BookOpen, BarChart3 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   SCENARIO PLANNER & OPTIMIZER
   Best/Base/Worst scenarios • Backlist decay model • Format mix optimizer
   Rights revenue forecasting • Path-to-profitability optimizer
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

interface Scenario {
  label: string; color: string; printUnits: number; ebookRatio: number; audioRatio: number;
  returnRate: number; listPrice: number; wholesaleDisc: number;
  marketingCost: number; advance: number;
}

function computeScenarioP(s: Scenario, printCost: number, editorialCost: number, designCost: number, audioProdCost: number) {
  const netPrint = Math.round(s.printUnits * (1 - s.returnRate / 100));
  const eUnits = Math.round(s.printUnits * s.ebookRatio);
  const aUnits = Math.round(s.printUnits * s.audioRatio);
  const pNet = s.listPrice * (1 - s.wholesaleDisc / 100) - printCost - s.listPrice * 0.01875;
  const printRev = netPrint * pNet;
  const ebookRev = eUnits * 4.99 * 0.70;
  const audioRev = aUnits * 24.99 * 0.40;
  const totalRev = printRev + ebookRev + audioRev;
  const royalty = totalRev * 0.10;
  const authorPay = s.advance + Math.max(0, royalty - s.advance);
  const fixed = editorialCost + designCost + s.marketingCost + audioProdCost;
  const profit = totalRev - fixed - authorPay;
  const margin = totalRev > 0 ? (profit / totalRev * 100) : 0;
  return { totalUnits: netPrint + eUnits + aUnits, totalRev, profit, margin, printRev, ebookRev, audioRev, authorPay, fixed };
}

export default function CalcScenarios() {
  // Shared costs
  const [printCost, setPrintCost] = useState(5.01);
  const [editorialCost, setEditorialCost] = useState(5000);
  const [designCost, setDesignCost] = useState(1500);
  const [audioProdCost, setAudioProdCost] = useState(3000);

  // Three scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { label: '🔴 Worst Case', color: 'red', printUnits: 300, ebookRatio: 0.8, audioRatio: 0.15, returnRate: 30, listPrice: 16.99, wholesaleDisc: 55, marketingCost: 1000, advance: 3000 },
    { label: '🟡 Base Case', color: 'amber', printUnits: 1000, ebookRatio: 1.5, audioRatio: 0.3, returnRate: 15, listPrice: 16.99, wholesaleDisc: 55, marketingCost: 2500, advance: 3000 },
    { label: '🟢 Best Case', color: 'emerald', printUnits: 3000, ebookRatio: 2.5, audioRatio: 0.5, returnRate: 8, listPrice: 16.99, wholesaleDisc: 55, marketingCost: 5000, advance: 3000 },
  ]);

  // Rights revenue
  const [foreignDeals, setForeignDeals] = useState(0);
  const [foreignAvgDeal, setForeignAvgDeal] = useState(2000);
  const [filmOption, setFilmOption] = useState(0);
  const [audioLicense, setAudioLicense] = useState(0);

  const updateScenario = (idx: number, field: keyof Scenario, value: number) => {
    setScenarios(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const analysis = useMemo(() => {
    const results = scenarios.map(s => computeScenarioP(s, printCost, editorialCost, designCost, audioProdCost));

    // Backlist decay model (base case, 10 years)
    const baseResult = results[1];
    const backlist = Array.from({ length: 10 }, (_, yr) => {
      const decayFactor = yr === 0 ? 1.0 : Math.pow(0.65, yr); // 35% annual decay
      const frontlistBoost = yr <= 1 ? 1.0 : yr <= 3 ? 0.3 : yr <= 5 ? 0.1 : 0;
      const yearRev = baseResult.totalRev * decayFactor + (yr > 0 ? baseResult.totalRev * frontlistBoost : 0);
      // Fixed costs only in year 0
      const yearCost = yr === 0 ? baseResult.fixed + baseResult.authorPay : baseResult.authorPay * decayFactor * 0.5;
      return { year: yr + 1, revenue: yearRev, cost: yearCost, profit: yearRev - yearCost };
    });

    const cumulativeProfit = backlist.reduce((acc, yr) => {
      const last = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(last + yr.profit);
      return acc;
    }, [] as number[]);

    const breakEvenYear = cumulativeProfit.findIndex(c => c >= 0) + 1;

    // Rights revenue
    const rightsTotal = (foreignDeals * foreignAvgDeal) + filmOption + audioLicense;
    const rightsAuthorShare = rightsTotal * 0.50; // typically 50/50 split
    const rightsPublisherNet = rightsTotal - rightsAuthorShare;

    // Format mix optimizer: find optimal ratio
    const formatMixes: { printPct: number; ebookPct: number; audioPct: number; profit: number }[] = [];
    for (let ep = 0; ep <= 80; ep += 10) {
      for (let ap = 0; ap <= 80 - ep; ap += 10) {
        const pp = 100 - ep - ap;
        if (pp < 10) continue;
        const totalEquivUnits = 1000; // normalize to 1000 total
        const pUnits = Math.round(totalEquivUnits * pp / 100);
        const eUnits = Math.round(totalEquivUnits * ep / 100);
        const aUnits = Math.round(totalEquivUnits * ap / 100);
        const pNet = 16.99 * 0.45 - printCost - 16.99 * 0.01875;
        const rev = pUnits * pNet + eUnits * 4.99 * 0.70 + aUnits * 24.99 * 0.40;
        const costs = editorialCost + designCost + 2500 + (aUnits > 0 ? audioProdCost : 0) + 3000 + rev * 0.10;
        formatMixes.push({ printPct: pp, ebookPct: ep, audioPct: ap, profit: rev - costs });
      }
    }
    const optimalMix = formatMixes.reduce((best, m) => m.profit > best.profit ? m : best, formatMixes[0]);

    // Path to profitability: what changes make worst case profitable?
    const worstResult = results[0];
    const pathActions = [];
    let adjustedProfit = worstResult.profit;
    const addAction = (action: string, impact: number) => { adjustedProfit += impact; pathActions.push({ action, impact, cumulative: adjustedProfit }); };

    if (worstResult.profit < 0) {
      // Reduce advance
      const advanceReduction = Math.min(scenarios[0].advance - 500, Math.abs(adjustedProfit) * 0.3);
      if (advanceReduction > 0) addAction(`Reduce advance by $${Math.round(advanceReduction).toLocaleString()}`, advanceReduction);
      // Lower wholesale discount
      const discSaving = scenarios[0].printUnits * (1 - scenarios[0].returnRate / 100) * scenarios[0].listPrice * 0.15;
      if (adjustedProfit < 0) addAction('Switch to 40% wholesale (online only)', discSaving);
      // Reduce editorial
      const editSave = Math.min(editorialCost - 2000, Math.abs(adjustedProfit) * 0.3);
      if (editSave > 0 && adjustedProfit < 0) addAction(`Reduce editorial scope (-$${Math.round(editSave).toLocaleString()})`, editSave);
      // Increase eBook ratio via marketing
      const ebookBoost = scenarios[0].printUnits * 0.5 * 4.99 * 0.70;
      if (adjustedProfit < 0) addAction('Boost eBook marketing (add 0.5× ratio)', ebookBoost);
      // Raise list price $2
      const priceLift = scenarios[0].printUnits * (1 - scenarios[0].returnRate / 100) * 2 * 0.45;
      if (adjustedProfit < 0) addAction('Raise list price by $2', priceLift);
      // Cut audio production
      if (adjustedProfit < 0) addAction('Defer audiobook to year 2', audioProdCost);
    }

    return { results, backlist, cumulativeProfit, breakEvenYear, rightsTotal, rightsPublisherNet, rightsAuthorShare, optimalMix, formatMixes, pathActions, worstResult };
  }, [scenarios, printCost, editorialCost, designCost, audioProdCost, foreignDeals, foreignAvgDeal, filmOption, audioLicense]);

  const fmt = (n: number) => n < 0 ? `-$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const inputClass = "w-full bg-void-black border border-border rounded-lg px-2 py-1 text-xs text-white focus:border-starforge-gold outline-none font-mono";
  const labelClass = "block text-[9px] text-text-muted font-ui uppercase tracking-wider mb-0.5";

  return (
    <div className="space-y-6">
      {/* ─── Scenario Comparison Table ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <Layers className="w-4 h-4 text-starforge-gold" />
          <h3 className="font-heading text-sm text-text-primary">Scenario Comparison</h3>
          <TIP text="Model worst/base/best outcomes side by side. Adjust each scenario's inputs independently." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-4 py-2.5 text-text-muted font-ui uppercase text-[9px]">Parameter</th>
              {scenarios.map((s, i) => <th key={i} className="px-3 py-2.5 text-text-muted font-ui uppercase text-[9px] text-center">{s.label}</th>)}
            </tr></thead>
            <tbody>
              {[
                { label: 'Print Sales', field: 'printUnits' as const, step: 100 },
                { label: 'eBook:Print Ratio', field: 'ebookRatio' as const, step: 0.1 },
                { label: 'Audio:Print Ratio', field: 'audioRatio' as const, step: 0.05 },
                { label: 'Return Rate %', field: 'returnRate' as const, step: 1 },
                { label: 'Marketing $', field: 'marketingCost' as const, step: 500 },
                { label: 'Advance $', field: 'advance' as const, step: 500 },
              ].map(row => (
                <tr key={row.field} className="border-b border-white/[0.03]">
                  <td className="px-4 py-1.5 text-text-secondary">{row.label}</td>
                  {scenarios.map((s, i) => (
                    <td key={i} className="px-2 py-1"><input type="number" step={row.step} value={s[row.field]} onChange={e => updateScenario(i, row.field, +e.target.value)} className={inputClass} /></td>
                  ))}
                </tr>
              ))}
              {/* Results rows */}
              <tr className="border-t-2 border-starforge-gold/20"><td className="px-4 py-2 text-starforge-gold font-ui uppercase text-[9px]">Results</td>{scenarios.map((_, i) => <td key={i} />)}</tr>
              <tr><td className="px-4 py-1.5 text-text-secondary">Total Revenue</td>{analysis.results.map((r, i) => <td key={i} className="px-3 py-1.5 text-center font-mono text-emerald-400">{fmt(r.totalRev)}</td>)}</tr>
              <tr><td className="px-4 py-1.5 text-text-secondary">Total Costs</td>{analysis.results.map((r, i) => <td key={i} className="px-3 py-1.5 text-center font-mono text-red-400">{fmt(r.fixed + r.authorPay)}</td>)}</tr>
              <tr className="font-bold"><td className="px-4 py-2 text-text-primary">Net Profit</td>{analysis.results.map((r, i) => <td key={i} className={`px-3 py-2 text-center font-mono ${r.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(r.profit)}</td>)}</tr>
              <tr><td className="px-4 py-1.5 text-text-secondary">Margin</td>{analysis.results.map((r, i) => <td key={i} className={`px-3 py-1.5 text-center font-mono ${r.margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{r.margin.toFixed(1)}%</td>)}</tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Two-Row: Backlist + Format Optimizer ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Backlist Revenue Decay (10 year) */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> 10-Year Backlist Model
            <TIP text="Shows how revenue decays over time with 35%/year natural decline. Year 1 includes launch marketing effect. Cumulative shows total value over title lifetime." />
          </h3>
          <div className="space-y-1.5">
            {analysis.backlist.map((yr, i) => {
              const maxRev = Math.max(...analysis.backlist.map(b => b.revenue));
              const barPct = maxRev > 0 ? (yr.revenue / maxRev * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-8 font-mono">Y{yr.year}</span>
                  <div className="flex-1 h-4 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500/40 to-cyan-500/80 rounded-full transition-all" style={{ width: `${barPct}%` }} />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 w-14 text-right">{fmt(yr.revenue)}</span>
                  <span className={`text-[9px] font-mono w-16 text-right ${analysis.cumulativeProfit[i] >= 0 ? 'text-text-secondary' : 'text-red-400'}`}>Σ {fmt(analysis.cumulativeProfit[i])}</span>
                </div>
              );
            })}
            <div className={`mt-2 pt-2 border-t border-white/[0.06] text-center text-xs ${analysis.breakEvenYear > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {analysis.breakEvenYear > 0 ? `📈 Title breaks even in Year ${analysis.breakEvenYear}` : '⚠️ Title does not break even within 10 years'}
            </div>
          </div>
        </div>

        {/* Format Mix Optimizer */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" /> Format Mix Optimizer
            <TIP text="Finds the optimal print/eBook/audio split for maximum profit, normalized to 1000 total units. eBooks have highest margin (no manufacturing cost)." />
          </h3>
          <div className="text-center mb-4">
            <p className="text-[9px] text-text-muted uppercase mb-1">Optimal Mix for Max Profit</p>
            <div className="flex items-center justify-center gap-4">
              <div><p className="font-heading text-2xl text-amber-400">{analysis.optimalMix.printPct}%</p><p className="text-[9px] text-text-muted">Print</p></div>
              <div><p className="font-heading text-2xl text-cyan-400">{analysis.optimalMix.ebookPct}%</p><p className="text-[9px] text-text-muted">eBook</p></div>
              <div><p className="font-heading text-2xl text-purple-400">{analysis.optimalMix.audioPct}%</p><p className="text-[9px] text-text-muted">Audio</p></div>
            </div>
            <p className={`text-sm font-mono mt-2 ${analysis.optimalMix.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Profit @ optimal: {fmt(analysis.optimalMix.profit)}</p>
          </div>
          {/* Visual bar for top 5 mixes */}
          <div className="space-y-1.5">
            <p className="text-[9px] text-text-muted uppercase">Top 5 Most Profitable Mixes</p>
            {[...analysis.formatMixes].sort((a, b) => b.profit - a.profit).slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="text-text-muted w-32">{m.printPct}P / {m.ebookPct}E / {m.audioPct}A</span>
                <div className="flex-1 flex h-4 rounded-full overflow-hidden">
                  <div className="bg-amber-500/50 h-full" style={{ width: `${m.printPct}%` }} />
                  <div className="bg-cyan-500/50 h-full" style={{ width: `${m.ebookPct}%` }} />
                  <div className="bg-purple-500/50 h-full" style={{ width: `${m.audioPct}%` }} />
                </div>
                <span className={`font-mono w-16 text-right ${m.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(m.profit)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Rights Revenue ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-starforge-gold" /> Rights Revenue Forecasting
          <TIP text="Model subsidiary rights income: foreign translation deals, film/TV options, and audio licensing. Typically 50/50 split with author." />
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div><label className={labelClass}>Foreign Deals (#) <TIP text="Number of foreign translation deals. Average SFF = 0-3 for debut." /></label><input type="number" min={0} max={20} value={foreignDeals} onChange={e => setForeignDeals(+e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Avg Deal Value ($) <TIP text="Per-territory advance. Range: $500-$50K depending on territory and demand." /></label><input type="number" min={0} step={500} value={foreignAvgDeal} onChange={e => setForeignAvgDeal(+e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Film/TV Option ($) <TIP text="Option payment for screen adaptation rights. Range: $0-$100K+. Most titles = $0." /></label><input type="number" min={0} step={1000} value={filmOption} onChange={e => setFilmOption(+e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Audio License ($) <TIP text="Separate audio rights license (if not self-produced). Findaway Select or direct deal." /></label><input type="number" min={0} step={500} value={audioLicense} onChange={e => setAudioLicense(+e.target.value)} className={inputClass} /></div>
        </div>
        {analysis.rightsTotal > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Total Rights Income</p><p className="font-heading text-lg text-starforge-gold">{fmt(analysis.rightsTotal)}</p></div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Publisher Net (50%)</p><p className="font-heading text-lg text-emerald-400">{fmt(analysis.rightsPublisherNet)}</p></div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Author Share (50%)</p><p className="font-heading text-lg text-purple-400">{fmt(analysis.rightsAuthorShare)}</p></div>
          </div>
        )}
      </div>

      {/* ─── Path to Profitability ─── */}
      <div className={`border rounded-xl p-5 ${analysis.worstResult.profit >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Path to Profitability
          <TIP text="Starting from worst-case scenario, this shows sequential optimization steps to reach break-even. Each action shows incremental and cumulative profit impact." />
        </h3>
        {analysis.worstResult.profit >= 0 ? (
          <p className="text-sm text-emerald-400">✅ Even worst-case scenario is profitable. No optimization needed.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-red-400 mb-3">
              <span>Starting point: Worst case profit = {fmt(analysis.worstResult.profit)}</span>
            </div>
            {analysis.pathActions.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-text-muted flex-shrink-0">{i + 1}</span>
                <div className="flex-1 text-xs text-text-secondary">{a.action}</div>
                <span className="text-[10px] font-mono text-emerald-400 flex-shrink-0">+{fmt(a.impact)}</span>
                <ArrowRight className="w-3 h-3 text-text-muted flex-shrink-0" />
                <span className={`text-[10px] font-mono w-16 text-right flex-shrink-0 ${a.cumulative >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(a.cumulative)}</span>
                {a.cumulative >= 0 && i === analysis.pathActions.findIndex(x => x.cumulative >= 0) && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full flex-shrink-0">✅ PROFITABLE</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
