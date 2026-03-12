import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users, BookOpen, ArrowRight, ChevronDown, Check, Star, Heart,
    Sparkles, Eye, Zap, Shield, Award, MessageCircle, Clock,
    Crown, Quote, Layers, Globe, Lock, Target, BarChart3,
    Calendar, Bookmark, UserPlus, Settings, Hash
} from 'lucide-react';
import { useRef } from 'react';

// ═══════════════════════════════════════════
// FOR READER CIRCLES — SaaS-style feature showcase
// ═══════════════════════════════════════════

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } }
};

export default function ForReaderCircles() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <div className="bg-void-black text-white overflow-hidden">

            {/* ═══════ HERO ═══════ */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.04] via-transparent to-transparent" />
                    <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-violet-500/[0.03] rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-pink-500/[0.03] rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
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
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-violet-400/40" />
                            <span className="text-[11px] uppercase tracking-[0.3em] text-violet-400/80 font-ui">Reader Circles</span>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-violet-400/40" />
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white tracking-wider leading-[1.1] mb-8">
                            READ TOGETHER<br />
                            <span className="text-violet-400">GROW TOGETHER</span>
                        </h1>
                        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12 font-body">
                            Reader Circles are small, focused reading communities built for deep engagement — threaded discussions, shared annotations, synchronized reading, and virtual meetups with authors.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link to="/book-clubs" className="group px-8 py-4 bg-violet-400 text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-violet-300 transition-all flex items-center gap-3">
                                Browse Circles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#features" className="px-8 py-4 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-violet-400/40 hover:text-violet-400 transition-all">
                                Explore Features
                            </a>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-secondary/40">
                    <ChevronDown className="w-6 h-6" />
                </motion.div>
            </section>

            {/* ═══════ WHAT ARE READER CIRCLES ═══════ */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
                        <p className="text-2xl md:text-3xl text-white/80 font-body leading-relaxed italic">
                            "Not just a book club —<br className="hidden md:block" />
                            a{' '}
                            <span className="text-violet-400 not-italic font-semibold">reading community with real tools.</span>"
                        </p>
                        <p className="text-sm text-text-secondary mt-8 max-w-xl mx-auto">
                            Reader Circles go beyond the traditional book club model. They're intimate groups with built-in tools for
                            threaded discussions, progress tracking, passage sharing, meeting scheduling, and more — all centered around
                            speculative fiction by BIPOC and queer authors.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FEATURES GRID ═══════ */}
            <section id="features" className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-20">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400/70 font-ui block mb-4">Built for Deep Reading</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            EVERYTHING YOU NEED<br /><span className="text-violet-400">IN ONE CIRCLE</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Tools that transform passive reading into active community engagement.
                        </p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: MessageCircle, title: 'Threaded Discussions', desc: 'Start conversations with tags — spoilers, themes, questions, craft analysis. Every thread supports replies, reactions (🔥 ❤️ 🤯 💀 ✨ 📏), and pinning. Discuss without derailing.' },
                            { icon: BarChart3, title: 'Reading Progress', desc: 'Update your reading progress with a simple slider. See where everyone is at a glance — a visual group tracker shows the circle\'s collective pace with averaged progress.' },
                            { icon: Bookmark, title: 'Shared Highlights', desc: 'Save favorite passages with chapter/page markers and personal notes. React to each other\'s highlights. Build a collective gallery of the moments that moved your circle.' },
                            { icon: Calendar, title: 'Meeting Scheduler', desc: 'Schedule Discussion sessions, Buddy Reads, Author Q&As, and Social hangouts. Members RSVP with a single click. Meeting types are color-coded for quick scanning.' },
                            { icon: Users, title: 'Member Management', desc: 'See all members, their roles (Creator, Moderator, Member), and their activity. Private circles have a member approval system — the creator reviews and accepts join requests.' },
                            { icon: Hash, title: 'Genre & Pace Matching', desc: 'Circles are tagged by genre and reading pace (relaxed, steady, ambitious). Find circles that match your taste and tempo, or create one that\'s exactly what you need.' },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="group p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-violet-400/20 transition-all duration-500 hover:bg-white/[0.04]">
                                <div className="w-12 h-12 rounded-lg bg-violet-400/10 flex items-center justify-center mb-5 group-hover:bg-violet-400/20 transition-colors">
                                    <item.icon className="w-6 h-6 text-violet-400" />
                                </div>
                                <h3 className="text-lg text-white font-semibold mb-3">{item.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ PUBLIC vs PRIVATE ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400/70 font-ui block mb-4">Circle Types</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            PUBLIC vs. <span className="text-violet-400">PRIVATE</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: 'Public Circles',
                                icon: Globe,
                                items: [
                                    { label: 'Join', value: 'Instant — click and you\'re in' },
                                    { label: 'Visibility', value: 'Listed in search and browse' },
                                    { label: 'Best for', value: 'Open communities, newcomers, genre sampler groups' },
                                    { label: 'Moderation', value: 'Creator + moderators can pin and manage' },
                                ],
                                border: 'border-violet-400/20',
                                bg: 'bg-violet-400/[0.03]',
                                accent: 'text-violet-400',
                            },
                            {
                                title: 'Private Circles',
                                icon: Lock,
                                items: [
                                    { label: 'Join', value: 'Request → Creator approves or declines' },
                                    { label: 'Visibility', value: 'Listed but content hidden until approved' },
                                    { label: 'Best for', value: 'Tight-knit groups, spoiler-heavy reads, craft study' },
                                    { label: 'Moderation', value: 'Full member control — approve, reject, manage roles' },
                                ],
                                border: 'border-pink-400/20',
                                bg: 'bg-pink-400/[0.03]',
                                accent: 'text-pink-400',
                            },
                        ].map((col, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className={`p-8 rounded-xl border ${col.border} ${col.bg}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-lg ${idx === 0 ? 'bg-violet-400/10' : 'bg-pink-400/10'} flex items-center justify-center`}>
                                        <col.icon className={`w-5 h-5 ${col.accent}`} />
                                    </div>
                                    <h3 className={`text-lg font-semibold ${col.accent}`}>{col.title}</h3>
                                </div>
                                <div className="space-y-4">
                                    {col.items.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <span className="text-[10px] uppercase tracking-wider text-text-secondary w-20 flex-none mt-0.5">{item.label}</span>
                                            <span className="text-sm text-white/80">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ HOW IT WORKS ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400/70 font-ui block mb-4">Getting Started</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">
                            THREE WAYS TO <span className="text-violet-400">JOIN IN</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01', title: 'Browse & Join', icon: Eye,
                                desc: 'Search existing circles by genre, name, or reading pace. Public circles let you join instantly. Private ones send a request to the creator.',
                                details: ['Filter by genre, visibility, and pace', 'See member count and current book', 'Join public circles with one click'],
                            },
                            {
                                step: '02', title: 'Create Your Own', icon: Sparkles,
                                desc: 'Start a new circle in 30 seconds. Name it, pick a genre and pace, set visibility, add a cover emoji, and set your current read.',
                                details: ['Choose public or private', 'Set the reading pace', 'Pick a cover emoji and genre', 'You become the circle creator'],
                            },
                            {
                                step: '03', title: 'Engage & Grow', icon: Heart,
                                desc: 'Once you\'re in, dive into discussions, track progress together, highlight passages, and schedule meetups. The tools are built in — just use them.',
                                details: ['Start threaded discussions', 'Share reading highlights', 'Schedule meetings with RSVP', 'Track collective progress'],
                            },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-violet-400/20 transition-colors">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full border border-violet-400/30 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-violet-400">{item.step}</span>
                                    </div>
                                    <h3 className="text-lg text-white font-semibold">{item.title}</h3>
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed mb-5">{item.desc}</p>
                                <ul className="space-y-2">
                                    {item.details.map((d, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-white/60">
                                            <Check className="w-3.5 h-3.5 text-violet-400 flex-none" /> {d}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ MEMBER ROLES ═══════ */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400/70 font-ui block mb-4">Circle Roles</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            WHO DOES <span className="text-violet-400">WHAT</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                role: 'Creator', icon: Crown, accent: 'text-starforge-gold', bg: 'bg-starforge-gold/10',
                                perms: ['Full circle management', 'Approve/reject join requests', 'Promote members to moderator', 'Pin and manage all discussions', 'Schedule and manage meetings', 'Edit circle details and settings']
                            },
                            {
                                role: 'Moderator', icon: Shield, accent: 'text-violet-400', bg: 'bg-violet-400/10',
                                perms: ['Pin important discussions', 'Manage discussion threads', 'Help approve join requests', 'Schedule meetings', 'Visible moderator badge']
                            },
                            {
                                role: 'Member', icon: Users, accent: 'text-cyan-400', bg: 'bg-cyan-400/10',
                                perms: ['Join discussions and reply', 'React to posts and highlights', 'Update reading progress', 'Share passage highlights', 'RSVP to meetings']
                            },
                        ].map((r, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-violet-400/10 transition-colors">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`w-10 h-10 rounded-lg ${r.bg} flex items-center justify-center`}>
                                        <r.icon className={`w-5 h-5 ${r.accent}`} />
                                    </div>
                                    <h3 className={`text-lg font-semibold ${r.accent}`}>{r.role}</h3>
                                </div>
                                <ul className="space-y-2">
                                    {r.perms.map((p, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-white/70">
                                            <Check className="w-3 h-3 text-white/20 flex-none" /> {p}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ BEST FOR ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.015] to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400/70 font-ui block mb-4">Use Cases</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            READER CIRCLES ARE <span className="text-violet-400">BUILT FOR</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { emoji: '📚', title: 'Book Clubs', desc: 'Classic book club format with better tools. Pick a book, discuss chapters, track progress together, and schedule meetings. The genre filter ensures everyone\'s on the same page — literally.' },
                            { emoji: '👥', title: 'Buddy Reads', desc: 'Reading the same book with a friend or small group? Create a private circle, sync your progress, and share highlights as you go. More intimate than a big club, more structured than a group chat.' },
                            { emoji: '🔍', title: 'Craft Study Groups', desc: 'Writers and serious readers analyzing a book\'s craft — prose, structure, worldbuilding, character arcs. Use the highlights feature to save passages and the discussion tags to organize analysis by topic.' },
                            { emoji: '✍️', title: 'Author Q&As', desc: 'Authors can create circles for their books and host discussions with readers. Schedule live Q&A meetings, respond to highlights, and engage directly with the people reading your work.' },
                            { emoji: '🌍', title: 'Genre Communities', desc: 'Create a circle around a genre — Afrofuturism, gothic horror, solarpunk — and read through key titles together. Build a reading community around shared taste with ongoing conversation.' },
                            { emoji: '🏆', title: 'Reading Challenges', desc: 'Set an ambitious pace, pick a reading list, and tackle it together. Track everyone\'s progress, hold each other accountable, and celebrate milestones as a group.' },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="flex items-start gap-4 p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-violet-400/20 transition-colors">
                                <span className="text-3xl flex-none">{item.emoji}</span>
                                <div>
                                    <h3 className="text-sm text-white font-semibold mb-2">{item.title}</h3>
                                    <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ TESTIMONIALS ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400/70 font-ui block mb-4">Circle Stories</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            FROM OUR <span className="text-violet-400">COMMUNITY</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { quote: 'Our Afrofuturism circle has been meeting for three months now. The shared highlights feature is incredible — we\'ve built this collective gallery of passages that hit us hardest. It\'s become a reading journal for the whole group.', name: 'Amara Osei', title: 'Afrofuturism Circle · 8 members' },
                            { quote: 'I started a private buddy read with two friends for a gothic horror novel. Being able to track each other\'s progress and share annotations in real-time made it feel like we were reading together even though we\'re in different countries.', name: 'Suki Park', title: 'Gothic Horror Buddy Read · 3 members' },
                            { quote: 'As an author, creating a Reader Circle for my debut was a game-changer. I could see readers\' reactions in real time, respond to their highlights, and schedule a launch day Q&A — all in one place. Way better than a Discord server.', name: 'Diego Vargas', title: 'Author Circle creator · 24 members' },
                            { quote: 'The meeting scheduler is what sold me. Our circle does monthly discussions and we all RSVP right in the app. No more "when works for everyone?" group texts. Just schedule, RSVP, show up.', name: 'Riley Chen', title: 'Romantasy Circle · 12 members' },
                        ].map((t, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-violet-400/20 transition-colors">
                                <Quote className="w-6 h-6 text-violet-400/30 mb-4" />
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
                            FREQUENTLY <span className="text-violet-400">ASKED</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-4">
                        {[
                            { q: 'Do I need to apply to join a Reader Circle?', a: 'No application required! Unlike Beta and ARC programs, Reader Circles are open to all members. Public circles let you join instantly, while private circles require the creator to approve your request — but there\'s no formal application process.' },
                            { q: 'How many circles can I join?', a: 'As many as you like. We recommend starting with 1-2 to find your rhythm, then expanding. You can also create your own circles whenever inspiration strikes.' },
                            { q: 'Can I create a private circle just for friends?', a: 'Absolutely. When creating a circle, set visibility to "Private." Only people you approve will be able to join and see the circle\'s content. It\'s perfect for buddy reads and tight-knit groups.' },
                            { q: 'Do circles have to read Runa Atlas books?', a: 'There\'s no such restriction. Reader Circles can discuss any book. We encourage reading broadly, though we hope you\'ll discover some amazing titles from our catalog along the way.' },
                            { q: 'What\'s the difference between a discussion and a highlight?', a: 'Discussions are conversation threads — think forum posts with replies and reactions. Highlights are specific passages you\'ve saved while reading, with optional notes. Discussions are for conversation; highlights are for collecting moments.' },
                            { q: 'Can authors join Reader Circles?', a: 'Yes! Authors can join existing circles or create their own for their books. It\'s a great way to connect directly with readers, host Q&As, and see which passages resonated most.' },
                            { q: 'How do meetings work?', a: 'Any circle member can schedule a meeting with a type (Discussion, Buddy Read, Author Q&A, Social), date, and description. Other members RSVP with one click. Meeting types are color-coded for easy scanning.' },
                            { q: 'Is Reader Circles different from Beta Reading and ARC?', a: 'Yes — completely different. Beta readers provide confidential feedback on unfinished manuscripts. ARC readers post public reviews for launch support. Reader Circles are community reading groups with no obligations beyond showing up and engaging. You can participate in all three.' },
                        ].map((faq, idx) => (
                            <motion.details key={idx} variants={fadeUp}
                                className="group bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-violet-400/20 transition-colors">
                                <summary className="p-5 cursor-pointer flex items-center justify-between text-white hover:text-violet-400 transition-colors font-semibold text-sm list-none">
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-400/[0.03] to-transparent" />
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-violet-400/10 mx-auto flex items-center justify-center mb-8">
                        <Users className="w-10 h-10 text-violet-400" />
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                        FIND YOUR <span className="text-violet-400">CIRCLE</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
                        Browse existing circles, join a community that matches your taste, or start a new one in 30 seconds.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/book-clubs" className="group px-10 py-4 bg-violet-400 text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-violet-300 transition-all flex items-center gap-3">
                            Browse Reader Circles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/for-beta-readers" className="px-10 py-4 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-amber-400/40 hover:text-amber-400 transition-all">
                            Learn About Beta Reading
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
