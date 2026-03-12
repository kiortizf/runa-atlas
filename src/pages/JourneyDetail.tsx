import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle, Clock, Lock, Bell, BellOff, LogIn, BookOpen, PlayCircle, Crown, Star } from 'lucide-react';
import { collection, doc, getDoc, onSnapshot, setDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

type Episode = {
  id: string;
  number: number;
  title: string;
  status: 'published' | 'scheduled' | 'draft';
  wordCount: number;
  publishDate: string;
  excerpt: string;
  membersOnly?: boolean;
};

type Journey = {
  id: string;
  slug: string;
  title: string;
  author: string;
  synopsis: string;
  coverUrl?: string;
  totalEpisodes: number;
  genre?: string;
  status?: string;
  constellation?: string;
};

export default function JourneyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [readEpisodes, setReadEpisodes] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch journey from Firestore (try by slug, then load seed)
  useEffect(() => {
    if (!slug) return;

    const unsub = onSnapshot(collection(db, 'journeys'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Journey));
      const found = all.find(j => (j.slug || j.id) === slug);
      if (found) {
        setJourney(found);
        // Load episodes subcollection
        const epUnsub = onSnapshot(
          query(collection(db, `journeys/${found.id}/episodes`), orderBy('number', 'asc')),
          epSnap => {
            setEpisodes(epSnap.docs.map(d => ({ id: d.id, ...d.data() } as Episode)));
            setLoading(false);
          },
          () => setLoading(false)
        );
        return () => epUnsub();
      } else {
        setJourney(null);
        setLoading(false);
      }
    }, () => {
      setLoading(false);
    });

    return () => unsub();
  }, [slug]);

  // Load reading progress
  useEffect(() => {
    if (!user || !journey) return;
    const unsub = onSnapshot(collection(db, `users/${user.uid}/readingProgress/${journey.id}/episodes`), snap => {
      setReadEpisodes(snap.docs.map(d => d.id));
    }, () => { });
    return () => unsub();
  }, [user, journey]);

  // Load subscription status
  useEffect(() => {
    if (!user || !journey) return;
    const unsub = onSnapshot(doc(db, `users/${user.uid}/journeySubscriptions`, journey.id), snap => {
      setIsSubscribed(snap.exists());
    }, () => { });
    return () => unsub();
  }, [user, journey]);

  const toggleSubscribe = async () => {
    if (!user) { signIn(); return; }
    if (!journey) return;
    const ref = doc(db, `users/${user.uid}/journeySubscriptions`, journey.id);
    if (isSubscribed) {
      try { await deleteDoc(ref); } catch { /* */ }
    } else {
      try { await setDoc(ref, { subscribedAt: new Date() }); } catch { /* */ }
    }
  };

  const markRead = async (episodeId: string) => {
    if (!user || !journey) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/readingProgress/${journey.id}/episodes`, episodeId), { readAt: new Date() });
    } catch { /* */ }
  };

  if (loading) {
    return <div className="min-h-screen bg-void-black flex items-center justify-center text-starforge-gold font-ui text-xl uppercase tracking-widest animate-pulse">Loading journey...</div>;
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-void-black flex flex-col items-center justify-center gap-4">
        <h2 className="text-text-primary font-heading text-3xl">Journey Not Found</h2>
        <Link to="/journeys" className="text-starforge-gold hover:text-white font-ui uppercase tracking-wider text-sm flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> All Journeys
        </Link>
      </div>
    );
  }

    const publishedEpisodes = episodes.filter(e => {
        if (e.status === 'published') return true;
        // Drip mechanism: auto-promote scheduled episodes whose publishDate has passed
        if (e.status === 'scheduled' && e.publishDate) {
            const pubDate = typeof e.publishDate === 'string' ? new Date(e.publishDate) :
                (e.publishDate as any)?.toDate ? (e.publishDate as any).toDate() : new Date(e.publishDate);
            return pubDate <= new Date();
        }
        return false;
    });
    const scheduledFuture = episodes.filter(e => {
        if (e.status !== 'scheduled' || !e.publishDate) return false;
        const pubDate = typeof e.publishDate === 'string' ? new Date(e.publishDate) :
            (e.publishDate as any)?.toDate ? (e.publishDate as any).toDate() : new Date(e.publishDate);
        return pubDate > new Date();
    });

    function getCountdown(dateStr: string): string {
        const pubDate = typeof dateStr === 'string' ? new Date(dateStr) :
            (dateStr as any)?.toDate ? (dateStr as any).toDate() : new Date(dateStr);
        const diff = pubDate.getTime() - Date.now();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days <= 0) return 'Available now';
        if (days === 1) return 'Tomorrow';
        if (days <= 7) return `${days} days`;
        const weeks = Math.floor(days / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    const publishedCount = publishedEpisodes.length;
    const progressPercentage = journey.totalEpisodes > 0 ? (publishedCount / journey.totalEpisodes) * 100 : 0;
    const totalWords = publishedEpisodes.reduce((s, e) => s + (e.wordCount || 0), 0);
    const readCount = readEpisodes.length;
    const firstUnread = publishedEpisodes.find(e => !readEpisodes.includes(e.id));

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link to="/journeys" className="inline-flex items-center gap-2 text-text-muted hover:text-starforge-gold font-ui text-sm uppercase tracking-wider mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> All Journeys
        </Link>

        {/* Header Card */}
        <div className="bg-surface border border-border rounded-sm overflow-hidden mb-10 relative">
          {journey.coverUrl && (
            <div className="absolute inset-0 z-0 opacity-15">
              <img src={journey.coverUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            </div>
          )}
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              {journey.genre && (
                <span className="font-ui text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/30">{journey.genre}</span>
              )}
              {journey.status && (
                <span className={`font-ui text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm border ${journey.status === 'Active' ? 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30' :
                    journey.status === 'Completed' ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30' :
                      'bg-forge-red/10 text-forge-red border-forge-red/30'
                  }`}>{journey.status === 'Active' ? 'Ongoing' : journey.status}</span>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-text-primary uppercase tracking-widest mb-3">{journey.title}</h1>
            <p className="font-ui text-starforge-gold text-lg mb-2">
              by <Link to={`/authors`} className="underline underline-offset-4 hover:text-white transition-colors">{journey.author}</Link>
            </p>
            {(journey as any).constellation && (
              <Link to={`/runeweave`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-cosmic-purple/10 text-cosmic-purple border border-cosmic-purple/20 font-ui text-[10px] uppercase tracking-wider hover:bg-cosmic-purple/20 transition-colors mb-6">
                <Star className="w-3 h-3" /> {(journey as any).constellation}
              </Link>
            )}
            {!(journey as any).constellation && <div className="mb-6" />}
            <p className="font-body text-text-secondary text-lg leading-relaxed max-w-2xl mb-8">{journey.synopsis}</p>

            <div className="flex flex-wrap items-center gap-3">
              {firstUnread ? (
                <Link to={`/journeys/${slug}/episode/${firstUnread.number}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-starforge-gold text-void-black rounded-sm font-ui text-sm uppercase tracking-wider hover:bg-yellow-500 transition-colors">
                  <PlayCircle className="w-4 h-4" /> {readCount > 0 ? 'Continue Reading' : 'Start Reading'}
                </Link>
              ) : publishedCount > 0 ? (
                <Link to={`/journeys/${slug}/episode/1`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-starforge-gold text-void-black rounded-sm font-ui text-sm uppercase tracking-wider hover:bg-yellow-500 transition-colors">
                  <BookOpen className="w-4 h-4" /> Re-read Journey
                </Link>
              ) : null}

              <button onClick={toggleSubscribe}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-sm font-ui text-sm uppercase tracking-wider border transition-colors ${isSubscribed ? 'border-starforge-gold/30 text-starforge-gold bg-starforge-gold/5' : 'border-border text-text-muted hover:text-starforge-gold hover:border-starforge-gold/30'
                  }`}>
                {isSubscribed ? <Bell className="w-4 h-4 fill-starforge-gold" /> : <BellOff className="w-4 h-4" />}
                {isSubscribed ? 'Subscribed' : user ? 'Subscribe' : 'Sign in to Subscribe'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-surface border border-border rounded-sm p-4 text-center">
            <p className="font-display text-2xl text-text-primary">{publishedCount}</p>
            <p className="font-ui text-[9px] text-text-muted uppercase tracking-wider">Episodes</p>
          </div>
          <div className="bg-surface border border-border rounded-sm p-4 text-center">
            <p className="font-display text-2xl text-text-primary">{totalWords.toLocaleString()}</p>
            <p className="font-ui text-[9px] text-text-muted uppercase tracking-wider">Words</p>
          </div>
          <div className="bg-surface border border-border rounded-sm p-4 text-center">
            <p className="font-display text-2xl text-text-primary">{Math.ceil(totalWords / 250)}</p>
            <p className="font-ui text-[9px] text-text-muted uppercase tracking-wider">Min Read</p>
          </div>
        </div>

        {/* Next Episode Countdown */}
        {scheduledFuture.length > 0 && (
          <div className="mb-8 p-4 bg-starforge-gold/5 border border-starforge-gold/20 rounded-sm flex items-center gap-4">
            <Clock className="w-5 h-5 text-starforge-gold shrink-0" />
            <div>
              <p className="font-ui text-sm text-starforge-gold font-medium">Next Episode: {scheduledFuture[0].title}</p>
              <p className="font-ui text-xs text-text-muted">Releases in {getCountdown(scheduledFuture[0].publishDate)} · Subscribe to get notified</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-2">
            <span className="font-ui text-[10px] uppercase tracking-widest text-text-muted">Journey Progress</span>
            <span className="font-mono text-xs text-starforge-gold">{publishedCount} of {journey.totalEpisodes} episodes</span>
          </div>
          <div className="h-2 bg-deep-space rounded-full overflow-hidden border border-border">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-starforge-gold to-aurora-teal rounded-full" />
          </div>
          {user && readCount > 0 && (
            <p className="font-ui text-[9px] text-aurora-teal mt-2">You've read {readCount} of {publishedCount} published episodes</p>
          )}
        </div>

        {/* Table of Contents */}
        <div className="space-y-3">
          <h2 className="font-display text-2xl text-text-primary uppercase tracking-widest mb-6">Table of Contents</h2>

          {Array.from({ length: journey.totalEpisodes }).map((_, index) => {
            const episodeNumber = index + 1;
            const episode = episodes.find(e => e.number === episodeNumber);
            const isPublishedOrDripped = episode ? publishedEpisodes.some(pe => pe.id === episode.id) : false;
            const isRead = episode ? readEpisodes.includes(episode.id) : false;
            const readTime = episode ? Math.ceil((episode.wordCount || 0) / 250) : 0;

            if (isPublishedOrDripped && episode) {
              return (
                <Link key={episodeNumber} to={`/journeys/${slug}/episode/${episodeNumber}`}
                  onClick={() => episode && markRead(episode.id)} className="block">
                  <motion.div whileHover={{ x: 6 }}
                    className={`bg-surface border rounded-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${isRead ? 'border-aurora-teal/20 hover:border-aurora-teal/40' : 'border-border hover:border-starforge-gold/50'
                      }`}>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/20 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-ui">
                          Episode {episodeNumber}
                        </span>
                        <span className="font-ui text-[10px] text-text-muted">{episode.publishDate}</span>
                        <span className="font-ui text-[10px] text-text-muted">· {episode.wordCount.toLocaleString()} words</span>
                        <span className="font-ui text-[10px] text-text-muted">· {readTime} min</span>
                        {episode.membersOnly && (
                          <span className="flex items-center gap-1 font-ui text-[9px] text-starforge-gold uppercase tracking-wider bg-starforge-gold/10 px-1.5 py-0.5 rounded">
                            <Crown className="w-3 h-3" /> Members Only
                          </span>
                        )}
                        {isRead && <span className="font-ui text-[9px] text-aurora-teal uppercase tracking-wider">✓ Read</span>}
                      </div>
                      <h3 className="font-heading text-lg text-text-primary mb-1">{episode.title}</h3>
                      <p className="font-body text-text-secondary text-sm line-clamp-2">{episode.excerpt}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border ${isRead ? 'bg-aurora-teal/10 border-aurora-teal/20' : 'bg-starforge-gold/10 border-starforge-gold/20'
                      }`}>
                      {isRead ? <CheckCircle className="w-5 h-5 text-aurora-teal" /> : <BookOpen className="w-5 h-5 text-starforge-gold" />}
                    </div>
                  </motion.div>
                </Link>
              );
            }

            if (episode?.status === 'scheduled') {
              const countdown = getCountdown(episode.publishDate);
              return (
                <div key={episodeNumber} className="bg-surface/60 border border-border/40 rounded-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-60">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-surface-elevated text-text-muted border border-border text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-ui">Episode {episodeNumber}</span>
                      <span className="font-ui text-[10px] text-starforge-gold">Unlocks in {countdown}</span>
                    </div>
                    <h3 className="font-heading text-lg text-text-primary mb-1">{episode.title}</h3>
                    <p className="font-body text-text-secondary text-sm line-clamp-2">{episode.excerpt}</p>
                  </div>
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0 bg-starforge-gold/5 border border-starforge-gold/20">
                    <Clock className="w-5 h-5 text-starforge-gold" />
                  </div>
                </div>
              );
            }

            return (
              <div key={episodeNumber} className="bg-surface/30 border border-border/20 rounded-sm p-5 flex items-center justify-between opacity-30">
                <div className="flex items-center gap-4">
                  <span className="bg-surface-elevated text-text-muted border border-border text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-ui">Episode {episodeNumber}</span>
                  <span className="font-heading text-sm text-text-muted">Chapter {episodeNumber}</span>
                </div>
                <Lock className="w-4 h-4 text-text-muted" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
