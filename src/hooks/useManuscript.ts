import { useState, useEffect, useCallback } from 'react';
import { collection, doc, addDoc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Manuscript {
    id: string;
    title: string;
    authorId: string;
    authorName: string;
    genre: string;
    description: string;
    targetWords: number;
    status: 'draft' | 'revision' | 'editing' | 'final';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Chapter {
    id: string;
    title: string;
    content: string; // TipTap JSON stringified
    plainText: string; // plain text for search/word count
    order: number;
    wordCount: number;
    notes: string;
    status: 'draft' | 'revised' | 'edited' | 'final';
    type: 'chapter' | 'scene' | 'notes' | 'research';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export function useManuscript(manuscriptId?: string) {
    const { user } = useAuth();
    const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Listen to all manuscripts for this user
    useEffect(() => {
        if (!user) { setManuscripts([]); setLoading(false); return; }
        const q = query(
            collection(db, 'manuscripts'),
            orderBy('updatedAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setManuscripts(snap.docs
                .map(d => ({ id: d.id, ...d.data() } as Manuscript))
                .filter(m => m.authorId === user.uid)
            );
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [user]);

    // Listen to chapters for the active manuscript
    useEffect(() => {
        if (!manuscriptId) { setChapters([]); return; }
        const q = query(
            collection(db, `manuscripts/${manuscriptId}/chapters`),
            orderBy('order', 'asc')
        );
        const unsub = onSnapshot(q, snap => {
            setChapters(snap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter)));
        });
        return unsub;
    }, [manuscriptId]);

    // Create a new manuscript
    const createManuscript = useCallback(async (title: string, genre: string = '', description: string = '') => {
        if (!user) return null;
        const ref = await addDoc(collection(db, 'manuscripts'), {
            title,
            authorId: user.uid,
            authorName: user.displayName || user.email || 'Author',
            genre,
            description,
            targetWords: 80000,
            status: 'draft',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        // Create a default first chapter
        await addDoc(collection(db, `manuscripts/${ref.id}/chapters`), {
            title: 'Chapter 1',
            content: '',
            plainText: '',
            order: 0,
            wordCount: 0,
            notes: '',
            status: 'draft',
            type: 'chapter',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return ref.id;
    }, [user]);

    // Update manuscript metadata
    const updateManuscript = useCallback(async (id: string, data: Partial<Manuscript>) => {
        await setDoc(doc(db, 'manuscripts', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    }, []);

    // Delete manuscript
    const deleteManuscript = useCallback(async (id: string) => {
        await deleteDoc(doc(db, 'manuscripts', id));
    }, []);

    // Add a new chapter
    const addChapter = useCallback(async (title: string = '', type: Chapter['type'] = 'chapter') => {
        if (!manuscriptId) return null;
        const order = chapters.length;
        // Count only items of the SAME type for auto-naming
        const sameTypeCount = chapters.filter(c => c.type === type).length;
        const autoTitle = title || (
            type === 'chapter' ? `Chapter ${sameTypeCount + 1}` :
                type === 'scene' ? `Scene ${sameTypeCount + 1}` :
                    type === 'notes' ? `Notes ${sameTypeCount > 0 ? sameTypeCount + 1 : ''}`.trim() :
                        type === 'research' ? `Research ${sameTypeCount > 0 ? sameTypeCount + 1 : ''}`.trim() :
                            'Untitled'
        );
        const ref = await addDoc(collection(db, `manuscripts/${manuscriptId}/chapters`), {
            title: autoTitle,
            content: '',
            plainText: '',
            order,
            wordCount: 0,
            notes: '',
            status: 'draft',
            type,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return ref.id;
    }, [manuscriptId, chapters]);

    // Save chapter content (auto-save)
    const saveChapter = useCallback(async (chapterId: string, content: string, plainText: string) => {
        if (!manuscriptId) return;
        setSaving(true);
        const wordCount = plainText.split(/\s+/).filter(Boolean).length;
        await setDoc(doc(db, `manuscripts/${manuscriptId}/chapters`, chapterId), {
            content,
            plainText,
            wordCount,
            updatedAt: serverTimestamp(),
        }, { merge: true });
        // Update manuscript timestamp
        await setDoc(doc(db, 'manuscripts', manuscriptId), { updatedAt: serverTimestamp() }, { merge: true });
        setSaving(false);
    }, [manuscriptId]);

    // Update chapter metadata (title, notes, status, order)
    const updateChapter = useCallback(async (chapterId: string, data: Partial<Chapter>) => {
        if (!manuscriptId) return;
        await setDoc(doc(db, `manuscripts/${manuscriptId}/chapters`, chapterId), {
            ...data,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    }, [manuscriptId]);

    // Delete chapter
    const deleteChapter = useCallback(async (chapterId: string) => {
        if (!manuscriptId) return;
        await deleteDoc(doc(db, `manuscripts/${manuscriptId}/chapters`, chapterId));
    }, [manuscriptId]);

    // Reorder chapters
    const reorderChapters = useCallback(async (fromIndex: number, toIndex: number) => {
        if (!manuscriptId) return;
        const reordered = [...chapters];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        // Batch update orders
        await Promise.all(reordered.map((ch, i) =>
            setDoc(doc(db, `manuscripts/${manuscriptId}/chapters`, ch.id), { order: i }, { merge: true })
        ));
    }, [manuscriptId, chapters]);

    // Total word count across all chapters
    const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);

    return {
        manuscripts,
        chapters,
        loading,
        saving,
        totalWords,
        createManuscript,
        updateManuscript,
        deleteManuscript,
        addChapter,
        saveChapter,
        updateChapter,
        deleteChapter,
        reorderChapters,
    };
}
