import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, GripVertical, ChevronRight, ChevronDown,
    Users, Globe, Layers, Map, Clock, Edit3, Trash2, Star,
    Link as LinkIcon, Eye
} from 'lucide-react';

// ═══════════════════════════════════════════
// SERIES & UNIVERSE MANAGER — Track multi-book series
// ═══════════════════════════════════════════

interface BookInSeries {
    title: string;
    order: number;
    status: 'published' | 'in-progress' | 'planned';
    wordCount: number;
    releaseDate: string;
}

interface Series {
    id: string;
    name: string;
    universe: string;
    genre: string;
    books: BookInSeries[];
    characters: number;
    locations: number;
}

const MOCK_SERIES: Series[] = [
    {
        id: 's1', name: 'The Meridian Cycle', universe: 'Meridian Universe', genre: 'Cyberpunk',
        books: [
            { title: 'Chrome Meridian', order: 1, status: 'published', wordCount: 92000, releaseDate: '2025-08-15' },
            { title: 'Neon Cartography', order: 2, status: 'published', wordCount: 88000, releaseDate: '2025-12-01' },
            { title: 'Quantum Borderlands', order: 3, status: 'in-progress', wordCount: 45000, releaseDate: '' },
            { title: 'Holographic Exodus', order: 4, status: 'planned', wordCount: 0, releaseDate: '' },
        ],
        characters: 34, locations: 12,
    },
    {
        id: 's2', name: 'Void Noir Chronicles', universe: 'The Void', genre: 'Dark Fantasy',
        books: [
            { title: 'Void Frequencies', order: 1, status: 'published', wordCount: 78000, releaseDate: '2025-10-20' },
            { title: 'Shadow Resonance', order: 2, status: 'in-progress', wordCount: 32000, releaseDate: '' },
        ],
        characters: 18, locations: 7,
    },
    {
        id: 's3', name: 'Ancestral Code', universe: 'Diaspora Futures', genre: 'Afrofuturism',
        books: [
            { title: 'Ancestral Algorithms', order: 1, status: 'published', wordCount: 85000, releaseDate: '2025-11-15' },
            { title: 'The Diaspora Engine', order: 2, status: 'published', wordCount: 91000, releaseDate: '2026-02-01' },
            { title: 'Code of the Elders', order: 3, status: 'planned', wordCount: 0, releaseDate: '' },
        ],
        characters: 22, locations: 9,
    },
];

const STATUS_COLORS: Record<string, string> = {
    'published': 'bg-emerald-500/10 text-emerald-400',
    'in-progress': 'bg-amber-500/10 text-amber-400',
    'planned': 'bg-white/[0.04] text-white/40',
};

export default function SeriesManager() {
    const [expandedSeries, setExpandedSeries] = useState<string | null>('s1');

    const toggleSeries = (id: string) => {
        setExpandedSeries(expandedSeries === id ? null : id);
    };

    const totalBooks = MOCK_SERIES.reduce((sum, s) => sum + s.books.length, 0);
    const totalWords = MOCK_SERIES.reduce((sum, s) => sum + s.books.reduce((bSum, b) => bSum + b.wordCount, 0), 0);

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Series & <span className="text-violet-400">Universes</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Track multi-book series, shared worlds, and continuity</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Plus className="w-4 h-4" /> New Series
                    </button>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Series', value: MOCK_SERIES.length, icon: Layers, color: 'text-violet-400' },
                        { label: 'Total Books', value: totalBooks, icon: BookOpen, color: 'text-aurora-teal' },
                        { label: 'Total Words', value: `${(totalWords / 1000).toFixed(0)}K`, icon: Edit3, color: 'text-starforge-gold' },
                        { label: 'Universes', value: new Set(MOCK_SERIES.map(s => s.universe)).size, icon: Globe, color: 'text-rose-400' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
                            <p className="text-2xl font-bold text-white">{s.value}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Series Accordion */}
                <div className="space-y-4">
                    {MOCK_SERIES.map((series) => (
                        <div key={series.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                            {/* Header */}
                            <button onClick={() => toggleSeries(series.id)}
                                className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-violet-400/10 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-sm font-semibold text-white">{series.name}</h3>
                                        <p className="text-xs text-white/40">{series.universe} · {series.genre} · {series.books.length} books</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex items-center gap-3 text-[10px] text-white/30">
                                        <span><Users className="w-3 h-3 inline mr-1" />{series.characters} chars</span>
                                        <span><Map className="w-3 h-3 inline mr-1" />{series.locations} locs</span>
                                    </div>
                                    {expandedSeries === series.id ? <ChevronDown className="w-4 h-4 text-white/30" /> : <ChevronRight className="w-4 h-4 text-white/30" />}
                                </div>
                            </button>

                            {/* Books List */}
                            <AnimatePresence>
                                {expandedSeries === series.id && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                        <div className="border-t border-white/[0.06] px-6 py-4 space-y-2">
                                            {series.books.map((book, i) => (
                                                <div key={i} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-colors">
                                                    <GripVertical className="w-4 h-4 text-white/10 cursor-grab" />
                                                    <span className="w-6 h-6 rounded-full bg-white/[0.04] flex items-center justify-center text-[10px] text-white/40 font-semibold">{book.order}</span>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm text-white">{book.title}</h4>
                                                        <div className="flex items-center gap-3 mt-0.5">
                                                            {book.wordCount > 0 && <span className="text-[10px] text-white/30">{(book.wordCount / 1000).toFixed(0)}K words</span>}
                                                            {book.releaseDate && <span className="text-[10px] text-white/30"><Clock className="w-3 h-3 inline mr-0.5" />{book.releaseDate}</span>}
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_COLORS[book.status]}`}>{book.status.replace('-', ' ')}</span>
                                                </div>
                                            ))}
                                            <button className="w-full p-3 border border-dashed border-white/[0.08] rounded-lg text-xs text-white/30 hover:text-white/50 hover:border-white/[0.15] transition-all flex items-center justify-center gap-2">
                                                <Plus className="w-3 h-3" /> Add Book to Series
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
