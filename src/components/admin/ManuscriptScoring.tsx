import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch, Star, Users, TrendingUp, DollarSign, AlertTriangle, CheckCircle,
  BookOpen, Info, BarChart3, Target, Award, Shield, Zap, ChevronDown,
  Flame, Globe, FileText, Sparkles, Layers, Eye, Scale, PenTool, Brain,
  Heart, MessageCircle, Search, Map, Compass, Crown
} from 'lucide-react';
import MSMarketIntel from './MSMarketIntel';
import MSAcquisitionMemo from './MSAcquisitionMemo';

/* ═══════════════════════════════════════════════════════════════
   MANUSCRIPT SCORING DASHBOARD
   The most advanced manuscript evaluation system in publishing.
   30+ criteria across 5 weighted categories.
   Integrated market intelligence, acquisition memo, deal framework.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
      {text}
    </span>
  </span>
);

// ─── Rubric Definitions (30 criteria, 5 categories) ─────────────
interface RubricItem {
  id: string; category: string; label: string; weight: number; tip: string;
  descriptors: string[]; // 5 levels
  subDimensions?: string[]; // what this criterion encompasses
}

const RUBRIC: RubricItem[] = [
  // ═══ LITERARY MERIT (30% total weight) ═══
  { id: 'prose', category: 'Literary Merit', label: 'Prose Quality & Voice', weight: 8,
    tip: 'Sentence-level craft: rhythm, word choice, voice consistency, readability. Includes metaphor originality, tonal control, and stylistic sophistication.',
    descriptors: ['Rough draft quality, fundamental issues', 'Competent but generic prose', 'Solid craft, distinctive moments', 'Strong distinctive voice throughout', 'Extraordinary — debut-of-the-year quality'],
    subDimensions: ['Sentence rhythm & musicality', 'Word choice precision', 'Voice consistency across POVs', 'Metaphor/imagery originality', 'Tonal control & register shifts'] },
  { id: 'plot', category: 'Literary Merit', label: 'Plot Architecture', weight: 7,
    tip: 'Narrative structure, pacing, tension management, dramatic irony, thematic integration with plot beats, satisfying resolution.',
    descriptors: ['Unclear arc, aimless', 'Basic three-act, uneven pacing', 'Well-constructed with strong turning points', 'Compelling, layered structure', 'Masterful — literary page-turner'],
    subDimensions: ['Three-act structure execution', 'Pacing & tension management', 'Subplot integration', 'Foreshadowing & payoff', 'Resolution satisfaction'] },
  { id: 'character', category: 'Literary Merit', label: 'Character Complexity', weight: 7,
    tip: 'Protagonist depth, supporting cast dimensionality, genuine character arcs, reader empathy, authentic relationships and power dynamics.',
    descriptors: ['Thin, stereotypical', 'Functional but predictable', 'Memorable leads, real depth', 'Complex, fully realized cast', 'Iconic — unforgettable characters'],
    subDimensions: ['Protagonist interiority', 'Supporting cast depth', 'Character arc quality', 'Relationship authenticity', 'Power dynamics & agency'] },
  { id: 'worldbuilding', category: 'Literary Merit', label: 'World/Setting', weight: 6,
    tip: 'Sensory detail, internal consistency, originality of systems, depth of culture/history, ecological coherence.',
    descriptors: ['Generic backdrop', 'Adequate but derivative', 'Rich, well-imagined world', 'Immersive with original systems', 'Landmark worldbuilding — new genre standard'],
    subDimensions: ['System originality', 'Sensory immersion', 'Cultural depth', 'Internal consistency', 'Economy of revelation'] },
  { id: 'dialogue', category: 'Literary Merit', label: 'Dialogue & Subtext', weight: 5,
    tip: 'Distinct character voices, naturalism, subtext density, thematic resonance in conversation. Every line should do multiple work.',
    descriptors: ['Stilted, on-the-nose', 'Functional delivery', 'Distinct voices, good rhythm', 'Sharp, memorable, layered', 'Pitch-perfect — every line does triple work'],
    subDimensions: ['Voice differentiation', 'Subtext density', 'Information management', 'Emotional authenticity', 'Thematic resonance'] },
  { id: 'theme', category: 'Literary Merit', label: 'Thematic Depth', weight: 4,
    tip: 'Intellectual ambition, thematic coherence, resonance with contemporary moment, avoidance of didacticism.',
    descriptors: ['No discernible thematic intent', 'Simplistic moral messaging', 'Clear thematic throughline', 'Nuanced, multi-layered themes', 'Profound — changes how readers see the world'],
    subDimensions: ['Thematic coherence', 'Intellectual ambition', 'Subtlety vs. didacticism', 'Contemporary resonance', 'Universality'] },
  { id: 'openingHook', category: 'Literary Merit', label: 'Opening Power', weight: 3,
    tip: 'First page, first chapter. Does it hook immediately? Is the voice established? Is the reader compelled to continue? Critical for bookstore browse.',
    descriptors: ['Weak — readers won\'t pass page 5', 'Slow start, picks up later', 'Engaging from chapter 1', 'Hooking from first page', 'Unforgettable opening — instant commitment'],
    subDimensions: ['First sentence impact', 'Voice establishment speed', 'Narrative question seeding', 'Urgency creation', 'Sample chapter conversion'] },

  // ═══ MARKET POTENTIAL (25% total weight) ═══
  { id: 'genre_fit', category: 'Market Potential', label: 'Genre/Subgenre Heat', weight: 7,
    tip: 'Current buyer demand for this subgenre. Cross-reference: BookTok trends, Publisher Marketplace deal reports, bestseller list movement, comp pub announcements.',
    descriptors: ['Declining subgenre', 'Stable niche', 'Steady demand', 'Growing — increased shelf space', 'Peak trending — BookTok/media buzz'],
    subDimensions: ['BookScan YoY trend', 'BookTok/social mention velocity', 'Publisher deal announcements', 'Bestseller list representation', 'Bookstore shelf space allocation'] },
  { id: 'comps', category: 'Market Potential', label: 'Comp Title Strength', weight: 6,
    tip: 'Quality and recency of comparable titles. Strong comps = easier pitch to buyers, more confident P&L. Use titles published within 3 years.',
    descriptors: ['No clear comps exist', 'Weak comps with poor sales', 'Decent comps, moderate sales', 'Strong comps with proven readership', 'Blockbuster comps in exact space'],
    subDimensions: ['Comp recency (3yr window)', 'Comp sales performance', 'Comp critical reception', 'Audience overlap confidence', 'Positioning differentiation'] },
  { id: 'hook', category: 'Market Potential', label: 'Commercial Hook', weight: 6,
    tip: 'Can you pitch this in ≤25 words? Does the concept sell itself? Is it "X meets Y" in a way that excites? High-concept = higher sell-through.',
    descriptors: ['Hard to explain/pitch', 'Requires explanation', 'Clear concept, moderate appeal', 'Strong elevator pitch', 'Irresistible — sells on concept alone'],
    subDimensions: ['One-sentence pitchability', '"X meets Y" strength', 'Cover copy potential', 'Reader curiosity generation', 'Category buyer appeal'] },
  { id: 'series', category: 'Market Potential', label: 'Series & Backlist Potential', weight: 4,
    tip: 'Series = compounding backlist revenue. Each new installment lifts prior titles 15-25%. Essential for small press sustainability.',
    descriptors: ['Standalone only', 'Possible sequel', 'Natural duology/trilogy', 'Multi-book series architected', 'Expansive universe, franchise potential'],
    subDimensions: ['Narrative extensibility', 'World capacity for expansion', 'Character arc runway', 'Reader investment potential', 'Revenue compounding trajectory'] },
  { id: 'timing', category: 'Market Potential', label: 'Cultural Moment', weight: 2,
    tip: 'Does this speak to the cultural moment? Post-pandemic themes, climate anxiety, identity exploration, AI anxiety, political resonance.',
    descriptors: ['No cultural relevance', 'Tangential connection', 'Moderately timely', 'Resonates with Zeitgeist', 'Defines the cultural moment'],
    subDimensions: ['News cycle alignment', 'Social media conversation fit', 'Generational relevance', 'Political/cultural salience', 'Staying power beyond moment'] },

  // ═══ DEI & MISSION ALIGNMENT (15% total weight) ═══
  { id: 'diversity', category: 'DEI & Mission', label: 'Representation Quality', weight: 5,
    tip: 'Depth and authenticity of marginalized perspectives. Own-voices priority. Intersectional representation. Core to Rüna Atlas identity.',
    descriptors: ['No representation', 'Surface-level diversity casting', 'Meaningful representation, secondary', 'Centered marginalized perspective', 'Groundbreaking own-voices narrative'],
    subDimensions: ['Authenticity of representation', 'Intersectionality depth', 'Own-voices verification', 'Avoidance of stereotypes', 'Empowerment vs. trauma narrative'] },
  { id: 'missionFit', category: 'DEI & Mission', label: 'Rüna Atlas Mission Fit', weight: 4,
    tip: 'How fully does this title embody the press\'s commitment to speculative fiction from marginalized voices?',
    descriptors: ['No mission alignment', 'Tangential alignment', 'Supports mission broadly', 'Strong mission embodiment', 'Defines what Rüna Atlas stands for'],
    subDimensions: ['Spec fic genre fit', 'Marginalized voice centering', 'Catalog diversification', 'Brand identity reinforcement', 'Community impact potential'] },
  { id: 'sensitivityNeeds', category: 'DEI & Mission', label: 'Sensitivity Review', weight: 3,
    tip: 'Does the manuscript require sensitivity reading? Estimate scope and cost. Consider intersectional dimensions.',
    descriptors: ['No sensitivity concerns', 'Minor review recommended', 'Moderate — 1-2 readers needed', 'Significant — 2-3 specialized readers', 'Extensive — multiple specialized readers + consultant'],
    subDimensions: ['Cultural accuracy needs', 'Identity representation verification', 'Harm potential assessment', 'Reader scope estimation', 'Cost/timeline impact'] },
  { id: 'accessibility', category: 'DEI & Mission', label: 'Accessibility Considerations', weight: 3,
    tip: 'Adaptability for accessible formats: audio narration complexity, translation difficulty, dyslexia-friendly formatting potential.',
    descriptors: ['Many barriers to accessible formats', 'Some adaptation challenges', 'Standard accessibility profile', 'Good accessibility potential', 'Excellent — easy audio, translation, large print'],
    subDimensions: ['Audio narration complexity', 'Translation difficulty', 'Visual description needs', 'Dyslexia-friendly potential', 'Plain language availability'] },

  // ═══ AUTHOR PLATFORM (15% total weight) ═══
  { id: 'social', category: 'Author Platform', label: 'Social Media Presence', weight: 4,
    tip: 'Combined social following weighted by platform: BookTok/TikTok (3×), Instagram (2×), Twitter/X (1×), Facebook (0.5×). Engagement rate > follower count.',
    descriptors: ['<500 followers total', '500-2K, minimal engagement', '2K-10K, active engagement', '10K-50K, strong community', '50K+ or viral presence'],
    subDimensions: ['BookTok/TikTok following', 'Instagram/Bookstagram', 'Engagement rate', 'Content quality/consistency', 'Follower growth trajectory'] },
  { id: 'email', category: 'Author Platform', label: 'Email/Newsletter', weight: 3,
    tip: 'Owned subscriber list. Email converts 5-10× better than social for book sales. Open rate matters more than size.',
    descriptors: ['No list', '<500 subscribers', '500-2K, regular sends', '2K-10K, strong open rates', '10K+ with high engagement'],
    subDimensions: ['List size', 'Open rate', 'Click-through rate', 'Send consistency', 'Monetization track record'] },
  { id: 'track', category: 'Author Platform', label: 'Track Record', weight: 4,
    tip: 'Previous publications, awards, notable reviews. Self-pub sales count if 1K+ per title. Agent relationships.',
    descriptors: ['Debut, no prior credits', 'Short fiction publications', '1-2 published books', 'Established with awards/reviews', 'Bestselling or multi-award-winning'],
    subDimensions: ['Publication history', 'Award nominations/wins', 'Review quality (trade + reader)', 'Sales track record', 'Agent/industry relationships'] },
  { id: 'professionalism', category: 'Author Platform', label: 'Professional Partnership', weight: 4,
    tip: 'Communication responsiveness, deadline reliability, editorial openness, marketing willingness, collaborative spirit.',
    descriptors: ['Red flags present', 'Responsive but inexperienced', 'Professional and reliable', 'Excellent communicator, flexible', 'Dream collaborator — proactive and strategic'],
    subDimensions: ['Communication quality', 'Deadline reliability', 'Editorial receptiveness', 'Marketing participation', 'Strategic thinking'] },

  // ═══ PRODUCTION & FORMAT (15% total weight) ═══
  { id: 'wordCountFit', category: 'Production & Format', label: 'Word Count Appropriateness', weight: 3,
    tip: 'Does word count fit genre expectations? SFF: 80-120K, Romance: 60-90K, YA: 55-80K, Literary: 60-100K. Affects production cost and pricing.',
    descriptors: ['Far outside genre norms', 'Borderline — will need cuts/padding', 'Within acceptable range', 'Ideal for genre', 'Perfect — maximizes value perception'],
    subDimensions: ['Genre norm alignment', 'Cost implications', 'Pricing flexibility', 'Reader expectations', 'Page count for spine'] },
  { id: 'formatSuitability', category: 'Production & Format', label: 'Multi-Format Potential', weight: 3,
    tip: 'How well does this manuscript adapt across print, eBook, audiobook? Internal illustrations? Complex formatting? Maps?',
    descriptors: ['Single format only (complex layout)', 'Print + eBook with adaptation', 'Standard multi-format', 'Excellent across all formats', 'Enhanced — special edition potential'],
    subDimensions: ['Print layout complexity', 'eBook adaptation ease', 'Audio narration suitability', 'Special edition potential', 'Interior art opportunities'] },
  { id: 'coverPotential', category: 'Production & Format', label: 'Cover Design Potential', weight: 3,
    tip: 'Does the concept lend itself to a striking cover? Visual iconography, mood, genre signaling. Covers sell books.',
    descriptors: ['Hard to visualize', 'Generic genre cover', 'Clear visual direction', 'Strong iconic potential', 'Instant classic cover potential'],
    subDimensions: ['Visual iconography', 'Genre signaling clarity', 'Color palette potential', 'Typography opportunities', 'Social media shareability'] },
  { id: 'editorialScope', category: 'Production & Format', label: 'Editorial Efficiency', weight: 3,
    tip: 'How close is the manuscript to publishable? Fewer editing passes = faster to market, lower cost, higher ROI per editorial dollar.',
    descriptors: ['Needs complete rewrite', 'Heavy developmental work', 'Moderate line editing', 'Copy edit + proofread', 'Near publication-ready'],
    subDimensions: ['Developmental needs', 'Line editing scope', 'Copy editing volume', 'Fact-checking needs', 'Timeline to production'] },
  { id: 'pricingFlexibility', category: 'Production & Format', label: 'Pricing Flexibility', weight: 3,
    tip: 'Can you price above genre average? Perceived value, page count, format options, premium edition potential.',
    descriptors: ['Must price below average', 'Genre average pricing only', 'Moderate premium possible', 'Strong premium positioning', 'Collector/premium edition viable'],
    subDimensions: ['Genre price ceiling', 'Perceived value signals', 'Competition pricing', 'Premium format viability', 'Discount sensitivity'] },
];

const CATEGORIES = ['Literary Merit', 'Market Potential', 'DEI & Mission', 'Author Platform', 'Production & Format'];
const CAT_ICONS: Record<string, any> = {
  'Literary Merit': BookOpen, 'Market Potential': TrendingUp, 'DEI & Mission': Heart,
  'Author Platform': Users, 'Production & Format': Layers
};
const CAT_COLORS: Record<string, string> = {
  'Literary Merit': 'text-amber-400', 'Market Potential': 'text-emerald-400', 'DEI & Mission': 'text-pink-400',
  'Author Platform': 'text-cyan-400', 'Production & Format': 'text-purple-400'
};
const CAT_WEIGHTS: Record<string, number> = {
  'Literary Merit': 30, 'Market Potential': 25, 'DEI & Mission': 15,
  'Author Platform': 15, 'Production & Format': 15
};

export default function ManuscriptScoring() {
  // Title info
  const [titleName, setTitleName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [wordCount, setWordCount] = useState(85000);
  const [genre, setGenre] = useState('SFF');
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [agentName, setAgentName] = useState('');
  const [readerName, setReaderName] = useState('');

  // Scores (1-10 for each rubric item)
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(RUBRIC.map(r => [r.id, 5]))
  );
  const [readerNotes, setReaderNotes] = useState<Record<string, string>>({});

  // Offer framework inputs
  const [listPrice, setListPrice] = useState(16.99);
  const [netPerUnit, setNetPerUnit] = useState(2.32);
  const [compAvgSales, setCompAvgSales] = useState(3000);
  const [editorialCost, setEditorialCost] = useState(5000);
  const [designCost, setDesignCost] = useState(1500);
  const [marketingCost, setMarketingCost] = useState(2500);

  // Expanded categories
  const [expandedCat, setExpandedCat] = useState<string>('Literary Merit');
  const [showSubDimensions, setShowSubDimensions] = useState<string>('');
  const [activeView, setActiveView] = useState<'rubric' | 'market' | 'offer' | 'memo'>('rubric');

  const updateScore = (id: string, value: number) => setScores(prev => ({ ...prev, [id]: value }));

  const analysis = useMemo(() => {
    // Category scores
    const catScores = CATEGORIES.map(cat => {
      const items = RUBRIC.filter(r => r.category === cat);
      const maxWeight = items.reduce((s, r) => s + r.weight, 0);
      const weightedScore = items.reduce((s, r) => s + scores[r.id] * r.weight, 0);
      const maxPossible = maxWeight * 10;
      const pct = maxPossible > 0 ? (weightedScore / maxPossible * 100) : 0;
      return { category: cat, weightedScore, maxPossible, pct, items, catWeight: CAT_WEIGHTS[cat] || 20 };
    });

    // Composite uses category weights
    const compositeScore = catScores.reduce((s, c) => s + c.pct * (c.catWeight / 100), 0);

    // Decision matrix (more granular)
    const decision = compositeScore >= 80 ? 'STRONG ACQUIRE'
      : compositeScore >= 70 ? 'ACQUIRE'
      : compositeScore >= 60 ? 'CONDITIONAL ACQUIRE'
      : compositeScore >= 50 ? 'CONSIDER'
      : compositeScore >= 40 ? 'REVISE & RESUBMIT'
      : compositeScore >= 30 ? 'DECLINE WITH ENCOURAGEMENT'
      : 'PASS';

    const decisionColor = compositeScore >= 70 ? 'text-emerald-400' : compositeScore >= 55 ? 'text-amber-400'
      : compositeScore >= 40 ? 'text-cyan-400' : 'text-red-400';
    const decisionBg = compositeScore >= 70 ? 'bg-emerald-500/5 border-emerald-500/20'
      : compositeScore >= 55 ? 'bg-amber-500/5 border-amber-500/20'
      : compositeScore >= 40 ? 'bg-cyan-500/5 border-cyan-500/20'
      : 'bg-red-500/5 border-red-500/20';
    const decisionIcon = compositeScore >= 70 ? '✅' : compositeScore >= 55 ? '🟡'
      : compositeScore >= 40 ? '🔄' : '❌';

    // Strengths & weaknesses
    const allScored = RUBRIC.map(r => ({ ...r, score: scores[r.id], weighted: scores[r.id] * r.weight }));
    const strengths = [...allScored].sort((a, b) => b.score - a.score).slice(0, 5);
    const weaknesses = [...allScored].sort((a, b) => a.score - b.score).slice(0, 5);

    // Grade letter
    const grade = compositeScore >= 90 ? 'A+' : compositeScore >= 85 ? 'A' : compositeScore >= 80 ? 'A−'
      : compositeScore >= 75 ? 'B+' : compositeScore >= 70 ? 'B' : compositeScore >= 65 ? 'B−'
      : compositeScore >= 60 ? 'C+' : compositeScore >= 55 ? 'C' : compositeScore >= 50 ? 'C−'
      : compositeScore >= 45 ? 'D+' : compositeScore >= 40 ? 'D' : 'F';

    // Offer framework
    const estimatedSales = compAvgSales * (compositeScore / 65);
    const estimatedRevenue = estimatedSales * netPerUnit;
    const totalFixedCosts = editorialCost + designCost + marketingCost;
    const recommendedAdvance = Math.round(estimatedRevenue * 0.4 / 500) * 500;
    const breakEvenUnits = netPerUnit > 0 ? Math.ceil((totalFixedCosts + recommendedAdvance) / netPerUnit) : Infinity;
    const earnOutProb = compositeScore >= 75 ? '75-90%' : compositeScore >= 55 ? '50-70%' : compositeScore >= 40 ? '25-45%' : '<25%';
    const riskLevel = compositeScore >= 70 ? 'LOW' : compositeScore >= 50 ? 'MODERATE' : 'HIGH';

    // Edit type recommendation
    const proseScore = scores['prose'] || 5;
    const editScope = scores['editorialScope'] || 5;
    const avgEditScore = (proseScore + editScope) / 2;
    const editType = avgEditScore >= 8 ? 'Copy edit + proofread only'
      : avgEditScore >= 6 ? 'Line edit + copy edit + proofread'
      : avgEditScore >= 4 ? 'Developmental edit + line edit + copy edit + proofread'
      : 'Major developmental revision needed (potentially R&R first)';
    const editCostEstimate = avgEditScore >= 8 ? '$2,000-$3,500' : avgEditScore >= 6 ? '$3,500-$6,000'
      : avgEditScore >= 4 ? '$5,000-$10,000' : '$7,000-$15,000+';

    // Radar data (category percentages for visual)
    const radarData = catScores.map(c => ({ label: c.category, value: c.pct }));

    return {
      catScores, compositeScore, decision, decisionColor, decisionBg, decisionIcon,
      strengths, weaknesses, grade, radarData,
      estimatedSales: Math.round(estimatedSales), estimatedRevenue,
      recommendedAdvance: Math.max(500, recommendedAdvance),
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
          30-criterion weighted evaluation across 5 dimensions. Market intelligence, deal framework, and auto-generated acquisition memo.
        </p>
      </div>

      {/* Title Info Bar — Expanded */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div><label className={labelClass}>Manuscript Title</label><input type="text" value={titleName} onChange={e => setTitleName(e.target.value)} placeholder="Enter title..." className={inputClass} /></div>
          <div><label className={labelClass}>Author</label><input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Author name..." className={inputClass} /></div>
          <div><label className={labelClass}>Word Count</label><input type="number" value={wordCount} onChange={e => setWordCount(+e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Genre</label>
            <select value={genre} onChange={e => setGenre(e.target.value)} className={inputClass}><option>SFF</option><option>Romance</option><option>Literary Fiction</option><option>YA</option><option>Mystery/Thriller</option><option>Horror</option><option>Nonfiction</option></select>
          </div>
          <div><label className={labelClass}>Submission Date</label><input type="date" value={submissionDate} onChange={e => setSubmissionDate(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Agent/Source</label><input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Agent/slush..." className={inputClass} /></div>
          <div><label className={labelClass}>First Reader</label><input type="text" value={readerName} onChange={e => setReaderName(e.target.value)} placeholder="Reader name..." className={inputClass} /></div>
        </div>
      </div>

      {/* 4-Tab Navigation */}
      <div className="flex gap-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 overflow-x-auto">
        {[
          { id: 'rubric' as const, label: 'Evaluation Rubric', icon: Star, desc: '30 criteria' },
          { id: 'market' as const, label: 'Market Intelligence', icon: TrendingUp, desc: 'Comps & trends' },
          { id: 'offer' as const, label: 'Offer Framework', icon: DollarSign, desc: 'P&L & risk' },
          { id: 'memo' as const, label: 'Acquisition Memo', icon: FileText, desc: 'Deal & memo' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-ui transition-all whitespace-nowrap ${activeView === tab.id ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-muted hover:text-white'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
            <span className="text-[9px] text-text-muted hidden sm:inline">({tab.desc})</span>
          </button>
        ))}
      </div>

      {/* ═══ Composite Score Banner ═══ */}
      <div className={`border rounded-xl p-6 ${analysis.decisionBg}`}>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Composite</p>
            <p className={`font-heading text-4xl ${analysis.decisionColor}`}>{analysis.compositeScore.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-text-muted uppercase mb-1">Grade</p>
            <p className={`font-heading text-3xl ${analysis.decisionColor}`}>{analysis.grade}</p>
          </div>
          <div className="w-px h-12 bg-white/[0.1]" />
          <div>
            <p className="text-[9px] text-text-muted uppercase mb-1">Recommendation</p>
            <p className={`font-heading text-lg ${analysis.decisionColor}`}>{analysis.decisionIcon} {analysis.decision}</p>
          </div>
          <div className="w-px h-12 bg-white/[0.1]" />
          {analysis.catScores.map(cs => {
            const Icon = CAT_ICONS[cs.category];
            return (
              <div key={cs.category} className="text-center">
                <p className="text-[8px] text-text-muted uppercase mb-0.5 flex items-center gap-0.5 justify-center"><Icon className={`w-3 h-3 ${CAT_COLORS[cs.category]}`} /> {cs.category.split(' ')[0]}</p>
                <p className={`font-heading text-sm ${cs.pct >= 70 ? 'text-emerald-400' : cs.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{cs.pct.toFixed(0)}%</p>
                <p className="text-[8px] text-text-muted">{cs.catWeight}% wt</p>
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
                    <p className="text-[10px] text-text-muted">{items.length} criteria · Weight: {catData.catWeight}% of composite · {items.reduce((s, r) => s + r.weight, 0)} pts total</p>
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
                            <span className="text-[9px] text-text-muted font-mono ml-1">(wt: {item.weight})</span>
                            <TIP text={item.tip} />
                          </label>
                          <div className="flex items-center gap-2">
                            {item.subDimensions && (
                              <button onClick={() => setShowSubDimensions(showSubDimensions === item.id ? '' : item.id)}
                                className="text-[8px] text-text-muted hover:text-starforge-gold transition-colors px-1.5 py-0.5 rounded border border-white/[0.06]">
                                {showSubDimensions === item.id ? 'Hide' : 'Sub-criteria'}
                              </button>
                            )}
                            <span className={`font-heading text-lg w-10 text-right ${scores[item.id] >= 8 ? 'text-emerald-400' : scores[item.id] >= 5 ? 'text-amber-400' : 'text-red-400'}`}>{scores[item.id]}</span>
                          </div>
                        </div>
                        <input type="range" min={1} max={10} step={1} value={scores[item.id]} onChange={e => updateScore(item.id, +e.target.value)} className="w-full accent-starforge-gold" />
                        <div className="flex justify-between text-[9px] text-text-muted">
                          {item.descriptors.map((d, i) => (
                            <span key={i} className={`${i === 0 ? 'text-left' : i === item.descriptors.length - 1 ? 'text-right' : 'text-center'} ${Math.round(scores[item.id] / 2) - 1 === i ? 'text-starforge-gold font-medium' : ''}`} style={{ maxWidth: '20%' }}>
                              {d}
                            </span>
                          ))}
                        </div>
                        {/* Sub-dimensions */}
                        {showSubDimensions === item.id && item.subDimensions && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 mt-1">
                            <p className="text-[9px] text-text-muted uppercase mb-2 font-ui">Sub-Dimensions to Evaluate:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {item.subDimensions.map((sub, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                                  <span className="w-1.5 h-1.5 rounded-full bg-starforge-gold/40" />
                                  {sub}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
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
              <h3 className="font-heading text-sm text-emerald-400 mb-3 flex items-center gap-2"><Award className="w-4 h-4" /> Top 5 Strengths</h3>
              {analysis.strengths.map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-emerald-500/10 last:border-0">
                  <span className="text-text-primary">{s.label}</span>
                  <span className="font-mono text-emerald-400">{s.score}/10</span>
                </div>
              ))}
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h3 className="font-heading text-sm text-red-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Top 5 Risks</h3>
              {analysis.weaknesses.map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-red-500/10 last:border-0">
                  <span className="text-text-primary">{s.label}</span>
                  <span className="font-mono text-red-400">{s.score}/10</span>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Recommendation — Enhanced */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Editorial Recommendation</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div><p className="text-[10px] text-text-muted uppercase mb-1">Required Edit Type</p><p className="text-sm text-text-primary">{analysis.editType}</p></div>
              <div><p className="text-[10px] text-text-muted uppercase mb-1">Estimated Cost</p><p className="text-sm text-starforge-gold font-mono">{analysis.editCostEstimate}</p></div>
              <div><p className="text-[10px] text-text-muted uppercase mb-1">Sensitivity Review</p><p className="text-sm text-text-primary">{(scores['sensitivityNeeds'] || 5) >= 7 ? 'Full sensitivity read required' : (scores['sensitivityNeeds'] || 5) >= 4 ? '1-2 sensitivity readers' : 'Standard review'}</p></div>
              <div><p className="text-[10px] text-text-muted uppercase mb-1">Est. Timeline</p><p className="text-sm text-text-primary">{(scores['prose'] || 5) >= 7 ? '3-4 months' : (scores['prose'] || 5) >= 5 ? '5-7 months' : '8-12 months'}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MARKET INTELLIGENCE VIEW ═══ */}
      {activeView === 'market' && (
        <MSMarketIntel genre={genre} scores={scores} compositeScore={analysis.compositeScore} />
      )}

      {/* ═══ OFFER FRAMEWORK VIEW ═══ */}
      {activeView === 'offer' && (
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h3 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-starforge-gold" /> Offer Modeling Inputs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div><label className={labelClass}>Comp Avg Sales <TIP text="First-year sales average for 3-5 comparable titles." /></label><input type="number" min={100} max={100000} step={500} value={compAvgSales} onChange={e => setCompAvgSales(+e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Net Per Unit ($) <TIP text="Publisher net per unit from profitability calculator." /></label><input type="number" min={0.50} max={20} step={0.10} value={netPerUnit} onChange={e => setNetPerUnit(+e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>List Price ($) <TIP text="Planned retail price for paperback." /></label><input type="number" min={9.99} max={29.99} step={1} value={listPrice} onChange={e => setListPrice(+e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Editorial ($) <TIP text="All editing passes: dev edit through proofread." /></label><input type="number" min={0} max={50000} step={500} value={editorialCost} onChange={e => setEditorialCost(+e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Design ($) <TIP text="Cover design + interior layout." /></label><input type="number" min={0} max={10000} step={250} value={designCost} onChange={e => setDesignCost(+e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Marketing ($) <TIP text="Launch marketing budget: ads, ARCs, events." /></label><input type="number" min={0} max={25000} step={250} value={marketingCost} onChange={e => setMarketingCost(+e.target.value)} className={inputClass} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* P&L Projection */}
            <div className="bg-gradient-to-br from-starforge-gold/5 to-purple-500/5 border border-starforge-gold/20 rounded-xl p-6">
              <h3 className="font-heading text-base text-text-primary mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-starforge-gold" /> Offer P&L Projection</h3>
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
                  <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Break-Even</p><p className="font-heading text-sm text-text-primary">{analysis.breakEvenUnits === Infinity ? '∞' : analysis.breakEvenUnits.toLocaleString()} units</p></div>
                  <div className="bg-white/[0.03] rounded-lg p-3 text-center"><p className="text-[9px] text-text-muted uppercase mb-1">Earn-Out Probability</p><p className="font-heading text-sm text-text-primary">{analysis.earnOutProb}</p></div>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
              <h3 className="font-heading text-base text-text-primary mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" /> Risk Assessment</h3>
              <div className="space-y-4">
                <div className={`rounded-lg p-4 text-center ${analysis.riskLevel === 'LOW' ? 'bg-emerald-500/10' : analysis.riskLevel === 'MODERATE' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                  <p className="text-[9px] text-text-muted uppercase mb-1">Risk Level</p>
                  <p className={`font-heading text-2xl ${analysis.riskLevel === 'LOW' ? 'text-emerald-400' : analysis.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-red-400'}`}>{analysis.riskLevel}</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Literary quality supports marketing claims', met: (scores['prose'] || 0) >= 7 },
                    { label: 'Strong commercial hook for buyer pitch', met: (scores['hook'] || 0) >= 7 },
                    { label: 'Author has platform to support launch', met: (scores['social'] || 0) >= 5 || (scores['email'] || 0) >= 5 },
                    { label: 'Genre is trending or stable', met: (scores['genre_fit'] || 0) >= 6 },
                    { label: 'Series potential compounds backlist', met: (scores['series'] || 0) >= 6 },
                    { label: 'Comp titles validate market demand', met: (scores['comps'] || 0) >= 6 },
                    { label: 'Aligns with Rüna Atlas mission', met: (scores['diversity'] || 0) >= 6 || (scores['missionFit'] || 0) >= 6 },
                    { label: 'Break-even achievable in first year', met: analysis.breakEvenUnits <= analysis.estimatedSales },
                    { label: 'Multi-format revenue potential', met: (scores['formatSuitability'] || 0) >= 6 },
                    { label: 'Cover concept is commercially viable', met: (scores['coverPotential'] || 0) >= 6 },
                  ].map(f => (
                    <div key={f.label} className={`flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg ${f.met ? 'bg-emerald-500/5 text-emerald-400' : 'bg-white/[0.02] text-text-muted'}`}>
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

      {/* ═══ ACQUISITION MEMO VIEW ═══ */}
      {activeView === 'memo' && (
        <MSAcquisitionMemo
          titleName={titleName} authorName={authorName} genre={genre} wordCount={wordCount}
          compositeScore={analysis.compositeScore} decision={analysis.decision}
          catScores={analysis.catScores} scores={scores}
          strengths={analysis.strengths} weaknesses={analysis.weaknesses}
          editType={analysis.editType} editCostEstimate={analysis.editCostEstimate}
          estimatedSales={analysis.estimatedSales} estimatedRevenue={analysis.estimatedRevenue}
          recommendedAdvance={analysis.recommendedAdvance} totalFixedCosts={analysis.totalFixedCosts}
          breakEvenUnits={analysis.breakEvenUnits} riskLevel={analysis.riskLevel}
        />
      )}
    </div>
  );
}
