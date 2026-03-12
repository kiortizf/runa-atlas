// ═══════════════════════════════════════════════════════════════
// THE RUNEWEAVE ARCHIVE — Types, Constants & Metadata
// ═══════════════════════════════════════════════════════════════

// ── Artifact Types ──────────────────────────────────────────────

export type ArtifactType =
  // Discover
  | 'CONSTELLATION_CURATION'
  | 'READING_PATH'
  | 'READ_ALIKE'
  | 'VIBE_PROFILE'
  // Discuss
  | 'DISCUSSION_PROMPT'
  | 'THREAD_SUMMARY'
  | 'READING_LOG'
  // Annotate
  | 'ANNOTATION_TRAIL'
  | 'QUOTE_CARD'
  | 'CRAFT_NOTE'
  | 'RESEARCH_DOSSIER'
  // Aesthetic
  | 'MOODBOARD'
  | 'PLAYLIST'
  | 'COLOR_PALETTE'
  | 'STYLE_ATLAS'
  // Artifacts
  | 'FIELD_NOTE'
  | 'LETTER'
  | 'POSTCARD'
  | 'MEMO_REPORT'
  | 'RECIPE_MENU'
  | 'MAP_DIAGRAM'
  | 'OBJECT_CATALOG'
  | 'TIMELINE'
  // Participate
  | 'TROPE_BINGO'
  | 'QUIZ'
  | 'SCAVENGER_HUNT'
  | 'READER_CHALLENGE';

export type ArtifactCategory =
  | 'DISCOVER'
  | 'DISCUSS'
  | 'ANNOTATE'
  | 'AESTHETIC'
  | 'ARTIFACTS'
  | 'PARTICIPATE';

export type ArtifactRating = 'G' | 'TEEN' | 'MATURE';
export type ArtifactStatus = 'draft' | 'pending' | 'published' | 'hidden';
export type ContributorLevel = 0 | 1 | 2;

export interface SpoilerScope {
  safeThroughChapter?: number;
  spoilsEnding: boolean;
}

export interface MediaItem {
  url: string;
  credit: string;
  altText: string;
}

export interface ExternalLink {
  platform: string; // 'spotify' | 'apple' | 'youtube' | 'other'
  url: string;
  label: string;
}

export interface CuratedBook {
  bookId?: string;     // internal Rüna Atlas book
  externalTitle?: string;
  externalAuthor?: string;
  note: string;
}

// ── Firestore Document Shape ────────────────────────────────────

export interface Artifact {
  id: string;
  type: ArtifactType;
  category: ArtifactCategory;

  // Attachments
  bookId?: string;
  bookTitle?: string;
  constellationId?: string;
  imprintId?: string;

  // Content
  title: string;
  summary: string;
  body: string; // markdown
  tags: string[];

  // Safety
  rating: ArtifactRating;
  contentWarnings: string[];
  spoilerScope: SpoilerScope;

  // Media
  media: MediaItem[];
  links: ExternalLink[];
  curatedBooks?: CuratedBook[]; // for CONSTELLATION_CURATION, READING_PATH, READ_ALIKE

  // Author
  authorUserId: string;
  authorDisplayName: string;
  authorPhotoURL?: string;

  // Status
  status: ArtifactStatus;
  membershipGated: boolean;

  // Timestamps
  createdAt: any; // Firestore Timestamp
  updatedAt: any;

  // Metrics
  likes: number;
  bookmarks: number;
  views: number;
  reports: number;
}

// ── Category Metadata ───────────────────────────────────────────

export interface CategoryMeta {
  id: ArtifactCategory;
  label: string;
  emoji: string;
  description: string;
  types: ArtifactType[];
}

export const ARCHIVE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'DISCOVER',
    label: 'Discover',
    emoji: '🔭',
    description: 'Curated lists, reading paths, and book connections',
    types: ['CONSTELLATION_CURATION', 'READING_PATH', 'READ_ALIKE', 'VIBE_PROFILE'],
  },
  {
    id: 'DISCUSS',
    label: 'Discuss',
    emoji: '💬',
    description: 'Prompts, summaries, and reading reflections',
    types: ['DISCUSSION_PROMPT', 'THREAD_SUMMARY', 'READING_LOG'],
  },
  {
    id: 'ANNOTATE',
    label: 'Annotate',
    emoji: '✍️',
    description: 'Deep dives into craft, quotes, and research',
    types: ['ANNOTATION_TRAIL', 'QUOTE_CARD', 'CRAFT_NOTE', 'RESEARCH_DOSSIER'],
  },
  {
    id: 'AESTHETIC',
    label: 'Aesthetic',
    emoji: '🎨',
    description: 'Moodboards, playlists, palettes, and visual companions',
    types: ['MOODBOARD', 'PLAYLIST', 'COLOR_PALETTE', 'STYLE_ATLAS'],
  },
  {
    id: 'ARTIFACTS',
    label: 'Artifacts',
    emoji: '📜',
    description: 'In-world documents, maps, and lore objects',
    types: ['FIELD_NOTE', 'LETTER', 'POSTCARD', 'MEMO_REPORT', 'RECIPE_MENU', 'MAP_DIAGRAM', 'OBJECT_CATALOG', 'TIMELINE'],
  },
  {
    id: 'PARTICIPATE',
    label: 'Participate',
    emoji: '🎮',
    description: 'Bingo cards, quizzes, scavenger hunts, and challenges',
    types: ['TROPE_BINGO', 'QUIZ', 'SCAVENGER_HUNT', 'READER_CHALLENGE'],
  },
];

// ── Per-Type Metadata ───────────────────────────────────────────

export interface TypeMeta {
  type: ArtifactType;
  category: ArtifactCategory;
  label: string;
  icon: string;     // Lucide icon name
  color: string;    // Tailwind color
  description: string;
  examples: { title: string; body: string }[];
}

export const ARTIFACT_TYPE_META: Record<ArtifactType, TypeMeta> = {
  // ── Discover ──
  CONSTELLATION_CURATION: {
    type: 'CONSTELLATION_CURATION',
    category: 'DISCOVER',
    label: 'Constellation Curation',
    icon: 'Sparkles',
    color: 'text-amber-400',
    description: 'A curated list of books (Rüna Atlas + optional comps) with a curator note on what binds them.',
    examples: [
      { title: 'Found Family Constellation', body: 'A curated list of 8 books with a 200-word curator note on what binds them — the ache of chosen kinship.' },
      { title: 'Worlds That Breathe', body: '6 titles where the setting is the main character. Curator note on immersive worldbuilding.' },
    ],
  },
  READING_PATH: {
    type: 'READING_PATH',
    category: 'DISCOVER',
    label: 'Reading Path',
    icon: 'Route',
    color: 'text-teal-400',
    description: 'An ordered reading sequence through multiple titles with rationale for each step.',
    examples: [
      { title: 'From Grief to Grace: A 5-Book Path', body: 'Start with the loss, move through the silence, end with the bloom. Each book is a waypoint.' },
      { title: 'The Anti-Hero Escalation', body: 'Begin morally gray, end pitch black. 4 books in ascending moral complexity.' },
    ],
  },
  READ_ALIKE: {
    type: 'READ_ALIKE',
    category: 'DISCOVER',
    label: 'Read-Alike',
    icon: 'ArrowLeftRight',
    color: 'text-sky-400',
    description: '"If you liked X, try Y" comparison pairings with notes on what connects them.',
    examples: [
      { title: 'If You Loved the Atmosphere of X', body: 'Both books share a sense of oppressive beauty — lush prose surrounding quiet dread.' },
    ],
  },
  VIBE_PROFILE: {
    type: 'VIBE_PROFILE',
    category: 'DISCOVER',
    label: 'Vibe Profile',
    icon: 'Waves',
    color: 'text-purple-400',
    description: 'A tone/mood profile for a book — atmosphere, pacing, emotional arc — without plot details.',
    examples: [
      { title: 'Slow Burn, Cold Core', body: 'Pacing: meditative. Mood: winter light through glass. Emotional arc: numbness → thaw → grief → release.' },
    ],
  },

  // ── Discuss ──
  DISCUSSION_PROMPT: {
    type: 'DISCUSSION_PROMPT',
    category: 'DISCUSS',
    label: 'Discussion Prompt',
    icon: 'MessageCircleQuestion',
    color: 'text-orange-400',
    description: 'An open-ended question designed to spark community discussion about themes or craft.',
    examples: [
      { title: 'What does "home" mean in this world?', body: 'A prompt exploring how the concept of belonging shifts across settings and characters.' },
    ],
  },
  THREAD_SUMMARY: {
    type: 'THREAD_SUMMARY',
    category: 'DISCUSS',
    label: 'Thread Summary',
    icon: 'ScrollText',
    color: 'text-lime-400',
    description: 'A curated summary of a past community discussion, preserving key insights.',
    examples: [
      { title: 'Best Takes from the "Magic Systems" Thread', body: 'Distilled highlights from 47 replies. Themes: cost, consent, cultural roots.' },
    ],
  },
  READING_LOG: {
    type: 'READING_LOG',
    category: 'DISCUSS',
    label: 'Reading Log',
    icon: 'BookOpenCheck',
    color: 'text-emerald-400',
    description: 'Dated progression notes capturing your reading journey. Respects spoiler scope.',
    examples: [
      { title: 'Chapter-by-Chapter Mood Journal', body: 'Ch 1: tense, disoriented. Ch 3: the first exhale. Ch 7: oh no.' },
    ],
  },

  // ── Annotate ──
  ANNOTATION_TRAIL: {
    type: 'ANNOTATION_TRAIL',
    category: 'ANNOTATE',
    label: 'Annotation Trail',
    icon: 'Footprints',
    color: 'text-indigo-400',
    description: 'A guided annotation path through chapters, highlighting motifs or craft choices.',
    examples: [
      { title: 'Tracking Water Imagery: Chapters 1-8', body: 'Every mention of water, rain, drowning — mapped and connected. No plot, just pattern.' },
    ],
  },
  QUOTE_CARD: {
    type: 'QUOTE_CARD',
    category: 'ANNOTATE',
    label: 'Quote Card',
    icon: 'Quote',
    color: 'text-rose-400',
    description: 'A formatted quote with page reference, context, and brief personal reflection.',
    examples: [
      { title: '"The silence had teeth."', body: 'Page 142. This line reframes every quiet scene before it. Reflection on how silence is weaponized in the prose.' },
    ],
  },
  CRAFT_NOTE: {
    type: 'CRAFT_NOTE',
    category: 'ANNOTATE',
    label: 'Craft Note',
    icon: 'Wrench',
    color: 'text-cyan-400',
    description: 'A reader essay analyzing craft elements — voice, structure, pacing, themes. Not a review.',
    examples: [
      { title: 'How the Second-Person POV Creates Complicity', body: 'An essay on why "you" makes the reader accountable for what happens next.' },
      { title: 'The Architecture of Short Chapters', body: 'Why 3-page chapters build momentum differently than 20-page ones.' },
    ],
  },
  RESEARCH_DOSSIER: {
    type: 'RESEARCH_DOSSIER',
    category: 'ANNOTATE',
    label: 'Research Dossier',
    icon: 'FileSearch',
    color: 'text-slate-400',
    description: 'Reader-compiled research links relevant to the book\'s themes, with cited sources.',
    examples: [
      { title: 'Real-World Parallels: Colonial Botany', body: '8 articles and 2 documentaries that illuminate the historical roots of the book\'s central metaphor.' },
    ],
  },

  // ── Aesthetic ──
  MOODBOARD: {
    type: 'MOODBOARD',
    category: 'AESTHETIC',
    label: 'Moodboard',
    icon: 'Image',
    color: 'text-pink-400',
    description: 'An image gallery with captions explaining why each image matches the world. Must credit sources.',
    examples: [
      { title: 'Textures of the World', body: '8 images with captions explaining why each matches the setting. Must credit sources and only use images you have rights to share.' },
    ],
  },
  PLAYLIST: {
    type: 'PLAYLIST',
    category: 'AESTHETIC',
    label: 'Playlist',
    icon: 'Music',
    color: 'text-green-400',
    description: 'A reading playlist with streaming links and one-line mood notes per track. Credit artists.',
    examples: [
      { title: 'Reading Playlist: Grief as Gravity', body: '10 songs + 1 sentence each explaining the mood they match. Links required. Credit artists.' },
      { title: 'The Soundtrack That Doesn\'t Exist', body: 'An original score concept: 8 tracks named for places in the book, genre-tagged.' },
    ],
  },
  COLOR_PALETTE: {
    type: 'COLOR_PALETTE',
    category: 'AESTHETIC',
    label: 'Color Palette',
    icon: 'Palette',
    color: 'text-fuchsia-400',
    description: 'A color theory companion with hex values, rationale, and emotional associations.',
    examples: [
      { title: 'The Palette of Decay', body: '6 colors: burnt umber (#8B4513), moss (#4A5D23)… Each mapped to a mood in the book.' },
    ],
  },
  STYLE_ATLAS: {
    type: 'STYLE_ATLAS',
    category: 'AESTHETIC',
    label: 'Style Atlas',
    icon: 'PaintBucket',
    color: 'text-violet-400',
    description: 'Typography, texture, and design language study inspired by the book\'s aesthetic.',
    examples: [
      { title: 'A Visual Language for the Archive', body: 'If this book were a design system: serif headers, rough paper textures, ink-blot dividers.' },
    ],
  },

  // ── Artifacts (in-world) ──
  FIELD_NOTE: {
    type: 'FIELD_NOTE',
    category: 'ARTIFACTS',
    label: 'Field Note',
    icon: 'NotebookPen',
    color: 'text-amber-500',
    description: 'Observational notes, world entries, lore glossaries, or specimen sheets. Non-canonical.',
    examples: [
      { title: 'Glossary of Terms for First-Time Travelers', body: 'A short glossary defining recurring terms and symbols. Includes pronunciation notes and thematic associations. No plot, no "what happens next."' },
      { title: 'Field Observations: Local Flora', body: 'A naturalist-style entry. Species name, habitat, uses, cultural significance. All inferred from published text.' },
    ],
  },
  LETTER: {
    type: 'LETTER',
    category: 'ARTIFACTS',
    label: 'Letter',
    icon: 'Mail',
    color: 'text-yellow-500',
    description: 'An epistolary artifact capturing emotion and atmosphere. Must not advance canon plot.',
    examples: [
      { title: 'Letter Never Sent', body: 'A character-adjacent letter that captures emotion and atmosphere, but does not reveal new events beyond what the book already contains.' },
    ],
  },
  POSTCARD: {
    type: 'POSTCARD',
    category: 'ARTIFACTS',
    label: 'Postcard',
    icon: 'FileImage',
    color: 'text-orange-500',
    description: 'Micro-ephemera: a brief in-world artifact under 200 words.',
    examples: [
      { title: 'Wish You Were Here (Somewhere Else)', body: 'A postcard from a place in the book. 3 sentences of atmosphere + a postmark date.' },
    ],
  },
  MEMO_REPORT: {
    type: 'MEMO_REPORT',
    category: 'ARTIFACTS',
    label: 'Memo / Report',
    icon: 'FileWarning',
    color: 'text-red-400',
    description: 'In-world bureaucratic document, incident report, inventory. Does not introduce new canon events.',
    examples: [
      { title: 'Incident Report: Unscheduled Phenomenon', body: 'Date, location, observed anomaly, recommended precautions. Written like a bureaucratic form. Does not introduce new canon events, only reframes tone and setting.' },
    ],
  },
  RECIPE_MENU: {
    type: 'RECIPE_MENU',
    category: 'ARTIFACTS',
    label: 'Recipe / Menu',
    icon: 'UtensilsCrossed',
    color: 'text-orange-300',
    description: 'Food as culture: menus, recipes, ritual instructions extrapolated from the text.',
    examples: [
      { title: 'A Menu for the Feast That Went Wrong', body: '5 courses with flavor notes and cultural context. The food tells the story of the world.' },
    ],
  },
  MAP_DIAGRAM: {
    type: 'MAP_DIAGRAM',
    category: 'ARTIFACTS',
    label: 'Map / Diagram',
    icon: 'Map',
    color: 'text-teal-500',
    description: 'Reader-created maps, floor plans, or diagrams based on published descriptions.',
    examples: [
      { title: 'The Market District (As Described in Ch. 3)', body: 'A hand-drawn map reconstructing spatial relationships from the text. Non-canonical, interpretation only.' },
    ],
  },
  OBJECT_CATALOG: {
    type: 'OBJECT_CATALOG',
    category: 'ARTIFACTS',
    label: 'Object Catalog',
    icon: 'Archive',
    color: 'text-stone-400',
    description: 'An inventory of notable objects, symbols, or artifacts mentioned in the text.',
    examples: [
      { title: 'Registry of Notable Objects', body: 'A museum-catalog-style entry for each significant object. Name, material, first mention, thematic weight.' },
    ],
  },
  TIMELINE: {
    type: 'TIMELINE',
    category: 'ARTIFACTS',
    label: 'Timeline',
    icon: 'Clock',
    color: 'text-blue-400',
    description: 'A visual chronology of known events, based only on published material.',
    examples: [
      { title: 'Before the Opening Page: What We Know', body: 'A chronological assembly of backstory events the text explicitly references.' },
    ],
  },

  // ── Participate ──
  TROPE_BINGO: {
    type: 'TROPE_BINGO',
    category: 'PARTICIPATE',
    label: 'Trope Bingo',
    icon: 'Grid3x3',
    color: 'text-pink-500',
    description: 'A customizable, shareable bingo card built from tropes, themes, or motifs.',
    examples: [
      { title: 'Found Family Trope Bingo', body: '5×5 grid: reluctant mentor, chosen one refuses, group meal scene, sacrifice play, "I\'m not leaving you."' },
    ],
  },
  QUIZ: {
    type: 'QUIZ',
    category: 'PARTICIPATE',
    label: 'Quiz',
    icon: 'HelpCircle',
    color: 'text-violet-500',
    description: '"Which constellation are you?" personality quiz tied to themes. No plot-spoiler answers.',
    examples: [
      { title: 'Which Constellation Matches Your Reading Style?', body: '8 questions mapping personality traits to constellations. Results are thematic, not plot-based.' },
    ],
  },
  SCAVENGER_HUNT: {
    type: 'SCAVENGER_HUNT',
    category: 'PARTICIPATE',
    label: 'Scavenger Hunt',
    icon: 'Search',
    color: 'text-emerald-500',
    description: 'Find symbols, motifs, or patterns across the text. No plot answers required.',
    examples: [
      { title: 'The Color Red: A Scavenger Hunt', body: 'Find every instance of the color red in the first 5 chapters. What pattern emerges?' },
    ],
  },
  READER_CHALLENGE: {
    type: 'READER_CHALLENGE',
    category: 'PARTICIPATE',
    label: 'Reader Challenge',
    icon: 'Trophy',
    color: 'text-yellow-400',
    description: 'Time-bound community challenge: readalong milestones, annotation goals, themed reading sprints.',
    examples: [
      { title: '7-Day Annotation Sprint', body: 'Read 1 chapter/day. Leave 3 annotations per chapter. Share your best find at the end of the week.' },
      { title: 'March Reading Marathon', body: 'Complete 3 books from the same constellation this month. Log your progress.' },
    ],
  },
};

// ── Rating Metadata ─────────────────────────────────────────────

export const RATING_META: Record<ArtifactRating, { label: string; color: string; description: string }> = {
  G: { label: 'General', color: 'text-green-400', description: 'Suitable for all audiences' },
  TEEN: { label: 'Teen+', color: 'text-amber-400', description: 'May contain mild thematic elements' },
  MATURE: { label: 'Mature', color: 'text-red-400', description: 'Contains mature themes, not explicit content' },
};

// ── Content Warning Suggestions ─────────────────────────────────

export const CONTENT_WARNING_SUGGESTIONS = [
  'Violence', 'Death', 'Grief', 'Body Horror', 'Mental Health',
  'Substance Use', 'War', 'Colonialism', 'Religious Themes',
  'Abuse', 'Isolation', 'Medical Themes', 'Animal Death',
];

// ── Tag Suggestions ─────────────────────────────────────────────

export const TAG_SUGGESTIONS = [
  'worldbuilding', 'character-study', 'magic-systems', 'found-family',
  'atmosphere', 'symbolism', 'craft-analysis', 'pacing', 'voice',
  'themes', 'food', 'music', 'visual', 'maps', 'lore', 'glossary',
  'humor', 'horror', 'romance', 'sci-fi', 'fantasy', 'literary',
  'afrofuturism', 'solarpunk', 'gothic', 'mythology', 'folklore',
  'queer', 'diaspora', 'identity', 'resistance', 'ecology',
];

// ── 20 Reusable Book-Agnostic Prompts ───────────────────────────

export const ARCHIVE_PROMPTS: { type: ArtifactType; prompt: string }[] = [
  { type: 'FIELD_NOTE', prompt: 'Create a glossary entry for a term, place, or concept that recurs in this book.' },
  { type: 'FIELD_NOTE', prompt: 'Write a "specimen sheet" for a plant, creature, or object described in the text.' },
  { type: 'LETTER', prompt: 'Draft a letter that a character might have written but never sent — capturing mood, not advancing plot.' },
  { type: 'MEMO_REPORT', prompt: 'Write an incident report for an event described in the book, as if filed by an in-world bureaucrat.' },
  { type: 'RECIPE_MENU', prompt: 'Design a menu for a meal mentioned or implied in the book. Include flavor notes and cultural context.' },
  { type: 'PLAYLIST', prompt: 'Curate a 10-track reading playlist. One sentence per song explaining the mood match.' },
  { type: 'MOODBOARD', prompt: 'Select 6-8 images that capture the aesthetic of a specific scene or setting. Credit all sources.' },
  { type: 'CONSTELLATION_CURATION', prompt: 'Curate a reading list of 5-8 books (any mix of Rüna Atlas + external) united by a single theme.' },
  { type: 'READING_PATH', prompt: 'Design a reading order for 3-5 books that creates an emotional journey from start to finish.' },
  { type: 'VIBE_PROFILE', prompt: 'Describe this book\'s vibe without mentioning any plot: pacing, mood, texture, emotional arc.' },
  { type: 'DISCUSSION_PROMPT', prompt: 'Pose an open-ended question about a theme in this book that invites multiple interpretations.' },
  { type: 'QUOTE_CARD', prompt: 'Select a line that changed how you read everything after it. Add context and reflection.' },
  { type: 'CRAFT_NOTE', prompt: 'Analyze one craft choice the author made — POV, structure, sentence rhythm — and explain its effect.' },
  { type: 'RESEARCH_DOSSIER', prompt: 'Compile 3-5 real-world articles or resources that illuminate a theme explored in this book.' },
  { type: 'COLOR_PALETTE', prompt: 'Build a 5-color palette for this book with hex values and emotional rationale for each.' },
  { type: 'TROPE_BINGO', prompt: 'Create a 5×5 bingo card of tropes, themes, or motifs readers might spot in this book.' },
  { type: 'SCAVENGER_HUNT', prompt: 'Design a hunt: find every instance of a specific symbol or motif across the first few chapters.' },
  { type: 'READER_CHALLENGE', prompt: 'Create a week-long reading challenge tied to this book or its constellation.' },
  { type: 'MAP_DIAGRAM', prompt: 'Reconstruct the geography of a setting from textual descriptions. Mark what\'s known vs. inferred.' },
  { type: 'OBJECT_CATALOG', prompt: 'Catalog 5 notable objects from the book: name, material, first appearance, symbolic weight.' },
];

// ── Helper: Get category for a type ─────────────────────────────

export function getCategoryForType(type: ArtifactType): ArtifactCategory {
  return ARTIFACT_TYPE_META[type].category;
}

export function getTypesForCategory(category: ArtifactCategory): ArtifactType[] {
  const cat = ARCHIVE_CATEGORIES.find(c => c.id === category);
  return cat ? cat.types : [];
}
