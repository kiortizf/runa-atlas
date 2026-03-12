import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot, query, orderBy, doc, addDoc, updateDoc, increment, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAnnotations } from '../hooks/useAnnotations';
import { useModeration } from '../hooks/useModeration';
import { useAccessControl } from '../hooks/useAccessControl';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, BookOpen, Lock, Unlock, MessageCircle, Heart, ChevronDown,
    ChevronUp, Send, Eye, EyeOff, AlertTriangle, User, ThumbsUp,
    Clock, Filter, ArrowRight, Sparkles, CheckCircle, Flag, X, Ban
} from 'lucide-react';

// ═══════════════════════════════════════════
// SPOILER SHIELD — Chapter-Gated Discussions
// Fully wired to Firestore with moderation
// ═══════════════════════════════════════════

interface Discussion {
    id: string;
    chapterNum: number;
    author: string;
    authorId: string;
    avatar: string;
    text: string;
    timestamp: string;
    likes: number;
    replies: Reply[];
    spoilerLevel: 'safe' | 'mild' | 'heavy';
    tags: string[];
    hidden?: boolean;
    createdAt?: any;
}

interface Reply {
    id: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
    likes: number;
}

interface SpoilerBook {
    title: string;
    author: string;
    totalChapters: number;
    cover: string;
    chapters: { num: number; title: string; discussions: number }[];
}

// ── Report Modal ──
function ReportModal({ contentId, contentType, collectionPath, onClose }: {
    contentId: string;
    contentType: 'discussion' | 'reply';
    collectionPath: string;
    onClose: () => void;
}) {
    const { reportContent, reporting, reportSuccess } = useModeration();
    const [reason, setReason] = useState<'spam' | 'harassment' | 'hate_speech' | 'inappropriate' | 'spoiler' | 'other'>('inappropriate');
    const [details, setDetails] = useState('');

    const handleSubmit = async () => {
        await reportContent(contentId, contentType, collectionPath, reason, details);
        setTimeout(onClose, 1500);
    };

    const REASONS = [
        { value: 'spam' as const, label: 'Spam', icon: '🚫' },
        { value: 'harassment' as const, label: 'Harassment', icon: '⚠️' },
        { value: 'hate_speech' as const, label: 'Hate Speech', icon: '🛑' },
        { value: 'inappropriate' as const, label: 'Inappropriate', icon: '❌' },
        { value: 'spoiler' as const, label: 'Unmarked Spoiler', icon: '👁️' },
        { value: 'other' as const, label: 'Other', icon: '📝' },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md bg-[#12121f] border border-white/[0.1] rounded-xl p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}>
                {reportSuccess ? (
                    <div className="text-center py-6">
                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-1">Report Submitted</h3>
                        <p className="text-sm text-text-secondary">Thank you. Our team will review this content.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Flag className="w-4 h-4 text-red-400" />
                                <h3 className="text-lg font-semibold text-white">Report Content</h3>
                            </div>
                            <button onClick={onClose} className="p-1 text-text-secondary hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-text-secondary mb-4">Select a reason for reporting this content:</p>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {REASONS.map(r => (
                                <button key={r.value} onClick={() => setReason(r.value)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors border
                                        ${reason === r.value
                                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                            : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]'}`}>
                                    <span>{r.icon}</span> {r.label}
                                </button>
                            ))}
                        </div>

                        <textarea value={details} onChange={e => setDetails(e.target.value)}
                            placeholder="Additional details (optional)..."
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 text-sm text-white placeholder:text-text-secondary/50 resize-none outline-none mb-4"
                            rows={3} />

                        <div className="flex gap-3">
                            <button onClick={onClose}
                                className="flex-1 px-4 py-2.5 text-sm text-text-secondary bg-white/[0.04] rounded-lg hover:bg-white/[0.06] transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} disabled={reporting}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {reporting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
                                {reporting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

export default function SpoilerShield() {
    const { user } = useAuth();
    const { canAccess, isBanned } = useAccessControl();
    const { validateContent, canPost, recordPost } = useModeration();

    // ── Reading progress from Firestore ──
    // Try to load reading progress for the first spoiler_book
    const [bookId, setBookId] = useState<string>('');
    const { readingProgress } = useAnnotations({
        bookId: bookId || 'placeholder',
        chapterId: '1',
        userId: user?.uid,
    });

    // Derive chapter from reading progress, fallback to 1
    const progressChapter = readingProgress?.currentChapter
        ? parseInt(readingProgress.currentChapter, 10)
        : null;

    const [manualChapter, setManualChapter] = useState<number | null>(null);

    // Use reading progress if available, manual override if set, default to 1
    const currentChapter = manualChapter ?? progressChapter ?? 1;

    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [showChapterPicker, setShowChapterPicker] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [spoilerLevel, setSpoilerLevel] = useState<'safe' | 'mild' | 'heavy'>('safe');
    const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
    const [hoveredLocked, setHoveredLocked] = useState<number | null>(null);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [book, setBook] = useState<SpoilerBook>({ title: '', author: '', totalChapters: 0, cover: '', chapters: [] });
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState('');
    const [profanityWarning, setProfanityWarning] = useState('');
    const [rateLimitWarning, setRateLimitWarning] = useState('');
    const [reportTarget, setReportTarget] = useState<{ id: string; type: 'discussion' | 'reply' } | null>(null);

    // ── Load book from Firestore ──
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'spoiler_books'), (snap) => {
            if (snap.docs.length > 0) {
                const data = snap.docs[0].data() as SpoilerBook;
                setBook({ ...data, chapters: data.chapters || [] });
                // Use the book doc ID to look up reading progress
                setBookId(snap.docs[0].id);
            }
        }, () => { });
        return () => unsub();
    }, []);

    const BOOK = book;
    const CHAPTERS = book.chapters;

    // ── Load discussions from Firestore ──
    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'spoiler_discussions'), orderBy('likes', 'desc')),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Discussion));
                setDiscussions(data.filter(d => !d.hidden));
            },
            () => { }
        );
        return () => unsub();
    }, []);

    // ── Load user's liked posts from Firestore ──
    useEffect(() => {
        if (!user?.uid) return;
        const unsub = onSnapshot(
            collection(db, `users/${user.uid}/spoilerLikes`),
            (snap) => {
                const liked = new Set(snap.docs.map(d => d.id));
                setLikedPosts(liked);
            },
            () => { }
        );
        return () => unsub();
    }, [user?.uid]);

    // ── Filtered discussions ──
    const visibleDiscussions = useMemo(() => {
        let filtered = discussions.filter(d => d.chapterNum <= currentChapter);
        if (selectedChapter !== null) {
            filtered = filtered.filter(d => d.chapterNum === selectedChapter);
        }
        return filtered.sort((a, b) =>
            sortBy === 'popular' ? b.likes - a.likes : 0
        );
    }, [currentChapter, selectedChapter, sortBy, discussions]);

    const lockedDiscussionCount = discussions.filter(d => d.chapterNum > currentChapter).length;

    // ── Like — persists to Firestore ──
    const toggleLike = useCallback(async (discussionId: string) => {
        if (!user?.uid) return;

        const likeRef = doc(db, `users/${user.uid}/spoilerLikes`, discussionId);
        const discussionRef = doc(db, 'spoiler_discussions', discussionId);
        const alreadyLiked = likedPosts.has(discussionId);

        // Optimistic update
        setLikedPosts(prev => {
            const next = new Set(prev);
            alreadyLiked ? next.delete(discussionId) : next.add(discussionId);
            return next;
        });

        try {
            if (alreadyLiked) {
                await deleteDoc(likeRef);
                await updateDoc(discussionRef, { likes: increment(-1) });
            } else {
                await setDoc(likeRef, { likedAt: serverTimestamp() });
                await updateDoc(discussionRef, { likes: increment(1) });
            }
        } catch {
            // Revert optimistic update on error
            setLikedPosts(prev => {
                const next = new Set(prev);
                alreadyLiked ? next.add(discussionId) : next.delete(discussionId);
                return next;
            });
        }
    }, [user?.uid, likedPosts]);

    const toggleReplies = (id: string) => {
        setExpandedReplies(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ── Post Discussion — writes to Firestore ──
    const handlePost = useCallback(async () => {
        if (!user || !newComment.trim()) return;

        // Check ban
        if (isBanned) {
            setPostError('Your account has been suspended from posting.');
            return;
        }

        // Check access
        if (!canAccess('spoiler_discussions.post')) {
            setPostError('You need to be a member to post discussions.');
            return;
        }

        // Rate limit check
        const rateCheck = canPost();
        if (!rateCheck.allowed) {
            setRateLimitWarning(`Please wait ${rateCheck.waitSeconds}s before posting again.`);
            setTimeout(() => setRateLimitWarning(''), 3000);
            return;
        }

        // Profanity check
        const profanityCheck = validateContent(newComment);
        if (!profanityCheck.clean) {
            if (profanityCheck.severity === 'severe') {
                setPostError('This content contains language that violates our community guidelines and cannot be posted.');
                return;
            }
            setProfanityWarning('Your post may contain inappropriate language. Please review before posting.');
            return;
        }

        setPosting(true);
        setPostError('');
        setProfanityWarning('');

        try {
            await addDoc(collection(db, 'spoiler_discussions'), {
                chapterNum: selectedChapter || currentChapter,
                author: user.displayName || 'Anonymous Reader',
                authorId: user.uid,
                avatar: '👤',
                text: newComment.trim(),
                timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                likes: 0,
                replies: [],
                spoilerLevel,
                tags: [],
                hidden: false,
                createdAt: serverTimestamp(),
            });
            setNewComment('');
            setSpoilerLevel('safe');
            recordPost(); // Track for rate limiting
        } catch (error) {
            setPostError('Failed to post. Please try again.');
        } finally {
            setPosting(false);
        }
    }, [user, newComment, currentChapter, selectedChapter, spoilerLevel, isBanned, canAccess, canPost, validateContent, recordPost]);

    // ── Check profanity as user types (debounced) ──
    useEffect(() => {
        if (!newComment.trim()) {
            setProfanityWarning('');
            return;
        }
        const timer = setTimeout(() => {
            const result = validateContent(newComment);
            if (!result.clean && result.severity === 'severe') {
                setProfanityWarning('⚠️ This content contains prohibited language.');
            } else {
                setProfanityWarning('');
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [newComment, validateContent]);

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
                            {progressChapter && !manualChapter && (
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Auto-synced
                                </span>
                            )}
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
                                                <p className="text-xs text-text-secondary">
                                                    {progressChapter
                                                        ? 'Your reading progress is auto-synced. Override below:'
                                                        : 'Set your reading progress to unlock discussions'}
                                                </p>
                                                {manualChapter && (
                                                    <button onClick={() => { setManualChapter(null); setShowChapterPicker(false); }}
                                                        className="mt-2 text-[10px] text-aurora-teal hover:underline">
                                                        ↩ Reset to auto-synced progress
                                                    </button>
                                                )}
                                            </div>
                                            {CHAPTERS.map(ch => (
                                                <button key={ch.num} onClick={() => { setManualChapter(ch.num); setShowChapterPicker(false); }}
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

                        {/* Banned notice */}
                        {isBanned && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                                <Ban className="w-5 h-5 text-red-400 flex-none" />
                                <div>
                                    <p className="text-sm text-red-400 font-semibold">Account Suspended</p>
                                    <p className="text-xs text-text-secondary">You are currently unable to post or interact with discussions.</p>
                                </div>
                            </div>
                        )}

                        {/* New comment box */}
                        {user && !isBanned ? (
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

                                    {/* Profanity / Rate Limit Warnings */}
                                    {profanityWarning && (
                                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400">
                                            <AlertTriangle className="w-3.5 h-3.5 flex-none" /> {profanityWarning}
                                        </div>
                                    )}
                                    {rateLimitWarning && (
                                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400">
                                            <Clock className="w-3.5 h-3.5 flex-none" /> {rateLimitWarning}
                                        </div>
                                    )}
                                    {postError && (
                                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                                            <AlertTriangle className="w-3.5 h-3.5 flex-none" /> {postError}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                                        <div className="flex items-center gap-3">
                                            {/* Spoiler Level Selector */}
                                            <div className="flex items-center gap-1">
                                                {(['safe', 'mild', 'heavy'] as const).map(level => {
                                                    const colors = {
                                                        safe: spoilerLevel === 'safe' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'text-text-secondary border-transparent',
                                                        mild: spoilerLevel === 'mild' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'text-text-secondary border-transparent',
                                                        heavy: spoilerLevel === 'heavy' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'text-text-secondary border-transparent',
                                                    };
                                                    return (
                                                        <button key={level} onClick={() => setSpoilerLevel(level)}
                                                            className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border transition-colors ${colors[level]}`}>
                                                            {level}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <span className="text-[10px] text-text-secondary">Ch. 1–{currentChapter}</span>
                                        </div>
                                        <button onClick={handlePost} disabled={posting || !newComment.trim()}
                                            className="px-4 py-1.5 bg-aurora-teal text-void-black text-xs font-semibold rounded hover:bg-aurora-teal/90 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                                            {posting ? <Clock className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                            {posting ? 'Posting...' : 'Post'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ) : !user ? (
                        <div className="mb-8 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg text-center">
                            <p className="text-sm text-text-secondary mb-3">Sign in to join the discussion and share your thoughts</p>
                            <a href="/portal" className="inline-flex items-center gap-2 px-5 py-2 bg-aurora-teal/10 text-aurora-teal text-xs font-semibold border border-aurora-teal/20 rounded-lg hover:bg-aurora-teal/20 transition-colors">
                                <MessageCircle className="w-3.5 h-3.5" /> Sign In to Discuss
                            </a>
                        </div>
                        ) : null}

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
                                        {disc.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {disc.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] text-text-secondary px-2 py-0.5 bg-white/[0.03] rounded-full border border-white/[0.06]">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => toggleLike(disc.id)}
                                                className={`flex items-center gap-1.5 text-xs transition-colors ${likedPosts.has(disc.id) ? 'text-aurora-teal' : 'text-text-secondary hover:text-white'}`}>
                                                <ThumbsUp className={`w-3.5 h-3.5 ${likedPosts.has(disc.id) ? 'fill-current' : ''}`} />
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
                                            {/* Report button */}
                                            {user && (
                                                <button onClick={() => setReportTarget({ id: disc.id, type: 'discussion' })}
                                                    className="flex items-center gap-1 text-xs text-text-secondary/50 hover:text-red-400 transition-colors ml-auto"
                                                    title="Report this post">
                                                    <Flag className="w-3 h-3" />
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
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <button onClick={() => toggleLike(reply.id)}
                                                                        className={`flex items-center gap-1 text-[10px] transition-colors ${likedPosts.has(reply.id) ? 'text-aurora-teal' : 'text-text-secondary hover:text-white'}`}>
                                                                        <ThumbsUp className={`w-3 h-3 ${likedPosts.has(reply.id) ? 'fill-current' : ''}`} /> {reply.likes + (likedPosts.has(reply.id) ? 1 : 0)}
                                                                    </button>
                                                                    {user && (
                                                                        <button onClick={() => setReportTarget({ id: reply.id, type: 'reply' })}
                                                                            className="text-text-secondary/30 hover:text-red-400 transition-colors"
                                                                            title="Report">
                                                                            <Flag className="w-2.5 h-2.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
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

            {/* ═══ Report Modal ═══ */}
            <AnimatePresence>
                {reportTarget && (
                    <ReportModal
                        contentId={reportTarget.id}
                        contentType={reportTarget.type}
                        collectionPath="spoiler_discussions"
                        onClose={() => setReportTarget(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
