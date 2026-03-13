import { useState, useMemo } from 'react';
import { DollarSign, Target, Info, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

/* ─── Pricing Optimizer ───
   Given print specs and target margin, reverse-calculates optimal list price.
   Shows "sweet spot" where margin × volume is maximized. */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
      {text}
    </span>
  </span>
);

const GENRE_BENCHMARKS: Record<string, { pbMin: number; pbMax: number; ebMin: number; ebMax: number; sweet: number }> = {
  'SFF': { pbMin: 14.99, pbMax: 18.99, ebMin: 3.99, ebMax: 6.99, sweet: 16.99 },
  'Romance': { pbMin: 13.99, pbMax: 16.99, ebMin: 2.99, ebMax: 5.99, sweet: 14.99 },
  'Literary Fiction': { pbMin: 15.99, pbMax: 19.99, ebMin: 4.99, ebMax: 9.99, sweet: 17.99 },
  'YA': { pbMin: 12.99, pbMax: 17.99, ebMin: 2.99, ebMax: 5.99, sweet: 14.99 },
  'Mystery/Thriller': { pbMin: 14.99, pbMax: 17.99, ebMin: 3.99, ebMax: 6.99, sweet: 15.99 },
  'Nonfiction': { pbMin: 16.99, pbMax: 24.99, ebMin: 6.99, ebMax: 12.99, sweet: 19.99 },
};

export default function CalcPricing() {
  const [pageCount, setPageCount] = useState(320);
  const [interiorType, setInteriorType] = useState('bw-cream');
  const [coverType, setCoverType] = useState('pb-matte');
  const [wholesaleDiscount, setWholesaleDiscount] = useState(55);
  const [targetMarginPct, setTargetMarginPct] = useState(15);
  const [genre, setGenre] = useState('SFF');
  const [authorRoyaltyRate, setAuthorRoyaltyRate] = useState(10);

  const PAGE_COSTS: Record<string, number> = { 'bw-cream': 0.013, 'bw-white': 0.013, 'standard-color': 0.04, 'premium-color': 0.07 };
  const COVER_COSTS: Record<string, number> = { 'pb-matte': 0.85, 'pb-gloss': 0.85, 'hc-case-laminate': 2.50, 'hc-dust-jacket': 3.50 };

  const analysis = useMemo(() => {
    const printCost = pageCount * (PAGE_COSTS[interiorType] || 0.013) + (COVER_COSTS[coverType] || 0.85);
    const bench = GENRE_BENCHMARKS[genre] || GENRE_BENCHMARKS['SFF'];

    // Reverse-calculate: target margin → required list price
    // margin % = (netToPublisher - authorRoyalty) / netToPublisher × 100
    // netToPublisher = listPrice × (1 - discount) - printCost - marketFee
    // marketFee = listPrice × 0.01875
    // pubProfit = netToPublisher × (1 - authorRoyaltyRate/100)
    // targetMarginPct = pubProfit / netToPublisher × 100
    // => netToPublisher = totalCosts / (1 - targetMarginPct/100)
    // But simpler approach: iterate price points

    const pricePoints = [];
    for (let p = 9.99; p <= 29.99; p += 1.00) {
      const marketFee = p * 0.01875;
      const grossToPublisher = p * (1 - wholesaleDiscount / 100);
      const netToPublisher = grossToPublisher - printCost - marketFee;
      const authorRoyalty = netToPublisher * (authorRoyaltyRate / 100);
      const pubProfit = netToPublisher - authorRoyalty;
      const margin = netToPublisher > 0 ? (pubProfit / netToPublisher * 100) : -100;
      const breakEvenUnits = pubProfit > 0 ? Math.ceil(5000 / pubProfit) : Infinity; // assume $5K fixed cost
      const elasticityFactor = p <= bench.sweet ? 1.0 : 1.0 - ((p - bench.sweet) / bench.sweet) * 0.3;
      const estimatedVolume = Math.round(2000 * elasticityFactor);
      const estimatedTotalProfit = pubProfit * estimatedVolume;

      pricePoints.push({
        price: p,
        printCost,
        marketFee,
        netToPublisher,
        authorRoyalty,
        pubProfit,
        margin,
        breakEvenUnits,
        estimatedVolume,
        estimatedTotalProfit,
        isSweet: Math.abs(p - bench.sweet) < 0.50,
        inRange: p >= bench.pbMin && p <= bench.pbMax,
      });
    }

    // Find optimal (max total estimated profit)
    const optimal = pricePoints.reduce((best, curr) =>
      curr.estimatedTotalProfit > best.estimatedTotalProfit ? curr : best, pricePoints[0]);

    // Find target-margin price
    const targetPrice = pricePoints.find(pp => pp.margin >= targetMarginPct && pp.pubProfit > 0);

    return { pricePoints, optimal, targetPrice, printCost, bench };
  }, [pageCount, interiorType, coverType, wholesaleDiscount, targetMarginPct, genre, authorRoyaltyRate]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const inputClass = "w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none";
  const labelClass = "block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <div>
          <label className={labelClass}>Pages <TIP text="Total page count of interior. Directly impacts print cost per unit." /></label>
          <input type="number" min={50} max={800} step={10} value={pageCount} onChange={e => setPageCount(+e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Interior <TIP text="Paper type affects per-page cost. Premium color = 5× B&W cost." /></label>
          <select value={interiorType} onChange={e => setInteriorType(e.target.value)} className={inputClass}>
            <option value="bw-cream">B&W Cream</option>
            <option value="bw-white">B&W White</option>
            <option value="standard-color">Std Color</option>
            <option value="premium-color">Premium Color</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Cover <TIP text="Hardcover adds $1.65-$2.65 per unit vs paperback." /></label>
          <select value={coverType} onChange={e => setCoverType(e.target.value)} className={inputClass}>
            <option value="pb-matte">PB Matte</option>
            <option value="pb-gloss">PB Gloss</option>
            <option value="hc-case-laminate">HC Case</option>
            <option value="hc-dust-jacket">HC Jacket</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Discount % <TIP text="Wholesale discount to retailers. 55% is standard for bookstore placement." /></label>
          <input type="number" min={35} max={55} step={5} value={wholesaleDiscount} onChange={e => setWholesaleDiscount(+e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Target Margin % <TIP text="Your desired publisher net margin after author royalty. 10-20% typical for small press." /></label>
          <input type="number" min={1} max={50} step={1} value={targetMarginPct} onChange={e => setTargetMarginPct(+e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Author Royalty % <TIP text="Net royalty rate paid to author on publisher receipts." /></label>
          <input type="number" min={5} max={30} step={1} value={authorRoyaltyRate} onChange={e => setAuthorRoyaltyRate(+e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Genre <TIP text="Genre determines benchmark price ranges and consumer expectations." /></label>
          <select value={genre} onChange={e => setGenre(e.target.value)} className={inputClass}>
            {Object.keys(GENRE_BENCHMARKS).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-starforge-gold/5 to-transparent border border-starforge-gold/20 rounded-xl p-5 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">★ Optimal Price (Max Revenue)</p>
          <p className="font-heading text-3xl text-starforge-gold">{fmt(analysis.optimal.price)}</p>
          <p className="text-xs text-text-secondary mt-1">Margin: {analysis.optimal.margin.toFixed(1)}% · Profit/unit: {fmt(analysis.optimal.pubProfit)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Target Margin Price ({targetMarginPct}%+)</p>
          <p className="font-heading text-3xl text-text-primary">{analysis.targetPrice ? fmt(analysis.targetPrice.price) : 'N/A'}</p>
          <p className="text-xs text-text-secondary mt-1">{analysis.targetPrice ? `Actual: ${analysis.targetPrice.margin.toFixed(1)}% · Profit: ${fmt(analysis.targetPrice.pubProfit)}` : 'Cannot achieve at current specs'}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">{genre} Genre Sweet Spot</p>
          <p className="font-heading text-3xl text-cyan-400">{fmt(analysis.bench.sweet)}</p>
          <p className="text-xs text-text-secondary mt-1">Range: {fmt(analysis.bench.pbMin)} – {fmt(analysis.bench.pbMax)}</p>
        </div>
      </div>

      {/* Price Point Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <Target className="w-4 h-4 text-starforge-gold" />
          <h3 className="font-heading text-sm text-text-primary">Price Point Analysis</h3>
          <span className="text-[10px] text-text-muted ml-2">Print cost: {fmt(analysis.printCost)}/unit</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-4 py-3 text-text-muted font-ui uppercase text-[10px]">List Price</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Net to Pub</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Author</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Pub Profit</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Margin</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">B/E Units</th>
              <th className="text-right px-4 py-3 text-text-muted font-ui uppercase text-[10px]">Signal</th>
            </tr></thead>
            <tbody>
              {analysis.pricePoints.filter(pp => pp.price >= 11.99 && pp.price <= 25.99).map(pp => (
                <tr key={pp.price} className={`border-b border-white/[0.03] ${pp.isSweet ? 'bg-starforge-gold/5' : pp.inRange ? 'bg-white/[0.01]' : ''} hover:bg-white/[0.02]`}>
                  <td className="px-4 py-2.5 font-mono text-text-primary">{fmt(pp.price)} {pp.isSweet && <span className="text-starforge-gold">★</span>}</td>
                  <td className="px-3 py-2.5 font-mono text-right text-text-secondary">{fmt(pp.netToPublisher)}</td>
                  <td className="px-3 py-2.5 font-mono text-right text-purple-400">{fmt(pp.authorRoyalty)}</td>
                  <td className={`px-3 py-2.5 font-mono text-right ${pp.pubProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(pp.pubProfit)}</td>
                  <td className={`px-3 py-2.5 font-mono text-right ${pp.margin >= targetMarginPct ? 'text-emerald-400' : pp.margin >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{pp.margin.toFixed(1)}%</td>
                  <td className="px-3 py-2.5 font-mono text-right text-text-secondary">{pp.breakEvenUnits === Infinity ? '—' : pp.breakEvenUnits.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    {pp.pubProfit < 0 ? <span className="text-red-400 text-[10px]">⛔ Loss</span>
                      : pp.isSweet ? <span className="text-starforge-gold text-[10px]">★ Sweet</span>
                      : pp.inRange ? <span className="text-emerald-400 text-[10px]">✓ In range</span>
                      : pp.price > analysis.bench.pbMax ? <span className="text-amber-400 text-[10px]">⚠ High</span>
                      : <span className="text-amber-400 text-[10px]">⚠ Low</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
