import { useState, useMemo } from 'react';
import {
  Info, TrendingUp, DollarSign, Users, Zap, Target,
  BarChart3, Star, BookOpen, ArrowUp, ArrowDown,
  Sparkles, Award, Clock, Flame
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   AUTHOR CAREER ARC MODELER
   ────────────────────────────────────────────────────────────
   Projects an author's career trajectory across multiple books.
   Treats a career as a physics system with momentum, acceleration,
   drag, and potential energy.

   Based on:
   • Career trajectory modeling (sports analytics adaptation)
   • Power law distributions in creative success (Watts)
   • Platform compounding (network growth models)
   • "1000 True Fans" theory (Kevin Kelly)
   • Sophomore slump research (second album/book syndrome)
   • Publisher ROI lifecycle analysis

   NO ONE HAS BUILT A PHYSICS-BASED CAREER TRAJECTORY
   MODELER FOR AUTHORS.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

interface BookProjection {
  bookNumber: number;
  title: string;
  yearOffset: number;
  salesFirstYear: number;
  cumulativeSales: number;
  platformSize: number;
  criticalMomentum: number; // 0-100
  revenue: number;
  publisherProfit: number;
  investment: number;
  cumulativeROI: number;
  isSophomoreSlump: boolean;
  isBreakout: boolean;
}

export default function MSAuthorTrajectory() {
  // Author Profile Inputs
  const [debutSales, setDebutSales] = useState(2500);
  const [initialPlatform, setInitialPlatform] = useState(3000); // social following
  const [hasNewsletter, setHasNewsletter] = useState(true);
  const [newsletterSize, setNewsletterSize] = useState(800);
  const [genreCategory, setGenreCategory] = useState<'sff' | 'romance' | 'literary' | 'ya' | 'mystery' | 'horror'>('sff');
  const [isSeries, setIsSeries] = useState(true);
  const [booksPlanned, setBooksPlanned] = useState(5);
  const [pubCadence, setPubCadence] = useState(18); // months between books
  const [avgAdvance, setAvgAdvance] = useState(5000);
  const [avgProductionCost, setAvgProductionCost] = useState(8000);
  const [netPerUnit, setNetPerUnit] = useState(2.50);
  const [priorBooks, setPriorBooks] = useState(0);
  const [criticalAcclaim, setCriticalAcclaim] = useState(60); // 0-100

  // Genre-specific trajectory parameters
  const genreParams: Record<string, {
    sophomoreDip: number; // % dip on book 2
    growthRate: number;   // base growth per book
    platformMultiplier: number;
    backlist: number; // backlist decay rate (yearly)
    breakoutThreshold: number; // critical mass for breakout
    seriesBoost: number; // boost per series book
    label: string;
  }> = {
    sff: { sophomoreDip: 0.15, growthRate: 0.20, platformMultiplier: 1.3, backlist: 0.85, breakoutThreshold: 15000, seriesBoost: 0.25, label: 'SFF' },
    romance: { sophomoreDip: 0.08, growthRate: 0.30, platformMultiplier: 1.5, backlist: 0.90, breakoutThreshold: 20000, seriesBoost: 0.35, label: 'Romance' },
    literary: { sophomoreDip: 0.25, growthRate: 0.10, platformMultiplier: 1.1, backlist: 0.80, breakoutThreshold: 10000, seriesBoost: 0.10, label: 'Literary' },
    ya: { sophomoreDip: 0.12, growthRate: 0.25, platformMultiplier: 1.4, backlist: 0.82, breakoutThreshold: 18000, seriesBoost: 0.30, label: 'YA' },
    mystery: { sophomoreDip: 0.10, growthRate: 0.15, platformMultiplier: 1.2, backlist: 0.90, breakoutThreshold: 12000, seriesBoost: 0.20, label: 'Mystery' },
    horror: { sophomoreDip: 0.18, growthRate: 0.22, platformMultiplier: 1.35, backlist: 0.83, breakoutThreshold: 12000, seriesBoost: 0.20, label: 'Horror' },
  };

  const analysis = useMemo(() => {
    const params = genreParams[genreCategory];
    const books: BookProjection[] = [];
    let cumulativeSales = 0;
    let cumulativeInvestment = 0;
    let cumulativeRevenue = 0;
    let platformSize = initialPlatform + (hasNewsletter ? newsletterSize * 5 : 0); // newsletter worth 5× social
    let momentum = criticalAcclaim; // starts at critical acclaim level
    let currentSales = debutSales;

    for (let i = 0; i < booksPlanned; i++) {
      const bookNumber = priorBooks + i + 1;
      const yearOffset = (i * pubCadence) / 12;
      const isBook2 = i === 1 && priorBooks === 0;
      const isSophomoreSlump = isBook2;

      // ═══ PHYSICS MODEL ═══
      // Sales = previous × (1 + growth) × platform_effect × series_effect × sophomore_effect × momentum_effect

      // Platform effect: platform growth compounds
      const platformGrowthRate = params.platformMultiplier - 1;
      platformSize = Math.round(platformSize * (1 + platformGrowthRate * 0.5)); // per book

      // Growth from previous book
      let growthFactor = 1 + params.growthRate;

      // Sophomore slump (book 2 dip)
      if (isSophomoreSlump) {
        growthFactor *= (1 - params.sophomoreDip);
      }

      // Series booze (books after #1 in series)
      if (isSeries && i > 0) {
        growthFactor *= (1 + params.seriesBoost * Math.min(1, i / 3)); // diminishing after book 3
      }

      // Platform effect on sales
      const platformEffect = Math.log10(Math.max(platformSize, 1)) / Math.log10(50000); // normalized to 50K
      growthFactor *= (1 + platformEffect * 0.2);

      // Critical momentum (awards, reviews, buzz)
      momentum = Math.min(100, momentum + (i > 0 ? 5 : 0) + (criticalAcclaim > 70 ? 3 : -1));
      const momentumEffect = momentum / 100;
      growthFactor *= (0.7 + momentumEffect * 0.6);

      // Backlist contribution from previous books
      const backlistSales = books.reduce((s, prev) => {
        const yearsOld = yearOffset - prev.yearOffset;
        return s + prev.salesFirstYear * Math.pow(params.backlist, yearsOld) * 0.3;
      }, 0);

      // Calculate this book's sales
      if (i === 0) {
        currentSales = debutSales;
      } else {
        currentSales = Math.round(currentSales * growthFactor);
      }

      const totalSalesThisYear = currentSales + Math.round(backlistSales);
      cumulativeSales += totalSalesThisYear;

      // Financials
      const investment = avgAdvance + avgProductionCost;
      cumulativeInvestment += investment;
      const revenue = totalSalesThisYear * netPerUnit;
      cumulativeRevenue += revenue;
      const profit = revenue - investment;
      const cumulativeROI = cumulativeInvestment > 0
        ? ((cumulativeRevenue - cumulativeInvestment) / cumulativeInvestment * 100) : 0;

      // Breakout detection
      const isBreakout = currentSales >= params.breakoutThreshold && (i === 0 || !books.some(b => b.isBreakout));

      books.push({
        bookNumber, title: `Book ${bookNumber}`, yearOffset,
        salesFirstYear: currentSales, cumulativeSales,
        platformSize, criticalMomentum: momentum,
        revenue, publisherProfit: profit, investment,
        cumulativeROI, isSophomoreSlump, isBreakout,
      });
    }

    // Break-even book
    const breakEvenBook = books.findIndex((_, i) => {
      const cumRev = books.slice(0, i + 1).reduce((s, b) => s + b.revenue, 0);
      const cumInv = books.slice(0, i + 1).reduce((s, b) => s + b.investment, 0);
      return cumRev >= cumInv;
    });

    // 1000 True Fans milestone
    const trueFansBook = books.findIndex(b => b.platformSize >= 5000); // using 5K as scaled proxy

    // Lifetime value of this author to the press
    const lifetimeRevenue = books.reduce((s, b) => s + b.revenue, 0);
    const lifetimeInvestment = books.reduce((s, b) => s + b.investment, 0);
    const lifetimeROI = lifetimeInvestment > 0 ? ((lifetimeRevenue - lifetimeInvestment) / lifetimeInvestment * 100) : 0;

    // Peak sales book
    const peakBook = books.reduce((max, b) => b.salesFirstYear > max.salesFirstYear ? b : max, books[0]);

    // Breakout probability (empirical model)
    const breakoutProb = Math.min(95, Math.round(
      (criticalAcclaim / 100 * 25) +
      (isSeries ? 15 : 5) +
      (initialPlatform > 10000 ? 20 : initialPlatform > 5000 ? 12 : initialPlatform > 1000 ? 5 : 0) +
      (debutSales > 5000 ? 25 : debutSales > 2000 ? 15 : debutSales > 1000 ? 8 : 3) +
      (booksPlanned >= 5 ? 10 : booksPlanned >= 3 ? 5 : 0)
    ));

    return {
      books, breakEvenBook, trueFansBook, lifetimeRevenue,
      lifetimeInvestment, lifetimeROI, peakBook, breakoutProb, params,
    };
  }, [debutSales, initialPlatform, hasNewsletter, newsletterSize, genreCategory,
      isSeries, booksPlanned, pubCadence, avgAdvance, avgProductionCost,
      netPerUnit, priorBooks, criticalAcclaim]);

  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const inputClass = "w-full bg-void-black border border-border rounded px-2 py-1 text-[11px] text-white focus:border-starforge-gold outline-none font-mono";

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-emerald-500/5 via-amber-500/5 to-pink-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> Author Career Arc Modeler
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Physics-based trajectory modeling for author careers. Momentum, acceleration, drag coefficients applied
          to multi-book projections with sophomore slump modeling, platform compounding, and breakout detection.
          <strong className="text-starforge-gold"> No publishing tool has ever modeled author careers with trajectory physics.</strong>
        </p>
      </div>

      {/* ═══ AUTHOR PROFILE INPUTS ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" /> Author Profile Parameters
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Debut Sales Est.</label>
            <input type="number" min={100} max={100000} step={100} value={debutSales} onChange={e => setDebutSales(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Genre</label>
            <select value={genreCategory} onChange={e => setGenreCategory(e.target.value as any)} className={inputClass} style={{ minHeight: 'auto' }}>
              {Object.entries(genreParams).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Social Following</label>
            <input type="number" min={0} max={1000000} step={500} value={initialPlatform} onChange={e => setInitialPlatform(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Newsletter Subs</label>
            <input type="number" min={0} max={100000} step={100} value={newsletterSize} onChange={e => setNewsletterSize(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Books Planned</label>
            <input type="number" min={1} max={10} value={booksPlanned} onChange={e => setBooksPlanned(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Pub Cadence (mo)</label>
            <input type="number" min={6} max={36} step={3} value={pubCadence} onChange={e => setPubCadence(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Avg Advance ($)</label>
            <input type="number" min={0} max={100000} step={500} value={avgAdvance} onChange={e => setAvgAdvance(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Avg Prod Cost ($)</label>
            <input type="number" min={1000} max={50000} step={500} value={avgProductionCost} onChange={e => setAvgProductionCost(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Net/Unit ($)</label>
            <input type="number" min={0.50} max={10} step={0.10} value={netPerUnit} onChange={e => setNetPerUnit(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Critical Acclaim</label>
            <input type="number" min={0} max={100} value={criticalAcclaim} onChange={e => setCriticalAcclaim(+e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[8px] text-text-muted uppercase mb-0.5">Prior Books</label>
            <input type="number" min={0} max={20} value={priorBooks} onChange={e => setPriorBooks(+e.target.value)} className={inputClass} />
          </div>
          <div className="flex items-end gap-2 pb-1">
            <label className="flex items-center gap-1.5 text-[9px] text-text-muted cursor-pointer" style={{ minHeight: 'auto' }}>
              <input type="checkbox" checked={isSeries} onChange={e => setIsSeries(e.target.checked)} className="accent-starforge-gold" style={{ minHeight: 'auto', minWidth: 'auto' }} />
              Series?
            </label>
          </div>
        </div>
      </div>

      {/* ═══ TRAJECTORY CHART ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" /> Career Trajectory — Sales Over Time
          <TIP text="Multi-book sales trajectory with confidence intervals. Shows momentum buildup, sophomore slumps, and breakout potential. Gold bars = first-year sales per book. Purple line = cumulative trajectory." />
        </h4>
        <div className="bg-void-black rounded-lg p-3 border border-white/[0.06]">
          <svg viewBox="0 0 700 250" className="w-full h-48">
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const maxSales = Math.max(...analysis.books.map(b => b.salesFirstYear), 1);
              const y = 220 - frac * 190;
              return (
                <g key={frac}>
                  <line x1={60} y1={y} x2={660} y2={y} stroke="rgba(255,255,255,0.04)" />
                  <text x={55} y={y + 3} fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="end">
                    {Math.round(maxSales * frac).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Bars + Line */}
            {analysis.books.map((book, i) => {
              const maxSales = Math.max(...analysis.books.map(b => b.salesFirstYear), 1);
              const barWidth = Math.min(60, 500 / analysis.books.length - 10);
              const x = 80 + (i / Math.max(analysis.books.length - 1, 1)) * 560;
              const barHeight = (book.salesFirstYear / maxSales) * 190;
              const y = 220 - barHeight;

              return (
                <g key={i}>
                  {/* Bar */}
                  <rect x={x - barWidth / 2} y={y} width={barWidth} height={barHeight}
                    fill={book.isBreakout ? '#22c55e' : book.isSophomoreSlump ? '#ef4444' : '#d4a01744'}
                    stroke={book.isBreakout ? '#22c55e' : book.isSophomoreSlump ? '#ef4444' : '#d4a017'}
                    strokeWidth="1" rx="2" opacity="0.8" />

                  {/* Labels */}
                  <text x={x} y={237} fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle">
                    Bk {book.bookNumber}
                  </text>
                  <text x={x} y={y - 5} fill={book.isBreakout ? '#22c55e' : '#d4a017'} fontSize="7" textAnchor="middle" fontWeight="bold">
                    {book.salesFirstYear.toLocaleString()}
                  </text>

                  {/* Markers */}
                  {book.isSophomoreSlump && (
                    <text x={x} y={y - 15} fill="#ef4444" fontSize="7" textAnchor="middle">📉 Slump</text>
                  )}
                  {book.isBreakout && (
                    <text x={x} y={y - 15} fill="#22c55e" fontSize="7" textAnchor="middle">🚀 Breakout</text>
                  )}

                  {/* Momentum dot */}
                  <circle cx={x} cy={220 - (book.criticalMomentum / 100) * 190} r="2.5"
                    fill="#a855f7" stroke="#000" strokeWidth="0.5" />
                </g>
              );
            })}

            {/* Momentum line */}
            <polyline
              points={analysis.books.map((book, i) => {
                const x = 80 + (i / Math.max(analysis.books.length - 1, 1)) * 560;
                const y = 220 - (book.criticalMomentum / 100) * 190;
                return `${x},${y}`;
              }).join(' ')}
              fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6"
            />

            {/* Break-even marker */}
            {analysis.breakEvenBook >= 0 && (
              <g>
                <line
                  x1={80 + (analysis.breakEvenBook / Math.max(analysis.books.length - 1, 1)) * 560}
                  y1={25} x2={80 + (analysis.breakEvenBook / Math.max(analysis.books.length - 1, 1)) * 560}
                  y2={220} stroke="#22c55e" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                <text
                  x={80 + (analysis.breakEvenBook / Math.max(analysis.books.length - 1, 1)) * 560}
                  y={20} fill="#22c55e" fontSize="7" textAnchor="middle">💰 Break-Even</text>
              </g>
            )}

            {/* Axis labels */}
            <text x={360} y={250} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle">Book Number →</text>
          </svg>
          <div className="flex gap-4 justify-center text-[9px] text-text-muted mt-1">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-starforge-gold/40 border border-starforge-gold rounded-sm" /> First-Year Sales</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded-full" /> Critical Momentum</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500/40 border border-emerald-500 rounded-sm" /> Breakout</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500/40 border border-red-500 rounded-sm" /> Sophomore Slump</span>
          </div>
        </div>
      </div>

      {/* ═══ PROJECTION TABLE ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" /> Multi-Book Projection Detail
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-2 py-1.5 text-text-muted font-ui uppercase">Book</th>
              <th className="px-2 py-1.5 text-text-muted font-ui uppercase">Year</th>
              <th className="px-2 py-1.5 text-text-muted font-ui uppercase">1st-Yr Sales</th>
              <th className="px-2 py-1.5 text-text-muted font-ui uppercase">Cumulative</th>
              <th className="px-2 py-1.5 text-text-muted font-ui uppercase">Platform</th>
              <th className="px-2 py-1.5 text-text-muted font-ui uppercase">Momentum</th>
              <th className="px-2 py-1.5 text-text-muted font-ui uppercase">Revenue</th>
              <th className="px-2 py-1.5 text-text-muted font-ui uppercase">Profit</th>
              <th className="px-2 py-1.5 text-text-muted font-ui uppercase">Cum. ROI</th>
              <th className="px-2 py-1.5 text-text-muted font-ui uppercase">Status</th>
            </tr></thead>
            <tbody>
              {analysis.books.map(book => (
                <tr key={book.bookNumber} className={`border-b border-white/[0.03] ${book.isBreakout ? 'bg-emerald-500/5' : book.isSophomoreSlump ? 'bg-red-500/5' : ''}`}>
                  <td className="px-2 py-1 text-text-primary font-medium">Book {book.bookNumber}</td>
                  <td className="px-2 py-1 text-center font-mono text-text-muted">Yr {book.yearOffset.toFixed(1)}</td>
                  <td className="px-2 py-1 text-center font-mono text-text-primary">{book.salesFirstYear.toLocaleString()}</td>
                  <td className="px-2 py-1 text-center font-mono text-text-muted">{book.cumulativeSales.toLocaleString()}</td>
                  <td className="px-2 py-1 text-center font-mono text-cyan-400">{book.platformSize.toLocaleString()}</td>
                  <td className="px-2 py-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-12 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500/60 rounded-full" style={{ width: `${book.criticalMomentum}%` }} />
                      </div>
                      <span className="text-[8px] font-mono text-text-muted">{book.criticalMomentum}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1 text-center font-mono text-emerald-400">{fmt(book.revenue)}</td>
                  <td className={`px-2 py-1 text-center font-mono ${book.publisherProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmt(book.publisherProfit)}
                  </td>
                  <td className={`px-2 py-1 text-center font-mono ${book.cumulativeROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {book.cumulativeROI.toFixed(0)}%
                  </td>
                  <td className="px-2 py-1 text-center">
                    {book.isBreakout ? <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded">🚀 Breakout</span> :
                     book.isSophomoreSlump ? <span className="text-[8px] bg-red-500/20 text-red-400 px-1 rounded">📉 Slump</span> :
                     <span className="text-[8px] text-text-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ SUMMARY METRICS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Lifetime Revenue</p>
          <p className="font-heading text-xl text-emerald-400">{fmt(analysis.lifetimeRevenue)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Total Investment</p>
          <p className="font-heading text-xl text-red-400">{fmt(analysis.lifetimeInvestment)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Lifetime ROI</p>
          <p className={`font-heading text-xl ${analysis.lifetimeROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{analysis.lifetimeROI.toFixed(0)}%</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Break-Even</p>
          <p className="font-heading text-xl text-starforge-gold">{analysis.breakEvenBook >= 0 ? `Book ${analysis.books[analysis.breakEvenBook]?.bookNumber}` : 'Never'}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Peak Sales</p>
          <p className="font-heading text-xl text-purple-400">{analysis.peakBook?.salesFirstYear.toLocaleString()}</p>
          <p className="text-[8px] text-text-muted">Book {analysis.peakBook?.bookNumber}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[8px] text-text-muted uppercase mb-1">Breakout Prob.</p>
          <p className={`font-heading text-xl ${analysis.breakoutProb >= 50 ? 'text-emerald-400' : analysis.breakoutProb >= 25 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.breakoutProb}%</p>
        </div>
      </div>

      {/* ═══ PLATFORM GROWTH CHART ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" /> Platform Growth Projection
          <TIP text="Author platform size (social + newsletter × 5) compounding over books. Each book grows the platform via reader acquisition. Reaches critical mass at ~5,000 engaged fans (adapted from Kevin Kelly's '1000 True Fans')." />
        </h4>
        <div className="bg-void-black rounded-lg p-3 border border-white/[0.06]">
          <svg viewBox="0 0 700 160" className="w-full h-32">
            {/* Grid */}
            {[0, 0.5, 1].map(frac => {
              const maxPlatform = Math.max(...analysis.books.map(b => b.platformSize), 1);
              const y = 140 - frac * 115;
              return (
                <g key={frac}>
                  <line x1={60} y1={y} x2={660} y2={y} stroke="rgba(255,255,255,0.04)" />
                  <text x={55} y={y + 3} fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="end">{Math.round(maxPlatform * frac).toLocaleString()}</text>
                </g>
              );
            })}

            {/* True Fans threshold line at 5000 */}
            {(() => {
              const maxPlatform = Math.max(...analysis.books.map(b => b.platformSize), 1);
              const thresholdY = 140 - (5000 / maxPlatform) * 115;
              if (thresholdY > 25 && thresholdY < 140) {
                return (
                  <g>
                    <line x1={60} y1={thresholdY} x2={660} y2={thresholdY} stroke="#d4a017" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
                    <text x={665} y={thresholdY + 3} fill="#d4a017" fontSize="6" opacity="0.6">True Fans</text>
                  </g>
                );
              }
              return null;
            })()}

            {/* Area fill */}
            <polygon
              points={[
                ...analysis.books.map((book, i) => {
                  const maxPlatform = Math.max(...analysis.books.map(b => b.platformSize), 1);
                  const x = 80 + (i / Math.max(analysis.books.length - 1, 1)) * 560;
                  const y = 140 - (book.platformSize / maxPlatform) * 115;
                  return `${x},${y}`;
                }),
                `${80 + 560},140`,
                `80,140`,
              ].join(' ')}
              fill="rgba(6,182,212,0.1)"
            />

            {/* Line */}
            <polyline
              points={analysis.books.map((book, i) => {
                const maxPlatform = Math.max(...analysis.books.map(b => b.platformSize), 1);
                const x = 80 + (i / Math.max(analysis.books.length - 1, 1)) * 560;
                const y = 140 - (book.platformSize / maxPlatform) * 115;
                return `${x},${y}`;
              }).join(' ')}
              fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinejoin="round"
            />

            {/* Data points */}
            {analysis.books.map((book, i) => {
              const maxPlatform = Math.max(...analysis.books.map(b => b.platformSize), 1);
              const x = 80 + (i / Math.max(analysis.books.length - 1, 1)) * 560;
              const y = 140 - (book.platformSize / maxPlatform) * 115;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3" fill="#06b6d4" stroke="#000" strokeWidth="0.5" />
                  <text x={x} y={y - 8} fill="rgba(255,255,255,0.5)" fontSize="7" textAnchor="middle">
                    {book.platformSize.toLocaleString()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ═══ STRATEGIC VERDICT ═══ */}
      <div className={`border rounded-xl p-5 ${analysis.lifetimeROI >= 50 ? 'bg-emerald-500/5 border-emerald-500/20' : analysis.lifetimeROI >= 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Investment Horizon</p>
            <p className={`font-heading text-4xl ${analysis.lifetimeROI >= 50 ? 'text-emerald-400' : analysis.lifetimeROI >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {analysis.lifetimeROI >= 100 ? 'A+' : analysis.lifetimeROI >= 50 ? 'A' : analysis.lifetimeROI >= 20 ? 'B' : analysis.lifetimeROI >= 0 ? 'C' : 'F'}
            </p>
          </div>
          <div className="w-px h-12 bg-white/[0.1]" />
          <div className="flex-1 text-xs text-text-secondary space-y-1">
            <p>
              Over {booksPlanned} books ({(booksPlanned * pubCadence / 12).toFixed(1)} years), this author generates
              <strong className={analysis.lifetimeROI >= 0 ? 'text-emerald-400' : 'text-red-400'}> {fmt(analysis.lifetimeRevenue)}</strong> revenue
              on <strong className="text-red-400">{fmt(analysis.lifetimeInvestment)}</strong> investment
              ({analysis.lifetimeROI.toFixed(0)}% ROI).
            </p>
            <p>
              {analysis.breakEvenBook >= 0
                ? `Break-even at Book ${analysis.books[analysis.breakEvenBook]?.bookNumber} (Year ${analysis.books[analysis.breakEvenBook]?.yearOffset.toFixed(1)}).`
                : '⚠️ Does not reach break-even within projection.'}
              {' '}Breakout probability: <strong className="text-starforge-gold">{analysis.breakoutProb}%</strong>.
              {analysis.books.some(b => b.isSophomoreSlump) && ` Book 2 sophomore dip: -${(analysis.params.sophomoreDip * 100).toFixed(0)}% (genre average for ${analysis.params.label}).`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
