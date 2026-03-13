import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, Search, Download, Eye, Edit3, Clock,
    CheckCircle, AlertCircle, DollarSign, Calendar, Users,
    ChevronDown, Filter, ExternalLink, Pen, Loader2, X, Check, Trash2
} from 'lucide-react';
import { useContracts, Contract } from '../hooks/useDemoData';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const STATUS_STYLES: Record<string, { bg: string; dot: string }> = {
    draft: { bg: 'bg-white/[0.04] text-white/40', dot: 'bg-white/30' },
    sent: { bg: 'bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' },
    signed: { bg: 'bg-violet-500/10 text-violet-400', dot: 'bg-violet-400' },
    active: { bg: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
    expired: { bg: 'bg-forge-red/10 text-forge-red', dot: 'bg-forge-red' },
};

const TYPE_LABELS: Record<string, string> = {
    'publishing': 'Publishing Agreement', 'licensing': 'Licensing Deal',
    'first-refusal': 'First Refusal', 'subsidiary': 'Subsidiary Rights',
};

interface ContractForm {
    authorName: string; title: string; type: string; status: string;
    signedDate: string; expiresDate: string; royaltyRate: number;
    advancePaid: number; territory: string;
}

const EMPTY_FORM: ContractForm = {
    authorName: '', title: '', type: 'publishing', status: 'draft',
    signedDate: '', expiresDate: '', royaltyRate: 15, advancePaid: 0, territory: 'World English',
};

export default function ContractManager() {
    const { data: contracts, loading } = useContracts();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ContractForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>;
    }

    const filtered = contracts.filter(c => {
        const matchesSearch = !searchQuery || c.authorName.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: contracts.length,
        active: contracts.filter(c => c.status === 'active').length,
        totalAdvances: contracts.reduce((sum, c) => sum + c.advancePaid, 0),
        expiringSoon: contracts.filter(c => {
            if (!c.expiresDate) return false;
            const exp = new Date(c.expiresDate);
            const sixMonths = new Date(); sixMonths.setMonth(sixMonths.getMonth() + 6);
            return exp <= sixMonths && c.status === 'active';
        }).length,
    };

    const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
    const openEdit = (c: Contract) => {
        setForm({
            authorName: c.authorName, title: c.title, type: c.type, status: c.status,
            signedDate: c.signedDate, expiresDate: c.expiresDate,
            royaltyRate: c.royaltyRate, advancePaid: c.advancePaid, territory: c.territory,
        });
        setEditingId(c.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.authorName.trim() || !form.title.trim()) return;
        setSaving(true);
        const payload = {
            authorName: form.authorName, title: form.title, type: form.type, status: form.status,
            signedDate: form.signedDate, expiresDate: form.expiresDate,
            royaltyRate: form.royaltyRate, advancePaid: form.advancePaid, territory: form.territory,
        };
        try {
            if (editingId) { await updateDoc(doc(db, 'contracts', editingId), payload); }
            else { await addDoc(collection(db, 'contracts'), payload); }
            setShowModal(false);
        } catch (e) { console.error('Contract save failed:', e); }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this contract?')) return;
        try { await deleteDoc(doc(db, 'contracts', id)); } catch (e) { console.error('Contract delete failed:', e); }
    };

    const downloadPDF = (contract: Contract) => {
        const content = [
            `CONTRACT: ${contract.title}`,
            `ID: ${contract.id}`,
            `Author: ${contract.authorName}`,
            `Type: ${TYPE_LABELS[contract.type] || contract.type}`,
            `Status: ${contract.status}`,
            `Territory: ${contract.territory}`,
            `Royalty Rate: ${contract.royaltyRate}%`,
            `Advance Paid: $${contract.advancePaid.toLocaleString()}`,
            `Signed: ${contract.signedDate || 'Pending'}`,
            `Expires: ${contract.expiresDate || 'N/A'}`,
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `contract-${contract.id}.txt`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Contract <span className="text-emerald-400">Manager</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Author agreements, licensing deals, and rights management</p>
                    </div>
                    <button onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Plus className="w-4 h-4" /> New Contract
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Contracts', value: stats.total.toString(), icon: FileText, color: 'text-white' },
                        { label: 'Active', value: stats.active.toString(), icon: CheckCircle, color: 'text-emerald-400' },
                        { label: 'Total Advances', value: `$${stats.totalAdvances.toLocaleString()}`, icon: DollarSign, color: 'text-starforge-gold' },
                        { label: 'Expiring Soon', value: stats.expiringSoon.toString(), icon: AlertCircle, color: stats.expiringSoon > 0 ? 'text-amber-400' : 'text-white/40' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2"><s.icon className={`w-4 h-4 ${s.color}`} /></div>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by author, title, or contract ID..."
                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-emerald-400/40 focus:outline-none" />
                    </div>
                    <div className="flex gap-1.5">
                        {['all', 'active', 'signed', 'sent', 'draft', 'expired'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-2 text-xs rounded-lg capitalize transition-all ${filterStatus === s ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-white/[0.04] text-white/40 border border-transparent hover:text-white'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {filtered.map((contract) => {
                        const style = STATUS_STYLES[contract.status] || STATUS_STYLES.draft;
                        return (
                            <motion.div key={contract.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all cursor-pointer"
                                onClick={() => setSelectedId(selectedId === contract.id ? null : contract.id)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center"><FileText className="w-5 h-5 text-emerald-400" /></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-white">{contract.title}</h3>
                                                <span className="text-[10px] text-white/20 font-mono">{contract.id.slice(0, 8)}</span>
                                            </div>
                                            <p className="text-xs text-white/50">{contract.authorName} · {TYPE_LABELS[contract.type] || contract.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-white/50">{contract.royaltyRate}% royalty</p>
                                            {contract.advancePaid > 0 && <p className="text-[10px] text-white/30">${contract.advancePaid.toLocaleString()} advance</p>}
                                        </div>
                                        <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ${style.bg}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                            {contract.status}
                                        </span>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {selectedId === contract.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Territory</p><p className="text-xs text-white">{contract.territory}</p></div>
                                                <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Signed</p><p className="text-xs text-white">{contract.signedDate || 'Pending'}</p></div>
                                                <div><p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Expires</p><p className="text-xs text-white">{contract.expiresDate || 'N/A'}</p></div>
                                                <div className="flex items-end gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); downloadPDF(contract); }}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 hover:text-white transition-colors">
                                                        <Download className="w-3 h-3" /> Export
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); openEdit(contract); }}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/60 hover:text-white transition-colors">
                                                        <Edit3 className="w-3 h-3" /> Edit
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(contract.id); }}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/[0.04] border border-forge-red/20 rounded-lg text-forge-red/60 hover:text-forge-red transition-colors">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                    {filtered.length === 0 && <div className="text-center py-12 text-white/20 text-sm">No contracts found.</div>}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface border border-border/30 rounded-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-display text-white">{editingId ? 'Edit Contract' : 'New Contract'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Author Name</label>
                                        <input value={form.authorName} onChange={e => setForm({ ...form, authorName: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-emerald-400/40 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Title</label>
                                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-emerald-400/40 focus:outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Type</label>
                                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-400/40 focus:outline-none">
                                            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Status</label>
                                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-400/40 focus:outline-none">
                                            {['draft', 'sent', 'signed', 'active', 'expired'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Royalty %</label>
                                        <input type="number" value={form.royaltyRate} onChange={e => setForm({ ...form, royaltyRate: +e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-400/40 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Advance $</label>
                                        <input type="number" value={form.advancePaid} onChange={e => setForm({ ...form, advancePaid: +e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-400/40 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Territory</label>
                                        <input value={form.territory} onChange={e => setForm({ ...form, territory: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-400/40 focus:outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Signed Date</label>
                                        <input type="date" value={form.signedDate} onChange={e => setForm({ ...form, signedDate: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-400/40 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Expires Date</label>
                                        <input type="date" value={form.expiresDate} onChange={e => setForm({ ...form, expiresDate: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-400/40 focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleSave} disabled={saving || !form.authorName.trim() || !form.title.trim()}
                                    className="flex items-center gap-2 px-5 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editingId ? 'Save Changes' : 'Create Contract'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
