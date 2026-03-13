import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, TrendingDown, BookOpen, Download,
    Calendar, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
    Filter, ChevronDown, Eye, ShoppingCart, Users, Globe, Loader2, Check
} from 'lucide-react';
import { useSalesData, SalesMonthly, SalesTitle, SalesChannel } from '../hooks/useDemoData';

function StatCard({ label, value, subtext, icon: Icon, trend, color }: {
    label: string; value: string; subtext: string; icon: any; trend?: number; color: string;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-forge-red'}`}>
                        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
            <p className="text-[10px] text-white/25 mt-0.5">{subtext}</p>
        </motion.div>
    );
}

export default function SalesDashboard() {
    const [period, setPeriod] = useState('All');
    const [filterFormat, setFilterFormat] = useState('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [exportStatus, setExportStatus] = useState<'idle' | 'done'>('idle');
    const { monthly, titles, channels, loading } = useSalesData();

    // Period filtering — slice monthly data based on selected period
    const filteredMonthly = useMemo(() => {
        if (!monthly.length) return monthly;
        switch (period) {
            case '7d': return monthly.slice(-1); // last month
            case '30d': return monthly.slice(-1);
            case '90d': return monthly.slice(-3);
            case 'YTD': {
                const currentMonth = new Date().getMonth(); // 0-indexed
                return monthly.slice(-(currentMonth + 1));
            }
            case 'All':
            default: return monthly;
        }
    }, [monthly, period]);

    // Format filtering for titles
    const filteredTitles = useMemo(() => {
        if (filterFormat === 'all') return titles;
        return titles.filter(t => t.format.toLowerCase() === filterFormat.toLowerCase());
    }, [titles, filterFormat]);

    // Compute actual trend from data
    const computeTrend = (data: SalesMonthly[]): number => {
        if (data.length < 2) return 0;
        const recent = data[data.length - 1].revenue;
        const previous = data[data.length - 2].revenue;
        if (previous === 0) return 0;
        return ((recent - previous) / previous) * 100;
    };

    const exportCSV = () => {
        const header = 'Title,Author,Format,Units,Revenue,Trend\n';
        const rows = filteredTitles.map(t =>
            `"${t.title}","${t.author}","${t.format}",${t.units},${t.revenue},${t.trend}%`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `sales-report-${period}.csv`; a.click();
        URL.revokeObjectURL(url);
        setExportStatus('done');
        setTimeout(() => setExportStatus('idle'), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-starforge-gold animate-spin" />
            </div>
        );
    }

    const maxRevenue = filteredMonthly.length > 0 ? Math.max(...filteredMonthly.map(m => m.revenue)) : 1;
    const totalRevenue = filteredTitles.reduce((sum, t) => sum + t.revenue, 0);
    const totalUnits = filteredTitles.reduce((sum, t) => sum + t.units, 0);
    const revenueTrend = computeTrend(filteredMonthly);
    const unitsTrend = filteredTitles.length > 1
        ? filteredTitles.reduce((sum, t) => sum + t.trend, 0) / filteredTitles.length : 0;

    const formats = Array.from(new Set(titles.map(t => t.format)));

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Sales <span className="text-starforge-gold">Dashboard</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Revenue, units, and channel performance</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {['7d', '30d', '90d', 'YTD', 'All'].map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${period === p ? 'bg-starforge-gold text-void-black font-semibold' : 'bg-white/[0.04] text-white/50 hover:text-white'}`}>
                                {p}
                            </button>
                        ))}
                        <button onClick={exportCSV}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.04] text-white/50 rounded-lg hover:text-white transition-colors">
                            {exportStatus === 'done' ? <><Check className="w-3 h-3 text-emerald-400" /> Exported</> : <><Download className="w-3 h-3" /> Export</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} subtext={`${period} period`} icon={DollarSign} trend={revenueTrend} color="bg-starforge-gold/10 text-starforge-gold" />
                    <StatCard label="Units Sold" value={totalUnits.toLocaleString()} subtext="Across all formats" icon={ShoppingCart} trend={unitsTrend} color="bg-aurora-teal/10 text-aurora-teal" />
                    <StatCard label="Active Titles" value={filteredTitles.length.toString()} subtext={`${channels.length} channels`} icon={BookOpen} color="bg-violet-400/10 text-violet-400" />
                    <StatCard label="Avg. Revenue/Title" value={filteredTitles.length > 0 ? `$${Math.round(totalRevenue / filteredTitles.length).toLocaleString()}` : '$0'} subtext="Per active title" icon={BarChart3} color="bg-rose-400/10 text-rose-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-6">Monthly Revenue</h2>
                        <div className="flex items-end gap-3 h-48">
                            {filteredMonthly.map((m, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-[10px] text-white/40">${(m.revenue / 1000).toFixed(1)}k</span>
                                    <div className="w-full bg-starforge-gold/20 rounded-t-md relative overflow-hidden"
                                        style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-starforge-gold/60 to-starforge-gold/20" />
                                    </div>
                                    <span className="text-[10px] text-white/30">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-6">Sales Channels</h2>
                        <div className="space-y-4">
                            {channels.map((ch, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-white/70">{ch.name}</span>
                                        <span className="text-xs text-white/40">{ch.pct}%</span>
                                    </div>
                                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-starforge-gold/60 to-starforge-gold rounded-full transition-all" style={{ width: `${ch.pct}%` }} />
                                    </div>
                                    <p className="text-[10px] text-white/25 mt-0.5">${ch.revenue.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Top Performing Titles</h2>
                        <div className="relative">
                            <button onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors">
                                <Filter className="w-3 h-3" /> {filterFormat === 'all' ? 'All Formats' : filterFormat} <ChevronDown className="w-3 h-3" />
                            </button>
                            {showFilterMenu && (
                                <div className="absolute right-0 top-full mt-1 bg-surface border border-border/30 rounded-lg shadow-xl z-10 py-1 min-w-[140px]">
                                    <button onClick={() => { setFilterFormat('all'); setShowFilterMenu(false); }}
                                        className={`block w-full text-left px-3 py-2 text-xs hover:bg-white/[0.04] transition-colors ${filterFormat === 'all' ? 'text-starforge-gold' : 'text-white/60'}`}>
                                        All Formats
                                    </button>
                                    {formats.map(f => (
                                        <button key={f} onClick={() => { setFilterFormat(f); setShowFilterMenu(false); }}
                                            className={`block w-full text-left px-3 py-2 text-xs hover:bg-white/[0.04] transition-colors capitalize ${filterFormat === f ? 'text-starforge-gold' : 'text-white/60'}`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] text-white/30 uppercase tracking-widest">
                                <th className="text-left px-6 py-3 font-medium">Title</th>
                                <th className="text-left px-4 py-3 font-medium">Author</th>
                                <th className="text-left px-4 py-3 font-medium">Format</th>
                                <th className="text-right px-4 py-3 font-medium">Units</th>
                                <th className="text-right px-4 py-3 font-medium">Revenue</th>
                                <th className="text-right px-6 py-3 font-medium">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTitles.map((t, i) => (
                                <tr key={i} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3 text-sm text-white font-medium">{t.title}</td>
                                    <td className="px-4 py-3 text-sm text-white/60">{t.author}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-white/40">{t.format}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white/60 text-right">{t.units.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-white text-right font-medium">${t.revenue.toLocaleString()}</td>
                                    <td className="px-6 py-3 text-right">
                                        <span className={`inline-flex items-center gap-1 text-xs ${t.trend >= 0 ? 'text-emerald-400' : 'text-forge-red'}`}>
                                            {t.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {Math.abs(t.trend)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTitles.length === 0 && <div className="text-center py-12 text-white/20 text-sm">No sales data found for this filter.</div>}
                </div>
            </div>
        </div>
    );
}
