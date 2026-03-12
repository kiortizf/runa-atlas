import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, collection, addDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, Bookmark, Share2, Flag, BookOpen,
  ExternalLink, AlertTriangle, Shield, Clock, Eye,
  Sparkles, Route, ArrowLeftRight, Waves, MessageCircleQuestion, ScrollText,
  BookOpenCheck, Footprints, Quote, Wrench, FileSearch, Image, Music,
  Palette, PaintBucket, NotebookPen, Mail, FileImage, FileWarning,
  UtensilsCrossed, Map, Archive, Grid3X3, HelpCircle, Search, Trophy
} from 'lucide-react';
import {
  ARTIFACT_TYPE_META, RATING_META,
  type Artifact
} from '../data/archiveTypes';

// ═══════════════════════════════════════════════════════════════
// ARTIFACT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════

const ICON_MAP: Record<string, any> = {
  Sparkles, Route, ArrowLeftRight, Waves, MessageCircleQuestion, ScrollText,
  BookOpenCheck, Footprints, Quote, Wrench, FileSearch, Image, Music,
  Palette, PaintBucket, NotebookPen, Mail, FileImage, FileWarning,
  UtensilsCrossed, Map, Archive, Clock, Grid3X3: Grid3X3, HelpCircle, Search, Trophy,
};

function getIcon(name: string) {
  return ICON_MAP[name] || Sparkles;
}

export default function ArtifactDetail() {
  const { artifactId } = useParams<{ artifactId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    if (!artifactId) return;
    const fetchArtifact = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'archive_artifacts', artifactId));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Artifact;
          setArtifact(data);
          // Increment view count
          try { await updateDoc(doc(db, 'archive_artifacts', artifactId), { views: increment(1) }); } catch { /* */ }
        }
      } catch { /* */ }
      setLoading(false);
    };
    fetchArtifact();
  }, [artifactId]);

  // Check like/bookmark status
  useEffect(() => {
    if (!user || !artifactId) return;
    const checkStatus = async () => {
      try {
        const likeQ = query(collection(db, 'archive_likes'), where('artifactId', '==', artifactId), where('userId', '==', user.uid));
        const likeSnap = await getDocs(likeQ);
        setLiked(!likeSnap.empty);
      } catch { /* */ }
      try {
        const bmDoc = await getDoc(doc(db, `users/${user.uid}/archive_bookmarks`, artifactId));
        setBookmarked(bmDoc.exists());
      } catch { /* */ }
    };
    checkStatus();
  }, [user, artifactId]);

  const handleLike = async () => {
    if (!user || !artifactId) return;
    try {
      if (liked) {
        const q = query(collection(db, 'archive_likes'), where('artifactId', '==', artifactId), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        snap.docs.forEach(d => deleteDoc(d.ref));
        await updateDoc(doc(db, 'archive_artifacts', artifactId), { likes: increment(-1) });
        setLiked(false);
        if (artifact) setArtifact({ ...artifact, likes: (artifact.likes || 1) - 1 });
      } else {
        await addDoc(collection(db, 'archive_likes'), { artifactId, userId: user.uid, createdAt: serverTimestamp() });
        await updateDoc(doc(db, 'archive_artifacts', artifactId), { likes: increment(1) });
        setLiked(true);
        if (artifact) setArtifact({ ...artifact, likes: (artifact.likes || 0) + 1 });
      }
    } catch { /* */ }
  };

  const handleBookmark = async () => {
    if (!user || !artifactId) return;
    try {
      const ref = doc(db, `users/${user.uid}/archive_bookmarks`, artifactId);
      if (bookmarked) {
        await deleteDoc(ref);
        setBookmarked(false);
      } else {
        await addDoc(collection(db, `users/${user.uid}/archive_bookmarks`), { artifactId, createdAt: serverTimestamp() });
        setBookmarked(true);
      }
    } catch { /* */ }
  };

  const handleReport = async () => {
    if (!user || !artifactId || !reportReason) return;
    try {
      await addDoc(collection(db, 'archive_reports'), {
        artifactId,
        reporterId: user.uid,
        reason: reportReason,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setReportSent(true);
      await updateDoc(doc(db, 'archive_artifacts', artifactId), { reports: increment(1) });
    } catch { /* */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <div className="text-starforge-gold font-ui text-lg uppercase tracking-widest animate-pulse">Loading Artifact…</div>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="min-h-screen bg-void-black flex flex-col items-center justify-center gap-4">
        <Archive className="w-16 h-16 text-white/10" />
        <h2 className="font-display text-2xl text-white">Artifact Not Found</h2>
        <Link to="/archive" className="text-starforge-gold hover:text-yellow-300 font-ui text-sm uppercase tracking-widest flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Archive
        </Link>
      </div>
    );
  }

  const meta = ARTIFACT_TYPE_META[artifact.type];
  const Icon = getIcon(meta.icon);
  const ratingMeta = RATING_META[artifact.rating];

  return (
    <div className="min-h-screen bg-void-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link to="/archive" className="inline-flex items-center gap-2 text-text-muted hover:text-starforge-gold font-ui text-xs uppercase tracking-widest mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* ── Header ── */}
          <div className="mb-8 pb-8 border-b border-white/[0.06]">
            {/* Badges row */}
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {/* Type */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03]`}>
                <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                <span className={`font-ui text-[10px] uppercase tracking-widest ${meta.color}`}>{meta.label}</span>
              </div>
              {/* Rating */}
              <span className={`font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/[0.08] ${ratingMeta.color}`}>
                {ratingMeta.label}
              </span>
              {/* Spoiler indicator */}
              {artifact.spoilerScope?.spoilsEnding ? (
                <span className="font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-red-400/20 text-red-400">
                  ⚠ Spoils Ending
                </span>
              ) : artifact.spoilerScope?.safeThroughChapter ? (
                <span className="font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-400/20 text-emerald-400">
                  ✓ Safe through Ch. {artifact.spoilerScope.safeThroughChapter}
                </span>
              ) : (
                <span className="font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-400/20 text-emerald-400">
                  ✓ Spoiler-Free
                </span>
              )}
              {/* Non-canon */}
              <span className="font-ui text-[9px] uppercase tracking-widest text-text-muted/50 ml-auto flex items-center gap-1">
                <Shield className="w-3 h-3" /> Reader-made · Non-canon
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-white mb-4">{artifact.title}</h1>

            <div className="flex items-center gap-4 text-text-secondary">
              <div className="flex items-center gap-2">
                {artifact.authorPhotoURL ? (
                  <img src={artifact.authorPhotoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center">
                    <span className="font-ui text-[10px]">{artifact.authorDisplayName?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                <span className="font-ui text-sm">{artifact.authorDisplayName}</span>
              </div>
              <span className="text-text-muted/30">·</span>
              <span className="font-ui text-xs text-text-muted flex items-center gap-1">
                <Eye className="w-3 h-3" /> {artifact.views || 0} views
              </span>
              <span className="font-ui text-xs text-text-muted flex items-center gap-1">
                <Heart className="w-3 h-3" /> {artifact.likes || 0} likes
              </span>
            </div>
          </div>

          {/* ── Content Warnings ── */}
          {artifact.contentWarnings && artifact.contentWarnings.length > 0 && (
            <div className="mb-6 p-4 bg-amber-900/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-ui text-xs uppercase tracking-widest text-amber-400">Content Warnings</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {artifact.contentWarnings.map(w => (
                  <span key={w} className="font-ui text-[11px] text-amber-300/80 bg-amber-900/20 px-2 py-0.5 rounded">{w}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── Book Link ── */}
          {artifact.bookId && (
            <Link to={`/catalog/${artifact.bookId}`} className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-starforge-gold/30 transition-colors mb-8">
              <BookOpen className="w-5 h-5 text-starforge-gold" />
              <div>
                <span className="font-ui text-[10px] uppercase tracking-widest text-text-muted">Attached to</span>
                <h4 className="font-heading text-sm text-white">{artifact.bookTitle}</h4>
              </div>
            </Link>
          )}

          {/* ── Summary ── */}
          {artifact.summary && (
            <div className="mb-8 p-5 bg-white/[0.02] border-l-2 border-starforge-gold/30 rounded">
              <p className="font-ui text-sm text-text-secondary leading-relaxed italic">{artifact.summary}</p>
            </div>
          )}

          {/* ── Body ── */}
          <div className="prose prose-invert prose-sm max-w-none mb-10">
            <div className="font-ui text-text-primary leading-relaxed whitespace-pre-wrap">
              {artifact.body}
            </div>
          </div>

          {/* ── Media Gallery ── */}
          {artifact.media && artifact.media.length > 0 && (
            <div className="mb-10">
              <h3 className="font-ui text-xs uppercase tracking-widest text-text-muted mb-4">Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {artifact.media.map((m, i) => (
                  <div key={i} className="relative group">
                    <img src={m.url} alt={m.altText} className="w-full aspect-square object-cover rounded-lg border border-white/[0.06]" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-3">
                      <div>
                        <p className="font-ui text-xs text-white">{m.altText}</p>
                        <p className="font-ui text-[10px] text-text-muted">Credit: {m.credit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── External Links ── */}
          {artifact.links && artifact.links.length > 0 && (
            <div className="mb-10">
              <h3 className="font-ui text-xs uppercase tracking-widest text-text-muted mb-4">Links</h3>
              <div className="space-y-2">
                {artifact.links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.15] transition-colors group">
                    <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-starforge-gold transition-colors" />
                    <div className="flex-1 min-w-0">
                      <span className="font-ui text-sm text-white group-hover:text-starforge-gold transition-colors">{link.label}</span>
                      <span className="font-ui text-[10px] uppercase tracking-widest text-text-muted ml-2">{link.platform}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Curated Books ── */}
          {artifact.curatedBooks && artifact.curatedBooks.length > 0 && (
            <div className="mb-10">
              <h3 className="font-ui text-xs uppercase tracking-widest text-text-muted mb-4">Curated Books</h3>
              <div className="space-y-3">
                {artifact.curatedBooks.map((cb, i) => (
                  <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    {cb.bookId ? (
                      <Link to={`/catalog/${cb.bookId}`} className="font-heading text-sm text-starforge-gold hover:text-yellow-300 transition-colors">
                        View in Catalog →
                      </Link>
                    ) : (
                      <div>
                        <span className="font-heading text-sm text-white">{cb.externalTitle}</span>
                        {cb.externalAuthor && <span className="font-ui text-xs text-text-muted ml-2">by {cb.externalAuthor}</span>}
                      </div>
                    )}
                    <p className="font-ui text-xs text-text-secondary mt-2 leading-relaxed">{cb.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tags ── */}
          {artifact.tags && artifact.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {artifact.tags.map(tag => (
                <Link key={tag} to={`/archive?tag=${tag}`}
                  className="font-mono text-[10px] px-3 py-1 rounded-full border border-white/[0.08] text-text-secondary hover:text-starforge-gold hover:border-starforge-gold/30 transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* ── Action Bar ── */}
          <div className="flex items-center gap-3 py-6 border-t border-white/[0.06]">
            <button onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs uppercase tracking-widest transition-all ${
                liked ? 'bg-rose-500/15 text-rose-400 border border-rose-400/30' : 'text-text-secondary hover:text-white border border-white/[0.06]'
              }`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-400' : ''}`} />
              {liked ? 'Liked' : 'Like'}
            </button>

            <button onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs uppercase tracking-widest transition-all ${
                bookmarked ? 'bg-amber-500/15 text-amber-400 border border-amber-400/30' : 'text-text-secondary hover:text-white border border-white/[0.06]'
              }`}>
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-400' : ''}`} />
              {bookmarked ? 'Saved' : 'Save'}
            </button>

            <button onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs uppercase tracking-widest text-text-secondary hover:text-white border border-white/[0.06] transition-all">
              <Share2 className="w-4 h-4" />
              Share
            </button>

            <button onClick={() => setShowReport(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs uppercase tracking-widest text-text-secondary hover:text-red-400 border border-white/[0.06] transition-all ml-auto">
              <Flag className="w-4 h-4" />
              Report
            </button>
          </div>

          {/* Report modal */}
          {showReport && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-surface border border-white/[0.08] rounded-lg mb-8">
              {reportSent ? (
                <p className="font-ui text-sm text-emerald-400">Thank you. Your report has been submitted.</p>
              ) : (
                <>
                  <h4 className="font-ui text-xs uppercase tracking-widest text-text-muted mb-3">Report this artifact</h4>
                  <select value={reportReason} onChange={e => setReportReason(e.target.value)}
                    className="w-full bg-void-black border border-white/[0.1] rounded-lg px-3 py-2 font-ui text-sm text-white mb-3 focus:outline-none focus:border-starforge-gold">
                    <option value="">Select reason…</option>
                    <option value="plot_submission">Contains plot/missing scene (violates policy)</option>
                    <option value="ip_claim">Claims ownership of IP</option>
                    <option value="offensive">Offensive or harmful content</option>
                    <option value="spam">Spam or low-effort</option>
                    <option value="wrong_rating">Incorrect rating/warnings</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleReport} disabled={!reportReason}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-400/30 rounded-lg font-ui text-xs uppercase tracking-widest disabled:opacity-30">
                      Submit Report
                    </button>
                    <button onClick={() => setShowReport(false)}
                      className="px-4 py-2 text-text-secondary font-ui text-xs uppercase tracking-widest">Cancel</button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </motion.article>
      </div>
    </div>
  );
}
