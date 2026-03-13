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
import { DOC_BRAND_IDENTITY } from './kb/brand-identity';
import { DOC_CONTRACT_TEMPLATES } from './kb/contract-templates';
import { DOC_FREELANCER_MANAGEMENT } from './kb/freelancer-management';
import { DOC_FINANCIAL_REPORTING } from './kb/financial-reporting';
import { DOC_BACKLIST_MANAGEMENT } from './kb/backlist-management';
import { DOC_RIGHTS_LICENSING } from './kb/rights-licensing';
import { DOC_AUTHOR_PLATFORM } from './kb/author-platform';
import { DOC_AWARDS_STRATEGY } from './kb/awards-strategy';
import { DOC_SOCIAL_MEDIA_CONTENT } from './kb/social-media-content';
import { DOC_ACCESSIBILITY } from './kb/accessibility-policy';
import { DOC_DEI_POLICY } from './kb/dei-policy';
import { DOC_DATA_PRIVACY } from './kb/data-privacy';
import { DOC_CRISIS_COMMS } from './kb/crisis-comms';
import { DOC_GRANT_STRATEGY } from './kb/grant-strategy';
import { DOC_AUTHOR_ONBOARDING } from './kb/author-onboarding';
import { DOC_PRINT_PLANNING } from './kb/print-planning';
import { DOC_REVIEW_MANAGEMENT } from './kb/review-management';
import { DOC_CONTENT_CALENDAR } from './kb/content-calendar';
import { DOC_AUDIOBOOK_GUIDE } from './kb/audiobook-production-guide';
import { DOC_EBOOK_STANDARDS } from './kb/ebook-standards';
import { DOC_PRINT_SPECS } from './kb/print-production-specs';
import { DOC_SENSITIVITY_READING } from './kb/sensitivity-reading-guide';
import { DOC_INTERNATIONAL_RIGHTS } from './kb/international-rights-guide';
import { DOC_SERIES_CONTINUITY } from './kb/series-continuity-bible';
import { DOC_ADVERTISING_BENCHMARKS } from './kb/advertising-benchmarks';
import { DOC_EMAIL_MARKETING } from './kb/email-marketing-playbook';
import { DOC_BETA_READER_GUIDELINES } from './kb/beta-reader-guidelines';
import { DOC_MEMBERSHIP_GUIDE } from './kb/membership-program-guide';
import { DOC_DISTRIBUTION_CHANNELS } from './kb/distribution-channel-guide';
import { DOC_ROYALTY_ACCOUNTING } from './kb/royalty-accounting-guide';
import { DOC_PUBLISHING_FUNDAMENTALS } from './kb/publishing-business-fundamentals';
import { DOC_ACQUISITION_STRATEGY } from './kb/acquisition-strategy';
import { DOC_METADATA_DISCOVERABILITY } from './kb/metadata-discoverability';
import { DOC_SALES_MERCHANDISING } from './kb/sales-merchandising';
import { DOC_EDITORIAL_RUBRIC } from './kb/editorial-standards-rubric';
import { DOC_PUBLISHING_ANALYTICS } from './kb/publishing-analytics-kpis';

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
  { id: 'brand-identity', title: 'Brand Identity & Style Guide', category: 'Publishing', icon: '🎨', lastUpdated: '2026-03-13', content: DOC_BRAND_IDENTITY },
  { id: 'contract-templates', title: 'Contract Templates & Legal Standards', category: 'Operations', icon: '📋', lastUpdated: '2026-03-13', content: DOC_CONTRACT_TEMPLATES },
  { id: 'freelancer-management', title: 'Freelancer Management', category: 'Operations', icon: '👥', lastUpdated: '2026-03-13', content: DOC_FREELANCER_MANAGEMENT },
  { id: 'financial-reporting', title: 'Financial Reporting & Accounting', category: 'Operations', icon: '📊', lastUpdated: '2026-03-13', content: DOC_FINANCIAL_REPORTING },
  { id: 'backlist-management', title: 'Backlist Management', category: 'Publishing', icon: '📚', lastUpdated: '2026-03-13', content: DOC_BACKLIST_MANAGEMENT },
  { id: 'rights-licensing', title: 'Rights & Licensing Playbook', category: 'Operations', icon: '⚖️', lastUpdated: '2026-03-13', content: DOC_RIGHTS_LICENSING },
  { id: 'author-platform', title: 'Author Platform Building Guide', category: 'Marketing', icon: '🚀', lastUpdated: '2026-03-13', content: DOC_AUTHOR_PLATFORM },
  { id: 'awards-strategy', title: 'Awards Strategy Calendar', category: 'Marketing', icon: '🏆', lastUpdated: '2026-03-13', content: DOC_AWARDS_STRATEGY },
  { id: 'social-media-content', title: 'Social Media Content Guidelines', category: 'Marketing', icon: '📲', lastUpdated: '2026-03-13', content: DOC_SOCIAL_MEDIA_CONTENT },
  { id: 'print-planning', title: 'Print Run Planning', category: 'Publishing', icon: '🖨️', lastUpdated: '2026-03-13', content: DOC_PRINT_PLANNING },
  { id: 'review-management', title: 'Review Management', category: 'Marketing', icon: '⭐', lastUpdated: '2026-03-13', content: DOC_REVIEW_MANAGEMENT },
  { id: 'content-calendar', title: 'Content Calendar Template', category: 'Marketing', icon: '📅', lastUpdated: '2026-03-13', content: DOC_CONTENT_CALENDAR },
  { id: 'accessibility-policy', title: 'Accessibility & Inclusion Policy', category: 'Operations', icon: '♿', lastUpdated: '2026-03-13', content: DOC_ACCESSIBILITY },
  { id: 'dei-policy', title: 'Diversity, Equity & Inclusion Policy', category: 'Operations', icon: '🌈', lastUpdated: '2026-03-13', content: DOC_DEI_POLICY },
  { id: 'data-privacy', title: 'Data Privacy & Author Data Policy', category: 'Operations', icon: '🔒', lastUpdated: '2026-03-13', content: DOC_DATA_PRIVACY },
  { id: 'crisis-comms', title: 'Crisis Communications Playbook', category: 'Operations', icon: '🚨', lastUpdated: '2026-03-13', content: DOC_CRISIS_COMMS },
  { id: 'grant-strategy', title: 'Grant & Funding Strategy', category: 'Operations', icon: '💵', lastUpdated: '2026-03-13', content: DOC_GRANT_STRATEGY },
  { id: 'author-onboarding', title: 'Onboarding Guide for New Authors', category: 'Publishing', icon: '🤝', lastUpdated: '2026-03-13', content: DOC_AUTHOR_ONBOARDING },
  { id: 'audiobook-production-guide', title: 'Audiobook Production Guide', category: 'Publishing', icon: '🎧', lastUpdated: '2026-03-13', content: DOC_AUDIOBOOK_GUIDE },
  { id: 'ebook-standards', title: 'eBook Format Standards & QA', category: 'Publishing', icon: '📱', lastUpdated: '2026-03-13', content: DOC_EBOOK_STANDARDS },
  { id: 'print-production-specs', title: 'Print Production Specifications', category: 'Publishing', icon: '🖨️', lastUpdated: '2026-03-13', content: DOC_PRINT_SPECS },
  { id: 'sensitivity-reading-guide', title: 'Sensitivity Reading Guide', category: 'Operations', icon: '🌍', lastUpdated: '2026-03-13', content: DOC_SENSITIVITY_READING },
  { id: 'international-rights-guide', title: 'International Rights & Translation', category: 'Operations', icon: '🌐', lastUpdated: '2026-03-13', content: DOC_INTERNATIONAL_RIGHTS },
  { id: 'series-continuity-bible', title: 'Series Continuity Bible & Strategy', category: 'Publishing', icon: '📚', lastUpdated: '2026-03-13', content: DOC_SERIES_CONTINUITY },
  { id: 'advertising-benchmarks', title: 'Advertising Benchmarks & Strategy', category: 'Marketing', icon: '📣', lastUpdated: '2026-03-13', content: DOC_ADVERTISING_BENCHMARKS },
  { id: 'email-marketing-playbook', title: 'Email Marketing Playbook', category: 'Marketing', icon: '📧', lastUpdated: '2026-03-13', content: DOC_EMAIL_MARKETING },
  { id: 'beta-reader-guidelines', title: 'Beta Reader Guidelines', category: 'Community', icon: '👥', lastUpdated: '2026-03-13', content: DOC_BETA_READER_GUIDELINES },
  { id: 'membership-program-guide', title: 'Membership Program Guide', category: 'Community', icon: '👑', lastUpdated: '2026-03-13', content: DOC_MEMBERSHIP_GUIDE },
  { id: 'distribution-channel-guide', title: 'Distribution Channel Guide', category: 'Partnerships', icon: '🏪', lastUpdated: '2026-03-13', content: DOC_DISTRIBUTION_CHANNELS },
  { id: 'royalty-accounting-guide', title: 'Royalty Accounting Guide', category: 'Operations', icon: '💰', lastUpdated: '2026-03-13', content: DOC_ROYALTY_ACCOUNTING },
  { id: 'publishing-fundamentals', title: 'Publishing Business Fundamentals', category: 'Operations', icon: '📊', lastUpdated: '2026-03-13', content: DOC_PUBLISHING_FUNDAMENTALS },
  { id: 'acquisition-strategy', title: 'Acquisition Strategy Guide', category: 'Publishing', icon: '🎯', lastUpdated: '2026-03-13', content: DOC_ACQUISITION_STRATEGY },
  { id: 'metadata-discoverability', title: 'Metadata & Discoverability', category: 'Marketing', icon: '🔍', lastUpdated: '2026-03-13', content: DOC_METADATA_DISCOVERABILITY },
  { id: 'sales-merchandising', title: 'Sales & Merchandising Guide', category: 'Marketing', icon: '🏷️', lastUpdated: '2026-03-13', content: DOC_SALES_MERCHANDISING },
  { id: 'editorial-standards-rubric', title: 'Editorial Standards & Rubric', category: 'Publishing', icon: '✏️', lastUpdated: '2026-03-13', content: DOC_EDITORIAL_RUBRIC },
  { id: 'publishing-analytics-kpis', title: 'Publishing Analytics & KPIs', category: 'Operations', icon: '📈', lastUpdated: '2026-03-13', content: DOC_PUBLISHING_ANALYTICS },
];
