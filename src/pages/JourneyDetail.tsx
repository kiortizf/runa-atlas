import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle, Clock, Lock } from 'lucide-react';

type Episode = {
  id: string;
  number: number;
  title: string;
  status: 'published' | 'scheduled' | 'draft';
  wordCount: number;
  publishDate: string;
  excerpt: string;
};

type Journey = {
  id: string;
  slug: string;
  title: string;
  author: string;
  synopsis: string;
  coverUrl?: string;
  totalEpisodes: number;
  episodes: Episode[];
};

export default function JourneyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed data
    if (slug === 'the-ember-codex') {
      setJourney({
        id: '1',
        slug: 'the-ember-codex',
        title: 'The Ember Codex',
        author: 'Alara Vane',
        synopsis: 'A scholar discovers a forbidden text that rewrites the history of magic, drawing the attention of an ancient order that will stop at nothing to keep its secrets buried. As she delves deeper into the codex, she realizes the magic it describes is not just history, but a living, breathing force that is awakening.',
        totalEpisodes: 8,
        episodes: [
          {
            id: 'ep1',
            number: 1,
            title: 'The Dust of Ages',
            status: 'published',
            wordCount: 3450,
            publishDate: '2026-02-15',
            excerpt: 'The library smelled of old paper and forgotten dreams. Elara traced the spine of the unmarked tome, feeling a strange warmth radiating from the leather.'
          },
          {
            id: 'ep2',
            number: 2,
            title: 'Whispers in the Dark',
            status: 'published',
            wordCount: 4120,
            publishDate: '2026-02-22',
            excerpt: 'The words on the page seemed to shift and writhe as she read them. It wasn\'t a language she knew, but she understood it perfectly.'
          },
          {
            id: 'ep3',
            number: 3,
            title: 'The Order of the Eclipse',
            status: 'published',
            wordCount: 3890,
            publishDate: '2026-03-01',
            excerpt: 'They came in the dead of night, silent as shadows. Elara barely had time to grab the codex before her door was splintered open.'
          },
          {
            id: 'ep4',
            number: 4,
            title: 'Flight through the Catacombs',
            status: 'scheduled',
            wordCount: 4500,
            publishDate: '2026-03-15',
            excerpt: 'The air grew colder the deeper they went. The catacombs were a maze, but the codex seemed to pulse, guiding her steps.'
          }
        ]
      });
    } else {
      setJourney({
        id: '2',
        slug: 'neon-horizons',
        title: 'Neon Horizons',
        author: 'Kaelen Vance',
        synopsis: 'In a city where memories can be bought and sold, a rogue archivist must uncover the truth behind her own missing past before her mind is wiped completely.',
        totalEpisodes: 12,
        episodes: []
      });
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Loading journey...</div>;
  }

  if (!journey) {
    return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Journey not found.</div>;
  }

  const publishedCount = journey.episodes.filter(e => e.status === 'published').length;
  const progressPercentage = journey.totalEpisodes > 0 ? (publishedCount / journey.totalEpisodes) * 100 : 0;

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/journeys" className="inline-flex items-center gap-2 text-starforge-gold hover:text-white font-ui text-sm uppercase tracking-wider mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> All Journeys
        </Link>

        {/* Header Card */}
        <div className="bg-surface border border-border/50 rounded-3xl overflow-hidden mb-12 relative">
          {journey.coverUrl && (
            <div className="absolute inset-0 z-0 opacity-20">
              <img src={journey.coverUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
            </div>
          )}
          <div className="relative z-10 p-8 md:p-12">
            <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
              {journey.title}
            </h1>
            <p className="font-ui text-starforge-gold text-lg mb-8">by {journey.author}</p>
            <p className="font-body text-text-secondary text-lg leading-relaxed max-w-2xl">
              {journey.synopsis}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-2">
            <span className="font-ui text-xs uppercase tracking-widest text-text-muted">Journey Progress</span>
            <span className="font-ui text-sm text-starforge-gold">{publishedCount} of {journey.totalEpisodes} episodes</span>
          </div>
          <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-starforge-gold to-[#f0c870]"
            />
          </div>
        </div>

        {/* Table of Contents */}
        <div className="space-y-4">
          <h2 className="font-heading text-2xl text-text-primary mb-6">Table of Contents</h2>
          
          {/* Render episodes */}
          {Array.from({ length: journey.totalEpisodes }).map((_, index) => {
            const episodeNumber = index + 1;
            const episode = journey.episodes.find(e => e.number === episodeNumber);

            if (episode?.status === 'published') {
              return (
                <Link 
                  key={episodeNumber}
                  to={`/journeys/${journey.slug}/episode/${episodeNumber}`}
                  className="block"
                >
                  <motion.div 
                    whileHover={{ x: 8 }}
                    className="bg-surface border border-border/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:border-starforge-gold/50"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/30 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                          Episode {episodeNumber}
                        </span>
                        <span className="font-ui text-xs text-text-muted">{episode.publishDate}</span>
                        <span className="font-ui text-xs text-text-muted">• {episode.wordCount} words</span>
                      </div>
                      <h3 className="font-heading text-xl text-text-primary mb-2">{episode.title}</h3>
                      <p className="font-body text-text-secondary text-sm line-clamp-2">{episode.excerpt}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                  </motion.div>
                </Link>
              );
            }

            if (episode?.status === 'scheduled') {
              return (
                <div key={episodeNumber} className="bg-surface/60 border border-border/30 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-60">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-surface-elevated text-text-muted border border-border/50 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                        Episode {episodeNumber}
                      </span>
                      <span className="font-ui text-xs text-amber-400">Coming {episode.publishDate}</span>
                    </div>
                    <h3 className="font-heading text-xl text-text-primary mb-2">{episode.title}</h3>
                    <p className="font-body text-text-secondary text-sm line-clamp-2">{episode.excerpt}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Clock className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              );
            }

            // Locked/Future placeholder
            return (
              <div key={episodeNumber} className="bg-surface/40 border border-border/20 rounded-3xl p-6 flex items-center justify-between opacity-40">
                <div className="flex items-center gap-4">
                  <span className="bg-surface-elevated text-text-muted border border-border/50 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                    Episode {episodeNumber}
                  </span>
                  <span className="font-heading text-lg text-text-muted">Chapter {episodeNumber}</span>
                </div>
                <Lock className="w-5 h-5 text-text-muted" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
