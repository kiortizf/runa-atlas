import { useMemo } from 'react';
import { FileText, Layers, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface CalcPnLProps {
  listPrice: number;
  wholesaleDiscount: number;
  authorRoyaltyRate: number;
  advance: number;
  printCost: number;
  marketAccessFee: number;
  netToPublisher: number;
  ebookPrice: number;
  ebookRoyaltyRate: number;
  ebookAmazonNet: number;
  audiobookPrice: number;
  audiobookRoyaltyRate: number;
  audiobookFindawayNet: number;
  audiobookProductionCost: number;
  showEbook: boolean;
  showAudio: boolean;
  // P&L cost inputs
  editorialCost: number;
  designCost: number;
  marketingBudget: number;
  overheadAlloc: number;
  projectedPrintUnits: number;
  returnRate: number;
  setEditorialCost: (v: number) => void;
  setDesignCost: (v: number) => void;
  setMarketingBudget: (v: number) => void;
  setOverheadAlloc: (v: number) => void;
  setProjectedPrintUnits: (v: number) => void;
  setReturnRate: (v: number) => void;
}

const fmt = (n: number) => n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
const fmtk = (n: number) => Math.abs(n) >= 1000 ? `${n < 0 ? '-' : ''}$${(Math.abs(n) / 1000).toFixed(1)}k` : fmt(n);
const fmtInt = (n: number) => n.toLocaleString();

const SEASONAL_WEIGHTS = [
  { month: 'Jan', weight: 0.06, label: 'Post-holiday slump' },
  { month: 'Feb', weight: 0.065, label: 'Slight recovery' },
  { month: 'Mar', weight: 0.07, label: 'Spring momentum' },
  { month: 'Apr', weight: 0.075, label: 'Good general month' },
  { month: 'May', weight: 0.07, label: 'Pre-summer' },
  { month: 'Jun', weight: 0.08, label: 'Summer reading begins' },
  { month: 'Jul', weight: 0.085, label: 'Peak summer reading' },
  { month: 'Aug', weight: 0.075, label: 'Back-to-school' },
  { month: 'Sep', weight: 0.08, label: 'Fall reading season' },
  { month: 'Oct', weight: 0.085, label: 'Strong SFF/horror' },
  { month: 'Nov', weight: 0.09, label: 'Pre-holiday buying' },
  { month: 'Dec', weight: 0.10, label: 'Peak gift buying' },
];

export default function CalcPnL(props: CalcPnLProps) {
  const {
    listPrice, wholesaleDiscount, authorRoyaltyRate, advance, printCost, marketAccessFee,
    netToPublisher, ebookPrice, ebookRoyaltyRate, ebookAmazonNet,
    audiobookPrice, audiobookRoyaltyRate, audiobookFindawayNet, audiobookProductionCost,
    showEbook, showAudio,
    editorialCost, designCost, marketingBudget, overheadAlloc,
    projectedPrintUnits, returnRate,
    setEditorialCost, setDesignCost, setMarketingBudget, setOverheadAlloc,
    setProjectedPrintUnits, setReturnRate,
  } = props;

  const pnl = useMemo(() => {
    const ebookUnits = showEbook ? Math.round(projectedPrintUnits * 1.5) : 0;
    const audioUnits = showAudio ? Math.round(projectedPrintUnits * 0.3) : 0;
    const netPrintUnits = Math.round(projectedPrintUnits * (1 - returnRate / 100));

    // Revenue
    const grossPrintRev = projectedPrintUnits * listPrice;
    const returnsDeduction = grossPrintRev * (returnRate / 100);
    const wholesaleDeduction = (grossPrintRev - returnsDeduction) * (wholesaleDiscount / 100);
    const netPrintRev = netPrintUnits * netToPublisher;
    const netEbookRev = ebookUnits * ebookAmazonNet;
    const netAudioRev = audioUnits * audiobookFindawayNet;
    const totalNetRev = netPrintRev + netEbookRev + netAudioRev;

    // Author royalties
    const printAuthorRoyalty = netPrintRev * (authorRoyaltyRate / 100);
    const ebookAuthorRoyalty = netEbookRev * (ebookRoyaltyRate / 100);
    const audioAuthorRoyalty = netAudioRev * (audiobookRoyaltyRate / 100);
    const totalAuthorRoyaltyEarned = printAuthorRoyalty + ebookAuthorRoyalty + audioAuthorRoyalty;
    const royaltyAboveAdvance = Math.max(0, totalAuthorRoyaltyEarned - advance);
    const totalAuthorPayout = advance + royaltyAboveAdvance;

    // Costs
    const totalPrintCost = netPrintUnits * printCost;
    const totalMarketFees = netPrintUnits * marketAccessFee;
    const totalProductionCosts = editorialCost + designCost + totalPrintCost + totalMarketFees + (showAudio ? audiobookProductionCost : 0);
    const totalCosts = totalProductionCosts + marketingBudget + overheadAlloc + totalAuthorPayout;

    // Bottom line
    const contributionMargin = totalNetRev - totalCosts;
    const grossMarginPct = totalNetRev > 0 ? ((totalNetRev - totalProductionCosts) / totalNetRev * 100) : 0;
    const netMarginPct = totalNetRev > 0 ? (contributionMargin / totalNetRev * 100) : 0;
    const authorROI = totalAuthorPayout > 0 ? totalNetRev / totalAuthorPayout : 0;
    const earnedOut = totalAuthorRoyaltyEarned >= advance;
    const breakEvenUnits = netToPublisher > 0 ? Math.ceil((editorialCost + designCost + marketingBudget + overheadAlloc + advance + (showAudio ? audiobookProductionCost : 0)) / netToPublisher) : Infinity;

    // Cash flow
    const monthlyCashFlow = SEASONAL_WEIGHTS.map(sw => {
      const monthRev = totalNetRev * sw.weight;
      const monthExpense = (totalCosts / 12); // simplified even distribution
      return { ...sw, revenue: monthRev, expense: monthExpense, net: monthRev - monthExpense };
    });

    let cumulative = 0;
    const cumulativeCashFlow = monthlyCashFlow.map(m => {
      cumulative += m.net;
      return { ...m, cumulative };
    });

    // Unit economics table
    const unitEcon = [
      { format: 'Print (Ingram 55%)', channel: 'Wholesale', listP: listPrice, pubNet: netToPublisher, authRoy: netToPublisher * (authorRoyaltyRate / 100), pubProfit: netToPublisher * (1 - authorRoyaltyRate / 100) },
      { format: 'Print (Amazon KDP)', channel: 'Amazon', listP: listPrice, pubNet: listPrice * 0.4, authRoy: listPrice * 0.4 * (authorRoyaltyRate / 100), pubProfit: listPrice * 0.4 * (1 - authorRoyaltyRate / 100) },
      { format: 'Print (Direct)', channel: 'Direct', listP: listPrice, pubNet: listPrice - printCost, authRoy: (listPrice - printCost) * (authorRoyaltyRate / 100), pubProfit: (listPrice - printCost) * (1 - authorRoyaltyRate / 100) },
      ...(showEbook ? [
        { format: 'eBook (Amazon 70%)', channel: 'Amazon', listP: ebookPrice, pubNet: ebookAmazonNet, authRoy: ebookAmazonNet * (ebookRoyaltyRate / 100), pubProfit: ebookAmazonNet * (1 - ebookRoyaltyRate / 100) },
        { format: 'eBook (Apple/D2D)', channel: 'Wide', listP: ebookPrice, pubNet: ebookPrice * 0.63, authRoy: ebookPrice * 0.63 * (ebookRoyaltyRate / 100), pubProfit: ebookPrice * 0.63 * (1 - ebookRoyaltyRate / 100) },
        { format: 'eBook (Direct)', channel: 'Direct', listP: ebookPrice, pubNet: ebookPrice * 0.90, authRoy: ebookPrice * 0.90 * (ebookRoyaltyRate / 100), pubProfit: ebookPrice * 0.90 * (1 - ebookRoyaltyRate / 100) },
      ] : []),
      ...(showAudio ? [
        { format: 'Audiobook (Findaway)', channel: 'Wide', listP: audiobookPrice, pubNet: audiobookFindawayNet, authRoy: audiobookFindawayNet * (audiobookRoyaltyRate / 100), pubProfit: audiobookFindawayNet * (1 - audiobookRoyaltyRate / 100) },
        { format: 'Audiobook (ACX excl.)', channel: 'Amazon', listP: audiobookPrice, pubNet: audiobookPrice * 0.40, authRoy: audiobookPrice * 0.40 * (audiobookRoyaltyRate / 100), pubProfit: audiobookPrice * 0.40 * (1 - audiobookRoyaltyRate / 100) },
      ] : []),
    ];

    // First-year financial model (2 titles)
    const titlesY1 = 2;
    const y1Rev = totalNetRev * titlesY1;
    const y1Costs = totalCosts * titlesY1;
    const y1Margin = y1Rev - y1Costs;

    // Year projections
    const yearProjections = [1, 2, 3, 5].map(yr => {
      const titles = yr === 1 ? 2 : yr === 2 ? 4 : yr === 3 ? 7 : 15;
      const backlistPct = yr === 1 ? 0 : yr === 2 ? 0.3 : yr === 3 ? 0.45 : 0.6;
      const frontlistRev = (yr === 1 ? titlesY1 : yr === 2 ? 2 : yr === 3 ? 3 : 4) * totalNetRev;
      const backlistRev = (titles - (yr === 1 ? 2 : yr === 2 ? 2 : yr === 3 ? 3 : 4)) * totalNetRev * 0.4;
      const totalRev = frontlistRev + backlistRev;
      const totalExp = (yr === 1 ? titlesY1 : yr === 2 ? 2 : yr === 3 ? 3 : 4) * (editorialCost + designCost + marketingBudget + advance + (showAudio ? audiobookProductionCost : 0)) + overheadAlloc * 12;
      return { year: yr, catalogSize: titles, backlistPct: Math.round(backlistPct * 100), totalRev, totalExp, netMargin: totalRev - totalExp };
    });

    // Invest vs conserve
    const cashReserve = totalNetRev * 0.25; // 3 month equivalent
    const investScore = (contributionMargin > 0 ? 2 : 0) + (earnedOut ? 2 : 0) + (netMarginPct > 10 ? 2 : 0) + (projectedPrintUnits > 500 ? 1 : 0) + (authorROI > 1.5 ? 1 : 0);

    return {
      grossPrintRev, returnsDeduction, wholesaleDeduction, netPrintRev,
      netEbookRev, netAudioRev, totalNetRev,
      printAuthorRoyalty, ebookAuthorRoyalty, audioAuthorRoyalty,
      totalAuthorRoyaltyEarned, royaltyAboveAdvance, totalAuthorPayout,
      totalPrintCost, totalMarketFees, totalProductionCosts,
      editorialCost, designCost, marketingBudget, overheadAlloc,
      audiobookProductionCost: showAudio ? audiobookProductionCost : 0,
      totalCosts, contributionMargin, grossMarginPct, netMarginPct,
      authorROI, earnedOut, breakEvenUnits, ebookUnits, audioUnits, netPrintUnits,
      cumulativeCashFlow, unitEcon, yearProjections, investScore, cashReserve,
    };
  }, [listPrice, wholesaleDiscount, authorRoyaltyRate, advance, printCost, marketAccessFee,
      netToPublisher, ebookPrice, ebookRoyaltyRate, ebookAmazonNet,
      audiobookPrice, audiobookRoyaltyRate, audiobookFindawayNet, audiobookProductionCost,
      showEbook, showAudio, editorialCost, designCost, marketingBudget, overheadAlloc,
      projectedPrintUnits, returnRate]);

  const inputClass = "w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none";
  const labelClass = "block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">

      {/* ─── P&L Cost Inputs ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-starforge-gold" /> Title P&L Inputs
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className={labelClass}>Projected Print Units</label>
            <input type="number" min={50} max={50000} step={50} value={projectedPrintUnits} onChange={e => setProjectedPrintUnits(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Return Rate %</label>
            <input type="number" min={0} max={50} step={1} value={returnRate} onChange={e => setReturnRate(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Editorial ($)</label>
            <input type="number" min={0} max={50000} step={250} value={editorialCost} onChange={e => setEditorialCost(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Design ($)</label>
            <input type="number" min={0} max={10000} step={100} value={designCost} onChange={e => setDesignCost(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Marketing ($)</label>
            <input type="number" min={0} max={25000} step={250} value={marketingBudget} onChange={e => setMarketingBudget(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Overhead ($)</label>
            <input type="number" min={0} max={10000} step={100} value={overheadAlloc} onChange={e => setOverheadAlloc(+e.target.value)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* ─── Single-Title P&L Statement ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <FileText className="w-4 h-4 text-starforge-gold" />
          <h3 className="font-heading text-sm text-text-primary">Single-Title P&L Statement</h3>
          <span className="text-[10px] text-text-muted ml-2">{fmtInt(projectedPrintUnits)} print + {fmtInt(pnl.ebookUnits)} eBook + {fmtInt(pnl.audioUnits)} audio</span>
        </div>
        <div className="p-5">
          <table className="w-full text-xs">
            <tbody>
              {/* Revenue */}
              <tr className="border-b border-white/[0.06]"><td colSpan={3} className="py-2 text-[10px] uppercase tracking-wider text-starforge-gold font-ui">Revenue</td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Gross print revenue ({fmtInt(projectedPrintUnits)} × {fmt(listPrice)})</td><td className="text-right font-mono text-text-primary">{fmtk(pnl.grossPrintRev)}</td><td></td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Less: Returns ({returnRate}%)</td><td className="text-right font-mono text-red-400">-{fmtk(pnl.returnsDeduction)}</td><td></td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Less: Wholesale discount ({wholesaleDiscount}%)</td><td className="text-right font-mono text-red-400">-{fmtk(pnl.wholesaleDeduction)}</td><td></td></tr>
              <tr className="font-medium"><td className="py-1.5 text-text-secondary pl-4">Net print revenue</td><td className="text-right font-mono text-text-primary">{fmtk(pnl.netPrintRev)}</td><td></td></tr>
              {showEbook && <tr><td className="py-1.5 text-text-muted pl-4">Net eBook revenue ({fmtInt(pnl.ebookUnits)} units)</td><td className="text-right font-mono text-text-primary">{fmtk(pnl.netEbookRev)}</td><td></td></tr>}
              {showAudio && <tr><td className="py-1.5 text-text-muted pl-4">Net audiobook revenue ({fmtInt(pnl.audioUnits)} units)</td><td className="text-right font-mono text-text-primary">{fmtk(pnl.netAudioRev)}</td><td></td></tr>}
              <tr className="border-t border-white/[0.06] font-bold"><td className="py-2 text-text-primary pl-4">Total Net Revenue</td><td className="text-right font-mono text-emerald-400">{fmtk(pnl.totalNetRev)}</td><td></td></tr>

              {/* Costs */}
              <tr className="border-b border-white/[0.06]"><td colSpan={3} className="py-2 pt-4 text-[10px] uppercase tracking-wider text-red-400 font-ui">Costs</td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Print manufacturing ({fmtInt(pnl.netPrintUnits)} × {fmt(printCost)})</td><td className="text-right font-mono text-red-400">-{fmtk(pnl.totalPrintCost)}</td><td></td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Market access fees</td><td className="text-right font-mono text-red-400">-{fmtk(pnl.totalMarketFees)}</td><td></td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Editorial (dev edit, copy edit, proofread)</td><td className="text-right font-mono text-red-400">-{fmtk(editorialCost)}</td><td></td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Design (cover + interior layout)</td><td className="text-right font-mono text-red-400">-{fmtk(designCost)}</td><td></td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Marketing & advertising</td><td className="text-right font-mono text-red-400">-{fmtk(marketingBudget)}</td><td></td></tr>
              {showAudio && <tr><td className="py-1.5 text-text-muted pl-4">Audiobook production</td><td className="text-right font-mono text-red-400">-{fmtk(audiobookProductionCost)}</td><td></td></tr>}
              <tr><td className="py-1.5 text-text-muted pl-4">Overhead allocation</td><td className="text-right font-mono text-red-400">-{fmtk(overheadAlloc)}</td><td></td></tr>

              {/* Author */}
              <tr className="border-b border-white/[0.06]"><td colSpan={3} className="py-2 pt-4 text-[10px] uppercase tracking-wider text-purple-400 font-ui">Author Compensation</td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Advance</td><td className="text-right font-mono text-purple-400">-{fmtk(advance)}</td><td></td></tr>
              <tr><td className="py-1.5 text-text-muted pl-4">Royalty earned above advance</td><td className="text-right font-mono text-purple-400">{pnl.royaltyAboveAdvance > 0 ? `-${fmtk(pnl.royaltyAboveAdvance)}` : '$0.00'}</td><td></td></tr>
              <tr className="font-medium"><td className="py-1.5 text-text-secondary pl-4">Total author payout</td><td className="text-right font-mono text-purple-400">-{fmtk(pnl.totalAuthorPayout)}</td><td className="text-right text-[10px] px-2">{pnl.earnedOut ? '✅ Earned out' : `${Math.round(pnl.totalAuthorRoyaltyEarned / advance * 100)}% earned`}</td></tr>

              {/* Bottom line */}
              <tr className="border-t-2 border-starforge-gold/30"><td colSpan={3} className="py-2 pt-4 text-[10px] uppercase tracking-wider text-starforge-gold font-ui">Bottom Line</td></tr>
              <tr className="font-bold text-base"><td className="py-2 text-text-primary pl-4">Contribution Margin</td><td className={`text-right font-mono ${pnl.contributionMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtk(pnl.contributionMargin)}</td><td></td></tr>
            </tbody>
          </table>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Gross Margin</p>
              <p className={`font-heading text-lg ${pnl.grossMarginPct >= 50 ? 'text-emerald-400' : pnl.grossMarginPct >= 30 ? 'text-amber-400' : 'text-red-400'}`}>{pnl.grossMarginPct.toFixed(1)}%</p>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Net Margin</p>
              <p className={`font-heading text-lg ${pnl.netMarginPct >= 10 ? 'text-emerald-400' : pnl.netMarginPct >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{pnl.netMarginPct.toFixed(1)}%</p>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Author ROI</p>
              <p className={`font-heading text-lg ${pnl.authorROI >= 2 ? 'text-emerald-400' : pnl.authorROI >= 1 ? 'text-amber-400' : 'text-red-400'}`}>{pnl.authorROI.toFixed(1)}×</p>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">Break-Even</p>
              <p className="font-heading text-lg text-text-primary">{pnl.breakEvenUnits === Infinity ? '∞' : fmtInt(pnl.breakEvenUnits)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Unit Economics by Format × Channel ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="font-heading text-sm text-text-primary">Unit Economics: Format × Channel</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-4 py-3 text-text-muted font-ui uppercase text-[10px]">Format</th>
              <th className="text-left px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Channel</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">List</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Pub Net</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Author</th>
              <th className="text-right px-4 py-3 text-text-muted font-ui uppercase text-[10px]">Pub Profit</th>
            </tr></thead>
            <tbody>
              {pnl.unitEcon.map((u, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-text-primary">{u.format}</td>
                  <td className="px-3 py-2.5"><span className={`text-[10px] px-2 py-0.5 rounded-full ${u.channel === 'Direct' ? 'bg-emerald-500/10 text-emerald-400' : u.channel === 'Amazon' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>{u.channel}</span></td>
                  <td className="px-3 py-2.5 font-mono text-right text-text-secondary">{fmt(u.listP)}</td>
                  <td className="px-3 py-2.5 font-mono text-right text-text-primary">{fmt(u.pubNet)}</td>
                  <td className="px-3 py-2.5 font-mono text-right text-purple-400">{fmt(u.authRoy)}</td>
                  <td className={`px-4 py-2.5 font-mono text-right font-medium ${u.pubProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(u.pubProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Cash Flow ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" /> Seasonal Cash Flow Projection
        </h3>
        <div className="space-y-2">
          {pnl.cumulativeCashFlow.map(m => {
            const maxRev = Math.max(...pnl.cumulativeCashFlow.map(x => x.revenue));
            const barPct = maxRev > 0 ? (m.revenue / maxRev * 100) : 0;
            return (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-[11px] text-text-muted w-8 font-mono">{m.month}</span>
                <div className="flex-1 h-5 rounded-full bg-white/[0.04] overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-starforge-gold/40 to-starforge-gold/80 rounded-full transition-all" style={{ width: `${barPct}%` }} />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 w-14 text-right">{fmtk(m.revenue)}</span>
                <span className={`text-[10px] font-mono w-14 text-right ${m.cumulative >= 0 ? 'text-text-secondary' : 'text-red-400'}`}>{fmtk(m.cumulative)}</span>
                <span className="text-[9px] text-text-muted w-32 hidden sm:block">{m.label}</span>
              </div>
            );
          })}
          <div className="text-[9px] text-text-muted flex gap-6 pt-2 border-t border-white/[0.06]">
            <span>🟡 Monthly revenue</span><span className="text-emerald-400">Green = monthly rev</span><span>Right col = cumulative P&L</span>
          </div>
        </div>
      </div>

      {/* ─── First-Year Financial Model ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="font-heading text-sm text-text-primary">Multi-Year Financial Model</h3>
          <span className="text-[10px] text-text-muted ml-2">Based on current title economics, projected catalog growth</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-4 py-3 text-text-muted font-ui uppercase text-[10px]">Year</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Catalog Size</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Backlist %</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Revenue</th>
              <th className="text-right px-3 py-3 text-text-muted font-ui uppercase text-[10px]">Expenses</th>
              <th className="text-right px-4 py-3 text-text-muted font-ui uppercase text-[10px]">Net</th>
            </tr></thead>
            <tbody>
              {pnl.yearProjections.map(y => (
                <tr key={y.year} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-text-primary font-medium">Year {y.year}</td>
                  <td className="px-3 py-2.5 font-mono text-text-secondary text-right">{y.catalogSize} titles</td>
                  <td className="px-3 py-2.5 font-mono text-text-secondary text-right">{y.backlistPct}%</td>
                  <td className="px-3 py-2.5 font-mono text-emerald-400 text-right">{fmtk(y.totalRev)}</td>
                  <td className="px-3 py-2.5 font-mono text-red-400 text-right">{fmtk(y.totalExp)}</td>
                  <td className={`px-4 py-2.5 font-mono text-right font-bold ${y.netMargin >= 0 ? 'text-starforge-gold' : 'text-red-400'}`}>{fmtk(y.netMargin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Invest vs. Conserve ─── */}
      <div className={`border rounded-xl p-5 ${pnl.investScore >= 6 ? 'bg-emerald-500/5 border-emerald-500/20' : pnl.investScore >= 3 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          {pnl.investScore >= 6 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : pnl.investScore >= 3 ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
          {pnl.investScore >= 6 ? '🟢 Invest in Growth' : pnl.investScore >= 3 ? '🟡 Cautious Growth' : '🔴 Conserve & Optimize'}
        </h3>
        <p className="text-xs text-text-secondary mb-3">
          {pnl.investScore >= 6
            ? 'This title profile supports aggressive investment. Consider: increasing marketing spend, accelerating next title, exploring audio/rights.'
            : pnl.investScore >= 3
            ? 'Moderate signal. Invest selectively—focus on highest-ROI marketing channels, defer expensive formats until proof of demand.'
            : 'Economics are tight. Reduce advance, negotiate editorial costs, rely on organic marketing. Build audience before scaling spend.'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: 'Profitable', met: pnl.contributionMargin > 0 },
            { label: 'Advance earned', met: pnl.earnedOut },
            { label: 'Net margin >10%', met: pnl.netMarginPct > 10 },
            { label: '500+ units', met: projectedPrintUnits > 500 },
            { label: 'Author ROI >1.5×', met: pnl.authorROI > 1.5 },
          ].map(c => (
            <div key={c.label} className={`flex items-center gap-1.5 text-[10px] px-2 py-1.5 rounded ${c.met ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-text-muted'}`}>
              {c.met ? <CheckCircle className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current" />}
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
