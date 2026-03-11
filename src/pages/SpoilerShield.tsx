import { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, BookOpen, Lock, Unlock, MessageCircle, Heart, ChevronDown,
    ChevronUp, Send, Eye, EyeOff, AlertTriangle, User, ThumbsUp,
    Clock, Filter, ArrowRight, Sparkles, CheckCircle
} from 'lucide-react';

// ═══════════════════════════════════════════
// SPOILER SHIELD — Chapter-Gated Discussions
// ═══════════════════════════════════════════

interface Discussion {
    id: string;
    chapterNum: number;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
    likes: number;
    replies: Reply[];
    spoilerLevel: 'safe' | 'mild' | 'heavy';
    tags: string[];
}

interface Reply {
    id: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
    likes: number;
}

const BOOK = {
    title: 'The Obsidian Crown',
    author: 'Elara Vance',
    totalChapters: 24,
    cover: 'https://picsum.photos/seed/obsidian/400/600',
};

const CHAPTERS = Array.from({ length: 24 }, (_, i) => ({
    num: i + 1,
    title: [
        'The Dust of Ages', 'The Ember Codex', 'Bones of the Forgotten', 'A City of Ash',
        'The Marrow Gate', 'Fire and Memory', 'The Weight of Crowns', 'Bonds of Fire',
        'The Iron Archive', 'Vessels of Light', 'What the Dead Know', 'The Burning Court',
        'A Storm of Glass', 'The Hollow Saints', 'Roots and Ruin', 'The Second Breath',
        'Tides of Obsidian', 'The Naming Rite', 'Blood and Geometry', 'The Final Veil',
        'Ascension', 'The Crown Descends', 'What Remains', 'Epilogue: Stars and Dust',
    ][i],
    discussions: Math.floor(Math.random() * 30) + 3,
}));

const SEED_DISCUSSIONS: Discussion[] = [
    {
        id: 'd1', chapterNum: 1, author: 'star_reader_42', avatar: '🌟',
        text: 'The way Elara describes the library in the opening paragraph gave me chills. "The library smelled of old paper and forgotten dreams" — that line alone sold me on this entire book.',
        timestamp: '2 hours ago', likes: 47, spoilerLevel: 'safe', tags: ['prose', 'atmosphere'],
        replies: [
            { id: 'r1', author: 'midnight_ink', avatar: '🖋️', text: 'Same! The synesthesia between smell and emotional state is so well done. It immediately tells you this is a world where objects have memory.', timestamp: '1 hour ago', likes: 12 },
            { id: 'r2', author: 'the_chronicler', avatar: '📖', text: 'I love that it\'s not "dusty old library" cliché. "Forgotten dreams" implies the books themselves had agency.', timestamp: '45 min ago', likes: 8 },
        ],
    },
    {
        id: 'd2', chapterNum: 1, author: 'prose_hunter', avatar: '🔍',
        text: 'Can we talk about the magic system introduction? "Magic drawn from the bones of fallen gods" — the Marrow System is already the most original magic system I\'ve read in years. The implications of a necromantic-adjacent magic that isn\'t evil-coded are huge.',
        timestamp: '5 hours ago', likes: 83, spoilerLevel: 'safe', tags: ['magic system', 'worldbuilding'],
        replies: [
            { id: 'r3', author: 'fantasy_scholar', avatar: '🧙', text: 'The fact that it\'s called the "Marrow System" and not something flashy says everything about the tone. This is body horror magic and I am HERE for it.', timestamp: '4 hours ago', likes: 31 },
        ],
    },
    {
        id: 'd3', chapterNum: 2, author: 'the_archivist', avatar: '📚',
        text: 'The Watchers! When they appeared in the alley I literally gasped. The way they\'re described as having "the wrong number of shadows" is so unsettling. Vance is incredibly good at making you feel dread without over-explaining.',
        timestamp: '1 day ago', likes: 61, spoilerLevel: 'mild', tags: ['antagonists', 'horror'],
        replies: [
            { id: 'r4', author: 'dark_pages', avatar: '🌑', text: 'The shadow detail is genius because it works on multiple levels — literally wrong AND metaphorically suggesting they exist in multiple planes simultaneously.', timestamp: '20 hours ago', likes: 19 },
        ],
    },
    {
        id: 'd4', chapterNum: 3, author: 'bones_and_dust', avatar: '💀',
        text: '"Her blood was the key. Of course it was. It always was, in the old stories, the ones that ended badly." This meta-awareness without breaking immersion is PEAK fantasy writing. She knows the tropes and weaponizes them.',
        timestamp: '3 days ago', likes: 112, spoilerLevel: 'safe', tags: ['prose', 'meta-narrative'],
        replies: [],
    },
    {
        id: 'd5', chapterNum: 4, author: 'city_walker', avatar: '🏙️',
        text: 'The entire Ash Quarter sequence feels like a love letter to Gormenghast and New Weird fiction. The architecture that "breathes" and the streets that rearrange themselves at night — I need a full map of this city.',
        timestamp: '2 days ago', likes: 45, spoilerLevel: 'safe', tags: ['worldbuilding', 'setting'],
        replies: [
            { id: 'r5', author: 'cartographer_', avatar: '🗺️', text: 'Someone in the world wiki is actually building a map! Check The Forge.', timestamp: '1 day ago', likes: 14 },
        ],
    },
    {
        id: 'd6', chapterNum: 5, author: 'theory_crafter', avatar: '🧠',
        text: '[THEORY] The Marrow Gate isn\'t just a gate — it\'s a test. Notice how the inscription changes depending on who reads it? I think the gate is sentient and selects its travelers based on their relationship with death.',
        timestamp: '12 hours ago', likes: 94, spoilerLevel: 'mild', tags: ['theory', 'magic system'],
        replies: [
            { id: 'r6', author: 'pattern_seeker', avatar: '🔮', text: 'This tracks. The inscription Elara reads mentions "the weight you carry" while the scholar reference mentions "the weight you refuse." Same gate, different reading.', timestamp: '8 hours ago', likes: 27 },
            { id: 'r7', author: 'rune_reader', avatar: '✨', text: 'Adding to this: re-read Ch.3 where she first touches the gate material. It\'s described as "warm, like holding a hand." It IS alive.', timestamp: '6 hours ago', likes: 22 },
        ],
    },
    {
        id: 'd7', chapterNum: 8, author: 'heartbreak_hotel', avatar: '💔',
        text: 'I need to talk about the Kael scene. When he says "I didn\'t follow you to save you. I followed because the world is less interesting when you\'re not in it." I had to put the book down. That\'s not a romance line, that\'s a thesis statement about companionship.',
        timestamp: '6 hours ago', likes: 156, spoilerLevel: 'heavy', tags: ['characters', 'romance', 'emotional'],
        replies: [
            { id: 'r8', author: 'quietly_crying', avatar: '😭', text: 'This line WRECKED me. It\'s so much better than "I love you" because it\'s about curiosity and fascination, not possession.', timestamp: '5 hours ago', likes: 43 },
        ],
    },
    {
        id: 'd8', chapterNum: 12, author: 'endgame_theorist', avatar: '♟️',
        text: 'The Burning Court reveal changes EVERYTHING about chapters 1-4. Go back and re-read the library scene knowing what the Court actually is. The "forgotten dreams" aren\'t metaphorical. They\'re literal trapped consciousnesses.',
        timestamp: '4 days ago', likes: 201, spoilerLevel: 'heavy', tags: ['theory', 're-read', 'mind-blown'],
        replies: [],
    },
];

export default function SpoilerShield() {
    const [currentChapter, setCurrentChapter] = useState(5);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [showChapterPicker, setShowChapterPicker] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [viewMode, setViewMode] = useState<'all' | 'chapter'>('all');
    const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
    const [hoveredLocked, setHoveredLocked] = useState<number | null>(null);
    const [discussions, setDiscussions] = useState<Discussion[]>(SEED_DISCUSSIONS);

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'spoiler_discussions'), orderBy('likes', 'desc')),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Discussion));
                if (data.length > 0) setDiscussions(data);
            },
            () => { }
        );
        return () => unsub();
    }, []);

    // Only show discussions up to reader's current chapter
    const visibleDiscussions = useMemo(() => {
        let filtered = discussions.filter(d => d.chapterNum <= currentChapter);
        if (selectedChapter !== null) {
            filtered = filtered.filter(d => d.chapterNum === selectedChapter);
        }
        return filtered.sort((a, b) =>
            sortBy === 'popular' ? b.likes - a.likes : 0
        );
    }, [currentChapter, selectedChapter, sortBy]);

    const lockedDiscussionCount = discussions.filter(d => d.chapterNum > currentChapter).length;

    const toggleLike = (id: string) => {
        setLikedPosts(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleReplies = (id: string) => {
        setExpandedReplies(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const spoilerBadge = (level: Discussion['spoilerLevel']) => {
        const styles = {
            safe: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            mild: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            heavy: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        const labels = { safe: 'Spoiler-Free', mild: 'Mild Spoilers', heavy: 'Heavy Spoilers' };
        return (
            <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border ${styles[level]}`}>
                {labels[level]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* ═══ Header ═══ */}
            <div className="border-b border-white/[0.06] bg-void-black/80 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-aurora-teal/10 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-aurora-teal" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                                    Spoiler Shield
                                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-aurora-teal/10 text-aurora-teal rounded border border-aurora-teal/20">Beta</span>
                                </h1>
                                <p className="text-xs text-text-secondary">{BOOK.title} by {BOOK.author}</p>
                            </div>
                        </div>

                        {/* Chapter Progress */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary">You're on:</span>
                            <div className="relative">
                                <button onClick={() => setShowChapterPicker(!showChapterPicker)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg hover:border-aurora-teal/30 transition-colors text-sm">
                                    <BookOpen className="w-4 h-4 text-aurora-teal" />
                                    Chapter {currentChapter} of {BOOK.totalChapters}
                                    <ChevronDown className="w-3 h-3 text-text-secondary" />
                                </button>

                                <AnimatePresence>
                                    {showChapterPicker && (
                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                            className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a2e] border border-white/[0.1] rounded-lg shadow-2xl max-h-80 overflow-y-auto z-50">
                                            <div className="p-3 border-b border-white/[0.06]">
                                                <p className="text-xs text-text-secondary">Set your reading progress to unlock discussions</p>
                                            </div>
                                            {CHAPTERS.map(ch => (
                                                <button key={ch.num} onClick={() => { setCurrentChapter(ch.num); setShowChapterPicker(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-white/[0.04] transition-colors
                                                        ${ch.num === currentChapter ? 'bg-aurora-teal/10 text-aurora-teal' : ch.num <= currentChapter ? 'text-white' : 'text-white/30'}`}>
                                                    <span className="flex items-center gap-3">
                                                        {ch.num <= currentChapter ? (
                                                            <Unlock className="w-3.5 h-3.5 text-aurora-teal" />
                                                        ) : (
                                                            <Lock className="w-3.5 h-3.5 text-white/20" />
                                                        )}
                                                        <span>Ch. {ch.num}: {ch.title}</span>
                                                    </span>
                                                    <span className="text-[10px] text-text-secondary">{ch.discussions} 💬</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex gap-8">
                    {/* ═══ Sidebar: Chapter Navigator ═══ */}
                    <div className="hidden lg:block w-64 flex-none">
                        <div className="sticky top-24">
                            <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-semibold">Chapters</h3>
                            <div className="space-y-1">
                                <button onClick={() => setSelectedChapter(null)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedChapter === null ? 'bg-aurora-teal/10 text-aurora-teal' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'}`}>
                                    All Unlocked ({visibleDiscussions.length})
                                </button>
                                {CHAPTERS.map(ch => {
                                    const isLocked = ch.num > currentChapter;
                                    const isSelected = selectedChapter === ch.num;
                                    const count = discussions.filter(d => d.chapterNum === ch.num && d.chapterNum <= currentChapter).length;
                                    return (
                                        <button key={ch.num}
                                            onClick={() => !isLocked && setSelectedChapter(isSelected ? null : ch.num)}
                                            onMouseEnter={() => isLocked && setHoveredLocked(ch.num)}
                                            onMouseLeave={() => setHoveredLocked(null)}
                                            disabled={isLocked}
                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-all flex items-center justify-between
                                                ${isLocked ? 'text-white/15 cursor-not-allowed' : isSelected ? 'bg-aurora-teal/10 text-aurora-teal' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'}`}>
                                            <span className="flex items-center gap-2 truncate">
                                                {isLocked ? <Lock className="w-3 h-3 flex-none" /> : <span className="w-3 text-center flex-none text-[10px]">{ch.num}</span>}
                                                <span className="truncate">{ch.title}</span>
                                            </span>
                                            {!isLocked && count > 0 && (
                                                <span className="text-[10px] text-text-secondary flex-none">{count}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Locked notice */}
                            {lockedDiscussionCount > 0 && (
                                <div className="mt-6 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <EyeOff className="w-4 h-4 text-aurora-teal" />
                                        <span className="text-xs text-white font-semibold">Shield Active</span>
                                    </div>
                                    <p className="text-[11px] text-text-secondary leading-relaxed">
                                        {lockedDiscussionCount} discussion{lockedDiscussionCount > 1 ? 's' : ''} hidden from chapters you haven't reached yet. Update your progress to unlock.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══ Main Discussion Feed ═══ */}
                    <div className="flex-1 min-w-0">
                        {/* Controls */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white font-semibold">
                                    {selectedChapter !== null
                                        ? `Chapter ${selectedChapter}: ${CHAPTERS[selectedChapter - 1]?.title}`
                                        : 'All Discussions'}
                                </span>
                                <span className="text-xs text-text-secondary">({visibleDiscussions.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setSortBy('popular')}
                                    className={`px-3 py-1.5 text-xs rounded transition-colors ${sortBy === 'popular' ? 'bg-aurora-teal/10 text-aurora-teal' : 'text-text-secondary hover:text-white'}`}>
                                    Popular
                                </button>
                                <button onClick={() => setSortBy('recent')}
                                    className={`px-3 py-1.5 text-xs rounded transition-colors ${sortBy === 'recent' ? 'bg-aurora-teal/10 text-aurora-teal' : 'text-text-secondary hover:text-white'}`}>
                                    Recent
                                </button>
                            </div>
                        </div>

                        {/* New comment box */}
                        <div className="mb-8 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-aurora-teal/10 flex items-center justify-center text-sm flex-none">
                                    👤
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={`Share your thoughts on ${selectedChapter ? `Chapter ${selectedChapter}` : 'the book'}... (spoiler-safe for Ch. 1–${currentChapter})`}
                                        className="w-full bg-transparent text-sm text-white placeholder:text-text-secondary/50 resize-none outline-none min-h-[60px]"
                                        rows={2}
                                    />
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-text-secondary">Visible to readers on Ch. 1–{currentChapter}</span>
                                        </div>
                                        <button className="px-4 py-1.5 bg-aurora-teal text-void-black text-xs font-semibold rounded hover:bg-aurora-teal/90 transition-colors flex items-center gap-1.5">
                                            <Send className="w-3 h-3" /> Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Discussion threads */}
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {visibleDiscussions.map((disc) => (
                                    <motion.div key={disc.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] transition-colors">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-sm">
                                                    {disc.avatar}
                                                </div>
                                                <div>
                                                    <span className="text-sm text-white font-medium">{disc.author}</span>
                                                    <span className="text-[10px] text-text-secondary ml-2">• {disc.timestamp}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-text-secondary px-2 py-0.5 bg-white/[0.04] rounded">Ch. {disc.chapterNum}</span>
                                                {spoilerBadge(disc.spoilerLevel)}
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <p className="text-sm text-white/85 leading-relaxed mb-3">{disc.text}</p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {disc.tags.map(tag => (
                                                <span key={tag} className="text-[10px] text-text-secondary px-2 py-0.5 bg-white/[0.03] rounded-full border border-white/[0.06]">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => toggleLike(disc.id)}
                                                className={`flex items-center gap-1.5 text-xs transition-colors ${likedPosts.has(disc.id) ? 'text-aurora-teal' : 'text-text-secondary hover:text-white'}`}>
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                {disc.likes + (likedPosts.has(disc.id) ? 1 : 0)}
                                            </button>
                                            {disc.replies.length > 0 && (
                                                <button onClick={() => toggleReplies(disc.id)}
                                                    className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-white transition-colors">
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                    {disc.replies.length} {disc.replies.length === 1 ? 'reply' : 'replies'}
                                                    {expandedReplies.has(disc.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                </button>
                                            )}
                                        </div>

                                        {/* Replies */}
                                        <AnimatePresence>
                                            {expandedReplies.has(disc.id) && disc.replies.length > 0 && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                    className="mt-4 pt-4 border-t border-white/[0.04] space-y-3 overflow-hidden">
                                                    {disc.replies.map(reply => (
                                                        <div key={reply.id} className="flex gap-3 pl-4 border-l-2 border-white/[0.06]">
                                                            <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs flex-none">
                                                                {reply.avatar}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs text-white font-medium">{reply.author}</span>
                                                                    <span className="text-[10px] text-text-secondary">{reply.timestamp}</span>
                                                                </div>
                                                                <p className="text-xs text-white/75 leading-relaxed">{reply.text}</p>
                                                                <button onClick={() => toggleLike(reply.id)}
                                                                    className={`mt-1 flex items-center gap-1 text-[10px] transition-colors ${likedPosts.has(reply.id) ? 'text-aurora-teal' : 'text-text-secondary hover:text-white'}`}>
                                                                    <ThumbsUp className="w-3 h-3" /> {reply.likes + (likedPosts.has(reply.id) ? 1 : 0)}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Locked content teaser */}
                        {lockedDiscussionCount > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="mt-8 p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] rounded-lg text-center">
                                <div className="w-14 h-14 rounded-full bg-aurora-teal/10 mx-auto flex items-center justify-center mb-4">
                                    <Shield className="w-7 h-7 text-aurora-teal" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {lockedDiscussionCount} More Discussion{lockedDiscussionCount > 1 ? 's' : ''} Behind the Shield
                                </h3>
                                <p className="text-sm text-text-secondary max-w-md mx-auto mb-4">
                                    Keep reading to unlock discussions for chapters {currentChapter + 1}–{BOOK.totalChapters}.
                                    Your spoiler shield is protecting you from {lockedDiscussionCount} thread{lockedDiscussionCount > 1 ? 's' : ''} that discuss future events.
                                </p>
                                <div className="flex items-center justify-center gap-6 text-xs text-text-secondary">
                                    <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Ch. 1–{currentChapter} unlocked</span>
                                    <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-white/20" /> Ch. {currentChapter + 1}–{BOOK.totalChapters} shielded</span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
