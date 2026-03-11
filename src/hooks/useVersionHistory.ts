import { useState, useEffect, useCallback } from 'react';
import { collection, doc, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import DiffMatchPatch from 'diff-match-patch';

export interface Version {
    id: string;
    content: string;
    plainText: string;
    wordCount: number;
    createdAt: Timestamp;
    message: string; // auto or manual note
}

export interface DiffSegment {
    type: 'equal' | 'insert' | 'delete';
    text: string;
}

const dmp = new DiffMatchPatch();

export function useVersionHistory(manuscriptId?: string, chapterId?: string) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(false);

    // Listen to versions for the active chapter
    useEffect(() => {
        if (!manuscriptId || !chapterId) { setVersions([]); return; }
        setLoading(true);
        const q = query(
            collection(db, `manuscripts/${manuscriptId}/chapters/${chapterId}/versions`),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        const unsub = onSnapshot(q, snap => {
            setVersions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Version)));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [manuscriptId, chapterId]);

    // Save a new version snapshot
    const saveVersion = useCallback(async (content: string, plainText: string, message: string = 'Auto-save') => {
        if (!manuscriptId || !chapterId) return;
        // Don't save empty or duplicate versions
        if (!plainText.trim()) return;
        if (versions.length > 0 && versions[0].plainText === plainText) return;

        const wordCount = plainText.split(/\s+/).filter(Boolean).length;
        await addDoc(collection(db, `manuscripts/${manuscriptId}/chapters/${chapterId}/versions`), {
            content,
            plainText,
            wordCount,
            message,
            createdAt: serverTimestamp(),
        });
    }, [manuscriptId, chapterId, versions]);

    // Compute diff between two versions
    const computeDiff = useCallback((oldText: string, newText: string): DiffSegment[] => {
        const diffs = dmp.diff_main(oldText, newText);
        dmp.diff_cleanupSemantic(diffs);
        return diffs.map(([op, text]) => ({
            type: op === 0 ? 'equal' : op === 1 ? 'insert' : 'delete',
            text,
        }));
    }, []);

    // Get diff between two version indices
    const getDiffBetween = useCallback((olderIndex: number, newerIndex: number): DiffSegment[] => {
        if (olderIndex >= versions.length || newerIndex >= versions.length) return [];
        return computeDiff(versions[olderIndex].plainText, versions[newerIndex].plainText);
    }, [versions, computeDiff]);

    // Word count change between versions
    const getWordDelta = useCallback((olderIndex: number, newerIndex: number): number => {
        if (olderIndex >= versions.length || newerIndex >= versions.length) return 0;
        return versions[newerIndex].wordCount - versions[olderIndex].wordCount;
    }, [versions]);

    return {
        versions,
        loading,
        saveVersion,
        computeDiff,
        getDiffBetween,
        getWordDelta,
    };
}
