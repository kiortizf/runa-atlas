import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';
import {
    Dna, BookOpen, Star, TrendingUp, Heart, Eye, Skull,
    Feather, Mountain, Zap, Flame, Shield, Moon, Sun,
    Users, BarChart3, Sparkles, ChevronRight, Target,
    Award, Clock, Bookmark, ArrowRight
} from 'lucide-react';
import AuthGatedCTA from '../components/AuthGatedCTA';

// ═══════════════════════════════════════════
// BOOK DNA — Your Taste Profile
// ═══════════════════════════════════════════

interface TasteAxis {
    id: string;
    label: string;
    value: number;        // 0–100
    leftLabel: string;
    rightLabel: string;
    icon: any;
    color: string;
}

interface RecentBook {
    title: string;
    author: string;
    rating: number;
    dnaImpact: string;
    cover: string;
}

const TASTE_AXES: TasteAxis[] = [
    { id: 'darkness', label: 'Tone', value: 0, leftLabel: 'Light', rightLabel: 'Dark', icon: Moon, color: '#a78bfa' },
    { id: 'pacing', label: 'Pacing', value: 0, leftLabel: 'Slow Burn', rightLabel: 'Breakneck', icon: Zap, color: '#f97316' },
    { id: 'worldbuilding', label: 'Worldbuilding', value: 0, leftLabel: 'Minimal', rightLabel: 'Immersive', icon: Mountain, color: '#10b981' },
    { id: 'character', label: 'Focus', value: 0, leftLabel: 'Plot-Driven', rightLabel: 'Character-Driven', icon: Users, color: '#3b82f6' },
    { id: 'prose', label: 'Prose Style', value: 0, leftLabel: 'Clean', rightLabel: 'Lyrical', icon: Feather, color: '#8b5cf6' },
    { id: 'romance', label: 'Romance Heat', value: 0, leftLabel: 'None', rightLabel: 'Central', icon: Heart, color: '#f43f5e' },
    { id: 'morality', label: 'Moral Ambiguity', value: 0, leftLabel: 'Clear-Cut', rightLabel: 'Morally Grey', icon: Shield, color: '#6b7280' },
    { id: 'intensity', label: 'Intensity', value: 0, leftLabel: 'Cozy', rightLabel: 'Visceral', icon: Flame, color: '#ef4444' },
];

// ═══ SVG Radar Chart ═══
function RadarChart({ axes }: { axes: TasteAxis[] }) {
    const cx = 150, cy = 150, r = 120;
    const n = axes.length;
    const angleStep = (2 * Math.PI) / n;

    const getPoint = (index: number, value: number) => {
        const angle = angleStep * index - Math.PI / 2;
        const dist = (value / 100) * r;
        return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
    };

    const gridLevels = [25, 50, 75, 100];
    const dataPoints = axes.map((a, i) => getPoint(i, a.value));
    const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

    return (
        <svg viewBox="0 0 300 300" className="w-full max-w-[300px]">
            {/* Grid */}
            {gridLevels.map(level => {
                const pts = axes.map((_, i) => getPoint(i, level));
                const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
                return <path key={level} d={d} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
            })}

            {/* Axis lines */}
            {axes.map((_, i) => {
                const pt = getPoint(i, 100);
                return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
            })}

            {/* Data polygon */}
            <motion.path
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                d={pathD}
                fill="rgba(45,212,191,0.12)"
                stroke="rgba(45,212,191,0.6)"
                strokeWidth="2"
                style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* Data points */}
            {dataPoints.map((p, i) => (
                <motion.circle key={i}
                    initial={{ r: 0 }} animate={{ r: 4 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    cx={p.x} cy={p.y}
                    fill={axes[i].color} stroke="rgba(10,10,26,0.8)" strokeWidth="2"
                />
            ))}

            {/* Labels */}
            {axes.map((axis, i) => {
                const pt = getPoint(i, 115);
                return (
                    <text key={i} x={pt.x} y={pt.y}
                        textAnchor="middle" dominantBaseline="middle"
                        fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="inherit">
                        {axis.label}
                    </text>
                );
            })}
        </svg>
    );
}

export default function BookDNA() {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<'overview' | 'axes' | 'evolution'>('overview');
    const [dnaProfile, setDnaProfile] = useState<any>(null);
    const [genreAffinity, setGenreAffinity] = useState<any[]>([]);
    const [recentBooks, setRecentBooks] = useState<RecentBook[]>([]);
    const [similarReaders, setSimilarReaders] = useState<any[]>([]);
    const [authorMatches, setAuthorMatches] = useState<any[]>([]);
    const [tasteAxes, setTasteAxes] = useState<TasteAxis[]>(TASTE_AXES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (u) => {
            if (!u) { setLoading(false); return; }
            const unsub = onSnapshot(
                doc(db, 'users', u.uid),
                (snap) => {
                    if (snap.exists()) {
                        const data = snap.data();
                        if (data.readingDna) {
                            if (data.readingDna.profile) setDnaProfile(data.readingDna.profile);
                            if (data.readingDna.genreAffinity) setGenreAffinity(data.readingDna.genreAffinity);
                            if (data.readingDna.recentBooks) setRecentBooks(data.readingDna.recentBooks);
                            if (data.readingDna.similarReaders) setSimilarReaders(data.readingDna.similarReaders);
                            if (data.readingDna.authorMatches) setAuthorMatches(data.readingDna.authorMatches);
                            if (data.readingDna.tasteAxes) setTasteAxes(data.readingDna.tasteAxes);
                        }
                    }
                    setLoading(false);
                },
                () => setLoading(false)
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const hasData = dnaProfile !== null || genreAffinity.length > 0 || recentBooks.length > 0;

    // State 1: Not logged in → full-page CTA
    if (!loading && !user) {
        return (
            <div className="min-h-screen bg-void-black text-white">
                <AuthGatedCTA
                    icon={Dna}
                    title="Your Reading Identity, Decoded"
                    subtitle="Book DNA builds a unique taste profile from every book you read and rate. Discover your reading personality, genre affinities, and find authors who match your vibe."
                    ctaText="Sign In to Build Your DNA"
                    accentColor="violet"
                />
            </div>
        );
    }

    // State 2: Logged in but no data → encouraging CTA
    if (!loading && user && !hasData) {
        return (
            <div className="min-h-screen bg-void-black text-white">
                <AuthGatedCTA
                    icon={Dna}
                    title="Your DNA Is Waiting"
                    subtitle="Start reading and rating books to build your unique taste profile. The more you read, the sharper your DNA becomes — revealing your reading personality, genre affinities, and compatible authors."
                    ctaText="Browse the Catalog"
                    ctaLink="/catalog"
                    accentColor="violet"
                >
                    <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-violet-400" /> Read books</span>
                        <span className="text-white/10">→</span>
                        <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-violet-400" /> Rate them</span>
                        <span className="text-white/10">→</span>
                        <span className="flex items-center gap-1.5"><Dna className="w-3.5 h-3.5 text-violet-400" /> DNA unlocks</span>
                    </div>
                </AuthGatedCTA>
            </div>
        );
    }

    // State 3: Logged in with data → full experience
    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <Dna className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                                    Book DNA
                                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded border border-violet-500/20">
                                        {dnaProfile?.booksAnalyzed ?? 0} books analyzed
                                    </span>
                                </h1>
                                <p className="text-xs text-text-secondary">Your reading identity, visualized. Updated {dnaProfile?.lastUpdated ?? '—'}.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-text-secondary">Profile Strength:</span>
                            <div className="w-24 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${dnaProfile?.genomeStrength ?? 0}%` }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                    className="h-full bg-violet-400 rounded-full" />
                            </div>
                            <span className="text-violet-400 font-semibold">{dnaProfile?.genomeStrength ?? 0}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Personality Badge */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-10 p-6 bg-gradient-to-r from-violet-500/[0.06] to-transparent border border-violet-500/10 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-violet-400/60 mb-1">Your Reading Personality</p>
                            <h2 className="text-2xl font-display text-white tracking-wide">{dnaProfile?.personality ?? 'Loading...'}</h2>
                            <div className="flex gap-2 mt-2">
                                {(dnaProfile?.topTraits ?? []).map(t => (
                                    <span key={t} className="text-[9px] px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-text-secondary">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-violet-500/10 text-violet-400 text-xs border border-violet-500/20 rounded hover:bg-violet-500/20 transition-colors">
                        Share DNA
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ═══ Left Column: Radar Chart ═══ */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-semibold">Taste Genome</h3>
                            <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-center">
                                <RadarChart axes={tasteAxes} />
                            </div>

                            {/* Quick legend */}
                            <div className="mt-4 space-y-2">
                                {tasteAxes.map(axis => {
                                    const Icon = axis.icon;
                                    return (
                                        <div key={axis.id} className="flex items-center gap-3">
                                            <Icon className="w-3.5 h-3.5 flex-none" style={{ color: axis.color }} />
                                            <span className="text-xs text-text-secondary w-20 flex-none">{axis.label}</span>
                                            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${axis.value}%` }}
                                                    transition={{ duration: 0.8, delay: 0.2 }}
                                                    className="h-full rounded-full" style={{ backgroundColor: axis.color }} />
                                            </div>
                                            <span className="text-xs text-white font-semibold w-8 text-right">{axis.value}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ═══ Right Column: Details ═══ */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Genre Affinity */}
                        <div>
                            <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-semibold">Genre Affinity</h3>
                            <div className="space-y-3">
                                {genreAffinity.map((g, idx) => (
                                    <motion.div key={g.genre} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                        <span className="text-2xl font-display text-white/15 w-8">{idx + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-white font-medium">{g.genre}</span>
                                                <span className="text-xs text-text-secondary">{g.books} books</span>
                                            </div>
                                            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${g.affinity}%` }}
                                                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                                                    className="h-full bg-violet-400 rounded-full" />
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-violet-400">{g.affinity}%</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Author Matches */}
                        <div>
                            <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-semibold">Author DNA Matches</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {authorMatches.map((author, idx) => (
                                    <motion.div key={author.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-violet-500/20 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{author.avatar}</span>
                                            <div>
                                                <p className="text-sm text-white font-medium group-hover:text-violet-400 transition-colors">{author.name}</p>
                                                <p className="text-[10px] text-text-secondary">{author.genre}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                <div className="h-full bg-violet-400 rounded-full" style={{ width: `${author.match}%` }} />
                                            </div>
                                            <span className={`text-xs font-semibold ${author.match >= 90 ? 'text-emerald-400' : author.match >= 80 ? 'text-violet-400' : 'text-text-secondary'}`}>
                                                {author.match}%
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Similar Readers */}
                        <div>
                            <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-semibold">Readers With Similar DNA</h3>
                            <div className="space-y-2">
                                {similarReaders.map((reader, idx) => (
                                    <motion.div key={reader.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 + idx * 0.1 }}
                                        className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-violet-500/20 transition-colors cursor-pointer">
                                        <span className="text-xl">{reader.avatar}</span>
                                        <div className="flex-1">
                                            <p className="text-sm text-white font-medium">{reader.name}</p>
                                            <p className="text-[10px] text-text-secondary">{reader.sharedBooks} shared books</p>
                                        </div>
                                        <span className="text-sm font-semibold text-violet-400">{reader.match}% match</span>
                                        <ChevronRight className="w-4 h-4 text-white/20" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* DNA Evolution: Recent Books */}
                        <div>
                            <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-semibold">DNA Evolution — Recent Reads</h3>
                            <div className="space-y-2">
                                {recentBooks.map((book, idx) => (
                                    <motion.div key={book.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.08 }}
                                        className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                        <img src={book.cover} alt={book.title} className="w-10 h-14 rounded object-cover flex-none" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white font-medium truncate">{book.title}</p>
                                            <p className="text-[10px] text-text-secondary">{book.author}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star key={i} className="w-3 h-3" fill={i < book.rating ? '#a78bfa' : 'none'} stroke={i < book.rating ? '#a78bfa' : 'rgba(255,255,255,0.15)'} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-emerald-400/70 font-mono flex-none">{book.dnaImpact}</span>
                                    </motion.div>
                                ))}
                            </div>
                            <p className="text-[10px] text-text-secondary mt-3 flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3" /> Your DNA updates automatically with each book you read and rate
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
