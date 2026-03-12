import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BookOpen, ArrowRight, ChevronDown, Check, Star, Heart, Sparkles,
    Eye, Zap, Users, Shield, Award, MessageCircle, Clock, Target,
    Crown, Quote, Gift, Send, Megaphone, BarChart3,
    Globe, ThumbsUp, Calendar, FileText, Layers
} from 'lucide-react';
import { useRef } from 'react';

// ═══════════════════════════════════════════
// FOR ARC READERS — SaaS-style feature showcase
// ═══════════════════════════════════════════

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } }
};

export default function ForARCReaders() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <div className="bg-void-black text-white overflow-hidden">

            {/* ═══════ HERO ═══════ */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.04] via-transparent to-transparent" />
                    <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-starforge-gold/[0.03] rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
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
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-400/40" />
                            <span className="text-[11px] uppercase tracking-[0.3em] text-emerald-400/80 font-ui">For ARC Readers</span>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-400/40" />
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white tracking-wider leading-[1.1] mb-8">
                            REVIEW IT<br />
                            <span className="text-emerald-400">BEFORE LAUNCH</span>
                        </h1>
                        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12 font-body">
                            ARC readers are the launch day amplifiers — you get early copies of upcoming releases, read them before anyone else, and post reviews that put marginalized voices on the map.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link to="/arc-apply" className="group px-8 py-4 bg-emerald-400 text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-emerald-300 transition-all flex items-center gap-3">
                                Apply to ARC Program <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#how-it-works" className="px-8 py-4 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-emerald-400/40 hover:text-emerald-400 transition-all">
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

            {/* ═══════ WHAT IS ARC ═══════ */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
                        <p className="text-2xl md:text-3xl text-white/80 font-body leading-relaxed italic">
                            "Beta readers shape the story during development.<br className="hidden md:block" />
                            ARC readers{' '}
                            <span className="text-emerald-400 not-italic font-semibold">launch it into the world.</span>"
                        </p>
                        <p className="text-sm text-text-secondary mt-8 max-w-xl mx-auto">
                            ARC stands for <strong className="text-white">Advance Reader Copy</strong>. You receive finished or near-finished books weeks before publication.
                            In exchange, you post honest reviews on launch day (or close to it), helping books from marginalized authors gain the visibility they deserve.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ WHAT YOU GET ═══════ */}
            <section id="how-it-works" className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-20">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/70 font-ui block mb-4">Why Join the ARC Program</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            READ EARLY.<br /><span className="text-emerald-400">REVIEW HONESTLY.</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            ARC readers at Runa Atlas aren't just reviewers — you're launch day allies for stories by BIPOC and queer authors.
                        </p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Gift, title: 'Free Advance Copies', desc: 'Receive finished books 2-6 weeks before publication in your preferred format — ePub, PDF, MOBI, or physical ARCs. No purchase required, ever.' },
                            { icon: Clock, title: 'First-Look Access', desc: 'You read it before the world does. ARC copies are near-final editions with cover art, formatting, and bonus content. The real reading experience, early.' },
                            { icon: Megaphone, title: 'Amplify Marginalized Voices', desc: 'Your reviews on Amazon, Goodreads, and social media directly impact launch day visibility for BIPOC and queer authors. This is advocacy in action.' },
                            { icon: Globe, title: 'Multi-Platform Support', desc: 'Post reviews wherever you have a presence — Amazon, Goodreads, StoryGraph, BookTok, Bookstagram, blogs, podcasts, BookTube. All formats count.' },
                            { icon: Shield, title: 'No Sales Pressure', desc: 'We never require positive reviews. We ask for honest ones. FTC-compliant disclosure language is provided. Your integrity is non-negotiable.' },
                            { icon: Award, title: 'Reviewer Recognition', desc: 'Consistent, quality reviewers earn priority access to future ARCs, invitation to exclusive author Q&As, and a spot on our Reviewer Honor Roll.' },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="group p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-emerald-400/20 transition-all duration-500 hover:bg-white/[0.04]">
                                <div className="w-12 h-12 rounded-lg bg-emerald-400/10 flex items-center justify-center mb-5 group-hover:bg-emerald-400/20 transition-colors">
                                    <item.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-lg text-white font-semibold mb-3">{item.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ BETA vs ARC COMPARISON ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/70 font-ui block mb-4">The Difference</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            BETA vs. <span className="text-emerald-400">ARC</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                title: 'Beta Readers',
                                color: 'amber',
                                icon: Eye,
                                items: [
                                    { label: 'When', value: 'During development — drafts & revisions' },
                                    { label: 'Purpose', value: 'Shape the story with feedback' },
                                    { label: 'What you get', value: 'Unfinished manuscripts' },
                                    { label: 'Output', value: 'Structured feedback to the author' },
                                    { label: 'Public', value: 'No — confidential under NDA' },
                                    { label: 'Best for', value: 'People who love analyzing craft' },
                                ],
                                border: 'border-amber-400/20',
                                bg: 'bg-amber-400/[0.03]',
                                accent: 'text-amber-400',
                            },
                            {
                                title: 'ARC Readers',
                                color: 'emerald',
                                icon: Megaphone,
                                items: [
                                    { label: 'When', value: 'Pre-launch — finished or near-final' },
                                    { label: 'Purpose', value: 'Launch day reviews & visibility' },
                                    { label: 'What you get', value: 'Finished books with cover art' },
                                    { label: 'Output', value: 'Public reviews on platforms' },
                                    { label: 'Public', value: 'Yes — reviews are your voice' },
                                    { label: 'Best for', value: 'Avid reviewers & content creators' },
                                ],
                                border: 'border-emerald-400/30',
                                bg: 'bg-emerald-400/[0.04]',
                                accent: 'text-emerald-400',
                                highlight: true,
                            },
                        ].map((col, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className={`p-8 rounded-xl border ${col.border} ${col.bg} ${col.highlight ? 'ring-1 ring-emerald-400/10' : ''}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-lg ${col.highlight ? 'bg-emerald-400/10' : 'bg-amber-400/10'} flex items-center justify-center`}>
                                        <col.icon className={`w-5 h-5 ${col.accent}`} />
                                    </div>
                                    <h3 className={`text-lg font-semibold ${col.accent}`}>{col.title}</h3>
                                    {col.highlight && (
                                        <span className="text-[8px] uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-semibold ml-auto">This Program</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {col.items.map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <span className="text-[10px] uppercase tracking-wider text-text-secondary w-16 flex-none mt-0.5">{item.label}</span>
                                            <span className="text-sm text-white/80">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center text-sm text-text-secondary mt-8">
                        You can be both! Many of our best community members participate in both programs.
                    </motion.p>
                </div>
            </section>

            {/* ═══════ HOW IT WORKS ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/70 font-ui block mb-4">Your Journey</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">
                            FROM APPLICATION TO <span className="text-emerald-400">LAUNCH DAY</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-0">
                        {[
                            { step: '01', title: 'Apply', desc: 'Tell us about your reading preferences, review platforms, and posting frequency. We review applications within 72 hours. Active reviewers with established profiles are prioritized.', icon: FileText },
                            { step: '02', title: 'Get Approved', desc: 'Once accepted, you\'re added to the ARC roster. You\'ll start receiving notifications when new titles match your genre preferences. No obligations until you accept a copy.', icon: Check },
                            { step: '03', title: 'Receive Your ARC', desc: 'Choose your preferred format (ePub, PDF, MOBI, or physical). ARCs arrive 2-6 weeks before the publication date. Each comes with a suggested review timeline and FTC disclosure language.', icon: Gift },
                            { step: '04', title: 'Read & Prepare', desc: 'Read the book at your own pace within the review window. Take notes, flag your favorite passages, and prepare your honest assessment. Both positive and critical reviews are valued equally.', icon: BookOpen },
                            { step: '05', title: 'Post Your Review', desc: 'Publish your review on your platforms on or around launch day. Cross-post to maximize impact. Include the FTC disclosure. Share on social media with relevant hashtags and tags.', icon: Send },
                            { step: '06', title: 'Build Your Reputation', desc: 'Consistent, quality reviews earn you priority ARC access, exclusive author events, and Reviewer Honor Roll recognition. The more impact you make, the more opportunities open up.', icon: Crown },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="flex gap-6 md:gap-10 items-start py-8 border-b border-white/[0.04] last:border-none group">
                                <div className="flex-none">
                                    <div className="w-14 h-14 rounded-full border border-emerald-400/30 flex items-center justify-center group-hover:bg-emerald-400/10 transition-colors">
                                        <span className="text-sm font-semibold text-emerald-400">{item.step}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <item.icon className="w-4 h-4 text-emerald-400/60" />
                                        <h3 className="text-xl text-white font-semibold">{item.title}</h3>
                                    </div>
                                    <p className="text-text-secondary text-sm leading-relaxed max-w-xl">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ REVIEW EXPECTATIONS ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.015] to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/70 font-ui block mb-4">Expectations</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            WHAT WE ASK <span className="text-emerald-400">OF YOU</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { icon: ThumbsUp, title: 'Honest Reviews', desc: 'We never ask for positive reviews. We ask for genuine ones. If the book didn\'t work for you, say so constructively. Critical reviews are just as valuable as glowing ones — they help readers find the right books.' },
                            { icon: Calendar, title: 'Timely Posting', desc: 'Aim to post within 1-2 weeks of the publication date. Launch-week reviews have the most impact on visibility and algorithms. If you need more time, just let us know — communication is key.' },
                            { icon: Shield, title: 'FTC Compliance', desc: 'Include a disclosure that you received a free ARC in exchange for an honest review. We provide the exact language. This protects you, the author, and maintains trust with readers.' },
                            { icon: Globe, title: 'Cross-Platform Impact', desc: 'Post on at least one major platform (Amazon, Goodreads, StoryGraph). Cross-posting to social media (BookTok, Bookstagram) and your blog/podcast multiplies the impact exponentially.' },
                            { icon: Heart, title: 'Respect the Embargo', desc: 'Don\'t post reviews before the agreed date unless the publisher gives early clearance. Embargoes exist to coordinate launch momentum. Breaking one hurts the author\'s carefully planned launch strategy.' },
                            { icon: MessageCircle, title: 'Communicate', desc: 'If you can\'t finish the book or won\'t be able to post on time, tell us. Life happens. We\'d rather know than wonder. Ghosting is the one thing that will remove you from the program.' },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-emerald-400/20 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center flex-none">
                                        <item.icon className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm text-white font-semibold mb-2">{item.title}</h3>
                                        <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ WHERE TO POST ═══════ */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/70 font-ui block mb-4">Your Platforms</span>
                        <h2 className="font-display text-4xl text-white tracking-wide mb-4">
                            WHERE YOUR REVIEWS <span className="text-emerald-400">MATTER MOST</span>
                        </h2>
                        <p className="text-text-secondary max-w-xl mx-auto text-sm">
                            Every platform has a different impact. Here's where your reviews make the biggest difference for marginalized authors.
                        </p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { platform: 'Amazon', emoji: '📦', impact: 'Critical', desc: 'Drives discoverability and sales rank. The single most impactful platform for launch day.', color: 'border-amber-400/20 bg-amber-400/[0.03]' },
                            { platform: 'Goodreads', emoji: '📚', impact: 'High', desc: 'Community trust and long-tail discovery. Ratings compound over time.', color: 'border-emerald-400/20 bg-emerald-400/[0.03]' },
                            { platform: 'StoryGraph', emoji: '📊', impact: 'Growing', desc: 'Rapidly growing platform with engaged, diverse readership.', color: 'border-cyan-400/20 bg-cyan-400/[0.03]' },
                            { platform: 'BookTok', emoji: '🎵', impact: 'Viral', desc: 'Video reviews can explode reach overnight. Short, genuine reactions win.', color: 'border-pink-400/20 bg-pink-400/[0.03]' },
                            { platform: 'Bookstagram', emoji: '📸', impact: 'Visual', desc: 'Beautiful photos + mini-reviews. Great for genre fiction discovery.', color: 'border-purple-400/20 bg-purple-400/[0.03]' },
                            { platform: 'Book Blog', emoji: '✍️', impact: 'Deep', desc: 'Long-form reviews with staying power. SEO drives ongoing discovery.', color: 'border-indigo-400/20 bg-indigo-400/[0.03]' },
                            { platform: 'BookTube', emoji: '🎬', impact: 'Engaged', desc: 'Video reviews build personal connection and loyal viewership.', color: 'border-red-400/20 bg-red-400/[0.03]' },
                            { platform: 'Podcast', emoji: '🎙️', impact: 'Niche', desc: 'Book podcasts reach dedicated listeners who buy based on recs.', color: 'border-teal-400/20 bg-teal-400/[0.03]' },
                        ].map((p, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className={`p-5 rounded-xl border ${p.color}`}>
                                <span className="text-2xl block mb-2">{p.emoji}</span>
                                <h3 className="text-sm text-white font-semibold">{p.platform}</h3>
                                <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-semibold">{p.impact}</span>
                                <p className="text-[10px] text-text-secondary leading-relaxed mt-2">{p.desc}</p>
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
                        <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/70 font-ui block mb-4">ARC Reader Voices</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            FROM OUR <span className="text-emerald-400">ARC TEAM</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { quote: 'I\'ve been an ARC reader for six months and my Goodreads following has tripled. Getting early access to these incredible diverse authors before anyone else — it\'s like having a backstage pass to the future of speculative fiction.', name: 'Jordan Rivera', title: 'BookTok Creator · 12 ARCs reviewed' },
                            { quote: 'The quality of books I get as an ARC reader here is incomparable. Every title has been a genuine discovery. And knowing my Amazon review helps a queer or BIPOC author on launch day? That\'s not just reading — that\'s advocacy.', name: 'Keiko Tanaka', title: 'Bookstagram · 8 ARCs reviewed' },
                            { quote: 'What I love is there\'s zero pressure to write positive reviews. My most critical ARC review led to a genuine conversation with the author about representation in cosmic horror. That kind of trust is rare.', name: 'Dani Okafor', title: 'Book Blogger · 15 ARCs reviewed' },
                            { quote: 'I started as just a Goodreads reviewer and now I\'m cross-posting to Amazon, StoryGraph, and my blog. The program genuinely helped me grow as a reviewer and connect with a community that cares about the same books I do.', name: 'Alex Moreau', title: 'Multi-platform reviewer · 20 ARCs' },
                        ].map((t, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-emerald-400/20 transition-colors">
                                <Quote className="w-6 h-6 text-emerald-400/30 mb-4" />
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
                            FREQUENTLY <span className="text-emerald-400">ASKED</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-4">
                        {[
                            { q: 'How is ARC different from beta reading?', a: 'Beta readers work with unfinished manuscripts and provide development feedback to the author. ARC readers receive finished books and post public reviews to support the launch. Both are valuable — you can do both!' },
                            { q: 'Do I need to be an experienced reviewer?', a: 'Not at all. We look for genuine readers who enjoy sharing their thoughts. Whether you write a paragraph on Goodreads or produce 10-minute BookTube videos, your voice matters. The application asks about your review platforms and frequency so we can match you well.' },
                            { q: 'What if I don\'t like the book?', a: 'Post an honest review anyway! Critical reviews are just as valuable as positive ones. They help readers find the right books for them. We never remove ARC readers for leaving honest negative reviews.' },
                            { q: 'How many ARCs will I receive?', a: 'It depends on your genre preferences and the publication calendar. Most ARC readers receive 1-3 books per quarter. You can always accept or decline specific titles — there\'s no minimum requirement.' },
                            { q: 'What formats are available?', a: 'ePub, PDF, MOBI, and in some cases physical advance copies. You select your preferred format(s) during the application process and can update it anytime.' },
                            { q: 'Is there an NDA?', a: 'ARC readers sign a lighter agreement than beta readers. It covers the review embargo date and FTC disclosure requirements. You\'re free to share that you\'re reading the book — just don\'t post the review before the agreed date.' },
                            { q: 'Do I keep the books?', a: 'Yes! Digital ARCs are yours to keep. Physical ARCs are yours as well, though we appreciate it when reviewers donate their copies to libraries or Little Free Libraries after reviewing.' },
                            { q: 'Can I also be a beta reader?', a: 'Absolutely. Many of our most engaged community members participate in both programs. The application processes are separate, and the experiences complement each other.' },
                        ].map((faq, idx) => (
                            <motion.details key={idx} variants={fadeUp}
                                className="group bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-emerald-400/20 transition-colors">
                                <summary className="p-5 cursor-pointer flex items-center justify-between text-white hover:text-emerald-400 transition-colors font-semibold text-sm list-none">
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/[0.03] to-transparent" />
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-emerald-400/10 mx-auto flex items-center justify-center mb-8">
                        <Gift className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                        READY TO READ <span className="text-emerald-400">EARLY?</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
                        Join the ARC program, receive advance copies, and help launch stories by marginalized authors into the world.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/arc-apply" className="group px-10 py-4 bg-emerald-400 text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-emerald-300 transition-all flex items-center gap-3">
                            Apply to ARC Program <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
