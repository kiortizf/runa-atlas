import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Route, ArrowLeftRight, Waves, MessageCircleQuestion, ScrollText,
  BookOpenCheck, Footprints, Quote, Wrench, FileSearch, Image, Music,
  Palette, PaintBucket, NotebookPen, Mail, FileImage, FileWarning,
  UtensilsCrossed, Map, Archive, Clock, Grid3X3, HelpCircle, Search,
  Trophy, Plus, Filter, ChevronDown, Heart, Eye, BookOpen, AlertTriangle, X
} from 'lucide-react';
import {
  ARCHIVE_CATEGORIES, ARTIFACT_TYPE_META, RATING_META,
  type ArtifactCategory, type ArtifactType, type ArtifactRating, type Artifact
} from '../data/archiveTypes';

// ═══════════════════════════════════════════════════════════════
// THE RUNEWEAVE ARCHIVE — Hub
// ═══════════════════════════════════════════════════════════════

const ICON_MAP: Record<string, any> = {
  Sparkles, Route, ArrowLeftRight, Waves, MessageCircleQuestion, ScrollText,
  BookOpenCheck, Footprints, Quote, Wrench, FileSearch, Image, Music,
  Palette, PaintBucket, NotebookPen, Mail, FileImage, FileWarning,
  UtensilsCrossed, Map, Archive, Clock, Grid3X3: Grid3X3, HelpCircle, Search,
  Trophy,
};

function getIcon(name: string) {
  return ICON_MAP[name] || Sparkles;
}

export default function ArchiveHub() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<ArtifactCategory | 'ALL'>('ALL');
  const [activeType, setActiveType] = useState<ArtifactType | null>(null);
  const [activeRating, setActiveRating] = useState<ArtifactRating | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Sync category from URL param
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ARCHIVE_CATEGORIES.some(c => c.id === cat)) {
      setActiveCategory(cat as ArtifactCategory);
    }
    const book = searchParams.get('book');
    // book filter could be used here
  }, [searchParams]);

  // Fetch artifacts
  useEffect(() => {
    const fetchArtifacts = async () => {
      setLoading(true);
      try {
        const constraints: any[] = [
          where('status', '==', 'published'),
        ];

        if (activeCategory !== 'ALL') {
          constraints.push(where('category', '==', activeCategory));
        }
        if (activeType) {
          constraints.push(where('type', '==', activeType));
        }
        if (activeRating) {
          constraints.push(where('rating', '==', activeRating));
        }

        const bookFilter = searchParams.get('book');
        if (bookFilter) {
          constraints.push(where('bookId', '==', bookFilter));
        }

        constraints.push(
          orderBy(sortBy === 'popular' ? 'likes' : 'createdAt', 'desc'),
          limit(24)
        );

        const q = query(collection(db, 'archive_artifacts'), ...constraints);
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Artifact));
        setArtifacts(items);
        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length >= 24);
      } catch {
        // Firestore index may not exist yet — show empty
        setArtifacts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArtifacts();
  }, [activeCategory, activeType, activeRating, sortBy, searchParams]);

  const loadMore = async () => {
    if (!lastDoc || !hasMore) return;
    try {
      const constraints: any[] = [where('status', '==', 'published')];
      if (activeCategory !== 'ALL') constraints.push(where('category', '==', activeCategory));
      if (activeType) constraints.push(where('type', '==', activeType));
      if (activeRating) constraints.push(where('rating', '==', activeRating));
      constraints.push(
        orderBy(sortBy === 'popular' ? 'likes' : 'createdAt', 'desc'),
        startAfter(lastDoc),
        limit(24)
      );
      const q = query(collection(db, 'archive_artifacts'), ...constraints);
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Artifact));
      setArtifacts(prev => [...prev, ...items]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length >= 24);
    } catch { /* */ }
  };

  // Active category types for sub-filter
  const categoryTypes = activeCategory !== 'ALL'
    ? ARCHIVE_CATEGORIES.find(c => c.id === activeCategory)?.types || []
    : [];

  return (
    <div className="min-h-screen bg-void-black text-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,193,7,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(139,92,246,0.1) 0%, transparent 50%)' }} />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-starforge-gold/50" />
              <span className="font-ui text-xs uppercase tracking-[0.3em] text-starforge-gold">The Runeweave</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-starforge-gold/50" />
            </div>

            <h1 className="font-display text-5xl md:text-7xl tracking-wide mb-6">
              <span className="text-white">THE </span>
              <span className="text-starforge-gold">ARCHIVE</span>
            </h1>

            <p className="font-ui text-lg text-text-secondary leading-relaxed mb-8 max-w-2xl mx-auto">
              Reader-made artifacts from the Atlas — glossaries, playlists, moodboards, curated lists,
              craft essays, quizzes, and more. Non-canon. Community-driven. Never fanfiction.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              {user ? (
                <Link to="/archive/submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-widest rounded-lg hover:bg-yellow-400 transition-colors font-semibold">
                  <Plus className="w-4 h-4" />
                  Submit to the Archive
                </Link>
              ) : (
                <Link to="/portal"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-widest rounded-lg hover:bg-yellow-400 transition-colors font-semibold">
                  Sign In to Contribute
                </Link>
              )}
              <Link to="/archive/policy"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/[0.15] text-text-secondary font-ui text-sm uppercase tracking-widest rounded-lg hover:text-white hover:border-white/30 transition-colors">
                <AlertTriangle className="w-4 h-4" />
                Submission Policy
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category Tabs ── */}
      <div className="border-b border-white/[0.06] sticky top-16 z-40 bg-deep-space/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => { setActiveCategory('ALL'); setActiveType(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-starforge-gold/15 text-starforge-gold border border-starforge-gold/30'
                  : 'text-text-secondary hover:text-white border border-transparent'
              }`}
            >
              All
            </button>
            {ARCHIVE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setActiveType(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-starforge-gold/15 text-starforge-gold border border-starforge-gold/30'
                    : 'text-text-secondary hover:text-white border border-transparent'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}

            {/* Right: Sort + Filter toggles */}
            <div className="ml-auto flex items-center gap-2 pl-4">
              <button
                onClick={() => setSortBy(sortBy === 'newest' ? 'popular' : 'newest')}
                className="flex items-center gap-1.5 px-3 py-2 text-text-secondary hover:text-white font-ui text-xs uppercase tracking-widest transition-colors"
              >
                {sortBy === 'newest' ? '🕐 Newest' : '🔥 Popular'}
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-xs uppercase tracking-widest transition-all ${
                  showFilters ? 'bg-white/[0.08] text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-type pills + Filter bar ── */}
      <AnimatePresence>
        {(categoryTypes.length > 0 || showFilters) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/[0.04] overflow-hidden bg-surface/50"
          >
            <div className="max-w-7xl mx-auto px-6 py-3">
              {/* Sub-type pills */}
              {categoryTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {categoryTypes.map(t => {
                    const meta = ARTIFACT_TYPE_META[t];
                    const Icon = getIcon(meta.icon);
                    return (
                      <button
                        key={t}
                        onClick={() => setActiveType(activeType === t ? null : t)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-ui text-[11px] uppercase tracking-wider transition-all ${
                          activeType === t
                            ? `bg-white/10 ${meta.color} border border-white/20`
                            : 'text-text-secondary hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Rating filters */}
              {showFilters && (
                <div className="flex items-center gap-4">
                  <span className="font-ui text-[10px] uppercase tracking-widest text-text-muted">Rating:</span>
                  {(['G', 'TEEN', 'MATURE'] as ArtifactRating[]).map(r => (
                    <button
                      key={r}
                      onClick={() => setActiveRating(activeRating === r ? null : r)}
                      className={`px-3 py-1 rounded-full font-ui text-[11px] uppercase tracking-wider transition-all ${
                        activeRating === r
                          ? `${RATING_META[r].color} bg-white/10 border border-white/20`
                          : 'text-text-secondary hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      {RATING_META[r].label}
                    </button>
                  ))}
                  {(activeRating || activeType) && (
                    <button
                      onClick={() => { setActiveRating(null); setActiveType(null); }}
                      className="flex items-center gap-1 px-3 py-1 text-text-muted hover:text-white font-ui text-[11px] uppercase tracking-wider transition-colors"
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-white/[0.02] border border-white/[0.06] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : artifacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Archive className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <h3 className="font-display text-2xl text-white mb-3">The Archive Awaits</h3>
            <p className="font-ui text-text-secondary mb-8 max-w-md mx-auto">
              No artifacts yet{activeCategory !== 'ALL' ? ` in ${ARCHIVE_CATEGORIES.find(c => c.id === activeCategory)?.label}` : ''}.
              Be the first to contribute a reader-made artifact to the Runeweave.
            </p>
            {user && (
              <Link to="/archive/submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-widest rounded-lg hover:bg-yellow-400 transition-colors font-semibold">
                <Plus className="w-4 h-4" />
                Submit Your First Artifact
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {artifacts.map((artifact, i) => {
                const meta = ARTIFACT_TYPE_META[artifact.type];
                const Icon = getIcon(meta.icon);
                return (
                  <motion.div
                    key={artifact.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={`/archive/${artifact.id}`}
                      className="group block p-5 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.15] hover:bg-white/[0.04] transition-all h-full"
                    >
                      {/* Type badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center`}>
                          <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                        </div>
                        <span className={`font-ui text-[10px] uppercase tracking-widest ${meta.color}`}>{meta.label}</span>
                        {artifact.spoilerScope?.spoilsEnding && (
                          <span className="ml-auto font-ui text-[9px] uppercase tracking-wider text-red-400/70 border border-red-400/20 px-1.5 py-0.5 rounded-full">
                            Spoilers
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-heading text-lg text-white group-hover:text-starforge-gold transition-colors mb-2 line-clamp-2">
                        {artifact.title}
                      </h3>

                      {/* Summary */}
                      <p className="font-ui text-xs text-text-secondary leading-relaxed mb-4 line-clamp-3">
                        {artifact.summary}
                      </p>

                      {/* Footer: book + metrics */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
                        {artifact.bookTitle ? (
                          <span className="font-ui text-[10px] text-text-muted truncate max-w-[60%]">
                            <BookOpen className="w-3 h-3 inline mr-1 opacity-50" />
                            {artifact.bookTitle}
                          </span>
                        ) : (
                          <span className="font-ui text-[10px] text-text-muted">General</span>
                        )}
                        <div className="flex items-center gap-3 text-text-muted">
                          <span className="flex items-center gap-1 font-ui text-[10px]">
                            <Heart className="w-3 h-3" /> {artifact.likes || 0}
                          </span>
                          <span className="flex items-center gap-1 font-ui text-[10px]">
                            <Eye className="w-3 h-3" /> {artifact.views || 0}
                          </span>
                        </div>
                      </div>

                      {/* Non-canon label */}
                      <div className="mt-3 font-ui text-[9px] uppercase tracking-widest text-text-muted/50">
                        Reader-made · Non-canon
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 border border-white/[0.1] text-text-secondary font-ui text-xs uppercase tracking-widest rounded-lg hover:text-white hover:border-white/20 transition-colors"
                >
                  Load More Artifacts
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── "Not Fanfiction" Banner ── */}
      <div className="border-t border-white/[0.06] bg-surface/30">
        <div className="max-w-4xl mx-auto px-6 py-10 text-center">
          <p className="font-ui text-xs text-text-muted leading-relaxed max-w-2xl mx-auto">
            <strong className="text-text-secondary">The Runeweave Archive is not fanfiction.</strong> Artifacts are
            non-canon, community-made documents — glossaries, playlists, aesthetic companions, and curated lists.
            No plot submissions, alternate endings, or missing scenes. All artifacts are labeled "Reader-made, non-canon."
            <Link to="/archive/policy" className="text-starforge-gold hover:text-yellow-300 ml-1 transition-colors">Read the full policy →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
