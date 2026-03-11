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
import { Mark, mergeAttributes } from '@tiptap/core';
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
    PenLine, UserCheck, Reply, Search, Replace, Columns,
    Download, Globe, MapPin, Sword, Shield, BookMarked,
    Keyboard, BookOpenCheck, BarChart3, Type, Maximize2, Activity,
    Tag, PackageCheck, CircleDot, Palette,
    SearchX, Camera, LayoutGrid, ListTree, Sun, Moon, Coffee,
    Flame, Calendar, GitCompare, Clock3, Milestone,
    type LucideIcon
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { useManuscript, type Chapter } from '../hooks/useManuscript';
import { useVersionHistory, type DiffSegment } from '../hooks/useVersionHistory';
import { useWritingSessions } from '../hooks/useWritingSessions';
import { useCollaboration, useComments, useSuggestions } from '../hooks/useCollaboration';
import { useWorldBible, type WorldBibleEntry } from '../hooks/useWorldBible';
import { useAuth } from '../contexts/AuthContext';

// ── Annotation Tag Definitions ──
const ANNOTATION_TAGS = [
    { id: 'needs-research', label: 'Needs Research', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { id: 'pacing-issue', label: 'Pacing Issue', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    { id: 'revisit', label: 'Revisit', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    { id: 'strengthen', label: 'Strengthen', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    { id: 'cut-maybe', label: 'Cut Maybe', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
    { id: 'great-passage', label: 'Great Passage', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { id: 'continuity', label: 'Continuity', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
    { id: 'dialogue-fix', label: 'Dialogue Fix', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
] as const;

// ── Custom TipTap Annotation Mark ──
const AnnotationMark = Mark.create({
    name: 'annotation',
    addAttributes() {
        return {
            annotationType: { default: null, parseHTML: el => el.getAttribute('data-annotation-type'), renderHTML: attrs => ({ 'data-annotation-type': attrs.annotationType }) },
            annotationColor: { default: null, parseHTML: el => el.getAttribute('data-annotation-color'), renderHTML: attrs => ({ 'data-annotation-color': attrs.annotationColor }) },
            annotationBg: { default: null, parseHTML: el => el.getAttribute('data-annotation-bg'), renderHTML: attrs => ({ 'data-annotation-bg': attrs.annotationBg }) },
        };
    },
    parseHTML() { return [{ tag: 'span[data-annotation-type]' }]; },
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, {
            style: `background: ${HTMLAttributes['data-annotation-bg'] || 'rgba(245,158,11,0.15)'}; border-bottom: 2px solid ${HTMLAttributes['data-annotation-color'] || '#f59e0b'}; padding: 1px 0; cursor: pointer;`,
            class: 'forge-annotation',
        }), 0];
    },
});

// ── Types for new features ──
interface Snapshot { id: string; name: string; content: string; plainText: string; timestamp: number; chapterId: string; }
interface TimelineEvent { id: string; title: string; description: string; chapterId?: string; order: number; color: string; }
interface DailyGoal { date: string; wordsWritten: number; target: number; }

const EDITOR_THEMES = [
    { id: 'dark', label: 'Deep Space', icon: Moon, bg: 'transparent', text: 'rgba(255,255,255,0.78)', editorBg: 'transparent', accent: '#d4af37' },
    { id: 'light', label: 'Parchment', icon: Sun, bg: '#f5f0e8', text: '#2a2520', editorBg: '#faf7f2', accent: '#8b6914' },
    { id: 'sepia', label: 'Sepia', icon: Coffee, bg: '#3a2f25', text: '#d4c5a9', editorBg: '#2e241c', accent: '#c9a84c' },
] as const;

const TIMELINE_COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899', '#06b6d4', '#f97316'];

// ════════════════════════════════════════════════════════
// FORGE EDITOR PAGE
// ════════════════════════════════════════════════════════
export default function ForgeEditor() {
    const { manuscriptId } = useParams<{ manuscriptId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        manuscripts, chapters, loading, saving, totalWords,
        createManuscript, updateManuscript, deleteManuscript, addChapter,
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
    const [inspectorTab, setInspectorTab] = useState<'notes' | 'meta' | 'comments' | 'bible'>('notes');
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

    // World Bible
    const { entries: bibleEntries, addEntry: addBibleEntry, updateEntry: updateBibleEntry, deleteEntry: deleteBibleEntry } = useWorldBible(manuscriptId);
    const [bibleFilter, setBibleFilter] = useState<WorldBibleEntry['type'] | 'all'>('all');
    const [editingBible, setEditingBible] = useState<string | null>(null);
    const [newBibleName, setNewBibleName] = useState('');
    const [newBibleType, setNewBibleType] = useState<WorldBibleEntry['type']>('character');

    // Find & Replace
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [findQuery, setFindQuery] = useState('');
    const [replaceQuery, setReplaceQuery] = useState('');
    const [findUseRegex, setFindUseRegex] = useState(false);
    const [findCaseSensitive, setFindCaseSensitive] = useState(false);
    const [findResults, setFindResults] = useState<{ count: number; current: number }>({ count: 0, current: 0 });

    // Auto-save indicator
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');

    // Split editor
    const [splitChapterId, setSplitChapterId] = useState<string | null>(null);
    const splitChapter = chapters.find(c => c.id === splitChapterId);

    // Export
    const [showExportModal, setShowExportModal] = useState(false);

    // Typewriter scroll
    const [typewriterMode, setTypewriterMode] = useState(false);

    // Reading mode
    const [readingMode, setReadingMode] = useState(false);

    // Keyboard shortcuts panel
    const [showShortcuts, setShowShortcuts] = useState(false);

    // Manuscript statistics
    const [showStats, setShowStats] = useState(false);

    // Inline annotations
    const [showAnnotationPicker, setShowAnnotationPicker] = useState(false);
    const [annotationFilter, setAnnotationFilter] = useState<string | null>(null);

    // Compile / manuscript assembly
    const [showCompileModal, setShowCompileModal] = useState(false);
    const [compileSelection, setCompileSelection] = useState<{ id: string; included: boolean }[]>([]);

    // Cross-chapter search
    const [showCrossSearch, setShowCrossSearch] = useState(false);
    const [crossSearchQuery, setCrossSearchQuery] = useState('');
    const [crossSearchResults, setCrossSearchResults] = useState<{ chapterId: string; title: string; matches: { text: string; index: number }[] }[]>([]);

    // Snapshot branching
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [showSnapshots, setShowSnapshots] = useState(false);
    const [snapshotName, setSnapshotName] = useState('');
    const [comparingSnapshot, setComparingSnapshot] = useState<Snapshot | null>(null);

    // Corkboard & Outline views
    const [viewMode, setViewMode] = useState<'editor' | 'corkboard' | 'outline'>('editor');

    // Custom editor theme
    const [editorTheme, setEditorTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
    const [showThemePicker, setShowThemePicker] = useState(false);

    // Daily writing goals & streaks
    const [showGoals, setShowGoals] = useState(false);
    const [dailyTarget, setDailyTarget] = useState(500);
    const [dailyLog, setDailyLog] = useState<DailyGoal[]>([]);
    const [todayWords, setTodayWords] = useState(0);

    // Timeline view
    const [showTimeline, setShowTimeline] = useState(false);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [compileFormat, setCompileFormat] = useState<'docx' | 'md' | 'txt'>('docx');

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

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
            AnnotationMark,
        ],
        editorProps: {
            attributes: {
                class: 'forge-editor-content',
            },
        },
        onUpdate: ({ editor }) => {
            setSaveStatus('unsaved');
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
        if (html === lastSavedContent.current) { setSaveStatus('saved'); return; }

        setSaveStatus('saving');
        await saveChapter(activeChapterId, html, text);
        lastSavedContent.current = html;
        setSaveStatus('saved');
        setLastSavedAt(new Date());

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

    // Ctrl+S and Ctrl+F keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (editor) {
                    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                    autoSaveRef.current?.(editor);
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                setShowFindReplace(prev => !prev);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                setShowFindReplace(true);
            }
            // Keyboard shortcuts panel: Ctrl+/ or ?
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setShowShortcuts(prev => !prev);
            }
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target as HTMLElement)?.closest?.('.ProseMirror')) {
                e.preventDefault();
                setShowShortcuts(prev => !prev);
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

    // ── DnD Chapter Reorder ──
    const binderChapters = useMemo(() => chapters.filter(ch => ch.type === 'chapter' || ch.type === 'scene'), [chapters]);
    const binderNotes = useMemo(() => chapters.filter(ch => ch.type === 'notes' || ch.type === 'research'), [chapters]);
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = chapters.findIndex(c => c.id === active.id);
        const newIndex = chapters.findIndex(c => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            reorderChapters(oldIndex, newIndex);
        }
    }, [chapters, reorderChapters]);

    // ── Find & Replace ──
    const handleFind = useCallback(() => {
        if (!editor || !findQuery) { setFindResults({ count: 0, current: 0 }); return; }
        const text = editor.getText();
        let flags = 'g';
        if (!findCaseSensitive) flags += 'i';
        let regex: RegExp;
        try {
            regex = findUseRegex ? new RegExp(findQuery, flags) : new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        } catch { setFindResults({ count: 0, current: 0 }); return; }
        const matches = [...text.matchAll(regex)];
        setFindResults({ count: matches.length, current: matches.length > 0 ? 1 : 0 });
    }, [editor, findQuery, findUseRegex, findCaseSensitive]);

    useEffect(() => { handleFind(); }, [findQuery, findCaseSensitive, findUseRegex, handleFind]);

    const handleReplace = useCallback(() => {
        if (!editor || !findQuery) return;
        const { state } = editor;
        const text = editor.getText();
        let flags = findCaseSensitive ? '' : 'i';
        let regex: RegExp;
        try {
            regex = findUseRegex ? new RegExp(findQuery, flags) : new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        } catch { return; }
        const match = text.match(regex);
        if (match && match.index !== undefined) {
            // Find the position in ProseMirror's document
            const from = match.index + 1; // ProseMirror is 1-indexed for text offset
            editor.chain().focus().setTextSelection({ from, to: from + match[0].length }).deleteSelection().insertContent(replaceQuery).run();
            handleFind();
        }
    }, [editor, findQuery, replaceQuery, findCaseSensitive, findUseRegex, handleFind]);

    const handleReplaceAll = useCallback(() => {
        if (!editor || !findQuery) return;
        const html = editor.getHTML();
        let flags = 'g';
        if (!findCaseSensitive) flags += 'i';
        let regex: RegExp;
        try {
            regex = findUseRegex ? new RegExp(findQuery, flags) : new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        } catch { return; }
        const newHtml = html.replace(regex, replaceQuery);
        editor.commands.setContent(newHtml);
        setFindResults({ count: 0, current: 0 });
        setSaveStatus('unsaved');
    }, [editor, findQuery, replaceQuery, findCaseSensitive, findUseRegex]);

    // ── Auto-save indicator ──
    const saveStatusText = useMemo(() => {
        if (saveStatus === 'saving') return 'Saving...';
        if (saveStatus === 'unsaved') return 'Unsaved changes';
        if (!lastSavedAt) return 'Saved';
        const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
        if (seconds < 5) return 'Just saved';
        if (seconds < 60) return `Saved ${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        return `Saved ${minutes}m ago`;
    }, [saveStatus, lastSavedAt]);

    // Refresh the save indicator every 10 seconds
    const [, forceRender] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => forceRender(v => v + 1), 10000);
        return () => clearInterval(interval);
    }, []);

    // ── Typewriter Scroll ──
    useEffect(() => {
        if (!typewriterMode || !editor) return;
        const scrollCursorToCenter = () => {
            const editorEl = editor.view.dom.closest('.overflow-y-auto');
            if (!editorEl) return;
            const { node: cursorNode } = editor.view.domAtPos(editor.state.selection.from);
            const el = cursorNode instanceof HTMLElement ? cursorNode : cursorNode.parentElement;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const containerRect = editorEl.getBoundingClientRect();
            const scrollOffset = rect.top - containerRect.top - containerRect.height / 2 + editorEl.scrollTop;
            editorEl.scrollTo({ top: scrollOffset, behavior: 'smooth' });
        };
        editor.on('selectionUpdate', scrollCursorToCenter);
        return () => { editor.off('selectionUpdate', scrollCursorToCenter); };
    }, [typewriterMode, editor]);

    // ── Reading mode toggle ──
    useEffect(() => {
        if (!editor) return;
        editor.setEditable(!readingMode);
    }, [readingMode, editor]);

    // ── Manuscript Statistics ──
    const manuscriptStats = useMemo(() => {
        const chaps = chapters.filter(c => c.type === 'chapter' || c.type === 'scene');
        if (chaps.length === 0) return null;
        const wordCounts = chaps.map(c => c.wordCount || 0);
        const total = wordCounts.reduce((a, b) => a + b, 0);
        const avg = Math.round(total / chaps.length);
        const longest = chaps.reduce((a, b) => ((a.wordCount || 0) > (b.wordCount || 0) ? a : b));
        const shortest = chaps.reduce((a, b) => ((a.wordCount || 0) < (b.wordCount || 0) ? a : b));
        // Estimate completion: if manuscript has a target
        const targetWords = activeManuscript?.targetWords || 0;
        const remaining = targetWords > total ? targetWords - total : 0;
        // Average words per day from writing sessions (rough estimate: 500 words/day)
        const wordsPerDay = 500; // fallback
        const daysRemaining = remaining > 0 ? Math.ceil(remaining / wordsPerDay) : 0;
        const estimatedDate = daysRemaining > 0 ? new Date(Date.now() + daysRemaining * 86400000) : null;

        return { total, avg, longest, shortest, chapterCount: chaps.length, wordCounts, estimatedDate, remaining, targetWords };
    }, [chapters, activeManuscript]);

    // ── Sparkline data for binder ──
    const chapterMaxWords = useMemo(() => {
        const words = binderChapters.map(c => c.wordCount || 0);
        return Math.max(...words, 1);
    }, [binderChapters]);

    // ── Export Functions ──
    const handleExportDocx = useCallback(async () => {
        if (!activeManuscript) return;
        const paragraphs: Paragraph[] = [];
        paragraphs.push(new Paragraph({
            children: [new TextRun({ text: activeManuscript.title, bold: true, size: 48 })],
            heading: HeadingLevel.TITLE,
            spacing: { after: 400 },
        }));
        for (const ch of chapters.filter(c => c.type === 'chapter' || c.type === 'scene')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: ch.title, bold: true, size: 32 })],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            }));
            const lines = (ch.plainText || '').split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: line, size: 24, font: 'Georgia' })],
                        spacing: { after: 120 },
                    }));
                }
            }
        }
        const doc = new Document({
            sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: paragraphs }],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${activeManuscript.title}.docx`);
        setShowExportModal(false);
    }, [activeManuscript, chapters]);

    const handleExportMarkdown = useCallback(() => {
        if (!activeManuscript) return;
        let md = `# ${activeManuscript.title}\n\n`;
        for (const ch of chapters.filter(c => c.type === 'chapter' || c.type === 'scene')) {
            md += `## ${ch.title}\n\n${ch.plainText || ''}\n\n---\n\n`;
        }
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, `${activeManuscript.title}.md`);
        setShowExportModal(false);
    }, [activeManuscript, chapters]);

    const handleExportTxt = useCallback(() => {
        if (!activeManuscript) return;
        let txt = `${activeManuscript.title}\n${'='.repeat(activeManuscript.title.length)}\n\n`;
        for (const ch of chapters.filter(c => c.type === 'chapter' || c.type === 'scene')) {
            txt += `${ch.title}\n${'-'.repeat(ch.title.length)}\n\n${ch.plainText || ''}\n\n`;
        }
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${activeManuscript.title}.txt`);
        setShowExportModal(false);
    }, [activeManuscript, chapters]);

    // ── Compile Functions (chapter-selective export) ──
    const initCompile = useCallback(() => {
        const chaps = chapters.filter(c => c.type === 'chapter' || c.type === 'scene');
        setCompileSelection(chaps.map(c => ({ id: c.id, included: true })));
        setShowCompileModal(true);
    }, [chapters]);

    const compileChapters = useMemo(() => {
        return compileSelection
            .filter(s => s.included)
            .map(s => chapters.find(c => c.id === s.id))
            .filter(Boolean) as Chapter[];
    }, [compileSelection, chapters]);

    const handleCompileExport = useCallback(async () => {
        if (!activeManuscript || compileChapters.length === 0) return;
        try {
            if (compileFormat === 'docx') {
                const paragraphs: Paragraph[] = [];
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ text: activeManuscript.title, bold: true, size: 48 })],
                    heading: HeadingLevel.TITLE, spacing: { after: 400 },
                }));
                for (const ch of compileChapters) {
                    paragraphs.push(new Paragraph({
                        children: [new TextRun({ text: ch.title, bold: true, size: 32 })],
                        heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
                    }));
                    for (const line of (ch.plainText || '').split('\n')) {
                        if (line.trim()) paragraphs.push(new Paragraph({ children: [new TextRun({ text: line, size: 24, font: 'Georgia' })], spacing: { after: 120 } }));
                    }
                }
                const compiledDoc = new Document({ sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: paragraphs }] });
                const blob = await Packer.toBlob(compiledDoc);
                saveAs(blob, `${activeManuscript.title} - Compiled.docx`);
            } else if (compileFormat === 'md') {
                let md = `# ${activeManuscript.title}\n\n`;
                for (const ch of compileChapters) md += `## ${ch.title}\n\n${ch.plainText || ''}\n\n---\n\n`;
                saveAs(new Blob([md], { type: 'text/markdown;charset=utf-8' }), `${activeManuscript.title} - Compiled.md`);
            } else {
                let txt = `${activeManuscript.title}\n${'='.repeat(activeManuscript.title.length)}\n\n`;
                for (const ch of compileChapters) txt += `${ch.title}\n${'-'.repeat(ch.title.length)}\n\n${ch.plainText || ''}\n\n`;
                saveAs(new Blob([txt], { type: 'text/plain;charset=utf-8' }), `${activeManuscript.title} - Compiled.txt`);
            }
        } catch (err) {
            console.error('Compile export error:', err);
        }
        setShowCompileModal(false);
    }, [activeManuscript, compileChapters, compileFormat]);

    // ── Annotation apply/remove ──
    const applyAnnotation = useCallback((tagId: string) => {
        if (!editor) return;
        const tag = ANNOTATION_TAGS.find(t => t.id === tagId);
        if (!tag) return;
        const { from, to } = editor.state.selection;
        if (from === to) return;
        editor.chain().focus()
            .setMark('annotation', { annotationType: tag.id, annotationColor: tag.color, annotationBg: tag.bg })
            .run();
        setShowAnnotationPicker(false);
        setSaveStatus('unsaved');
    }, [editor]);

    const removeAnnotation = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().unsetMark('annotation').run();
        setSaveStatus('unsaved');
    }, [editor]);

    // ── Cross-Chapter Search ──
    const handleCrossSearch = useCallback((query: string) => {
        setCrossSearchQuery(query);
        if (!query.trim()) { setCrossSearchResults([]); return; }
        const results: typeof crossSearchResults = [];
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'gi');
        for (const ch of chapters) {
            const text = ch.plainText || '';
            const matches: { text: string; index: number }[] = [];
            let m: RegExpExecArray | null;
            while ((m = regex.exec(text)) !== null) {
                const start = Math.max(0, m.index - 30);
                const end = Math.min(text.length, m.index + query.length + 30);
                matches.push({ text: '...' + text.slice(start, end) + '...', index: m.index });
            }
            if (matches.length > 0) results.push({ chapterId: ch.id, title: ch.title, matches });
        }
        setCrossSearchResults(results);
    }, [chapters]);

    // ── Snapshot Branching ──
    const createSnapshot = useCallback((name: string) => {
        if (!activeChapter || !editor) return;
        const snap: Snapshot = {
            id: Date.now().toString(),
            name: name || `Snapshot ${new Date().toLocaleString()}`,
            content: editor.getHTML(),
            plainText: editor.getText(),
            timestamp: Date.now(),
            chapterId: activeChapter.id,
        };
        setSnapshots(prev => [snap, ...prev]);
        setSnapshotName('');
    }, [activeChapter, editor]);

    const restoreSnapshot = useCallback((snap: Snapshot) => {
        if (!editor || !confirm(`Restore "${snap.name}"? Current content will be replaced.`)) return;
        editor.commands.setContent(snap.content);
        setSaveStatus('unsaved');
        setShowSnapshots(false);
    }, [editor]);

    const deleteSnapshot = useCallback((id: string) => {
        setSnapshots(prev => prev.filter(s => s.id !== id));
    }, []);

    const chapterSnapshots = useMemo(() =>
        snapshots.filter(s => s.chapterId === activeChapterId),
    [snapshots, activeChapterId]);

    // ── Outline View Data ──
    const outlineData = useMemo(() => {
        return chapters.filter(c => c.type === 'chapter' || c.type === 'scene').map(ch => {
            const headings: { level: number; text: string }[] = [];
            const content = ch.content || '';
            // Parse TipTap HTML headings
            const hRegex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
            let hm: RegExpExecArray | null;
            while ((hm = hRegex.exec(content)) !== null) {
                headings.push({ level: parseInt(hm[1]), text: hm[2].replace(/<[^>]+>/g, '') });
            }
            return { id: ch.id, title: ch.title, wordCount: ch.wordCount || 0, headings };
        });
    }, [chapters]);

    // ── Daily Writing Goals & Streaks ──
    const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

    // Track daily words when auto-saving
    const updateDailyLog = useCallback((delta: number) => {
        if (delta <= 0) return;
        setTodayWords(prev => prev + delta);
        setDailyLog(prev => {
            const existing = prev.find(d => d.date === todayKey);
            if (existing) return prev.map(d => d.date === todayKey ? { ...d, wordsWritten: d.wordsWritten + delta } : d);
            return [...prev, { date: todayKey, wordsWritten: delta, target: dailyTarget }];
        });
    }, [todayKey, dailyTarget]);

    const currentStreak = useMemo(() => {
        let streak = 0;
        const sorted = [...dailyLog].sort((a, b) => b.date.localeCompare(a.date));
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const entry = sorted.find(e => e.date === key);
            if (entry && entry.wordsWritten >= entry.target) streak++;
            else if (i > 0) break; // Allow today to be incomplete
        }
        return streak;
    }, [dailyLog]);

    // Calendar heatmap data (last 30 days)
    const calendarData = useMemo(() => {
        const days: { date: string; words: number; pct: number }[] = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const entry = dailyLog.find(e => e.date === key);
            const words = entry?.wordsWritten || 0;
            days.push({ date: key, words, pct: dailyTarget > 0 ? Math.min(100, (words / dailyTarget) * 100) : 0 });
        }
        return days;
    }, [dailyLog, dailyTarget]);

    // ── Timeline Events ──
    const addTimelineEvent = useCallback(() => {
        if (!newEventTitle.trim()) return;
        const event: TimelineEvent = {
            id: Date.now().toString(),
            title: newEventTitle.trim(),
            description: '',
            chapterId: activeChapterId || undefined,
            order: timelineEvents.length,
            color: TIMELINE_COLORS[timelineEvents.length % TIMELINE_COLORS.length],
        };
        setTimelineEvents(prev => [...prev, event]);
        setNewEventTitle('');
    }, [newEventTitle, activeChapterId, timelineEvents.length]);

    const deleteTimelineEvent = useCallback((id: string) => {
        setTimelineEvents(prev => prev.filter(e => e.id !== id));
    }, []);

    // ── Revision Diff ──
    const computeRevisionDiff = useCallback((snapshot: Snapshot): { type: 'same' | 'add' | 'remove'; text: string }[] => {
        const current = (editor?.getText() || '').split(/\n/);
        const old = snapshot.plainText.split(/\n/);
        const result: { type: 'same' | 'add' | 'remove'; text: string }[] = [];
        const maxLen = Math.max(current.length, old.length);
        for (let i = 0; i < maxLen; i++) {
            const c = current[i] || '';
            const o = old[i] || '';
            if (c === o) result.push({ type: 'same', text: c });
            else {
                if (o) result.push({ type: 'remove', text: o });
                if (c) result.push({ type: 'add', text: c });
            }
        }
        return result;
    }, [editor]);

    // ── Editor theme style ──
    const activeTheme = EDITOR_THEMES.find(t => t.id === editorTheme) || EDITOR_THEMES[0];
    const splitEditor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Placeholder.configure({ placeholder: 'Select a chapter to compare...' }),
            CharacterCount,
            Highlight.configure({ multicolor: true }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Typography,
        ],
        editorProps: { attributes: { class: 'forge-editor-content' } },
        editable: false,
    });

    useEffect(() => {
        if (!splitEditor || !splitChapter) return;
        splitEditor.commands.setContent(splitChapter.content || '');
    }, [splitEditor, splitChapter?.content, splitChapterId]);

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
                    <span className={`text-[10px] ml-2 ${saveStatus === 'saving' ? 'text-starforge-gold/60 animate-pulse' : saveStatus === 'unsaved' ? 'text-amber-400/60' : 'text-emerald-400/50'}`}>
                        {saveStatusText}
                    </span>
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
                <button onClick={() => setShowFindReplace(f => !f)} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${showFindReplace ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white'}`} title="Find & Replace (Ctrl+F)">
                    <Search className="w-4 h-4" />
                </button>
                <button onClick={() => {
                    if (splitChapterId) { setSplitChapterId(null); } else {
                        const other = binderChapters.find(c => c.id !== activeChapterId);
                        if (other) setSplitChapterId(other.id);
                    }
                }} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${splitChapterId ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white'}`} title="Split editor">
                    <Columns className="w-4 h-4" />
                </button>
                <button onClick={() => setShowExportModal(true)} className="p-1.5 rounded hover:bg-white/[0.06] text-text-secondary hover:text-white" title="Export manuscript">
                    <Download className="w-4 h-4" />
                </button>
                <button onClick={initCompile} className="p-1.5 rounded hover:bg-white/[0.06] text-text-secondary hover:text-white" title="Compile manuscript (Scrivener-style)">
                    <PackageCheck className="w-4 h-4" />
                </button>
                <button onClick={() => setTypewriterMode(t => !t)} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${typewriterMode ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white'}`} title={`Typewriter scroll ${typewriterMode ? 'ON' : 'OFF'}`}>
                    <Type className="w-4 h-4" />
                </button>
                <button onClick={() => setReadingMode(r => !r)} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${readingMode ? 'text-aurora-teal bg-aurora-teal/10' : 'text-text-secondary hover:text-white'}`} title={readingMode ? 'Reading mode ON (click to edit)' : 'Reading mode'}>
                    <BookOpenCheck className="w-4 h-4" />
                </button>
                <button onClick={() => setShowStats(true)} className="p-1.5 rounded hover:bg-white/[0.06] text-text-secondary hover:text-white" title="Manuscript statistics">
                    <BarChart3 className="w-4 h-4" />
                </button>
                <button onClick={() => setShowShortcuts(s => !s)} className="p-1.5 rounded hover:bg-white/[0.06] text-text-secondary hover:text-white" title="Keyboard shortcuts (Ctrl+/)">
                    <Keyboard className="w-4 h-4" />
                </button>
                <button onClick={() => setShowCrossSearch(s => !s)} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${showCrossSearch ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white'}`} title="Cross-chapter search">
                    <SearchX className="w-4 h-4" />
                </button>
                <button onClick={() => setShowSnapshots(s => !s)} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${showSnapshots ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white'}`} title="Snapshots">
                    <Camera className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode(v => v === 'corkboard' ? 'editor' : 'corkboard')} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${viewMode === 'corkboard' ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white'}`} title="Corkboard view">
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode(v => v === 'outline' ? 'editor' : 'outline')} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${viewMode === 'outline' ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white'}`} title="Outline view">
                    <ListTree className="w-4 h-4" />
                </button>
                <div className="relative">
                    <button onClick={() => setShowThemePicker(s => !s)} className={`p-1.5 rounded hover:bg-white/[0.06] transition-colors ${showThemePicker ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white'}`} title="Editor theme">
                        <Palette className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                        {showThemePicker && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                className="absolute top-full right-0 mt-1 bg-deep-space border border-white/[0.1] rounded-lg shadow-2xl z-40 p-2 w-44 space-y-1">
                                {EDITOR_THEMES.map(t => (
                                    <button key={t.id} onClick={() => { setEditorTheme(t.id as any); setShowThemePicker(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors ${editorTheme === t.id ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'}`}>
                                        <t.icon className="w-3.5 h-3.5" />
                                        <span>{t.label}</span>
                                        <div className="w-3 h-3 rounded-full ml-auto border border-white/10" style={{ background: t.editorBg === 'transparent' ? '#0a0a14' : t.editorBg }} />
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button onClick={() => setShowGoals(true)} className="p-1.5 rounded hover:bg-white/[0.06] text-text-secondary hover:text-white" title="Daily goals & streaks">
                    <Flame className="w-4 h-4" />
                </button>
                <button onClick={() => setShowTimeline(true)} className="p-1.5 rounded hover:bg-white/[0.06] text-text-secondary hover:text-white" title="Timeline view">
                    <Milestone className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-white/[0.08]" />
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
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={binderChapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                        {binderChapters.map((ch) => (
                                            <SortableChapterItem
                                                key={ch.id}
                                                chapter={ch}
                                                isActive={activeChapterId === ch.id}
                                                liveWordCount={activeChapterId === ch.id ? liveWordCount : undefined}
                                                sparklinePct={chapterMaxWords > 0 ? ((ch.wordCount || 0) / chapterMaxWords) * 100 : 0}
                                                isEditing={editingTitle === ch.id}
                                                editValue={editTitleValue}
                                                onSelect={() => { handleManualSave(); setActiveChapterId(ch.id); }}
                                                onStartRename={() => { setEditingTitle(ch.id); setEditTitleValue(ch.title); }}
                                                onRename={(title) => { updateChapter(ch.id, { title } as Partial<Chapter>); setEditingTitle(null); }}
                                                onCancelRename={() => setEditingTitle(null)}
                                                onEditChange={setEditTitleValue}
                                                onSplitView={() => { setSplitChapterId(ch.id); }}
                                                onDelete={async () => {
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
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                                {/* Notes & Research */}
                                {binderNotes.length > 0 && (
                                    <div className="mt-2 border-t border-white/[0.06] pt-2">
                                        <div className="px-3 mb-1 flex items-center justify-between">
                                            <span className="text-[9px] text-text-secondary uppercase tracking-wider font-ui">Notes & Research</span>
                                            <button onClick={async () => {
                                                handleManualSave();
                                                const newId = await addChapter('', 'notes');
                                                if (newId) setActiveChapterId(newId);
                                            }} className="p-0.5 rounded hover:bg-white/[0.08] text-text-secondary hover:text-starforge-gold" title="Add note">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        {binderNotes.map(note => (
                                            <div key={note.id}
                                                className={`group flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${activeChapterId === note.id ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:bg-white/[0.04] hover:text-white'}`}
                                                onClick={() => { handleManualSave(); setActiveChapterId(note.id); }}>
                                                <StickyNote className="w-3.5 h-3.5 flex-none" />
                                                {editingTitle === note.id ? (
                                                    <input value={editTitleValue} onChange={e => setEditTitleValue(e.target.value)}
                                                        className="flex-1 bg-transparent border-b border-starforge-gold/40 text-xs text-white focus:outline-none min-w-0"
                                                        autoFocus
                                                        onClick={e => e.stopPropagation()}
                                                        onBlur={() => { updateChapter(note.id, { title: editTitleValue } as Partial<Chapter>); setEditingTitle(null); }}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') { updateChapter(note.id, { title: editTitleValue } as Partial<Chapter>); setEditingTitle(null); }
                                                            if (e.key === 'Escape') setEditingTitle(null);
                                                        }} />
                                                ) : (
                                                    <span className="text-xs truncate flex-1" onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(note.id); setEditTitleValue(note.title); }}>
                                                        {note.title}
                                                    </span>
                                                )}
                                                <span className="text-[9px] opacity-60 flex-none">{note.wordCount || 0}</span>
                                                <button onClick={(e) => { e.stopPropagation(); setEditingTitle(note.id); setEditTitleValue(note.title); }}
                                                    className="p-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-starforge-gold" title="Rename">
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (!confirm(`Delete "${note.title}"?`)) return;
                                                    if (activeChapterId === note.id) {
                                                        const remaining = chapters.filter(c => c.id !== note.id);
                                                        setActiveChapterId(remaining.length > 0 ? remaining[0].id : null);
                                                    }
                                                    await deleteChapter(note.id);
                                                }} className="p-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-red-400" title="Delete">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                            {/* Annotation picker */}
                            <div className="relative">
                                <button onClick={() => setShowAnnotationPicker(s => !s)}
                                    className={`p-1.5 rounded transition-colors ${showAnnotationPicker ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white hover:bg-white/[0.06]'}`}
                                    title="Annotate selection">
                                    <Tag className="w-3.5 h-3.5" />
                                </button>
                                <AnimatePresence>
                                    {showAnnotationPicker && (
                                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                            className="absolute top-full left-0 mt-1 w-48 bg-deep-space border border-white/[0.1] rounded-lg shadow-2xl z-40 p-2 space-y-0.5">
                                            <p className="text-[9px] text-text-secondary uppercase tracking-wider mb-1 font-ui">Annotate as...</p>
                                            {ANNOTATION_TAGS.map(tag => (
                                                <button key={tag.id} onClick={() => applyAnnotation(tag.id)}
                                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-white/80 hover:bg-white/[0.04] transition-colors">
                                                    <div className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: tag.color }} />
                                                    {tag.label}
                                                </button>
                                            ))}
                                            <div className="border-t border-white/[0.06] mt-1 pt-1">
                                                <button onClick={removeAnnotation}
                                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-red-400/70 hover:text-red-400 hover:bg-white/[0.04] transition-colors">
                                                    <X className="w-3 h-3" /> Remove annotation
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Suggestion mode indicator */}
                            {suggestionMode && (
                                <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">SUGGESTING</span>
                            )}
                            {typewriterMode && (
                                <span className="text-[9px] text-starforge-gold bg-starforge-gold/10 px-2 py-0.5 rounded">TYPEWRITER</span>
                            )}
                            {readingMode && (
                                <span className="text-[9px] text-aurora-teal bg-aurora-teal/10 px-2 py-0.5 rounded">READING</span>
                            )}
                            <div className="flex-1" />
                            <button onClick={handleManualSave} className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] text-text-secondary hover:text-starforge-gold hover:bg-white/[0.04] transition-colors" title="Save (Ctrl+S)">
                                <Save className="w-3.5 h-3.5" /> Save
                            </button>
                        </div>
                    )}

                    {/* Editor Content */}
                    <div className="flex-1 overflow-hidden relative flex">
                        {/* Find & Replace Panel */}
                        <AnimatePresence>
                            {showFindReplace && (
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="absolute top-2 right-4 z-30 w-80 bg-deep-space border border-white/[0.1] rounded-lg shadow-2xl p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Search className="w-3.5 h-3.5 text-text-secondary flex-none" />
                                        <input value={findQuery} onChange={e => setFindQuery(e.target.value)}
                                            placeholder="Find..."
                                            className="flex-1 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white focus:outline-none focus:border-starforge-gold/30"
                                            autoFocus />
                                        <span className="text-[9px] text-text-secondary flex-none">
                                            {findResults.count > 0 ? `${findResults.current}/${findResults.count}` : findQuery ? '0 found' : ''}
                                        </span>
                                        <button onClick={() => { setShowFindReplace(false); setFindQuery(''); setReplaceQuery(''); }} className="text-text-secondary hover:text-white">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Replace className="w-3.5 h-3.5 text-text-secondary flex-none" />
                                        <input value={replaceQuery} onChange={e => setReplaceQuery(e.target.value)}
                                            placeholder="Replace..."
                                            className="flex-1 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white focus:outline-none focus:border-starforge-gold/30" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setFindCaseSensitive(c => !c)}
                                            className={`px-1.5 py-0.5 text-[9px] rounded border ${findCaseSensitive ? 'border-starforge-gold/40 text-starforge-gold bg-starforge-gold/10' : 'border-white/[0.06] text-text-secondary'}`}
                                            title="Case sensitive">Aa</button>
                                        <button onClick={() => setFindUseRegex(r => !r)}
                                            className={`px-1.5 py-0.5 text-[9px] rounded border ${findUseRegex ? 'border-starforge-gold/40 text-starforge-gold bg-starforge-gold/10' : 'border-white/[0.06] text-text-secondary'}`}
                                            title="Regex">.*</button>
                                        <div className="flex-1" />
                                        <button onClick={handleReplace} className="px-2 py-0.5 text-[9px] rounded bg-white/[0.06] text-text-secondary hover:text-white">Replace</button>
                                        <button onClick={handleReplaceAll} className="px-2 py-0.5 text-[9px] rounded bg-starforge-gold/10 text-starforge-gold hover:bg-starforge-gold/20">Replace All</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Editor */}
                        {viewMode === 'corkboard' ? (
                            /* ── Corkboard View ── */
                            <div className="w-full overflow-y-auto p-6" style={{ background: activeTheme.editorBg === 'transparent' ? undefined : activeTheme.editorBg }}>
                                <h3 className="text-sm text-text-secondary uppercase tracking-wider mb-4 font-ui flex items-center gap-2">
                                    <LayoutGrid className="w-4 h-4" /> Corkboard
                                </h3>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={binderChapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {binderChapters.map(ch => (
                                                <div key={ch.id}
                                                    onClick={() => { setActiveChapterId(ch.id); setViewMode('editor'); }}
                                                    className={`p-4 rounded-lg border cursor-pointer hover:border-starforge-gold/30 transition-all group ${activeChapterId === ch.id ? 'border-starforge-gold/40 bg-starforge-gold/5' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-semibold text-white truncate">{ch.title}</h4>
                                                        <span className="text-[9px] text-text-secondary flex-none">{(ch.wordCount || 0).toLocaleString()}w</span>
                                                    </div>
                                                    <p className="text-[10px] text-text-secondary line-clamp-4 leading-relaxed">
                                                        {(ch.plainText || '').slice(0, 200) || 'Empty chapter...'}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <span className={`text-[8px] px-1.5 py-0.5 rounded ${ch.status === 'final' ? 'bg-emerald-500/10 text-emerald-400' : ch.status === 'revised' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/[0.04] text-text-secondary'}`}>{ch.status}</span>
                                                        {ch.targetWords && (
                                                            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${(ch.wordCount || 0) >= ch.targetWords ? 'bg-emerald-400/60' : 'bg-starforge-gold/40'}`}
                                                                    style={{ width: `${Math.min(100, ((ch.wordCount || 0) / ch.targetWords) * 100)}%` }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        ) : viewMode === 'outline' ? (
                            /* ── Outline View ── */
                            <div className="w-full overflow-y-auto p-6" style={{ background: activeTheme.editorBg === 'transparent' ? undefined : activeTheme.editorBg }}>
                                <h3 className="text-sm text-text-secondary uppercase tracking-wider mb-4 font-ui flex items-center gap-2">
                                    <ListTree className="w-4 h-4" /> Outline
                                </h3>
                                <div className="space-y-3 max-w-2xl mx-auto">
                                    {outlineData.map(ch => (
                                        <div key={ch.id} className={`p-3 rounded-lg border transition-colors cursor-pointer hover:border-starforge-gold/20 ${activeChapterId === ch.id ? 'border-starforge-gold/30 bg-starforge-gold/5' : 'border-white/[0.06] bg-white/[0.01]'}`}
                                            onClick={() => { setActiveChapterId(ch.id); setViewMode('editor'); }}>
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-semibold text-white">{ch.title}</h4>
                                                <span className="text-[9px] text-text-secondary">{ch.wordCount.toLocaleString()}w</span>
                                            </div>
                                            {ch.headings.length > 0 ? (
                                                <div className="ml-2 space-y-0.5">
                                                    {ch.headings.map((h, i) => (
                                                        <div key={i} className="flex items-center gap-1.5" style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                                                            <div className={`w-1.5 h-1.5 rounded-full flex-none ${h.level === 1 ? 'bg-starforge-gold/50' : h.level === 2 ? 'bg-aurora-teal/50' : 'bg-white/20'}`} />
                                                            <span className={`text-[10px] ${h.level === 1 ? 'text-white/70' : 'text-text-secondary'}`}>{h.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[9px] text-text-secondary/50 ml-2">No headings</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                        <div className={`${splitChapterId ? 'w-1/2 border-r border-white/[0.06]' : 'w-full'} overflow-y-auto ${readingMode ? 'forge-reading-mode' : ''}`}
                            style={{ background: activeTheme.editorBg === 'transparent' ? undefined : activeTheme.editorBg, color: activeTheme.text }}>
                            {activeChapter ? (
                                <div className={`mx-auto px-8 py-12 ${readingMode ? 'max-w-2xl' : 'max-w-3xl'}`}>
                                    <h2 className="text-2xl font-display mb-8 tracking-wide" style={{ color: activeTheme.text, opacity: 0.8 }}>{activeChapter.title}</h2>
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
                        </div>
                        )}

                        {/* Split Editor Panel */}
                        {splitChapterId && (
                            <div className="w-1/2 overflow-y-auto">
                                <div className="flex items-center gap-2 px-4 py-2 bg-deep-space/40 border-b border-white/[0.06]">
                                    <Columns className="w-3.5 h-3.5 text-aurora-teal" />
                                    <select value={splitChapterId} onChange={e => setSplitChapterId(e.target.value)}
                                        className="flex-1 bg-transparent text-xs text-white focus:outline-none">
                                        {binderChapters.filter(c => c.id !== activeChapterId).map(c => (
                                            <option key={c.id} value={c.id} className="bg-deep-space">{c.title}</option>
                                        ))}
                                    </select>
                                    <span className="text-[9px] text-text-secondary">{splitEditor?.storage.characterCount?.words?.() || 0}w</span>
                                    <button onClick={() => setSplitChapterId(null)} className="text-text-secondary hover:text-white">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="max-w-3xl mx-auto px-8 py-12">
                                    <h2 className="text-2xl font-display text-white/80 mb-8 tracking-wide">{splitChapter?.title}</h2>
                                    <EditorContent editor={splitEditor} />
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
                        {activeChapter?.targetWords && (
                            <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {Math.min(100, Math.round(((activeChapterId === activeChapter.id ? liveWordCount : activeChapter.wordCount) / activeChapter.targetWords) * 100))}%
                            </span>
                        )}
                        <span className={`flex items-center gap-1 ${saveStatus === 'saving' ? 'text-starforge-gold/60 animate-pulse' : saveStatus === 'unsaved' ? 'text-amber-400/60' : 'text-emerald-400/50'}`}>
                            <Save className="w-3 h-3" /> {saveStatusText}
                        </span>
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
                                {(['notes', 'meta', 'comments', 'bible'] as const).map(tab => (
                                    <button key={tab} onClick={() => setInspectorTab(tab)}
                                        className={`flex-1 py-2.5 text-[10px] uppercase tracking-wider font-ui transition-colors relative ${inspectorTab === tab ? 'text-starforge-gold border-b border-starforge-gold' : 'text-text-secondary hover:text-white'}`}>
                                        {tab === 'bible' ? '🌍' : tab}
                                        {tab === 'comments' && openComments.length > 0 && (
                                            <span className="ml-1 px-1 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[8px]">{openComments.length}</span>
                                        )}
                                        {tab === 'bible' && bibleEntries.length > 0 && (
                                            <span className="ml-0.5 text-[8px] text-text-secondary">{bibleEntries.length}</span>
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
                                            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Word Goal</span>
                                            <div className="flex items-center gap-2">
                                                <input type="number" value={activeChapter.targetWords || ''} onChange={e => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    updateChapter(activeChapter.id, { targetWords: val || undefined } as Partial<Chapter>);
                                                }}
                                                    placeholder="e.g. 3000"
                                                    className="w-24 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white focus:outline-none focus:border-starforge-gold/30" />
                                                {activeChapter.targetWords && activeChapter.targetWords > 0 && (
                                                    <div className="flex-1">
                                                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                            <div className="h-full bg-starforge-gold/60 rounded-full transition-all"
                                                                style={{ width: `${Math.min(100, ((activeChapterId === activeChapter.id ? liveWordCount : activeChapter.wordCount) / activeChapter.targetWords) * 100)}%` }} />
                                                        </div>
                                                        <span className="text-[9px] text-text-secondary">
                                                            {Math.min(100, Math.round(((activeChapterId === activeChapter.id ? liveWordCount : activeChapter.wordCount) / activeChapter.targetWords) * 100))}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
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
                                {/* ── World Bible Tab ── */}
                                {inspectorTab === 'bible' && (
                                    <div className="space-y-3">
                                        {/* Type Filter */}
                                        <div className="flex flex-wrap gap-1">
                                            {(['all', 'character', 'location', 'item', 'faction', 'lore', 'timeline'] as const).map(t => (
                                                <button key={t} onClick={() => setBibleFilter(t)}
                                                    className={`px-1.5 py-0.5 text-[9px] rounded ${bibleFilter === t ? 'bg-starforge-gold/20 text-starforge-gold' : 'bg-white/[0.04] text-text-secondary hover:text-white'}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Add Entry */}
                                        <div className="flex gap-1">
                                            <select value={newBibleType} onChange={e => setNewBibleType(e.target.value as WorldBibleEntry['type'])}
                                                className="px-1.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] text-white focus:outline-none">
                                                {(['character', 'location', 'item', 'faction', 'lore', 'timeline'] as const).map(t => (
                                                    <option key={t} value={t} className="bg-deep-space">{t}</option>
                                                ))}
                                            </select>
                                            <input value={newBibleName} onChange={e => setNewBibleName(e.target.value)}
                                                placeholder="Name..."
                                                className="flex-1 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] text-white focus:outline-none focus:border-starforge-gold/30 min-w-0"
                                                onKeyDown={async e => {
                                                    if (e.key === 'Enter' && newBibleName.trim()) {
                                                        await addBibleEntry(newBibleType, newBibleName);
                                                        setNewBibleName('');
                                                    }
                                                }} />
                                            <button onClick={async () => {
                                                if (newBibleName.trim()) {
                                                    await addBibleEntry(newBibleType, newBibleName);
                                                    setNewBibleName('');
                                                }
                                            }} className="p-1 rounded bg-starforge-gold/10 text-starforge-gold hover:bg-starforge-gold/20">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        {/* Entries List */}
                                        {bibleEntries
                                            .filter(e => bibleFilter === 'all' || e.type === bibleFilter)
                                            .map(entry => (
                                                <div key={entry.id} className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[9px] px-1 py-0.5 rounded bg-aurora-teal/10 text-aurora-teal uppercase">{entry.type}</span>
                                                        <span className="text-xs text-white font-semibold flex-1 truncate">{entry.name}</span>
                                                        <button onClick={() => setEditingBible(editingBible === entry.id ? null : entry.id)}
                                                            className="text-text-secondary hover:text-white"><Edit2 className="w-3 h-3" /></button>
                                                        <button onClick={() => { if (confirm(`Delete "${entry.name}"?`)) deleteBibleEntry(entry.id); }}
                                                            className="text-text-secondary hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                    {editingBible === entry.id && (
                                                        <div className="mt-2 space-y-2">
                                                            <textarea value={entry.description}
                                                                onChange={e => updateBibleEntry(entry.id, { description: e.target.value })}
                                                                placeholder="Description..."
                                                                className="w-full h-16 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] text-white resize-none focus:outline-none focus:border-starforge-gold/30" />
                                                            {Object.entries(entry.details || {}).map(([key, val]) => (
                                                                <div key={key} className="flex items-center gap-1.5">
                                                                    <span className="text-[9px] text-text-secondary w-16 truncate">{key}</span>
                                                                    <input value={val} onChange={e => {
                                                                        const newDetails = { ...entry.details, [key]: e.target.value };
                                                                        updateBibleEntry(entry.id, { details: newDetails });
                                                                    }}
                                                                        className="flex-1 px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] text-white focus:outline-none min-w-0" />
                                                                </div>
                                                            ))}
                                                            <div className="flex flex-wrap gap-1">
                                                                {entry.tags?.map((tag, i) => (
                                                                    <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-starforge-gold/10 text-starforge-gold">{tag}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        {bibleEntries.filter(e => bibleFilter === 'all' || e.type === bibleFilter).length === 0 && (
                                            <div className="text-center py-6">
                                                <Globe className="w-8 h-8 mx-auto mb-2 opacity-20 text-text-secondary" />
                                                <p className="text-xs text-text-secondary">No entries yet</p>
                                                <p className="text-[10px] text-text-secondary mt-1">Add characters, locations, and lore</p>
                                            </div>
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

            {/* ── Export Modal ── */}
            <AnimatePresence>
                {showExportModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowExportModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-deep-space border border-white/[0.1] rounded-xl shadow-2xl p-6 w-96"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-display text-white">Export Manuscript</h3>
                                <button onClick={() => setShowExportModal(false)} className="text-text-secondary hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <button onClick={handleExportDocx}
                                    className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:border-starforge-gold/30 hover:bg-starforge-gold/5 transition-all text-left group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-semibold">Microsoft Word (.docx)</p>
                                            <p className="text-[10px] text-text-secondary">Formatted with headings, Georgia font, and proper margins</p>
                                        </div>
                                    </div>
                                </button>
                                <button onClick={handleExportMarkdown}
                                    className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:border-starforge-gold/30 hover:bg-starforge-gold/5 transition-all text-left group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-semibold">Markdown (.md)</p>
                                            <p className="text-[10px] text-text-secondary">Plain text with headings and separators</p>
                                        </div>
                                    </div>
                                </button>
                                <button onClick={handleExportTxt}
                                    className="w-full p-4 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:border-starforge-gold/30 hover:bg-starforge-gold/5 transition-all text-left group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-semibold">Plain Text (.txt)</p>
                                            <p className="text-[10px] text-text-secondary">Simple text with chapter headings</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                            <p className="text-[10px] text-text-secondary mt-4 text-center">
                                Exporting {chapters.filter(c => c.type === 'chapter' || c.type === 'scene').length} chapters · {totalWords.toLocaleString()} words
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Compile / Manuscript Assembly Modal ── */}
            <AnimatePresence>
                {showCompileModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowCompileModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-deep-space border border-white/[0.1] rounded-xl shadow-2xl p-6 w-[520px] max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-display text-white flex items-center gap-2"><PackageCheck className="w-5 h-5 text-starforge-gold" /> Compile Manuscript</h3>
                                <button onClick={() => setShowCompileModal(false)} className="text-text-secondary hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-[10px] text-text-secondary mb-4">Choose which chapters to include and their order. Only selected chapters will be exported.</p>
                            {/* Select All / None */}
                            <div className="flex gap-2 mb-3">
                                <button onClick={() => setCompileSelection(cs => cs.map(s => ({ ...s, included: true })))}
                                    className="px-2 py-0.5 text-[10px] rounded bg-white/[0.04] text-text-secondary hover:text-white">Select All</button>
                                <button onClick={() => setCompileSelection(cs => cs.map(s => ({ ...s, included: false })))}
                                    className="px-2 py-0.5 text-[10px] rounded bg-white/[0.04] text-text-secondary hover:text-white">Select None</button>
                            </div>
                            {/* Chapter List */}
                            <div className="space-y-1 mb-5 max-h-64 overflow-y-auto">
                                {compileSelection.map((sel, idx) => {
                                    const ch = chapters.find(c => c.id === sel.id);
                                    if (!ch) return null;
                                    return (
                                        <div key={sel.id} className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${sel.included ? 'border-starforge-gold/20 bg-starforge-gold/5' : 'border-white/[0.04] bg-white/[0.01] opacity-50'}`}>
                                            <input type="checkbox" checked={sel.included}
                                                onChange={() => setCompileSelection(cs => cs.map((s, i) => i === idx ? { ...s, included: !s.included } : s))}
                                                className="accent-starforge-gold" />
                                            <span className="text-xs text-white flex-1 truncate">{ch.title}</span>
                                            <span className="text-[9px] text-text-secondary flex-none">{(ch.wordCount || 0).toLocaleString()}w</span>
                                            <button onClick={() => {
                                                if (idx === 0) return;
                                                setCompileSelection(cs => { const n = [...cs]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; });
                                            }} className="p-0.5 text-text-secondary hover:text-white disabled:opacity-20" disabled={idx === 0} title="Move up">
                                                <ChevronRight className="w-3 h-3 -rotate-90" />
                                            </button>
                                            <button onClick={() => {
                                                if (idx === compileSelection.length - 1) return;
                                                setCompileSelection(cs => { const n = [...cs]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; });
                                            }} className="p-0.5 text-text-secondary hover:text-white disabled:opacity-20" disabled={idx === compileSelection.length - 1} title="Move down">
                                                <ChevronRight className="w-3 h-3 rotate-90" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Format Picker */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] text-text-secondary uppercase tracking-wider">Format</span>
                                {(['docx', 'md', 'txt'] as const).map(f => (
                                    <button key={f} onClick={() => setCompileFormat(f)}
                                        className={`px-3 py-1.5 text-xs rounded border transition-colors ${compileFormat === f ? 'border-starforge-gold/40 bg-starforge-gold/10 text-starforge-gold' : 'border-white/[0.06] text-text-secondary hover:text-white'}`}>
                                        .{f}
                                    </button>
                                ))}
                            </div>
                            {/* Summary & Export */}
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-text-secondary">
                                    {compileChapters.length} of {compileSelection.length} chapters · {compileChapters.reduce((a, c) => a + (c.wordCount || 0), 0).toLocaleString()} words
                                </p>
                                <button onClick={handleCompileExport}
                                    disabled={compileChapters.length === 0}
                                    className="px-4 py-2 rounded-lg bg-starforge-gold/20 text-starforge-gold hover:bg-starforge-gold/30 transition-colors text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed">
                                    Compile & Export
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Keyboard Shortcuts Modal ── */}
            <AnimatePresence>
                {showShortcuts && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowShortcuts(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-deep-space border border-white/[0.1] rounded-xl shadow-2xl p-6 w-[480px] max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-display text-white flex items-center gap-2"><Keyboard className="w-5 h-5 text-starforge-gold" /> Keyboard Shortcuts</h3>
                                <button onClick={() => setShowShortcuts(false)} className="text-text-secondary hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Editing', shortcuts: [
                                        ['⌘/Ctrl + S', 'Save'],
                                        ['⌘/Ctrl + Z', 'Undo'],
                                        ['⌘/Ctrl + Shift + Z', 'Redo'],
                                        ['⌘/Ctrl + B', 'Bold'],
                                        ['⌘/Ctrl + I', 'Italic'],
                                        ['⌘/Ctrl + U', 'Underline'],
                                    ]},
                                    { label: 'Navigation', shortcuts: [
                                        ['⌘/Ctrl + F', 'Find & Replace'],
                                        ['⌘/Ctrl + H', 'Find & Replace (focused)'],
                                        ['⌘/Ctrl + /', 'Keyboard shortcuts'],
                                        ['?', 'Keyboard shortcuts'],
                                    ]},
                                    { label: 'View', shortcuts: [
                                        ['Split icon', 'Split editor view'],
                                        ['Type icon', 'Typewriter scroll'],
                                        ['Book icon', 'Reading mode'],
                                        ['Chart icon', 'Manuscript statistics'],
                                        ['Download icon', 'Export manuscript'],
                                    ]},
                                ].map(group => (
                                    <div key={group.label}>
                                        <h4 className="text-[10px] uppercase tracking-wider text-text-secondary mb-2 font-ui">{group.label}</h4>
                                        <div className="space-y-1">
                                            {group.shortcuts.map(([key, desc]) => (
                                                <div key={key} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/[0.02]">
                                                    <span className="text-xs text-white/80">{desc}</span>
                                                    <kbd className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-text-secondary font-mono">{key}</kbd>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Manuscript Statistics Modal ── */}
            <AnimatePresence>
                {showStats && manuscriptStats && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowStats(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-deep-space border border-white/[0.1] rounded-xl shadow-2xl p-6 w-[520px] max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-display text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-starforge-gold" /> Manuscript Statistics</h3>
                                <button onClick={() => setShowStats(false)} className="text-text-secondary hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-center">
                                    <p className="text-2xl font-semibold text-white">{manuscriptStats.total.toLocaleString()}</p>
                                    <p className="text-[10px] text-text-secondary uppercase tracking-wider">Total Words</p>
                                </div>
                                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-center">
                                    <p className="text-2xl font-semibold text-white">{manuscriptStats.chapterCount}</p>
                                    <p className="text-[10px] text-text-secondary uppercase tracking-wider">Chapters</p>
                                </div>
                                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-center">
                                    <p className="text-2xl font-semibold text-white">{manuscriptStats.avg.toLocaleString()}</p>
                                    <p className="text-[10px] text-text-secondary uppercase tracking-wider">Avg / Chapter</p>
                                </div>
                            </div>
                            {/* Chapter Length Chart */}
                            <div className="mb-6">
                                <h4 className="text-[10px] uppercase tracking-wider text-text-secondary mb-3 font-ui">Chapter Lengths</h4>
                                <div className="space-y-1.5">
                                    {binderChapters.map(ch => {
                                        const wc = ch.wordCount || 0;
                                        const pct = chapterMaxWords > 0 ? (wc / chapterMaxWords) * 100 : 0;
                                        return (
                                            <div key={ch.id} className="flex items-center gap-2">
                                                <span className="text-[10px] text-white/60 w-24 truncate flex-none">{ch.title}</span>
                                                <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${ch.id === activeChapterId ? 'bg-starforge-gold/50' : 'bg-aurora-teal/30'}`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-[9px] text-text-secondary w-12 text-right flex-none">{wc.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Highlights */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                    <p className="text-[10px] text-text-secondary uppercase mb-1">Longest Chapter</p>
                                    <p className="text-xs text-white font-semibold truncate">{manuscriptStats.longest.title}</p>
                                    <p className="text-[10px] text-starforge-gold">{(manuscriptStats.longest.wordCount || 0).toLocaleString()} words</p>
                                </div>
                                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                    <p className="text-[10px] text-text-secondary uppercase mb-1">Shortest Chapter</p>
                                    <p className="text-xs text-white font-semibold truncate">{manuscriptStats.shortest.title}</p>
                                    <p className="text-[10px] text-aurora-teal">{(manuscriptStats.shortest.wordCount || 0).toLocaleString()} words</p>
                                </div>
                            </div>
                            {/* Estimated reading time */}
                            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-text-secondary uppercase">Estimated Reading Time</span>
                                    <span className="text-sm text-white font-semibold">{Math.max(1, Math.ceil(manuscriptStats.total / 250))} min</span>
                                </div>
                            </div>
                            {/* Completion Estimate */}
                            {manuscriptStats.targetWords > 0 && (
                                <div className="p-3 bg-starforge-gold/5 border border-starforge-gold/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] text-starforge-gold uppercase">Completion Estimate</span>
                                        <span className="text-xs text-white">{manuscriptStats.total.toLocaleString()} / {manuscriptStats.targetWords.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-starforge-gold/50 rounded-full transition-all"
                                            style={{ width: `${Math.min(100, (manuscriptStats.total / manuscriptStats.targetWords) * 100)}%` }} />
                                    </div>
                                    {manuscriptStats.estimatedDate && (
                                        <p className="text-[10px] text-text-secondary">
                                            At ~500 words/day: <span className="text-white">{manuscriptStats.estimatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Cross-Chapter Search Modal ── */}
            <AnimatePresence>
                {showCrossSearch && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 z-50"
                        onClick={() => setShowCrossSearch(false)}>
                        <motion.div initial={{ scale: 0.95, y: -10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -10 }}
                            className="bg-deep-space border border-white/[0.1] rounded-xl shadow-2xl w-[560px] max-h-[70vh] flex flex-col"
                            onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
                                <SearchX className="w-5 h-5 text-starforge-gold flex-none" />
                                <input value={crossSearchQuery} onChange={e => handleCrossSearch(e.target.value)}
                                    placeholder="Search across all chapters..."
                                    className="flex-1 bg-transparent text-white text-sm focus:outline-none" autoFocus />
                                <span className="text-[9px] text-text-secondary">
                                    {crossSearchResults.reduce((a, r) => a + r.matches.length, 0)} matches
                                </span>
                                <button onClick={() => setShowCrossSearch(false)} className="text-text-secondary hover:text-white"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {crossSearchResults.length === 0 && crossSearchQuery && (
                                    <p className="text-center text-text-secondary text-xs py-8">No matches found</p>
                                )}
                                {crossSearchResults.map(r => (
                                    <div key={r.chapterId} className="space-y-1">
                                        <h4 className="text-[10px] text-starforge-gold uppercase tracking-wider font-ui flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> {r.title}
                                            <span className="text-text-secondary ml-auto">{r.matches.length} matches</span>
                                        </h4>
                                        {r.matches.slice(0, 5).map((m, i) => (
                                            <div key={i} onClick={() => { setActiveChapterId(r.chapterId); setShowCrossSearch(false); setViewMode('editor'); }}
                                                className="px-3 py-1.5 bg-white/[0.02] border border-white/[0.04] rounded text-[10px] text-text-secondary cursor-pointer hover:bg-white/[0.04] hover:text-white transition-colors">
                                                {m.text}
                                            </div>
                                        ))}
                                        {r.matches.length > 5 && <p className="text-[9px] text-text-secondary pl-3">+{r.matches.length - 5} more</p>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Snapshots Panel ── */}
            <AnimatePresence>
                {showSnapshots && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => { setShowSnapshots(false); setComparingSnapshot(null); }}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-deep-space border border-white/[0.1] rounded-xl shadow-2xl p-5 w-[600px] max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-display text-white flex items-center gap-2"><Camera className="w-5 h-5 text-starforge-gold" /> Snapshots</h3>
                                <button onClick={() => { setShowSnapshots(false); setComparingSnapshot(null); }} className="text-text-secondary hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            {activeChapter ? (
                                <>
                                    <div className="flex gap-2 mb-4">
                                        <input value={snapshotName} onChange={e => setSnapshotName(e.target.value)}
                                            placeholder={`Snapshot name (${activeChapter.title})`}
                                            className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white focus:outline-none focus:border-starforge-gold/30"
                                            onKeyDown={e => e.key === 'Enter' && createSnapshot(snapshotName)} />
                                        <button onClick={() => createSnapshot(snapshotName)}
                                            className="px-3 py-2 bg-starforge-gold text-void-black text-xs font-semibold uppercase rounded hover:bg-starforge-gold/90 flex items-center gap-1">
                                            <Camera className="w-3 h-3" /> Save
                                        </button>
                                    </div>
                                    {chapterSnapshots.length === 0 ? (
                                        <p className="text-center text-text-secondary text-xs py-6">No snapshots for this chapter yet</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {chapterSnapshots.map(snap => (
                                                <div key={snap.id} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-xs text-white font-semibold">{snap.name}</h4>
                                                        <span className="text-[9px] text-text-secondary">{new Date(snap.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-[10px] text-text-secondary mb-2 line-clamp-2">{snap.plainText.slice(0, 120)}...</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => restoreSnapshot(snap)} className="text-[9px] px-2 py-1 rounded bg-starforge-gold/10 text-starforge-gold hover:bg-starforge-gold/20">Restore</button>
                                                        <button onClick={() => setComparingSnapshot(comparingSnapshot?.id === snap.id ? null : snap)}
                                                            className={`text-[9px] px-2 py-1 rounded ${comparingSnapshot?.id === snap.id ? 'bg-aurora-teal/20 text-aurora-teal' : 'bg-white/[0.04] text-text-secondary hover:bg-white/[0.08]'}`}>
                                                            <GitCompare className="w-3 h-3 inline mr-1" />Compare
                                                        </button>
                                                        <button onClick={() => deleteSnapshot(snap.id)} className="text-[9px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 ml-auto">Delete</button>
                                                    </div>
                                                    {/* Revision Diff */}
                                                    {comparingSnapshot?.id === snap.id && (
                                                        <div className="mt-3 border-t border-white/[0.06] pt-3 max-h-60 overflow-y-auto font-mono text-[10px] space-y-0.5">
                                                            {computeRevisionDiff(snap).map((seg, i) => (
                                                                <div key={i} className={`px-2 py-0.5 rounded ${seg.type === 'add' ? 'bg-emerald-500/10 text-emerald-400' : seg.type === 'remove' ? 'bg-red-500/10 text-red-400 line-through' : 'text-text-secondary/50'}`}>
                                                                    {seg.type === 'add' ? '+ ' : seg.type === 'remove' ? '- ' : '  '}{seg.text || '\u00A0'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-center text-text-secondary text-xs py-6">Select a chapter to manage snapshots</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Daily Goals & Streaks Modal ── */}
            <AnimatePresence>
                {showGoals && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowGoals(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-deep-space border border-white/[0.1] rounded-xl shadow-2xl p-6 w-[480px]"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-display text-white flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" /> Daily Goals</h3>
                                <button onClick={() => setShowGoals(false)} className="text-text-secondary hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            {/* Streak */}
                            <div className="flex items-center gap-4 mb-5 p-4 bg-gradient-to-r from-orange-500/10 to-starforge-gold/5 rounded-lg border border-orange-500/10">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-400">{currentStreak}</div>
                                    <div className="text-[9px] text-text-secondary uppercase">Day Streak</div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-white">Today: {todayWords.toLocaleString()} / {dailyTarget.toLocaleString()}</span>
                                        <span className="text-[10px] text-starforge-gold">{dailyTarget > 0 ? Math.min(100, Math.round((todayWords / dailyTarget) * 100)) : 0}%</span>
                                    </div>
                                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-orange-400 to-starforge-gold rounded-full transition-all"
                                            style={{ width: `${dailyTarget > 0 ? Math.min(100, (todayWords / dailyTarget) * 100) : 0}%` }} />
                                    </div>
                                </div>
                            </div>
                            {/* Daily target setter */}
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-[10px] text-text-secondary uppercase tracking-wider">Daily Target</span>
                                <input type="number" value={dailyTarget} onChange={e => setDailyTarget(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-24 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white text-center focus:outline-none focus:border-starforge-gold/30" />
                                <span className="text-[10px] text-text-secondary">words</span>
                            </div>
                            {/* Calendar heatmap */}
                            <div>
                                <h4 className="text-[10px] text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Last 30 Days</h4>
                                <div className="grid grid-cols-10 gap-1">
                                    {calendarData.map(d => (
                                        <div key={d.date} title={`${d.date}: ${d.words} words`}
                                            className="aspect-square rounded-sm border border-white/[0.04]"
                                            style={{ background: d.pct >= 100 ? 'rgba(251,146,60,0.4)' : d.pct > 50 ? 'rgba(251,146,60,0.2)' : d.pct > 0 ? 'rgba(251,146,60,0.08)' : 'rgba(255,255,255,0.01)' }} />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-[8px] text-text-secondary justify-end">
                                    <span>Less</span>
                                    <div className="w-2 h-2 rounded-sm bg-white/[0.01] border border-white/[0.04]" />
                                    <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(251,146,60,0.08)' }} />
                                    <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(251,146,60,0.2)' }} />
                                    <div className="w-2 h-2 rounded-sm" style={{ background: 'rgba(251,146,60,0.4)' }} />
                                    <span>More</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Timeline View Modal ── */}
            <AnimatePresence>
                {showTimeline && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowTimeline(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-deep-space border border-white/[0.1] rounded-xl shadow-2xl p-6 w-[560px] max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-display text-white flex items-center gap-2"><Milestone className="w-5 h-5 text-starforge-gold" /> Story Timeline</h3>
                                <button onClick={() => setShowTimeline(false)} className="text-text-secondary hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            {/* Add event */}
                            <div className="flex gap-2 mb-4">
                                <input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)}
                                    placeholder="Add timeline event..."
                                    className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded text-xs text-white focus:outline-none focus:border-starforge-gold/30"
                                    onKeyDown={e => e.key === 'Enter' && addTimelineEvent()} />
                                <button onClick={addTimelineEvent}
                                    className="px-3 py-2 bg-starforge-gold text-void-black text-xs font-semibold uppercase rounded hover:bg-starforge-gold/90">Add</button>
                            </div>
                            {/* Timeline */}
                            {timelineEvents.length === 0 ? (
                                <p className="text-center text-text-secondary text-xs py-6">No timeline events yet. Add events to track your story's chronology.</p>
                            ) : (
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/[0.06]" />
                                    <div className="space-y-3">
                                        {timelineEvents.map((event, i) => {
                                            const linkedChapter = chapters.find(c => c.id === event.chapterId);
                                            return (
                                                <div key={event.id} className="flex gap-3 ml-1 group">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-none z-10 text-[9px] font-bold text-void-black"
                                                        style={{ background: event.color }}>{i + 1}</div>
                                                    <div className="flex-1 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs text-white font-semibold">{event.title}</h4>
                                                            <button onClick={() => deleteTimelineEvent(event.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        {linkedChapter && (
                                                            <button onClick={() => { setActiveChapterId(linkedChapter.id); setShowTimeline(false); setViewMode('editor'); }}
                                                                className="text-[9px] text-starforge-gold/60 hover:text-starforge-gold flex items-center gap-1 mt-1">
                                                                <FileText className="w-2.5 h-2.5" /> {linkedChapter.title}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
        /* Reading mode styles */
        .forge-reading-mode .forge-editor-content {
          font-size: 19px;
          line-height: 2;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.01em;
        }
        .forge-reading-mode {
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,10,20,0.3) 100%);
        }
        /* Annotation tooltips */
        .forge-annotation { position: relative; }
        .forge-annotation:hover::after {
          content: attr(data-annotation-type);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(10,10,20,0.95);
          color: attr(data-annotation-color);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 50;
          border: 1px solid rgba(255,255,255,0.1);
          text-transform: capitalize;
        }
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

// ── Sortable Chapter Item (DnD) ──
function SortableChapterItem({ chapter, isActive, liveWordCount, sparklinePct, isEditing, editValue, onSelect, onStartRename, onRename, onCancelRename, onEditChange, onSplitView, onDelete }: {
    chapter: Chapter;
    isActive: boolean;
    liveWordCount?: number;
    sparklinePct: number;
    isEditing: boolean;
    editValue: string;
    onSelect: () => void;
    onStartRename: () => void;
    onRename: (title: string) => void;
    onCancelRename: () => void;
    onEditChange: (val: string) => void;
    onSplitView: () => void;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
    };
    const displayWordCount = liveWordCount ?? (chapter.wordCount || 0);
    const goalPercent = chapter.targetWords ? Math.min(100, (displayWordCount / chapter.targetWords) * 100) : null;

    return (
        <div ref={setNodeRef} style={style}
            className={`group flex flex-col gap-0.5 px-3 py-2 cursor-pointer transition-colors ${isActive ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-text-secondary hover:bg-white/[0.04] hover:text-white'}`}
            onClick={() => { if (!isDragging && !isEditing) onSelect(); }}>
            <div className="flex items-center gap-2">
                <div {...attributes} {...listeners}
                    className="cursor-grab active:cursor-grabbing"
                    onClick={e => e.stopPropagation()}>
                    <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-40 flex-none" />
                </div>
                {chapter.type === 'chapter' ? <FileText className="w-3.5 h-3.5 flex-none" /> :
                    <Scroll className="w-3.5 h-3.5 flex-none" />}
                {isEditing ? (
                    <input value={editValue} onChange={e => onEditChange(e.target.value)}
                        className="flex-1 bg-transparent border-b border-starforge-gold/40 text-xs text-white focus:outline-none min-w-0"
                        autoFocus
                        onClick={e => e.stopPropagation()}
                        onBlur={() => {
                            const trimmed = editValue.trim();
                            if (trimmed) onRename(trimmed);
                            else onCancelRename();
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                const trimmed = editValue.trim();
                                if (trimmed) onRename(trimmed);
                                else onCancelRename();
                            }
                            if (e.key === 'Escape') onCancelRename();
                        }} />
                ) : (
                    <span className="text-xs truncate flex-1"
                        onDoubleClick={e => { e.stopPropagation(); onStartRename(); }}>
                        {chapter.title}
                    </span>
                )}
                <span className="text-[9px] opacity-60 flex-none">{displayWordCount}</span>
                <button onClick={(e) => { e.stopPropagation(); onStartRename(); }}
                    className="p-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-starforge-gold" title="Rename">
                    <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onSplitView(); }}
                    className="p-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-aurora-teal" title="Open in split view">
                    <Columns className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-red-400" title="Delete">
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
            {/* Word Goal Progress Bar */}
            {goalPercent !== null && (
                <div className="ml-7 mt-0.5">
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${goalPercent >= 100 ? 'bg-emerald-400/60' : 'bg-starforge-gold/40'}`}
                            style={{ width: `${goalPercent}%` }} />
                    </div>
                </div>
            )}
            {/* Sparkline — relative chapter length */}
            {goalPercent === null && sparklinePct > 0 && (
                <div className="ml-7 mt-0.5">
                    <div className="h-[3px] bg-white/[0.03] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isActive ? 'bg-starforge-gold/30' : 'bg-white/10'}`}
                            style={{ width: `${sparklinePct}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}
