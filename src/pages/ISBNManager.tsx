import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hash, Plus, Search, Edit3, Trash2, BookOpen, Copy,
    Check, X, Filter, ChevronDown, ExternalLink, AlertCircle, Loader2
} from 'lucide-react';
import { useISBNs, ISBNEntry } from '../hooks/useDemoData';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    assigned: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    reserved: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    retired: 'bg-white/[0.04] text-white/30 border-white/[0.08]',
};

const FORMAT_LABELS: Record<string, string> = {
    ebook: 'eBook', paperback: 'Paperback', hardcover: 'Hardcover', audiobook: 'Audiobook',
};

interface ISBNFormData {
    isbn: string; title: string; format: string; imprint: string; status: string;
}

const EMPTY_FORM: ISBNFormData = { isbn: '', title: '', format: 'ebook', imprint: '', status: 'reserved' };

export default function ISBNManager() {
    const { data: isbns, loading } = useISBNs();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [copiedISBN, setCopiedISBN] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ISBNFormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>;
    }

    const filtered = isbns.filter(entry => {
        const matchesSearch = !searchQuery || entry.isbn.includes(searchQuery) || entry.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: isbns.length,
        active: isbns.filter(e => e.status === 'active').length,
        reserved: isbns.filter(e => e.status === 'reserved').length,
        retired: isbns.filter(e => e.status === 'retired').length,
    };

    const copyISBN = (isbn: string) => {
        navigator.clipboard.writeText(isbn);
        setCopiedISBN(isbn);
        setTimeout(() => setCopiedISBN(null), 2000);
    };

    const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
    const openEdit = (entry: ISBNEntry) => {
        setForm({ isbn: entry.isbn, title: entry.title, format: entry.format, imprint: entry.imprint, status: entry.status });
        setEditingId(entry.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.isbn.trim()) return;
        setSaving(true);
        try {
            if (editingId) {
                await updateDoc(doc(db, 'isbns', editingId), {
                    isbn: form.isbn, title: form.title, format: form.format,
                    imprint: form.imprint, status: form.status,
                });
            } else {
                await addDoc(collection(db, 'isbns'), {
                    isbn: form.isbn, title: form.title, format: form.format,
                    imprint: form.imprint, status: form.status,
                    assignedDate: new Date().toISOString().split('T')[0],
                });
            }
            setShowModal(false);
        } catch (e) { console.error('ISBN save failed:', e); }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try { await deleteDoc(doc(db, 'isbns', id)); } catch (e) { console.error('ISBN delete failed:', e); }
        setDeleting(null);
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">ISBN <span className="text-violet-400">Manager</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Track and manage ISBNs across titles and formats</p>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Plus className="w-4 h-4" /> Add ISBN
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total ISBNs', value: stats.total, color: 'text-white' },
                        { label: 'Active', value: stats.active, color: 'text-emerald-400' },
                        { label: 'Reserved', value: stats.reserved, color: 'text-violet-400' },
                        { label: 'Retired', value: stats.retired, color: 'text-white/40' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by ISBN or title..."
                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                    </div>
                    <div className="flex gap-1.5">
                        {['all', 'active', 'assigned', 'reserved', 'retired'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-2 text-xs rounded-lg capitalize transition-all ${filterStatus === s ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30' : 'bg-white/[0.04] text-white/40 border border-transparent hover:text-white'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/[0.06]">
                                <th className="text-left px-6 py-3 font-medium">ISBN</th>
                                <th className="text-left px-4 py-3 font-medium">Title</th>
                                <th className="text-left px-4 py-3 font-medium">Format</th>
                                <th className="text-left px-4 py-3 font-medium">Imprint</th>
                                <th className="text-left px-4 py-3 font-medium">Status</th>
                                <th className="text-right px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((entry, i) => (
                                <tr key={i} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm text-starforge-gold font-mono">{entry.isbn}</code>
                                            <button onClick={() => copyISBN(entry.isbn)} className="text-white/20 hover:text-white/50">
                                                {copiedISBN === entry.isbn ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white">{entry.title || <span className="text-white/20 italic">Unassigned</span>}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-white/50">{FORMAT_LABELS[entry.format] || entry.format}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/50">{entry.imprint || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_COLORS[entry.status] || ''}`}>{entry.status}</span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(entry)} className="text-white/20 hover:text-white/50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete(entry.id)} className="text-white/20 hover:text-forge-red transition-colors">
                                                {deleting === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12 text-white/30 text-sm">No ISBNs found.</div>}
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
                                <h3 className="text-lg font-display text-white">{editingId ? 'Edit ISBN' : 'Add New ISBN'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">ISBN</label>
                                    <input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })}
                                        placeholder="978-0-000-00000-0"
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none font-mono" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Title</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="Book title (optional)"
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Format</label>
                                        <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none">
                                            {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Status</label>
                                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-400/40 focus:outline-none">
                                            {['active', 'assigned', 'reserved', 'retired'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Imprint</label>
                                    <input value={form.imprint} onChange={e => setForm({ ...form, imprint: e.target.value })}
                                        placeholder="e.g., Rüna Atlas Press"
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-violet-400/40 focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.isbn.trim()}
                                    className="flex items-center gap-2 px-5 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editingId ? 'Save Changes' : 'Add ISBN'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
