import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Gift, Copy, Check, Users, Star, Crown,
    Mail, Twitter, Share2, Loader2
} from 'lucide-react';
import { useReferrals } from '../hooks/useDemoData';
import { useAuth } from '../contexts/AuthContext';

export default function Referrals() {
    const { referrals, rewards, loading } = useReferrals();
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-starforge-gold animate-spin" /></div>;
    }

    const referralLink = `https://runaatlas.com/join?ref=${user?.uid?.slice(0, 8) || 'anon'}`;
    const referralCount = referrals.length;
    const successfulReferrals = referrals.filter(r => r.status === 'converted').length;

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareTwitter = () => {
        const text = encodeURIComponent('Join me on Rüna Atlas — the most powerful publishing platform. 📚✨');
        const url = encodeURIComponent(referralLink);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
    };

    const shareEmail = () => {
        const subject = encodeURIComponent('Join me on Rüna Atlas');
        const body = encodeURIComponent(`Hey! I've been using Rüna Atlas and it's been great for managing my publishing workflow.\n\nJoin here: ${referralLink}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const shareNative = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Rüna Atlas',
                    text: 'The most powerful publisher platform — join me!',
                    url: referralLink,
                });
            } catch (e) { /* user cancelled */ }
        } else {
            copyLink(); // Fallback to copy
        }
    };

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Refer & <span className="text-starforge-gold">Earn</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Share Rüna Atlas and unlock exclusive rewards</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-starforge-gold/10 to-amber-500/5 border border-starforge-gold/20 rounded-xl p-6 mb-8">
                    <h2 className="text-xs uppercase tracking-widest text-starforge-gold/70 font-semibold mb-3">Your Referral Link</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-black/30 rounded-lg px-4 py-3 font-mono text-sm text-starforge-gold truncate">
                            {referralLink}
                        </div>
                        <button onClick={copyLink}
                            className="flex items-center gap-2 px-4 py-3 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors flex-none">
                            {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <button onClick={shareTwitter}
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.1] transition-all">
                            <Twitter className="w-4 h-4" /> Twitter/X
                        </button>
                        <button onClick={shareEmail}
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.1] transition-all">
                            <Mail className="w-4 h-4" /> Email
                        </button>
                        <button onClick={shareNative}
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.1] transition-all">
                            <Share2 className="w-4 h-4" /> Share
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                        <Users className="w-5 h-5 text-aurora-teal mb-2" />
                        <p className="text-2xl font-bold text-white">{referralCount}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Referrals Sent</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                        <Check className="w-5 h-5 text-emerald-400 mb-2" />
                        <p className="text-2xl font-bold text-white">{successfulReferrals}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Converted</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                        <Gift className="w-5 h-5 text-starforge-gold mb-2" />
                        <p className="text-2xl font-bold text-white">{rewards.filter(r => successfulReferrals >= r.threshold).length}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Rewards Unlocked</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/[0.06]">
                            <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Referral History</h2>
                        </div>
                        {referrals.length > 0 ? referrals.map((r, i) => (
                            <div key={r.id} className="px-6 py-4 flex items-center justify-between border-t border-white/[0.04]">
                                <div>
                                    <p className="text-sm text-white">{r.name}</p>
                                    <p className="text-[10px] text-white/30">{r.date}</p>
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${r.status === 'converted' ? 'bg-emerald-500/10 text-emerald-400' : r.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/[0.04] text-white/30'}`}>
                                    {r.status}
                                </span>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-white/20 text-sm">No referrals yet. Share your link to get started!</div>
                        )}
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                        <h2 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-4 flex items-center gap-2">
                            <Crown className="w-3 h-3 text-starforge-gold" /> Rewards Tiers
                        </h2>
                        <div className="space-y-4">
                            {rewards.map((tier, i) => {
                                const unlocked = successfulReferrals >= tier.threshold;
                                return (
                                    <div key={tier.id} className={`flex items-center gap-4 p-3 rounded-lg ${unlocked ? 'bg-starforge-gold/5 border border-starforge-gold/20' : 'bg-white/[0.02]'}`}>
                                        <span className="text-xl">{tier.icon}</span>
                                        <div className="flex-1">
                                            <p className={`text-sm ${unlocked ? 'text-starforge-gold font-semibold' : 'text-white/60'}`}>{tier.reward}</p>
                                            <p className="text-[10px] text-white/30">{tier.threshold} referrals needed</p>
                                        </div>
                                        {unlocked && <Check className="w-4 h-4 text-starforge-gold" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
