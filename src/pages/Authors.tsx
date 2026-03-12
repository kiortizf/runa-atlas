import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Globe, Twitter, Instagram, Users, Star, TrendingUp, Scroll } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { usePageSEO } from '../hooks/usePageSEO';

interface AuthorProfile {
  id: string;
  name: string;
  penName?: string;
  avatar?: string;
  coverImage?: string;
  bio: string;
  genres?: string[];
  books?: string[];
  slug?: string;
  status?: string;
  social?: {
    website?: string;
    twitter?: string;
    instagram?: string;
  };
  website?: string;
  twitter?: string;
  stats?: {
    followers?: number;
    totalReaders?: number;
    avgRating?: number;
  };
}

export default function Authors() {
  usePageSEO({
    title: 'Authors',
    description: 'Meet the brilliant minds forging constellations of voice at RÜNA ATLAS PRESS. Discover the creators behind our speculative fiction, dark fantasy, and literary works.',
  });
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'authorProfiles'), orderBy('name', 'asc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuthorProfile));
        setAuthors(data.filter(a => a.status !== 'inactive'));
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'authorProfiles');
        setLoading(false);
      }
    );
    // Also load journeys to link them to authors
    const qJ = query(collection(db, 'journeys'));
    const unsubJ = onSnapshot(qJ, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setJourneys(data);
    }, () => {});
    return () => { unsub(); unsubJ(); };
  }, []);

  if (loading) {
    return (
      <div className="bg-void-black min-h-screen py-16 flex items-center justify-center">
        <div className="text-starforge-gold font-ui text-xl uppercase tracking-widest animate-pulse">Loading Authors...</div>
      </div>
    );
  }

  return (
    <div className="bg-void-black min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-6">
            Our <span className="text-starforge-gold">Authors</span>
          </h1>
          <p className="font-ui text-xl text-text-secondary max-w-3xl mx-auto">
            The brilliant minds forging constellations of voice. Discover the creators behind your favorite stories.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {authors.map((author, idx) => {
            const socialWeb = author.social?.website || author.website;
            const socialTw = author.social?.twitter || author.twitter;
            const socialIg = author.social?.instagram;
            return (
              <motion.div
                key={author.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-surface border border-border rounded-xl overflow-hidden hover:border-starforge-gold/50 transition-colors group"
              >
                {/* Cover Image Banner */}
                {author.coverImage && (
                  <div className="h-32 overflow-hidden relative">
                    <img src={author.coverImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                  </div>
                )}

                <div className={`p-8 flex flex-col md:flex-row gap-8 ${author.coverImage ? '-mt-12 relative z-10' : ''}`}>
                  {/* Avatar */}
                  <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full overflow-hidden border-3 border-starforge-gold/30 mx-auto md:mx-0 shadow-lg shadow-black/40">
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full bg-starforge-gold/10 flex items-center justify-center"><span class="font-display text-4xl md:text-6xl text-starforge-gold/60">${author.name.charAt(0)}</span></div>`; }} />
                    ) : (
                      <div className="w-full h-full bg-starforge-gold/10 flex items-center justify-center">
                        <span className="font-display text-4xl md:text-6xl text-starforge-gold/60">{author.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-center text-center md:text-left flex-1 min-w-0">
                    <h2 className="font-heading text-2xl text-text-primary font-semibold mb-1">{author.penName || author.name}</h2>

                    {/* Genre badges */}
                    {author.genres && author.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3 justify-center md:justify-start">
                        {author.genres.map((g, i) => (
                          <span key={i} className="font-ui text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-starforge-gold/10 text-starforge-gold/80 border border-starforge-gold/20">{g}</span>
                        ))}
                      </div>
                    )}

                    <p className="font-body text-text-secondary mb-4 text-sm leading-relaxed line-clamp-3">{author.bio}</p>

                    {/* Stats row */}
                    {author.stats && (
                      <div className="flex gap-4 mb-4 justify-center md:justify-start">
                        {author.stats.followers != null && (
                          <div className="flex items-center gap-1.5 text-text-muted">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-mono text-xs">{(author.stats.followers / 1000).toFixed(1)}k</span>
                          </div>
                        )}
                        {author.stats.totalReaders != null && (
                          <div className="flex items-center gap-1.5 text-text-muted">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="font-mono text-xs">{(author.stats.totalReaders / 1000).toFixed(0)}k readers</span>
                          </div>
                        )}
                        {author.stats.avgRating != null && (
                          <div className="flex items-center gap-1.5 text-starforge-gold/80">
                            <Star className="w-3.5 h-3.5" />
                            <span className="font-mono text-xs">{author.stats.avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Published Works */}
                    {author.books && author.books.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-starforge-gold mb-2 flex items-center justify-center md:justify-start gap-2">
                          <BookOpen className="w-3.5 h-3.5" /> Published Works
                        </h3>
                        <ul className="space-y-0.5">
                          {author.books.map((book, i) => (
                            <li key={i} className="font-ui text-xs text-text-muted">{book}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Serialized Journeys linked to this author */}
                    {(() => {
                      const authorJourneys = journeys.filter((j: any) => 
                        j.author?.toLowerCase().includes(author.name?.split(' ')[1]?.toLowerCase() || '___') ||
                        j.authorSlug === author.slug
                      );
                      return authorJourneys.length > 0 ? (
                        <div className="mb-4">
                          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-cosmic-purple mb-2 flex items-center justify-center md:justify-start gap-2">
                            <Scroll className="w-3.5 h-3.5" /> Serialized Journeys
                          </h3>
                          <div className="space-y-1.5">
                            {authorJourneys.map((j: any) => (
                              <Link key={j.id} to={`/journeys/${j.slug}`}
                                className="flex items-center gap-2 text-xs text-text-muted hover:text-cosmic-purple transition-colors group/j">
                                <span className="w-1.5 h-1.5 rounded-full bg-cosmic-purple/50 group-hover/j:bg-cosmic-purple transition-colors" />
                                <span>{j.title}</span>
                                <span className="text-[10px] text-text-muted/60">({j.genre})</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* Footer: Social + View Profile */}
                    <div className="flex items-center gap-4 pt-3 border-t border-border/50 justify-center md:justify-start">
                      {socialWeb && (
                        <a href={socialWeb} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-starforge-gold transition-colors" title="Website">
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                      {socialTw && (
                        <a href={`https://twitter.com/${socialTw.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-starforge-gold transition-colors" title="Twitter">
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {socialIg && (
                        <a href={`https://instagram.com/${socialIg.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-starforge-gold transition-colors" title="Instagram">
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      <div className="flex-1" />
                      <Link to={author.slug ? `/author/${author.slug}` : '/catalog'} className="inline-flex items-center gap-2 font-ui text-xs text-text-primary hover:text-starforge-gold transition-colors uppercase tracking-wider">
                        View Profile <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {authors.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="font-ui text-text-muted text-lg">No authors found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
