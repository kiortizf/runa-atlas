import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, ChevronDown, ChevronUp, Globe, Users,
    MapPin, Feather, Calendar, Edit3, GripVertical, Loader2
} from 'lucide-react';
import { useSeries, SeriesData } from '../hooks/useDemoData';

const STATUS_COLORS: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-400',
    'in-progress': 'bg-amber-500/10 text-amber-400',
    planned: 'bg-white/[0.04] text-white/30',
};

export default function SeriesManager() {
    const { data: series, loading } = useSeries();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>;
    }

    const totalBooks = series.reduce((sum, s) => sum + s.books.length, 0);
    const totalWords = series.reduce((sum, s) => sum + s.books.reduce((bs, b) => bs + b.wordCount, 0), 0);

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Series & <span className="text-violet-400">Universe</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Manage series, track word counts, and organize your universes</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Plus className="w-4 h-4" /> New Series
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                        <p className="text-2xl font-bold text-white">{series.length}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Series</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                        <p className="text-2xl font-bold text-white">{totalBooks}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Total Books</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                        <p className="text-2xl font-bold text-white">{(totalWords / 1000).toFixed(0)}k</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Total Words</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {series.map((s) => (
                        <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                            <button onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                                className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-violet-400/10 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-sm font-semibold text-white">{s.name}</h3>
                                        <p className="text-xs text-white/40">{s.universe} · {s.genre} · {s.books.length} books</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex items-center gap-3 text-[10px] text-white/30">
                                        <span><Users className="w-3 h-3 inline mr-1" />{s.characters}</span>
                                        <span><MapPin className="w-3 h-3 inline mr-1" />{s.locations}</span>
                                    </div>
                                    {expandedId === s.id ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {expandedId === s.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="px-5 pb-5 border-t border-white/[0.06]">
                                            <div className="space-y-2 mt-4">
                                                {s.books.map((book, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                                        <GripVertical className="w-4 h-4 text-white/10 cursor-grab" />
                                                        <span className="w-6 h-6 rounded-full bg-violet-400/10 text-violet-400 text-[10px] flex items-center justify-center font-bold">{book.order}</span>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-white">{book.title}</p>
                                                            <div className="flex items-center gap-3 mt-0.5">
                                                                <span className="text-[10px] text-white/30"><Feather className="w-3 h-3 inline mr-1" />{(book.wordCount / 1000).toFixed(0)}k words</span>
                                                                {book.releaseDate && <span className="text-[10px] text-white/30"><Calendar className="w-3 h-3 inline mr-1" />{book.releaseDate}</span>}
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_COLORS[book.status] || ''}`}>{book.status}</span>
                                                        <button className="text-white/20 hover:text-white/50"><Edit3 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                    {series.length === 0 && <div className="text-center py-12 text-white/20 text-sm">No series yet. Create one or seed demo data.</div>}
                </div>
            </div>
        </div>
    );
}
