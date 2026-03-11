import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, ChevronRight, ChevronDown, Trash2, Edit2,
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3, Quote, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, Undo2, Redo2,
    Save, Clock, BookOpen, PanelLeftClose, PanelRightClose,
    PanelLeftOpen, PanelRightOpen, Scroll, StickyNote,
    Microscope, ArrowLeft, MoreVertical, Check, X,
    History, GitBranch, Eye, Highlighter, Minus,
    GripVertical, FolderOpen, FilePlus, Sparkles, Target,
    MessageSquare, Users, Send, CheckCircle, XCircle,
    PenLine, UserCheck, Reply
} from 'lucide-react';
import { useManuscript, type Chapter } from '../hooks/useManuscript';
import { useVersionHistory, type DiffSegment } from '../hooks/useVersionHistory';
import { useWritingSessions } from '../hooks/useWritingSessions';
import { useCollaboration, useComments, useSuggestions } from '../hooks/useCollaboration';
import { useAuth } from '../contexts/AuthContext';

// ════════════════════════════════════════════════════════
// FORGE EDITOR PAGE
// ════════════════════════════════════════════════════════
export default function ForgeEditor() {
    const { manuscriptId } = useParams<{ manuscriptId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        manuscripts, chapters, loading, saving, totalWords,
        createManuscript, updateManuscript, addChapter,
        saveChapter, updateChapter, deleteChapter, reorderChapters
    } = useManuscript(manuscriptId);
    const { logEpisodeSession } = useWritingSessions();

    // Collaboration hooks
    const { collaborators, updateCursor } = useCollaboration(manuscriptId);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

    const activeChapter = chapters.find(c => c.id === activeChapterId);
    const activeManuscript = manuscripts.find(m => m.id === manuscriptId);

    const { comments, openComments, addComment, replyToComment, toggleResolve, deleteComment } = useComments(manuscriptId, activeChapterId || undefined);
    const { pendingSuggestions, addSuggestion, acceptSuggestion, rejectSuggestion } = useSuggestions(manuscriptId, activeChapterId || undefined);

    const [showBinder, setShowBinder] = useState(true);
    const [showInspector, setShowInspector] = useState(true);
    const [showVersions, setShowVersions] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showNewManuscript, setShowNewManuscript] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState<string | null>(null);
    const [editTitleValue, setEditTitleValue] = useState('');
    const [inspectorTab, setInspectorTab] = useState<'notes' | 'meta' | 'comments'>('notes');
    const [notesValue, setNotesValue] = useState('');
    const notesDirtyRef = useRef(false);
    const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [suggestionMode, setSuggestionMode] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const [showCommentPopover, setShowCommentPopover] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedContent = useRef<string>('');
    const prevWordCount = useRef<number>(0);
    const prevChapterIdRef = useRef<string | null>(null);

    // Version history
    const { versions, saveVersion, computeDiff, getDiffBetween } = useVersionHistory(manuscriptId, activeChapterId || undefined);
    const [diffView, setDiffView] = useState<DiffSegment[] | null>(null);
    const [compareFrom, setCompareFrom] = useState<number | null>(null);

    // ── TipTap Editor ──
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({ placeholder: 'Start writing your story...' }),
            CharacterCount,
            Highlight.configure({ multicolor: true }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Typography,
        ],
        editorProps: {
            attributes: {
                class: 'forge-editor-content',
            },
        },
        onUpdate: ({ editor }) => {
            // Debounced auto-save
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                autoSaveRef.current?.(editor);
            }, 2000);
        },
    });

    // Load chapter content into editor when switching chapters
    useEffect(() => {
        if (!editor) return;
        if (!activeChapter || !activeChapterId) {
            editor.commands.setContent('');
            lastSavedContent.current = '';
            prevWordCount.current = 0;
            prevChapterIdRef.current = null;
            return;
        }
        const chapterChanged = prevChapterIdRef.current !== activeChapterId;
        prevChapterIdRef.current = activeChapterId;

        if (chapterChanged) {
            const contentToLoad = activeChapter.content || '';
            editor.commands.setContent(contentToLoad);
            lastSavedContent.current = contentToLoad;
            prevWordCount.current = activeChapter.wordCount || 0;
            // Only reset notes on chapter switch, not on content changes
            setNotesValue(activeChapter.notes || '');
            notesDirtyRef.current = false;
        } else if (activeChapter.content && activeChapter.content !== lastSavedContent.current) {
            editor.commands.setContent(activeChapter.content);
            lastSavedContent.current = activeChapter.content;
            prevWordCount.current = activeChapter.wordCount || 0;
        }
    }, [editor, activeChapterId, activeChapter?.content]);

    // Select first chapter when manuscript loads
    useEffect(() => {
        if (chapters.length > 0 && !activeChapterId) {
            setActiveChapterId(chapters[0].id);
        }
    }, [chapters, activeChapterId]);

    // Auto-save function
    const autoSave = useCallback(async (ed: typeof editor) => {
        if (!ed || !activeChapterId || !manuscriptId) return;
        const html = ed.getHTML();
        const text = ed.getText();
        if (html === lastSavedContent.current) return;

        await saveChapter(activeChapterId, html, text);
        lastSavedContent.current = html;

        // Log writing session for word count delta
        const newWordCount = text.split(/\s+/).filter(Boolean).length;
        const delta = newWordCount - prevWordCount.current;
        if (delta > 10 && activeManuscript) {
            logEpisodeSession(delta, activeManuscript.title);
        }
        prevWordCount.current = newWordCount;

        // Save version snapshot
        saveVersion(html, text);
    }, [activeChapterId, manuscriptId, saveChapter, saveVersion, logEpisodeSession, activeManuscript]);

    // Keep a ref to autoSave so setTimeout always gets latest closure
    const autoSaveRef = useRef(autoSave);
    useEffect(() => { autoSaveRef.current = autoSave; }, [autoSave]);

    // Manual save
    const handleManualSave = useCallback(() => {
        if (editor) {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            autoSaveRef.current?.(editor);
        }
    }, [editor]);

    // Ctrl+S keyboard shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (editor) {
                    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                    autoSaveRef.current?.(editor);
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [editor]);

    // Cleanup save timer on unmount
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    // Create new manuscript
    const handleCreateManuscript = async () => {
        if (!newTitle.trim()) return;
        const id = await createManuscript(newTitle.trim());
        if (id) {
            setShowNewManuscript(false);
            setNewTitle('');
            navigate(`/forge-editor/${id}`);
        }
    };

    // Save chapter notes
    const handleSaveNotes = useCallback(async () => {
        if (!activeChapterId) return;
        await updateChapter(activeChapterId, { notes: notesValue } as Partial<Chapter>);
        notesDirtyRef.current = false;
    }, [activeChapterId, notesValue, updateChapter]);

    // Auto-save notes after 2s of inactivity
    const handleNotesChange = useCallback((value: string) => {
        setNotesValue(value);
        notesDirtyRef.current = true;
        if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
        notesTimerRef.current = setTimeout(() => {
            if (activeChapterId && notesDirtyRef.current) {
                updateChapter(activeChapterId, { notes: value } as Partial<Chapter>);
                notesDirtyRef.current = false;
            }
        }, 2000);
    }, [activeChapterId, updateChapter]);

    // Cleanup notes timer
    useEffect(() => {
        return () => { if (notesTimerRef.current) clearTimeout(notesTimerRef.current); };
    }, []);

    // ── Manuscript List View (no manuscript selected) ──
    if (!manuscriptId) {
        return (
            <div className="min-h-screen bg-void-black text-white">
                <div className="max-w-4xl mx-auto px-6 py-16">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-14 h-14 rounded-lg bg-starforge-gold/10 flex items-center justify-center">
                            <Scroll className="w-7 h-7 text-starforge-gold" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-display text-white tracking-wide">THE FORGE</h1>
                            <p className="text-sm text-text-secondary">Your manuscripts, your world</p>
                        </div>
                    </div>

                    <button onClick={() => setShowNewManuscript(true)}
                        className="w-full mb-8 p-6 border-2 border-dashed border-white/[0.1] rounded-lg hover:border-starforge-gold/40 transition-colors flex items-center justify-center gap-3 group">
                        <Plus className="w-5 h-5 text-text-secondary group-hover:text-starforge-gold transition-colors" />
                        <span className="text-sm text-text-secondary group-hover:text-white transition-colors font-ui uppercase tracking-wider">New Manuscript</span>
                    </button>

                    {showNewManuscript && (
                        <div className="mb-8 p-6 bg-white/[0.03] border border-white/[0.08] rounded-lg">
                            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                placeholder="Manuscript title..."
                                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded text-white text-lg focus:outline-none focus:border-starforge-gold/40 mb-4"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && handleCreateManuscript()} />
                            <div className="flex gap-3">
                                <button onClick={handleCreateManuscript}
                                    className="px-4 py-2 bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-starforge-gold/90">
                                    Create
                                </button>
                                <button onClick={() => { setShowNewManuscript(false); setNewTitle(''); }}
                                    className="px-4 py-2 bg-white/[0.06] text-text-secondary text-xs font-semibold uppercase tracking-wider rounded hover:bg-white/[0.1]">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center text-text-secondary py-16 animate-pulse">Loading manuscripts...</div>
                    ) : manuscripts.length === 0 ? (
                        <div className="text-center py-16">
                            <Scroll className="w-12 h-12 text-white/[0.1] mx-auto mb-4" />
                            <p className="text-text-secondary text-sm">No manuscripts yet. Create your first one above.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {manuscripts.map(m => (
                                <div key={m.id} onClick={() => navigate(`/forge-editor/${m.id}`)}
                                    className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-lg cursor-pointer hover:border-starforge-gold/30 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg text-white font-semibold group-hover:text-starforge-gold transition-colors">{m.title}</h3>
                                            <p className="text-xs text-text-secondary mt-1">
                                                {m.genre && <span>{m.genre} · </span>}
                                                {m.status} · Updated {m.updatedAt?.toDate ? new Date(m.updatedAt.toDate()).toLocaleDateString() : 'recently'}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-starforge-gold transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Editor View ──
    const liveWordCount = editor?.storage.characterCount?.words?.() || 0;
    const wordCount = liveWordCount;
    const charCount = editor?.storage.characterCount?.characters?.() || 0;

    return (
        <div className="h-screen flex flex-col bg-void-black text-white overflow-hidden">
            {/* Top Bar */}
            <div className="flex-none h-12 bg-deep-space/80 backdrop-blur border-b border-white/[0.06] flex items-center px-3 gap-2 z-20">
                <button onClick={() => navigate('/forge-editor')} className="p-1.5 rounded hover:bg-white/[0.06] text-text-secondary hover:text-white" title="Back to manuscripts">
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-white/[0.08]" />
                <button onClick={() => setShowBinder(b => !b)} className="p-1.5 rounded hover:bg-white/[0.06] text-text-secondary hover:text-white" title="Toggle binder">
                    {showBinder ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </button>
                <h2 className="text-sm text-white font-semibold truncate flex-1 text-center">
                    {activeManuscript?.title || 'Untitled'}
                    {saving && <span className="text-[10px] text-starforge-gold/60 ml-2 animate-pulse">Saving...</span>}
                </h2>

                {/* Presence Avatars */}
                {collaborators.length > 0 && (
                    <div className="flex items-center gap-1 mr-2">
                        {collaborators.map(c => (
                            <div key={c.uid} className="relative group" title={`${c.name} is editing`}>
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-void-black border-2" style={{ backgroundColor: c.color, borderColor: c.color }}>
                                    {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border border-deep-space" />
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-deep-space border border-white/[0.1] rounded px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    {c.name} · editing
                                </div>
                            </div>
                        ))}
                        <span className="text-[9px] text-text-secondary ml-1">{collaborators.length + 1} online</span>
                    </div>
                )}

                <button onClick={() => setSuggestionMode(s => !s)} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${suggestionMode ? 'text-emerald-400 bg-emerald-400/10' : 'text-text-secondary hover:text-white'}`} title={suggestionMode ? 'Suggestion mode ON' : 'Suggestion mode OFF'}>
                    <PenLine className="w-4 h-4" />
                </button>
                <button onClick={() => {
                    const willShow = !showComments;
                    setShowComments(willShow);
                    if (willShow) { setShowVersions(false); setInspectorTab('comments'); setShowInspector(true); }
                }} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors relative ${showComments ? 'text-starforge-gold' : 'text-text-secondary hover:text-white'}`} title="Comments">
                    <MessageSquare className="w-4 h-4" />
                    {openComments.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] text-white flex items-center justify-center">{openComments.length}</span>}
                </button>
                <button onClick={() => {
                    const willShow = !showVersions;
                    setShowVersions(willShow);
                    if (willShow) setShowComments(false);
                }} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${showVersions ? 'text-starforge-gold' : 'text-text-secondary hover:text-white'}`} title="Version history">
                    <History className="w-4 h-4" />
                </button>
                <button onClick={() => setShowInspector(i => !i)} className="p-1.5 rounded hover:bg-white/[0.06] text-text-secondary hover:text-white" title="Toggle inspector">
                    {showInspector ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* ── Binder (Left Panel) ── */}
                <AnimatePresence>
                    {showBinder && (
                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            className="flex-none bg-deep-space/40 border-r border-white/[0.06] flex flex-col overflow-hidden">
                            <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
                                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-ui">Manuscript</span>
                                <button onClick={async () => {
                                    handleManualSave();
                                    const newId = await addChapter('', 'chapter');
                                    if (newId) setActiveChapterId(newId);
                                }} className="p-1 rounded hover:bg-white/[0.08] text-text-secondary hover:text-starforge-gold" title="Add chapter">
                                    <FilePlus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-1">
                                {chapters.filter(ch => ch.type === 'chapter' || ch.type === 'scene').map((ch, idx) => (
                                    <div key={ch.id}
                                        className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${activeChapterId === ch.id ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:bg-white/[0.04] hover:text-white'}`}
                                        onClick={() => { handleManualSave(); setActiveChapterId(ch.id); }}>
                                        <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-40 flex-none" />
                                        {ch.type === 'chapter' ? <FileText className="w-3.5 h-3.5 flex-none" /> :
                                            <Scroll className="w-3.5 h-3.5 flex-none" />}
                                        {editingTitle === ch.id ? (
                                            <input value={editTitleValue} onChange={e => setEditTitleValue(e.target.value)}
                                                className="flex-1 bg-transparent border-b border-starforge-gold/40 text-xs text-white focus:outline-none min-w-0"
                                                autoFocus
                                                onBlur={() => { updateChapter(ch.id, { title: editTitleValue } as Partial<Chapter>); setEditingTitle(null); }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') { updateChapter(ch.id, { title: editTitleValue } as Partial<Chapter>); setEditingTitle(null); }
                                                    if (e.key === 'Escape') setEditingTitle(null);
                                                }} />
                                        ) : (
                                            <span className="text-xs truncate flex-1" onDoubleClick={() => { setEditingTitle(ch.id); setEditTitleValue(ch.title); }}>
                                                {ch.title}
                                            </span>
                                        )}
                                        <span className="text-[9px] opacity-60 flex-none">
                                            {activeChapterId === ch.id ? liveWordCount : (ch.wordCount || 0)}
                                        </span>
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingTitle(ch.id);
                                            setEditTitleValue(ch.title);
                                        }}
                                            className="p-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-starforge-gold"
                                            title="Rename">
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!confirm(`Delete "${ch.title}"?`)) return;
                                            if (activeChapterId === ch.id) {
                                                handleManualSave();
                                                const remaining = chapters.filter(c => c.id !== ch.id);
                                                if (remaining.length > 0) {
                                                    const currentIdx = chapters.findIndex(c => c.id === ch.id);
                                                    const nextChapter = chapters[currentIdx - 1] || chapters[currentIdx + 1] || remaining[0];
                                                    setActiveChapterId(nextChapter?.id || null);
                                                } else {
                                                    setActiveChapterId(null);
                                                }
                                            }
                                            await deleteChapter(ch.id);
                                        }}
                                            className="p-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-red-400"
                                            title="Delete">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {/* Binder Footer */}
                            <div className="p-3 border-t border-white/[0.06] text-[10px] text-text-secondary">
                                <div className="flex justify-between">
                                    <span>{chapters.length} items</span>
                                    <span>{totalWords.toLocaleString()} words total</span>
                                </div>
                                {activeManuscript?.targetWords && (
                                    <div className="mt-2">
                                        <div className="flex justify-between mb-1">
                                            <span>Progress</span>
                                            <span>{Math.min(100, Math.round((totalWords / activeManuscript.targetWords) * 100))}%</span>
                                        </div>
                                        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                            <div className="h-full bg-starforge-gold/60 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, (totalWords / activeManuscript.targetWords) * 100)}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Editor (Center) ── */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Formatting Toolbar */}
                    {editor && (
                        <div className="flex-none h-10 bg-deep-space/30 border-b border-white/[0.06] flex items-center px-3 gap-0.5 overflow-x-auto">
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="Bold" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="Italic" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={Highlighter} title="Highlight" />
                            <div className="w-px h-5 bg-white/[0.08] mx-1" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={Heading1} title="Heading 1" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={Heading3} title="Heading 3" />
                            <div className="w-px h-5 bg-white/[0.08] mx-1" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={Quote} title="Blockquote" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="Bullet list" />
                            <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={ListOrdered} title="Numbered list" />
                            <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} icon={Minus} title="Scene break" />
                            <div className="w-px h-5 bg-white/[0.08] mx-1" />
                            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Left align" />
                            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Center" />
                            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Right align" />
                            <div className="w-px h-5 bg-white/[0.08] mx-1" />
                            <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} icon={Undo2} title="Undo" />
                            <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} icon={Redo2} title="Redo" />
                            <div className="w-px h-5 bg-white/[0.08] mx-1" />
                            {/* Comment on selection */}
                            <button onClick={() => {
                                const { from, to } = editor.state.selection;
                                if (from === to) return;
                                setShowCommentPopover(true);
                            }} className="p-1.5 rounded text-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors" title="Add comment on selection">
                                <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            {/* Suggestion mode indicator */}
                            {suggestionMode && (
                                <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">SUGGESTING</span>
                            )}
                            <div className="flex-1" />
                            <button onClick={handleManualSave} className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] text-text-secondary hover:text-starforge-gold hover:bg-white/[0.04] transition-colors" title="Save (Ctrl+S)">
                                <Save className="w-3.5 h-3.5" /> Save
                            </button>
                        </div>
                    )}

                    {/* Editor Content */}
                    <div className="flex-1 overflow-y-auto relative">
                        {activeChapter ? (
                            <div className="max-w-3xl mx-auto px-8 py-12">
                                <h2 className="text-2xl font-display text-white/80 mb-8 tracking-wide">{activeChapter.title}</h2>
                                <EditorContent editor={editor} />

                                {/* Pending Suggestions Overlay */}
                                {pendingSuggestions.length > 0 && (
                                    <div className="mt-8 border-t border-white/[0.06] pt-6">
                                        <h4 className="text-[10px] uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
                                            <PenLine className="w-3 h-3 text-emerald-400" /> {pendingSuggestions.length} Pending Suggestion{pendingSuggestions.length > 1 ? 's' : ''}
                                        </h4>
                                        {pendingSuggestions.map(s => (
                                            <div key={s.id} className="mb-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] text-text-secondary">{s.authorName}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${s.type === 'insert' ? 'bg-emerald-500/10 text-emerald-400' : s.type === 'delete' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>{s.type}</span>
                                                </div>
                                                {s.originalText && <p className="text-xs text-red-300/60 line-through mb-1">{s.originalText}</p>}
                                                {s.suggestedText && <p className="text-xs text-emerald-300">{s.suggestedText}</p>}
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => acceptSuggestion(s.id)} className="flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
                                                        <CheckCircle className="w-3 h-3" /> Accept
                                                    </button>
                                                    <button onClick={() => rejectSuggestion(s.id)} className="flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">
                                                        <XCircle className="w-3 h-3" /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-secondary">
                                <div className="text-center">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-sm">Select a chapter from the binder to start writing</p>
                                </div>
                            </div>
                        )}

                        {/* Comment Popover */}
                        {showCommentPopover && editor && (
                            <div className="absolute top-16 right-8 w-72 bg-deep-space border border-white/[0.1] rounded-lg shadow-2xl z-30 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-white font-semibold flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-starforge-gold" /> Add Comment</span>
                                    <button onClick={() => { setShowCommentPopover(false); setNewCommentText(''); }} className="text-text-secondary hover:text-white"><X className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="text-[10px] text-white/40 mb-2 px-2 py-1 bg-white/[0.03] rounded italic truncate">
                                    "{editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ').slice(0, 80)}"
                                </div>
                                <textarea value={newCommentText} onChange={e => setNewCommentText(e.target.value)}
                                    placeholder="Write your comment..."
                                    className="w-full h-20 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white resize-none focus:outline-none focus:border-starforge-gold/30 mb-2"
                                    autoFocus />
                                <button onClick={async () => {
                                    if (!newCommentText.trim()) return;
                                    const { from, to } = editor.state.selection;
                                    const selectedText = editor.state.doc.textBetween(from, to, ' ');
                                    await addComment(selectedText, from, to, newCommentText.trim());
                                    setNewCommentText('');
                                    setShowCommentPopover(false);
                                    setShowComments(true);
                                }} className="w-full py-1.5 bg-starforge-gold text-void-black text-[10px] font-semibold uppercase tracking-wider rounded hover:bg-starforge-gold/90">
                                    Post Comment
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    <div className="flex-none h-7 bg-deep-space/60 border-t border-white/[0.06] flex items-center px-3 text-[10px] text-text-secondary gap-4">
                        <span>{wordCount.toLocaleString()} words</span>
                        <span>{charCount.toLocaleString()} chars</span>
                        {activeChapter && <span className="capitalize">{activeChapter.status}</span>}
                        {saving && <span className="text-starforge-gold/60 animate-pulse">Saving...</span>}
                        {suggestionMode && <span className="text-emerald-400">📝 Suggest mode</span>}
                        {collaborators.length > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {collaborators.length + 1}</span>}
                        <div className="flex-1" />
                        {openComments.length > 0 && <span>{openComments.length} comment{openComments.length > 1 ? 's' : ''}</span>}
                        {versions.length > 0 && <span>{versions.length} versions</span>}
                    </div>
                </div>

                {/* ── Inspector (Right Panel) ── */}
                <AnimatePresence>
                    {showInspector && (
                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            className="flex-none bg-deep-space/40 border-l border-white/[0.06] flex flex-col overflow-hidden">
                            <div className="flex border-b border-white/[0.06]">
                                {(['notes', 'meta', 'comments'] as const).map(tab => (
                                    <button key={tab} onClick={() => setInspectorTab(tab)}
                                        className={`flex-1 py-2.5 text-[10px] uppercase tracking-wider font-ui transition-colors relative ${inspectorTab === tab ? 'text-starforge-gold border-b border-starforge-gold' : 'text-text-secondary hover:text-white'}`}>
                                        {tab}
                                        {tab === 'comments' && openComments.length > 0 && (
                                            <span className="ml-1 px-1 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[8px]">{openComments.length}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {inspectorTab === 'notes' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-text-secondary uppercase tracking-wider">Scene Notes</span>
                                            <div className="flex items-center gap-2">
                                                {notesDirtyRef.current && <span className="text-[9px] text-starforge-gold/50 animate-pulse">Modified</span>}
                                                <button onClick={handleSaveNotes} className="text-[10px] text-starforge-gold hover:text-starforge-gold/80 font-semibold">Save</button>
                                            </div>
                                        </div>
                                        <textarea value={notesValue} onChange={e => handleNotesChange(e.target.value)}
                                            placeholder="Notes, ideas, reminders..."
                                            className="w-full h-48 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white resize-none focus:outline-none focus:border-starforge-gold/30" />
                                    </div>
                                )}
                                {inspectorTab === 'meta' && activeChapter && (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Status</span>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {(['draft', 'revised', 'edited', 'final'] as const).map(s => (
                                                    <button key={s} onClick={() => updateChapter(activeChapter.id, { status: s } as Partial<Chapter>)}
                                                        className={`py-1.5 text-[10px] uppercase tracking-wider rounded transition-colors ${activeChapter.status === s ? 'bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30' : 'bg-white/[0.04] text-text-secondary border border-white/[0.06] hover:border-white/[0.12]'}`}>
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Word Count</span>
                                            <p className="text-2xl font-semibold text-white">{(activeChapterId === activeChapter.id ? liveWordCount : (activeChapter.wordCount || 0)).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Type</span>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {(['chapter', 'scene', 'notes', 'research'] as const).map(t => (
                                                    <button key={t} onClick={() => updateChapter(activeChapter.id, { type: t } as Partial<Chapter>)}
                                                        className={`py-1.5 text-[10px] uppercase tracking-wider rounded transition-colors ${activeChapter.type === t ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30' : 'bg-white/[0.04] text-text-secondary border border-white/[0.06] hover:border-white/[0.12]'}`}>
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Reading Time</span>
                                            <p className="text-sm text-white">{Math.max(1, Math.ceil((activeChapter.wordCount || 0) / 250))} min</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Collaborators</span>
                                            {collaborators.length === 0 ? (
                                                <p className="text-xs text-text-secondary">Only you</p>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    {collaborators.map(c => (
                                                        <div key={c.uid} className="flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-void-black" style={{ backgroundColor: c.color }}>
                                                                {c.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-xs text-white">{c.name}</span>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* ── Comments Tab ── */}
                                {inspectorTab === 'comments' && (
                                    <div className="space-y-3">
                                        {openComments.length === 0 ? (
                                            <div className="text-center py-8">
                                                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20 text-text-secondary" />
                                                <p className="text-xs text-text-secondary">No comments yet</p>
                                                <p className="text-[10px] text-text-secondary mt-1">Select text and click 💬 to add one</p>
                                            </div>
                                        ) : (
                                            openComments.map(c => (
                                                <div key={c.id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-semibold text-white">{c.authorName}</span>
                                                        <span className="text-[9px] text-text-secondary">
                                                            {c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleDateString() : 'now'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-white/40 italic mb-1.5 truncate">"{c.highlightText}"</p>
                                                    <p className="text-xs text-white/80 mb-2">{c.body}</p>

                                                    {/* Replies */}
                                                    {c.replies && c.replies.length > 0 && (
                                                        <div className="ml-3 border-l border-white/[0.06] pl-3 space-y-2 mb-2">
                                                            {c.replies.map((r, ri) => (
                                                                <div key={ri}>
                                                                    <span className="text-[9px] font-semibold text-white">{r.authorName}</span>
                                                                    <p className="text-[10px] text-white/70">{r.body}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Reply input */}
                                                    {replyingTo === c.id ? (
                                                        <div className="flex gap-1.5 mt-2">
                                                            <input value={replyText} onChange={e => setReplyText(e.target.value)}
                                                                placeholder="Reply..."
                                                                className="flex-1 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] text-white focus:outline-none focus:border-starforge-gold/30"
                                                                autoFocus
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter' && replyText.trim()) {
                                                                        replyToComment(c.id, replyText.trim());
                                                                        setReplyText('');
                                                                        setReplyingTo(null);
                                                                    }
                                                                }} />
                                                            <button onClick={() => {
                                                                if (replyText.trim()) {
                                                                    replyToComment(c.id, replyText.trim());
                                                                    setReplyText('');
                                                                    setReplyingTo(null);
                                                                }
                                                            }} className="p-1 text-starforge-gold hover:text-starforge-gold/80">
                                                                <Send className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setReplyingTo(c.id)} className="text-[9px] text-text-secondary hover:text-white flex items-center gap-1">
                                                                <Reply className="w-3 h-3" /> Reply
                                                            </button>
                                                            <button onClick={() => toggleResolve(c.id)} className="text-[9px] text-emerald-400/60 hover:text-emerald-400 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> Resolve
                                                            </button>
                                                            <button onClick={() => deleteComment(c.id)} className="text-[9px] text-red-400/40 hover:text-red-400">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Version History (Right Drawer) ── */}
                <AnimatePresence>
                    {showVersions && (
                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                            className="flex-none bg-deep-space/60 border-l border-white/[0.06] flex flex-col overflow-hidden">
                            <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
                                <span className="text-xs font-ui text-white uppercase tracking-wider flex items-center gap-2">
                                    <GitBranch className="w-3.5 h-3.5 text-starforge-gold" /> Version History
                                </span>
                                <button onClick={() => { setShowVersions(false); setDiffView(null); }} className="text-text-secondary hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {diffView ? (
                                <div className="flex-1 overflow-y-auto p-4">
                                    <button onClick={() => setDiffView(null)} className="text-[10px] text-starforge-gold mb-3 hover:underline flex items-center gap-1">
                                        <ArrowLeft className="w-3 h-3" /> Back to versions
                                    </button>
                                    <div className="text-xs font-mono leading-relaxed space-y-0.5">
                                        {diffView.map((seg, i) => (
                                            <span key={i} className={
                                                seg.type === 'insert' ? 'bg-emerald-500/20 text-emerald-300' :
                                                    seg.type === 'delete' ? 'bg-red-500/20 text-red-300 line-through' :
                                                        'text-white/60'
                                            }>{seg.text}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto">
                                    {versions.length === 0 ? (
                                        <div className="p-4 text-center text-text-secondary text-xs">
                                            <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p>No versions yet. Start writing and versions will be saved automatically.</p>
                                        </div>
                                    ) : (
                                        versions.map((v, i) => (
                                            <div key={v.id} className="p-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] text-text-secondary">
                                                        {v.createdAt?.toDate ? new Date(v.createdAt.toDate()).toLocaleString() : 'Just now'}
                                                    </span>
                                                    <span className="text-[10px] text-text-secondary">{v.wordCount}w</span>
                                                </div>
                                                <p className="text-[10px] text-white/60 mb-2">{v.message}</p>
                                                <div className="flex gap-2">
                                                    {i < versions.length - 1 && (
                                                        <button onClick={() => setDiffView(getDiffBetween(i + 1, i))}
                                                            className="text-[9px] px-2 py-0.5 rounded bg-white/[0.04] text-text-secondary hover:text-white hover:bg-white/[0.08] transition-colors">
                                                            View diff
                                                        </button>
                                                    )}
                                                    <button onClick={() => {
                                                        if (editor && v.content) {
                                                            editor.commands.setContent(v.content);
                                                            lastSavedContent.current = ''; // Force save on next autoSave
                                                            handleManualSave();
                                                        }
                                                    }}
                                                        className="text-[9px] px-2 py-0.5 rounded bg-white/[0.04] text-text-secondary hover:text-starforge-gold hover:bg-starforge-gold/10 transition-colors">
                                                        Restore
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Editor Styles */}
            <style>{`
        .forge-editor-content {
          font-family: 'Georgia', 'Palatino Linotype', 'Book Antiqua', serif;
          font-size: 17px;
          line-height: 1.8;
          color: rgba(255,255,255,0.85);
          min-height: 600px;
          outline: none;
        }
        .forge-editor-content:focus { outline: none; }
        .forge-editor-content p { margin-bottom: 1em; }
        .forge-editor-content h1 { font-size: 2em; font-weight: 700; margin: 1.5em 0 0.5em; color: white; font-family: system-ui; letter-spacing: 0.02em; }
        .forge-editor-content h2 { font-size: 1.5em; font-weight: 600; margin: 1.2em 0 0.4em; color: rgba(255,255,255,0.9); font-family: system-ui; }
        .forge-editor-content h3 { font-size: 1.2em; font-weight: 600; margin: 1em 0 0.3em; color: rgba(255,255,255,0.85); font-family: system-ui; }
        .forge-editor-content blockquote {
          border-left: 3px solid rgba(212,175,55,0.4);
          padding-left: 1.2em;
          margin: 1.5em 0;
          color: rgba(255,255,255,0.6);
          font-style: italic;
        }
        .forge-editor-content ul, .forge-editor-content ol { padding-left: 1.5em; margin-bottom: 1em; }
        .forge-editor-content li { margin-bottom: 0.3em; }
        .forge-editor-content hr {
          border: none;
          text-align: center;
          margin: 2em 0;
        }
        .forge-editor-content hr::after {
          content: '✦ ✦ ✦';
          color: rgba(212,175,55,0.3);
          font-size: 12px;
          letter-spacing: 1em;
        }
        .forge-editor-content mark { background: rgba(212,175,55,0.3); color: white; padding: 0 2px; border-radius: 2px; }
        .forge-editor-content strong { color: white; }
        .forge-editor-content em { color: rgba(255,255,255,0.9); }
        .forge-editor-content .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .ProseMirror { outline: none !important; }
        .ProseMirror:focus { outline: none !important; }
      `}</style>
        </div>
    );
}

// ── Toolbar Button Component ──
function ToolbarBtn({ onClick, active, icon: Icon, title }: { onClick: () => void; active: boolean; icon: any; title: string }) {
    return (
        <button onClick={onClick} title={title}
            className={`p-1.5 rounded transition-colors ${active ? 'bg-starforge-gold/20 text-starforge-gold' : 'text-text-secondary hover:text-white hover:bg-white/[0.06]'}`}>
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
}
