import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Palette, Download, Share2, Image, FileText, Copy, Check,
    Instagram, Twitter, Globe, BookOpen, Sparkles, Type, Layout
} from 'lucide-react';

// ═══════════════════════════════════════════
// MARKETING TOOLKIT — Social & press assets
// ═══════════════════════════════════════════

const ASSET_CATEGORIES = ['Social Graphics', 'Press Kit', 'Email Templates', 'Bookmarks & Print'];

const MOCK_ASSETS = [
    { name: 'Instagram Story — Cover Reveal', category: 'Social Graphics', format: 'PNG 1080×1920', size: '2.4 MB' },
    { name: 'Twitter/X Banner — New Release', category: 'Social Graphics', format: 'PNG 1500×500', size: '1.1 MB' },
    { name: 'BookTok Video Template', category: 'Social Graphics', format: 'MP4 1080×1920', size: '8.2 MB' },
    { name: 'Square Post — Quote Card', category: 'Social Graphics', format: 'PNG 1080×1080', size: '1.6 MB' },
    { name: 'Author Headshot — Official', category: 'Press Kit', format: 'JPG 2400×3000', size: '4.8 MB' },
    { name: 'Book Cover — High Resolution', category: 'Press Kit', format: 'PNG 2400×3600', size: '5.2 MB' },
    { name: 'Author Bio — Short & Long', category: 'Press Kit', format: 'DOCX', size: '28 KB' },
    { name: 'Press Release Template', category: 'Press Kit', format: 'DOCX', size: '42 KB' },
    { name: 'Launch Announcement', category: 'Email Templates', format: 'HTML', size: '15 KB' },
    { name: 'Newsletter — Monthly Update', category: 'Email Templates', format: 'HTML', size: '18 KB' },
    { name: 'Bookmark — Front & Back', category: 'Bookmarks & Print', format: 'PDF 2×6 in', size: '3.1 MB' },
    { name: 'Postcard — Review Request', category: 'Bookmarks & Print', format: 'PDF 4×6 in', size: '4.5 MB' },
];

const SOCIAL_PRESETS = [
    { platform: 'Instagram Story', icon: Instagram, dims: '1080 × 1920', color: 'from-pink-500 to-violet-500' },
    { platform: 'Twitter/X Post', icon: Twitter, dims: '1200 × 675', color: 'from-blue-400 to-cyan-400' },
    { platform: 'Facebook Cover', icon: Globe, dims: '820 × 312', color: 'from-blue-600 to-indigo-500' },
    { platform: 'TikTok/BookTok', icon: Sparkles, dims: '1080 × 1920', color: 'from-rose-500 to-orange-400' },
];

export default function MarketingToolkit() {
    const [activeCategory, setActiveCategory] = useState('Social Graphics');
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    const filteredAssets = MOCK_ASSETS.filter(a => a.category === activeCategory);

    const copyLink = (name: string) => {
        setCopiedLink(name);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Marketing <span className="text-rose-400">Toolkit</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Social assets, press kits, and promotional materials</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Sparkles className="w-4 h-4" /> Generate Asset
                    </button>
                </div>

                {/* Social Quick-Create */}
                <div className="mb-8">
                    <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4">Quick Create for Social</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {SOCIAL_PRESETS.map((preset, i) => (
                            <motion.button key={i} whileHover={{ scale: 1.02 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 text-left hover:border-white/[0.15] transition-all group">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${preset.color} flex items-center justify-center mb-3 opacity-80 group-hover:opacity-100 transition-opacity`}>
                                    <preset.icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-sm text-white font-medium">{preset.platform}</p>
                                <p className="text-[10px] text-white/30 mt-1">{preset.dims}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {ASSET_CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 text-xs rounded-lg whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-rose-400/20 text-rose-400 border border-rose-400/30 font-semibold' : 'bg-white/[0.04] text-white/40 border border-transparent hover:text-white'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Assets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAssets.map((asset, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-400/10 flex items-center justify-center">
                                    {asset.format.includes('PNG') || asset.format.includes('JPG') ? <Image className="w-5 h-5 text-rose-400" /> :
                                     asset.format.includes('MP4') ? <Sparkles className="w-5 h-5 text-rose-400" /> :
                                     <FileText className="w-5 h-5 text-rose-400" />}
                                </div>
                                <span className="text-[10px] text-white/20">{asset.size}</span>
                            </div>
                            <h3 className="text-sm text-white font-medium mb-1">{asset.name}</h3>
                            <p className="text-[10px] text-white/30 mb-4">{asset.format}</p>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-starforge-gold text-void-black rounded-lg font-semibold hover:bg-yellow-400">
                                    <Download className="w-3 h-3" /> Download
                                </button>
                                <button onClick={() => copyLink(asset.name)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/[0.06] text-white/60 rounded-lg hover:text-white">
                                    {copiedLink === asset.name ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    {copiedLink === asset.name ? 'Copied' : 'Link'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
