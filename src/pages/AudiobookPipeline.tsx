import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Headphones, Mic, Clock, Calendar, CheckCircle,
    ChevronRight, Plus, Loader2, X, Check, Edit3
} from 'lucide-react';
import { useAudiobookProjects, AudioProject } from '../hooks/useDemoData';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    casting: { bg: 'bg-violet-400/10', text: 'text-violet-400' },
    recording: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    editing: { bg: 'bg-blue-400/10', text: 'text-blue-400' },
    mastering: { bg: 'bg-aurora-teal/10', text: 'text-aurora-teal' },
    complete: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
};

interface ProjectForm {
    title: string; narrator: string; status: string;
    chapters: number; chaptersComplete: number; duration: string; dueDate: string;
}
const EMPTY_FORM: ProjectForm = {
    title: '', narrator: '', status: 'casting',
    chapters: 10, chaptersComplete: 0, duration: '', dueDate: '',
};

export default function AudiobookPipeline() {
    const { data: projects, loading } = useAudiobookProjects();
    const [filterStage, setFilterStage] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>;
    }

    const stages = ['all', 'casting', 'recording', 'editing', 'mastering', 'complete'];
    const filtered = filterStage === 'all' ? projects : projects.filter(p => p.status === filterStage);

    const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
    const openEdit = (project: AudioProject) => {
        setForm({
            title: project.title, narrator: project.narrator, status: project.status,
            chapters: project.chapters, chaptersComplete: project.chaptersComplete,
            duration: project.duration, dueDate: project.dueDate,
        });
        setEditingId(project.id); setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        const payload = {
            title: form.title, narrator: form.narrator, status: form.status,
            chapters: form.chapters, chaptersComplete: form.chaptersComplete,
            duration: form.duration, dueDate: form.dueDate,
        };
        try {
            if (editingId) { await updateDoc(doc(db, 'audiobook_projects', editingId), payload); }
            else { await addDoc(collection(db, 'audiobook_projects'), payload); }
            setShowModal(false);
        } catch (e) { console.error('Audiobook project save failed:', e); }
        setSaving(false);
    };

    const totalChapters = projects.reduce((s, p) => s + p.chapters, 0);
    const completedChapters = projects.reduce((s, p) => s + p.chaptersComplete, 0);

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Audiobook <span className="text-violet-400">Pipeline</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Track narration, recording, and production progress</p>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                        <p className="text-2xl font-bold text-white">{projects.length}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Projects</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                        <p className="text-2xl font-bold text-emerald-400">{completedChapters}/{totalChapters}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Chapters Done</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                        <p className="text-2xl font-bold text-violet-400">{projects.filter(p => p.status === 'complete').length}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Completed</p>
                    </div>
                </div>

                <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
                    {stages.map(s => (
                        <button key={s} onClick={() => setFilterStage(s)}
                            className={`px-3 py-2 text-xs rounded-lg capitalize whitespace-nowrap transition-all ${filterStage === s ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30' : 'bg-white/[0.04] text-white/40 border border-transparent hover:text-white'}`}>
                            {s}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filtered.map((project, i) => {
                        const pct = project.chapters > 0 ? Math.round((project.chaptersComplete / project.chapters) * 100) : 0;
                        const colors = STATUS_COLORS[project.status] || STATUS_COLORS.casting;
                        return (
                            <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                            <Headphones className={`w-5 h-5 ${colors.text}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                                            <p className="text-xs text-white/40"><Mic className="w-3 h-3 inline mr-1" />{project.narrator}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>{project.status}</span>
                                        <button onClick={() => openEdit(project)} className="text-white/20 hover:text-white/50 transition-colors">
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mb-2 text-[10px] text-white/30">
                                    <span>{project.chaptersComplete}/{project.chapters} chapters</span>
                                    {project.duration && <span><Clock className="w-3 h-3 inline mr-1" />{project.duration}</span>}
                                    {project.dueDate && <span><Calendar className="w-3 h-3 inline mr-1" />Due {project.dueDate}</span>}
                                </div>
                                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-violet-500/60 to-violet-400 rounded-full" />
                                </div>
                                <p className="text-right text-[10px] text-white/25 mt-1">{pct}%</p>
                            </motion.div>
                        );
                    })}
                    {filtered.length === 0 && <div className="text-center py-12 text-white/20 text-sm">No audiobook projects found.</div>}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface border border-border/30 rounded-xl w-full max-w-lg p-6"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-display text-white">{editingId ? 'Edit Project' : 'New Audiobook Project'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Title</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Narrator</label>
                                        <input value={form.narrator} onChange={e => setForm({ ...form, narrator: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Stage</label>
                                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none">
                                            {['casting', 'recording', 'editing', 'mastering', 'complete'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Chapters</label>
                                        <input type="number" value={form.chapters} onChange={e => setForm({ ...form, chapters: +e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Complete</label>
                                        <input type="number" value={form.chaptersComplete} onChange={e => setForm({ ...form, chaptersComplete: +e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Duration</label>
                                        <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g., 8h 30m"
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Due Date</label>
                                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.title.trim()}
                                    className="flex items-center gap-2 px-5 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editingId ? 'Save Changes' : 'Create Project'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
