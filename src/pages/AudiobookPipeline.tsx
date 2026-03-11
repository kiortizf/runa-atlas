import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Headphones, Mic, Scissors, Wand2, CheckCircle, Clock,
    Filter, Search, Calendar, User, BarChart3, Loader2
} from 'lucide-react';
import { useAudiobookProjects, AudioProject } from '../hooks/useDemoData';

const STAGES = ['casting', 'recording', 'editing', 'mastering', 'published'];
const STAGE_ICONS: Record<string, any> = { casting: User, recording: Mic, editing: Scissors, mastering: Wand2, published: CheckCircle };
const STAGE_COLORS: Record<string, string> = {
    casting: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    recording: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    editing: 'bg-violet-400/10 text-violet-400 border-violet-400/20',
    mastering: 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/20',
    published: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
};

export default function AudiobookPipeline() {
    const { data: projects, loading } = useAudiobookProjects();
    const [filterStage, setFilterStage] = useState<string>('all');

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>;
    }

    const filtered = filterStage === 'all' ? projects : projects.filter(p => p.status === filterStage);

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Audiobook <span className="text-violet-400">Pipeline</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Track audiobook production from casting to publication</p>
                    </div>
                </div>

                {/* Stage overview */}
                <div className="grid grid-cols-5 gap-3 mb-8">
                    {STAGES.map(stage => {
                        const count = projects.filter(p => p.status === stage).length;
                        const Icon = STAGE_ICONS[stage];
                        return (
                            <div key={stage} className={`rounded-xl p-4 border ${STAGE_COLORS[stage]} cursor-pointer hover:scale-[1.02] transition-transform`}
                                onClick={() => setFilterStage(filterStage === stage ? 'all' : stage)}>
                                <Icon className="w-5 h-5 mb-2" />
                                <p className="text-2xl font-bold">{count}</p>
                                <p className="text-[10px] uppercase tracking-wider mt-1 opacity-70">{stage}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Projects */}
                <div className="space-y-3">
                    {filtered.map((project, i) => {
                        const pct = project.chapters > 0 ? Math.round((project.chaptersComplete / project.chapters) * 100) : 0;
                        const StageIcon = STAGE_ICONS[project.status] || Clock;
                        return (
                            <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${STAGE_COLORS[project.status]}`}>
                                            <StageIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                                            <p className="text-xs text-white/40">
                                                {project.narrator ? `Narrator: ${project.narrator}` : 'Narrator TBD'}
                                                {project.duration && ` · ${project.duration}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${STAGE_COLORS[project.status]}`}>{project.status}</span>
                                    </div>
                                </div>

                                {project.chapters > 0 && (
                                    <div className="mb-2">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-white/50">{project.chaptersComplete}/{project.chapters} chapters</span>
                                            <span className="text-xs text-white/30">{pct}%</span>
                                        </div>
                                        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-violet-400/60 to-violet-400" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                )}

                                {project.dueDate && (
                                    <div className="flex items-center gap-1 text-[10px] text-white/30">
                                        <Calendar className="w-3 h-3" /> Due {project.dueDate}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                    {filtered.length === 0 && <div className="text-center py-12 text-white/20 text-sm">No audiobook projects found.</div>}
                </div>
            </div>
        </div>
    );
}
