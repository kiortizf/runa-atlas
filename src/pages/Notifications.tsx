import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BookOpen, MessageSquare, Star, Users, Gift,
    Check, AlertCircle, Settings, Trash2, Loader2
} from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '../hooks/useDemoData';

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
    const { notifications, markRead, markAllRead, deleteNotif, loading } = useNotifications();
    const [filter, setFilter] = useState<string>('all');

    if (loading) {
        return <div className="min-h-screen bg-void-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-aurora-teal animate-spin" /></div>;
    }

    const unread = notifications.filter(n => !n.read).length;
    const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);

    return (
        <div className="min-h-screen bg-void-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-8">
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

                <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
                    {['all', 'unread', 'release', 'beta', 'message', 'review', 'challenge'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-2 text-xs rounded-lg capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30' : 'bg-white/[0.04] text-white/40 border border-transparent hover:text-white'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                <div className="space-y-2">
                    <AnimatePresence>
                        {filtered.map((notif) => {
                            const Icon = TYPE_ICONS[notif.type] || Bell;
                            return (
                                <motion.div key={notif.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${notif.read ? 'bg-white/[0.01] border-white/[0.04]' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-none ${TYPE_COLORS[notif.type] || 'bg-white/[0.06] text-white/50'}`}>
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
                                            {notif.actionLabel && (
                                                <button className="text-[11px] text-aurora-teal hover:text-aurora-teal/80 font-medium">{notif.actionLabel}</button>
                                            )}
                                            {!notif.read && (
                                                <button onClick={() => markRead(notif.id)} className="text-[11px] text-white/30 hover:text-white/60">Mark read</button>
                                            )}
                                            <button onClick={() => deleteNotif(notif.id)} className="text-[11px] text-white/20 hover:text-forge-red ml-auto">
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
