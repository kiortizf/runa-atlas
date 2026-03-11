# Runa Atlas Press: Administrator Guide

All admin features require the `admin` role. Sign in and navigate to `/admin` to access the panel.

## Navigation Map

### Public Pages (Top Nav + Footer)

| Page | URL | Description |
|------|-----|-------------|
| Catalog | `/catalog` | Book listings, search, filters |
| Journeys | `/journeys` | Serialized fiction, episode reader |
| Authors | `/authors` | Author profiles and bios |
| Community | `/community` | Polls, reading circles, Q&A, book clubs |
| The Forge | `/forge` | Anthology voting, cover reveals, fan fiction, worldbuilding wiki |
| Author Connect | `/connect` | AMAs, writing journals, office hours |
| Events | `/events` | RSVP, ticketed events, streaming, recordings |
| Membership | `/membership` | Tier signup (Seeker, Cartographer, Architect) |
| Submissions | `/submissions` | Author manuscript submission portal |
| About | `/about` | Brand story and manifesto |

### Admin Panel Tabs (`/admin`)

| Tab | Component | What It Manages |
|-----|-----------|----------------|
| Submissions | `AdminSubmissions` | Manuscript inbox, lifecycle (received > under review > accepted/declined) |
| Catalogue | `AdminCatalogue` | Book CRUD (title, author, ISBN, pricing, cover images, series) |
| Journeys | `AdminJourneys` | Serial fiction CRUD with rich chapter editor and live preview |
| Authors | `AdminAuthors` | Author profiles (bio, photo, social links) |
| Community | `AdminCommunity` | Polls, Reader Circles, Book Club Guides, Q&A Sessions |
| Posts | `AdminPosts` | Blog posts with rich text, categories, scheduling |
| Events | `AdminEvents` | Event CRUD (type, date, capacity, pricing, streaming) |
| Newsletter | `AdminNewsletter` | Subscriber management, campaign scheduling |
| Forge & Connect | `AdminForge` | Forge projects, fan fiction moderation, worldbuilding, AMAs, journals, office hours |
| Media | `AdminMedia` | Media library uploads |
| Users | `AdminUsers` | User role management |
| Settings | `AdminSettings` | Site configuration |

---

## Feature Reference

### Journeys (Serialized Fiction)

**Admin: Journeys tab**

1. **Create a Journey**: Click "New Journey", fill in title, description, author, genre, and slug.
2. **Visibility toggle**: Set to `Public` (live), `Preview Only` (admin-only, shows "Coming Soon" to readers), or `Hidden` (not shown anywhere). This controls whether readers can find the journey.
3. **Manage Episodes**: Click the arrow icon on any journey to enter episode management.
4. **Rich Chapter Editor**: Click "New Episode" to open the full-screen editor.
   - **Formatting toolbar**: H1, H2, H3, Bold, Italic, Blockquote, Scene Break buttons.
   - **Live Preview**: Toggle "Show Preview" for a side-by-side split view showing exactly how the episode will render to readers.
   - **Episode status**: `Draft` (not visible to readers), `Scheduled` (publish on date), `Published` (live).
   - **Excerpt**: A short preview shown in the journey table of contents.
5. **Formatting Reference**:
   - `# Title` for main chapter headings
   - `## Section` for section headings
   - `### Sub-Section` for sub-sections
   - `**bold**` for bold text
   - `*italic*` for italic text
   - `> quote text` for blockquotes
   - `---` for scene breaks
   - Blank lines for paragraph breaks
6. **Seeded showcase**: "The Ember Codex" is pre-loaded with 3 published episodes and 1 draft, demonstrating all formatting.

### The Forge (Reader-Shaped Publishing)

**Admin: Forge & Connect tab > Forge Projects**

1. **Create Forge Projects**: Click "New Project", choose type:
   - `Anthology Vote`: Community votes on themes for upcoming anthologies
   - `Cover Reveal`: Community picks which cover design ships
   - `Story Poll`: Readers influence plot direction
2. **Each project has**: Title, description, deadline, and voting options. Add as many options as needed.
3. **Fan Fiction Moderation**: Switch to "Fan Fiction" sub-tab to review and delete community stories.
4. **Worldbuilding Wiki**: Switch to "Worldbuilding" sub-tab to approve/reject/delete entries.

**Public experience** (`/forge`):

- Three tabs: Shape the Future (voting), Fan Fiction (read and write stories), Worldbuilding (searchable encyclopedia)
- Worldbuilding wiki has search, category filters (Magic, Setting, Character, Flora, History, Technology), cross-references between entries in the same book
- Fan fiction has Read Full Story modal with reading time

### Author Connect (Direct Channels)

**Admin: Forge & Connect tab**

1. **AMAs**: Create and schedule Ask Me Anything sessions. Set author, topic, and date.
2. **Writing Journals**: Create behind-the-scenes journal entries from authors.
3. **Office Hours**: Create 1:1 video session slots for Architect-tier members.

**Public experience** (`/connect`):

- AMAs: Submit questions, upvote, see author answers
- Writing Journals: Full-text expansion with like functionality
- Office Hours: Booking for Architect members only

### Events

**Admin: Events tab**

1. **Create Event**: Set title, description, type (Q&A, Release Party, Workshop, Community, Reading, Panel), date, capacity, and pricing.
2. **Streaming**: Add stream URL (shown only after RSVP) and recording URL for past events.
3. **Tickets**: Set ticket price (0 for free events).

**Public experience** (`/events`):

- RSVP with capacity progress bars
- iCal export (downloads .ics file)
- Filter by type and status (upcoming/past)
- Stream links visible after RSVP
- Past event recordings

### Community Features

**Admin: Community tab**

1. **Polls**: Create with multiple options. Voting is live with Firestore updates.
2. **Reader Circles**: Reading groups. Set book, meeting schedule, capacity.
3. **Book Club Guides**: Discussion questions and guides linked to specific books.
4. **Q&A Sessions**: Schedule sessions linked to events.

### Submissions Pipeline

**Admin: Submissions tab**

1. Full lifecycle: New > Under Review > Revision Requested > Accepted/Declined
2. Each submission shows: title, author, genre, word count, query letter, synopsis
3. Send templated emails at each stage
4. Detailed view with notes and tracking ID

### User Management

**Admin: Users tab**

1. View all registered users
2. Edit roles: `user`, `author`, `admin`
3. Role changes take effect on next sign-in

---

## Membership Tiers

| Tier | Price | Key Benefits |
|------|-------|------|
| Seeker | Free | Basic access, community participation |
| Cartographer | $7/mo | Early chapter access, exclusive content |
| Architect | $25/mo | Office hours, vote weight, author direct messages |

---

## Common Admin Workflows

### Publishing a New Book

1. Admin > Catalogue > New Book (fill all fields)
2. Admin > Authors > verify author profile exists
3. Admin > Posts > write announcement post
4. Admin > Forge & Connect > create Cover Reveal project (optional)
5. Admin > Events > schedule a release event
6. Admin > Newsletter > draft campaign announcement

### Launching a New Journey (Serial)

1. Admin > Journeys > New Journey (set visibility to "Preview Only")
2. Manage Episodes > create first 2-3 chapters drafted
3. Set episode 1 status to "Published"
4. Change journey visibility to "Public" when ready
5. Schedule subsequent episodes with dates

### Running an Anthology Vote

1. Admin > Forge & Connect > Forge Projects > New Project
2. Type: Anthology Vote
3. Add 3-5 theme options with descriptions
4. Set deadline
5. Announce via Newsletter and Posts
6. Close automatically on deadline

### Managing Fan Fiction

1. Admin > Forge & Connect > Fan Fiction sub-tab
2. Review new submissions
3. Delete inappropriate content
4. Fan fiction is community-moderated (like system)

### Approving Worldbuilding Entries

1. Admin > Forge & Connect > Worldbuilding sub-tab
2. Review pending entries (marked as unapproved)
3. Approve or reject with one click
4. Approved entries show "Verified by Editorial Team" badge
