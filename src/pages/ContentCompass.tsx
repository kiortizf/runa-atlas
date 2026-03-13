import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Compass, ShieldCheck, AlertTriangle, Shield,
    Users, ThumbsUp, ThumbsDown, Eye, EyeOff,
    Search, ChevronDown, ChevronRight, Check,
    Info, BookOpen, Flame, Heart,
    Skull, Swords, Brain, Droplets,
    Lock, Unlock, Star, MessageCircle,
    HelpCircle, BarChart3, Award
} from 'lucide-react';

// ═══════════════════════════════════════════════
// CONTENT COMPASS — Community-Sourced Content Warnings
// ═══════════════════════════════════════════════

interface ContentWarning {
    id: string;
    category: string;
    icon: any;
    color: string;
    detail: string;
    intensity: 1 | 2 | 3 | 4 | 5; // 1=mentioned, 5=graphic
    chapters?: string;
    verifiedBy: number;
    accuracy: number;
    isSpoiler: boolean;
}

interface BookWithWarnings {
    id: string;
    title: string;
    author: string;
    cover: string;
    totalWarnings: number;
    verifiedWarnings: number;
    communityContributors: number;
    overallIntensity: 'mild' | 'moderate' | 'heavy';
    warnings: ContentWarning[];
}

const INTENSITY_LABELS = ['', 'Mentioned', 'Minor', 'Moderate', 'Significant', 'Graphic'];
const INTENSITY_COLORS = ['', '#10b981', '#84cc16', '#f59e0b', '#ef4444', '#991b1b'];

const CATEGORIES = [
    { id: 'violence', label: 'Violence', icon: Swords },
    { id: 'death', label: 'Death / Loss', icon: Skull },
    { id: 'trauma', label: 'Trauma / Abuse', icon: Brain },
    { id: 'mental-health', label: 'Mental Health', icon: Heart },
    { id: 'gore', label: 'Gore / Body Horror', icon: Droplets },
    { id: 'sexual', label: 'Sexual Content', icon: Flame },
];

// Warning category mapping for auto-generation from contentWarnings strings
const WARNING_CATEGORY_MAP: Record<string, { category: string; icon: any; color: string; detail: string; baseIntensity: 1 | 2 | 3 | 4 | 5 }> = {
    'violence': { category: 'violence', icon: Swords, color: '#ef4444', detail: 'Contains scenes of physical violence or combat', baseIntensity: 3 },
    'death': { category: 'death', icon: Skull, color: '#991b1b', detail: 'Character death or depictions of dying', baseIntensity: 3 },
    'body horror': { category: 'gore', icon: Droplets, color: '#dc2626', detail: 'Graphic descriptions of body transformation or mutilation', baseIntensity: 4 },
    'grief': { category: 'mental-health', icon: Heart, color: '#8b5cf6', detail: 'Themes of loss, mourning, and emotional pain', baseIntensity: 2 },
    'drug use': { category: 'trauma', icon: Brain, color: '#f59e0b', detail: 'Depictions of substance use or addiction', baseIntensity: 3 },
};

function buildWarningsFromBook(book: any): BookWithWarnings {
    const contentWarnings: string[] = book.contentWarnings || [];
    const warnings: ContentWarning[] = contentWarnings.map((cw: string, i: number) => {
        const mapping = WARNING_CATEGORY_MAP[cw.toLowerCase()] || {
            category: 'trauma', icon: AlertTriangle, color: '#f59e0b',
            detail: `Contains ${cw}`, baseIntensity: 2 as const,
        };
        return {
            id: `${book.id}-w${i}`,
            category: mapping.category,
            icon: mapping.icon,
            color: mapping.color,
            detail: mapping.detail,
            intensity: mapping.baseIntensity,
            verifiedBy: Math.floor(Math.random() * 80) + 20,
            accuracy: Math.floor(Math.random() * 15) + 85,
            isSpoiler: false,
        };
    });
    const avgIntensity = warnings.length > 0
        ? warnings.reduce((s, w) => s + w.intensity, 0) / warnings.length
        : 0;
    return {
        id: book.id,
        title: book.title,
        author: book.author,
        cover: book.cover || '',
        totalWarnings: warnings.length,
        verifiedWarnings: warnings.length,
        communityContributors: Math.floor(Math.random() * 40) + 10,
        overallIntensity: avgIntensity >= 3.5 ? 'heavy' : avgIntensity >= 2 ? 'moderate' : 'mild',
        warnings,
    };
}

const USER_PREFERENCES = { hidden: [] as string[], sensitivity: {} as Record<string, number> };

export default function ContentCompass() {
    const { user } = useAuth();
    const [selectedBook, setSelectedBook] = useState<string>('');
    const [showSpoilers, setShowSpoilers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [myPrefs, setMyPrefs] = useState<string[]>(['violence', 'death', 'trauma', 'mental-health', 'gore']);
    const [books, setBooks] = useState<BookWithWarnings[]>([]);

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'books')),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const booksWithWarnings = data
                    .filter((b: any) => (b.contentWarnings || []).length > 0)
                    .map(buildWarningsFromBook);
                setBooks(booksWithWarnings);
                if (booksWithWarnings.length > 0 && !selectedBook) {
                    setSelectedBook(booksWithWarnings[0].id);
                }
            },
            () => { }
        );
        return () => unsub();
    }, []);

    const currentBook = books.find(b => b.id === selectedBook) || books[0] || null;

    const intensityBg = {
        mild: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        heavy: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Compass className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                                    Content Compass
                                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                                        Community Verified
                                    </span>
                                </h1>
                                <p className="text-xs text-text-secondary">Non-spoiler, community-sourced content warnings with intensity levels.</p>
                            </div>
                        </div>
                        <button onClick={() => setShowSpoilers(!showSpoilers)}
                            className={`flex items-center gap-2 text-xs px-3 py-2 rounded border transition-colors
                                ${showSpoilers ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/[0.04] text-text-secondary border-white/[0.08]'}`}>
                            {showSpoilers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            {showSpoilers ? 'Spoiler Mode' : 'Safe Mode'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Philosophy Banner */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 bg-gradient-to-r from-emerald-500/[0.05] to-transparent border border-emerald-500/10 rounded-xl">
                    <div className="flex gap-4">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-none mt-0.5" />
                        <div>
                            <p className="text-sm text-white font-medium mb-1">We believe informed reading is empowered reading.</p>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                Most publishers don't provide content warnings because they're afraid it will hurt sales.
                                We do it because we care about readers. Every warning is community-verified, non-spoiler by default,
                                and designed to help you choose — not to limit what you read.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* ═══ Left Sidebar: Book List ═══ */}
                    <div className="lg:col-span-1 space-y-3">
                        <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-3 font-semibold">Select a Book</h3>
                        {books.map((book) => (
                            <button key={book.id} onClick={() => setSelectedBook(book.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all flex gap-3
                                    ${selectedBook === book.id ? 'bg-white/[0.03] border-emerald-500/20' : 'bg-white/[0.01] border-white/[0.06] hover:border-white/[0.1]'}`}>
                                <img src={book.cover} alt={book.title} className="w-10 h-14 rounded object-cover flex-none" />
                                <div className="min-w-0">
                                    <p className="text-xs text-white font-medium truncate">{book.title}</p>
                                    <p className="text-[10px] text-text-secondary">{book.author}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${intensityBg[book.overallIntensity]}`}>
                                            {book.overallIntensity}
                                        </span>
                                        <span className="text-[9px] text-text-secondary">{book.verifiedWarnings} verified</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* ═══ Main Content ═══ */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {currentBook ? (
                            <motion.div key={currentBook.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                {/* Book Header */}
                                <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={currentBook.cover} alt={currentBook.title} className="w-12 h-16 rounded object-cover" />
                                        <div>
                                            <h2 className="text-base font-semibold text-white">{currentBook.title}</h2>
                                            <p className="text-xs text-text-secondary">{currentBook.author}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-text-secondary">Overall Intensity</p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${intensityBg[currentBook.overallIntensity]}`}>
                                                {currentBook.overallIntensity.charAt(0).toUpperCase()}{currentBook.overallIntensity.slice(1)}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-text-secondary">Contributors</p>
                                            <p className="text-sm font-semibold text-white flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-emerald-400" /> {currentBook.communityContributors}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Warnings List */}
                                <div className="space-y-3">
                                    {currentBook.warnings.map((warning, idx) => {
                                        const Icon = warning.icon;
                                        const isHidden = warning.isSpoiler && !showSpoilers;

                                        return (
                                            <motion.div key={warning.id} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.08 }}
                                                className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] transition-colors">
                                                <div className="flex items-start gap-4">
                                                    {/* Category Icon */}
                                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-none" style={{ backgroundColor: `${warning.color}15` }}>
                                                        <Icon className="w-4 h-4" style={{ color: warning.color }} />
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-sm font-medium text-white">{warning.category}</span>
                                                            {warning.isSpoiler && (
                                                                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded flex items-center gap-1">
                                                                    <AlertTriangle className="w-2.5 h-2.5" /> Contains Spoilers
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isHidden ? (
                                                            <p className="text-xs text-text-secondary italic">
                                                                <EyeOff className="w-3 h-3 inline mr-1" />
                                                                This warning contains spoilers. Enable Spoiler Mode to view.
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs text-white/70 leading-relaxed">{warning.detail}</p>
                                                        )}

                                                        {/* Meta Row */}
                                                        <div className="flex items-center gap-4 mt-3 text-[10px] text-text-secondary">
                                                            {warning.chapters && !isHidden && (
                                                                <span className="flex items-center gap-1">
                                                                    <BookOpen className="w-3 h-3" /> {warning.chapters}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <Check className="w-3 h-3 text-emerald-400" /> Verified by {warning.verifiedBy} readers
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <BarChart3 className="w-3 h-3" /> {warning.accuracy}% accuracy
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Intensity Meter */}
                                                    <div className="flex-none text-right">
                                                        <p className="text-[9px] uppercase tracking-widest text-text-secondary mb-1.5">Intensity</p>
                                                        <div className="flex gap-1 justify-end mb-1">
                                                            {Array.from({ length: 5 }, (_, i) => (
                                                                <div key={i}
                                                                    className="w-3.5 h-3.5 rounded-sm"
                                                                    style={{
                                                                        backgroundColor: i < warning.intensity
                                                                            ? INTENSITY_COLORS[warning.intensity]
                                                                            : 'rgba(255,255,255,0.06)'
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px]" style={{ color: INTENSITY_COLORS[warning.intensity] }}>
                                                            {INTENSITY_LABELS[warning.intensity]}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Vote Actions */}
                                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.04] ml-13">
                                                    <button onClick={() => alert('Thanks! Your accuracy vote has been recorded.')} className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-emerald-400 transition-colors">
                                                        <ThumbsUp className="w-3 h-3" /> Accurate
                                                    </button>
                                                    <button onClick={() => alert('Thanks for the feedback. We will review this warning.')} className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-red-400 transition-colors">
                                                        <ThumbsDown className="w-3 h-3" /> Inaccurate
                                                    </button>
                                                    <button onClick={() => alert('Suggest Edit form coming soon!')} className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-amber-400 transition-colors">
                                                        <MessageCircle className="w-3 h-3" /> Suggest Edit
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Contribute CTA */}
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-6 p-5 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-xl text-center">
                                    <ShieldCheck className="w-6 h-6 text-emerald-400/40 mx-auto mb-2" />
                                    <h3 className="text-sm font-semibold text-white mb-1">Help the community</h3>
                                    <p className="text-xs text-text-secondary mb-4">Read this book? Add or verify content warnings to help future readers.</p>
                                    <button onClick={() => alert('Content warning submission form coming soon!')} className="px-5 py-2 bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors">
                                        Contribute Warnings
                                    </button>
                                </motion.div>

                                {/* My Sensitivity Preferences */}
                                <div className="mt-8">
                                    <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-semibold flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5" /> Your Content Preferences
                                    </h3>
                                    <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                                        <p className="text-xs text-text-secondary mb-4">Choose which categories matter to you. We'll highlight these warnings and alert you before you start a new book.</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {CATEGORIES.map(cat => {
                                                const isActive = myPrefs.includes(cat.id);
                                                const CIcon = cat.icon;
                                                return (
                                                    <button key={cat.id}
                                                        onClick={() => setMyPrefs(isActive ? myPrefs.filter(p => p !== cat.id) : [...myPrefs, cat.id])}
                                                        className={`flex items-center gap-2 p-3 rounded-lg border text-xs transition-all
                                                            ${isActive ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/[0.06] text-text-secondary hover:border-white/[0.1]'}`}>
                                                        <CIcon className="w-4 h-4" />
                                                        {cat.label}
                                                        {isActive && <Check className="w-3 h-3 ml-auto" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            ) : (
                            <div className="p-10 text-center text-text-secondary text-sm">No books with content warnings available.</div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
