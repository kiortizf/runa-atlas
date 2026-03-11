import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, FileText, DollarSign, Users, TrendingUp, Clock, CheckCircle, AlertTriangle, Eye, MessageSquare, Scissors, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

interface DashboardStats {
    totalSubmissions: number;
    pendingSubmissions: number;
    acceptedSubmissions: number;
    totalBooks: number;
    totalAuthors: number;
    totalUsers: number;
    totalMessages: number;
    totalReviews: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalSubmissions: 0, pendingSubmissions: 0, acceptedSubmissions: 0,
        totalBooks: 0, totalAuthors: 0, totalUsers: 0, totalMessages: 0, totalReviews: 0,
    });
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);

    useEffect(() => {
        const unsubs: (() => void)[] = [];

        // Submissions
        unsubs.push(onSnapshot(collection(db, 'submissions'), snap => {
            const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setStats(prev => ({
                ...prev,
                totalSubmissions: docs.length,
                pendingSubmissions: docs.filter((d: any) => d.status === 'pending' || d.status === 'reviewing').length,
                acceptedSubmissions: docs.filter((d: any) => d.status === 'accepted').length,
            }));
            setRecentSubmissions(docs.slice(0, 5));
        }, () => { }));

        // Books
        unsubs.push(onSnapshot(collection(db, 'books'), snap => {
            setStats(prev => ({ ...prev, totalBooks: snap.docs.length }));
        }, () => { }));

        // Users
        unsubs.push(onSnapshot(collection(db, 'users'), snap => {
            setStats(prev => ({ ...prev, totalUsers: snap.docs.length }));
            setRecentUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 5));
        }, () => { }));

        // Reviews
        unsubs.push(onSnapshot(collection(db, 'reviews'), snap => {
            setStats(prev => ({ ...prev, totalReviews: snap.docs.length }));
        }, () => { }));

        // Messages
        unsubs.push(onSnapshot(collection(db, 'messages'), snap => {
            setStats(prev => ({ ...prev, totalMessages: snap.docs.length }));
        }, () => { }));

        return () => unsubs.forEach(u => u());
    }, []);

    const metricCards = [
        { label: 'Total Submissions', value: stats.totalSubmissions, icon: FileText, color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10', trend: '+12%', up: true },
        { label: 'Pending Review', value: stats.pendingSubmissions, icon: Clock, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', trend: null, up: false },
        { label: 'Accepted', value: stats.acceptedSubmissions, icon: CheckCircle, color: 'text-aurora-teal', bg: 'bg-aurora-teal/10', trend: null, up: true },
        { label: 'Books in Catalogue', value: stats.totalBooks, icon: BookOpen, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', trend: '+3', up: true },
        { label: 'Registered Users', value: stats.totalUsers, icon: Users, color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10', trend: null, up: true },
        { label: 'Reviews', value: stats.totalReviews, icon: Eye, color: 'text-aurora-teal', bg: 'bg-aurora-teal/10', trend: null, up: true },
        { label: 'Messages', value: stats.totalMessages, icon: MessageSquare, color: 'text-text-secondary', bg: 'bg-surface-elevated', trend: null, up: false },
        { label: 'Revenue (Demo)', value: '$48,200', icon: DollarSign, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', trend: '+8.3%', up: true },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">Dashboard</h1>
                <p className="font-ui text-xs text-text-muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metricCards.map((card, i) => (
                    <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface border border-border rounded-sm p-5 group hover:border-starforge-gold/20 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-sm ${card.bg} flex items-center justify-center`}>
                                <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
                            </div>
                            {card.trend && (
                                <span className={`flex items-center gap-0.5 font-mono text-[10px] ${card.up ? 'text-aurora-teal' : 'text-forge-red'}`}>
                                    {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {card.trend}
                                </span>
                            )}
                        </div>
                        <p className="font-display text-2xl text-text-primary">{card.value}</p>
                        <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider mt-1">{card.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Submission Queue */}
                <div className="bg-surface border border-border rounded-sm">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-heading text-sm text-text-primary font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-cosmic-purple" /> Submission Queue</h3>
                        <span className="font-mono text-[10px] text-text-muted">{stats.pendingSubmissions} pending</span>
                    </div>
                    <div className="divide-y divide-border">
                        {recentSubmissions.length === 0 ? (
                            <p className="p-6 text-center font-ui text-sm text-text-muted">No submissions yet</p>
                        ) : recentSubmissions.map((s: any) => (
                            <div key={s.id} className="p-3 flex items-center gap-3 hover:bg-void-black/30 transition-colors">
                                <div className={`w-2 h-2 rounded-full ${s.status === 'pending' ? 'bg-starforge-gold' : s.status === 'accepted' ? 'bg-aurora-teal' : 'bg-text-muted'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-heading text-xs text-text-primary truncate">{s.title || 'Untitled'}</p>
                                    <p className="font-ui text-[9px] text-text-muted">{s.genre || 'Unknown genre'} · {s.authorName || 'Unknown'}</p>
                                </div>
                                <span className="font-ui text-[9px] text-text-muted uppercase">{s.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-surface border border-border rounded-sm">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-heading text-sm text-text-primary font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-cosmic-purple" /> Recent Users</h3>
                        <span className="font-mono text-[10px] text-text-muted">{stats.totalUsers} total</span>
                    </div>
                    <div className="divide-y divide-border">
                        {recentUsers.length === 0 ? (
                            <p className="p-6 text-center font-ui text-sm text-text-muted">No users yet</p>
                        ) : recentUsers.map((u: any) => (
                            <div key={u.id} className="p-3 flex items-center gap-3 hover:bg-void-black/30 transition-colors">
                                {u.photoURL ? (
                                    <img src={u.photoURL} alt="" className="w-7 h-7 rounded-full border border-border" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-surface-elevated border border-border flex items-center justify-center">
                                        <Users className="w-3.5 h-3.5 text-text-muted" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-heading text-xs text-text-primary truncate">{u.displayName || 'Anonymous'}</p>
                                    <p className="font-ui text-[9px] text-text-muted">{u.email}</p>
                                </div>
                                <span className={`font-ui text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${u.role === 'admin' ? 'bg-starforge-gold/10 text-starforge-gold' : u.role === 'author' ? 'bg-cosmic-purple/10 text-cosmic-purple' : 'text-text-muted'
                                    }`}>{u.role || 'member'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Review Submissions', desc: `${stats.pendingSubmissions} pending`, color: 'border-cosmic-purple/30 hover:border-cosmic-purple/50', icon: FileText },
                    { label: 'Editorial Pipeline', desc: 'Active projects', color: 'border-starforge-gold/30 hover:border-starforge-gold/50', icon: Scissors },
                    { label: 'Manage Catalogue', desc: `${stats.totalBooks} books`, color: 'border-aurora-teal/30 hover:border-aurora-teal/50', icon: BookOpen },
                    { label: 'View Analytics', desc: 'Revenue & trends', color: 'border-text-muted/20 hover:border-text-muted/40', icon: BarChart3 },
                ].map(action => (
                    <div key={action.label} className={`bg-surface border ${action.color} rounded-sm p-4 cursor-pointer transition-colors`}>
                        <action.icon className="w-5 h-5 text-text-secondary mb-2" />
                        <p className="font-heading text-xs text-text-primary">{action.label}</p>
                        <p className="font-ui text-[9px] text-text-muted">{action.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
