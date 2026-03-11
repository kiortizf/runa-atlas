import { useState, useEffect } from 'react';
import { Flame, Plus, Edit2, Trash2, Vote, Image, BookOpen, Eye, Globe, PenTool, Users, Calendar, MessageCircle, Video, CheckCircle, XCircle } from 'lucide-react';
import AdminModal, { FormSection, FormField } from './AdminModal';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, Timestamp, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ──────────────────────────────────────────
type ForgeProject = {
    id: string; type: string; title: string; description: string;
    options: { id: string; label: string; votes: number; description?: string; imageUrl?: string }[];
    totalVotes: number; deadline: any; status: string;
};

type FanFiction = { id: string; title: string; authorName: string; bookTitle: string; wordCount: number; likes: number; status: string; createdAt: any };
type WorldEntry = { id: string; title: string; category: string; bookTitle: string; content: string; approved: boolean; contributors: string[] };
type AMA = { id: string; title: string; authorName: string; scheduledAt: any; status: string; questionCount: number; description: string };
type WritingJournal = { id: string; title: string; authorName: string; publishedAt: any; likes: number; bookTitle?: string };
type OfficeHoursSlot = { id: string; authorName: string; date: any; duration: number; topic: string; spotsTotal: number; spotsTaken: number };

type SubTab = 'projects' | 'fanfiction' | 'worldbuilding' | 'amas' | 'journals' | 'officehours';

export default function AdminForge() {
    const { user } = useAuth();
    const [subTab, setSubTab] = useState<SubTab>('projects');
    const [projects, setProjects] = useState<ForgeProject[]>([]);
    const [fanfiction, setFanfiction] = useState<FanFiction[]>([]);
    const [worldEntries, setWorldEntries] = useState<WorldEntry[]>([]);
    const [amas, setAmas] = useState<AMA[]>([]);
    const [journals, setJournals] = useState<WritingJournal[]>([]);
    const [officeHours, setOfficeHours] = useState<OfficeHoursSlot[]>([]);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [form, setForm] = useState<any>({});

    // Load data
    useEffect(() => {
        const subs = [
            onSnapshot(collection(db, 'forgeProjects'), s => setProjects(s.docs.map(d => ({ id: d.id, ...d.data() } as ForgeProject))), () => { }),
            onSnapshot(query(collection(db, 'fanfiction'), orderBy('createdAt', 'desc')), s => setFanfiction(s.docs.map(d => ({ id: d.id, ...d.data() } as FanFiction))), () => { }),
            onSnapshot(collection(db, 'worldbuilding'), s => setWorldEntries(s.docs.map(d => ({ id: d.id, ...d.data() } as WorldEntry))), () => { }),
            onSnapshot(collection(db, 'amas'), s => setAmas(s.docs.map(d => ({ id: d.id, ...d.data() } as AMA))), () => { }),
            onSnapshot(collection(db, 'writingJournals'), s => setJournals(s.docs.map(d => ({ id: d.id, ...d.data() } as WritingJournal))), () => { }),
            onSnapshot(collection(db, 'officeHours'), s => setOfficeHours(s.docs.map(d => ({ id: d.id, ...d.data() } as OfficeHoursSlot))), () => { }),
        ];
        return () => subs.forEach(u => u());
    }, []);

    const getDisplayDate = (d: any) => {
        if (!d) return 'N/A';
        if (d instanceof Timestamp) return d.toDate().toLocaleDateString();
        if (d?.seconds) return new Date(d.seconds * 1000).toLocaleDateString();
        return 'N/A';
    };

    // ─── Project CRUD ─────────────────────────────────
    const openProjectModal = (item?: ForgeProject) => {
        setEditingItem(item || null);
        setForm(item ? {
            type: item.type, title: item.title, description: item.description,
            status: item.status, deadline: item.deadline instanceof Timestamp ? item.deadline.toDate().toISOString().split('T')[0] : '',
            optionsText: item.options.map(o => `${o.label}|${o.description || ''}`).join('\n'),
        } : { type: 'anthology_vote', title: '', description: '', status: 'active', deadline: '', optionsText: '' });
        setModalOpen(true);
    };

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const options = form.optionsText.split('\n').filter(Boolean).map((line: string, i: number) => {
            const [label, desc] = line.split('|');
            return { id: `opt-${i}`, label: label.trim(), description: desc?.trim() || '', votes: 0 };
        });
        const data = {
            type: form.type, title: form.title, description: form.description, status: form.status,
            deadline: form.deadline ? Timestamp.fromDate(new Date(form.deadline)) : null,
            options: editingItem ? editingItem.options : options,
            totalVotes: editingItem?.totalVotes || 0,
            createdAt: editingItem ? editingItem.createdAt : serverTimestamp(),
        };
        try {
            const id = editingItem?.id || `fp-${Date.now()}`;
            await setDoc(doc(db, 'forgeProjects', id), data, { merge: true });
            setModalOpen(false);
        } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'forgeProjects'); }
    };

    const handleDelete = async (collectionName: string, id: string) => {
        if (!confirm('Delete this item?')) return;
        try { await deleteDoc(doc(db, collectionName, id)); }
        catch (e) { handleFirestoreError(e, OperationType.DELETE, collectionName); }
    };

    // ─── AMA CRUD ─────────────────────────────────────
    const openAMAModal = (item?: AMA) => {
        setEditingItem(item || null);
        setForm(item ? {
            title: item.title, authorName: item.authorName, status: item.status,
            description: item.description,
            scheduledAt: item.scheduledAt instanceof Timestamp ? item.scheduledAt.toDate().toISOString().slice(0, 16) : '',
        } : { title: '', authorName: '', status: 'upcoming', description: '', scheduledAt: '' });
        setSubTab('amas');
        setModalOpen(true);
    };

    const handleAMASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            title: form.title, authorName: form.authorName, status: form.status,
            description: form.description, authorBio: '', authorImage: '',
            scheduledAt: form.scheduledAt ? Timestamp.fromDate(new Date(form.scheduledAt)) : null,
            questionCount: editingItem?.questionCount || 0,
        };
        try {
            const id = editingItem?.id || `ama-${Date.now()}`;
            await setDoc(doc(db, 'amas', id), data, { merge: true });
            setModalOpen(false);
        } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'amas'); }
    };

    // ─── Journal CRUD ─────────────────────────────────
    const openJournalModal = (item?: WritingJournal) => {
        setEditingItem(item || null);
        setForm(item ? {
            title: item.title, authorName: item.authorName, bookTitle: item.bookTitle || '',
        } : { title: '', authorName: '', bookTitle: '' });
        setSubTab('journals');
        setModalOpen(true);
    };

    const handleJournalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            title: form.title, authorName: form.authorName, bookTitle: form.bookTitle,
            authorImage: '', content: '', excerpt: '', tags: [],
            publishedAt: editingItem?.publishedAt || serverTimestamp(),
            likes: editingItem?.likes || 0,
        };
        try {
            const id = editingItem?.id || `j-${Date.now()}`;
            await setDoc(doc(db, 'writingJournals', id), data, { merge: true });
            setModalOpen(false);
        } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'writingJournals'); }
    };

    // ─── Office Hours CRUD ────────────────────────────
    const openOHModal = (item?: OfficeHoursSlot) => {
        setEditingItem(item || null);
        setForm(item ? {
            authorName: item.authorName, topic: item.topic, duration: item.duration, spotsTotal: item.spotsTotal,
            date: item.date instanceof Timestamp ? item.date.toDate().toISOString().slice(0, 16) : '',
        } : { authorName: '', topic: '', duration: 15, spotsTotal: 4, date: '' });
        setSubTab('officehours');
        setModalOpen(true);
    };

    const handleOHSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            authorName: form.authorName, topic: form.topic, duration: parseInt(form.duration),
            spotsTotal: parseInt(form.spotsTotal), spotsTaken: editingItem?.spotsTaken || 0,
            date: form.date ? Timestamp.fromDate(new Date(form.date)) : null,
            authorImage: '', tier: 'architect', bookedBy: editingItem?.bookedBy || [],
        };
        try {
            const id = editingItem?.id || `oh-${Date.now()}`;
            await setDoc(doc(db, 'officeHours', id), data, { merge: true });
            setModalOpen(false);
        } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'officeHours'); }
    };

    // Approve/Reject worldbuilding entry
    const handleApproveEntry = async (id: string, approved: boolean) => {
        try { await updateDoc(doc(db, 'worldbuilding', id), { approved }); }
        catch (e) { handleFirestoreError(e, OperationType.UPDATE, 'worldbuilding'); }
    };

    const subtabs = [
        { id: 'projects' as SubTab, label: 'Forge Projects', icon: Vote, count: projects.length },
        { id: 'fanfiction' as SubTab, label: 'Fan Fiction', icon: PenTool, count: fanfiction.length },
        { id: 'worldbuilding' as SubTab, label: 'Worldbuilding', icon: Globe, count: worldEntries.length },
        { id: 'amas' as SubTab, label: 'AMAs', icon: MessageCircle, count: amas.length },
        { id: 'journals' as SubTab, label: 'Journals', icon: BookOpen, count: journals.length },
        { id: 'officehours' as SubTab, label: 'Office Hours', icon: Video, count: officeHours.length },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-display text-2xl text-text-primary uppercase tracking-wider flex items-center gap-2">
                        <Flame className="w-5 h-5 text-forge-red" /> The Forge & Connect
                    </h2>
                    <p className="font-ui text-xs text-text-muted mt-1">Reader-Shaped Publishing, AMAs, Journals, Office Hours</p>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
                {subtabs.map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.id} onClick={() => setSubTab(t.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-ui text-xs whitespace-nowrap transition-all ${subTab === t.id
                                ? 'bg-starforge-gold text-void-black font-medium' : 'bg-surface border border-border text-text-muted hover:text-text-primary'}`}
                        >
                            <Icon className="w-3 h-3" /> {t.label}
                            <span className={`text-[9px] px-1 py-0.5 rounded-full ${subTab === t.id ? 'bg-void-black/20' : 'bg-surface-elevated'}`}>{t.count}</span>
                        </button>
                    );
                })}
            </div>

            {/* ═══ PROJECTS ═══ */}
            {subTab === 'projects' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => openProjectModal()} className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm rounded-sm hover:bg-white transition-colors">
                            <Plus className="w-4 h-4" /> New Forge Project
                        </button>
                    </div>
                    <div className="bg-surface border border-border rounded-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-border bg-surface-elevated/30">
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Title</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Type</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Votes</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Status</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Deadline</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Actions</th>
                            </tr></thead>
                            <tbody>
                                {projects.map(p => (
                                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-void-black/30 transition-colors">
                                        <td className="p-3 font-heading text-sm text-text-primary">{p.title}</td>
                                        <td className="p-3 font-ui text-xs text-text-muted capitalize">{p.type.replace('_', ' ')}</td>
                                        <td className="p-3 font-mono text-sm text-starforge-gold">{p.totalVotes}</td>
                                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-ui uppercase tracking-wider ${p.status === 'active' ? 'bg-aurora-teal/10 text-aurora-teal' : 'bg-surface text-text-muted'}`}>{p.status}</span></td>
                                        <td className="p-3 font-ui text-xs text-text-muted">{getDisplayDate(p.deadline)}</td>
                                        <td className="p-3 flex gap-1">
                                            <button onClick={() => openProjectModal(p)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete('forgeProjects', p.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </td>
                                    </tr>
                                ))}
                                {projects.length === 0 && <tr><td colSpan={6} className="p-8 text-center font-ui text-sm text-text-muted">No forge projects yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ FAN FICTION ═══ */}
            {subTab === 'fanfiction' && (
                <div className="bg-surface border border-border rounded-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-border bg-surface-elevated/30">
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Title</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Author</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Book</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Words</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Likes</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Actions</th>
                        </tr></thead>
                        <tbody>
                            {fanfiction.map(f => (
                                <tr key={f.id} className="border-b border-border last:border-0 hover:bg-void-black/30 transition-colors">
                                    <td className="p-3 font-heading text-sm text-text-primary">{f.title}</td>
                                    <td className="p-3 font-ui text-xs text-aurora-teal">{f.authorName}</td>
                                    <td className="p-3 font-ui text-xs text-text-muted">{f.bookTitle}</td>
                                    <td className="p-3 font-mono text-xs text-text-muted">{f.wordCount?.toLocaleString()}</td>
                                    <td className="p-3 font-mono text-xs text-queer-pink">{f.likes}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleDelete('fanfiction', f.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </td>
                                </tr>
                            ))}
                            {fanfiction.length === 0 && <tr><td colSpan={6} className="p-8 text-center font-ui text-sm text-text-muted">No fan fiction yet</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ═══ WORLDBUILDING ═══ */}
            {subTab === 'worldbuilding' && (
                <div className="bg-surface border border-border rounded-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-border bg-surface-elevated/30">
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Entry</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Category</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Book</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Contributors</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Status</th>
                            <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Actions</th>
                        </tr></thead>
                        <tbody>
                            {worldEntries.map(w => (
                                <tr key={w.id} className="border-b border-border last:border-0 hover:bg-void-black/30 transition-colors">
                                    <td className="p-3 font-heading text-sm text-text-primary">{w.title}</td>
                                    <td className="p-3 font-ui text-xs text-text-muted">{w.category}</td>
                                    <td className="p-3 font-ui text-xs text-text-muted">{w.bookTitle}</td>
                                    <td className="p-3 font-ui text-xs text-text-muted">{w.contributors?.length || 0}</td>
                                    <td className="p-3">
                                        {w.approved
                                            ? <span className="px-2 py-0.5 rounded-full text-[10px] font-ui bg-aurora-teal/10 text-aurora-teal">Approved</span>
                                            : <span className="px-2 py-0.5 rounded-full text-[10px] font-ui bg-ember-orange/10 text-ember-orange">Pending</span>
                                        }
                                    </td>
                                    <td className="p-3 flex gap-1">
                                        {!w.approved && <button onClick={() => handleApproveEntry(w.id, true)} className="p-1.5 text-text-muted hover:text-aurora-teal" title="Approve"><CheckCircle className="w-3.5 h-3.5" /></button>}
                                        {w.approved && <button onClick={() => handleApproveEntry(w.id, false)} className="p-1.5 text-text-muted hover:text-ember-orange" title="Unapprove"><XCircle className="w-3.5 h-3.5" /></button>}
                                        <button onClick={() => handleDelete('worldbuilding', w.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </td>
                                </tr>
                            ))}
                            {worldEntries.length === 0 && <tr><td colSpan={6} className="p-8 text-center font-ui text-sm text-text-muted">No world entries yet</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ═══ AMAs ═══ */}
            {subTab === 'amas' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => openAMAModal()} className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm rounded-sm hover:bg-white transition-colors">
                            <Plus className="w-4 h-4" /> New AMA
                        </button>
                    </div>
                    <div className="bg-surface border border-border rounded-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-border bg-surface-elevated/30">
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Title</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Author</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Date</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Questions</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Status</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Actions</th>
                            </tr></thead>
                            <tbody>
                                {amas.map(a => (
                                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-void-black/30 transition-colors">
                                        <td className="p-3 font-heading text-sm text-text-primary">{a.title}</td>
                                        <td className="p-3 font-ui text-xs text-text-muted">{a.authorName}</td>
                                        <td className="p-3 font-ui text-xs text-text-muted">{getDisplayDate(a.scheduledAt)}</td>
                                        <td className="p-3 font-mono text-xs text-starforge-gold">{a.questionCount}</td>
                                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-ui uppercase ${a.status === 'upcoming' ? 'bg-aurora-teal/10 text-aurora-teal' : a.status === 'live' ? 'bg-forge-red/10 text-forge-red' : 'bg-surface text-text-muted'}`}>{a.status}</span></td>
                                        <td className="p-3 flex gap-1">
                                            <button onClick={() => openAMAModal(a)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete('amas', a.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </td>
                                    </tr>
                                ))}
                                {amas.length === 0 && <tr><td colSpan={6} className="p-8 text-center font-ui text-sm text-text-muted">No AMAs yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ JOURNALS ═══ */}
            {subTab === 'journals' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => openJournalModal()} className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm rounded-sm hover:bg-white transition-colors">
                            <Plus className="w-4 h-4" /> New Journal Entry
                        </button>
                    </div>
                    <div className="bg-surface border border-border rounded-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-border bg-surface-elevated/30">
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Title</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Author</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Book</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Likes</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Actions</th>
                            </tr></thead>
                            <tbody>
                                {journals.map(j => (
                                    <tr key={j.id} className="border-b border-border last:border-0 hover:bg-void-black/30 transition-colors">
                                        <td className="p-3 font-heading text-sm text-text-primary">{j.title}</td>
                                        <td className="p-3 font-ui text-xs text-text-muted">{j.authorName}</td>
                                        <td className="p-3 font-ui text-xs text-text-muted">{j.bookTitle || 'N/A'}</td>
                                        <td className="p-3 font-mono text-xs text-queer-pink">{j.likes}</td>
                                        <td className="p-3 flex gap-1">
                                            <button onClick={() => openJournalModal(j)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete('writingJournals', j.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </td>
                                    </tr>
                                ))}
                                {journals.length === 0 && <tr><td colSpan={5} className="p-8 text-center font-ui text-sm text-text-muted">No journals yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ OFFICE HOURS ═══ */}
            {subTab === 'officehours' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => openOHModal()} className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm rounded-sm hover:bg-white transition-colors">
                            <Plus className="w-4 h-4" /> New Slot
                        </button>
                    </div>
                    <div className="bg-surface border border-border rounded-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-border bg-surface-elevated/30">
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Author</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Topic</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Date</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Duration</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Spots</th>
                                <th className="p-3 font-ui text-[10px] uppercase tracking-wider text-text-muted">Actions</th>
                            </tr></thead>
                            <tbody>
                                {officeHours.map(oh => (
                                    <tr key={oh.id} className="border-b border-border last:border-0 hover:bg-void-black/30 transition-colors">
                                        <td className="p-3 font-heading text-sm text-text-primary">{oh.authorName}</td>
                                        <td className="p-3 font-ui text-xs text-text-muted">{oh.topic}</td>
                                        <td className="p-3 font-ui text-xs text-text-muted">{getDisplayDate(oh.date)}</td>
                                        <td className="p-3 font-ui text-xs text-text-muted">{oh.duration} min</td>
                                        <td className="p-3 font-ui text-xs text-text-muted">{oh.spotsTaken}/{oh.spotsTotal}</td>
                                        <td className="p-3 flex gap-1">
                                            <button onClick={() => openOHModal(oh)} className="p-1.5 text-text-muted hover:text-starforge-gold"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete('officeHours', oh.id)} className="p-1.5 text-text-muted hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </td>
                                    </tr>
                                ))}
                                {officeHours.length === 0 && <tr><td colSpan={6} className="p-8 text-center font-ui text-sm text-text-muted">No office hours yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ MODAL ═══ */}
            <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit' : 'New'}>
                {(subTab === 'projects' || (!['amas', 'journals', 'officehours'].includes(subTab) && modalOpen)) && (
                    <form onSubmit={handleProjectSubmit} className="space-y-4">
                        <FormSection title="Forge Project Details">
                            <FormField label="Type">
                                <select value={form.type || ''} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none">
                                    <option value="anthology_vote">Anthology Vote</option>
                                    <option value="cover_reveal">Cover Reveal</option>
                                    <option value="story_poll">Story Poll</option>
                                </select>
                            </FormField>
                            <FormField label="Title">
                                <input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" />
                            </FormField>
                            <FormField label="Description">
                                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none resize-none" />
                            </FormField>
                            <FormField label="Options (one per line: Label|Description)">
                                <textarea value={form.optionsText || ''} onChange={e => setForm({ ...form, optionsText: e.target.value })} rows={4} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-mono text-xs focus:border-starforge-gold outline-none resize-none" />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Deadline">
                                    <input type="date" value={form.deadline || ''} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" />
                                </FormField>
                                <FormField label="Status">
                                    <select value={form.status || ''} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none">
                                        <option value="active">Active</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </FormField>
                            </div>
                        </FormSection>
                        <button type="submit" className="w-full py-2.5 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
                            {editingItem ? 'Update' : 'Create'} Project
                        </button>
                    </form>
                )}
                {subTab === 'amas' && modalOpen && (
                    <form onSubmit={handleAMASubmit} className="space-y-4">
                        <FormSection title="AMA Details">
                            <FormField label="Title"><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                            <FormField label="Author"><input value={form.authorName || ''} onChange={e => setForm({ ...form, authorName: e.target.value })} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                            <FormField label="Description"><textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none resize-none" /></FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Scheduled At"><input type="datetime-local" value={form.scheduledAt || ''} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                                <FormField label="Status"><select value={form.status || ''} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none"><option value="upcoming">Upcoming</option><option value="live">Live</option><option value="archived">Archived</option></select></FormField>
                            </div>
                        </FormSection>
                        <button type="submit" className="w-full py-2.5 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors">{editingItem ? 'Update' : 'Create'} AMA</button>
                    </form>
                )}
                {subTab === 'journals' && modalOpen && (
                    <form onSubmit={handleJournalSubmit} className="space-y-4">
                        <FormSection title="Journal Entry">
                            <FormField label="Title"><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                            <FormField label="Author"><input value={form.authorName || ''} onChange={e => setForm({ ...form, authorName: e.target.value })} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                            <FormField label="Related Book"><input value={form.bookTitle || ''} onChange={e => setForm({ ...form, bookTitle: e.target.value })} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                        </FormSection>
                        <button type="submit" className="w-full py-2.5 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors">{editingItem ? 'Update' : 'Create'} Journal</button>
                    </form>
                )}
                {subTab === 'officehours' && modalOpen && (
                    <form onSubmit={handleOHSubmit} className="space-y-4">
                        <FormSection title="Office Hours Slot">
                            <FormField label="Author"><input value={form.authorName || ''} onChange={e => setForm({ ...form, authorName: e.target.value })} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                            <FormField label="Topic"><input value={form.topic || ''} onChange={e => setForm({ ...form, topic: e.target.value })} required className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField label="Date/Time"><input type="datetime-local" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                                <FormField label="Duration (min)"><input type="number" value={form.duration || ''} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                                <FormField label="Total Spots"><input type="number" value={form.spotsTotal || ''} onChange={e => setForm({ ...form, spotsTotal: e.target.value })} className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary focus:border-starforge-gold outline-none" /></FormField>
                            </div>
                        </FormSection>
                        <button type="submit" className="w-full py-2.5 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors">{editingItem ? 'Update' : 'Create'} Slot</button>
                    </form>
                )}
            </AdminModal>
        </div>
    );
}
