import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, PenTool, Calendar, Star, ArrowRight, ChevronDown, ChevronUp,
    ThumbsUp, Send, Clock, Users, BookOpen, Video, Crown, LogIn, X, Heart, Eye
} from 'lucide-react';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, increment, onSnapshot, query, orderBy, where, serverTimestamp, Timestamp, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

// ─── Types ──────────────────────────────────────────
type AMA = {
    id: string;
    title: string;
    authorName: string;
    authorImage: string;
    authorBio: string;
    scheduledAt: Timestamp;
    status: 'upcoming' | 'live' | 'archived';
    description: string;
    questionCount: number;
};

type AMAQuestion = {
    id: string;
    text: string;
    askerName: string;
    askerId: string;
    upvotes: number;
    answer?: string;
    createdAt: any;
};

type WritingJournal = {
    id: string;
    title: string;
    authorName: string;
    authorImage: string;
    content: string;
    excerpt: string;
    publishedAt: Timestamp;
    tags: string[];
    likes: number;
    bookTitle?: string;
};

type OfficeHoursSlot = {
    id: string;
    authorName: string;
    authorImage: string;
    date: Timestamp;
    duration: number; // minutes
    topic: string;
    spotsTotal: number;
    spotsTaken: number;
    tier: 'architect'; // members-only
    bookedBy: string[];
};

// ─── Seed Data ──────────────────────────────────────
const SEED_AMAS: AMA[] = [
    {
        id: 'ama1', title: 'Ask Me Anything: Writing Dark Fantasy', authorName: 'Elara Vance',
        authorImage: 'https://picsum.photos/seed/elara/200/200', authorBio: 'Author of The Obsidian Crown',
        scheduledAt: Timestamp.fromDate(new Date('2027-04-15T19:00:00')), status: 'upcoming',
        description: 'Join Elara Vance for an open AMA about crafting dark fantasy, building magic systems inspired by mythology, and the journey from first draft to publication with Rüna Atlas.',
        questionCount: 23,
    },
    {
        id: 'ama2', title: 'Worldbuilding in Flooded Tokyo', authorName: 'Kai Nakamura',
        authorImage: 'https://picsum.photos/seed/kai/200/200', authorBio: 'Author of Neon Requiem',
        scheduledAt: Timestamp.fromDate(new Date('2027-03-28T20:00:00')), status: 'archived',
        description: 'Kai discusses the research behind Neon Requiem\'s underwater Tokyo, the ethics of cybernetic enhancement in fiction, and climate fiction as a genre.',
        questionCount: 47,
    },
    {
        id: 'ama3', title: 'Queer Love Across Timelines', authorName: 'River Chen',
        authorImage: 'https://picsum.photos/seed/river/200/200', authorBio: 'Author of Binary Stars',
        scheduledAt: Timestamp.fromDate(new Date('2027-05-02T18:00:00')), status: 'upcoming',
        description: 'River explores writing queer romance in speculative settings, the challenge of parallel timelines, and finding authenticity in fantastical love stories.',
        questionCount: 12,
    },
];

const SEED_QUESTIONS: Record<string, AMAQuestion[]> = {
    ama2: [
        { id: 'q1', text: 'How much of the underwater city is based on real urban planning proposals for climate-adapted cities?', askerName: 'coral_reader', askerId: 'u1', upvotes: 34, answer: 'About 60% is drawn from real proposals. Tokyo has several speculative architecture studies about vertical expansion. I spent weeks reading Japanese urban planning papers. The Undertow markets are entirely fictional, but the gills tech is inspired by real research into artificial gill membranes.', createdAt: Timestamp.fromDate(new Date('2027-03-28T20:05:00')) },
        { id: 'q2', text: 'Will there be a sequel exploring the AI consciousness sanctuaries?', askerName: 'neon_dreamer', askerId: 'u2', upvotes: 89, answer: 'I can\'t confirm a full sequel yet, but I am working on a novella set in the Sanctuary. The community voted for this direction in The Forge, which made the decision easy. Stay tuned for announcements.', createdAt: Timestamp.fromDate(new Date('2027-03-28T20:12:00')) },
        { id: 'q3', text: 'What does your writing routine look like?', askerName: 'aspiring_author', askerId: 'u3', upvotes: 18, createdAt: Timestamp.fromDate(new Date('2027-03-28T20:20:00')) },
    ],
};

const SEED_JOURNALS: WritingJournal[] = [
    {
        id: 'j1', title: 'On Building Magic from Bone', authorName: 'Elara Vance',
        authorImage: 'https://picsum.photos/seed/elara/200/200',
        content: 'The Marrow System didn\'t start as a magic system. It started as a metaphor for generational trauma.\n\nI was reading about epigenetics and how trauma literally changes the structure of your DNA. That became the seed: what if trauma wasn\'t just inherited emotionally, but physically embedded in the world itself? What if the earth remembers violence the way bodies do?\n\nThe fallen gods became stand-ins for colonized cultures. Their marrow, the magical residue they left behind, is both a gift and a wound. Using it heals, but it also calcifies the user, turning them slowly to stone. There is no clean power in this world.\n\nThis is the tension I wanted: that the tools of liberation are themselves scarred.',
        excerpt: 'The Marrow System didn\'t start as a magic system. It started as a metaphor for generational trauma.',
        publishedAt: Timestamp.fromDate(new Date('2027-03-05')),
        tags: ['worldbuilding', 'process', 'magic systems'], likes: 234, bookTitle: 'The Obsidian Crown',
    },
    {
        id: 'j2', title: 'Why I Write Cyberpunk as Climate Fiction', authorName: 'Kai Nakamura',
        authorImage: 'https://picsum.photos/seed/kai/200/200',
        content: 'People keep calling Neon Requiem cyberpunk. I call it climate fiction wearing a leather jacket.\n\nThe flood that drowns Tokyo in 2071 isn\'t caused by a war or an experiment gone wrong. It\'s sea level rise. Boring, predictable, preventable sea level rise. The most terrifying futures are the ones we can see coming.\n\nThe cybernetics, the AI, the neon: those came after. They are how humanity adapts. But the story is about the water. Always the water.',
        excerpt: 'People keep calling Neon Requiem cyberpunk. I call it climate fiction wearing a leather jacket.',
        publishedAt: Timestamp.fromDate(new Date('2027-02-18')),
        tags: ['climate fiction', 'genre', 'intention'], likes: 187, bookTitle: 'Neon Requiem',
    },
    {
        id: 'j3', title: 'Finding the Banyan\'s Voice', authorName: 'Priya Sharma',
        authorImage: 'https://picsum.photos/seed/priya/200/200',
        content: 'When I decided the banyan tree would speak, I had to decide HOW it speaks. Trees don\'t have mouths. They don\'t have opinions.\n\nOr do they?\n\nI spent three months recording sounds in old-growth forests in Kerala. The creaking, the wind through branches, the drip of dew. I wanted to understand what a tree\'s voice would sound like if we could hear it. The answer: slow. Patient. Deeply, unbearably sad.\n\nMy banyan speaks in memories. It replays what it has absorbed through its roots: conversations, footsteps, the chemical signature of tears in the soil. It doesn\'t narrate. It witnesses.',
        excerpt: 'When I decided the banyan tree would speak, I had to decide HOW it speaks.',
        publishedAt: Timestamp.fromDate(new Date('2027-01-10')),
        tags: ['process', 'research', 'voice'], likes: 312, bookTitle: 'The Roots Remember',
    },
];

const SEED_OFFICE_HOURS: OfficeHoursSlot[] = [
    { id: 'oh1', authorName: 'Elara Vance', authorImage: 'https://picsum.photos/seed/elara/200/200', date: Timestamp.fromDate(new Date('2027-04-20T14:00:00')), duration: 15, topic: 'Manuscript feedback & publishing advice', spotsTotal: 4, spotsTaken: 2, tier: 'architect', bookedBy: [] },
    { id: 'oh2', authorName: 'River Chen', authorImage: 'https://picsum.photos/seed/river/200/200', date: Timestamp.fromDate(new Date('2027-04-22T16:00:00')), duration: 15, topic: 'Writing queer characters authentically', spotsTotal: 3, spotsTaken: 1, tier: 'architect', bookedBy: [] },
    { id: 'oh3', authorName: 'Kai Nakamura', authorImage: 'https://picsum.photos/seed/kai/200/200', date: Timestamp.fromDate(new Date('2027-05-05T19:00:00')), duration: 20, topic: 'Climate fiction and research methods', spotsTotal: 4, spotsTaken: 0, tier: 'architect', bookedBy: [] },
];

// ─── Component ──────────────────────────────────────
export default function AuthorConnect() {
    const { user, signIn } = useAuth();
    const [activeTab, setActiveTab] = useState<'amas' | 'journals' | 'officehours'>('amas');
    const [amas, setAmas] = useState<AMA[]>(SEED_AMAS);
    const [journals, setJournals] = useState<WritingJournal[]>(SEED_JOURNALS);
    const [officeHours, setOfficeHours] = useState<OfficeHoursSlot[]>(SEED_OFFICE_HOURS);
    const [expandedAMA, setExpandedAMA] = useState<string | null>(null);
    const [amaQuestions, setAmaQuestions] = useState<Record<string, AMAQuestion[]>>(SEED_QUESTIONS);
    const [newQuestion, setNewQuestion] = useState('');
    const [votedQuestions, setVotedQuestions] = useState<string[]>([]);
    const [likedJournals, setLikedJournals] = useState<string[]>([]);
    const [expandedJournal, setExpandedJournal] = useState<string | null>(null);

    // Load from Firestore
    useEffect(() => {
        const unsub1 = onSnapshot(query(collection(db, 'amas'), orderBy('scheduledAt', 'desc')), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AMA));
            if (docs.length > 0) setAmas(docs);
        }, () => { });

        const unsub2 = onSnapshot(query(collection(db, 'writingJournals'), orderBy('publishedAt', 'desc')), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as WritingJournal));
            if (docs.length > 0) setJournals(docs);
        }, () => { });

        const unsub3 = onSnapshot(query(collection(db, 'officeHours'), orderBy('date')), (snap) => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as OfficeHoursSlot));
            if (docs.length > 0) setOfficeHours(docs);
        }, () => { });

        return () => { unsub1(); unsub2(); unsub3(); };
    }, []);

    // Load AMA questions when expanded
    useEffect(() => {
        if (!expandedAMA) return;
        if (amaQuestions[expandedAMA]?.length > 0) return;
        const unsub = onSnapshot(
            query(collection(db, 'amas', expandedAMA, 'questions'), orderBy('upvotes', 'desc')),
            (snap) => {
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AMAQuestion));
                if (docs.length > 0) setAmaQuestions(prev => ({ ...prev, [expandedAMA]: docs }));
            },
            () => { }
        );
        return () => unsub();
    }, [expandedAMA]);

    const handleAskQuestion = async (amaId: string) => {
        if (!user) { signIn(); return; }
        if (!newQuestion.trim()) return;
        try {
            await addDoc(collection(db, 'amas', amaId, 'questions'), {
                text: newQuestion.trim(),
                askerName: user.displayName || 'Anonymous',
                askerId: user.uid,
                upvotes: 0,
                createdAt: serverTimestamp(),
            });
            await updateDoc(doc(db, 'amas', amaId), { questionCount: increment(1) });
            // Optimistic
            setAmaQuestions(prev => ({
                ...prev,
                [amaId]: [...(prev[amaId] || []), {
                    id: Date.now().toString(),
                    text: newQuestion.trim(),
                    askerName: user.displayName || 'Anonymous',
                    askerId: user.uid,
                    upvotes: 0,
                    createdAt: new Date(),
                }],
            }));
            setNewQuestion('');
        } catch (e) { handleFirestoreError(e, OperationType.CREATE, 'amas/questions'); }
    };

    const handleUpvoteQuestion = async (amaId: string, questionId: string) => {
        if (!user) { signIn(); return; }
        if (votedQuestions.includes(questionId)) return;
        setVotedQuestions(prev => [...prev, questionId]);
        setAmaQuestions(prev => ({
            ...prev,
            [amaId]: (prev[amaId] || []).map(q => q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q),
        }));
        try {
            await updateDoc(doc(db, 'amas', amaId, 'questions', questionId), { upvotes: increment(1) });
        } catch { }
    };

    const handleLikeJournal = async (journalId: string) => {
        if (!user) { signIn(); return; }
        if (likedJournals.includes(journalId)) return;
        setLikedJournals(prev => [...prev, journalId]);
        setJournals(prev => prev.map(j => j.id === journalId ? { ...j, likes: j.likes + 1 } : j));
        try {
            await updateDoc(doc(db, 'writingJournals', journalId), { likes: increment(1) });
        } catch { }
    };

    const handleBookSlot = async (slotId: string) => {
        if (!user) { signIn(); return; }
        setOfficeHours(prev => prev.map(s =>
            s.id === slotId ? { ...s, spotsTaken: s.spotsTaken + 1, bookedBy: [...s.bookedBy, user.uid] } : s
        ));
        try {
            await updateDoc(doc(db, 'officeHours', slotId), {
                spotsTaken: increment(1),
                bookedBy: [...(officeHours.find(s => s.id === slotId)?.bookedBy || []), user.uid],
            });
        } catch (e) { handleFirestoreError(e, OperationType.UPDATE, 'officeHours'); }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'live': return 'bg-forge-red/20 text-forge-red border-forge-red/30';
            case 'upcoming': return 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30';
            case 'archived': return 'bg-surface text-text-muted border-border';
            default: return 'bg-surface text-text-muted border-border';
        }
    };

    const formatDate = (ts: Timestamp) => {
        const d = ts.toDate();
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const tabs = [
        { id: 'amas' as const, label: 'Ask Me Anything', icon: MessageCircle, count: amas.length },
        { id: 'journals' as const, label: 'Writing Journals', icon: PenTool, count: journals.length },
        { id: 'officehours' as const, label: 'Office Hours', icon: Video, count: officeHours.length },
    ];

    return (
        <div className="bg-void-black min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-cosmic-purple/20 text-cosmic-purple border border-cosmic-purple/30 px-4 py-1.5 rounded-full font-ui text-[10px] uppercase tracking-widest mb-6">
                        <Users className="w-3 h-3" /> Direct Author Channels
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
                        <span className="text-starforge-gold italic font-heading normal-case">Connect</span>
                    </h1>
                    <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        No middleman between creator and reader. Ask authors anything, read their process journals, or book a private session.
                    </p>
                </motion.div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-10 flex-wrap">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-ui text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-starforge-gold text-void-black font-medium'
                                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-starforge-gold/30'
                                    }`}
                            >
                                <Icon className="w-4 h-4" /> {tab.label}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-void-black/20' : 'bg-surface-elevated'}`}>{tab.count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ═══ AMAs TAB ═══ */}
                {activeTab === 'amas' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {amas.map((ama, idx) => (
                            <motion.div key={ama.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                className="bg-surface border border-border rounded-sm overflow-hidden"
                            >
                                {/* Header */}
                                <div className="p-6 md:p-8">
                                    <div className="flex items-start gap-4">
                                        <img src={ama.authorImage} alt="" className="w-14 h-14 rounded-full border-2 border-starforge-gold/30 object-cover shrink-0" referrerPolicy="no-referrer" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-ui ${getStatusBadge(ama.status)}`}>
                                                    {ama.status}
                                                </span>
                                            </div>
                                            <h3 className="font-heading text-xl text-text-primary">{ama.title}</h3>
                                            <p className="font-ui text-xs text-text-muted mt-1">
                                                {ama.authorName} &middot; {ama.authorBio} &middot; {formatDate(ama.scheduledAt)}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-display text-xl text-starforge-gold">{ama.questionCount}</p>
                                            <p className="font-ui text-[10px] text-text-muted">questions</p>
                                        </div>
                                    </div>
                                    <p className="font-body text-sm text-text-secondary mt-4 leading-relaxed">{ama.description}</p>
                                </div>

                                {/* Expand */}
                                <button
                                    onClick={() => setExpandedAMA(expandedAMA === ama.id ? null : ama.id)}
                                    className="w-full px-6 py-3 border-t border-border flex items-center justify-center gap-2 font-ui text-xs uppercase tracking-wider text-text-muted hover:text-starforge-gold transition-colors"
                                >
                                    {expandedAMA === ama.id ? 'Hide Questions' : 'View Questions & Ask'}
                                    {expandedAMA === ama.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>

                                <AnimatePresence>
                                    {expandedAMA === ama.id && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                            <div className="px-6 pb-6 border-t border-border pt-4 space-y-4">
                                                {/* Ask form */}
                                                <div className="flex gap-2">
                                                    <input
                                                        value={newQuestion}
                                                        onChange={e => setNewQuestion(e.target.value)}
                                                        placeholder="Ask a question..."
                                                        className="flex-1 bg-void-black border border-border rounded-sm px-3 py-2 text-text-primary font-ui text-sm focus:border-starforge-gold outline-none"
                                                        onKeyDown={e => e.key === 'Enter' && handleAskQuestion(ama.id)}
                                                    />
                                                    <button
                                                        onClick={() => handleAskQuestion(ama.id)}
                                                        className="px-4 py-2 bg-starforge-gold text-void-black font-ui text-sm rounded-sm hover:bg-white transition-colors"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Questions */}
                                                {(amaQuestions[ama.id] || []).sort((a, b) => b.upvotes - a.upvotes).map(q => (
                                                    <div key={q.id} className="bg-void-black/30 border border-border rounded-sm p-4">
                                                        <div className="flex items-start gap-3">
                                                            <button
                                                                onClick={() => handleUpvoteQuestion(ama.id, q.id)}
                                                                className={`flex flex-col items-center gap-0.5 shrink-0 pt-1 ${votedQuestions.includes(q.id) ? 'text-starforge-gold' : 'text-text-muted hover:text-starforge-gold'} transition-colors`}
                                                            >
                                                                <ThumbsUp className={`w-4 h-4 ${votedQuestions.includes(q.id) ? 'fill-current' : ''}`} />
                                                                <span className="font-mono text-[10px]">{q.upvotes}</span>
                                                            </button>
                                                            <div className="flex-1">
                                                                <p className="font-body text-sm text-text-primary leading-relaxed">{q.text}</p>
                                                                <p className="font-ui text-[10px] text-text-muted mt-1">asked by {q.askerName}</p>
                                                                {q.answer && (
                                                                    <div className="mt-3 pl-4 border-l-2 border-starforge-gold">
                                                                        <p className="font-body text-sm text-text-secondary leading-relaxed">{q.answer}</p>
                                                                        <p className="font-ui text-[10px] text-starforge-gold mt-1 flex items-center gap-1">
                                                                            <Star className="w-3 h-3" /> {ama.authorName}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ═══ JOURNALS TAB ═══ */}
                {activeTab === 'journals' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <p className="font-body text-sm text-text-secondary mb-2">
                            Behind-the-scenes dispatches from Inscribed authors. Process notes, research rabbit holes, and the stories behind the stories.
                        </p>

                        {journals.map((journal, idx) => (
                            <motion.div key={journal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                className="bg-surface border border-border rounded-sm overflow-hidden"
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex items-start gap-4 mb-4">
                                        <img src={journal.authorImage} alt="" className="w-12 h-12 rounded-full border border-starforge-gold/20 object-cover shrink-0" referrerPolicy="no-referrer" />
                                        <div className="flex-1">
                                            <h3 className="font-heading text-xl text-text-primary">{journal.title}</h3>
                                            <p className="font-ui text-xs text-text-muted mt-1">
                                                {journal.authorName} &middot; {journal.publishedAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                {journal.bookTitle && <> &middot; <span className="text-starforge-gold">{journal.bookTitle}</span></>}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleLikeJournal(journal.id)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-ui transition-colors shrink-0 ${likedJournals.includes(journal.id)
                                                ? 'bg-queer-pink/20 text-queer-pink'
                                                : 'bg-surface-elevated text-text-muted hover:text-queer-pink'
                                                }`}
                                        >
                                            <Heart className={`w-3 h-3 ${likedJournals.includes(journal.id) ? 'fill-current' : ''}`} /> {journal.likes}
                                        </button>
                                    </div>

                                    {expandedJournal === journal.id ? (
                                        <div className="font-body text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                                            {journal.content}
                                        </div>
                                    ) : (
                                        <p className="font-body text-sm text-text-secondary leading-relaxed italic">
                                            "{journal.excerpt}"
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                        <div className="flex flex-wrap gap-1">
                                            {journal.tags.map(tag => (
                                                <span key={tag} className="font-mono text-[9px] text-text-muted bg-void-black px-1.5 py-0.5 rounded-sm border border-border">{tag}</span>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setExpandedJournal(expandedJournal === journal.id ? null : journal.id)}
                                            className="font-ui text-xs text-starforge-gold hover:text-white transition-colors flex items-center gap-1"
                                        >
                                            {expandedJournal === journal.id ? 'Collapse' : 'Read Full Entry'}
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ═══ OFFICE HOURS TAB ═══ */}
                {activeTab === 'officehours' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="bg-cosmic-purple/10 border border-cosmic-purple/20 rounded-sm p-5 flex items-start gap-3">
                            <Crown className="w-5 h-5 text-cosmic-purple shrink-0 mt-0.5" />
                            <div>
                                <p className="font-heading text-sm text-text-primary">Architect Tier Exclusive</p>
                                <p className="font-body text-xs text-text-secondary leading-relaxed">
                                    Office Hours are private 1:1 video sessions with Inscribed authors. Available exclusively to Architect members.
                                    <Link to="/membership" className="text-cosmic-purple hover:text-white ml-1 transition-colors">Upgrade your membership.</Link>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {officeHours.map((slot, idx) => {
                                const isFull = slot.spotsTaken >= slot.spotsTotal;
                                const isBooked = user && slot.bookedBy.includes(user.uid);
                                return (
                                    <motion.div key={slot.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                        className={`bg-surface border rounded-sm p-6 ${isFull ? 'border-border opacity-60' : 'border-cosmic-purple/20 hover:border-cosmic-purple/50'} transition-colors`}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <img src={slot.authorImage} alt="" className="w-10 h-10 rounded-full border border-cosmic-purple/30 object-cover" referrerPolicy="no-referrer" />
                                            <div>
                                                <p className="font-heading text-sm text-text-primary">{slot.authorName}</p>
                                                <p className="font-ui text-[10px] text-text-muted">{slot.duration} min session</p>
                                            </div>
                                        </div>
                                        <p className="font-body text-sm text-text-secondary mb-3">{slot.topic}</p>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Calendar className="w-3 h-3 text-text-muted" />
                                            <span className="font-ui text-xs text-text-muted">{formatDate(slot.date)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-ui text-[10px] text-text-muted">
                                                {slot.spotsTotal - slot.spotsTaken} of {slot.spotsTotal} spots open
                                            </span>
                                            <button
                                                onClick={() => handleBookSlot(slot.id)}
                                                disabled={isFull || !!isBooked}
                                                className={`px-3 py-1.5 rounded-sm font-ui text-xs uppercase tracking-wider transition-colors ${isBooked
                                                    ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30'
                                                    : isFull
                                                        ? 'bg-surface text-text-muted border border-border cursor-not-allowed'
                                                        : 'bg-cosmic-purple text-white hover:bg-cosmic-purple/80'
                                                    }`}
                                            >
                                                {isBooked ? 'Booked' : isFull ? 'Full' : 'Book Slot'}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
