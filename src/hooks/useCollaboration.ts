import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot, deleteDoc, addDoc, collection, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// ── Presence System ──
// Each user editing a manuscript gets a "presence" doc in Firestore
// that shows their name, color, active chapter, and cursor position.

export interface Presence {
    uid: string;
    name: string;
    avatar?: string;
    color: string;
    chapterId: string | null;
    cursorPos: number;
    lastSeen: Timestamp;
}

const CURSOR_COLORS = [
    '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#EF4444', '#06B6D4', '#84CC16',
];

function getColorForUser(uid: string): string {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function useCollaboration(manuscriptId?: string) {
    const { user } = useAuth();
    const [collaborators, setCollaborators] = useState<Presence[]>([]);
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Register presence
    useEffect(() => {
        if (!user || !manuscriptId) return;

        const presenceRef = doc(db, `manuscripts/${manuscriptId}/presence`, user.uid);

        // Write presence doc
        const updatePresence = (chapterId: string | null = null, cursorPos: number = 0) => {
            setDoc(presenceRef, {
                uid: user.uid,
                name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                avatar: user.photoURL || '',
                color: getColorForUser(user.uid),
                chapterId,
                cursorPos,
                lastSeen: serverTimestamp(),
            }, { merge: true });
        };

        // Initial presence
        updatePresence();

        // Heartbeat every 30s
        heartbeatRef.current = setInterval(() => updatePresence(), 30000);

        // Listen to all presence docs
        const q = query(collection(db, `manuscripts/${manuscriptId}/presence`));
        const unsub = onSnapshot(q, snap => {
            const now = Date.now();
            const active = snap.docs
                .map(d => ({ ...d.data() } as Presence))
                .filter(p => {
                    // Filter out stale (>2 min) and self
                    if (p.uid === user.uid) return false;
                    if (p.lastSeen?.toDate) {
                        return (now - p.lastSeen.toDate().getTime()) < 120000;
                    }
                    return true;
                });
            setCollaborators(active);
        });

        // Cleanup
        return () => {
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            deleteDoc(presenceRef).catch(() => { });
            unsub();
        };
    }, [user, manuscriptId]);

    // Update chapter + cursor
    const updateCursor = useCallback((chapterId: string | null, cursorPos: number) => {
        if (!user || !manuscriptId) return;
        setDoc(doc(db, `manuscripts/${manuscriptId}/presence`, user.uid), {
            chapterId,
            cursorPos,
            lastSeen: serverTimestamp(),
        }, { merge: true });
    }, [user, manuscriptId]);

    return { collaborators, updateCursor };
}

// ── Comments System ──
export interface Comment {
    id: string;
    uid: string;
    authorName: string;
    authorAvatar?: string;
    chapterId: string;
    // The text range the comment is anchored to
    highlightText: string;
    highlightFrom: number;
    highlightTo: number;
    // Comment content
    body: string;
    status: 'open' | 'resolved';
    replies: CommentReply[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CommentReply {
    uid: string;
    authorName: string;
    body: string;
    createdAt: Timestamp;
}

export function useComments(manuscriptId?: string, chapterId?: string) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);

    // Listen to comments for the active chapter
    useEffect(() => {
        if (!manuscriptId || !chapterId) { setComments([]); return; }
        setLoading(true);
        const q = query(collection(db, `manuscripts/${manuscriptId}/comments`));
        const unsub = onSnapshot(q, snap => {
            const all = snap.docs
                .map(d => ({ id: d.id, ...d.data() } as Comment))
                .filter(c => c.chapterId === chapterId)
                .sort((a, b) => (a.highlightFrom || 0) - (b.highlightFrom || 0));
            setComments(all);
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [manuscriptId, chapterId]);

    // Add a new comment
    const addComment = useCallback(async (
        highlightText: string,
        highlightFrom: number,
        highlightTo: number,
        body: string
    ) => {
        if (!user || !manuscriptId || !chapterId) return;
        await addDoc(collection(db, `manuscripts/${manuscriptId}/comments`), {
            uid: user.uid,
            authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
            authorAvatar: user.photoURL || '',
            chapterId,
            highlightText,
            highlightFrom,
            highlightTo,
            body,
            status: 'open',
            replies: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }, [user, manuscriptId, chapterId]);

    // Reply to a comment
    const replyToComment = useCallback(async (commentId: string, body: string) => {
        if (!user || !manuscriptId) return;
        const commentRef = doc(db, `manuscripts/${manuscriptId}/comments`, commentId);
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;
        const newReply: CommentReply = {
            uid: user.uid,
            authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
            body,
            createdAt: Timestamp.now(),
        };
        await setDoc(commentRef, {
            replies: [...(comment.replies || []), newReply],
            updatedAt: serverTimestamp(),
        }, { merge: true });
    }, [user, manuscriptId, comments]);

    // Resolve / reopen comment
    const toggleResolve = useCallback(async (commentId: string) => {
        if (!manuscriptId) return;
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;
        await setDoc(doc(db, `manuscripts/${manuscriptId}/comments`, commentId), {
            status: comment.status === 'open' ? 'resolved' : 'open',
            updatedAt: serverTimestamp(),
        }, { merge: true });
    }, [manuscriptId, comments]);

    // Delete comment
    const deleteComment = useCallback(async (commentId: string) => {
        if (!manuscriptId) return;
        await deleteDoc(doc(db, `manuscripts/${manuscriptId}/comments`, commentId));
    }, [manuscriptId]);

    const openComments = comments.filter(c => c.status === 'open');
    const resolvedComments = comments.filter(c => c.status === 'resolved');

    return {
        comments,
        openComments,
        resolvedComments,
        loading,
        addComment,
        replyToComment,
        toggleResolve,
        deleteComment,
    };
}

// ── Suggestion Mode ──
export interface Suggestion {
    id: string;
    uid: string;
    authorName: string;
    chapterId: string;
    type: 'insert' | 'delete' | 'replace';
    originalText: string;
    suggestedText: string;
    from: number;
    to: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Timestamp;
}

export function useSuggestions(manuscriptId?: string, chapterId?: string) {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        if (!manuscriptId || !chapterId) { setSuggestions([]); return; }
        const q = query(collection(db, `manuscripts/${manuscriptId}/suggestions`));
        const unsub = onSnapshot(q, snap => {
            setSuggestions(
                snap.docs
                    .map(d => ({ id: d.id, ...d.data() } as Suggestion))
                    .filter(s => s.chapterId === chapterId)
                    .sort((a, b) => a.from - b.from)
            );
        });
        return unsub;
    }, [manuscriptId, chapterId]);

    const addSuggestion = useCallback(async (
        type: 'insert' | 'delete' | 'replace',
        originalText: string,
        suggestedText: string,
        from: number,
        to: number
    ) => {
        if (!user || !manuscriptId || !chapterId) return;
        await addDoc(collection(db, `manuscripts/${manuscriptId}/suggestions`), {
            uid: user.uid,
            authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
            chapterId,
            type,
            originalText,
            suggestedText,
            from,
            to,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
    }, [user, manuscriptId, chapterId]);

    const acceptSuggestion = useCallback(async (id: string) => {
        if (!manuscriptId) return;
        await setDoc(doc(db, `manuscripts/${manuscriptId}/suggestions`, id), { status: 'accepted' }, { merge: true });
    }, [manuscriptId]);

    const rejectSuggestion = useCallback(async (id: string) => {
        if (!manuscriptId) return;
        await setDoc(doc(db, `manuscripts/${manuscriptId}/suggestions`, id), { status: 'rejected' }, { merge: true });
    }, [manuscriptId]);

    const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

    return { suggestions, pendingSuggestions, addSuggestion, acceptSuggestion, rejectSuggestion };
}
