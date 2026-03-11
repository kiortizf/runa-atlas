import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Users, Send, Check, Clock, Eye, Star,
    MessageSquare, ChevronDown, AlertTriangle, Mail,
    Download, Plus, X, Filter, Search, BarChart3,
    ThumbsUp, ThumbsDown, Minus
} from 'lucide-react';

interface ARCReader {
    id: string;
    name: string;
    avatar: string;
    email: string;
    genres: string[];
    platform: string;
    followers: number;
    avgRating: number;
    reviewsWritten: number;
    status: 'invited' | 'accepted' | 'reading' | 'reviewed' | 'declined';
    sentDate?: string;
    reviewDate?: string;
    review?: { rating: number; excerpt: string; link?: string };
    progress?: number;
}

const DEMO_READERS: ARCReader[] = [
    { id: '1', name: 'Aria Chen', avatar: '🧬', email: 'aria@example.com', genres: ['Fantasy', 'Sci-Fi'], platform: 'Goodreads', followers: 2400, avgRating: 4.2, reviewsWritten: 89, status: 'reviewed', sentDate: 'Feb 15', reviewDate: 'Mar 5', review: { rating: 5, excerpt: '"A masterful blend of dark fantasy and political intrigue. The worldbuilding is exceptional."' }, progress: 100 },
    { id: '2', name: 'Marcus Webb', avatar: '📚', email: 'marcus@example.com', genres: ['Literary Fiction', 'Fantasy'], platform: 'BookTube', followers: 15200, avgRating: 3.8, reviewsWritten: 145, status: 'reviewed', sentDate: 'Feb 15', reviewDate: 'Mar 8', review: { rating: 4, excerpt: '"Ambitious and atmospheric. The prose occasionally tries too hard, but the story carries itself."' }, progress: 100 },
    { id: '3', name: 'Luna Okafor', avatar: '🌙', email: 'luna@example.com', genres: ['Fantasy', 'Romance'], platform: 'Instagram', followers: 8900, avgRating: 4.5, reviewsWritten: 67, status: 'reading', sentDate: 'Feb 20', progress: 72 },
    { id: '4', name: 'Dev Patel', avatar: '🔮', email: 'dev@example.com', genres: ['Sci-Fi', 'Thriller'], platform: 'Goodreads', followers: 3100, avgRating: 4.0, reviewsWritten: 112, status: 'reading', sentDate: 'Feb 22', progress: 45 },
    { id: '5', name: 'Sophie Turner', avatar: '🦋', email: 'sophie@example.com', genres: ['Fantasy', 'YA'], platform: 'TikTok', followers: 45000, avgRating: 4.3, reviewsWritten: 203, status: 'accepted', sentDate: 'Mar 1' },
    { id: '6', name: 'James Korrath', avatar: '⚔️', email: 'james@example.com', genres: ['Epic Fantasy', 'Dark Fantasy'], platform: 'Blog', followers: 1800, avgRating: 4.1, reviewsWritten: 56, status: 'invited', sentDate: 'Mar 5' },
    { id: '7', name: 'Yuki Tanaka', avatar: '🌸', email: 'yuki@example.com', genres: ['Fantasy', 'Literary Fiction'], platform: 'Goodreads', followers: 5600, avgRating: 4.4, reviewsWritten: 78, status: 'declined' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    invited: { label: 'Invited', color: 'text-white/40', bg: 'bg-white/[0.04]' },
    accepted: { label: 'Accepted', color: 'text-aurora-teal', bg: 'bg-aurora-teal/10' },
    reading: { label: 'Reading', color: 'text-starforge-gold', bg: 'bg-starforge-gold/10' },
    reviewed: { label: 'Reviewed', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    declined: { label: 'Declined', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function ARCManager() {
    const [readers, setReaders] = useState(DEMO_READERS);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedReader, setSelectedReader] = useState<ARCReader | null>(null);
    const [showInvite, setShowInvite] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const unsub = onSnapshot(
                query(collection(db, 'beta_readers'), where('authorId', '==', user.uid)),
                (snap) => {
                    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    if (data.length > 0) setReaders(data as typeof DEMO_READERS);
                },
                () => { }
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const filtered = filterStatus === 'all' ? readers : readers.filter(r => r.status === filterStatus);

    const stats = {
        total: readers.length,
        invited: readers.filter(r => r.status === 'invited').length,
        accepted: readers.filter(r => r.status === 'accepted').length,
        reading: readers.filter(r => r.status === 'reading').length,
        reviewed: readers.filter(r => r.status === 'reviewed').length,
        declined: readers.filter(r => r.status === 'declined').length,
        avgRating: readers.filter(r => r.review).reduce((sum, r) => sum + (r.review?.rating || 0), 0) / (readers.filter(r => r.review).length || 1),
    };

    return (
        <div className="bg-void-black min-h-screen py-24">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-2">ARC Manager</span>
                        <h1 className="font-display text-3xl text-white tracking-wide">
                            THE EMBER <span className="text-starforge-gold">CODEX</span>
                        </h1>
                        <p className="text-xs text-white/30 mt-1">Advance Reader Copy Distribution</p>
                    </div>
                    <button onClick={() => setShowInvite(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-starforge-gold/90 transition-colors">
                        <Plus className="w-4 h-4" /> Invite Readers
                    </button>
                </div>

                {/* Pipeline Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-white' },
                        { label: 'Invited', value: stats.invited, color: STATUS_CONFIG.invited.color },
                        { label: 'Accepted', value: stats.accepted, color: STATUS_CONFIG.accepted.color },
                        { label: 'Reading', value: stats.reading, color: STATUS_CONFIG.reading.color },
                        { label: 'Reviewed', value: stats.reviewed, color: STATUS_CONFIG.reviewed.color },
                        { label: 'Avg Rating', value: stats.avgRating.toFixed(1) + '★', color: 'text-starforge-gold' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 text-center">
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-[9px] text-white/20 uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 mb-6 bg-white/[0.02] p-1 rounded-lg border border-white/[0.06] w-fit">
                    {['all', 'invited', 'accepted', 'reading', 'reviewed', 'declined'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all
                ${filterStatus === s ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-white/20 hover:text-white/40'}`}>
                            {s === 'all' ? `All (${readers.length})` : `${STATUS_CONFIG[s]?.label} (${readers.filter(r => r.status === s).length})`}
                        </button>
                    ))}
                </div>

                {/* Reader List */}
                <div className="space-y-3">
                    {filtered.map((reader) => {
                        const sc = STATUS_CONFIG[reader.status];
                        return (
                            <motion.div key={reader.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5 hover:border-white/[0.1] transition-colors cursor-pointer"
                                onClick={() => setSelectedReader(reader)}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{reader.avatar}</span>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm text-white font-semibold">{reader.name}</h3>
                                            <span className={`text-[9px] px-2 py-0.5 rounded ${sc.bg} ${sc.color}`}>{sc.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-white/20">{reader.platform}</span>
                                            <span className="text-[10px] text-white/15">•</span>
                                            <span className="text-[10px] text-white/20">{reader.followers.toLocaleString()} followers</span>
                                            <span className="text-[10px] text-white/15">•</span>
                                            <span className="text-[10px] text-white/20">{reader.reviewsWritten} reviews</span>
                                        </div>
                                    </div>

                                    {/* Progress bar for reading */}
                                    {reader.status === 'reading' && reader.progress !== undefined && (
                                        <div className="hidden md:flex items-center gap-2 w-32">
                                            <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                                <div className="h-full bg-starforge-gold/40 rounded-full" style={{ width: `${reader.progress}%` }} />
                                            </div>
                                            <span className="text-[10px] text-white/20">{reader.progress}%</span>
                                        </div>
                                    )}

                                    {/* Review rating */}
                                    {reader.review && (
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < reader.review!.rating ? 'text-starforge-gold fill-starforge-gold' : 'text-white/10'}`} />
                                            ))}
                                        </div>
                                    )}

                                    {reader.sentDate && (
                                        <span className="text-[10px] text-white/15 hidden sm:block">Sent {reader.sentDate}</span>
                                    )}
                                </div>

                                {/* Review excerpt */}
                                {reader.review && (
                                    <p className="text-xs text-white/40 mt-3 italic pl-10">{reader.review.excerpt}</p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Invite Modal */}
                <AnimatePresence>
                    {showInvite && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                            onClick={() => setShowInvite(false)}>
                            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                className="bg-surface border border-white/[0.1] rounded-xl p-8 max-w-md w-full"
                                onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg text-white font-semibold">Invite ARC Reader</h2>
                                    <button onClick={() => setShowInvite(false)} className="text-white/20 hover:text-white/50"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Name</label>
                                        <input type="text" placeholder="Reader name"
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-starforge-gold/30 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Email</label>
                                        <input type="email" placeholder="reader@example.com"
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-starforge-gold/30 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Platform</label>
                                        <select className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:border-starforge-gold/30 focus:outline-none">
                                            <option>Goodreads</option><option>BookTube</option><option>Instagram</option><option>TikTok</option><option>Blog</option><option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Personal Note (optional)</label>
                                        <textarea rows={3} placeholder="Hi! I'd love for you to review my upcoming novel..."
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/15 focus:border-starforge-gold/30 focus:outline-none resize-none" />
                                    </div>
                                    <button className="w-full py-3 bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-starforge-gold/90 transition-colors flex items-center justify-center gap-2">
                                        <Send className="w-4 h-4" /> Send ARC Invitation
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
