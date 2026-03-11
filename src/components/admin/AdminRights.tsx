import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, X, Globe, DollarSign, FileText, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

// ─── Types ──────────────────────────────────────────
const RIGHT_TYPES = ['Print', 'Audio', 'Film/TV', 'Digital', 'Translation'] as const;
type RightType = typeof RIGHT_TYPES[number];
const TERRITORIES = ['World', 'North America', 'UK/ANZ', 'EU', 'Asia', 'Latin America', 'Africa', 'Middle East'] as const;
type Territory = typeof TERRITORIES[number];
const STATUSES = ['Available', 'Sold', 'Optioned', 'Reserved'] as const;
type RightStatus = typeof STATUSES[number];

interface RightCell {
    status: RightStatus;
    buyer?: string;
    termStart?: string;
    termEnd?: string;
}

interface BookRights {
    id: string;
    bookTitle: string;
    authorName: string;
    grid: Record<string, Record<string, RightCell>>; // rightType -> territory -> cell
    createdAt: any;
}

interface RightsDeal {
    id: string;
    bookId: string;
    bookTitle: string;
    type: RightType;
    territory: Territory;
    buyer: string;
    value: number;
    termStart: string;
    termEnd: string;
    notes: string;
    createdAt: any;
}

// ─── Demo Data ──────────────────────────────────────
const DEMO_BOOKS: BookRights[] = [
    {
        id: 'br-1', bookTitle: 'The Hollow Crown', authorName: 'Maren Voss',
        grid: {
            Print: { World: { status: 'Sold', buyer: 'Rüna Atlas', termStart: '2027-01', termEnd: '2032-01' }, 'North America': { status: 'Sold', buyer: 'Rüna Atlas' }, 'UK/ANZ': { status: 'Available' } },
            Audio: { World: { status: 'Sold', buyer: 'Audible', termStart: '2027-03', termEnd: '2030-03' } },
            'Film/TV': { World: { status: 'Optioned', buyer: 'A24', termStart: '2027-06', termEnd: '2028-06' } },
            Digital: { World: { status: 'Sold', buyer: 'Rüna Atlas' } },
            Translation: { EU: { status: 'Sold', buyer: 'Gallimard (French)', termStart: '2027-09', termEnd: '2032-09' }, Asia: { status: 'Available' } },
        },
        createdAt: new Date('2027-01-10'),
    },
    {
        id: 'br-2', bookTitle: 'Signal Bloom', authorName: 'Ada Chen',
        grid: {
            Print: { World: { status: 'Sold', buyer: 'Rüna Atlas' } },
            Audio: { World: { status: 'Available' } },
            'Film/TV': { World: { status: 'Available' } },
            Digital: { World: { status: 'Sold', buyer: 'Rüna Atlas' } },
            Translation: {},
        },
        createdAt: new Date('2027-02-15'),
    },
];

const DEMO_DEALS: RightsDeal[] = [
    { id: 'rd-1', bookId: 'br-1', bookTitle: 'The Hollow Crown', type: 'Audio', territory: 'World', buyer: 'Audible', value: 45000, termStart: '2027-03', termEnd: '2030-03', notes: '3-year exclusive', createdAt: new Date('2027-02-01') },
    { id: 'rd-2', bookId: 'br-1', bookTitle: 'The Hollow Crown', type: 'Film/TV', territory: 'World', buyer: 'A24', value: 120000, termStart: '2027-06', termEnd: '2028-06', notes: '12-month option with renewal', createdAt: new Date('2027-03-15') },
    { id: 'rd-3', bookId: 'br-1', bookTitle: 'The Hollow Crown', type: 'Translation', territory: 'EU', buyer: 'Gallimard', value: 18000, termStart: '2027-09', termEnd: '2032-09', notes: 'French language only', createdAt: new Date('2027-04-01') },
];

const STATUS_COLORS: Record<RightStatus, string> = {
    Available: 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30',
    Sold: 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30',
    Optioned: 'bg-cosmic-purple/10 text-cosmic-purple border-cosmic-purple/30',
    Reserved: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

type ViewMode = 'grid' | 'deals';

export default function AdminRights() {
    const [books, setBooks] = useState<BookRights[]>([]);
    const [deals, setDeals] = useState<RightsDeal[]>([]);
    const [view, setView] = useState<ViewMode>('grid');
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [showDealModal, setShowDealModal] = useState(false);
    const [expandedBook, setExpandedBook] = useState<string | null>(null);
    const [dealForm, setDealForm] = useState<Partial<RightsDeal>>({ type: 'Print', territory: 'World', value: 0 });
    const [dealFilter, setDealFilter] = useState<string>('all');

    // Load data
    useEffect(() => {
        const unsub1 = onSnapshot(collection(db, 'bookRights'), snap => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as BookRights));
            setBooks(data.length > 0 ? data : DEMO_BOOKS);
        }, () => setBooks(DEMO_BOOKS));

        const unsub2 = onSnapshot(query(collection(db, 'rightsDeals'), orderBy('createdAt', 'desc')), snap => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as RightsDeal));
            setDeals(data.length > 0 ? data : DEMO_DEALS);
        }, () => setDeals(DEMO_DEALS));

        return () => { unsub1(); unsub2(); };
    }, []);

    // Summary stats
    const stats = useMemo(() => {
        const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);
        const byType: Record<string, number> = {};
        deals.forEach(d => { byType[d.type] = (byType[d.type] || 0) + 1; });
        return { totalDeals: deals.length, totalValue, byType };
    }, [deals]);

    const addDeal = async () => {
        if (!dealForm.bookTitle || !dealForm.buyer) return;
        try {
            await addDoc(collection(db, 'rightsDeals'), { ...dealForm, createdAt: serverTimestamp() });
        } catch { /* local fallback */ }
        setShowDealModal(false);
        setDealForm({ type: 'Print', territory: 'World', value: 0 });
    };

    const filteredDeals = dealFilter === 'all' ? deals : deals.filter(d => d.type === dealFilter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Rights Management</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => setView('grid')}
                        className={`flex items-center gap-1.5 px-3 py-2 font-ui text-xs uppercase tracking-wider rounded-sm transition-colors ${view === 'grid' ? 'bg-starforge-gold text-void-black' : 'text-text-secondary border border-border'}`}>
                        <Globe className="w-3.5 h-3.5" /> Rights Grid
                    </button>
                    <button onClick={() => setView('deals')}
                        className={`flex items-center gap-1.5 px-3 py-2 font-ui text-xs uppercase tracking-wider rounded-sm transition-colors ${view === 'deals' ? 'bg-starforge-gold text-void-black' : 'text-text-secondary border border-border'}`}>
                        <DollarSign className="w-3.5 h-3.5" /> Deals
                    </button>
                    <button onClick={() => setShowDealModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors ml-2">
                        <Plus className="w-3.5 h-3.5" /> New Deal
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-surface border border-border rounded-sm p-4">
                    <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider">Total Deals</p>
                    <p className="font-display text-2xl text-text-primary mt-1">{stats.totalDeals}</p>
                </div>
                <div className="bg-surface border border-border rounded-sm p-4">
                    <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider">Total Value</p>
                    <p className="font-display text-2xl text-starforge-gold mt-1">${stats.totalValue.toLocaleString()}</p>
                </div>
                {Object.entries(stats.byType).slice(0, 2).map(([type, count]) => (
                    <div key={type} className="bg-surface border border-border rounded-sm p-4">
                        <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider">{type} Deals</p>
                        <p className="font-display text-2xl text-text-primary mt-1">{count}</p>
                    </div>
                ))}
            </div>

            {/* ════════════ RIGHTS GRID VIEW ════════════ */}
            {view === 'grid' && (
                <div className="space-y-4">
                    {books.map(book => {
                        const isExp = expandedBook === book.id;
                        return (
                            <div key={book.id} className="bg-surface border border-border rounded-sm overflow-hidden">
                                <button className="w-full p-4 flex items-center justify-between text-left" onClick={() => setExpandedBook(isExp ? null : book.id)}>
                                    <div>
                                        <h3 className="font-heading text-base text-text-primary">{book.bookTitle}</h3>
                                        <p className="font-ui text-[10px] text-text-muted">{book.authorName}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Quick status summary */}
                                        <div className="hidden sm:flex gap-1">
                                            {RIGHT_TYPES.map(rt => {
                                                const cells = book.grid[rt] || {};
                                                const hasSold = Object.values(cells).some(c => c.status === 'Sold' || c.status === 'Optioned');
                                                return (
                                                    <span key={rt} className={`w-2 h-2 rounded-full ${hasSold ? 'bg-starforge-gold' : 'bg-border'}`} title={rt} />
                                                );
                                            })}
                                        </div>
                                        {isExp ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isExp && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                            <div className="border-t border-border overflow-x-auto">
                                                <table className="w-full text-left border-collapse min-w-[700px]">
                                                    <thead>
                                                        <tr className="bg-deep-space">
                                                            <th className="p-3 font-ui text-[9px] text-text-muted uppercase tracking-wider w-28">Right</th>
                                                            {TERRITORIES.map(t => (
                                                                <th key={t} className="p-3 font-ui text-[9px] text-text-muted uppercase tracking-wider text-center">{t}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {RIGHT_TYPES.map(rt => (
                                                            <tr key={rt} className="border-t border-border">
                                                                <td className="p-3 font-ui text-xs text-text-primary font-medium">{rt}</td>
                                                                {TERRITORIES.map(terr => {
                                                                    const cell = book.grid[rt]?.[terr];
                                                                    const status = cell?.status || 'Available';
                                                                    return (
                                                                        <td key={terr} className="p-2 text-center">
                                                                            <div className={`inline-flex flex-col items-center px-2 py-1 rounded-sm border text-[8px] font-ui uppercase tracking-wider ${STATUS_COLORS[status as RightStatus]}`}>
                                                                                <span>{status}</span>
                                                                                {cell?.buyer && <span className="text-[7px] mt-0.5 opacity-70 normal-case">{cell.buyer}</span>}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ════════════ DEALS VIEW ════════════ */}
            {view === 'deals' && (
                <>
                    {/* Filter */}
                    <div className="flex gap-1">
                        <button onClick={() => setDealFilter('all')} className={`px-3 py-1.5 font-ui text-[10px] uppercase tracking-wider rounded-sm ${dealFilter === 'all' ? 'bg-starforge-gold text-void-black' : 'text-text-muted'}`}>
                            All ({deals.length})
                        </button>
                        {RIGHT_TYPES.map(rt => (
                            <button key={rt} onClick={() => setDealFilter(rt)} className={`px-3 py-1.5 font-ui text-[10px] uppercase tracking-wider rounded-sm ${dealFilter === rt ? 'bg-starforge-gold text-void-black' : 'text-text-muted'}`}>
                                {rt} ({deals.filter(d => d.type === rt).length})
                            </button>
                        ))}
                    </div>

                    {/* Deals Table */}
                    <div className="bg-surface border border-border rounded-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-deep-space border-b border-border">
                                    <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Book</th>
                                    <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Type</th>
                                    <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Territory</th>
                                    <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Buyer</th>
                                    <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Value</th>
                                    <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Term</th>
                                    <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDeals.map(deal => (
                                    <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-void-black/30 transition-colors">
                                        <td className="p-3">
                                            <p className="font-heading text-sm text-text-primary">{deal.bookTitle}</p>
                                        </td>
                                        <td className="p-3 font-ui text-xs text-cosmic-purple">{deal.type}</td>
                                        <td className="p-3 font-ui text-xs text-text-secondary">{deal.territory}</td>
                                        <td className="p-3 font-ui text-xs text-text-primary">{deal.buyer}</td>
                                        <td className="p-3 font-mono text-xs text-starforge-gold">${(deal.value || 0).toLocaleString()}</td>
                                        <td className="p-3 font-mono text-[10px] text-text-muted">{deal.termStart} → {deal.termEnd}</td>
                                        <td className="p-3 font-ui text-[10px] text-text-muted truncate max-w-32">{deal.notes}</td>
                                    </tr>
                                ))}
                                {filteredDeals.length === 0 && (
                                    <tr><td colSpan={7} className="p-8 text-center text-text-muted font-ui text-sm">No deals found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Territory Coverage */}
                    <div className="bg-surface border border-border rounded-sm p-4">
                        <h3 className="font-ui text-[10px] uppercase tracking-wider text-text-muted mb-3">Territory Coverage</h3>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                            {TERRITORIES.map(terr => {
                                const sold = deals.filter(d => d.territory === terr || d.territory === 'World').length;
                                return (
                                    <div key={terr} className={`p-3 rounded-sm border text-center ${sold > 0 ? 'border-starforge-gold/30 bg-starforge-gold/5' : 'border-border bg-void-black'}`}>
                                        <Globe className={`w-4 h-4 mx-auto mb-1 ${sold > 0 ? 'text-starforge-gold' : 'text-text-muted/30'}`} />
                                        <p className="font-ui text-[9px] text-text-muted uppercase tracking-wider">{terr}</p>
                                        <p className={`font-mono text-xs mt-0.5 ${sold > 0 ? 'text-starforge-gold' : 'text-text-muted'}`}>{sold}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* ════════════ ADD DEAL MODAL ════════════ */}
            <AnimatePresence>
                {showDealModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDealModal(false)}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-void-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-surface border border-border rounded-sm p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading text-xl text-text-primary">New Rights Deal</h2>
                                <button onClick={() => setShowDealModal(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3">
                                <input type="text" placeholder="Book title" value={dealForm.bookTitle || ''} onChange={e => setDealForm({ ...dealForm, bookTitle: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={dealForm.type} onChange={e => setDealForm({ ...dealForm, type: e.target.value as RightType })}
                                        className="bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none appearance-none">
                                        {RIGHT_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                                    </select>
                                    <select value={dealForm.territory} onChange={e => setDealForm({ ...dealForm, territory: e.target.value as Territory })}
                                        className="bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none appearance-none">
                                        {TERRITORIES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <input type="text" placeholder="Buyer" value={dealForm.buyer || ''} onChange={e => setDealForm({ ...dealForm, buyer: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                <input type="number" placeholder="Deal value ($)" value={dealForm.value || ''} onChange={e => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="font-ui text-[9px] text-text-muted uppercase tracking-wider block mb-1">Term Start</label>
                                        <input type="month" value={dealForm.termStart || ''} onChange={e => setDealForm({ ...dealForm, termStart: e.target.value })}
                                            className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                    </div>
                                    <div>
                                        <label className="font-ui text-[9px] text-text-muted uppercase tracking-wider block mb-1">Term End</label>
                                        <input type="month" value={dealForm.termEnd || ''} onChange={e => setDealForm({ ...dealForm, termEnd: e.target.value })}
                                            className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold" />
                                    </div>
                                </div>
                                <textarea rows={2} placeholder="Notes..." value={dealForm.notes || ''} onChange={e => setDealForm({ ...dealForm, notes: e.target.value })}
                                    className="w-full bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary text-sm font-ui outline-none focus:border-starforge-gold resize-none" />
                                <button onClick={addDeal} className="w-full py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors">
                                    Create Deal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
