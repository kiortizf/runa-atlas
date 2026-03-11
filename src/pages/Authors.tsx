import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface Author {
  id: string;
  name: string;
  image: string;
  bio: string;
  books: string[];
  slug?: string;
  status?: string;
}

const SEED_AUTHORS: Author[] = [
  {
    id: '1', name: 'Elara Vance', image: 'https://picsum.photos/seed/elara/400/400',
    bio: 'Elara Vance is a speculative fiction author whose work explores the intersection of magic and architecture. She lives in the Pacific Northwest with her two cats and a growing collection of vintage typewriters.',
    books: ['The Obsidian Crown', 'Echoes of the Spire']
  },
  {
    id: '2', name: 'Jax Thorne', image: 'https://picsum.photos/seed/jax/400/400',
    bio: 'Jax Thorne writes dystopian thrillers that ask hard questions about technology and consciousness. When not writing, Jax is an avid rock climber and amateur astronomer.',
    books: ['Neon Requiem', 'Silicon Souls']
  },
  {
    id: '3', name: 'Marina Solis', image: 'https://picsum.photos/seed/marina/400/400',
    bio: 'Marina Solis weaves literary fiction with magical realism, drawing heavily from her coastal upbringing. Her work has been nominated for several prestigious awards.',
    books: ['Whispers of the Deep', 'The Saltwater Archives']
  },
  {
    id: '4', name: 'Leo Vance', image: 'https://picsum.photos/seed/leo/400/400',
    bio: 'Leo Vance is known for his character-driven queer romances set against sweeping sci-fi backdrops. He believes that love is the most powerful force in the universe.',
    books: ['Star-Crossed Circuits', 'Orbiting You']
  }
];

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>(SEED_AUTHORS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'authors'),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Author));
        // Only use Firestore data if it exists; keep seed data as fallback
        if (data.length > 0) setAuthors(data.filter(a => a.status !== 'inactive'));
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'authors');
        setLoading(false);
      }
    );
    return () => unsub();
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
          {authors.map((author, idx) => (
            <motion.div
              key={author.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface border border-border p-8 rounded-sm flex flex-col md:flex-row gap-8 hover:border-starforge-gold/50 transition-colors"
            >
              <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-full overflow-hidden border-2 border-starforge-gold/30 mx-auto md:mx-0">
                <img src={author.image} alt={author.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col justify-center text-center md:text-left">
                <h2 className="font-heading text-2xl text-text-primary font-semibold mb-2">{author.name}</h2>
                <p className="font-body text-text-secondary mb-6 text-sm leading-relaxed">{author.bio}</p>
                
                {author.books && author.books.length > 0 && (
                  <div>
                    <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-starforge-gold mb-3 flex items-center justify-center md:justify-start gap-2">
                      <BookOpen className="w-4 h-4" /> Published Works
                    </h3>
                    <ul className="space-y-1">
                      {author.books.map((book, i) => (
                        <li key={i} className="font-ui text-sm text-text-muted">{book}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link to={author.slug ? `/author/${author.slug}` : '/catalog'} className="inline-flex items-center gap-2 font-ui text-xs text-text-primary hover:text-starforge-gold transition-colors uppercase tracking-wider">
                    {author.slug ? 'View Profile' : 'View in Catalog'} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
