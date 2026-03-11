import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BookOpen, MessageSquare, Heart, Star, Users, Gift,
    Check, X, Clock, Megaphone, AlertCircle, Settings, Trash2
} from 'lucide-react';

// ═══════════════════════════════════════════
// NOTIFICATIONS — Member notification center
// ═══════════════════════════════════════════

interface NotifItem {
    id: string;
    type: 'release' | 'beta' | 'message' | 'review' | 'challenge' | 'system';
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
    action?: { label: string; path: string };
}

const MOCK_NOTIFICATIONS: NotifItem[] = [
    { id: '1', type: 'release', title: 'New Release: Chrome Meridian', body: "Xiomara Vega's latest cyberpunk novel is now available in the catalog.", timestamp: '2 hours ago', read: false, action: { label: 'View Book', path: '/catalog' } },
    { id: '2', type: 'beta', title: 'Beta Reader Invitation', body: "You've been invited to beta read Shadow Resonance by Alejandro Cruz.", timestamp: '5 hours ago', read: false, action: { label: 'Accept', path: '/beta-reader-hub' } },
    { id: '3', type: 'message', title: 'New Message from Editor', body: 'Regarding your manuscript Void Frequencies - revision notes attached.', timestamp: '1 day ago', read: false, action: { label: 'Read Message', path: '/portal' } },
    { id: '4', type: 'challenge', title: 'Challenge Complete!', body: 'You finished the Speculative Sprint reading challenge. Badge unlocked!', timestamp: '2 days ago', read: true },
    { id: '5', type: 'review', title: 'New Review on Your Book', body: 'Chrome Meridian received a 5-star review from ReaderX42.', timestamp: '3 days ago', read: true },
    { id: '6', type: 'system', title: 'Profile Update Reminder', body: 'Complete your reading preferences to get better recommendations.', timestamp: '1 week ago', read: true, action: { label: 'Update Profile', path: '/dashboard' } },
];

const TYPE_ICONS: Record<string, any> = {
    release: BookOpen,
    beta: Users,
    message: MessageSquare,
    review: Star,
    challenge: Gift,
    system: AlertCircle,
};

const TYPE_COLORS: Record<string, string> = {
    release: 'bg-aurora-teal/10 text-aurora-teal',
    beta: 'bg-violet-400/10 text-violet-400',
    message: 'bg-blue-400/10 text-blue-400',
    review: 'bg-starforge-gold/10 text-starforge-gold',
    challenge: 'bg-rose-400/10 text-rose-400',
    system: 'bg-white/[0.06] text-white/50',
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<string>('all');

    const unread = notifications.filter(n => !n.read).length;
    const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const deleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl tracking-wide uppercase">
                            Notifi<span className="text-aurora-teal">cations</span>
                        </h1>
                        {unread > 0 && <p className="text-sm text-aurora-teal mt-1">{unread} unread</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {unread > 0 && (
                            <button onClick={markAllRead}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white/[0.04] text-white/50 rounded-lg hover:text-white transition-colors">
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                        <button className="p-2 text-white/30 hover:text-white/60"><Settings className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
                    {['all', 'unread', 'release', 'beta', 'message', 'review', 'challenge'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-2 text-xs rounded-lg capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30' : 'bg-white/[0.04] text-white/40 border border-transparent hover:text-white'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                {/* Notification List */}
                <div className="space-y-2">
                    <AnimatePresence>
                        {filtered.map((notif) => {
                            const Icon = TYPE_ICONS[notif.type];
                            return (
                                <motion.div key={notif.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${notif.read ? 'bg-white/[0.01] border-white/[0.04]' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-none ${TYPE_COLORS[notif.type]}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className={`text-sm font-medium ${notif.read ? 'text-white/60' : 'text-white'}`}>{notif.title}</h3>
                                                <p className="text-xs text-white/40 mt-0.5">{notif.body}</p>
                                            </div>
                                            <span className="text-[10px] text-white/20 whitespace-nowrap flex-none">{notif.timestamp}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {notif.action && (
                                                <button className="text-[11px] text-aurora-teal hover:text-aurora-teal/80 font-medium">{notif.action.label}</button>
                                            )}
                                            {!notif.read && (
                                                <button onClick={() => markRead(notif.id)} className="text-[11px] text-white/30 hover:text-white/60">Mark read</button>
                                            )}
                                            <button onClick={() => deleteNotification(notif.id)} className="text-[11px] text-white/20 hover:text-forge-red ml-auto">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    {!notif.read && <div className="w-2 h-2 rounded-full bg-aurora-teal flex-none mt-2" />}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-white/20">
                            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
