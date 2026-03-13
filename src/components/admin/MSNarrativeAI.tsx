import { useState, useCallback } from 'react';
import {
  Info, Brain, Sparkles, Loader2, AlertTriangle, FileText,
  Zap, ArrowRight, Copy, CheckCircle, RefreshCw
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   AI NARRATIVE AUTO-ANALYSIS
   ────────────────────────────────────────────────────────────
   Connects to Google Gemini API to auto-analyze manuscript text.
   User pastes chapter/excerpt text, AI produces structured
   narrative analysis matching the Narrative Genome framework.

   NOBODY HAS CONNECTED LLM ANALYSIS DIRECTLY INTO A
   MANUSCRIPT SCORING PIPELINE LIKE THIS.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

interface AnalysisResult {
  overallAssessment: string;
  emotionalArc: { label: string; value: number; description: string }[];
  tensionCurve: { label: string; value: number; description: string }[];
  pacingAnalysis: { label: string; value: number; description: string }[];
  characterDepth: { name: string; complexity: number; arc: string; voice: string }[];
  thematicDNA: { theme: string; strength: number; subtlety: string }[];
  proseFingerprint: {
    voiceConsistency: number;
    metaphorDensity: number;
    dialogueAuthenticity: number;
    rhythmScore: number;
    readabilityGrade: string;
  };
  storyShape: string;
  comparisons: string[];
  improvementSuggestions: string[];
}

const ANALYSIS_PROMPT = `You are an expert literary analyst for a publishing house. Analyze the following manuscript excerpt and return a JSON object with this EXACT structure (no markdown, no extra text, just JSON):

{
  "overallAssessment": "2-3 sentence overall quality assessment",
  "emotionalArc": [
    { "label": "Opening", "value": 0-100, "description": "emotional state description" },
    { "label": "Rising", "value": 0-100, "description": "..." },
    { "label": "Midpoint", "value": 0-100, "description": "..." },
    { "label": "Climax", "value": 0-100, "description": "..." },
    { "label": "Resolution", "value": 0-100, "description": "..." }
  ],
  "tensionCurve": [
    { "label": "Stakes", "value": 0-100, "description": "level of stakes" },
    { "label": "Conflict", "value": 0-100, "description": "conflict intensity" },
    { "label": "Suspense", "value": 0-100, "description": "suspense management" },
    { "label": "Payoff", "value": 0-100, "description": "payoff satisfaction" }
  ],
  "pacingAnalysis": [
    { "label": "Scene tempo", "value": 0-100, "description": "..." },
    { "label": "Info pacing", "value": 0-100, "description": "..." },
    { "label": "Rhythm variation", "value": 0-100, "description": "..." }
  ],
  "characterDepth": [
    { "name": "Character Name", "complexity": 0-100, "arc": "arc description", "voice": "voice quality" }
  ],
  "thematicDNA": [
    { "theme": "Theme Name", "strength": 0-100, "subtlety": "how it's woven in" }
  ],
  "proseFingerprint": {
    "voiceConsistency": 0-100,
    "metaphorDensity": 0-100,
    "dialogueAuthenticity": 0-100,
    "rhythmScore": 0-100,
    "readabilityGrade": "e.g., Grade 8, College, Literary"
  },
  "storyShape": "One of: Rags to Riches, Riches to Rags, Man in a Hole, Icarus, Cinderella, Oedipus, Monotone",
  "comparisons": ["Book 1 by Author 1", "Book 2 by Author 2", "Book 3 by Author 3"],
  "improvementSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Analyze deeply. Return ONLY valid JSON.

MANUSCRIPT TEXT:
`;

export default function MSNarrativeAI() {
  const [manuscriptText, setManuscriptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const analyzeWithGemini = useCallback(async () => {
    if (!manuscriptText.trim()) return;

    const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';
    if (!apiKey) {
      setApiKeyMissing(true);
      setError('Gemini API key not found. Set GEMINI_API_KEY in your .env file.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const response = await model.generateContent(ANALYSIS_PROMPT + manuscriptText);
      const text = response.response.text();

      // Extract JSON from possible markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
      const jsonStr = (jsonMatch[1] || text).trim();

      const parsed = JSON.parse(jsonStr) as AnalysisResult;
      setResult(parsed);
    } catch (err: any) {
      console.error('Gemini analysis failed:', err);
      if (err?.message?.includes('MODULE_NOT_FOUND') || err?.message?.includes("Cannot find module")) {
        setError('The @google/generative-ai package is not installed. Run: npm install @google/generative-ai');
      } else if (err instanceof SyntaxError) {
        setError('AI returned invalid JSON. Please try again.');
      } else {
        setError(err.message || 'Analysis failed. Check your API key and try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [manuscriptText]);

  // Simple bar chart component
  const MetricBar = ({ label, value, color = '#d4a853', desc }: { label: string; value: number; color?: string; desc?: string }) => (
    <div className="flex items-center gap-2 group">
      <span className="text-[9px] text-text-muted w-20 truncate">{label}</span>
      <div className="flex-1 h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[9px] font-mono w-7 text-right" style={{ color }}>{value}</span>
      {desc && (
        <span className="pointer-events-none absolute z-50 bottom-full left-0 w-48 rounded-lg bg-void-black border border-white/10 p-2 text-[9px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
          {desc}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" /> AI Narrative Auto-Analysis
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Paste your manuscript text below and let Google Gemini analyze its narrative DNA —
          emotional arcs, tension curves, character depth, thematic patterns, and prose fingerprint.
          <strong className="text-purple-400"> The first AI-powered narrative genome sequencer for publishing.</strong>
        </p>
      </div>

      {/* ═══ TEXT INPUT ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" /> Manuscript Text
          <TIP text="Paste a chapter, excerpt, or full manuscript text. Longer text produces more accurate analysis. 2,000-10,000 words recommended." />
        </h4>
        <textarea
          value={manuscriptText}
          onChange={e => setManuscriptText(e.target.value)}
          placeholder="Paste your manuscript chapter or excerpt here..."
          className="w-full h-48 bg-void-black border border-white/[0.06] rounded-lg p-4 text-xs text-text-primary font-body resize-y focus:outline-none focus:border-purple-500/30"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[9px] text-text-muted">
            {manuscriptText.split(/\s+/).filter(Boolean).length.toLocaleString()} words ·{' '}
            {manuscriptText.length.toLocaleString()} characters
          </p>
          <button
            onClick={analyzeWithGemini}
            disabled={isAnalyzing || manuscriptText.trim().length < 50}
            className={`px-4 py-2 rounded-lg text-xs font-ui flex items-center gap-2 transition-all ${
              isAnalyzing ? 'bg-purple-500/20 text-purple-400 cursor-wait'
              : manuscriptText.trim().length < 50 ? 'bg-white/[0.02] text-text-muted cursor-not-allowed'
              : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze with AI'}
          </button>
        </div>
      </div>

      {/* ═══ ERROR ═══ */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
          <div>
            <p className="text-xs text-red-400 font-medium">Analysis Failed</p>
            <p className="text-[10px] text-text-secondary mt-0.5">{error}</p>
            {apiKeyMissing && (
              <p className="text-[10px] text-text-muted mt-1">
                💡 Create a <code className="text-purple-400">.env</code> file with{' '}
                <code className="text-purple-400">GEMINI_API_KEY=your_key_here</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ═══ LOADING ═══ */}
      {isAnalyzing && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-8 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-purple-400 font-heading">Analyzing Narrative DNA...</p>
          <p className="text-[10px] text-text-muted mt-1">
            Gemini is reading the manuscript, mapping emotional arcs, tracking tension, analyzing prose quality...
          </p>
        </div>
      )}

      {/* ═══ RESULTS ═══ */}
      {result && (
        <div className="space-y-5">
          {/* Overall Assessment */}
          <div className="bg-gradient-to-r from-emerald-500/5 to-purple-500/5 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="font-heading text-sm text-emerald-400 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> AI Assessment
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">{result.overallAssessment}</p>
          </div>

          {/* Emotional Arc + Tension */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <h4 className="font-heading text-sm text-text-primary mb-3">🎭 Emotional Arc</h4>
              <div className="space-y-2">
                {result.emotionalArc.map(item => (
                  <div key={item.label}>
                    <MetricBar label={item.label} value={item.value} color="#f59e0b" />
                    <p className="text-[8px] text-text-muted ml-22 mt-0.5 pl-[90px]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <h4 className="font-heading text-sm text-text-primary mb-3">⚡ Tension Curve</h4>
              <div className="space-y-2">
                {result.tensionCurve.map(item => (
                  <div key={item.label}>
                    <MetricBar label={item.label} value={item.value} color="#ef4444" />
                    <p className="text-[8px] text-text-muted pl-[90px] mt-0.5">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pacing + Prose Fingerprint */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <h4 className="font-heading text-sm text-text-primary mb-3">🎵 Pacing Analysis</h4>
              <div className="space-y-2">
                {result.pacingAnalysis.map(item => (
                  <div key={item.label}>
                    <MetricBar label={item.label} value={item.value} color="#06b6d4" />
                    <p className="text-[8px] text-text-muted pl-[90px] mt-0.5">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <h4 className="font-heading text-sm text-text-primary mb-3">✍️ Prose Fingerprint</h4>
              <div className="space-y-2">
                <MetricBar label="Voice" value={result.proseFingerprint.voiceConsistency} color="#d4a853" />
                <MetricBar label="Metaphor" value={result.proseFingerprint.metaphorDensity} color="#a855f7" />
                <MetricBar label="Dialogue" value={result.proseFingerprint.dialogueAuthenticity} color="#3b82f6" />
                <MetricBar label="Rhythm" value={result.proseFingerprint.rhythmScore} color="#ec4899" />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] text-text-muted">Readability:</span>
                  <span className="text-[10px] text-starforge-gold font-medium">{result.proseFingerprint.readabilityGrade}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Characters */}
          {result.characterDepth.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <h4 className="font-heading text-sm text-text-primary mb-3">👤 Character Depth Analysis</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.characterDepth.map(char => (
                  <div key={char.name} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-text-primary font-medium">{char.name}</span>
                      <span className="text-[9px] text-starforge-gold font-mono">{char.complexity}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-starforge-gold/60 rounded-full" style={{ width: `${char.complexity}%` }} />
                    </div>
                    <p className="text-[8px] text-text-muted"><span className="text-text-secondary">Arc:</span> {char.arc}</p>
                    <p className="text-[8px] text-text-muted"><span className="text-text-secondary">Voice:</span> {char.voice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thematic DNA */}
          {result.thematicDNA.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <h4 className="font-heading text-sm text-text-primary mb-3">🧬 Thematic DNA</h4>
              <div className="space-y-2.5">
                {result.thematicDNA.map(theme => (
                  <div key={theme.theme}>
                    <MetricBar label={theme.theme} value={theme.strength} color="#22c55e" />
                    <p className="text-[8px] text-text-muted pl-[90px] mt-0.5">{theme.subtlety}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Story Shape + Comparisons + Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
              <h4 className="font-heading text-sm text-text-primary mb-2">📐 Story Shape</h4>
              <p className="text-lg text-starforge-gold font-heading">{result.storyShape}</p>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <h4 className="font-heading text-sm text-text-primary mb-2">📚 AI Comparisons</h4>
              <div className="space-y-1">
                {result.comparisons.map((comp, i) => (
                  <p key={i} className="text-[10px] text-text-secondary flex items-center gap-1.5">
                    <span className="text-starforge-gold">▸</span> {comp}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <h4 className="font-heading text-sm text-text-primary mb-2">💡 Improvement Suggestions</h4>
              <div className="space-y-1">
                {result.improvementSuggestions.map((sug, i) => (
                  <p key={i} className="text-[10px] text-text-secondary flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5">{i + 1}.</span> {sug}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Re-analyze */}
          <div className="flex justify-center">
            <button
              onClick={analyzeWithGemini}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-lg text-xs font-ui flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-purple-400 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-analyze with different parameters
            </button>
          </div>
        </div>
      )}

      {/* ═══ DEMO MODE (when no text entered) ═══ */}
      {!result && !isAnalyzing && !manuscriptText && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 text-center">
          <Brain className="w-10 h-10 text-purple-400/40 mx-auto mb-3" />
          <p className="text-sm text-text-muted font-heading">Ready for Analysis</p>
          <p className="text-[10px] text-text-muted mt-1 max-w-md mx-auto">
            Paste manuscript text above, then click "Analyze with AI" to receive a structured narrative analysis
            including emotional arcs, tension curves, character depth, thematic DNA, and prose fingerprinting.
          </p>
          <div className="flex justify-center gap-4 mt-4 text-[9px] text-text-muted">
            {['Emotional Arcs', 'Tension Curves', 'Character Depth', 'Prose Fingerprint', 'Thematic DNA', 'Story Shape'].map(f => (
              <span key={f} className="px-2 py-1 bg-purple-500/5 border border-purple-500/10 rounded-full text-purple-400/60">{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
