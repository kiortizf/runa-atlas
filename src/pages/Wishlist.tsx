import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, BookOpen, Bell, ShoppingCart, Trash2, Eye,
    Calendar, Star, Clock, Check, X
} from 'lucide-react';

// ═══════════════════════════════════════════
// WISHLIST & PREORDERS — Save and track
// ═══════════════════════════════════════════

interface WishlistItem {
    id: string;
    title: string;
    author: string;
    genre: string;
    releaseDate: string;
    released: boolean;
    preordered: boolean;
    notify: boolean;
    rating?: number;
}

const MOCK_WISHLIST: WishlistItem[] = [
    { id: '1', title: 'Quantum Borderlands', author: 'Xiomara Vega', genre: 'Cyberpunk', releaseDate: '2026-06-15', released: false, preordered: true, notify: true },
    { id: '2', title: 'Shadow Resonance', author: 'Alejandro Cruz', genre: 'Dark Fantasy', releaseDate: '2026-05-01', released: false, preordered: false, notify: true },
    { id: '3', title: 'Code of the Elders', author: 'Amara Osei', genre: 'Afrofuturism', releaseDate: '2026-08-20', released: false, preordered: false, notify: false },
    { id: '4', title: 'Chrome Meridian', author: 'Xiomara Vega', genre: 'Cyberpunk', releaseDate: '2025-08-15', released: true, preordered: false, notify: false, rating: 5 },
    { id: '5', title: 'Void Frequencies', author: 'Alejandro Cruz', genre: 'Dark Fantasy', releaseDate: '2025-10-20', released: true, preordered: false, notify: false, rating: 4 },
];

export default function Wishlist() {
    const [items, setItems] = useState(MOCK_WISHLIST);
    const [tab, setTab] = useState<'upcoming' | 'released'>('upcoming');

    const filtered = items.filter(item => tab === 'upcoming' ? !item.released : item.released);
    const preorderCount = items.filter(i => i.preordered).length;

    const toggleNotify = (id: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, notify: !i.notify } : i));
    };

    const togglePreorder = (id: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, preordered: !i.preordered } : i));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Wish<span className="text-rose-400">list</span></h1>
                        <p className="text-sm text-text-secondary mt-1">{items.length} saved · {preorderCount} preordered</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['upcoming', 'released'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 text-xs rounded-lg capitalize transition-all ${tab === t ? 'bg-rose-400/20 text-rose-400 border border-rose-400/30 font-semibold' : 'bg-white/[0.04] text-white/50 border border-transparent hover:text-white'}`}>
                            {t} ({items.filter(i => t === 'upcoming' ? !i.released : i.released).length})
                        </button>
                    ))}
                </div>

                {/* Items */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map((item, i) => (
                            <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-rose-500/20 to-violet-500/20 flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-rose-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                                            <p className="text-xs text-white/50">by {item.author}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded">{item.genre}</span>
                                                <span className="text-[10px] text-white/30"><Calendar className="w-3 h-3 inline mr-1" />{item.releaseDate}</span>
                                            </div>
                                            {item.rating && (
                                                <div className="flex items-center gap-0.5 mt-1">
                                                    {Array.from({ length: 5 }).map((_, j) => (
                                                        <Star key={j} className={`w-3 h-3 ${j < item.rating! ? 'text-starforge-gold fill-starforge-gold' : 'text-white/10'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!item.released && (
                                            <>
                                                <button onClick={() => toggleNotify(item.id)}
                                                    className={`p-2 rounded-lg transition-all ${item.notify ? 'bg-aurora-teal/10 text-aurora-teal' : 'bg-white/[0.04] text-white/20 hover:text-white/50'}`}
                                                    title={item.notify ? 'Notifications on' : 'Notify me'}>
                                                    <Bell className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => togglePreorder(item.id)}
                                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${item.preordered ? 'bg-starforge-gold text-void-black' : 'bg-white/[0.04] text-white/50 hover:text-white border border-white/[0.08]'}`}>
                                                    {item.preordered ? <><Check className="w-3 h-3 inline mr-1" />Preordered</> : <><ShoppingCart className="w-3 h-3 inline mr-1" />Preorder</>}
                                                </button>
                                            </>
                                        )}
                                        {item.released && (
                                            <button className="px-3 py-2 rounded-lg text-xs font-medium bg-aurora-teal text-void-black hover:bg-aurora-teal/90">
                                                <Eye className="w-3 h-3 inline mr-1" /> Read Now
                                            </button>
                                        )}
                                        <button onClick={() => removeItem(item.id)} className="p-2 text-white/10 hover:text-forge-red transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-white/20">
                            <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Your {tab} list is empty</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
