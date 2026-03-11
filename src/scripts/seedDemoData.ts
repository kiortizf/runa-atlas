/**
 * seedDemoData.ts
 * 
 * Seeds Firestore with demo data for all publisher platform modules.
 * Call `seedAllDemoData(uid)` with the demo user's UID.
 * Uses setDoc with deterministic IDs so it's idempotent (safe to re-run).
 */
import { db } from '../firebase';
import {
    doc, setDoc, collection, serverTimestamp, Timestamp
} from 'firebase/firestore';

// ─── helpers ────────────────────────────────────────────────────
function ts(dateStr: string): Timestamp {
    return Timestamp.fromDate(new Date(dateStr));
}

// ═══════════════════════════════════════════════════════════════
// 1. SALES DATA
// ═══════════════════════════════════════════════════════════════
const SALES_MONTHLY = [
    { month: 'Sep', revenue: 12400, units: 320 },
    { month: 'Oct', revenue: 15800, units: 410 },
    { month: 'Nov', revenue: 18200, units: 475 },
    { month: 'Dec', revenue: 24600, units: 640 },
    { month: 'Jan', revenue: 19800, units: 515 },
    { month: 'Feb', revenue: 22100, units: 575 },
    { month: 'Mar', revenue: 16300, units: 424 },
];

const SALES_TITLES = [
    { title: 'Chrome Meridian', author: 'Xiomara Vega', units: 1842, revenue: 27630, trend: 12.4, format: 'ebook' },
    { title: 'The Obsidian Protocol', author: 'Kofi Asante', units: 1205, revenue: 18075, trend: -3.2, format: 'paperback' },
    { title: 'Bioluminescent', author: 'Yuki Tanaka', units: 987, revenue: 14805, trend: 8.7, format: 'ebook' },
    { title: 'Void Frequencies', author: 'Alejandro Cruz', units: 756, revenue: 11340, trend: 22.1, format: 'hardcover' },
    { title: 'Ancestral Algorithms', author: 'Amara Osei', units: 634, revenue: 9510, trend: -1.5, format: 'ebook' },
    { title: 'The Diaspora Engine', author: 'Priya Sharma', units: 521, revenue: 7815, trend: 5.3, format: 'paperback' },
];

const SALES_CHANNELS = [
    { name: 'Direct (runaatlas.com)', pct: 42, revenue: 54180 },
    { name: 'Amazon KDP', pct: 28, revenue: 36120 },
    { name: 'IngramSpark', pct: 15, revenue: 19350 },
    { name: 'Apple Books', pct: 8, revenue: 10320 },
    { name: 'Other', pct: 7, revenue: 9030 },
];

// ═══════════════════════════════════════════════════════════════
// 2. ISBNs
// ═══════════════════════════════════════════════════════════════
const ISBNS = [
    { isbn: '978-1-940000-01-2', title: 'Chrome Meridian', format: 'ebook', imprint: 'Rüna Atlas Press', status: 'active', assignedDate: '2025-08-15' },
    { isbn: '978-1-940000-01-3', title: 'Chrome Meridian', format: 'paperback', imprint: 'Rüna Atlas Press', status: 'active', assignedDate: '2025-08-15' },
    { isbn: '978-1-940000-02-9', title: 'The Obsidian Protocol', format: 'ebook', imprint: 'Void Noir', status: 'active', assignedDate: '2025-09-01' },
    { isbn: '978-1-940000-02-0', title: 'The Obsidian Protocol', format: 'hardcover', imprint: 'Void Noir', status: 'active', assignedDate: '2025-09-01' },
    { isbn: '978-1-940000-03-6', title: 'Bioluminescent', format: 'ebook', imprint: 'Bohío Press', status: 'active', assignedDate: '2025-10-20' },
    { isbn: '978-1-940000-04-3', title: 'Void Frequencies', format: 'paperback', imprint: 'Rüna Atlas Press', status: 'assigned', assignedDate: '2026-01-10' },
    { isbn: '978-1-940000-05-0', title: '', format: 'ebook', imprint: '', status: 'reserved', assignedDate: '' },
    { isbn: '978-1-940000-06-7', title: '', format: 'ebook', imprint: '', status: 'reserved', assignedDate: '' },
    { isbn: '978-1-940000-07-4', title: 'Legacy Anthology', format: 'paperback', imprint: 'Rüna Atlas Press', status: 'retired', assignedDate: '2024-03-15' },
];

// ═══════════════════════════════════════════════════════════════
// 3. CONTRACTS
// ═══════════════════════════════════════════════════════════════
const CONTRACTS = [
    { id: 'C-001', authorName: 'Xiomara Vega', title: 'Chrome Meridian', type: 'publishing', status: 'active', signedDate: '2025-06-15', expiresDate: '2030-06-15', royaltyRate: 15, advancePaid: 5000, territory: 'World English' },
    { id: 'C-002', authorName: 'Kofi Asante', title: 'The Obsidian Protocol', type: 'publishing', status: 'active', signedDate: '2025-07-20', expiresDate: '2030-07-20', royaltyRate: 12, advancePaid: 3500, territory: 'World English' },
    { id: 'C-003', authorName: 'Yuki Tanaka', title: 'Bioluminescent', type: 'publishing', status: 'active', signedDate: '2025-09-01', expiresDate: '2030-09-01', royaltyRate: 15, advancePaid: 4000, territory: 'World All Languages' },
    { id: 'C-004', authorName: 'Xiomara Vega', title: 'Chrome Meridian', type: 'licensing', status: 'signed', signedDate: '2026-01-10', expiresDate: '2028-01-10', royaltyRate: 8, advancePaid: 2000, territory: 'Spanish Translation' },
    { id: 'C-005', authorName: 'Alejandro Cruz', title: 'Void Frequencies', type: 'publishing', status: 'sent', signedDate: '', expiresDate: '', royaltyRate: 14, advancePaid: 0, territory: 'World English' },
    { id: 'C-006', authorName: 'Amara Osei', title: 'Ancestral Algorithms', type: 'first-refusal', status: 'draft', signedDate: '', expiresDate: '', royaltyRate: 15, advancePaid: 0, territory: 'World English' },
    { id: 'C-007', authorName: 'Marcus Chen', title: 'Neon Cartography', type: 'publishing', status: 'expired', signedDate: '2020-03-01', expiresDate: '2025-03-01', royaltyRate: 10, advancePaid: 2500, territory: 'North America' },
];

// ═══════════════════════════════════════════════════════════════
// 4. AUTHOR ANALYTICS (per-user)
// ═══════════════════════════════════════════════════════════════
const ANALYTICS_READS_WEEKLY = [3200, 4100, 3800, 5200, 4900, 6100, 5800];
const ANALYTICS_TITLES = [
    { title: 'Chrome Meridian', reads: 12840, reviews: 87, rating: 4.6, trend: 15.2 },
    { title: 'Neon Cartography', reads: 8920, reviews: 54, rating: 4.3, trend: -2.1 },
    { title: 'The Diaspora Engine', reads: 6340, reviews: 31, rating: 4.8, trend: 8.4 },
];
const ANALYTICS_DEMOGRAPHICS = [
    { label: '18-24', pct: 22 },
    { label: '25-34', pct: 38 },
    { label: '35-44', pct: 24 },
    { label: '45-54', pct: 11 },
    { label: '55+', pct: 5 },
];
const ANALYTICS_GENRES = [
    { genre: 'Cyberpunk', pct: 42 },
    { genre: 'Dark Fantasy', pct: 28 },
    { genre: 'Science Fiction', pct: 18 },
    { genre: 'Literary Fiction', pct: 12 },
];

// ═══════════════════════════════════════════════════════════════
// 5. MARKETING ASSETS
// ═══════════════════════════════════════════════════════════════
const MARKETING_ASSETS = [
    { name: 'Instagram Story - Cover Reveal', category: 'Social Graphics', format: 'PNG 1080x1920', size: '2.4 MB' },
    { name: 'Twitter/X Banner - New Release', category: 'Social Graphics', format: 'PNG 1500x500', size: '1.1 MB' },
    { name: 'BookTok Video Template', category: 'Social Graphics', format: 'MP4 1080x1920', size: '8.2 MB' },
    { name: 'Square Post - Quote Card', category: 'Social Graphics', format: 'PNG 1080x1080', size: '1.6 MB' },
    { name: 'Author Headshot - Official', category: 'Press Kit', format: 'JPG 2400x3000', size: '4.8 MB' },
    { name: 'Book Cover - High Resolution', category: 'Press Kit', format: 'PNG 2400x3600', size: '5.2 MB' },
    { name: 'Author Bio - Short & Long', category: 'Press Kit', format: 'DOCX', size: '28 KB' },
    { name: 'Press Release Template', category: 'Press Kit', format: 'DOCX', size: '42 KB' },
    { name: 'Launch Announcement', category: 'Email Templates', format: 'HTML', size: '15 KB' },
    { name: 'Newsletter - Monthly Update', category: 'Email Templates', format: 'HTML', size: '18 KB' },
    { name: 'Bookmark - Front & Back', category: 'Bookmarks & Print', format: 'PDF 2x6 in', size: '3.1 MB' },
    { name: 'Postcard - Review Request', category: 'Bookmarks & Print', format: 'PDF 4x6 in', size: '4.5 MB' },
];

// ═══════════════════════════════════════════════════════════════
// 6. SERIES (per-user)
// ═══════════════════════════════════════════════════════════════
const SERIES = [
    {
        id: 's1', name: 'The Meridian Cycle', universe: 'Meridian Universe', genre: 'Cyberpunk',
        characters: 34, locations: 12,
        books: [
            { title: 'Chrome Meridian', order: 1, status: 'published', wordCount: 92000, releaseDate: '2025-08-15' },
            { title: 'Neon Cartography', order: 2, status: 'published', wordCount: 88000, releaseDate: '2025-12-01' },
            { title: 'Quantum Borderlands', order: 3, status: 'in-progress', wordCount: 45000, releaseDate: '' },
            { title: 'Holographic Exodus', order: 4, status: 'planned', wordCount: 0, releaseDate: '' },
        ],
    },
    {
        id: 's2', name: 'Void Noir Chronicles', universe: 'The Void', genre: 'Dark Fantasy',
        characters: 18, locations: 7,
        books: [
            { title: 'Void Frequencies', order: 1, status: 'published', wordCount: 78000, releaseDate: '2025-10-20' },
            { title: 'Shadow Resonance', order: 2, status: 'in-progress', wordCount: 32000, releaseDate: '' },
        ],
    },
    {
        id: 's3', name: 'Ancestral Code', universe: 'Diaspora Futures', genre: 'Afrofuturism',
        characters: 22, locations: 9,
        books: [
            { title: 'Ancestral Algorithms', order: 1, status: 'published', wordCount: 85000, releaseDate: '2025-11-15' },
            { title: 'The Diaspora Engine', order: 2, status: 'published', wordCount: 91000, releaseDate: '2026-02-01' },
            { title: 'Code of the Elders', order: 3, status: 'planned', wordCount: 0, releaseDate: '' },
        ],
    },
];

// ═══════════════════════════════════════════════════════════════
// 7. AUDIOBOOK PROJECTS
// ═══════════════════════════════════════════════════════════════
const AUDIOBOOK_PROJECTS = [
    { id: 'ab1', title: 'Chrome Meridian', narrator: 'James Earl Torres', status: 'published', chapters: 24, chaptersComplete: 24, duration: '11h 42m', dueDate: '2025-12-01' },
    { id: 'ab2', title: 'The Obsidian Protocol', narrator: 'Aisha Kwame', status: 'mastering', chapters: 20, chaptersComplete: 20, duration: '9h 15m', dueDate: '2026-04-15' },
    { id: 'ab3', title: 'Bioluminescent', narrator: '', status: 'casting', chapters: 18, chaptersComplete: 0, duration: '', dueDate: '2026-07-01' },
    { id: 'ab4', title: 'Void Frequencies', narrator: 'Diego Morales', status: 'recording', chapters: 22, chaptersComplete: 14, duration: '~10h', dueDate: '2026-05-30' },
    { id: 'ab5', title: 'Ancestral Algorithms', narrator: 'Nina Okafor', status: 'editing', chapters: 19, chaptersComplete: 19, duration: '8h 55m', dueDate: '2026-06-15' },
];

// ═══════════════════════════════════════════════════════════════
// 8. NOTIFICATIONS (per-user)
// ═══════════════════════════════════════════════════════════════
const NOTIFICATIONS = [
    { id: 'n1', type: 'release', title: 'New Release: Chrome Meridian', body: "Xiomara Vega's latest cyberpunk novel is now available in the catalog.", timestamp: '2 hours ago', read: false, actionLabel: 'View Book', actionPath: '/catalog' },
    { id: 'n2', type: 'beta', title: 'Beta Reader Invitation', body: "You've been invited to beta read Shadow Resonance by Alejandro Cruz.", timestamp: '5 hours ago', read: false, actionLabel: 'Accept', actionPath: '/beta-reader-hub' },
    { id: 'n3', type: 'message', title: 'New Message from Editor', body: 'Regarding your manuscript Void Frequencies - revision notes attached.', timestamp: '1 day ago', read: false, actionLabel: 'Read Message', actionPath: '/portal' },
    { id: 'n4', type: 'challenge', title: 'Challenge Complete!', body: 'You finished the Speculative Sprint reading challenge. Badge unlocked!', timestamp: '2 days ago', read: true },
    { id: 'n5', type: 'review', title: 'New Review on Your Book', body: 'Chrome Meridian received a 5-star review from ReaderX42.', timestamp: '3 days ago', read: true },
    { id: 'n6', type: 'system', title: 'Profile Update Reminder', body: 'Complete your reading preferences to get better recommendations.', timestamp: '1 week ago', read: true, actionLabel: 'Update Profile', actionPath: '/dashboard' },
];

// ═══════════════════════════════════════════════════════════════
// 9. CHALLENGES
// ═══════════════════════════════════════════════════════════════
const CHALLENGES = [
    { id: 'ch1', title: 'Speculative Sprint', description: 'Read 5 speculative fiction books this month', type: 'books', target: 5, badge: '🚀', endDate: '2026-03-31', status: 'active', participants: 342 },
    { id: 'ch2', title: 'Genre Explorer', description: 'Read from 4 different genres', type: 'genres', target: 4, badge: '🌍', endDate: '2026-04-30', status: 'active', participants: 187 },
    { id: 'ch3', title: 'Page Turner', description: 'Read 2,000 pages total', type: 'pages', target: 2000, badge: '📖', endDate: '2026-03-31', status: 'active', participants: 521 },
    { id: 'ch4', title: '7-Day Streak', description: 'Read every day for a week', type: 'streak', target: 7, badge: '🔥', endDate: '2026-03-15', status: 'completed', participants: 89 },
    { id: 'ch5', title: 'Summer of Worlds', description: 'Read 10 books from our catalog this summer', type: 'books', target: 10, badge: '☀️', endDate: '2026-08-31', status: 'upcoming', participants: 0 },
    { id: 'ch6', title: 'Afrofuturism Deep Dive', description: 'Read 3 Afrofuturist novels', type: 'books', target: 3, badge: '✨', endDate: '2026-02-28', status: 'completed', participants: 156 },
];

const CHALLENGE_PROGRESS: Record<string, number> = {
    ch1: 3,
    ch2: 2,
    ch3: 1450,
    ch4: 7,
    ch5: 0,
    ch6: 3,
};

const LEADERBOARD = [
    { id: 'lb1', name: 'Maria S.', books: 24, streak: 42 },
    { id: 'lb2', name: 'Kwame A.', books: 21, streak: 38 },
    { id: 'lb3', name: 'Priya M.', books: 19, streak: 35 },
    { id: 'lb4', name: 'Jordan L.', books: 18, streak: 31 },
    { id: 'lb5', name: 'Yuki T.', books: 16, streak: 28 },
];

// ═══════════════════════════════════════════════════════════════
// 10. BOOK CLUBS
// ═══════════════════════════════════════════════════════════════
const BOOK_CLUBS = [
    { id: 'bc1', name: 'Futures Collective', currentBook: 'Chrome Meridian', currentAuthor: 'Xiomara Vega', members: 42, discussions: 8, nextMeeting: 'Mar 15, 7pm EST', visibility: 'public', genre: 'Cyberpunk', pace: '1 chapter/week' },
    { id: 'bc2', name: 'Dark Worlds Society', currentBook: 'Void Frequencies', currentAuthor: 'Alejandro Cruz', members: 28, discussions: 5, nextMeeting: 'Mar 18, 8pm EST', visibility: 'public', genre: 'Dark Fantasy', pace: '2 chapters/week' },
    { id: 'bc3', name: 'Diaspora Readers', currentBook: 'Ancestral Algorithms', currentAuthor: 'Amara Osei', members: 35, discussions: 12, nextMeeting: 'Mar 20, 6pm EST', visibility: 'public', genre: 'Afrofuturism', pace: '1 chapter/week' },
    { id: 'bc4', name: 'Editorial Review Circle', currentBook: 'Shadow Resonance', currentAuthor: 'Alejandro Cruz', members: 8, discussions: 3, nextMeeting: 'Mar 14, 3pm EST', visibility: 'private', genre: 'Mixed', pace: 'Full book' },
    { id: 'bc5', name: 'New Voices Club', currentBook: 'Bioluminescent', currentAuthor: 'Yuki Tanaka', members: 19, discussions: 4, nextMeeting: 'Mar 22, 7pm EST', visibility: 'public', genre: 'Magical Realism', pace: '3 chapters/week' },
];

const CLUB_DISCUSSIONS = [
    { id: 'cd1', clubId: 'bc1', topic: 'Chapter 12: The Neural Market', replies: 24, lastActive: '2 hours ago' },
    { id: 'cd2', clubId: 'bc2', topic: 'Worldbuilding in Void Frequencies', replies: 18, lastActive: '5 hours ago' },
    { id: 'cd3', clubId: 'bc3', topic: 'Themes of ancestral memory', replies: 31, lastActive: '1 day ago' },
    { id: 'cd4', clubId: 'bc5', topic: 'The role of bioluminescence as metaphor', replies: 12, lastActive: '2 days ago' },
];

// ═══════════════════════════════════════════════════════════════
// 11. WISHLIST (per-user)
// ═══════════════════════════════════════════════════════════════
const WISHLIST = [
    { id: 'w1', title: 'Quantum Borderlands', author: 'Xiomara Vega', genre: 'Cyberpunk', releaseDate: '2026-06-15', released: false, preordered: true, notify: true },
    { id: 'w2', title: 'Shadow Resonance', author: 'Alejandro Cruz', genre: 'Dark Fantasy', releaseDate: '2026-05-01', released: false, preordered: false, notify: true },
    { id: 'w3', title: 'Code of the Elders', author: 'Amara Osei', genre: 'Afrofuturism', releaseDate: '2026-08-20', released: false, preordered: false, notify: false },
    { id: 'w4', title: 'Chrome Meridian', author: 'Xiomara Vega', genre: 'Cyberpunk', releaseDate: '2025-08-15', released: true, preordered: false, notify: false, rating: 5 },
    { id: 'w5', title: 'Void Frequencies', author: 'Alejandro Cruz', genre: 'Dark Fantasy', releaseDate: '2025-10-20', released: true, preordered: false, notify: false, rating: 4 },
];

// ═══════════════════════════════════════════════════════════════
// 12. REFERRALS (per-user) + REWARD TIERS (global)
// ═══════════════════════════════════════════════════════════════
const REFERRALS = [
    { id: 'r1', name: 'Maria S.', date: '2026-02-15', status: 'active', reward: 'Free eBook' },
    { id: 'r2', name: 'Jordan L.', date: '2026-02-20', status: 'active', reward: 'Free eBook' },
    { id: 'r3', name: 'Kwame A.', date: '2026-03-01', status: 'pending', reward: '' },
];

const REWARD_TIERS = [
    { id: 'rt1', threshold: 1, reward: 'Exclusive Bookmark', icon: '🔖' },
    { id: 'rt2', threshold: 3, reward: 'Free eBook of Choice', icon: '📚' },
    { id: 'rt3', threshold: 5, reward: '1 Month Premium', icon: '⭐' },
    { id: 'rt4', threshold: 10, reward: 'Signed Copy + Merch', icon: '🎁' },
    { id: 'rt5', threshold: 25, reward: 'Founding Reader Badge', icon: '👑' },
];


// ═══════════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════════
export async function seedAllDemoData(uid: string): Promise<{ success: boolean; seeded: string[]; errors: string[] }> {
    const seeded: string[] = [];
    const errors: string[] = [];

    async function safeWrite(label: string, fn: () => Promise<void>) {
        try {
            await fn();
            seeded.push(label);
        } catch (e: any) {
            errors.push(`${label}: ${e.message}`);
        }
    }

    // 1. Sales Monthly
    for (const item of SALES_MONTHLY) {
        await safeWrite(`sales_monthly/${item.month}`, () =>
            setDoc(doc(db, 'sales_monthly', item.month), item));
    }

    // 2. Sales Titles
    for (const item of SALES_TITLES) {
        const id = item.title.toLowerCase().replace(/\s+/g, '-');
        await safeWrite(`sales_titles/${id}`, () =>
            setDoc(doc(db, 'sales_titles', id), item));
    }

    // 3. Sales Channels
    for (const item of SALES_CHANNELS) {
        const id = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        await safeWrite(`sales_channels/${id}`, () =>
            setDoc(doc(db, 'sales_channels', id), item));
    }

    // 4. ISBNs
    for (const item of ISBNS) {
        const id = item.isbn.replace(/-/g, '');
        await safeWrite(`isbns/${id}`, () =>
            setDoc(doc(db, 'isbns', id), item));
    }

    // 5. Contracts
    for (const item of CONTRACTS) {
        await safeWrite(`contracts/${item.id}`, () =>
            setDoc(doc(db, 'contracts', item.id), item));
    }

    // 6. Author Analytics (per-user)
    await safeWrite(`users/${uid}/analytics/reads_weekly`, () =>
        setDoc(doc(db, `users/${uid}/analytics`, 'reads_weekly'), { values: ANALYTICS_READS_WEEKLY }));
    
    for (const item of ANALYTICS_TITLES) {
        const id = item.title.toLowerCase().replace(/\s+/g, '-');
        await safeWrite(`users/${uid}/analytics_titles/${id}`, () =>
            setDoc(doc(db, `users/${uid}/analytics_titles`, id), item));
    }

    await safeWrite(`users/${uid}/analytics/demographics`, () =>
        setDoc(doc(db, `users/${uid}/analytics`, 'demographics'), { values: ANALYTICS_DEMOGRAPHICS }));
    
    await safeWrite(`users/${uid}/analytics/genres`, () =>
        setDoc(doc(db, `users/${uid}/analytics`, 'genres'), { values: ANALYTICS_GENRES }));

    // 7. Marketing Assets
    for (let i = 0; i < MARKETING_ASSETS.length; i++) {
        await safeWrite(`marketing_assets/asset-${i}`, () =>
            setDoc(doc(db, 'marketing_assets', `asset-${i}`), MARKETING_ASSETS[i]));
    }

    // 8. Series (per-user) with subcollection books
    for (const series of SERIES) {
        const { books, ...seriesData } = series;
        await safeWrite(`users/${uid}/series/${series.id}`, () =>
            setDoc(doc(db, `users/${uid}/series`, series.id), seriesData));
        for (const book of books) {
            const bookId = `book-${book.order}`;
            await safeWrite(`users/${uid}/series/${series.id}/books/${bookId}`, () =>
                setDoc(doc(db, `users/${uid}/series/${series.id}/books`, bookId), book));
        }
    }

    // 9. Audiobook Projects
    for (const item of AUDIOBOOK_PROJECTS) {
        await safeWrite(`audiobook_projects/${item.id}`, () =>
            setDoc(doc(db, 'audiobook_projects', item.id), item));
    }

    // 10. Notifications (per-user)
    for (const item of NOTIFICATIONS) {
        await safeWrite(`users/${uid}/notifications/${item.id}`, () =>
            setDoc(doc(db, `users/${uid}/notifications`, item.id), item));
    }

    // 11. Challenges (global)
    for (const item of CHALLENGES) {
        await safeWrite(`challenges/${item.id}`, () =>
            setDoc(doc(db, 'challenges', item.id), item));
    }

    // Challenge progress (per-user)
    for (const [challengeId, progress] of Object.entries(CHALLENGE_PROGRESS)) {
        await safeWrite(`users/${uid}/challenge_progress/${challengeId}`, () =>
            setDoc(doc(db, `users/${uid}/challenge_progress`, challengeId), { progress }));
    }

    // Leaderboard
    for (const item of LEADERBOARD) {
        await safeWrite(`challenge_leaderboard/${item.id}`, () =>
            setDoc(doc(db, 'challenge_leaderboard', item.id), item));
    }

    // 12. Book Clubs (global)
    for (const item of BOOK_CLUBS) {
        await safeWrite(`book_clubs/${item.id}`, () =>
            setDoc(doc(db, 'book_clubs', item.id), item));
    }

    // Club Discussions
    for (const item of CLUB_DISCUSSIONS) {
        await safeWrite(`club_discussions/${item.id}`, () =>
            setDoc(doc(db, 'club_discussions', item.id), item));
    }

    // 13. Wishlist (per-user)
    for (const item of WISHLIST) {
        await safeWrite(`users/${uid}/wishlist/${item.id}`, () =>
            setDoc(doc(db, `users/${uid}/wishlist`, item.id), item));
    }

    // 14. Referrals (per-user)
    for (const item of REFERRALS) {
        await safeWrite(`users/${uid}/referrals/${item.id}`, () =>
            setDoc(doc(db, `users/${uid}/referrals`, item.id), item));
    }

    // 15. Reward Tiers (global)
    for (const item of REWARD_TIERS) {
        await safeWrite(`reward_tiers/${item.id}`, () =>
            setDoc(doc(db, 'reward_tiers', item.id), item));
    }

    return { success: errors.length === 0, seeded, errors };
}
