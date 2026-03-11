import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Headphones, Upload, Play, Pause, Clock, Users, Mic,
    CheckCircle, AlertCircle, Edit3, BarChart3, Plus, Search,
    Volume2, FileAudio
} from 'lucide-react';

// ═══════════════════════════════════════════
// AUDIOBOOK PIPELINE — Manage audio editions
// ═══════════════════════════════════════════

interface AudioProject {
    title: string;
    narrator: string;
    status: 'casting' | 'recording' | 'editing' | 'mastering' | 'review' | 'published';
    chapters: number;
    chaptersComplete: number;
    duration: string;
    dueDate: string;
}

const MOCK_PROJECTS: AudioProject[] = [
    { title: 'Chrome Meridian', narrator: 'James Earl Torres', status: 'published', chapters: 24, chaptersComplete: 24, duration: '11h 42m', dueDate: '2025-12-01' },
    { title: 'The Obsidian Protocol', narrator: 'Aisha Kwame', status: 'mastering', chapters: 20, chaptersComplete: 20, duration: '9h 15m', dueDate: '2026-04-15' },
    { title: 'Bioluminescent', narrator: '—', status: 'casting', chapters: 18, chaptersComplete: 0, duration: '—', dueDate: '2026-07-01' },
    { title: 'Void Frequencies', narrator: 'Diego Morales', status: 'recording', chapters: 22, chaptersComplete: 14, duration: '~10h', dueDate: '2026-05-30' },
    { title: 'Ancestral Algorithms', narrator: 'Nina Okafor', status: 'editing', chapters: 19, chaptersComplete: 19, duration: '8h 55m', dueDate: '2026-06-15' },
];

const PIPELINE_STAGES = ['casting', 'recording', 'editing', 'mastering', 'review', 'published'];

const STAGE_COLORS: Record<string, string> = {
    casting: 'bg-violet-500/10 text-violet-400',
    recording: 'bg-rose-500/10 text-rose-400',
    editing: 'bg-amber-500/10 text-amber-400',
    mastering: 'bg-blue-500/10 text-blue-400',
    review: 'bg-aurora-teal/10 text-aurora-teal',
    published: 'bg-emerald-500/10 text-emerald-400',
};

const STAGE_DOT: Record<string, string> = {
    casting: 'bg-violet-400',
    recording: 'bg-rose-400',
    editing: 'bg-amber-400',
    mastering: 'bg-blue-400',
    review: 'bg-aurora-teal',
    published: 'bg-emerald-400',
};

export default function AudiobookPipeline() {
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? MOCK_PROJECTS : MOCK_PROJECTS.filter(p => p.status === filter);

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Audiobook <span className="text-rose-400">Pipeline</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Manage narrators, recording, and audio editions</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>

                {/* Pipeline Overview */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-8">
                    <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4">Pipeline Stages</h2>
                    <div className="flex items-center gap-2">
                        {PIPELINE_STAGES.map((stage, i) => {
                            const count = MOCK_PROJECTS.filter(p => p.status === stage).length;
                            return (
                                <div key={stage} className="flex-1 flex items-center gap-2">
                                    <button onClick={() => setFilter(filter === stage ? 'all' : stage)}
                                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${filter === stage ? `${STAGE_COLORS[stage]} border-current` : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
                                        <p className="text-lg font-bold">{count}</p>
                                        <p className="text-[10px] uppercase tracking-wider mt-0.5 capitalize">{stage}</p>
                                    </button>
                                    {i < PIPELINE_STAGES.length - 1 && (
                                        <div className="w-4 h-px bg-white/[0.1]" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Projects */}
                <div className="space-y-4">
                    {filtered.map((project, i) => {
                        const progress = project.chapters > 0 ? (project.chaptersComplete / project.chapters) * 100 : 0;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-rose-400/10 flex items-center justify-center">
                                            <Headphones className="w-6 h-6 text-rose-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-white/40"><Mic className="w-3 h-3 inline mr-1" />{project.narrator}</span>
                                                <span className="text-xs text-white/30"><Clock className="w-3 h-3 inline mr-1" />{project.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-white/30">Due {project.dueDate}</span>
                                        <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ${STAGE_COLORS[project.status]}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${STAGE_DOT[project.status]}`} />
                                            {project.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                                            className="h-full bg-gradient-to-r from-rose-500/60 to-rose-400 rounded-full" />
                                    </div>
                                    <span className="text-xs text-white/40 w-20 text-right">{project.chaptersComplete}/{project.chapters} ch</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
