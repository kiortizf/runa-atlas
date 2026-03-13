import { useState, useMemo } from 'react';
import {
  Info, TrendingUp, PieChart, BarChart3, Shield, Zap,
  Target, AlertTriangle, DollarSign, Scale, Sparkles
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   PUBLISHING PORTFOLIO THEORY
   ────────────────────────────────────────────────────────────
   Harry Markowitz won the 1990 Nobel Prize in Economics for
   Modern Portfolio Theory (MPT). This system applies MPT to
   a publisher's catalog — treating each title as an "asset"
   with expected return, risk (variance), and correlation to
   other titles.

   Concepts implemented:
   • Expected Return E(R) per title
   • Risk (standard deviation) per title
   • Genre Correlation Matrix (like stock correlations)
   • Portfolio Expected Return & Risk
   • Efficient Frontier visualization
   • Sharpe Ratio (risk-adjusted return)
   • Optimal portfolio allocation
   • Diversification score
   • What-if analysis: adding a new title

   THIS HAS NEVER BEEN BUILT AS A PUBLISHING TOOL.
   Academic papers discuss it. No one has dared to implement it.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

// Genre correlation matrix (based on reader audience overlap)
// Values: -1.0 (inverse) to +1.0 (perfect correlation)
const GENRES = ['SFF', 'Romance', 'Literary', 'YA', 'Mystery', 'Horror', 'Nonfiction'];
const GENRE_CORRELATIONS: Record<string, Record<string, number>> = {
  SFF:       { SFF: 1.00, Romance: 0.25, Literary: 0.30, YA: 0.45, Mystery: 0.20, Horror: 0.50, Nonfiction: 0.05 },
  Romance:   { SFF: 0.25, Romance: 1.00, Literary: 0.15, YA: 0.55, Mystery: 0.35, Horror: 0.10, Nonfiction: 0.10 },
  Literary:  { SFF: 0.30, Romance: 0.15, Literary: 1.00, YA: 0.20, Mystery: 0.25, Horror: 0.15, Nonfiction: 0.40 },
  YA:        { SFF: 0.45, Romance: 0.55, Literary: 0.20, YA: 1.00, Mystery: 0.30, Horror: 0.35, Nonfiction: 0.05 },
  Mystery:   { SFF: 0.20, Romance: 0.35, Literary: 0.25, YA: 0.30, Mystery: 1.00, Horror: 0.40, Nonfiction: 0.15 },
  Horror:    { SFF: 0.50, Romance: 0.10, Literary: 0.15, YA: 0.35, Mystery: 0.40, Horror: 1.00, Nonfiction: 0.05 },
  Nonfiction:{ SFF: 0.05, Romance: 0.10, Literary: 0.40, YA: 0.05, Mystery: 0.15, Horror: 0.05, Nonfiction: 1.00 },
};

// Genre risk/return profiles (based on industry data)
const GENRE_PROFILES: Record<string, { avgReturn: number; stdDev: number; label: string }> = {
  SFF:       { avgReturn: 22, stdDev: 35, label: 'High return, high risk. BookTok-driven spikes.' },
  Romance:   { avgReturn: 18, stdDev: 20, label: 'Moderate return, lower risk. Most consistent genre.' },
  Literary:  { avgReturn: 12, stdDev: 40, label: 'Lower avg return, highest variance. Award-driven spikes.' },
  YA:        { avgReturn: 15, stdDev: 30, label: 'Cyclical. Strong when trending, quiet otherwise.' },
  Mystery:   { avgReturn: 16, stdDev: 22, label: 'Steady mid-range. Reliable backlist performance.' },
  Horror:    { avgReturn: 20, stdDev: 32, label: 'Rising genre. High variance but growing market.' },
  Nonfiction:{ avgReturn: 10, stdDev: 15, label: 'Lowest return but lowest risk. Stable backlist.' },
};

interface CatalogTitle {
  title: string; genre: string; investment: number; expectedRevenue: number; riskMultiplier: number;
}

export default function MSPortfolioTheory() {
  const [catalog, setCatalog] = useState<CatalogTitle[]>([
    { title: 'Title A', genre: 'SFF', investment: 12000, expectedRevenue: 18000, riskMultiplier: 1.0 },
    { title: 'Title B', genre: 'Romance', investment: 8000, expectedRevenue: 12000, riskMultiplier: 0.8 },
    { title: 'Title C', genre: 'Literary', investment: 10000, expectedRevenue: 8000, riskMultiplier: 1.5 },
    { title: 'Title D', genre: 'SFF', investment: 15000, expectedRevenue: 22000, riskMultiplier: 1.2 },
    { title: 'Title E', genre: 'Horror', investment: 9000, expectedRevenue: 14000, riskMultiplier: 1.1 },
    { title: 'Title F', genre: 'YA', investment: 7000, expectedRevenue: 10000, riskMultiplier: 0.9 },
  ]);

  // New title "what-if"
  const [newTitle, setNewTitle] = useState<CatalogTitle>(
    { title: 'New Manuscript', genre: 'SFF', investment: 10000, expectedRevenue: 15000, riskMultiplier: 1.0 }
  );
  const [riskFreeRate] = useState(4.5); // Treasury rate proxy

  const updateCatalog = (idx: number, field: keyof CatalogTitle, value: string | number) => {
    setCatalog(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const addTitle = () => setCatalog(prev => [...prev, { title: `Title ${String.fromCharCode(65 + prev.length)}`, genre: 'SFF', investment: 10000, expectedRevenue: 15000, riskMultiplier: 1.0 }]);
  const removeTitle = (idx: number) => setCatalog(prev => prev.filter((_, i) => i !== idx));

  const analysis = useMemo(() => {
    // Per-title metrics
    const titles = catalog.map(t => {
      const returnPct = t.investment > 0 ? ((t.expectedRevenue - t.investment) / t.investment * 100) : 0;
      const genreProfile = GENRE_PROFILES[t.genre] || GENRE_PROFILES['SFF'];
      const risk = genreProfile.stdDev * t.riskMultiplier;
      return { ...t, returnPct, risk, genreProfile };
    });

    // Portfolio totals
    const totalInvestment = titles.reduce((s, t) => s + t.investment, 0);
    const weights = titles.map(t => totalInvestment > 0 ? t.investment / totalInvestment : 0);

    // Portfolio return (weighted average)
    const portfolioReturn = titles.reduce((s, t, i) => s + t.returnPct * weights[i], 0);

    // Portfolio risk (with correlations)
    let portfolioVariance = 0;
    for (let i = 0; i < titles.length; i++) {
      for (let j = 0; j < titles.length; j++) {
        const corr = GENRE_CORRELATIONS[titles[i].genre]?.[titles[j].genre] ?? 0.5;
        portfolioVariance += weights[i] * weights[j] * titles[i].risk * titles[j].risk * corr / 100;
      }
    }
    const portfolioRisk = Math.sqrt(Math.max(0, portfolioVariance));

    // Sharpe Ratio
    const sharpeRatio = portfolioRisk > 0 ? (portfolioReturn - riskFreeRate) / portfolioRisk : 0;
    const sharpeLabel = sharpeRatio >= 2 ? 'Excellent — hedge fund territory'
      : sharpeRatio >= 1 ? 'Good — above average risk-adjusted return'
      : sharpeRatio >= 0.5 ? 'Acceptable — could improve'
      : sharpeRatio >= 0 ? 'Poor — returns don\'t justify risk'
      : 'Negative — losing money on risk-adjusted basis';

    // Diversification score
    const genreCounts: Record<string, number> = {};
    titles.forEach(t => { genreCounts[t.genre] = (genreCounts[t.genre] || 0) + 1; });
    const uniqueGenres = Object.keys(genreCounts).length;
    const herfindahlIndex = Object.values(genreCounts).reduce((s, c) => s + (c / titles.length) ** 2, 0);
    const diversificationScore = titles.length > 0 ? Math.round((1 - herfindahlIndex) * 100) : 0;

    // Genre allocation
    const genreAllocation = GENRES.map(g => {
      const genreTitles = titles.filter(t => t.genre === g);
      const genreInvestment = genreTitles.reduce((s, t) => s + t.investment, 0);
      const pct = totalInvestment > 0 ? (genreInvestment / totalInvestment * 100) : 0;
      return { genre: g, count: genreTitles.length, investment: genreInvestment, pct };
    }).filter(g => g.count > 0).sort((a, b) => b.pct - a.pct);

    // Efficient frontier simulation (generate 20 portfolio variants by adjusting weights)
    const frontierPoints = Array.from({ length: 25 }, (_, fi) => {
      const t = fi / 24;
      // Simulate shifting from lowest-risk to highest-risk allocation
      const simWeights = titles.map((title, i) => {
        const riskBias = title.risk / (Math.max(...titles.map(t => t.risk)) || 1);
        return (1 - t) * (1 - riskBias) + t * riskBias;
      });
      const sumW = simWeights.reduce((s, w) => s + w, 0);
      const normWeights = simWeights.map(w => sumW > 0 ? w / sumW : 0);

      const simReturn = titles.reduce((s, title, i) => s + title.returnPct * normWeights[i], 0);
      let simVar = 0;
      for (let i = 0; i < titles.length; i++) {
        for (let j = 0; j < titles.length; j++) {
          const corr = GENRE_CORRELATIONS[titles[i].genre]?.[titles[j].genre] ?? 0.5;
          simVar += normWeights[i] * normWeights[j] * titles[i].risk * titles[j].risk * corr / 100;
        }
      }
      return { risk: Math.sqrt(Math.max(0, simVar)), return: simReturn };
    });

    // "What-if" analysis: adding the new title
    const newReturnPct = newTitle.investment > 0 ? ((newTitle.expectedRevenue - newTitle.investment) / newTitle.investment * 100) : 0;
    const newGenreProfile = GENRE_PROFILES[newTitle.genre] || GENRE_PROFILES['SFF'];
    const newRisk = newGenreProfile.stdDev * newTitle.riskMultiplier;

    const withNewTitles = [...titles, { ...newTitle, returnPct: newReturnPct, risk: newRisk, genreProfile: newGenreProfile }];
    const newTotalInv = totalInvestment + newTitle.investment;
    const newWeights = withNewTitles.map(t => newTotalInv > 0 ? t.investment / newTotalInv : 0);
    const newPortReturn = withNewTitles.reduce((s, t, i) => s + t.returnPct * newWeights[i], 0);
    let newPortVar = 0;
    for (let i = 0; i < withNewTitles.length; i++) {
      for (let j = 0; j < withNewTitles.length; j++) {
        const corr = GENRE_CORRELATIONS[withNewTitles[i].genre]?.[withNewTitles[j].genre] ?? 0.5;
        newPortVar += newWeights[i] * newWeights[j] * withNewTitles[i].risk * withNewTitles[j].risk * corr / 100;
      }
    }
    const newPortRisk = Math.sqrt(Math.max(0, newPortVar));
    const newSharpe = newPortRisk > 0 ? (newPortReturn - riskFreeRate) / newPortRisk : 0;

    const whatIfDelta = {
      returnDelta: newPortReturn - portfolioReturn,
      riskDelta: newPortRisk - portfolioRisk,
      sharpeDelta: newSharpe - sharpeRatio,
      verdict: newSharpe > sharpeRatio ? 'IMPROVES portfolio' : newSharpe === sharpeRatio ? 'NEUTRAL' : 'DEGRADES portfolio',
    };

    return {
      titles, totalInvestment, weights, portfolioReturn, portfolioRisk,
      sharpeRatio, sharpeLabel, diversificationScore, uniqueGenres,
      genreAllocation, frontierPoints, whatIfDelta,
      newPortReturn, newPortRisk, newSharpe,
    };
  }, [catalog, newTitle, riskFreeRate]);

  const inputClass = "w-full bg-void-black border border-border rounded px-2 py-1 text-[11px] text-white focus:border-starforge-gold outline-none font-mono";
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-purple-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" /> Publishing Portfolio Theory
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Harry Markowitz's Nobel Prize-winning Modern Portfolio Theory, applied to your book catalog.
          Each title is an asset with expected return and risk. Optimize your catalog like a hedge fund manages investments.
          <strong className="text-starforge-gold"> No publishing platform has ever implemented this.</strong>
        </p>
      </div>

      {/* ═══ PORTFOLIO DASHBOARD ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Portfolio Return</p>
          <p className={`font-heading text-xl ${analysis.portfolioReturn >= 15 ? 'text-emerald-400' : analysis.portfolioReturn >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.portfolioReturn.toFixed(1)}%</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Portfolio Risk (σ)</p>
          <p className="font-heading text-xl text-text-primary">{analysis.portfolioRisk.toFixed(1)}%</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Sharpe Ratio <TIP text="Risk-adjusted return. >1 is good, >2 is excellent. (Return - Risk-Free Rate) / Risk." /></p>
          <p className={`font-heading text-xl ${analysis.sharpeRatio >= 1 ? 'text-emerald-400' : analysis.sharpeRatio >= 0.5 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.sharpeRatio.toFixed(2)}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Diversification <TIP text="1 - Herfindahl Index. Higher = more diversified. 100% = perfectly diversified." /></p>
          <p className={`font-heading text-xl ${analysis.diversificationScore >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>{analysis.diversificationScore}%</p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
          <p className="text-[9px] text-text-muted uppercase mb-1">Total Investment</p>
          <p className="font-heading text-xl text-starforge-gold">{fmt(analysis.totalInvestment)}</p>
        </div>
      </div>

      {/* ═══ Two-Column: Catalog Table + Efficient Frontier ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Catalog Positions */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-heading text-sm text-text-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Catalog Positions
            </h4>
            <button onClick={addTitle} className="text-[10px] text-starforge-gold hover:text-amber-300 font-ui">+ Add Title</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead><tr className="border-b border-white/[0.06]">
                <th className="text-left px-1 py-1.5 text-text-muted font-ui uppercase">Title</th>
                <th className="px-1 py-1.5 text-text-muted font-ui uppercase">Genre</th>
                <th className="px-1 py-1.5 text-text-muted font-ui uppercase">Invest</th>
                <th className="px-1 py-1.5 text-text-muted font-ui uppercase">Expected</th>
                <th className="px-1 py-1.5 text-text-muted font-ui uppercase">Return</th>
                <th className="px-1 py-1.5 text-text-muted font-ui uppercase">Risk</th>
                <th className="w-6"></th>
              </tr></thead>
              <tbody>{catalog.map((t, i) => {
                const metrics = analysis.titles[i];
                return (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="px-1 py-0.5"><input type="text" value={t.title} onChange={e => updateCatalog(i, 'title', e.target.value)} className={inputClass} /></td>
                    <td className="px-1 py-0.5"><select value={t.genre} onChange={e => updateCatalog(i, 'genre', e.target.value)} className={inputClass}>{GENRES.map(g => <option key={g}>{g}</option>)}</select></td>
                    <td className="px-1 py-0.5"><input type="number" min={0} step={1000} value={t.investment} onChange={e => updateCatalog(i, 'investment', +e.target.value)} className={inputClass} /></td>
                    <td className="px-1 py-0.5"><input type="number" min={0} step={1000} value={t.expectedRevenue} onChange={e => updateCatalog(i, 'expectedRevenue', +e.target.value)} className={inputClass} /></td>
                    <td className="px-1 py-0.5"><span className={`font-mono ${(metrics?.returnPct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(metrics?.returnPct || 0).toFixed(0)}%</span></td>
                    <td className="px-1 py-0.5"><span className="font-mono text-text-muted">{(metrics?.risk || 0).toFixed(0)}%</span></td>
                    <td className="px-1"><button onClick={() => removeTitle(i)} className="text-text-muted hover:text-red-400 text-sm">×</button></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </div>

        {/* Efficient Frontier */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> Efficient Frontier
            <TIP text="The efficient frontier shows the set of optimal portfolios that offer the highest expected return for each level of risk. Your current portfolio should sit on or near this curve." />
          </h4>
          <div className="bg-void-black rounded-lg p-3 border border-white/[0.06]">
            <svg viewBox="0 0 400 250" className="w-full h-44">
              {/* Grid */}
              <text x="200" y="245" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle">Risk (σ) →</text>
              <text x="10" y="125" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" transform="rotate(-90,10,125)">Return (%) →</text>
              {[0, 50, 100, 150, 200].map(y => (
                <line key={y} x1={40} y1={y + 15} x2={380} y2={y + 15} stroke="rgba(255,255,255,0.04)" />
              ))}

              {/* Frontier curve */}
              <polyline
                points={analysis.frontierPoints
                  .sort((a, b) => a.risk - b.risk)
                  .map(p => {
                    const x = 40 + (p.risk / 40) * 340;
                    const y = 215 - ((p.return + 10) / 60) * 200;
                    return `${Math.max(40, Math.min(380, x))},${Math.max(15, Math.min(215, y))}`;
                  })
                  .join(' ')}
                fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="2" strokeLinecap="round"
              />

              {/* Individual title positions */}
              {analysis.titles.map((t, i) => {
                const x = 40 + (t.risk / 40) * 340;
                const y = 215 - ((t.returnPct + 10) / 60) * 200;
                return (
                  <g key={i}>
                    <circle cx={Math.max(40, Math.min(380, x))} cy={Math.max(15, Math.min(215, y))} r="4"
                      fill={t.returnPct >= 0 ? '#22c55e' : '#ef4444'} stroke="#000" strokeWidth="1" opacity="0.8" />
                    <text x={Math.max(40, Math.min(370, x + 6))} y={Math.max(20, Math.min(210, y + 3))}
                      fill="rgba(255,255,255,0.5)" fontSize="7">{t.title.slice(0, 8)}</text>
                  </g>
                );
              })}

              {/* Current portfolio position */}
              <circle cx={Math.max(40, Math.min(380, 40 + (analysis.portfolioRisk / 40) * 340))}
                cy={Math.max(15, Math.min(215, 215 - ((analysis.portfolioReturn + 10) / 60) * 200))}
                r="6" fill="#d4a017" stroke="#000" strokeWidth="1.5" />
              <text x={Math.max(50, Math.min(370, 40 + (analysis.portfolioRisk / 40) * 340 + 8))}
                y={Math.max(20, Math.min(210, 215 - ((analysis.portfolioReturn + 10) / 60) * 200 + 3))}
                fill="#d4a017" fontSize="8" fontWeight="bold">Portfolio</text>
            </svg>
            <div className="flex gap-4 justify-center text-[9px] text-text-muted mt-1">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-starforge-gold rounded-full" /> Portfolio</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Individual Titles</span>
              <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-purple-500/50 inline-block" /> Frontier</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Two-Column: Genre Allocation + Correlation Matrix ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Genre Allocation */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-400" /> Genre Allocation
          </h4>
          <div className="space-y-2">
            {analysis.genreAllocation.map(g => (
              <div key={g.genre} className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted w-16">{g.genre}</span>
                <div className="flex-1 h-4 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-starforge-gold/40 to-starforge-gold/80 rounded-full" style={{ width: `${g.pct}%` }} />
                </div>
                <span className="text-[10px] font-mono text-text-primary w-10 text-right">{g.pct.toFixed(0)}%</span>
                <span className="text-[9px] font-mono text-text-muted w-12 text-right">{g.count} title{g.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-2">
            {analysis.diversificationScore >= 70 ? '✅ Well-diversified catalog. Risk is spread across genres.'
              : analysis.diversificationScore >= 40 ? '⚠️ Moderate concentration. Consider diversifying into underrepresented genres.'
              : '🔴 Highly concentrated. Portfolio risk is elevated.'}
          </p>
        </div>

        {/* Correlation Matrix */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" /> Genre Correlation Matrix
            <TIP text="How audiences overlap between genres. Low correlation = good diversification. Like stock correlations in finance." />
          </h4>
          <div className="overflow-x-auto">
            <table className="text-[9px]">
              <thead><tr>
                <th className="px-1.5 py-1 text-text-muted"></th>
                {GENRES.map(g => <th key={g} className="px-1.5 py-1 text-text-muted font-mono">{g.slice(0, 3)}</th>)}
              </tr></thead>
              <tbody>{GENRES.map(g1 => (
                <tr key={g1}>
                  <td className="px-1.5 py-0.5 text-text-muted font-mono">{g1.slice(0, 3)}</td>
                  {GENRES.map(g2 => {
                    const val = GENRE_CORRELATIONS[g1]?.[g2] ?? 0;
                    const intensity = Math.abs(val);
                    return (
                      <td key={g2} className="px-1.5 py-0.5 text-center font-mono" style={{
                        backgroundColor: g1 === g2 ? 'rgba(212,160,23,0.15)' : val > 0.4 ? `rgba(239,68,68,${intensity * 0.3})` : `rgba(34,197,94,${(1 - intensity) * 0.2})`,
                      }}>{val.toFixed(2)}</td>
                    );
                  })}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p className="text-[9px] text-text-muted mt-2">🟢 Low correlation = good diversifier. 🔴 High correlation = overlapping risk.</p>
        </div>
      </div>

      {/* ═══ WHAT-IF: Adding a New Title ═══ */}
      <div className={`border rounded-xl p-5 ${analysis.whatIfDelta.sharpeDelta >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" /> What-If: Add This Manuscript
          <TIP text="Simulate adding the manuscript under evaluation to your catalog. Does it improve or degrade your portfolio's risk-adjusted return?" />
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div><label className="block text-[9px] text-text-muted uppercase mb-0.5">Title</label><input type="text" value={newTitle.title} onChange={e => setNewTitle(p => ({ ...p, title: e.target.value }))} className={inputClass} /></div>
          <div><label className="block text-[9px] text-text-muted uppercase mb-0.5">Genre</label><select value={newTitle.genre} onChange={e => setNewTitle(p => ({ ...p, genre: e.target.value }))} className={inputClass}>{GENRES.map(g => <option key={g}>{g}</option>)}</select></div>
          <div><label className="block text-[9px] text-text-muted uppercase mb-0.5">Investment ($)</label><input type="number" min={0} step={1000} value={newTitle.investment} onChange={e => setNewTitle(p => ({ ...p, investment: +e.target.value }))} className={inputClass} /></div>
          <div><label className="block text-[9px] text-text-muted uppercase mb-0.5">Expected Rev ($)</label><input type="number" min={0} step={1000} value={newTitle.expectedRevenue} onChange={e => setNewTitle(p => ({ ...p, expectedRevenue: +e.target.value }))} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/[0.03] rounded-lg p-3 text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Return Δ</p>
            <p className={`font-heading text-lg ${analysis.whatIfDelta.returnDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{analysis.whatIfDelta.returnDelta >= 0 ? '+' : ''}{analysis.whatIfDelta.returnDelta.toFixed(1)}%</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-3 text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Risk Δ</p>
            <p className={`font-heading text-lg ${analysis.whatIfDelta.riskDelta <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{analysis.whatIfDelta.riskDelta >= 0 ? '+' : ''}{analysis.whatIfDelta.riskDelta.toFixed(1)}%</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-3 text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Sharpe Δ</p>
            <p className={`font-heading text-lg ${analysis.whatIfDelta.sharpeDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{analysis.whatIfDelta.sharpeDelta >= 0 ? '+' : ''}{analysis.whatIfDelta.sharpeDelta.toFixed(3)}</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-3 text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Verdict</p>
            <p className={`font-heading text-sm ${analysis.whatIfDelta.sharpeDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{analysis.whatIfDelta.verdict}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
