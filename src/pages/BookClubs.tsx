import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, BookOpen, MessageSquare, Plus, Calendar, Clock,
    ChevronRight, Globe, Lock, Star, Heart, Eye
} from 'lucide-react';

// ═══════════════════════════════════════════
// BOOK CLUBS — Group discussions tied to titles
// ═══════════════════════════════════════════

interface BookClub {
    id: string;
    name: string;
    currentBook: string;
    currentAuthor: string;
    members: number;
    discussions: number;
    nextMeeting: string;
    visibility: 'public' | 'private';
    genre: string;
    pace: string;
}

const MOCK_CLUBS: BookClub[] = [
    { id: '1', name: 'Futures Collective', currentBook: 'Chrome Meridian', currentAuthor: 'Xiomara Vega', members: 42, discussions: 8, nextMeeting: 'Mar 15, 7pm EST', visibility: 'public', genre: 'Cyberpunk', pace: '1 chapter/week' },
    { id: '2', name: 'Dark Worlds Society', currentBook: 'Void Frequencies', currentAuthor: 'Alejandro Cruz', members: 28, discussions: 5, nextMeeting: 'Mar 18, 8pm EST', visibility: 'public', genre: 'Dark Fantasy', pace: '2 chapters/week' },
    { id: '3', name: 'Diaspora Readers', currentBook: 'Ancestral Algorithms', currentAuthor: 'Amara Osei', members: 35, discussions: 12, nextMeeting: 'Mar 20, 6pm EST', visibility: 'public', genre: 'Afrofuturism', pace: '1 chapter/week' },
    { id: '4', name: 'Editorial Review Circle', currentBook: 'Shadow Resonance', currentAuthor: 'Alejandro Cruz', members: 8, discussions: 3, nextMeeting: 'Mar 14, 3pm EST', visibility: 'private', genre: 'Mixed', pace: 'Full book' },
    { id: '5', name: 'New Voices Club', currentBook: 'Bioluminescent', currentAuthor: 'Yuki Tanaka', members: 19, discussions: 4, nextMeeting: 'Mar 22, 7pm EST', visibility: 'public', genre: 'Magical Realism', pace: '3 chapters/week' },
];

const MOCK_DISCUSSIONS = [
    { club: 'Futures Collective', topic: 'Chapter 12: The Neural Market', replies: 24, lastActive: '2 hours ago' },
    { club: 'Dark Worlds Society', topic: 'Worldbuilding in Void Frequencies', replies: 18, lastActive: '5 hours ago' },
    { club: 'Diaspora Readers', topic: 'Themes of ancestral memory', replies: 31, lastActive: '1 day ago' },
    { club: 'New Voices Club', topic: 'The role of bioluminescence as metaphor', replies: 12, lastActive: '2 days ago' },
];

export default function BookClubs() {
    const [tab, setTab] = useState<'browse' | 'my-clubs' | 'discussions'>('browse');

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">Book <span className="text-violet-400">Clubs</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Join reading groups, discuss books, and connect with readers</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-starforge-gold text-void-black text-sm font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
                        <Plus className="w-4 h-4" /> Create Club
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['browse', 'my-clubs', 'discussions'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 text-xs rounded-lg capitalize transition-all ${tab === t ? 'bg-violet-400/20 text-violet-400 border border-violet-400/30 font-semibold' : 'bg-white/[0.04] text-white/50 border border-transparent hover:text-white'}`}>
                            {t.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Browse / My Clubs */}
                {(tab === 'browse' || tab === 'my-clubs') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MOCK_CLUBS.map((club, i) => (
                            <motion.div key={club.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-violet-400/10 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-white">{club.name}</h3>
                                                {club.visibility === 'private' ? <Lock className="w-3 h-3 text-white/20" /> : <Globe className="w-3 h-3 text-white/20" />}
                                            </div>
                                            <p className="text-[10px] text-white/30">{club.genre} · {club.pace}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
                                </div>

                                <div className="bg-white/[0.02] rounded-lg p-3 mb-3">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Currently Reading</p>
                                    <p className="text-sm text-white">{club.currentBook}</p>
                                    <p className="text-xs text-white/40">by {club.currentAuthor}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-[10px] text-white/30">
                                        <span><Users className="w-3 h-3 inline mr-1" />{club.members}</span>
                                        <span><MessageSquare className="w-3 h-3 inline mr-1" />{club.discussions}</span>
                                    </div>
                                    <span className="text-[10px] text-white/30"><Calendar className="w-3 h-3 inline mr-1" />{club.nextMeeting}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Discussions */}
                {tab === 'discussions' && (
                    <div className="space-y-3">
                        {MOCK_DISCUSSIONS.map((disc, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-all cursor-pointer flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-violet-400/10 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white">{disc.topic}</h3>
                                        <p className="text-xs text-white/40">{disc.club} · {disc.replies} replies</p>
                                    </div>
                                </div>
                                <span className="text-[10px] text-white/20">{disc.lastActive}</span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
