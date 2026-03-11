import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, TrendingDown, BookOpen, Download,
    Calendar, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
    Filter, ChevronDown, Eye, ShoppingCart, Users, Globe
} from 'lucide-react';

// ═══════════════════════════════════════════
// SALES REPORTING DASHBOARD — Admin Tool
// ═══════════════════════════════════════════

const MOCK_MONTHLY = [
    { month: 'Sep', revenue: 12400, units: 320 },
    { month: 'Oct', revenue: 15800, units: 410 },
    { month: 'Nov', revenue: 18200, units: 475 },
    { month: 'Dec', revenue: 24600, units: 640 },
    { month: 'Jan', revenue: 19800, units: 515 },
    { month: 'Feb', revenue: 22100, units: 575 },
    { month: 'Mar', revenue: 16300, units: 424 },
];

const MOCK_TITLES = [
    { title: 'Chrome Meridian', author: 'Xiomara Vega', units: 1842, revenue: 27630, trend: 12.4, format: 'ebook' },
    { title: 'The Obsidian Protocol', author: 'Kofi Asante', units: 1205, revenue: 18075, trend: -3.2, format: 'paperback' },
    { title: 'Bioluminescent', author: 'Yuki Tanaka', units: 987, revenue: 14805, trend: 8.7, format: 'ebook' },
    { title: 'Void Frequencies', author: 'Alejandro Cruz', units: 756, revenue: 11340, trend: 22.1, format: 'hardcover' },
    { title: 'Ancestral Algorithms', author: 'Amara Osei', units: 634, revenue: 9510, trend: -1.5, format: 'ebook' },
    { title: 'The Diaspora Engine', author: 'Priya Sharma', units: 521, revenue: 7815, trend: 5.3, format: 'paperback' },
];

const MOCK_CHANNELS = [
    { name: 'Direct (runaatlas.com)', pct: 42, revenue: 54180 },
    { name: 'Amazon KDP', pct: 28, revenue: 36120 },
    { name: 'IngramSpark', pct: 15, revenue: 19350 },
    { name: 'Apple Books', pct: 8, revenue: 10320 },
    { name: 'Other', pct: 7, revenue: 9030 },
];

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
                        {Math.abs(trend)}%
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
    const [period, setPeriod] = useState('7d');
    const maxRevenue = Math.max(...MOCK_MONTHLY.map(m => m.revenue));

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
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
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.04] text-white/50 rounded-lg hover:text-white">
                            <Download className="w-3 h-3" /> Export
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Revenue" value="$129,000" subtext="Last 12 months" icon={DollarSign} trend={14.2} color="bg-starforge-gold/10 text-starforge-gold" />
                    <StatCard label="Units Sold" value="3,359" subtext="Across all formats" icon={ShoppingCart} trend={8.7} color="bg-aurora-teal/10 text-aurora-teal" />
                    <StatCard label="Active Titles" value="24" subtext="6 imprints" icon={BookOpen} color="bg-violet-400/10 text-violet-400" />
                    <StatCard label="Avg. Revenue/Title" value="$5,375" subtext="Per active title" icon={BarChart3} trend={-2.1} color="bg-rose-400/10 text-rose-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-6">Monthly Revenue</h2>
                        <div className="flex items-end gap-3 h-48">
                            {MOCK_MONTHLY.map((m, i) => (
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

                    {/* Channel Mix */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-6">Sales Channels</h2>
                        <div className="space-y-4">
                            {MOCK_CHANNELS.map((ch, i) => (
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

                {/* Top Titles Table */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Top Performing Titles</h2>
                        <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white">
                            <Filter className="w-3 h-3" /> Filter <ChevronDown className="w-3 h-3" />
                        </button>
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
                            {MOCK_TITLES.map((t, i) => (
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
                </div>
            </div>
        </div>
    );
}
