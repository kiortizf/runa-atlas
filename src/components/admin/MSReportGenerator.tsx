import { useState, useMemo, useRef } from 'react';
import {
  Info, FileText, Printer, Copy, CheckCircle, Download,
  Star, Activity, PieChart, Share2, GitBranch, Network, Globe, Calendar,
  AlertTriangle, TrendingUp, Shield, Eye, Sparkles, Award
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ACQUISITION REPORT GENERATOR
   ────────────────────────────────────────────────────────────
   One-click generation of a comprehensive acquisition report
   combining all intelligence layers into a formatted document.

   NO PUBLISHING TOOL GENERATES A UNIFIED REPORT ACROSS
   THIS MANY ANALYTICAL DIMENSIONS.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

interface ReportConfig {
  title: string;
  author: string;
  genre: string;
  wordCount: number;
  submissionDate: string;
  evaluator: string;
  // System scores
  rubricScore: number;
  narrativeScore: number;
  portfolioScore: number;
  readerScore: number;
  decisionScore: number;
  synergyScore: number;
  zeitgeistScore: number;
  trajectoryScore: number;
  // Financial
  estimatedSales: number;
  recommendedAdvance: number;
  projectedRevenue: number;
  breakEvenUnits: number;
  // Notes
  strengths: string;
  weaknesses: string;
  marketContext: string;
  editorialNotes: string;
}

export default function MSReportGenerator() {
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<ReportConfig>({
    title: 'The Ember Codex',
    author: 'Elena Voss',
    genre: 'Fantasy',
    wordCount: 92000,
    submissionDate: new Date().toISOString().split('T')[0],
    evaluator: 'Editorial Team',
    rubricScore: 72,
    narrativeScore: 78,
    portfolioScore: 55,
    readerScore: 80,
    decisionScore: 65,
    synergyScore: 85,
    zeitgeistScore: 70,
    trajectoryScore: 58,
    estimatedSales: 4200,
    recommendedAdvance: 8000,
    projectedRevenue: 22400,
    breakEvenUnits: 3800,
    strengths: 'Exceptional voice, strong emotional resonance, excellent catalog synergy potential.',
    weaknesses: 'Portfolio concentration risk in fantasy segment. Author trajectory uncertain for debut.',
    marketContext: 'Fantasy market showing sustained growth. Comp titles averaging 3,500 units. Cultural themes align well with current zeitgeist.',
    editorialNotes: 'Recommend developmental edit on Act 3 pacing. Strong voice that deserves investment. Second reader confirms quality.',
  });

  const update = (field: keyof ReportConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const analysis = useMemo(() => {
    const scores = [
      { label: 'Manuscript Rubric', score: config.rubricScore, icon: '📋' },
      { label: 'Narrative Genome', score: config.narrativeScore, icon: '🧬' },
      { label: 'Portfolio Theory', score: config.portfolioScore, icon: '📊' },
      { label: 'Reader Genome', score: config.readerScore, icon: '👥' },
      { label: 'Decision Genome', score: config.decisionScore, icon: '🔀' },
      { label: 'Catalog Synergy', score: config.synergyScore, icon: '🕸️' },
      { label: 'Cultural Zeitgeist', score: config.zeitgeistScore, icon: '🌍' },
      { label: 'Author Trajectory', score: config.trajectoryScore, icon: '📈' },
    ];

    const composite = scores.reduce((s, item) => s + item.score, 0) / scores.length;
    const grade = composite >= 85 ? 'A' : composite >= 75 ? 'B+' : composite >= 65 ? 'B'
      : composite >= 55 ? 'C+' : composite >= 45 ? 'C' : 'D';
    const recommendation = composite >= 75 ? 'STRONG ACQUIRE'
      : composite >= 65 ? 'ACQUIRE' : composite >= 55 ? 'CONDITIONAL' : composite >= 45 ? 'DEVELOP' : 'PASS';
    const roi = config.projectedRevenue > 0 && config.recommendedAdvance > 0
      ? ((config.projectedRevenue - config.recommendedAdvance) / config.recommendedAdvance * 100).toFixed(0)
      : '0';

    return { scores, composite, grade, recommendation, roi };
  }, [config]);

  const copyReport = () => {
    if (reportRef.current) {
      const text = reportRef.current.innerText;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-emerald-500/5 via-starforge-gold/5 to-emerald-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" /> Acquisition Report Generator
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          One-click generation of a comprehensive acquisition report combining all {analysis.scores.length} intelligence layers
          into a formatted document ready for the editorial board.
          <strong className="text-emerald-400"> The first unified multi-system acquisition report for publishing.</strong>
        </p>
      </div>

      {/* ═══ INPUT FORM ═══ */}
      {!showReport && (
        <>
          {/* Manuscript Details */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-starforge-gold" /> Manuscript Details
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'Title', field: 'title' as const, type: 'text' },
                { label: 'Author', field: 'author' as const, type: 'text' },
                { label: 'Genre', field: 'genre' as const, type: 'text' },
                { label: 'Word Count', field: 'wordCount' as const, type: 'number' },
                { label: 'Submission Date', field: 'submissionDate' as const, type: 'date' },
                { label: 'Evaluator', field: 'evaluator' as const, type: 'text' },
              ].map(inp => (
                <div key={inp.field}>
                  <label className="text-[8px] text-text-muted uppercase">{inp.label}</label>
                  <input type={inp.type} value={config[inp.field]}
                    onChange={e => update(inp.field, inp.type === 'number' ? +e.target.value : e.target.value)}
                    className="w-full bg-void-black border border-white/[0.06] rounded px-2 py-1.5 text-xs text-text-primary" />
                </div>
              ))}
            </div>
          </div>

          {/* System Scores */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Intelligence Scores
              <TIP text="Enter the scores from each intelligence system tab. These feed into the composite calculation and appear in the report." />
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Rubric Score', field: 'rubricScore' as const },
                { label: 'Narrative Score', field: 'narrativeScore' as const },
                { label: 'Portfolio Score', field: 'portfolioScore' as const },
                { label: 'Reader Score', field: 'readerScore' as const },
                { label: 'Decision Score', field: 'decisionScore' as const },
                { label: 'Synergy Score', field: 'synergyScore' as const },
                { label: 'Zeitgeist Score', field: 'zeitgeistScore' as const },
                { label: 'Trajectory Score', field: 'trajectoryScore' as const },
              ].map(inp => (
                <div key={inp.field}>
                  <label className="text-[8px] text-text-muted uppercase">{inp.label}</label>
                  <input type="number" min={0} max={100} value={config[inp.field]}
                    onChange={e => update(inp.field, +e.target.value)}
                    className="w-full bg-void-black border border-white/[0.06] rounded px-2 py-1.5 text-xs text-text-primary" />
                </div>
              ))}
            </div>
          </div>

          {/* Financial Projections */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Financial Projections
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Est. Sales (units)', field: 'estimatedSales' as const },
                { label: 'Recommended Advance ($)', field: 'recommendedAdvance' as const },
                { label: 'Projected Revenue ($)', field: 'projectedRevenue' as const },
                { label: 'Break-even (units)', field: 'breakEvenUnits' as const },
              ].map(inp => (
                <div key={inp.field}>
                  <label className="text-[8px] text-text-muted uppercase">{inp.label}</label>
                  <input type="number" value={config[inp.field]}
                    onChange={e => update(inp.field, +e.target.value)}
                    className="w-full bg-void-black border border-white/[0.06] rounded px-2 py-1.5 text-xs text-text-primary" />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" /> Editorial Notes
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[
                { label: 'Key Strengths', field: 'strengths' as const },
                { label: 'Key Weaknesses', field: 'weaknesses' as const },
                { label: 'Market Context', field: 'marketContext' as const },
                { label: 'Editorial Notes', field: 'editorialNotes' as const },
              ].map(inp => (
                <div key={inp.field}>
                  <label className="text-[8px] text-text-muted uppercase">{inp.label}</label>
                  <textarea value={config[inp.field] as string}
                    onChange={e => update(inp.field, e.target.value)}
                    rows={2}
                    className="w-full bg-void-black border border-white/[0.06] rounded px-2 py-1.5 text-xs text-text-primary resize-y" />
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowReport(true)}
              className="px-6 py-3 rounded-xl text-sm font-heading bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Generate Acquisition Report
            </button>
          </div>
        </>
      )}

      {/* ═══ GENERATED REPORT ═══ */}
      {showReport && (
        <>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowReport(false)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-ui bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-white transition-all">
              ← Back to Editor
            </button>
            <button onClick={copyReport}
              className="px-3 py-1.5 rounded-lg text-[10px] font-ui bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-1.5">
              {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy Report'}
            </button>
            <button onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg text-[10px] font-ui bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
              <Printer className="w-3 h-3" /> Print
            </button>
          </div>

          <div ref={reportRef} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 space-y-6 print:bg-white print:text-black">
            {/* Report Header */}
            <div className="text-center border-b border-white/[0.06] pb-6">
              <p className="text-[10px] text-text-muted uppercase tracking-widest">Confidential — Rüna Atlas Press</p>
              <h2 className="font-heading text-2xl text-text-primary mt-2">Acquisition Report</h2>
              <p className="text-lg text-starforge-gold font-heading mt-1">"{config.title}"</p>
              <p className="text-xs text-text-secondary mt-1">by {config.author} · {config.genre} · {config.wordCount.toLocaleString()} words</p>
              <p className="text-[9px] text-text-muted mt-2">Date: {config.submissionDate} · Evaluator: {config.evaluator}</p>
            </div>

            {/* Executive Summary */}
            <div>
              <h3 className="font-heading text-sm text-starforge-gold mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" /> Executive Summary
              </h3>
              <div className="flex items-center gap-6 mb-3">
                <div className="text-center">
                  <p className="font-heading text-4xl text-starforge-gold">{analysis.composite.toFixed(0)}%</p>
                  <p className="text-[9px] text-text-muted">Composite</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-3xl text-emerald-400">{analysis.grade}</p>
                  <p className="text-[9px] text-text-muted">Grade</p>
                </div>
                <div className={`text-center px-3 py-1 rounded-lg ${analysis.recommendation.includes('ACQUIRE') ? 'bg-emerald-500/10' : analysis.recommendation === 'CONDITIONAL' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                  <p className={`text-sm font-heading ${analysis.recommendation.includes('ACQUIRE') ? 'text-emerald-400' : analysis.recommendation === 'CONDITIONAL' ? 'text-amber-400' : 'text-red-400'}`}>
                    {analysis.recommendation}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                "{config.title}" by {config.author} scores {analysis.composite.toFixed(0)}% composite across {analysis.scores.length} intelligence
                systems (Grade: {analysis.grade}). Based on multi-dimensional analysis including narrative quality,
                market positioning, catalog synergy, and cultural alignment, the recommendation is: <strong>{analysis.recommendation}</strong>.
              </p>
            </div>

            {/* Score Table */}
            <div>
              <h3 className="font-heading text-sm text-starforge-gold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Intelligence System Scores
              </h3>
              <div className="border border-white/[0.06] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="text-[9px] text-text-muted text-left px-3 py-2 font-ui">System</th>
                      <th className="text-[9px] text-text-muted text-right px-3 py-2 font-ui">Score</th>
                      <th className="text-[9px] text-text-muted text-left px-3 py-2 font-ui w-1/2">Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.scores.map((item, i) => (
                      <tr key={i} className="border-t border-white/[0.04]">
                        <td className="text-[10px] text-text-primary px-3 py-2">{item.icon} {item.label}</td>
                        <td className={`text-[10px] font-mono text-right px-3 py-2 ${item.score >= 70 ? 'text-emerald-400' : item.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                          {item.score}%
                        </td>
                        <td className="px-3 py-2">
                          <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.score >= 70 ? 'bg-emerald-500/40' : item.score >= 50 ? 'bg-amber-500/40' : 'bg-red-500/40'}`}
                              style={{ width: `${item.score}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4">
                <h4 className="text-xs text-emerald-400 font-heading mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Key Strengths
                </h4>
                <p className="text-[10px] text-text-secondary leading-relaxed">{config.strengths}</p>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4">
                <h4 className="text-xs text-red-400 font-heading mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Key Weaknesses
                </h4>
                <p className="text-[10px] text-text-secondary leading-relaxed">{config.weaknesses}</p>
              </div>
            </div>

            {/* Market Context */}
            <div>
              <h3 className="font-heading text-sm text-starforge-gold mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Market Context
              </h3>
              <p className="text-[10px] text-text-secondary leading-relaxed">{config.marketContext}</p>
            </div>

            {/* Financial Summary */}
            <div>
              <h3 className="font-heading text-sm text-starforge-gold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Financial Summary
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Est. Sales', value: config.estimatedSales.toLocaleString(), unit: 'units' },
                  { label: 'Recommended Advance', value: `$${config.recommendedAdvance.toLocaleString()}`, unit: '' },
                  { label: 'Projected Revenue', value: `$${config.projectedRevenue.toLocaleString()}`, unit: '' },
                  { label: 'Projected ROI', value: `${analysis.roi}%`, unit: '' },
                ].map(m => (
                  <div key={m.label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 text-center">
                    <p className="text-[8px] text-text-muted uppercase">{m.label}</p>
                    <p className="font-heading text-lg text-text-primary">{m.value}</p>
                    {m.unit && <p className="text-[8px] text-text-muted">{m.unit}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Editorial Notes */}
            <div>
              <h3 className="font-heading text-sm text-starforge-gold mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Editorial Notes
              </h3>
              <p className="text-[10px] text-text-secondary leading-relaxed">{config.editorialNotes}</p>
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] pt-4 text-center">
              <p className="text-[8px] text-text-muted">
                Generated by Rüna Atlas Press Intelligence Engine · {new Date().toLocaleDateString()} ·
                {analysis.scores.length}-System Multi-Dimensional Analysis · Confidential
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
