import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Eye, EyeOff, MessageSquare, Users, Feather, PenTool, Bookmark, BookmarkCheck, X, Type, Sun, Moon, Maximize2, List, Heart, Flame, Skull, Sparkles, Brain, Share2, Lock, Globe, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnnotations, type AuthorNote, type EditorNote, type ParagraphStats } from '../hooks/useAnnotations';

// ── Seed Book Data ──
const SEED_BOOK = {
    id: 'obsidian-crown',
    title: 'The Obsidian Crown',
    author: 'Elara Vance',
    coverUrl: '',
};

const SEED_CHAPTERS: Record<string, { title: string; number: number; content: string; authorNotes: AuthorNote[]; editorNotes: EditorNote[] }> = {
    '1': {
        title: 'The Dust of Ages', number: 1,
        authorNotes: [
            { paragraphId: 'p-2', text: 'The "warmth radiating from the leather" was the first detail I wrote for the entire series. Everything grew from that single sensory image.', authorName: 'Elara Vance' },
            { paragraphId: 'p-5', text: 'I debated whether blank pages were too cliche. My editor convinced me that the subversion comes from what happens next, not the reveal itself.', authorName: 'Elara Vance' },
            { paragraphId: 'p-10', text: 'Ignis. Vita. Mors. These are actual Proto-Indo-European root reconstructions. I spent two weeks researching historical linguistics for three words.', authorName: 'Elara Vance' },
        ],
        editorNotes: [
            { paragraphId: 'p-3', text: 'We cut 400 words of backstory from this section. The original draft explained how Elara found the library, but the mystery of her simply being there is more compelling.', editorName: 'Maren Cole' },
            { paragraphId: 'p-8', text: 'Notice the shift from visual to olfactory imagery. This is a deliberate pacing technique: ozone and burning embers signal danger before the plot does.', editorName: 'Maren Cole' },
        ],
        content: `The library smelled of old paper and forgotten dreams. Elara traced the spine of the unmarked tome, feeling a strange warmth radiating from the leather.

She had spent years searching for this exact volume, guided only by fragments of myths and half-remembered nursery rhymes. The Ember Codex. A book that supposedly held the key to the Marrow System, the ancient magic drawn from the bones of fallen gods.

"When the stars align in the house of the serpent, the codex will awaken, and the world will burn."

She shivered, pulling her cloak tighter around her shoulders. The air in the restricted section was always cold, but this chill felt different. It felt alive.

She opened the book. The pages were blank.

"What?" she whispered, her voice echoing in the silent hall.

She flipped through the pages, her frustration mounting. Had she been wrong? Had the myths lied? Had she thrown away her position at the Athenaeum, her reputation, her family's trust, all for empty pages?

Suddenly, a faint glow began to emanate from the center of the book. The blank pages seemed to absorb the dim light of her lantern, glowing with an inner fire that pulsed like a heartbeat.

Words began to form, written in a language she had never seen before, yet somehow, she understood every word. The letters were not ink but light, each one burning itself into existence and leaving a faint warmth on her fingertips as she traced them.

The smell of ozone and burning embers filled the air around her. The magic was old, older than the library, older than the city, older than memory itself.

Ignis. Vita. Mors.

Fire. Life. Death.

The words burned themselves into her mind, and she knew, with terrifying certainty, that her life would never be the same. The Ember Codex had chosen its reader, and the reader could not refuse.`,
    },
    '2': {
        title: 'Whispers in the Dark', number: 2,
        authorNotes: [
            { paragraphId: 'p-1', text: 'This chapter was originally Chapter 4. We moved it forward because the pacing needed immediate consequences after the codex opening.', authorName: 'Elara Vance' },
            { paragraphId: 'p-6', text: 'The voice whispering "The codex is not a book. It is a key" is never identified. Readers have theories. I know who it is, but I will never confirm it.', authorName: 'Elara Vance' },
        ],
        editorNotes: [
            { paragraphId: 'p-4', text: 'The repetition of "silence" is intentional. In the manuscript, Elara originally heard footsteps. The silence is scarier because it denies the reader the comfort of a identifiable threat.', editorName: 'Maren Cole' },
        ],
        content: `The words on the page seemed to shift and writhe as she read them. It wasn't a language she knew, not the Old Tongue, not the Scholar's Script, not any of the seventeen dialects catalogued in the Athenaeum's archives. Yet she understood it perfectly, the way you understand the language of dreams.

She closed the book, her heart pounding in her chest. The glow faded, but the warmth remained, seeping into her skin, settling into her bones. She could feel it there, a second pulse beneath her own.

The library was silent. Too silent. She realized she could no longer hear the distant chime of the clock tower, or the wind against the high windows, or the settling creak of old shelves. The silence was complete, like being submerged in deep water.

She waited. Nothing moved. Nothing breathed. She was alone in the silence.

Then, a whisper. Not a sound, exactly, but a vibration in the air, a resonance she felt in her teeth and in the newly warm marrow of her bones.

"The codex is not a book. It is a key."

"Who's there?" she called out, her voice trembling. The words fell flat in the dead air, absorbed by the silence as if swallowed.

No answer came. But the warmth in her bones pulsed once, like an acknowledgment.

She hurried out of the restricted section, the heavy tome clutched tightly to her chest. The familiar scent of old paper and dust was now tainted with the faint smell of ozone and burning embers. It clung to her like a second skin.

She knew she had to leave the city. Not tomorrow. Not after dawn. Now. The Order of the Eclipse monitored every Marrow Vein within the city walls. If the codex was what she believed it was, they would have already felt its awakening, already dispatched their Seekers, already begun the hunt.

Elara packed nothing. She dropped her scholar's robe on the floor of her quarters, pulled on a traveling cloak, and slipped the codex into a leather satchel. At the door, she paused, looking back at the life she was leaving.

Then she stepped into the dark.`,
    },
    '3': {
        title: 'The Order of the Eclipse', number: 3,
        authorNotes: [
            { paragraphId: 'p-2', text: 'The silver thread on their robes is woven from actual Marrow, giving the Order limited protection against magical attacks. This detail matters later.', authorName: 'Elara Vance' },
            { paragraphId: 'p-9', text: 'The fire that cannot be extinguished is the central metaphor of the entire trilogy. Elara carries both literal and figurative fire from this point forward.', authorName: 'Elara Vance' },
        ],
        editorNotes: [
            { paragraphId: 'p-5', text: 'This is a classic escalation technique: the leader speaks, draws a weapon, and steps forward. Three beats, increasing threat. We stripped out interior monologue between each beat to maintain momentum.', editorName: 'Maren Cole' },
        ],
        content: `They came in the dead of night, silent as shadows, three figures materializing from the darkness as if the night itself had given them form. Elara barely had time to grab the codex before her door was splintered open, the wood cracking like a bone.

Three figures stood in the doorway, their faces hidden beneath dark hoods embroidered with silver thread. The symbol of the Eclipse, a dying sun consumed by a serpent's jaw, was emblazoned on their chests in thread that seemed to glow with its own faint light.

"Give us the book, scholar," the leader hissed, his voice like dry leaves scraping against stone. He was tall, impossibly so, his hooded form filling the doorway. "The Eclipse has felt its awakening. You cannot hide what has been found."

Elara backed away, her hand instinctively going to the small dagger hidden in her boot. "I don't know what you're talking about."

"Do not lie to us. We can smell the magic on you." The leader stepped forward, drawing a long, curved blade from beneath his robes. The metal gleamed with an oily iridescence, like a beetle's wing. "The codex belongs to the Order. It has always belonged to the Order. Give it to us, and you will be permitted to live."

The other two fanned out, flanking her. She was cornered. The window behind her was the only exit, a two-story drop to cobblestones.

Elara did not hesitate. She threw her lantern at the leader, the glass shattering and spilling burning oil across the floor. The flames caught his robes, and he shrieked, a sound inhuman and terrible, like tearing metal.

In the chaos of fire and shouting, she vaulted through the window. The glass sliced her forearm as she cleared the frame, and she hit the cobblestones hard, pain shooting through her ankle like a bolt of lightning. But she forced herself to run.

Behind her, the house burned. The fire spread faster than natural flame should, feeding on the residual magic saturating the building. The Order would follow. They always did.

But Elara had the codex, and now she knew its first secret: the fire within could not be extinguished. Not by water. Not by will. Not by the Order of the Eclipse.

It burned because it chose to burn. And it had chosen her.`,
    },
};

const REACTIONS = [
    { emoji: '🔥', label: 'Fire' },
    { emoji: '😭', label: 'Emotional' },
    { emoji: '🤯', label: 'Mind-blown' },
    { emoji: '💀', label: 'Dead' },
    { emoji: '✨', label: 'Beautiful' },
    { emoji: '🧠', label: 'Thought-provoking' },
];

// ── Seed Community Highlights ──
const SEED_COMMUNITY: Record<string, { count: number; reactions: Record<string, number>; notes: { displayName: string; note: string }[] }> = {
    'p-0': { count: 23, reactions: { '✨': 12, '🔥': 8 }, notes: [{ displayName: 'stargazer_42', note: 'Perfect opening line. You can smell the dust.' }] },
    'p-2': { count: 47, reactions: { '🤯': 15, '🔥': 22, '✨': 10 }, notes: [{ displayName: 'lore_keeper', note: 'The Marrow System is incredible worldbuilding.' }, { displayName: 'mythweaver', note: 'Fallen gods leaving magic in the earth... chills.' }] },
    'p-4': { count: 12, reactions: { '😭': 5, '✨': 7 }, notes: [] },
    'p-7': { count: 31, reactions: { '🔥': 18, '🤯': 13 }, notes: [{ displayName: 'neon_fan', note: 'The light-as-letters detail is so vivid.' }] },
    'p-10': { count: 89, reactions: { '🔥': 45, '🤯': 30, '✨': 14 }, notes: [{ displayName: 'rootreader', note: 'Three words. Three concepts. The entire magic system in a nutshell.' }, { displayName: 'quantum_pen', note: 'I got actual chills reading this.' }, { displayName: 'cyber_dreamer', note: 'This is the line that hooked me for the whole series.' }] },
};

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
    const [chapter, setChapter] = useState<typeof SEED_CHAPTERS['1'] | null>(null);
    const [book] = useState(SEED_BOOK);
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
        const ch = SEED_CHAPTERS[chapterId || '1'];
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
        const seed = SEED_COMMUNITY[pid];
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
        const chapterData = SEED_CHAPTERS[chapterId || '1'];
        const seedNotes = chapterData?.authorNotes.filter(n => n.paragraphId === pid) || [];
        const firestoreNotes = authorNotes.filter(n => n.paragraphId === pid);
        return [...seedNotes, ...firestoreNotes];
    };

    const getEditorNotes = (pid: string): EditorNote[] => {
        const chapterData = SEED_CHAPTERS[chapterId || '1'];
        const seedNotes = chapterData?.editorNotes.filter(n => n.paragraphId === pid) || [];
        const firestoreNotes = editorNotes.filter(n => n.paragraphId === pid);
        return [...seedNotes, ...firestoreNotes];
    };

    const t = THEMES[theme];
    const totalChapters = Object.keys(SEED_CHAPTERS).length;
    const chapterNum = parseInt(chapterId || '1');
    const wordCount = chapter?.content.split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / 250);

    if (!chapter) {
        return <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg, color: t.text }}>Chapter not found.</div>;
    }

    // Parse content into paragraphs
    const paragraphs = chapter.content.split('\n').filter(line => line.trim() !== '');

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
                                {Object.entries(SEED_CHAPTERS).map(([id, ch]) => (
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
