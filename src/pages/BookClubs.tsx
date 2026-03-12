import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, Plus, Calendar, Search, X, Check,
    ChevronRight, Globe, Lock, Loader2, BookOpen, Clock,
    Filter, Sparkles, Heart, Star, ArrowRight
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GENRE_PICKER_OPTIONS } from '../data/genreData';

// ═══════════════════════════════════════════════
// READER CIRCLES — Community reading groups
// ═══════════════════════════════════════════════

interface ReaderCircle {
    id: string;
    name: string;
    description: string;
    genre: string;
    visibility: 'public' | 'private';
    pace: string;
    currentBook: string;
    currentAuthor: string;
    coverEmoji: string;
    createdBy: string;
    createdByName: string;
    memberCount: number;
    discussionCount: number;
    nextMeeting: string;
    createdAt: any;
}

interface CircleMembership {
    id: string;
    circleId: string;
    userId: string;
    role: 'creator' | 'moderator' | 'member';
    joinedAt: any;
    status: 'active' | 'pending';
}

const GENRES = ['All', ...GENRE_PICKER_OPTIONS];

const PACES = [
    { id: 'relaxed', label: 'Relaxed', desc: '1 book / 6-8 weeks', emoji: '🌙' },
    { id: 'steady', label: 'Steady', desc: '1 book / month', emoji: '📖' },
    { id: 'ambitious', label: 'Ambitious', desc: '2+ books / month', emoji: '🔥' },
];

const COVER_EMOJIS = ['📚', '🌙', '🔮', '⚔️', '🚀', '🌿', '🔥', '💀', '✨', '🗡️', '🌌', '🐉'];

export default function BookClubs() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [circles, setCircles] = useState<ReaderCircle[]>([]);
    const [memberships, setMemberships] = useState<CircleMembership[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'browse' | 'my-circles'>('browse');
    const [searchQuery, setSearchQuery] = useState('');
    const [genreFilter, setGenreFilter] = useState('All');
    const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
    const [showCreate, setShowCreate] = useState(false);
    const [joining, setJoining] = useState<string | null>(null);

    // Create form
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newGenre, setNewGenre] = useState('Dark Fantasy');
    const [newPace, setNewPace] = useState('steady');
    const [newVisibility, setNewVisibility] = useState<'public' | 'private'>('public');
    const [newEmoji, setNewEmoji] = useState('📚');
    const [newBook, setNewBook] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const unsubs: (() => void)[] = [];
        unsubs.push(onSnapshot(
            query(collection(db, 'reader_circles'), orderBy('createdAt', 'desc')),
            (snap) => {
                setCircles(snap.docs.map(d => ({ id: d.id, ...d.data() } as ReaderCircle)));
                setLoading(false);
            },
            () => setLoading(false)
        ));
        if (user) {
            unsubs.push(onSnapshot(
                collection(db, 'circle_members'),
                (snap) => {
                    setMemberships(snap.docs
                        .map(d => ({ id: d.id, ...d.data() } as CircleMembership))
                        .filter(m => m.userId === user.uid));
                },
                () => {}
            ));
        }
        return () => unsubs.forEach(u => u());
    }, [user]);

    const myCircleIds = useMemo(() => new Set(memberships.filter(m => m.status === 'active').map(m => m.circleId)), [memberships]);
    const pendingIds = useMemo(() => new Set(memberships.filter(m => m.status === 'pending').map(m => m.circleId)), [memberships]);

    const filtered = useMemo(() => {
        let list = tab === 'my-circles' ? circles.filter(c => myCircleIds.has(c.id)) : circles;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.currentBook?.toLowerCase().includes(q));
        }
        if (genreFilter !== 'All') list = list.filter(c => c.genre === genreFilter);
        if (visibilityFilter !== 'all') list = list.filter(c => c.visibility === visibilityFilter);
        return list;
    }, [circles, tab, searchQuery, genreFilter, visibilityFilter, myCircleIds]);

    const handleCreate = async () => {
        if (!user || !newName.trim() || creating) return;
        setCreating(true);
        try {
            const circleRef = await addDoc(collection(db, 'reader_circles'), {
                name: newName.trim(),
                description: newDesc.trim(),
                genre: newGenre,
                visibility: newVisibility,
                pace: newPace,
                currentBook: newBook.trim() || 'Not selected yet',
                currentAuthor: newAuthor.trim() || '',
                coverEmoji: newEmoji,
                createdBy: user.uid,
                createdByName: user.displayName || 'Anonymous',
                memberCount: 1,
                discussionCount: 0,
                nextMeeting: '',
                createdAt: serverTimestamp(),
            });
            // Auto-join as creator
            await addDoc(collection(db, 'circle_members'), {
                circleId: circleRef.id,
                userId: user.uid,
                displayName: user.displayName || 'Anonymous',
                role: 'creator',
                status: 'active',
                readingProgress: 0,
                joinedAt: serverTimestamp(),
            });
            setShowCreate(false);
            setNewName(''); setNewDesc(''); setNewBook(''); setNewAuthor('');
        } catch (e: any) {
            alert(`Create failed: ${e.message}`);
        }
        setCreating(false);
    };

    const handleJoin = async (circle: ReaderCircle) => {
        if (!user || joining) return;
        setJoining(circle.id);
        try {
            await addDoc(collection(db, 'circle_members'), {
                circleId: circle.id,
                userId: user.uid,
                displayName: user.displayName || 'Anonymous',
                role: 'member',
                status: circle.visibility === 'public' ? 'active' : 'pending',
                readingProgress: 0,
                joinedAt: serverTimestamp(),
            });
            // Update member count for public circles
            if (circle.visibility === 'public') {
                await setDoc(doc(db, 'reader_circles', circle.id), { memberCount: (circle.memberCount || 0) + 1 }, { merge: true });
            }
        } catch (e: any) {
            alert(`Join failed: ${e.message}`);
        }
        setJoining(null);
    };

    const inputClass = 'w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-violet-400/40 transition-colors';

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400/70 font-ui block mb-2">Community</span>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Reader <span className="text-violet-400">Circles</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Join reading groups, discuss books, and connect with readers who share your passions</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-violet-400 transition-colors self-start">
                        <Plus className="w-4 h-4" /> Create Circle
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex gap-2">
                        {(['browse', 'my-circles'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`px-4 py-2 text-xs rounded-lg capitalize transition-all ${tab === t ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30 font-semibold' : 'bg-white/[0.04] text-white/50 border border-transparent hover:text-white'}`}>
                                {t === 'my-circles' ? `My Circles (${myCircleIds.size})` : `Browse (${circles.length})`}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search circles, books, descriptions..."
                            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-violet-400/30" />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <div className="flex items-center gap-2 mr-4">
                        <Filter className="w-3.5 h-3.5 text-white/20" />
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">Filters:</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {GENRES.map(g => (
                            <button key={g} onClick={() => setGenreFilter(g)}
                                className={`px-3 py-1 text-[10px] rounded-full transition-all ${genreFilter === g ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30' : 'bg-white/[0.03] text-white/25 border border-white/[0.06] hover:text-white/40'}`}>
                                {g}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1.5 ml-4">
                        {(['all', 'public', 'private'] as const).map(v => (
                            <button key={v} onClick={() => setVisibilityFilter(v)}
                                className={`px-3 py-1 text-[10px] rounded-full transition-all flex items-center gap-1 ${visibilityFilter === v ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30' : 'bg-white/[0.03] text-white/25 border border-white/[0.06] hover:text-white/40'}`}>
                                {v === 'public' && <Globe className="w-2.5 h-2.5" />}
                                {v === 'private' && <Lock className="w-2.5 h-2.5" />}
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Circle Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((circle, i) => {
                        const isMember = myCircleIds.has(circle.id);
                        const isPending = pendingIds.has(circle.id);
                        return (
                            <motion.div key={circle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-violet-400/20 transition-all group">
                                {/* Card Header */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-violet-400/10 flex items-center justify-center text-xl border border-violet-400/10">
                                                {circle.coverEmoji || '📚'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">{circle.name}</h3>
                                                    {circle.visibility === 'private' ? <Lock className="w-3 h-3 text-white/15" /> : <Globe className="w-3 h-3 text-white/15" />}
                                                </div>
                                                <p className="text-[10px] text-white/25">{circle.genre} · {PACES.find(p => p.id === circle.pace)?.label || circle.pace}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {circle.description && (
                                        <p className="text-xs text-white/30 mb-3 line-clamp-2">{circle.description}</p>
                                    )}

                                    {/* Current book */}
                                    {circle.currentBook && circle.currentBook !== 'Not selected yet' && (
                                        <div className="bg-white/[0.02] rounded-lg p-3 mb-3 border border-white/[0.04]">
                                            <p className="text-[9px] text-white/20 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <BookOpen className="w-2.5 h-2.5" /> Currently Reading
                                            </p>
                                            <p className="text-xs text-white font-medium">{circle.currentBook}</p>
                                            {circle.currentAuthor && <p className="text-[10px] text-white/30">by {circle.currentAuthor}</p>}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-[10px] text-white/20">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {circle.memberCount || 0}</span>
                                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {circle.discussionCount || 0}</span>
                                        </div>
                                        {circle.nextMeeting && (
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {circle.nextMeeting}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="border-t border-white/[0.04] px-5 py-3 flex items-center justify-between bg-white/[0.01]">
                                    {isMember ? (
                                        <>
                                            <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Member</span>
                                            <button onClick={() => navigate(`/circle/${circle.id}`)}
                                                className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                                                Open <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </>
                                    ) : isPending ? (
                                        <span className="text-[10px] text-amber-400 flex items-center gap-1 w-full justify-center"><Clock className="w-3 h-3" /> Request Pending</span>
                                    ) : (
                                        <>
                                            <button onClick={() => navigate(`/circle/${circle.id}`)}
                                                className="text-[10px] text-white/30 hover:text-white/50 transition-colors">
                                                Preview
                                            </button>
                                            <button onClick={() => handleJoin(circle)} disabled={joining === circle.id}
                                                className="text-[10px] px-4 py-1.5 bg-violet-500/80 text-white rounded-full hover:bg-violet-400 transition-colors disabled:opacity-50 flex items-center gap-1">
                                                {joining === circle.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                                {circle.visibility === 'public' ? 'Join' : 'Request'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20">
                        <Sparkles className="w-10 h-10 text-violet-400/20 mx-auto mb-3" />
                        <p className="text-white/20 text-sm mb-4">
                            {tab === 'my-circles' ? "You haven't joined any circles yet." : 'No circles match your search.'}
                        </p>
                        {tab === 'browse' && <button onClick={() => { setSearchQuery(''); setGenreFilter('All'); setVisibilityFilter('all'); }} className="text-xs text-violet-400 hover:underline">Clear filters</button>}
                    </div>
                )}
            </div>

            {/* ── Create Circle Modal ── */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        onClick={() => setShowCreate(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-surface border border-white/[0.1] rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-display text-xl text-white tracking-wide">CREATE <span className="text-violet-400">CIRCLE</span></h2>
                                <button onClick={() => setShowCreate(false)} className="text-white/20 hover:text-white/50"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-5">
                                {/* Cover Emoji */}
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Circle Icon</label>
                                    <div className="flex flex-wrap gap-2">
                                        {COVER_EMOJIS.map(e => (
                                            <button key={e} onClick={() => setNewEmoji(e)}
                                                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newEmoji === e ? 'bg-violet-400/20 border-2 border-violet-400 scale-110' : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]'}`}>
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Circle Name *</label>
                                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., Midnight Readers Guild" className={inputClass} />
                                </div>

                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Description</label>
                                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is your circle about?" rows={3} className={`${inputClass} resize-none`} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Genre</label>
                                        <select value={newGenre} onChange={e => setNewGenre(e.target.value)} className={inputClass}>
                                            {GENRES.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Visibility</label>
                                        <div className="flex gap-2">
                                            {(['public', 'private'] as const).map(v => (
                                                <button key={v} onClick={() => setNewVisibility(v)}
                                                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${newVisibility === v ? 'bg-violet-400/10 text-violet-400 border-violet-400/30' : 'bg-white/[0.03] text-white/30 border-white/[0.06]'}`}>
                                                    {v === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Pace */}
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Reading Pace</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PACES.map(p => (
                                            <button key={p.id} onClick={() => setNewPace(p.id)}
                                                className={`p-3 rounded-xl text-center transition-all border ${newPace === p.id ? 'bg-violet-400/10 border-violet-400/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
                                                <span className="text-lg block mb-1">{p.emoji}</span>
                                                <p className={`text-xs font-semibold ${newPace === p.id ? 'text-violet-400' : 'text-white/30'}`}>{p.label}</p>
                                                <p className="text-[9px] text-white/15 mt-0.5">{p.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* First Book */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">First Book (optional)</label>
                                        <input type="text" value={newBook} onChange={e => setNewBook(e.target.value)} placeholder="Book title" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Author</label>
                                        <input type="text" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Author name" className={inputClass} />
                                    </div>
                                </div>

                                <button onClick={handleCreate} disabled={!newName.trim() || creating}
                                    className="w-full py-3.5 bg-violet-500 text-white text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-violet-400 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {creating ? 'Creating...' : 'Create Circle'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
