import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Eye, EyeOff, MessageSquare, Users, Feather, PenTool, Bookmark, BookmarkCheck, X, Type, Sun, Moon, Maximize2, List, Heart, Flame, Skull, Sparkles, Brain, Share2, Lock, Globe, ChevronUp, ChevronDown, Shield, Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnnotations, type AuthorNote, type EditorNote, type ParagraphStats } from '../hooks/useAnnotations';
import { useNDASigning } from '../hooks/useNDASigning';
import NDASigningModal from '../components/NDASigningModal';

// Data loaded from Firestore
let _seedBook: any = { title: '', author: '', cover: '', genre: '', rating: 0, reviews: 0, synopsis: '', pages: 0, published: '', publisher: '', isbn: '', language: '', awards: [], tags: [] };
let _seedChapters: Record<string, { title: string; number: number; content: string; authorNotes: AuthorNote[]; editorNotes: EditorNote[] }> = {};

const REACTIONS = [
    { emoji: '🔥', label: 'Fire' },
    { emoji: '😭', label: 'Emotional' },
    { emoji: '🤯', label: 'Mind-blown' },
    { emoji: '💀', label: 'Dead' },
    { emoji: '✨', label: 'Beautiful' },
    { emoji: '🧠', label: 'Thought-provoking' },
];

let _seedCommunity: Record<string, { count: number; reactions: Record<string, number>; notes: { displayName: string; note: string }[] }> = {};

type Theme = 'dark' | 'sepia' | 'light';

const THEMES: Record<Theme, { bg: string; text: string; muted: string; border: string; surface: string; accent: string }> = {
    dark: { bg: '#0a0a0f', text: 'rgba(255,255,255,0.85)', muted: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.08)', surface: 'rgba(255,255,255,0.03)', accent: '#d4a853' },
    sepia: { bg: '#f4ecd8', text: '#3d2e1a', muted: '#8b7355', border: '#c4a96b44', surface: '#e8dcc4', accent: '#8b4513' },
    light: { bg: '#ffffff', text: '#1a1a2e', muted: '#6b6b80', border: '#e0e0e0', surface: '#f5f5f5', accent: '#1a1a8e' },
};

export default function BookReader() {
    const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
    const navigate = useNavigate();
    const { user, signIn } = useAuth();
    const contentRef = useRef<HTMLDivElement>(null);

    // State
    const [chapter, setChapter] = useState<typeof _seedChapters['1'] | null>(null);
    const [book] = useState(_seedBook);
    const [fontSize, setFontSize] = useState(18);
    const [lineHeight, setLineHeight] = useState(1.9);
    const [theme, setTheme] = useState<Theme>('dark');
    const [showToc, setShowToc] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);

    // Annotation layers
    const [showMyNotes, setShowMyNotes] = useState(true);
    const [showCommunity, setShowCommunity] = useState(true);
    const [showAuthorNotes, setShowAuthorNotes] = useState(true);
    const [showEditorNotes, setShowEditorNotes] = useState(false);

    // Selection popover
    const [selection, setSelection] = useState<{ text: string; paragraphId: string; rect: DOMRect; startOffset: number; endOffset: number } | null>(null);
    const [selectionNote, setSelectionNote] = useState('');
    const [selectionPublic, setSelectionPublic] = useState(true);

    // Expanded community paragraph
    const [expandedParagraph, setExpandedParagraph] = useState<string | null>(null);

    // NDA gatekeeping
    const { checkSignatureStatus } = useNDASigning();
    const [ndaVerified, setNdaVerified] = useState(false);
    const [ndaChecking, setNdaChecking] = useState(true);
    const [showNDAModal, setShowNDAModal] = useState(false);

    // Check NDA status on mount
    useEffect(() => {
        if (!user?.uid) {
            setNdaChecking(false);
            return;
        }
        checkSignatureStatus('beta_reader').then(record => {
            setNdaVerified(!!record);
            setNdaChecking(false);
        });
    }, [user?.uid, checkSignatureStatus]);

    const {
        myHighlights, communityHighlights, authorNotes, editorNotes,
        paragraphStats, addHighlight, addBookmark, readingProgress,
        updateProgress,
    } = useAnnotations({
        bookId: bookId || 'obsidian-crown',
        chapterId: chapterId || '1',
        userId: user?.uid,
    });

    // Load chapter (seed data)
    useEffect(() => {
        const ch = _seedChapters[chapterId || '1'];
        if (ch) setChapter(ch);
    }, [chapterId]);

    // Scroll tracking
    useEffect(() => {
        const handleScroll = () => {
            const el = document.documentElement;
            const percent = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
            setScrollPercent(Math.min(percent, 100));
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Save progress periodically
    useEffect(() => {
        if (!user || !chapterId) return;
        const timer = setTimeout(() => {
            updateProgress({ currentChapter: chapterId, scrollPercent });
        }, 2000);
        return () => clearTimeout(timer);
    }, [scrollPercent, user, chapterId, updateProgress]);

    // Text selection handler
    const handleTextSelect = useCallback(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
            return;
        }
        const range = sel.getRangeAt(0);
        const container = range.startContainer.parentElement?.closest('[data-pid]');
        if (!container) return;

        const paragraphId = container.getAttribute('data-pid') || '';
        const rect = range.getBoundingClientRect();

        setSelection({
            text: sel.toString().trim(),
            paragraphId,
            rect,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
        });
        setSelectionNote('');
        setSelectionPublic(true);
    }, []);

    useEffect(() => {
        document.addEventListener('mouseup', handleTextSelect);
        return () => document.removeEventListener('mouseup', handleTextSelect);
    }, [handleTextSelect]);

    const handleAddHighlight = async (reaction?: string) => {
        if (!selection || !user) return;
        await addHighlight({
            paragraphId: selection.paragraphId,
            startOffset: selection.startOffset,
            endOffset: selection.endOffset,
            highlightedText: selection.text,
            note: selectionNote || undefined,
            reaction,
            isPublic: selectionPublic,
            displayName: user.displayName || 'Reader',
            photoURL: user.photoURL || undefined,
        });
        setSelection(null);
        window.getSelection()?.removeAllRanges();
    };

    // Get merged stats (Firestore + seed)
    const getStats = (pid: string): ParagraphStats | null => {
        const firestore = paragraphStats[pid];
        const seed = _seedCommunity[pid];
        if (firestore && seed) {
            return {
                totalHighlights: firestore.totalHighlights + seed.count,
                reactions: { ...seed.reactions, ...firestore.reactions },
                sampleNotes: [...seed.notes, ...firestore.sampleNotes].slice(0, 3),
            };
        }
        if (firestore) return firestore;
        if (seed) return { totalHighlights: seed.count, reactions: seed.reactions, sampleNotes: seed.notes };
        return null;
    };

    // Get author notes for a paragraph (Firestore + seed)
    const getAuthorNotes = (pid: string): AuthorNote[] => {
        const chapterData = _seedChapters[chapterId || '1'];
        const seedNotes = chapterData?.authorNotes.filter(n => n.paragraphId === pid) || [];
        const firestoreNotes = authorNotes.filter(n => n.paragraphId === pid);
        return [...seedNotes, ...firestoreNotes];
    };

    const getEditorNotes = (pid: string): EditorNote[] => {
        const chapterData = _seedChapters[chapterId || '1'];
        const seedNotes = chapterData?.editorNotes.filter(n => n.paragraphId === pid) || [];
        const firestoreNotes = editorNotes.filter(n => n.paragraphId === pid);
        return [...seedNotes, ...firestoreNotes];
    };

    const t = THEMES[theme];
    const totalChapters = Object.keys(_seedChapters).length;
    const chapterNum = parseInt(chapterId || '1');
    const wordCount = chapter?.content.split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / 250);

    if (!chapter) {
        return <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg, color: t.text }}>Chapter not found.</div>;
    }

    // Parse content into paragraphs
    const paragraphs = chapter.content.split('\n').filter(line => line.trim() !== '');

    // ═══ NDA GATE — Require signed NDA before manuscript access ═══
    if (ndaChecking) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            </div>
        );
    }

    if (!ndaVerified) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg text-center">

                    <div className="w-20 h-20 rounded-full bg-amber-500/10 mx-auto flex items-center justify-center mb-6 border border-amber-500/20">
                        <Shield className="w-10 h-10 text-amber-400" />
                    </div>

                    <h2 className="font-display text-3xl text-white tracking-wide mb-4 uppercase">NDA Required</h2>
                    <p className="text-text-secondary text-sm mb-3 leading-relaxed">
                        This manuscript is protected under a Non-Disclosure Agreement. You must sign the Beta Reader NDA
                        before accessing any manuscript content.
                    </p>
                    <p className="text-text-secondary/60 text-xs mb-8 leading-relaxed">
                        The NDA is secured with <strong className="text-white/80">ECDSA P-256 + SHA-256</strong> cryptographic signatures
                        and is legally binding under the <strong className="text-white/80">ESIGN Act</strong>, <strong className="text-white/80">UETA</strong>,
                        and <strong className="text-white/80">EU eIDAS Regulation</strong>.
                    </p>

                    <div className="flex flex-col gap-3">
                        {user ? (
                            <button
                                onClick={() => setShowNDAModal(true)}
                                className="w-full px-6 py-4 bg-amber-400 text-void-black text-sm font-semibold uppercase tracking-widest rounded-sm hover:bg-amber-300 transition-all flex items-center justify-center gap-3"
                            >
                                <Fingerprint className="w-5 h-5" /> Sign NDA to Continue
                            </button>
                        ) : (
                            <button
                                onClick={signIn}
                                className="w-full px-6 py-4 bg-amber-400 text-void-black text-sm font-semibold uppercase tracking-widest rounded-sm hover:bg-amber-300 transition-all flex items-center justify-center gap-3"
                            >
                                <Lock className="w-5 h-5" /> Log In to Sign NDA
                            </button>
                        )}
                        <Link to="/" className="text-xs text-text-secondary hover:text-white transition-colors">
                            ← Return to Home
                        </Link>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {showNDAModal && (
                        <NDASigningModal
                            ndaType="beta_reader"
                            onSigned={() => {
                                setNdaVerified(true);
                                setShowNDAModal(false);
                            }}
                            onCancel={() => setShowNDAModal(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative" style={{ background: t.bg, color: t.text, transition: 'all 0.3s ease' }}>

            {/* ═══ Progress Bar ═══ */}
            <div className="fixed top-0 left-0 right-0 z-50 h-[3px]" style={{ background: t.border }}>
                <motion.div
                    className="h-full"
                    style={{ background: t.accent, width: `${scrollPercent}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* ═══ Top Bar ═══ */}
            <div className="fixed top-[3px] left-0 right-0 z-40 backdrop-blur-xl" style={{ background: `${t.bg}ee`, borderBottom: `1px solid ${t.border}` }}>
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to={`/catalog/${bookId || 'obsidian-crown'}`} className="p-1.5 rounded-sm transition-colors hover:opacity-70" style={{ color: t.muted }}>
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <p className="text-xs font-mono tracking-wider" style={{ color: t.muted }}>{book.author}</p>
                            <p className="text-sm font-semibold" style={{ color: t.text }}>{book.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setShowToc(!showToc)} className="p-2 rounded-sm transition-colors hover:opacity-70" style={{ color: t.muted }} title="Table of Contents">
                            <List className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-sm transition-colors hover:opacity-70" style={{ color: t.muted }} title="Settings">
                            <Type className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ TOC Drawer ═══ */}
            <AnimatePresence>
                {showToc && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50" onClick={() => setShowToc(false)}>
                        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
                        <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                            className="absolute left-0 top-0 bottom-0 w-80 p-6 overflow-y-auto"
                            style={{ background: t.bg, borderRight: `1px solid ${t.border}` }}
                            onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold mb-4" style={{ color: t.text }}>Chapters</h3>
                            <div className="space-y-2">
                                {Object.entries(_seedChapters).map(([id, ch]) => (
                                    <button key={id}
                                        onClick={() => { navigate(`/read/${bookId || 'obsidian-crown'}/${id}`); setShowToc(false); }}
                                        className="w-full text-left px-3 py-2.5 rounded-sm transition-colors flex items-center gap-3"
                                        style={{
                                            background: id === (chapterId || '1') ? `${t.accent}20` : 'transparent',
                                            color: id === (chapterId || '1') ? t.accent : t.muted,
                                            border: `1px solid ${id === (chapterId || '1') ? `${t.accent}40` : 'transparent'}`,
                                        }}>
                                        <span className="text-xs font-mono w-6 shrink-0">{ch.number}</span>
                                        <span className="text-sm">{ch.title}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ Settings Panel ═══ */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="fixed top-14 right-4 z-50 w-72 rounded-sm p-5 shadow-2xl"
                        style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                        <h4 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: t.muted }}>Reading Settings</h4>

                        {/* Theme */}
                        <div className="mb-4">
                            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: t.muted }}>Theme</p>
                            <div className="flex gap-2">
                                {(['dark', 'sepia', 'light'] as Theme[]).map(th => (
                                    <button key={th} onClick={() => setTheme(th)}
                                        className="flex-1 py-2 rounded-sm text-xs uppercase tracking-wider transition-all"
                                        style={{
                                            background: THEMES[th].bg, color: THEMES[th].text,
                                            border: `2px solid ${theme === th ? t.accent : t.border}`,
                                        }}>{th}</button>
                                ))}
                            </div>
                        </div>

                        {/* Font Size */}
                        <div className="mb-4">
                            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: t.muted }}>Font Size: {fontSize}px</p>
                            <input type="range" min={14} max={24} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))}
                                className="w-full accent-current" style={{ accentColor: t.accent }} />
                        </div>

                        {/* Line Height */}
                        <div className="mb-4">
                            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: t.muted }}>Line Height: {lineHeight.toFixed(1)}</p>
                            <input type="range" min={14} max={26} value={lineHeight * 10} onChange={e => setLineHeight(parseInt(e.target.value) / 10)}
                                className="w-full" style={{ accentColor: t.accent }} />
                        </div>

                        {/* Annotation Layers */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: t.muted }}>Annotation Layers</p>
                            <div className="space-y-1.5">
                                {[
                                    { label: 'My Notes', icon: Bookmark, active: showMyNotes, toggle: () => setShowMyNotes(!showMyNotes) },
                                    { label: 'Community', icon: Users, active: showCommunity, toggle: () => setShowCommunity(!showCommunity) },
                                    { label: "Author's Voice", icon: Feather, active: showAuthorNotes, toggle: () => setShowAuthorNotes(!showAuthorNotes) },
                                    { label: "Editor's Lens", icon: PenTool, active: showEditorNotes, toggle: () => setShowEditorNotes(!showEditorNotes) },
                                ].map(layer => (
                                    <button key={layer.label} onClick={layer.toggle}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs transition-all"
                                        style={{
                                            background: layer.active ? `${t.accent}15` : 'transparent',
                                            color: layer.active ? t.accent : t.muted,
                                            border: `1px solid ${layer.active ? `${t.accent}30` : 'transparent'}`,
                                        }}>
                                        <layer.icon className="w-3.5 h-3.5" />
                                        {layer.label}
                                        {layer.active ? <Eye className="w-3 h-3 ml-auto" /> : <EyeOff className="w-3 h-3 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => setShowSettings(false)} className="mt-4 w-full py-2 text-xs rounded-sm" style={{ background: t.border, color: t.text }}>Close</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ Chapter Header ═══ */}
            <div className="pt-28 pb-12 text-center px-4" style={{ borderBottom: `1px solid ${t.border}` }}>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-3" style={{ color: t.accent }}>Chapter {chapter.number} of {totalChapters}</p>
                <h1 className="text-3xl md:text-4xl font-serif mb-3" style={{ color: t.text }}>{chapter.title}</h1>
                <p className="text-xs font-mono" style={{ color: t.muted }}>{wordCount.toLocaleString()} words &middot; ~{readTime} min read</p>
            </div>

            {/* ═══ Layer Toggle Bar ═══ */}
            <div className="sticky top-14 z-30 backdrop-blur-md py-2 px-4" style={{ background: `${t.bg}dd`, borderBottom: `1px solid ${t.border}` }}>
                <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 flex-wrap">
                    {[
                        { label: 'My Notes', icon: Bookmark, active: showMyNotes, toggle: () => setShowMyNotes(!showMyNotes), color: '#60a5fa' },
                        { label: 'Community', icon: Users, active: showCommunity, toggle: () => setShowCommunity(!showCommunity), color: '#34d399' },
                        { label: "Author", icon: Feather, active: showAuthorNotes, toggle: () => setShowAuthorNotes(!showAuthorNotes), color: t.accent },
                        { label: "Editor", icon: PenTool, active: showEditorNotes, toggle: () => setShowEditorNotes(!showEditorNotes), color: '#c084fc' },
                    ].map(layer => (
                        <button key={layer.label} onClick={layer.toggle}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider transition-all"
                            style={{
                                background: layer.active ? `${layer.color}20` : 'transparent',
                                color: layer.active ? layer.color : t.muted,
                                border: `1px solid ${layer.active ? `${layer.color}40` : t.border}`,
                            }}>
                            <layer.icon className="w-3 h-3" />
                            {layer.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ Content ═══ */}
            <div className="max-w-2xl mx-auto px-6 py-12 relative" ref={contentRef}>
                {paragraphs.map((para, idx) => {
                    const pid = `p-${idx}`;
                    const stats = showCommunity ? getStats(pid) : null;
                    const aNotes = showAuthorNotes ? getAuthorNotes(pid) : [];
                    const eNotes = showEditorNotes ? getEditorNotes(pid) : [];
                    const hasAnnotations = (stats && stats.totalHighlights > 0) || aNotes.length > 0 || eNotes.length > 0;
                    const heatIntensity = stats ? Math.min(stats.totalHighlights / 50, 1) : 0;

                    return (
                        <div key={idx} className="relative group" data-pid={pid}>
                            {/* Community Heatmap Indicator */}
                            {showCommunity && stats && stats.totalHighlights > 0 && (
                                <div className="absolute -left-10 top-0 bottom-0 w-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                                    style={{ background: `rgba(52, 211, 153, ${0.2 + heatIntensity * 0.6})` }} />
                            )}

                            {/* Paragraph Text */}
                            <p
                                className="mb-6 cursor-text transition-all"
                                style={{
                                    fontFamily: "'Georgia', 'Times New Roman', serif",
                                    fontSize: `${fontSize}px`,
                                    lineHeight: lineHeight,
                                    color: t.text,
                                    borderLeft: hasAnnotations ? `2px solid transparent` : 'none',
                                    paddingLeft: hasAnnotations ? '12px' : '0',
                                }}
                            >
                                {para.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, i) => {
                                    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} style={{ fontWeight: 600, color: t.text }}>{part.slice(2, -2)}</strong>;
                                    if (part.startsWith('*') && part.endsWith('*')) return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
                                    return <span key={i}>{part}</span>;
                                })}
                            </p>

                            {/* Annotation Sidebar (shows on hover/click) */}
                            {hasAnnotations && (
                                <div className="mb-4 space-y-2">
                                    {/* Community highlights summary */}
                                    {showCommunity && stats && stats.totalHighlights > 0 && (
                                        <button onClick={() => setExpandedParagraph(expandedParagraph === pid ? null : pid)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] transition-all w-full text-left"
                                            style={{ background: `rgba(52,211,153,0.08)`, border: `1px solid rgba(52,211,153,0.15)`, color: 'rgb(52,211,153)' }}>
                                            <Users className="w-3 h-3 shrink-0" />
                                            <span>{stats.totalHighlights} reader{stats.totalHighlights !== 1 ? 's' : ''} highlighted this</span>
                                            <span className="ml-auto flex gap-0.5">
                                                {Object.entries(stats.reactions).slice(0, 4).map(([emoji, count]) => (
                                                    <span key={emoji} className="text-[10px]">{emoji}{count > 1 ? count : ''}</span>
                                                ))}
                                            </span>
                                            {expandedParagraph === pid ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />}
                                        </button>
                                    )}

                                    {/* Expanded community notes */}
                                    <AnimatePresence>
                                        {expandedParagraph === pid && stats && stats.sampleNotes.length > 0 && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden">
                                                <div className="space-y-2 pl-4" style={{ borderLeft: `2px solid rgba(52,211,153,0.2)` }}>
                                                    {stats.sampleNotes.map((n, i) => (
                                                        <div key={i} className="px-3 py-2 rounded-sm text-xs" style={{ background: `rgba(52,211,153,0.05)` }}>
                                                            <span style={{ color: 'rgb(52,211,153)' }} className="font-semibold text-[10px]">{n.displayName}</span>
                                                            <p className="mt-0.5" style={{ color: t.muted }}>{n.note}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Author notes */}
                                    {aNotes.map((note, i) => (
                                        <motion.div key={`a-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-3 px-4 py-3 rounded-sm text-xs" style={{ background: `${t.accent}10`, border: `1px solid ${t.accent}25` }}>
                                            <Feather className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: t.accent }} />
                                            <div>
                                                <span className="font-semibold text-[10px] uppercase tracking-wider" style={{ color: t.accent }}>{note.authorName}</span>
                                                <p className="mt-1 leading-relaxed" style={{ color: t.text, opacity: 0.8 }}>{note.text}</p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Editor notes */}
                                    {eNotes.map((note, i) => (
                                        <motion.div key={`e-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-3 px-4 py-3 rounded-sm text-xs" style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)' }}>
                                            <PenTool className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#c084fc' }} />
                                            <div>
                                                <span className="font-semibold text-[10px] uppercase tracking-wider" style={{ color: '#c084fc' }}>{note.editorName} &middot; Editor</span>
                                                <p className="mt-1 leading-relaxed" style={{ color: t.text, opacity: 0.8 }}>{note.text}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ═══ Selection Popover ═══ */}
            <AnimatePresence>
                {selection && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed z-50 p-4 rounded-sm shadow-2xl w-80"
                        style={{
                            left: Math.min(selection.rect.left, window.innerWidth - 340),
                            top: Math.min(selection.rect.bottom + 10, window.innerHeight - 280),
                            background: theme === 'dark' ? '#1a1a2e' : theme === 'sepia' ? '#e8dcc4' : '#f5f5f5',
                            border: `1px solid ${t.border}`,
                            color: t.text,
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Selected text preview */}
                        <p className="text-xs italic mb-3 line-clamp-2" style={{ color: t.muted }}>"{selection.text}"</p>

                        {user ? (
                            <>
                                {/* Quick Reactions */}
                                <div className="flex gap-1.5 mb-3">
                                    {REACTIONS.map(r => (
                                        <button key={r.emoji}
                                            onClick={() => handleAddHighlight(r.emoji)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform hover:scale-125"
                                            style={{ background: `${t.accent}15`, border: `1px solid ${t.border}` }}
                                            title={r.label}>{r.emoji}</button>
                                    ))}
                                </div>

                                {/* Note input */}
                                <input
                                    value={selectionNote}
                                    onChange={e => setSelectionNote(e.target.value)}
                                    placeholder="Add a note (optional)..."
                                    className="w-full px-3 py-2 rounded-sm text-xs mb-2 outline-none"
                                    style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.text }}
                                />

                                {/* Visibility toggle */}
                                <div className="flex items-center justify-between mb-3">
                                    <button onClick={() => setSelectionPublic(!selectionPublic)}
                                        className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider"
                                        style={{ color: selectionPublic ? 'rgb(52,211,153)' : t.muted }}>
                                        {selectionPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                        {selectionPublic ? 'Shared with community' : 'Private note'}
                                    </button>
                                </div>

                                {/* Save */}
                                <div className="flex gap-2">
                                    <button onClick={() => handleAddHighlight()} className="flex-1 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors"
                                        style={{ background: t.accent, color: theme === 'dark' ? '#0a0a0f' : '#ffffff' }}>
                                        Highlight
                                    </button>
                                    <button onClick={() => setSelection(null)} className="px-4 py-2 rounded-sm text-xs" style={{ background: t.border, color: t.text }}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <p className="text-xs mb-3" style={{ color: t.muted }}>Sign in to highlight and annotate</p>
                                <button onClick={() => { signIn(); setSelection(null); }}
                                    className="px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold"
                                    style={{ background: t.accent, color: theme === 'dark' ? '#0a0a0f' : '#ffffff' }}>
                                    Sign In
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click-away to dismiss popover */}
            {selection && <div className="fixed inset-0 z-40" onClick={() => setSelection(null)} />}

            {/* ═══ Chapter Navigation ═══ */}
            <div className="max-w-2xl mx-auto px-6 py-16" style={{ borderTop: `1px solid ${t.border}` }}>
                <div className="flex items-center justify-between">
                    {chapterNum > 1 ? (
                        <Link to={`/read/${bookId || 'obsidian-crown'}/${chapterNum - 1}`}
                            className="flex items-center gap-2 px-5 py-3 rounded-sm text-sm transition-all"
                            style={{ border: `1px solid ${t.border}`, color: t.muted }}>
                            <ChevronLeft className="w-4 h-4" /> Previous Chapter
                        </Link>
                    ) : <div />}
                    {chapterNum < totalChapters ? (
                        <Link to={`/read/${bookId || 'obsidian-crown'}/${chapterNum + 1}`}
                            className="flex items-center gap-2 px-5 py-3 rounded-sm text-sm font-semibold transition-all"
                            style={{ background: t.accent, color: theme === 'dark' ? '#0a0a0f' : '#ffffff' }}>
                            Next Chapter <ChevronRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <div className="text-center">
                            <p className="text-sm font-semibold" style={{ color: t.accent }}>End of available chapters</p>
                            <p className="text-xs mt-1" style={{ color: t.muted }}>New chapters coming soon</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Bottom Stats Bar ═══ */}
            <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl py-2.5 px-4" style={{ background: `${t.bg}ee`, borderTop: `1px solid ${t.border}` }}>
                <div className="max-w-2xl mx-auto flex items-center justify-between text-[10px] font-mono" style={{ color: t.muted }}>
                    <span>Ch. {chapter.number}/{totalChapters}</span>
                    <span>{scrollPercent}% read</span>
                    <span>~{readTime} min</span>
                </div>
            </div>
        </div>
    );
}
