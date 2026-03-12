import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, Plus, Calendar, BookOpen, Clock, Crown,
    Shield, ArrowLeft, Loader2, Send, Heart, ThumbsUp, Bookmark,
    BarChart3, Star, ChevronRight, Highlighter, X, Check,
    Globe, Lock, Pencil, Trash2, MapPin, Video
} from 'lucide-react';
import { doc, getDoc, onSnapshot, collection, addDoc, query, orderBy, where, serverTimestamp, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// ═══════════════════════════════════════════════
// READER CIRCLE DETAIL — Full circle experience
// ═══════════════════════════════════════════════

interface CircleData {
    id: string;
    name: string;
    description: string;
    genre: string;
    visibility: string;
    pace: string;
    currentBook: string;
    currentAuthor: string;
    coverEmoji: string;
    createdBy: string;
    createdByName: string;
    memberCount: number;
    discussionCount: number;
    nextMeeting: string;
}

interface Member {
    id: string;
    userId: string;
    displayName: string;
    role: 'creator' | 'moderator' | 'member';
    status: 'active' | 'pending';
    readingProgress: number;
    joinedAt: any;
}

interface Discussion {
    id: string;
    title: string;
    body: string;
    authorId: string;
    authorName: string;
    tags: string[];
    replyCount: number;
    reactions: Record<string, string[]>;
    pinned: boolean;
    createdAt: any;
}

interface Reply {
    id: string;
    body: string;
    authorId: string;
    authorName: string;
    reactions: Record<string, string[]>;
    createdAt: any;
}

interface Annotation {
    id: string;
    text: string;
    note: string;
    chapter: string;
    page: number;
    authorId: string;
    authorName: string;
    reactions: Record<string, string[]>;
    createdAt: any;
}

interface Meeting {
    id: string;
    title: string;
    description: string;
    scheduledFor: any;
    type: 'discussion' | 'buddy-read' | 'author-qa' | 'social';
    createdBy: string;
    attendees: string[];
}

type Tab = 'discussions' | 'members' | 'progress' | 'annotations' | 'meetings';

const REACTION_EMOJIS = ['👍', '❤️', '🔥', '💡', '📚', '✨'];
const DISCUSSION_TAGS = ['General', 'Spoilers', 'Theories', 'Characters', 'World-Building', 'Writing Craft', 'Recommendations'];
const MEETING_TYPES = [
    { id: 'discussion', label: 'Book Discussion', emoji: '💬' },
    { id: 'buddy-read', label: 'Buddy Read', emoji: '📖' },
    { id: 'author-qa', label: 'Author Q&A', emoji: '✍️' },
    { id: 'social', label: 'Social Hangout', emoji: '🎉' },
];

export default function ReaderCircleDetail() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [circle, setCircle] = useState<CircleData | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('discussions');
    const [myMembership, setMyMembership] = useState<Member | null>(null);

    // Discussion state
    const [showNewDiscussion, setShowNewDiscussion] = useState(false);
    const [newDiscTitle, setNewDiscTitle] = useState('');
    const [newDiscBody, setNewDiscBody] = useState('');
    const [newDiscTags, setNewDiscTags] = useState<Set<string>>(new Set());
    const [openThread, setOpenThread] = useState<string | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [replyText, setReplyText] = useState('');

    // Annotation state
    const [showNewAnnotation, setShowNewAnnotation] = useState(false);
    const [annoText, setAnnoText] = useState('');
    const [annoNote, setAnnoNote] = useState('');
    const [annoChapter, setAnnoChapter] = useState('');
    const [annoPage, setAnnoPage] = useState('');

    // Meeting state
    const [showNewMeeting, setShowNewMeeting] = useState(false);
    const [meetTitle, setMeetTitle] = useState('');
    const [meetDesc, setMeetDesc] = useState('');
    const [meetDate, setMeetDate] = useState('');
    const [meetTime, setMeetTime] = useState('19:00');
    const [meetType, setMeetType] = useState('discussion');

    // Progress state
    const [myProgress, setMyProgress] = useState(0);
    const [updatingProgress, setUpdatingProgress] = useState(false);

    useEffect(() => {
        if (!id) return;
        const unsubs: (() => void)[] = [];

        unsubs.push(onSnapshot(doc(db, 'reader_circles', id), (snap) => {
            if (snap.exists()) setCircle({ id: snap.id, ...snap.data() } as CircleData);
            setLoading(false);
        }));

        unsubs.push(onSnapshot(
            query(collection(db, 'circle_members'), where('circleId', '==', id)),
            (snap) => {
                const mems = snap.docs.map(d => ({ id: d.id, ...d.data() } as Member));
                setMembers(mems);
                if (user) {
                    const mine = mems.find(m => m.userId === user.uid && m.status === 'active');
                    setMyMembership(mine || null);
                    if (mine) setMyProgress(mine.readingProgress || 0);
                }
            }
        ));

        unsubs.push(onSnapshot(
            query(collection(db, 'circle_discussions'), where('circleId', '==', id), orderBy('createdAt', 'desc')),
            (snap) => setDiscussions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Discussion))),
            () => {}
        ));

        unsubs.push(onSnapshot(
            query(collection(db, 'circle_annotations'), where('circleId', '==', id), orderBy('page', 'asc')),
            (snap) => setAnnotations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Annotation))),
            () => {}
        ));

        unsubs.push(onSnapshot(
            query(collection(db, 'circle_meetings'), where('circleId', '==', id), orderBy('scheduledFor', 'asc')),
            (snap) => setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Meeting))),
            () => {}
        ));

        return () => unsubs.forEach(u => u());
    }, [id, user]);

    // Load replies when a thread is opened
    useEffect(() => {
        if (!openThread) { setReplies([]); return; }
        const unsub = onSnapshot(
            query(collection(db, 'circle_replies'), where('discussionId', '==', openThread), orderBy('createdAt', 'asc')),
            (snap) => setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reply))),
            () => {}
        );
        return () => unsub();
    }, [openThread]);

    const activeMembers = members.filter(m => m.status === 'active');
    const pendingMembers = members.filter(m => m.status === 'pending');
    const isCreator = circle?.createdBy === user?.uid;
    const isModerator = myMembership?.role === 'moderator' || isCreator;

    // ── Actions ──
    const createDiscussion = async () => {
        if (!user || !id || !newDiscTitle.trim()) return;
        await addDoc(collection(db, 'circle_discussions'), {
            circleId: id, title: newDiscTitle.trim(), body: newDiscBody.trim(),
            authorId: user.uid, authorName: user.displayName || 'Anonymous',
            tags: Array.from(newDiscTags), replyCount: 0, reactions: {}, pinned: false, createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'reader_circles', id), { discussionCount: (circle?.discussionCount || 0) + 1 });
        setNewDiscTitle(''); setNewDiscBody(''); setNewDiscTags(new Set()); setShowNewDiscussion(false);
    };

    const sendReply = async () => {
        if (!user || !openThread || !replyText.trim()) return;
        await addDoc(collection(db, 'circle_replies'), {
            discussionId: openThread, body: replyText.trim(),
            authorId: user.uid, authorName: user.displayName || 'Anonymous',
            reactions: {}, createdAt: serverTimestamp(),
        });
        const disc = discussions.find(d => d.id === openThread);
        if (disc) await updateDoc(doc(db, 'circle_discussions', openThread), { replyCount: (disc.replyCount || 0) + 1 });
        setReplyText('');
    };

    const addReaction = async (collectionName: string, docId: string, emoji: string, currentReactions: Record<string, string[]>) => {
        if (!user) return;
        const updated = { ...currentReactions };
        if (!updated[emoji]) updated[emoji] = [];
        if (updated[emoji].includes(user.uid)) {
            updated[emoji] = updated[emoji].filter(u => u !== user.uid);
        } else {
            updated[emoji].push(user.uid);
        }
        await updateDoc(doc(db, collectionName, docId), { reactions: updated });
    };

    const createAnnotation = async () => {
        if (!user || !id || !annoText.trim()) return;
        await addDoc(collection(db, 'circle_annotations'), {
            circleId: id, text: annoText.trim(), note: annoNote.trim(),
            chapter: annoChapter.trim(), page: parseInt(annoPage) || 0,
            authorId: user.uid, authorName: user.displayName || 'Anonymous',
            reactions: {}, createdAt: serverTimestamp(),
        });
        setAnnoText(''); setAnnoNote(''); setAnnoChapter(''); setAnnoPage(''); setShowNewAnnotation(false);
    };

    const createMeeting = async () => {
        if (!user || !id || !meetTitle.trim() || !meetDate) return;
        const dt = new Date(`${meetDate}T${meetTime}`);
        await addDoc(collection(db, 'circle_meetings'), {
            circleId: id, title: meetTitle.trim(), description: meetDesc.trim(),
            scheduledFor: Timestamp.fromDate(dt), type: meetType,
            createdBy: user.uid, attendees: [user.uid],
        });
        setMeetTitle(''); setMeetDesc(''); setMeetDate(''); setMeetTime('19:00'); setShowNewMeeting(false);
    };

    const rsvpMeeting = async (meetingId: string, currentAttendees: string[]) => {
        if (!user) return;
        const updated = currentAttendees.includes(user.uid)
            ? currentAttendees.filter(u => u !== user.uid)
            : [...currentAttendees, user.uid];
        await updateDoc(doc(db, 'circle_meetings', meetingId), { attendees: updated });
    };

    const updateMyProgress = async (val: number) => {
        if (!myMembership) return;
        setUpdatingProgress(true);
        setMyProgress(val);
        await updateDoc(doc(db, 'circle_members', myMembership.id), { readingProgress: val });
        setUpdatingProgress(false);
    };

    const approveMember = async (member: Member) => {
        await updateDoc(doc(db, 'circle_members', member.id), { status: 'active' });
        if (circle && id) await updateDoc(doc(db, 'reader_circles', id), { memberCount: (circle.memberCount || 0) + 1 });
    };

    const rejectMember = async (member: Member) => {
        await deleteDoc(doc(db, 'circle_members', member.id));
    };

    const inputClass = 'w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-violet-400/40 transition-colors';

    if (loading) return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>;
    if (!circle) return <div className="min-h-screen bg-void-black flex items-center justify-center text-white/30 text-sm">Circle not found.</div>;

    const TABS: { id: Tab; label: string; icon: any; count?: number }[] = [
        { id: 'discussions', label: 'Discussions', icon: MessageSquare, count: discussions.length },
        { id: 'members', label: 'Members', icon: Users, count: activeMembers.length },
        { id: 'progress', label: 'Progress', icon: BarChart3 },
        { id: 'annotations', label: 'Highlights', icon: Highlighter, count: annotations.length },
        { id: 'meetings', label: 'Meetings', icon: Calendar, count: meetings.length },
    ];

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <button onClick={() => navigate('/book-clubs')} className="text-xs text-white/30 hover:text-white/50 flex items-center gap-1 mb-6 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Circles
                </button>

                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-violet-400/10 border border-violet-400/15 flex items-center justify-center text-3xl">
                            {circle.coverEmoji || '📚'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="font-display text-2xl md:text-3xl text-white tracking-wide">{circle.name}</h1>
                                {circle.visibility === 'private' ? <Lock className="w-4 h-4 text-white/15" /> : <Globe className="w-4 h-4 text-white/15" />}
                            </div>
                            <p className="text-xs text-white/30">{circle.genre} · {circle.pace} · Created by {circle.createdByName}</p>
                            {circle.description && <p className="text-sm text-text-secondary mt-2 max-w-xl">{circle.description}</p>}
                        </div>
                    </div>
                </div>

                {/* Current Book Banner */}
                {circle.currentBook && circle.currentBook !== 'Not selected yet' && (
                    <div className="bg-violet-500/[0.04] border border-violet-400/10 rounded-xl p-5 mb-8 flex items-center gap-4">
                        <BookOpen className="w-8 h-8 text-violet-400/40" />
                        <div>
                            <p className="text-[9px] text-violet-400/50 uppercase tracking-wider">Currently Reading</p>
                            <p className="text-lg text-white font-display tracking-wide">{circle.currentBook}</p>
                            {circle.currentAuthor && <p className="text-xs text-white/30">by {circle.currentAuthor}</p>}
                        </div>
                    </div>
                )}

                {/* Tab Bar */}
                <div className="flex gap-1 mb-8 bg-white/[0.02] p-1 rounded-xl border border-white/[0.06] overflow-x-auto">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${tab === t.id ? 'bg-violet-400/15 text-violet-400' : 'text-white/25 hover:text-white/40'}`}>
                            <t.icon className="w-3.5 h-3.5" />
                            {t.label}
                            {t.count !== undefined && <span className="text-[9px] opacity-50">({t.count})</span>}
                        </button>
                    ))}
                </div>

                {/* ═══════ DISCUSSIONS TAB ═══════ */}
                {tab === 'discussions' && (
                    <div>
                        {myMembership && (
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setShowNewDiscussion(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-violet-500/80 text-white text-xs font-semibold rounded-lg hover:bg-violet-400 transition-colors">
                                    <Plus className="w-3.5 h-3.5" /> New Thread
                                </button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {discussions.map(disc => (
                                <motion.div key={disc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-violet-400/10 transition-all cursor-pointer"
                                    onClick={() => setOpenThread(disc.id)}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {disc.pinned && <Star className="w-3 h-3 text-starforge-gold fill-starforge-gold" />}
                                                <h3 className="text-sm text-white font-semibold">{disc.title}</h3>
                                            </div>
                                            {disc.body && <p className="text-xs text-white/30 line-clamp-2 mb-2">{disc.body}</p>}
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-white/20">{disc.authorName}</span>
                                                <span className="text-[10px] text-white/15">·</span>
                                                <span className="text-[10px] text-white/15 flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" /> {disc.replyCount || 0}</span>
                                                {disc.tags?.map(t => (
                                                    <span key={t} className="text-[9px] px-2 py-0.5 bg-violet-400/5 text-violet-400/50 rounded-full">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/10" />
                                    </div>
                                    {/* Reactions */}
                                    {Object.keys(disc.reactions || {}).length > 0 && (
                                        <div className="flex gap-1.5 mt-3">
                                            {Object.entries(disc.reactions).filter(([_, users]) => users.length > 0).map(([emoji, users]) => (
                                                <button key={emoji} onClick={(e) => { e.stopPropagation(); addReaction('circle_discussions', disc.id, emoji, disc.reactions); }}
                                                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${users.includes(user?.uid || '') ? 'bg-violet-400/10 border-violet-400/20 text-violet-400' : 'bg-white/[0.02] border-white/[0.06] text-white/30'}`}>
                                                    {emoji} {users.length}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {discussions.length === 0 && <p className="text-center text-white/15 text-sm py-12">No discussions yet. Start a conversation!</p>}
                        </div>

                        {/* New Discussion Modal */}
                        <AnimatePresence>
                            {showNewDiscussion && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowNewDiscussion(false)}>
                                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                        className="bg-surface border border-white/[0.1] rounded-2xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="font-display text-lg text-white">NEW <span className="text-violet-400">THREAD</span></h2>
                                            <button onClick={() => setShowNewDiscussion(false)} className="text-white/20 hover:text-white/50"><X className="w-5 h-5" /></button>
                                        </div>
                                        <div className="space-y-4">
                                            <input type="text" value={newDiscTitle} onChange={e => setNewDiscTitle(e.target.value)} placeholder="Thread title" className={inputClass} />
                                            <textarea value={newDiscBody} onChange={e => setNewDiscBody(e.target.value)} placeholder="What's on your mind?" rows={4} className={`${inputClass} resize-none`} />
                                            <div>
                                                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-2">Tags</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {DISCUSSION_TAGS.map(t => (
                                                        <button key={t} onClick={() => setNewDiscTags(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; })}
                                                            className={`text-[10px] px-3 py-1 rounded-full transition-all ${newDiscTags.has(t) ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30' : 'bg-white/[0.03] text-white/25 border border-white/[0.06]'}`}>
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button onClick={createDiscussion} disabled={!newDiscTitle.trim()}
                                                className="w-full py-3 bg-violet-500 text-white text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-violet-400 transition-all disabled:opacity-30">
                                                Post Thread
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Thread Detail Modal */}
                        <AnimatePresence>
                            {openThread && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpenThread(null)}>
                                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                        className="bg-surface border border-white/[0.1] rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                                        {(() => {
                                            const disc = discussions.find(d => d.id === openThread);
                                            if (!disc) return null;
                                            return (<>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h2 className="text-lg text-white font-semibold">{disc.title}</h2>
                                                        <p className="text-[10px] text-white/20">{disc.authorName}</p>
                                                    </div>
                                                    <button onClick={() => setOpenThread(null)} className="text-white/20 hover:text-white/50"><X className="w-5 h-5" /></button>
                                                </div>
                                                {disc.body && <p className="text-sm text-white/50 mb-4 pb-4 border-b border-white/[0.06]">{disc.body}</p>}
                                                {/* Reactions bar */}
                                                <div className="flex gap-1.5 mb-4 pb-4 border-b border-white/[0.06]">
                                                    {REACTION_EMOJIS.map(emoji => {
                                                        const count = (disc.reactions?.[emoji] || []).length;
                                                        const active = (disc.reactions?.[emoji] || []).includes(user?.uid || '');
                                                        return (
                                                            <button key={emoji} onClick={() => addReaction('circle_discussions', disc.id, emoji, disc.reactions || {})}
                                                                className={`text-sm px-2.5 py-1 rounded-full border transition-all ${active ? 'bg-violet-400/10 border-violet-400/20' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'}`}>
                                                                {emoji}{count > 0 && <span className="text-[9px] ml-1 text-white/30">{count}</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {/* Replies */}
                                                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                                                    {replies.map(r => (
                                                        <div key={r.id} className="bg-white/[0.02] rounded-lg p-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs text-white font-medium">{r.authorName}</span>
                                                            </div>
                                                            <p className="text-sm text-white/50">{r.body}</p>
                                                            <div className="flex gap-1 mt-2">
                                                                {REACTION_EMOJIS.slice(0, 3).map(emoji => {
                                                                    const count = (r.reactions?.[emoji] || []).length;
                                                                    const active = (r.reactions?.[emoji] || []).includes(user?.uid || '');
                                                                    return (
                                                                        <button key={emoji} onClick={() => addReaction('circle_replies', r.id, emoji, r.reactions || {})}
                                                                            className={`text-[10px] px-2 py-0.5 rounded-full border ${active ? 'bg-violet-400/10 border-violet-400/20' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                                                                            {emoji}{count > 0 && ` ${count}`}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {replies.length === 0 && <p className="text-center text-white/15 text-xs py-8">No replies yet.</p>}
                                                </div>
                                                {/* Reply input */}
                                                {myMembership && (
                                                    <div className="flex gap-2">
                                                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..."
                                                            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-violet-400/40"
                                                            onKeyDown={e => e.key === 'Enter' && sendReply()} />
                                                        <button onClick={sendReply} disabled={!replyText.trim()}
                                                            className="px-4 bg-violet-500 rounded-lg text-white hover:bg-violet-400 disabled:opacity-30 transition-colors">
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </>);
                                        })()}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* ═══════ MEMBERS TAB ═══════ */}
                {tab === 'members' && (
                    <div>
                        {/* Pending requests (visible to creator/moderator) */}
                        {isModerator && pendingMembers.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Pending Requests ({pendingMembers.length})</h3>
                                <div className="space-y-2">
                                    {pendingMembers.map(m => (
                                        <div key={m.id} className="bg-amber-500/[0.03] border border-amber-400/10 rounded-lg p-4 flex items-center justify-between">
                                            <span className="text-sm text-white">{m.displayName}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => approveMember(m)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-lg hover:bg-emerald-500/20 flex items-center gap-1"><Check className="w-3 h-3" /> Approve</button>
                                                <button onClick={() => rejectMember(m)} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[10px] rounded-lg hover:bg-red-500/20 flex items-center gap-1"><X className="w-3 h-3" /> Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {activeMembers.map(m => (
                                <div key={m.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-violet-400/10 flex items-center justify-center text-sm">
                                            {m.displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-white font-medium">{m.displayName}</span>
                                                {m.role === 'creator' && <Crown className="w-3 h-3 text-starforge-gold" />}
                                                {m.role === 'moderator' && <Shield className="w-3 h-3 text-violet-400" />}
                                            </div>
                                            <span className="text-[10px] text-white/20 capitalize">{m.role}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-[10px] text-white/20">Reading Progress</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                                    <div className="h-full bg-violet-400/50 rounded-full transition-all" style={{ width: `${m.readingProgress || 0}%` }} />
                                                </div>
                                                <span className="text-[10px] text-white/30">{m.readingProgress || 0}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════ PROGRESS TAB ═══════ */}
                {tab === 'progress' && (
                    <div>
                        {/* My progress slider */}
                        {myMembership && (
                            <div className="bg-violet-500/[0.04] border border-violet-400/10 rounded-xl p-6 mb-8">
                                <h3 className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-4">Your Reading Progress</h3>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="0" max="100" value={myProgress}
                                        onChange={e => setMyProgress(Number(e.target.value))}
                                        onMouseUp={() => updateMyProgress(myProgress)}
                                        onTouchEnd={() => updateMyProgress(myProgress)}
                                        className="flex-1 accent-violet-400" />
                                    <span className="text-xl text-white font-bold w-14 text-right">{myProgress}%</span>
                                </div>
                                <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden mt-3">
                                    <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all" style={{ width: `${myProgress}%` }} />
                                </div>
                            </div>
                        )}

                        {/* Group progress */}
                        <h3 className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-4">Circle Progress</h3>
                        <div className="space-y-3">
                            {activeMembers.sort((a, b) => (b.readingProgress || 0) - (a.readingProgress || 0)).map(m => (
                                <div key={m.id} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-violet-400/10 flex items-center justify-center text-xs">
                                        {m.displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-white">{m.displayName}</span>
                                            <span className="text-xs text-violet-400 font-bold">{m.readingProgress || 0}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${m.readingProgress || 0}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from-violet-600/60 to-violet-400/60 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════ ANNOTATIONS TAB ═══════ */}
                {tab === 'annotations' && (
                    <div>
                        {myMembership && (
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setShowNewAnnotation(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-violet-500/80 text-white text-xs font-semibold rounded-lg hover:bg-violet-400 transition-colors">
                                    <Highlighter className="w-3.5 h-3.5" /> Share Highlight
                                </button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {annotations.map(a => (
                                <div key={a.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        {a.chapter && <span className="text-[9px] px-2 py-0.5 bg-violet-400/10 text-violet-400/60 rounded-full">{a.chapter}</span>}
                                        {a.page > 0 && <span className="text-[9px] text-white/15">p. {a.page}</span>}
                                        <span className="text-[9px] text-white/15 ml-auto">{a.authorName}</span>
                                    </div>
                                    <blockquote className="border-l-2 border-violet-400/30 pl-4 py-1 mb-2">
                                        <p className="text-sm text-white/60 italic">"{a.text}"</p>
                                    </blockquote>
                                    {a.note && <p className="text-xs text-white/30 mb-2">{a.note}</p>}
                                    <div className="flex gap-1.5">
                                        {REACTION_EMOJIS.slice(0, 4).map(emoji => {
                                            const count = (a.reactions?.[emoji] || []).length;
                                            const active = (a.reactions?.[emoji] || []).includes(user?.uid || '');
                                            return (
                                                <button key={emoji} onClick={() => addReaction('circle_annotations', a.id, emoji, a.reactions || {})}
                                                    className={`text-[10px] px-2 py-0.5 rounded-full border ${active ? 'bg-violet-400/10 border-violet-400/20' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                                                    {emoji}{count > 0 && ` ${count}`}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {annotations.length === 0 && <p className="text-center text-white/15 text-sm py-12">No highlights shared yet. Be the first!</p>}
                        </div>

                        {/* New Annotation Modal */}
                        <AnimatePresence>
                            {showNewAnnotation && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowNewAnnotation(false)}>
                                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                        className="bg-surface border border-white/[0.1] rounded-2xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="font-display text-lg text-white">SHARE <span className="text-violet-400">HIGHLIGHT</span></h2>
                                            <button onClick={() => setShowNewAnnotation(false)} className="text-white/20 hover:text-white/50"><X className="w-5 h-5" /></button>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Highlighted Passage *</label>
                                                <textarea value={annoText} onChange={e => setAnnoText(e.target.value)} placeholder="Paste or type the passage..." rows={3} className={`${inputClass} resize-none`} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Your Thoughts</label>
                                                <textarea value={annoNote} onChange={e => setAnnoNote(e.target.value)} placeholder="Why does this passage stand out to you?" rows={2} className={`${inputClass} resize-none`} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Chapter</label>
                                                    <input type="text" value={annoChapter} onChange={e => setAnnoChapter(e.target.value)} placeholder="e.g., Chapter 4" className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Page</label>
                                                    <input type="number" value={annoPage} onChange={e => setAnnoPage(e.target.value)} placeholder="42" className={inputClass} />
                                                </div>
                                            </div>
                                            <button onClick={createAnnotation} disabled={!annoText.trim()}
                                                className="w-full py-3 bg-violet-500 text-white text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-violet-400 transition-all disabled:opacity-30">
                                                Share Highlight
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* ═══════ MEETINGS TAB ═══════ */}
                {tab === 'meetings' && (
                    <div>
                        {myMembership && (
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setShowNewMeeting(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-violet-500/80 text-white text-xs font-semibold rounded-lg hover:bg-violet-400 transition-colors">
                                    <Calendar className="w-3.5 h-3.5" /> Schedule Meeting
                                </button>
                            </div>
                        )}

                        <div className="space-y-3">
                            {meetings.map(m => {
                                const meetType = MEETING_TYPES.find(t => t.id === m.type);
                                const dt = m.scheduledFor?.toDate?.();
                                const isPast = dt && dt < new Date();
                                const attending = m.attendees?.includes(user?.uid || '');
                                return (
                                    <div key={m.id} className={`bg-white/[0.02] border rounded-xl p-5 ${isPast ? 'border-white/[0.04] opacity-50' : 'border-white/[0.06]'}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-violet-400/10 flex items-center justify-center text-xl">
                                                    {meetType?.emoji || '📅'}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm text-white font-semibold">{m.title}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-white/25">
                                                        <span>{meetType?.label}</span>
                                                        <span>·</span>
                                                        <span>{dt ? dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</span>
                                                        <span>·</span>
                                                        <span>{dt ? dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {!isPast && user && (
                                                <button onClick={() => rsvpMeeting(m.id, m.attendees || [])}
                                                    className={`text-[10px] px-4 py-1.5 rounded-full transition-all flex items-center gap-1 ${attending ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20' : 'bg-white/[0.04] text-white/30 border border-white/[0.06] hover:text-white/50'}`}>
                                                    {attending ? <><Check className="w-3 h-3" /> Going</> : 'RSVP'}
                                                </button>
                                            )}
                                        </div>
                                        {m.description && <p className="text-xs text-white/25 mt-2 ml-14">{m.description}</p>}
                                        <div className="mt-3 ml-14 flex items-center gap-1 text-[10px] text-white/20">
                                            <Users className="w-3 h-3" /> {m.attendees?.length || 0} attending
                                        </div>
                                    </div>
                                );
                            })}
                            {meetings.length === 0 && <p className="text-center text-white/15 text-sm py-12">No meetings scheduled yet.</p>}
                        </div>

                        {/* New Meeting Modal */}
                        <AnimatePresence>
                            {showNewMeeting && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowNewMeeting(false)}>
                                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                                        className="bg-surface border border-white/[0.1] rounded-2xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="font-display text-lg text-white">SCHEDULE <span className="text-violet-400">MEETING</span></h2>
                                            <button onClick={() => setShowNewMeeting(false)} className="text-white/20 hover:text-white/50"><X className="w-5 h-5" /></button>
                                        </div>
                                        <div className="space-y-4">
                                            <input type="text" value={meetTitle} onChange={e => setMeetTitle(e.target.value)} placeholder="Meeting title" className={inputClass} />
                                            <textarea value={meetDesc} onChange={e => setMeetDesc(e.target.value)} placeholder="What will you discuss?" rows={2} className={`${inputClass} resize-none`} />
                                            <div>
                                                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-2">Type</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {MEETING_TYPES.map(t => (
                                                        <button key={t.id} onClick={() => setMeetType(t.id)}
                                                            className={`p-3 rounded-xl text-center border transition-all ${meetType === t.id ? 'bg-violet-400/10 border-violet-400/30' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                                                            <span className="text-lg">{t.emoji}</span>
                                                            <p className={`text-[10px] font-semibold mt-1 ${meetType === t.id ? 'text-violet-400' : 'text-white/25'}`}>{t.label}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Date *</label>
                                                    <input type="date" value={meetDate} onChange={e => setMeetDate(e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Time</label>
                                                    <input type="time" value={meetTime} onChange={e => setMeetTime(e.target.value)} className={inputClass} />
                                                </div>
                                            </div>
                                            <button onClick={createMeeting} disabled={!meetTitle.trim() || !meetDate}
                                                className="w-full py-3 bg-violet-500 text-white text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-violet-400 transition-all disabled:opacity-30">
                                                Schedule Meeting
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
