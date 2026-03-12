import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Target, Flame, Calendar, Check, PenTool, Clock, Trophy,
    TrendingUp, Zap, Star, Sun, Moon, Coffee, Sunrise, Play,
    Pause, RotateCcw, BookOpen, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Data loaded from Firestore
let _streakData = { currentStreak: 0, longestStreak: 0, totalSessions: 0, totalWords: 0 };
let _weeklyLog: any[] = [];
let _milestones: any[] = [];
let _achievements: any[] = [];


export default function WritingGoals() {
    const { user } = useAuth();
    const [dailyGoal, setDailyGoal] = useState(1000);
    const [sprintActive, setSprintActive] = useState(false);
    const [sprintTime, setSprintTime] = useState(25);
    const [sprintElapsed, setSprintElapsed] = useState(0);
    const [sprintWords, setSprintWords] = useState(0);
    const [activeTab, setActiveTab] = useState<'goals' | 'sprints' | 'achievements'>('goals');

    const todayWords = _weeklyLog[4].words; // Simulate "today" as Friday
    const goalProgress = Math.min(100, (todayWords / dailyGoal) * 100);
    const weekTotal = _weeklyLog.reduce((sum, d) => sum + d.words, 0);
    const weekGoal = dailyGoal * 7;
    const daysCompleted = _weeklyLog.filter(d => d.completed).length;

    return (
        <div className="bg-void-black min-h-screen py-24">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-2">Writing Goals</span>
                        <h1 className="font-display text-3xl text-white tracking-wide">
                            STAY ON <span className="text-starforge-gold">TRACK</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 bg-starforge-gold/10 border border-starforge-gold/20 rounded-lg px-4 py-2">
                        <Flame className="w-5 h-5 text-starforge-gold" />
                        <div>
                            <p className="text-lg font-bold text-starforge-gold">{_streakData.currentStreak}</p>
                            <p className="text-[9px] text-white/30 uppercase">Day Streak</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-white/[0.02] p-1 rounded-lg border border-white/[0.06] w-fit">
                    {(['goals', 'sprints', 'achievements'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all
                ${activeTab === tab ? 'bg-starforge-gold/10 text-starforge-gold' : 'text-white/30 hover:text-white/50'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'goals' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Today's Progress */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm text-white font-semibold">Today's Progress</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/30">Goal:</span>
                                        <input type="number" value={dailyGoal} onChange={e => setDailyGoal(Number(e.target.value))}
                                            className="w-20 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-starforge-gold/30" />
                                        <span className="text-xs text-white/30">words</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="none" />
                                            <circle cx="50" cy="50" r="42" stroke="#C9A84C" strokeWidth="8" fill="none"
                                                strokeDasharray={`${goalProgress * 2.64} 264`}
                                                strokeLinecap="round" className="transition-all duration-700" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-2xl font-bold text-white">{todayWords.toLocaleString()}</p>
                                            <p className="text-[9px] text-white/30">/ {dailyGoal.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-white/40">Progress</span>
                                            <span className={`text-xs font-semibold ${goalProgress >= 100 ? 'text-emerald-400' : 'text-starforge-gold'}`}>
                                                {goalProgress.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-white/40">Remaining</span>
                                            <span className="text-xs text-white/60">{Math.max(0, dailyGoal - todayWords).toLocaleString()} words</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-white/40">Pace</span>
                                            <span className="text-xs text-white/60">~{Math.round(todayWords / 2)} words/hr</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Week View */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm text-white font-semibold">This Week</h2>
                                    <div className="text-right">
                                        <p className="text-xs text-white/40">{weekTotal.toLocaleString()} / {weekGoal.toLocaleString()} words</p>
                                        <p className="text-[10px] text-white/20">{daysCompleted}/7 days completed</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-end h-32">
                                    {_weeklyLog.map((d, i) => {
                                        const height = dailyGoal > 0 ? Math.min(100, (d.words / dailyGoal) * 100) : 0;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <span className="text-[9px] text-white/20">{d.words > 0 ? d.words.toLocaleString() : '—'}</span>
                                                <div className="w-full bg-white/[0.04] rounded-t relative flex-1 flex items-end">
                                                    <div className={`w-full rounded-t transition-all ${d.completed ? 'bg-starforge-gold/40' : d.words > 0 ? 'bg-white/10' : 'bg-white/[0.03]'}`}
                                                        style={{ height: `${Math.max(4, height)}%` }} />
                                                </div>
                                                <span className={`text-[10px] font-semibold ${d.completed ? 'text-starforge-gold' : 'text-white/20'}`}>{d.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Goal line */}
                                <div className="relative h-0 -mt-[52px] mb-[52px]">
                                    <div className="absolute inset-x-0 border-t border-dashed border-starforge-gold/20" />
                                </div>
                            </motion.div>

                            {/* Milestones */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                                <h2 className="text-sm text-white font-semibold mb-4">Milestones</h2>
                                <div className="space-y-4">
                                    {_milestones.map(m => {
                                        const pct = Math.min(100, (m.current / m.target) * 100);
                                        return (
                                            <div key={m.id} className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-none
                          ${m.completed ? 'bg-emerald-500/20' : 'bg-white/[0.04]'}`}>
                                                    {m.completed ? <Check className="w-3 h-3 text-emerald-400" /> : <Target className="w-3 h-3 text-white/20" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className={`text-xs ${m.completed ? 'text-white/60' : 'text-white/80'}`}>{m.label}</span>
                                                        <span className="text-[10px] text-white/20">
                                                            {m.current.toLocaleString()} / {m.target.toLocaleString()} {m.unit || 'words'}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${m.completed ? 'bg-emerald-500/50' : 'bg-starforge-gold/40'}`}
                                                            style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="space-y-6">
                            {[
                                { icon: Flame, label: 'Current Streak', value: `${_streakData.currentStreak} days`, color: 'text-orange-400' },
                                { icon: Trophy, label: 'Longest Streak', value: `${_streakData.longestStreak} days`, color: 'text-starforge-gold' },
                                { icon: PenTool, label: 'Total Sessions', value: _streakData.totalSessions.toString(), color: 'text-aurora-teal' },
                                { icon: BookOpen, label: 'Total Words', value: `${(_streakData.totalWords / 1000).toFixed(0)}k`, color: 'text-cosmic-purple' },
                            ].map((stat, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                    className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                                        <p className="text-[10px] text-white/20 uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'sprints' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="max-w-lg mx-auto">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 text-center">
                            <h2 className="text-sm text-white/40 uppercase tracking-wider mb-6">Writing Sprint</h2>

                            {/* Timer */}
                            <div className="relative w-48 h-48 mx-auto mb-6">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.04)" strokeWidth="4" fill="none" />
                                    <circle cx="50" cy="50" r="42" stroke="#C9A84C" strokeWidth="4" fill="none"
                                        strokeDasharray={`${sprintActive ? ((sprintElapsed / (sprintTime * 60)) * 264) : 0} 264`}
                                        strokeLinecap="round" className="transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-4xl font-mono text-white font-bold">{sprintTime}:00</p>
                                    <p className="text-[10px] text-white/20">minutes</p>
                                </div>
                            </div>

                            {/* Duration Selector */}
                            <div className="flex justify-center gap-2 mb-6">
                                {[10, 15, 25, 30, 45, 60].map(m => (
                                    <button key={m} onClick={() => !sprintActive && setSprintTime(m)}
                                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all
                      ${sprintTime === m ? 'bg-starforge-gold/10 border-starforge-gold/30 text-starforge-gold' : 'border-white/[0.06] text-white/20 hover:border-white/15'}`}>
                                        {m}m
                                    </button>
                                ))}
                            </div>

                            {/* Word Count */}
                            <div className="mb-6">
                                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-2">Words Written</label>
                                <input type="number" value={sprintWords} onChange={e => setSprintWords(Number(e.target.value))}
                                    className="w-32 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 text-lg text-white text-center font-semibold focus:outline-none focus:border-starforge-gold/30 mx-auto" />
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center gap-3">
                                <button onClick={() => setSprintActive(!sprintActive)}
                                    className={`px-8 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all
                    ${sprintActive ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90'}`}>
                                    {sprintActive ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Start Sprint</>}
                                </button>
                                <button onClick={() => { setSprintActive(false); setSprintElapsed(0); setSprintWords(0); }}
                                    className="px-4 py-3 rounded-lg border border-white/[0.06] text-white/30 hover:border-white/15 hover:text-white/50 transition-all">
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-[10px] text-white/15 mt-6">
                                Open the Forge Editor in another tab and write freely. Come back to log your words when the sprint ends.
                            </p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'achievements' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {_achievements.map((a, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                className={`p-5 rounded-lg border text-center transition-all
                  ${a.earned ? 'bg-starforge-gold/[0.04] border-starforge-gold/20' : 'bg-white/[0.01] border-white/[0.04] opacity-40'}`}>
                                <span className="text-3xl">{a.icon}</span>
                                <p className={`text-sm font-semibold mt-2 ${a.earned ? 'text-white' : 'text-white/30'}`}>{a.label}</p>
                                <p className="text-[10px] text-white/20 mt-1">{a.desc}</p>
                                {a.earned && <p className="text-[9px] text-starforge-gold mt-2 uppercase tracking-wider">Earned ✓</p>}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
