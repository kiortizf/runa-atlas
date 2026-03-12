import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

// ── Types ──
export type ThreadType = 'subplot' | 'character_arc' | 'theme' | 'mystery' | 'relationship';

export interface ThreadScene {
    chapterId: string;
    chapterTitle: string;
    paragraphRange: [number, number];
    role: 'intro' | 'develop' | 'climax' | 'resolve';
    summary?: string;
}

export interface NarrativeThread {
    id: string;
    name: string;
    type: ThreadType;
    color: string;
    description: string;
    scenes: ThreadScene[];
    status: 'active' | 'abandoned' | 'resolved';
    importance: 'critical' | 'major' | 'minor';
    createdAt?: any;
}

export interface ThreadGap {
    threadId: string;
    threadName: string;
    afterChapter: string;
    gapLength: number; // chapters without mention
}

export interface ThreadCompressionSuggestion {
    threadId: string;
    threadName: string;
    currentScenes: number;
    suggestedMinimum: number;
    removableScenes: ThreadScene[];
}

const THREAD_COLORS = [
    '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981',
    '#ec4899', '#06b6d4', '#f97316', '#22c55e', '#a855f7',
    '#14b8a6', '#84cc16',
];

const THREAD_TYPE_LABELS: Record<ThreadType, string> = {
    subplot: '🧵 Subplot',
    character_arc: '👤 Character Arc',
    theme: '🎨 Theme',
    mystery: '❓ Mystery',
    relationship: '💕 Relationship',
};

// ── Auto-detection heuristics ──
function autoDetectThreads(
    chapters: { id: string; title: string; plainText: string }[]
): NarrativeThread[] {
    const threads: NarrativeThread[] = [];
    const characterMentions: Record<string, { chapters: Set<string>; firstSeen: number }> = {};

    // Extract character names (capitalized words appearing 3+ times)
    const allText = chapters.map(c => c.plainText || '').join('\n');
    const nameRegex = /\b([A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})?)\b/g;
    const nameCounts: Record<string, number> = {};
    let match: RegExpExecArray | null;
    while ((match = nameRegex.exec(allText)) !== null) {
        const name = match[1];
        // Skip common English words that are capitalized at start of sentences
        if (['The', 'This', 'That', 'What', 'When', 'Where', 'Which', 'There', 'Then', 'They', 'Their', 'Some', 'Every', 'Another', 'Each', 'After', 'Before', 'Behind', 'Between'].includes(name)) continue;
        nameCounts[name] = (nameCounts[name] || 0) + 1;
    }

    // Characters mentioned 5+ times get character arc threads
    const significantChars = Object.entries(nameCounts)
        .filter(([, c]) => c >= 5)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    significantChars.forEach(([name], idx) => {
        const scenes: ThreadScene[] = [];
        chapters.forEach((ch, chIdx) => {
            if ((ch.plainText || '').includes(name)) {
                scenes.push({
                    chapterId: ch.id,
                    chapterTitle: ch.title,
                    paragraphRange: [0, 0],
                    role: chIdx === 0 ? 'intro' : chIdx === chapters.length - 1 ? 'resolve' : 'develop',
                });
            }
        });

        if (scenes.length >= 2) {
            threads.push({
                id: `auto-char-${idx}`,
                name: `${name}'s Arc`,
                type: 'character_arc',
                color: THREAD_COLORS[idx % THREAD_COLORS.length],
                description: `Auto-detected character thread for ${name} (appears in ${scenes.length} chapters)`,
                scenes,
                status: 'active',
                importance: scenes.length > chapters.length * 0.5 ? 'critical' : 'major',
            });
        }
    });

    return threads;
}

// ── Main Hook ──
export function useThreads(manuscriptId?: string) {
    const [threads, setThreads] = useState<NarrativeThread[]>([]);
    const [loading, setLoading] = useState(true);

    // Load from Firestore
    useEffect(() => {
        if (!manuscriptId) { setLoading(false); return; }
        const unsub = onSnapshot(
            collection(db, 'manuscripts', manuscriptId, 'threads'),
            (snap) => {
                setThreads(snap.docs.map(d => ({ id: d.id, ...d.data() } as NarrativeThread)));
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, [manuscriptId]);

    // Create thread
    const addThread = useCallback(async (thread: Omit<NarrativeThread, 'id' | 'createdAt'>) => {
        if (!manuscriptId) return;
        const id = `thread-${Date.now()}`;
        try {
            await setDoc(doc(db, 'manuscripts', manuscriptId, 'threads', id), {
                ...thread,
                id,
                createdAt: Timestamp.now(),
            });
        } catch (e) {
            console.error('Failed to add thread:', e);
        }
    }, [manuscriptId]);

    // Update thread
    const updateThread = useCallback(async (threadId: string, updates: Partial<NarrativeThread>) => {
        if (!manuscriptId) return;
        try {
            await setDoc(doc(db, 'manuscripts', manuscriptId, 'threads', threadId), updates, { merge: true });
        } catch (e) {
            console.error('Failed to update thread:', e);
        }
    }, [manuscriptId]);

    // Delete thread
    const removeThread = useCallback(async (threadId: string) => {
        if (!manuscriptId) return;
        try {
            await deleteDoc(doc(db, 'manuscripts', manuscriptId, 'threads', threadId));
        } catch (e) {
            console.error('Failed to delete thread:', e);
        }
    }, [manuscriptId]);

    // Auto-detect threads from chapter text
    const autoDetect = useCallback((chapters: { id: string; title: string; plainText: string }[]) => {
        return autoDetectThreads(chapters);
    }, []);

    // Detect thread gaps (chapters where a thread disappears)
    const gaps = useMemo((): ThreadGap[] => {
        const result: ThreadGap[] = [];
        for (const thread of threads) {
            if (thread.scenes.length < 2) continue;
            for (let i = 1; i < thread.scenes.length; i++) {
                // Simplified gap detection based on array position (would need chapter index in production)
                const gap = i; // placeholder — in real impl, compute chapter distance
                if (gap > 3) {
                    result.push({
                        threadId: thread.id,
                        threadName: thread.name,
                        afterChapter: thread.scenes[i - 1].chapterId,
                        gapLength: gap,
                    });
                }
            }
        }
        return result;
    }, [threads]);

    // Thread compression suggestions
    const compressionSuggestions = useMemo((): ThreadCompressionSuggestion[] => {
        return threads
            .filter(t => t.scenes.length > 5 && t.importance !== 'critical')
            .map(t => ({
                threadId: t.id,
                threadName: t.name,
                currentScenes: t.scenes.length,
                suggestedMinimum: Math.max(3, Math.ceil(t.scenes.length * 0.6)),
                removableScenes: t.scenes.filter(s => s.role === 'develop').slice(0, Math.floor(t.scenes.length * 0.3)),
            }));
    }, [threads]);

    return {
        threads,
        loading,
        addThread,
        updateThread,
        removeThread,
        autoDetect,
        gaps,
        compressionSuggestions,
        THREAD_COLORS,
        THREAD_TYPE_LABELS,
    };
}
