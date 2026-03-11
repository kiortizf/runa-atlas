import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, TrendingDown, Users, Star,
    BookOpen, Globe, Eye, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { useAuthorAnalytics } from '../hooks/useDemoData';

export default function AuthorAnalytics() {
    const { readsWeekly, titles, demographics, genres, loading } = useAuthorAnalytics();

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-aurora-teal animate-spin" /></div>;
    }

    const totalReads = readsWeekly.reduce((s, v) => s + v, 0);
    const maxRead = Math.max(...readsWeekly, 1);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Author <span className="text-aurora-teal">Analytics</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Readership trends, demographics, and title performance</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                        <Eye className="w-5 h-5 text-aurora-teal mb-2" />
                        <p className="text-3xl font-bold text-white">{totalReads.toLocaleString()}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Total Reads This Week</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                        <BookOpen className="w-5 h-5 text-violet-400 mb-2" />
                        <p className="text-3xl font-bold text-white">{titles.length}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Active Titles</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                        <Star className="w-5 h-5 text-starforge-gold mb-2" />
                        <p className="text-3xl font-bold text-white">{titles.length > 0 ? (titles.reduce((s, t) => s + t.rating, 0) / titles.length).toFixed(1) : '0'}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Avg Rating</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-6">Weekly Reads</h2>
                        <div className="flex items-end gap-3 h-40">
                            {readsWeekly.map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-[10px] text-white/40">{(val / 1000).toFixed(1)}k</span>
                                    <div className="w-full rounded-t-md overflow-hidden" style={{ height: `${(val / maxRead) * 100}%` }}>
                                        <div className="w-full h-full bg-gradient-to-t from-aurora-teal/60 to-aurora-teal/20" />
                                    </div>
                                    <span className="text-[10px] text-white/30">{days[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-6">Reader Demographics</h2>
                        <div className="space-y-4">
                            {demographics.map((d, i) => (
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/[0.06]">
                            <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Title Performance</h2>
                        </div>
                        {titles.map((t, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between border-t border-white/[0.04] hover:bg-white/[0.02]">
                                <div>
                                    <h3 className="text-sm font-medium text-white">{t.title}</h3>
                                    <p className="text-xs text-white/40">{t.reads.toLocaleString()} reads · {t.reviews} reviews · {t.rating} avg</p>
                                </div>
                                <span className={`flex items-center gap-1 text-xs ${t.trend >= 0 ? 'text-emerald-400' : 'text-forge-red'}`}>
                                    {t.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(t.trend)}%
                                </span>
                            </div>
                        ))}
                        {titles.length === 0 && <div className="text-center py-12 text-white/20 text-sm">No analytics data yet.</div>}
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4">Genre Distribution</h2>
                        <div className="space-y-3">
                            {genres.map((g, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#5eead4','#a78bfa','#f472b6','#fbbf24'][i % 4] }} />
                                    <div className="flex-1">
                                        <div className="flex justify-between"><span className="text-xs text-white">{g.genre}</span><span className="text-xs text-white/40">{g.pct}%</span></div>
                                        <div className="h-1.5 bg-white/[0.04] rounded-full mt-1 overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${g.pct}%`, backgroundColor: ['#5eead4','#a78bfa','#f472b6','#fbbf24'][i % 4] }} />
                                        </div>
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
