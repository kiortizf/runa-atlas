import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, Search, ArrowRight,
  BookOpen, Sparkles, X, Hash, Heart, Compass, Feather,
  Eye, AlertTriangle, Star, Flame, Info, Globe, Users, Zap
} from 'lucide-react';
import {
  GENRES, IMPRINTS, THEMATIC_TAGS, NOT_PUBLISHING,
  BOHIO_GENRES, VOID_NOIR_GENRES, GENRE_ENRICHMENT,
  type Genre
} from '../data/genreData';

// ═══════════════════════════════════════════════════════════════
// GENRE CATALOG — Reader and Author Resource
// ═══════════════════════════════════════════════════════════════

// Mood-based discovery data
const MOODS = [
  { id: 'hopeful', label: 'Hopeful & Warm', icon: '☀️', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    genres: ['cozy-fantasy', 'solarpunk', 'queer-romance', 'fantasy-romance', 'contemporary-mr'],
    desc: 'Stories that leave you feeling good — found family, queer joy, soft magic.' },
  { id: 'cerebral', label: 'Cerebral & Mind-Bending', icon: '🧠', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    genres: ['slipstream', 'literary-scifi', 'psych-thriller', 'weird-fiction', 'ai-sentience'],
    desc: 'Stories that break your brain — philosophical, strange, intellectually thrilling.' },
  { id: 'epic', label: 'Epic & Sweeping', icon: '⚔️', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    genres: ['epic-high', 'space-opera', 'generation-ships', 'sword-sorcery', 'first-contact'],
    desc: 'Big worlds, bigger stakes — battles, quests, cosmos-spanning narratives.' },
  { id: 'dread', label: 'Dark & Unsettling', icon: '🌑', color: 'bg-red-500/10 text-red-300 border-red-500/20',
    genres: ['gothic-horror', 'cosmic-horror', 'psychological-horror', 'quiet-horror', 'body-horror'],
    desc: 'Stories that leave marks — literary horror, creeping dread, beautiful terror.' },
  { id: 'rooted', label: 'Rooted & Cultural', icon: '🌿', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    genres: ['latin-american-mr', 'caribbean-mr', 'african-mr', 'diaspora-mr', 'folk-horror', 'ancestral-magic'],
    desc: 'Stories from specific places and peoples — diaspora, myth, homeland.' },
  { id: 'resistance', label: 'Resistance & Revolution', icon: '🔥', color: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    genres: ['dystopian', 'cyberpunk', 'afrofuturism', 'indigenous-futurism', 'cli-fi'],
    desc: 'Stories that challenge power — uprising, survival, reclaiming futures.' },
  { id: 'romantic', label: 'Romantic & Yearning', icon: '💜', color: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    genres: ['romantasy', 'paranormal-romance', 'gothic-romance', 'dark-romance', 'romantic-fantasy'],
    desc: 'Love stories intertwined with the speculative — desire, longing, joy.' },
  { id: 'weird', label: 'Weird & Uncategorizable', icon: '✨', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    genres: ['new-weird', 'fabulism', 'interstitial', 'anthropological', 'speculative-memoir'],
    desc: 'Stories that defy shelving — genre-fluid, experimental, beautifully strange.' },
];

// Submission tips per genre
const SUBMISSION_TIPS: Record<string, string> = {
  fantasy: 'We love fantasy that centers marginalized protagonists. Show us the magic system in action early. Diverse worldbuilding > European-default.',
  scifi: 'Character-driven sci-fi wins over hard-sci. We want futures imagined by the people they belong to. Avoid military-first narratives.',
  horror: 'Literary horror preferred over gore. We want to know what scares YOU, not what Hollywood taught you to fear. Void Noir imprint specializes here.',
  'magical-realism': 'Root it in lived experience. We can tell when the magic comes from research vs. when it comes from heritage. Both can work — but be honest about which.',
  romance: 'HEA or HFN required. We center queer romance especially — all identities welcome. Spice level: author\'s choice but flag it.',
  'literary-speculative': 'Beautiful prose is necessary but not sufficient. The speculative element must do real work in the story, not just decorate literary fiction.',
  thriller: 'The speculative element must be integral, not a gimmick. We love unreliable narrators and slow-build dread.',
  'short-fiction': 'We publish anthologies, collections, and novellas (20k-50k). Themed anthologies get priority. Query first for collections.',
};

// Content warning expectations
const CW_EXPECTATIONS = [
  { genre: 'Horror', level: 'Expected', desc: 'Violence, death, body horror, psychological distress', color: 'text-red-400' },
  { genre: 'Dark Fantasy', level: 'Common', desc: 'Violence, morally complex situations, power dynamics', color: 'text-purple-400' },
  { genre: 'Romance', level: 'Variable', desc: 'Sexual content (flagged by heat level), emotional intensity', color: 'text-pink-400' },
  { genre: 'Sci-Fi', level: 'Varies', desc: 'Dystopian violence, existential themes, body modification', color: 'text-cyan-400' },
  { genre: 'Literary Spec', level: 'Case-by-case', desc: 'Trauma exploration, mental health, grief — handled with care', color: 'text-indigo-400' },
];

// View mode
type ViewMode = 'browse' | 'moods' | 'authors';

export default function Genres() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGenres, setExpandedGenres] = useState<Set<string>>(new Set(['fantasy', 'scifi', 'horror']));
  const [filterImprint, setFilterImprint] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const toggleGenre = (id: string) => {
    setExpandedGenres(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredGenres = useMemo(() =>
    GENRES.filter(g => {
      if (filterImprint && !g.imprints.includes(filterImprint)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return g.name.toLowerCase().includes(q) ||
          g.subgenres.some(sg => sg.name.toLowerCase().includes(q) || sg.description?.toLowerCase().includes(q));
      }
      return true;
    }), [filterImprint, searchQuery]
  );

  // Count stats
  const totalSubgenres = GENRES.reduce((sum, g) => sum + g.subgenres.length, 0);

  return (
    <div className="min-h-screen bg-void-black text-white">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-starforge-gold/5 via-queer-purple/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
              What We <span className="text-starforge-gold italic font-heading normal-case">Publish</span>
            </h1>
            <p className="font-ui text-text-secondary tracking-wider uppercase text-sm max-w-3xl mx-auto leading-relaxed">
              Three imprints. One mission. Stories from the margins that reshape the center.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex justify-center gap-8 mb-12 text-center">
            {[
              { label: 'Genres', value: GENRES.length },
              { label: 'Subgenres', value: `${totalSubgenres}+` },
              { label: 'Imprints', value: 3 },
              { label: 'Thematic Tags', value: THEMATIC_TAGS.length },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-2xl text-starforge-gold">{stat.value}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* ── Imprint Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {IMPRINTS.map((imprint, idx) => (
              <motion.div key={imprint.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}>
                <Link to={imprint.id === 'runa-atlas' ? '/for-authors' : `/imprints/${imprint.slug}`}
                  className={`block p-6 rounded-xl border ${imprint.colors.border} bg-gradient-to-br ${imprint.colors.gradientFrom} ${imprint.colors.gradientTo}
                    hover:border-opacity-60 transition-all group relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 text-6xl opacity-[0.06] font-display leading-none p-4">{imprint.icon}</div>
                  <div className={`text-2xl mb-3`}>{imprint.icon}</div>
                  <h3 className={`font-heading text-xl mb-1 ${imprint.colors.primary}`}>{imprint.name}</h3>
                  <p className="text-xs text-text-secondary italic mb-3">"{imprint.tagline}"</p>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">{imprint.description}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-ui uppercase tracking-wider ${imprint.colors.text} group-hover:gap-3 transition-all`}>
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── View Mode Tabs ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-2 mb-8 border-b border-white/[0.06] pb-4">
          {[
            { id: 'browse' as ViewMode, label: 'Browse Genres', icon: BookOpen },
            { id: 'moods' as ViewMode, label: 'Find by Mood', icon: Compass },
            { id: 'authors' as ViewMode, label: 'For Authors', icon: Feather },
          ].map(tab => (
            <button key={tab.id} onClick={() => setViewMode(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-ui uppercase tracking-wider transition-all border ${viewMode === tab.id
                ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30'
                : 'bg-white/[0.02] text-text-secondary border-white/[0.04] hover:text-white hover:border-white/[0.08]'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ MODE: BROWSE GENRES ═══ */}
        {viewMode === 'browse' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search genres and subgenres..."
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-starforge-gold/40" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setFilterImprint(null)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-ui uppercase tracking-wider transition-all border ${!filterImprint
                    ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30'
                    : 'bg-white/[0.04] text-text-secondary border-white/[0.06] hover:text-white'}`}>
                  All
                </button>
                {IMPRINTS.map(imp => (
                  <button key={imp.id} onClick={() => setFilterImprint(filterImprint === imp.id ? null : imp.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-ui uppercase tracking-wider transition-all border ${filterImprint === imp.id
                      ? `${imp.colors.bg} ${imp.colors.text} ${imp.colors.border}`
                      : 'bg-white/[0.04] text-text-secondary border-white/[0.06] hover:text-white'}`}>
                    {imp.icon} {imp.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Grid */}
            <div className="space-y-4 mb-16">
              {filteredGenres.map((genre, idx) => {
                const isExpanded = expandedGenres.has(genre.id);
                return (
                  <motion.div key={genre.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                    <button onClick={() => toggleGenre(genre.id)}
                      className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors text-left">
                      <span className="text-2xl">{genre.icon}</span>
                      <div className="flex-1">
                        <h3 className={`font-heading text-lg ${genre.color}`}>{genre.name}</h3>
                        <p className="text-xs text-text-secondary mt-0.5">{genre.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {genre.imprints.map(impId => {
                            const imp = IMPRINTS.find(i => i.id === impId);
                            return imp ? (
                              <span key={impId} className={`text-xs px-2 py-0.5 rounded-full ${imp.colors.bg} ${imp.colors.text}`}>
                                {imp.icon}
                              </span>
                            ) : null;
                          })}
                        </div>
                        <span className="text-xs text-text-secondary font-mono">{genre.subgenres.length}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/[0.04]">
                          {/* Subgenres */}
                          <div className="p-5 flex flex-wrap gap-2">
                            {genre.subgenres
                              .filter(sg => !searchQuery || sg.name.toLowerCase().includes(searchQuery.toLowerCase()) || sg.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map(sg => (
                                <div key={sg.id}
                                  className="group px-4 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-default">
                                  <span className={`text-sm ${genre.color}`}>{sg.name}</span>
                                  {sg.description && <p className="text-[10px] text-text-secondary mt-0.5">{sg.description}</p>}
                                </div>
                              ))}
                          </div>

                          {/* Enrichment panels */}
                          {GENRE_ENRICHMENT[genre.id] && (() => {
                            const enrichment = GENRE_ENRICHMENT[genre.id];
                            return (
                              <div className="px-5 pb-5 space-y-4">
                                {/* Reader Hook */}
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                  <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                                    <Eye className="w-3 h-3" /> What This Genre Offers
                                  </h4>
                                  <p className="text-sm text-text-secondary leading-relaxed">{enrichment.readerHook}</p>
                                </div>

                                {/* Notable Voices */}
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                  <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                    <Star className="w-3 h-3" /> Notable Voices in This Space
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {enrichment.notableVoices.map((nv, i) => (
                                      <div key={i} className="flex items-start gap-2 text-xs">
                                        <BookOpen className={`w-3 h-3 mt-0.5 flex-none ${genre.color}`} />
                                        <span><span className="text-text-primary font-medium">{nv.title}</span> <span className="text-text-muted">— {nv.author}</span></span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* If You Like / Try */}
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                  <h4 className="text-[10px] uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                                    <Compass className="w-3 h-3" /> If You Like… Try…
                                  </h4>
                                  <div className="space-y-3">
                                    {enrichment.ifYouLike.map((rec, i) => (
                                      <div key={i} className="flex items-start gap-3">
                                        <ArrowRight className={`w-3.5 h-3.5 mt-0.5 flex-none ${genre.color}`} />
                                        <div className="text-xs">
                                          <span className="text-text-primary">Like <strong>{rec.like}</strong>? Try <strong className={genre.color}>{rec.try}</strong></span>
                                          <p className="text-text-muted mt-0.5 italic">{rec.because}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Why We Publish This */}
                                <div className={`p-4 rounded-xl border border-white/[0.04]`}
                                  style={{ background: 'rgba(198,169,43,0.03)' }}>
                                  <h4 className="text-[10px] uppercase tracking-widest text-starforge-gold/60 mb-2 flex items-center gap-2">
                                    <Heart className="w-3 h-3" /> Why We Publish This
                                  </h4>
                                  <p className="text-sm text-text-secondary leading-relaxed italic">{enrichment.whyWePublish}</p>
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Bohío-Specific */}
            {(!filterImprint || filterImprint === 'bohio-press') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mb-16 p-8 rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500/5 to-sky-500/5">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">☀</span>
                  <div>
                    <h3 className="font-heading text-xl text-orange-400">Bohío Press Specialties</h3>
                    <p className="text-xs text-text-secondary">Genres unique to our Puerto Rican imprint</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BOHIO_GENRES.map(sg => (
                    <div key={sg.id} className="px-4 py-2 rounded-lg border border-orange-400/20 bg-orange-500/5">
                      <span className="text-sm text-orange-300">{sg.name}</span>
                      {sg.description && <p className="text-[10px] text-orange-300/60 mt-0.5">{sg.description}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Void Noir-Specific */}
            {(!filterImprint || filterImprint === 'void-noir') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mb-16 p-8 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-900/10 to-purple-900/10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🌑</span>
                  <div>
                    <h3 className="font-heading text-xl text-red-400">Void Noir Specialties</h3>
                    <p className="text-xs text-text-secondary">Horror and dark fiction sub-categories</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {VOID_NOIR_GENRES.map(sg => (
                    <div key={sg.id} className="px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/5">
                      <span className="text-sm text-red-300">{sg.name}</span>
                      {sg.description && <p className="text-[10px] text-red-300/60 mt-0.5">{sg.description}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Thematic Tags */}
            <div className="mb-16">
              <button onClick={() => setShowTags(!showTags)} className="flex items-center gap-3 mb-6 group">
                <Hash className="w-5 h-5 text-starforge-gold" />
                <h2 className="font-heading text-2xl text-text-primary">Thematic Tags</h2>
                <span className="text-xs text-text-secondary font-ui uppercase tracking-wider">Cross-genre identifiers</span>
                {showTags ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
              </button>
              <AnimatePresence>
                {showTags && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {THEMATIC_TAGS.map(tag => (
                        <div key={tag.id} className={`px-4 py-3 rounded-xl ${tag.color} border border-white/[0.06]`}>
                          <span className="text-xs font-mono font-semibold">{tag.hashtag}</span>
                          <p className="text-[10px] opacity-80 mt-1">{tag.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Not Publishing */}
            <div className="mb-20 p-6 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <h3 className="font-ui text-xs text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <X className="w-3.5 h-3.5" /> What We're Not Publishing
              </h3>
              <div className="flex flex-wrap gap-2">
                {NOT_PUBLISHING.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 text-xs text-text-muted bg-white/[0.03] border border-white/[0.04] rounded-lg">{item}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ MODE: FIND BY MOOD ═══ */}
        {viewMode === 'moods' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-8">
              <h2 className="font-heading text-2xl text-text-primary mb-2">What are you in the mood for?</h2>
              <p className="text-sm text-text-secondary">Pick a vibe and we'll show you what fits. Every mood maps to specific genres and subgenres across our catalog.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              {MOODS.map((mood, i) => {
                const isActive = activeMood === mood.id;
                const matchingSubgenres = GENRES.flatMap(g =>
                  g.subgenres.filter(sg => mood.genres.includes(sg.id)).map(sg => ({ ...sg, parentGenre: g.name, parentColor: g.color }))
                );
                return (
                  <motion.div key={mood.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <button onClick={() => setActiveMood(isActive ? null : mood.id)}
                      className={`w-full text-left p-5 rounded-xl border transition-all ${isActive ? mood.color : 'bg-white/[0.02] text-text-secondary border-white/[0.06] hover:border-white/[0.12]'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{mood.icon}</span>
                        <h3 className="font-heading text-lg">{mood.label}</h3>
                        {isActive ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
                      </div>
                      <p className="text-xs opacity-80">{mood.desc}</p>
                    </button>
                    <AnimatePresence>
                      {isActive && matchingSubgenres.length > 0 && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="mt-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex flex-wrap gap-2">
                            {matchingSubgenres.map(sg => (
                              <div key={sg.id} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                <span className={`text-xs ${sg.parentColor}`}>{sg.name}</span>
                                <span className="text-[9px] text-text-muted ml-2">({sg.parentGenre})</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Tag discovery */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-16">
              <h3 className="font-heading text-xl text-text-primary mb-2 flex items-center gap-2">
                <Hash className="w-5 h-5 text-starforge-gold" /> Browse by Theme
              </h3>
              <p className="text-xs text-text-secondary mb-6">Thematic tags cross genre boundaries — find stories by what they're <em>about</em>, not just where they sit on the shelf.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {THEMATIC_TAGS.map(tag => (
                  <div key={tag.id} className={`px-4 py-3 rounded-xl ${tag.color} border border-white/[0.06] hover:scale-[1.02] transition-transform cursor-default`}>
                    <span className="text-xs font-mono font-semibold">{tag.hashtag}</span>
                    <p className="text-[10px] opacity-80 mt-1">{tag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ MODE: FOR AUTHORS ═══ */}
        {viewMode === 'authors' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl text-text-primary mb-2">Author Submission Guide</h2>
              <p className="text-sm text-text-secondary max-w-3xl">
                Everything you need to know about what we're looking for, how we think about genre, and what makes a submission stand out.
                One portal serves all three imprints — pick the right one(s) for your work.
              </p>
            </div>

            {/* Which Imprint? */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-8">
              <h3 className="font-heading text-xl text-starforge-gold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5" /> Which Imprint Is Right for Your Work?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-starforge-gold/20 bg-starforge-gold/5">
                  <span className="text-xl">✦</span>
                  <h4 className="text-sm font-semibold text-starforge-gold mt-2">Rüna Atlas Press</h4>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    BIPOC and/or Queer author writing speculative fiction of any subgenre. Cosmic, hopeful, transformative. This is our broadest imprint.
                  </p>
                  <p className="text-[10px] text-starforge-gold/50 mt-3 italic">Best for: Most speculative fiction submissions</p>
                </div>
                <div className="p-5 rounded-xl border border-orange-400/20 bg-orange-500/5">
                  <span className="text-xl">☀</span>
                  <h4 className="text-sm font-semibold text-orange-400 mt-2">Bohío Press</h4>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    Puerto Rican author writing a Puerto Rico–rooted story. Island-born, diaspora, or heritage. No translation. No apology.
                  </p>
                  <p className="text-[10px] text-orange-400/50 mt-3 italic">Best for: PR identity central to the story</p>
                </div>
                <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5">
                  <span className="text-xl">🌑</span>
                  <h4 className="text-sm font-semibold text-red-400 mt-2">Void Noir</h4>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    Horror, dark fiction, gothic. Literary dread by marginalized voices. Cerebral over visceral (though visceral welcome).
                  </p>
                  <p className="text-[10px] text-red-400/50 mt-3 italic">Best for: Horror and dark speculative fiction</p>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-6 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Not sure? Check multiple imprints or select "Let editors decide" on the submission form.
              </p>
            </div>

            {/* Genre-Specific Submission Tips */}
            <div className="mb-8">
              <h3 className="font-heading text-xl text-text-primary mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-starforge-gold" /> What We're Looking For, By Genre
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GENRES.map(g => {
                  const tip = SUBMISSION_TIPS[g.id];
                  if (!tip) return null;
                  return (
                    <div key={g.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{g.icon}</span>
                        <h4 className={`font-heading text-sm ${g.color}`}>{g.name}</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{tip}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content Warning Expectations */}
            <div className="mb-8 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <h3 className="font-heading text-xl text-text-primary mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Content Warning Expectations
              </h3>
              <p className="text-xs text-text-secondary mb-6">
                We require content warnings on all publications. Here's what to expect per genre — flag anything that applies in your submission.
              </p>
              <div className="space-y-3">
                {CW_EXPECTATIONS.map(cw => (
                  <div key={cw.genre} className="flex items-start gap-4 py-3 border-b border-white/[0.04] last:border-0">
                    <span className={`text-sm font-semibold ${cw.color} w-32 shrink-0`}>{cw.genre}</span>
                    <span className="text-xs text-text-muted w-24 shrink-0 uppercase tracking-wider">{cw.level}</span>
                    <span className="text-xs text-text-secondary">{cw.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Word Count & Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <h4 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-starforge-gold" /> Word Count Guidelines
                </h4>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex justify-between"><span>Novellas</span><span className="text-starforge-gold font-mono">20k – 50k</span></li>
                  <li className="flex justify-between"><span>Novels</span><span className="text-starforge-gold font-mono">50k – 120k</span></li>
                  <li className="flex justify-between"><span>Epic/Saga</span><span className="text-starforge-gold font-mono">120k – 200k</span></li>
                  <li className="flex justify-between"><span>Collections</span><span className="text-starforge-gold font-mono">30k – 80k total</span></li>
                </ul>
                <p className="text-[10px] text-text-muted mt-4 italic">We'll consider works outside these ranges if the story demands it.</p>
              </div>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <h4 className="font-heading text-sm text-text-primary mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-starforge-gold" /> What Makes a Submission Stand Out
                </h4>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex items-start gap-2"><Star className="w-3 h-3 text-starforge-gold mt-0.5 flex-none" /> Voice that's unmistakably yours</li>
                  <li className="flex items-start gap-2"><Star className="w-3 h-3 text-starforge-gold mt-0.5 flex-none" /> Worldbuilding that doesn't default to European</li>
                  <li className="flex items-start gap-2"><Star className="w-3 h-3 text-starforge-gold mt-0.5 flex-none" /> Marginalized characters who are full people, not lessons</li>
                  <li className="flex items-start gap-2"><Star className="w-3 h-3 text-starforge-gold mt-0.5 flex-none" /> Genre awareness — you know what shelf you're on</li>
                  <li className="flex items-start gap-2"><Star className="w-3 h-3 text-starforge-gold mt-0.5 flex-none" /> Comp titles that show you read widely</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CTA ── */}
        <div className="text-center pb-20">
          <h3 className="font-heading text-2xl text-text-primary mb-4">Ready to submit?</h3>
          <p className="text-text-secondary text-sm mb-8 max-w-xl mx-auto">
            One submission portal serves all three imprints. Choose which imprint(s) should consider your work, or let our editors decide.
          </p>
          <Link to="/submissions"
            className="inline-flex items-center gap-2 px-8 py-4 bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-wider rounded-lg hover:bg-starforge-gold/90 transition-colors">
            <BookOpen className="w-5 h-5" /> Submit Your Manuscript <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
