import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Compass, BookOpen, Scroll, Vote, MessageCircle, Users, ArrowRight,
    ChevronDown, Check, Star, Heart, Sparkles, Eye, Zap, Globe,
    Calendar, Library, Feather, PenTool, Crown, Quote, Layers,
    BookMarked, Headphones, Flame, Shield, Brain, Dna
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { usePageSEO } from '../hooks/usePageSEO';

// Feature screenshots
import runeweaveImg from '../assets/features/runeweave-starmap.webp';
import readerAppImg from '../assets/features/reader-app.webp';
import journeysImg from '../assets/features/journeys-serial.webp';
import forgeVotingImg from '../assets/features/forge-voting.webp';
import authorConnectImg from '../assets/features/author-connect.webp';
import communityImg from '../assets/features/community-circles.webp';
import eventsImg from '../assets/features/events-calendar.webp';
import libraryImg from '../assets/features/library-shelf.webp';
import spoilerShieldImg from '../assets/features/spoiler-shield.webp';
import readingWrappedImg from '../assets/features/reading-wrapped.webp';
import moodMatcherImg from '../assets/features/mood-matcher.webp';
import passageCollectionsImg from '../assets/features/passage-collections.webp';
import bookDnaImg from '../assets/features/book-dna.webp';
import readerCompatibilityImg from '../assets/features/reader-compatibility.webp';
import contentCompassImg from '../assets/features/content-compass.webp';
import championsImg from '../assets/features/champions.webp';
import archiveImg from '../assets/features/runeweave-archive.webp';

// ═══════════════════════════════════════════
// FOR READERS — SaaS-style feature showcase
// ═══════════════════════════════════════════

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } }
};

export default function ForReaders() {
  usePageSEO({
    title: 'For Readers',
    description: 'Your next obsession starts here. Discover stories through the Runeweave star-map, read with immersive tools, vote on what gets published, and connect with your favorite authors at RÜNA ATLAS PRESS.',
  });
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    const [heroSubtitle, setHeroSubtitle] = useState(
        "Runa Atlas isn't a bookstore — it's a literary universe. Discover stories through interactive star-maps, read with immersive tools, shape what gets published, and connect directly with the authors you love."
    );

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'page_configs', 'for-readers'), (snap) => {
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
                    <div className="absolute inset-0 bg-gradient-to-b from-aurora-teal/[0.04] via-transparent to-transparent" />
                    <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-aurora-teal/[0.03] rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-starforge-gold/[0.03] rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
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
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-aurora-teal/40" />
                            <span className="text-[11px] uppercase tracking-[0.3em] text-aurora-teal/80 font-ui">For Readers</span>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-aurora-teal/40" />
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white tracking-wider leading-[1.1] mb-8">
                            YOUR NEXT<br />
                            <span className="text-aurora-teal">OBSESSION</span> STARTS HERE
                        </h1>
                        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12 font-body">
                            {heroSubtitle}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link to="/" className="group px-8 py-4 bg-aurora-teal text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-aurora-teal/90 transition-all flex items-center gap-3">
                                Explore the Runeweave <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#discover" className="px-8 py-4 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-aurora-teal/40 hover:text-aurora-teal transition-all">
                                See What's Possible
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
                            "Most platforms treat readers as consumers.<br className="hidden md:block" />
                            We built one where you're a{' '}
                            <span className="text-aurora-teal not-italic font-semibold">collaborator.</span>"
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ WHAT YOU GET ═══════ */}
            <section id="discover" className="relative py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-20">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-aurora-teal/70 font-ui block mb-4">Why Runa Atlas</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            NOT JUST BOOKS,<br /><span className="text-aurora-teal">AN EXPERIENCE</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Every feature exists to deepen your connection with stories and the people who write them.
                        </p>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Compass, title: 'Discover Differently', desc: 'Forget algorithms. Our interactive Runeweave star-map lets you explore books by themes, connections, and constellations — finding stories through discovery, not data.' },
                            { icon: BookOpen, title: 'Read With Purpose', desc: 'Highlight passages, react with emoji, switch themes, and see what other readers loved most. Reading on Runa Atlas is social, immersive, and beautiful.' },
                            { icon: Vote, title: 'Shape What Gets Published', desc: 'Vote on anthology themes, choose cover designs, and influence story directions. Your taste directly shapes the catalog — no other platform gives you that power.' },
                            { icon: MessageCircle, title: 'Talk to the Authors', desc: 'AMAs, office hours, writing journals. This isn\'t parasocial — it\'s a genuine two-way conversation between readers and the authors they love.' },
                            { icon: Users, title: 'Find Your People', desc: 'Join reading circles, participate in book clubs with discussion guides, and build lasting friendships with other readers who share your literary obsessions.' },
                            { icon: Calendar, title: 'Live Events & Workshops', desc: 'Firesides, panel discussions, craft workshops, and book launches. Attend live or watch recordings — the literary calendar is always full.' },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="group p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-aurora-teal/20 transition-all duration-500 hover:bg-white/[0.04]">
                                <div className="w-12 h-12 rounded-lg bg-aurora-teal/10 flex items-center justify-center mb-5 group-hover:bg-aurora-teal/20 transition-colors">
                                    <item.icon className="w-6 h-6 text-aurora-teal" />
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
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-4">The Platform</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            EVERY FEATURE,<br /><span className="text-starforge-gold">UP CLOSE</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto mb-4">
                            Here's exactly what you get when you join Runa Atlas. These aren't mockups — they're screenshots of the real platform.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FEATURE 1: THE RUNEWEAVE ═══════ */}
            <FeatureShowcase
                badge="The Runeweave"
                title={<>Discover Stories Like<br /><span className="text-starforge-gold">Constellations in the Sky</span></>}
                description="Our interactive star-map reimagines how you browse books. Each title is a star, grouped into thematic constellations. Zoom in, explore connections between stories, and discover your next read through curiosity — not an algorithm."
                image={runeweaveImg}
                features={[
                    'Interactive star-map with zoom, pan, and constellation filtering',
                    'Books connected by theme, mood, and narrative links',
                    'Community-curated constellations with curator notes',
                    'Quick-preview cards with synopsis, price, and codemark',
                    'Search overlays and genre filtering built in',
                ]}
                reverse={false}
            />

            {/* ═══════ FEATURE 2: THE READER APP ═══════ */}
            <FeatureShowcase
                badge="The Reader"
                title={<>Reading Reimagined,<br /><span className="text-aurora-teal">Paragraph by Paragraph</span></>}
                description="Our built-in reader is designed for deep engagement. Highlight passages, leave emoji reactions, switch between dark/sepia/light themes, and see what resonated with the community. Author notes and editor annotations appear right alongside the text."
                image={readerAppImg}
                features={[
                    'Three reading themes: dark, sepia, and light mode',
                    'Paragraph-level highlighting with emoji reactions',
                    'Community highlights: see most-loved passages',
                    'Inline author notes and editor annotations',
                    'Progress tracking, chapter navigation, and reading stats',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ FEATURE 3: JOURNEYS ═══════ */}
            <FeatureShowcase
                badge="Journeys"
                title={<>Serialized Stories,<br /><span className="text-starforge-gold">Delivered Episode by Episode</span></>}
                description="Follow ongoing serials from your favorite authors. Subscribe to Journeys, get notified when new episodes drop, and experience stories unfolding in real-time — with a community reading alongside you."
                image={journeysImg}
                features={[
                    'Subscribe to ongoing serials with one click',
                    'Episode-by-episode release with notification alerts',
                    'Active, Completed, and Hiatus status tracking',
                    'Featured Journeys spotlighted on the homepage',
                    'Full reading experience with chapter progress',
                ]}
                reverse={false}
            />

            {/* ═══════ FEATURE 4: THE FORGE ═══════ */}
            <FeatureShowcase
                badge="The Forge"
                title={<>Your Vote<br /><span className="text-aurora-teal">Shapes What Ships</span></>}
                description="The Forge is your creative hub. Vote on anthology themes, choose between cover designs, join reader circles, ask authors anything, and take on reading challenges. Five tabs of pure community engagement — this is publishing that actually listens."
                image={forgeVotingImg}
                features={[
                    'Anthology theme voting with real-time results',
                    'Cover design elections: pick the art that ships',
                    'Reader Circles & Author Q&A in one place',
                    'Reading challenges with goal tracking & milestones',
                    'The Runeweave Archive: contribute creative artifacts',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ FEATURE 5: AUTHOR CONNECT ═══════ */}
            <FeatureShowcase
                badge="Author Connect"
                title={<>Talk to Your<br /><span className="text-starforge-gold">Favorite Authors</span></>}
                description="AMAs with upvotable questions, behind-the-scenes writing journals, and bookable office hours for deeper conversations. This isn't one-way parasocial content — it's genuine, structured access to the creators behind the stories."
                image={authorConnectImg}
                features={[
                    'Ask Me Anything sessions with upvoting and answers',
                    'Behind-the-scenes writing journals from authors',
                    'Bookable office hours for 1-on-1 conversations',
                    'Live, archived, and upcoming event states',
                    'Question queuing with community-driven prioritization',
                ]}
                reverse={false}
            />

            {/* ═══════ FEATURE 6: COMMUNITY ═══════ */}
            <FeatureShowcase
                badge="Community"
                title={<>Reading Circles,<br /><span className="text-aurora-teal">Book Clubs, and Beyond</span></>}
                description="Join reading circles organized around genres and themes. Get professionally designed discussion guides with reading schedules. Participate in Q&A sessions, post discussions, and build genuine literary friendships — all inside the platform."
                image={communityImg}
                features={[
                    'Themed reading circles: Dark Fantasy, Sci-Fi, Literary & more',
                    'Discussion guides with weekly reading schedules',
                    'In-circle discussions with threaded conversations',
                    'Community constellation voting and trending polls',
                    'Apply to join circles or create your own',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ NEW FEATURES HEADER ═══════ */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-violet-400/70 font-ui block mb-4">New Reader Features</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                            FEATURES THAT<br /><span className="text-violet-400">MOVE THE NEEDLE</span>
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto mb-4">
                            Tools no other publisher has built. Because we don't just sell books — we build the reader experience around you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FEATURE 7: SPOILER SHIELD ═══════ */}
            <FeatureShowcase
                badge="Spoiler Shield"
                title={<>Chapter-Gated<br /><span className="text-starforge-gold">Discussions</span></>}
                description="Never get spoiled again. Spoiler Shield gates every discussion thread to your reading progress. You only see conversations from chapters you've completed — locked content stays hidden with a teaser, not a blank wall."
                image={spoilerShieldImg}
                features={[
                    'Set your chapter progress — discussions auto-filter to your level',
                    'Spoiler-level badges: Safe, Mild, and Heavy',
                    'Threaded replies with upvotes and reactions',
                    'Locked chapter teasers encourage you to keep reading',
                    'Chapter sidebar with visual lock / unlock indicators',
                ]}
                reverse={false}
            />

            {/* ═══════ FEATURE 8: READING WRAPPED ═══════ */}
            <FeatureShowcase
                badge="Reading Wrapped"
                title={<>Your Year in Books,<br /><span className="text-aurora-teal">Beautifully Visualized</span></>}
                description="Spotify Wrapped for readers. At the end of each year, get a shareable, animated summary of your reading life — books read, hours spent, genres explored, top passages, community impact, and your unique reading personality."
                image={readingWrappedImg}
                features={[
                    '8 animated slides covering every aspect of your reading year',
                    'Books read, pages turned, hours spent, longest streak',
                    'Top genres and monthly reading activity chart',
                    'Most-saved passage and community impact stats',
                    'Unique reading personality (e.g., The Obsidian Scholar)',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ FEATURE 9: MOOD & VIBE MATCHER ═══════ */}
            <FeatureShowcase
                badge="Mood & Vibe Matcher"
                title={<>Find Books by<br /><span className="text-starforge-gold">How You Feel</span></>}
                description="Forget search terms. Adjust six mood sliders — Tone, Pacing, Romance, Worldbuilding, Prose Style, and Intensity — or pick a quick mood preset like 'Haunt me' or 'I need comfort.' Instantly see ranked book matches based on your current vibe."
                image={moodMatcherImg}
                features={[
                    'Six interactive mood sliders with real-time matching',
                    'Quick mood presets: one-click vibe selection',
                    'Book results ranked by match percentage',
                    'Genre tags and mood indicators on every result',
                    'Powered by your Book DNA for personalized accuracy',
                ]}
                reverse={false}
            />

            {/* ═══════ FEATURE 10: PASSAGE COLLECTIONS ═══════ */}
            <FeatureShowcase
                badge="Passage Collections"
                title={<>Curate and Share<br /><span className="text-aurora-teal">Literary Highlights</span></>}
                description="Pinterest for literary passages. Save your favorite quotes, organize them into themed boards — 'Lines That Destroyed Me,' 'One-Liners That Go Hard' — and discover trending passages from across the community."
                image={passageCollectionsImg}
                features={[
                    'Create themed collections from any passage you highlight',
                    'Browse trending passages with emoji reactions',
                    'Save, share, and copy passages with smart formatting',
                    'Community-curated featured collections',
                    'See which passages the community loves most',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ FEATURE 11: BOOK DNA ═══════ */}
            <FeatureShowcase
                badge="Book DNA"
                title={<>Your Taste Profile,<br /><span className="text-starforge-gold">Visualized in Detail</span></>}
                description="Not just 'I like fantasy.' Book DNA maps your preferences across 8 axes — darkness, pacing, worldbuilding depth, prose style, romance heat, moral ambiguity, and more. It updates automatically as you read and rate, and powers every discovery tool on the platform."
                image={bookDnaImg}
                features={[
                    'SVG radar chart showing your 8-axis taste profile',
                    'Genre affinity rankings with book counts',
                    'Author DNA matches — see which authors fit your taste',
                    'DNA evolution tracking: see how each book shifts your profile',
                    'Profile strength score that improves as you read more',
                ]}
                reverse={false}
            />

            {/* ═══════ FEATURE 12: READER COMPATIBILITY ═══════ */}
            <FeatureShowcase
                badge="Reader Compatibility"
                title={<>Find Your<br /><span className="text-aurora-teal">Book Buddy</span></>}
                description="Match with readers who highlighted 73% of the same passages you did. Reader Compatibility pairs you based on taste DNA, reading pace, and annotation style. Start buddy reads, share annotations in real-time, and never read alone again."
                image={readerCompatibilityImg}
                features={[
                    'DNA-powered matching with compatibility breakdowns',
                    'Shared highlights: see exactly which passages you both loved',
                    'Buddy Reads: pick a book, set a pace, annotate together',
                    'Invitation system with custom messages',
                    'Online/Reading/Away status for real-time connection',
                ]}
                reverse={true}
                accent="teal"
            />

            {/* ═══════ FEATURE 13: CONTENT COMPASS ═══════ */}
            <FeatureShowcase
                badge="Content Compass"
                title={<>Community-Sourced<br /><span className="text-emerald-400">Content Warnings</span></>}
                description="A massive unmet need — especially in dark fantasy and speculative fiction. Content Compass provides non-spoiler, community-verified content warnings with 5-level intensity scales and chapter locations. Because we care about readers, not just sales."
                image={contentCompassImg}
                features={[
                    'Category-based warnings: violence, trauma, mental health, and more',
                    '5-level intensity scale from Mentioned to Graphic',
                    'Chapter-specific locations (no spoilers by default)',
                    'Community voting on accuracy with verification counts',
                    'Personal sensitivity preferences: choose what matters to you',
                ]}
                reverse={false}
                accent="emerald"
            />

            {/* ═══════ MORE WAYS TO ENGAGE (grid) ═══════ */}
            <section className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-4">And More</span>
                        <h2 className="font-display text-3xl md:text-4xl text-white tracking-wide">
                            MORE WAYS TO <span className="text-starforge-gold">ENGAGE</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <SubFeatureCard
                            image={eventsImg}
                            title="Live Events"
                            description="Author firesides, panel discussions, craft workshops, and book launch celebrations. Attend live via stream or watch recordings at your own pace."
                            icon={Calendar}
                        />
                        <SubFeatureCard
                            image={libraryImg}
                            title="Personal Library"
                            description="Your bookshelf lives in the cloud. Track what you own, what you're reading, and what's on your wishlist — with reading progress synced across devices."
                            icon={Library}
                        />
                        <SubFeatureCard
                            image={archiveImg}
                            title="Runeweave Archive"
                            description="Submit moodboards, playlists, glossaries, craft essays, and more. Community-driven creative artifacts that celebrate the books you love."
                            icon={PenTool}
                        />
                        <SubFeatureCard
                            image={championsImg}
                            title="Community Champions"
                            description="Founders Wall honoring the first 250 members, gamified badges for contributions, and live leaderboards. Your engagement gets recognized."
                            icon={Flame}
                        />
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
                            WHY READERS <span className="text-aurora-teal">CHOOSE US</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Kindle / Amazon', items: ['Algorithm-driven discovery', 'Basic e-reader, no social features', 'No author interaction', 'No voting or creative input', 'Reviews are the only feedback channel'], bad: true },
                            { label: 'Runa Atlas', items: ['Interactive star-map discovery', 'Immersive reader with reactions & highlights', 'AMAs, office hours, writing journals', 'Vote on covers, themes, and story directions', 'Reading circles with discussion guides', 'Live events and workshops', 'Runeweave Archive: community creative artifacts', 'Community Champions, badges & leaderboards'], highlight: true },
                            { label: 'Goodreads', items: ['Catalog and reviews only', 'No reading experience built in', 'Author Q&A is one-way', 'No creative input on publishing', 'Groups are basic forum threads'], bad: true },
                        ].map((col, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className={`p-8 rounded-lg border ${col.highlight ? 'bg-aurora-teal/[0.04] border-aurora-teal/30 ring-1 ring-aurora-teal/10' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                                {col.highlight && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <Crown className="w-4 h-4 text-aurora-teal" />
                                        <span className="text-[9px] uppercase tracking-widest text-aurora-teal font-semibold">The Full Package</span>
                                    </div>
                                )}
                                <h3 className={`text-lg font-semibold mb-6 ${col.highlight ? 'text-aurora-teal' : 'text-white/60'}`}>{col.label}</h3>
                                <ul className="space-y-3">
                                    {col.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            {col.highlight ? (
                                                <Check className="w-4 h-4 text-aurora-teal flex-none mt-0.5" />
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

            {/* ═══════ READER JOURNEY ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aurora-teal/[0.02] to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-aurora-teal/70 font-ui block mb-4">Your Journey</span>
                        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">
                            FROM CURIOUS TO <span className="text-aurora-teal">OBSESSED</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-0">
                        {[
                            { step: '01', title: 'Discover', desc: 'Explore the Runeweave star-map. Follow constellations that match your taste. Find books through connections and themes, not bestseller lists.', icon: Compass },
                            { step: '02', title: 'Read', desc: 'Dive into the immersive reader. Highlight passages, leave reactions, follow serialized Journeys episode by episode, and switch between dark and sepia themes.', icon: BookOpen },
                            { step: '03', title: 'Shape', desc: 'Vote on anthology themes in The Forge, pick cover designs, influence story directions. Contribute to the Runeweave Archive. Your voice matters here.', icon: Vote },
                            { step: '04', title: 'Connect', desc: 'Join reading circles, attend author AMAs and live events, and participate in discussions with readers who share your obsessions.', icon: Users },
                            { step: '05', title: 'Belong', desc: 'Build your library, track your reading challenges, earn community recognition, and become part of a literary ecosystem that grows with you.', icon: Heart },
                        ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="flex gap-6 md:gap-10 items-start py-8 border-b border-white/[0.04] last:border-none group">
                                <div className="flex-none">
                                    <div className="w-14 h-14 rounded-full border border-aurora-teal/30 flex items-center justify-center group-hover:bg-aurora-teal/10 transition-colors">
                                        <span className="text-sm font-semibold text-aurora-teal">{item.step}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <item.icon className="w-4 h-4 text-aurora-teal/60" />
                                        <h3 className="text-xl text-white font-semibold">{item.title}</h3>
                                    </div>
                                    <p className="text-text-secondary text-sm leading-relaxed max-w-xl">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ TESTIMONIALS ═══════ */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-starforge-gold/[0.015] to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-center mb-16">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-aurora-teal/70 font-ui block mb-4">Reader Voices</span>
                        <h2 className="font-display text-4xl text-white tracking-wide">
                            FROM OUR <span className="text-aurora-teal">READERS</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { quote: 'The Runeweave completely changed how I discover books. I found three new favorite authors just by following constellation links I never would have searched for.', name: 'Maya Torres', title: 'Fantasy & Speculative Fiction' },
                            { quote: 'Being able to vote on the next anthology theme made me feel like I actually matter to this press. My vote helped shape the "Bones of Tomorrow" collection.', name: 'Jordan Kim', title: 'Sci-Fi Reader Circle Member' },
                            { quote: 'The reading circles here are nothing like Goodreads groups. Having actual discussion guides and weekly reading schedules means conversations go deep, not shallow.', name: 'Aisha Williams', title: 'Dark Fantasy Circle' },
                            { quote: 'I did an AMA question that Elara Vance actually answered in detail. Where else do you get that kind of access? It completely changed how I read The Obsidian Crown.', name: 'Sam Reeves', title: 'Community Member since 2024' },
                        ].map((t, idx) => (
                            <motion.div key={idx} variants={fadeUp}
                                className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-aurora-teal/20 transition-colors">
                                <Quote className="w-6 h-6 text-aurora-teal/30 mb-4" />
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
                            FREQUENTLY <span className="text-aurora-teal">ASKED</span>
                        </h2>
                    </motion.div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="space-y-4">
                        {[
                            { q: 'Is Runa Atlas free to join?', a: 'Yes! Browsing the Runeweave, joining reading circles, participating in polls, and attending most events is completely free. Premium features like early access and Architect-tier office hours are available through our membership tiers.' },
                            { q: 'What kinds of books are on Runa Atlas?', a: 'We specialize in speculative fiction, literary fiction, and genre-blending work — dark fantasy, sci-fi, magical realism, cyberpunk, and more. If it pushes boundaries, it\'s probably here.' },
                            { q: 'Can I read books directly on the platform?', a: 'Yes. Our built-in reader supports full books and serialized Journeys with multiple themes, highlighting, reactions, and community features. You can read on any device with a browser.' },
                            { q: 'How do the voting features work?', a: 'The Forge runs periodic votes on anthology themes, cover designs, and story directions. Every reader gets one vote per project. Results directly influence what gets published — this isn\'t decorative democracy.' },
                            { q: 'What are Reading Circles?', a: 'Moderated book clubs organized around genres and themes. Each circle has professional discussion guides, weekly reading schedules, and threaded conversations. You can apply to join existing circles or start your own.' },
                            { q: 'Can I become a beta reader?', a: 'Absolutely. Authors on the platform can invite readers to preview manuscripts before publication. Keep your profile active, join reading circles, and engage with the community — authors notice dedicated readers.' },
                        ].map((faq, idx) => (
                            <motion.details key={idx} variants={fadeUp}
                                className="group bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-aurora-teal/20 transition-colors">
                                <summary className="p-5 cursor-pointer flex items-center justify-between text-white hover:text-aurora-teal transition-colors font-semibold text-sm list-none">
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
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aurora-teal/[0.03] to-transparent" />
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-aurora-teal/10 mx-auto flex items-center justify-center mb-8">
                        <Compass className="w-10 h-10 text-aurora-teal" />
                    </div>
                    <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-6">
                        READY TO <span className="text-aurora-teal">EXPLORE?</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
                        The Runeweave is waiting. Discover your next obsession, join a reading circle, and become part of a literary community unlike anything else.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/" className="group px-10 py-4 bg-aurora-teal text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-aurora-teal/90 transition-all flex items-center gap-3">
                            Enter the Runeweave <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/forge" className="px-10 py-4 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-aurora-teal/40 hover:text-aurora-teal transition-all">
                            Enter The Forge
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
            className="group bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-aurora-teal/20 transition-all duration-500">
            <div className="relative overflow-hidden">
                <img src={image} alt={title} className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-void-black/60 to-transparent" />
            </div>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded bg-aurora-teal/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-aurora-teal" />
                    </div>
                    <h3 className="text-lg text-white font-semibold">{title}</h3>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}
