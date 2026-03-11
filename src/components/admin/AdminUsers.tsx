import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Shield, PenTool, User, Search, Mail, Calendar, Plus, UserPlus, X, Trash2 } from 'lucide-react';
import { collection, onSnapshot, updateDoc, doc, setDoc, deleteDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
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

interface StaffInvite {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    status: 'pending' | 'accepted';
    createdAt: any;
}

const ROLES: { value: UserRole; label: string; color: string; icon: any }[] = [
    { value: 'member', label: 'Member', color: 'text-text-secondary', icon: User },
    { value: 'author', label: 'Author', color: 'text-cosmic-purple', icon: PenTool },
    { value: 'admin', label: 'Admin', color: 'text-starforge-gold', icon: Shield },
];

export default function AdminUsers() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [invites, setInvites] = useState<StaffInvite[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [updating, setUpdating] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', displayName: '', role: 'author' as UserRole });
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');

    useEffect(() => {
        const unsubs: (() => void)[] = [];
        unsubs.push(onSnapshot(collection(db, 'users'), snap => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser)).sort((a, b) => {
                const order = { admin: 0, author: 1, member: 2 };
                return (order[a.role] ?? 3) - (order[b.role] ?? 3);
            }));
        }, () => { }));
        unsubs.push(onSnapshot(collection(db, 'staff_invites'), snap => {
            setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffInvite)));
        }, () => { }));
        return () => unsubs.forEach(u => u());
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

    const addStaffMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');
        setInviteSuccess('');

        if (!inviteForm.email.trim() || !inviteForm.displayName.trim()) {
            setInviteError('Name and email are required.');
            return;
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email.toLowerCase() === inviteForm.email.toLowerCase().trim());
        if (existingUser) {
            // Just update their role
            try {
                await updateDoc(doc(db, 'users', existingUser.id), { role: inviteForm.role });
                setInviteSuccess(`Updated ${existingUser.displayName || existingUser.email} to ${inviteForm.role}.`);
                setTimeout(() => { setShowInviteModal(false); setInviteSuccess(''); }, 1500);
            } catch (err: any) {
                setInviteError(err.message || 'Failed to update user role.');
            }
            return;
        }

        // Create a staff invite record — when this person signs up, they'll be matched
        try {
            const inviteId = inviteForm.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
            await setDoc(doc(db, 'staff_invites', inviteId), {
                email: inviteForm.email.toLowerCase().trim(),
                displayName: inviteForm.displayName.trim(),
                role: inviteForm.role,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            setInviteSuccess(`Staff invite created for ${inviteForm.displayName}. They'll be assigned the "${inviteForm.role}" role on sign-up.`);
            setInviteForm({ email: '', displayName: '', role: 'author' });
            setTimeout(() => { setShowInviteModal(false); setInviteSuccess(''); }, 2500);
        } catch (err: any) {
            setInviteError(err.message || 'Failed to create staff invite.');
        }
    };

    const deleteInvite = async (id: string) => {
        if (window.confirm('Remove this staff invite?')) {
            try { await deleteDoc(doc(db, 'staff_invites', id)); } catch { }
        }
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

    const inputClass = 'w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all font-ui text-sm';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">User Management</h1>
                    <p className="font-ui text-xs text-text-muted mt-1">{users.length} registered users</p>
                </div>
                <button onClick={() => { setShowInviteModal(true); setInviteError(''); setInviteSuccess(''); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-starforge-gold text-void-black rounded-full font-ui font-medium text-sm hover:bg-starforge-gold/90 transition-all">
                    <UserPlus className="w-4 h-4" /> Add Staff Member
                </button>
            </div>

            {/* Pending Invites */}
            {invites.length > 0 && (
                <div className="bg-surface border border-amber-500/20 rounded-xl p-4">
                    <h3 className="font-heading text-sm text-amber-400 mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Pending Staff Invites ({invites.length})
                    </h3>
                    <div className="space-y-2">
                        {invites.map(inv => (
                            <div key={inv.id} className="flex items-center gap-3 bg-surface-elevated rounded-lg px-3 py-2">
                                <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-heading text-sm text-text-primary">{inv.displayName}</p>
                                    <p className="font-ui text-[10px] text-text-muted">{inv.email} · Role: {inv.role} · {inv.status}</p>
                                </div>
                                <button onClick={() => deleteInvite(inv.id)} className="p-1 text-text-muted hover:text-forge-red transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

            {/* Add Staff Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}>
                    <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading text-xl text-text-primary">Add Staff Member</h3>
                            <button onClick={() => setShowInviteModal(false)} className="p-1 text-text-muted hover:text-text-primary transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="font-ui text-xs text-text-muted mb-6">
                            If the person already has an account, their role will be updated immediately.
                            Otherwise, a staff invite will be created and they'll get the assigned role when they sign up.
                        </p>
                        <form onSubmit={addStaffMember} className="space-y-4">
                            <div>
                                <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Full Name</label>
                                <input type="text" required value={inviteForm.displayName}
                                    onChange={e => setInviteForm({ ...inviteForm, displayName: e.target.value })}
                                    className={inputClass} placeholder="e.g. Jane Doe" />
                            </div>
                            <div>
                                <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Email</label>
                                <input type="email" required value={inviteForm.email}
                                    onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                                    className={inputClass} placeholder="jane@example.com" />
                            </div>
                            <div>
                                <label className="font-ui text-xs text-text-muted uppercase tracking-wider block mb-1.5">Role</label>
                                <select value={inviteForm.role}
                                    onChange={e => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
                                    className={inputClass}>
                                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>

                            {inviteError && (
                                <div className="bg-forge-red/10 border border-forge-red/30 rounded-lg px-4 py-2 text-forge-red font-ui text-sm">
                                    {inviteError}
                                </div>
                            )}
                            {inviteSuccess && (
                                <div className="bg-aurora-teal/10 border border-aurora-teal/30 rounded-lg px-4 py-2 text-aurora-teal font-ui text-sm">
                                    {inviteSuccess}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="submit"
                                    className="flex-1 py-3 bg-starforge-gold text-void-black rounded-xl font-ui font-bold text-sm uppercase tracking-widest hover:bg-starforge-gold/90 transition-all">
                                    Add Staff
                                </button>
                                <button type="button" onClick={() => setShowInviteModal(false)}
                                    className="px-6 py-3 bg-surface-elevated text-text-primary rounded-xl font-ui text-sm border border-border/50 hover:bg-surface transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
