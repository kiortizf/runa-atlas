import { useState, useEffect, useCallback } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

// ── Types ──
export interface Highlight {
    id: string;
    userId: string;
    displayName: string;
    photoURL?: string;
    paragraphId: string;
    startOffset: number;
    endOffset: number;
    highlightedText: string;
    note?: string;
    reaction?: string;
    isPublic: boolean;
    createdAt: any;
}

export interface AuthorNote {
    paragraphId: string;
    text: string;
    authorName: string;
}

export interface EditorNote {
    paragraphId: string;
    text: string;
    editorName: string;
}

export interface ParagraphStats {
    totalHighlights: number;
    reactions: Record<string, number>;
    sampleNotes: { displayName: string; note: string }[];
}

export interface ReadingProgress {
    currentChapter: string;
    scrollPercent: number;
    lastRead: any;
    bookmarks: { chapterId: string; paragraphId: string; note?: string }[];
}

interface UseAnnotationsOptions {
    bookId: string;
    chapterId: string;
    userId?: string;
}

export function useAnnotations({ bookId, chapterId, userId }: UseAnnotationsOptions) {
    const [myHighlights, setMyHighlights] = useState<Highlight[]>([]);
    const [communityHighlights, setCommunityHighlights] = useState<Highlight[]>([]);
    const [authorNotes, setAuthorNotes] = useState<AuthorNote[]>([]);
    const [editorNotes, setEditorNotes] = useState<EditorNote[]>([]);
    const [paragraphStats, setParagraphStats] = useState<Record<string, ParagraphStats>>({});
    const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);

    // Load community highlights (public ones)
    useEffect(() => {
        if (!bookId || !chapterId) return;
        const highlightsRef = collection(db, `books/${bookId}/chapters/${chapterId}/highlights`);
        const q = query(highlightsRef, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Highlight));
            const publicOnes = all.filter(h => h.isPublic);
            setCommunityHighlights(publicOnes);

            // Aggregate paragraph stats
            const stats: Record<string, ParagraphStats> = {};
            publicOnes.forEach(h => {
                if (!stats[h.paragraphId]) {
                    stats[h.paragraphId] = { totalHighlights: 0, reactions: {}, sampleNotes: [] };
                }
                stats[h.paragraphId].totalHighlights++;
                if (h.reaction) {
                    stats[h.paragraphId].reactions[h.reaction] = (stats[h.paragraphId].reactions[h.reaction] || 0) + 1;
                }
                if (h.note && stats[h.paragraphId].sampleNotes.length < 3) {
                    stats[h.paragraphId].sampleNotes.push({ displayName: h.displayName, note: h.note });
                }
            });
            setParagraphStats(stats);

            // Also filter my highlights from the same collection
            if (userId) {
                setMyHighlights(all.filter(h => h.userId === userId));
            }
        }, () => { });
        return () => unsub();
    }, [bookId, chapterId, userId]);

    // Load author + editor notes from chapter document
    useEffect(() => {
        if (!bookId || !chapterId) return;
        const chapterRef = doc(db, `books/${bookId}/chapters`, chapterId);
        const unsub = onSnapshot(chapterRef, snap => {
            if (snap.exists()) {
                const data = snap.data();
                setAuthorNotes(data.authorNotes || []);
                setEditorNotes(data.editorNotes || []);
            }
        }, () => { });
        return () => unsub();
    }, [bookId, chapterId]);

    // Load reading progress
    useEffect(() => {
        if (!userId || !bookId) return;
        const progressRef = doc(db, `users/${userId}/readingProgress`, bookId);
        const unsub = onSnapshot(progressRef, snap => {
            if (snap.exists()) {
                setReadingProgress(snap.data() as ReadingProgress);
            }
        }, () => { });
        return () => unsub();
    }, [userId, bookId]);

    // ── Actions ──
    const addHighlight = useCallback(async (data: {
        paragraphId: string;
        startOffset: number;
        endOffset: number;
        highlightedText: string;
        note?: string;
        reaction?: string;
        isPublic: boolean;
        displayName: string;
        photoURL?: string;
    }) => {
        if (!userId || !bookId || !chapterId) return;
        try {
            // Strip undefined fields: Firestore rejects undefined values
            const cleanData: Record<string, any> = {};
            Object.entries(data).forEach(([k, v]) => { if (v !== undefined) cleanData[k] = v; });

            const highlightRef = doc(collection(db, `books/${bookId}/chapters/${chapterId}/highlights`));
            await setDoc(highlightRef, {
                ...cleanData,
                userId,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `books/${bookId}/chapters/${chapterId}/highlights`);
        }
    }, [userId, bookId, chapterId]);

    const removeHighlight = useCallback(async (highlightId: string) => {
        if (!bookId || !chapterId) return;
        try {
            await deleteDoc(doc(db, `books/${bookId}/chapters/${chapterId}/highlights`, highlightId));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `highlights/${highlightId}`);
        }
    }, [bookId, chapterId]);

    const updateProgress = useCallback(async (data: Partial<ReadingProgress>) => {
        if (!userId || !bookId) return;
        try {
            await setDoc(doc(db, `users/${userId}/readingProgress`, bookId), {
                ...data,
                lastRead: serverTimestamp(),
            }, { merge: true });
        } catch { }
    }, [userId, bookId]);

    const addBookmark = useCallback(async (paragraphId: string, note?: string) => {
        if (!userId || !bookId) return;
        const existing = readingProgress?.bookmarks || [];
        const alreadyBookmarked = existing.some(b => b.paragraphId === paragraphId && b.chapterId === chapterId);
        const updated = alreadyBookmarked
            ? existing.filter(b => !(b.paragraphId === paragraphId && b.chapterId === chapterId))
            : [...existing, { chapterId, paragraphId, note }];
        await updateProgress({ bookmarks: updated });
    }, [userId, bookId, chapterId, readingProgress, updateProgress]);

    return {
        myHighlights,
        communityHighlights,
        authorNotes,
        editorNotes,
        paragraphStats,
        readingProgress,
        addHighlight,
        removeHighlight,
        updateProgress,
        addBookmark,
    };
}
