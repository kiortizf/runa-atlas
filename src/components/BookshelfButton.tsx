import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BookmarkPlus, CheckCircle, Eye } from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

type ReadStatus = 'want_to_read' | 'reading' | 'read' | null;

interface Props {
    bookId: string;
    bookTitle: string;
    compact?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof BookOpen; color: string; bg: string }> = {
    want_to_read: { label: 'Want to Read', icon: BookmarkPlus, color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10 border-cosmic-purple/30' },
    reading: { label: 'Reading', icon: Eye, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10 border-starforge-gold/30' },
    read: { label: 'Read', icon: CheckCircle, color: 'text-aurora-teal', bg: 'bg-aurora-teal/10 border-aurora-teal/30' },
};

export default function BookshelfButton({ bookId, bookTitle, compact = false }: Props) {
    const { user, signIn } = useAuth();
    const [status, setStatus] = useState<ReadStatus>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [counts, setCounts] = useState({ want_to_read: 0, reading: 0, read: 0 });

    // Load current user status
    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, `users/${user.uid}/bookshelf`, bookId), snap => {
            setStatus(snap.exists() ? (snap.data().status as ReadStatus) : null);
        }, () => { });
        return () => unsub();
    }, [user, bookId]);

    // Load community counts
    useEffect(() => {
        const q = query(collection(db, 'bookshelfEntries'), where('bookId', '==', bookId));
        const unsub = onSnapshot(q, snap => {
            const entries = snap.docs.map(d => d.data());
            setCounts({
                want_to_read: entries.filter(e => e.status === 'want_to_read').length,
                reading: entries.filter(e => e.status === 'reading').length,
                read: entries.filter(e => e.status === 'read').length,
            });
        }, () => { });
        return () => unsub();
    }, [bookId]);

    const setReadStatus = async (newStatus: ReadStatus) => {
        if (!user) { signIn(); return; }
        setShowDropdown(false);

        if (newStatus === status) {
            // Remove status
            try {
                await deleteDoc(doc(db, `users/${user.uid}/bookshelf`, bookId));
                await deleteDoc(doc(db, 'bookshelfEntries', `${user.uid}_${bookId}`));
                setStatus(null);
            } catch { /* ignore */ }
        } else {
            // Set status
            try {
                await setDoc(doc(db, `users/${user.uid}/bookshelf`, bookId), {
                    bookId, bookTitle, status: newStatus, updatedAt: serverTimestamp(),
                });
                await setDoc(doc(db, 'bookshelfEntries', `${user.uid}_${bookId}`), {
                    userId: user.uid, bookId, status: newStatus, updatedAt: serverTimestamp(),
                });
                setStatus(newStatus);
            } catch { /* ignore */ }
        }
    };

    const totalReaders = counts.want_to_read + counts.reading + counts.read;

    if (compact) {
        const activeStatus = status ? STATUS_CONFIG[status] : null;
        return (
            <div className="relative">
                <button onClick={() => user ? setShowDropdown(!showDropdown) : signIn()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-ui text-[10px] uppercase tracking-wider border transition-colors ${activeStatus ? `${activeStatus.bg} ${activeStatus.color}` : 'bg-surface border-border text-text-muted hover:text-starforge-gold hover:border-starforge-gold/30'
                        }`}>
                    {activeStatus ? <activeStatus.icon className="w-3 h-3" /> : <BookmarkPlus className="w-3 h-3" />}
                    {activeStatus ? activeStatus.label : 'Add to Shelf'}
                </button>
                <AnimatePresence>
                    {showDropdown && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            className="absolute top-full mt-1 right-0 z-20 bg-surface border border-border rounded-sm shadow-lg min-w-[140px]">
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <button key={key} onClick={() => setReadStatus(key as ReadStatus)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 font-ui text-xs transition-colors hover:bg-void-black/50 ${status === key ? cfg.color : 'text-text-secondary'}`}>
                                    <cfg.icon className="w-3 h-3" /> {cfg.label} {status === key && '✓'}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider">Your Bookshelf</p>
                {totalReaders > 0 && <span className="font-mono text-[9px] text-text-muted">{totalReaders} readers</span>}
            </div>
            <div className="flex gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const isActive = status === key;
                    const Icon = cfg.icon;
                    return (
                        <button key={key} onClick={() => user ? setReadStatus(key as ReadStatus) : signIn()}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-sm border transition-all ${isActive ? `${cfg.bg} ${cfg.color}` : 'border-border bg-deep-space text-text-muted hover:text-text-primary hover:border-border/80'
                                }`}>
                            <Icon className="w-4 h-4" />
                            <span className="font-ui text-[8px] uppercase tracking-wider">{cfg.label}</span>
                            {counts[key as keyof typeof counts] > 0 && (
                                <span className="font-mono text-[8px] text-text-muted">{counts[key as keyof typeof counts]}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
