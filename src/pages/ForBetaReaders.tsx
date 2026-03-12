import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BookOpen, ArrowRight, ChevronDown, Check, Star, Heart, Sparkles,
    Eye, Zap, Users, Shield, Award, MessageCircle, Clock, Target,
    Crown, Quote, BarChart3, FileText, Flame, TrendingUp,
    Bookmark, Edit3, Send, Layers, Lock, Gift
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import betaQueueImg from '../assets/features/beta-queue.webp';
import betaFeedbackImg from '../assets/features/beta-feedback.webp';
import betaStatsImg from '../assets/features/beta-stats.webp';

// ═══════════════════════════════════════════
// FOR BETA READERS — SaaS-style feature showcase
// ═══════════════════════════════════════════

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } }
};

export default function ForBetaReaders() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    const [heroSubtitle, setHeroSubtitle] = useState(
        "Beta readers are the first eyes on a manuscript — and Runa Atlas gives you the tools, access, and recognition you deserve. Shape stories before they ship. Get credited. Build your reputation."
    );

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'page_configs', 'for-beta-readers'), (snap) => {
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
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.04] via-transparent to-transparent" />
                    <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-aurora-teal/[0.03] rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
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
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/40" />
                            <span className="text-[11px] uppercase tracking-[0.3em] text-amber-400/80 font-ui">For Beta Readers</span>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/40" />
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white tracking-wider leading-[1.1] mb-8">
                            READ IT<br />
                            <span className="text-amber-400">BEFORE THE WORLD</span>
                        </h1>
                        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12 font-body">
                            {heroSubtitle}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link to="/beta-reader-apply" className="group px-8 py-4 bg-amber-400 text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-amber-300 transition-all flex items-center gap-3">
                                Open Beta Reader Hub <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#how-it-works" className="px-8 py-4 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-amber-400/40 hover:text-amber-400 transition-all">
                                See How It Works
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
                            "Most publishers treat beta readers as free labor.<br className="hidden md:block" />
                            We built a platform where you're a{' '}
                            <span className="text-amber-400 not-italic font-semibold">valued partner.</span>"
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ WHAT YOU GET ═══════ */}
            <section id="how-it-works" className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-20">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 font-ui block mb-4">Why Beta Read With Us</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            NOT A FAVOR.<br /><span className="text-amber-400">A ROLE.</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Beta reading at Runa Atlas is structured, rewarded, and respected. Here's what makes it different.
                        </p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: FileText, title: 'Manuscript Queue', desc: 'Your personal dashboard of active assignments. See deadlines, chapter progress, and feedback requirements at a glance. No more emailed PDFs or lost Google Docs.' },
                            { icon: MessageCircle, title: 'Structured Feedback', desc: 'Categorized feedback tools for character, pacing, plot, prose, and worldbuilding. Authors see organized insights, not wall-of-text emails.' },
                            { icon: Award, title: 'Tier Progression', desc: 'Start as a New Reader. Earn Trusted, Elite, and Inner Circle status through quality feedback. Higher tiers mean first-look access and acknowledgment credits.' },
                            { icon: Shield, title: 'NDA Protection', desc: 'Every manuscript is under NDA by default. Your feedback and the content you read are protected — authors trust this platform because we enforce confidentiality.' },
                            { icon: BookOpen, title: 'In-Platform Reading', desc: 'Read manuscripts directly in our reader with the same tools available for published books — highlights, reactions, and chapter navigation built in.' },
                            { icon: Star, title: 'Recognition & Credit', desc: 'Get acknowledged in published books. Earn badges, streaks, and community reputation. Your name goes in the acknowledgments — not just a footnote.' },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="group p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-amber-400/20 transition-all duration-500 hover:bg-white/[0.04]">
                                <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center mb-5 group-hover:bg-amber-400/20 transition-colors">
                                    <item.icon className="w-6 h-6 text-amber-400" />
                                </div>
                                <h3 className="text-lg text-white font-semibold mb-3">{item.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ SECTION HEADER: THE PLATFORM ═══════ */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 font-ui block mb-4">The Platform</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            EVERY TOOL,<br /><span className="text-amber-400">UP CLOSE</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto mb-4">
                            Here's exactly what you get inside the Beta Reader Hub. These aren't mockups — they're the real platform.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FEATURE 1: MANUSCRIPT QUEUE ═══════ */}
            <FeatureShowcase
                badge="Manuscript Queue"
                title={<>Your Reading<br /><span className="text-amber-400">Assignments, Organized</span></>}
                description="No more tracking manuscripts in spreadsheets. Your queue shows every active assignment with cover art, author info, deadline countdown, chapter progress bars, and feedback completion status — all in one expandable card."
                image={betaQueueImg}
                features={[
                    'Expandable manuscript cards with full synopses and tag labels',
                    'Progress bars for chapters read and feedback notes submitted',
                    'Deadline countdown with overdue alerts and priority indicators',
                    'Filter by status: active, overdue, completed, or all',
                    'One-click access to continue reading or message the author',
                ]}
                reverse={false}
                accent="amber"
            />

            {/* ═══════ FEATURE 2: STRUCTURED FEEDBACK ═══════ */}
            <FeatureShowcase
                badge="Structured Feedback"
                title={<>Feedback That<br /><span className="text-aurora-teal">Authors Actually Use</span></>}
                description="Categorize every piece of feedback by type — character, pacing, plot, prose, worldbuilding, or overall impression. Authors receive organized, actionable insights instead of long emails they'll never parse. Plus, see when they respond to your notes."
                image={betaFeedbackImg}
                features={[
                    'Six feedback categories with color-coded icons',
                    'Chapter-specific notes with timestamps and threading',
                    'Author response notifications — see when they reply',
                    'Full feedback history across all manuscripts you\'ve read',
                    'Feedback quality rating that contributes to tier progression',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ FEATURE 3: TIER SYSTEM ═══════ */}
            <FeatureShowcase
                badge="Tier Progression"
                title={<>Level Up Your<br /><span className="text-amber-400">Reader Reputation</span></>}
                description="Beta reading at Runa Atlas isn't a one-off favor — it's a career in community literary support. Progress through four tiers, each with expanding privileges: from basic manuscript access to editorial meeting observer status and named dedications."
                image={betaStatsImg}
                features={[
                    'New Reader → Trusted Reader → Elite Reviewer → Inner Circle',
                    'Tracked stats: manuscripts read, feedback given, author ratings',
                    'Trusted tier unlocks priority access and direct author messaging',
                    'Elite tier earns acknowledgment credits in published books',
                    'Inner Circle tier: editorial access, summit invites, veto power',
                ]}
                reverse={false}
                accent="amber"
            />

            {/* ═══════ FEATURE 4: READING & ANNOTATIONS ═══════ */}
            <FeatureShowcase
                badge="In-Platform Reading"
                title={<>Read Manuscripts<br /><span className="text-aurora-teal">With Real Tools</span></>}
                description="No more downloading PDFs or tracking changes in Google Docs. Read manuscripts directly in the same reader used for published books — with highlights, emoji reactions, chapter navigation, and annotation tools purpose-built for beta feedback."
                image={betaQueueImg}
                features={[
                    'Full immersive reader with dark, sepia, and light themes',
                    'Paragraph-level highlighting with inline feedback notes',
                    'Emoji reactions on individual sentences and passages',
                    'Chapter navigation with bookmarking and progress sync',
                    'NDA badge visible throughout — content is always protected',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ FEATURE 5: AUTHOR RELATIONSHIP ═══════ */}
            <FeatureShowcase
                badge="Author Connection"
                title={<>Direct Access to<br /><span className="text-amber-400">the Authors You Help</span></>}
                description="Beta reading creates a real relationship with the author. Message them directly about plot questions, receive personalized responses to your feedback, and see your name in their acknowledgments when the book ships."
                image={betaFeedbackImg}
                features={[
                    'In-context author responses on individual feedback notes',
                    'Direct messaging with authors of manuscripts you\'re reading',
                    'Acknowledgment credits in published books for significant feedback',
                    'Priority invitations for future manuscripts from same author',
                    'Post-publication reveal: see the final version with your changes',
                ]}
                reverse={false}
                accent="amber"
            />

            {/* ═══════ HOW IT WORKS JOURNEY ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 font-ui block mb-4">Your Journey</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">
                            FROM READER TO <span className="text-amber-400">INNER CIRCLE</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-0">
                        {[
                            { step: '01', title: 'Apply', desc: 'Complete your beta reader profile. Tell us about your reading preferences, genre expertise, and feedback style. Applications are reviewed within 48 hours.', icon: Edit3 },
                            { step: '02', title: 'Get Matched', desc: 'Our matching system pairs you with manuscripts that fit your taste DNA. No cold assignments — you read what genuinely interests you.', icon: Target },
                            { step: '03', title: 'Read & Annotate', desc: 'Read manuscripts in our immersive reader with built-in annotation tools. Highlight passages, leave emoji reactions, and submit structured feedback by category.', icon: BookOpen },
                            { step: '04', title: 'Submit Feedback', desc: 'Organize your thoughts into six feedback categories. Authors receive a clean, actionable report — not a messy email thread.', icon: Send },
                            { step: '05', title: 'Level Up', desc: 'Quality feedback earns you tier progression. Unlock priority access, acknowledgment credits, and eventually Inner Circle privileges.', icon: TrendingUp },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="flex gap-6 md:gap-10 items-start py-8 border-b border-white/[0.04] last:border-none group">
                                <div className="flex-none">
                                    <div className="w-14 h-14 rounded-full border border-amber-400/30 flex items-center justify-center group-hover:bg-amber-400/10 transition-colors">
                                        <span className="text-sm font-semibold text-amber-400">{item.step}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <item.icon className="w-4 h-4 text-amber-400/60" />
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
                        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 font-ui block mb-4">The Difference</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            WHY BETA READERS <span className="text-amber-400">CHOOSE US</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Email / Google Docs', items: ['PDFs and Word docs emailed back and forth', 'No tracking, no deadlines, no structure', 'Feedback gets lost in threads', 'No recognition or acknowledgment', 'Zero progression or reputation building'], bad: true },
                            { label: 'Runa Atlas', items: ['Dedicated manuscript queue with progress tracking', 'Structured feedback in six organized categories', 'In-platform reader with annotations and reactions', 'Author responses directly on your feedback', 'Four-tier progression system with real perks', 'Acknowledgment credits in published books', 'NDA protection and confidentiality enforcement', 'Taste-based manuscript matching via Book DNA'], highlight: true },
                            { label: 'Other Platforms', items: ['Basic forums with no reading tools', 'Unstructured feedback with no categories', 'No author interaction or responses', 'No reward system or progression', 'No confidentiality guarantees'], bad: true },
                        ].map((col, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className={`p-8 rounded-lg border ${col.highlight ? 'bg-amber-400/[0.04] border-amber-400/30 ring-1 ring-amber-400/10' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                                {col.highlight && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <Crown className="w-4 h-4 text-amber-400" />
                                        <span className="text-[9px] uppercase tracking-widest text-amber-400 font-semibold">The Full Package</span>
                                    </div>
                                )}
                                <h3 className={`text-lg font-semibold mb-6 ${col.highlight ? 'text-amber-400' : 'text-white/60'}`}>{col.label}</h3>
                                <ul className="space-y-3">
                                    {col.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            {col.highlight ? (
                                                <Check className="w-4 h-4 text-amber-400 flex-none mt-0.5" />
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

            {/* ═══════ TIER BREAKDOWN ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.015] to-transparent" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 font-ui block mb-4">Tier System</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            THE <span className="text-amber-400">PROGRESSION</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { tier: 'New Reader', icon: BookOpen, color: 'text-white/40 border-white/10', bg: 'bg-white/[0.02]', perks: ['Access to open manuscripts', 'Basic feedback tools', 'Community forums'] },
                            { tier: 'Trusted Reader', icon: Shield, color: 'text-amber-400/60 border-amber-400/20', bg: 'bg-amber-400/[0.03]', perks: ['Priority manuscript access', 'Direct author messaging', 'Feedback analytics', 'Reader streak badges'] },
                            { tier: 'Elite Reviewer', icon: Award, color: 'text-amber-400 border-amber-400/30', bg: 'bg-amber-400/[0.05]', perks: ['First-look at new acquisitions', 'Author acknowledgment credits', 'Exclusive beta reader events', 'Advanced feedback templates'] },
                            { tier: 'Inner Circle', icon: Crown, color: 'text-amber-300 border-amber-300/40', bg: 'bg-amber-300/[0.06]', perks: ['Manuscript champion / veto power', 'Editorial meeting observer access', 'Named dedication opportunities', 'Annual beta reader summit invite'] },
                        ].map((t, idx) => {
                            const Icon = t.icon;
                            return (
                                <motion.div key={t.tier} variants={fadeUp}
                                    className={`p-6 rounded-xl border ${t.color} ${t.bg}`}>
                                    <Icon className={`w-8 h-8 ${t.color.split(' ')[0]} mb-4`} />
                                    <h3 className={`text-lg font-semibold mb-4 ${t.color.split(' ')[0]}`}>{t.tier}</h3>
                                    <ul className="space-y-2">
                                        {t.perks.map(p => (
                                            <li key={p} className="text-xs text-text-secondary flex items-start gap-2">
                                                <Check className="w-3 h-3 flex-none mt-0.5 text-amber-400/40" /> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ TESTIMONIALS ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 font-ui block mb-4">Beta Reader Voices</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            FROM OUR <span className="text-amber-400">BETA READERS</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { quote: 'I\'ve beta read for three authors on Runa Atlas and my name is in two published acknowledgments. The structured feedback tools mean my notes actually get used — not buried in an email.', name: 'Taylor Park', title: 'Trusted Reader · 6 manuscripts' },
                            { quote: 'The tier system gave me a reason to keep going. I went from New Reader to Elite in eight months, and now I get first-look at every dark fantasy manuscript. It feels like a real role, not a favor.', name: 'Lena Ortega', title: 'Elite Reviewer · 12 manuscripts' },
                            { quote: 'Being matched to manuscripts based on my Book DNA was genius. Every assignment I get feels like something I\'d actually buy. I\'m not reading out of obligation — I\'m genuinely invested.', name: 'Marcus Chen', title: 'Trusted Reader · 4 manuscripts' },
                            { quote: 'When Elara Vance personally responded to my feedback on Chapter 14 of Wrath & Reverie and said she was rewriting that scene based on my notes... that was the moment I knew this platform was different.', name: 'Nia Blackwood', title: 'Inner Circle · 18 manuscripts' },
                        ].map((t, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-amber-400/20 transition-colors">
                                <Quote className="w-6 h-6 text-amber-400/30 mb-4" />
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
                            FREQUENTLY <span className="text-amber-400">ASKED</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-4">
                        {[
                            { q: 'How do I become a beta reader?', a: 'Create a reader account, complete your taste profile (Book DNA), and apply through the Beta Reader Hub. We review applications within 48 hours based on your reading history and genre preferences.' },
                            { q: 'Do I get paid for beta reading?', a: 'Beta reading at Runa Atlas is a volunteer role with real perks: tier progression, acknowledgment credits in published books, exclusive events, and priority access to new manuscripts. We believe in recognition over transactional payment.' },
                            { q: 'How many manuscripts will I need to read?', a: 'There\'s no minimum requirement. You choose which assignments to accept from your matched queue. Most beta readers handle 1-3 manuscripts at a time, with flexible deadlines negotiated with the author.' },
                            { q: 'Can I decline a manuscript?', a: 'Absolutely. You\'re never forced to accept an assignment. If a manuscript doesn\'t interest you after the synopsis, decline it and it goes to the next matched reader.' },
                            { q: 'What does NDA protection mean?', a: 'Every manuscript is automatically covered by our platform NDA. You agree not to share content, screenshots, or details about unpublished manuscripts. This protects both authors and readers.' },
                            { q: 'What is the Inner Circle tier?', a: 'The highest beta reader tier. Inner Circle members can champion or soft-veto manuscripts in consideration, observe editorial meetings, receive named dedication opportunities, and attend the annual beta reader summit. It requires exceptional feedback quality and volume.' },
                        ].map((faq, idx) => (
                            <motion.details key={idx} variants={fadeUp}
                                className="group bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-amber-400/20 transition-colors">
                                <summary className="p-5 cursor-pointer flex items-center justify-between text-white hover:text-amber-400 transition-colors font-semibold text-sm list-none">
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/[0.03] to-transparent" />
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-amber-400/10 mx-auto flex items-center justify-center mb-8">
                        <BookOpen className="w-10 h-10 text-amber-400" />
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                        READY TO READ <span className="text-amber-400">FIRST?</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
                        Join the beta reader program, start reading manuscripts before anyone else, and help shape the stories that ship.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/beta-reader-apply" className="group px-10 py-4 bg-amber-400 text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-amber-300 transition-all flex items-center gap-3">
                            Open Beta Reader Hub <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/for-readers" className="px-10 py-4 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-amber-400/40 hover:text-amber-400 transition-all">
                            For General Readers
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}

// ═══ Feature Showcase Component ═══
function FeatureShowcase({ badge, title, description, image, features, reverse, accent = 'amber' }: {
    badge: string;
    title: React.ReactNode;
    description: string;
    image: string;
    features: string[];
    reverse: boolean;
    accent?: 'amber' | 'teal' | 'emerald';
}) {
    const accentColors = {
        amber: { badge: 'text-amber-400/70', check: 'text-amber-400', border: 'border-amber-400/30', glow: 'from-amber-400/10' },
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
