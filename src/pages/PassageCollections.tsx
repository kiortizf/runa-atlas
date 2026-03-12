import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookMarked, Heart, Plus, Share2, Eye, Grid3X3, List,
    Star, Quote, BookOpen, Sparkles, Lock, Globe, Users,
    ChevronDown, MessageCircle, Bookmark, Copy, MoreHorizontal,
    TrendingUp, Award, Search, Filter
} from 'lucide-react';

// ═══════════════════════════════════════════════════
// PASSAGE COLLECTIONS — Highlight Boards / Pinterest for Prose
// ═══════════════════════════════════════════════════

interface Passage {
    id: string;
    text: string;
    book: string;
    author: string;
    chapter: string;
    savedBy: number;
    reactions: { emoji: string; count: number }[];
    note?: string;
}

interface Collection {
    id: string;
    title: string;
    description: string;
    curator: string;
    curatorAvatar: string;
    visibility: 'public' | 'private';
    passageCount: number;
    followers: number;
    coverGradient: string;
    passages: Passage[];
    tags: string[];
    featured?: boolean;
}




export default function PassageCollections() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'discover' | 'my' | 'trending'>('discover');
    const [openCollection, setOpenCollection] = useState<string | null>(null);
    const [savedPassages, setSavedPassages] = useState<Set<string>>(new Set(['p1', 'p2', 'p7']));
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [collections, setCollections] = useState<Collection[]>([]);
    const [trendingPassages, setTrendingPassages] = useState<Passage[]>([]);

    useEffect(() => {
        const unsub = onSnapshot(
            query(collection(db, 'passage_collections'), orderBy('saves', 'desc')),
            (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Collection));
                setCollections(data);
            },
            () => { }
        );
        return () => unsub();
    }, []);

    const toggleSave = (id: string) => {
        setSavedPassages(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const activeCollection = collections.find(c => c.id === openCollection);

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-starforge-gold/10 flex items-center justify-center">
                                <BookMarked className="w-5 h-5 text-starforge-gold" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">Passage Collections</h1>
                                <p className="text-xs text-text-secondary">Curate your favorite lines. Share your literary obsessions.</p>
                            </div>
                        </div>
                        {user ? (
                        <button className="px-4 py-2 bg-starforge-gold/10 text-starforge-gold text-sm border border-starforge-gold/20 rounded-lg hover:bg-starforge-gold/20 transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" /> New Collection
                        </button>
                        ) : (
                        <a href="/portal" className="px-4 py-2 bg-starforge-gold/10 text-starforge-gold text-sm border border-starforge-gold/20 rounded-lg hover:bg-starforge-gold/20 transition-colors flex items-center gap-2">
                            Sign In to Create
                        </a>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-6">
                        {[
                            { id: 'discover' as const, label: 'Discover', icon: Sparkles },
                            { id: 'trending' as const, label: 'Trending Passages', icon: TrendingUp },
                            { id: 'my' as const, label: 'My Collections', icon: BookMarked },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setOpenCollection(null); }}
                                className={`flex items-center gap-2 pb-3 text-sm border-b-2 transition-colors
                                    ${activeTab === tab.id ? 'border-starforge-gold text-starforge-gold' : 'border-transparent text-text-secondary hover:text-white'}`}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {/* ═══ DISCOVER TAB ═══ */}
                    {activeTab === 'discover' && !openCollection && (
                        <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Featured */}
                            <div className="mb-10">
                                <h2 className="text-xs uppercase tracking-widest text-text-secondary mb-4">Featured Collections</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {collections.filter(c => c.featured).map(col => (
                                        <CollectionCard key={col.id} collection={col} onClick={() => setOpenCollection(col.id)} />
                                    ))}
                                </div>
                            </div>

                            {/* All Collections */}
                            <div>
                                <h2 className="text-xs uppercase tracking-widest text-text-secondary mb-4">All Collections</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {collections.filter(c => !c.featured).map(col => (
                                        <CollectionCard key={col.id} collection={col} onClick={() => setOpenCollection(col.id)} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ OPEN COLLECTION ═══ */}
                    {openCollection && activeCollection && (
                        <motion.div key="collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <button onClick={() => setOpenCollection(null)}
                                className="text-xs text-text-secondary hover:text-white transition-colors mb-6 flex items-center gap-1">
                                ← Back to collections
                            </button>

                            <div className={`p-8 rounded-xl bg-gradient-to-br ${activeCollection.coverGradient} border border-white/[0.06] mb-8`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">{activeCollection.curatorAvatar}</span>
                                    <span className="text-sm text-text-secondary">{activeCollection.curator}</span>
                                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-white/[0.06] text-text-secondary rounded">
                                        {activeCollection.visibility === 'public' ? <Globe className="w-3 h-3 inline" /> : <Lock className="w-3 h-3 inline" />}
                                        {' '}{activeCollection.visibility}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-display text-white tracking-wide mb-2">{activeCollection.title}</h2>
                                <p className="text-sm text-text-secondary mb-4">{activeCollection.description}</p>
                                <div className="flex items-center gap-4 text-xs text-text-secondary">
                                    <span>{activeCollection.passageCount} passages</span>
                                    <span>{activeCollection.followers} followers</span>
                                    <div className="flex gap-1.5">
                                        {activeCollection.tags.map(t => (
                                            <span key={t} className="px-1.5 py-0.5 bg-white/[0.06] rounded text-[10px]">#{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {activeCollection.passages.map((passage, idx) => (
                                    <PassageCard key={passage.id} passage={passage} idx={idx}
                                        saved={savedPassages.has(passage.id)} onToggleSave={() => toggleSave(passage.id)} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ TRENDING TAB ═══ */}
                    {activeTab === 'trending' && (
                        <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Trending This Week</h2>
                                    <p className="text-xs text-text-secondary">The most-saved passages across the platform right now</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[...trendingPassages, ...collections.flatMap(c => c.passages)]
                                    .sort((a, b) => b.savedBy - a.savedBy)
                                    .slice(0, 10)
                                    .map((passage, idx) => (
                                        <PassageCard key={passage.id} passage={passage} idx={idx}
                                            saved={savedPassages.has(passage.id)} onToggleSave={() => toggleSave(passage.id)}
                                            showRank />
                                    ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ MY COLLECTIONS TAB ═══ */}
                    {activeTab === 'my' && (
                        <motion.div key="my" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="text-center py-16">
                                <div className="w-16 h-16 rounded-full bg-starforge-gold/10 mx-auto flex items-center justify-center mb-4">
                                    <BookMarked className="w-8 h-8 text-starforge-gold" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Your Highlight Boards</h3>
                                <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
                                    You've saved {savedPassages.size} passage{savedPassages.size !== 1 ? 's' : ''} so far. Create a collection to organize your highlights into themed boards.
                                </p>
                                <button className="px-6 py-3 bg-starforge-gold text-void-black font-semibold text-sm rounded-sm hover:bg-starforge-gold/90 transition-colors flex items-center gap-2 mx-auto">
                                    <Plus className="w-4 h-4" /> Create Your First Collection
                                </button>

                                {/* Saved passages preview */}
                                {savedPassages.size > 0 && (
                                    <div className="mt-12 max-w-2xl mx-auto">
                                        <h4 className="text-xs uppercase tracking-widest text-text-secondary mb-4 text-left">Your Saved Passages</h4>
                                        <div className="space-y-3">
                                            {collections.flatMap(c => c.passages)
                                                .filter(p => savedPassages.has(p.id))
                                                .map((passage, idx) => (
                                                    <PassageCard key={passage.id} passage={passage} idx={idx}
                                                        saved={true} onToggleSave={() => toggleSave(passage.id)} compact />
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ═══ COLLECTION CARD ═══

function CollectionCard({ collection, onClick }: { collection: Collection; onClick: () => void }) {
    return (
        <motion.button onClick={onClick}
            whileHover={{ y: -2 }}
            className={`w-full text-left p-6 rounded-xl bg-gradient-to-br ${collection.coverGradient} border border-white/[0.06] hover:border-white/[0.15] transition-all group`}>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{collection.curatorAvatar}</span>
                <span className="text-xs text-text-secondary">{collection.curator}</span>
                {collection.featured && (
                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-starforge-gold/10 text-starforge-gold rounded border border-starforge-gold/20 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Featured
                    </span>
                )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-starforge-gold transition-colors">{collection.title}</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">{collection.description}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                    <span className="flex items-center gap-1"><Quote className="w-3 h-3" /> {collection.passageCount}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {collection.followers}</span>
                </div>
                <div className="flex gap-1">
                    {collection.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] text-text-secondary/60 px-1.5 py-0.5 bg-white/[0.04] rounded">#{t}</span>
                    ))}
                </div>
            </div>
        </motion.button>
    );
}

// ═══ PASSAGE CARD ═══

function PassageCard({ passage, idx, saved, onToggleSave, showRank, compact }: {
    passage: Passage; idx: number; saved: boolean; onToggleSave: () => void; showRank?: boolean; compact?: boolean;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`group p-5 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-starforge-gold/20 transition-all ${compact ? 'p-4' : ''}`}>
            <div className="flex gap-4">
                {showRank && (
                    <div className="flex-none w-8 text-center">
                        <span className={`text-2xl font-display ${idx < 3 ? 'text-starforge-gold' : 'text-white/20'}`}>{idx + 1}</span>
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    {/* Quote */}
                    <div className="relative mb-3">
                        <Quote className="w-4 h-4 text-starforge-gold/20 absolute -left-1 -top-1" />
                        <p className={`text-sm text-white/90 leading-relaxed italic pl-4 ${compact ? 'text-xs' : ''}`}>
                            {passage.text}
                        </p>
                    </div>

                    {/* Attribution */}
                    <div className="flex items-center gap-2 mb-3 pl-4">
                        <span className="text-xs text-starforge-gold font-medium">{passage.book}</span>
                        <span className="text-[10px] text-text-secondary">by {passage.author}</span>
                        <span className="text-[10px] text-text-secondary/50">• {passage.chapter}</span>
                    </div>

                    {/* Curator note */}
                    {passage.note && !compact && (
                        <div className="mb-3 pl-4 py-2 border-l-2 border-starforge-gold/20">
                            <p className="text-[11px] text-text-secondary leading-relaxed italic">{passage.note}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pl-4">
                        <div className="flex items-center gap-3">
                            {/* Reactions */}
                            <div className="flex items-center gap-1">
                                {passage.reactions.slice(0, 3).map((r, i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white/[0.04] rounded-full border border-white/[0.06] cursor-pointer hover:bg-white/[0.08] transition-colors">
                                        {r.emoji} {r.count}
                                    </span>
                                ))}
                            </div>
                            <span className="text-[10px] text-text-secondary flex items-center gap-1">
                                <Bookmark className="w-3 h-3" /> {passage.savedBy.toLocaleString()} saved
                            </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={onToggleSave}
                                className={`p-1.5 rounded transition-colors ${saved ? 'text-starforge-gold bg-starforge-gold/10' : 'text-text-secondary hover:text-white'}`}>
                                <Bookmark className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} />
                            </button>
                            <button className="p-1.5 rounded text-text-secondary hover:text-white transition-colors">
                                <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded text-text-secondary hover:text-white transition-colors">
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
