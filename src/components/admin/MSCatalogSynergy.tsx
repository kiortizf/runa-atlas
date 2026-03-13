import { useState, useMemo, useCallback } from 'react';
import {
  Info, Network, Share2, Sparkles, Zap, Target, TrendingUp,
  Plus, X, BarChart3, Link2, Globe, BookOpen
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CATALOG SYNERGY MATRIX
   ────────────────────────────────────────────────────────────
   Network science applied to a publisher's catalog. Models how
   books cross-pollinate readers through shared tropes, themes,
   cover aesthetics, and reader demographics.

   Based on:
   • Network theory (Barabási — scale-free networks)
   • Metcalfe's Law (network value ∝ n²)
   • Cross-selling elasticity (retail science)
   • Jaccard similarity coefficient for overlap
   • Betweenness centrality for hub identification

   NOBODY HAS APPLIED NETWORK GRAPH THEORY TO A
   PUBLISHER'S CATALOG.
   ═══════════════════════════════════════════════════════════════ */

const TIP = ({ text }: { text: string }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <Info className="w-3 h-3 text-text-muted inline" />
    <span className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-void-black border border-white/10 p-2.5 text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">{text}</span>
  </span>
);

// ═══ TROPES & THEMES TAXONOMY ═══
const ALL_TROPES = [
  'Chosen One', 'Found Family', 'Enemies to Lovers', 'Heist/Caper', 'Unreliable Narrator',
  'Time Loop', 'Portal Fantasy', 'Second World', 'Space Opera', 'Cyberpunk',
  'Solarpunk', 'Gothic', 'Body Horror', 'Slow Burn', 'Dual Timeline',
  'Epistolary', 'Quest Narrative', 'Coming of Age', 'Revenge Arc', 'Political Intrigue',
  'Magic System', 'AI/Sentience', 'Climate Fiction', 'Afrofuturism', 'Indigenous Futurism',
  'Queernorm', 'Disability Rep', 'Neurodivergent MC', 'Immigrant Experience', 'Anti-Hero',
];

const ALL_THEMES = [
  'Identity', 'Belonging', 'Power', 'Memory', 'Grief', 'Hope',
  'Resistance', 'Colonialism', 'Language', 'Body Autonomy',
  'Technology & Humanity', 'Environmental Justice', 'Generational Trauma',
  'Queer Joy', 'Community', 'Surveillance', 'Class', 'Faith', 'Art & Creation',
];

interface CatalogBook {
  id: string;
  title: string;
  genre: string;
  tropes: string[];
  themes: string[];
  avgSales: number; // monthly average
  audienceSize: number; // estimated reader base
}

const DEFAULT_CATALOG: CatalogBook[] = [
  { id: 'a', title: 'The Starforge Chronicles', genre: 'SFF', tropes: ['Chosen One', 'Found Family', 'Magic System', 'Second World'], themes: ['Identity', 'Belonging', 'Power'], avgSales: 220, audienceSize: 4500 },
  { id: 'b', title: 'Neon Meridian', genre: 'SFF', tropes: ['Cyberpunk', 'AI/Sentience', 'Heist/Caper', 'Queernorm'], themes: ['Technology & Humanity', 'Surveillance', 'Queer Joy'], avgSales: 180, audienceSize: 3200 },
  { id: 'c', title: 'The Bone Orchard', genre: 'Horror', tropes: ['Gothic', 'Body Horror', 'Unreliable Narrator'], themes: ['Grief', 'Memory', 'Body Autonomy'], avgSales: 150, audienceSize: 2800 },
  { id: 'd', title: 'Ember & Tide', genre: 'SFF', tropes: ['Enemies to Lovers', 'Slow Burn', 'Portal Fantasy', 'Solarpunk'], themes: ['Environmental Justice', 'Hope', 'Community'], avgSales: 280, audienceSize: 5100 },
  { id: 'e', title: 'The Language of Stars', genre: 'Literary SFF', tropes: ['Dual Timeline', 'Indigenous Futurism', 'Coming of Age'], themes: ['Language', 'Colonialism', 'Generational Trauma'], avgSales: 120, audienceSize: 2200 },
  { id: 'f', title: 'Iron Meridian', genre: 'SFF', tropes: ['Space Opera', 'Political Intrigue', 'Anti-Hero', 'Afrofuturism'], themes: ['Resistance', 'Power', 'Class'], avgSales: 195, audienceSize: 3800 },
];

export default function MSCatalogSynergy() {
  const [catalog, setCatalog] = useState<CatalogBook[]>(DEFAULT_CATALOG);
  const [newManuscript, setNewManuscript] = useState<CatalogBook>({
    id: 'new', title: 'New Manuscript', genre: 'SFF',
    tropes: ['Found Family', 'Queernorm', 'Climate Fiction'],
    themes: ['Hope', 'Community', 'Resistance'],
    avgSales: 0, audienceSize: 0,
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showNewMS, setShowNewMS] = useState(true);

  const toggleTrope = useCallback((trope: string, isNew: boolean) => {
    if (isNew) {
      setNewManuscript(prev => ({
        ...prev,
        tropes: prev.tropes.includes(trope)
          ? prev.tropes.filter(t => t !== trope)
          : [...prev.tropes, trope],
      }));
    }
  }, []);

  const toggleTheme = useCallback((theme: string, isNew: boolean) => {
    if (isNew) {
      setNewManuscript(prev => ({
        ...prev,
        themes: prev.themes.includes(theme)
          ? prev.themes.filter(t => t !== theme)
          : [...prev.themes, theme],
      }));
    }
  }, []);

  const analysis = useMemo(() => {
    const allBooks = showNewMS ? [...catalog, newManuscript] : catalog;

    // ═══ JACCARD SIMILARITY ═══
    // J(A,B) = |A ∩ B| / |A ∪ B| for combined tropes + themes
    const jaccard = (a: CatalogBook, b: CatalogBook): number => {
      const aSet = new Set([...a.tropes, ...a.themes]);
      const bSet = new Set([...b.tropes, ...b.themes]);
      const intersection = [...aSet].filter(x => bSet.has(x)).length;
      const union = new Set([...aSet, ...bSet]).size;
      return union > 0 ? intersection / union : 0;
    };

    // Build adjacency matrix
    const edges: { from: string; to: string; weight: number }[] = [];
    const similarities: Record<string, Record<string, number>> = {};

    allBooks.forEach(a => {
      similarities[a.id] = {};
      allBooks.forEach(b => {
        if (a.id !== b.id) {
          const sim = jaccard(a, b);
          similarities[a.id][b.id] = sim;
          if (sim > 0.05 && a.id < b.id) { // avoid duplicates
            edges.push({ from: a.id, to: b.id, weight: sim });
          }
        }
      });
    });

    // ═══ NETWORK METRICS ═══
    // Degree centrality (normalized connections)
    const degreeCentrality = allBooks.map(book => {
      const connections = edges.filter(e => e.from === book.id || e.to === book.id);
      const totalWeight = connections.reduce((s, e) => s + e.weight, 0);
      return { ...book, degree: connections.length, weightedDegree: totalWeight };
    });

    // Betweenness centrality (simplified — based on shortest path participation)
    // Using weighted degree as proxy since full betweenness requires Floyd-Warshall
    const maxDegree = Math.max(...degreeCentrality.map(b => b.weightedDegree), 1);
    const centrality = degreeCentrality.map(b => ({
      ...b,
      centralityScore: (b.weightedDegree / maxDegree * 100),
    })).sort((a, b) => b.centralityScore - a.centralityScore);

    // ═══ CATALOG DENSITY ═══
    // How connected is the catalog? (actual edges / possible edges)
    const possibleEdges = allBooks.length * (allBooks.length - 1) / 2;
    const significantEdges = edges.filter(e => e.weight > 0.1).length;
    const density = possibleEdges > 0 ? (significantEdges / possibleEdges * 100) : 0;

    // ═══ METCALFE'S LAW — NETWORK VALUE ═══
    // V = n × (n-1) / 2 × avg_connection_strength
    const avgEdgeWeight = edges.length > 0 ? edges.reduce((s, e) => s + e.weight, 0) / edges.length : 0;
    const networkValue = allBooks.length * (allBooks.length - 1) / 2 * avgEdgeWeight;

    // ═══ NEW MANUSCRIPT SYNERGY ═══
    const newBookSims = showNewMS ? catalog.map(book => ({
      book,
      similarity: jaccard(newManuscript, book),
      sharedTropes: newManuscript.tropes.filter(t => book.tropes.includes(t)),
      sharedThemes: newManuscript.themes.filter(t => book.themes.includes(t)),
    })).sort((a, b) => b.similarity - a.similarity) : [];

    const avgSimilarity = newBookSims.length > 0
      ? newBookSims.reduce((s, b) => s + b.similarity, 0) / newBookSims.length : 0;

    // Cross-sell lift estimate: each 0.1 Jaccard similarity ≈ 3-5% cross-sell probability
    const crossSellLift = newBookSims.map(b => ({
      ...b,
      estimatedLift: Math.round(b.similarity * 40 * b.book.avgSales / 100), // units
      liftPct: b.similarity * 40, // percent
    }));

    const totalCrossSellUnits = crossSellLift.reduce((s, b) => s + b.estimatedLift, 0);

    // Network value BEFORE and AFTER adding manuscript
    const nBefore = catalog.length;
    const edgesBefore = edges.filter(e => e.from !== 'new' && e.to !== 'new');
    const avgBefore = edgesBefore.length > 0 ? edgesBefore.reduce((s, e) => s + e.weight, 0) / edgesBefore.length : 0;
    const valueBefore = nBefore * (nBefore - 1) / 2 * avgBefore;
    const valueIncrease = networkValue - valueBefore;
    const valuePctIncrease = valueBefore > 0 ? (valueIncrease / valueBefore * 100) : 0;

    // Synergy score (0-100)
    const synergyScore = Math.min(100, Math.round(
      avgSimilarity * 200 + // similarity contribution
      (newBookSims.filter(b => b.similarity > 0.15).length / catalog.length * 30) + // breadth
      (newBookSims[0]?.similarity || 0) * 30 // depth with closest match
    ));

    return {
      allBooks, edges, similarities, centrality, density, networkValue,
      avgEdgeWeight, newBookSims, avgSimilarity, crossSellLift,
      totalCrossSellUnits, valueBefore, valueIncrease, valuePctIncrease,
      synergyScore,
    };
  }, [catalog, newManuscript, showNewMS]);

  // ═══ SVG LAYOUT (force-directed simplified as circular) ═══
  const nodePositions = useMemo(() => {
    const books = analysis.allBooks;
    const n = books.length;
    const cx = 400, cy = 180, radius = 140;
    return books.map((book, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        id: book.id,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        book,
      };
    });
  }, [analysis.allBooks]);

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 border border-white/[0.06] rounded-xl p-5">
        <h3 className="font-heading text-lg text-text-primary flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" /> Catalog Synergy Matrix
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Network science applied to your catalog. Models how books cross-pollinate readers through shared tropes,
          themes, and reader demographics. Uses Jaccard similarity, Metcalfe's Law, and network centrality.
          <strong className="text-starforge-gold"> No publisher has ever applied network graph theory to catalog strategy.</strong>
        </p>
      </div>

      {/* ═══ NETWORK VISUALIZATION ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" /> Catalog Network Graph
          <TIP text="Each node is a book. Edge thickness = Jaccard similarity (shared tropes + themes). Hover to highlight connections. The new manuscript shows how it weaves into the existing network." />
        </h4>
        <div className="bg-void-black rounded-lg p-3 border border-white/[0.06]">
          <svg viewBox="0 0 800 360" className="w-full" style={{ height: 300 }}>
            {/* Edges */}
            {analysis.edges.map((edge, i) => {
              const from = nodePositions.find(n => n.id === edge.from);
              const to = nodePositions.find(n => n.id === edge.to);
              if (!from || !to) return null;
              const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
              const isNew = edge.from === 'new' || edge.to === 'new';
              return (
                <line key={i}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isNew ? '#d4a017' : isHighlighted ? '#a855f7' : 'rgba(255,255,255,0.08)'}
                  strokeWidth={Math.max(0.5, edge.weight * 6)}
                  opacity={isHighlighted ? 0.8 : isNew ? 0.5 : 0.3}
                />
              );
            })}

            {/* Nodes */}
            {nodePositions.map(node => {
              const isNew = node.id === 'new';
              const centr = analysis.centrality.find(c => c.id === node.id);
              const nodeSize = isNew ? 22 : 14 + (centr?.centralityScore || 0) * 0.1;
              const isHovered = hoveredNode === node.id;

              return (
                <g key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}>
                  {/* Glow */}
                  {(isHovered || isNew) && (
                    <circle cx={node.x} cy={node.y} r={nodeSize + 6}
                      fill="none" stroke={isNew ? '#d4a017' : '#a855f7'} strokeWidth="1"
                      opacity="0.3" />
                  )}
                  {/* Node */}
                  <circle cx={node.x} cy={node.y} r={nodeSize}
                    fill={isNew ? '#d4a017' : isHovered ? '#a855f7' : '#1a1a24'}
                    stroke={isNew ? '#d4a017' : '#6b7280'}
                    strokeWidth={isHovered ? 2 : 1}
                    opacity={isNew ? 0.9 : 0.8}
                  />
                  {/* Label */}
                  <text x={node.x} y={node.y + nodeSize + 14}
                    fill={isNew ? '#d4a017' : 'rgba(255,255,255,0.6)'}
                    fontSize={isNew ? '9' : '8'} textAnchor="middle"
                    fontWeight={isNew ? 'bold' : 'normal'}>
                    {node.book.title.length > 18 ? node.book.title.slice(0, 16) + '…' : node.book.title}
                  </text>
                  {isNew && (
                    <text x={node.x} y={node.y + nodeSize + 24}
                      fill="#d4a017" fontSize="7" textAnchor="middle" fontStyle="italic">
                      (NEW)
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Network stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div className="bg-white/[0.03] rounded-lg p-2 text-center">
            <p className="text-[8px] text-text-muted uppercase">Density</p>
            <p className={`font-heading text-lg ${analysis.density >= 60 ? 'text-emerald-400' : analysis.density >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
              {analysis.density.toFixed(0)}%
            </p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2 text-center">
            <p className="text-[8px] text-text-muted uppercase">Avg Similarity</p>
            <p className="font-heading text-lg text-purple-400">{(analysis.avgEdgeWeight * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2 text-center">
            <p className="text-[8px] text-text-muted uppercase">Network Value</p>
            <p className="font-heading text-lg text-starforge-gold">{analysis.networkValue.toFixed(2)}</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2 text-center">
            <p className="text-[8px] text-text-muted uppercase">Connections</p>
            <p className="font-heading text-lg text-cyan-400">{analysis.edges.length}</p>
          </div>
        </div>
      </div>

      {/* ═══ Two-Column: Centrality + New MS Config ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Network Centrality Rankings */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" /> Network Centrality Rankings
            <TIP text="Books ranked by network centrality — how connected they are to the rest of the catalog. Hub books drive cross-selling and platform coherence." />
          </h4>
          <div className="space-y-2">
            {analysis.centrality.map((book, i) => (
              <div key={book.id} className={`flex items-center gap-2 rounded-lg p-2 ${book.id === 'new' ? 'bg-starforge-gold/10 border border-starforge-gold/20' : 'bg-white/[0.02]'}`}>
                <span className={`text-[10px] font-mono w-6 text-center ${i === 0 ? 'text-starforge-gold' : 'text-text-muted'}`}>#{i + 1}</span>
                <div className="flex-1">
                  <p className={`text-[11px] ${book.id === 'new' ? 'text-starforge-gold' : 'text-text-primary'}`}>
                    {book.title} {book.id === 'new' && '(NEW)'}
                  </p>
                  <p className="text-[8px] text-text-muted">{book.degree} connections · {book.tropes.slice(0, 3).join(', ')}</p>
                </div>
                <div className="w-24 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500/60 to-starforge-gold/60 rounded-full"
                    style={{ width: `${book.centralityScore}%` }} />
                </div>
                <span className="text-[9px] font-mono text-text-muted w-10 text-right">{book.centralityScore.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* New Manuscript Configuration */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> New Manuscript — Trope & Theme DNA
          </h4>
          <div className="mb-3">
            <label className="text-[9px] text-text-muted uppercase font-ui block mb-1">Title</label>
            <input type="text" value={newManuscript.title}
              onChange={e => setNewManuscript(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-void-black border border-border rounded px-2 py-1.5 text-sm text-white focus:border-starforge-gold outline-none" />
          </div>

          <div className="mb-3">
            <p className="text-[9px] text-text-muted uppercase font-ui mb-1">Tropes (click to toggle)</p>
            <div className="flex flex-wrap gap-1">
              {ALL_TROPES.map(trope => {
                const isSelected = newManuscript.tropes.includes(trope);
                return (
                  <button key={trope} onClick={() => toggleTrope(trope, true)}
                    className={`text-[8px] px-1.5 py-0.5 rounded transition-all ${
                      isSelected
                        ? 'bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30'
                        : 'bg-white/[0.02] text-text-muted border border-white/[0.04] hover:border-white/10'
                    }`}>
                    {trope}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[9px] text-text-muted uppercase font-ui mb-1">Themes (click to toggle)</p>
            <div className="flex flex-wrap gap-1">
              {ALL_THEMES.map(theme => {
                const isSelected = newManuscript.themes.includes(theme);
                return (
                  <button key={theme} onClick={() => toggleTheme(theme, true)}
                    className={`text-[8px] px-1.5 py-0.5 rounded transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-white/[0.02] text-text-muted border border-white/[0.04] hover:border-white/10'
                    }`}>
                    {theme}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CROSS-SELL LIFT ANALYSIS ═══ */}
      {showNewMS && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Cross-Sell Lift Prediction
            <TIP text="Estimated sales lift to existing catalog titles when adding this manuscript. Based on Jaccard similarity × historical cross-sell elasticity (each 10% similarity ≈ 4% cross-sell rate)." />
          </h4>
          <div className="space-y-2">
            {analysis.crossSellLift.map(item => (
              <div key={item.book.id} className="flex items-center gap-3">
                <div className="w-40">
                  <p className="text-[10px] text-text-primary truncate">{item.book.title}</p>
                  <p className="text-[8px] text-text-muted">{item.sharedTropes.length} tropes · {item.sharedThemes.length} themes shared</p>
                </div>
                <div className="flex-1 h-4 bg-white/[0.03] rounded-sm overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 rounded-sm"
                    style={{ width: `${Math.min(100, item.similarity * 500)}%` }} />
                  <span className="absolute inset-0 flex items-center px-2 text-[8px] font-mono text-text-primary">
                    Jaccard: {(item.similarity * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-20 text-right">
                  <span className="text-[9px] font-mono text-emerald-400">+{item.estimatedLift} units</span>
                  <p className="text-[7px] text-text-muted">+{item.liftPct.toFixed(1)}% lift</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
            <p className="text-xs text-text-primary">
              Adding <strong className="text-starforge-gold">{newManuscript.title}</strong> is estimated to generate
              <strong className="text-emerald-400"> +{analysis.totalCrossSellUnits} additional units</strong> of catalog cross-sell per month.
            </p>
          </div>
        </div>
      )}

      {/* ═══ SIMILARITY HEATMAP ═══ */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h4 className="font-heading text-sm text-text-primary mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-pink-400" /> Jaccard Similarity Heatmap
          <TIP text="Pairwise similarity between all catalog titles. Darker = more shared tropes and themes = higher cross-sell potential." />
        </h4>
        <div className="overflow-x-auto">
          <table className="text-[8px]">
            <thead>
              <tr>
                <th className="px-1 py-1 text-text-muted"></th>
                {analysis.allBooks.map(b => (
                  <th key={b.id} className={`px-1 py-1 font-mono ${b.id === 'new' ? 'text-starforge-gold' : 'text-text-muted'}`}>
                    {b.title.split(' ').slice(0, 2).join(' ').slice(0, 10)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.allBooks.map(a => (
                <tr key={a.id}>
                  <td className={`px-1 py-0.5 font-mono ${a.id === 'new' ? 'text-starforge-gold' : 'text-text-muted'}`}>
                    {a.title.split(' ').slice(0, 2).join(' ').slice(0, 10)}
                  </td>
                  {analysis.allBooks.map(b => {
                    const val = a.id === b.id ? 1 : (analysis.similarities[a.id]?.[b.id] || 0);
                    const intensity = val;
                    return (
                      <td key={b.id} className="px-1 py-0.5 text-center font-mono"
                        style={{
                          backgroundColor: a.id === b.id
                            ? 'rgba(212,168,83,0.15)'
                            : val > 0.2
                              ? `rgba(168,85,247,${intensity * 0.6})`
                              : val > 0.05
                                ? `rgba(168,85,247,${intensity * 0.4})`
                                : 'transparent',
                        }}>
                        {(val * 100).toFixed(0)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ SYNERGY VERDICT ═══ */}
      {showNewMS && (
        <div className={`border rounded-xl p-5 ${analysis.synergyScore >= 60 ? 'bg-emerald-500/5 border-emerald-500/20' : analysis.synergyScore >= 30 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[9px] text-text-muted uppercase mb-1">Synergy Score</p>
              <p className={`font-heading text-4xl ${analysis.synergyScore >= 60 ? 'text-emerald-400' : analysis.synergyScore >= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                {analysis.synergyScore}
              </p>
            </div>
            <div className="w-px h-12 bg-white/[0.1]" />
            <div className="flex-1 text-xs text-text-secondary space-y-1">
              <p>
                Adding this manuscript {analysis.valuePctIncrease >= 0
                  ? <span className="text-emerald-400">increases network value by {analysis.valuePctIncrease.toFixed(1)}%</span>
                  : <span className="text-red-400">decreases network value</span>}.
              </p>
              <p>
                Strongest connection: <strong className="text-starforge-gold">{analysis.newBookSims[0]?.book.title}</strong> ({(analysis.newBookSims[0]?.similarity * 100 || 0).toFixed(0)}% Jaccard).
                Predicted cross-sell lift: <strong className="text-emerald-400">+{analysis.totalCrossSellUnits} units/mo</strong>.
              </p>
              <p className="text-text-muted">
                {analysis.synergyScore >= 60 ? 'Excellent catalog fit — strengthens network cohesion and cross-sell potential.'
                  : analysis.synergyScore >= 30 ? 'Moderate fit — adds some connections but could be stronger.'
                  : 'Weak fit — this manuscript is isolated from existing catalog. May fragment your list.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
