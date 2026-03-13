// ─── Knowledge Base Documents ──────────────────────────
// Comprehensive reference library for Rüna Atlas Press operations

export interface KBDocument {
  id: string;
  title: string;
  category: 'Publishing' | 'Marketing' | 'Partnerships' | 'Operations' | 'Community';
  icon: string;
  lastUpdated: string;
  content: string;
}

// Import document content from separate files
import { DOC_PUBLISHING_STANDARDS } from './kb/publishing-standards';
import { DOC_FORMATTING_GUIDE } from './kb/formatting-guide';
import { DOC_AUTHOR_SOURCING } from './kb/author-sourcing';
import { DOC_CONFERENCES } from './kb/conferences';
import { DOC_SOCIAL_SCOUTING } from './kb/social-scouting';
import { DOC_ADVOCACY_BOARD } from './kb/advocacy-board';
import { DOC_MARKETING_PLAN } from './kb/marketing-plan';
import { DOC_BLOGGER_PARTNERSHIPS } from './kb/blogger-partnerships';
import { DOC_INFLUENCER_PARTNERSHIPS } from './kb/influencer-partnerships';
import { DOC_BOOKSTORE_LIBRARY } from './kb/bookstore-library';
import { DOC_COLLABORATIVE_PROMOS } from './kb/collaborative-promos';
import { DOC_SIGNINGS_READINGS } from './kb/signings-readings';
import { DOC_INGRAM } from './kb/ingram';
import { DOC_BAKER_TAYLOR } from './kb/baker-taylor';
import { DOC_READER_CIRCLES } from './kb/reader-circles';
import { DOC_PUBLISHERS_MARKETPLACE } from './kb/publishers-marketplace';
import { DOC_INDUSTRY_ASSOCIATIONS } from './kb/industry-associations';
import { DOC_MILESTONE_PAYOUTS } from './kb/milestone-payouts';

export const KNOWLEDGE_BASE_DOCS: KBDocument[] = [
  { id: 'publishing-standards', title: 'Publishing Standards & Quality Guidelines', category: 'Publishing', icon: '📏', lastUpdated: '2026-03-12', content: DOC_PUBLISHING_STANDARDS },
  { id: 'formatting-guide', title: 'Formatting Guide', category: 'Publishing', icon: '📐', lastUpdated: '2026-03-12', content: DOC_FORMATTING_GUIDE },
  { id: 'author-sourcing', title: 'Author Sourcing Strategy', category: 'Operations', icon: '🔍', lastUpdated: '2026-03-12', content: DOC_AUTHOR_SOURCING },
  { id: 'conferences', title: 'Writing Conferences Guide', category: 'Operations', icon: '🎤', lastUpdated: '2026-03-12', content: DOC_CONFERENCES },
  { id: 'social-scouting', title: 'Social Media Scouting Playbook', category: 'Marketing', icon: '📱', lastUpdated: '2026-03-12', content: DOC_SOCIAL_SCOUTING },
  { id: 'advocacy-board', title: 'Author Advocacy Board Charter', category: 'Operations', icon: '🛡️', lastUpdated: '2026-03-12', content: DOC_ADVOCACY_BOARD },
  { id: 'marketing-plan', title: 'Marketing Plan & Strategy', category: 'Marketing', icon: '📣', lastUpdated: '2026-03-12', content: DOC_MARKETING_PLAN },
  { id: 'blogger-partnerships', title: 'Content Partnerships — Book Bloggers', category: 'Partnerships', icon: '✍️', lastUpdated: '2026-03-12', content: DOC_BLOGGER_PARTNERSHIPS },
  { id: 'influencer-partnerships', title: 'Content Partnerships — Niche Influencers', category: 'Partnerships', icon: '🌟', lastUpdated: '2026-03-12', content: DOC_INFLUENCER_PARTNERSHIPS },
  { id: 'bookstore-library', title: 'Bookstore & Library Partnerships', category: 'Partnerships', icon: '🏪', lastUpdated: '2026-03-12', content: DOC_BOOKSTORE_LIBRARY },
  { id: 'collaborative-promos', title: 'Collaborative Promotions', category: 'Marketing', icon: '🤝', lastUpdated: '2026-03-12', content: DOC_COLLABORATIVE_PROMOS },
  { id: 'signings-readings', title: 'Book Signings & Readings Guide', category: 'Marketing', icon: '🖊️', lastUpdated: '2026-03-12', content: DOC_SIGNINGS_READINGS },
  { id: 'ingram', title: 'Working with Ingram', category: 'Partnerships', icon: '🖨️', lastUpdated: '2026-03-12', content: DOC_INGRAM },
  { id: 'baker-taylor', title: 'Working with Baker & Taylor', category: 'Partnerships', icon: '📦', lastUpdated: '2026-03-12', content: DOC_BAKER_TAYLOR },
  { id: 'reader-circles', title: 'Recruiting, Retaining & Running Reader Circles', category: 'Community', icon: '📚', lastUpdated: '2026-03-12', content: DOC_READER_CIRCLES },
  { id: 'publishers-marketplace', title: "Publisher's Marketplace Guide", category: 'Operations', icon: '💼', lastUpdated: '2026-03-12', content: DOC_PUBLISHERS_MARKETPLACE },
  { id: 'industry-associations', title: 'Industry Associations (IBPA & More)', category: 'Operations', icon: '🏛️', lastUpdated: '2026-03-12', content: DOC_INDUSTRY_ASSOCIATIONS },
  { id: 'milestone-payouts', title: 'Milestone-Based Payout Structure', category: 'Operations', icon: '💰', lastUpdated: '2026-03-12', content: DOC_MILESTONE_PAYOUTS },
];
