import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy, Flame, Calendar, Users, CheckCircle, Crown, Loader2
} from 'lucide-react';
import { useChallenges } from '../hooks/useDemoData';

export default function ReadingChallenges() {
    const { challenges, leaderboard, loading } = useChallenges();
    const [tab, setTab] = useState<'active' | 'completed' | 'upcoming'>('active');

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-starforge-gold animate-spin" /></div>;
    }

    const filtered = challenges.filter(c => c.status === tab);

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Reading <span className="text-starforge-gold">Challenges</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Track progress, earn badges, climb the leaderboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-starforge-gold/10 rounded-lg border border-starforge-gold/20">
                            <Flame className="w-4 h-4 text-starforge-gold" />
                            <span className="text-sm font-semibold text-starforge-gold">12-day streak</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    {(['active', 'completed', 'upcoming'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 text-xs rounded-lg capitalize transition-all ${tab === t ? 'bg-starforge-gold text-void-black font-semibold' : 'bg-white/[0.04] text-white/50 hover:text-white'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {filtered.map((challenge, i) => {
                            const pct = Math.min((challenge.progress / challenge.target) * 100, 100);
                            return (
                                <motion.div key={challenge.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{challenge.badge}</span>
                                            <div>
                                                <h3 className="text-sm font-semibold text-white">{challenge.title}</h3>
                                                <p className="text-xs text-white/40">{challenge.description}</p>
                                            </div>
                                        </div>
                                        {challenge.status === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-400 flex-none" />}
                                    </div>
                                    {challenge.status !== 'upcoming' && (
                                        <div className="mb-3">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-white/50">{challenge.progress} / {challenge.target} {challenge.type}</span>
                                                <span className="text-xs text-white/30">{Math.round(pct)}%</span>
                                            </div>
                                            <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                                                    className={`h-full rounded-full ${challenge.status === 'completed' ? 'bg-emerald-400' : 'bg-gradient-to-r from-starforge-gold/60 to-starforge-gold'}`} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-[10px] text-white/30">
                                            <span><Users className="w-3 h-3 inline mr-1" />{challenge.participants} joined</span>
                                            <span><Calendar className="w-3 h-3 inline mr-1" />Ends {challenge.endDate}</span>
                                        </div>
                                        {challenge.status === 'upcoming' && (
                                            <button className="px-3 py-1.5 text-xs bg-starforge-gold text-void-black rounded-lg font-semibold hover:bg-yellow-400">Join</button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                        {filtered.length === 0 && (
                            <div className="text-center py-12 text-white/20">
                                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No {tab} challenges</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 h-fit">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4 flex items-center gap-2">
                            <Trophy className="w-3 h-3 text-starforge-gold" /> Leaderboard
                        </h2>
                        <div className="space-y-3">
                            {leaderboard.map((user, i) => (
                                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-starforge-gold text-void-black' : i === 1 ? 'bg-white/20 text-white' : i === 2 ? 'bg-amber-700/30 text-amber-400' : 'bg-white/[0.04] text-white/30'}`}>
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm text-white">{user.name}</p>
                                        <p className="text-[10px] text-white/30">{user.books} books · {user.streak}-day streak</p>
                                    </div>
                                    {i === 0 && <Crown className="w-4 h-4 text-starforge-gold" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
