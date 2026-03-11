import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, BookOpen, PenTool, Sparkles, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { usePageSEO } from '../hooks/usePageSEO';

interface FeaturedBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  codemark?: string;
  synopsis?: string;
  editionType?: string;
  genre?: string;
}

const SEED_BOOKS: FeaturedBook[] = [
  { id: '1', title: 'The Obsidian Crown', author: 'Elara Vance', cover: 'https://picsum.photos/seed/obsidian/600/900', codemark: '🗡️ Epic Fantasy', synopsis: 'In a world where magic is drawn from the marrow of fallen gods, a young thief discovers she carries the bloodline of the architects.', editionType: 'Standard' },
  { id: '2', title: 'Neon Requiem', author: 'Jax Thorne', cover: 'https://picsum.photos/seed/neon/600/900', codemark: '🔥 Dystopian', synopsis: 'A cybernetic detective must solve the murder of an AI consciousness before the city\'s power grid is permanently severed.', editionType: 'Standard' },
  { id: '3', title: 'Whispers of the Deep', author: 'Marina Solis', cover: 'https://picsum.photos/seed/whispers/600/900', codemark: '🌊 Literary Fiction', synopsis: 'An exploration of grief and memory set against the backdrop of a sinking coastal town where the dead refuse to stay buried.', editionType: 'Signed' },
  { id: '4', title: 'Star-Crossed Circuits', author: 'Leo Vance', cover: 'https://picsum.photos/seed/circuits/600/900', codemark: '💜 Queer Romance', synopsis: 'Two rival mechanics on a deep-space mining colony find themselves forced to cooperate when their station is sabotaged.', editionType: 'Interactive' },
];

export default function Home() {
  usePageSEO({
    title: 'RÜNA ATLAS PRESS',
    description: 'Independent speculative fiction publisher centering voices from marginalized communities. Explore science fiction, fantasy, horror, and magical realism across our Bohío Press and Void Noir imprints.',
  });
  const [books, setBooks] = useState<FeaturedBook[]>(SEED_BOOKS);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'books'), orderBy('createdAt', 'desc'), limit(4)),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as FeaturedBook));
        if (data.length > 0) setBooks(data);
      },
      () => { /* use seed fallback */ }
    );
    return () => unsub();
  }, []);

  return (
    <div className="bg-void-black min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cosmic-purple/20 via-void-black to-void-black opacity-80 z-0"></div>

        {/* Abstract Constellation Background Elements */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="var(--color-starforge-gold)" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="30%" y1="40%" x2="70%" y2="30%" stroke="var(--color-starforge-gold)" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="70%" y1="30%" x2="85%" y2="60%" stroke="var(--color-starforge-gold)" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="30%" y1="40%" x2="45%" y2="70%" stroke="var(--color-starforge-gold)" strokeWidth="0.5" strokeDasharray="4 4" />

            <circle cx="10%" cy="20%" r="2" fill="var(--color-starforge-gold)" />
            <circle cx="30%" cy="40%" r="3" fill="var(--color-starforge-gold)" className="animate-pulse" />
            <circle cx="70%" cy="30%" r="2" fill="var(--color-starforge-gold)" />
            <circle cx="85%" cy="60%" r="3" fill="var(--color-starforge-gold)" className="animate-pulse" />
            <circle cx="45%" cy="70%" r="2" fill="var(--color-starforge-gold)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-text-primary mb-6 tracking-wider uppercase leading-tight">
              Where Stories <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-starforge-gold via-ember-orange to-starforge-gold text-glow-gold">Become Stars</span>
            </h1>
            <p className="font-heading text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 italic">
              Some stories are still being kept secret. We carve them into the sky where everyone can see. Speculative fiction from the margins of the literary cosmos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 font-ui">
              <Link to="/catalog" className="group relative px-8 py-4 bg-starforge-gold text-void-black rounded-sm font-semibold tracking-wide overflow-hidden transition-all hover:scale-105 w-full sm:w-auto">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Explore the Catalog <BookOpen className="w-4 h-4" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              </Link>

              <Link to="/submissions" className="group px-8 py-4 border border-starforge-gold/50 text-starforge-gold rounded-sm font-semibold tracking-wide hover:bg-starforge-gold/10 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                Inscribe Your Story <PenTool className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Releases */}
      <section className="py-24 bg-surface border-y border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl text-text-primary uppercase tracking-widest mb-2">Latest Starpoints</h2>
              <p className="font-ui text-text-secondary text-sm tracking-widest uppercase">New & Upcoming Releases</p>
            </div>
            <Link to="/catalog" className="hidden md:flex items-center gap-2 font-ui text-sm text-starforge-gold hover:text-white transition-colors uppercase tracking-wider">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {books.map((book, idx) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={`/book/${book.id}`}>
                  <div className="relative aspect-[2/3] mb-6 overflow-hidden rounded-sm border border-border group-hover:border-starforge-gold/50 transition-colors">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-void-black/90 via-void-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <p className="font-body text-sm text-text-primary line-clamp-4 mb-4">{book.synopsis}</p>
                      <span className="font-ui text-xs font-semibold uppercase tracking-wider text-starforge-gold flex items-center gap-2">
                        Read More <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-ui text-[10px] uppercase tracking-widest text-text-muted">{book.codemark || book.genre}</div>
                    {book.editionType && book.editionType !== 'Standard' && (
                      <span className="font-ui text-[9px] uppercase tracking-wider bg-starforge-gold/20 text-starforge-gold px-1.5 py-0.5 rounded-sm">
                        {book.editionType}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl text-text-primary font-semibold mb-1 group-hover:text-starforge-gold transition-colors">{book.title}</h3>
                  <p className="font-ui text-sm text-text-secondary">{book.author}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link to="/catalog" className="inline-flex items-center gap-2 font-ui text-sm text-starforge-gold hover:text-white transition-colors uppercase tracking-wider">
              View All Releases <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission / The Forge */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-glow-purple rounded-full blur-3xl opacity-20"></div>
              <img src="https://picsum.photos/seed/forge/800/1000" alt="Cosmic Forge" className="relative rounded-sm border border-border shadow-2xl" referrerPolicy="no-referrer" />

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-starforge-gold/30 rounded-full flex items-center justify-center bg-void-black">
                <Star className="w-8 h-8 text-starforge-gold animate-pulse" />
              </div>
            </div>

            <div>
              <h2 className="font-display text-4xl md:text-5xl text-text-primary uppercase tracking-widest mb-8 leading-tight">
                Forging Constellations <br />
                <span className="text-starforge-gold italic font-heading normal-case text-5xl">of Voice</span>
              </h2>

              <div className="space-y-6 font-body text-lg text-text-secondary leading-relaxed">
                <p>
                  At Rüna Atlas, we believe that every marginalized voice holds a universe waiting to be charted. We are not just publishers; we are cartographers of the unknown, smiths of the unspoken.
                </p>
                <p>
                  Our Starforge process is collaborative, transparent, and fiercely protective of our authors' visions. We do not just acquire books. We welcome creators into a living Runeweave, a collective constellation where every star shines brighter together.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="border border-border p-6 rounded-sm bg-surface/50 hover:border-starforge-gold/30 transition-colors">
                  <Sparkles className="w-6 h-6 text-aurora-teal mb-4" />
                  <h4 className="font-ui text-sm font-semibold text-text-primary uppercase tracking-wider mb-2">Curated Magic</h4>
                  <p className="font-body text-sm text-text-muted">Meticulous editorial attention for every manuscript.</p>
                </div>
                <div className="border border-border p-6 rounded-sm bg-surface/50 hover:border-starforge-gold/30 transition-colors">
                  <Star className="w-6 h-6 text-starforge-gold mb-4" />
                  <h4 className="font-ui text-sm font-semibold text-text-primary uppercase tracking-wider mb-2">Author First</h4>
                  <p className="font-body text-sm text-text-muted">Transparent royalties and collaborative marketing.</p>
                </div>
                <div className="border border-border p-6 rounded-sm bg-surface/50 hover:border-starforge-gold/30 transition-colors">
                  <Send className="w-6 h-6 text-queer-pink mb-4" />
                  <h4 className="font-ui text-sm font-semibold text-text-primary uppercase tracking-wider mb-2">Open Doors</h4>
                  <p className="font-body text-sm text-text-muted">Unagented submissions always welcome during open calls.</p>
                </div>
              </div>

              <div className="mt-12">
                <Link to="/about" className="inline-flex items-center gap-2 font-ui text-sm text-text-primary hover:text-starforge-gold transition-colors uppercase tracking-wider pb-1 border-b border-starforge-gold/50">
                  Read Our Full Manifesto <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
