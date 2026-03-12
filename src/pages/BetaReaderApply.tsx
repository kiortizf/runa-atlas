import { useState } from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, ArrowRight, ArrowLeft, Check, User, MessageCircle,
    Target, Star, Shield, Sparkles, Clock, Heart, Zap, Send,
    CheckCircle2, AlertCircle, Fingerprint
} from 'lucide-react';
import NDASigningModal from '../components/NDASigningModal';
import type { NDASignatureRecord } from '../hooks/useNDASigning';

// ═══════════════════════════════════════════════
// BETA READER APPLICATION — Multi-step signup form
// ═══════════════════════════════════════════════

import { GENRE_PICKER_OPTIONS } from '../data/genreData';

const GENRES = GENRE_PICKER_OPTIONS;

const READING_SPEEDS = [
    { id: 'slow', label: 'Slow & Careful', desc: '1-2 chapters/week', icon: '🐢' },
    { id: 'moderate', label: 'Steady Reader', desc: '3-5 chapters/week', icon: '📖' },
    { id: 'fast', label: 'Devourer', desc: '5+ chapters/week', icon: '🔥' },
];

const FEEDBACK_STYLES = [
    { id: 'detailed', label: 'Deep Dive', desc: 'Paragraph-level notes, thorough analysis', icon: Target },
    { id: 'big_picture', label: 'Big Picture', desc: 'High-level impressions, pacing, flow', icon: Star },
    { id: 'emotional', label: 'Emotional Lens', desc: 'How the story made me feel, moment by moment', icon: Heart },
    { id: 'technical', label: 'Craft Focus', desc: 'Prose quality, structure, dialogue, POV', icon: Zap },
];

const CONTENT_COMFORT = [
    'Violence / Gore', 'Sexual Content', 'Body Horror', 'Psychological Horror',
    'Child Endangerment', 'Substance Abuse', 'Self-Harm', 'Graphic Death',
];

export default function BetaReaderApply() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form data
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
    const [readingSpeed, setReadingSpeed] = useState('');
    const [feedbackStyle, setFeedbackStyle] = useState('');
    const [contentComfort, setContentComfort] = useState<Set<string>>(new Set());
    const [whyBetaRead, setWhyBetaRead] = useState('');
    const [favoriteBooks, setFavoriteBooks] = useState('');
    const [agreeNda, setAgreeNda] = useState(false);
    const [ndaSignatureRecord, setNdaSignatureRecord] = useState<NDASignatureRecord | null>(null);
    const [showNDAModal, setShowNDAModal] = useState(false);

    const toggleGenre = (g: string) => {
        setSelectedGenres(prev => {
            const n = new Set(prev);
            n.has(g) ? n.delete(g) : n.add(g);
            return n;
        });
    };

    const toggleComfort = (c: string) => {
        setContentComfort(prev => {
            const n = new Set(prev);
            n.has(c) ? n.delete(c) : n.add(c);
            return n;
        });
    };

    const canProceed = () => {
        switch (step) {
            case 0: return displayName.trim().length > 0;
            case 1: return selectedGenres.size >= 2;
            case 2: return readingSpeed !== '' && feedbackStyle !== '';
            case 3: return whyBetaRead.trim().length > 20;
            case 4: return ndaSignatureRecord !== null;
            default: return true;
        }
    };

    const handleSubmit = async () => {
        if (!user || submitting) return;
        setSubmitting(true);
        try {
            await setDoc(doc(db, 'beta_applications', user.uid), {
                userId: user.uid,
                email: user.email,
                displayName,
                bio,
                genres: Array.from(selectedGenres),
                readingSpeed,
                feedbackStyle,
                contentComfort: Array.from(contentComfort),
                whyBetaRead,
                favoriteBooks,
                agreeNda: true,
                ndaSignatureId: ndaSignatureRecord?.id || null,
                ndaDocumentHash: ndaSignatureRecord?.documentHash || null,
                ndaSignedAt: ndaSignatureRecord?.signedAt || null,
                status: 'pending',
                tier: 'New Reader',
                appliedAt: Timestamp.now(),
            });
            setSubmitted(true);
        } catch (e: any) {
            console.error('Application submit failed:', e);
            alert(`Submit failed: ${e?.message || e}`);
        }
        setSubmitting(false);
    };

    const STEPS = [
        { label: 'About You', icon: User },
        { label: 'Genre Preferences', icon: BookOpen },
        { label: 'Reading Style', icon: Clock },
        { label: 'Motivation', icon: MessageCircle },
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
                        Thank you, {displayName}! We'll review your application within 48 hours.
                        You'll receive a notification when you're approved.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/beta-reader')}
                            className="px-6 py-3 bg-amber-400 text-void-black font-semibold text-sm uppercase tracking-widest rounded-sm hover:bg-amber-300 transition-all flex items-center justify-center gap-2">
                            Go to Beta Reader Hub <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate('/for-beta-readers')}
                            className="px-6 py-3 border border-white/[0.15] text-white text-sm uppercase tracking-widest rounded-sm hover:border-amber-400/40 transition-all">
                            Back to Overview
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-void-black text-white">
            {/* Header */}
            <div className="border-b border-white/[0.06]">
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-white">Beta Reader Application</h1>
                            <p className="text-xs text-text-secondary">Join the Runa Atlas beta reader program</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-1">
                        {STEPS.map((s, i) => {
                            const StepIcon = s.icon;
                            const isActive = i === step;
                            const isDone = i < step;
                            return (
                                <div key={i} className="flex items-center flex-1">
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all
                                        ${isActive ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            isDone ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                'bg-white/[0.02] text-text-secondary border border-white/[0.06]'}`}>
                                        {isDone ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                                        <span className="hidden sm:inline">{s.label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`flex-1 h-px mx-1 ${isDone ? 'bg-emerald-400/30' : 'bg-white/[0.06]'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-3xl mx-auto px-6 py-10">
                <AnimatePresence mode="wait">
                    {/* ═══ STEP 0: ABOUT YOU ═══ */}
                    {step === 0 && (
                        <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <h2 className="font-display text-2xl text-white tracking-wide mb-2">TELL US ABOUT YOURSELF</h2>
                            <p className="text-text-secondary text-sm mb-8">Basic info so authors know who's reading their manuscript.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-2">Display Name *</label>
                                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                        placeholder="How you'd like to be credited"
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-2">Short Bio</label>
                                    <textarea value={bio} onChange={e => setBio(e.target.value)}
                                        placeholder="Tell us about your reading background, what you look for in books, and any relevant experience..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-amber-500/40 resize-none" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ STEP 1: GENRES ═══ */}
                    {step === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <h2 className="font-display text-2xl text-white tracking-wide mb-2">GENRE PREFERENCES</h2>
                            <p className="text-text-secondary text-sm mb-8">Select at least 2 genres you'd enjoy beta reading. This helps us match you with the right manuscripts.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {GENRES.map(g => {
                                    const selected = selectedGenres.has(g);
                                    return (
                                        <button key={g} onClick={() => toggleGenre(g)}
                                            className={`px-4 py-3 rounded-lg border text-sm text-left transition-all
                                                ${selected ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                                    'bg-white/[0.02] border-white/[0.06] text-text-secondary hover:border-white/[0.12] hover:text-white'}`}>
                                            {selected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                                            {g}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-text-secondary mt-4">{selectedGenres.size} selected (min 2)</p>
                        </motion.div>
                    )}

                    {/* ═══ STEP 2: READING STYLE ═══ */}
                    {step === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <h2 className="font-display text-2xl text-white tracking-wide mb-2">READING STYLE</h2>
                            <p className="text-text-secondary text-sm mb-8">How fast do you read, and what kind of feedback do you naturally give?</p>

                            <div className="mb-8">
                                <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-3">Reading Speed *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {READING_SPEEDS.map(s => (
                                        <button key={s.id} onClick={() => setReadingSpeed(s.id)}
                                            className={`p-4 rounded-lg border text-center transition-all
                                                ${readingSpeed === s.id ? 'bg-amber-500/10 border-amber-500/30' :
                                                    'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
                                            <span className="text-2xl block mb-2">{s.icon}</span>
                                            <p className={`text-sm font-semibold ${readingSpeed === s.id ? 'text-amber-400' : 'text-white'}`}>{s.label}</p>
                                            <p className="text-[10px] text-text-secondary mt-1">{s.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-3">Feedback Style *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {FEEDBACK_STYLES.map(f => {
                                        const Icon = f.icon;
                                        return (
                                            <button key={f.id} onClick={() => setFeedbackStyle(f.id)}
                                                className={`p-4 rounded-lg border text-left transition-all flex items-start gap-3
                                                    ${feedbackStyle === f.id ? 'bg-amber-500/10 border-amber-500/30' :
                                                        'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
                                                <Icon className={`w-5 h-5 flex-none mt-0.5 ${feedbackStyle === f.id ? 'text-amber-400' : 'text-text-secondary'}`} />
                                                <div>
                                                    <p className={`text-sm font-semibold ${feedbackStyle === f.id ? 'text-amber-400' : 'text-white'}`}>{f.label}</p>
                                                    <p className="text-[10px] text-text-secondary mt-1">{f.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ STEP 3: MOTIVATION ═══ */}
                    {step === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <h2 className="font-display text-2xl text-white tracking-wide mb-2">YOUR MOTIVATION</h2>
                            <p className="text-text-secondary text-sm mb-8">Help us understand what drives you as a reader.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-2">Why do you want to beta read? *</label>
                                    <textarea value={whyBetaRead} onChange={e => setWhyBetaRead(e.target.value)}
                                        placeholder="What excites you about reading manuscripts before publication? What do you hope to contribute?"
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-amber-500/40 resize-none" />
                                    <p className="text-[10px] text-text-secondary mt-1">{whyBetaRead.length} / 20 min characters</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-2">Favorite Books (Optional)</label>
                                    <textarea value={favoriteBooks} onChange={e => setFavoriteBooks(e.target.value)}
                                        placeholder="List 2-5 books you love — this helps us understand your taste DNA"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-amber-500/40 resize-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold block mb-3">Content Comfort Level</label>
                                    <p className="text-xs text-text-secondary mb-3">Select topics you're comfortable encountering in manuscripts. Unselected topics won't disqualify you — we'll just avoid matching you with those manuscripts.</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {CONTENT_COMFORT.map(c => {
                                            const selected = contentComfort.has(c);
                                            return (
                                                <button key={c} onClick={() => toggleComfort(c)}
                                                    className={`px-3 py-2 rounded border text-xs text-left transition-all
                                                        ${selected ? 'bg-white/[0.06] border-white/[0.15] text-white' :
                                                            'bg-white/[0.02] border-white/[0.06] text-text-secondary hover:border-white/[0.12]'}`}>
                                                    {selected ? <Check className="w-3 h-3 inline mr-1" /> : null}
                                                    {c}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ STEP 4: NDA & SUBMIT ═══ */}
                    {step === 4 && (
                        <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <h2 className="font-display text-2xl text-white tracking-wide mb-2">CONFIDENTIALITY AGREEMENT</h2>
                            <p className="text-text-secondary text-sm mb-8">This legally binding agreement protects both you and the authors whose manuscripts you'll read.</p>

                            {/* NDA Status */}
                            {ndaSignatureRecord ? (
                                <div className="p-6 bg-emerald-500/[0.04] border border-emerald-500/15 rounded-xl mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-emerald-400">NDA Signed & Verified</h3>
                                            <p className="text-[10px] text-text-secondary">Cryptographically secured with ECDSA P-256</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-text-secondary">Document Hash (SHA-256)</span>
                                        </div>
                                        <code className="text-[10px] text-aurora-teal font-mono break-all block p-2 bg-white/[0.02] rounded">
                                            {ndaSignatureRecord.documentHash}
                                        </code>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {ndaSignatureRecord.legalFramework.map(f => (
                                                <span key={f} className="text-[9px] text-amber-400/70 px-2 py-0.5 bg-amber-500/[0.06] rounded border border-amber-500/10">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#0f0f19] rounded-lg p-2 flex-none">
                                                <img src={ndaSignatureRecord.signatureImage} alt="Signature" className="max-h-10 opacity-70" />
                                            </div>
                                            <div className="text-xs">
                                                <p className="text-white">{ndaSignatureRecord.signerDisplayName}</p>
                                                <p className="text-text-secondary text-[10px]">{ndaSignatureRecord.signerEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-white/[0.02] border border-white/[0.08] rounded-xl mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-sm font-semibold text-white">Beta Reader Non-Disclosure Agreement</h3>
                                    </div>
                                    <p className="text-xs text-text-secondary mb-5 leading-relaxed">
                                        You must sign a legally binding NDA before submitting your application. This agreement is secured with
                                        cryptographic digital signatures (ECDSA P-256 + SHA-256) and is enforceable under the ESIGN Act,
                                        UETA, and EU eIDAS Regulation.
                                    </p>
                                    <button
                                        onClick={() => setShowNDAModal(true)}
                                        className="w-full px-6 py-4 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/15 transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <Fingerprint className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-semibold text-amber-400">Open & Sign NDA</span>
                                    </button>
                                </div>
                            )}

                            {/* Application Summary */}
                            <div className="mt-8 p-5 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl">
                                <h4 className="text-xs uppercase tracking-widest text-amber-400/60 font-semibold mb-3 flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Application Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div><span className="text-text-secondary">Name:</span> <span className="text-white ml-1">{displayName}</span></div>
                                    <div><span className="text-text-secondary">Genres:</span> <span className="text-white ml-1">{Array.from(selectedGenres).slice(0, 3).join(', ')}{selectedGenres.size > 3 ? ` +${selectedGenres.size - 3}` : ''}</span></div>
                                    <div><span className="text-text-secondary">Speed:</span> <span className="text-white ml-1 capitalize">{readingSpeed}</span></div>
                                    <div><span className="text-text-secondary">Style:</span> <span className="text-white ml-1 capitalize">{feedbackStyle?.replace('_', ' ')}</span></div>
                                    <div className="col-span-2">
                                        <span className="text-text-secondary">NDA:</span>
                                        <span className={`ml-1 ${ndaSignatureRecord ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {ndaSignatureRecord ? '✓ Signed & Verified' : '⏳ Pending signature'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
                    <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                        className="px-5 py-2.5 text-sm text-text-secondary hover:text-white transition-colors flex items-center gap-2 disabled:opacity-20">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="flex items-center gap-2">
                        {STEPS.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-colors
                                ${i === step ? 'bg-amber-400' : i < step ? 'bg-emerald-400' : 'bg-white/10'}`} />
                        ))}
                    </div>

                    {step < 4 ? (
                        <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                            className="px-6 py-2.5 bg-amber-500/10 text-amber-400 text-sm font-semibold border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={!canProceed() || submitting}
                            className="px-8 py-2.5 bg-amber-400 text-void-black text-sm font-semibold uppercase tracking-widest rounded-sm hover:bg-amber-300 transition-all flex items-center gap-2 disabled:opacity-30">
                            {submitting ? 'Submitting…' : 'Submit Application'} <Send className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Not logged in warning */}
                {!user && (
                    <div className="mt-6 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-none" />
                        <div>
                            <p className="text-sm text-red-400 font-semibold">You must be logged in to apply</p>
                            <p className="text-xs text-text-secondary">Create an account or log in to submit your beta reader application.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* NDA Signing Modal */}
            <AnimatePresence>
                {showNDAModal && (
                    <NDASigningModal
                        ndaType="beta_reader"
                        onSigned={(record) => {
                            setNdaSignatureRecord(record);
                            setAgreeNda(true);
                            setShowNDAModal(false);
                        }}
                        onCancel={() => setShowNDAModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
