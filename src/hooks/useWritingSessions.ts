import { useState, useEffect, useCallback } from 'react';
import { collection, doc, addDoc, onSnapshot, query, orderBy, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface WritingSession {
    id: string;
    words: number;
    minutes: number;
    manuscript: string;
    source: 'episode' | 'manual' | 'import';
    date: string; // YYYY-MM-DD
    createdAt: Timestamp;
}

export function useWritingSessions() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<WritingSession[]>([]);
    const [loading, setLoading] = useState(true);

    // Listen to all writing sessions for this user
    useEffect(() => {
        if (!user) { setSessions([]); setLoading(false); return; }
        const q = query(
            collection(db, `users/${user.uid}/writingSessions`),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, snap => {
            setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as WritingSession)));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [user]);

    // Log a manual writing session
    const logSession = useCallback(async (words: number, minutes: number, manuscript: string, date?: string) => {
        if (!user) return;
        const sessionDate = date || new Date().toISOString().split('T')[0];
        try {
            await addDoc(collection(db, `users/${user.uid}/writingSessions`), {
                words,
                minutes,
                manuscript,
                source: 'manual',
                date: sessionDate,
                createdAt: serverTimestamp(),
            });
        } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'writingSessions');
        }
    }, [user]);

    // Log an automatic session from the episode editor
    const logEpisodeSession = useCallback(async (words: number, manuscript: string) => {
        if (!user || words <= 0) return;
        const today = new Date().toISOString().split('T')[0];
        try {
            await addDoc(collection(db, `users/${user.uid}/writingSessions`), {
                words,
                minutes: Math.ceil(words / 15), // estimate ~15 words/min
                manuscript,
                source: 'episode',
                date: today,
                createdAt: serverTimestamp(),
            });
        } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'writingSessions');
        }
    }, [user]);

    // ── Computed analytics ──

    // Group sessions by date for the heatmap
    const dailyData = useCallback(() => {
        const map = new Map<string, { words: number; sessions: number; minutes: number }>();
        for (const s of sessions) {
            const existing = map.get(s.date) || { words: 0, sessions: 0, minutes: 0 };
            map.set(s.date, {
                words: existing.words + s.words,
                sessions: existing.sessions + 1,
                minutes: existing.minutes + s.minutes,
            });
        }
        // Build 365-day array
        const result = [];
        for (let i = 364; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const data = map.get(key);
            result.push({
                date: key,
                words: data?.words || 0,
                sessions: data?.sessions || 0,
                minutes: data?.minutes || 0,
            });
        }
        return result;
    }, [sessions]);

    // Current streak
    const getCurrentStreak = useCallback(() => {
        let streak = 0;
        const today = new Date();
        for (let i = 0; i <= 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const hasSession = sessions.some(s => s.date === key);
            if (hasSession) streak++;
            else if (i > 0) break; // skip today if not written yet
            else continue;
        }
        return streak;
    }, [sessions]);

    // Longest streak
    const getLongestStreak = useCallback(() => {
        const dateSet = new Set(sessions.map(s => s.date));
        let longest = 0, current = 0;
        const days = dailyData();
        for (const day of days) {
            if (day.words > 0) { current++; longest = Math.max(longest, current); }
            else current = 0;
        }
        return longest;
    }, [sessions, dailyData]);

    // Monthly totals
    const monthlyData = useCallback(() => {
        const map = new Map<string, number>();
        for (const s of sessions) {
            const month = s.date.substring(0, 7); // YYYY-MM
            map.set(month, (map.get(month) || 0) + s.words);
        }
        const result = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 8; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            result.push({ month: months[d.getMonth()], words: map.get(key) || 0 });
        }
        return result;
    }, [sessions]);

    // Total words this year
    const totalWordsYear = useCallback(() => {
        const yearStart = new Date();
        yearStart.setMonth(0, 1);
        const yearKey = yearStart.toISOString().split('T')[0];
        return sessions.filter(s => s.date >= yearKey).reduce((sum, s) => sum + s.words, 0);
    }, [sessions]);

    // Average daily words (last 30 days)
    const avgDailyWords = useCallback(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const key = thirtyDaysAgo.toISOString().split('T')[0];
        const recent = sessions.filter(s => s.date >= key);
        const totalWords = recent.reduce((sum, s) => sum + s.words, 0);
        return Math.round(totalWords / 30);
    }, [sessions]);

    // Total sessions count
    const totalSessions = sessions.length;

    return {
        sessions,
        loading,
        logSession,
        logEpisodeSession,
        dailyData,
        getCurrentStreak,
        getLongestStreak,
        monthlyData,
        totalWordsYear,
        avgDailyWords,
        totalSessions,
    };
}
