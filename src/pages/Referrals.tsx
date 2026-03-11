import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Gift, Users, Copy, Check, Share2, Star, Link as LinkIcon,
    ArrowUpRight, Trophy, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ═══════════════════════════════════════════
// REFERRAL PROGRAM — Invite friends, earn rewards
// ═══════════════════════════════════════════

const MOCK_REFERRALS = [
    { name: 'María S.', date: '2026-02-15', status: 'active', reward: 'Free eBook' },
    { name: 'Jordan L.', date: '2026-02-20', status: 'active', reward: 'Free eBook' },
    { name: 'Kwame A.', date: '2026-03-01', status: 'pending', reward: '—' },
];

const REWARDS = [
    { threshold: 1, reward: 'Exclusive Bookmark', icon: '🔖', unlocked: true },
    { threshold: 3, reward: 'Free eBook of Choice', icon: '📚', unlocked: true },
    { threshold: 5, reward: '1 Month Premium', icon: '⭐', unlocked: false },
    { threshold: 10, reward: 'Signed Copy + Merch', icon: '🎁', unlocked: false },
    { threshold: 25, reward: 'Founding Reader Badge', icon: '👑', unlocked: false },
];

export default function Referrals() {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const referralLink = `https://runaatlas.com/join?ref=${user?.uid?.slice(0, 8) || 'demo'}`;
    const totalReferred = MOCK_REFERRALS.filter(r => r.status === 'active').length;

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-full bg-starforge-gold/10 flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-8 h-8 text-starforge-gold" />
                    </div>
                    <h1 className="font-display text-3xl tracking-wide uppercase mb-2">Invite & <span className="text-starforge-gold">Earn</span></h1>
                    <p className="text-sm text-text-secondary max-w-md mx-auto">Share Rüna Atlas with friends. You both get rewards — the more you invite, the bigger the prizes.</p>
                </div>

                {/* Referral Link */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 mb-8">
                    <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-3">Your Referral Link</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white/70 font-mono truncate">
                            {referralLink}
                        </div>
                        <button onClick={copyLink}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-starforge-gold text-void-black hover:bg-yellow-400'}`}>
                            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        {['Twitter/X', 'Instagram', 'Email'].map((platform) => (
                            <button key={platform} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white/[0.04] text-white/50 rounded-lg hover:text-white border border-white/[0.06] transition-colors">
                                <Share2 className="w-3 h-3" /> {platform}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stats */}
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                                <Users className="w-5 h-5 text-starforge-gold mb-2" />
                                <p className="text-3xl font-bold text-white">{totalReferred}</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-wider">Friends Joined</p>
                            </div>
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                                <Trophy className="w-5 h-5 text-aurora-teal mb-2" />
                                <p className="text-3xl font-bold text-white">{REWARDS.filter(r => r.unlocked).length}</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-wider">Rewards Earned</p>
                            </div>
                        </div>

                        {/* Referral List */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-white/[0.06]">
                                <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Your Referrals</h2>
                            </div>
                            {MOCK_REFERRALS.map((ref, i) => (
                                <div key={i} className="px-5 py-3 flex items-center justify-between border-t border-white/[0.04]">
                                    <div>
                                        <p className="text-sm text-white">{ref.name}</p>
                                        <p className="text-[10px] text-white/30">Joined {ref.date}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {ref.reward !== '—' && <span className="text-[10px] text-aurora-teal">{ref.reward}</span>}
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${ref.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {ref.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rewards Tiers */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-starforge-gold" /> Reward Tiers
                        </h2>
                        <div className="space-y-3">
                            {REWARDS.map((tier, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${tier.unlocked ? 'bg-starforge-gold/5 border-starforge-gold/20' : 'bg-white/[0.01] border-white/[0.04]'}`}>
                                    <span className="text-2xl">{tier.icon}</span>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${tier.unlocked ? 'text-white' : 'text-white/40'}`}>{tier.reward}</p>
                                        <p className="text-[10px] text-white/30">{tier.threshold} referral{tier.threshold > 1 ? 's' : ''}</p>
                                    </div>
                                    {tier.unlocked ? (
                                        <Check className="w-5 h-5 text-starforge-gold" />
                                    ) : (
                                        <span className="text-[10px] text-white/20">{tier.threshold - totalReferred} more</span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
