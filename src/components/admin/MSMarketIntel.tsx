import { useState, useMemo } from 'react';
import {
  TrendingUp, Info, Target, Calendar, Users, Sparkles, Award, Film,
  Globe, BarChart3, Flame, BookOpen, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   MARKET INTELLIGENCE ENGINE
   Comp analysis • Market timing • Reader personas • Virality scoring
   Award potential • Adaptation suitability • Genre trend radar
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

interface CompTitle { title: string; author: string; pubYear: number; firstYearSales: number; lifetimeSales: number; rating: number; reviews: number; }

// Genre seasonality data (month 1=Jan, 12=Dec, value = index where 100 = average)
const SEASONALITY: Record<string, number[]> = {
  'SFF': [85, 80, 95, 100, 105, 110, 90, 95, 115, 120, 105, 70],
  'Romance': [95, 110, 90, 85, 100, 115, 105, 100, 110, 90, 85, 95],
  'Literary Fiction': [80, 85, 95, 100, 90, 85, 80, 90, 130, 125, 110, 60],
  'YA': [90, 85, 90, 95, 105, 115, 100, 110, 120, 100, 95, 75],
  'Mystery/Thriller': [100, 95, 100, 105, 110, 120, 115, 100, 95, 90, 85, 75],
  'Horror': [75, 80, 85, 90, 85, 80, 100, 115, 130, 140, 90, 70],
  'Nonfiction': [110, 90, 95, 100, 95, 85, 80, 90, 120, 110, 130, 80],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Award windows
const AWARD_CALENDARS = [
  { award: 'Hugo Awards', eligibility: 'Calendar year pub', deadline: 'Mar 31', ceremony: 'Aug', genre: 'SFF', tip: 'WorldCon membership required for nomination. Pub window: Jan-Dec of prev year.' },
  { award: 'Nebula Awards', eligibility: 'Calendar year pub', deadline: 'Feb 15', ceremony: 'May', genre: 'SFF', tip: 'SFWA membership nom. Most prestigious in SFF alongside Hugo.' },
  { award: 'World Fantasy', eligibility: 'Calendar year pub', deadline: 'Jun 1', ceremony: 'Nov', genre: 'SFF', tip: 'Jury-selected. Fantasy-focused. Very prestigious.' },
  { award: 'Lambda Literary', eligibility: 'Calendar year pub', deadline: 'Mar 1', ceremony: 'Jun', genre: 'All', tip: 'LGBTQ+ content. Aligns strongly with Rüna Atlas mission.' },
  { award: 'Ignyte Awards', eligibility: 'Calendar year pub', deadline: 'Apr 1', ceremony: 'Sep', genre: 'SFF', tip: 'FIYAHCON award celebrating BIPOC in SFF. Core mission alignment.' },
  { award: 'Locus Awards', eligibility: 'Calendar year pub', deadline: 'Apr 15', ceremony: 'Jun', genre: 'SFF', tip: 'Locus Magazine reader poll. High visibility in SFF community.' },
  { award: 'National Book Award', eligibility: 'US pub, calendar year', deadline: 'May', ceremony: 'Nov', genre: 'Literary', tip: 'Very competitive. Literary fiction focus. Huge sales bump.' },
  { award: 'Booker Prize', eligibility: 'UK pub, Oct-Sep', deadline: 'Feb', ceremony: 'Oct', genre: 'Literary', tip: 'International prestige. Longlist bump = 5-10× sales increase.' },
];

interface MSMarketIntelProps {
  genre: string;
  scores: Record<string, number>;
  compositeScore: number;
}

export default function MSMarketIntel({ genre, scores, compositeScore }: MSMarketIntelProps) {
  // Comp titles
  const [comps, setComps] = useState<CompTitle[]>([
    { title: '', author: '', pubYear: 2024, firstYearSales: 3000, lifetimeSales: 8000, rating: 4.0, reviews: 500 },
    { title: '', author: '', pubYear: 2024, firstYearSales: 2000, lifetimeSales: 5000, rating: 3.8, reviews: 300 },
    { title: '', author: '', pubYear: 2023, firstYearSales: 5000, lifetimeSales: 15000, rating: 4.2, reviews: 1200 },
    { title: '', author: '', pubYear: 2023, firstYearSales: 1500, lifetimeSales: 3000, rating: 3.5, reviews: 150 },
    { title: '', author: '', pubYear: 2022, firstYearSales: 8000, lifetimeSales: 25000, rating: 4.5, reviews: 3000 },
  ]);

  // Reader persona
  const [primaryAge, setPrimaryAge] = useState('25-34');
  const [secondaryAge, setSecondaryAge] = useState('18-24');
  const [genderSplit, setGenderSplit] = useState(65); // % female
  const [incomeLevel, setIncomeLevel] = useState('middle');
  const [readingFreq, setReadingFreq] = useState('weekly');
  const [discoveryChannel, setDiscoveryChannel] = useState('booktok');

  // Virality inputs
  const [tiktokPotential, setTiktokPotential] = useState(6);
  const [bookstagramPotential, setBookstagramPotential] = useState(5);
  const [goodreadsPotential, setGoodreadsPotential] = useState(7);
  const [bookclubPotential, setBookclubPotential] = useState(5);
  const [controversyRisk, setControversyRisk] = useState(3);

  // Adaptation
  const [visualRichness, setVisualRichness] = useState(7);
  const [castSize, setCastSize] = useState('ensemble');
  const [actionPacing, setActionPacing] = useState(6);
  const [dialogueDriven, setDialogueDriven] = useState(7);

  const updateComp = (idx: number, field: keyof CompTitle, value: string | number) => {
    setComps(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const analysis = useMemo(() => {
    // Comp analysis
    const validComps = comps.filter(c => c.firstYearSales > 0);
    const avgFirstYear = validComps.length > 0 ? validComps.reduce((s, c) => s + c.firstYearSales, 0) / validComps.length : 0;
    const avgLifetime = validComps.length > 0 ? validComps.reduce((s, c) => s + c.lifetimeSales, 0) / validComps.length : 0;
    const avgRating = validComps.length > 0 ? validComps.reduce((s, c) => s + c.rating, 0) / validComps.length : 0;
    const avgReviews = validComps.length > 0 ? validComps.reduce((s, c) => s + c.reviews, 0) / validComps.length : 0;
    const lifetimeMultiple = avgFirstYear > 0 ? avgLifetime / avgFirstYear : 2.5;
    const salesVariance = validComps.length > 1 ? Math.sqrt(validComps.reduce((s, c) => s + (c.firstYearSales - avgFirstYear) ** 2, 0) / validComps.length) : 0;
    const compSalesConfidence = salesVariance > 0 && avgFirstYear > 0 ? Math.max(0, Math.min(100, 100 - (salesVariance / avgFirstYear * 100))) : 50;

    // Market timing — find optimal pub month
    const seasonData = SEASONALITY[genre] || SEASONALITY['SFF'];
    const bestMonthIdx = seasonData.indexOf(Math.max(...seasonData));
    const worstMonthIdx = seasonData.indexOf(Math.min(...seasonData));

    // Virality composite
    const viralityScore = (
      tiktokPotential * 0.35 +
      bookstagramPotential * 0.20 +
      goodreadsPotential * 0.25 +
      bookclubPotential * 0.15 +
      (10 - controversyRisk) * 0.05
    );

    const viralityLabel = viralityScore >= 8 ? 'VIRAL POTENTIAL' : viralityScore >= 6 ? 'HIGH DISCOVERABILITY'
      : viralityScore >= 4 ? 'MODERATE REACH' : 'NICHE AUDIENCE';

    // Award potential
    const proseScore = scores['prose'] || 5;
    const diversityScore = scores['diversity'] || 5;
    const hookScore = scores['hook'] || 5;
    const awardScore = (proseScore * 0.4 + diversityScore * 0.25 + compositeScore / 10 * 0.2 + hookScore * 0.15);
    const awardLabel = awardScore >= 8 ? 'STRONG CONTENDER' : awardScore >= 6 ? 'POSSIBLE NOMINEE'
      : awardScore >= 4 ? 'OUTSIDE CHANCE' : 'UNLIKELY';

    // Adaptation score
    const adaptationScore = (visualRichness * 0.3 + actionPacing * 0.25 + dialogueDriven * 0.25 +
      (castSize === 'ensemble' ? 7 : castSize === 'duo' ? 8 : castSize === 'solo' ? 5 : 6) * 0.2);

    const adaptationType = adaptationScore >= 8 ? 'Feature Film / Premium TV'
      : adaptationScore >= 6 ? 'TV Series / Streaming'
      : adaptationScore >= 4 ? 'Animation / Graphic Novel'
      : 'Limited adaptation potential';

    // Genre trend projection
    const genreHeat = scores['genre_fit'] || 5;
    const trendProjection = genreHeat >= 8 ? [100, 115, 125] // growing
      : genreHeat >= 6 ? [100, 105, 108] // stable-growing
      : genreHeat >= 4 ? [100, 95, 90] // plateau/decline
      : [100, 85, 70]; // declining

    // Target audience size estimate
    const audienceSizeEstimate = genre === 'Romance' ? '45M US readers' : genre === 'SFF' ? '28M US readers'
      : genre === 'Mystery/Thriller' ? '35M US readers' : genre === 'YA' ? '22M US readers'
      : genre === 'Literary Fiction' ? '18M US readers' : genre === 'Horror' ? '14M US readers' : '20M US readers';

    const addressableMarket = genre === 'Romance' ? 'Massive — largest genre' : genre === 'SFF' ? 'Large — strong growth'
      : genre === 'Mystery/Thriller' ? 'Large — mature market' : genre === 'YA' ? 'Medium — cyclical'
      : genre === 'Literary Fiction' ? 'Medium — award-driven spikes' : genre === 'Horror' ? 'Medium — trending up' : 'Medium';

    return {
      avgFirstYear: Math.round(avgFirstYear), avgLifetime: Math.round(avgLifetime),
      avgRating, avgReviews: Math.round(avgReviews), lifetimeMultiple,
      compSalesConfidence: Math.round(compSalesConfidence), salesVariance: Math.round(salesVariance),
      bestMonth: MONTHS[bestMonthIdx], bestMonthIdx, worstMonth: MONTHS[worstMonthIdx],
      seasonData,
      viralityScore, viralityLabel,
      awardScore, awardLabel,
      adaptationScore, adaptationType,
      trendProjection, audienceSizeEstimate, addressableMarket,
    };
  }, [comps, genre, scores, compositeScore, tiktokPotential, bookstagramPotential,
      goodreadsPotential, bookclubPotential, controversyRisk, visualRichness, castSize, actionPacing, dialogueDriven]);

  const inputClass = "w-full bg-void-black border border-border rounded-lg px-2 py-1.5 text-xs text-white focus:border-starforge-gold outline-none font-mono";
  const labelClass = "block text-[9px] text-text-muted font-ui uppercase tracking-wider mb-0.5";

  return (
    <div className="space-y-6">
      {/* ─── Comp Title Analysis ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-starforge-gold" /> Comp Title Analysis
          <TIP text="Enter 3-5 comparable titles with actual sales data. This drives all revenue projections. Use BookScan data, publisher reports, or Goodreads ratings as proxies." />
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/[0.06]">
              <th className="text-left px-2 py-2 text-text-muted font-ui uppercase text-[9px]">Title</th>
              <th className="text-left px-2 py-2 text-text-muted font-ui uppercase text-[9px]">Author</th>
              <th className="px-2 py-2 text-text-muted font-ui uppercase text-[9px]">Year</th>
              <th className="px-2 py-2 text-text-muted font-ui uppercase text-[9px]">1st Yr Sales <TIP text="First 12 months post-pub. BookScan captures ~75% of print." /></th>
              <th className="px-2 py-2 text-text-muted font-ui uppercase text-[9px]">Lifetime <TIP text="Total sales across all years and formats." /></th>
              <th className="px-2 py-2 text-text-muted font-ui uppercase text-[9px]">GR Rating</th>
              <th className="px-2 py-2 text-text-muted font-ui uppercase text-[9px]">Reviews</th>
            </tr></thead>
            <tbody>{comps.map((c, i) => (
              <tr key={i} className="border-b border-white/[0.03]">
                <td className="px-1 py-1"><input type="text" value={c.title} onChange={e => updateComp(i, 'title', e.target.value)} placeholder={`Comp ${i + 1}...`} className={inputClass} /></td>
                <td className="px-1 py-1"><input type="text" value={c.author} onChange={e => updateComp(i, 'author', e.target.value)} placeholder="Author..." className={inputClass} /></td>
                <td className="px-1 py-1"><input type="number" min={2018} max={2026} value={c.pubYear} onChange={e => updateComp(i, 'pubYear', +e.target.value)} className={inputClass} /></td>
                <td className="px-1 py-1"><input type="number" min={0} step={500} value={c.firstYearSales} onChange={e => updateComp(i, 'firstYearSales', +e.target.value)} className={inputClass} /></td>
                <td className="px-1 py-1"><input type="number" min={0} step={1000} value={c.lifetimeSales} onChange={e => updateComp(i, 'lifetimeSales', +e.target.value)} className={inputClass} /></td>
                <td className="px-1 py-1"><input type="number" min={1} max={5} step={0.1} value={c.rating} onChange={e => updateComp(i, 'rating', +e.target.value)} className={inputClass} /></td>
                <td className="px-1 py-1"><input type="number" min={0} step={50} value={c.reviews} onChange={e => updateComp(i, 'reviews', +e.target.value)} className={inputClass} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {/* Comp summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Avg 1st Year</p><p className="font-heading text-base text-emerald-400">{analysis.avgFirstYear.toLocaleString()}</p></div>
          <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Avg Lifetime</p><p className="font-heading text-base text-text-primary">{analysis.avgLifetime.toLocaleString()}</p></div>
          <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Lifetime ×</p><p className="font-heading text-base text-cyan-400">{analysis.lifetimeMultiple.toFixed(1)}×</p></div>
          <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Avg Rating</p><p className="font-heading text-base text-amber-400">★ {analysis.avgRating.toFixed(1)}</p></div>
          <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Sales Confidence</p><p className={`font-heading text-base ${analysis.compSalesConfidence >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>{analysis.compSalesConfidence}%</p></div>
        </div>
      </div>

      {/* ─── Two-Column: Market Timing + Reader Persona ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Market Timing */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> Market Timing Window
            <TIP text="Seasonality index by genre. 100 = average month. Schedule pub month for peak demand. Consider 6-month lead time for marketing." />
          </h3>
          <div className="flex items-end gap-1 h-24 mb-2">
            {analysis.seasonData.map((val, i) => {
              const heightPct = (val / 150 * 100);
              const isBest = i === analysis.bestMonthIdx;
              return (
                <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                  <div className={`w-full rounded-t-sm ${isBest ? 'bg-starforge-gold/60' : val >= 100 ? 'bg-emerald-500/40' : 'bg-red-500/30'}`} style={{ height: `${heightPct}%` }} />
                  <span className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:block bg-void-black border border-white/10 rounded px-2 py-1 text-[9px] text-text-secondary whitespace-nowrap z-10">
                    {MONTHS[i]}: {val} index
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-text-muted">{MONTHS.map(m => <span key={m}>{m}</span>)}</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 rounded-lg p-2 text-center"><p className="text-[9px] text-text-muted uppercase">Best Month</p><p className="text-sm text-emerald-400 font-heading">{analysis.bestMonth}</p></div>
            <div className="bg-red-500/5 rounded-lg p-2 text-center"><p className="text-[9px] text-text-muted uppercase">Weakest Month</p><p className="text-sm text-red-400 font-heading">{analysis.worstMonth}</p></div>
          </div>
          <p className="text-[10px] text-text-muted mt-2">💡 For {genre}, optimal pub window: <strong className="text-text-primary">{analysis.bestMonth}</strong>. Begin marketing 6 months prior. Schedule ARCs 3 months out.</p>
        </div>

        {/* Reader Persona Canvas */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Reader Persona Canvas
            <TIP text="Define your target reader demographics. This drives marketing channel selection, pricing decisions, and launch strategy." />
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Primary Age</label><select value={primaryAge} onChange={e => setPrimaryAge(e.target.value)} className={inputClass}><option>13-17</option><option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55+</option></select></div>
            <div><label className={labelClass}>Secondary Age</label><select value={secondaryAge} onChange={e => setSecondaryAge(e.target.value)} className={inputClass}><option>13-17</option><option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55+</option></select></div>
            <div><label className={labelClass}>Gender Split (% Female)</label><input type="range" min={10} max={90} value={genderSplit} onChange={e => setGenderSplit(+e.target.value)} className="w-full accent-starforge-gold" /><span className="text-[10px] text-text-muted">{genderSplit}% F / {100 - genderSplit}% M</span></div>
            <div><label className={labelClass}>Income Level</label><select value={incomeLevel} onChange={e => setIncomeLevel(e.target.value)} className={inputClass}><option value="student">Student</option><option value="lower">Lower</option><option value="middle">Middle</option><option value="upper-middle">Upper-Middle</option><option value="high">High</option></select></div>
            <div><label className={labelClass}>Reading Frequency</label><select value={readingFreq} onChange={e => setReadingFreq(e.target.value)} className={inputClass}><option value="daily">Daily (50+ books/yr)</option><option value="weekly">Weekly (20-50/yr)</option><option value="monthly">Monthly (6-20/yr)</option><option value="occasional">Occasional (&lt;6/yr)</option></select></div>
            <div><label className={labelClass}>Primary Discovery</label><select value={discoveryChannel} onChange={e => setDiscoveryChannel(e.target.value)} className={inputClass}><option value="booktok">BookTok</option><option value="bookstagram">Bookstagram</option><option value="goodreads">Goodreads</option><option value="bookclub">Book Club</option><option value="newsletter">Newsletter</option><option value="bookstore">Bookstore Browse</option><option value="library">Library</option><option value="podcast">Podcast/BookTube</option></select></div>
          </div>
          <div className="mt-3 text-[10px] text-text-muted">
            📊 Total Addressable Market: <strong className="text-text-primary">{analysis.audienceSizeEstimate}</strong> · Market Position: <strong className="text-text-primary">{analysis.addressableMarket}</strong>
          </div>
        </div>
      </div>

      {/* ─── Three-Column: Virality + Awards + Adaptation ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Social Virality Score */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-xs text-text-primary mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-pink-400" /> Virality Score
          </h3>
          <div className="text-center mb-3">
            <p className={`font-heading text-3xl ${analysis.viralityScore >= 7 ? 'text-pink-400' : analysis.viralityScore >= 5 ? 'text-amber-400' : 'text-text-muted'}`}>{analysis.viralityScore.toFixed(1)}</p>
            <p className="text-[9px] text-text-muted uppercase">{analysis.viralityLabel}</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'BookTok', value: tiktokPotential, set: setTiktokPotential, tip: 'Visual covers, emotional hooks, trope-driven plots score highest.' },
              { label: 'Bookstagram', value: bookstagramPotential, set: setBookstagramPotential, tip: 'Aesthetic covers, special editions, indie press cachet.' },
              { label: 'Goodreads', value: goodreadsPotential, set: setGoodreadsPotential, tip: 'Discussion-worthy themes, divisive opinions, re-read value.' },
              { label: 'Book Club', value: bookclubPotential, set: setBookclubPotential, tip: 'Discussion guides, thematic depth, accessible but deep.' },
              { label: 'Controversy', value: controversyRisk, set: setControversyRisk, tip: 'Content that may generate backlash. High = risky but can drive awareness.' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-[9px] text-text-muted w-16">{s.label} <TIP text={s.tip} /></span>
                <input type="range" min={1} max={10} value={s.value} onChange={e => s.set(+e.target.value)} className="flex-1 accent-starforge-gold" />
                <span className="text-[10px] font-mono text-text-primary w-4">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Award Potential */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-xs text-text-primary mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Award Potential
          </h3>
          <div className="text-center mb-3">
            <p className={`font-heading text-3xl ${analysis.awardScore >= 7 ? 'text-amber-400' : analysis.awardScore >= 5 ? 'text-text-primary' : 'text-text-muted'}`}>{analysis.awardScore.toFixed(1)}</p>
            <p className="text-[9px] text-text-muted uppercase">{analysis.awardLabel}</p>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {AWARD_CALENDARS.filter(a => a.genre === 'All' || a.genre === genre || genre === 'SFF').map(a => (
              <div key={a.award} className="flex items-center gap-2 text-[10px] py-1 border-b border-white/[0.04]">
                <span className="text-text-primary flex-1">{a.award}</span>
                <span className="text-text-muted">{a.ceremony}</span>
                <TIP text={a.tip} />
              </div>
            ))}
          </div>
        </div>

        {/* Adaptation Potential */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-heading text-xs text-text-primary mb-3 flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" /> Adaptation Score
          </h3>
          <div className="text-center mb-3">
            <p className={`font-heading text-3xl ${analysis.adaptationScore >= 7 ? 'text-cyan-400' : 'text-text-muted'}`}>{analysis.adaptationScore.toFixed(1)}</p>
            <p className="text-[9px] text-text-muted uppercase">{analysis.adaptationType}</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Visual', value: visualRichness, set: setVisualRichness },
              { label: 'Pacing', value: actionPacing, set: setActionPacing },
              { label: 'Dialogue', value: dialogueDriven, set: setDialogueDriven },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-[9px] text-text-muted w-14">{s.label}</span>
                <input type="range" min={1} max={10} value={s.value} onChange={e => s.set(+e.target.value)} className="flex-1 accent-starforge-gold" />
                <span className="text-[10px] font-mono text-text-primary w-4">{s.value}</span>
              </div>
            ))}
            <div><label className={labelClass}>Cast Size</label><select value={castSize} onChange={e => setCastSize(e.target.value)} className={inputClass}><option value="solo">Solo protagonist</option><option value="duo">Duo/Pair</option><option value="ensemble">Ensemble</option><option value="epic">Epic / Large cast</option></select></div>
          </div>
        </div>
      </div>

      {/* ─── Genre Trend Radar ─── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Genre Trend Radar: {genre}
          <TIP text="3-year demand projection based on current genre heat score. Index: 100 = current demand. Used for pub timing and investment decisions." />
        </h3>
        <div className="flex items-center gap-6">
          {analysis.trendProjection.map((val, i) => (
            <div key={i} className="text-center flex-1">
              <p className="text-[9px] text-text-muted uppercase mb-1">Year {i + 1}</p>
              <p className={`font-heading text-2xl ${val >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>{val}</p>
              <p className="text-[9px] text-text-muted">{val >= 110 ? '📈 Growing' : val >= 100 ? '➡️ Stable' : '📉 Declining'}</p>
            </div>
          ))}
          <div className="text-center flex-1">
            <p className="text-[9px] text-text-muted uppercase mb-1">Implication</p>
            <p className="text-xs text-text-primary">{analysis.trendProjection[2] >= 110 ? 'Invest aggressively — acquire more in this space' : analysis.trendProjection[2] >= 100 ? 'Steady — maintain current acquisition rate' : 'Caution — reduce exposure, seek adjacent genres'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
