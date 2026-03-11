import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, TrendingDown, Eye, Users, BookOpen,
    ArrowUpRight, ArrowDownRight, Clock, Globe, Heart, MessageSquare,
    Star, Zap, Calendar
} from 'lucide-react';

// ═══════════════════════════════════════════
// AUTHOR ANALYTICS — Per-author insights
// ═══════════════════════════════════════════

const MOCK_READS_WEEKLY = [3200, 4100, 3800, 5200, 4900, 6100, 5800];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOCK_TITLES = [
    { title: 'Chrome Meridian', reads: 12840, reviews: 87, rating: 4.6, trend: 15.2 },
    { title: 'Neon Cartography', reads: 8920, reviews: 54, rating: 4.3, trend: -2.1 },
    { title: 'The Diaspora Engine', reads: 6340, reviews: 31, rating: 4.8, trend: 8.4 },
];

const MOCK_DEMOGRAPHICS = [
    { label: '18–24', pct: 22 },
    { label: '25–34', pct: 38 },
    { label: '35–44', pct: 24 },
    { label: '45–54', pct: 11 },
    { label: '55+', pct: 5 },
];

const MOCK_GENRES = [
    { genre: 'Cyberpunk', pct: 42 },
    { genre: 'Dark Fantasy', pct: 28 },
    { genre: 'Science Fiction', pct: 18 },
    { genre: 'Literary Fiction', pct: 12 },
];

export default function AuthorAnalytics() {
    const [period, setPeriod] = useState('30d');
    const maxRead = Math.max(...MOCK_READS_WEEKLY);

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Author <span className="text-aurora-teal">Analytics</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Track readership, engagement, and performance</p>
                    </div>
                    <div className="flex gap-1.5">
                        {['7d', '30d', '90d', 'YTD'].map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${period === p ? 'bg-aurora-teal text-void-black font-semibold' : 'bg-white/[0.04] text-white/50 hover:text-white'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Reads', value: '28.1K', trend: 14.2, icon: Eye, color: 'aurora-teal' },
                        { label: 'Unique Readers', value: '4,280', trend: 8.7, icon: Users, color: 'violet-400' },
                        { label: 'Avg. Rating', value: '4.6', trend: 0.3, icon: Star, color: 'starforge-gold' },
                        { label: 'Engagement Rate', value: '72%', trend: -1.2, icon: Heart, color: 'rose-400' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-9 h-9 rounded-lg bg-${s.color}/10 flex items-center justify-center`}>
                                    <s.icon className={`w-4 h-4 text-${s.color}`} />
                                </div>
                                <span className={`flex items-center gap-1 text-xs ${s.trend >= 0 ? 'text-emerald-400' : 'text-forge-red'}`}>
                                    {s.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(s.trend)}%
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-white">{s.value}</p>
                            <p className="text-xs text-white/40 mt-1">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Weekly Reads */}
                    <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-6">Weekly Reads</h2>
                        <div className="flex items-end gap-4 h-40">
                            {MOCK_READS_WEEKLY.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-[10px] text-white/40">{(val / 1000).toFixed(1)}k</span>
                                    <div className="w-full rounded-t-md relative overflow-hidden"
                                        style={{ height: `${(val / maxRead) * 100}%` }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-aurora-teal/60 to-aurora-teal/20" />
                                    </div>
                                    <span className="text-[10px] text-white/30">{DAYS[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reader Demographics */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-6">Reader Age Groups</h2>
                        <div className="space-y-4">
                            {MOCK_DEMOGRAPHICS.map((d, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs text-white/70">{d.label}</span>
                                        <span className="text-xs text-white/40">{d.pct}%</span>
                                    </div>
                                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-aurora-teal/60 to-aurora-teal rounded-full" style={{ width: `${d.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Title Performance */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/[0.06]">
                            <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Title Performance</h2>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                            {MOCK_TITLES.map((t, i) => (
                                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                    <div>
                                        <h3 className="text-sm text-white font-medium">{t.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-white/40"><Eye className="w-3 h-3 inline mr-1" />{t.reads.toLocaleString()}</span>
                                            <span className="text-[10px] text-white/40"><MessageSquare className="w-3 h-3 inline mr-1" />{t.reviews}</span>
                                            <span className="text-[10px] text-starforge-gold"><Star className="w-3 h-3 inline mr-1" />{t.rating}</span>
                                        </div>
                                    </div>
                                    <span className={`flex items-center gap-1 text-xs ${t.trend >= 0 ? 'text-emerald-400' : 'text-forge-red'}`}>
                                        {t.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(t.trend)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Genre Distribution */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-6">Top Reader Genres</h2>
                        <div className="space-y-5">
                            {MOCK_GENRES.map((g, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-white">{g.genre}</span>
                                        <span className="text-sm text-white/50">{g.pct}%</span>
                                    </div>
                                    <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${g.pct}%` }} transition={{ delay: i * 0.1, duration: 0.8 }}
                                            className="h-full bg-gradient-to-r from-violet-500/60 to-violet-400 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
