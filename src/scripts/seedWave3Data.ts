/**
 * seedWave3Data.ts
 *
 * Wave 3: Seeds ALL remaining hardcoded content data for reader-facing and
 * author/editorial pages. Called from the main seedAllDemoData function.
 */
import { db } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

function ts(dateStr: string): Timestamp {
    return Timestamp.fromDate(new Date(dateStr));
}

type SafeWrite = (label: string, fn: () => Promise<void>) => Promise<void>;

// ═══════════════════════════════════════════════════════════════
// WAVE 3 SEED FUNCTION
// ═══════════════════════════════════════════════════════════════
export async function seedWave3(safeWrite: SafeWrite) {

    // ── 1. Authors (Authors.tsx) ────────────────────
    const AUTHORS = [
        { id: 'author-1', name: 'Elara Vance', image: 'https://picsum.photos/seed/elara/400/400', bio: 'Elara Vance is a speculative fiction author whose work explores the intersection of magic and architecture.', books: ['The Obsidian Crown', 'Echoes of the Spire'], status: 'active', createdAt: ts('2026-01-01') },
        { id: 'author-2', name: 'Jax Thorne', image: 'https://picsum.photos/seed/jax/400/400', bio: 'Jax Thorne writes dystopian thrillers that ask hard questions about technology and consciousness.', books: ['Neon Requiem', 'Silicon Souls'], status: 'active', createdAt: ts('2026-01-01') },
        { id: 'author-3', name: 'Marina Solis', image: 'https://picsum.photos/seed/marina/400/400', bio: 'Marina Solis weaves literary fiction with magical realism, drawing heavily from her coastal upbringing.', books: ['Whispers of the Deep', 'The Saltwater Archives'], status: 'active', createdAt: ts('2026-01-01') },
        { id: 'author-4', name: 'Leo Vance', image: 'https://picsum.photos/seed/leo/400/400', bio: 'Leo Vance is known for his character-driven queer romances set against sweeping sci-fi backdrops.', books: ['Star-Crossed Circuits', 'Orbiting You'], status: 'active', createdAt: ts('2026-01-01') },
    ];
    for (const item of AUTHORS) {
        await safeWrite(`authors/${item.id}`, () => setDoc(doc(db, 'authors', item.id), item));
    }

    // ── 2. Journeys (Journeys.tsx) ────────────────────
    const JOURNEYS = [
        { id: 'journey-1', slug: 'the-ember-codex', title: 'The Ember Codex', author: 'Alara Vane', genre: 'Dark Fantasy', status: 'Active', featured: true, description: 'A scholar discovers a forbidden text that rewrites the history of magic, drawing the attention of an ancient order that will stop at nothing to keep its secrets buried.', totalEpisodes: 8, publishedEpisodes: 3, createdAt: ts('2026-02-01') },
        { id: 'journey-2', slug: 'neon-horizons', title: 'Neon Horizons', author: 'Kaelen Vance', genre: 'Cyberpunk', status: 'Completed', featured: false, description: 'In a city where memories can be bought and sold, a rogue archivist must uncover the truth behind her own missing past before her mind is wiped completely.', totalEpisodes: 12, publishedEpisodes: 12, createdAt: ts('2026-01-15') },
    ];
    for (const item of JOURNEYS) {
        await safeWrite(`journeys/${item.id}`, () => setDoc(doc(db, 'journeys', item.id), item));
    }

    // Journey episodes subcollection
    const JOURNEY_EPISODES = [
        { journeyId: 'journey-1', id: 'ep1', number: 1, title: 'The Dust of Ages', status: 'published', wordCount: 3450, publishDate: '2026-02-15', excerpt: 'The library smelled of old paper and forgotten dreams.' },
        { journeyId: 'journey-1', id: 'ep2', number: 2, title: 'Whispers in the Dark', status: 'published', wordCount: 4120, publishDate: '2026-02-22', excerpt: 'The words on the page seemed to shift and writhe as she read them.' },
        { journeyId: 'journey-1', id: 'ep3', number: 3, title: 'The Order of the Eclipse', status: 'published', wordCount: 3890, publishDate: '2026-03-01', excerpt: 'They came in the dead of night, silent as shadows.' },
        { journeyId: 'journey-1', id: 'ep4', number: 4, title: 'Flight through the Catacombs', status: 'scheduled', wordCount: 4500, publishDate: '2026-03-15', excerpt: 'The air grew colder the deeper they went.' },
    ];
    for (const ep of JOURNEY_EPISODES) {
        const { journeyId, ...data } = ep;
        await safeWrite(`journeys/${journeyId}/episodes/${ep.id}`, () =>
            setDoc(doc(db, `journeys/${journeyId}/episodes`, ep.id), data));
    }

    // ── 3. Events (Events.tsx) ────────────────────
    const EVENTS = [
        { id: 'ev1', title: 'Author Fireside: Dark Fantasy Worldbuilding', description: 'Elara Vance discusses the art of building mythological magic systems with live audience Q&A.', longDescription: 'Join us for an intimate evening with Elara Vance as she walks through her creative process for The Obsidian Crown.', date: ts('2027-04-18T19:00:00'), endDate: ts('2027-04-18T20:30:00'), location: 'Virtual (Zoom)', type: 'Q&A', status: 'upcoming', capacity: 200, rsvpCount: 134, rsvpList: [], streamUrl: 'https://zoom.us/j/example', isFree: false, ticketPrice: 5, speakers: [{ name: 'Elara Vance', image: 'https://picsum.photos/seed/elara/200/200', role: 'Author' }], tags: ['worldbuilding', 'dark fantasy', 'craft'], seriesName: 'Monthly Fireside' },
        { id: 'ev2', title: 'Book Launch: The Roots Remember', description: "Celebrate the publication of Priya Sharma's debut novel with readings, conversation, and a community Q&A.", date: ts('2027-04-25T18:00:00'), endDate: ts('2027-04-25T19:30:00'), location: 'Virtual (StreamYard)', type: 'Release', status: 'upcoming', capacity: 500, rsvpCount: 289, rsvpList: [], isFree: true, speakers: [{ name: 'Priya Sharma', image: 'https://picsum.photos/seed/priya/200/200', role: 'Author' }], tags: ['book launch', 'magical realism', 'debut'], seriesName: 'Book Launches' },
        { id: 'ev3', title: 'Workshop: Writing Queer Characters in Speculative Fiction', description: 'A craft workshop on authenticity, avoiding tropes, and centering queer joy in fantastical settings.', date: ts('2027-05-10T15:00:00'), endDate: ts('2027-05-10T17:00:00'), location: 'Virtual (Zoom)', type: 'Workshop', status: 'upcoming', capacity: 30, rsvpCount: 22, rsvpList: [], isFree: false, ticketPrice: 25, speakers: [{ name: 'River Chen', image: 'https://picsum.photos/seed/river/200/200', role: 'Workshop Leader' }], tags: ['craft', 'queer fiction', 'workshop'], seriesName: 'Craft Series' },
        { id: 'ev4', title: 'Panel: Climate Fiction and the End of the World', description: 'A panel discussion on cli-fi, hope, and writing about environmental catastrophe responsibly.', date: ts('2027-03-20T19:00:00'), location: 'Virtual (YouTube Live)', type: 'Panel', status: 'past', capacity: 1000, rsvpCount: 567, rsvpList: [], isFree: true, speakers: [{ name: 'Kai Nakamura', image: 'https://picsum.photos/seed/kai/200/200', role: 'Panelist' }], tags: ['climate fiction', 'panel', 'environment'], recordingUrl: 'https://youtube.com/example' },
        { id: 'ev5', title: 'Community Reading: Neon Requiem Chapters 1-5', description: 'Join fellow readers for a guided discussion of the opening chapters.', date: ts('2027-04-12T20:00:00'), endDate: ts('2027-04-12T21:00:00'), location: 'Virtual (Discord)', type: 'Reading', status: 'upcoming', capacity: 50, rsvpCount: 31, rsvpList: [], isFree: true, speakers: [], tags: ['book club', 'discussion', 'neon requiem'], seriesName: 'Community Reads' },
    ];
    for (const item of EVENTS) {
        await safeWrite(`events/${item.id}`, () => setDoc(doc(db, 'events', item.id), item));
    }

    // ── 4. News (News.tsx) ────────────────────
    const NEWS = [
        { id: 'news-1', title: 'Rüna Atlas Acquires "The Silicon Throne" Trilogy', date: 'October 15, 2026', category: 'Acquisitions', excerpt: 'We are thrilled to announce the acquisition of a groundbreaking new cyberpunk trilogy by debut author Kaelen Vance.', createdAt: ts('2026-10-15') },
        { id: 'news-2', title: 'Open Call for Short Story Anthology: "Echoes of the Void"', date: 'September 28, 2026', category: 'Submissions', excerpt: 'Our next anthology will focus on stories of deep space exploration and the psychological impact of the void.', createdAt: ts('2026-09-28') },
        { id: 'news-3', title: 'Marina Solis Nominated for the Nebula Award', date: 'September 10, 2026', category: 'Awards', excerpt: 'Congratulations to Marina Solis, whose novel "Whispers of the Deep" has been nominated for this year\'s Nebula Award.', createdAt: ts('2026-09-10') },
        { id: 'news-4', title: 'Starforge Membership Program Launches', date: 'August 22, 2026', category: 'Company News', excerpt: 'Join our new membership program to get early access to releases, exclusive serials, and behind-the-scenes content.', createdAt: ts('2026-08-22') },
    ];
    for (const item of NEWS) {
        await safeWrite(`news/${item.id}`, () => setDoc(doc(db, 'news', item.id), item));
    }

    // ── 5. Membership Tiers (Membership.tsx) ────────────────────
    const MEMBERSHIP_TIERS = [
        { id: 'stargazer', name: 'Stargazer', price: 5, description: 'Support our mission and get early access to news.', features: ['Monthly newsletter with exclusive updates', 'Early access to new release announcements', 'Vote on community polls (anthology themes)', '10% discount on all ebooks'], order: 0 },
        { id: 'navigator', name: 'Navigator', price: 15, description: 'Dive deeper into the Runeweave with serialized content.', features: ['Everything in Stargazer', 'Full access to all Serialized Releases', 'Behind-the-scenes author diaries', 'Join Reader Circles (Beta reading)', '15% discount on all physical books'], popular: true, order: 1 },
        { id: 'architect', name: 'Architect', price: 50, description: "The ultimate collector's tier for true patrons of the forge.", features: ['Everything in Navigator', 'One signed hardcover sent quarterly', "Exclusive collector's editions access", 'Direct Q&A sessions with authors', 'Name in the acknowledgments of anthologies'], order: 2 },
    ];
    for (const item of MEMBERSHIP_TIERS) {
        await safeWrite(`membership_tiers/${item.id}`, () => setDoc(doc(db, 'membership_tiers', item.id), item));
    }

    // ── 6. Serials (Serials.tsx) ────────────────────
    const SERIALS = [
        { id: 'serial-1', title: 'The Clockwork Heart', author: 'Elias Thorne', cover: 'https://picsum.photos/seed/clockwork/400/600', genre: 'Steampunk Romance', status: 'Ongoing', latestChapter: 12, nextRelease: '2 days', synopsis: 'In a city powered by steam and secrets, a rogue mechanic discovers a sentient automaton with a heart that beats to a dangerous rhythm.', chapters: [
            { num: 1, title: 'The Brass Awakening', free: true, content: 'The smog was particularly thick tonight. Elara wiped a smudge of grease from her cheek...' },
            { num: 2, title: 'Gears in Motion', free: true, content: 'Panic and fascination warred within Elara. Sentience in automatons was strictly forbidden...' },
            { num: 3, title: 'A Spark in the Dark', free: true, content: 'Hiding Orion proved to be Elara\'s greatest challenge yet...' },
            { num: 4, title: 'The Inspector Calls', free: false, content: 'Premium content. Please subscribe to read.' },
            { num: 5, title: 'Flight over the Smog', free: false, content: 'Premium content. Please subscribe to read.' },
        ], createdAt: ts('2026-01-10') },
        { id: 'serial-2', title: 'Void Walkers', author: 'Kaelen Vance', cover: 'https://picsum.photos/seed/void/400/600', genre: 'Space Opera', status: 'Completed', latestChapter: 24, nextRelease: null, synopsis: 'A crew of outcasts navigates the treacherous Void, a region of space where reality bends and ancient entities slumber.', chapters: [
            { num: 1, title: 'Into the Abyss', free: true, content: 'Captain Jax gripped the helm, knuckles white...' },
            { num: 2, title: 'Whispers from the Dark', free: true, content: 'The ship groaned as it breached the nebula\'s edge...' },
            { num: 3, title: 'The First Anomaly', free: false, content: 'Premium content. Please subscribe to read.' },
        ], createdAt: ts('2025-09-01') },
    ];
    for (const item of SERIALS) {
        await safeWrite(`serials/${item.id}`, () => setDoc(doc(db, 'serials', item.id), item));
    }

    // ── 7. Library Books (Library.tsx) ────────────────────
    const LIBRARY_BOOKS = [
        { id: 'lib-1', title: 'The Obsidian Crown', author: 'Elara Vance', cover: 'https://picsum.photos/seed/obsidian/400/600', format: 'Ebook', progress: 45, purchasedAt: '2026-01-15', editionType: 'Standard' },
        { id: 'lib-2', title: 'Neon Requiem', author: 'Jax Thorne', cover: 'https://picsum.photos/seed/neon/400/600', format: 'Audiobook', progress: 12, purchasedAt: '2026-02-28', editionType: 'Standard' },
        { id: 'lib-3', title: 'Star-Crossed Circuits', author: 'Leo Vance', cover: 'https://picsum.photos/seed/circuits/400/600', format: 'Ebook', progress: 100, purchasedAt: '2025-11-10', editionType: 'Interactive' },
    ];
    for (const item of LIBRARY_BOOKS) {
        await safeWrite(`user_libraries/${item.id}`, () => setDoc(doc(db, 'user_libraries', item.id), item));
    }

    const WISHLIST_ITEMS = [
        { id: 'wish-1', title: 'Whispers of the Deep', author: 'Marina Solis', cover: 'https://picsum.photos/seed/whispers/400/600', price: '$24.99', format: 'Hardcover', editionType: 'Signed' },
    ];
    for (const item of WISHLIST_ITEMS) {
        await safeWrite(`user_wishlists/${item.id}`, () => setDoc(doc(db, 'user_wishlists', item.id), item));
    }

    // ── 8. Cart Items (Cart.tsx) ────────────────────
    const CART_ITEMS = [
        { id: 'cart-1', title: 'The Obsidian Crown', author: 'Elara Vance', cover: 'https://picsum.photos/seed/obsidian/200/300', format: 'Paperback', price: 18.99, quantity: 1, editionType: 'Standard' },
        { id: 'cart-2', title: 'Neon Requiem', author: 'Jax Thorne', cover: 'https://picsum.photos/seed/neon/200/300', format: 'Ebook', price: 9.99, quantity: 1, editionType: 'Interactive' },
    ];
    for (const item of CART_ITEMS) {
        await safeWrite(`user_carts/${item.id}`, () => setDoc(doc(db, 'user_carts', item.id), item));
    }

    // ── 9. BookDNA data (BookDNA.tsx) ────────────────────
    const BOOK_DNA = {
        id: 'demo-dna',
        username: 'star_reader_42',
        personality: 'The Obsidian Scholar',
        booksAnalyzed: 47,
        genomeStrength: 94,
        topTraits: ['Deep Worldbuilding Addict', 'Morally Grey Connoisseur', 'Prose Snob', 'Dark Tone Seeker'],
        tasteAxes: [
            { id: 'darkness', label: 'Tone', value: 78, leftLabel: 'Light', rightLabel: 'Dark', color: '#a78bfa' },
            { id: 'pacing', label: 'Pacing', value: 55, leftLabel: 'Slow Burn', rightLabel: 'Breakneck', color: '#f97316' },
            { id: 'worldbuilding', label: 'Worldbuilding', value: 88, leftLabel: 'Minimal', rightLabel: 'Immersive', color: '#10b981' },
            { id: 'character', label: 'Focus', value: 65, leftLabel: 'Plot-Driven', rightLabel: 'Character-Driven', color: '#3b82f6' },
            { id: 'prose', label: 'Prose Style', value: 82, leftLabel: 'Clean', rightLabel: 'Lyrical', color: '#8b5cf6' },
            { id: 'romance', label: 'Romance Heat', value: 42, leftLabel: 'None', rightLabel: 'Central', color: '#f43f5e' },
            { id: 'morality', label: 'Moral Ambiguity', value: 85, leftLabel: 'Clear-Cut', rightLabel: 'Morally Grey', color: '#6b7280' },
            { id: 'intensity', label: 'Intensity', value: 68, leftLabel: 'Cozy', rightLabel: 'Visceral', color: '#ef4444' },
        ],
        genreAffinity: [
            { genre: 'Dark Fantasy', affinity: 95, books: 16 },
            { genre: 'Sci-Fi', affinity: 78, books: 11 },
            { genre: 'Literary Fiction', affinity: 72, books: 9 },
            { genre: 'Gothic Horror', affinity: 68, books: 5 },
            { genre: 'Magical Realism', affinity: 65, books: 6 },
        ],
        recentBooks: [
            { title: 'The Obsidian Crown', author: 'Elara Vance', rating: 5, dnaImpact: '+Dark, +Worldbuilding, +Prose', cover: 'https://picsum.photos/seed/obsidian-dna/100/150' },
            { title: 'Bones of Tomorrow', author: 'Kael Thornwood', rating: 4, dnaImpact: '+Intensity, +Morality, +Pacing', cover: 'https://picsum.photos/seed/bones-dna/100/150' },
        ],
        similarReaders: [
            { name: 'midnight_ink', avatar: '🖋️', match: 89, sharedBooks: 12 },
            { name: 'prose_hunter', avatar: '🔍', match: 84, sharedBooks: 9 },
        ],
        authorMatches: [
            { name: 'Elara Vance', match: 97, genre: 'Dark Fantasy', avatar: '📖' },
            { name: 'Sera Nighthollow', match: 88, genre: 'Magical Realism', avatar: '🌙' },
            { name: 'Kael Thornwood', match: 82, genre: 'Sci-Fi', avatar: '🌲' },
        ],
    };
    await safeWrite(`book_dna/${BOOK_DNA.id}`, () => setDoc(doc(db, 'book_dna', BOOK_DNA.id), BOOK_DNA));

    // ── 10. Reader Compatibility (ReaderCompatibility.tsx) ────────────────────
    const READER_MATCHES = [
        { id: 'm1', username: 'midnight_ink', avatar: '🖋️', personality: 'The Shadowweaver', overallMatch: 92, dnaMatch: 89, highlightOverlap: 73, paceMatch: 85, sharedBooks: 12, totalBooks: 52, topGenres: ['Dark Fantasy', 'Gothic Horror', 'Literary Fiction'], favBook: 'The Obsidian Crown', recentRead: 'Bones of Tomorrow', sharedHighlights: ['"Magic is not a gift. It is a wound the universe has learned to sing through."'], status: 'reading', badge: '🔥 Hot Match' },
        { id: 'm2', username: 'prose_hunter', avatar: '🔍', personality: 'The Lyric Cartographer', overallMatch: 87, dnaMatch: 84, highlightOverlap: 68, paceMatch: 78, sharedBooks: 9, totalBooks: 41, topGenres: ['Literary Fiction', 'Magical Realism', 'Sci-Fi'], favBook: 'The Glass Meridian', recentRead: 'The Ember Codex', sharedHighlights: ['"She had been so busy being brave that she forgot bravery was supposed to be temporary."'], status: 'online' },
        { id: 'm3', username: 'theory_crafter', avatar: '🧠', personality: 'The Pattern Seeker', overallMatch: 83, dnaMatch: 80, highlightOverlap: 61, paceMatch: 90, sharedBooks: 8, totalBooks: 63, topGenres: ['Dark Fantasy', 'Sci-Fi', 'Mystery'], favBook: 'Bones of Tomorrow', recentRead: 'Signal to Noise', sharedHighlights: [], status: 'idle' },
    ];
    for (const item of READER_MATCHES) {
        await safeWrite(`reader_matches/${item.id}`, () => setDoc(doc(db, 'reader_matches', item.id), item));
    }

    const BUDDY_READS = [
        { id: 'br-1', title: 'The Obsidian Crown', participants: 3, progress: 'Ch. 12 / 24', pace: '2 chapters/week' },
        { id: 'br-2', title: 'Bones of Tomorrow', participants: 2, progress: 'Ch. 8 / 18', pace: '3 chapters/week' },
    ];
    for (const item of BUDDY_READS) {
        await safeWrite(`buddy_reads/${item.id}`, () => setDoc(doc(db, 'buddy_reads', item.id), item));
    }

    // ── 11. Beta Reader Hub (BetaReaderHub.tsx) ────────────────────
    const BETA_MANUSCRIPTS = [
        { id: 'bm1', title: 'Wrath & Reverie', author: 'Elara Vance', authorAvatar: '📖', genre: 'Dark Fantasy', wordCount: '94,000', deadline: 'Mar 28, 2026', daysLeft: 17, status: 'active', progress: 62, chaptersRead: 15, totalChapters: 24, feedbackSubmitted: 8, feedbackRequired: 12, cover: 'https://picsum.photos/seed/wrath-beta/120/170', synopsis: 'The sequel to The Obsidian Crown.', tags: ['Sequel', 'Priority', 'NDA Required'], priority: 'high' },
        { id: 'bm2', title: 'The Hollow Garden', author: 'Sera Nighthollow', authorAvatar: '🌙', genre: 'Magical Realism', wordCount: '67,000', deadline: 'Apr 12, 2026', daysLeft: 32, status: 'active', progress: 28, chaptersRead: 5, totalChapters: 18, feedbackSubmitted: 3, feedbackRequired: 9, cover: 'https://picsum.photos/seed/hollow-beta/120/170', synopsis: "A greenhouse keeper discovers that her plants are growing memories.", tags: ['Debut', 'Sensitivity Read'], priority: 'normal' },
        { id: 'bm3', title: 'Signal to Noise', author: 'Kael Thornwood', authorAvatar: '🌲', genre: 'Sci-Fi', wordCount: '82,000', deadline: 'Feb 28, 2026', daysLeft: -11, status: 'overdue', progress: 45, chaptersRead: 8, totalChapters: 20, feedbackSubmitted: 4, feedbackRequired: 10, cover: 'https://picsum.photos/seed/signal-beta/120/170', synopsis: 'A radio telescope operator receives a transmission from a civilization that died 10,000 years ago.', tags: ['Hard Sci-Fi'], priority: 'high' },
        { id: 'bm4', title: 'Bone Lace', author: 'Althea Priory', authorAvatar: '🏛️', genre: 'Gothic Horror', wordCount: '71,000', deadline: 'Jan 15, 2026', daysLeft: 0, status: 'completed', progress: 100, chaptersRead: 16, totalChapters: 16, feedbackSubmitted: 8, feedbackRequired: 8, cover: 'https://picsum.photos/seed/bone-beta/120/170', synopsis: 'In a house that breathes, a dressmaker sews gowns from human bone.', tags: ['Body Horror', 'Completed'], priority: 'low' },
    ];
    for (const item of BETA_MANUSCRIPTS) {
        await safeWrite(`beta_manuscripts/${item.id}`, () => setDoc(doc(db, 'beta_manuscripts', item.id), item));
    }

    const BETA_FEEDBACK = [
        { id: 'bf1', manuscript: 'Wrath & Reverie', chapter: 14, type: 'pacing', content: 'The battle sequence drags — flashback interruptions break momentum.', timestamp: '2h ago', authorResponse: "Great catch! I'll condense the flashbacks.", createdAt: ts('2026-03-10') },
        { id: 'bf2', manuscript: 'Wrath & Reverie', chapter: 12, type: 'character', content: "Seraphine's motivation feels unclear here.", timestamp: '1d ago', createdAt: ts('2026-03-09') },
        { id: 'bf3', manuscript: 'The Hollow Garden', chapter: 4, type: 'prose', content: 'The greenhouse description in the opening paragraph is gorgeous.', timestamp: '2d ago', createdAt: ts('2026-03-08') },
        { id: 'bf4', manuscript: 'Bone Lace', chapter: 16, type: 'overall', content: 'Final chapter lands perfectly.', timestamp: '1w ago', authorResponse: 'This feedback made my week.', createdAt: ts('2026-03-03') },
    ];
    for (const item of BETA_FEEDBACK) {
        await safeWrite(`beta_feedback/${item.id}`, () => setDoc(doc(db, 'beta_feedback', item.id), item));
    }

    // ── 12. Passage Collections (PassageCollections.tsx) ────────────────────
    const PASSAGE_COLLECTIONS = [
        { id: 'pc1', title: 'Lines That Destroyed Me', description: 'The passages that made me physically put the book down.', curator: 'star_reader_42', curatorAvatar: '🌟', visibility: 'public', passageCount: 23, followers: 312, coverGradient: 'from-rose-600/30 via-red-900/30 to-void-black', tags: ['emotional', 'prose', 'gut-punch'], featured: true, passages: [
            { id: 'p1', text: '"Magic is not a gift. It is a wound the universe has learned to sing through."', book: 'The Obsidian Crown', author: 'Elara Vance', chapter: 'The Marrow Gate', savedBy: 1247, reactions: [{ emoji: '💀', count: 89 }, { emoji: '✨', count: 156 }] },
            { id: 'p2', text: '"I didn\'t follow you to save you. I followed because the world is less interesting when you\'re not in it."', book: 'The Obsidian Crown', author: 'Elara Vance', chapter: 'Bonds of Fire', savedBy: 2034, reactions: [{ emoji: '😭', count: 312 }, { emoji: '❤️', count: 245 }] },
        ] },
        { id: 'pc2', title: 'Worldbuilding Masterclass', description: 'Passages that make you forget the world is made up.', curator: 'the_archivist', curatorAvatar: '📚', visibility: 'public', passageCount: 15, followers: 189, coverGradient: 'from-emerald-600/30 via-teal-900/30 to-void-black', tags: ['worldbuilding', 'immersive', 'setting'], passages: [] },
    ];
    for (const item of PASSAGE_COLLECTIONS) {
        await safeWrite(`passage_collections/${item.id}`, () => setDoc(doc(db, 'passage_collections', item.id), item));
    }

    // ── 13. Editor Bridge (EditorBridge.tsx) ────────────────────
    const EDITOR_BETA_NOTES = [
        { id: 'ebn1', reader: 'Taylor Park', readerTier: 'Trusted', chapter: 14, chapterTitle: 'Battle of the Veil', category: 'pacing', text: 'The battle sequence in Ch. 14 drags — flashback interruptions break momentum.', timestamp: '2h ago', imported: false, highlighted: true, agreement: 3 },
        { id: 'ebn2', reader: 'Nia Blackwood', readerTier: 'Inner Circle', chapter: 12, chapterTitle: 'The Betrayal', category: 'character', text: "Seraphine's motivation needs one more internal justification.", timestamp: '5h ago', imported: false, highlighted: false, agreement: 2 },
        { id: 'ebn3', reader: 'Marcus Chen', readerTier: 'Trusted', chapter: 10, chapterTitle: 'The Mirror Room', category: 'plot', text: 'The twist landed perfectly. All readers called this out positively.', timestamp: '1d ago', imported: true, highlighted: false, agreement: 5 },
    ];
    for (const item of EDITOR_BETA_NOTES) {
        await safeWrite(`editor_beta_notes/${item.id}`, () => setDoc(doc(db, 'editor_beta_notes', item.id), item));
    }

    const EDITOR_CONSENSUS = [
        { id: 'ec1', chapter: 14, chapterTitle: 'Battle of the Veil', total: 8, flagged: true, topIssue: 'Pacing — flashback interruptions', category: 'pacing', agreementPct: 60 },
        { id: 'ec2', chapter: 12, chapterTitle: 'The Betrayal', total: 4, flagged: true, topIssue: 'Character — Seraphine motivation gap', category: 'character', agreementPct: 40 },
        { id: 'ec3', chapter: 10, chapterTitle: 'The Mirror Room', total: 6, flagged: false, topIssue: 'Plot twist — universally praised', category: 'plot', agreementPct: 100 },
    ];
    for (const item of EDITOR_CONSENSUS) {
        await safeWrite(`editor_consensus/${item.id}`, () => setDoc(doc(db, 'editor_consensus', item.id), item));
    }

    // ── 14. Manuscript Inbox (ManuscriptInbox.tsx) ────────────────────
    const MANUSCRIPT_INBOX = [
        { id: 'mi1', title: 'Wrath & Reverie', author: 'Elara Vance', genre: 'Dark Fantasy', wordCount: '94,000', submittedDate: 'Oct 12, 2025', status: 'under_review', priority: 'high', cover: 'https://picsum.photos/seed/wrath-inbox/60/80', synopsis: 'The sequel to The Obsidian Crown.', betaReaderCount: 5, betaFeedbackSummary: 'Strong character work. Pacing issue in Ch. 14.', betaSentiment: 'Mostly Positive', revisionRound: 2, lastUpdate: '2h ago', actionNeeded: 'Review R2 author revisions for Ch. 12b and Ch. 20', tags: ['Sequel', 'Priority', 'Has Beta Feedback'] },
        { id: 'mi2', title: 'The Hollow Garden', author: 'Sera Nighthollow', genre: 'Magical Realism', wordCount: '67,000', submittedDate: 'Jan 5, 2026', status: 'under_review', priority: 'normal', cover: 'https://picsum.photos/seed/hollow-inbox/60/80', synopsis: "A botanical illustrator discovers her grandmother's garden grows memories.", betaReaderCount: 0, revisionRound: 0, lastUpdate: '1d ago', actionNeeded: 'Complete initial developmental read', tags: ['Debut Author'] },
        { id: 'mi3', title: 'Signal to Noise', author: 'Kael Thornwood', genre: 'Sci-Fi', wordCount: '82,000', submittedDate: 'Aug 22, 2025', status: 'revision_needed', priority: 'urgent', cover: 'https://picsum.photos/seed/signal-inbox/60/80', synopsis: 'In a future where silence is currency, a deaf coder discovers she can hear the frequency that controls the world.', betaReaderCount: 4, betaFeedbackSummary: 'Worldbuilding praised. Act III needs work.', betaSentiment: 'Mixed', revisionRound: 2, lastUpdate: '3d ago', actionNeeded: 'Author revision overdue by 2 weeks — follow up', tags: ['R2 Overdue', 'Has Beta Feedback'] },
    ];
    for (const item of MANUSCRIPT_INBOX) {
        await safeWrite(`manuscript_inbox/${item.id}`, () => setDoc(doc(db, 'manuscript_inbox', item.id), item));
    }

    // ── 15. Manuscript Pipeline (ManuscriptPipeline.tsx) – already seeded in editorial projects, skip if exists ──

    // ── 16. Beta Campaign (BetaCampaign.tsx) ────────────────────
    const BETA_CAMPAIGN_READERS = [
        { id: 'bcr1', name: 'Taylor Park', avatar: '🌳', status: 'active', chaptersRead: 15, totalChapters: 24, feedbackCount: 8, rating: 4.9, joinDate: '2025-11-01' },
        { id: 'bcr2', name: 'Nia Blackwood', avatar: '🌙', status: 'active', chaptersRead: 12, totalChapters: 24, feedbackCount: 6, rating: 4.7, joinDate: '2025-11-15' },
        { id: 'bcr3', name: 'Marcus Chen', avatar: '📖', status: 'completed', chaptersRead: 24, totalChapters: 24, feedbackCount: 12, rating: 5.0, joinDate: '2025-10-01' },
    ];
    for (const item of BETA_CAMPAIGN_READERS) {
        await safeWrite(`beta_campaign_readers/${item.id}`, () => setDoc(doc(db, 'beta_campaign_readers', item.id), item));
    }

    // ── 17. Editor Beta Manager (EditorBetaManager.tsx) ────────────────────
    const EDITOR_BETA_READERS = [
        { id: 'ebr1', name: 'Taylor Park', avatar: 'https://picsum.photos/seed/taylor/100/100', tier: 'Trusted', booksRead: 8, rating: 4.9, status: 'active', currentManuscript: 'Wrath & Reverie', specialties: ['Dark Fantasy', 'Pacing Analysis'] },
        { id: 'ebr2', name: 'Nia Blackwood', avatar: 'https://picsum.photos/seed/nia/100/100', tier: 'Inner Circle', booksRead: 14, rating: 5.0, status: 'active', currentManuscript: 'Wrath & Reverie', specialties: ['Character Development', 'Literary Fiction'] },
    ];
    for (const item of EDITOR_BETA_READERS) {
        await safeWrite(`editor_beta_readers/${item.id}`, () => setDoc(doc(db, 'editor_beta_readers', item.id), item));
    }

    // ── 18. Revision Rounds (RevisionRounds.tsx) ────────────────────
    const REVISION_ROUNDS = [
        { id: 'rr1', number: 1, status: 'completed', startDate: '2025-08-01', endDate: '2025-09-15', focusAreas: ['Structure', 'Character arcs'], notes: [{ author: 'Editor', text: 'Strong foundation. Focus on tightening Act II.', date: '2025-08-05' }] },
        { id: 'rr2', number: 2, status: 'in_progress', startDate: '2025-10-01', endDate: null, focusAreas: ['Pacing', 'Dialogue', 'Ch. 14 restructure'], notes: [{ author: 'Editor', text: 'Ch. 14 flashbacks need consolidation per beta feedback.', date: '2026-03-08' }] },
    ];
    for (const item of REVISION_ROUNDS) {
        await safeWrite(`revision_rounds/${item.id}`, () => setDoc(doc(db, 'revision_rounds', item.id), item));
    }

    // ── 19. Creator Studio (CreatorStudio.tsx) analytics ────────────────────
    const STUDIO_FEEDBACK_PIPELINE = [
        { id: 'sfp1', source: 'Beta Reader: Taylor', type: 'Pacing', severity: 'medium', chapter: 14, note: 'Battle sequence drags.', status: 'open' },
        { id: 'sfp2', source: 'Editor: Mx. Reyes', type: 'Character', severity: 'high', chapter: 12, note: 'Seraphine motivation gap.', status: 'in_review' },
        { id: 'sfp3', source: 'Beta Reader: Marcus', type: 'Plot', severity: 'low', chapter: 10, note: 'Twist universally praised.', status: 'resolved' },
    ];
    for (const item of STUDIO_FEEDBACK_PIPELINE) {
        await safeWrite(`studio_feedback_pipeline/${item.id}`, () => setDoc(doc(db, 'studio_feedback_pipeline', item.id), item));
    }

    const STUDIO_BETA_READERS = [
        { id: 'sbr1', name: 'Taylor Park', sentiment: 'positive', chaptersRead: 15, feedbackCount: 8, lastActivity: '2h ago' },
        { id: 'sbr2', name: 'Nia Blackwood', sentiment: 'positive', chaptersRead: 12, feedbackCount: 6, lastActivity: '5h ago' },
        { id: 'sbr3', name: 'Marcus Chen', sentiment: 'very positive', chaptersRead: 24, feedbackCount: 12, lastActivity: '1d ago' },
    ];
    for (const item of STUDIO_BETA_READERS) {
        await safeWrite(`studio_beta_readers/${item.id}`, () => setDoc(doc(db, 'studio_beta_readers', item.id), item));
    }

    // ── 20. Writing Goals (WritingGoals.tsx) ────────────────────
    const WRITING_GOALS_CONFIG = {
        id: 'demo-goals',
        currentStreak: 14,
        longestStreak: 21,
        dailyGoal: 1500,
        totalWords: 47250,
        avgWordsPerDay: 1012,
    };
    await safeWrite(`writing_goals_config/${WRITING_GOALS_CONFIG.id}`, () =>
        setDoc(doc(db, 'writing_goals_config', WRITING_GOALS_CONFIG.id), WRITING_GOALS_CONFIG));

    const WRITING_WEEKLY_LOG = [
        { id: 'wwl-1', day: 'Mon', words: 1200, goal: 1500 },
        { id: 'wwl-2', day: 'Tue', words: 1800, goal: 1500 },
        { id: 'wwl-3', day: 'Wed', words: 900, goal: 1500 },
        { id: 'wwl-4', day: 'Thu', words: 1500, goal: 1500 },
        { id: 'wwl-5', day: 'Fri', words: 2100, goal: 1500 },
        { id: 'wwl-6', day: 'Sat', words: 600, goal: 1500 },
        { id: 'wwl-7', day: 'Sun', words: 0, goal: 1500 },
    ];
    for (const item of WRITING_WEEKLY_LOG) {
        await safeWrite(`writing_weekly_log/${item.id}`, () => setDoc(doc(db, 'writing_weekly_log', item.id), item));
    }

    const WRITING_MILESTONES = [
        { id: 'wm-1', label: '25% Draft', target: 25000, current: 25000, completed: true },
        { id: 'wm-2', label: '50% Draft', target: 50000, current: 47250, completed: false },
        { id: 'wm-3', label: 'First Draft', target: 90000, current: 47250, completed: false },
    ];
    for (const item of WRITING_MILESTONES) {
        await safeWrite(`writing_milestones/${item.id}`, () => setDoc(doc(db, 'writing_milestones', item.id), item));
    }

    const WRITING_ACHIEVEMENTS = [
        { id: 'wa-1', name: '🔥 7-Day Streak', description: 'Write for 7 consecutive days', unlocked: true },
        { id: 'wa-2', name: '📝 First 10K', description: 'Reach 10,000 words', unlocked: true },
        { id: 'wa-3', name: '🏆 NaNoWriMo Pace', description: 'Hit 1,667 words/day for 30 days', unlocked: false },
    ];
    for (const item of WRITING_ACHIEVEMENTS) {
        await safeWrite(`writing_achievements/${item.id}`, () => setDoc(doc(db, 'writing_achievements', item.id), item));
    }

    // ── 21. Runeweave constellations (Runeweave.tsx) — already seeded, skip ──

    // ── 22. Home featured books (Home.tsx) — already seeded via books collection ──
}
