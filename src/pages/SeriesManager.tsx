import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, ChevronDown, ChevronUp, Globe, Users,
    MapPin, Feather, Calendar, Edit3, GripVertical, Loader2, X, Check, Trash2
} from 'lucide-react';
import { useSeries, SeriesData, BookInSeries } from '../hooks/useDemoData';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';

const STATUS_COLORS: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-400',
    'in-progress': 'bg-amber-500/10 text-amber-400',
    planned: 'bg-white/[0.04] text-white/30',
};

interface SeriesForm { name: string; universe: string; genre: string; characters: number; locations: number; }
const EMPTY_FORM: SeriesForm = { name: '', universe: '', genre: '', characters: 0, locations: 0 };

interface BookForm { title: string; status: string; wordCount: number; releaseDate: string; }
const EMPTY_BOOK: BookForm = { title: '', status: 'planned', wordCount: 0, releaseDate: '' };

export default function SeriesManager() {
    const { data: series, loading } = useSeries();
    const { user } = useAuth();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showSeriesModal, setShowSeriesModal] = useState(false);
    const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
    const [seriesForm, setSeriesForm] = useState<SeriesForm>(EMPTY_FORM);
    const [showBookModal, setShowBookModal] = useState(false);
    const [bookParentId, setBookParentId] = useState<string | null>(null);
    const [bookForm, setBookForm] = useState<BookForm>(EMPTY_BOOK);
    const [saving, setSaving] = useState(false);

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>;
    }

    const uid = user?.uid;
    const totalBooks = series.reduce((sum, s) => sum + s.books.length, 0);
    const totalWords = series.reduce((sum, s) => sum + s.books.reduce((bs, b) => bs + b.wordCount, 0), 0);

    const openAddSeries = () => { setSeriesForm(EMPTY_FORM); setEditingSeriesId(null); setShowSeriesModal(true); };
    const openEditSeries = (s: SeriesData) => {
        setSeriesForm({ name: s.name, universe: s.universe, genre: s.genre, characters: s.characters, locations: s.locations });
        setEditingSeriesId(s.id); setShowSeriesModal(true);
    };

    const saveSeries = async () => {
        if (!uid || !seriesForm.name.trim()) return;
        setSaving(true);
        const payload = { name: seriesForm.name, universe: seriesForm.universe, genre: seriesForm.genre, characters: seriesForm.characters, locations: seriesForm.locations };
        try {
            if (editingSeriesId) { await updateDoc(doc(db, `users/${uid}/series`, editingSeriesId), payload); }
            else { await addDoc(collection(db, `users/${uid}/series`), payload); }
            setShowSeriesModal(false);
        } catch (e) { console.error('Series save failed:', e); }
        setSaving(false);
    };

    const deleteSeries = async (id: string) => {
        if (!uid || !window.confirm('Delete this series and all its books?')) return;
        try { await deleteDoc(doc(db, `users/${uid}/series`, id)); } catch (e) { console.error('Series delete failed:', e); }
    };

    const openAddBook = (seriesId: string) => { setBookForm(EMPTY_BOOK); setBookParentId(seriesId); setShowBookModal(true); };
    const saveBook = async () => {
        if (!uid || !bookParentId || !bookForm.title.trim()) return;
        setSaving(true);
        const parentSeries = series.find(s => s.id === bookParentId);
        const order = (parentSeries?.books.length || 0) + 1;
        try {
            await addDoc(collection(db, `users/${uid}/series/${bookParentId}/books`), {
                title: bookForm.title, status: bookForm.status, wordCount: bookForm.wordCount,
                releaseDate: bookForm.releaseDate, order,
            });
            setShowBookModal(false);
        } catch (e) { console.error('Book save failed:', e); }
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Series & <span className="text-violet-400">Universe</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Manage series, track word counts, and organize your universes</p>
                    </div>
                    <button onClick={openAddSeries}
                        className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
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
                                    <button onClick={(e) => { e.stopPropagation(); openEditSeries(s); }}
                                        className="text-white/20 hover:text-white/50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteSeries(s.id); }}
                                        className="text-white/20 hover:text-forge-red transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    {expandedId === s.id ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {expandedId === s.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="px-5 pb-4 border-t border-white/[0.06]">
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
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => openAddBook(s.id)}
                                                className="mt-3 flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                                <Plus className="w-3 h-3" /> Add Book to Series
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                    {series.length === 0 && <div className="text-center py-12 text-white/20 text-sm">No series yet. Create one to start tracking your universe.</div>}
                </div>
            </div>

            {/* Series Modal */}
            <AnimatePresence>
                {showSeriesModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSeriesModal(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface border border-border/30 rounded-xl w-full max-w-lg p-6"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-display text-white">{editingSeriesId ? 'Edit Series' : 'New Series'}</h3>
                                <button onClick={() => setShowSeriesModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Series Name</label>
                                    <input value={seriesForm.name} onChange={e => setSeriesForm({ ...seriesForm, name: e.target.value })}
                                        placeholder="e.g., The Starweaver Chronicles"
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Universe</label>
                                        <input value={seriesForm.universe} onChange={e => setSeriesForm({ ...seriesForm, universe: e.target.value })}
                                            placeholder="e.g., The Runeweave"
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Genre</label>
                                        <input value={seriesForm.genre} onChange={e => setSeriesForm({ ...seriesForm, genre: e.target.value })}
                                            placeholder="e.g., Epic Fantasy"
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Characters</label>
                                        <input type="number" value={seriesForm.characters} onChange={e => setSeriesForm({ ...seriesForm, characters: +e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Locations</label>
                                        <input type="number" value={seriesForm.locations} onChange={e => setSeriesForm({ ...seriesForm, locations: +e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowSeriesModal(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                                <button onClick={saveSeries} disabled={saving || !seriesForm.name.trim()}
                                    className="flex items-center gap-2 px-5 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editingSeriesId ? 'Save Changes' : 'Create Series'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Book Modal */}
            <AnimatePresence>
                {showBookModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowBookModal(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface border border-border/30 rounded-xl w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-display text-white">Add Book</h3>
                                <button onClick={() => setShowBookModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Book Title</label>
                                    <input value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Status</label>
                                        <select value={bookForm.status} onChange={e => setBookForm({ ...bookForm, status: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none">
                                            {['planned', 'in-progress', 'published'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Word Count</label>
                                        <input type="number" value={bookForm.wordCount} onChange={e => setBookForm({ ...bookForm, wordCount: +e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Release Date</label>
                                    <input type="date" value={bookForm.releaseDate} onChange={e => setBookForm({ ...bookForm, releaseDate: e.target.value })}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowBookModal(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                                <button onClick={saveBook} disabled={saving || !bookForm.title.trim()}
                                    className="flex items-center gap-2 px-5 py-2 bg-violet-500 text-white text-sm font-semibold rounded-lg hover:bg-violet-400 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Add Book
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
