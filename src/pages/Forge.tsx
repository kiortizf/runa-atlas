import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flame, Vote, Image, BookOpen, Globe, PenTool, ArrowRight, ChevronDown, ChevronUp,
    Star, Send, Users, Clock, Trophy, Eye, Heart, MessageCircle, Sparkles, Plus,
    ThumbsUp, CheckCircle, LogIn, X, Filter
} from 'lucide-react';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, increment, onSnapshot, query, orderBy, where, serverTimestamp, Timestamp, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

// ─── Types ──────────────────────────────────────────
type ForgeProject = {
    id: string;
    type: 'anthology_vote' | 'cover_reveal' | 'story_poll';
    title: string;
    description: string;
    options: { id: string; label: string; imageUrl?: string; votes: number; description?: string }[];
    totalVotes: number;
    deadline: Timestamp;
    status: 'active' | 'closed' | 'upcoming';
    bookId?: string;
    createdAt?: any;
};

type FanFiction = {
    id: string;
    title: string;
    authorName: string;
    authorId: string;
    bookTitle: string;
    bookId: string;
    excerpt: string;
    content: string;
    wordCount: number;
    likes: number;
    tags: string[];
    status: 'published' | 'draft';
    createdAt: any;
};

type WorldEntry = {
    id: string;
    title: string;
    category: string;
    bookTitle: string;
    bookId: string;
    content: string;
    contributors: string[];
    lastEdited: any;
    approved: boolean;
};

// ─── Seed Data ──────────────────────────────────────
let _seedProjects: any[] = [];

let _seedFanfiction: any[] = [];

let _seedWorldEntries: any[] = [];

// ─── Component ──────────────────────────────────────
export default function Forge() {
    const { user, signIn } = useAuth();
    const [activeTab, setActiveTab] = useState<'votes' | 'fanfiction' | 'worldbuilding'>('votes');
    const [projects, setProjects] = useState<ForgeProject[]>([]);
    const [fanfiction, setFanfiction] = useState<FanFiction[]>([]);
    const [worldEntries, setWorldEntries] = useState<WorldEntry[]>([]);
    const [votedProjects, setVotedProjects] = useState<Record<string, string>>({});
    const [likedFics, setLikedFics] = useState<string[]>([]);
    const [expandedProject, setExpandedProject] = useState<string | null>(null);
    const [expandedFic, setExpandedFic] = useState<string | null>(null);
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('all');

    // New fan fiction form
    const [showFicForm, setShowFicForm] = useState(false);
    const [ficForm, setFicForm] = useState({ title: '', bookTitle: '', excerpt: '', content: '', tags: '' });

    // New world entry form
    const [showWorldForm, setShowWorldForm] = useState(false);
    const [worldForm, setWorldForm] = useState({ title: '', category: '', bookTitle: '', content: '' });
    const [worldSearchTerm, setWorldSearchTerm] = useState('');
    const [worldFilterCat, setWorldFilterCat] = useState('all');
    const [readingFic, setReadingFic] = useState<FanFiction | null>(null);

    const worldCategories = ['all', 'Magic', 'Setting', 'Character', 'Flora', 'History', 'Technology'];

    // Load from Firestore with seed fallback
    useEffect(() => {
        const unsub1 = onSnapshot(collection(db, 'forgeProjects'), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ForgeProject));
            setProjects(docs.length > 0 ? docs : _seedProjects);
        }, () => setProjects(_seedProjects));

        const unsub2 = onSnapshot(query(collection(db, 'fanfiction'), orderBy('likes', 'desc')), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as FanFiction));
            setFanfiction(docs.length > 0 ? docs : _seedFanfiction);
        }, () => setFanfiction(_seedFanfiction));

        const unsub3 = onSnapshot(query(collection(db, 'worldbuilding'), orderBy('title')), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as WorldEntry));
            setWorldEntries(docs.length > 0 ? docs : _seedWorldEntries);
        }, () => setWorldEntries(_seedWorldEntries));

        return () => { unsub1(); unsub2(); unsub3(); };
    }, []);

    // Load user votes
    useEffect(() => {
        if (!user) return;
        const loadVotes = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid, 'forgeVotes', 'all'));
                if (snap.exists()) setVotedProjects(snap.data() as Record<string, string>);
            } catch { }
        };
        loadVotes();
    }, [user]);

    const handleVote = async (projectId: string, optionId: string) => {
        if (!user) { signIn(); return; }
        if (votedProjects[projectId]) return;

        const newVoted = { ...votedProjects, [projectId]: optionId };
        setVotedProjects(newVoted);

        // Optimistic update
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                totalVotes: p.totalVotes + 1,
                options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o),
            };
        }));

        try {
            await setDoc(doc(db, 'users', user.uid, 'forgeVotes', 'all'), newVoted, { merge: true });
            await updateDoc(doc(db, 'forgeProjects', projectId), { totalVotes: increment(1) });
        } catch (e) { handleFirestoreError(e, OperationType.UPDATE, 'forgeProjects'); }
    };

    const handleLikeFic = async (ficId: string) => {
        if (!user) { signIn(); return; }
        if (likedFics.includes(ficId)) return;
        setLikedFics(prev => [...prev, ficId]);
        setFanfiction(prev => prev.map(f => f.id === ficId ? { ...f, likes: f.likes + 1 } : f));
        try {
            await updateDoc(doc(db, 'fanfiction', ficId), { likes: increment(1) });
        } catch { }
    };

    const handleSubmitFic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { signIn(); return; }
        try {
            await addDoc(collection(db, 'fanfiction'), {
                ...ficForm,
                tags: ficForm.tags.split(',').map(t => t.trim()).filter(Boolean),
                authorId: user.uid,
                authorName: user.displayName || 'Anonymous',
                wordCount: ficForm.content.split(/\s+/).length,
                likes: 0,
                status: 'published',
                createdAt: serverTimestamp(),
            });
            setShowFicForm(false);
            setFicForm({ title: '', bookTitle: '', excerpt: '', content: '', tags: '' });
        } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'fanfiction'); }
    };

    const handleSubmitWorldEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { signIn(); return; }
        try {
            await addDoc(collection(db, 'worldbuilding'), {
                ...worldForm,
                bookId: '',
                contributors: [user.displayName || 'Anonymous'],
                lastEdited: serverTimestamp(),
                approved: false,
            });
            setShowWorldForm(false);
            setWorldForm({ title: '', category: '', bookTitle: '', content: '' });
        } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'worldbuilding'); }
    };

    const filteredProjects = filterType === 'all' ? projects : projects.filter(p => p.type === filterType);

    const getDeadlineText = (deadline: Timestamp) => {
        const d = deadline.toDate();
        const now = new Date();
        const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'Closed';
        if (diff === 0) return 'Last day!';
        return `${diff} days left`;
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'anthology_vote': return 'Anthology Vote';
            case 'cover_reveal': return 'Cover Reveal';
            case 'story_poll': return 'Story Poll';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'anthology_vote': return 'text-starforge-gold bg-starforge-gold/10 border-starforge-gold/30';
            case 'cover_reveal': return 'text-queer-pink bg-queer-pink/10 border-queer-pink/30';
            case 'story_poll': return 'text-aurora-teal bg-aurora-teal/10 border-aurora-teal/30';
            default: return 'text-text-muted bg-surface border-border';
        }
    };

    const tabs = [
        { id: 'votes' as const, label: 'Shape the Future', icon: Vote, count: projects.length },
        { id: 'fanfiction' as const, label: 'Fan Fiction', icon: PenTool, count: fanfiction.length },
        { id: 'worldbuilding' as const, label: 'Worldbuilding', icon: Globe, count: worldEntries.length },
    ];

    return (
        <div className="bg-void-black min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-forge-red/10 text-forge-red border border-forge-red/30 px-4 py-1.5 rounded-full font-ui text-[10px] uppercase tracking-widest mb-6">
                        <Flame className="w-3 h-3" /> Reader-Shaped Publishing
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
                        The <span className="text-starforge-gold italic font-heading normal-case">Forge</span>
                    </h1>
                    <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        This is where readers shape the future of Rüna Atlas. Vote on anthology themes. Pick the cover that ships. Tell authors which story to write next. Build the worlds together.
                    </p>
                </motion.div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-10 flex-wrap">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-ui text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-starforge-gold text-void-black font-medium'
                                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-starforge-gold/30'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-void-black/20' : 'bg-surface-elevated'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* ═══ VOTES TAB ═══ */}
                {activeTab === 'votes' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Type filters */}
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'anthology_vote', 'cover_reveal', 'story_poll'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 py-1.5 rounded-full font-ui text-xs uppercase tracking-wider transition-all ${filterType === type
                                        ? 'bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30'
                                        : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                                        }`}
                                >
                                    {type === 'all' ? 'All Projects' : getTypeLabel(type)}
                                </button>
                            ))}
                        </div>

                        {filteredProjects.map((project, idx) => {
                            const hasVoted = !!votedProjects[project.id];
                            const userChoice = votedProjects[project.id];
                            const maxVotes = Math.max(...project.options.map(o => o.votes));

                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-surface border border-border rounded-sm overflow-hidden"
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div>
                                                <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-ui mb-2 ${getTypeColor(project.type)}`}>
                                                    {getTypeLabel(project.type)}
                                                </span>
                                                <h3 className="font-heading text-xl md:text-2xl text-text-primary">{project.title}</h3>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-display text-xl text-starforge-gold">{project.totalVotes.toLocaleString()}</p>
                                                <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider">total votes</p>
                                            </div>
                                        </div>
                                        <p className="font-body text-sm text-text-secondary mb-6 leading-relaxed">{project.description}</p>

                                        {/* Options */}
                                        <div className={`${project.type === 'cover_reveal' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : 'space-y-3'}`}>
                                            {project.options.map(option => {
                                                const pct = project.totalVotes > 0 ? Math.round((option.votes / project.totalVotes) * 100) : 0;
                                                const isWinning = option.votes === maxVotes;
                                                const isUserChoice = userChoice === option.id;

                                                if (project.type === 'cover_reveal') {
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => handleVote(project.id, option.id)}
                                                            disabled={hasVoted}
                                                            className={`relative group rounded-sm overflow-hidden border transition-all ${isUserChoice ? 'border-starforge-gold ring-2 ring-starforge-gold/30' : 'border-border hover:border-starforge-gold/50'}`}
                                                        >
                                                            {option.imageUrl && (
                                                                <img src={option.imageUrl} alt={option.label} className="w-full aspect-[2/3] object-cover" referrerPolicy="no-referrer" />
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-void-black/90 via-transparent to-transparent flex flex-col justify-end p-4">
                                                                <p className="font-heading text-sm text-text-primary">{option.label}</p>
                                                                {option.description && <p className="font-ui text-[10px] text-text-muted mt-1">{option.description}</p>}
                                                                <div className="mt-2 flex items-center justify-between">
                                                                    <span className="font-display text-lg text-starforge-gold">{pct}%</span>
                                                                    <span className="font-ui text-[10px] text-text-muted">{option.votes} votes</span>
                                                                </div>
                                                                {hasVoted && (
                                                                    <div className="w-full bg-void-black/50 rounded-full h-1.5 mt-2">
                                                                        <div className="h-full rounded-full bg-starforge-gold transition-all duration-700" style={{ width: `${pct}%` }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isUserChoice && (
                                                                <div className="absolute top-2 right-2 bg-starforge-gold rounded-full p-1">
                                                                    <CheckCircle className="w-4 h-4 text-void-black" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => handleVote(project.id, option.id)}
                                                        disabled={hasVoted}
                                                        className={`w-full text-left rounded-sm border p-4 transition-all relative overflow-hidden ${isUserChoice
                                                            ? 'border-starforge-gold bg-starforge-gold/5'
                                                            : hasVoted
                                                                ? 'border-border bg-surface/50'
                                                                : 'border-border hover:border-starforge-gold/50 bg-surface/50'
                                                            }`}
                                                    >
                                                        {hasVoted && (
                                                            <div
                                                                className={`absolute inset-0 ${isWinning ? 'bg-starforge-gold/10' : 'bg-surface-elevated/30'} transition-all duration-700`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        )}
                                                        <div className="relative flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {isUserChoice && <CheckCircle className="w-4 h-4 text-starforge-gold" />}
                                                                <div>
                                                                    <p className={`font-heading text-sm ${isWinning && hasVoted ? 'text-starforge-gold' : 'text-text-primary'}`}>{option.label}</p>
                                                                    {option.description && <p className="font-ui text-[10px] text-text-muted mt-0.5">{option.description}</p>}
                                                                </div>
                                                            </div>
                                                            {hasVoted && (
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-display text-lg text-text-primary">{pct}%</span>
                                                                    <span className="font-ui text-[10px] text-text-muted">{option.votes}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                            <div className="flex items-center gap-2 font-ui text-xs text-text-muted">
                                                <Clock className="w-3 h-3" />
                                                {getDeadlineText(project.deadline)}
                                            </div>
                                            {!user && (
                                                <button onClick={signIn} className="flex items-center gap-1 font-ui text-xs text-starforge-gold hover:text-white transition-colors">
                                                    <LogIn className="w-3 h-3" /> Sign in to vote
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* ═══ FAN FICTION TAB ═══ */}
                {activeTab === 'fanfiction' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Write CTA */}
                        <div className="flex justify-between items-center">
                            <p className="font-body text-sm text-text-secondary">
                                Community stories set in the worlds of Rüna Atlas. Author-endorsed. Reader-created.
                            </p>
                            <button
                                onClick={() => user ? setShowFicForm(true) : signIn()}
                                className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors"
                            >
                                <PenTool className="w-4 h-4" /> Write
                            </button>
                        </div>

                        {/* Fan Fiction Form */}
                        <AnimatePresence>
                            {showFicForm && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <form onSubmit={handleSubmitFic} className="bg-surface border border-starforge-gold/30 rounded-sm p-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-heading text-lg text-text-primary">New Fan Fiction</h3>
                                            <button type="button" onClick={() => setShowFicForm(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input value={ficForm.title} onChange={e => setFicForm({ ...ficForm, title: e.target.value })} placeholder="Title" required className="bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm focus:border-starforge-gold outline-none" />
                                            <input value={ficForm.bookTitle} onChange={e => setFicForm({ ...ficForm, bookTitle: e.target.value })} placeholder="Based on (book title)" required className="bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm focus:border-starforge-gold outline-none" />
                                        </div>
                                        <textarea value={ficForm.excerpt} onChange={e => setFicForm({ ...ficForm, excerpt: e.target.value })} placeholder="Short excerpt (shown in listing)" rows={2} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm focus:border-starforge-gold outline-none resize-none" />
                                        <textarea value={ficForm.content} onChange={e => setFicForm({ ...ficForm, content: e.target.value })} placeholder="Full story content (Markdown supported)" rows={10} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-body text-sm focus:border-starforge-gold outline-none resize-none" />
                                        <input value={ficForm.tags} onChange={e => setFicForm({ ...ficForm, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm focus:border-starforge-gold outline-none" />
                                        <div className="flex justify-between items-center">
                                            <p className="font-ui text-[10px] text-text-muted">{ficForm.content.split(/\s+/).filter(Boolean).length} words</p>
                                            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
                                                <Send className="w-4 h-4" /> Publish
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Fiction Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fanfiction.map((fic, idx) => (
                                <motion.div
                                    key={fic.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-surface border border-border rounded-sm p-6 hover:border-starforge-gold/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-heading text-lg text-text-primary">{fic.title}</h3>
                                            <p className="font-ui text-xs text-text-muted">
                                                by <span className="text-aurora-teal">{fic.authorName}</span> &middot; {fic.wordCount.toLocaleString()} words
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleLikeFic(fic.id)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-ui transition-colors ${likedFics.includes(fic.id)
                                                ? 'bg-queer-pink/20 text-queer-pink'
                                                : 'bg-surface-elevated text-text-muted hover:text-queer-pink'
                                                }`}
                                        >
                                            <Heart className={`w-3 h-3 ${likedFics.includes(fic.id) ? 'fill-current' : ''}`} /> {fic.likes}
                                        </button>
                                    </div>
                                    <p className="font-ui text-[10px] text-starforge-gold uppercase tracking-wider mb-2">Set in: {fic.bookTitle}</p>
                                    <p className="font-body text-sm text-text-secondary leading-relaxed italic mb-3">"{fic.excerpt}"</p>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                        <div className="flex flex-wrap gap-1">
                                            {fic.tags.map(tag => (
                                                <span key={tag} className="font-mono text-[9px] text-text-muted bg-void-black px-1.5 py-0.5 rounded-sm border border-border">{tag}</span>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setReadingFic(fic)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-sm font-ui text-[10px] uppercase tracking-wider text-starforge-gold bg-starforge-gold/5 border border-starforge-gold/20 hover:bg-starforge-gold/20 transition-colors"
                                        >
                                            <BookOpen className="w-3 h-3" /> Read &middot; ~{Math.ceil(fic.wordCount / 250)} min
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ═══ WORLDBUILDING TAB ═══ */}
                {activeTab === 'worldbuilding' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="font-body text-sm text-text-secondary">
                                    A living encyclopedia of every world in the Rüna Atlas catalog. Readers and authors build the lore together.
                                </p>
                                <p className="font-ui text-[10px] text-text-muted mt-1">{worldEntries.length} entries across {new Set(worldEntries.map(e => e.bookTitle)).size} books</p>
                            </div>
                            <button
                                onClick={() => user ? setShowWorldForm(true) : signIn()}
                                className="flex items-center gap-2 px-4 py-2 bg-aurora-teal text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors shrink-0"
                            >
                                <Plus className="w-4 h-4" /> Contribute
                            </button>
                        </div>

                        {/* Search + Category Filters */}
                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    value={worldSearchTerm}
                                    onChange={e => setWorldSearchTerm(e.target.value)}
                                    placeholder="Search the encyclopedia..."
                                    className="w-full bg-surface border border-border rounded-sm px-4 py-3 pl-10 text-text-primary font-ui text-sm focus:border-aurora-teal outline-none"
                                />
                                <Eye className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {worldCategories.map(cat => {
                                    const count = cat === 'all' ? worldEntries.length : worldEntries.filter(e => e.category === cat).length;
                                    return (
                                        <button key={cat} onClick={() => setWorldFilterCat(cat)}
                                            className={`px-3 py-1.5 rounded-full font-ui text-xs transition-all flex items-center gap-1 ${worldFilterCat === cat
                                                ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30'
                                                : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                                                }`}
                                        >
                                            {cat === 'all' ? 'All' : cat}
                                            <span className="text-[9px] opacity-60">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* World Entry Form */}
                        <AnimatePresence>
                            {showWorldForm && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <form onSubmit={handleSubmitWorldEntry} className="bg-surface border border-aurora-teal/30 rounded-sm p-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-heading text-lg text-text-primary">New World Entry</h3>
                                            <button type="button" onClick={() => setShowWorldForm(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input value={worldForm.title} onChange={e => setWorldForm({ ...worldForm, title: e.target.value })} placeholder="Entry title" required className="bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm focus:border-aurora-teal outline-none" />
                                            <select value={worldForm.category} onChange={e => setWorldForm({ ...worldForm, category: e.target.value })} required className="bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm focus:border-aurora-teal outline-none">
                                                <option value="">Category</option>
                                                <option value="Magic">Magic Systems</option>
                                                <option value="Setting">Settings</option>
                                                <option value="Character">Characters</option>
                                                <option value="Flora">Flora & Fauna</option>
                                                <option value="History">History & Lore</option>
                                                <option value="Technology">Technology</option>
                                            </select>
                                            <input value={worldForm.bookTitle} onChange={e => setWorldForm({ ...worldForm, bookTitle: e.target.value })} placeholder="Related book" required className="bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm focus:border-aurora-teal outline-none" />
                                        </div>
                                        <textarea value={worldForm.content} onChange={e => setWorldForm({ ...worldForm, content: e.target.value })} placeholder="Entry content (be detailed and cite chapters where possible)" rows={6} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-body text-sm focus:border-aurora-teal outline-none resize-none" />
                                        <div className="flex justify-between items-center">
                                            <p className="font-ui text-[10px] text-text-muted">Entries are reviewed by the editorial team before publishing</p>
                                            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-aurora-teal text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
                                                <Send className="w-4 h-4" /> Submit
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Entries Grid */}
                        <div className="space-y-3">
                            {worldEntries
                                .filter(e => worldFilterCat === 'all' || e.category === worldFilterCat)
                                .filter(e => !worldSearchTerm || e.title.toLowerCase().includes(worldSearchTerm.toLowerCase()) || e.content.toLowerCase().includes(worldSearchTerm.toLowerCase()) || e.bookTitle.toLowerCase().includes(worldSearchTerm.toLowerCase()))
                                .map((entry, idx) => {
                                    const catColors: Record<string, string> = {
                                        Magic: 'text-cosmic-purple bg-cosmic-purple/10 border-cosmic-purple/30',
                                        Setting: 'text-aurora-teal bg-aurora-teal/10 border-aurora-teal/30',
                                        Character: 'text-starforge-gold bg-starforge-gold/10 border-starforge-gold/30',
                                        Flora: 'text-green-400 bg-green-400/10 border-green-400/30',
                                        History: 'text-ember-orange bg-ember-orange/10 border-ember-orange/30',
                                        Technology: 'text-queer-pink bg-queer-pink/10 border-queer-pink/30',
                                    };
                                    const relatedEntries = worldEntries.filter(e => e.bookTitle === entry.bookTitle && e.id !== entry.id).slice(0, 3);

                                    return (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="bg-surface border border-border rounded-sm overflow-hidden hover:border-aurora-teal/20 transition-colors"
                                        >
                                            <button
                                                onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                                                className="w-full text-left p-5 flex items-center justify-between hover:bg-surface-elevated/20 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 rounded-sm bg-aurora-teal/10 border border-aurora-teal/30 flex items-center justify-center shrink-0">
                                                        <Globe className="w-5 h-5 text-aurora-teal" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-heading text-base text-text-primary truncate">{entry.title}</h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border font-ui ${catColors[entry.category] || 'text-text-muted bg-surface border-border'}`}>{entry.category}</span>
                                                            <span className="font-ui text-[10px] text-text-muted">{entry.bookTitle}</span>
                                                            <span className="font-ui text-[10px] text-text-muted">&middot; {entry.contributors.length} contributor{entry.contributors.length !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {expandedEntry === entry.id ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
                                            </button>
                                            <AnimatePresence>
                                                {expandedEntry === entry.id && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                                        <div className="px-5 pb-5 border-t border-border pt-4">
                                                            <p className="font-body text-sm text-text-secondary leading-relaxed whitespace-pre-line">{entry.content}</p>
                                                            <div className="mt-5 pt-4 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <Users className="w-3 h-3 text-text-muted shrink-0" />
                                                                    {entry.contributors.map((c, i) => (
                                                                        <span key={i} className="font-ui text-[10px] px-2 py-0.5 bg-void-black border border-border rounded-full text-text-muted">{c}</span>
                                                                    ))}
                                                                </div>
                                                                {entry.approved && (
                                                                    <span className="font-ui text-[10px] text-aurora-teal flex items-center gap-1">
                                                                        <CheckCircle className="w-3 h-3" /> Verified by Editorial Team
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Related entries */}
                                                            {relatedEntries.length > 0 && (
                                                                <div className="mt-4 pt-3 border-t border-border/50">
                                                                    <p className="font-ui text-[10px] text-text-muted uppercase tracking-widest mb-2">Related entries in {entry.bookTitle}</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {relatedEntries.map(r => (
                                                                            <button key={r.id} onClick={() => { setExpandedEntry(r.id); }}
                                                                                className="flex items-center gap-1 px-2 py-1 bg-void-black border border-border rounded-sm font-ui text-[10px] text-text-muted hover:text-aurora-teal hover:border-aurora-teal/30 transition-colors">
                                                                                <ArrowRight className="w-2.5 h-2.5" /> {r.title}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                        </div>
                    </motion.div>
                )}

                {/* Fan Fiction Reading Modal */}
                <AnimatePresence>
                    {readingFic && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-void-black/95 z-50 overflow-y-auto" onClick={() => setReadingFic(null)}>
                            <div className="max-w-3xl mx-auto px-6 py-12" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <p className="font-ui text-[10px] text-starforge-gold uppercase tracking-widest mb-1">Fan Fiction &middot; Set in: {readingFic.bookTitle}</p>
                                        <h2 className="font-heading text-3xl text-text-primary">{readingFic.title}</h2>
                                        <p className="font-ui text-xs text-text-muted mt-1">
                                            by <span className="text-aurora-teal">{readingFic.authorName}</span> &middot; {readingFic.wordCount.toLocaleString()} words &middot; ~{Math.ceil(readingFic.wordCount / 250)} min read
                                        </p>
                                    </div>
                                    <button onClick={() => setReadingFic(null)} className="text-text-muted hover:text-text-primary p-2">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="font-body text-[17px] leading-[1.9] text-text-primary/85 whitespace-pre-line">
                                    {readingFic.content || readingFic.excerpt}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-8 pt-4 border-t border-border">
                                    {readingFic.tags.map(tag => (
                                        <span key={tag} className="font-mono text-[9px] text-text-muted bg-surface px-1.5 py-0.5 rounded-sm border border-border">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

