import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scroll, Sparkles } from 'lucide-react';

type Journey = {
  id: string;
  slug: string;
  title: string;
  author: string;
  genre: string;
  status: 'draft' | 'active' | 'completed' | 'hiatus';
  featured: boolean;
  coverUrl?: string;
  description: string;
  totalEpisodes: number;
  publishedEpisodes: number;
};

export default function Journeys() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed data
    const seedJourneys: Journey[] = [
      {
        id: '1',
        slug: 'the-ember-codex',
        title: 'The Ember Codex',
        author: 'Alara Vane',
        genre: 'Dark Fantasy',
        status: 'active',
        featured: true,
        description: 'A scholar discovers a forbidden text that rewrites the history of magic, drawing the attention of an ancient order that will stop at nothing to keep its secrets buried.',
        totalEpisodes: 8,
        publishedEpisodes: 3,
      },
      {
        id: '2',
        slug: 'neon-horizons',
        title: 'Neon Horizons',
        author: 'Kaelen Vance',
        genre: 'Cyberpunk',
        status: 'completed',
        featured: false,
        description: 'In a city where memories can be bought and sold, a rogue archivist must uncover the truth behind her own missing past before her mind is wiped completely.',
        totalEpisodes: 12,
        publishedEpisodes: 12,
      }
    ];
    setJourneys(seedJourneys);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Loading journeys...</div>;
  }

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-4">
            <span className="bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
              Serialized Storytelling
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            Episodic Journeys
          </h1>
          <p className="font-ui text-text-secondary tracking-widest uppercase text-sm max-w-2xl mx-auto">
            Experience stories as they unfold. Read chapter by chapter, week by week.
          </p>
        </div>

        {journeys.length === 0 ? (
          <div className="text-center py-24">
            <Scroll className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="font-ui text-text-secondary">No journeys have begun yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {journeys.map((journey) => (
              <motion.div 
                key={journey.id}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-surface border border-border/50 rounded-3xl overflow-hidden flex flex-col"
              >
                {journey.coverUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={journey.coverUrl} 
                      alt={journey.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      {journey.status === 'active' && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                          Ongoing
                        </span>
                      )}
                      {journey.status === 'completed' && (
                        <span className="bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                          Complete
                        </span>
                      )}
                      {journey.status === 'hiatus' && (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                          On Hiatus
                        </span>
                      )}
                      <span className="bg-surface-elevated text-text-muted border border-border/50 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                        {journey.genre}
                      </span>
                    </div>
                    {journey.featured && (
                      <Sparkles className="w-5 h-5 text-starforge-gold" />
                    )}
                  </div>
                  
                  <h2 className="font-display text-2xl text-text-primary mb-1">{journey.title}</h2>
                  <p className="font-ui text-starforge-gold text-sm mb-4">by {journey.author}</p>
                  
                  <p className="font-body text-text-secondary mb-8 flex-grow">
                    {journey.description}
                  </p>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-border/50">
                    <span className="font-ui text-xs text-text-muted uppercase tracking-wider">
                      {journey.publishedEpisodes} / {journey.totalEpisodes} Episodes
                    </span>
                    <Link 
                      to={`/journeys/${journey.slug}`}
                      className="font-ui text-sm text-starforge-gold hover:text-white transition-colors flex items-center gap-1"
                    >
                      Read &rarr;
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
