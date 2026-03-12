import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { seedAllDemoData } from '../scripts/seedDemoData';
import {
    BookOpen, Dna, CalendarHeart, Sparkles, BookMarked, Users,
    Compass, Shield, PenTool, Palette, Target, Rocket, Gift,
    FileText, BarChart3, MessageCircle, GitBranch, Inbox,
    LayoutDashboard, ChevronRight, Crown, Star, LogOut,
    Database, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

// ═══════════════════════════════════════════
// MEMBER DASHBOARD — Role-Aware Hub
// ═══════════════════════════════════════════

interface ToolCard {
    label: string;
    description: string;
    href: string;
    icon: any;
    color: string;
    bgColor: string;
}

const READER_TOOLS: ToolCard[] = [
    { label: 'My Library', description: 'Your purchased books and reading progress', href: '/library', icon: BookOpen, color: 'text-aurora-teal', bgColor: 'bg-aurora-teal/10' },
    { label: 'Book DNA', description: 'Your unique reading personality profile', href: '/book-dna', icon: Dna, color: 'text-violet-400', bgColor: 'bg-violet-400/10' },
    { label: 'Year in Review', description: 'Your annual reading wrapped', href: '/wrapped', icon: CalendarHeart, color: 'text-rose-400', bgColor: 'bg-rose-400/10' },
    { label: 'Mood Matcher', description: 'Find books by how you feel', href: '/mood-matcher', icon: Sparkles, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
];

const COMMUNITY_TOOLS: ToolCard[] = [
    { label: 'Passage Collections', description: 'Curate and share your favorite lines', href: '/passages', icon: BookMarked, color: 'text-starforge-gold', bgColor: 'bg-starforge-gold/10' },
    { label: 'Reader Compatibility', description: 'Find your book buddy', href: '/compatibility', icon: Users, color: 'text-rose-400', bgColor: 'bg-rose-400/10' },
    { label: 'Content Compass', description: 'Community content warnings', href: '/content-compass', icon: Compass, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
    { label: 'Spoiler Shield', description: 'Chapter-gated discussions', href: '/spoiler-shield', icon: Shield, color: 'text-aurora-teal', bgColor: 'bg-aurora-teal/10' },
];

const AUTHOR_TOOLS: ToolCard[] = [
    { label: 'Forge Editor', description: 'Write and edit your manuscripts', href: '/forge-editor', icon: PenTool, color: 'text-starforge-gold', bgColor: 'bg-starforge-gold/10' },
    { label: 'Creator Studio', description: 'Design your book pages', href: '/creator', icon: Palette, color: 'text-violet-400', bgColor: 'bg-violet-400/10' },
    { label: 'Writing Goals', description: 'Daily targets and streak tracking', href: '/writing-goals', icon: Target, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
    { label: 'Launch Planner', description: 'Plan your book launch timeline', href: '/launch-planner', icon: Rocket, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
    { label: 'ARC Manager', description: 'Manage advance reader copies', href: '/arc-manager', icon: Gift, color: 'text-rose-400', bgColor: 'bg-rose-400/10' },
    { label: 'Submission Tracker', description: 'Track your manuscript submissions', href: '/submission-tracker', icon: FileText, color: 'text-aurora-teal', bgColor: 'bg-aurora-teal/10' },
];

const EDITORIAL_TOOLS: ToolCard[] = [
    { label: 'Manuscript Pipeline', description: 'Track manuscripts through stages', href: '/manuscript-pipeline', icon: BarChart3, color: 'text-violet-400', bgColor: 'bg-violet-400/10' },
    { label: 'Beta Campaign', description: 'Run beta reading campaigns', href: '/beta-campaign', icon: Users, color: 'text-rose-400', bgColor: 'bg-rose-400/10' },
    { label: 'Editor Bridge', description: 'Collaborate with your editor', href: '/editor-bridge', icon: MessageCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
    { label: 'Revision Rounds', description: 'Track revision cycles', href: '/revision-rounds', icon: GitBranch, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
    { label: 'Manuscript Inbox', description: 'Review incoming manuscripts', href: '/manuscript-inbox', icon: Inbox, color: 'text-aurora-teal', bgColor: 'bg-aurora-teal/10' },
];

function ToolSection({ title, tools, delay = 0 }: { title: string; tools: ToolCard[]; delay?: number }) {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
        >
            <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={tool.href}
                            onClick={() => navigate(tool.href)}
                            className="group text-left p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-lg ${tool.bgColor} flex items-center justify-center flex-none`}>
                                    <Icon className={`w-4 h-4 ${tool.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-white group-hover:text-starforge-gold transition-colors">{tool.label}</h3>
                                        <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
                                    </div>
                                    <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">{tool.description}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}

export default function Dashboard() {
    const { user, userRole, logOut } = useAuth();
    const navigate = useNavigate();

    const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [seedMessage, setSeedMessage] = useState('');

    const isAuthor = userRole === 'author' || userRole === 'admin';
    const isAdmin = userRole === 'admin';

    const roleLabel = isAdmin ? 'Admin' : isAuthor ? 'Author' : 'Member';
    const roleColor = isAdmin ? 'text-starforge-gold' : isAuthor ? 'text-violet-400' : 'text-aurora-teal';
    const roleBg = isAdmin ? 'bg-starforge-gold/10 border-starforge-gold/20' : isAuthor ? 'bg-violet-400/10 border-violet-400/20' : 'bg-aurora-teal/10 border-aurora-teal/20';

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <Crown className="w-5 h-5 text-starforge-gold" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">
                                    Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded border ${roleBg} ${roleColor}`}>
                                        {roleLabel}
                                    </span>
                                    <span className="text-xs text-text-secondary">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/portal')}
                                className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-xs text-text-secondary rounded hover:bg-white/[0.08] hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <Star className="w-3.5 h-3.5" /> Author Portal
                            </button>
                            <button
                                onClick={logOut}
                                className="px-3 py-2 text-xs text-text-secondary hover:text-forge-red transition-colors flex items-center gap-1.5"
                            >
                                <LogOut className="w-3.5 h-3.5" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
                {/* Reading Tools — All Members */}
                <ToolSection title="My Reading" tools={READER_TOOLS} delay={0} />

                {/* Community Tools — All Members */}
                <ToolSection title="Community" tools={COMMUNITY_TOOLS} delay={0.1} />

                {/* Author Tools — Authors & Admins */}
                {isAuthor && (
                    <>
                        <ToolSection title="Author Tools" tools={AUTHOR_TOOLS} delay={0.2} />
                        <ToolSection title="Editorial & Collaboration" tools={EDITORIAL_TOOLS} delay={0.3} />
                    </>
                )}

                {/* Admin — Admins Only */}
                {isAdmin && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4">Administration</h2>
                        <button
                            onClick={() => navigate('/admin')}
                            className="group flex items-center gap-4 p-5 bg-starforge-gold/[0.03] border border-starforge-gold/10 rounded-lg hover:border-starforge-gold/30 hover:bg-starforge-gold/[0.06] transition-all w-full text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-starforge-gold/10 flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-starforge-gold" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-white group-hover:text-starforge-gold transition-colors">Admin Dashboard</h3>
                                <p className="text-[11px] text-text-secondary">Manage users, content, submissions, and platform settings</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-starforge-gold/50 transition-colors" />
                        </button>
                    </motion.div>
                )}

                {/* Seed Demo Data — Always visible */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="mt-6"
                >
                    <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4">Developer Tools</h2>
                    <button
                        onClick={async () => {
                            if (!user?.uid) return;
                            setSeedStatus('loading');
                            try {
                                const result = await seedAllDemoData(user.uid);
                                if (result.success) {
                                    setSeedStatus('success');
                                    setSeedMessage(`Seeded ${result.seeded.length} documents`);
                                } else {
                                    setSeedStatus('error');
                                    setSeedMessage(`${result.seeded.length} ok, ${result.errors.length} errors`);
                                }
                            } catch (e: any) {
                                setSeedStatus('error');
                                setSeedMessage(e.message);
                            }
                            setTimeout(() => setSeedStatus('idle'), 4000);
                        }}
                        disabled={seedStatus === 'loading'}
                        className="group flex items-center gap-4 p-5 bg-aurora-teal/[0.03] border border-aurora-teal/10 rounded-lg hover:border-aurora-teal/30 hover:bg-aurora-teal/[0.06] transition-all w-full text-left disabled:opacity-50"
                    >
                        <div className="w-10 h-10 rounded-lg bg-aurora-teal/10 flex items-center justify-center">
                            {seedStatus === 'loading' ? <Loader2 className="w-5 h-5 text-aurora-teal animate-spin" /> :
                             seedStatus === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
                             seedStatus === 'error' ? <AlertCircle className="w-5 h-5 text-forge-red" /> :
                             <Database className="w-5 h-5 text-aurora-teal" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white group-hover:text-aurora-teal transition-colors">
                                {seedStatus === 'loading' ? 'Seeding...' : seedStatus === 'success' ? 'Seeded!' : seedStatus === 'error' ? 'Seed Error' : 'Seed Demo Data'}
                            </h3>
                            <p className="text-[11px] text-text-secondary">
                                {seedMessage || 'Populate Firestore with demo data for all publisher modules'}
                            </p>
                        </div>
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
