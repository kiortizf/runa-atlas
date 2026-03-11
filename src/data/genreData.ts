// ═══════════════════════════════════════════════════════════════
// GENRE & IMPRINT DATA — Rüna Atlas Publishing
// ═══════════════════════════════════════════════════════════════

// ── Imprint Definitions ─────────────────────────────────────

export interface Imprint {
  id: string;
  name: string;
  tagline: string;
  description: string;
  mission: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    border: string;
    text: string;
    gradientFrom: string;
    gradientTo: string;
  };
  icon: string; // emoji or lucide icon name
  slug: string;
}

export const IMPRINTS: Imprint[] = [
  {
    id: 'runa-atlas',
    name: 'Rüna Atlas Press',
    tagline: 'Stories become stars',
    description: 'BIPOC and Queer speculative fiction from all backgrounds. Cosmic, hopeful, transformative storytelling.',
    mission: 'We publish speculative fiction by marginalized authors — stories that reshape worlds, challenge power, and center the voices that mainstream publishing overlooks.',
    colors: {
      primary: 'text-starforge-gold',
      secondary: 'text-queer-purple',
      accent: 'bg-starforge-gold',
      bg: 'bg-starforge-gold/10',
      border: 'border-starforge-gold/30',
      text: 'text-starforge-gold',
      gradientFrom: 'from-starforge-gold/20',
      gradientTo: 'to-queer-purple/20',
    },
    icon: '✦',
    slug: 'runa-atlas',
  },
  {
    id: 'bohio-press',
    name: 'Bohío Press',
    tagline: 'Home is the story we carry',
    description: 'Puerto Rican authors telling Puerto Rican stories. Spanglish welcome. No apologies.',
    mission: 'Bohío Press centers Puerto Rican voices — island-born, diaspora, heritage — in speculative fiction rooted in the lived experience of Borinquen. We don\'t translate, we don\'t italicize, and we don\'t explain. Pa\'l mundo desde Borinquen.',
    colors: {
      primary: 'text-orange-400',
      secondary: 'text-sky-400',
      accent: 'bg-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-400/30',
      text: 'text-orange-400',
      gradientFrom: 'from-orange-500/20',
      gradientTo: 'to-sky-500/20',
    },
    icon: '☀',
    slug: 'bohio',
  },
  {
    id: 'void-noir',
    name: 'Void Noir',
    tagline: 'Where the dark looks back',
    description: 'Horror, dark fiction, and stories that leave marks. Literary horror by marginalized voices.',
    mission: 'Void Noir publishes the horror that mainstream won\'t touch — because it hits too close. Queer nightmares. Inherited hauntings. Bodies that remember. We don\'t look away.',
    colors: {
      primary: 'text-red-500',
      secondary: 'text-red-300',
      accent: 'bg-red-700',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-500',
      gradientFrom: 'from-red-900/30',
      gradientTo: 'to-purple-900/30',
    },
    icon: '🌑',
    slug: 'void-noir',
  },
];

// ── Genre & Subgenre Definitions ────────────────────────────

export interface Subgenre {
  id: string;
  name: string;
  description?: string;
}

export interface Genre {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  imprints: string[]; // which imprints publish this genre
  subgenres: Subgenre[];
}

export const GENRES: Genre[] = [
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Worlds of magic, myth, and wonder — from epic battles to cozy hearthside tales.',
    icon: '⚔️',
    color: 'text-purple-400',
    imprints: ['runa-atlas', 'bohio-press'],
    subgenres: [
      { id: 'epic-high', name: 'Epic / High Fantasy' },
      { id: 'dark-fantasy', name: 'Dark Fantasy' },
      { id: 'gothic-fantasy', name: 'Gothic Fantasy' },
      { id: 'urban-fantasy', name: 'Urban Fantasy' },
      { id: 'historical-fantasy', name: 'Historical Fantasy' },
      { id: 'romantic-fantasy', name: 'Romantic Fantasy (Romantasy)' },
      { id: 'mythic-fantasy', name: 'Mythic Fantasy', description: 'Mythology retellings' },
      { id: 'portal-fantasy', name: 'Portal Fantasy' },
      { id: 'gaslamp', name: 'Gaslamp / Gaslight Fantasy' },
      { id: 'clockpunk-steampunk', name: 'Clockpunk & Steampunk' },
      { id: 'silkpunk', name: 'Silkpunk & Wuxia-Influenced' },
      { id: 'sword-sorcery', name: 'Sword & Sorcery' },
      { id: 'cozy-fantasy', name: 'Cozy Fantasy' },
      { id: 'fantasy-manners', name: 'Fantasy of Manners' },
    ],
  },
  {
    id: 'scifi',
    name: 'Science Fiction',
    description: 'Futures imagined by the people they belong to — from solarpunk utopias to cybernetic resistance.',
    icon: '🚀',
    color: 'text-cyan-400',
    imprints: ['runa-atlas', 'bohio-press'],
    subgenres: [
      { id: 'space-opera', name: 'Space Opera' },
      { id: 'dystopian', name: 'Dystopian' },
      { id: 'post-apocalyptic', name: 'Post-Apocalyptic' },
      { id: 'solarpunk', name: 'Solarpunk' },
      { id: 'cyberpunk', name: 'Cyberpunk' },
      { id: 'biopunk', name: 'Biopunk' },
      { id: 'afrofuturism', name: 'Afrofuturism' },
      { id: 'indigenous-futurism', name: 'Indigenous Futurism' },
      { id: 'latinx-futurism', name: 'Latinx Futurism' },
      { id: 'cli-fi', name: 'Climate Fiction (Cli-Fi)' },
      { id: 'literary-scifi', name: 'Literary Sci-Fi' },
      { id: 'near-future', name: 'Near-Future Thriller' },
      { id: 'first-contact', name: 'First Contact' },
      { id: 'generation-ships', name: 'Generation Ships' },
      { id: 'ai-sentience', name: 'AI & Sentience' },
    ],
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Fear told by those who know it best. Not gore for shock — terror that interrogates power.',
    icon: '🌑',
    color: 'text-red-400',
    imprints: ['runa-atlas', 'void-noir'],
    subgenres: [
      { id: 'gothic-horror', name: 'Gothic Horror' },
      { id: 'cosmic-horror', name: 'Cosmic Horror', description: 'Lovecraftian reimagined — decolonized, new mythologies' },
      { id: 'folk-horror', name: 'Folk Horror', description: 'Cultural folklore as terror, from the source' },
      { id: 'supernatural-horror', name: 'Supernatural Horror' },
      { id: 'psychological-horror', name: 'Psychological Horror' },
      { id: 'body-horror', name: 'Body Horror', description: 'Transformation, autonomy, flesh as metaphor' },
      { id: 'haunted-place', name: 'Haunted House / Place' },
      { id: 'monster-fiction', name: 'Monster Fiction', description: 'Monsters as protagonists or metaphor' },
      { id: 'religious-horror', name: 'Religious Horror' },
      { id: 'quiet-horror', name: 'Quiet Horror', description: 'Literary, slow-burn, creeping dread' },
      { id: 'southern-gothic', name: 'Southern / Global Gothic' },
      { id: 'survival-horror', name: 'Survival Horror' },
    ],
  },
  {
    id: 'magical-realism',
    name: 'Magical Realism',
    description: 'Magic threaded through the everyday — not as escape, but as truth the real world can\'t contain.',
    icon: '✨',
    color: 'text-amber-400',
    imprints: ['runa-atlas', 'bohio-press'],
    subgenres: [
      { id: 'latin-american-mr', name: 'Latin American Magical Realism' },
      { id: 'caribbean-mr', name: 'Caribbean Magical Realism' },
      { id: 'african-mr', name: 'African Magical Realism' },
      { id: 'asian-mr', name: 'Asian Magical Realism' },
      { id: 'contemporary-mr', name: 'Contemporary Magical Realism' },
      { id: 'ancestral-magic', name: 'Ancestral / Generational Magic' },
      { id: 'diaspora-mr', name: 'Diaspora Magical Realism' },
    ],
  },
  {
    id: 'romance',
    name: 'Romance',
    description: 'Love stories with speculative elements — centering queer joy, desire, and happily-ever-afters.',
    icon: '💜',
    color: 'text-pink-400',
    imprints: ['runa-atlas', 'bohio-press'],
    subgenres: [
      { id: 'queer-romance', name: 'Queer Romance', description: 'All identities' },
      { id: 'paranormal-romance', name: 'Paranormal Romance' },
      { id: 'fantasy-romance', name: 'Fantasy Romance' },
      { id: 'scifi-romance', name: 'Sci-Fi Romance' },
      { id: 'gothic-romance', name: 'Gothic Romance' },
      { id: 'dark-romance', name: 'Dark Romance' },
      { id: 'romantasy', name: 'Romantasy' },
    ],
  },
  {
    id: 'literary-speculative',
    name: 'Literary Speculative',
    description: 'Stories that exist between genres — beautiful prose that defies easy shelf placement.',
    icon: '📖',
    color: 'text-indigo-400',
    imprints: ['runa-atlas', 'void-noir'],
    subgenres: [
      { id: 'slipstream', name: 'Slipstream' },
      { id: 'fabulism', name: 'Fabulism' },
      { id: 'weird-fiction', name: 'Weird Fiction' },
      { id: 'new-weird', name: 'New Weird' },
      { id: 'interstitial', name: 'Interstitial Fiction' },
      { id: 'anthropological', name: 'Anthropological Fiction' },
      { id: 'speculative-memoir', name: 'Speculative Memoir (Hybrid)' },
    ],
  },
  {
    id: 'thriller',
    name: 'Thriller / Suspense',
    description: 'Tension and dread with speculative elements — the conspiratorial, the supernatural, the technological.',
    icon: '🔥',
    color: 'text-orange-400',
    imprints: ['runa-atlas', 'void-noir'],
    subgenres: [
      { id: 'supernatural-suspense', name: 'Supernatural Suspense' },
      { id: 'psych-thriller', name: 'Psychological Thriller (Speculative)' },
      { id: 'techno-thriller', name: 'Techno-Thriller' },
      { id: 'conspiracy', name: 'Conspiracy (with Speculative Elements)' },
      { id: 'occult-thriller', name: 'Occult Thriller' },
    ],
  },
  {
    id: 'short-fiction',
    name: 'Short Fiction',
    description: 'Anthologies, collections, novellas, and serialized work — complete worlds in compact form.',
    icon: '📜',
    color: 'text-emerald-400',
    imprints: ['runa-atlas', 'bohio-press', 'void-noir'],
    subgenres: [
      { id: 'collections', name: 'Single-Author Collections' },
      { id: 'anthologies', name: 'Anthologies (Themed)' },
      { id: 'novellas', name: 'Novellas' },
      { id: 'serialized', name: 'Serialized Fiction' },
    ],
  },
];

// ── Bohío Press Specific Genres ─────────────────────────────

export const BOHIO_GENRES: Subgenre[] = [
  { id: 'pr-magical-realism', name: 'Puerto Rican Magical Realism' },
  { id: 'caribbean-gothic', name: 'Caribbean Gothic' },
  { id: 'taino-fantasy', name: 'Taíno-Inspired Fantasy' },
  { id: 'diaspora-narratives', name: 'Diaspora Narratives', description: 'Nuyorican, Orlando, Chicago' },
  { id: 'hurricane-cli-fi', name: 'Hurricane / Climate Fiction', description: 'Borikén-specific' },
  { id: 'pr-historical-fantasy', name: 'Historical Fantasy', description: 'Taíno, Spanish colonial, US colonial' },
  { id: 'afro-boricua-spec', name: 'Afro-Boricua Speculative' },
  { id: 'queer-pr', name: 'Queer Puerto Rican Stories' },
  { id: 'spanglish-narratives', name: 'Spanglish-Inclusive Narratives' },
  { id: 'isla-horror', name: 'La Isla Speculative Horror', description: 'Folklore: chupacabra, el cuco, llorona variants' },
  { id: 'nuyorican-futurism', name: 'Nuyorican Cyberpunk / Futurism' },
];

// ── Void Noir Specific Genres ───────────────────────────────

export const VOID_NOIR_GENRES: Subgenre[] = [
  { id: 'vn-cosmic', name: 'Cosmic Horror', description: 'Lovecraftian dread, decolonized — new mythologies' },
  { id: 'vn-folk', name: 'Folk Horror', description: 'Cultural folklore as terror — from the source' },
  { id: 'vn-gothic', name: 'Gothic', description: 'Crumbling estates, family secrets, queer longing' },
  { id: 'vn-body', name: 'Body Horror', description: 'Transformation, autonomy, flesh as metaphor' },
  { id: 'vn-psych', name: 'Psychological Horror', description: 'The terror inside the mind' },
  { id: 'vn-supernatural', name: 'Supernatural', description: 'Ghosts, hauntings, the uncanny' },
  { id: 'vn-quiet', name: 'Quiet Horror', description: 'Literary, slow-burn, creeping dread' },
  { id: 'vn-monster', name: 'Monster Fiction', description: 'Monsters as protagonists or metaphor' },
  { id: 'vn-religious', name: 'Religious Horror', description: 'Faith, doubt, divine terror' },
  { id: 'vn-survival', name: 'Survival Horror', description: 'Against impossible odds' },
  { id: 'vn-southern-gothic', name: 'Southern / Global Gothic' },
  { id: 'vn-dark-fantasy', name: 'Dark Fantasy' },
  { id: 'vn-grimdark', name: 'Grimdark', description: 'Selective — must transcend mere violence' },
];

// ── Thematic Tags ───────────────────────────────────────────

export interface ThematicTag {
  id: string;
  name: string;
  hashtag: string;
  description: string;
  color: string;
}

export const THEMATIC_TAGS: ThematicTag[] = [
  { id: 'ownvoices', name: 'Own Voices', hashtag: '#OwnVoices', description: 'Author shares identity with protagonist', color: 'bg-amber-500/20 text-amber-300' },
  { id: 'queerlove', name: 'Queer Love', hashtag: '#QueerLove', description: 'Central queer romantic arc', color: 'bg-pink-500/20 text-pink-300' },
  { id: 'foundfamily', name: 'Found Family', hashtag: '#FoundFamily', description: 'Chosen family over blood', color: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'diaspora', name: 'Diaspora', hashtag: '#Diaspora', description: 'Immigration, displacement, cultural identity', color: 'bg-sky-500/20 text-sky-300' },
  { id: 'decolonization', name: 'Decolonization', hashtag: '#Decolonization', description: 'Challenging colonial narratives', color: 'bg-orange-500/20 text-orange-300' },
  { id: 'ancestralmagic', name: 'Ancestral Magic', hashtag: '#AncestralMagic', description: 'Magic rooted in heritage/culture', color: 'bg-violet-500/20 text-violet-300' },
  { id: 'bodyautonomy', name: 'Body Autonomy', hashtag: '#BodyAutonomy', description: 'Bodily agency as theme', color: 'bg-rose-500/20 text-rose-300' },
  { id: 'mentalhealth', name: 'Mental Health', hashtag: '#MentalHealth', description: 'Thoughtful mental health representation', color: 'bg-teal-500/20 text-teal-300' },
  { id: 'disability', name: 'Disability', hashtag: '#Disability', description: 'Disability representation', color: 'bg-blue-500/20 text-blue-300' },
  { id: 'genderexpansive', name: 'Gender Expansive', hashtag: '#GenderExpansive', description: 'Non-binary, trans, gender-diverse rep', color: 'bg-fuchsia-500/20 text-fuchsia-300' },
  { id: 'transjoy', name: 'Trans Joy', hashtag: '#TransJoy', description: 'Trans characters living fully, not just surviving', color: 'bg-sky-500/20 text-sky-300' },
  { id: 'sapphic', name: 'Sapphic', hashtag: '#Sapphic', description: 'WLW central to story', color: 'bg-pink-500/20 text-pink-300' },
  { id: 'achillean', name: 'Achillean', hashtag: '#Achillean', description: 'MLM central to story', color: 'bg-blue-500/20 text-blue-300' },
  { id: 'bisexual', name: 'Bisexual', hashtag: '#Bisexual', description: 'Bi/pan representation', color: 'bg-purple-500/20 text-purple-300' },
  { id: 'asexual', name: 'Asexual', hashtag: '#Asexual', description: 'Ace spectrum representation', color: 'bg-gray-500/20 text-gray-300' },
  { id: 'polyamory', name: 'Polyamory', hashtag: '#Polyamory', description: 'Ethical non-monogamy', color: 'bg-purple-500/20 text-purple-300' },
  { id: 'indigenous', name: 'Indigenous', hashtag: '#Indigenous', description: 'Indigenous perspectives and worldviews', color: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'afrocentered', name: 'Afro-Centered', hashtag: '#AfroCentered', description: 'Black protagonists, Afrodiasporic culture', color: 'bg-amber-500/20 text-amber-300' },
  { id: 'anticolonial', name: 'Anti-Colonial', hashtag: '#AntiColonial', description: 'Resistance to empire and erasure', color: 'bg-red-500/20 text-red-300' },
  { id: 'classconscious', name: 'Class Conscious', hashtag: '#ClassConscious', description: 'Poverty, wealth disparity, labor', color: 'bg-zinc-500/20 text-zinc-300' },
  { id: 'slowburn', name: 'Slow Burn', hashtag: '#SlowBurn', description: 'Tension, anticipation', color: 'bg-amber-500/20 text-amber-300' },
  { id: 'morallygray', name: 'Morally Gray', hashtag: '#MorallyGray', description: 'Complex, ambiguous characters', color: 'bg-zinc-500/20 text-zinc-300' },
  { id: 'villains', name: 'Villains', hashtag: '#Villains', description: 'Villain POV or redemption', color: 'bg-red-500/20 text-red-300' },
  { id: 'revenge', name: 'Revenge', hashtag: '#Revenge', description: 'Vengeance narrative', color: 'bg-red-500/20 text-red-300' },
  { id: 'revolution', name: 'Revolution', hashtag: '#Revolution', description: 'Resistance, uprising', color: 'bg-orange-500/20 text-orange-300' },
  { id: 'survival', name: 'Survival', hashtag: '#Survival', description: 'Against odds', color: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'grief', name: 'Grief', hashtag: '#Grief', description: 'Processing loss', color: 'bg-indigo-500/20 text-indigo-300' },
  { id: 'identity', name: 'Identity', hashtag: '#Identity', description: 'Self-discovery', color: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'darkacademia', name: 'Dark Academia', hashtag: '#DarkAcademia', description: 'Knowledge, obsession, hidden societies', color: 'bg-stone-500/20 text-stone-300' },
  { id: 'fairytaleretelling', name: 'Fairy Tale Retelling', hashtag: '#FairyTaleRetelling', description: 'Classic tales reimagined', color: 'bg-violet-500/20 text-violet-300' },
  { id: 'multiplepov', name: 'Multiple POV', hashtag: '#MultiplePOV', description: 'Multiple narrative perspectives', color: 'bg-teal-500/20 text-teal-300' },
  { id: 'unreliablenarrator', name: 'Unreliable Narrator', hashtag: '#UnreliableNarrator', description: 'Can you trust the storyteller?', color: 'bg-amber-500/20 text-amber-300' },
  { id: 'secondchance', name: 'Second Chance', hashtag: '#SecondChance', description: 'Redemption, starting over', color: 'bg-emerald-500/20 text-emerald-300' },
];

// ── Not Publishing ──────────────────────────────────────────

export const NOT_PUBLISHING = [
  'Contemporary realism (no speculative elements)',
  'Cozy mysteries (unless magical)',
  'Military sci-fi (combat-focused)',
  'Hard sci-fi (engineering-focused)',
  'LitRPG / GameLit',
  'Erotica (as primary genre)',
  'Children\'s / Middle Grade',
  'Non-fiction (for now)',
  'Poetry (for now)',
];

// ── Helpers ─────────────────────────────────────────────────

export function getImprintById(id: string): Imprint | undefined {
  return IMPRINTS.find(i => i.id === id);
}

export function getGenresForImprint(imprintId: string): Genre[] {
  return GENRES.filter(g => g.imprints.includes(imprintId));
}

export function getAllSubgenres(): Subgenre[] {
  return GENRES.flatMap(g => g.subgenres);
}

export function getGenreSelectOptions(): { value: string; label: string; group: string }[] {
  return GENRES.flatMap(g =>
    g.subgenres.map(sg => ({
      value: sg.id,
      label: sg.name,
      group: g.name,
    }))
  );
}

// ── Genre Enrichment Data ──────────────────────────────────

export interface NotableTitle {
  title: string;
  author: string;
}

export interface GenreEnrichment {
  readerHook: string;
  notableVoices: NotableTitle[];
  ifYouLike: { like: string; try: string; because: string }[];
  whyWePublish: string;
}

export const GENRE_ENRICHMENT: Record<string, GenreEnrichment> = {
  fantasy: {
    readerHook: 'Fantasy lets you step into worlds where the rules are different — and see how power, identity, and belonging shift when magic rewrites the social contract. The best fantasy doesn\'t escape reality; it illuminates it through a different lens.',
    notableVoices: [
      { title: 'The Fifth Season', author: 'N.K. Jemisin' },
      { title: 'The Priory of the Orange Tree', author: 'Samantha Shannon' },
      { title: 'Black Sun', author: 'Rebecca Roanhorse' },
      { title: 'The Jasmine Throne', author: 'Tasha Suri' },
      { title: 'Master of Djinn', author: 'P. Djèlí Clark' },
      { title: 'She Who Became the Sun', author: 'Shelley Parker-Chan' },
      { title: 'Legendborn', author: 'Tracy Deonn' },
      { title: 'The Rage of Dragons', author: 'Evan Winter' },
      { title: 'Jade City', author: 'Fonda Lee' },
      { title: 'The Unbroken', author: 'C.L. Clark' },
    ],
    ifYouLike: [
      { like: 'Epic Fantasy', try: 'Afrofuturism', because: 'Same grand scale, entirely new cosmologies and power structures' },
      { like: 'Romantasy', try: 'Gothic Romance', because: 'The tension, but darker — crumbling estates instead of courts' },
      { like: 'Cozy Fantasy', try: 'Contemporary Magical Realism', because: 'Same warmth and intimacy, grounded in the real world' },
      { like: 'Dark Fantasy', try: 'Quiet Horror', because: 'The dread goes internal — slow burn instead of sword fights' },
    ],
    whyWePublish: 'Fantasy has always belonged to the margin — to the dreamers who needed other worlds because this one wasn\'t built for them. We publish fantasy that centers the peoples and mythologies that Tolkien\'s heirs overlooked.',
  },
  scifi: {
    readerHook: 'The future isn\'t written yet. Sci-fi gives us the language to imagine what comes next — and who gets to build it. In our catalog, the futures belong to the people who\'ve been surviving impossible presents.',
    notableVoices: [
      { title: 'Parable of the Sower', author: 'Octavia E. Butler' },
      { title: 'An Unkindness of Ghosts', author: 'Rivers Solomon' },
      { title: 'The Memory Librarian', author: 'Janelle Monáe' },
      { title: 'A Memory Called Empire', author: 'Arkady Martine' },
      { title: 'The Space Between Worlds', author: 'Micaiah Johnson' },
      { title: 'Translation State', author: 'Ann Leckie' },
      { title: 'Light From Uncommon Stars', author: 'Ryka Aoki' },
      { title: 'The Deep', author: 'Rivers Solomon' },
      { title: 'A Psalm for the Wild-Built', author: 'Becky Chambers' },
      { title: 'Gods, Monsters, and the Lucky Peach', author: 'Kelly Robson' },
    ],
    ifYouLike: [
      { like: 'Cyberpunk', try: 'Latinx Futurism', because: 'Same grit and tech resistance, but from Latine perspectives and barrio futures' },
      { like: 'Space Opera', try: 'Epic Fantasy', because: 'Swap starships for swords — same sweeping scope and political intrigue' },
      { like: 'Solarpunk', try: 'Cozy Fantasy', because: 'Both radically hopeful, both about community rebuilding — one with tech, one with magic' },
      { like: 'Dystopian', try: 'Literary Speculative', because: 'Same questions about systems and control, but told slant' },
    ],
    whyWePublish: 'The people building the future should be the ones imagining it. We publish sci-fi by BIPOC and queer authors because their visions of tomorrow include perspectives that mainstream futures erase.',
  },
  horror: {
    readerHook: 'Horror is the genre of truth-telling. It gives us permission to look at the things we\'re afraid to name — systemic violence, inherited trauma, bodily autonomy — and face them in a space where fear is the point, not the accident.',
    notableVoices: [
      { title: 'Mexican Gothic', author: 'Silvia Moreno-Garcia' },
      { title: 'The Only Good Indians', author: 'Stephen Graham Jones' },
      { title: 'Ring Shout', author: 'P. Djèlí Clark' },
      { title: 'Her Body and Other Parties', author: 'Carmen Maria Machado' },
      { title: 'The Haunting of Hill House', author: 'Shirley Jackson' },
      { title: 'White Is for Witching', author: 'Helen Oyeyemi' },
      { title: 'Certain Dark Things', author: 'Silvia Moreno-Garcia' },
      { title: 'The Ballad of Black Tom', author: 'Victor LaValle' },
      { title: 'In the Dream House', author: 'Carmen Maria Machado' },
      { title: 'My Heart Is a Chainsaw', author: 'Stephen Graham Jones' },
    ],
    ifYouLike: [
      { like: 'Gothic Horror', try: 'Gothic Romance', because: 'Same crumbling estates and dark secrets, but love survives the haunting' },
      { like: 'Folk Horror', try: 'Ancestral Magic (Magical Realism)', because: 'The folklore stays — the dread lifts into wonder' },
      { like: 'Cosmic Horror', try: 'New Weird', because: 'Same sense of wrongness and cosmic scale, less explicitly afraid' },
      { like: 'Psychological Horror', try: 'Psychological Thriller', because: 'The mind games continue — the supernatural recedes but the tension doesn\'t' },
    ],
    whyWePublish: 'Horror belongs to the hunted, the haunted, the survived. Void Noir exists because the scariest stories in the world are being written by people who\'ve lived through what others only imagine.',
  },
  'magical-realism': {
    readerHook: 'In magical realism, there\'s no portal, no inciting spell — the world simply is enchanted, and the characters know it the same way you know grief or joy. It\'s the genre closest to how marginalized people already experience reality: layered, ancestral, alive.',
    notableVoices: [
      { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez' },
      { title: 'Beloved', author: 'Toni Morrison' },
      { title: 'The House of the Spirits', author: 'Isabel Allende' },
      { title: 'The House on Mango Street', author: 'Sandra Cisneros' },
      { title: 'Freshwater', author: 'Akwaeke Emezi' },
      { title: 'Dominicana', author: 'Angie Cruz' },
      { title: 'The Water Dancer', author: 'Ta-Nehisi Coates' },
      { title: 'Gods of Jade and Shadow', author: 'Silvia Moreno-Garcia' },
      { title: 'When the Moon Was Ours', author: 'Anna-Marie McLemore' },
      { title: 'Olga Dies Dreaming', author: 'Xochitl Gonzalez' },
    ],
    ifYouLike: [
      { like: 'Latin American Magical Realism', try: 'Caribbean Magical Realism', because: 'Same layered reality, new cosmology — Afro-Caribbean spiritual traditions meet island life' },
      { like: 'Diaspora Magical Realism', try: 'Urban Fantasy', because: 'Same city-rooted magic, but urban fantasy leans into the explicit supernatural' },
      { like: 'Contemporary Magical Realism', try: 'Slipstream', because: 'Same blurred reality — slipstream just refuses to explain which side you\'re on' },
      { like: 'Ancestral Magic', try: 'Historical Fantasy', because: 'The ancestors were always here — now see them in their own time' },
    ],
    whyWePublish: 'Magical realism isn\'t a device for us — it\'s a tradition. The genre\'s roots are in Latin American, Caribbean, and African storytelling, and those are the voices we center. If the magic doesn\'t come from somewhere real, we can tell.',
  },
  romance: {
    readerHook: 'Love stories are radical when the lovers were never supposed to exist, let alone find each other. Our romance catalog centers queer joy, interracial love, disabled desire, and happily-ever-afters for people who\'ve been told they don\'t get one.',
    notableVoices: [
      { title: 'Red, White & Royal Blue', author: 'Casey McQuiston' },
      { title: 'Boyfriend Material', author: 'Alexis Hall' },
      { title: 'The Kiss Quotient', author: 'Helen Hoang' },
      { title: 'In Other Lands', author: 'Sarah Rees Brennan' },
      { title: 'A Master of Djinn', author: 'P. Djèlí Clark' },
      { title: 'Iron Widow', author: 'Xiran Jay Zhao' },
      { title: 'Cemetery Boys', author: 'Aiden Thomas' },
      { title: 'Written in the Stars', author: 'Alexandria Bellefleur' },
      { title: 'One Last Stop', author: 'Casey McQuiston' },
      { title: 'A Taste of Gold and Iron', author: 'Alexandra Rowland' },
    ],
    ifYouLike: [
      { like: 'Romantasy', try: 'Dark Fantasy', because: 'Keep the court intrigue, dial up the danger — love in impossible circumstances' },
      { like: 'Queer Romance', try: 'Contemporary Magical Realism', because: 'Same warmth and intimacy, with a touch of everyday magic' },
      { like: 'Dark Romance', try: 'Gothic Horror', because: 'Push past the tension into genuine dread — desire meets danger' },
      { like: 'Paranormal Romance', try: 'Monster Fiction', because: 'What if the monster isn\'t the love interest — what if the monster IS the story?' },
    ],
    whyWePublish: 'HEA isn\'t just a genre requirement — it\'s a political act when the lovers are queer, disabled, neurodivergent, or people of color. We publish romance because everyone deserves to see themselves in love stories.',
  },
  'literary-speculative': {
    readerHook: 'These stories refuse the shelf. They use speculative elements not as world-building but as emotional architecture — the weird, the surreal, the uncanny become ways to say what realist fiction can\'t reach. For readers who want to feel dislocated in the best way.',
    notableVoices: [
      { title: 'Piranesi', author: 'Susanna Clarke' },
      { title: 'The Vegetable', author: 'Han Kang' },
      { title: 'Interior Chinatown', author: 'Charles Yu' },
      { title: 'Detransition, Baby', author: 'Torrey Peters' },
      { title: 'Fevered Star', author: 'Rebecca Roanhorse' },
      { title: 'The City We Became', author: 'N.K. Jemisin' },
      { title: 'On Earth We\'re Briefly Gorgeous', author: 'Ocean Vuong' },
      { title: 'The Devourers', author: 'Indra Das' },
      { title: 'Bunny', author: 'Mona Awad' },
      { title: 'Klara and the Sun', author: 'Kazuo Ishiguro' },
    ],
    ifYouLike: [
      { like: 'Slipstream', try: 'Quiet Horror', because: 'The unease is the same — slipstream just doesn\'t name it fear' },
      { like: 'New Weird', try: 'Cosmic Horror', because: 'Scale up the strangeness and let it terrify you' },
      { like: 'Fabulism', try: 'Magical Realism', because: 'Same dreamlike quality, but rooted in specific cultural traditions' },
      { like: 'Speculative Memoir', try: 'Diaspora Magical Realism', because: 'Real life, enchanted — the boundary between memory and magic dissolves' },
    ],
    whyWePublish: 'Some of the most important work in speculative fiction happens in the spaces between genres. We make room for the un-shelvable because the most marginalized stories are often the hardest to categorize.',
  },
  thriller: {
    readerHook: 'Speculative thrillers take the dread of "what\'s really going on?" and add "what if the conspiracy is actually supernatural?" Heart-pounding pacing meets world-altering stakes — for readers who want to stay up all night.',
    notableVoices: [
      { title: 'The Southern Book Club\'s Guide to Slaying Vampires', author: 'Grady Hendrix' },
      { title: 'Recursion', author: 'Blake Crouch' },
      { title: 'The Girl with All the Gifts', author: 'M.R. Carey' },
      { title: 'Mexican Gothic', author: 'Silvia Moreno-Garcia' },
      { title: 'The Changeling', author: 'Victor LaValle' },
      { title: 'Wilder Girls', author: 'Rory Power' },
      { title: 'Tender Is the Flesh', author: 'Agustina Bazterrica' },
      { title: 'The Luminous Dead', author: 'Caitlin Starling' },
    ],
    ifYouLike: [
      { like: 'Supernatural Suspense', try: 'Gothic Horror', because: 'Same atmosphere, but the haunting takes center stage' },
      { like: 'Psychological Thriller', try: 'Quiet Horror', because: 'The dread deepens — from "am I crazy?" to "is reality itself wrong?"' },
      { like: 'Techno-Thriller', try: 'Cyberpunk', because: 'The tech conspiracy becomes the entire world' },
      { like: 'Occult Thriller', try: 'Dark Fantasy', because: 'The occult isn\'t just a threat — it\'s the magic system' },
    ],
    whyWePublish: 'Thrillers reach readers who might not pick up "fantasy" or "sci-fi" — but who are ready for the speculative. These are gateway books, and we want the gateway to lead to diverse voices.',
  },
  'short-fiction': {
    readerHook: 'Complete worlds in concentrated form. Short fiction is where writers take the biggest risks — an anthology can give you ten wildly different voices in one sitting. If novels are albums, short fiction is the playlist that changes your taste.',
    notableVoices: [
      { title: 'Exhalation', author: 'Ted Chiang' },
      { title: 'How Long \'Til Black Future Month', author: 'N.K. Jemisin' },
      { title: 'Her Body and Other Parties', author: 'Carmen Maria Machado' },
      { title: 'Friday Black', author: 'Nana Kwame Adjei-Brenyah' },
      { title: 'The Secret Lives of Church Ladies', author: 'Deesha Philyaw' },
      { title: 'Sabrina & Corina', author: 'Kali Fajardo-Anstine' },
      { title: 'You Sexy Thing', author: 'Cat Rambo' },
      { title: 'Even Though I Knew the End', author: 'C.L. Polk' },
    ],
    ifYouLike: [
      { like: 'Themed Anthologies', try: 'Any genre on this page', because: 'Anthologies are the best way to sample a genre before committing to a novel' },
      { like: 'Novellas', try: 'Literary Speculative', because: 'The novella form rewards density — literary spec thrives at this length' },
      { like: 'Single-Author Collections', try: 'Fabulism', because: 'Collections let fabulists build a whole worldview across linked stories' },
      { like: 'Serialized Fiction', try: 'Space Opera', because: 'The episodic structure is built for sweeping sagas' },
    ],
    whyWePublish: 'Short fiction is where emerging writers prove themselves and established writers experiment. We publish it because so many BIPOC and queer voices get their start here — and because some stories only need 30,000 words to change your life.',
  },
};
