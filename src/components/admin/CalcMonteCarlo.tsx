import { useState, useMemo, useCallback } from 'react';
import { Dice6, Info, TrendingUp, Target, AlertTriangle, CheckCircle, BarChart3, Zap } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   MONTE CARLO SIMULATOR
   10,000-iteration probabilistic forecasting engine.
   Models uncertainty across all key publishing variables.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

interface VarRange { label: string; min: number; max: number; mode: number; unit: string; tip: string; }

// Triangular distribution sampler
function triangular(min: number, max: number, mode: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);
  if (u < fc) return min + Math.sqrt(u * (max - min) * (mode - min));
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

const ITERATIONS = 10000;

export default function CalcMonteCarlo() {
  const [vars, setVars] = useState<Record<string, VarRange>>({
    listPrice:     { label: 'List Price', min: 13.99, max: 19.99, mode: 16.99, unit: '$', tip: 'Retail paperback price. Affects wholesale net, perception, and volume.' },
    printUnits:    { label: 'First-Year Print Sales', min: 200, max: 5000, mode: 1000, unit: 'units', tip: 'Total print units sold in first 12 months across all channels.' },
    ebookMultiple: { label: 'eBook:Print Ratio', min: 0.5, max: 3.0, mode: 1.5, unit: '×', tip: 'eBook sales as multiplier of print. Genre-dependent: romance=3×, SFF=1.5×, literary=0.8×.' },
    audioMultiple: { label: 'Audio:Print Ratio', min: 0.1, max: 0.8, mode: 0.3, unit: '×', tip: 'Audiobook sales as multiplier of print. Growing 25%/year industry-wide.' },
    wholesaleDisc: { label: 'Wholesale Discount', min: 40, max: 55, mode: 55, unit: '%', tip: '55% for bookstore placement via Ingram. 40% for online-only.' },
    returnRate:    { label: 'Return Rate', min: 5, max: 40, mode: 15, unit: '%', tip: 'Industry avg 25-30% for large publishers. Small press 10-20% typical.' },
    printCost:     { label: 'Print Cost/Unit', min: 3.50, max: 7.00, mode: 5.01, unit: '$', tip: 'Manufacturing cost per book. Varies by page count, trim, paper type.' },
    authorRoyalty:  { label: 'Author Royalty Rate', min: 8, max: 15, mode: 10, unit: '%', tip: 'Net royalty on publisher receipts. Standard range 8-15% for small press.' },
    advance:       { label: 'Author Advance', min: 500, max: 10000, mode: 3000, unit: '$', tip: 'Upfront payment against future royalties.' },
    editorialCost: { label: 'Editorial Cost', min: 2000, max: 10000, mode: 5000, unit: '$', tip: 'All editing: developmental, line, copy, proofread.' },
    designCost:    { label: 'Design Cost', min: 800, max: 3000, mode: 1500, unit: '$', tip: 'Cover design + interior layout.' },
    marketingCost: { label: 'Marketing Budget', min: 500, max: 10000, mode: 2500, unit: '$', tip: 'Launch marketing: ads, ARCs, events, promos.' },
    ebookPrice:    { label: 'eBook Price', min: 2.99, max: 9.99, mode: 4.99, unit: '$', tip: 'Amazon takes 30% (at 70% royalty tier).' },
    audioPrice:    { label: 'Audiobook Price', min: 14.99, max: 29.99, mode: 24.99, unit: '$', tip: 'Findaway nets ~40% of list to publisher.' },
    audioProdCost: { label: 'Audio Production', min: 1500, max: 8000, mode: 3000, unit: '$', tip: 'Per-finished-hour narration × book length.' },
  });

  const [simRun, setSimRun] = useState(0); // trigger re-simulation

  const updateVar = useCallback((key: string, field: 'min' | 'max' | 'mode', value: number) => {
    setVars(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }, []);

  const results = useMemo(() => {
    const profits: number[] = [];
    const revenues: number[] = [];
    const unitsSold: number[] = [];
    const breakEvens: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const v: Record<string, number> = {};
      for (const [key, range] of Object.entries(vars)) {
        v[key] = triangular(range.min, range.max, range.mode);
      }

      // Calculate P&L for this iteration
      const printUnits = Math.round(v.printUnits * (1 - v.returnRate / 100));
      const ebookUnits = Math.round(v.printUnits * v.ebookMultiple);
      const audioUnits = Math.round(v.printUnits * v.audioMultiple);
      const totalUnits = printUnits + ebookUnits + audioUnits;

      const printNet = v.listPrice * (1 - v.wholesaleDisc / 100) - v.printCost - v.listPrice * 0.01875;
      const printRev = printUnits * printNet;
      const ebookNet = v.ebookPrice * 0.70; // Amazon 70% tier
      const ebookRev = ebookUnits * ebookNet;
      const audioNet = v.audioPrice * 0.40; // Findaway
      const audioRev = audioUnits * audioNet;
      const totalRev = printRev + ebookRev + audioRev;

      const authorRoyaltyTotal = totalRev * (v.authorRoyalty / 100);
      const authorPayout = v.advance + Math.max(0, authorRoyaltyTotal - v.advance);
      const fixedCosts = v.editorialCost + v.designCost + v.marketingCost + v.audioProdCost;
      const totalCosts = fixedCosts + authorPayout;
      const profit = totalRev - totalCosts;

      const breakEven = printNet > 0 ? Math.ceil((fixedCosts + v.advance) / printNet) : 99999;

      profits.push(profit);
      revenues.push(totalRev);
      unitsSold.push(totalUnits);
      breakEvens.push(breakEven);
    }

    // Sort for percentiles
    const sortedProfits = [...profits].sort((a, b) => a - b);
    const sortedRevenues = [...revenues].sort((a, b) => a - b);
    const sortedUnits = [...unitsSold].sort((a, b) => a - b);

    const pctile = (arr: number[], p: number) => arr[Math.floor(arr.length * p / 100)];
    const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const stdev = (arr: number[]) => {
      const m = avg(arr);
      return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
    };

    // Histogram bins for profit
    const profitMin = sortedProfits[0];
    const profitMax = sortedProfits[sortedProfits.length - 1];
    const binCount = 40;
    const binWidth = (profitMax - profitMin) / binCount || 1;
    const histogram = Array.from({ length: binCount }, (_, i) => {
      const lo = profitMin + i * binWidth;
      const hi = lo + binWidth;
      const count = profits.filter(p => p >= lo && p < hi).length;
      return { lo, hi, count, pct: count / ITERATIONS * 100 };
    });
    const maxBin = Math.max(...histogram.map(h => h.count));

    const profitableCount = profits.filter(p => p > 0).length;
    const probabilityOfProfit = (profitableCount / ITERATIONS * 100);

    return {
      profit: { p10: pctile(sortedProfits, 10), p25: pctile(sortedProfits, 25), p50: pctile(sortedProfits, 50), p75: pctile(sortedProfits, 75), p90: pctile(sortedProfits, 90), mean: avg(profits), stdev: stdev(profits) },
      revenue: { p10: pctile(sortedRevenues, 10), p50: pctile(sortedRevenues, 50), p90: pctile(sortedRevenues, 90), mean: avg(revenues) },
      units: { p10: pctile(sortedUnits, 10), p50: pctile(sortedUnits, 50), p90: pctile(sortedUnits, 90), mean: avg(unitsSold) },
      breakEven: { mean: avg(breakEvens), median: pctile([...breakEvens].sort((a, b) => a - b), 50) },
      probabilityOfProfit,
      histogram, maxBin,
    };
  }, [vars, simRun]);

  const fmt = (n: number) => n < 0 ? `-$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const inputClass = "w-full bg-void-black border border-border rounded-lg px-2 py-1 text-xs text-white focus:border-starforge-gold outline-none font-mono";
  const labelClass = "block text-[9px] text-text-muted font-ui uppercase tracking-wider mb-0.5";

  return (
    <div className="space-y-6">
      {/* ─── Probability of Profit Banner ─── */}
      <div className={`border rounded-xl p-6 text-center ${results.probabilityOfProfit >= 70 ? 'bg-emerald-500/5 border-emerald-500/20' : results.probabilityOfProfit >= 40 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Probability of Profitability (across {ITERATIONS.toLocaleString()} simulations)</p>
        <p className={`font-heading text-6xl ${results.probabilityOfProfit >= 70 ? 'text-emerald-400' : results.probabilityOfProfit >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
          {results.probabilityOfProfit.toFixed(1)}%
        </p>
        <p className="text-xs text-text-secondary mt-2">
          {results.probabilityOfProfit >= 80 ? '🟢 Strong economic position. This title profile sustains investment.'
            : results.probabilityOfProfit >= 60 ? '🟡 Moderately favorable. Optimize key levers to improve odds.'
            : results.probabilityOfProfit >= 40 ? '🟠 Risky. Significant downside scenarios exist. Review sensitivity.'
            : '🔴 High risk of loss. Restructure deal terms or reduce fixed costs before proceeding.'}
        </p>
      </div>

      {/* ─── Distribution Histogram ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-sm text-text-primary mb-1 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-starforge-gold" /> Profit Distribution
          <TIP text="Each bar = a range of profit outcomes. Height = how many of the 10,000 simulations landed in that range. Red = loss, green = profit." />
        </h3>
        <p className="text-[10px] text-text-muted mb-4">
          P10: {fmt(results.profit.p10)} · P50: {fmt(results.profit.p50)} · P90: {fmt(results.profit.p90)} · σ = {fmt(results.profit.stdev)}
        </p>
        <div className="flex items-end gap-px h-32">
          {results.histogram.map((bin, i) => {
            const heightPct = results.maxBin > 0 ? (bin.count / results.maxBin * 100) : 0;
            const isLoss = bin.hi <= 0;
            const isBreakEven = bin.lo <= 0 && bin.hi > 0;
            return (
              <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full rounded-t-sm transition-all ${isLoss ? 'bg-red-500/60' : isBreakEven ? 'bg-amber-500/60' : 'bg-emerald-500/60'} group-hover:opacity-80`}
                  style={{ height: `${heightPct}%`, minHeight: bin.count > 0 ? '2px' : '0' }}
                />
                <span className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:block bg-void-black border border-white/10 rounded px-2 py-1 text-[9px] text-text-secondary whitespace-nowrap z-10">
                  {fmt(bin.lo)} to {fmt(bin.hi)}: {bin.count} runs ({bin.pct.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-text-muted mt-1">
          <span>{fmt(results.histogram[0]?.lo || 0)}</span>
          <span className="text-amber-400">$0 break-even</span>
          <span>{fmt(results.histogram[results.histogram.length - 1]?.hi || 0)}</span>
        </div>
      </div>

      {/* ─── Confidence Intervals ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profit */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="text-[10px] text-text-muted uppercase font-ui tracking-wider mb-3">Profit Confidence</h4>
          <div className="space-y-2 text-xs">
            {[
              { label: 'P10 (Pessimistic)', value: results.profit.p10, desc: '90% chance of doing better' },
              { label: 'P25 (Conservative)', value: results.profit.p25, desc: '75% chance of doing better' },
              { label: 'P50 (Most Likely)', value: results.profit.p50, desc: 'Median outcome' },
              { label: 'P75 (Optimistic)', value: results.profit.p75, desc: '25% chance of doing better' },
              { label: 'P90 (Best Case)', value: results.profit.p90, desc: '10% chance of doing better' },
            ].map(p => (
              <div key={p.label} className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                <div>
                  <span className="text-text-secondary">{p.label}</span>
                  <span className="text-[9px] text-text-muted ml-2">{p.desc}</span>
                </div>
                <span className={`font-mono font-medium ${p.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(p.value)}</span>
              </div>
            ))}
            <div className="pt-2 flex justify-between font-medium">
              <span className="text-text-primary">Expected Value (Mean)</span>
              <span className={`font-mono ${results.profit.mean >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(results.profit.mean)}</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="text-[10px] text-text-muted uppercase font-ui tracking-wider mb-3">Revenue Confidence</h4>
          <div className="space-y-2 text-xs">
            {[
              { label: 'P10 (Worst Case)', value: results.revenue.p10 },
              { label: 'P50 (Median)', value: results.revenue.p50 },
              { label: 'P90 (Upside)', value: results.revenue.p90 },
              { label: 'Mean', value: results.revenue.mean },
            ].map(p => (
              <div key={p.label} className="flex justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-text-secondary">{p.label}</span>
                <span className="font-mono text-emerald-400">{fmt(p.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Units */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="text-[10px] text-text-muted uppercase font-ui tracking-wider mb-3">Volume Confidence</h4>
          <div className="space-y-2 text-xs">
            {[
              { label: 'P10 (Worst Case)', value: results.units.p10 },
              { label: 'P50 (Median)', value: results.units.p50 },
              { label: 'P90 (Upside)', value: results.units.p90 },
              { label: 'Break-Even (Median)', value: results.breakEven.median },
            ].map(p => (
              <div key={p.label} className="flex justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-text-secondary">{p.label}</span>
                <span className="font-mono text-text-primary">{Math.round(p.value).toLocaleString()} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Variable Inputs ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-sm text-text-primary flex items-center gap-2">
            <Dice6 className="w-4 h-4 text-purple-400" /> Simulation Variables
            <TIP text="Set min/max/mode for each variable. The simulator samples from triangular distributions to model realistic uncertainty." />
          </h3>
          <button onClick={() => setSimRun(s => s + 1)} className="px-4 py-1.5 bg-starforge-gold/10 text-starforge-gold text-xs font-ui rounded-lg hover:bg-starforge-gold/20 transition-colors flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Re-Run Simulation
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-3 py-2 text-text-muted font-ui uppercase text-[9px]">Variable</th>
              <th className="px-2 py-2 text-text-muted font-ui uppercase text-[9px] text-center">Min (Pessimistic)</th>
              <th className="px-2 py-2 text-text-muted font-ui uppercase text-[9px] text-center">Mode (Most Likely)</th>
              <th className="px-2 py-2 text-text-muted font-ui uppercase text-[9px] text-center">Max (Optimistic)</th>
              <th className="px-2 py-2 text-text-muted font-ui uppercase text-[9px] text-center">Unit</th>
            </tr></thead>
            <tbody>
              {Object.entries(vars).map(([key, v]) => (
                <tr key={key} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-3 py-2 text-text-primary">{v.label} <TIP text={v.tip} /></td>
                  <td className="px-2 py-1"><input type="number" step="any" value={v.min} onChange={e => updateVar(key, 'min', +e.target.value)} className={inputClass} /></td>
                  <td className="px-2 py-1"><input type="number" step="any" value={v.mode} onChange={e => updateVar(key, 'mode', +e.target.value)} className={inputClass} /></td>
                  <td className="px-2 py-1"><input type="number" step="any" value={v.max} onChange={e => updateVar(key, 'max', +e.target.value)} className={inputClass} /></td>
                  <td className="px-2 py-2 text-text-muted text-center font-mono">{v.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
