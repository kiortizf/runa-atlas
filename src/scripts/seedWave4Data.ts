/**
 * seedWave4Data.ts
 *
 * Wave 4: Seeds ALL remaining content collections that pages depend on.
 * These collections were identified as missing seed data during the full audit.
 * Called from the main seedAllDemoData function.
 */
import { db } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

function ts(dateStr: string): Timestamp {
    return Timestamp.fromDate(new Date(dateStr));
}

type SafeWrite = (label: string, fn: () => Promise<void>) => Promise<void>;

export async function seedWave4(safeWrite: SafeWrite) {

    // ── 1. Books (books) — Core catalog used by Home, Catalog, Runeweave, ContentCompass, BookDetail ──
    const BOOKS = [
        { id: 'book-1', title: 'The Obsidian Crown', author: 'Elara Vance', authorId: 'author-1', cover: '/covers/obsidian-crown.png', genre: 'Dark Fantasy', subgenre: 'Epic Fantasy', synopsis: 'A scholar discovers the obsidian crown — an artifact that grants dominion over shadow magic — and must choose between saving her kingdom or losing her humanity.', price: 24.99, format: ['Hardcover', 'Ebook', 'Audiobook'], pageCount: 412, publishDate: ts('2026-06-15'), rating: 4.8, reviewCount: 247, status: 'published', featured: true, tags: ['dark fantasy', 'magic systems', 'strong female lead', 'morally grey'], contentWarnings: ['violence', 'death'], isbn: '978-1-234567-01-1', constellationId: 'const-1', connections: ['book-8', 'book-3'], themes: ['dark magic', 'power', 'sacrifice'], slug: 'the-obsidian-crown', createdAt: ts('2026-01-01') },
        { id: 'book-2', title: 'Neon Requiem', author: 'Jax Thorne', authorId: 'author-2', cover: '/covers/neon-requiem.png', genre: 'Cyberpunk', subgenre: 'Dystopian', synopsis: 'In a neon-soaked megacity where memories are currency, a rogue archivist discovers her own past has been deliberately erased.', price: 19.99, format: ['Paperback', 'Ebook'], pageCount: 356, publishDate: ts('2026-03-01'), rating: 4.5, reviewCount: 189, status: 'published', featured: true, tags: ['cyberpunk', 'memory', 'identity', 'dystopian'], contentWarnings: ['violence', 'drug use'], isbn: '978-1-234567-02-8', constellationId: 'const-2', connections: ['book-7', 'book-5'], themes: ['memory', 'identity', 'technology'], slug: 'neon-requiem', createdAt: ts('2025-09-01') },
        { id: 'book-3', title: 'Whispers of the Deep', author: 'Marina Solis', authorId: 'author-3', cover: '/covers/whispers-of-the-deep.png', genre: 'Magical Realism', subgenre: 'Literary Fiction', synopsis: 'On a remote coastal island, a marine biologist begins hearing voices from the ocean that reveal the secrets her grandmother took to her grave.', price: 22.99, format: ['Hardcover', 'Ebook'], pageCount: 298, publishDate: ts('2026-09-15'), rating: 4.9, reviewCount: 312, status: 'published', featured: true, tags: ['magical realism', 'family secrets', 'ocean', 'lyrical prose'], contentWarnings: ['grief'], isbn: '978-1-234567-03-5', constellationId: 'const-3', connections: ['book-5', 'book-1'], themes: ['ocean', 'family', 'mystery'], slug: 'whispers-of-the-deep', createdAt: ts('2026-04-01') },
        { id: 'book-4', title: 'Star-Crossed Circuits', author: 'Leo Vance', authorId: 'author-4', cover: '/covers/star-crossed-circuits.png', genre: 'Sci-Fi Romance', subgenre: 'Space Opera', synopsis: 'Two rival engineers on a generation ship must work together when a catastrophic system failure threatens the last remnants of humanity — and discover their rivalry masks something deeper.', price: 17.99, format: ['Paperback', 'Ebook', 'Audiobook'], pageCount: 384, publishDate: ts('2026-01-20'), rating: 4.6, reviewCount: 156, status: 'published', featured: false, tags: ['queer romance', 'space opera', 'found family', 'rivals to lovers'], contentWarnings: [], isbn: '978-1-234567-04-2', constellationId: 'const-4', connections: ['book-6', 'book-2'], themes: ['romance', 'space', 'identity'], slug: 'star-crossed-circuits', createdAt: ts('2025-07-01') },
        { id: 'book-5', title: 'The Saltwater Archives', author: 'Marina Solis', authorId: 'author-3', cover: '/covers/saltwater-archives.png', genre: 'Literary Fiction', subgenre: 'Magical Realism', synopsis: 'A librarian discovers that she can read the memories stored in saltwater and uncovers a conspiracy that stretches across generations.', price: 21.99, format: ['Hardcover', 'Ebook'], pageCount: 342, publishDate: ts('2027-02-01'), rating: 4.7, reviewCount: 98, status: 'published', featured: false, tags: ['magical realism', 'libraries', 'memory', 'conspiracy'], contentWarnings: [], isbn: '978-1-234567-05-9', constellationId: 'const-3', connections: ['book-3', 'book-2'], themes: ['memory', 'ocean', 'secrets'], slug: 'the-saltwater-archives', createdAt: ts('2026-08-01') },
        { id: 'book-6', title: 'Orbiting You', author: 'Leo Vance', authorId: 'author-4', cover: '/covers/orbiting-you.png', genre: 'Sci-Fi Romance', subgenre: 'Space Opera', synopsis: 'A follow-up standalone set in the same universe as Star-Crossed Circuits, following two diplomats from opposing factions.', price: 18.99, format: ['Paperback', 'Ebook'], pageCount: 368, publishDate: ts('2027-04-01'), rating: 4.4, reviewCount: 67, status: 'published', featured: false, tags: ['queer romance', 'space diplomacy', 'slow burn'], contentWarnings: [], isbn: '978-1-234567-06-6', constellationId: 'const-4', connections: ['book-4', 'book-7'], themes: ['romance', 'politics', 'space'], slug: 'orbiting-you', createdAt: ts('2026-11-01') },
        { id: 'book-7', title: 'Silicon Souls', author: 'Jax Thorne', authorId: 'author-2', cover: '/covers/silicon-souls.png', genre: 'Cyberpunk', subgenre: 'Thriller', synopsis: 'The sequel to Neon Requiem. The memory market has collapsed, and with it, the fragile truce between factions.', price: 19.99, format: ['Paperback', 'Ebook'], pageCount: 402, publishDate: ts('2027-06-01'), rating: 4.3, reviewCount: 42, status: 'published', featured: false, tags: ['cyberpunk', 'thriller', 'sequel', 'AI'], contentWarnings: ['violence'], isbn: '978-1-234567-07-3', constellationId: 'const-2', connections: ['book-2', 'book-6'], themes: ['technology', 'power', 'rebellion'], slug: 'silicon-souls', createdAt: ts('2027-01-01') },
        { id: 'book-8', title: 'Echoes of the Spire', author: 'Elara Vance', authorId: 'author-1', cover: '/covers/echoes-of-the-spire.png', genre: 'Dark Fantasy', subgenre: 'Gothic', synopsis: 'In a tower that defies time, an architect discovers that every floor she builds leads deeper into her own forgotten past.', price: 23.99, format: ['Hardcover', 'Ebook'], pageCount: 388, publishDate: ts('2027-09-15'), rating: 4.7, reviewCount: 31, status: 'pre-order', featured: true, tags: ['dark fantasy', 'gothic', 'architecture', 'time'], contentWarnings: ['body horror'], isbn: '978-1-234567-08-0', constellationId: 'const-1', connections: ['book-1', 'book-3'], themes: ['dark magic', 'time', 'memory'], slug: 'echoes-of-the-spire', createdAt: ts('2027-03-01') },
    ];
    for (const item of BOOKS) {
        await safeWrite(`books/${item.id}`, () => setDoc(doc(db, 'books', item.id), item));
    }

    // ── 2. Constellations (Runeweave.tsx) ──
    const CONSTELLATIONS = [
        { id: 'const-1', name: 'The Obsidian Constellation', description: 'Books exploring dark magic, forbidden knowledge, and the price of power.', theme: 'dark-power', books: ['book-1', 'book-8'], bookCount: 2, activeReaders: 1247, totalVotes: 3456, gradient: 'from-purple-600/30 to-violet-900/30', color: '#a855f7', icon: '🌑', status: 'active', createdAt: ts('2026-01-01') },
        { id: 'const-2', name: 'Neon Dreams', description: 'Cyberpunk and dystopian futures where technology reshapes what it means to be human.', theme: 'tech-future', books: ['book-2', 'book-7'], bookCount: 2, activeReaders: 890, totalVotes: 2134, gradient: 'from-cyan-600/30 to-blue-900/30', color: '#2dd4bf', icon: '💎', status: 'active', createdAt: ts('2026-01-01') },
        { id: 'const-3', name: 'Tidebound Tales', description: 'Stories woven from water, salt, and the mysteries of the deep.', theme: 'ocean-mystery', books: ['book-3', 'book-5'], bookCount: 2, activeReaders: 678, totalVotes: 1567, gradient: 'from-teal-600/30 to-emerald-900/30', color: '#3b82f6', icon: '🌊', status: 'active', createdAt: ts('2026-03-01') },
        { id: 'const-4', name: 'Starbound Hearts', description: 'Love stories set against the infinite backdrop of space.', theme: 'space-romance', books: ['book-4', 'book-6'], bookCount: 2, activeReaders: 534, totalVotes: 1023, gradient: 'from-rose-600/30 to-pink-900/30', color: '#ec4899', icon: '💫', status: 'active', createdAt: ts('2026-02-01') },
    ];
    for (const item of CONSTELLATIONS) {
        await safeWrite(`constellations/${item.id}`, () => setDoc(doc(db, 'constellations', item.id), item));
    }

    // ── 3. Posts (Posts.tsx) — needs status:'published', publishDate (Timestamp), slug, excerpt, authorName ──
    const POSTS = [
        { id: 'post-1', title: 'The Art of Building Magic Systems', slug: 'the-art-of-building-magic-systems', excerpt: 'Magic systems are the backbone of fantasy worldbuilding. In this post, I break down hard vs soft magic and share my approach to shadow magic in The Obsidian Crown.', content: 'Magic systems are the backbone of fantasy worldbuilding. In this post, I break down the key principles behind hard vs soft magic systems and share my approach to creating the shadow magic in The Obsidian Crown.', authorId: 'author-1', authorName: 'Elara Vance', type: 'essay', tags: ['worldbuilding', 'craft', 'magic systems'], likes: 234, comments: 45, publishDate: ts('2026-11-15'), createdAt: ts('2026-11-15'), status: 'published' },
        { id: 'post-2', title: 'Why Cyberpunk Needs More Diverse Voices', slug: 'why-cyberpunk-needs-diverse-voices', excerpt: 'The cyberpunk genre was built on rebellion, but its foundational texts rarely center the communities most affected by tech dystopia.', content: 'The cyberpunk genre was built on rebellion, but its foundational texts rarely center the communities most affected by tech dystopia. It\'s time to change that.', authorId: 'author-2', authorName: 'Jax Thorne', type: 'essay', tags: ['diversity', 'cyberpunk'], likes: 567, comments: 89, publishDate: ts('2026-10-22'), createdAt: ts('2026-10-22'), status: 'published' },
        { id: 'post-3', title: 'Chapter 1 Preview: Echoes of the Spire', slug: 'echoes-of-the-spire-preview', excerpt: 'Exclusive first look at the opening chapter. The tower remembers everything — even the things you\'ve tried to forget.', content: 'Exclusive first look at the opening chapter of my upcoming novel. The tower remembers everything.', authorId: 'author-1', authorName: 'Elara Vance', type: 'excerpt', tags: ['preview', 'dark fantasy'], likes: 456, comments: 67, publishDate: ts('2027-03-01'), createdAt: ts('2027-03-01'), status: 'published' },
        { id: 'post-4', title: 'My Writing Routine: 1,500 Words Before Coffee', slug: 'writing-routine-1500-words', excerpt: 'People always ask about my writing routine. I write before I\'m fully awake, when my inner critic is still sleeping.', content: 'People always ask about my writing routine. The truth is embarrassingly simple.', authorId: 'author-3', authorName: 'Marina Solis', type: 'personal', tags: ['writing routine', 'craft'], likes: 312, comments: 56, publishDate: ts('2026-12-01'), createdAt: ts('2026-12-01'), status: 'published' },
    ];
    for (const item of POSTS) {
        await safeWrite(`posts/${item.id}`, () => setDoc(doc(db, 'posts', item.id), item));
    }

    // ── 4. Polls (Community.tsx) ──
    const POLLS = [
        { id: 'poll-1', question: 'What genre should our next anthology focus on?', options: [{ text: 'Solarpunk', votes: 342 }, { text: 'Gothic Horror', votes: 289 }, { text: 'Afrofuturism', votes: 456 }, { text: 'Silkpunk', votes: 178 }], totalVotes: 1265, status: 'active', createdAt: ts('2027-03-01'), endsAt: ts('2027-04-01') },
        { id: 'poll-2', question: 'Favorite magic system type?', options: [{ text: 'Hard Magic (rules-based)', votes: 567 }, { text: 'Soft Magic (mysterious)', votes: 423 }, { text: 'Hybrid', votes: 312 }], totalVotes: 1302, status: 'closed', createdAt: ts('2027-01-15'), endsAt: ts('2027-02-15') },
    ];
    for (const item of POLLS) {
        await safeWrite(`polls/${item.id}`, () => setDoc(doc(db, 'polls', item.id), item));
    }

    // ── 5. Reader Circles (Community.tsx) ──
    const READER_CIRCLES = [
        { id: 'rc-1', name: 'The Shadow Council', description: 'For fans of dark fantasy, morally grey characters, and intricate magic systems.', genre: 'Dark Fantasy', memberCount: 342, members: [], activeDiscussions: 12, currentBook: 'The Obsidian Crown', avatar: '🌑', status: 'active', createdAt: ts('2026-02-01') },
        { id: 'rc-2', name: 'Neon Collective', description: 'Cyberpunk, dystopian futures, and the intersection of tech and humanity.', genre: 'Cyberpunk', memberCount: 198, members: [], activeDiscussions: 8, currentBook: 'Neon Requiem', avatar: '💎', status: 'active', createdAt: ts('2026-03-15') },
        { id: 'rc-3', name: 'Tidebound Readers', description: 'Ocean stories, magical realism, and lyrical prose lovers unite.', genre: 'Magical Realism', memberCount: 156, members: [], activeDiscussions: 6, currentBook: 'Whispers of the Deep', avatar: '🌊', status: 'active', createdAt: ts('2026-04-01') },
    ];
    for (const item of READER_CIRCLES) {
        await safeWrite(`readerCircles/${item.id}`, () => setDoc(doc(db, 'readerCircles', item.id), item));
    }

    // ── 6. Q&A Sessions (Community.tsx) ──
    const QA_SESSIONS = [
        { id: 'qa-1', title: 'Ask Elara Vance Anything: Worldbuilding', author: 'Elara Vance', authorAvatar: 'https://picsum.photos/seed/elara/100/100', topic: 'Worldbuilding & Magic Systems', questionCount: 24, status: 'completed', scheduledAt: ts('2027-02-15T19:00:00'), createdAt: ts('2027-02-01') },
        { id: 'qa-2', title: 'Live Q&A: Writing Queer Sci-Fi', author: 'Leo Vance', authorAvatar: 'https://picsum.photos/seed/leo/100/100', topic: 'Queer Representation in SFF', questionCount: 18, status: 'upcoming', scheduledAt: ts('2027-04-20T19:00:00'), createdAt: ts('2027-03-15') },
    ];
    for (const item of QA_SESSIONS) {
        await safeWrite(`qaSessions/${item.id}`, () => setDoc(doc(db, 'qaSessions', item.id), item));
    }

    // ── 7. AMAs (AuthorConnect.tsx) ──
    const AMAS = [
        { id: 'ama-1', title: 'I wrote a dark fantasy trilogy in 18 months — AMA!', authorName: 'Elara Vance', authorImage: 'https://picsum.photos/seed/elara/100/100', authorBio: 'Speculative fiction author of The Obsidian Crown and Echoes of the Spire.', description: 'Elara Vance discusses her creative process, the magic of The Obsidian Crown, and what it\'s like to write in the speculative fiction space.', status: 'archived', questionCount: 34, scheduledAt: ts('2027-01-20T18:00:00'), createdAt: ts('2027-01-10') },
        { id: 'ama-2', title: 'From software engineering to sci-fi author — AMA', authorName: 'Jax Thorne', authorImage: 'https://picsum.photos/seed/jax/100/100', authorBio: 'Cyberpunk novelist and former software engineer. Author of Neon Requiem and Silicon Souls.', description: 'Jax Thorne talks about the transition from tech industry to writing dystopian fiction.', status: 'upcoming', questionCount: 0, scheduledAt: ts('2027-04-25T18:00:00'), createdAt: ts('2027-04-01') },
        { id: 'ama-3', title: 'Writing the ocean — how place becomes character', authorName: 'Marina Solis', authorImage: 'https://picsum.photos/seed/marina/100/100', authorBio: 'Magical realism author. Whispers of the Deep, The Saltwater Archives.', description: 'Marina Solis discusses how her coastal upbringing shapes every page she writes, and the blurred line between memory and magic.', status: 'upcoming', questionCount: 8, scheduledAt: ts('2027-05-10T19:00:00'), createdAt: ts('2027-04-15') },
    ];
    for (const item of AMAS) {
        await safeWrite(`amas/${item.id}`, () => setDoc(doc(db, 'amas', item.id), item));
    }

    // ── 8. Office Hours (AuthorConnect.tsx) ──
    const OFFICE_HOURS = [
        { id: 'oh-1', authorName: 'Marina Solis', authorImage: 'https://picsum.photos/seed/marina/100/100', date: ts('2027-04-18T15:00:00'), duration: 60, topic: 'Craft Office Hours: Dialogue Writing', spotsTotal: 15, spotsTaken: 12, tier: 'architect' as const, bookedBy: [], createdAt: ts('2027-04-01') },
        { id: 'oh-2', authorName: 'Elara Vance', authorImage: 'https://picsum.photos/seed/elara/100/100', date: ts('2027-03-15T16:00:00'), duration: 90, topic: 'Query Letter Workshop', spotsTotal: 10, spotsTaken: 10, tier: 'architect' as const, bookedBy: [], createdAt: ts('2027-03-01') },
        { id: 'oh-3', authorName: 'Leo Vance', authorImage: 'https://picsum.photos/seed/leo/100/100', date: ts('2027-05-02T14:00:00'), duration: 45, topic: 'Writing Queer Joy in Sci-Fi', spotsTotal: 12, spotsTaken: 5, tier: 'architect' as const, bookedBy: [], createdAt: ts('2027-04-10') },
    ];
    for (const item of OFFICE_HOURS) {
        await safeWrite(`officeHours/${item.id}`, () => setDoc(doc(db, 'officeHours', item.id), item));
    }

    // ── 9. Writing Journals (AuthorConnect.tsx) ──
    const WRITING_JOURNALS = [
        { id: 'wj-1', title: 'The Tower That Keeps Growing', content: 'Day 47 of writing Echoes of the Spire. The tower now has 200 floors and I only planned 50. The metaphor got away from me. I started this book with a simple premise: a woman builds a tower to escape her past. But the tower has become a living thing now — each floor reflecting a different era, a different wound, a different version of her. I sit at my desk some mornings and the tower tells me what it wants. Today it wanted a library full of books that haven\'t been written yet.', excerpt: 'Day 47 of writing Echoes of the Spire. The tower now has 200 floors and I only planned 50...', authorName: 'Elara Vance', authorImage: 'https://picsum.photos/seed/elara/100/100', publishedAt: ts('2027-03-20'), tags: ['writing process', 'worldbuilding', 'Echoes of the Spire'], likes: 89, bookTitle: 'Echoes of the Spire', createdAt: ts('2027-03-20') },
        { id: 'wj-2', title: 'When Characters Refuse to Cooperate', content: 'Wrote a pivotal scene today where two characters were supposed to fight but instead had tea and talked about their mothers. Sometimes the story knows better than the outline. I\'ve learned to follow those instincts — the best scenes in Whispers of the Deep came from moments I didn\'t plan. The ocean taught me that: you can\'t force the tide.', excerpt: 'Wrote a pivotal scene today where two characters were supposed to fight but instead had tea...', authorName: 'Marina Solis', authorImage: 'https://picsum.photos/seed/marina/100/100', publishedAt: ts('2027-03-18'), tags: ['characters', 'craft', 'discovery writing'], likes: 134, bookTitle: 'The Saltwater Archives', createdAt: ts('2027-03-18') },
        { id: 'wj-3', title: 'The Code Behind the Story', content: 'People ask me how my software engineering background influences my writing. The truth is: debugging code and debugging plot are the same skill. You trace the logic, find where it breaks, and fix it. Neon Requiem went through 14 drafts. Each one was a debug cycle. By Silicon Souls I had it down to 8.', excerpt: 'People ask me how my software engineering background influences my writing...', authorName: 'Jax Thorne', authorImage: 'https://picsum.photos/seed/jax/100/100', publishedAt: ts('2027-03-15'), tags: ['tech', 'craft', 'revision'], likes: 76, bookTitle: 'Silicon Souls', createdAt: ts('2027-03-15') },
    ];
    for (const item of WRITING_JOURNALS) {
        await safeWrite(`writingJournals/${item.id}`, () => setDoc(doc(db, 'writingJournals', item.id), item));
    }

    // ── 10. Forge Projects (Forge.tsx) — needs type:'anthology_vote'|'cover_reveal'|'story_poll', options[], totalVotes, deadline, status:'active'|'closed' ──
    const FORGE_PROJECTS = [
        { id: 'fp-1', title: 'Vote: Next Anthology Theme', type: 'anthology_vote', description: 'Help us choose the theme for our 2027 summer anthology. Your vote shapes what stories get told.', options: [{ id: 'opt-1a', label: 'Solarpunk Futures', votes: 342, description: 'Optimistic visions of sustainable civilization' }, { id: 'opt-1b', label: 'Gothic Horror Revival', votes: 289, description: 'Dark tales inspired by classic gothic literature' }, { id: 'opt-1c', label: 'Afrofuturism', votes: 456, description: 'Black futures, ancient pasts, and cosmic identity' }], totalVotes: 1087, deadline: ts('2027-06-01'), status: 'active', createdAt: ts('2027-03-15') },
        { id: 'fp-2', title: 'Echoes of the Spire: Cover Reveal', type: 'cover_reveal', description: 'Three stunning cover concepts for Elara Vance\'s upcoming novel. Which one captures the story best?', options: [{ id: 'opt-2a', label: 'The Infinite Staircase', imageUrl: 'https://picsum.photos/seed/cover-a/400/600', votes: 534, description: 'Spiraling tower dissolving into stars' }, { id: 'opt-2b', label: 'The Architect\'s Eye', imageUrl: 'https://picsum.photos/seed/cover-b/400/600', votes: 623, description: 'Close-up eye reflecting a fractal tower' }, { id: 'opt-2c', label: 'Root and Tower', imageUrl: 'https://picsum.photos/seed/cover-c/400/600', votes: 412, description: 'Tower growing from tree roots against a sunset' }], totalVotes: 1569, deadline: ts('2027-05-01'), status: 'active', bookId: 'book-8', createdAt: ts('2027-02-01') },
        { id: 'fp-3', title: 'What Should Jax Write Next?', type: 'story_poll', description: 'Jax Thorne is planning their next project. Tell them which direction to take.', options: [{ id: 'opt-3a', label: 'Silicon Souls sequel', votes: 445, description: 'Continue the Neon Requiem universe' }, { id: 'opt-3b', label: 'Standalone horror novel', votes: 312, description: 'Something completely new and terrifying' }], totalVotes: 757, deadline: ts('2027-04-15'), status: 'active', createdAt: ts('2027-03-01') },
    ];
    for (const item of FORGE_PROJECTS) {
        await safeWrite(`forgeProjects/${item.id}`, () => setDoc(doc(db, 'forgeProjects', item.id), item));
    }

    // ── 11. Fanfiction (Forge.tsx) — needs authorName, authorId, bookTitle, bookId, excerpt, content, wordCount, likes, tags[], status:'published' ──
    const FANFICTION = [
        { id: 'ff-1', title: 'The Shadow Between Stars', authorName: 'midnight_ink', authorId: 'user-1', bookTitle: 'The Obsidian Crown', bookId: 'book-1', excerpt: 'What if the scholar had chosen the crown? In this alternate ending, we explore the path of shadow...', content: 'The crown pulsed in her hands, warm as a living thing. She had always known this moment would come — the choice between light and power. But what the prophecies never mentioned was how seductive the dark could be...\n\nShe placed it on her head.\n\nThe world shattered into obsidian shards, each one reflecting a different version of herself. In one, she was a queen. In another, a monster. In the last, the faintest glimmer of who she used to be before the crown consumed everything.', wordCount: 12400, likes: 89, status: 'published', tags: ['AU', 'What If', 'Character Study'], createdAt: ts('2027-02-15') },
        { id: 'ff-2', title: 'Neon Lullabies', authorName: 'prose_hunter', authorId: 'user-2', bookTitle: 'Neon Requiem', bookId: 'book-2', excerpt: 'A prequel story set 20 years before the events of Neon Requiem, when the memory market was just beginning...', content: 'Before the towers scraped the polluted sky, before memory became the most valuable commodity in the megacity, there was a woman who remembered everything.\n\nHer name was Song, and she was the first archivist. Not by choice — by accident. A neural implant meant to treat her epilepsy instead unlocked perfect recall...', wordCount: 8900, likes: 56, status: 'published', tags: ['Prequel', 'Worldbuilding', 'OC'], createdAt: ts('2027-01-20') },
    ];
    for (const item of FANFICTION) {
        await safeWrite(`fanfiction/${item.id}`, () => setDoc(doc(db, 'fanfiction', item.id), item));
    }

    // ── 12. Reviews (Community.tsx, BookDetail.tsx) ──
    const REVIEWS = [
        { id: 'rev-1', bookId: 'book-1', bookTitle: 'The Obsidian Crown', userId: 'user-1', username: 'midnight_ink', avatar: '🖋️', rating: 5, content: 'Absolutely devastating. The magic system is the most creative I\'ve seen in years, and the prose made me physically stop reading to recover. Masterpiece.', likes: 134, spoiler: false, createdAt: ts('2026-08-15') },
        { id: 'rev-2', bookId: 'book-2', bookTitle: 'Neon Requiem', userId: 'user-2', username: 'theory_crafter', avatar: '🧠', rating: 4, content: 'Incredible worldbuilding and a gripping plot. The memory market is such a clever concept. Only docked a star because the ending felt slightly rushed.', likes: 89, spoiler: false, createdAt: ts('2026-05-20') },
        { id: 'rev-3', bookId: 'book-3', bookTitle: 'Whispers of the Deep', userId: 'user-3', username: 'prose_hunter', avatar: '🔍', rating: 5, content: 'Marina Solis writes the ocean like a living character. I could taste the salt. This is magical realism at its finest.', likes: 201, spoiler: false, createdAt: ts('2026-11-10') },
        { id: 'rev-4', bookId: 'book-4', bookTitle: 'Star-Crossed Circuits', userId: 'user-4', username: 'star_reader_42', avatar: '🌟', rating: 5, content: 'The rivals-to-lovers arc had me screaming into a pillow at 2am. Leo Vance writes queer joy like nobody else in the genre.', likes: 167, spoiler: false, createdAt: ts('2026-03-10') },
    ];
    for (const item of REVIEWS) {
        await safeWrite(`reviews/${item.id}`, () => setDoc(doc(db, 'reviews', item.id), item));
    }

    // ── 13. Spoiler Books (SpoilerShield.tsx) — book context + chapter list ──
    const SPOILER_BOOKS = [
        {
            id: 'sb-1', bookId: 'book-1', title: 'The Obsidian Crown', author: 'Elara Vance', totalChapters: 24, cover: '/covers/obsidian-crown.png',
            chapters: [
                { num: 1, title: 'The Dust of Ages', discussions: 3 },
                { num: 2, title: 'The Scholar\'s Burden', discussions: 1 },
                { num: 3, title: 'First Touch of Shadow', discussions: 4 },
                { num: 4, title: 'The Dinner at Thornhall', discussions: 2 },
                { num: 5, title: 'The Marrow Gate', discussions: 5 },
                { num: 6, title: 'Whispers in the Dark', discussions: 2 },
                { num: 7, title: 'The Cartographer\'s Map', discussions: 1 },
                { num: 8, title: 'Battle of the Veil', discussions: 3 },
                { num: 9, title: 'Bonds of Fire', discussions: 4 },
                { num: 10, title: 'The Mirror Room', discussions: 6 },
                { num: 11, title: 'An Uneasy Alliance', discussions: 2 },
                { num: 12, title: 'The Betrayal', discussions: 8 },
                { num: 13, title: 'Descent into the Hollow', discussions: 3 },
                { num: 14, title: 'The Crown Speaks', discussions: 5 },
                { num: 15, title: 'Roots of the Obsidian Tree', discussions: 2 },
                { num: 16, title: 'The Second Gift', discussions: 1 },
                { num: 17, title: 'A Kingdom in Ash', discussions: 4 },
                { num: 18, title: 'The Forge Below', discussions: 3 },
                { num: 19, title: 'Memory of the First Queen', discussions: 2 },
                { num: 20, title: 'Blood and Starlight', discussions: 6 },
                { num: 21, title: 'The Choice', discussions: 9 },
                { num: 22, title: 'What the Crown Takes', discussions: 7 },
                { num: 23, title: 'The Wound That Sings', discussions: 4 },
                { num: 24, title: 'Coronation', discussions: 12 },
            ],
            createdAt: ts('2027-01-01'),
        },
    ];
    for (const item of SPOILER_BOOKS) {
        await safeWrite(`spoiler_books/${item.id}`, () => setDoc(doc(db, 'spoiler_books', item.id), item));
    }

    // ── 14. Spoiler Discussions (SpoilerShield.tsx) ──
    const SPOILER_DISCUSSIONS = [
        { id: 'sd-1', chapterNum: 3, author: 'midnight_ink', avatar: '🖋️', text: 'The moment when she first touches the crown and sees the shadow realm — did anyone else feel like the entire tone of the book shifted here? It went from political intrigue to full cosmic horror.', timestamp: '2 days ago', likes: 45, spoilerLevel: 'safe', tags: ['tone shift', 'worldbuilding'], replies: [{ id: 'r1', author: 'prose_hunter', avatar: '🔍', text: 'YES. The prose literally changes register. The sentences get shorter, more fragmented. Brilliant craft choice.', timestamp: '1 day ago', likes: 12 }, { id: 'r2', author: 'theory_crafter', avatar: '🧠', text: 'I noticed the same thing! The color descriptions shift from warm to cold tones too.', timestamp: '23 hours ago', likes: 8 }] },
        { id: 'sd-2', chapterNum: 5, author: 'theory_crafter', avatar: '🧠', text: 'The Marrow Gate chapter is doing so much work. Every line of the gatekeeper\'s dialogue is a riddle that maps to the magic system. I\'ve reread it three times and keep finding new layers.', timestamp: '5 days ago', likes: 34, spoilerLevel: 'mild', tags: ['analysis', 'magic system', 'close reading'], replies: [{ id: 'r3', author: 'star_reader_42', avatar: '🌟', text: 'Wait, I missed this entirely on my first read. Going back NOW.', timestamp: '4 days ago', likes: 5 }] },
        { id: 'sd-3', chapterNum: 1, author: 'star_reader_42', avatar: '🌟', text: 'The opening line — "Magic is not a gift. It is a wound the universe has learned to sing through." — is doing SO much heavy lifting for this entire book. It establishes tone, theme, AND foreshadowing in a single sentence.', timestamp: '1 week ago', likes: 89, spoilerLevel: 'safe', tags: ['prose', 'opening lines', 'craft'], replies: [] },
        { id: 'sd-4', chapterNum: 8, author: 'prose_hunter', avatar: '🔍', text: 'Chapter 8\'s battle sequence is breathtaking on a prose level, but I felt the flashback interruptions broke the momentum. Anyone else feel the pacing dipped here?', timestamp: '3 days ago', likes: 23, spoilerLevel: 'mild', tags: ['pacing', 'battle', 'craft'], replies: [{ id: 'r4', author: 'midnight_ink', avatar: '🖋️', text: 'I actually loved the flashbacks — they gave the violence emotional weight. But I get why some people found it jarring.', timestamp: '2 days ago', likes: 15 }] },
        { id: 'sd-5', chapterNum: 12, author: 'midnight_ink', avatar: '🖋️', text: 'The betrayal in Chapter 12... I literally put the book down and walked around my apartment for ten minutes. The foreshadowing was there the whole time and I STILL didn\'t see it coming.', timestamp: '6 days ago', likes: 67, spoilerLevel: 'heavy', tags: ['plot twist', 'betrayal', 'emotional'], replies: [{ id: 'r5', author: 'theory_crafter', avatar: '🧠', text: 'Go back and reread the dinner scene in Chapter 4. EVERY SINGLE WORD of dialogue takes on a new meaning.', timestamp: '5 days ago', likes: 31 }] },
    ];
    for (const item of SPOILER_DISCUSSIONS) {
        await safeWrite(`spoiler_discussions/${item.id}`, () => setDoc(doc(db, 'spoiler_discussions', item.id), item));
    }

    // ── 14. Bookshelf Entries (Community.tsx — bookshelfEntries for reading activity) ──
    const BOOKSHELF_ENTRIES = [
        { id: 'bse-1', userId: 'demo', bookId: 'book-1', bookTitle: 'The Obsidian Crown', bookCover: 'https://picsum.photos/seed/obsidian-cover/400/600', author: 'Elara Vance', status: 'completed', rating: 5, progress: 100, startDate: ts('2026-07-01'), finishDate: ts('2026-07-20'), createdAt: ts('2026-07-01') },
        { id: 'bse-2', userId: 'demo', bookId: 'book-3', bookTitle: 'Whispers of the Deep', bookCover: 'https://picsum.photos/seed/whispers-cover/400/600', author: 'Marina Solis', status: 'reading', rating: null, progress: 62, startDate: ts('2027-03-10'), finishDate: null, createdAt: ts('2027-03-10') },
        { id: 'bse-3', userId: 'demo', bookId: 'book-4', bookTitle: 'Star-Crossed Circuits', bookCover: 'https://picsum.photos/seed/circuits-cover/400/600', author: 'Leo Vance', status: 'completed', rating: 5, progress: 100, startDate: ts('2026-01-25'), finishDate: ts('2026-02-10'), createdAt: ts('2026-01-25') },
    ];
    for (const item of BOOKSHELF_ENTRIES) {
        await safeWrite(`bookshelfEntries/${item.id}`, () => setDoc(doc(db, 'bookshelfEntries', item.id), item));
    }

    // ── 15. Book Club Guides (Community.tsx) ──
    const BOOK_CLUB_GUIDES = [
        { id: 'bcg-1', bookId: 'book-1', bookTitle: 'The Obsidian Crown', author: 'Elara Vance', questions: ['What does the obsidian crown symbolize beyond its literal power?', 'How does the magic system reflect real-world power dynamics?', 'Which character\'s moral journey resonated most with you?', 'Would you have made the same choice as the protagonist in the final chapter?'], themes: ['power and corruption', 'sacrifice', 'identity'], pairingReads: ['The Poppy War by R.F. Kuang', 'Gideon the Ninth by Tamsyn Muir'], createdAt: ts('2026-08-01') },
        { id: 'bcg-2', bookId: 'book-3', bookTitle: 'Whispers of the Deep', author: 'Marina Solis', questions: ['How does the ocean function as a character in the novel?', 'What role does the grandmother\'s silence play in the family dynamic?', 'How does magical realism enhance the emotional truth of the story?'], themes: ['family secrets', 'nature and spirituality', 'grief and healing'], pairingReads: ['The House of the Spirits by Isabel Allende', 'The Particular Sadness of Lemon Cake by Aimee Bender'], createdAt: ts('2026-10-01') },
    ];
    for (const item of BOOK_CLUB_GUIDES) {
        await safeWrite(`bookClubGuides/${item.id}`, () => setDoc(doc(db, 'bookClubGuides', item.id), item));
    }

    // ── 16. Author Profiles (admin: authorProfiles used by admin) ──
    const AUTHOR_PROFILES = [
        { id: 'author-1', slug: 'elara-vance', name: 'Elara Vance', penName: 'Elara Vance', realName: 'Elara Vance', email: 'elara@runaatlas.press', avatar: 'https://picsum.photos/seed/elara/400/400', coverImage: 'https://picsum.photos/seed/elara-cover/1200/400', bio: 'Elara Vance is a speculative fiction author whose work explores the intersection of magic and architecture. Her debut novel, The Obsidian Crown, was nominated for the Nebula Award.', genres: ['Dark Fantasy', 'Gothic', 'Epic Fantasy'], books: ['The Obsidian Crown', 'Echoes of the Spire'], social: { website: 'https://elaravance.com', twitter: '@elaravance', instagram: '@elaravance' }, website: 'https://elaravance.com', twitter: '@elaravance', stats: { followers: 12400, totalReaders: 45000, avgRating: 4.8 }, status: 'active', createdAt: ts('2026-01-01') },
        { id: 'author-2', slug: 'jax-thorne', name: 'Jax Thorne', penName: 'Jax Thorne', realName: 'Jax Thorne', email: 'jax@runaatlas.press', avatar: 'https://picsum.photos/seed/jax/400/400', coverImage: 'https://picsum.photos/seed/jax-cover/1200/400', bio: 'Jax Thorne writes dystopian thrillers that ask hard questions about technology and consciousness. A former software engineer, they bring technical authenticity to their speculative worlds.', genres: ['Cyberpunk', 'Dystopian', 'Thriller'], books: ['Neon Requiem', 'Silicon Souls'], social: { twitter: '@jaxthorne' }, twitter: '@jaxthorne', stats: { followers: 8900, totalReaders: 32000, avgRating: 4.5 }, status: 'active', createdAt: ts('2026-01-01') },
        { id: 'author-3', slug: 'marina-solis', name: 'Marina Solis', penName: 'Marina Solis', realName: 'Marina Solis', email: 'marina@runaatlas.press', avatar: 'https://picsum.photos/seed/marina/400/400', coverImage: 'https://picsum.photos/seed/marina-cover/1200/400', bio: 'Marina Solis weaves literary fiction with magical realism, drawing heavily from her coastal upbringing. Her novel Whispers of the Deep was named one of the best books of 2026.', genres: ['Magical Realism', 'Literary Fiction'], books: ['Whispers of the Deep', 'The Saltwater Archives'], social: { instagram: '@marinasolis.writes' }, stats: { followers: 15600, totalReaders: 52000, avgRating: 4.9 }, status: 'active', createdAt: ts('2026-01-01') },
        { id: 'author-4', slug: 'leo-vance', name: 'Leo Vance', penName: 'Leo Vance', realName: 'Leo Vance', email: 'leo@runaatlas.press', avatar: 'https://picsum.photos/seed/leo/400/400', coverImage: 'https://picsum.photos/seed/leo-cover/1200/400', bio: 'Leo Vance is known for his character-driven queer romances set against sweeping sci-fi backdrops.', genres: ['Sci-Fi Romance', 'Space Opera', 'Queer Fiction'], books: ['Star-Crossed Circuits', 'Orbiting You'], social: { twitter: '@leovancewrites', instagram: '@leovance' }, twitter: '@leovancewrites', stats: { followers: 7200, totalReaders: 24000, avgRating: 4.6 }, status: 'active', createdAt: ts('2026-01-01') },
    ];
    for (const item of AUTHOR_PROFILES) {
        await safeWrite(`authorProfiles/${item.id}`, () => setDoc(doc(db, 'authorProfiles', item.id), item));
    }

    // ── 17. Manuscripts (ManuscriptPipeline.tsx) ──
    const MANUSCRIPTS = [
        {
            id: 'ms-1', title: 'Wrath & Reverie', author: 'Elara Vance', authorId: 'author-1', genre: 'Dark Fantasy',
            wordCount: '94,000', currentStage: 'revision' as const, stageProgress: 65,
            assignedEditor: 'Mx. Reyes', betaReaders: 4,
            submittedDate: 'Aug 2026', targetPubDate: 'Dec 2027',
            lastActivity: '2 days ago', cover: 'https://picsum.photos/seed/wrath-ms/120/170',
            deadline: '2027-05-15',
            flags: ['Priority', 'Sequel'],
            stageHistory: [
                { stage: 'submission' as const, entered: 'Aug 1, 2026', completed: 'Aug 12, 2026' },
                { stage: 'editorial_review' as const, entered: 'Aug 12, 2026', completed: 'Oct 5, 2026' },
                { stage: 'beta_reading' as const, entered: 'Oct 5, 2026', completed: 'Jan 15, 2027' },
                { stage: 'revision' as const, entered: 'Jan 15, 2027' },
            ],
            createdAt: ts('2026-08-01'),
        },
        {
            id: 'ms-2', title: 'The Hollow Garden', author: 'Sera Nighthollow', authorId: 'author-5', genre: 'Magical Realism',
            wordCount: '67,000', currentStage: 'editorial_review' as const, stageProgress: 40,
            assignedEditor: 'Mx. Reyes', betaReaders: 0,
            submittedDate: 'Jan 2027', targetPubDate: 'Sep 2027',
            lastActivity: '5 days ago', cover: 'https://picsum.photos/seed/hollow-ms/120/170',
            deadline: '2027-04-30',
            flags: ['New Author'],
            stageHistory: [
                { stage: 'submission' as const, entered: 'Jan 5, 2027', completed: 'Jan 18, 2027' },
                { stage: 'editorial_review' as const, entered: 'Jan 18, 2027' },
            ],
            createdAt: ts('2027-01-05'),
        },
        {
            id: 'ms-3', title: 'Signal to Noise', author: 'Kael Thornwood', authorId: 'author-6', genre: 'Sci-Fi',
            wordCount: '82,000', currentStage: 'copyedit' as const, stageProgress: 72,
            assignedEditor: 'Jordan Calloway', betaReaders: 6,
            submittedDate: 'Aug 2026', targetPubDate: 'Jun 2027',
            lastActivity: 'Yesterday', cover: 'https://picsum.photos/seed/signal-ms/120/170',
            deadline: '2027-02-28',
            flags: ['Urgent', 'Overdue'],
            stageHistory: [
                { stage: 'submission' as const, entered: 'Aug 22, 2026', completed: 'Sep 5, 2026' },
                { stage: 'editorial_review' as const, entered: 'Sep 5, 2026', completed: 'Oct 20, 2026' },
                { stage: 'beta_reading' as const, entered: 'Oct 20, 2026', completed: 'Dec 10, 2026' },
                { stage: 'revision' as const, entered: 'Dec 10, 2026', completed: 'Feb 22, 2027' },
                { stage: 'copyedit' as const, entered: 'Feb 22, 2027' },
            ],
            createdAt: ts('2026-08-22'),
        },
        {
            id: 'ms-4', title: 'Tidewalker', author: 'Marina Solis', authorId: 'author-3', genre: 'Literary Fiction',
            wordCount: '58,000', currentStage: 'submission' as const, stageProgress: 15,
            assignedEditor: '', betaReaders: 0,
            submittedDate: 'Mar 2027', targetPubDate: 'TBD',
            lastActivity: 'Today', cover: 'https://picsum.photos/seed/tidewalker-ms/120/170',
            deadline: '2027-06-01',
            flags: ['New'],
            stageHistory: [
                { stage: 'submission' as const, entered: 'Mar 8, 2027' },
            ],
            createdAt: ts('2027-03-08'),
        },
        {
            id: 'ms-5', title: 'Chrome Lullaby', author: 'Jax Thorne', authorId: 'author-2', genre: 'Cyberpunk',
            wordCount: '91,000', currentStage: 'beta_reading' as const, stageProgress: 55,
            assignedEditor: 'Mx. Reyes', betaReaders: 8,
            submittedDate: 'Nov 2026', targetPubDate: 'Aug 2027',
            lastActivity: '1 day ago', cover: 'https://picsum.photos/seed/chrome-ms/120/170',
            deadline: '2027-04-15',
            flags: ['Prequel'],
            stageHistory: [
                { stage: 'submission' as const, entered: 'Nov 1, 2026', completed: 'Nov 14, 2026' },
                { stage: 'editorial_review' as const, entered: 'Nov 14, 2026', completed: 'Jan 8, 2027' },
                { stage: 'beta_reading' as const, entered: 'Jan 8, 2027' },
            ],
            createdAt: ts('2026-11-01'),
        },
        {
            id: 'ms-6', title: 'Gravity\'s Choir', author: 'Leo Vance', authorId: 'author-4', genre: 'Sci-Fi Romance',
            wordCount: '76,000', currentStage: 'proof' as const, stageProgress: 88,
            assignedEditor: 'Jordan Calloway', betaReaders: 5,
            submittedDate: 'Jun 2026', targetPubDate: 'Apr 2027',
            lastActivity: '3 days ago', cover: 'https://picsum.photos/seed/gravity-ms/120/170',
            deadline: '2027-03-01',
            flags: [],
            stageHistory: [
                { stage: 'submission' as const, entered: 'Jun 15, 2026', completed: 'Jun 28, 2026' },
                { stage: 'editorial_review' as const, entered: 'Jun 28, 2026', completed: 'Aug 15, 2026' },
                { stage: 'beta_reading' as const, entered: 'Aug 15, 2026', completed: 'Oct 1, 2026' },
                { stage: 'revision' as const, entered: 'Oct 1, 2026', completed: 'Dec 20, 2026' },
                { stage: 'copyedit' as const, entered: 'Dec 20, 2026', completed: 'Feb 10, 2027' },
                { stage: 'proof' as const, entered: 'Feb 10, 2027' },
            ],
            createdAt: ts('2026-06-15'),
        },
        {
            id: 'ms-7', title: 'The Veil Eaters', author: 'Elara Vance', authorId: 'author-1', genre: 'Dark Fantasy',
            wordCount: '112,000', currentStage: 'production' as const, stageProgress: 45,
            assignedEditor: 'Mx. Reyes', betaReaders: 7,
            submittedDate: 'Mar 2026', targetPubDate: 'May 2027',
            lastActivity: '1 week ago', cover: 'https://picsum.photos/seed/veil-ms/120/170',
            deadline: '2027-05-01',
            flags: ['Trilogy Bk 2'],
            stageHistory: [
                { stage: 'submission' as const, entered: 'Mar 1, 2026', completed: 'Mar 15, 2026' },
                { stage: 'editorial_review' as const, entered: 'Mar 15, 2026', completed: 'May 20, 2026' },
                { stage: 'beta_reading' as const, entered: 'May 20, 2026', completed: 'Jul 30, 2026' },
                { stage: 'revision' as const, entered: 'Jul 30, 2026', completed: 'Oct 15, 2026' },
                { stage: 'copyedit' as const, entered: 'Oct 15, 2026', completed: 'Dec 8, 2026' },
                { stage: 'proof' as const, entered: 'Dec 8, 2026', completed: 'Jan 25, 2027' },
                { stage: 'production' as const, entered: 'Jan 25, 2027' },
            ],
            createdAt: ts('2026-03-01'),
        },
        {
            id: 'ms-8', title: 'Echoes of the Spire', author: 'Elara Vance', authorId: 'author-1', genre: 'Dark Fantasy',
            wordCount: '98,000', currentStage: 'published' as const, stageProgress: 100,
            assignedEditor: 'Mx. Reyes', betaReaders: 9,
            submittedDate: 'Jan 2026', targetPubDate: 'Sep 2027',
            lastActivity: 'Published', cover: '/covers/echoes-of-the-spire.png',
            flags: ['Bestseller'],
            stageHistory: [
                { stage: 'submission' as const, entered: 'Jan 10, 2026', completed: 'Jan 22, 2026' },
                { stage: 'editorial_review' as const, entered: 'Jan 22, 2026', completed: 'Apr 1, 2026' },
                { stage: 'beta_reading' as const, entered: 'Apr 1, 2026', completed: 'Jun 15, 2026' },
                { stage: 'revision' as const, entered: 'Jun 15, 2026', completed: 'Sep 1, 2026' },
                { stage: 'copyedit' as const, entered: 'Sep 1, 2026', completed: 'Nov 10, 2026' },
                { stage: 'proof' as const, entered: 'Nov 10, 2026', completed: 'Dec 20, 2026' },
                { stage: 'production' as const, entered: 'Dec 20, 2026', completed: 'Feb 15, 2027' },
                { stage: 'published' as const, entered: 'Feb 15, 2027' },
            ],
            createdAt: ts('2026-01-10'),
        },
    ];
    for (const item of MANUSCRIPTS) {
        await safeWrite(`manuscripts/${item.id}`, () => setDoc(doc(db, 'manuscripts', item.id), item));
    }

    // ── 18. Worldbuilding (Forge.tsx) ──
    const WORLDBUILDING = [
        { id: 'wb-1', title: 'The Broken Isles', type: 'World', genre: 'Fantasy', authorId: 'demo', description: 'A scattered archipelago where each island has its own magical ecosystem.', elements: { magic: 'Tidal magic drawn from the phases of dual moons', races: 'Islanders, Deep Ones, Sky Nomads', geography: 'Volcanic archipelago with floating islands', politics: 'Council of Tides — representatives from each major island' }, status: 'active', createdAt: ts('2027-02-01') },
        { id: 'wb-2', title: 'Neo-Shanghai 2184', type: 'World', genre: 'Cyberpunk', authorId: 'demo', description: 'A vertical megacity where altitude determines social class.', elements: { tech: 'Neural links, memory markets, holographic architecture', society: 'Stratified by elevation — surface dwellers vs sky citizens', economy: 'Memory-based cryptocurrency', conflict: 'Underground resistance vs corporate sky council' }, status: 'active', createdAt: ts('2027-01-15') },
    ];
    for (const item of WORLDBUILDING) {
        await safeWrite(`worldbuilding/${item.id}`, () => setDoc(doc(db, 'worldbuilding', item.id), item));
    }

    // ── 19. Mood Axes (MoodMatcher admin) ──
    const MOOD_AXES = [
        { id: 'axis-1', label: 'Tone', leftLabel: 'Light & Hopeful', rightLabel: 'Dark & Gritty', order: 0 },
        { id: 'axis-2', label: 'Pacing', leftLabel: 'Slow Burn', rightLabel: 'Breakneck', order: 1 },
        { id: 'axis-3', label: 'Romance', leftLabel: 'None', rightLabel: 'Central', order: 2 },
        { id: 'axis-4', label: 'Worldbuilding', leftLabel: 'Minimal', rightLabel: 'Immersive', order: 3 },
        { id: 'axis-5', label: 'Prose Style', leftLabel: 'Accessible', rightLabel: 'Lyrical', order: 4 },
    ];
    for (const item of MOOD_AXES) {
        await safeWrite(`mood_axes/${item.id}`, () => setDoc(doc(db, 'mood_axes', item.id), item));
    }

    // ── 20. Mood Presets (MoodMatcher admin) ──
    const MOOD_PRESETS = [
        { id: 'preset-1', name: 'Cozy & Light', values: { 'axis-1': 20, 'axis-2': 25, 'axis-3': 60, 'axis-4': 40, 'axis-5': 30 }, icon: '☕', order: 0 },
        { id: 'preset-2', name: 'Dark & Intense', values: { 'axis-1': 85, 'axis-2': 70, 'axis-3': 20, 'axis-4': 80, 'axis-5': 65 }, icon: '🌑', order: 1 },
        { id: 'preset-3', name: 'Epic Adventure', values: { 'axis-1': 50, 'axis-2': 80, 'axis-3': 30, 'axis-4': 90, 'axis-5': 50 }, icon: '⚔️', order: 2 },
    ];
    for (const item of MOOD_PRESETS) {
        await safeWrite(`mood_presets/${item.id}`, () => setDoc(doc(db, 'mood_presets', item.id), item));
    }

    // ── 21. Book Launches (BookLaunchPlanner.tsx) ──
    const BOOK_LAUNCHES = [
        { id: 'bl-1', bookId: 'book-8', title: 'Echoes of the Spire', authorId: 'author-1', authorName: 'Elara Vance', launchDate: ts('2027-09-15'), status: 'planning', tasks: [{ id: 't1', task: 'Cover reveal coordination', done: true }, { id: 't2', task: 'ARC distribution', done: true }, { id: 't3', task: 'Blog tour setup', done: false }, { id: 't4', task: 'Launch event venue', done: false }], completedTasks: 2, totalTasks: 4, createdAt: ts('2027-03-01') },
    ];
    for (const item of BOOK_LAUNCHES) {
        await safeWrite(`book_launches/${item.id}`, () => setDoc(doc(db, 'book_launches', item.id), item));
    }

    // ── 22. Beta Campaigns (BetaCampaign.tsx) ──
    const BETA_CAMPAIGNS = [
        { id: 'bc-1', title: 'Wrath & Reverie Beta Read', bookTitle: 'Wrath & Reverie', authorId: 'author-1', authorName: 'Elara Vance', genre: 'Dark Fantasy', wordCount: 94000, status: 'active', readerCount: 12, targetReaders: 15, chaptersReleased: 15, totalChapters: 24, feedbackCount: 45, startDate: ts('2025-11-01'), deadline: ts('2026-03-28'), description: 'Beta reading campaign for the sequel to The Obsidian Crown.', cover: 'https://picsum.photos/seed/wrath-beta/200/300', createdAt: ts('2025-10-15') },
    ];
    for (const item of BETA_CAMPAIGNS) {
        await safeWrite(`beta_campaigns/${item.id}`, () => setDoc(doc(db, 'beta_campaigns', item.id), item));
    }

    // ── 23. Contact Submissions (Contact page) ──
    const CONTACT_SUBMISSIONS = [
        { id: 'cs-1', name: 'Alex Rivera', email: 'alex@example.com', subject: 'Submission Inquiry', message: 'I have a completed 85,000-word dark fantasy manuscript. Do you accept unsolicited submissions?', status: 'unread', createdAt: ts('2027-03-20') },
        { id: 'cs-2', name: 'Morgan Chen', email: 'morgan@example.com', subject: 'Partnership Opportunity', message: 'I run a bookstagrammer community with 50K followers and would love to partner for author events.', status: 'read', createdAt: ts('2027-03-18') },
    ];
    for (const item of CONTACT_SUBMISSIONS) {
        await safeWrite(`contact_submissions/${item.id}`, () => setDoc(doc(db, 'contact_submissions', item.id), item));
    }

    // ── 24. Editor Feedback (EditorBridge) ──
    const EDITOR_FEEDBACK = [
        { id: 'ef-1', manuscriptId: 'ms-1', manuscriptTitle: 'Wrath & Reverie', authorId: 'author-1', editorName: 'Mx. Reyes', chapter: 14, type: 'structural', content: 'The battle sequence needs consolidation. Flashback interruptions break momentum.', priority: 'high', status: 'open', createdAt: ts('2027-03-08') },
        { id: 'ef-2', manuscriptId: 'ms-1', manuscriptTitle: 'Wrath & Reverie', authorId: 'author-1', editorName: 'Mx. Reyes', chapter: 12, type: 'character', content: 'Seraphine\'s motivation needs one more beat of internal justification before the betrayal.', priority: 'medium', status: 'in_review', createdAt: ts('2027-03-06') },
    ];
    for (const item of EDITOR_FEEDBACK) {
        await safeWrite(`editor_feedback/${item.id}`, () => setDoc(doc(db, 'editor_feedback', item.id), item));
    }

    // ── 25. Page Configs (About, Contact, ForAuthors, etc.) ──
    const PAGE_CONFIGS = [
        { id: 'about', title: 'About Rüna Atlas', subtitle: 'A speculative fiction publishing house centering marginalized voices', heroImage: 'https://picsum.photos/seed/about-hero/1200/400', mission: 'Rüna Atlas is a speculative fiction publisher dedicated to amplifying stories from underrepresented communities. We publish dark fantasy, cyberpunk, magical realism, and literary speculative fiction.', values: ['Centering marginalized narratives', 'Literary excellence', 'Community-driven curation', 'Author-first partnerships'], team: [{ name: 'Publisher & Founder', role: 'Publisher', bio: 'Visionary behind Rüna Atlas.' }], updatedAt: ts('2027-01-01') },
        { id: 'contact', title: 'Contact Us', subtitle: 'Get in touch with the Rüna Atlas team', email: 'hello@runaatlas.com', address: 'New York, NY', socialLinks: { twitter: '@runaatlas', instagram: '@runaatlas' }, updatedAt: ts('2027-01-01') },
        { id: 'for-authors', title: 'For Authors', subtitle: 'Join the Rüna Atlas family', description: 'We are actively seeking speculative fiction manuscripts from diverse voices.', submissionGuidelines: 'Please send your query letter, synopsis, and first three chapters to submissions@runaatlas.com.', updatedAt: ts('2027-01-01') },
        { id: 'for-readers', title: 'For Readers', subtitle: 'Discover your next favorite book', description: 'Explore our catalog, join reading circles, and become part of the Rüna Atlas community.', updatedAt: ts('2027-01-01') },
        { id: 'for-beta-readers', title: 'For Beta Readers', subtitle: 'Shape the stories of tomorrow', description: 'Join our beta reader program and get early access to upcoming titles.', updatedAt: ts('2027-01-01') },
    ];
    for (const item of PAGE_CONFIGS) {
        await safeWrite(`page_configs/${item.id}`, () => setDoc(doc(db, 'page_configs', item.id), item));
    }

    // ── 26. Landing Page data ──
    const LANDING_BANNER = { id: 'main', headline: 'Stories That Reshape Reality', subheadline: 'Speculative fiction centering marginalized voices', ctaText: 'Explore the Catalog', ctaLink: '/catalog', backgroundImage: 'https://picsum.photos/seed/banner/1200/600', active: true };
    await safeWrite('landingPage_banner/main', () => setDoc(doc(db, 'landingPage_banner', 'main'), LANDING_BANNER));

    const LANDING_SPOTLIGHT = { id: 'current', bookId: 'book-8', title: 'Echoes of the Spire', author: 'Elara Vance', tagline: 'Coming Fall 2027', cover: 'https://picsum.photos/seed/spire-cover/400/600', description: 'In a tower that defies time, an architect discovers that every floor she builds leads deeper into her own forgotten past.', ctaText: 'Pre-Order Now', ctaLink: '/catalog/echoes-of-the-spire' };
    await safeWrite('landingPage_spotlight/current', () => setDoc(doc(db, 'landingPage_spotlight', 'current'), LANDING_SPOTLIGHT));

    const LANDING_QUOTES = [
        { id: 'lq-1', text: 'Magic is not a gift. It is a wound the universe has learned to sing through.', book: 'The Obsidian Crown', author: 'Elara Vance', order: 0 },
        { id: 'lq-2', text: 'The ocean remembers every secret that has ever been whispered to the shore.', book: 'Whispers of the Deep', author: 'Marina Solis', order: 1 },
    ];
    for (const item of LANDING_QUOTES) {
        await safeWrite(`landingPage_quotes/${item.id}`, () => setDoc(doc(db, 'landingPage_quotes', item.id), item));
    }

    const LANDING_GATEWAYS = [
        { id: 'lg-1', title: 'Explore the Catalog', description: 'Browse our full collection of speculative fiction.', icon: '📚', link: '/catalog', order: 0 },
        { id: 'lg-2', title: 'Join a Reading Circle', description: 'Connect with fellow readers in genre-focused groups.', icon: '🌙', link: '/community', order: 1 },
        { id: 'lg-3', title: 'Discover Your Book DNA', description: 'Find out your reader personality profile.', icon: '🧬', link: '/book-dna', order: 2 },
    ];
    for (const item of LANDING_GATEWAYS) {
        await safeWrite(`landingPage_gateways/${item.id}`, () => setDoc(doc(db, 'landingPage_gateways', item.id), item));
    }

    const LANDING_ACTIVITIES = [
        { id: 'la-1', title: 'New Release', description: 'The Saltwater Archives is now available!', icon: '📖', link: '/catalog/the-saltwater-archives', date: ts('2027-02-01'), order: 0 },
        { id: 'la-2', title: 'Author Event', description: 'Q&A with Elara Vance — April 18th', icon: '🎤', link: '/events', date: ts('2027-04-18'), order: 1 },
    ];
    for (const item of LANDING_ACTIVITIES) {
        await safeWrite(`landingPage_activities/${item.id}`, () => setDoc(doc(db, 'landingPage_activities', item.id), item));
    }

    // ── 27. Content Warning Categories (admin) ──
    const CONTENT_WARNINGS = [
        { id: 'cw-1', name: 'Violence', description: 'Scenes depicting physical violence or combat', severity: 'moderate', order: 0 },
        { id: 'cw-2', name: 'Death', description: 'Character death or depictions of dying', severity: 'moderate', order: 1 },
        { id: 'cw-3', name: 'Body Horror', description: 'Graphic descriptions of body transformation or mutilation', severity: 'high', order: 2 },
        { id: 'cw-4', name: 'Grief', description: 'Themes of loss and mourning', severity: 'low', order: 3 },
        { id: 'cw-5', name: 'Drug Use', description: 'Depictions of substance use or addiction', severity: 'moderate', order: 4 },
    ];
    for (const item of CONTENT_WARNINGS) {
        await safeWrite(`content_warning_categories/${item.id}`, () => setDoc(doc(db, 'content_warning_categories', item.id), item));
    }

    // ── 28. Circle Applications (Community.tsx) ──
    const CIRCLE_APPLICATIONS = [
        { id: 'ca-1', circleId: 'rc-1', userId: 'demo', username: 'star_reader_42', message: 'I love dark fantasy and morally grey characters!', status: 'approved', createdAt: ts('2027-02-15') },
    ];
    for (const item of CIRCLE_APPLICATIONS) {
        await safeWrite(`circleApplications/${item.id}`, () => setDoc(doc(db, 'circleApplications', item.id), item));
    }

    // ── 29. Messages (Portal.tsx) ──
    const MESSAGES = [
        { id: 'msg-1', from: 'Rüna Atlas Team', to: 'demo', subject: 'Welcome to Rüna Atlas!', content: 'Welcome to the Rüna Atlas community. We\'re thrilled to have you here. Explore our catalog, join a reading circle, and discover your Book DNA!', read: false, createdAt: ts('2027-03-25') },
        { id: 'msg-2', from: 'Beta Reading Team', to: 'demo', subject: 'New Beta Read Available', content: 'A new manuscript is available for beta reading: "The Hollow Garden" by Sera Nighthollow. Sign up in your dashboard!', read: true, createdAt: ts('2027-03-20') },
    ];
    for (const item of MESSAGES) {
        await safeWrite(`messages/${item.id}`, () => setDoc(doc(db, 'messages', item.id), item));
    }

    // ── 30. (Removed — authors collection obsoleted by authorProfiles in section 16) ──

    // ── 31. Awards (AdminAwards.tsx) — Full data from operationsSeedData ──
    const { AWARDS_SEED } = await import('../data/operationsSeedData');
    for (let i = 0; i < AWARDS_SEED.length; i++) {
        const aw = AWARDS_SEED[i];
        const id = `award-${i + 1}`;
        await safeWrite(`awards/${id}`, () => setDoc(doc(db, 'awards', id), {
            id, name: aw.name, organization: aw.organization, website: aw.website || '',
            categories: aw.categories, eligibility: aw.eligibility, submissionFormat: aw.submissionFormat,
            fee: aw.fee || '', keyDates: aw.keyDates, notes: aw.notes || '', relevance: aw.relevance,
            createdAt: ts('2027-01-01'),
        }));
    }

    // ── 32. Award Submissions ──
    const AWARD_SUBMISSIONS = [
        { id: 'as-1', awardId: 'award-2', awardName: 'Nebula Award', bookId: 'book-1', bookTitle: 'The Obsidian Crown', category: 'Best Novel', status: 'submitted', submittedAt: ts('2027-02-10'), createdAt: ts('2027-02-10') },
        { id: 'as-2', awardId: 'award-3', awardName: 'Lambda Literary Award', bookId: 'book-4', bookTitle: 'Star-Crossed Circuits', category: 'LGBTQ+ SF/Fantasy/Horror', status: 'submitted', submittedAt: ts('2026-11-15'), createdAt: ts('2026-11-15') },
    ];
    for (const item of AWARD_SUBMISSIONS) {
        await safeWrite(`award_submissions/${item.id}`, () => setDoc(doc(db, 'award_submissions', item.id), item));
    }

    // ── 33. Contacts (AdminContacts.tsx) ──
    const CONTACTS = [
        { id: 'contact-1', name: 'Nadia Reads Fantasy', type: 'bookstagrammer', socialHandles: '@nadiareadsbooks', audience: '45K followers', genres: ['Fantasy', 'Romantasy', 'YA'], relationship: 'cold', notes: 'Focuses on BIPOC fantasy authors.', createdAt: ts('2027-01-01') },
        { id: 'contact-2', name: 'The Queer Bookworm', type: 'bookstagrammer', socialHandles: '@thequeerbookworm', audience: '32K followers', genres: ['Queer Fiction', 'SFF General'], relationship: 'warm', notes: 'Queer-centered reviews. Strong engagement.', createdAt: ts('2027-01-01') },
        { id: 'contact-3', name: 'LeVar Burton Reads', type: 'podcaster', website: 'https://levarburtonpodcast.com/', audience: '500K+ listeners', genres: ['Short Fiction', 'SFF General'], relationship: 'cold', notes: 'Major platform for short fiction.', createdAt: ts('2027-01-01') },
    ];
    for (const item of CONTACTS) {
        await safeWrite(`contacts/${item.id}`, () => setDoc(doc(db, 'contacts', item.id), item));
    }

    // ── 34. SOP Templates (AdminSOPs.tsx) — Full data from sopTemplatesSeed ──
    const { SOP_TEMPLATES_SEED } = await import('../data/sopTemplatesSeed');
    for (let i = 0; i < SOP_TEMPLATES_SEED.length; i++) {
        const tpl = SOP_TEMPLATES_SEED[i];
        const id = `sop-${i + 1}`;
        await safeWrite(`sop_templates/${id}`, () => setDoc(doc(db, 'sop_templates', id), {
            id, title: tpl.title, category: tpl.category, icon: tpl.icon,
            description: tpl.description, steps: tpl.steps, createdAt: ts('2027-01-01'),
        }));
    }

    // ── 35. Editorial Projects (AdminEditorial.tsx) ──
    const EDITORIAL_PROJECTS = [
        { id: 'ep-1', title: 'Wrath & Reverie', author: 'Elara Vance', genre: 'Dark Fantasy', status: 'in_progress', stage: 'developmental_edit', editor: 'Mx. Reyes', wordCount: 94000, deadline: ts('2027-04-15'), priority: 'high', notes: 'Sequel to The Obsidian Crown. Complex multi-POV structure.', createdAt: ts('2026-08-01') },
        { id: 'ep-2', title: 'The Hollow Garden', author: 'Sera Nighthollow', genre: 'Magical Realism', status: 'initial_review', stage: 'first_read', editor: 'Mx. Reyes', wordCount: 67000, deadline: ts('2027-05-01'), priority: 'normal', notes: 'Debut novel. Strong voice, needs structural work.', createdAt: ts('2027-01-05') },
    ];
    for (const item of EDITORIAL_PROJECTS) {
        await safeWrite(`editorialProjects/${item.id}`, () => setDoc(doc(db, 'editorialProjects', item.id), item));
    }

    // ── 36. Subscriptions / Membership (Membership.tsx) ──
    const SUBSCRIPTIONS = [
        { id: 'sub-1', userId: 'demo', tier: 'constellation', tierName: 'Constellation Reader', status: 'active', startDate: ts('2027-01-01'), nextBilling: ts('2027-04-01'), price: 9.99, perks: ['Early access to new releases', 'Monthly exclusive short story', 'Constellation voting access'], createdAt: ts('2027-01-01') },
    ];
    for (const item of SUBSCRIPTIONS) {
        await safeWrite(`subscriptions/${item.id}`, () => setDoc(doc(db, 'subscriptions', item.id), item));
    }

    // ── 37. Book Production (AdminProduction.tsx) ──
    const BOOK_PRODUCTION = [
        { id: 'book-8', bookId: 'book-8', title: 'Echoes of the Spire', author: 'Elara Vance', status: 'in_production', stage: 'typesetting', format: 'Hardcover', trim: '6x9', pageCount: 388, printer: 'IngramSpark', isbn: '978-1-234567-08-0', targetDate: ts('2027-09-01'), tasks: [{ id: 'pt1', task: 'Interior typesetting', done: true }, { id: 'pt2', task: 'Cover finalize', done: true }, { id: 'pt3', task: 'Proof review', done: false }, { id: 'pt4', task: 'Print approval', done: false }], createdAt: ts('2027-05-01') },
    ];
    for (const item of BOOK_PRODUCTION) {
        await safeWrite(`book_production/${item.id}`, () => setDoc(doc(db, 'book_production', item.id), item));
    }

    // ── 38. Royalties (Portal.tsx) ──
    const ROYALTIES = [
        { id: 'roy-1', authorId: 'author-1', authorName: 'Elara Vance', period: 'H1 2027', totalEarned: 12450.00, totalPaid: 8500.00, balance: 3950.00, titles: [{ bookId: 'book-1', title: 'The Obsidian Crown', units: 2400, revenue: 8950.00, royaltyRate: 0.15, earned: 8950 * 0.15 }], status: 'pending', createdAt: ts('2027-03-01') },
    ];
    for (const item of ROYALTIES) {
        await safeWrite(`royalties/${item.id}`, () => setDoc(doc(db, 'royalties', item.id), item));
    }

    // ── 39. Activity Log (AdminActivity.tsx) ──
    const ACTIVITY_LOG = [
        { id: 'act-1', action: 'Manuscript submitted', entity: 'The Hollow Garden', entityType: 'manuscript', userId: 'author-5', userName: 'Sera Nighthollow', details: 'New manuscript submitted for initial review.', createdAt: ts('2027-01-05') },
        { id: 'act-2', action: 'Book published', entity: 'The Saltwater Archives', entityType: 'book', userId: 'admin', userName: 'System', details: 'Successfully published across all distribution channels.', createdAt: ts('2027-02-01') },
        { id: 'act-3', action: 'Beta campaign started', entity: 'Wrath & Reverie', entityType: 'beta_campaign', userId: 'author-1', userName: 'Elara Vance', details: 'Beta reading campaign launched with 15 reader spots.', createdAt: ts('2025-11-01') },
    ];
    for (const item of ACTIVITY_LOG) {
        await safeWrite(`activityLog/${item.id}`, () => setDoc(doc(db, 'activityLog', item.id), item));
    }

    // ── 40. Author Documents (Portal.tsx) ──
    const AUTHOR_DOCUMENTS = [
        { id: 'adoc-1', authorId: 'demo', title: 'Publishing Agreement — The Obsidian Crown', type: 'contract', status: 'signed', url: '#', createdAt: ts('2026-01-15') },
        { id: 'adoc-2', authorId: 'demo', title: 'Marketing Questionnaire', type: 'form', status: 'completed', url: '#', createdAt: ts('2026-01-20') },
    ];
    for (const item of AUTHOR_DOCUMENTS) {
        await safeWrite(`authorDocuments/${item.id}`, () => setDoc(doc(db, 'authorDocuments', item.id), item));
    }

    // ── 41. Events (Events.tsx) — needs date (Timestamp), location, type, status, capacity, rsvpCount, rsvpList, isFree, speakers[], tags[] ──
    const EVENTS = [
        {
            id: 'evt-1', title: 'Fireside Q&A: Elara Vance on Echoes of the Spire', description: 'Join Elara Vance for an intimate conversation about her upcoming novel, the art of gothic architecture in fiction, and the darkest corners of shadow magic.', longDescription: 'This is an exclusive event for early supporters of Echoes of the Spire. Elara will share deleted scenes, discuss the inspiration behind the infinite tower, and take audience questions live.',
            date: ts('2027-05-15'), endDate: ts('2027-05-15'), location: 'Virtual — Zoom', type: 'Q&A', status: 'upcoming', capacity: 200, rsvpCount: 147, rsvpList: [], streamUrl: '#', isFree: true,
            speakers: [{ name: 'Elara Vance', image: 'https://picsum.photos/seed/elara/100/100', role: 'Author' }],
            tags: ['dark fantasy', 'Q&A', 'Echoes of the Spire'], seriesName: 'Author Firesides', createdAt: ts('2027-03-01')
        },
        {
            id: 'evt-2', title: 'Book Launch: Neon Requiem (Collector\'s Edition)', description: 'Celebrate the release of the stunning collector\'s edition of Neon Requiem — featuring new cover art, author commentary, and exclusive bonus chapter.',
            date: ts('2027-04-20'), endDate: ts('2027-04-20'), location: 'Virtual — YouTube Premiere', type: 'Release', status: 'upcoming', capacity: 1000, rsvpCount: 734, rsvpList: [], streamUrl: '#', isFree: true,
            speakers: [{ name: 'Jax Thorne', image: 'https://picsum.photos/seed/jax/100/100', role: 'Author' }],
            tags: ['book launch', 'cyberpunk', 'collector\'s edition'], createdAt: ts('2027-02-15')
        },
        {
            id: 'evt-3', title: 'Worldbuilding Workshop: Creating Living Magic Systems', description: 'A 90-minute craft workshop led by Marina Solis on how to build magic systems that feel organic, grounded, and emotionally resonant.',
            date: ts('2027-06-01T19:00:00'), endDate: ts('2027-06-01T20:30:00'), location: 'Virtual — Discord Stage', type: 'Workshop', status: 'upcoming', capacity: 50, rsvpCount: 42, rsvpList: [], ticketPrice: 15, isFree: false,
            speakers: [{ name: 'Marina Solis', image: 'https://picsum.photos/seed/marina/100/100', role: 'Instructor' }],
            tags: ['worldbuilding', 'craft', 'workshop'], createdAt: ts('2027-04-01')
        },
        {
            id: 'evt-4', title: 'Community Reading Circle: The Obsidian Crown', description: 'Join fellow readers for a live discussion of chapters 1–8 of The Obsidian Crown. Spoilers ahead!',
            date: ts('2027-03-10'), endDate: ts('2027-03-10'), location: 'Discord — #reading-circle', type: 'Community', status: 'past', capacity: 30, rsvpCount: 28, rsvpList: [], isFree: true, recordingUrl: '#',
            speakers: [{ name: 'Community Moderators', image: 'https://picsum.photos/seed/mods/100/100', role: 'Hosts' }],
            tags: ['book club', 'discussion', 'The Obsidian Crown'], createdAt: ts('2027-02-20')
        },
    ];
    for (const item of EVENTS) {
        await safeWrite(`events/${item.id}`, () => setDoc(doc(db, 'events', item.id), item));
    }

    // ── 42. Worldbuilding Entries (Forge.tsx worldbuilding tab) — needs title, category, bookTitle, bookId, content, contributors[], lastEdited, approved ──
    const WORLD_ENTRIES = [
        { id: 'we-1', title: 'Shadow Weaving', category: 'Magic', bookTitle: 'The Obsidian Crown', bookId: 'book-1', content: 'Shadow Weaving is the primary magic system in The Obsidian Crown. Practitioners draw power from the obsidian crown itself, channeling shadow energy through practiced gestures and incantations. The deeper one reaches into the shadow plane, the stronger the magic — but at the cost of one\'s humanity.\n\nShadow Weaving manifests in three tiers:\n• **Veil**: Illusions and concealment\n• **Bind**: Physical manipulation of shadow matter\n• **Consume**: The highest tier, where shadow replaces flesh', contributors: ['midnight_ink', 'theory_crafter'], lastEdited: ts('2027-03-15'), approved: true },
        { id: 'we-2', title: 'The Megacity of Kael', category: 'Setting', bookTitle: 'Neon Requiem', bookId: 'book-2', content: 'Kael is a sprawling megacity built vertically after sea levels consumed the coastal lowlands. The city is divided into strata:\n\n• **Upper Decks**: Corporate headquarters and pristine living quarters\n• **The Midline**: Middle-class residential and commercial districts\n• **The Undertow**: Industrial sectors and memory market black markets\n• **The Drowned**: Abandoned sublevels partially submerged in contaminated water', contributors: ['prose_hunter'], lastEdited: ts('2027-02-28'), approved: true },
        { id: 'we-3', title: 'Coralline Telepathy', category: 'Flora', bookTitle: 'Whispers of the Deep', bookId: 'book-3', content: 'In the world of Whispers of the Deep, certain coral species have developed a rudimentary form of telepathy over millennia. These "speaking corals" resonate at frequencies that interact with human neural pathways, especially in individuals with heightened empathic abilities.\n\nMarina\'s grandmother was one of the first to document this phenomenon, though her research was dismissed by the scientific community.', contributors: ['star_reader_42', 'midnight_ink'], lastEdited: ts('2027-03-20'), approved: true },
        { id: 'we-4', title: 'Commander Vel Tyris', category: 'Character', bookTitle: 'Star-Crossed Circuits', bookId: 'book-4', content: 'Commander Vel Tyris is the chief engineer of the generation ship Meridian. Brilliant, stubborn, and haunted by a maintenance failure that killed three crew members seven years prior. Vel\'s rivalry with co-engineer Asha Ndara is the central tension of Star-Crossed Circuits.', contributors: ['prose_hunter'], lastEdited: ts('2027-01-10'), approved: true },
    ];
    for (const item of WORLD_ENTRIES) {
        await safeWrite(`worldbuilding/${item.id}`, () => setDoc(doc(db, 'worldbuilding', item.id), item));
    }

    // ── 43. News → merged into posts with type:'announcement' ──
    const NEWS_AS_POSTS = [
        { id: 'post-news-1', title: 'Spring 2027 Catalog Announced', slug: 'spring-2027-catalog-announced', excerpt: 'We\'re thrilled to unveil our Spring 2027 lineup — four new titles spanning dark fantasy, cyberpunk, and magical realism.', content: 'We\'re thrilled to unveil our Spring 2027 lineup — four new titles spanning dark fantasy, cyberpunk, and magical realism.', authorId: 'system', authorName: 'Rüna Atlas Press', type: 'announcement', tags: ['catalog', 'spring 2027'], likes: 89, comments: 12, publishDate: ts('2027-03-20'), createdAt: ts('2027-03-20'), status: 'published' },
        { id: 'post-news-2', title: 'Elara Vance Wins Nebula Award', slug: 'elara-vance-wins-nebula-award', excerpt: 'The Obsidian Crown has been awarded the 2026 Nebula Award for Best Novel. Congratulations to Elara Vance on this incredible achievement.', content: 'The Obsidian Crown has been awarded the 2026 Nebula Award for Best Novel. Congratulations to Elara Vance on this incredible achievement.', authorId: 'system', authorName: 'Rüna Atlas Press', type: 'announcement', tags: ['awards', 'nebula'], likes: 234, comments: 45, publishDate: ts('2027-02-15'), createdAt: ts('2027-02-15'), status: 'published' },
        { id: 'post-news-3', title: 'Beta Reading Program Expansion', slug: 'beta-reading-program-expansion', excerpt: 'Our beta reading program is expanding! We\'re now accepting applications for readers interested in upcoming sci-fi and fantasy titles.', content: 'Our beta reading program is expanding! We\'re now accepting applications for readers interested in upcoming sci-fi and fantasy titles.', authorId: 'system', authorName: 'Rüna Atlas Press', type: 'announcement', tags: ['community', 'beta readers'], likes: 67, comments: 8, publishDate: ts('2027-01-10'), createdAt: ts('2027-01-10'), status: 'published' },
    ];
    for (const item of NEWS_AS_POSTS) {
        await safeWrite(`posts/${item.id}`, () => setDoc(doc(db, 'posts', item.id), item));
    }

    // ── 44. Royalty Formats (AdminRoyalties.tsx) ──
    const ROYALTY_FORMATS = [
        { id: 'rf-1', formatName: 'Trade Paperback', listPrice: 17.99, printCost: 4.50, wholesaleDiscount: 55, authorRoyalty: 10, channels: ['IngramSpark', 'Direct', 'Amazon'], notes: 'Standard trade paperback. Primary format for most titles.', createdAt: ts('2027-01-01') },
        { id: 'rf-2', formatName: 'Hardcover', listPrice: 26.99, printCost: 8.00, wholesaleDiscount: 55, authorRoyalty: 12, channels: ['IngramSpark', 'Direct'], notes: 'Premium hardcover editions. Limited runs for select titles.', createdAt: ts('2027-01-01') },
        { id: 'rf-3', formatName: 'eBook (EPUB)', listPrice: 9.99, printCost: 0, wholesaleDiscount: 30, authorRoyalty: 25, channels: ['IngramSpark', 'KDP', 'Apple Books', 'Kobo', 'Direct'], notes: 'Digital edition distributed across all major platforms.', createdAt: ts('2027-01-01') },
        { id: 'rf-4', formatName: 'Audiobook', listPrice: 24.99, printCost: 0, wholesaleDiscount: 60, authorRoyalty: 20, channels: ['Findaway Voices', 'ACX/Audible', 'Libro.fm'], notes: 'Full-cast or single narrator. Production cost handled separately.', createdAt: ts('2027-01-01') },
        { id: 'rf-5', formatName: 'Mass Market Paperback', listPrice: 8.99, printCost: 2.00, wholesaleDiscount: 55, authorRoyalty: 8, channels: ['IngramSpark', 'Amazon'], notes: 'Smaller format for select high-volume titles.', createdAt: ts('2027-01-01') },
        { id: 'rf-6', formatName: 'Special/Collector Edition', listPrice: 34.99, printCost: 14.00, wholesaleDiscount: 40, authorRoyalty: 15, channels: ['Direct', 'Bookshop.org'], notes: 'Limited print run with sprayed edges, foil, signed bookplates. Direct sales only.', createdAt: ts('2027-01-01') },
    ];
    for (const item of ROYALTY_FORMATS) {
        await safeWrite(`royalty_formats/${item.id}`, () => setDoc(doc(db, 'royalty_formats', item.id), item));
    }

    // ── 45. Onboarding Steps (AdminOnboarding.tsx) ──
    const ONBOARDING_STEPS = [
        { id: 'ob-1', order: 1, title: 'Welcome & Author Agreement', description: 'Review and sign the Rüna Atlas author agreement. Covers rights, royalty terms, and expectations.', required: true, createdAt: ts('2027-01-01') },
        { id: 'ob-2', order: 2, title: 'Author Profile Setup', description: 'Complete your author profile: bio, photo, social links, and genre preferences.', required: true, createdAt: ts('2027-01-01') },
        { id: 'ob-3', order: 3, title: 'Marketing Questionnaire', description: 'Fill out the marketing intake form: target audience, comp titles, platform strengths, and event availability.', required: true, createdAt: ts('2027-01-01') },
        { id: 'ob-4', order: 4, title: 'Tax & Payment Information', description: 'Submit W-9 (or W-8BEN for international authors) and set up direct deposit for royalty payments.', required: true, createdAt: ts('2027-01-01') },
        { id: 'ob-5', order: 5, title: 'Editorial Kickoff Call', description: 'Schedule your kickoff call with your assigned editor to discuss timeline, process, and communication preferences.', required: true, createdAt: ts('2027-01-01') },
        { id: 'ob-6', order: 6, title: 'Platform Tour & Resources', description: 'Review the author handbook, access the Forge writing tools, and join the private author community channel.', required: false, createdAt: ts('2027-01-01') },
    ];
    for (const item of ONBOARDING_STEPS) {
        await safeWrite(`onboarding_steps/${item.id}`, () => setDoc(doc(db, 'onboarding_steps', item.id), item));
    }
}
