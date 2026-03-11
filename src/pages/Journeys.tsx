import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scroll, Sparkles, Search, Filter, Clock, BookOpen, Bell, BellOff, LogIn } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

type Journey = {
  id: string;
  slug: string;
  title: string;
  author: string;
  genre: string;
  status: 'Active' | 'Completed' | 'Hiatus';
  featured: boolean;
  coverUrl?: string;
  description: string;
  totalEpisodes: number;
  publishedEpisodes: number;
};

const SEED_JOURNEYS: Journey[] = [
  {
    id: 'seed-1', slug: 'the-ember-codex', title: 'The Ember Codex', author: 'Alara Vane', genre: 'Dark Fantasy',
    status: 'Active', featured: true,
    description: 'A scholar discovers a forbidden text that rewrites the history of magic, drawing the attention of an ancient order that will stop at nothing to keep its secrets buried.',
    totalEpisodes: 8, publishedEpisodes: 3,
  },
  {
    id: 'seed-2', slug: 'neon-horizons', title: 'Neon Horizons', author: 'Kaelen Vance', genre: 'Cyberpunk',
    status: 'Completed', featured: false,
    description: 'In a city where memories can be bought and sold, a rogue archivist must uncover the truth behind her own missing past before her mind is wiped completely.',
    totalEpisodes: 12, publishedEpisodes: 12,
  },
];

export default function Journeys() {
  const { user, signIn } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'journeys'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Journey));
      setJourneys(data.length > 0 ? data : SEED_JOURNEYS);
      setLoading(false);
    }, () => {
      setJourneys(SEED_JOURNEYS);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Load subscriptions
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, `users/${user.uid}/journeySubscriptions`), snap => {
      setSubscriptions(snap.docs.map(d => d.id));
    }, () => { });
    return () => unsub();
  }, [user]);

  const toggleSubscribe = async (journeyId: string) => {
    if (!user) { signIn(); return; }
    const ref = doc(db, `users/${user.uid}/journeySubscriptions`, journeyId);
    if (subscriptions.includes(journeyId)) {
      try { await deleteDoc(ref); } catch { /* ignore */ }
    } else {
      try { await setDoc(ref, { subscribedAt: new Date() }); } catch { /* ignore */ }
    }
  };

  const genres = [...new Set(journeys.map(j => j.genre))];
  const statuses = ['all', 'Active', 'Completed', 'Hiatus'];

  const filtered = journeys.filter(j => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.author.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="min-h-screen bg-void-black flex items-center justify-center text-starforge-gold font-ui text-xl uppercase tracking-widest animate-pulse">Loading journeys...</div>;
  }

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-4">
            <span className="bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/30 text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm font-ui">
              Serialized Storytelling
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            Episodic <span className="text-starforge-gold italic font-heading normal-case">Journeys</span>
          </h1>
          <p className="font-ui text-text-secondary tracking-widest uppercase text-sm max-w-2xl mx-auto">
            Experience stories as they unfold. Read chapter by chapter, week by week.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search journeys or authors..."
              className="w-full bg-surface border border-border rounded-sm pl-10 pr-4 py-2.5 text-text-primary font-ui text-sm outline-none focus:border-starforge-gold/50 transition-colors" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-sm font-ui text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-starforge-gold text-void-black' : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                  }`}>
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Scroll className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-30" />
            <p className="font-ui text-text-secondary">No journeys match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((journey, i) => {
              const progress = journey.totalEpisodes > 0 ? Math.round((journey.publishedEpisodes / journey.totalEpisodes) * 100) : 0;
              const isSub = subscriptions.includes(journey.id);
              return (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-surface border border-border rounded-sm overflow-hidden flex flex-col hover:border-starforge-gold/30 transition-colors group"
                >
                  {journey.coverUrl && (
                    <div className="h-48 overflow-hidden">
                      <img src={journey.coverUrl} alt={journey.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-ui border ${journey.status === 'Active' ? 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30' :
                            journey.status === 'Completed' ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30' :
                              'bg-forge-red/10 text-forge-red border-forge-red/30'
                          }`}>{journey.status === 'Active' ? 'Ongoing' : journey.status}</span>
                        <span className="bg-surface-elevated text-text-muted border border-border text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-ui">
                          {journey.genre}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {journey.featured && <Sparkles className="w-4 h-4 text-starforge-gold" />}
                        <button onClick={(e) => { e.preventDefault(); toggleSubscribe(journey.id); }}
                          className={`p-1 rounded-sm transition-colors ${isSub ? 'text-starforge-gold' : 'text-text-muted hover:text-starforge-gold'}`}
                          title={isSub ? 'Unsubscribe' : 'Subscribe for new episodes'}>
                          {isSub ? <Bell className="w-4 h-4 fill-starforge-gold" /> : <BellOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <h2 className="font-heading text-2xl text-text-primary mb-1 group-hover:text-starforge-gold transition-colors">{journey.title}</h2>
                    <p className="font-ui text-sm text-starforge-gold mb-4">by {journey.author}</p>
                    <p className="font-body text-text-secondary mb-6 flex-grow line-clamp-3">{journey.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-mono text-[9px] text-text-muted">{journey.publishedEpisodes}/{journey.totalEpisodes} episodes</span>
                        <span className="font-mono text-[9px] text-starforge-gold">{progress}%</span>
                      </div>
                      <div className="h-1 bg-deep-space rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                          className="h-full bg-gradient-to-r from-starforge-gold to-aurora-teal rounded-full" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-ui text-[10px] text-text-muted">
                          <BookOpen className="w-3 h-3" /> {journey.publishedEpisodes} published
                        </span>
                      </div>
                      <Link to={`/journeys/${journey.slug || journey.id}`}
                        className="font-ui text-sm text-starforge-gold hover:text-white transition-colors flex items-center gap-1">
                        Read &rarr;
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
