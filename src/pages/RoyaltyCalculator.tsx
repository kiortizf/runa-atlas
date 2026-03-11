import { useState, useMemo, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    DollarSign, TrendingUp, BarChart3, Calculator, ArrowRight,
    BookOpen, Users, Zap, Crown, Check, Info
} from 'lucide-react';

const FORMATS = [
    { id: 'ebook', label: 'eBook', price: 12.99 },
    { id: 'paperback', label: 'Paperback', price: 17.99 },
    { id: 'hardcover', label: 'Hardcover', price: 27.99 },
    { id: 'audiobook', label: 'Audiobook', price: 24.99 },
];

const CHANNELS: Record<string, { tradRate: number; selfRate: number; runaRate: number }> = {
    ebook: { tradRate: 0.125, selfRate: 0.70, runaRate: 0.55 },
    paperback: { tradRate: 0.08, selfRate: 0.40, runaRate: 0.35 },
    hardcover: { tradRate: 0.10, selfRate: 0.35, runaRate: 0.30 },
    audiobook: { tradRate: 0.10, selfRate: 0.40, runaRate: 0.40 },
};

export default function RoyaltyCalculator() {
    const [monthlySales, setMonthlySales] = useState(500);
    const [selectedFormat, setSelectedFormat] = useState('ebook');
    const [customPrice, setCustomPrice] = useState<number | null>(null);

    useEffect(() => {
        const unsub = onSnapshot(
            doc(db, 'royalty_settings', 'default'),
            (snap) => {
                if (snap.exists()) {
                    // Royalty settings available from Firestore
                }
            },
            () => { }
        );
        return () => unsub();
    }, []);

    const format = FORMATS.find(f => f.id === selectedFormat)!;
    const price = customPrice ?? format.price;
    const channel = CHANNELS[selectedFormat];

    const earnings = useMemo(() => {
        const monthly = {
            traditional: monthlySales * price * channel.tradRate,
            selfPub: monthlySales * price * channel.selfRate,
            runaAtlas: monthlySales * price * channel.runaRate,
        };
        return {
            monthly,
            annual: {
                traditional: monthly.traditional * 12,
                selfPub: monthly.selfPub * 12,
                runaAtlas: monthly.runaAtlas * 12,
            },
            perUnit: {
                traditional: price * channel.tradRate,
                selfPub: price * channel.selfRate,
                runaAtlas: price * channel.runaRate,
            },
        };
    }, [monthlySales, price, channel]);

    const maxMonthly = Math.max(earnings.monthly.traditional, earnings.monthly.selfPub, earnings.monthly.runaAtlas);

    return (
        <div className="bg-void-black min-h-screen py-24">
            <div className="max-w-5xl mx-auto px-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-4">Royalty Calculator</span>
                    <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-4">
                        SEE WHAT YOU'D <span className="text-starforge-gold">EARN</span>
                    </h1>
                    <p className="text-text-secondary max-w-xl mx-auto">
                        Compare your potential earnings across publishing models. Adjust the sliders to match your expectations.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Controls */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-6">

                        {/* Format */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                            <label className="text-xs text-white/40 uppercase tracking-wider block mb-3">Book Format</label>
                            <div className="grid grid-cols-2 gap-2">
                                {FORMATS.map(f => (
                                    <button key={f.id} onClick={() => { setSelectedFormat(f.id); setCustomPrice(null); }}
                                        className={`p-3 rounded-lg border text-left text-xs transition-all
                      ${selectedFormat === f.id ? 'bg-starforge-gold/10 border-starforge-gold/30 text-white' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15'}`}>
                                        <p className="font-semibold">{f.label}</p>
                                        <p className="text-white/30 mt-0.5">${f.price}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                            <label className="text-xs text-white/40 uppercase tracking-wider block mb-3">Retail Price</label>
                            <div className="flex items-center gap-3">
                                <span className="text-white/30 text-lg">$</span>
                                <input type="number" step="0.01" min="0.99" max="99.99"
                                    value={customPrice ?? format.price}
                                    onChange={e => setCustomPrice(parseFloat(e.target.value) || format.price)}
                                    className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white text-lg font-semibold focus:border-starforge-gold/40 focus:outline-none" />
                            </div>
                        </div>

                        {/* Sales Volume */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                            <label className="text-xs text-white/40 uppercase tracking-wider block mb-3">Monthly Sales</label>
                            <input type="range" min={10} max={5000} step={10} value={monthlySales}
                                onChange={e => setMonthlySales(Number(e.target.value))}
                                className="w-full accent-[#C9A84C] mb-2" />
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    {[100, 500, 1000, 2500].map(v => (
                                        <button key={v} onClick={() => setMonthlySales(v)}
                                            className={`px-2 py-1 rounded text-[10px] border transition-all
                        ${monthlySales === v ? 'bg-starforge-gold/10 border-starforge-gold/30 text-starforge-gold' : 'border-white/[0.06] text-white/20 hover:border-white/15'}`}>
                                            {v >= 1000 ? `${v / 1000}k` : v}
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-white/[0.04] border border-white/[0.1] rounded px-3 py-1.5">
                                    <span className="text-lg text-starforge-gold font-semibold">{monthlySales.toLocaleString()}</span>
                                    <span className="text-[10px] text-white/20 ml-1">/mo</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Results */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="lg:col-span-3 space-y-4">

                        {/* Comparison Cards */}
                        {[
                            { label: 'Traditional Publishing', key: 'traditional' as const, rate: `${(channel.tradRate * 100).toFixed(1)}%`, color: 'text-white/40', bg: 'bg-white/[0.04]', barColor: 'bg-white/20', border: 'border-white/[0.06]' },
                            { label: 'Self-Publishing', key: 'selfPub' as const, rate: `${(channel.selfRate * 100).toFixed(0)}%`, color: 'text-aurora-teal', bg: 'bg-aurora-teal/[0.04]', barColor: 'bg-aurora-teal/40', border: 'border-aurora-teal/20' },
                            { label: 'Runa Atlas', key: 'runaAtlas' as const, rate: `${(channel.runaRate * 100).toFixed(0)}%`, color: 'text-starforge-gold', bg: 'bg-starforge-gold/[0.04]', barColor: 'bg-starforge-gold/60', border: 'border-starforge-gold/20', highlight: true },
                        ].map((model) => (
                            <div key={model.key} className={`p-6 rounded-lg border transition-all ${model.bg} ${model.border} ${model.highlight ? 'ring-1 ring-starforge-gold/10' : ''}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {model.highlight && <Crown className="w-4 h-4 text-starforge-gold" />}
                                        <h3 className={`text-sm font-semibold ${model.color}`}>{model.label}</h3>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${model.border} ${model.color}`}>
                                        {model.rate} royalty
                                    </span>
                                </div>

                                {/* Bar */}
                                <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(earnings.monthly[model.key] / maxMonthly) * 100}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${model.barColor}`}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-[10px] text-white/20 uppercase">Per Unit</p>
                                        <p className={`text-lg font-semibold ${model.color}`}>${earnings.perUnit[model.key].toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/20 uppercase">Monthly</p>
                                        <p className={`text-lg font-semibold ${model.color}`}>${earnings.monthly[model.key].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/20 uppercase">Annual</p>
                                        <p className={`text-lg font-semibold ${model.color}`}>${earnings.annual[model.key].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Runa Atlas Advantage */}
                        <div className="p-4 bg-starforge-gold/[0.04] border border-starforge-gold/20 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Info className="w-4 h-4 text-starforge-gold flex-none mt-0.5" />
                                <div className="text-xs text-white/60">
                                    <p className="font-semibold text-starforge-gold mb-1">The Runa Atlas Advantage</p>
                                    <p>While self-publishing offers higher per-unit royalties, Runa Atlas provides professional editorial support,
                                        community-powered marketing, beta reader matching, and manuscript analytics — so your books reach more readers
                                        and sell more copies over their lifetime.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="text-center mt-16">
                    <Link to="/submissions" className="inline-flex items-center gap-3 px-8 py-4 bg-starforge-gold text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-starforge-gold/90 transition-all">
                        Submit Your Manuscript <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
