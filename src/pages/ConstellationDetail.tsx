import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Star, Users, Sparkles } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface Constellation {
    id: string;
    name: string;
    description: string;
    color: string;
    curator: string;
    status: string;
    icon?: string;
}

interface Book {
    id: string;
    title: string;
    author: string;
    cover: string;
    codemark: string;
    synopsis: string;
    price: number;
    constellationId?: string;
    themes?: string[];
    connections?: string[];
}

// ─── Mini Star Map ──────────────────────────────────────────
function MiniStarMap({ books, color }: { books: Book[]; color: string }) {
    const nodes = useMemo(() => {
        const cx = 200, cy = 150;
        return books.map((b, i) => {
            const angle = (i / Math.max(books.length, 1)) * Math.PI * 2 - Math.PI / 2;
            const r = 60 + books.length * 10;
            return {
                id: b.id,
                x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
                y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
                connections: b.connections || [],
            };
        });
    }, [books]);

    const nodeMap = useMemo(() => {
        const m: Record<string, typeof nodes[0]> = {};
        for (const n of nodes) m[n.id] = n;
        return m;
    }, [nodes]);

    const threads = useMemo(() => {
        const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
        const seen = new Set<string>();
        for (const n of nodes) {
            for (const cid of n.connections) {
                const target = nodeMap[cid];
                if (!target) continue;
                const key = [n.id, cid].sort().join('-');
                if (seen.has(key)) continue;
                seen.add(key);
                lines.push({ x1: n.x, y1: n.y, x2: target.x, y2: target.y });
            }
        }
        return lines;
    }, [nodes, nodeMap]);

    return (
        <svg viewBox="0 0 400 300" className="w-full h-full">
            <defs>
                <filter id="mini-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            {threads.map((t, i) => (
                <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={color} strokeWidth="1" opacity="0.3" strokeDasharray="3 6">
                    <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="3s" repeatCount="indefinite" />
                </line>
            ))}
            {nodes.map(n => (
                <g key={n.id}>
                    <circle cx={n.x} cy={n.y} r={12} fill={color} opacity={0.08} />
                    <circle cx={n.x} cy={n.y} r={5} fill={color} filter="url(#mini-glow)" opacity={0.8}>
                        <animate attributeName="r" values="4;6;4" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={n.x} cy={n.y} r={1.5} fill="white" opacity={0.9} />
                </g>
            ))}
        </svg>
    );
}

// Data loaded from Firestore
let _seedConstellations: Record<string, Constellation> = {};
let _seedBooks: Record<string, Book[]> = {};


// ─── Page Component ─────────────────────────────────────────
export default function ConstellationDetail() {
    const { id } = useParams<{ id: string }>();
    const [constellation, setConstellation] = useState<Constellation | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const loadData = async () => {
            try {
                // Try Firestore first
                const constDoc = await getDoc(doc(db, 'constellations', id));
                if (constDoc.exists()) {
                    setConstellation({ id: constDoc.id, ...constDoc.data() } as Constellation);
                    const booksQ = query(collection(db, 'books'), where('constellationId', '==', id));
                    const booksSnap = await getDocs(booksQ);
                    setBooks(booksSnap.docs.map(d => ({ id: d.id, ...d.data() } as Book)));
                } else {
                    // Fallback to seed data
                    const seed = _seedConstellations[id];
                    if (seed) {
                        setConstellation(seed);
                        setBooks(_seedBooks[id] || []);
                    }
                }
            } catch (error) {
                handleFirestoreError(error, OperationType.GET, `constellations/${id}`);
                // Fall back to seed
                const seed = _seedConstellations[id!];
                if (seed) { setConstellation(seed); setBooks(_seedBooks[id!] || []); }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Collect all themes from books
    const allThemes = useMemo(() => {
        const set = new Set<string>();
        for (const b of books) b.themes?.forEach(t => set.add(t));
        return [...set];
    }, [books]);

    if (loading) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center">
                <Star className="w-12 h-12 text-starforge-gold animate-pulse" />
            </div>
        );
    }

    if (!constellation) {
        return (
            <div className="min-h-screen bg-void-black flex flex-col items-center justify-center">
                <h2 className="font-heading text-3xl text-text-primary mb-4">Constellation Not Found</h2>
                <Link to="/" className="text-aurora-teal hover:text-teal-400 font-ui text-sm uppercase tracking-wider flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Return to Runeweave
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void-black">
            {/* Hero Banner */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${constellation.color}15, transparent 70%)` }} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-starforge-gold transition-colors font-ui text-sm uppercase tracking-wider mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to Runeweave
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">{constellation.icon}</span>
                                    <span className="px-3 py-1 rounded-full text-xs font-ui uppercase tracking-wider font-semibold border" style={{ color: constellation.color, borderColor: `${constellation.color}40`, backgroundColor: `${constellation.color}10` }}>
                                        {constellation.status}
                                    </span>
                                </div>
                                <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4" style={{ textShadow: `0 0 30px ${constellation.color}30` }}>
                                    {constellation.name}
                                </h1>
                                <p className="font-body text-lg text-text-secondary leading-relaxed max-w-2xl mb-6">
                                    {constellation.description}
                                </p>
                                <div className="flex items-center gap-6 text-text-muted font-ui text-sm">
                                    <span className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" style={{ color: constellation.color }} />
                                        {books.length} Starpoints
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Users className="w-4 h-4" style={{ color: constellation.color }} />
                                        Curated by {constellation.curator}
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Mini Star Map */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                            className="bg-surface/50 border border-border rounded-sm p-4 backdrop-blur"
                        >
                            <p className="font-ui text-[10px] text-text-muted uppercase tracking-widest mb-2">Constellation Map</p>
                            <MiniStarMap books={books} color={constellation.color} />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Theme Tags */}
            {allThemes.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <div className="flex flex-wrap gap-2">
                        <span className="font-ui text-xs text-text-muted uppercase tracking-wider mr-2 self-center">Themes:</span>
                        {allThemes.map(t => (
                            <span key={t} className="font-mono text-xs px-3 py-1 rounded-full border border-border text-text-secondary bg-surface/60 hover:border-starforge-gold/30 transition-colors">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Book Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <h2 className="font-display text-2xl text-text-primary uppercase tracking-widest mb-8 flex items-center gap-3">
                    <Sparkles className="w-5 h-5" style={{ color: constellation.color }} />
                    Starpoints in this Constellation
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {books.map((book, i) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link
                                to={book.id.startsWith('b') && book.id.length <= 3 ? '#' : `/catalog/${book.id}`}
                                className="group block bg-surface border border-border rounded-sm overflow-hidden hover:border-starforge-gold/30 transition-all hover:shadow-lg"
                                style={{ boxShadow: `0 0 0 0 ${constellation.color}00` }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 4px 30px ${constellation.color}15`)}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 0 0 0 ${constellation.color}00`)}
                            >
                                <div className="aspect-[2/3] overflow-hidden relative">
                                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-void-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="font-ui text-xs text-text-secondary line-clamp-2">{book.synopsis}</p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <span className="font-ui text-[10px] uppercase tracking-wider mb-1 block" style={{ color: constellation.color }}>{book.codemark}</span>
                                    <h3 className="font-heading text-xl text-text-primary group-hover:text-starforge-gold transition-colors">{book.title}</h3>
                                    <p className="font-ui text-sm text-text-secondary">by {book.author}</p>
                                    {book.themes && book.themes.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {book.themes.map(t => (
                                                <span key={t} className="font-mono text-[9px] text-text-muted bg-void-black px-1.5 py-0.5 rounded-sm border border-border">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {books.length === 0 && (
                    <div className="text-center py-20">
                        <Star className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-30" />
                        <p className="font-ui text-text-muted">No starpoints have been placed in this constellation yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
