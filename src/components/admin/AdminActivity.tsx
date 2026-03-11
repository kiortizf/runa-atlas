import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, Filter, FileText, Users, BookOpen, MessageSquare, Settings, Star, Clock, ChevronDown } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

interface ActivityEntry {
    id: string;
    action: string;
    type: 'submission' | 'user' | 'book' | 'message' | 'setting' | 'review';
    actor: string;
    target?: string;
    timestamp: any;
    details?: string;
}

const DEMO_ACTIVITY: ActivityEntry[] = [
    { id: 'a1', action: 'New submission received', type: 'submission', actor: 'System', target: 'The Hollow Crown', timestamp: new Date(Date.now() - 30 * 60000), details: 'By Ada Chen' },
    { id: 'a2', action: 'User registered', type: 'user', actor: 'System', target: 'jordan.kim@example.com', timestamp: new Date(Date.now() - 90 * 60000) },
    { id: 'a3', action: 'Submission status changed to reviewing', type: 'submission', actor: 'Admin', target: 'Signal Bloom', timestamp: new Date(Date.now() - 2 * 3600000) },
    { id: 'a4', action: 'Book published to catalogue', type: 'book', actor: 'Admin', target: 'Voices of the Diaspora', timestamp: new Date(Date.now() - 5 * 3600000) },
    { id: 'a5', action: 'New review posted', type: 'review', actor: 'Morgan Blake', target: 'The Hollow Crown', timestamp: new Date(Date.now() - 8 * 3600000), details: '5 stars' },
    { id: 'a6', action: 'New message from author', type: 'message', actor: 'Ada Chen', timestamp: new Date(Date.now() - 12 * 3600000), details: 'Re: manuscript revisions' },
    { id: 'a7', action: 'Submission declined', type: 'submission', actor: 'Admin', target: 'Untitled Fantasy', timestamp: new Date(Date.now() - 24 * 3600000) },
    { id: 'a8', action: 'Site settings updated', type: 'setting', actor: 'Admin', timestamp: new Date(Date.now() - 36 * 3600000), details: 'Submissions re-opened' },
    { id: 'a9', action: 'New constellation created', type: 'book', actor: 'Admin', target: 'Climate Requiem', timestamp: new Date(Date.now() - 48 * 3600000) },
    { id: 'a10', action: 'User role changed to author', type: 'user', actor: 'Admin', target: 'sam.chen@example.com', timestamp: new Date(Date.now() - 72 * 3600000) },
];

const TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
    submission: { icon: FileText, color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10' },
    user: { icon: Users, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10' },
    book: { icon: BookOpen, color: 'text-aurora-teal', bg: 'bg-aurora-teal/10' },
    message: { icon: MessageSquare, color: 'text-text-secondary', bg: 'bg-surface-elevated' },
    setting: { icon: Settings, color: 'text-text-muted', bg: 'bg-surface-elevated' },
    review: { icon: Star, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10' },
};

export default function AdminActivity() {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'activityLog'), snap => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityEntry));
            setActivities(data.length > 0 ? data : DEMO_ACTIVITY);
        }, () => setActivities(DEMO_ACTIVITY));
        return () => unsub();
    }, []);

    const getTimeAgo = (ts: any) => {
        if (!ts) return '';
        const d = ts instanceof Date ? ts : ts.toDate?.() || new Date(ts);
        const mins = Math.round((Date.now() - d.getTime()) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    const filtered = activities.filter(a => {
        if (typeFilter !== 'all' && a.type !== typeFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return a.action.toLowerCase().includes(q) || a.target?.toLowerCase().includes(q) || a.actor.toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Activity Log</h1>
                <span className="font-ui text-xs text-text-muted">{activities.length} events</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {['all', 'submission', 'user', 'book', 'message', 'setting', 'review'].map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)}
                        className={`px-3 py-1.5 rounded-sm font-ui text-[10px] uppercase tracking-wider ${typeFilter === t ? 'bg-starforge-gold text-void-black' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                            }`}>{t === 'all' ? 'All' : t}</button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" placeholder="Search activity..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-surface border border-border rounded-sm pl-10 pr-4 py-2.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold" />
            </div>

            {/* Timeline */}
            <div className="space-y-1">
                {filtered.map((a, i) => {
                    const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.setting;
                    const Icon = cfg.icon;
                    return (
                        <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            className="flex gap-3 p-3 bg-surface border border-border rounded-sm hover:border-starforge-gold/20 transition-colors">
                            <div className={`w-8 h-8 rounded-sm ${cfg.bg} flex items-center justify-center shrink-0`}>
                                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-ui text-xs text-text-primary">
                                    {a.action}
                                    {a.target && <span className="text-starforge-gold ml-1">"{a.target}"</span>}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-ui text-[9px] text-text-muted">{a.actor}</span>
                                    {a.details && <span className="font-ui text-[9px] text-text-muted">· {a.details}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-text-muted shrink-0">
                                <Clock className="w-3 h-3" />
                                <span className="font-mono text-[9px]">{getTimeAgo(a.timestamp)}</span>
                            </div>
                        </motion.div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <Activity className="w-10 h-10 text-text-muted/20 mx-auto mb-3" />
                        <p className="font-ui text-sm text-text-muted">No activity found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
