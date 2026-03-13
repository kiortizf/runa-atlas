import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch, Star, Users, TrendingUp, DollarSign, AlertTriangle, CheckCircle,
  BookOpen, Info, BarChart3, Target, Award, Shield, Zap, ChevronDown
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   MANUSCRIPT SCORING DASHBOARD
   Comprehensive evaluation rubric + offer decision framework
   Based on: Editorial Standards Rubric KB, Acquisition Strategy KB
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
      {text}
    </span>
  </span>
);

// ─── Rubric Definitions ─────────────────────────────────
interface RubricItem {
  id: string;
  category: string;
  label: string;
  weight: number;
  tip: string;
  descriptors: string[]; // index 0=1pt, 1=2-3, 2=4-5, 3=6-7, 4=8-9, 5=10
}

const RUBRIC: RubricItem[] = [
  // Literary Merit (40% total weight)
  { id: 'prose', category: 'Literary Merit', label: 'Prose Quality', weight: 10, tip: 'Sentence-level craft: rhythm, word choice, voice consistency, readability.', descriptors: ['Rough draft quality', 'Competent but flat', 'Solid, occasional brilliance', 'Distinctive voice throughout', 'Exceptional — debut-of-the-year quality'] },
  { id: 'plot', category: 'Literary Merit', label: 'Plot & Structure', weight: 8, tip: 'Arc strength, pacing, tension management, satisfying resolution, structural innovation.', descriptors: ['Meandering, unclear arc', 'Basic structure, uneven pacing', 'Well-structured with strong moments', 'Compelling throughout', 'Masterful — unputdownable'] },
  { id: 'character', category: 'Literary Merit', label: 'Character Development', weight: 8, tip: 'Protagonist depth, supporting cast, arcs, reader empathy, authentic relationships.', descriptors: ['Thin, underdeveloped', 'Functional but stock', 'Memorable leads, some depth', 'Complex, fully realized cast', 'Iconic — characters that haunt you'] },
  { id: 'worldbuilding', category: 'Literary Merit', label: 'World/Setting', weight: 7, tip: 'SFF worldbuilding depth, sensory detail, internal consistency, originality.', descriptors: ['Generic, derivative', 'Adequate backdrop', 'Rich, well-imagined world', 'Immersive, original systems', 'Landmark worldbuilding'] },
  { id: 'dialogue', category: 'Literary Merit', label: 'Dialogue & Voice', weight: 7, tip: 'Distinct character voices, naturalism, subtext, thematic resonance.', descriptors: ['Stilted or on-the-nose', 'Functional', 'Distinct voices, good rhythm', 'Sharp, memorable lines', 'Pitch-perfect throughout'] },

  // Market Potential (35% total weight)
  { id: 'genre_fit', category: 'Market Potential', label: 'Genre/Subgenre Heat', weight: 8, tip: 'Current demand for this subgenre. Check bestseller lists, BookTok trends, publisher announcements.', descriptors: ['Declining subgenre', 'Niche/stable', 'Steady demand', 'Growing interest', 'Peak trending'] },
  { id: 'comps', category: 'Market Potential', label: 'Comp Title Strength', weight: 8, tip: 'Quality and sales of comparable titles. Strong comps = easier pitch to buyers.', descriptors: ['No clear comps', 'Weak comps / low sales', 'Decent comps with moderate sales', 'Strong comps with proven readers', 'Blockbuster comps in same space'] },
  { id: 'hook', category: 'Market Potential', label: 'Commercial Hook', weight: 7, tip: 'Can you pitch this in one sentence? Does the concept sell itself?', descriptors: ['Hard to pitch', 'Needs explanation', 'Clear concept, moderate appeal', 'Strong elevator pitch', 'Irresistible — sells on concept alone'] },
  { id: 'series', category: 'Market Potential', label: 'Series Potential', weight: 6, tip: 'Can this become a series? Series = compounding backlist revenue. Standalones are harder to sustain.', descriptors: ['Standalone only', 'Possible sequel', 'Natural duology/trilogy', 'Multi-book series planned', 'Expansive universe potential'] },
  { id: 'diversity', category: 'Market Potential', label: 'DEI / Own Voices', weight: 6, tip: 'Marginalized perspectives, #OwnVoices, underrepresented communities. Core to Rüna Atlas mission.', descriptors: ['No particular representation', 'Surface-level diversity', 'Meaningful representation', 'Centered marginalized perspective', 'Groundbreaking own-voices narrative'] },

  // Author Platform (25% total weight)
  { id: 'social', category: 'Author Platform', label: 'Social Reach', weight: 5, tip: 'Combined social media following. BookTok/Bookstagram weight highest for fiction.', descriptors: ['<500 followers', '500-2K', '2K-10K', '10K-50K', '50K+ or viral presence'] },
  { id: 'email', category: 'Author Platform', label: 'Email/Newsletter', weight: 5, tip: 'Owned email list. Email converts 5-10× better than social for book sales.', descriptors: ['No list', '<500', '500-2K', '2K-10K', '10K+'] },
  { id: 'track', category: 'Author Platform', label: 'Publishing Track Record', weight: 5, tip: 'Previous publications, awards, reviews. Self-pub sales count if 1K+/title.', descriptors: ['Debut, no credits', 'Short fiction credits', '1-2 published books', 'Established with awards/reviews', 'Bestselling or award-winning author'] },
  { id: 'engagement', category: 'Author Platform', label: 'Community Engagement', weight: 5, tip: 'Active in writing/reading communities, con presence, blurb network, industry connections.', descriptors: ['Minimal visibility', 'Some community presence', 'Active in communities', 'Well-connected, strong network', 'Industry influencer'] },
  { id: 'professionalism', category: 'Author Platform', label: 'Professionalism', weight: 5, tip: 'Communication quality, deadline reliability, openness to feedback, marketing willingness.', descriptors: ['Red flags', 'Responsive but inexperienced', 'Professional and reliable', 'Excellent communicator', 'Dream collaborator'] },
];

const CATEGORIES = ['Literary Merit', 'Market Potential', 'Author Platform'];
const CAT_ICONS: Record<string, any> = { 'Literary Merit': BookOpen, 'Market Potential': TrendingUp, 'Author Platform': Users };
const CAT_COLORS: Record<string, string> = { 'Literary Merit': 'text-amber-400', 'Market Potential': 'text-emerald-400', 'Author Platform': 'text-cyan-400' };

export default function ManuscriptScoring() {
  // Title info
  const [titleName, setTitleName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [wordCount, setWordCount] = useState(85000);
  const [genre, setGenre] = useState('SFF');

  // Scores (1-10 for each rubric item)
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(RUBRIC.map(r => [r.id, 5]))
  );

  // Offer framework inputs
  const [listPrice, setListPrice] = useState(16.99);
  const [netPerUnit, setNetPerUnit] = useState(2.32);
  const [compAvgSales, setCompAvgSales] = useState(3000);
  const [editorialCost, setEditorialCost] = useState(5000);
  const [designCost, setDesignCost] = useState(1500);
  const [marketingCost, setMarketingCost] = useState(2500);

  // Expanded categories
  const [expandedCat, setExpandedCat] = useState<string>('Literary Merit');
  const [activeView, setActiveView] = useState<'rubric' | 'offer'>('rubric');

  const updateScore = (id: string, value: number) => setScores(prev => ({ ...prev, [id]: value }));

  const analysis = useMemo(() => {
    // Category scores
    const catScores = CATEGORIES.map(cat => {
      const items = RUBRIC.filter(r => r.category === cat);
      const maxWeight = items.reduce((s, r) => s + r.weight, 0);
      const weightedScore = items.reduce((s, r) => s + scores[r.id] * r.weight, 0);
      const maxPossible = maxWeight * 10;
      const pct = maxPossible > 0 ? (weightedScore / maxPossible * 100) : 0;
      return { category: cat, weightedScore, maxPossible, pct, items };
    });

    // Total composite
    const totalWeightedScore = catScores.reduce((s, c) => s + c.weightedScore, 0);
    const totalMaxPossible = catScores.reduce((s, c) => s + c.maxPossible, 0);
    const compositeScore = totalMaxPossible > 0 ? (totalWeightedScore / totalMaxPossible * 100) : 0;

    // Decision
    const decision = compositeScore >= 75 ? 'ACQUIRE'
      : compositeScore >= 55 ? 'CONSIDER'
      : compositeScore >= 40 ? 'REVISE & RESUBMIT'
      : 'PASS';

    // Strengths & weaknesses
    const allScored = RUBRIC.map(r => ({ ...r, score: scores[r.id], weighted: scores[r.id] * r.weight }));
    const strengths = [...allScored].sort((a, b) => b.score - a.score).slice(0, 3);
    const weaknesses = [...allScored].sort((a, b) => a.score - b.score).slice(0, 3);

    // Offer framework
    const estimatedSales = compAvgSales * (compositeScore / 65); // normalized to 65 = baseline
    const estimatedRevenue = estimatedSales * netPerUnit;
    const totalFixedCosts = editorialCost + designCost + marketingCost;
    const recommendedAdvance = Math.round(estimatedRevenue * 0.4 / 500) * 500;
    const breakEvenUnits = netPerUnit > 0 ? Math.ceil((totalFixedCosts + recommendedAdvance) / netPerUnit) : Infinity;
    const earnOutProb = compositeScore >= 75 ? '75-90%' : compositeScore >= 55 ? '50-70%' : compositeScore >= 40 ? '25-45%' : '<25%';
    const riskLevel = compositeScore >= 70 ? 'LOW' : compositeScore >= 50 ? 'MODERATE' : 'HIGH';

    // Edit type recommendation
    const proseScore = scores['prose'] || 5;
    const editType = proseScore >= 8 ? 'Copy edit + proofread only'
      : proseScore >= 6 ? 'Line edit + copy edit + proofread'
      : proseScore >= 4 ? 'Developmental edit + line edit + copy edit + proofread'
      : 'Major developmental revision needed (possibly R&R)';

    const editCostEstimate = proseScore >= 8 ? '$2,000-$3,500'
      : proseScore >= 6 ? '$3,500-$6,000'
      : proseScore >= 4 ? '$5,000-$10,000'
      : '$7,000-$15,000+';

    return {
      catScores, compositeScore, decision,
      strengths, weaknesses,
      estimatedSales: Math.round(estimatedSales),
      estimatedRevenue, recommendedAdvance: Math.max(500, recommendedAdvance),
      totalFixedCosts, breakEvenUnits, earnOutProb, riskLevel,
      editType, editCostEstimate,
    };
  }, [scores, compAvgSales, netPerUnit, editorialCost, designCost, marketingCost]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const inputClass = "w-full bg-void-black border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-starforge-gold outline-none";
  const labelClass = "block text-[10px] text-text-muted font-ui uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl text-text-primary flex items-center gap-3">
          <FileSearch className="w-6 h-6 text-starforge-gold" /> Manuscript Scoring Dashboard
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Evaluate manuscripts using a weighted rubric. Generate acquisition recommendations with P&L modeling.
        </p>
      </div>

      {/* Title Info Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <div>
          <label className={labelClass}>Manuscript Title</label>
          <input type="text" value={titleName} onChange={e => setTitleName(e.target.value)} placeholder="Enter title..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Author</label>
          <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Author name..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Word Count</label>
          <input type="number" value={wordCount} onChange={e => setWordCount(+e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Genre/Category</label>
          <select value={genre} onChange={e => setGenre(e.target.value)} className={inputClass}>
            <option>SFF</option><option>Romance</option><option>Literary Fiction</option><option>YA</option><option>Mystery/Thriller</option><option>Horror</option><option>Nonfiction</option>
          </select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1">
        <button onClick={() => setActiveView('rubric')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-ui transition-all ${activeView === 'rubric' ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-muted hover:text-white'}`}>
          <Star className="w-4 h-4" /> Evaluation Rubric
        </button>
        <button onClick={() => setActiveView('offer')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-ui transition-all ${activeView === 'offer' ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-muted hover:text-white'}`}>
          <DollarSign className="w-4 h-4" /> Offer Decision Framework
        </button>
      </div>

      {/* ═══ Composite Score Banner ═══ */}
      <div className={`border rounded-xl p-6 ${analysis.decision === 'ACQUIRE' ? 'bg-emerald-500/5 border-emerald-500/20' : analysis.decision === 'CONSIDER' ? 'bg-amber-500/5 border-amber-500/20' : analysis.decision === 'REVISE & RESUBMIT' ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Composite Score</p>
            <p className={`font-heading text-4xl ${analysis.compositeScore >= 75 ? 'text-emerald-400' : analysis.compositeScore >= 55 ? 'text-amber-400' : analysis.compositeScore >= 40 ? 'text-cyan-400' : 'text-red-400'}`}>
              {analysis.compositeScore.toFixed(1)}%
            </p>
          </div>
          <div className="w-px h-12 bg-white/[0.1]" />
          <div>
            <p className="text-[9px] text-text-muted uppercase mb-1">Recommendation</p>
            <p className={`font-heading text-xl ${analysis.decision === 'ACQUIRE' ? 'text-emerald-400' : analysis.decision === 'CONSIDER' ? 'text-amber-400' : analysis.decision === 'REVISE & RESUBMIT' ? 'text-cyan-400' : 'text-red-400'}`}>
              {analysis.decision === 'ACQUIRE' ? '✅' : analysis.decision === 'CONSIDER' ? '🟡' : analysis.decision === 'REVISE & RESUBMIT' ? '🔄' : '❌'} {analysis.decision}
            </p>
          </div>
          <div className="w-px h-12 bg-white/[0.1]" />
          {/* Category mini-scores */}
          {analysis.catScores.map(cs => {
            const Icon = CAT_ICONS[cs.category];
            return (
              <div key={cs.category} className="text-center">
                <p className="text-[9px] text-text-muted uppercase mb-1 flex items-center gap-1 justify-center"><Icon className={`w-3 h-3 ${CAT_COLORS[cs.category]}`} /> {cs.category}</p>
                <p className={`font-heading text-lg ${cs.pct >= 70 ? 'text-emerald-400' : cs.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{cs.pct.toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ RUBRIC VIEW ═══ */}
      {activeView === 'rubric' && (
        <div className="space-y-4">
          {CATEGORIES.map(cat => {
            const Icon = CAT_ICONS[cat];
            const items = RUBRIC.filter(r => r.category === cat);
            const catData = analysis.catScores.find(c => c.category === cat)!;
            const isExpanded = expandedCat === cat;

            return (
              <div key={cat} className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <button onClick={() => setExpandedCat(isExpanded ? '' : cat)} className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left">
                  <Icon className={`w-5 h-5 ${CAT_COLORS[cat]}`} />
                  <div className="flex-1">
                    <h3 className="font-heading text-sm text-text-primary">{cat}</h3>
                    <p className="text-[10px] text-text-muted">{items.length} criteria · Weight: {items.reduce((s, r) => s + r.weight, 0)} pts</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className={`font-heading text-lg ${catData.pct >= 70 ? 'text-emerald-400' : catData.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{catData.pct.toFixed(0)}%</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                </button>

                {isExpanded && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-white/[0.04] p-5 space-y-5">
                    {items.map(item => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-text-primary font-medium flex items-center gap-1">
                            {item.label}
                            <span className="text-[9px] text-text-muted font-mono ml-1">(weight: {item.weight})</span>
                            <TIP text={item.tip} />
                          </label>
                          <span className={`font-heading text-lg w-10 text-right ${scores[item.id] >= 8 ? 'text-emerald-400' : scores[item.id] >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                            {scores[item.id]}
                          </span>
                        </div>
                        <input type="range" min={1} max={10} step={1} value={scores[item.id]} onChange={e => updateScore(item.id, +e.target.value)}
                          className="w-full accent-starforge-gold" />
                        <div className="flex justify-between text-[9px] text-text-muted">
                          {item.descriptors.map((d, i) => (
                            <span key={i} className={`${i === 0 ? 'text-left' : i === item.descriptors.length - 1 ? 'text-right' : 'text-center'} ${Math.round(scores[item.id] / 2) - 1 === i ? 'text-starforge-gold font-medium' : ''}`} style={{ maxWidth: i === 0 || i === item.descriptors.length - 1 ? '20%' : '18%' }}>
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <h3 className="font-heading text-sm text-emerald-400 mb-3 flex items-center gap-2"><Award className="w-4 h-4" /> Top Strengths</h3>
              {analysis.strengths.map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-emerald-500/10 last:border-0">
                  <span className="text-text-primary">{s.label}</span>
                  <span className="font-mono text-emerald-400">{s.score}/10</span>
                </div>
              ))}
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h3 className="font-heading text-sm text-red-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Areas to Address</h3>
              {analysis.weaknesses.map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-red-500/10 last:border-0">
                  <span className="text-text-primary">{s.label}</span>
                  <span className="font-mono text-red-400">{s.score}/10</span>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Recommendation */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Editorial Recommendation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-text-muted uppercase mb-1">Required Edit Type</p>
                <p className="text-sm text-text-primary">{analysis.editType}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase mb-1">Estimated Cost</p>
                <p className="text-sm text-starforge-gold font-mono">{analysis.editCostEstimate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ OFFER VIEW ═══ */}
      {activeView === 'offer' && (
        <div className="space-y-6">
          {/* Offer Inputs */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-starforge-gold" /> Offer Modeling Inputs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className={labelClass}>Comp Avg Sales <TIP text="First-year sales average for 3-5 comparable titles." /></label>
                <input type="number" min={100} max={100000} step={500} value={compAvgSales} onChange={e => setCompAvgSales(+e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Net Per Unit ($) <TIP text="Publisher net per unit from profitability calculator." /></label>
                <input type="number" min={0.50} max={20} step={0.10} value={netPerUnit} onChange={e => setNetPerUnit(+e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>List Price ($) <TIP text="Planned retail price for paperback." /></label>
                <input type="number" min={9.99} max={29.99} step={1} value={listPrice} onChange={e => setListPrice(+e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Editorial ($) <TIP text="All editing passes: dev edit through proofread." /></label>
                <input type="number" min={0} max={50000} step={500} value={editorialCost} onChange={e => setEditorialCost(+e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Design ($) <TIP text="Cover design + interior layout." /></label>
                <input type="number" min={0} max={10000} step={250} value={designCost} onChange={e => setDesignCost(+e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Marketing ($) <TIP text="Launch marketing budget: ads, ARCs, events." /></label>
                <input type="number" min={0} max={25000} step={250} value={marketingCost} onChange={e => setMarketingCost(+e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Offer Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* P&L Projection */}
            <div className="bg-gradient-to-br from-starforge-gold/5 to-purple-500/5 border border-starforge-gold/20 rounded-xl p-6">
              <h3 className="font-heading text-base text-text-primary mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-starforge-gold" /> Offer P&L Projection
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-text-muted">Est. First-Year Sales</span><span className="font-mono text-text-primary">{analysis.estimatedSales.toLocaleString()} units</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Est. First-Year Revenue</span><span className="font-mono text-emerald-400">{fmt(Math.round(analysis.estimatedRevenue))}</span></div>
                <div className="border-t border-white/[0.06] pt-2 flex justify-between"><span className="text-text-muted">Editorial</span><span className="font-mono text-red-400">-{fmt(editorialCost)}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Design</span><span className="font-mono text-red-400">-{fmt(designCost)}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Marketing</span><span className="font-mono text-red-400">-{fmt(marketingCost)}</span></div>
                <div className="flex justify-between font-medium"><span className="text-text-secondary">Total Fixed Costs</span><span className="font-mono text-red-400">-{fmt(analysis.totalFixedCosts)}</span></div>
                <div className="border-t border-white/[0.06] pt-2" />
                <div className="text-center">
                  <p className="text-[9px] text-text-muted uppercase mb-1">Recommended Advance</p>
                  <p className="font-heading text-3xl text-starforge-gold">{fmt(analysis.recommendedAdvance)}</p>
                  <p className="text-[10px] text-text-muted mt-1">40% of estimated first-year revenue</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                    <p className="text-[9px] text-text-muted uppercase mb-1">Break-Even</p>
                    <p className="font-heading text-sm text-text-primary">{analysis.breakEvenUnits === Infinity ? '∞' : analysis.breakEvenUnits.toLocaleString()} units</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                    <p className="text-[9px] text-text-muted uppercase mb-1">Earn-Out Probability</p>
                    <p className="font-heading text-sm text-text-primary">{analysis.earnOutProb}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
              <h3 className="font-heading text-base text-text-primary mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" /> Risk Assessment
              </h3>
              <div className="space-y-4">
                <div className={`rounded-lg p-4 text-center ${analysis.riskLevel === 'LOW' ? 'bg-emerald-500/10' : analysis.riskLevel === 'MODERATE' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                  <p className="text-[9px] text-text-muted uppercase mb-1">Risk Level</p>
                  <p className={`font-heading text-2xl ${analysis.riskLevel === 'LOW' ? 'text-emerald-400' : analysis.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-red-400'}`}>{analysis.riskLevel}</p>
                </div>
                {/* Risk factors */}
                <div className="space-y-2">
                  {[
                    { label: 'Literary quality supports marketing', met: (scores['prose'] || 0) >= 7 },
                    { label: 'Strong commercial hook', met: (scores['hook'] || 0) >= 7 },
                    { label: 'Author has platform to support launch', met: (scores['social'] || 0) >= 5 || (scores['email'] || 0) >= 5 },
                    { label: 'Genre is trending or stable', met: (scores['genre_fit'] || 0) >= 6 },
                    { label: 'Series potential for backlist', met: (scores['series'] || 0) >= 6 },
                    { label: 'Comp titles show market demand', met: (scores['comps'] || 0) >= 6 },
                    { label: 'Aligns with Rüna Atlas mission (DEI)', met: (scores['diversity'] || 0) >= 6 },
                    { label: 'Break-even within first year', met: analysis.breakEvenUnits <= analysis.estimatedSales },
                  ].map(f => (
                    <div key={f.label} className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg ${f.met ? 'bg-emerald-500/5 text-emerald-400' : 'bg-white/[0.02] text-text-muted'}`}>
                      {f.met ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-current flex-shrink-0" />}
                      {f.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
