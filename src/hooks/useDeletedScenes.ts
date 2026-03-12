import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, where, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface DeletedScene {
    id: string;
    manuscriptId: string;
    manuscriptTitle: string;
    chapterId: string;
    chapterTitle: string;
    cutId: string;
    originalText: string;
    authorName: string;
    archivedAt: Timestamp;
    archivedBy: string;
    tags: string[];
    publishedAsBonus: boolean;
    bonusTitle?: string;
    bonusDescription?: string;
    membershipGated: boolean;
    viewCount: number;
    category: 'keep' | 'compress' | 'archive';
    rationaleTag: string;
    rationale: string;
}

export function useDeletedScenes(manuscriptId?: string) {
    const { user } = useAuth();
    const [scenes, setScenes] = useState<DeletedScene[]>([]);
    const [loading, setLoading] = useState(true);

    // Real-time listener
    useEffect(() => {
        if (!user) { setScenes([]); setLoading(false); return; }
        const constraints = manuscriptId
            ? [where('manuscriptId', '==', manuscriptId), orderBy('archivedAt', 'desc')]
            : [orderBy('archivedAt', 'desc')];
        const q = query(collection(db, 'deleted_scenes'), ...constraints);
        const unsub = onSnapshot(q, snap => {
            setScenes(snap.docs.map(d => ({ id: d.id, ...d.data() } as DeletedScene)));
            setLoading(false);
        }, err => { handleFirestoreError(err, OperationType.LIST, 'deleted_scenes'); setLoading(false); });
        return unsub;
    }, [user, manuscriptId]);

    // Publish as bonus content
    const publishAsBonus = async (sceneId: string, title: string, description: string, gated: boolean) => {
        try {
            await updateDoc(doc(db, 'deleted_scenes', sceneId), {
                publishedAsBonus: true,
                bonusTitle: title,
                bonusDescription: description,
                membershipGated: gated,
            });
        } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, 'deleted_scenes');
        }
    };

    // Unpublish
    const unpublishBonus = async (sceneId: string) => {
        try {
            await updateDoc(doc(db, 'deleted_scenes', sceneId), {
                publishedAsBonus: false,
                bonusTitle: '',
                bonusDescription: '',
            });
        } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, 'deleted_scenes');
        }
    };

    // Update tags
    const updateTags = async (sceneId: string, tags: string[]) => {
        try {
            await updateDoc(doc(db, 'deleted_scenes', sceneId), { tags });
        } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, 'deleted_scenes');
        }
    };

    // Permanently delete
    const permanentlyDelete = async (sceneId: string) => {
        try {
            await deleteDoc(doc(db, 'deleted_scenes', sceneId));
        } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, 'deleted_scenes');
        }
    };

    // Restore to manuscript (creates a note in Firestore for the editor to manually re-insert)
    const restoreScene = async (sceneId: string) => {
        try {
            await updateDoc(doc(db, 'deleted_scenes', sceneId), {
                restorationRequested: true,
                restorationRequestedAt: Timestamp.now(),
            });
        } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, 'deleted_scenes');
        }
    };

    // Stats
    const stats = useMemo(() => {
        const total = scenes.length;
        const published = scenes.filter(s => s.publishedAsBonus).length;
        const gated = scenes.filter(s => s.membershipGated).length;
        const totalWords = scenes.reduce((s, sc) => s + (sc.originalText?.split(/\s+/).length || 0), 0);
        const byManuscript: Record<string, number> = {};
        scenes.forEach(s => { byManuscript[s.manuscriptTitle] = (byManuscript[s.manuscriptTitle] || 0) + 1; });
        return { total, published, gated, totalWords, byManuscript };
    }, [scenes]);

    return {
        scenes, loading, publishAsBonus, unpublishBonus, updateTags,
        permanentlyDelete, restoreScene, stats,
    };
}
