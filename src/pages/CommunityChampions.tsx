import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Star, Users, Flame, BookOpen, Archive, Crown, Heart, Shield, Target,
  Award, Sparkles, CheckCircle, MessageCircle, Vote, PenTool
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { usePageSEO } from '../hooks/usePageSEO';
import { Link } from 'react-router-dom';

// ─── Badge Definitions ──────────────────────────
const BADGE_DEFS = [
  { id: 'founder', label: 'Founder', emoji: '🏛️', desc: 'Among the first 250 members', color: 'text-starforge-gold', bg: 'bg-starforge-gold/10', border: 'border-starforge-gold/30' },
  { id: 'first_review', label: 'First Review', emoji: '⭐', desc: 'Wrote their first review', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  { id: 'prolific_reviewer', label: 'Prolific Reviewer', emoji: '📝', desc: '10+ reviews written', color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10', border: 'border-cosmic-purple/30' },
  { id: 'archive_weaver', label: 'Archive Weaver', emoji: '📜', desc: '5+ published artifacts', color: 'text-aurora-teal', bg: 'bg-aurora-teal/10', border: 'border-aurora-teal/30' },
  { id: 'circle_starter', label: 'Circle Starter', emoji: '🔥', desc: 'Created a reader circle', color: 'text-ember-orange', bg: 'bg-ember-orange/10', border: 'border-ember-orange/30' },
  { id: 'civic_voice', label: 'Civic Voice', emoji: '🗳️', desc: 'Voted in 5+ polls', color: 'text-queer-pink', bg: 'bg-queer-pink/10', border: 'border-queer-pink/30' },
  { id: 'bookworm', label: 'Bookworm', emoji: '📚', desc: 'Completed reading challenge', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
  { id: 'helpful_hand', label: 'Helpful Hand', emoji: '🤝', desc: '50+ helpful votes received', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/30' },
] as const;

type FounderMember = { uid: string; displayName: string; photoURL?: string; createdAt: any; memberNumber: number };
type LeaderEntry = { name: string; photoURL?: string; count: number; secondary?: string };

export default function CommunityChampions() {
  usePageSEO({
    title: 'Community Champions',
    description: 'The Founders Wall, community badges, and leaderboards for the Rüna Atlas community. Celebrating readers, reviewers, and archive weavers.',
  });

  const [founders, setFounders] = useState<FounderMember[]>([]);
  const [reviewLeaders, setReviewLeaders] = useState<LeaderEntry[]>([]);
  const [archiveLeaders, setArchiveLeaders] = useState<LeaderEntry[]>([]);
  const [helpfulLeaders, setHelpfulLeaders] = useState<LeaderEntry[]>([]);
  const [communityStats, setCommunityStats] = useState({ members: 0, reviews: 0, artifacts: 0, circles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ─── Founders Wall: first 250 members ───
    const foundersUnsub = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'asc'), limit(250)),
      snap => {
        setFounders(snap.docs.map((d, i) => ({
          uid: d.id,
          displayName: d.data().displayName || d.data().name || 'Anonymous',
          photoURL: d.data().photoURL,
          createdAt: d.data().createdAt,
          memberNumber: i + 1,
        })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    // ─── Community stats ───
    const statsUnsubs = [
      onSnapshot(collection(db, 'users'), s => setCommunityStats(prev => ({ ...prev, members: s.docs.length })), () => {}),
      onSnapshot(collection(db, 'reviews'), s => setCommunityStats(prev => ({ ...prev, reviews: s.docs.length })), () => {}),
      onSnapshot(query(collection(db, 'archive_artifacts'), where('status', '==', 'published')), s => setCommunityStats(prev => ({ ...prev, artifacts: s.docs.length })), () => {}),
      onSnapshot(collection(db, 'readerCircles'), s => setCommunityStats(prev => ({ ...prev, circles: s.docs.length })), () => {}),
    ];

    // ─── Review leaderboard ───
    const reviewUnsub = onSnapshot(collection(db, 'reviews'), snap => {
      const byUser: Record<string, { name: string; photoURL?: string; reviews: number; helpful: number }> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        const name = data.displayName || 'Anonymous';
        if (!byUser[name]) byUser[name] = { name, photoURL: data.photoURL, reviews: 0, helpful: 0 };
        byUser[name].reviews++;
        byUser[name].helpful += data.helpfulVotes || 0;
      });
      const sorted = Object.values(byUser).sort((a, b) => b.reviews - a.reviews || b.helpful - a.helpful).slice(0, 10);
      setReviewLeaders(sorted.map(e => ({ name: e.name, photoURL: e.photoURL, count: e.reviews, secondary: `${e.helpful} helpful` })));
      setHelpfulLeaders(Object.values(byUser).sort((a, b) => b.helpful - a.helpful).slice(0, 10).map(e => ({ name: e.name, photoURL: e.photoURL, count: e.helpful, secondary: `${e.reviews} reviews` })));
    }, () => {});

    // ─── Archive leaderboard ───
    const archiveUnsub = onSnapshot(
      query(collection(db, 'archive_artifacts'), where('status', '==', 'published')),
      snap => {
        const byUser: Record<string, { name: string; photoURL?: string; count: number }> = {};
        snap.docs.forEach(d => {
          const data = d.data();
          const name = data.authorDisplayName || 'Anonymous';
          if (!byUser[name]) byUser[name] = { name, photoURL: data.authorPhotoURL, count: 0 };
          byUser[name].count++;
        });
        setArchiveLeaders(Object.values(byUser).sort((a, b) => b.count - a.count).slice(0, 10).map(e => ({ name: e.name, photoURL: e.photoURL, count: e.count })));
      },
      () => {}
    );

    return () => { foundersUnsub(); statsUnsubs.forEach(u => u()); reviewUnsub(); archiveUnsub(); };
  }, []);

  const getRankStyle = (i: number) => {
    if (i === 0) return 'bg-starforge-gold/20 text-starforge-gold border-starforge-gold/30';
    if (i === 1) return 'bg-text-muted/10 text-text-secondary border-border';
    if (i === 2) return 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30';
    return 'bg-surface-elevated text-text-muted border-border';
  };

  if (loading) return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Loading champions…</div>;

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/30 px-4 py-1.5 rounded-full font-ui text-[10px] uppercase tracking-widest mb-6">
            <Crown className="w-3 h-3" /> Celebrating Our Community
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            Community <span className="text-starforge-gold italic font-heading normal-case">Champions</span>
          </h1>
          <p className="font-body text-lg text-text-secondary max-w-2xl mx-auto">
            The readers, reviewers, and weavers who make the Rüna Atlas community extraordinary.
          </p>
        </motion.div>

        {/* ─── Stats Banner ─── */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Members', value: communityStats.members, icon: Users, color: 'text-starforge-gold', bg: 'bg-starforge-gold/10' },
              { label: 'Reviews Written', value: communityStats.reviews, icon: Star, color: 'text-cosmic-purple', bg: 'bg-cosmic-purple/10' },
              { label: 'Archive Artifacts', value: communityStats.artifacts, icon: Archive, color: 'text-aurora-teal', bg: 'bg-aurora-teal/10' },
              { label: 'Reader Circles', value: communityStats.circles, icon: MessageCircle, color: 'text-queer-pink', bg: 'bg-queer-pink/10' },
            ].map((stat, i) => (
              <div key={stat.label} className="bg-surface border border-border rounded-sm p-5 text-center">
                <div className={`w-10 h-10 rounded-sm ${stat.bg} flex items-center justify-center mx-auto mb-3`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                <p className="font-display text-2xl text-text-primary">{stat.value.toLocaleString()}</p>
                <p className="font-ui text-[9px] text-text-muted uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ═══ FOUNDERS WALL ═══ */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-24">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-7 h-7 text-starforge-gold" />
            <h2 className="font-display text-3xl text-text-primary uppercase tracking-widest">The Founders Wall</h2>
          </div>
          <p className="font-body text-text-secondary mb-8 ml-10">The first 250 members who believed in independent, inclusive speculative fiction.</p>

          {founders.length === 0 ? (
            <div className="bg-surface border border-starforge-gold/20 rounded-sm p-12 text-center">
              <Crown className="w-12 h-12 text-starforge-gold/20 mx-auto mb-4" />
              <p className="font-heading text-lg text-text-primary mb-2">The Wall Awaits</p>
              <p className="font-ui text-xs text-text-muted mb-4">Be among the first 250 members to earn a permanent place on the Founders Wall.</p>
              <Link to="/membership" className="inline-flex items-center gap-2 text-starforge-gold hover:text-yellow-300 font-ui text-xs uppercase tracking-widest"><Crown className="w-3.5 h-3.5" /> Join Now →</Link>
            </div>
          ) : (
            <div className="bg-surface border border-starforge-gold/20 rounded-sm p-6 md:p-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {founders.map((founder, i) => (
                  <motion.div
                    key={founder.uid}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.01, 2) }}
                    className="group relative"
                    title={`#${founder.memberNumber} — ${founder.displayName}`}
                  >
                    <div className={`w-12 h-12 rounded-sm overflow-hidden border-2 ${i < 10 ? 'border-starforge-gold' : i < 50 ? 'border-starforge-gold/50' : 'border-border'} bg-deep-space flex items-center justify-center transition-transform group-hover:scale-110 group-hover:z-10`}>
                      {founder.photoURL ? (
                        <img src={founder.photoURL} alt={founder.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="font-display text-sm text-text-muted">{founder.displayName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="bg-void-black border border-starforge-gold/30 rounded-sm px-3 py-1.5 whitespace-nowrap">
                        <p className="font-ui text-[10px] text-starforge-gold">#{founder.memberNumber}</p>
                        <p className="font-heading text-xs text-text-primary">{founder.displayName}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="font-mono text-[10px] text-text-muted text-center mt-6">{founders.length} / 250 founders enrolled</p>
            </div>
          )}
        </motion.section>

        {/* ═══ BADGES ═══ */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-24">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-7 h-7 text-starforge-gold" />
            <h2 className="font-display text-3xl text-text-primary uppercase tracking-widest">Community Badges</h2>
          </div>
          <p className="font-body text-text-secondary mb-8 ml-10">Earn recognition for your contributions to the community.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BADGE_DEFS.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className={`${badge.bg} border ${badge.border} rounded-sm p-5 text-center hover:scale-[1.02] transition-transform`}
              >
                <span className="text-3xl block mb-3">{badge.emoji}</span>
                <h3 className={`font-heading text-sm ${badge.color} mb-1`}>{badge.label}</h3>
                <p className="font-ui text-[10px] text-text-muted">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══ LEADERBOARDS ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {/* Review Champions */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-cosmic-purple" />
              <h3 className="font-heading text-xl text-text-primary">Review Champions</h3>
            </div>
            <div className="bg-surface border border-border rounded-sm overflow-hidden">
              {reviewLeaders.length === 0 ? (
                <div className="p-8 text-center"><Star className="w-8 h-8 text-text-muted/10 mx-auto mb-3" /><p className="font-ui text-xs text-text-muted">No reviews yet — be the first!</p></div>
              ) : (
                <div className="divide-y divide-border">
                  {reviewLeaders.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-3 p-3 hover:bg-void-black/30 transition-colors">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs shrink-0 border ${getRankStyle(i)}`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm text-text-primary truncate">{entry.name}</p>
                        <p className="font-ui text-[9px] text-text-muted">{entry.count} reviews · {entry.secondary}</p>
                      </div>
                      {i === 0 && <Trophy className="w-4 h-4 text-starforge-gold shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          {/* Archive Weavers */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-2 mb-6">
              <Archive className="w-5 h-5 text-aurora-teal" />
              <h3 className="font-heading text-xl text-text-primary">Archive Weavers</h3>
            </div>
            <div className="bg-surface border border-border rounded-sm overflow-hidden">
              {archiveLeaders.length === 0 ? (
                <div className="p-8 text-center"><Archive className="w-8 h-8 text-text-muted/10 mx-auto mb-3" /><p className="font-ui text-xs text-text-muted">No archive artifacts yet</p><Link to="/archive/submit" className="font-ui text-xs text-aurora-teal hover:text-white mt-2 inline-block">Submit the first →</Link></div>
              ) : (
                <div className="divide-y divide-border">
                  {archiveLeaders.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-3 p-3 hover:bg-void-black/30 transition-colors">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs shrink-0 border ${getRankStyle(i)}`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm text-text-primary truncate">{entry.name}</p>
                        <p className="font-ui text-[9px] text-text-muted">{entry.count} artifacts published</p>
                      </div>
                      {i === 0 && <Sparkles className="w-4 h-4 text-aurora-teal shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          {/* Helpful Hands */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-queer-pink" />
              <h3 className="font-heading text-xl text-text-primary">Helpful Hands</h3>
            </div>
            <div className="bg-surface border border-border rounded-sm overflow-hidden">
              {helpfulLeaders.length === 0 ? (
                <div className="p-8 text-center"><Heart className="w-8 h-8 text-text-muted/10 mx-auto mb-3" /><p className="font-ui text-xs text-text-muted">No helpful votes yet</p></div>
              ) : (
                <div className="divide-y divide-border">
                  {helpfulLeaders.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-3 p-3 hover:bg-void-black/30 transition-colors">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs shrink-0 border ${getRankStyle(i)}`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-sm text-text-primary truncate">{entry.name}</p>
                        <p className="font-ui text-[9px] text-text-muted">{entry.count} helpful votes · {entry.secondary}</p>
                      </div>
                      {i === 0 && <Heart className="w-4 h-4 text-queer-pink shrink-0" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        </div>

        {/* ─── CTA ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mb-8">
          <div className="bg-starforge-gold/5 border border-starforge-gold/20 rounded-sm p-8">
            <Trophy className="w-8 h-8 text-starforge-gold mx-auto mb-3" />
            <h3 className="font-heading text-xl text-text-primary mb-2">Join the Community</h3>
            <p className="font-ui text-xs text-text-muted max-w-md mx-auto mb-6">Write reviews, submit artifacts, join circles, and earn your place on the leaderboards.</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/forge" className="inline-flex items-center gap-2 px-5 py-2.5 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors"><Flame className="w-4 h-4" /> The Forge</Link>
              <Link to="/archive" className="inline-flex items-center gap-2 px-5 py-2.5 border border-starforge-gold/30 text-starforge-gold font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-starforge-gold/5 transition-colors"><Archive className="w-4 h-4" /> The Archive</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
