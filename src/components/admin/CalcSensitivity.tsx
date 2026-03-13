import { useState, useMemo } from 'react';
import { ArrowLeftRight, Info, TrendingUp, Grid3X3 } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   SENSITIVITY ANALYSIS
   Tornado chart + two-variable heat map.
   Shows which levers matter most for profitability.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

// Base case values
const BASE = {
  listPrice: 16.99, printUnits: 1000, ebookMultiple: 1.5, audioMultiple: 0.3,
  wholesaleDisc: 55, returnRate: 15, printCost: 5.01, authorRoyalty: 10,
  advance: 3000, editorialCost: 5000, designCost: 1500, marketingCost: 2500,
  ebookPrice: 4.99, audioPrice: 24.99, audioProdCost: 3000,
};

// Variable ranges for sensitivity
const SENSITIVITY_VARS = [
  { key: 'printUnits', label: 'Print Sales Volume', low: 300, high: 3000, unit: 'units', tip: 'First-year print unit sales — largest single swing factor.' },
  { key: 'listPrice', label: 'List Price', low: 13.99, high: 19.99, unit: '$', tip: 'Retail price affects both revenue per unit and potentially demand.' },
  { key: 'ebookMultiple', label: 'eBook:Print Ratio', low: 0.5, high: 3.0, unit: '×', tip: 'High eBook ratio dramatically improves margins (no print cost).' },
  { key: 'wholesaleDisc', label: 'Wholesale Discount', low: 40, high: 55, unit: '%', tip: '40% = online only, 55% = bookstore placement.' },
  { key: 'returnRate', label: 'Return Rate', low: 5, high: 35, unit: '%', tip: 'Returns destroy revenue. Each % = ~10 lost units at 1000 volume.' },
  { key: 'printCost', label: 'Print Cost/Unit', low: 3.50, high: 7.00, unit: '$', tip: 'Manufacturing cost varies by specs. Shorter books = lower cost.' },
  { key: 'authorRoyalty', label: 'Author Royalty', low: 8, high: 15, unit: '%', tip: 'Net royalty rate. 8% minimum, 15% for established authors.' },
  { key: 'advance', label: 'Advance', low: 500, high: 8000, unit: '$', tip: 'Non-recoverable if title doesn\'t earn out.' },
  { key: 'editorialCost', label: 'Editorial', low: 2000, high: 10000, unit: '$', tip: 'Biggest fixed cost. Can range widely with edit depth.' },
  { key: 'marketingCost', label: 'Marketing', low: 500, high: 8000, unit: '$', tip: 'Marketing spend. Higher = more reach but risk if ROI is low.' },
  { key: 'audioMultiple', label: 'Audio:Print Ratio', low: 0.1, high: 0.8, unit: '×', tip: 'Audiobook sales as share of print. Growing format.' },
  { key: 'designCost', label: 'Design Cost', low: 800, high: 3000, unit: '$', tip: 'Cover + interior layout.' },
  { key: 'audioProdCost', label: 'Audio Production', low: 1500, high: 6000, unit: '$', tip: 'Narration + engineering + mastering.' },
];

function computeProfit(overrides: Partial<typeof BASE> = {}): number {
  const v = { ...BASE, ...overrides };
  const printUnits = Math.round(v.printUnits * (1 - v.returnRate / 100));
  const ebookUnits = Math.round(v.printUnits * v.ebookMultiple);
  const audioUnits = Math.round(v.printUnits * v.audioMultiple);
  const printNet = v.listPrice * (1 - v.wholesaleDisc / 100) - v.printCost - v.listPrice * 0.01875;
  const printRev = printUnits * printNet;
  const ebookRev = ebookUnits * v.ebookPrice * 0.70;
  const audioRev = audioUnits * v.audioPrice * 0.40;
  const totalRev = printRev + ebookRev + audioRev;
  const authorTotal = totalRev * (v.authorRoyalty / 100);
  const authorPayout = v.advance + Math.max(0, authorTotal - v.advance);
  const fixedCosts = v.editorialCost + v.designCost + v.marketingCost + v.audioProdCost;
  return totalRev - fixedCosts - authorPayout;
}

// Heat map axes
const HEAT_X_OPTIONS = ['printUnits', 'listPrice', 'ebookMultiple', 'wholesaleDisc', 'returnRate'];
const HEAT_Y_OPTIONS = ['listPrice', 'printUnits', 'marketingCost', 'advance', 'authorRoyalty', 'editorialCost'];

export default function CalcSensitivity() {
  const [heatX, setHeatX] = useState('printUnits');
  const [heatY, setHeatY] = useState('listPrice');

  const baseProfit = useMemo(() => computeProfit(), []);

  // Tornado data
  const tornado = useMemo(() => {
    return SENSITIVITY_VARS.map(sv => {
      const profitLow = computeProfit({ [sv.key]: sv.low });
      const profitHigh = computeProfit({ [sv.key]: sv.high });
      const swing = Math.abs(profitHigh - profitLow);
      return { ...sv, profitLow, profitHigh, swing, delta: profitHigh - profitLow };
    }).sort((a, b) => b.swing - a.swing);
  }, []);
  const maxSwing = Math.max(...tornado.map(t => t.swing));

  // Heat map
  const heatMap = useMemo(() => {
    const xVar = SENSITIVITY_VARS.find(v => v.key === heatX) || SENSITIVITY_VARS[0];
    const yVar = SENSITIVITY_VARS.find(v => v.key === heatY) || SENSITIVITY_VARS[1];
    const steps = 10;
    const xRange = Array.from({ length: steps }, (_, i) => xVar.low + (xVar.high - xVar.low) * i / (steps - 1));
    const yRange = Array.from({ length: steps }, (_, i) => yVar.low + (yVar.high - yVar.low) * i / (steps - 1));

    const cells: { x: number; y: number; profit: number }[][] = [];
    let minP = Infinity, maxP = -Infinity;
    for (const yVal of yRange) {
      const row: { x: number; y: number; profit: number }[] = [];
      for (const xVal of xRange) {
        const profit = computeProfit({ [heatX]: xVal, [heatY]: yVal });
        row.push({ x: xVal, y: yVal, profit });
        if (profit < minP) minP = profit;
        if (profit > maxP) maxP = profit;
      }
      cells.push(row);
    }

    return { xRange, yRange, cells, xVar, yVar, minP, maxP };
  }, [heatX, heatY]);

  const fmt = (n: number) => n < 0 ? `-$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const inputClass = "bg-void-black border border-border rounded-lg px-2 py-1.5 text-xs text-white focus:border-starforge-gold outline-none";

  // Color for heat map cell
  const heatColor = (profit: number) => {
    if (profit <= 0) {
      const t = Math.min(1, Math.abs(profit) / Math.max(1, Math.abs(heatMap.minP)));
      return `rgba(239, 68, 68, ${0.15 + t * 0.55})`;
    }
    const t = Math.min(1, profit / Math.max(1, heatMap.maxP));
    return `rgba(16, 185, 129, ${0.15 + t * 0.55})`;
  };

  return (
    <div className="space-y-6">
      {/* ─── Tornado Chart ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-sm text-text-primary mb-1 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-starforge-gold" /> Tornado Chart: Variable Impact on Profit
          <TIP text="Each bar shows how much profit changes when a single variable moves from its low to high value while all others stay at base case. Longest bars = highest leverage variables." />
        </h3>
        <p className="text-[10px] text-text-muted mb-4">Base case profit: <span className={`font-mono ${baseProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(baseProfit)}</span> — bars show profit range when each variable moves independently</p>

        <div className="space-y-2">
          {tornado.map((t, i) => {
            const leftPct = Math.min(t.profitLow, t.profitHigh);
            const rightPct = Math.max(t.profitLow, t.profitHigh);
            const totalRange = maxSwing || 1;
            const normalizedLow = ((Math.min(t.profitLow, t.profitHigh) - tornado.reduce((m, x) => Math.min(m, Math.min(x.profitLow, x.profitHigh)), 0)) / (totalRange * 1.2)) * 100;
            const barWidth = (t.swing / totalRange) * 80;

            return (
              <div key={t.key} className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted w-28 text-right truncate" title={t.label}>{t.label}</span>
                <div className="flex-1 relative h-6 bg-white/[0.02] rounded overflow-hidden">
                  {/* Low-side bar */}
                  <div className="absolute h-full bg-red-500/40 rounded-l"
                    style={{ left: `${50 - (t.profitLow < baseProfit ? (baseProfit - t.profitLow) / (totalRange * 1.2) * 100 : 0)}%`,
                             width: `${Math.abs(baseProfit - Math.min(t.profitLow, t.profitHigh)) / (totalRange * 1.2) * 100}%` }} />
                  {/* High-side bar */}
                  <div className="absolute h-full bg-emerald-500/40 rounded-r"
                    style={{ left: '50%',
                             width: `${Math.abs(Math.max(t.profitLow, t.profitHigh) - baseProfit) / (totalRange * 1.2) * 100}%` }} />
                  {/* Center line */}
                  <div className="absolute h-full w-px bg-starforge-gold/50" style={{ left: '50%' }} />
                </div>
                <span className="text-[9px] font-mono text-text-muted w-20 text-right">±{fmt(Math.round(t.swing / 2))}</span>
              </div>
            );
          })}
        </div>
        <div className="text-[9px] text-text-muted mt-3 flex gap-4">
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-red-500/40 rounded inline-block" /> Downside</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-emerald-500/40 rounded inline-block" /> Upside</span>
          <span className="flex items-center gap-1"><span className="w-px h-3 bg-starforge-gold/50 inline-block" /> Base case</span>
        </div>
      </div>

      {/* ─── Two-Variable Heat Map ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-heading text-sm text-text-primary flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-purple-400" /> Profit Heat Map
            <TIP text="Shows how profit changes when two variables move simultaneously. Green = profitable, Red = loss. Find the combinations that work." />
          </h3>
          <div className="flex gap-3 items-center">
            <div>
              <label className="text-[9px] text-text-muted font-ui uppercase mr-1">X-Axis:</label>
              <select value={heatX} onChange={e => setHeatX(e.target.value)} className={inputClass}>
                {HEAT_X_OPTIONS.map(k => <option key={k} value={k}>{SENSITIVITY_VARS.find(v => v.key === k)?.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-text-muted font-ui uppercase mr-1">Y-Axis:</label>
              <select value={heatY} onChange={e => setHeatY(e.target.value)} className={inputClass}>
                {HEAT_Y_OPTIONS.map(k => <option key={k} value={k}>{SENSITIVITY_VARS.find(v => v.key === k)?.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Column headers */}
            <div className="flex">
              <div className="w-16" />
              {heatMap.xRange.map((x, i) => (
                <div key={i} className="w-16 text-center text-[9px] font-mono text-text-muted pb-1">
                  {heatMap.xVar.unit === '$' ? `$${x.toFixed(x < 100 ? 2 : 0)}` : heatMap.xVar.unit === '%' ? `${x.toFixed(0)}%` : x < 10 ? x.toFixed(1) : Math.round(x).toLocaleString()}
                </div>
              ))}
            </div>
            {/* Rows */}
            {heatMap.cells.map((row, yi) => (
              <div key={yi} className="flex">
                <div className="w-16 text-[9px] font-mono text-text-muted flex items-center justify-end pr-2">
                  {heatMap.yVar.unit === '$' ? `$${heatMap.yRange[yi].toFixed(heatMap.yRange[yi] < 100 ? 2 : 0)}` : heatMap.yVar.unit === '%' ? `${heatMap.yRange[yi].toFixed(0)}%` : heatMap.yRange[yi] < 10 ? heatMap.yRange[yi].toFixed(1) : Math.round(heatMap.yRange[yi]).toLocaleString()}
                </div>
                {row.map((cell, xi) => (
                  <div key={xi} className="group relative w-16 h-10 border border-black/20 flex items-center justify-center text-[9px] font-mono"
                    style={{ backgroundColor: heatColor(cell.profit) }}>
                    <span className={cell.profit >= 0 ? 'text-emerald-200' : 'text-red-200'}>{fmt(cell.profit)}</span>
                    <span className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:block bg-void-black border border-white/10 rounded px-2 py-1 text-[9px] text-text-secondary whitespace-nowrap z-10">
                      {heatMap.xVar.label}: {cell.x.toFixed(2)} · {heatMap.yVar.label}: {cell.y.toFixed(2)} → {fmt(cell.profit)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            {/* Axis labels */}
            <div className="text-center text-[10px] text-text-muted mt-2 font-ui uppercase">{heatMap.xVar.label} →</div>
          </div>
          <div className="text-[10px] text-text-muted font-ui uppercase" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', position: 'absolute', left: '8px', top: '50%' }}>↑ {heatMap.yVar.label}</div>
        </div>
      </div>
    </div>
  );
}
