import { useState } from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, ArrowRight, ArrowLeft, Check, User, Star,
    Shield, Sparkles, Send, CheckCircle2, Fingerprint,
    ExternalLink, Globe, MessageSquare
} from 'lucide-react';
import NDASigningModal from '../components/NDASigningModal';
import type { NDASignatureRecord } from '../hooks/useNDASigning';

// ═══════════════════════════════════════════════
// ARC READER APPLICATION — Advance Reader Copy signup
// ═══════════════════════════════════════════════

import { GENRE_PICKER_OPTIONS } from '../data/genreData';

const GENRES = GENRE_PICKER_OPTIONS;

const REVIEW_PLATFORMS = [
    { id: 'amazon', label: 'Amazon', icon: '📦', desc: 'Amazon book reviews' },
    { id: 'goodreads', label: 'Goodreads', icon: '📚', desc: 'Goodreads reader reviews' },
    { id: 'bookstagram', label: 'Bookstagram', icon: '📸', desc: 'Instagram book community' },
    { id: 'booktok', label: 'BookTok', icon: '🎵', desc: 'TikTok book community' },
    { id: 'blog', label: 'Book Blog', icon: '✍️', desc: 'Personal blog or newsletter' },
    { id: 'youtube', label: 'BookTube', icon: '🎬', desc: 'YouTube book reviews' },
    { id: 'podcast', label: 'Podcast', icon: '🎙️', desc: 'Book review podcast' },
    { id: 'storygraph', label: 'StoryGraph', icon: '📊', desc: 'StoryGraph reviews' },
];

const REVIEW_FREQUENCY = [
    { id: '1-2', label: '1-2 / month', desc: 'Casual reviewer' },
    { id: '3-5', label: '3-5 / month', desc: 'Regular reviewer' },
    { id: '5+', label: '5+ / month', desc: 'Prolific reviewer' },
];

export default function ARCReaderApply() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form data
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
    const [platforms, setPlatforms] = useState<Set<string>>(new Set());
    const [profileLinks, setProfileLinks] = useState<Record<string, string>>({});
    const [reviewFrequency, setReviewFrequency] = useState('');
    const [totalReviews, setTotalReviews] = useState('');
    const [whyARC, setWhyARC] = useState('');
    const [preferredFormats, setPreferredFormats] = useState<Set<string>>(new Set());

    // NDA state
    const [showNDAModal, setShowNDAModal] = useState(false);
    const [ndaSignatureRecord, setNdaSignatureRecord] = useState<NDASignatureRecord | null>(null);

    const toggleGenre = (g: string) => {
        setSelectedGenres(prev => {
            const n = new Set(prev);
            n.has(g) ? n.delete(g) : n.add(g);
            return n;
        });
    };

    const togglePlatform = (p: string) => {
        setPlatforms(prev => {
            const n = new Set(prev);
            n.has(p) ? n.delete(p) : n.add(p);
            return n;
        });
    };

    const toggleFormat = (f: string) => {
        setPreferredFormats(prev => {
            const n = new Set(prev);
            n.has(f) ? n.delete(f) : n.add(f);
            return n;
        });
    };

    const canProceed = () => {
        switch (step) {
            case 0: return displayName.trim().length > 0;
            case 1: return platforms.size >= 1 && reviewFrequency !== '';
            case 2: return selectedGenres.size >= 2;
            case 3: return ndaSignatureRecord !== null;
            default: return true;
        }
    };

    const handleSubmit = async () => {
        if (!user || submitting) return;
        setSubmitting(true);
        try {
            await setDoc(doc(db, 'arc_applications', user.uid), {
                userId: user.uid,
                email: user.email,
                displayName,
                genres: Array.from(selectedGenres),
                platforms: Array.from(platforms),
                profileLinks,
                reviewFrequency,
                totalReviews,
                whyARC,
                preferredFormats: Array.from(preferredFormats),
                ndaSignatureId: ndaSignatureRecord?.id || null,
                ndaDocumentHash: ndaSignatureRecord?.documentHash || null,
                ndaSignedAt: ndaSignatureRecord?.signedAt || null,
                status: 'pending',
                appliedAt: Timestamp.now(),
            });
            setSubmitted(true);
        } catch (e: any) {
            console.error('ARC application submit failed:', e);
            alert(`Submit failed: ${e?.message || e}`);
        }
        setSubmitting(false);
    };

    const STEPS = [
        { label: 'About You', icon: User },
        { label: 'Review Platforms', icon: Globe },
        { label: 'Genre Preferences', icon: BookOpen },
        { label: 'Agreement', icon: Shield },
    ];

    if (submitted) {
        return (
            <div className="min-h-screen bg-void-black flex items-center justify-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md px-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 mx-auto flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="font-display text-3xl text-white tracking-wide mb-4">APPLICATION RECEIVED</h2>
                    <p className="text-text-secondary mb-8">
                        Thank you, {displayName}! We'll review your ARC reader application and notify you when you're approved.
                        You'll receive ARC copies for upcoming releases.
                    </p>
                    <button onClick={() => navigate('/')}
                        className="px-8 py-3 bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-starforge-gold/90 transition-colors">
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void-black py-24">
            <div className="max-w-3xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-starforge-gold/70 font-ui block mb-3">
                            Advance Reader Copy Program
                        </span>
                        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-4">
                            BECOME AN <span className="text-starforge-gold">ARC READER</span>
                        </h1>
                        <p className="text-text-secondary max-w-lg mx-auto text-sm">
                            Get early access to upcoming releases in exchange for honest reviews.
                            Help amplify marginalized voices in speculative fiction.
                        </p>
                    </motion.div>
                </div>

                {/* Step Progress */}
                <div className="flex items-center justify-center gap-0 mb-12">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center">
                            <button onClick={() => i < step && setStep(i)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all
                                    ${i === step ? 'bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/30' :
                                    i < step ? 'text-emerald-400 cursor-pointer hover:bg-emerald-500/5' : 'text-white/15 cursor-not-allowed'}`}>
                                {i < step ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                            {i < STEPS.length - 1 && <div className={`w-8 h-px mx-1 ${i < step ? 'bg-emerald-400/30' : 'bg-white/[0.06]'}`} />}
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <motion.div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-10">
                    <AnimatePresence mode="wait">

                        {/* ── STEP 0: About You ── */}
                        {step === 0 && (
                            <motion.div key="about" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="font-display text-xl text-white tracking-wide mb-6">ABOUT <span className="text-starforge-gold">YOU</span></h2>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-2">Display Name *</label>
                                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                            placeholder="How you'd like to be known"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-starforge-gold/40" />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-2">Why do you want to be an ARC reader?</label>
                                        <textarea value={whyARC} onChange={e => setWhyARC(e.target.value)}
                                            placeholder="Tell us about your passion for speculative fiction and reviewing..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-starforge-gold/40 resize-none" />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-2">Preferred ARC Formats</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['ePub', 'PDF', 'MOBI', 'Physical'].map(f => (
                                                <button key={f} onClick={() => toggleFormat(f)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border
                                                        ${preferredFormats.has(f) ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30' : 'bg-white/[0.02] text-white/30 border-white/[0.06] hover:border-white/[0.12]'}`}>
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 1: Review Platforms ── */}
                        {step === 1 && (
                            <motion.div key="platforms" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="font-display text-xl text-white tracking-wide mb-6">REVIEW <span className="text-starforge-gold">PLATFORMS</span></h2>
                                <p className="text-xs text-text-secondary mb-6">Select where you post reviews and provide profile links.</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                                    {REVIEW_PLATFORMS.map(p => (
                                        <button key={p.id} onClick={() => togglePlatform(p.id)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center
                                                ${platforms.has(p.id) ? 'bg-starforge-gold/10 border-starforge-gold/30 text-starforge-gold' : 'bg-white/[0.02] border-white/[0.06] text-white/25 hover:border-white/[0.12]'}`}>
                                            <span className="text-2xl">{p.icon}</span>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider">{p.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Profile links for selected platforms */}
                                {platforms.size > 0 && (
                                    <div className="space-y-3 mb-8">
                                        <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block">Profile Links (optional but recommended)</label>
                                        {Array.from(platforms).map(pid => {
                                            const platform = REVIEW_PLATFORMS.find(p => p.id === pid);
                                            return (
                                                <div key={pid} className="flex items-center gap-3">
                                                    <span className="text-lg w-8 text-center flex-shrink-0">{platform?.icon}</span>
                                                    <input type="url"
                                                        value={profileLinks[pid] || ''}
                                                        onChange={e => setProfileLinks({ ...profileLinks, [pid]: e.target.value })}
                                                        placeholder={`Your ${platform?.label} profile URL`}
                                                        className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-starforge-gold/40" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Review frequency */}
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-3">How often do you post book reviews? *</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {REVIEW_FREQUENCY.map(rf => (
                                            <button key={rf.id} onClick={() => setReviewFrequency(rf.id)}
                                                className={`p-4 rounded-xl border transition-all text-center
                                                    ${reviewFrequency === rf.id ? 'bg-starforge-gold/10 border-starforge-gold/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
                                                <p className={`text-sm font-semibold ${reviewFrequency === rf.id ? 'text-starforge-gold' : 'text-white/40'}`}>{rf.label}</p>
                                                <p className="text-[10px] text-white/20 mt-1">{rf.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Approximate total reviews */}
                                <div className="mt-6">
                                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-2">Approximate total reviews posted</label>
                                    <input type="text" value={totalReviews} onChange={e => setTotalReviews(e.target.value)}
                                        placeholder="e.g., 150+"
                                        className="w-full max-w-xs px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-starforge-gold/40" />
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: Genre Preferences ── */}
                        {step === 2 && (
                            <motion.div key="genres" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="font-display text-xl text-white tracking-wide mb-2">GENRE <span className="text-starforge-gold">PREFERENCES</span></h2>
                                <p className="text-xs text-text-secondary mb-6">
                                    Select genres you love reading and reviewing. Pick at least 2.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {GENRES.map(g => (
                                        <button key={g} onClick={() => toggleGenre(g)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                                                ${selectedGenres.has(g) ? 'bg-starforge-gold/10 border-starforge-gold/30 text-starforge-gold' : 'bg-white/[0.02] border-white/[0.06] text-white/25 hover:border-white/[0.12] hover:text-white/40'}`}>
                                            <span className="text-xs font-medium">{g}</span>
                                            {selectedGenres.has(g) && <Check className="w-3.5 h-3.5 ml-auto" />}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-center text-[10px] text-white/20 mt-4">
                                    {selectedGenres.size} / 2 minimum selected
                                </p>
                            </motion.div>
                        )}

                        {/* ── STEP 3: Agreement & Submit ── */}
                        {step === 3 && (
                            <motion.div key="agreement" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="font-display text-xl text-white tracking-wide mb-2">REVIEW <span className="text-starforge-gold">AGREEMENT</span></h2>
                                <p className="text-xs text-text-secondary mb-6">
                                    ARC readers commit to posting honest reviews and respecting pre-publication embargoes.
                                </p>

                                {/* NDA Status */}
                                {!ndaSignatureRecord ? (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-white/[0.02] border border-white/[0.08] rounded-xl text-center">
                                            <Fingerprint className="w-10 h-10 text-starforge-gold/40 mx-auto mb-3" />
                                            <h3 className="text-sm text-white font-semibold mb-2">ARC Reader Agreement Required</h3>
                                            <p className="text-xs text-text-secondary mb-4 max-w-md mx-auto">
                                                Review and sign the ARC Reader Confidentiality & Review Agreement.
                                                This covers pre-publication embargo, review commitment, and FTC disclosure.
                                            </p>
                                            <button onClick={() => setShowNDAModal(true)}
                                                className="px-6 py-3 bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-starforge-gold/90 transition-colors flex items-center gap-2 mx-auto">
                                                <Shield className="w-4 h-4" /> Open & Sign Agreement
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Signed confirmation */}
                                        <div className="p-6 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm text-emerald-400 font-semibold">Agreement Signed & Verified</h3>
                                                    <p className="text-[10px] text-text-secondary">Cryptographically secured with ECDSA P-256</p>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-text-secondary space-y-1">
                                                <p>Document Hash (SHA-256)</p>
                                                <p className="font-mono text-[9px] text-emerald-400/60 bg-emerald-500/[0.05] px-3 py-1.5 rounded break-all">{ndaSignatureRecord.documentHash}</p>
                                            </div>
                                        </div>

                                        {/* Application Summary */}
                                        <div className="p-6 bg-starforge-gold/[0.02] border border-starforge-gold/10 rounded-xl">
                                            <h3 className="text-[10px] uppercase tracking-widest text-starforge-gold font-semibold flex items-center gap-2 mb-4">
                                                <Sparkles className="w-3.5 h-3.5" /> Application Summary
                                            </h3>
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-xs">
                                                <div><span className="text-text-secondary">Name:</span> <span className="text-white ml-2">{displayName}</span></div>
                                                <div><span className="text-text-secondary">Platforms:</span> <span className="text-white ml-2">{Array.from(platforms).map(p => REVIEW_PLATFORMS.find(rp => rp.id === p)?.label).join(', ')}</span></div>
                                                <div><span className="text-text-secondary">Genres:</span> <span className="text-white ml-2">{Array.from(selectedGenres).join(', ')}</span></div>
                                                <div><span className="text-text-secondary">Frequency:</span> <span className="text-white ml-2">{reviewFrequency} reviews/mo</span></div>
                                                <div className="col-span-2"><span className="text-text-secondary">Agreement:</span> <span className="text-emerald-400 ml-2">✓ Signed & Verified</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
                        className="flex items-center gap-2 text-xs text-text-secondary hover:text-white transition-colors disabled:opacity-0 disabled:pointer-events-none">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="flex gap-1.5">
                        {STEPS.map((_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === step ? 'bg-starforge-gold scale-110' : i < step ? 'bg-emerald-400/40' : 'bg-white/[0.06]'}`} />
                        ))}
                    </div>

                    {step < STEPS.length - 1 ? (
                        <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-starforge-gold/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={!canProceed() || submitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-starforge-gold text-void-black text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-starforge-gold/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
                            {submitting ? (
                                <><Sparkles className="w-4 h-4 animate-spin" /> Submitting...</>
                            ) : (
                                <><Send className="w-4 h-4" /> Submit Application</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* NDA Signing Modal */}
            <NDASigningModal
                isOpen={showNDAModal}
                onClose={() => setShowNDAModal(false)}
                templateId="arc_reader"
                onSigned={(record) => {
                    setNdaSignatureRecord(record);
                    setShowNDAModal(false);
                }}
            />
        </div>
    );
}
