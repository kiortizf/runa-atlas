import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Shield, PenTool, User, Search, Mail, Calendar } from 'lucide-react';
import { collection, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import type { UserRole } from '../../contexts/AuthContext';

interface AppUser {
    id: string;
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    createdAt: any;
}

const ROLES: { value: UserRole; label: string; color: string; icon: any }[] = [
    { value: 'member', label: 'Member', color: 'text-text-secondary', icon: User },
    { value: 'author', label: 'Author', color: 'text-cosmic-purple', icon: PenTool },
    { value: 'admin', label: 'Admin', color: 'text-starforge-gold', icon: Shield },
];

export default function AdminUsers() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'users'), snap => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser)).sort((a, b) => {
                const order = { admin: 0, author: 1, member: 2 };
                return (order[a.role] ?? 3) - (order[b.role] ?? 3);
            }));
        }, () => { });
        return () => unsub();
    }, []);

    const changeRole = async (userId: string, newRole: UserRole) => {
        if (userId === auth.currentUser?.uid && newRole !== 'admin') {
            if (!window.confirm('You are about to remove your own admin access. Are you sure?')) return;
        }
        setUpdating(userId);
        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });
        } catch { /* ignore */ }
        setUpdating(null);
    };

    const getDate = (d: any) => {
        if (!d) return 'Unknown';
        if (d instanceof Timestamp) return d.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        if (d?.seconds) return new Date(d.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        return 'Unknown';
    };

    const filtered = users.filter(u => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
        }
        return true;
    });

    const roleCounts = {
        all: users.length,
        admin: users.filter(u => u.role === 'admin').length,
        author: users.filter(u => u.role === 'author').length,
        member: users.filter(u => u.role === 'member').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">User Management</h1>
                    <p className="font-ui text-xs text-text-muted mt-1">{users.length} registered users</p>
                </div>
            </div>

            {/* Role summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { key: 'all', label: 'Total Users', color: 'text-text-primary', icon: User },
                    ...ROLES.map(r => ({ key: r.value, label: `${r.label}s`, color: r.color, icon: r.icon })),
                ].map(card => (
                    <button key={card.key} onClick={() => setRoleFilter(card.key)}
                        className={`bg-surface border rounded-sm p-4 text-left transition-colors ${roleFilter === card.key ? 'border-starforge-gold/50' : 'border-border hover:border-border/80'
                            }`}>
                        <card.icon className={`w-4 h-4 ${card.color} mb-2`} />
                        <p className="font-display text-2xl text-text-primary">{roleCounts[card.key as keyof typeof roleCounts]}</p>
                        <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider">{card.label}</p>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-surface border border-border rounded-sm pl-10 pr-4 py-2.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold transition-colors" />
            </div>

            {/* Users Table */}
            <div className="bg-surface border border-border rounded-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-deep-space border-b border-border">
                            <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">User</th>
                            <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Email</th>
                            <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Joined</th>
                            <th className="p-3 font-ui text-[10px] text-text-muted uppercase tracking-wider">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => {
                            const currentRole = ROLES.find(r => r.value === u.role) || ROLES[0];
                            const isCurrentUser = u.uid === auth.currentUser?.uid;
                            const Icon = currentRole.icon;
                            return (
                                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="border-b border-border last:border-0 hover:bg-void-black/30 transition-colors">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            {u.photoURL ? (
                                                <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full border border-border" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center">
                                                    <User className="w-4 h-4 text-text-muted" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-heading text-sm text-text-primary">
                                                    {u.displayName || 'Anonymous'}
                                                    {isCurrentUser && <span className="font-ui text-[9px] text-starforge-gold ml-2">(you)</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="font-ui text-xs text-text-secondary flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-text-muted" /> {u.email}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className="font-ui text-xs text-text-muted flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {getDate(u.createdAt)}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            {updating === u.id ? (
                                                <span className="font-ui text-xs text-text-muted animate-pulse">Updating...</span>
                                            ) : (
                                                <div className="flex gap-1">
                                                    {ROLES.map(r => (
                                                        <button key={r.value} onClick={() => changeRole(u.id, r.value)}
                                                            className={`flex items-center gap-1 px-2 py-1 rounded-sm font-ui text-[10px] uppercase tracking-wider transition-colors border ${u.role === r.value
                                                                    ? `${r.color} ${r.value === 'admin' ? 'bg-starforge-gold/10 border-starforge-gold/30' : r.value === 'author' ? 'bg-cosmic-purple/10 border-cosmic-purple/30' : 'bg-surface-elevated border-border'}`
                                                                    : 'text-text-muted border-transparent hover:border-border hover:text-text-secondary'
                                                                }`}>
                                                            <r.icon className="w-2.5 h-2.5" /> {r.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-text-muted font-ui text-sm">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
