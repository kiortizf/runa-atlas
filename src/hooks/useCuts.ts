import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

// ── Types ──
export type CutCategory = 'keep' | 'compress' | 'archive';
export type CutRationaleTag = 'pacing' | 'redundancy' | 'wordcount' | 'clarity' | 'scope';
export type AuthorResponse = 'accepted' | 'counter' | 'defend' | 'relocate';
export type CutStatus = 'proposed' | 'accepted' | 'rejected' | 'archived';

export interface EditorialCut {
    id: string;
    chapterId: string;
    chapterTitle: string;
    paragraphIndex: number;
    originalText: string;
    proposedText?: string;
    category: CutCategory;
    rationale: string;
    rationaleTag: CutRationaleTag;
    impactScore: number;
    authorResponse?: AuthorResponse;
    authorNote?: string;
    authorCounterText?: string;
    editorOverride?: boolean;
    editorOverrideNote?: string;
    status: CutStatus;
    createdBy: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface DeletedScene {
    id: string;
    manuscriptId: string;
    manuscriptTitle: string;
    chapterTitle: string;
    originalText: string;
    editorNote: string;
    authorName: string;
    publishable: boolean;
    publishedAs?: 'newsletter' | 'membership' | 'special_edition' | 'public';
    archivedAt?: any;
}

const RATIONALE_LABELS: Record<CutRationaleTag, string> = {
    pacing: '⏱️ Pacing — slows momentum at a critical juncture',
    redundancy: '🔁 Redundancy — same information delivered more effectively elsewhere',
    wordcount: '📏 Word Count — passage can be woven into existing prose',
    clarity: '🔍 Clarity — passage confuses rather than clarifies',
    scope: '📚 Scope — belongs in a sequel or companion work',
};

// ── Main Hook ──
export function useCuts(manuscriptId?: string) {
    const [cuts, setCuts] = useState<EditorialCut[]>([]);
    const [loading, setLoading] = useState(true);

    // Real-time Firestore listener
    useEffect(() => {
        if (!manuscriptId) { setLoading(false); return; }
        const unsub = onSnapshot(
            query(collection(db, 'manuscripts', manuscriptId, 'cuts'), orderBy('createdAt', 'desc')),
            (snap) => {
                setCuts(snap.docs.map(d => ({ id: d.id, ...d.data() } as EditorialCut)));
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, [manuscriptId]);

    // Propose a cut (editor action)
    const proposeCut = useCallback(async (cut: Omit<EditorialCut, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
        if (!manuscriptId) return;
        try {
            await addDoc(collection(db, 'manuscripts', manuscriptId, 'cuts'), {
                ...cut,
                status: 'proposed',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        } catch (e) {
            console.error('Failed to propose cut:', e);
        }
    }, [manuscriptId]);

    // Author responds to a cut
    const authorRespond = useCallback(async (
        cutId: string,
        response: AuthorResponse,
        note?: string,
        counterText?: string
    ) => {
        if (!manuscriptId) return;
        const updates: Partial<EditorialCut> = {
            authorResponse: response,
            authorNote: note,
            updatedAt: Timestamp.now(),
        };
        if (response === 'counter' && counterText) {
            updates.authorCounterText = counterText;
        }
        if (response === 'accepted') {
            updates.status = 'accepted';
        }
        try {
            await setDoc(doc(db, 'manuscripts', manuscriptId, 'cuts', cutId), updates, { merge: true });
        } catch (e) {
            console.error('Failed to respond to cut:', e);
        }
    }, [manuscriptId]);

    // Editor override (final say)
    const editorOverride = useCallback(async (cutId: string, note: string) => {
        if (!manuscriptId) return;
        try {
            await setDoc(doc(db, 'manuscripts', manuscriptId, 'cuts', cutId), {
                editorOverride: true,
                editorOverrideNote: note,
                status: 'accepted',
                updatedAt: Timestamp.now(),
            }, { merge: true });
        } catch (e) {
            console.error('Failed to override:', e);
        }
    }, [manuscriptId]);

    // Archive (move to deleted scenes vault)
    const archiveCut = useCallback(async (
        cutId: string,
        manuscriptTitle: string,
        authorName: string
    ) => {
        if (!manuscriptId) return;
        const cut = cuts.find(c => c.id === cutId);
        if (!cut) return;

        try {
            // Add to deleted_scenes collection
            await addDoc(collection(db, 'deleted_scenes'), {
                manuscriptId,
                manuscriptTitle,
                chapterTitle: cut.chapterTitle,
                originalText: cut.originalText,
                editorNote: cut.rationale,
                authorName,
                publishable: true,
                archivedAt: Timestamp.now(),
            } satisfies Omit<DeletedScene, 'id'>);

            // Update cut status
            await setDoc(doc(db, 'manuscripts', manuscriptId, 'cuts', cutId), {
                status: 'archived',
                category: 'archive',
                updatedAt: Timestamp.now(),
            }, { merge: true });
        } catch (e) {
            console.error('Failed to archive cut:', e);
        }
    }, [manuscriptId, cuts]);

    // Delete cut
    const deleteCut = useCallback(async (cutId: string) => {
        if (!manuscriptId) return;
        try {
            await deleteDoc(doc(db, 'manuscripts', manuscriptId, 'cuts', cutId));
        } catch (e) {
            console.error('Failed to delete cut:', e);
        }
    }, [manuscriptId]);

    // Stats
    const stats = useMemo(() => {
        const proposed = cuts.filter(c => c.status === 'proposed').length;
        const accepted = cuts.filter(c => c.status === 'accepted').length;
        const rejected = cuts.filter(c => c.status === 'rejected').length;
        const archived = cuts.filter(c => c.status === 'archived').length;
        const defended = cuts.filter(c => c.authorResponse === 'defend').length;
        const overridden = cuts.filter(c => c.editorOverride).length;
        const wordsToRemove = cuts.filter(c => c.status === 'accepted' || c.status === 'archived')
            .reduce((sum, c) => sum + (c.originalText.split(/\s+/).length - (c.proposedText?.split(/\s+/).length || 0)), 0);

        return { total: cuts.length, proposed, accepted, rejected, archived, defended, overridden, wordsToRemove };
    }, [cuts]);

    // Group by category
    const byCategory = useMemo(() => ({
        keep: cuts.filter(c => c.category === 'keep'),
        compress: cuts.filter(c => c.category === 'compress'),
        archive: cuts.filter(c => c.category === 'archive'),
    }), [cuts]);

    return {
        cuts,
        loading,
        proposeCut,
        authorRespond,
        editorOverride,
        archiveCut,
        deleteCut,
        stats,
        byCategory,
        RATIONALE_LABELS,
    };
}
