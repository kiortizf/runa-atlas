import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Scroll, PenLine, Users, BookOpen, BarChart3, Sparkles,
    MessageSquare, Star, Heart, Shield, Gem, Zap, ArrowRight,
    ChevronDown, Check, GitBranch, Eye, Target, Mic, Quote,
    TrendingUp, Award, Globe, Layers, Brain, Feather, Crown,
    Flame, Calendar, Send, DollarSign, UserCircle, Rocket,
    Trophy, Archive, GitMerge, Scissors, Megaphone
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { usePageSEO } from '../hooks/usePageSEO';

// Feature screenshots
import forgeEditorImg from '../assets/features/forge-editor.webp';
import creatorStudioImg from '../assets/features/creator-studio.webp';
import communityImg from '../assets/features/community.webp';
import runeweaveImg from '../assets/features/runeweave-voting.webp';
import readerCirclesImg from '../assets/features/reader-circles.webp';
import writingAnalyticsImg from '../assets/features/writing-analytics.webp';
import betaReaderImg from '../assets/features/beta-reader-hub.webp';
import manuscriptIntelImg from '../assets/features/manuscript-intelligence.webp';
import audienceInsightsImg from '../assets/features/audience-insights.webp';
import revenueReachImg from '../assets/features/revenue-reach.webp';
import collaborationImg from '../assets/features/collaboration.webp';
import writingGoalsImg from '../assets/features/writing-goals.webp';
import launchPlannerImg from '../assets/features/launch-planner.webp';
import arcManagerImg from '../assets/features/arc-manager.webp';
import submissionTrackerImg from '../assets/features/submission-tracker.webp';
import royaltyCalculatorImg from '../assets/features/royalty-calculator.webp';
import authorProfileImg from '../assets/features/author-profile.webp';
import onboardingWizardImg from '../assets/features/onboarding-wizard.webp';
import championsImg from '../assets/features/champions.webp';
import archiveImg from '../assets/features/runeweave-archive.webp';
import editorBridgeImg from '../assets/features/editor-bridge.webp';
import editorBetaManagerImg from '../assets/features/editor-beta-manager.webp';
import betaCampaignImg from '../assets/features/beta-campaign.webp';

// ═══════════════════════════════════════════
// FOR AUTHORS — SaaS-style feature showcase
// ═══════════════════════════════════════════

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } }
};

export default function ForAuthors() {
  usePageSEO({
    title: 'For Authors',
    description: 'Your craft deserves more. RÜNA ATLAS PRESS offers author-first economics, The Forge editor, Creator Studio analytics, beta reader matching, and a built-in community that amplifies your voice.',
  });
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    const [heroSubtitle, setHeroSubtitle] = useState(
        "Runa Atlas isn't just a publisher — it's a creative engine built for the next generation of storytellers. Professional tools, real community, transparent economics, and technology that actually serves your art."
    );

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'page_configs', 'for-authors'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle);
            }
        }, () => { });
        return () => unsub();
    }, []);

    return (
        <div className="bg-void-black text-white overflow-hidden">

            {/* ═══════ HERO ═══════ */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-starforge-gold/[0.04] via-transparent to-transparent" />
                    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-starforge-gold/[0.03] rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-aurora-teal/[0.03] rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
                    {/* Stars */}
                    {Array.from({ length: 40 }, (_, i) => (
                        <div key={i} className="absolute w-px h-px bg-white rounded-full animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                opacity: 0.2 + Math.random() * 0.5,
                                animationDuration: `${2 + Math.random() * 4}s`,
                                animationDelay: `${Math.random() * 3}s`
                            }} />
                    ))}
                </div>

                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}>
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-starforge-gold/40" />
                            <span className="text-[11px] uppercase tracking-[0.3em] text-starforge-gold/80 font-ui">For Authors</span>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-starforge-gold/40" />
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white tracking-wider leading-[1.1] mb-8">
                            YOUR CRAFT<br />
                            <span className="text-starforge-gold">DESERVES MORE</span>
                        </h1>
                        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12 font-body">
                            {heroSubtitle}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link to="/submissions" className="group px-8 py-4 bg-starforge-gold text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-starforge-gold/90 transition-all flex items-center gap-3">
                                Submit Your Manuscript <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#philosophy" className="px-8 py-4 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-starforge-gold/40 hover:text-starforge-gold transition-all">
                                Learn More
                            </a>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-secondary/40">
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </section>

            {/* ═══════ ANTI-PITCH ═══════ */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
                        <p className="text-2xl md:text-3xl text-white/80 font-body leading-relaxed italic">
                            "Traditional publishing moves at the speed of bureaucracy.<br className="hidden md:block" />
                            Self-publishing leaves you entirely alone.<br className="hidden md:block" />
                            <span className="text-starforge-gold not-italic font-semibold">We built a third path.</span>"
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ PHILOSOPHY ═══════ */}
            <section id="philosophy" className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-20">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-4">Our Philosophy</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            BUILT BY AUTHORS, <span className="text-starforge-gold">FOR AUTHORS</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            We believe great stories deserve great infrastructure. Every feature we build starts with one question:
                            does this serve the writer?
                        </p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: 'Author-First Economics', desc: 'Industry-leading revenue splits. Full transparency. No hidden fees. You see every dollar, every download, every metric — in real time.' },
                            { icon: Heart, title: 'Creative Freedom', desc: 'We don\'t dictate your vision. Our editorial process enhances your voice, never replaces it. Your name, your story, your rules.' },
                            { icon: Gem, title: 'Technology as a Tool', desc: 'Purpose-built writing tools, AI-assisted analytics, and community features designed to remove friction from the creative process.' },
                            { icon: Zap, title: 'Speed Without Compromise', desc: 'From manuscript to market in weeks, not years. Our streamlined pipeline respects both your time and your standards.' },
                            { icon: Globe, title: 'Community, Not Isolation', desc: 'Connect with beta readers, get audience feedback, and participate in a thriving literary community — all from inside your dashboard.' },
                            { icon: Award, title: 'Long-Term Partnership', desc: 'We invest in careers, not individual titles. Marketing support, audience building tools, and revenue optimization that grow with you.' },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="group p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-starforge-gold/20 transition-all duration-500 hover:bg-white/[0.04]">
                                <div className="w-12 h-12 rounded-lg bg-starforge-gold/10 flex items-center justify-center mb-5 group-hover:bg-starforge-gold/20 transition-colors">
                                    <item.icon className="w-6 h-6 text-starforge-gold" />
                                </div>
                                <h3 className="text-lg text-white font-semibold mb-3">{item.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ WHAT WE OFFER (section header) ═══════ */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-aurora-teal/70 font-ui block mb-4">The Platform</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            EVERYTHING YOU NEED,<br /><span className="text-starforge-gold">NOTHING YOU DON'T</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto mb-4">
                            A complete creative suite designed specifically for fiction authors. Write, collaborate, analyze, and grow — all in one place.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FEATURE 1: THE FORGE EDITOR ═══════ */}
            <FeatureShowcase
                badge="The Forge"
                title={<>A Writing Environment<br />That <span className="text-starforge-gold">Gets Out of Your Way</span></>}
                description="The Forge is our distraction-free manuscript editor — built with professional novelists in mind. Three-panel design: binder, editor, and inspector. Full rich text, auto-save, version history with diff view, keyboard shortcuts, and a beautiful dark interface that's easy on the eyes for marathon writing sessions."
                image={forgeEditorImg}
                features={[
                    'Binder sidebar for chapters, scenes, notes & research',
                    'Auto-save to cloud with version history and diff view',
                    'Rich formatting: headings, blockquotes, lists, scene breaks',
                    'Word count, character count, and reading time tracking',
                    'Cmd+S instant save, undo/redo, chapter status tracking',
                ]}
                reverse={false}
            />

            {/* ═══════ FEATURE 2: COLLABORATION ═══════ */}
            <FeatureShowcase
                badge="Real-Time Collaboration"
                title={<>Work With Editors<br /><span className="text-aurora-teal">Like Never Before</span></>}
                description="Our editorial tools are designed around one principle: the author-editor relationship should feel collaborative, never adversarial. Inline comments with threaded replies, suggestion mode with transparent accept/reject tracking, and real-time presence indicators — all built to reduce friction and keep both sides in sync."
                image={collaborationImg}
                features={[
                    'Inline comments anchored to specific text passages',
                    'Threaded replies for focused editorial discussions',
                    'Suggestion mode: track insertions, deletions, replacements',
                    'Accept/reject individual suggestions with one click',
                    'Real-time presence: see who\'s editing with colored cursors',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ EDITORIAL COLLABORATION GRID ═══════ */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-aurora-teal/70 font-ui block mb-4">Editorial Partnership</span>
                        <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide mb-4">
                            NAVIGATING THE <span className="text-aurora-teal">EDITORIAL PROCESS</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto text-sm leading-relaxed">
                            Common friction points — conflicting feedback, unclear revision status, lost beta reader notes — become
                            collaboration opportunities. These tools keep authors and editors aligned at every stage.
                        </p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <SubFeatureCard
                            image={editorBridgeImg}
                            title="Editor Feedback Bridge"
                            description="Import beta reader consensus directly into your editorial workflow. See which issues readers agree on, flag conflicting opinions, and let your editor prioritize revisions based on real data — not guesswork."
                            icon={GitMerge}
                        />
                        <SubFeatureCard
                            image={editorBetaManagerImg}
                            title="Co-Managed Beta Readers"
                            description="Both you and your editor can invite, track, and nudge beta readers from one shared panel. Full transparency via activity logs — no more 'did you send them the latest draft?' confusion."
                            icon={Users}
                        />
                        <SubFeatureCard
                            image={betaCampaignImg}
                            title="Beta Campaign Manager"
                            description="Run structured beta campaigns with chapter-by-chapter release schedules, guided feedback questions, and aggregate consensus reports. Turn scattered opinions into actionable editorial intelligence."
                            icon={Megaphone}
                        />
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FEATURE 3: CREATOR STUDIO ═══════ */}
            <FeatureShowcase
                badge="Creator Studio"
                title={<>Your Command Center<br />for <span className="text-starforge-gold">Everything</span></>}
                description="A unified dashboard that puts your entire writing life at your fingertips. Track writing sessions, monitor revenue, manage beta readers, and get AI-powered insights into your manuscripts — all in one place."
                image={creatorStudioImg}
                features={[
                    'Writing analytics: daily/weekly streaks, heatmaps, session logs',
                    'Revenue & reach tracking with real-time earnings dashboard',
                    'Manuscript intelligence with AI-powered analysis',
                    'Beta reader hub for managing early feedback',
                    'Audience insights: most-highlighted passages, engagement metrics',
                ]}
                reverse={false}
            />

            {/* ═══════ SUB-FEATURES GRID ═══════ */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-4">Creator Studio Deep Dive</span>
                        <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide">
                            POWERFUL TOOLS, <span className="text-starforge-gold">BEAUTIFUL DATA</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SubFeatureCard
                            image={writingAnalyticsImg}
                            title="Writing Analytics"
                            description="Track your daily word count, writing streaks, and session history. Visualize your progress with heatmaps and charts that keep you motivated."
                            icon={BarChart3}
                        />
                        <SubFeatureCard
                            image={betaReaderImg}
                            title="Beta Reader Hub"
                            description="Recruit and manage beta readers directly from the platform. Send manuscripts, collect structured feedback, and iterate faster."
                            icon={Users}
                        />
                        <SubFeatureCard
                            image={manuscriptIntelImg}
                            title="Manuscript Intelligence"
                            description="AI-powered analysis of your manuscripts — pacing, readability scores, character frequency, and comparative analytics against genre benchmarks."
                            icon={Brain}
                        />
                        <SubFeatureCard
                            image={audienceInsightsImg}
                            title="Audience Insights"
                            description="See which passages readers highlight most, where they stop reading, and what resonates. Data-driven feedback that actually helps your craft."
                            icon={Eye}
                        />
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FEATURE 4: REVENUE & REACH ═══════ */}
            <FeatureShowcase
                badge="Revenue & Reach"
                title={<>Transparent Economics,<br /><span className="text-emerald-400">Real Revenue</span></>}
                description="No black boxes. See every sale, every read, every dollar in real time. Our dashboard tracks royalties, subscription revenue, serialization income, and merchandise — so you always know exactly where you stand."
                image={revenueReachImg}
                features={[
                    'Real-time royalty tracking with transparent breakdowns',
                    'Multiple revenue streams: direct sales, serialization, membership',
                    'Payout history and projected earnings forecasts',
                    'Comparative analytics: how your titles perform vs. genre averages',
                    'Marketing attribution: see which channels drive your sales',
                ]}
                reverse={true}
                accent="emerald"
            />

            {/* ═══════ FEATURE 5: COMMUNITY ═══════ */}
            <FeatureShowcase
                badge="The Forge & Community"
                title={<>A Community That<br /><span className="text-starforge-gold">Amplifies Your Voice</span></>}
                description="The Forge consolidates everything in one hub — voting, reader circles, author Q&A, reading challenges, and the Runeweave Archive. Your audience shapes anthology themes, joins book clubs, and engages directly with your work. Community Champions recognize your most dedicated fans."
                image={communityImg}
                features={[
                    'Constellation voting: community-driven anthology curation',
                    'Reader Circles: organized book clubs with discussion guides',
                    'Author Q&A sessions with upvoting and live events',
                    'Runeweave Archive: reader-made glossaries, moodboards, essays',
                    'Community Champions: badges, leaderboards, Founders Wall',
                ]}
                reverse={false}
            />

            {/* ═══════ COMMUNITY SCREENSHOTS ═══════ */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SubFeatureCard
                            image={runeweaveImg}
                            title="Constellation Voting"
                            description="Your readers help shape what gets published. Democratic anthology curation creates excitement and pre-built audiences for your work."
                            icon={Star}
                        />
                        <SubFeatureCard
                            image={readerCirclesImg}
                            title="Reader Circles"
                            description="Organized book clubs with professionally designed discussion kits. Growing readership through genuine community engagement."
                            icon={BookOpen}
                        />
                    </motion.div>
                </div>
            </section>

            {/* ═══════ YOUR AUTHOR TOOLKIT (NEW FEATURES) ═══════ */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-cosmic-purple/70 font-ui block mb-4">Author Toolkit</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            TOOLS THAT KEEP YOU<br /><span className="text-starforge-gold">ON TRACK & IN CONTROL</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            From daily writing accountability to launch day logistics — we've built an entire suite of tools
                            designed around the author lifecycle.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FEATURE: WRITING GOALS ═══════ */}
            <FeatureShowcase
                badge="Writing Goals & Accountability"
                title={<>Stay Disciplined.<br /><span className="text-starforge-gold">Stay Inspired.</span></>}
                description="Set daily word count targets, track your writing streaks, and unlock achievements as you hit milestones. Built-in sprint timers keep you focused, while the weekly chart shows you exactly how your habit is forming. Gamification that actually makes you write more."
                image={writingGoalsImg}
                features={[
                    'Daily word count goals with circular progress visualization',
                    'Streak tracking: current, longest, and total sessions',
                    'Weekly bar chart with goal line and per-day breakdown',
                    'Sprint timer with customizable durations (10–60 minutes)',
                    'Achievement badges: Fire Starter, Word Smith, Marathon Runner & more',
                ]}
                reverse={false}
            />

            {/* ═══════ FEATURE: BOOK LAUNCH PLANNER ═══════ */}
            <FeatureShowcase
                badge="Book Launch Planner"
                title={<>From Draft to<br /><span className="text-aurora-teal">Launch Day</span></>}
                description="A structured, 5-phase project plan that takes you from final revision through post-launch analytics. Every task has a status, assignee, due date, and category — so nothing slips through the cracks during the most critical period of your book's life."
                image={launchPlannerImg}
                features={[
                    'Five phases: Pre-Production → Production → Pre-Launch → Launch → Post-Launch',
                    'Click-to-cycle task status: To Do → In Progress → Done',
                    'Collapsible phase sections with mini progress bars',
                    'Task categories: editorial, design, marketing, distribution, community',
                    'Overall completion tracking with percentage ring',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ FEATURE: SUBMISSION TRACKER ═══════ */}
            <FeatureShowcase
                badge="Submission Tracker"
                title={<>Track Every Manuscript,<br /><span className="text-emerald-400">Every Step</span></>}
                description="A real-time visual pipeline showing exactly where each of your manuscripts stands — from submission to publication. No more wondering, no more lost emails. Connected directly to Firestore for live status updates."
                image={submissionTrackerImg}
                features={[
                    '6-stage pipeline: Submitted → Under Review → Revisions → Accepted → In Production → Published',
                    'Visual node-and-connector pipeline with clear progress indicators',
                    'Per-submission tracking with unique IDs and status descriptions',
                    'Quick actions: message editor, open in Forge for revisions',
                    'Real-time Firestore sync — your status updates automatically',
                ]}
                reverse={false}
                accent="emerald"
            />

            {/* ═══════ TOOLKIT GRID: ARC, ROYALTY, PROFILE, ONBOARDING ═══════ */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-4">More Tools</span>
                        <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide">
                            AND THAT'S NOT <span className="text-starforge-gold">ALL</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SubFeatureCard
                            image={arcManagerImg}
                            title="ARC Manager"
                            description="Distribute advance reader copies to hand-picked reviewers. Track who's reading, who's reviewed, and see star ratings and excerpts roll in — all from one dashboard."
                            icon={Send}
                        />
                        <SubFeatureCard
                            image={royaltyCalculatorImg}
                            title="Royalty Calculator"
                            description="Compare what you'd earn across Traditional Publishing, Self-Publishing, and Runa Atlas. Adjust format, price, and volume to see per-unit, monthly, and annual projections."
                            icon={DollarSign}
                        />
                        <SubFeatureCard
                            image={authorProfileImg}
                            title="Author Public Profile"
                            description="Your professional author page with cover image, stats bar, published works, reading order, upcoming events, and recent activity. Shareable with readers and the industry."
                            icon={UserCircle}
                        />
                        <SubFeatureCard
                            image={onboardingWizardImg}
                            title="Guided Onboarding"
                            description="A thoughtful 5-step setup wizard that captures your pen name, genres, writing style, goals, and preferences — personalizing the entire platform to your creative process."
                            icon={Rocket}
                        />
                        <SubFeatureCard
                            image={championsImg}
                            title="Community Champions"
                            description="Your most engaged readers get recognized. Founders Wall, gamified badges, review leaderboards, and archive weaver rankings — building a thriving fan community around your work."
                            icon={Trophy}
                        />
                        <SubFeatureCard
                            image={archiveImg}
                            title="Runeweave Archive"
                            description="Readers create glossaries, moodboards, playlists, and craft essays inspired by your worlds. A living gallery of community creativity that deepens engagement with your stories."
                            icon={Archive}
                        />
                        <SubFeatureCard
                            image={editorBridgeImg}
                            title="Deleted Scenes Vault"
                            description="Editorial cuts don't have to die. Archive deleted scenes and publish them as bonus content for fans. Turn the friction of 'kill your darlings' into reader engagement and exclusive subscriber material."
                            icon={Scissors}
                        />
                    </motion.div>
                </div>
            </section>

            {/* ═══════ PROCESS ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-starforge-gold/[0.02] to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-4">The Journey</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">
                            FROM MANUSCRIPT <span className="text-starforge-gold">TO MARKET</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-0">
                        {[
                            { step: '01', title: 'Submit', desc: 'Send us your manuscript through our streamlined portal. We review every submission personally — no algorithms, no gatekeeping by genre trends.', icon: Feather },
                            { step: '02', title: 'Collaborate', desc: 'Work with our editorial team using The Forge. Real-time comments, suggestion mode, and version tracking make the editorial process transparent and efficient.', icon: MessageSquare },
                            { step: '03', title: 'Prepare', desc: 'Professional cover design, formatting, metadata optimization, and distribution setup. We handle the production pipeline so you can focus on your next book.', icon: Layers },
                            { step: '04', title: 'Launch', desc: 'Coordinated release with marketing support, community activation through The Runeweave, beta reader reviews, and serialization options for maximum impact.', icon: Zap },
                            { step: '05', title: 'Grow', desc: 'Post-launch analytics, audience insights, reader engagement tools, and ongoing marketing support. We invest in your career, not just your current title.', icon: TrendingUp },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="flex gap-6 md:gap-10 items-start py-8 border-b border-white/[0.04] last:border-none group">
                                <div className="flex-none">
                                    <div className="w-14 h-14 rounded-full border border-starforge-gold/30 flex items-center justify-center group-hover:bg-starforge-gold/10 transition-colors">
                                        <span className="text-sm font-semibold text-starforge-gold">{item.step}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <item.icon className="w-4 h-4 text-starforge-gold/60" />
                                        <h3 className="text-xl text-white font-semibold">{item.title}</h3>
                                    </div>
                                    <p className="text-text-secondary text-sm leading-relaxed max-w-xl">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ WHAT SETS US APART ═══════ */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-aurora-teal/70 font-ui block mb-4">The Difference</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            WHY AUTHORS <span className="text-starforge-gold">CHOOSE US</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Traditional Publishing', items: ['12-18 month timelines', '8-15% royalties', 'No visibility into sales', 'Cookie-cutter marketing', 'Minimal author input on design'], bad: true },
                            { label: 'Runa Atlas', items: ['Weeks, not years', 'Industry-leading revenue splits', 'Real-time analytics dashboard', 'Community-powered marketing', 'Full creative control', 'Professional editorial support', 'AI-powered manuscript analytics', 'Built-in beta reader network'], highlight: true },
                            { label: 'Self-Publishing', items: ['DIY everything alone', 'Full revenue, zero support', 'No editorial feedback loop', 'Marketing is your problem', 'No community infrastructure'], bad: true },
                        ].map((col, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className={`p-8 rounded-lg border ${col.highlight ? 'bg-starforge-gold/[0.04] border-starforge-gold/30 ring-1 ring-starforge-gold/10' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                                {col.highlight && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <Crown className="w-4 h-4 text-starforge-gold" />
                                        <span className="text-[9px] uppercase tracking-widest text-starforge-gold font-semibold">Recommended</span>
                                    </div>
                                )}
                                <h3 className={`text-lg font-semibold mb-6 ${col.highlight ? 'text-starforge-gold' : 'text-white/60'}`}>{col.label}</h3>
                                <ul className="space-y-3">
                                    {col.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            {col.highlight ? (
                                                <Check className="w-4 h-4 text-starforge-gold flex-none mt-0.5" />
                                            ) : col.bad ? (
                                                <div className="w-4 h-4 flex-none mt-0.5 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                                </div>
                                            ) : null}
                                            <span className={col.highlight ? 'text-white' : 'text-white/40'}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ TESTIMONIALS ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aurora-teal/[0.015] to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-aurora-teal/70 font-ui block mb-4">Author Voices</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            FROM OUR <span className="text-starforge-gold">AUTHORS</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { quote: 'The Forge editor changed how I write. Having version history and collaboration tools built right in means I spend less time managing files and more time telling stories.', name: 'Elara Vance', title: 'Author of The Obsidian Crown' },
                            { quote: 'The beta reader hub gave me early feedback that completely transformed my third act. I could see exactly which passages resonated and which fell flat.', name: 'Jax Thorne', title: 'Author of Neon Requiem' },
                            { quote: 'Seeing my Audience Insights data was a revelation. I finally understood what my readers actually love about my writing, not just what I thought they loved.', name: 'Marina Solis', title: 'Author of Whispers of the Deep' },
                            { quote: 'The revenue transparency alone was worth switching. I know exactly what I earn, from where, in real time. No more waiting months for royalty statements.', name: 'Leo Vance', title: 'Author of Star-Crossed Circuits' },
                        ].map((t, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-starforge-gold/20 transition-colors">
                                <Quote className="w-6 h-6 text-starforge-gold/30 mb-4" />
                                <p className="text-sm text-white/80 leading-relaxed mb-6 italic">{t.quote}</p>
                                <div>
                                    <p className="text-sm text-white font-semibold">{t.name}</p>
                                    <p className="text-[11px] text-text-secondary">{t.title}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FAQ ═══════ */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide">
                            FREQUENTLY <span className="text-starforge-gold">ASKED</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-4">
                        {[
                            { q: 'What genres do you publish?', a: 'We prioritize speculative fiction, literary fiction, and genre-blending work — but we review every submission on its merits. Great writing transcends genre boundaries.' },
                            { q: 'What are your royalty rates?', a: 'We offer industry-leading revenue splits that vary by format and distribution channel. Full details are provided during our partnership discussion, and everything is visible in real-time in your Creator Studio dashboard.' },
                            { q: 'Do I retain my rights?', a: 'Yes. We believe in author-first contracts. You retain creative control and intellectual property rights. Our agreements are transparent and designed for long-term partnership, not lock-in.' },
                            { q: 'How long does the editorial process take?', a: 'Typically 4-8 weeks from manuscript acceptance to final edit, using our collaborative Forge editor. This is significantly faster than traditional publishing while maintaining professional editorial standards.' },
                            { q: 'Can I use the Creator Studio tools before being published?', a: 'Many of our tools are available to all authors on the platform, including writing analytics and the Forge editor. Full access to beta reader matching and audience insights unlocks when you publish with us.' },
                            { q: 'What marketing support do you provide?', a: 'Community activation through The Runeweave, constellation voting campaigns, Reader Circle placement, newsletter features, social media support, and data-driven marketing strategies tailored to your audience.' },
                        ].map((faq, idx) => (
                            <motion.details key={idx} variants={fadeUp}
                                className="group bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-starforge-gold/20 transition-colors">
                                <summary className="p-5 cursor-pointer flex items-center justify-between text-white hover:text-starforge-gold transition-colors font-semibold text-sm list-none">
                                    {faq.q}
                                    <ChevronDown className="w-4 h-4 text-text-secondary group-open:rotate-180 transition-transform flex-none ml-4" />
                                </summary>
                                <div className="px-5 pb-5 -mt-1">
                                    <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                                </div>
                            </motion.details>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ CTA ═══════ */}
            <section className="py-32 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-starforge-gold/[0.03] to-transparent" />
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-starforge-gold/10 mx-auto flex items-center justify-center mb-8">
                        <Scroll className="w-10 h-10 text-starforge-gold" />
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                        READY TO <span className="text-starforge-gold">BEGIN?</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
                        Every great story deserves a great home. Submit your manuscript today and discover what publishing can be.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/submissions" className="group px-10 py-4 bg-starforge-gold text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-starforge-gold/90 transition-all flex items-center gap-3">
                            Submit Your Manuscript <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/contact" className="px-10 py-4 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-starforge-gold/40 hover:text-starforge-gold transition-all">
                            Talk to Our Team
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}

// ═══ Feature Showcase Component ═══
function FeatureShowcase({ badge, title, description, image, features, reverse, accent = 'gold' }: {
    badge: string;
    title: React.ReactNode;
    description: string;
    image: string;
    features: string[];
    reverse: boolean;
    accent?: 'gold' | 'teal' | 'emerald';
}) {
    const accentColors = {
        gold: { badge: 'text-starforge-gold/70', check: 'text-starforge-gold', border: 'border-starforge-gold/30', glow: 'from-starforge-gold/10' },
        teal: { badge: 'text-aurora-teal/70', check: 'text-aurora-teal', border: 'border-aurora-teal/30', glow: 'from-aurora-teal/10' },
        emerald: { badge: 'text-emerald-400/70', check: 'text-emerald-400', border: 'border-emerald-400/30', glow: 'from-emerald-400/10' },
    };
    const colors = accentColors[accent];

    return (
        <section className="py-24 px-6 relative">
            <div className={`max-w-6xl mx-auto flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-16`}>
                {/* Text */}
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="flex-1">
                    <span className={`text-[10px] uppercase tracking-[0.3em] ${colors.badge} font-ui block mb-4`}>{badge}</span>
                    <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide mb-6 leading-tight">
                        {title}
                    </h2>
                    <p className="text-text-secondary leading-relaxed mb-8">{description}</p>
                    <ul className="space-y-3">
                        {features.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                                <Check className={`w-4 h-4 ${colors.check} flex-none mt-0.5`} />
                                {f}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Screenshot */}
                <motion.div
                    initial={{ opacity: 0, x: reverse ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    className="flex-1 relative group"
                >
                    <div className={`absolute -inset-4 bg-gradient-to-br ${colors.glow} to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl`} />
                    <div className={`relative rounded-lg border ${colors.border} overflow-hidden shadow-2xl shadow-black/40`}>
                        <img src={image} alt={badge} className="w-full h-auto" loading="lazy" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ═══ Sub-Feature Card ═══
function SubFeatureCard({ image, title, description, icon: Icon }: {
    image: string;
    title: string;
    description: string;
    icon: any;
}) {
    return (
        <motion.div variants={fadeUp}
            className="group bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-starforge-gold/20 transition-all duration-500">
            <div className="relative overflow-hidden">
                <img src={image} alt={title} className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-void-black/60 to-transparent" />
            </div>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded bg-starforge-gold/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-starforge-gold" />
                    </div>
                    <h3 className="text-lg text-white font-semibold">{title}</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}
