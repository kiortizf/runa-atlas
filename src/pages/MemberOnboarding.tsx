import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles, ArrowRight, ArrowLeft, Check, BookOpen, Heart,
    Shield, Dna, Users, Crown, Compass, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

// ═══════════════════════════════════════════
// MEMBER ONBOARDING — Reading Profile Setup
// ═══════════════════════════════════════════

const STEPS = [
    { title: 'Welcome', icon: Sparkles },
    { title: 'Reading Preferences', icon: BookOpen },
    { title: 'Ready!', icon: Crown },
];

const GENRES = [
    'Fantasy', 'Science Fiction', 'Literary Fiction', 'Horror', 'Romance',
    'Mystery/Thriller', 'Historical Fiction', 'Magical Realism', 'Dystopian',
    'Dark Fantasy', 'New Weird', 'Afrofuturism', 'Climate Fiction', 'Cyberpunk',
    'Gothic', 'Young Adult', 'Short Stories', 'Poetry',
];

const READING_PACE = [
    { id: 'casual', label: 'Casual', desc: '1–2 books/month' },
    { id: 'moderate', label: 'Moderate', desc: '3–5 books/month' },
    { id: 'avid', label: 'Avid', desc: '6+ books/month' },
];

const CONTENT_PREFS = [
    { id: 'mild', label: 'Keep it mild', desc: 'Avoid graphic content' },
    { id: 'moderate', label: 'Some edge', desc: 'Moderate intensity is fine' },
    { id: 'anything', label: 'Anything goes', desc: 'I can handle it all' },
];

export default function MemberOnboarding() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);

    // Form state
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [readingPace, setReadingPace] = useState('');
    const [contentPref, setContentPref] = useState('');
    const [wantsDNA, setWantsDNA] = useState(true);
    const [wantsCompatibility, setWantsCompatibility] = useState(true);

    const toggleGenre = (g: string) => {
        setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    };

    const canProceed = () => {
        if (step === 1) return selectedGenres.length > 0;
        return true;
    };

    const handleComplete = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                favoriteGenres: selectedGenres,
                readingPace,
                contentPreference: contentPref,
                wantsBookDNA: wantsDNA,
                wantsReaderCompatibility: wantsCompatibility,
                onboardingCompleted: true,
                onboardingCompletedAt: Timestamp.now(),
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to save onboarding:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-void-black flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-8">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex-1 flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                ${i < step ? 'bg-aurora-teal text-void-black' : i === step ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/40' : 'bg-white/[0.04] text-white/30 border border-white/[0.08]'}`}>
                                {i < step ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px transition-colors ${i < step ? 'bg-aurora-teal/40' : 'bg-white/[0.06]'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div key={step}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 md:p-12"
                    >
                        {/* STEP 0: Welcome */}
                        {step === 0 && (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-aurora-teal/10 flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="w-10 h-10 text-aurora-teal" />
                                </div>
                                <h1 className="font-display text-4xl text-white tracking-wide mb-4">
                                    WELCOME TO <span className="text-aurora-teal">RÜNA ATLAS</span>
                                </h1>
                                <p className="text-text-secondary max-w-lg mx-auto mb-8 leading-relaxed">
                                    Let's set up your reading profile. This takes about 1 minute and helps us
                                    personalize your experience — from book recommendations to reader matching.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                                    {[
                                        { icon: BookOpen, label: 'Discover new stories' },
                                        { icon: Dna, label: 'Get your Book DNA' },
                                        { icon: Users, label: 'Find reader matches' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                                            <item.icon className="w-4 h-4 text-aurora-teal flex-none" />
                                            <span className="text-xs text-white/70">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 1: Reading Preferences */}
                        {step === 1 && (
                            <div>
                                <h2 className="font-display text-3xl text-white tracking-wide mb-2">YOUR <span className="text-aurora-teal">READING</span></h2>
                                <p className="text-text-secondary text-sm mb-8">Tell us what you love to read.</p>

                                <div className="space-y-8">
                                    {/* Genres */}
                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-3">Favorite Genres (select all that apply) *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {GENRES.map(g => (
                                                <button key={g} onClick={() => toggleGenre(g)}
                                                    className={`px-3 py-1.5 rounded-full text-xs border transition-all
                            ${selectedGenres.includes(g) ? 'bg-aurora-teal/20 border-aurora-teal/40 text-aurora-teal' : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:border-white/20'}`}>
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Reading Pace */}
                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-3">Reading Pace</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {READING_PACE.map(p => (
                                                <button key={p.id} onClick={() => setReadingPace(p.id)}
                                                    className={`p-4 rounded-lg border text-left transition-all
                            ${readingPace === p.id ? 'bg-aurora-teal/10 border-aurora-teal/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'}`}>
                                                    <p className={`text-sm font-semibold ${readingPace === p.id ? 'text-white' : 'text-white/60'}`}>{p.label}</p>
                                                    <p className="text-[11px] text-white/30 mt-1">{p.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Content Preferences */}
                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-3">Content Comfort Level</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {CONTENT_PREFS.map(c => (
                                                <button key={c.id} onClick={() => setContentPref(c.id)}
                                                    className={`p-4 rounded-lg border text-left transition-all
                            ${contentPref === c.id ? 'bg-aurora-teal/10 border-aurora-teal/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'}`}>
                                                    <p className={`text-sm font-semibold ${contentPref === c.id ? 'text-white' : 'text-white/60'}`}>{c.label}</p>
                                                    <p className="text-[11px] text-white/30 mt-1">{c.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Feature Toggles */}
                                    <div className="space-y-4">
                                        <label className="text-xs text-white/60 uppercase tracking-wider block">Features</label>
                                        {[
                                            { label: 'Enable Book DNA', desc: 'Build your unique reading personality profile', val: wantsDNA, set: setWantsDNA, icon: Dna },
                                            { label: 'Enable Reader Compatibility', desc: 'Get matched with readers who share your taste', val: wantsCompatibility, set: setWantsCompatibility, icon: Heart },
                                        ].map((item, i) => (
                                            <button key={i} onClick={() => item.set(!item.val)}
                                                className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/15 transition-colors">
                                                <div className="flex items-center gap-3 text-left">
                                                    <item.icon className={`w-4 h-4 flex-none ${item.val ? 'text-aurora-teal' : 'text-white/30'}`} />
                                                    <div>
                                                        <p className="text-sm text-white">{item.label}</p>
                                                        <p className="text-[11px] text-white/30">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${item.val ? 'bg-aurora-teal/30' : 'bg-white/10'}`}>
                                                    <div className={`w-4 h-4 rounded-full transition-all ${item.val ? 'bg-aurora-teal ml-5' : 'bg-white/30 ml-1'}`} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Complete */}
                        {step === 2 && (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-aurora-teal/10 flex items-center justify-center mx-auto mb-6">
                                    <Crown className="w-10 h-10 text-aurora-teal" />
                                </div>
                                <h2 className="font-display text-4xl text-white tracking-wide mb-4">
                                    YOU'RE <span className="text-aurora-teal">ALL SET</span>
                                </h2>
                                <p className="text-text-secondary max-w-md mx-auto mb-8">
                                    Your reading profile is ready. Here's what's waiting for you:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                                    {[
                                        { icon: BookOpen, label: 'Browse Catalog', desc: 'Discover speculative fiction' },
                                        { icon: Dna, label: 'Book DNA', desc: 'Your reading personality' },
                                        { icon: Compass, label: 'Content Compass', desc: 'Community content warnings' },
                                        { icon: Star, label: 'Passage Collections', desc: 'Save your favorite lines' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 bg-white/[0.03] rounded-lg border border-white/[0.05] text-left">
                                            <div className="w-8 h-8 rounded bg-aurora-teal/10 flex items-center justify-center flex-none">
                                                <item.icon className="w-4 h-4 text-aurora-teal" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-semibold">{item.label}</p>
                                                <p className="text-[11px] text-white/40">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <button onClick={() => setStep(s => Math.max(0, s - 1))}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-white/60 hover:text-white border border-white/[0.06] hover:border-white/15'}`}>
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    {step < 2 ? (
                        <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${canProceed() ? 'bg-aurora-teal text-void-black hover:bg-aurora-teal/90' : 'bg-white/[0.06] text-white/20 cursor-not-allowed'}`}>
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={handleComplete} disabled={saving}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold bg-aurora-teal text-void-black hover:bg-aurora-teal/90 transition-all">
                            {saving ? 'Setting up...' : 'Go to Dashboard'} <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
