import { useState, useMemo } from 'react';
import { Users, TrendingUp, AlertTriangle, CheckCircle, Info, DollarSign, BarChart3, Star } from 'lucide-react';

/* ─── Advance Negotiation Simulator ───
   Input author platform metrics + comp title sales → outputs recommended advance range,
   risk score, and max ceiling. Based on Acquisition Strategy KB. */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
      {text}
    </span>
  </span>
);

export default function CalcAdvance() {
  // Author platform
  const [socialFollowing, setSocialFollowing] = useState(5000);
  const [emailList, setEmailList] = useState(1000);
  const [previousBooks, setPreviousBooks] = useState(0);
  const [avgPrevSales, setAvgPrevSales] = useState(0);
  const [hasAgent, setHasAgent] = useState(false);
  const [mediaPresence, setMediaPresence] = useState(2); // 1-5

  // Manuscript factors
  const [genreHeat, setGenreHeat] = useState(3); // 1-5
  const [compTitleAvgSales, setCompTitleAvgSales] = useState(3000);
  const [manuscriptScore, setManuscriptScore] = useState(7); // 1-10
  const [uniqueHook, setUniqueHook] = useState(3); // 1-5

  // Market
  const [estimatedListPrice, setEstimatedListPrice] = useState(16.99);
  const [estimatedNetPerUnit, setEstimatedNetPerUnit] = useState(2.32);

  const analysis = useMemo(() => {
    // Platform score (0-30 points)
    const socialScore = socialFollowing >= 50000 ? 10 : socialFollowing >= 10000 ? 7 : socialFollowing >= 5000 ? 4 : socialFollowing >= 1000 ? 2 : 1;
    const emailScore = emailList >= 10000 ? 10 : emailList >= 5000 ? 7 : emailList >= 1000 ? 4 : emailList >= 500 ? 2 : 1;
    const trackRecordScore = previousBooks >= 5 ? 10 : previousBooks >= 3 ? 7 : previousBooks >= 1 ? 4 : 0;
    const platformTotal = socialScore + emailScore + trackRecordScore;

    // Manuscript score (0-30 points)
    const qualityScore = manuscriptScore * 1.5; // max 15
    const hookScore = uniqueHook * 3; // max 15
    const manuscriptTotal = qualityScore + hookScore;

    // Market score (0-40 points)
    const genreScore = genreHeat * 4; // max 20
    const compScore = compTitleAvgSales >= 10000 ? 20 : compTitleAvgSales >= 5000 ? 15 : compTitleAvgSales >= 2000 ? 10 : compTitleAvgSales >= 500 ? 5 : 2;
    const marketTotal = genreScore + compScore;

    const totalScore = platformTotal + manuscriptTotal + marketTotal; // max 100

    // Advance calculation
    const conservativeMultiplier = 0.3;
    const aggressiveMultiplier = 0.8;
    const estimatedFirstYearUnits = compTitleAvgSales * (manuscriptScore / 7) * (genreHeat / 3);
    const estimatedFirstYearRevenue = estimatedFirstYearUnits * estimatedNetPerUnit;

    const advanceFloor = Math.round(estimatedFirstYearRevenue * conservativeMultiplier / 500) * 500;
    const advanceCeiling = Math.round(estimatedFirstYearRevenue * aggressiveMultiplier / 500) * 500;
    const recommendedAdvance = Math.round(estimatedFirstYearRevenue * 0.5 / 500) * 500;

    // Risk assessment
    const riskScore = totalScore >= 70 ? 'LOW' : totalScore >= 40 ? 'MODERATE' : 'HIGH';
    const earnOutProb = totalScore >= 70 ? '75-90%' : totalScore >= 50 ? '50-70%' : totalScore >= 30 ? '25-45%' : '<25%';

    // Advance structure recommendation
    const milestones = [
      { event: 'Signing', pct: 33, amount: Math.round(recommendedAdvance * 0.33) },
      { event: 'Delivery & Acceptance', pct: 33, amount: Math.round(recommendedAdvance * 0.33) },
      { event: 'Publication', pct: 34, amount: Math.round(recommendedAdvance * 0.34) },
    ];

    return {
      platformTotal, manuscriptTotal, marketTotal, totalScore,
      estimatedFirstYearUnits: Math.round(estimatedFirstYearUnits),
      estimatedFirstYearRevenue,
      advanceFloor: Math.max(500, advanceFloor),
      advanceCeiling: Math.max(1000, advanceCeiling),
      recommendedAdvance: Math.max(750, recommendedAdvance),
      riskScore, earnOutProb, milestones,
    };
  }, [socialFollowing, emailList, previousBooks, manuscriptScore, uniqueHook, genreHeat, compTitleAvgSales, estimatedNetPerUnit]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const inputClass = "w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none";
  const labelClass = "block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Author Platform */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Author Platform
            <TIP text="Author's existing audience and track record. Larger platforms reduce marketing risk and improve sell-through velocity." />
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Social Media Following <TIP text="Combined across Instagram, TikTok, Twitter/X, YouTube. BookTok/Bookstagram weight highest." /></label>
              <input type="number" min={0} max={1000000} step={500} value={socialFollowing} onChange={e => setSocialFollowing(+e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email List Size <TIP text="Author's owned email list. Email converts 5-10× better than social media for book sales." /></label>
              <input type="number" min={0} max={100000} step={100} value={emailList} onChange={e => setEmailList(+e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Previous Books Published <TIP text="Traditionally or self-published. Self-pub with 1000+ sales per title counts strongly." /></label>
              <input type="number" min={0} max={50} step={1} value={previousBooks} onChange={e => setPreviousBooks(+e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Media Presence: {mediaPresence}/5 <TIP text="1=None, 2=Blog/podcast guest, 3=Regular columnist/podcaster, 4=Media mentions, 5=Major platform (NYT, NPR, etc.)" /></label>
              <input type="range" min={1} max={5} step={1} value={mediaPresence} onChange={e => setMediaPresence(+e.target.value)} className="w-full accent-starforge-gold" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={hasAgent} onChange={e => setHasAgent(e.target.checked)} className="accent-starforge-gold" />
              <span className="text-xs text-text-secondary">Has literary agent <TIP text="Agented submissions signal professional quality. Agent negotiation may push advance higher." /></span>
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <p className="text-[9px] text-text-muted uppercase mb-1">Platform Score</p>
              <p className={`font-heading text-xl ${analysis.platformTotal >= 20 ? 'text-emerald-400' : analysis.platformTotal >= 10 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.platformTotal}/30</p>
            </div>
          </div>
        </div>

        {/* Manuscript Quality */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" /> Manuscript Quality
            <TIP text="Literary merit and commercial viability of the manuscript itself." />
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Manuscript Score: {manuscriptScore}/10 <TIP text="From editorial evaluation rubric. 8+: exceptional, 6-7: strong, 4-5: needs work, <4: pass." /></label>
              <input type="range" min={1} max={10} step={1} value={manuscriptScore} onChange={e => setManuscriptScore(+e.target.value)} className="w-full accent-starforge-gold" />
            </div>
            <div>
              <label className={labelClass}>Unique Hook: {uniqueHook}/5 <TIP text="How distinctive is the premise? 5=never-seen-before concept, 3=fresh twist on familiar, 1=well-trodden territory." /></label>
              <input type="range" min={1} max={5} step={1} value={uniqueHook} onChange={e => setUniqueHook(+e.target.value)} className="w-full accent-starforge-gold" />
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <p className="text-[9px] text-text-muted uppercase mb-1">Manuscript Score</p>
              <p className={`font-heading text-xl ${analysis.manuscriptTotal >= 20 ? 'text-emerald-400' : analysis.manuscriptTotal >= 12 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.manuscriptTotal.toFixed(0)}/30</p>
            </div>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Market Analysis
            <TIP text="External market factors: genre demand, comparable title performance, and pricing economics." />
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Genre Heat: {genreHeat}/5 <TIP text="Current demand for this genre/subgenre. 5=trending hot (e.g., romantasy 2024-26), 3=steady, 1=declining." /></label>
              <input type="range" min={1} max={5} step={1} value={genreHeat} onChange={e => setGenreHeat(+e.target.value)} className="w-full accent-starforge-gold" />
            </div>
            <div>
              <label className={labelClass}>Comp Title Avg First-Year Sales <TIP text="Average units sold by 3-5 comparable titles in first 12 months. Check BookScan or estimate from BSR." /></label>
              <input type="number" min={100} max={100000} step={500} value={compTitleAvgSales} onChange={e => setCompTitleAvgSales(+e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Est. Net Revenue Per Unit ($) <TIP text="From your Profitability Calculator. This is what the publisher nets per print unit after all deductions." /></label>
              <input type="number" min={0.50} max={20} step={0.10} value={estimatedNetPerUnit} onChange={e => setEstimatedNetPerUnit(+e.target.value)} className={inputClass} />
            </div>
            <div className="bg-white/[0.03] rounded-lg p-3 text-center">
              <p className="text-[9px] text-text-muted uppercase mb-1">Market Score</p>
              <p className={`font-heading text-xl ${analysis.marketTotal >= 25 ? 'text-emerald-400' : analysis.marketTotal >= 15 ? 'text-amber-400' : 'text-red-400'}`}>{analysis.marketTotal}/40</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Advance Recommendation */}
        <div className="bg-gradient-to-br from-starforge-gold/5 to-purple-500/5 border border-starforge-gold/20 rounded-xl p-6">
          <h3 className="font-heading text-base text-text-primary mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-starforge-gold" /> Advance Recommendation
          </h3>
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <p className="text-[9px] text-text-muted uppercase mb-1">Conservative Floor</p>
                <p className="font-heading text-lg text-text-secondary">{fmt(analysis.advanceFloor)}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-[9px] text-starforge-gold uppercase mb-1">★ Recommended</p>
                <p className="font-heading text-2xl text-starforge-gold">{fmt(analysis.recommendedAdvance)}</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-[9px] text-text-muted uppercase mb-1">Aggressive Ceiling</p>
                <p className="font-heading text-lg text-text-secondary">{fmt(analysis.advanceCeiling)}</p>
              </div>
            </div>
            {/* Visual range bar */}
            <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="absolute h-full bg-gradient-to-r from-emerald-500/40 via-starforge-gold/60 to-red-500/40 rounded-full" style={{ left: '10%', width: '80%' }} />
              <div className="absolute h-full w-0.5 bg-starforge-gold" style={{ left: `${Math.min(90, Math.max(10, 50))}%` }} />
            </div>
            <div className="text-[10px] text-text-muted text-center">
              Based on est. {analysis.estimatedFirstYearUnits.toLocaleString()} first-year units × ${estimatedNetPerUnit.toFixed(2)} net/unit
            </div>
          </div>

          {/* Milestone Structure */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-text-muted font-ui uppercase tracking-wider mb-3">Recommended Milestone Structure</p>
            <div className="space-y-2">
              {analysis.milestones.map(m => (
                <div key={m.event} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{m.event} ({m.pct}%)</span>
                  <span className="font-mono text-starforge-gold">{fmt(m.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h3 className="font-heading text-base text-text-primary mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" /> Risk Assessment
          </h3>
          <div className="space-y-4">
            {/* Total Score */}
            <div className="text-center">
              <p className="text-[9px] text-text-muted uppercase mb-1">Total Acquisition Score</p>
              <p className={`font-heading text-4xl ${analysis.totalScore >= 60 ? 'text-emerald-400' : analysis.totalScore >= 35 ? 'text-amber-400' : 'text-red-400'}`}>
                {analysis.totalScore}/100
              </p>
            </div>

            {/* Score breakdown bars */}
            {[
              { label: 'Platform', value: analysis.platformTotal, max: 30, color: 'bg-cyan-500' },
              { label: 'Manuscript', value: analysis.manuscriptTotal, max: 30, color: 'bg-amber-500' },
              { label: 'Market', value: analysis.marketTotal, max: 40, color: 'bg-emerald-500' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="text-[11px] text-text-muted w-20 text-right">{b.label}</span>
                <div className="flex-1 h-4 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full transition-all`} style={{ width: `${(b.value / b.max) * 100}%` }} />
                </div>
                <span className="text-[11px] font-mono text-text-secondary w-12 text-right">{b.value}/{b.max}</span>
              </div>
            ))}

            {/* Risk + Earn-out */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className={`rounded-lg p-3 text-center ${analysis.riskScore === 'LOW' ? 'bg-emerald-500/10' : analysis.riskScore === 'MODERATE' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                <p className="text-[9px] text-text-muted uppercase mb-1">Risk Level</p>
                <p className={`font-heading text-sm ${analysis.riskScore === 'LOW' ? 'text-emerald-400' : analysis.riskScore === 'MODERATE' ? 'text-amber-400' : 'text-red-400'}`}>{analysis.riskScore}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                <p className="text-[9px] text-text-muted uppercase mb-1">Earn-Out Probability</p>
                <p className="font-heading text-sm text-text-primary">{analysis.earnOutProb}</p>
              </div>
            </div>

            {/* Decision */}
            <div className={`rounded-lg p-4 ${analysis.totalScore >= 60 ? 'bg-emerald-500/5 border border-emerald-500/20' : analysis.totalScore >= 35 ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
              <div className="flex items-center gap-2 mb-2">
                {analysis.totalScore >= 60 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                <span className="text-xs font-medium text-text-primary">
                  {analysis.totalScore >= 60 ? 'ACQUIRE — Strong Investment' : analysis.totalScore >= 35 ? 'CONSIDER — Negotiate Terms Carefully' : 'PASS — Unless Strategic Fit'}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                {analysis.totalScore >= 60
                  ? 'Strong author platform, quality manuscript, and favorable market conditions. Offer at recommended advance with standard milestone structure.'
                  : analysis.totalScore >= 35
                  ? 'Mixed signals. Consider lower advance, performance bonus structure, or investing in additional marketing support. Protect downside.'
                  : 'High risk with current metrics. Consider: rights-only deal, profit-sharing arrangement, or ask author to build platform first.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
