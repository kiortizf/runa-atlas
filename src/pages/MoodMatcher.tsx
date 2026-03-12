import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, RotateCcw, BookOpen, Heart, Skull, Zap, Wind,
    Sun, Moon, Flame, Snowflake, Feather, Mountain, Waves,
    Eye, ChevronRight, Star, ArrowRight, Shield
} from 'lucide-react';

// ═══════════════════════════════════════════
// MOOD & VIBE MATCHER — Feelings-First Discovery
// ═══════════════════════════════════════════

interface MoodAxis {
    id: string;
    label: string;
    leftLabel: string;
    rightLabel: string;
    leftIcon: any;
    rightIcon: any;
    leftColor: string;
    rightColor: string;
    value: number;
}

interface BookResult {
    title: string;
    author: string;
    cover: string;
    match: number;
    mood: string;
    tags: string[];
    summary: string;
    price: string;
}

const INITIAL_AXES: MoodAxis[] = [
    { id: 'darkness', label: 'Tone', leftLabel: 'Light & Hopeful', rightLabel: 'Dark & Haunting', leftIcon: Sun, rightIcon: Moon, leftColor: 'from-amber-400', rightColor: 'to-violet-500', value: 50 },
    { id: 'pacing', label: 'Pacing', leftLabel: 'Slow Burn', rightLabel: 'Breakneck', leftIcon: Feather, rightIcon: Zap, leftColor: 'from-teal-400', rightColor: 'to-red-500', value: 50 },
    { id: 'romance', label: 'Romance', leftLabel: 'None / Subtle', rightLabel: 'Central', leftIcon: Shield, rightIcon: Heart, leftColor: 'from-slate-400', rightColor: 'to-rose-500', value: 50 },
    { id: 'worldbuilding', label: 'Worldbuilding', leftLabel: 'Minimal', rightLabel: 'Immersive Depth', leftIcon: Wind, rightIcon: Mountain, leftColor: 'from-gray-400', rightColor: 'to-emerald-500', value: 50 },
    { id: 'prose', label: 'Prose Style', leftLabel: 'Clean & Direct', rightLabel: 'Lyrical & Dense', leftIcon: Zap, rightIcon: Waves, leftColor: 'from-blue-400', rightColor: 'to-purple-500', value: 50 },
    { id: 'body_count', label: 'Intensity', leftLabel: 'Cozy & Safe', rightLabel: 'Brutal & Visceral', leftIcon: Snowflake, rightIcon: Flame, leftColor: 'from-sky-300', rightColor: 'to-orange-600', value: 50 },
];

const MOOD_PRESETS = [
    { label: 'I need comfort', emoji: '🫂', values: { darkness: 15, pacing: 30, romance: 65, worldbuilding: 40, prose: 35, body_count: 10 } },
    { label: 'Haunt me', emoji: '👻', values: { darkness: 90, pacing: 45, romance: 20, worldbuilding: 70, prose: 75, body_count: 80 } },
    { label: 'Obsidian Crown energy', emoji: '👑', values: { darkness: 75, pacing: 55, romance: 45, worldbuilding: 85, prose: 80, body_count: 65 } },
    { label: 'Fast & dangerous', emoji: '⚡', values: { darkness: 60, pacing: 95, romance: 30, worldbuilding: 35, prose: 25, body_count: 75 } },
    { label: 'Weird & beautiful', emoji: '🦋', values: { darkness: 50, pacing: 35, romance: 30, worldbuilding: 60, prose: 95, body_count: 40 } },
    { label: 'Love story, dark setting', emoji: '🥀', values: { darkness: 70, pacing: 40, romance: 90, worldbuilding: 65, prose: 60, body_count: 45 } },
];

// Mood profiles are derived from book metadata at runtime
const TAG_MOOD_SIGNALS: Record<string, Partial<Record<string, number>>> = {
    'dark fantasy': { darkness: 80, body_count: 60, worldbuilding: 80 },
    'gothic': { darkness: 85, prose: 75, body_count: 50 },
    'cyberpunk': { darkness: 70, pacing: 65, worldbuilding: 70 },
    'dystopian': { darkness: 75, pacing: 60 },
    'magical realism': { darkness: 40, prose: 85, worldbuilding: 60, body_count: 20 },
    'literary fiction': { prose: 90, pacing: 30, body_count: 20 },
    'queer romance': { romance: 90, darkness: 25, body_count: 15 },
    'space opera': { worldbuilding: 85, pacing: 70 },
    'strong female lead': { pacing: 55, body_count: 45 },
    'morally grey': { darkness: 70, body_count: 55 },
    'slow burn': { pacing: 20, romance: 65 },
    'rivals to lovers': { romance: 80, pacing: 55, darkness: 35 },
    'found family': { romance: 40, darkness: 25, body_count: 15 },
    'magic systems': { worldbuilding: 90 },
    'memory': { darkness: 55, prose: 65, worldbuilding: 50 },
    'identity': { darkness: 50, prose: 60 },
    'thriller': { pacing: 85, darkness: 65, body_count: 65 },
    'violence': { body_count: 75, darkness: 65 },
    'body horror': { body_count: 90, darkness: 85 },
    'grief': { darkness: 55, prose: 60, body_count: 20 },
};

function buildMoodProfile(tags: string[], genres: string[]): Record<string, number> {
    const profile: Record<string, number[]> = { darkness: [], pacing: [], romance: [], worldbuilding: [], prose: [], body_count: [] };
    const allSignals = [...tags, ...genres].map(t => t.toLowerCase());
    for (const signal of allSignals) {
        const mood = TAG_MOOD_SIGNALS[signal];
        if (mood) {
            for (const [axis, val] of Object.entries(mood)) {
                if (val != null) profile[axis]?.push(val);
            }
        }
    }
    const result: Record<string, number> = {};
    for (const [axis, vals] of Object.entries(profile)) {
        result[axis] = vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 50;
    }
    return result;
}

function computeMatch(axes: MoodAxis[], profile: Record<string, number>): number {
    if (axes.length === 0) return 50;
    const diffs = axes.map(a => Math.abs((a.value ?? 50) - (profile[a.id] || 50)));
    const avgDiff = diffs.reduce((s, d) => s + d, 0) / diffs.length;
    return Math.max(10, Math.round(100 - avgDiff * 1.2));
}

const ICON_MAP: Record<string, any> = {
    Sun, Moon, Feather, Zap, Shield, Heart, Wind, Mountain, Waves, Snowflake, Flame, Eye,
    Sparkles, Star, BookOpen, RotateCcw, ArrowRight
};

function resolveIcon(icon: any): any {
    if (typeof icon === 'function') return icon;
    if (typeof icon === 'string' && ICON_MAP[icon]) return ICON_MAP[icon];
    return Sparkles; // fallback
}

export default function MoodMatcher() {
    const { user } = useAuth();
    const [axes, setAxes] = useState<MoodAxis[]>(INITIAL_AXES);
    const [showResults, setShowResults] = useState(false);
    const [firestoreBooks, setFirestoreBooks] = useState<any[]>([]);

    // Load books from Firestore
    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'books')),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setFirestoreBooks(data);
            },
            () => { }
        );
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'mood_axes')),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as MoodAxis));
                if (data.length > 0) {
                    // Merge Firestore data with local icons (Firestore can't store React components)
                    const merged = data.map(d => {
                        const initial = INITIAL_AXES.find(a => a.id === d.id);
                        return {
                            ...d,
                            leftIcon: initial?.leftIcon ?? resolveIcon(d.leftIcon),
                            rightIcon: initial?.rightIcon ?? resolveIcon(d.rightIcon),
                        };
                    });
                    setAxes(merged);
                }
            },
            () => { }
        );
        return () => unsub();
    }, []);

    const updateAxis = (id: string, value: number) => {
        setAxes(prev => prev.map(a => a.id === id ? { ...a, value } : a));
    };

    const applyPreset = (values: Record<string, number>) => {
        setAxes(prev => prev.map(a => ({ ...a, value: values[a.id] ?? a.value })));
    };

    const reset = () => {
        setAxes(INITIAL_AXES);
        setShowResults(false);
    };

    const results = useMemo(() => {
        return firestoreBooks.map((book: any) => {
            const tags = [...(book.tags || []), ...(book.themes || []), ...(book.contentWarnings || [])];
            const profile = buildMoodProfile(tags, [book.genre || '', book.subgenre || '']);
            const match = computeMatch(axes, profile);
            // Generate mood description from highest axes
            const topAxis = axes.reduce((a, b) => a.value > b.value ? a : b);
            const moodDesc = topAxis.value > 60 ? topAxis.rightLabel : topAxis.leftLabel;
            return {
                title: book.title,
                author: book.author,
                cover: book.cover || '',
                match,
                mood: `Vibes: ${moodDesc}`,
                tags: (book.tags || []).slice(0, 4),
                summary: book.synopsis || book.description || '',
                price: book.price ? `$${book.price}` : '',
            } as BookResult;
        }).sort((a, b) => b.match - a.match);
    }, [axes, firestoreBooks]);

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-white">Mood & Vibe Matcher</h1>
                            <p className="text-xs text-text-secondary">Tell us how you feel. We'll find the book.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10">
                {/* Quick Mood Presets */}
                <div className="mb-12">
                    <p className="text-xs uppercase tracking-widest text-text-secondary mb-4">Quick Moods</p>
                    <div className="flex flex-wrap gap-2">
                        {MOOD_PRESETS.map((preset, idx) => (
                            <button key={idx} onClick={() => { applyPreset(preset.values); setShowResults(true); }}
                                className="group px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:border-violet-400/30 hover:bg-violet-400/[0.04] transition-all text-sm flex items-center gap-2">
                                <span className="text-lg">{preset.emoji}</span>
                                <span className="text-text-secondary group-hover:text-white transition-colors">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sliders */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-xs uppercase tracking-widest text-text-secondary">Fine-Tune Your Vibe</p>
                        <button onClick={reset} className="text-xs text-text-secondary hover:text-white transition-colors flex items-center gap-1.5">
                            <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    <div className="space-y-8">
                        {axes.map((axis) => {
                            const LeftIcon = axis.leftIcon;
                            const RightIcon = axis.rightIcon;
                            return (
                                <div key={axis.id}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] uppercase tracking-widest text-text-secondary">{axis.label}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 w-36 justify-end">
                                            <LeftIcon className="w-4 h-4 text-text-secondary" />
                                            <span className={`text-xs ${axis.value < 40 ? 'text-white' : 'text-text-secondary'}`}>{axis.leftLabel}</span>
                                        </div>
                                        <div className="flex-1 relative">
                                            <div className={`absolute inset-y-0 left-0 right-0 h-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r ${axis.leftColor} ${axis.rightColor} opacity-20`} />
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                value={axis.value}
                                                onChange={(e) => { updateAxis(axis.id, Number(e.target.value)); setShowResults(true); }}
                                                className="w-full relative z-10 accent-violet-400"
                                                style={{
                                                    WebkitAppearance: 'none',
                                                    background: 'transparent',
                                                    height: '8px',
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 w-36">
                                            <span className={`text-xs ${axis.value > 60 ? 'text-white' : 'text-text-secondary'}`}>{axis.rightLabel}</span>
                                            <RightIcon className="w-4 h-4 text-text-secondary" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                            transition={{ duration: 0.6 }}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Your Matches</h2>
                                    <p className="text-xs text-text-secondary">Books ranked by how closely they match your current vibe</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.map((book, idx) => (
                                    <motion.div key={book.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className={`group flex gap-4 p-4 rounded-lg border transition-all cursor-pointer
                                            ${idx === 0 ? 'bg-violet-500/[0.06] border-violet-400/20 hover:border-violet-400/40' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'}`}>
                                        {/* Cover */}
                                        <div className="w-20 h-28 rounded overflow-hidden flex-none bg-white/[0.04]">
                                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm font-semibold text-white truncate">{book.title}</h3>
                                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-none
                                                    ${book.match >= 85 ? 'bg-emerald-500/10 text-emerald-400' : book.match >= 70 ? 'bg-amber-500/10 text-amber-400' : 'bg-white/[0.06] text-text-secondary'}`}>
                                                    {book.match}% match
                                                </div>
                                            </div>
                                            <p className="text-xs text-text-secondary mb-1.5">{book.author}</p>
                                            <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2 mb-2">{book.summary}</p>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {book.tags.map(tag => (
                                                    <span key={tag} className="text-[9px] text-text-secondary px-1.5 py-0.5 bg-white/[0.03] rounded border border-white/[0.06]">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-violet-400/70 mt-2 italic">{book.mood}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Slider CSS overrides */}
            <style>{`
                input[type="range"]::-webkit-slider-runnable-track {
                    height: 6px;
                    border-radius: 3px;
                    background: rgba(255,255,255,0.06);
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #a78bfa;
                    border: 2px solid #0a0a1a;
                    cursor: pointer;
                    margin-top: -7px;
                    box-shadow: 0 0 12px rgba(167,139,250,0.3);
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                    background: #c4b5fd;
                    box-shadow: 0 0 20px rgba(167,139,250,0.5);
                }
            `}</style>
        </div>
    );
}
