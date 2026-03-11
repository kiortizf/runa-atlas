import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Clock, Flame, Heart, Star, Trophy, Zap, ArrowRight,
    ArrowLeft, Share2, Download, TrendingUp, BarChart3, Award,
    Sparkles, Calendar, Target, BookMarked, Quote, Eye
} from 'lucide-react';

// ═══════════════════════════════════════════
// READING WRAPPED — Your Year in Books
// ═══════════════════════════════════════════

const COLORS = {
    bg: ['from-[#0a0a1a] to-[#1a0a2e]', 'from-[#0a1a1a] to-[#0a2e1a]', 'from-[#1a0a0a] to-[#2e1a0a]', 'from-[#0a0a2e] to-[#1a1a3e]', 'from-[#1a1a0a] to-[#2e2e0a]'],
    accent: ['text-aurora-teal', 'text-emerald-400', 'text-amber-400', 'text-violet-400', 'text-starforge-gold'],
    glow: ['bg-aurora-teal/10', 'bg-emerald-400/10', 'bg-amber-400/10', 'bg-violet-400/10', 'bg-starforge-gold/10'],
};

const WRAPPED_DATA = {
    year: 2025,
    username: 'star_reader_42',
    totalBooks: 47,
    totalPages: 14_280,
    totalHours: 312,
    avgPagesPerDay: 39,
    longestStreak: 23,
    currentStreak: 8,
    topGenres: [
        { name: 'Dark Fantasy', percent: 34, books: 16 },
        { name: 'Sci-Fi', percent: 23, books: 11 },
        { name: 'Literary Fiction', percent: 19, books: 9 },
        { name: 'Magical Realism', percent: 13, books: 6 },
        { name: 'Horror', percent: 11, books: 5 },
    ],
    topAuthors: [
        { name: 'Elara Vance', books: 4, avatar: '📖' },
        { name: 'Kael Thornwood', books: 3, avatar: '🌲' },
        { name: 'Sera Nighthollow', books: 3, avatar: '🌙' },
        { name: 'Marcus Rivera', books: 2, avatar: '✒️' },
        { name: 'Althea Priory', books: 2, avatar: '🏛️' },
    ],
    favoriteBook: {
        title: 'The Obsidian Crown',
        author: 'Elara Vance',
        rating: 5,
        highlights: 47,
        reactions: 23,
    },
    topHighlight: {
        text: '"Magic is not a gift. It is a wound the universe has learned to sing through."',
        book: 'The Obsidian Crown',
        chapter: 'The Marrow Gate',
    },
    monthlyBreakdown: [
        { month: 'Jan', books: 3 }, { month: 'Feb', books: 5 }, { month: 'Mar', books: 4 },
        { month: 'Apr', books: 6 }, { month: 'May', books: 3 }, { month: 'Jun', books: 2 },
        { month: 'Jul', books: 5 }, { month: 'Aug', books: 4 }, { month: 'Sep', books: 3 },
        { month: 'Oct', books: 6 }, { month: 'Nov', books: 4 }, { month: 'Dec', books: 2 },
    ],
    communityStats: {
        discussionsJoined: 89,
        votesInForge: 34,
        readingCircles: 3,
        eventsAttended: 12,
    },
    percentile: 94,
    readingPersonality: 'The Obsidian Scholar',
    personalityDesc: 'You gravitate toward dark, complex narratives with deep worldbuilding. You read with intensity and engagement — the kind of reader who highlights passages and builds theories. Authors dream of readers like you.',
};

const maxBooks = Math.max(...WRAPPED_DATA.monthlyBreakdown.map(m => m.books));

interface SlideProps {
    onNext: () => void;
    onPrev: () => void;
    slideNum: number;
    totalSlides: number;
}

// ═══ Individual Slides ═══

function SlideIntro({ onNext }: SlideProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center h-full">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.3 }}>
                <div className="w-24 h-24 rounded-full bg-aurora-teal/10 flex items-center justify-center mb-8 mx-auto">
                    <BookOpen className="w-12 h-12 text-aurora-teal" />
                </div>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="font-display text-5xl md:text-7xl text-white tracking-wider mb-4">
                YOUR <span className="text-aurora-teal">2025</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="text-xl text-text-secondary mb-12">
                in books, highlights, and obsessions
            </motion.p>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                onClick={onNext}
                className="px-10 py-4 bg-aurora-teal text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-aurora-teal/90 transition-all flex items-center gap-3">
                Unwrap <ArrowRight className="w-4 h-4" />
            </motion.button>
        </div>
    );
}

function SlideStats({ onNext, onPrev }: SlideProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-sm text-aurora-teal/70 uppercase tracking-widest mb-10">This year you read</motion.p>

            <div className="grid grid-cols-2 gap-8 md:gap-12 mb-12">
                {[
                    { value: WRAPPED_DATA.totalBooks, label: 'Books', icon: BookOpen, delay: 0.3 },
                    { value: WRAPPED_DATA.totalPages.toLocaleString(), label: 'Pages', icon: BookMarked, delay: 0.5 },
                    { value: `${WRAPPED_DATA.totalHours}h`, label: 'Reading Time', icon: Clock, delay: 0.7 },
                    { value: `${WRAPPED_DATA.longestStreak}d`, label: 'Longest Streak', icon: Flame, delay: 0.9 },
                ].map((stat, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: stat.delay, type: 'spring', damping: 12 }}
                        className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-aurora-teal/10 flex items-center justify-center mx-auto mb-3">
                            <stat.icon className="w-6 h-6 text-aurora-teal" />
                        </div>
                        <p className="text-4xl md:text-5xl font-display text-white tracking-wide">{stat.value}</p>
                        <p className="text-xs text-text-secondary mt-1 uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="text-sm text-text-secondary">
                That's <span className="text-aurora-teal font-semibold">{WRAPPED_DATA.avgPagesPerDay} pages per day</span> on average
            </motion.p>
        </div>
    );
}

function SlideGenres({ onNext, onPrev }: SlideProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto w-full">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-sm text-amber-400/70 uppercase tracking-widest mb-8">Your Top Genres</motion.p>

            <div className="w-full space-y-4">
                {WRAPPED_DATA.topGenres.map((genre, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.15 }}
                        className="flex items-center gap-4">
                        <span className="text-3xl font-display text-white/20 w-10 text-right">{idx + 1}</span>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-white font-medium">{genre.name}</span>
                                <span className="text-xs text-text-secondary">{genre.books} books</span>
                            </div>
                            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${genre.percent}%` }}
                                    transition={{ delay: 0.5 + idx * 0.15, duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-amber-400/70' : 'bg-amber-400/40'}`}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="text-sm text-text-secondary mt-8 text-center">
                <span className="text-amber-400 font-semibold">Dark Fantasy</span> dominated your year — you clearly like it when things get intense
            </motion.p>
        </div>
    );
}

function SlideMonthly({ onNext, onPrev }: SlideProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto w-full">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-sm text-violet-400/70 uppercase tracking-widest mb-8">Month by Month</motion.p>

            <div className="flex items-end justify-between gap-2 md:gap-3 w-full h-48 mb-4">
                {WRAPPED_DATA.monthlyBreakdown.map((m, idx) => (
                    <motion.div key={idx} initial={{ height: 0 }} animate={{ height: `${(m.books / maxBooks) * 100}%` }}
                        transition={{ delay: 0.3 + idx * 0.08, duration: 0.6, ease: 'easeOut' }}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-violet-500/40 to-violet-400/80 relative group cursor-pointer hover:from-violet-500/60 hover:to-violet-400 transition-colors">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-semibold">
                            {m.books}
                        </div>
                    </motion.div>
                ))}
            </div>
            <div className="flex justify-between w-full">
                {WRAPPED_DATA.monthlyBreakdown.map((m, idx) => (
                    <span key={idx} className="text-[10px] text-text-secondary flex-1 text-center">{m.month}</span>
                ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                className="mt-8 flex items-center gap-6 text-xs text-text-secondary">
                <span>Peak month: <span className="text-violet-400 font-semibold">April & October</span> (6 books each)</span>
            </motion.div>
        </div>
    );
}

function SlideAuthors({ onNext, onPrev }: SlideProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto w-full">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-sm text-emerald-400/70 uppercase tracking-widest mb-8">Your Top Authors</motion.p>

            <div className="w-full space-y-3">
                {WRAPPED_DATA.topAuthors.map((author, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.15 }}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors
                            ${idx === 0 ? 'bg-emerald-400/[0.06] border-emerald-400/20' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                        <div className="text-2xl w-10 h-10 flex items-center justify-center">{author.avatar}</div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${idx === 0 ? 'text-emerald-400' : 'text-white'}`}>{author.name}</p>
                            <p className="text-xs text-text-secondary">{author.books} books read</p>
                        </div>
                        {idx === 0 && <Trophy className="w-5 h-5 text-emerald-400" />}
                    </motion.div>
                ))}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="text-sm text-text-secondary mt-6 text-center">
                <span className="text-emerald-400 font-semibold">Elara Vance</span> was your most-read author this year
            </motion.p>
        </div>
    );
}

function SlideHighlight({ onNext, onPrev }: SlideProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-sm text-starforge-gold/70 uppercase tracking-widest mb-10">Your Most-Saved Passage</motion.p>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="relative mb-8">
                <Quote className="w-12 h-12 text-starforge-gold/20 absolute -top-4 -left-4" />
                <p className="text-2xl md:text-3xl text-white/90 leading-relaxed italic font-serif text-center">
                    {WRAPPED_DATA.topHighlight.text}
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                className="text-center">
                <p className="text-sm text-starforge-gold font-semibold">{WRAPPED_DATA.topHighlight.book}</p>
                <p className="text-xs text-text-secondary mt-1">Chapter: {WRAPPED_DATA.topHighlight.chapter}</p>
            </motion.div>
        </div>
    );
}

function SlideCommunity({ onNext, onPrev }: SlideProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-sm text-aurora-teal/70 uppercase tracking-widest mb-10">Your Community Impact</motion.p>

            <div className="grid grid-cols-2 gap-6 mb-10">
                {[
                    { value: WRAPPED_DATA.communityStats.discussionsJoined, label: 'Discussions Joined', icon: '💬', delay: 0.3 },
                    { value: WRAPPED_DATA.communityStats.votesInForge, label: 'Forge Votes Cast', icon: '🗳️', delay: 0.5 },
                    { value: WRAPPED_DATA.communityStats.readingCircles, label: 'Reading Circles', icon: '⭕', delay: 0.7 },
                    { value: WRAPPED_DATA.communityStats.eventsAttended, label: 'Events Attended', icon: '🎭', delay: 0.9 },
                ].map((stat, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: stat.delay }}
                        className="text-center p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                        <span className="text-3xl block mb-2">{stat.icon}</span>
                        <p className="text-3xl font-display text-white">{stat.value}</p>
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                className="text-sm text-text-secondary text-center">
                You were more engaged than <span className="text-aurora-teal font-semibold">{WRAPPED_DATA.percentile}%</span> of readers this year
            </motion.p>
        </div>
    );
}

function SlidePersonality({ onNext, onPrev }: SlideProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 10 }}
                className="w-20 h-20 rounded-full bg-starforge-gold/10 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-starforge-gold" />
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-sm text-starforge-gold/70 uppercase tracking-widest mb-4">Your Reading Personality</motion.p>

            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="font-display text-4xl md:text-5xl text-white tracking-wider mb-6">
                {WRAPPED_DATA.readingPersonality}
            </motion.h2>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                className="text-sm text-text-secondary leading-relaxed">
                {WRAPPED_DATA.personalityDesc}
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                className="mt-10 flex items-center gap-3">
                <button className="px-6 py-3 bg-starforge-gold/10 text-starforge-gold text-sm border border-starforge-gold/20 rounded-sm hover:bg-starforge-gold/20 transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Share Your Wrapped
                </button>
                <button className="px-6 py-3 bg-white/[0.04] text-white text-sm border border-white/[0.1] rounded-sm hover:bg-white/[0.08] transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Card
                </button>
            </motion.div>
        </div>
    );
}

// ═══ Main Component ═══

const SLIDES = [SlideIntro, SlideStats, SlideGenres, SlideMonthly, SlideAuthors, SlideHighlight, SlideCommunity, SlidePersonality];

export default function ReadingWrapped() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const unsub = onSnapshot(
                doc(db, 'users', user.uid),
                (snap) => {
                    if (snap.exists() && snap.data().readingWrapped) {
                        // Reading Wrapped data available from Firestore
                    }
                },
                () => { }
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const goNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setDirection(1);
            setCurrentSlide(prev => prev + 1);
        }
    };

    const goPrev = () => {
        if (currentSlide > 0) {
            setDirection(-1);
            setCurrentSlide(prev => prev - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [currentSlide]);

    const SlideComponent = SLIDES[currentSlide];
    const bgIdx = currentSlide % COLORS.bg.length;

    return (
        <div className={`min-h-screen bg-gradient-to-br ${COLORS.bg[bgIdx]} text-white transition-colors duration-1000 flex flex-col`}>
            {/* Progress bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/[0.06]">
                <motion.div className="h-full bg-aurora-teal"
                    animate={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Slide area */}
            <div className="flex-1 flex items-center justify-center px-8 py-16 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: direction * 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -direction * 100 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-2xl mx-auto h-[600px]"
                    >
                        <SlideComponent
                            onNext={goNext}
                            onPrev={goPrev}
                            slideNum={currentSlide + 1}
                            totalSlides={SLIDES.length}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-40">
                <button onClick={goPrev} disabled={currentSlide === 0}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all
                        ${currentSlide === 0 ? 'border-white/[0.06] text-white/15 cursor-not-allowed' : 'border-white/[0.15] text-white hover:border-aurora-teal/40 hover:text-aurora-teal'}`}>
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                    {SLIDES.map((_, idx) => (
                        <button key={idx} onClick={() => { setDirection(idx > currentSlide ? 1 : -1); setCurrentSlide(idx); }}
                            className={`rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 h-2 bg-aurora-teal' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                        />
                    ))}
                </div>

                <button onClick={goNext} disabled={currentSlide === SLIDES.length - 1}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all
                        ${currentSlide === SLIDES.length - 1 ? 'border-white/[0.06] text-white/15 cursor-not-allowed' : 'border-white/[0.15] text-white hover:border-aurora-teal/40 hover:text-aurora-teal'}`}>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
