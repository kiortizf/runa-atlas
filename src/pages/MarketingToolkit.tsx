import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Megaphone, Download, Link as LinkIcon, Copy, Check,
    Instagram, Twitter, Film, Mail, Printer, Image,
    FileText, ChevronDown, Loader2, Plus, X
} from 'lucide-react';
import { useMarketingAssets, MarketingAsset } from '../hooks/useDemoData';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const SOCIAL_PRESETS = [
    { name: 'Instagram Story', dimensions: '1080 x 1920', icon: Instagram, color: 'from-pink-500 to-violet-500' },
    { name: 'Twitter/X Banner', dimensions: '1500 x 500', icon: Twitter, color: 'from-blue-400 to-cyan-500' },
    { name: 'TikTok/Reels', dimensions: '1080 x 1920', icon: Film, color: 'from-white/20 to-white/5' },
    { name: 'Square Post', dimensions: '1080 x 1080', icon: Image, color: 'from-amber-500 to-orange-600' },
];

const CATEGORY_ICONS: Record<string, any> = {
    'Social Graphics': Image,
    'Press Kit': FileText,
    'Email Templates': Mail,
    'Bookmarks & Print': Printer,
};

interface AssetForm { name: string; category: string; format: string; size: string; }
const EMPTY_FORM: AssetForm = { name: '', category: 'Social Graphics', format: 'PNG', size: '' };

export default function MarketingToolkit() {
    const { data: assets, loading } = useMarketingAssets();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<AssetForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [downloadedId, setDownloadedId] = useState<string | null>(null);

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-aurora-teal animate-spin" /></div>;
    }

    const categories = ['all', ...Array.from(new Set(assets.map(a => a.category)))];
    const filtered = selectedCategory === 'all' ? assets : assets.filter(a => a.category === selectedCategory);

    const copyLink = (name: string) => {
        navigator.clipboard.writeText(`https://runaatlas.com/assets/${name.toLowerCase().replace(/\s+/g, '-')}`);
        setCopiedLink(name);
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const handleDownload = (asset: MarketingAsset) => {
        // Generate a placeholder file for download
        const content = `Asset: ${asset.name}\nCategory: ${asset.category}\nFormat: ${asset.format}\nSize: ${asset.size}\n\nThis is a placeholder for the actual asset file.`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${asset.name.toLowerCase().replace(/\s+/g, '-')}.${asset.format.toLowerCase()}`; a.click();
        URL.revokeObjectURL(url);
        setDownloadedId(asset.id);
        setTimeout(() => setDownloadedId(null), 2000);
    };

    const handleSocialCreate = (preset: typeof SOCIAL_PRESETS[0]) => {
        setForm({ name: `${preset.name} Template`, category: 'Social Graphics', format: 'PNG', size: preset.dimensions });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            await addDoc(collection(db, 'marketing_assets'), {
                name: form.name, category: form.category, format: form.format, size: form.size || 'Custom',
            });
            setShowModal(false);
            setForm(EMPTY_FORM);
        } catch (e) { console.error('Asset save failed:', e); }
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Marketing <span className="text-aurora-teal">Toolkit</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Social graphics, press kit, email templates, and print assets</p>
                    </div>
                    <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Plus className="w-4 h-4" /> Add Asset
                    </button>
                </div>

                <div className="mb-8">
                    <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4">Social Quick Create</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {SOCIAL_PRESETS.map((preset, i) => (
                            <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                onClick={() => handleSocialCreate(preset)}
                                className={`bg-gradient-to-br ${preset.color} rounded-xl p-4 text-left hover:scale-[1.02] transition-transform`}>
                                <preset.icon className="w-5 h-5 text-white/80 mb-3" />
                                <p className="text-sm font-semibold text-white">{preset.name}</p>
                                <p className="text-[10px] text-white/60 mt-0.5">{preset.dimensions}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-2 text-xs rounded-lg capitalize transition-all ${selectedCategory === cat ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30 font-semibold' : 'bg-white/[0.04] text-white/40 border border-transparent hover:text-white'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map((asset, i) => {
                        const CatIcon = CATEGORY_ICONS[asset.category] || FileText;
                        return (
                            <motion.div key={asset.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-all flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-aurora-teal/10 flex items-center justify-center">
                                        <CatIcon className="w-5 h-5 text-aurora-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white">{asset.name}</h3>
                                        <p className="text-[10px] text-white/30">{asset.format} · {asset.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => copyLink(asset.name)}
                                        className="p-2 text-white/20 hover:text-white/50 transition-colors">
                                        {copiedLink === asset.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                    </button>
                                    <button onClick={() => handleDownload(asset)}
                                        className="p-2 text-white/20 hover:text-aurora-teal transition-colors">
                                        {downloadedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                {filtered.length === 0 && <div className="text-center py-12 text-white/20 text-sm">No assets found.</div>}
            </div>

            {/* Add Asset Modal */}
            {showModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="bg-surface border border-border/30 rounded-xl w-full max-w-md p-6"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-display text-white">Add Marketing Asset</h3>
                            <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Asset Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-aurora-teal/40 focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-aurora-teal/40 focus:outline-none">
                                        {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Format</label>
                                    <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white focus:border-aurora-teal/40 focus:outline-none">
                                        {['PNG', 'JPG', 'SVG', 'PDF', 'PSD', 'AI', 'HTML'].map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Size / Dimensions</label>
                                <input value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="e.g., 1080 x 1920"
                                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-aurora-teal/40 focus:outline-none" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                            <button onClick={handleSave} disabled={saving || !form.name.trim()}
                                className="flex items-center gap-2 px-5 py-2 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Add Asset
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
