import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Filter, X, ZoomIn, ZoomOut, Maximize2, Search, BookOpen, Sparkles,
  Heart, Compass, Dna, Quote, Activity, Users, PenTool, BookMarked, Eye,
  ArrowRight, Clock, TrendingUp, Zap
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// ─── Types ─────────────────────────────────────────────────────
interface Book {
  id: string; title: string; author: string; cover: string; codemark: string;
  synopsis: string; price: number; constellationId?: string;
  themes?: string[]; connections?: string[];
}
interface Constellation {
  id: string; name: string; description: string; color: string;
  curator: string; status: string; icon?: string;
}
interface StarNode {
  book: Book; x: number; y: number; radius: number;
  constellation?: Constellation; glowColor: string;
}

// ─── Constellation Color Palette ────────────────────────────────
const CONSTELLATION_COLORS: Record<string, string> = {
  '#d4a853': 'rgba(212,168,83,', '#ec4899': 'rgba(236,72,153,',
  '#2dd4bf': 'rgba(45,212,191,', '#a855f7': 'rgba(168,85,247,',
  '#3b82f6': 'rgba(59,130,246,', '#c45c26': 'rgba(196,92,38,',
  '#8b2635': 'rgba(139,38,53,',  '#f59e0b': 'rgba(245,158,11,',
  '#10b981': 'rgba(16,185,129,', '#6366f1': 'rgba(99,102,241,',
};
function getGlow(hex: string): string {
  return CONSTELLATION_COLORS[hex] || 'rgba(212,168,83,';
}

// ─── Ambient Canvas Starfield ─────────────────────────────────
function StarfieldCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const stars = Array.from({ length: 400 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3, a: Math.random(),
      speed: Math.random() * 0.015 + 0.003, phase: Math.random() * Math.PI * 2,
    }));
    const animate = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const alpha = 0.15 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192,197,206,${alpha})`; ctx.fill();
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none ${className || ''}`} />;
}

// ─── Force-directed Layout ────────────────────────────────────
function layoutStarNodes(books: Book[], constellations: Constellation[], width: number, height: number): StarNode[] {
  const constMap = new Map(constellations.map(c => [c.id, c]));
  const cx = width / 2, cy = height / 2;
  const groups: Record<string, Book[]> = { '__ungrouped__': [] };
  for (const c of constellations) groups[c.id] = [];
  for (const b of books) {
    if (b.constellationId && groups[b.constellationId]) groups[b.constellationId].push(b);
    else groups['__ungrouped__'].push(b);
  }
  const groupIds = Object.keys(groups).filter(k => groups[k].length > 0);
  const nodes: StarNode[] = [];
  const orbitRadius = Math.min(width, height) * 0.32;
  groupIds.forEach((gid, gi) => {
    const angle = (gi / groupIds.length) * Math.PI * 2 - Math.PI / 2;
    const gcx = cx + Math.cos(angle) * orbitRadius;
    const gcy = cy + Math.sin(angle) * orbitRadius;
    const booksInGroup = groups[gid];
    const constellation = gid !== '__ungrouped__' ? constMap.get(gid) : undefined;
    const color = constellation?.color || '#c0c5ce';
    booksInGroup.forEach((book, bi) => {
      const subAngle = (bi / Math.max(booksInGroup.length, 1)) * Math.PI * 2;
      const spread = 30 + booksInGroup.length * 18;
      const jitter = () => (Math.random() - 0.5) * 20;
      nodes.push({
        book, x: gcx + Math.cos(subAngle) * spread + jitter(),
        y: gcy + Math.sin(subAngle) * spread + jitter(),
        radius: 8 + Math.random() * 6, constellation, glowColor: color,
      });
    });
  });
  return nodes;
}

// ─── Expanded Seed Data ───────────────────────────────────────
const SEED_CONSTELLATIONS: Constellation[] = [
  { id: 'c1', name: 'Voices of the Diaspora', description: 'Stories exploring cultural displacement, belonging, and the search for home across worlds.', color: '#d4a853', curator: 'Editorial Team', status: 'Active', icon: '🌍' },
  { id: 'c2', name: 'Queer Futures', description: 'LGBTQ+ speculative fiction imagining worlds beyond binaries.', color: '#ec4899', curator: 'Editorial Team', status: 'Active', icon: '🏳️‍🌈' },
  { id: 'c3', name: 'Ancestral Magic', description: 'Stories rooted in non-European mythologies and magical traditions.', color: '#a855f7', curator: 'Editorial Team', status: 'Active', icon: '✨' },
  { id: 'c4', name: 'Climate Requiem', description: 'Cli-fi and environmental narratives from the edge of tomorrow.', color: '#2dd4bf', curator: 'Editorial Team', status: 'Active', icon: '🌊' },
  { id: 'c5', name: 'Afrofuturism', description: 'Black speculative visions weaving technology, ancestral memory, and liberation.', color: '#f59e0b', curator: 'Editorial Team', status: 'Active', icon: '🚀' },
  { id: 'c6', name: 'Indigenous Futures', description: 'Speculative fiction centering Indigenous sovereignty, knowledge systems, and futurity.', color: '#10b981', curator: 'Editorial Team', status: 'Active', icon: '🌿' },
  { id: 'c7', name: 'Cyberpunk Resistance', description: 'Stories of rebellion against corporate dystopia, surveillance states, and digital oppression.', color: '#6366f1', curator: 'Editorial Team', status: 'Active', icon: '⚡' },
  { id: 'c8', name: 'Mythic Horror', description: 'Horror drawn from folklore, myth, and the uncanny territories of the human psyche.', color: '#8b2635', curator: 'Editorial Team', status: 'Active', icon: '🩸' },
];

const SEED_BOOKS: Book[] = [
  { id: 'b1', title: 'The Obsidian Crown', author: 'Elara Vance', cover: 'https://picsum.photos/seed/obsidian/600/900', codemark: '🗡️ Epic Fantasy', synopsis: 'A disgraced queen must reclaim her stolen throne from a rival who wields ancient, forbidden blood magic.', price: 24.99, constellationId: 'c3', themes: ['power', 'identity', 'mythology'], connections: ['b2', 'b4'] },
  { id: 'b2', title: 'Neon Requiem', author: 'Kai Nakamura', cover: 'https://picsum.photos/seed/neon/600/900', codemark: '⚔️ Speculative Fiction', synopsis: 'In a flooded Tokyo of 2089, a deaf hacker uncovers a conspiracy that links dying coral reefs to corporate AI.', price: 19.99, constellationId: 'c4', themes: ['technology', 'identity', 'environment'], connections: ['b1', 'b3'] },
  { id: 'b3', title: 'Salt & Starlight', author: 'Amara Osei', cover: 'https://picsum.photos/seed/salt/600/900', codemark: '💜 Queer Romance', synopsis: 'Two rival mechanics on a deep-space mining colony find themselves forced to cooperate when their station is sabotaged.', price: 16.99, constellationId: 'c2', themes: ['love', 'survival', 'queerness'], connections: ['b2'] },
  { id: 'b4', title: 'Wound of the World', author: 'Tomás Gutiérrez', cover: 'https://picsum.photos/seed/wound/600/900', codemark: '🌙 Dark Fantasy', synopsis: 'A grief-stricken healer discovers her blood can close the rifts opening between dimensions.', price: 22.99, constellationId: 'c1', themes: ['grief', 'healing', 'diaspora'], connections: ['b1', 'b5'] },
  { id: 'b5', title: 'The Roots Remember', author: 'Priya Sharma', cover: 'https://picsum.photos/seed/roots/600/900', codemark: '✨ Magical Realism', synopsis: 'When an ancient banyan tree begins to speak, a village is forced to confront colonial wounds beneath its soil.', price: 18.99, constellationId: 'c3', themes: ['colonialism', 'nature', 'mythology'], connections: ['b4', 'b6'] },
  { id: 'b6', title: 'Binary Stars', author: 'River Chen', cover: 'https://picsum.photos/seed/binary/600/900', codemark: '💜 Queer Romance', synopsis: 'A non-binary astrophysicist and a trans poet navigate love across parallel timelines.', price: 15.99, constellationId: 'c2', themes: ['love', 'identity', 'science'], connections: ['b3', 'b5'] },
  { id: 'b7', title: 'Sunfall Empire', author: 'Nneka Achebe', cover: 'https://picsum.photos/seed/sunfall/600/900', codemark: '🚀 Afrofuturism', synopsis: 'On a terraformed Mars, a griot must sing the old songs to prevent the colony\'s AI overseer from erasing their history.', price: 21.99, constellationId: 'c5', themes: ['memory', 'technology', 'liberation'], connections: ['b8', 'b1'] },
  { id: 'b8', title: 'The Dreamline Protocol', author: 'Jarli Yunupingu', cover: 'https://picsum.photos/seed/dreamline/600/900', codemark: '🌿 Indigenous Futurism', synopsis: 'A Yolŋu data-weaver discovers that the songlines are living algorithms—and someone is hacking them.', price: 20.99, constellationId: 'c6', themes: ['sovereignty', 'knowledge', 'connection'], connections: ['b7', 'b9'] },
  { id: 'b9', title: 'Chrome Meridian', author: 'Zahra Kalil', cover: 'https://picsum.photos/seed/chrome/600/900', codemark: '⚡ Cyberpunk', synopsis: 'A street surgeon and a rogue AI broker join forces to expose a megacorp\'s mind-control implant program.', price: 18.99, constellationId: 'c7', themes: ['resistance', 'freedom', 'augmentation'], connections: ['b8', 'b10'] },
  { id: 'b10', title: 'The Bone Garden', author: 'Inés Morales', cover: 'https://picsum.photos/seed/bonegarden/600/900', codemark: '🩸 Horror', synopsis: 'In 1920s Oaxaca, a curandera discovers that the spirits of the dead are not resting—they are organizing.', price: 17.99, constellationId: 'c8', themes: ['folklore', 'death', 'resistance'], connections: ['b9', 'b4'] },
  { id: 'b11', title: 'Tidewalker', author: 'Moana Tui', cover: 'https://picsum.photos/seed/tidewalker/600/900', codemark: '🌊 Climate Fiction', synopsis: 'A Pacific Islander navigator uses ancestral wayfinding to guide climate refugees across a drowned ocean.', price: 19.99, constellationId: 'c4', themes: ['climate', 'navigation', 'survival'], connections: ['b2', 'b8'] },
  { id: 'b12', title: 'Gilded Ghosts', author: 'Kofi Mensah', cover: 'https://picsum.photos/seed/gilded/600/900', codemark: '🚀 Afrofuturism', synopsis: 'The ghosts of enslaved ancestors haunt a luxury space station, demanding the living fulfill an ancient pact.', price: 23.99, constellationId: 'c5', themes: ['legacy', 'justice', 'haunting'], connections: ['b7', 'b10'] },
];

// ─── Activity Feed Data ───────────────────────────────────────
const ACTIVITY_FEED = [
  { text: 'Nneka Achebe submitted Chapter 18 of "Sunfall Empire"', icon: PenTool, time: '12 min ago', color: '#f59e0b' },
  { text: 'Queer Futures constellation gained a new star', icon: Sparkles, time: '1 hr ago', color: '#ec4899' },
  { text: '4 beta readers are reviewing "Chrome Meridian" right now', icon: Eye, time: '2 hrs ago', color: '#6366f1' },
  { text: 'River Chen\'s "Binary Stars" hit 500 pre-orders', icon: TrendingUp, time: '3 hrs ago', color: '#2dd4bf' },
  { text: 'New manuscript entered the Indigenous Futures constellation', icon: Star, time: '5 hrs ago', color: '#10b981' },
  { text: 'Inés Morales joined the Mythic Horror constellation', icon: Users, time: '6 hrs ago', color: '#8b2635' },
  { text: '"The Dreamline Protocol" completed beta reading round 2', icon: BookMarked, time: '8 hrs ago', color: '#10b981' },
];

// ─── Pull Quotes ──────────────────────────────────────────────
const PULL_QUOTES = [
  { quote: 'The stars don\'t forget. They hold every name that was ever stolen, waiting for the right voice to call them back.', book: SEED_BOOKS[6], constellation: SEED_CONSTELLATIONS[4] },
  { quote: 'She pressed her palm to the rift and felt the wound of the world pulse like a second heartbeat—ancient, furious, alive.', book: SEED_BOOKS[3], constellation: SEED_CONSTELLATIONS[0] },
  { quote: 'In the silence between heartbeats, the coral sang. And the hacker, for the first time in her life, listened.', book: SEED_BOOKS[1], constellation: SEED_CONSTELLATIONS[3] },
  { quote: 'Love is not a timeline. It is the space between them—the breath before the universe decides which version of us gets to stay.', book: SEED_BOOKS[5], constellation: SEED_CONSTELLATIONS[1] },
];

// ─── Main Component ──────────────────────────────────────────
export default function Runeweave() {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedNode, setSelectedNode] = useState<StarNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<StarNode | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeConstellation, setActiveConstellation] = useState<string | null>(null);
  const [activeCodemark, setActiveCodemark] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);

  // Pan & Zoom
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panMoved, setPanMoved] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, vx: 0, vy: 0 });

  // Load data
  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'books'), (snap) => {
      setBooks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Book)));
      setLoading(false);
    });
    const unsub2 = onSnapshot(collection(db, 'constellations'), (snap) => {
      setConstellations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Constellation)));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  // Entrance animation timer
  useEffect(() => { const t = setTimeout(() => setEntranceComplete(true), 3000); return () => clearTimeout(t); }, []);

  // Rotating quote
  useEffect(() => { const t = setInterval(() => setQuoteIndex(i => (i + 1) % PULL_QUOTES.length), 8000); return () => clearInterval(t); }, []);

  // Activity feed rotation
  useEffect(() => { const t = setInterval(() => setActivityIndex(i => (i + 1) % ACTIVITY_FEED.length), 4000); return () => clearInterval(t); }, []);

  const displayConstellations = constellations.length > 0 ? constellations : SEED_CONSTELLATIONS;
  const seedBooks = books.length > 0 ? books : SEED_BOOKS;

  const displayNodes = useMemo(() => {
    const allNodes = layoutStarNodes(seedBooks, displayConstellations, 1200, 800);
    return allNodes.filter(n => {
      if (activeConstellation && n.book.constellationId !== activeConstellation) return false;
      if (activeCodemark && n.book.codemark !== activeCodemark) return false;
      if (searchTerm && !n.book.title.toLowerCase().includes(searchTerm.toLowerCase()) && !n.book.author.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [seedBooks, displayConstellations, activeConstellation, activeCodemark, searchTerm]);

  const displayNodeMap = useMemo(() => {
    const m: Record<string, StarNode> = {};
    for (const n of displayNodes) m[n.book.id] = n;
    return m;
  }, [displayNodes]);

  const displayThreads = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    const seen = new Set<string>();
    for (const n of displayNodes) {
      if (!n.book.connections) continue;
      for (const cid of n.book.connections) {
        const target = displayNodeMap[cid]; if (!target) continue;
        const key = [n.book.id, cid].sort().join('-');
        if (seen.has(key)) continue; seen.add(key);
        lines.push({ x1: n.x, y1: n.y, x2: target.x, y2: target.y, color: n.glowColor });
      }
    }
    return lines;
  }, [displayNodes, displayNodeMap]);

  const displayCodemarks = useMemo(() => [...new Set(seedBooks.map(b => b.codemark))], [seedBooks]);

  // Zoom
  const zoom = (factor: number) => {
    setViewBox(v => {
      const nw = v.w * factor, nh = v.h * factor;
      return { x: v.x + (v.w - nw) / 2, y: v.y + (v.h - nh) / 2, w: nw, h: nh };
    });
  };
  const resetView = () => setViewBox({ x: 0, y: 0, w: 1200, h: 800 });

  // Pan handlers — track whether mouse actually moved to distinguish click from drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsPanning(true); setPanMoved(false);
    setPanStart({ x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y });
  }, [viewBox]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.x, dy = e.clientY - panStart.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setPanMoved(true);
    const svg = svgRef.current; if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width, scaleY = viewBox.h / rect.height;
    setViewBox(v => ({ ...v, x: panStart.vx - dx * scaleX, y: panStart.vy - dy * scaleY }));
  }, [isPanning, panStart, viewBox.w, viewBox.h]);

  const handlePointerUp = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault(); zoom(e.deltaY > 0 ? 1.1 : 0.9);
  }, []);

  // Click on star — only if we didn't pan
  const handleStarClick = useCallback((node: StarNode) => {
    if (panMoved) return;
    setSelectedNode(prev => prev?.book.id === node.book.id ? null : node);
  }, [panMoved]);

  // Click on SVG background — deselect
  const handleBgClick = useCallback(() => {
    if (!panMoved) setSelectedNode(null);
  }, [panMoved]);

  // The active tooltip node (selected takes priority over hovered)
  const activeNode = selectedNode || hoveredNode;

  // Featured constellation (rotate weekly — use day of year)
  const featuredIdx = Math.floor(Date.now() / (7 * 86400000)) % displayConstellations.length;
  const featuredConstellation = displayConstellations[featuredIdx];
  const featuredBooks = seedBooks.filter(b => b.constellationId === featuredConstellation?.id);

  const currentQuote = PULL_QUOTES[quoteIndex];

  if (loading && books.length === 0) {
    return (
      <div className="min-h-screen bg-void-black flex flex-col items-center justify-center">
        <StarfieldCanvas />
        <Star className="w-16 h-16 text-starforge-gold animate-pulse relative z-10" />
        <p className="font-display text-xl text-starforge-gold mt-6 uppercase tracking-[0.3em] relative z-10">Weaving the Stars...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-black relative" ref={containerRef}>
      <StarfieldCanvas />

      {/* ═══ Seasonal Transmission Banner ═══ */}
      <div className="relative z-20 bg-gradient-to-r from-starforge-gold/10 via-cosmic-purple/10 to-starforge-gold/10 border-b border-starforge-gold/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3 text-center">
          <Zap className="w-4 h-4 text-starforge-gold flex-shrink-0" />
          <p className="font-ui text-xs tracking-widest uppercase text-starforge-gold">
            Spring 2026 Forgings — 4 new manuscripts entering the Runeweave
          </p>
          <span className="font-mono text-[10px] text-starforge-gold/60 hidden sm:inline">◆</span>
          <Link to="/catalog" className="font-ui text-xs text-starforge-gold/80 hover:text-white underline underline-offset-2 decoration-starforge-gold/30 transition-colors hidden sm:inline">
            Preview Now
          </Link>
        </div>
      </div>

      {/* ═══ "What's Forging" Live Activity Ticker ═══ */}
      <div className="relative z-20 bg-surface/40 backdrop-blur-sm border-b border-border/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Activity className="w-3 h-3 text-starforge-gold" />
            <span className="font-mono text-[10px] text-starforge-gold uppercase tracking-wider">Live</span>
          </div>
          <div className="h-3 w-px bg-border flex-shrink-0" />
          <AnimatePresence mode="wait">
            <motion.div key={activityIndex}
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 overflow-hidden min-w-0"
            >
              {(() => { const item = ACTIVITY_FEED[activityIndex]; const Icon = item.icon; return (
                <>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: item.color }} />
                  <span className="font-ui text-xs text-text-secondary truncate">{item.text}</span>
                  <span className="font-mono text-[10px] text-text-muted flex-shrink-0">{item.time}</span>
                </>
              ); })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ Header ═══ */}
      <div className="relative z-20 text-center pt-12 pb-6 pointer-events-none">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-7xl text-text-primary uppercase tracking-[0.2em] mb-3">
          The <span className="text-starforge-gold italic font-heading normal-case tracking-normal">Runeweave</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="font-ui text-text-secondary text-sm tracking-widest uppercase">
          An interconnected star map of stories • Click a star to explore
        </motion.p>
      </div>

      {/* ═══ Constellation Legend ═══ */}
      <div className="relative z-20 flex flex-wrap justify-center gap-2 px-4 pb-4">
        {displayConstellations.map(c => (
          <button key={c.id} onClick={() => setActiveConstellation(activeConstellation === c.id ? null : c.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-ui transition-all ${activeConstellation === c.id
              ? 'border-white bg-white/10 text-white' : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/30'}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
            {c.icon || '⭐'} {c.name}
          </button>
        ))}
      </div>

      {/* ═══ SVG Star Map ═══ */}
      <div className="relative z-10 mx-auto" style={{ maxWidth: '100vw', height: 'calc(100vh - 320px)', minHeight: '500px' }}>
        <svg ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
          onWheel={handleWheel} onClick={handleBgClick}
          style={{ touchAction: 'none' }}>
          <defs>
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Constellation boundaries */}
          {displayConstellations.map(c => {
            const cNodes = displayNodes.filter(n => n.book.constellationId === c.id);
            if (cNodes.length < 2) return null;
            const avgX = cNodes.reduce((s, n) => s + n.x, 0) / cNodes.length;
            const avgY = cNodes.reduce((s, n) => s + n.y, 0) / cNodes.length;
            const maxDist = Math.max(...cNodes.map(n => Math.hypot(n.x - avgX, n.y - avgY))) + 60;
            return (
              <g key={c.id}>
                <circle cx={avgX} cy={avgY} r={maxDist} fill="none" stroke={c.color} strokeWidth="0.5" strokeDasharray="4 8" opacity={entranceComplete ? 0.3 : 0}>
                  <animate attributeName="opacity" from="0" to="0.3" dur="1.5s" begin="1.5s" fill="freeze" />
                </circle>
                <text x={avgX} y={avgY - maxDist - 10} textAnchor="middle" fill={c.color} fontSize="11" fontFamily="Inter, sans-serif" opacity="0.6" className="uppercase" letterSpacing="2">
                  {c.icon} {c.name}
                </text>
              </g>
            );
          })}

          {/* Thread lines — animate in */}
          {displayThreads.map((t, i) => (
            <g key={`thread-${i}`}>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.color} strokeWidth="1" opacity="0.15">
                <animate attributeName="opacity" from="0" to="0.15" dur="0.8s" begin={`${1.8 + i * 0.1}s`} fill="freeze" />
              </line>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.color} strokeWidth="0.5" opacity="0.4" strokeDasharray="3 6">
                <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="3s" repeatCount="indefinite" />
              </line>
            </g>
          ))}

          {/* Star points — bigger invisible hit area fixes the hover bug */}
          {displayNodes.map((node, ni) => {
            const isSelected = selectedNode?.book.id === node.book.id;
            const isHovered = hoveredNode?.book.id === node.book.id;
            const isActive = isSelected || isHovered;
            const isConnected = activeNode?.book.connections?.includes(node.book.id);
            const glow = getGlow(node.glowColor);
            return (
              <g key={node.book.id} className="cursor-pointer"
                onPointerEnter={() => !selectedNode && setHoveredNode(node)}
                onPointerLeave={() => !selectedNode && setHoveredNode(null)}
                onClick={(e) => { e.stopPropagation(); handleStarClick(node); }}>
                {/* Invisible large hit area — fixes the "slight mouse move" bug */}
                <circle cx={node.x} cy={node.y} r={node.radius * 4} fill="transparent" />
                {/* Outer glow */}
                <circle cx={node.x} cy={node.y} r={node.radius * (isActive ? 3 : 2)}
                  fill={`${glow}${isActive ? '0.15' : '0.05'})`}
                  style={{ transition: 'all 0.3s ease' }}>
                  {/* Entrance animation */}
                  <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin={`${0.3 + ni * 0.08}s`} fill="freeze" />
                </circle>
                {/* Core star */}
                <circle cx={node.x} cy={node.y} r={node.radius * (isActive ? 1.5 : 1)}
                  fill={isActive || isConnected ? node.glowColor : `${glow}0.7)`}
                  filter={isActive ? 'url(#glow-strong)' : 'url(#glow-gold)'}
                  style={{ transition: 'all 0.3s ease' }}>
                  <animate attributeName="r" values={`${node.radius * 0.9};${node.radius * 1.1};${node.radius * 0.9}`} dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" />
                </circle>
                {/* Inner bright point */}
                <circle cx={node.x} cy={node.y} r={node.radius * 0.3} fill="white" opacity={isActive ? 1 : 0.8} />
              </g>
            );
          })}
        </svg>

        {/* ═══ Tooltip Panel — persistent on click, shows on hover ═══ */}
        <AnimatePresence>
          {activeNode && (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute z-50 left-6 bottom-6 sm:left-8 sm:bottom-8 pointer-events-auto"
              style={{ maxWidth: '340px' }}>
              <div className="bg-deep-space/95 backdrop-blur-xl border border-border rounded-lg p-5 shadow-2xl">
                {selectedNode && (
                  <button onClick={() => setSelectedNode(null)} className="absolute top-3 right-3 text-text-muted hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-start gap-4">
                  <img src={activeNode.book.cover} alt="" className="w-16 h-24 object-cover rounded border border-border flex-shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <span className="font-ui text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1"
                      style={{ color: activeNode.glowColor, backgroundColor: `${getGlow(activeNode.glowColor)}0.1)` }}>
                      {activeNode.book.codemark}
                    </span>
                    <h3 className="font-heading text-lg text-text-primary leading-tight">{activeNode.book.title}</h3>
                    <p className="font-ui text-xs text-text-secondary">by {activeNode.book.author}</p>
                    {activeNode.constellation && (
                      <p className="font-ui text-[10px] mt-1.5 flex items-center gap-1" style={{ color: activeNode.glowColor }}>
                        <Sparkles className="w-3 h-3" /> {activeNode.constellation.name}
                      </p>
                    )}
                    {activeNode.book.themes && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {activeNode.book.themes.map(t => (
                          <span key={t} className="font-mono text-[9px] text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">{t}</span>
                        ))}
                      </div>
                    )}
                    {selectedNode && (
                      <p className="font-ui text-xs text-text-secondary mt-3 leading-relaxed">{activeNode.book.synopsis}</p>
                    )}
                    {selectedNode && !activeNode.book.id.match(/^b\d+$/) && (
                      <Link to={`/catalog/${activeNode.book.id}`}
                        className="inline-flex items-center gap-1.5 mt-3 font-ui text-xs text-starforge-gold hover:text-white transition-colors">
                        Read More <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Zoom/Filter Controls ═══ */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
        {[
          { action: () => zoom(0.8), icon: ZoomIn },
          { action: () => zoom(1.2), icon: ZoomOut },
          { action: resetView, icon: Maximize2 },
          { action: () => setFilterOpen(!filterOpen), icon: Filter },
        ].map(({ action, icon: Icon }, i) => (
          <button key={i} onClick={action}
            className="w-10 h-10 bg-surface/80 backdrop-blur border border-border rounded-lg flex items-center justify-center text-text-secondary hover:text-starforge-gold hover:border-starforge-gold/50 transition-colors">
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* ═══ Filter Panel ═══ */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
            className="fixed top-20 right-0 bottom-0 w-80 z-30 bg-deep-space/95 backdrop-blur-lg border-l border-border p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg text-text-primary uppercase tracking-widest">Filters</h3>
              <button onClick={() => setFilterOpen(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-6">
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-2">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Book or author..."
                  className="w-full bg-void-black border border-border rounded-md pl-10 pr-4 py-2 text-text-primary font-ui text-sm focus:border-starforge-gold outline-none" />
              </div>
            </div>
            <div className="mb-6">
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-2">Constellation</label>
              <div className="space-y-1">
                <button onClick={() => setActiveConstellation(null)}
                  className={`w-full text-left px-3 py-2 rounded-md font-ui text-sm transition-colors ${!activeConstellation ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:text-text-primary'}`}>
                  All Constellations
                </button>
                {displayConstellations.map(c => (
                  <button key={c.id} onClick={() => setActiveConstellation(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-md font-ui text-sm flex items-center gap-2 transition-colors ${activeConstellation === c.id ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:text-text-primary'}`}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} /> {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-2">Codemark</label>
              <div className="space-y-1">
                <button onClick={() => setActiveCodemark(null)}
                  className={`w-full text-left px-3 py-2 rounded-md font-ui text-sm transition-colors ${!activeCodemark ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:text-text-primary'}`}>
                  All Genres
                </button>
                {displayCodemarks.map(cm => (
                  <button key={cm} onClick={() => setActiveCodemark(cm)}
                    className={`w-full text-left px-3 py-2 rounded-md font-ui text-sm transition-colors ${activeCodemark === cm ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:text-text-primary'}`}>
                    {cm}
                  </button>
                ))}
              </div>
            </div>
            {(activeConstellation || activeCodemark || searchTerm) && (
              <button onClick={() => { setActiveConstellation(null); setActiveCodemark(null); setSearchTerm(''); }}
                className="w-full py-2 border border-border text-text-secondary font-ui text-sm uppercase tracking-wider rounded-md hover:border-starforge-gold hover:text-starforge-gold transition-colors">
                Clear All Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
           SECTIONS BELOW THE STAR MAP
           ═══════════════════════════════════════════════════════════ */}

      {/* ── Pull Quote ── */}
      <section className="relative z-20 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-void-black via-cosmic-purple/5 to-void-black" />
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div key={quoteIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }} className="text-center">
              <Quote className="w-8 h-8 text-starforge-gold/30 mx-auto mb-6" />
              <blockquote className="font-heading text-2xl md:text-3xl text-text-primary leading-relaxed mb-6 italic">
                "{currentQuote.quote}"
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <img src={currentQuote.book.cover} alt="" className="w-8 h-12 object-cover rounded border border-border" referrerPolicy="no-referrer" />
                <div className="text-left">
                  <p className="font-ui text-sm text-text-primary">{currentQuote.book.title}</p>
                  <p className="font-ui text-xs text-text-secondary">by {currentQuote.book.author}</p>
                </div>
                <span className="w-1.5 h-1.5 rounded-full mx-2" style={{ backgroundColor: currentQuote.constellation.color }} />
                <span className="font-ui text-[10px] uppercase tracking-wider" style={{ color: currentQuote.constellation.color }}>
                  {currentQuote.constellation.icon} {currentQuote.constellation.name}
                </span>
              </div>
              {/* Quote progress dots */}
              <div className="flex justify-center gap-2 mt-6">
                {PULL_QUOTES.map((_, i) => (
                  <button key={i} onClick={() => setQuoteIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === quoteIndex ? 'bg-starforge-gold w-4' : 'bg-text-muted/30 hover:bg-text-muted'}`} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Featured Constellation Spotlight ── */}
      {featuredConstellation && (
        <section className="relative z-20 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-4 h-4 text-starforge-gold" />
              <span className="font-mono text-[10px] text-starforge-gold uppercase tracking-widest">This Week's Spotlight</span>
            </div>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-3xl md:text-4xl text-text-primary uppercase tracking-wider mb-2">
                  {featuredConstellation.icon} {featuredConstellation.name}
                </h2>
                <p className="font-ui text-text-secondary text-base leading-relaxed mb-6 max-w-xl">{featuredConstellation.description}</p>
                <Link to={`/?c=${featuredConstellation.id}`}
                  className="inline-flex items-center gap-2 font-ui text-sm text-starforge-gold hover:text-white transition-colors border border-starforge-gold/30 px-4 py-2 rounded-md hover:border-starforge-gold">
                  <Sparkles className="w-4 h-4" /> Explore this Constellation <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {featuredBooks.slice(0, 3).map(book => (
                  <div key={book.id} className="flex-shrink-0 w-40 group">
                    <div className="relative overflow-hidden rounded-lg border border-border mb-2">
                      <img src={book.cover} alt={book.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-void-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="font-heading text-sm text-white leading-tight">{book.title}</p>
                        <p className="font-ui text-[10px] text-text-secondary">{book.author}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Reader's Gateway ── */}
      <section className="relative z-20 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl text-text-primary uppercase tracking-wider text-center mb-3">Begin Your Journey</h2>
          <p className="font-ui text-sm text-text-secondary text-center mb-10">Three paths into the Runeweave — choose yours</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Find Your Next Obsession', desc: 'Tell us your mood and we\'ll match you to the perfect story.', path: '/mood-matcher', gradient: 'from-pink-500/20 to-purple-600/20', accent: '#ec4899' },
              { icon: Dna, title: 'Discover Your Book DNA', desc: 'Uncover the hidden patterns in your reading taste.', path: '/book-dna', gradient: 'from-emerald-500/20 to-teal-600/20', accent: '#2dd4bf' },
              { icon: Compass, title: 'Start a Journey', desc: 'Curated reading paths through interconnected story worlds.', path: '/journeys', gradient: 'from-amber-500/20 to-orange-600/20', accent: '#d4a853' },
            ].map(card => {
              const Icon = card.icon;
              return (
                <Link key={card.path} to={card.path}
                  className={`group relative bg-gradient-to-br ${card.gradient} border border-white/10 rounded-xl p-6 hover:border-white/25 transition-all duration-300 hover:-translate-y-1`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${card.accent}15` }}>
                    <Icon className="w-6 h-6" style={{ color: card.accent }} />
                  </div>
                  <h3 className="font-heading text-lg text-text-primary mb-2">{card.title}</h3>
                  <p className="font-ui text-sm text-text-secondary leading-relaxed mb-4">{card.desc}</p>
                  <span className="inline-flex items-center gap-1 font-ui text-xs uppercase tracking-wider group-hover:gap-2 transition-all" style={{ color: card.accent }}>
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <div className="relative z-20 text-center pb-16 pt-4">
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/catalog" className="flex items-center gap-2 px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-widest rounded-md hover:bg-yellow-500 transition-colors">
            <BookOpen className="w-4 h-4" /> Browse Catalog
          </Link>
          <Link to="/submissions" className="flex items-center gap-2 px-6 py-3 border border-border text-text-primary font-ui text-sm uppercase tracking-widest rounded-md hover:border-starforge-gold hover:text-starforge-gold transition-colors">
            <Star className="w-4 h-4" /> Inscribe Your Story
          </Link>
        </div>
      </div>
    </div>
  );
}
