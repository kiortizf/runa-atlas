/**
 * useDemoData.ts
 * 
 * Real-time Firestore hooks for all publisher platform modules.
 * Each hook subscribes via onSnapshot for live updates.
 */
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection, doc, query, orderBy, onSnapshot,
    updateDoc, deleteDoc, setDoc, getDoc, getDocs
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// ─── Generic helper ─────────────────────────────────────────────
function useCollection<T>(path: string, idField = 'id'): { data: T[]; loading: boolean } {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!path) { setLoading(false); return; }
        const unsub = onSnapshot(collection(db, path), (snap) => {
            setData(snap.docs.map(d => ({ [idField]: d.id, ...d.data() } as unknown as T)));
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [path]);

    return { data, loading };
}

function useDoc<T>(path: string): { data: T | null; loading: boolean } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!path) { setLoading(false); return; }
        const unsub = onSnapshot(doc(db, path), (snap) => {
            setData(snap.exists() ? (snap.data() as T) : null);
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [path]);

    return { data, loading };
}


// ═══════════════════════════════════════════════════════════════
// 1. SALES DATA
// ═══════════════════════════════════════════════════════════════
export interface SalesMonthly { id: string; month: string; revenue: number; units: number; }
export interface SalesTitle { id: string; title: string; author: string; units: number; revenue: number; trend: number; format: string; }
export interface SalesChannel { id: string; name: string; pct: number; revenue: number; }

export function useSalesData() {
    const monthly = useCollection<SalesMonthly>('sales_monthly');
    const titles = useCollection<SalesTitle>('sales_titles');
    const channels = useCollection<SalesChannel>('sales_channels');
    return {
        monthly: monthly.data,
        titles: titles.data,
        channels: channels.data,
        loading: monthly.loading || titles.loading || channels.loading,
    };
}


// ═══════════════════════════════════════════════════════════════
// 2. ISBNs
// ═══════════════════════════════════════════════════════════════
export interface ISBNEntry {
    id: string; isbn: string; title: string; format: string;
    imprint: string; status: string; assignedDate: string;
}

export function useISBNs() {
    return useCollection<ISBNEntry>('isbns');
}


// ═══════════════════════════════════════════════════════════════
// 3. CONTRACTS
// ═══════════════════════════════════════════════════════════════
export interface Contract {
    id: string; authorName: string; title: string;
    type: string; status: string; signedDate: string; expiresDate: string;
    royaltyRate: number; advancePaid: number; territory: string;
}

export function useContracts() {
    return useCollection<Contract>('contracts');
}


// ═══════════════════════════════════════════════════════════════
// 4. AUTHOR ANALYTICS (per-user)
// ═══════════════════════════════════════════════════════════════
export interface AnalyticsTitle { id: string; title: string; reads: number; reviews: number; rating: number; trend: number; }
export interface DemographicItem { label: string; pct: number; }
export interface GenreItem { genre: string; pct: number; }

export function useAuthorAnalytics() {
    const { user } = useAuth();
    const uid = user?.uid;

    const readsWeekly = useDoc<{ values: number[] }>(uid ? `users/${uid}/analytics/reads_weekly` : '');
    const titles = useCollection<AnalyticsTitle>(uid ? `users/${uid}/analytics_titles` : '');
    const demographics = useDoc<{ values: DemographicItem[] }>(uid ? `users/${uid}/analytics/demographics` : '');
    const genres = useDoc<{ values: GenreItem[] }>(uid ? `users/${uid}/analytics/genres` : '');

    return {
        readsWeekly: readsWeekly.data?.values || [],
        titles: titles.data,
        demographics: demographics.data?.values || [],
        genres: genres.data?.values || [],
        loading: readsWeekly.loading || titles.loading || demographics.loading || genres.loading,
    };
}


// ═══════════════════════════════════════════════════════════════
// 5. MARKETING ASSETS
// ═══════════════════════════════════════════════════════════════
export interface MarketingAsset { id: string; name: string; category: string; format: string; size: string; }

export function useMarketingAssets() {
    return useCollection<MarketingAsset>('marketing_assets');
}


// ═══════════════════════════════════════════════════════════════
// 6. SERIES (per-user with subcollection)
// ═══════════════════════════════════════════════════════════════
export interface BookInSeries { title: string; order: number; status: string; wordCount: number; releaseDate: string; }
export interface SeriesData {
    id: string; name: string; universe: string; genre: string;
    characters: number; locations: number; books: BookInSeries[];
}

export function useSeries() {
    const { user } = useAuth();
    const uid = user?.uid;
    const [data, setData] = useState<SeriesData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) { setLoading(false); return; }
        const unsub = onSnapshot(collection(db, `users/${uid}/series`), async (snap) => {
            const result: SeriesData[] = [];
            for (const seriesDoc of snap.docs) {
                const booksSnap = await getDocs(collection(db, `users/${uid}/series/${seriesDoc.id}/books`));
                const books = booksSnap.docs
                    .map(d => d.data() as BookInSeries)
                    .sort((a, b) => a.order - b.order);
                result.push({ id: seriesDoc.id, ...seriesDoc.data(), books } as SeriesData);
            }
            setData(result);
            setLoading(false);
        }, () => setLoading(false));
        return unsub;
    }, [uid]);

    return { data, loading };
}


// ═══════════════════════════════════════════════════════════════
// 7. AUDIOBOOK PROJECTS
// ═══════════════════════════════════════════════════════════════
export interface AudioProject {
    id: string; title: string; narrator: string; status: string;
    chapters: number; chaptersComplete: number; duration: string; dueDate: string;
}

export function useAudiobookProjects() {
    return useCollection<AudioProject>('audiobook_projects');
}


// ═══════════════════════════════════════════════════════════════
// 8. NOTIFICATIONS (per-user, with mutations)
// ═══════════════════════════════════════════════════════════════
export interface NotifItem {
    id: string; type: string; title: string; body: string;
    timestamp: string; read: boolean;
    actionLabel?: string; actionPath?: string;
}

export function useNotifications() {
    const { user } = useAuth();
    const uid = user?.uid;
    const { data, loading } = useCollection<NotifItem>(uid ? `users/${uid}/notifications` : '');

    const markRead = async (notifId: string) => {
        if (!uid) return;
        await updateDoc(doc(db, `users/${uid}/notifications`, notifId), { read: true });
    };

    const markAllRead = async () => {
        if (!uid) return;
        for (const n of data.filter(n => !n.read)) {
            await updateDoc(doc(db, `users/${uid}/notifications`, n.id), { read: true });
        }
    };

    const deleteNotif = async (notifId: string) => {
        if (!uid) return;
        await deleteDoc(doc(db, `users/${uid}/notifications`, notifId));
    };

    return { notifications: data, markRead, markAllRead, deleteNotif, loading };
}


// ═══════════════════════════════════════════════════════════════
// 9. CHALLENGES (global + per-user progress)
// ═══════════════════════════════════════════════════════════════
export interface Challenge {
    id: string; title: string; description: string; type: string;
    target: number; badge: string; endDate: string; status: string; participants: number;
}
export interface ChallengeProgress { id: string; progress: number; }
export interface LeaderboardEntry { id: string; name: string; books: number; streak: number; }

export function useChallenges() {
    const { user } = useAuth();
    const uid = user?.uid;

    const challenges = useCollection<Challenge>('challenges');
    const progress = useCollection<ChallengeProgress>(uid ? `users/${uid}/challenge_progress` : '');
    const leaderboard = useCollection<LeaderboardEntry>('challenge_leaderboard');

    // Merge progress into challenges
    const merged = challenges.data.map(ch => {
        const p = progress.data.find(p => p.id === ch.id);
        return { ...ch, progress: p?.progress ?? 0 };
    });

    return {
        challenges: merged,
        leaderboard: leaderboard.data,
        loading: challenges.loading || progress.loading || leaderboard.loading,
    };
}


// ═══════════════════════════════════════════════════════════════
// 10. BOOK CLUBS
// ═══════════════════════════════════════════════════════════════
export interface BookClub {
    id: string; name: string; currentBook: string; currentAuthor: string;
    members: number; discussions: number; nextMeeting: string;
    visibility: string; genre: string; pace: string;
}
export interface ClubDiscussion {
    id: string; clubId: string; topic: string; replies: number; lastActive: string;
}

export function useBookClubs() {
    const clubs = useCollection<BookClub>('book_clubs');
    const discussions = useCollection<ClubDiscussion>('club_discussions');
    return {
        clubs: clubs.data,
        discussions: discussions.data,
        loading: clubs.loading || discussions.loading,
    };
}


// ═══════════════════════════════════════════════════════════════
// 11. WISHLIST (per-user, with mutations)
// ═══════════════════════════════════════════════════════════════
export interface WishlistItem {
    id: string; title: string; author: string; genre: string;
    releaseDate: string; released: boolean; preordered: boolean;
    notify: boolean; rating?: number;
}

export function useWishlist() {
    const { user } = useAuth();
    const uid = user?.uid;
    const { data, loading } = useCollection<WishlistItem>(uid ? `users/${uid}/wishlist` : '');

    const toggleNotify = async (itemId: string) => {
        if (!uid) return;
        const item = data.find(i => i.id === itemId);
        if (item) await updateDoc(doc(db, `users/${uid}/wishlist`, itemId), { notify: !item.notify });
    };

    const togglePreorder = async (itemId: string) => {
        if (!uid) return;
        const item = data.find(i => i.id === itemId);
        if (item) await updateDoc(doc(db, `users/${uid}/wishlist`, itemId), { preordered: !item.preordered });
    };

    const removeItem = async (itemId: string) => {
        if (!uid) return;
        await deleteDoc(doc(db, `users/${uid}/wishlist`, itemId));
    };

    return { items: data, toggleNotify, togglePreorder, removeItem, loading };
}


// ═══════════════════════════════════════════════════════════════
// 12. REFERRALS (per-user) + REWARD TIERS (global)
// ═══════════════════════════════════════════════════════════════
export interface Referral { id: string; name: string; date: string; status: string; reward: string; }
export interface RewardTier { id: string; threshold: number; reward: string; icon: string; }

export function useReferrals() {
    const { user } = useAuth();
    const uid = user?.uid;

    const referrals = useCollection<Referral>(uid ? `users/${uid}/referrals` : '');
    const rewards = useCollection<RewardTier>('reward_tiers');

    return {
        referrals: referrals.data,
        rewards: rewards.data,
        loading: referrals.loading || rewards.loading,
    };
}
