import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, BookOpen, Feather, Sparkles, ArrowRight, ArrowLeft,
    Check, PenTool, Target, Globe, Heart, Zap, Eye, Upload,
    BookMarked, Flame, Star, Crown, Coffee, Sunrise, Moon, Sun
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const STEPS = [
    { title: 'Welcome', icon: Sparkles },
    { title: 'Your Identity', icon: User },
    { title: 'Your Writing', icon: Feather },
    { title: 'Your Goals', icon: Target },
    { title: 'Ready to Go', icon: Zap },
];

const GENRES = [
    'Fantasy', 'Science Fiction', 'Literary Fiction', 'Horror', 'Romance',
    'Mystery/Thriller', 'Historical Fiction', 'Magical Realism', 'Dystopian',
    'Dark Fantasy', 'New Weird', 'Afrofuturism', 'Climate Fiction', 'Cyberpunk',
    'Gothic', 'Young Adult', 'Short Stories',
];

const WRITING_STYLES = [
    { id: 'plotter', label: 'Plotter', icon: Target, desc: 'I meticulously outline before writing' },
    { id: 'pantser', label: 'Pantser', icon: Flame, desc: 'I write by the seat of my pants' },
    { id: 'plantser', label: 'Plantser', icon: Star, desc: 'A mix — loose outline, then improvise' },
];

const WRITING_TIMES = [
    { id: 'morning', label: 'Morning', icon: Sunrise },
    { id: 'afternoon', label: 'Afternoon', icon: Sun },
    { id: 'evening', label: 'Evening', icon: Coffee },
    { id: 'night', label: 'Night Owl', icon: Moon },
];

export default function AuthorOnboarding() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);

    // Form state
    const [penName, setPenName] = useState('');
    const [bio, setBio] = useState('');
    const [website, setWebsite] = useState('');
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [writingStyle, setWritingStyle] = useState('');
    const [writingTime, setWritingTime] = useState('');
    const [dailyGoal, setDailyGoal] = useState(1000);
    const [weeklyGoal, setWeeklyGoal] = useState(5);
    const [wantsBeataReaders, setWantsBetaReaders] = useState(true);
    const [wantsAnalytics, setWantsAnalytics] = useState(true);
    const [hasManuscript, setHasManuscript] = useState<'yes' | 'no' | 'wip'>('wip');

    const toggleGenre = (g: string) => {
        setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    };

    const canProceed = () => {
        if (step === 1) return penName.trim().length > 0;
        if (step === 2) return selectedGenres.length > 0 && writingStyle;
        return true;
    };

    const handleComplete = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'authorProfiles', user.uid), {
                userId: user.uid,
                email: user.email,
                penName,
                bio,
                website,
                genres: selectedGenres,
                writingStyle,
                preferredWritingTime: writingTime,
                dailyWordGoal: dailyGoal,
                weeklySessionGoal: weeklyGoal,
                wantsBetaReaders: wantsBeataReaders,
                wantsAnalytics,
                manuscriptStatus: hasManuscript,
                onboardingCompleted: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            }, { merge: true });
            navigate('/creator');
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
                ${i < step ? 'bg-starforge-gold text-void-black' : i === step ? 'bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/40' : 'bg-white/[0.04] text-white/30 border border-white/[0.08]'}`}>
                                {i < step ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px transition-colors ${i < step ? 'bg-starforge-gold/40' : 'bg-white/[0.06]'}`} />
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
                                <div className="w-20 h-20 rounded-full bg-starforge-gold/10 flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="w-10 h-10 text-starforge-gold" />
                                </div>
                                <h1 className="font-display text-4xl text-white tracking-wide mb-4">
                                    WELCOME TO <span className="text-starforge-gold">RUNA ATLAS</span>
                                </h1>
                                <p className="text-text-secondary max-w-lg mx-auto mb-8 leading-relaxed">
                                    Let's set up your author profile. This takes about 2 minutes and helps us
                                    personalize your experience — from writing analytics to beta reader matching.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                                    {[
                                        { icon: PenTool, label: 'Set up your identity' },
                                        { icon: BookOpen, label: 'Tell us about your writing' },
                                        { icon: Target, label: 'Configure your goals' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                                            <item.icon className="w-4 h-4 text-starforge-gold flex-none" />
                                            <span className="text-xs text-white/70">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 1: Identity */}
                        {step === 1 && (
                            <div>
                                <h2 className="font-display text-3xl text-white tracking-wide mb-2">YOUR <span className="text-starforge-gold">IDENTITY</span></h2>
                                <p className="text-text-secondary text-sm mb-8">How do you want to be known?</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">Pen Name *</label>
                                        <input type="text" value={penName} onChange={e => setPenName(e.target.value)}
                                            placeholder="The name readers will see"
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-starforge-gold/40 focus:outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">Bio</label>
                                        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                                            placeholder="A short bio about yourself and your writing..."
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-starforge-gold/40 focus:outline-none transition-colors resize-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">Website / Portfolio</label>
                                        <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                                            placeholder="https://yoursite.com"
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-starforge-gold/40 focus:outline-none transition-colors" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Writing */}
                        {step === 2 && (
                            <div>
                                <h2 className="font-display text-3xl text-white tracking-wide mb-2">YOUR <span className="text-starforge-gold">WRITING</span></h2>
                                <p className="text-text-secondary text-sm mb-8">Help us understand your creative style.</p>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-3">Genres (select all that apply) *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {GENRES.map(g => (
                                                <button key={g} onClick={() => toggleGenre(g)}
                                                    className={`px-3 py-1.5 rounded-full text-xs border transition-all
                            ${selectedGenres.includes(g) ? 'bg-starforge-gold/20 border-starforge-gold/40 text-starforge-gold' : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:border-white/20'}`}>
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-3">Writing Style *</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {WRITING_STYLES.map(s => (
                                                <button key={s.id} onClick={() => setWritingStyle(s.id)}
                                                    className={`p-4 rounded-lg border text-left transition-all
                            ${writingStyle === s.id ? 'bg-starforge-gold/10 border-starforge-gold/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'}`}>
                                                    <s.icon className={`w-5 h-5 mb-2 ${writingStyle === s.id ? 'text-starforge-gold' : 'text-white/40'}`} />
                                                    <p className={`text-sm font-semibold ${writingStyle === s.id ? 'text-white' : 'text-white/60'}`}>{s.label}</p>
                                                    <p className="text-[11px] text-white/30 mt-1">{s.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-3">Preferred Writing Time</label>
                                        <div className="flex gap-3">
                                            {WRITING_TIMES.map(t => (
                                                <button key={t.id} onClick={() => setWritingTime(t.id)}
                                                    className={`flex-1 p-3 rounded-lg border text-center transition-all
                            ${writingTime === t.id ? 'bg-starforge-gold/10 border-starforge-gold/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15'}`}>
                                                    <t.icon className={`w-4 h-4 mx-auto mb-1 ${writingTime === t.id ? 'text-starforge-gold' : 'text-white/40'}`} />
                                                    <p className={`text-[11px] ${writingTime === t.id ? 'text-white' : 'text-white/40'}`}>{t.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-3">Do you have a manuscript ready?</label>
                                        <div className="flex gap-3">
                                            {([['yes', 'Yes, ready to submit'], ['wip', 'Work in progress'], ['no', 'Not yet — just exploring']] as const).map(([val, label]) => (
                                                <button key={val} onClick={() => setHasManuscript(val)}
                                                    className={`flex-1 p-3 rounded-lg border text-center text-xs transition-all
                            ${hasManuscript === val ? 'bg-starforge-gold/10 border-starforge-gold/30 text-white' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/15'}`}>
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Goals */}
                        {step === 3 && (
                            <div>
                                <h2 className="font-display text-3xl text-white tracking-wide mb-2">YOUR <span className="text-starforge-gold">GOALS</span></h2>
                                <p className="text-text-secondary text-sm mb-8">Set targets to keep your writing on track.</p>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-3">Daily Word Count Goal</label>
                                        <div className="flex items-center gap-4">
                                            <input type="range" min={100} max={5000} step={100} value={dailyGoal}
                                                onChange={e => setDailyGoal(Number(e.target.value))}
                                                className="flex-1 accent-[#C9A84C]" />
                                            <div className="w-24 text-center bg-white/[0.04] border border-white/[0.1] rounded-lg py-2">
                                                <span className="text-lg text-starforge-gold font-semibold">{dailyGoal.toLocaleString()}</span>
                                                <p className="text-[9px] text-white/30">words/day</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-white/20 mt-1 px-1">
                                            <span>100</span><span>1,000</span><span>2,500</span><span>5,000</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-3">Weekly Writing Sessions Goal</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                                <button key={n} onClick={() => setWeeklyGoal(n)}
                                                    className={`flex-1 py-3 rounded-lg border text-center transition-all
                            ${weeklyGoal === n ? 'bg-starforge-gold/10 border-starforge-gold/30 text-starforge-gold font-semibold' : 'bg-white/[0.02] border-white/[0.06] text-white/30 hover:border-white/15'}`}>
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-white/20 mt-2 text-center">
                                            {weeklyGoal === 7 ? 'Every day! Ambitious.' : `${weeklyGoal} day${weeklyGoal > 1 ? 's' : ''} a week`}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs text-white/60 uppercase tracking-wider block">Feature Preferences</label>
                                        {[
                                            { label: 'Enable Beta Reader Matching', desc: 'Get matched with early readers for your manuscripts', val: wantsBeataReaders, set: setWantsBetaReaders },
                                            { label: 'Enable Writing Analytics', desc: 'Track word counts, streaks, pacing, and more', val: wantsAnalytics, set: setWantsAnalytics },
                                        ].map((item, i) => (
                                            <button key={i} onClick={() => item.set(!item.val)}
                                                className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/15 transition-colors">
                                                <div className="text-left">
                                                    <p className="text-sm text-white">{item.label}</p>
                                                    <p className="text-[11px] text-white/30">{item.desc}</p>
                                                </div>
                                                <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${item.val ? 'bg-starforge-gold/30' : 'bg-white/10'}`}>
                                                    <div className={`w-4 h-4 rounded-full transition-all ${item.val ? 'bg-starforge-gold ml-5' : 'bg-white/30 ml-1'}`} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Complete */}
                        {step === 4 && (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-starforge-gold/10 flex items-center justify-center mx-auto mb-6">
                                    <Crown className="w-10 h-10 text-starforge-gold" />
                                </div>
                                <h2 className="font-display text-4xl text-white tracking-wide mb-4">
                                    YOU'RE <span className="text-starforge-gold">ALL SET</span>
                                </h2>
                                <p className="text-text-secondary max-w-md mx-auto mb-8">
                                    Your author profile is ready. Here's what's waiting for you:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                                    {[
                                        { icon: PenTool, label: 'The Forge Editor', desc: 'Start writing immediately' },
                                        { icon: Eye, label: 'Creator Studio', desc: 'Track your progress' },
                                        { icon: Heart, label: 'Beta Reader Hub', desc: 'Get early feedback' },
                                        { icon: Globe, label: 'Author Profile', desc: 'Your public page' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 bg-white/[0.03] rounded-lg border border-white/[0.05] text-left">
                                            <div className="w-8 h-8 rounded bg-starforge-gold/10 flex items-center justify-center flex-none">
                                                <item.icon className="w-4 h-4 text-starforge-gold" />
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

                    {step < 4 ? (
                        <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${canProceed() ? 'bg-starforge-gold text-void-black hover:bg-starforge-gold/90' : 'bg-white/[0.06] text-white/20 cursor-not-allowed'}`}>
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={handleComplete} disabled={saving}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold bg-starforge-gold text-void-black hover:bg-starforge-gold/90 transition-all">
                            {saving ? 'Setting up...' : 'Launch My Dashboard'} <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
