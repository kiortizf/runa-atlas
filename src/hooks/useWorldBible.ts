import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

// ─── Types ──────────────────────────────────────────────

export interface WorldBibleEntry {
    id: string;
    manuscriptId: string;
    type: 'character' | 'location' | 'item' | 'faction' | 'lore' | 'timeline';
    name: string;
    description: string;
    details: Record<string, string>; // e.g. { 'Age': '34', 'Hair': 'Black' }
    tags: string[];
    imageUrl?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

const TYPE_DEFAULTS: Record<WorldBibleEntry['type'], string[]> = {
    character: ['Age', 'Role', 'Appearance', 'Personality', 'Motivation', 'Arc'],
    location: ['Region', 'Climate', 'Population', 'Significance'],
    item: ['Type', 'Origin', 'Properties', 'Current Owner'],
    faction: ['Leader', 'Goal', 'Size', 'Alignment'],
    lore: ['Era', 'Source', 'Relevance'],
    timeline: ['Date', 'Participants', 'Outcome'],
};

export function useWorldBible(manuscriptId?: string) {
    const [entries, setEntries] = useState<WorldBibleEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!manuscriptId) { setEntries([]); return; }
        setLoading(true);
        const q = query(
            collection(db, `manuscripts/${manuscriptId}/worldBible`),
            orderBy('name')
        );
        const unsub = onSnapshot(q, snap => {
            setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as WorldBibleEntry)));
            setLoading(false);
        }, (err) => { handleFirestoreError(err, OperationType.LIST, 'worldBible'); setLoading(false); });
        return unsub;
    }, [manuscriptId]);

    const addEntry = useCallback(async (type: WorldBibleEntry['type'], name: string) => {
        if (!manuscriptId || !name.trim()) return null;
        const defaultDetails: Record<string, string> = {};
        TYPE_DEFAULTS[type]?.forEach(k => { defaultDetails[k] = ''; });
        try {
            const ref = await addDoc(collection(db, `manuscripts/${manuscriptId}/worldBible`), {
                manuscriptId,
                type,
                name: name.trim(),
                description: '',
                details: defaultDetails,
                tags: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return ref.id;
        } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'worldBible');
            return null;
        }
    }, [manuscriptId]);

    const updateEntry = useCallback(async (entryId: string, data: Partial<WorldBibleEntry>) => {
        if (!manuscriptId) return;
        try {
            await updateDoc(doc(db, `manuscripts/${manuscriptId}/worldBible`, entryId), {
                ...data,
                updatedAt: serverTimestamp(),
            });
        } catch (err) {
            handleFirestoreError(err, OperationType.UPDATE, 'worldBible');
        }
    }, [manuscriptId]);

    const deleteEntry = useCallback(async (entryId: string) => {
        if (!manuscriptId) return;
        try {
            await deleteDoc(doc(db, `manuscripts/${manuscriptId}/worldBible`, entryId));
        } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, 'worldBible');
        }
    }, [manuscriptId]);

    return { entries, loading, addEntry, updateEntry, deleteEntry, TYPE_DEFAULTS };
}
