import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen, Globe, Star, Heart, Users, Calendar,
    Award, Eye, MessageSquare, ArrowRight, Feather, TrendingUp, ExternalLink
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function AuthorProfile() {
    const { slug } = useParams<{ slug: string }>();
    const [author, setAuthor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) { setLoading(false); return; }
        const unsub = onSnapshot(
            query(collection(db, 'authorProfiles'), where('slug', '==', slug)),
            (snap) => {
                if (snap.docs.length > 0) {
                    setAuthor({ id: snap.docs[0].id, ...snap.docs[0].data() });
                }
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-starforge-gold/30 border-t-starforge-gold rounded-full animate-spin" />
            </div>
        );
    }

    if (!author) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="font-display text-3xl text-white mb-4">AUTHOR NOT FOUND</h1>
                    <p className="text-text-secondary">This author profile doesn't exist yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-void-black min-h-screen">
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <img src={author.coverImage} alt="" className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-void-black via-void-black/60 to-transparent" />
            </div>

            {/* Profile Header */}
            <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-10">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                    <div className="w-32 h-32 rounded-full border-4 border-void-black overflow-hidden shadow-xl">
                        <img src={author.avatar} alt={author.penName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                        <h1 className="font-display text-4xl text-white tracking-wide">{author.penName}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {author.genres.map((g: string) => (
                                <span key={g} className="px-3 py-1 bg-starforge-gold/10 border border-starforge-gold/20 rounded-full text-[10px] uppercase tracking-wider text-starforge-gold">{g}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-2 bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-starforge-gold/90 transition-colors flex items-center gap-2">
                            <Heart className="w-3 h-3" /> Follow
                        </button>
                        {author.social?.website && (
                            <a href={author.social.website} target="_blank" rel="noreferrer"
                                className="px-4 py-2 border border-white/[0.1] text-white/60 text-xs rounded-sm hover:border-starforge-gold/30 hover:text-starforge-gold transition-colors flex items-center gap-2">
                                <Globe className="w-3 h-3" /> Website
                            </a>
                        )}
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    {[
                        { label: 'Words Written', value: (author.stats.totalWords / 1000).toFixed(0) + 'k', icon: Feather },
                        { label: 'Books Published', value: author.stats.booksPublished, icon: BookOpen },
                        { label: 'Avg Rating', value: author.stats.avgRating + '★', icon: Star },
                        { label: 'Readers', value: author.stats.totalReaders.toLocaleString(), icon: Eye },
                        { label: 'Followers', value: author.stats.followers.toLocaleString(), icon: Users },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <stat.icon className="w-4 h-4 text-starforge-gold/50 mx-auto mb-1" />
                            <p className="text-xl text-white font-semibold">{stat.value}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 pb-24">
                    {/* Left: Bio + Activity */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">About</h3>
                            <p className="text-sm text-white/70 leading-relaxed">{author.bio}</p>
                            {author.location && (
                                <p className="text-[11px] text-white/30 mt-4 flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> {author.location}
                                </p>
                            )}
                            <p className="text-[11px] text-white/20 mt-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Member since {author.memberSince}
                            </p>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {author.recentActivity.map((a: any, i: number) => (
                                    <div key={i} className="flex gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-none mt-0.5
                      ${a.type === 'milestone' ? 'bg-starforge-gold/10' : a.type === 'community' ? 'bg-aurora-teal/10' : 'bg-cosmic-purple/10'}`}>
                                            {a.type === 'milestone' ? <Award className="w-3 h-3 text-starforge-gold" /> :
                                                a.type === 'community' ? <MessageSquare className="w-3 h-3 text-aurora-teal" /> :
                                                    <Star className="w-3 h-3 text-cosmic-purple" />}
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/70">{a.text}</p>
                                            <p className="text-[10px] text-white/20 mt-0.5">{a.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Upcoming Events */}
                        {author.upcomingEvents.length > 0 && (
                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                                <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Upcoming Events</h3>
                                <div className="space-y-3">
                                    {author.upcomingEvents.map((e: any, i: number) => (
                                        <div key={i} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                                            <p className="text-sm text-white font-semibold">{e.title}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-white/30">{e.date}</span>
                                                <span className="text-[9px] px-2 py-0.5 bg-aurora-teal/10 text-aurora-teal rounded-full uppercase">{e.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Reading Order */}
                        {author.readingOrder.length > 1 && (
                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                                <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Suggested Reading Order</h3>
                                <div className="space-y-2">
                                    {author.readingOrder.map((r: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-starforge-gold/10 flex-none flex items-center justify-center">
                                                <span className="text-[10px] text-starforge-gold font-semibold">{r.order}</span>
                                            </div>
                                            <span className="text-sm text-white/70">{r.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right: Published Works */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xs text-white/40 uppercase tracking-wider">Published Works</h3>
                        {author.books.map((book: any, idx: number) => (
                            <motion.div key={book.id}
                                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                                className="flex flex-col md:flex-row gap-6 bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 hover:border-starforge-gold/20 transition-colors group">
                                <div className="w-36 h-52 rounded overflow-hidden flex-none shadow-lg">
                                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-xl text-white font-semibold group-hover:text-starforge-gold transition-colors">{book.title}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-starforge-gold bg-starforge-gold/10 px-2 py-0.5 rounded uppercase">{book.genre}</span>
                                                <span className="text-[10px] text-white/30">{book.year}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-sm text-starforge-gold">
                                                <Star className="w-3 h-3 fill-current" /> {book.rating}
                                            </div>
                                            <p className="text-[10px] text-white/20">{book.reviews} reviews</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/60 mt-4 leading-relaxed">{book.description}</p>
                                    <div className="flex gap-3 mt-4">
                                        <button className="px-4 py-2 bg-starforge-gold/10 border border-starforge-gold/20 text-starforge-gold text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-starforge-gold/20 transition-colors flex items-center gap-2">
                                            <BookOpen className="w-3 h-3" /> Read Sample
                                        </button>
                                        <button className="px-4 py-2 border border-white/[0.06] text-white/50 text-xs uppercase tracking-wider rounded-sm hover:border-white/20 hover:text-white transition-colors flex items-center gap-2">
                                            <ExternalLink className="w-3 h-3" /> View Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
