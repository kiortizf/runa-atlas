import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hash, Plus, Search, Edit3, Trash2, BookOpen, Copy,
    Check, X, Filter, ChevronDown, ExternalLink, AlertCircle
} from 'lucide-react';

// ═══════════════════════════════════════════
// ISBN MANAGER — Track ISBNs per title
// ═══════════════════════════════════════════

interface ISBNEntry {
    isbn: string;
    title: string;
    format: 'ebook' | 'paperback' | 'hardcover' | 'audiobook';
    imprint: string;
    status: 'active' | 'assigned' | 'reserved' | 'retired';
    assignedDate: string;
}

const MOCK_ISBNS: ISBNEntry[] = [
    { isbn: '978-1-940000-01-2', title: 'Chrome Meridian', format: 'ebook', imprint: 'Rüna Atlas Press', status: 'active', assignedDate: '2025-08-15' },
    { isbn: '978-1-940000-01-3', title: 'Chrome Meridian', format: 'paperback', imprint: 'Rüna Atlas Press', status: 'active', assignedDate: '2025-08-15' },
    { isbn: '978-1-940000-02-9', title: 'The Obsidian Protocol', format: 'ebook', imprint: 'Void Noir', status: 'active', assignedDate: '2025-09-01' },
    { isbn: '978-1-940000-02-0', title: 'The Obsidian Protocol', format: 'hardcover', imprint: 'Void Noir', status: 'active', assignedDate: '2025-09-01' },
    { isbn: '978-1-940000-03-6', title: 'Bioluminescent', format: 'ebook', imprint: 'Bohío Press', status: 'active', assignedDate: '2025-10-20' },
    { isbn: '978-1-940000-04-3', title: 'Void Frequencies', format: 'paperback', imprint: 'Rüna Atlas Press', status: 'assigned', assignedDate: '2026-01-10' },
    { isbn: '978-1-940000-05-0', title: '', format: 'ebook', imprint: '', status: 'reserved', assignedDate: '' },
    { isbn: '978-1-940000-06-7', title: '', format: 'ebook', imprint: '', status: 'reserved', assignedDate: '' },
    { isbn: '978-1-940000-07-4', title: 'Legacy Anthology', format: 'paperback', imprint: 'Rüna Atlas Press', status: 'retired', assignedDate: '2024-03-15' },
];

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    assigned: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    reserved: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    retired: 'bg-white/[0.04] text-white/30 border-white/[0.08]',
};

const FORMAT_LABELS: Record<string, string> = {
    ebook: 'eBook',
    paperback: 'Paperback',
    hardcover: 'Hardcover',
    audiobook: 'Audiobook',
};

export default function ISBNManager() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showAdd, setShowAdd] = useState(false);
    const [copiedISBN, setCopiedISBN] = useState<string | null>(null);

    const filtered = MOCK_ISBNS.filter(entry => {
        const matchesSearch = !searchQuery ||
            entry.isbn.includes(searchQuery) ||
            entry.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: MOCK_ISBNS.length,
        active: MOCK_ISBNS.filter(e => e.status === 'active').length,
        reserved: MOCK_ISBNS.filter(e => e.status === 'reserved').length,
        retired: MOCK_ISBNS.filter(e => e.status === 'retired').length,
    };

    const copyISBN = (isbn: string) => {
        navigator.clipboard.writeText(isbn);
        setCopiedISBN(isbn);
        setTimeout(() => setCopiedISBN(null), 2000);
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">ISBN <span className="text-violet-400">Manager</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Track and manage ISBNs across titles and formats</p>
                    </div>
                    <button onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Plus className="w-4 h-4" /> Add ISBN
                    </button>
                </div>

                {/* Stats */}
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

                {/* Search & Filter */}
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

                {/* Table */}
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
                                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-white/50">{FORMAT_LABELS[entry.format]}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/50">{entry.imprint || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_COLORS[entry.status]}`}>{entry.status}</span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="text-white/20 hover:text-white/50"><Edit3 className="w-3.5 h-3.5" /></button>
                                            <button className="text-white/20 hover:text-forge-red"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-white/30 text-sm">No ISBNs match your search.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
