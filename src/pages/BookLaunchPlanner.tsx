import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Check, Clock, Plus, X, BookOpen, Megaphone,
    Palette, FileText, Users, Mail, Star, ArrowRight,
    ChevronDown, ChevronRight, Target, Zap, Globe, Pen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type LaunchPhase = 'pre-production' | 'production' | 'pre-launch' | 'launch' | 'post-launch';

interface LaunchTask {
    id: string;
    title: string;
    phase: LaunchPhase;
    status: TaskStatus;
    dueDate?: string;
    assignee?: string;
    description?: string;
    category: 'editorial' | 'design' | 'marketing' | 'distribution' | 'community';
}

const PHASE_CONFIG: Record<LaunchPhase, { label: string; icon: typeof Calendar; color: string }> = {
    'pre-production': { label: 'Pre-Production', icon: Pen, color: 'text-cosmic-purple' },
    'production': { label: 'Production', icon: Palette, color: 'text-aurora-teal' },
    'pre-launch': { label: 'Pre-Launch', icon: Megaphone, color: 'text-starforge-gold' },
    'launch': { label: 'Launch Week', icon: Zap, color: 'text-emerald-400' },
    'post-launch': { label: 'Post-Launch', icon: Target, color: 'text-orange-400' },
};

const CATEGORY_ICONS: Record<string, typeof Calendar> = {
    editorial: FileText, design: Palette, marketing: Megaphone, distribution: Globe, community: Users,
};

const INITIAL_TASKS: LaunchTask[] = [];

const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string; label: string }> = {
    'todo': { bg: 'bg-white/[0.04]', text: 'text-white/30', label: 'To Do' },
    'in-progress': { bg: 'bg-starforge-gold/10', text: 'text-starforge-gold', label: 'In Progress' },
    'done': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Done' },
};

export default function BookLaunchPlanner() {
    const [tasks, setTasks] = useState<LaunchTask[]>(INITIAL_TASKS);
    const [expandedPhases, setExpandedPhases] = useState<Set<LaunchPhase>>(new Set(['pre-production', 'production', 'pre-launch']));
    const [viewMode, setViewMode] = useState<'timeline' | 'board'>('timeline');
    const [selectedBook, setSelectedBook] = useState('The Ember Codex');
    const [showNewTask, setShowNewTask] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const unsub = onSnapshot(
                query(collection(db, 'book_launches'), where('authorId', '==', user.uid)),
                (snap) => {
                    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    if (data.length > 0) {
                        const launch = data[0] as any;
                        if (launch.tasks) setTasks(launch.tasks);
                    }
                },
                () => { }
            );
            return () => unsub();
        });
        return () => unsubAuth();
    }, []);

    const togglePhase = (phase: LaunchPhase) => {
        setExpandedPhases(prev => {
            const next = new Set(prev);
            next.has(phase) ? next.delete(phase) : next.add(phase);
            return next;
        });
    };

    const cycleStatus = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id !== id) return t;
            const order: TaskStatus[] = ['todo', 'in-progress', 'done'];
            const next = order[(order.indexOf(t.status) + 1) % 3];
            return { ...t, status: next };
        }));
    };

    const phases = Object.keys(PHASE_CONFIG) as LaunchPhase[];
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

    return (
        <div className="bg-void-black min-h-screen py-24">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-2">Book Launch Planner</span>
                        <h1 className="font-display text-3xl text-white tracking-wide">
                            <span className="text-starforge-gold">{selectedBook}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-lg font-bold text-starforge-gold">{doneTasks}/{totalTasks}</p>
                            <p className="text-[9px] text-white/20 uppercase">Tasks Complete</p>
                        </div>
                        <div className="w-12 h-12 relative">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,0.04)" strokeWidth="3" fill="none" />
                                <circle cx="18" cy="18" r="15" stroke="#C9A84C" strokeWidth="3" fill="none"
                                    strokeDasharray={`${(doneTasks / totalTasks) * 94.2} 94.2`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white">{Math.round((doneTasks / totalTasks) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: 'text-white/40' },
                        { label: 'In Progress', count: inProgressTasks, color: 'text-starforge-gold' },
                        { label: 'Complete', count: doneTasks, color: 'text-emerald-400' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                            <p className="text-[10px] text-white/20 uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Phase Timeline */}
                <div className="space-y-4">
                    {phases.map((phase) => {
                        const config = PHASE_CONFIG[phase];
                        const phaseTasks = tasks.filter(t => t.phase === phase);
                        const phaseComplete = phaseTasks.filter(t => t.status === 'done').length;
                        const isExpanded = expandedPhases.has(phase);

                        return (
                            <motion.div key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden">
                                {/* Phase Header */}
                                <button onClick={() => togglePhase(phase)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-white/[0.01] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <config.icon className={`w-5 h-5 ${config.color}`} />
                                        <h2 className="text-sm font-semibold text-white">{config.label}</h2>
                                        <span className="text-[10px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded">
                                            {phaseComplete}/{phaseTasks.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Mini progress */}
                                        <div className="w-24 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500/50 rounded-full transition-all"
                                                style={{ width: `${phaseTasks.length ? (phaseComplete / phaseTasks.length) * 100 : 0}%` }} />
                                        </div>
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-white/20" /> : <ChevronRight className="w-4 h-4 text-white/20" />}
                                    </div>
                                </button>

                                {/* Tasks */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                            className="overflow-hidden">
                                            <div className="px-5 pb-4 space-y-2">
                                                {phaseTasks.map(task => {
                                                    const CatIcon = CATEGORY_ICONS[task.category] || FileText;
                                                    const statusConfig = STATUS_COLORS[task.status];
                                                    return (
                                                        <div key={task.id} className="flex items-center gap-3 p-3 bg-white/[0.01] rounded-lg border border-white/[0.03] hover:border-white/[0.08] transition-colors group">
                                                            {/* Status toggle */}
                                                            <button onClick={() => cycleStatus(task.id)}
                                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-none transition-all
                                  ${task.status === 'done' ? 'bg-emerald-500/20 border-emerald-500/40' : task.status === 'in-progress' ? 'border-starforge-gold/40' : 'border-white/[0.1]'}`}>
                                                                {task.status === 'done' && <Check className="w-3 h-3 text-emerald-400" />}
                                                                {task.status === 'in-progress' && <div className="w-2 h-2 rounded-full bg-starforge-gold" />}
                                                            </button>

                                                            <CatIcon className="w-3.5 h-3.5 text-white/15 flex-none" />

                                                            <span className={`text-sm flex-1 ${task.status === 'done' ? 'text-white/30 line-through' : 'text-white/80'}`}>
                                                                {task.title}
                                                            </span>

                                                            {task.assignee && (
                                                                <span className="text-[9px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded hidden sm:block">
                                                                    {task.assignee}
                                                                </span>
                                                            )}

                                                            {task.dueDate && (
                                                                <span className={`text-[10px] flex-none ${task.status === 'done' ? 'text-white/15' : 'text-white/25'}`}>
                                                                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            )}

                                                            <span className={`text-[9px] px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.text}`}>
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
