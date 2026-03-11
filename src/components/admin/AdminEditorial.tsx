import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scissors, PenTool, FileCheck, Search as SearchIcon, CalendarDays, Users, ChevronDown, ChevronUp,
    Plus, Send, Upload, Download, CheckSquare, Square, Clock, AlertTriangle, User, Flag
} from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';

// ─── Types ──────────────────────────────────────────
const PHASES = ['dev_edit', 'line_edit', 'copy_edit', 'proofread'] as const;
type Phase = typeof PHASES[number];

interface PhaseConfig { label: string; color: string; bg: string; icon: any; }
const PHASE_MAP: Record<Phase, PhaseConfig> = {
    dev_edit: { label: 'Dev Edit', color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10', icon: PenTool },
    line_edit: { label: 'Line Edit', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Scissors },
    copy_edit: { label: 'Copy Edit', color: 'text-aurora-teal', bg: 'bg-aurora-teal/10', icon: FileCheck },
    proofread: { label: 'Proofread', color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', icon: SearchIcon },
};

interface Deliverable { id: string; label: string; done: boolean; }

interface EditorialProject {
    id: string;
    bookTitle: string;
    authorName: string;
    phase: Phase;
    assignedEditor: string;
    deadline: string; // ISO date string
    priority: boolean;
    deliverables: Deliverable[];
    fileVersions: { name: string; url: string; uploadedAt: any; uploadedBy: string }[];
    createdAt: any;
}

interface EditorNote {
    id: string; text: string; author: string; createdAt: any;
}

interface EditorStaff { name: string; role: string; active: number; capacity: number; available: boolean; }

type ViewMode = 'pipeline' | 'calendar' | 'staff';

export default function AdminEditorial() {
    const [projects, setProjects] = useState<EditorialProject[]>([]);
    const [view, setView] = useState<ViewMode>('pipeline');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [notes, setNotes] = useState<Record<string, EditorNote[]>>({});
    const [newNote, setNewNote] = useState('');
    const [phaseFilter, setPhaseFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProject, setNewProject] = useState({ bookTitle: '', authorName: '', phase: 'dev_edit' as Phase, assignedEditor: '', deadline: '' });

    const [editors, setEditors] = useState<EditorStaff[]>([]);

    // Load from Firestore
    useEffect(() => {
        const unsub1 = onSnapshot(query(collection(db, 'editorialProjects'), orderBy('createdAt', 'desc')), snap => {
            setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as EditorialProject)));
        }, () => {});
        const unsub2 = onSnapshot(collection(db, 'editors'), snap => {
            setEditors(snap.docs.map(d => d.data() as EditorStaff));
        }, () => {});
        return () => { unsub1(); unsub2(); };
    }, []);

    // Load notes for expanded project
    useEffect(() => {
        if (!expandedId) return;
        const unsub = onSnapshot(query(collection(db, `editorialProjects/${expandedId}/notes`), orderBy('createdAt', 'asc')),
            s => setNotes(prev => ({ ...prev, [expandedId]: s.docs.map(d => ({ id: d.id, ...d.data() } as EditorNote)) })),
            () => { });
        return () => unsub();
    }, [expandedId]);

    const addNote = async (projectId: string) => {
        if (!newNote.trim()) return;
        try {
            await addDoc(collection(db, `editorialProjects/${projectId}/notes`), {
                text: newNote.trim(), author: auth.currentUser?.displayName || 'Editor', createdAt: serverTimestamp(),
            });
            setNewNote('');
        } catch { /* ignore */ }
    };

    const toggleDeliverable = async (projectId: string, delId: string) => {
        const proj = projects.find(p => p.id === projectId);
        if (!proj) return;
        const updated = proj.deliverables.map(d => d.id === delId ? { ...d, done: !d.done } : d);
        try { await updateDoc(doc(db, 'editorialProjects', projectId), { deliverables: updated }); } catch { /* local */ }
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, deliverables: updated } : p));
    };

    const advancePhase = async (projectId: string) => {
        const proj = projects.find(p => p.id === projectId);
        if (!proj) return;
        const idx = PHASES.indexOf(proj.phase);
        if (idx < PHASES.length - 1) {
            const next = PHASES[idx + 1];
            try { await updateDoc(doc(db, 'editorialProjects', projectId), { phase: next }); } catch { /* local */ }
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, phase: next } : p));
        }
    };

    const addProject = async () => {
        if (!newProject.bookTitle.trim()) return;
        const proj: Omit<EditorialProject, 'id'> = {
            ...newProject, priority: false, deliverables: [], fileVersions: [], createdAt: serverTimestamp(),
        };
        try { await addDoc(collection(db, 'editorialProjects'), proj); } catch { /* local fallback */ }
        setShowAddModal(false);
        setNewProject({ bookTitle: '', authorName: '', phase: 'dev_edit', assignedEditor: '', deadline: '' });
    };

    const filtered = phaseFilter === 'all' ? projects : projects.filter(p => p.phase === phaseFilter);

    const isOverdue = (deadline: string) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const getDate = (d: any) => {
        if (!d) return '';
        if (d instanceof Timestamp) return d.toDate().toLocaleDateString();
        if (d instanceof Date) return d.toLocaleDateString();
        if (d?.seconds) return new Date(d.seconds * 1000).toLocaleDateString();
        return String(d);
    };

    // ─── Calendar Data ────────────────────────────────
    const calendarData = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const days: { day: number; projects: EditorialProject[] }[] = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, projects: projects.filter(p => p.deadline?.startsWith(dateStr)) });
        }
        return { year, month, firstDay, days, monthName: now.toLocaleString('default', { month: 'long' }) };
    }, [projects]);

    // ─── Staff Data ───────────────────────────────────
    const staffData = useMemo(() => {
        return editors.map(editor => ({
            ...editor,
            projects: projects.filter(p => p.assignedEditor === editor.name),
        }));
    }, [projects, editors]);

    // Conflict detection
    const conflicts = useMemo(() => {
        const editorDeadlines: Record<string, { title: string; deadline: string }[]> = {};
        projects.forEach(p => {
            if (p.assignedEditor && p.deadline) {
                if (!editorDeadlines[p.assignedEditor]) editorDeadlines[p.assignedEditor] = [];
                editorDeadlines[p.assignedEditor].push({ title: p.bookTitle, deadline: p.deadline });
            }
        });
        const result: string[] = [];
        Object.entries(editorDeadlines).forEach(([editor, items]) => {
            const sorted = items.sort((a, b) => a.deadline.localeCompare(b.deadline));
            for (let i = 0; i < sorted.length - 1; i++) {
                const diff = (new Date(sorted[i + 1].deadline).getTime() - new Date(sorted[i].deadline).getTime()) / 86400000;
                if (diff < 7) result.push(`${editor}: "${sorted[i].title}" and "${sorted[i + 1].title}" deadlines within ${Math.round(diff)} days`);
            }
        });
        return result;
    }, [projects]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Editorial Pipeline</h1>
                <div className="flex items-center gap-2">
                    {(['pipeline', 'calendar', 'staff'] as ViewMode[]).map(v => (
                        <button key={v} onClick={() => setView(v)}
                            className={`flex items-center gap-1.5 px-3 py-2 font-ui text-xs uppercase tracking-wider rounded-sm transition-colors ${view === v ? 'bg-starforge-gold text-void-black' : 'text-text-secondary hover:text-text-primary border border-border'
                                }`}>
                            {v === 'pipeline' && <Scissors className="w-3.5 h-3.5" />}
                            {v === 'calendar' && <CalendarDays className="w-3.5 h-3.5" />}
                            {v === 'staff' && <Users className="w-3.5 h-3.5" />}
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                    <button onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors ml-2">
                        <Plus className="w-3.5 h-3.5" /> New Project
                    </button>
                </div>
            </div>

            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
                <div className="bg-forge-red/5 border border-forge-red/20 rounded-sm p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-forge-red" />
                        <span className="font-ui text-xs text-forge-red uppercase tracking-wider">Scheduling Conflicts</span>
                    </div>
                    {conflicts.map((c, i) => <p key={i} className="font-ui text-xs text-text-secondary ml-6">{c}</p>)}
                </div>
            )}

            {/* ════════════ PIPELINE VIEW ════════════ */}
            {view === 'pipeline' && (
                <>
                    {/* Phase filter */}
                    <div className="flex gap-1">
                        <button onClick={() => setPhaseFilter('all')} className={`px-3 py-1.5 font-ui text-[10px] uppercase tracking-wider rounded-sm ${phaseFilter === 'all' ? 'bg-starforge-gold text-void-black' : 'text-text-muted hover:text-text-primary'}`}>
                            All ({projects.length})
                        </button>
                        {PHASES.map(p => {
                            const cfg = PHASE_MAP[p]; const count = projects.filter(x => x.phase === p).length;
                            return (
                                <button key={p} onClick={() => setPhaseFilter(p)}
                                    className={`px-3 py-1.5 font-ui text-[10px] uppercase tracking-wider rounded-sm ${phaseFilter === p ? `${cfg.bg} ${cfg.color}` : 'text-text-muted hover:text-text-primary'}`}>
                                    {cfg.label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Projects List */}
                    <div className="space-y-3">
                        {filtered.map(proj => {
                            const cfg = PHASE_MAP[proj.phase];
                            const Icon = cfg.icon;
                            const isExp = expandedId === proj.id;
                            const overdue = isOverdue(proj.deadline);
                            const doneCount = proj.deliverables.filter(d => d.done).length;
                            const projNotes = notes[proj.id] || [];

                            return (
                                <div key={proj.id} className="bg-surface border border-border rounded-sm overflow-hidden">
                                    <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isExp ? null : proj.id)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {proj.priority && <Flag className="w-3.5 h-3.5 text-forge-red fill-forge-red shrink-0" />}
                                                <div className="min-w-0">
                                                    <h3 className="font-heading text-base text-text-primary truncate">{proj.bookTitle}</h3>
                                                    <p className="font-ui text-[10px] text-text-muted">{proj.authorName} · {proj.assignedEditor}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                {/* Phase Progress */}
                                                <div className="hidden sm:flex items-center gap-0.5">
                                                    {PHASES.map((ph, i) => {
                                                        const active = PHASES.indexOf(proj.phase);
                                                        return (
                                                            <div key={ph} className={`w-12 h-1.5 rounded-full ${i <= active ? PHASE_MAP[ph].bg.replace('/10', '/40') : 'bg-border'}`} />
                                                        );
                                                    })}
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-semibold ${cfg.bg} ${cfg.color}`}>
                                                    <Icon className="w-2.5 h-2.5" /> {cfg.label}
                                                </span>
                                                <span className={`font-mono text-[10px] ${overdue ? 'text-forge-red' : 'text-text-muted'}`}>
                                                    {overdue && <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />}
                                                    {proj.deadline || 'No deadline'}
                                                </span>
                                                {isExp ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    <AnimatePresence>
                                        {isExp && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                <div className="border-t border-border p-4 bg-void-black/30 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {/* Left: Deliverables */}
                                                    <div>
                                                        <h4 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">
                                                            Deliverables ({doneCount}/{proj.deliverables.length})
                                                        </h4>
                                                        <div className="space-y-1.5">
                                                            {proj.deliverables.map(d => (
                                                                <button key={d.id} onClick={() => toggleDeliverable(proj.id, d.id)}
                                                                    className="w-full flex items-center gap-2 text-left group">
                                                                    {d.done ? <CheckSquare className="w-3.5 h-3.5 text-aurora-teal shrink-0" /> : <Square className="w-3.5 h-3.5 text-text-muted shrink-0 group-hover:text-aurora-teal" />}
                                                                    <span className={`font-ui text-xs ${d.done ? 'text-text-muted line-through' : 'text-text-secondary'}`}>{d.label}</span>
                                                                </button>
                                                            ))}
                                                            {proj.deliverables.length === 0 && <p className="font-ui text-xs text-text-muted">No deliverables defined</p>}
                                                        </div>
                                                        {/* File Versions */}
                                                        <h4 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-2 mt-6">File Versions</h4>
                                                        <div className="space-y-1.5">
                                                            {proj.fileVersions.map((f, i) => (
                                                                <a key={i} href={f.url} className="flex items-center gap-2 text-text-secondary hover:text-starforge-gold font-ui text-xs transition-colors">
                                                                    <Download className="w-3 h-3 shrink-0" /> {f.name}
                                                                    <span className="text-text-muted text-[9px] ml-auto">{getDate(f.uploadedAt)}</span>
                                                                </a>
                                                            ))}
                                                            {proj.fileVersions.length === 0 && <p className="font-ui text-xs text-text-muted">No files uploaded</p>}
                                                        </div>
                                                    </div>

                                                    {/* Center: Phase + Deadline */}
                                                    <div>
                                                        <h4 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Phase Progress</h4>
                                                        <div className="space-y-2 mb-6">
                                                            {PHASES.map((ph, i) => {
                                                                const active = PHASES.indexOf(proj.phase);
                                                                const pc = PHASE_MAP[ph];
                                                                return (
                                                                    <div key={ph} className={`flex items-center gap-2 px-3 py-2 rounded-sm border ${i === active ? `${pc.bg} border-current ${pc.color}` : i < active ? 'border-border bg-surface' : 'border-border/50 opacity-40'}`}>
                                                                        <pc.icon className="w-3.5 h-3.5" />
                                                                        <span className="font-ui text-xs">{pc.label}</span>
                                                                        {i < active && <CheckSquare className="w-3 h-3 text-aurora-teal ml-auto" />}
                                                                        {i === active && <Clock className="w-3 h-3 ml-auto animate-pulse" />}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <button onClick={() => advancePhase(proj.id)} disabled={proj.phase === 'proofread'}
                                                            className="w-full py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 disabled:opacity-30 transition-colors">
                                                            {proj.phase === 'proofread' ? 'Final Phase' : `Advance to ${PHASE_MAP[PHASES[PHASES.indexOf(proj.phase) + 1]]?.label}`}
                                                        </button>
                                                    </div>

                                                    {/* Right: Notes */}
                                                    <div>
                                                        <h4 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Editor Notes</h4>
                                                        <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                                                            {projNotes.length === 0 && <p className="font-ui text-xs text-text-muted">No notes yet</p>}
                                                            {projNotes.map(n => (
                                                                <div key={n.id} className="bg-surface border border-border rounded-sm p-2">
                                                                    <p className="font-ui text-xs text-text-secondary">{n.text}</p>
                                                                    <p className="font-ui text-[9px] text-text-muted mt-1">{n.author} · {getDate(n.createdAt)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote(proj.id)}
                                                                placeholder="Add note..." className="flex-1 bg-deep-space border border-border rounded-sm px-3 py-2 text-text-primary text-xs font-ui outline-none focus:border-starforge-gold" />
                                                            <button onClick={() => addNote(proj.id)} className="px-3 py-2 bg-surface border border-border rounded-sm text-text-muted hover:text-starforge-gold transition-colors">
                                                                <Send className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ════════════ CALENDAR VIEW ════════════ */}
            {view === 'calendar' && (
                <div className="bg-surface border border-border rounded-sm p-4">
                    <h2 className="font-display text-xl text-text-primary uppercase tracking-widest mb-4">{calendarData.monthName} {calendarData.year}</h2>
                    <div className="grid grid-cols-7 gap-px bg-border rounded-sm overflow-hidden">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="bg-deep-space p-2 text-center font-ui text-[9px] text-text-muted uppercase tracking-wider">{d}</div>
                        ))}
                        {Array.from({ length: calendarData.firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-void-black p-2 min-h-[80px]" />
                        ))}
                        {calendarData.days.map(({ day, projects: dayProjects }) => {
                            const isToday = day === new Date().getDate();
                            return (
                                <div key={day} className={`bg-void-black p-2 min-h-[80px] ${isToday ? 'ring-1 ring-starforge-gold/50' : ''}`}>
                                    <span className={`font-mono text-[10px] ${isToday ? 'text-starforge-gold font-bold' : 'text-text-muted'}`}>{day}</span>
                                    <div className="mt-1 space-y-0.5">
                                        {dayProjects.map(p => (
                                            <div key={p.id} className={`px-1.5 py-0.5 rounded-sm text-[8px] font-ui truncate ${PHASE_MAP[p.phase].bg} ${PHASE_MAP[p.phase].color}`}>
                                                {p.bookTitle}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ════════════ STAFF VIEW ════════════ */}
            {view === 'staff' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffData.map(editor => (
                        <div key={editor.name} className="bg-surface border border-border rounded-sm p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-cosmic-purple" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-sm text-text-primary">{editor.name}</h3>
                                        <p className="font-ui text-[10px] text-text-muted">{editor.role}</p>
                                    </div>
                                </div>
                                <span className={`font-ui text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${editor.available ? 'bg-aurora-teal/10 text-aurora-teal' : 'bg-surface-elevated text-text-muted'
                                    }`}>{editor.available ? 'Available' : 'Unavailable'}</span>
                            </div>
                            {/* Workload Bar */}
                            <div className="mb-3">
                                <div className="flex justify-between mb-1">
                                    <span className="font-ui text-[9px] text-text-muted">Workload</span>
                                    <span className="font-mono text-[10px] text-text-secondary">{editor.projects.length}/{editor.capacity}</span>
                                </div>
                                <div className="h-2 bg-void-black rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${editor.projects.length >= editor.capacity ? 'bg-forge-red' : editor.projects.length > 0 ? 'bg-aurora-teal' : 'bg-border'
                                        }`} style={{ width: `${Math.min((editor.projects.length / editor.capacity) * 100, 100)}%` }} />
                                </div>
                            </div>
                            {/* Active Projects */}
                            <div className="space-y-1">
                                {editor.projects.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 bg-void-black border border-border rounded-sm">
                                        <span className={`w-1.5 h-1.5 rounded-full ${PHASE_MAP[p.phase].color.replace('text-', 'bg-')}`} />
                                        <span className="font-ui text-xs text-text-secondary truncate flex-1">{p.bookTitle}</span>
                                        <span className="font-mono text-[9px] text-text-muted">{p.deadline}</span>
                                    </div>
                                ))}
                                {editor.projects.length === 0 && <p className="font-ui text-xs text-text-muted text-center py-2">No active projects</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ════════════ ADD PROJECT MODAL ════════════ */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-void-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-surface border border-border rounded-sm p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                            <h2 className="font-heading text-xl text-text-primary mb-4">New Editorial Project</h2>
                            <div className="space-y-3">
                                <input type="text" placeholder="Book title" value={newProject.bookTitle} onChange={e => setNewProject({ ...newProject, bookTitle: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                <input type="text" placeholder="Author name" value={newProject.authorName} onChange={e => setNewProject({ ...newProject, authorName: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                <select value={newProject.phase} onChange={e => setNewProject({ ...newProject, phase: e.target.value as Phase })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none appearance-none">
                                    {PHASES.map(p => <option key={p} value={p}>{PHASE_MAP[p].label}</option>)}
                                </select>
                                <input type="text" placeholder="Assigned editor" value={newProject.assignedEditor} onChange={e => setNewProject({ ...newProject, assignedEditor: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                <input type="date" value={newProject.deadline} onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                <button onClick={addProject} className="w-full py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors">
                                    Create Project
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
