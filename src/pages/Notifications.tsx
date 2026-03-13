import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BookOpen, MessageSquare, Star, Users, Gift,
    Check, AlertCircle, Settings, Trash2, Loader2, X
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useDemoData';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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

interface NotifSettings {
    releases: boolean; beta: boolean; messages: boolean;
    reviews: boolean; challenges: boolean; system: boolean;
}

const DEFAULT_SETTINGS: NotifSettings = {
    releases: true, beta: true, messages: true,
    reviews: true, challenges: true, system: true,
};

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { notifications, markRead, markAllRead, deleteNotif, loading } = useNotifications();
    const { user } = useAuth();
    const [filter, setFilter] = useState<string>('all');
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
    const [savingSettings, setSavingSettings] = useState(false);

    const loadSettings = async () => {
        if (!user?.uid) return;
        try {
            const settingsDoc = await getDoc(doc(db, `users/${user.uid}/preferences/notifications`));
            if (settingsDoc.exists()) setSettings(settingsDoc.data() as NotifSettings);
        } catch (e) { console.error('Settings load failed:', e); }
    };

    const saveSettings = async () => {
        if (!user?.uid) return;
        setSavingSettings(true);
        try {
            await setDoc(doc(db, `users/${user.uid}/preferences/notifications`), settings);
            setShowSettings(false);
        } catch (e) { console.error('Settings save failed:', e); }
        setSavingSettings(false);
    };

    const handleOpenSettings = () => {
        loadSettings();
        setShowSettings(true);
    };

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
                        <button onClick={handleOpenSettings} className="p-2 text-white/30 hover:text-white/60 transition-colors">
                            <Settings className="w-4 h-4" />
                        </button>
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
                                            {notif.actionLabel && notif.actionPath && (
                                                <button onClick={() => navigate(notif.actionPath!)} className="text-[11px] text-aurora-teal hover:text-aurora-teal/80 font-medium">{notif.actionLabel}</button>
                                            )}
                                            {notif.actionLabel && !notif.actionPath && (
                                                <span className="text-[11px] text-aurora-teal font-medium">{notif.actionLabel}</span>
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

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSettings(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface border border-border/30 rounded-xl w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-display text-white">Notification Preferences</h3>
                                <button onClick={() => setShowSettings(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-xs text-white/40 mb-4">Choose which notifications you'd like to receive.</p>
                            <div className="space-y-3">
                                {([
                                    { key: 'releases' as const, label: 'New Releases', desc: 'Book launches and pre-order alerts' },
                                    { key: 'beta' as const, label: 'Beta Reading', desc: 'Beta reader invitations and updates' },
                                    { key: 'messages' as const, label: 'Messages', desc: 'Direct messages and comments' },
                                    { key: 'reviews' as const, label: 'Reviews', desc: 'New review notifications' },
                                    { key: 'challenges' as const, label: 'Challenges', desc: 'Reading challenge updates' },
                                    { key: 'system' as const, label: 'System', desc: 'Platform updates and announcements' },
                                ]).map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                                        <div>
                                            <p className="text-sm text-white">{item.label}</p>
                                            <p className="text-[10px] text-white/30">{item.desc}</p>
                                        </div>
                                        <button onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key] })}
                                            className={`w-10 h-6 rounded-full transition-all flex items-center ${settings[item.key] ? 'bg-aurora-teal justify-end' : 'bg-white/[0.08] justify-start'}`}>
                                            <div className={`w-4 h-4 rounded-full mx-1 transition-all ${settings[item.key] ? 'bg-white' : 'bg-white/30'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                                <button onClick={saveSettings} disabled={savingSettings}
                                    className="flex items-center gap-2 px-5 py-2 bg-aurora-teal text-void-black text-sm font-semibold rounded-lg hover:bg-aurora-teal/90 disabled:opacity-50">
                                    {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Save Preferences
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
