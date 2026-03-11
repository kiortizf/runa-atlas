import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ArrowLeft, ShoppingCart, Star, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import BookReviews from '../components/BookReviews';
import BookshelfButton from '../components/BookshelfButton';

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  codemark: string;
  price: number;
  editionType: string;
  format: string;
  synopsis: string;
  constellationId?: string;
  themes?: string[];
  connections?: string[];
}

interface Constellation {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

function LiveRating({ bookId }: { bookId: string }) {
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const q = query(collection(db, 'reviews'), where('bookId', '==', bookId));
    const unsub = onSnapshot(q, (snap) => {
      const ratings = snap.docs.map(d => d.data().rating as number);
      setCount(ratings.length);
      setAvg(ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0);
    }, () => { });
    return () => unsub();
  }, [bookId]);
  return (
    <div className="flex items-center gap-1 text-text-muted">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= Math.round(avg) ? 'fill-starforge-gold text-starforge-gold' : 'text-text-muted/20'}`} />
      ))}
      <span className="font-ui text-sm ml-2">({count})</span>
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [constellation, setConstellation] = useState<Constellation | null>(null);
  const [connectedBooks, setConnectedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'books', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const bookData = { id: docSnap.id, ...docSnap.data() } as Book;
          setBook(bookData);

          // Fetch constellation
          if (bookData.constellationId) {
            try {
              const constDoc = await getDoc(doc(db, 'constellations', bookData.constellationId));
              if (constDoc.exists()) {
                setConstellation({ id: constDoc.id, ...constDoc.data() } as Constellation);
              }
            } catch { /* ignore */ }
          }

          // Fetch connected books (Threads)
          if (bookData.connections && bookData.connections.length > 0) {
            const connected: Book[] = [];
            for (const cid of bookData.connections.slice(0, 6)) {
              try {
                const cDoc = await getDoc(doc(db, 'books', cid));
                if (cDoc.exists()) connected.push({ id: cDoc.id, ...cDoc.data() } as Book);
              } catch { /* skip */ }
            }
            setConnectedBooks(connected);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `books/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-void-black min-h-screen py-16 flex items-center justify-center">
        <div className="text-starforge-gold font-ui text-xl uppercase tracking-widest animate-pulse">Loading Starpoint...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-void-black min-h-screen py-16 flex flex-col items-center justify-center">
        <h2 className="text-text-primary font-heading text-3xl mb-4">Starpoint Not Found</h2>
        <Link to="/catalog" className="text-aurora-teal hover:text-teal-400 font-ui uppercase tracking-wider flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-text-muted hover:text-starforge-gold transition-colors font-ui text-sm uppercase tracking-wider mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Cover */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md relative">
              <div className="aspect-[2/3] rounded-sm overflow-hidden border border-border shadow-2xl relative z-10">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -inset-4 border border-starforge-gold/20 rounded-sm z-0 translate-x-4 translate-y-4"></div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-ui text-xs uppercase tracking-widest text-starforge-gold border border-starforge-gold/30 px-2 py-1 rounded-sm bg-starforge-gold/5">
                  {book.codemark}
                </span>
                {book.editionType !== 'Standard' && (
                  <span className="font-ui text-xs uppercase tracking-widest text-aurora-teal border border-aurora-teal/30 px-2 py-1 rounded-sm bg-aurora-teal/5">
                    {book.editionType}
                  </span>
                )}
                {/* Constellation Badge */}
                {constellation && (
                  <Link
                    to={`/constellation/${constellation.id}`}
                    className="font-ui text-xs uppercase tracking-widest px-2 py-1 rounded-sm flex items-center gap-1.5 border transition-colors hover:opacity-80"
                    style={{
                      color: constellation.color,
                      borderColor: `${constellation.color}40`,
                      backgroundColor: `${constellation.color}10`,
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    {constellation.icon} {constellation.name}
                  </Link>
                )}
              </div>

              <h1 className="font-heading text-4xl md:text-5xl text-text-primary mb-2">{book.title}</h1>
              <p className="font-ui text-xl text-text-secondary">by {book.author}</p>
            </div>

            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
              <div className="font-mono text-3xl text-starforge-gold">${book.price.toFixed(2)}</div>
              <LiveRating bookId={id!} />
            </div>

            <div className="mb-8">
              <h3 className="font-ui text-sm uppercase tracking-widest text-text-muted mb-4">Synopsis</h3>
              <p className="font-ui text-text-secondary leading-relaxed whitespace-pre-line">
                {book.synopsis}
              </p>
            </div>

            {/* Theme Tags */}
            {book.themes && book.themes.length > 0 && (
              <div className="mb-8">
                <h3 className="font-ui text-sm uppercase tracking-widest text-text-muted mb-3">Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {book.themes.map(theme => (
                    <span key={theme} className="font-mono text-xs px-3 py-1 rounded-full border border-border text-text-secondary bg-surface hover:border-starforge-gold/30 transition-colors">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-surface p-4 border border-border rounded-sm">
                <div className="font-ui text-xs text-text-muted uppercase tracking-wider mb-1">Format</div>
                <div className="font-ui text-text-primary">{book.format}</div>
              </div>
              <div className="bg-surface p-4 border border-border rounded-sm">
                <div className="font-ui text-xs text-text-muted uppercase tracking-wider mb-1">Publisher</div>
                <div className="font-ui text-text-primary">Rüna Atlas</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 bg-starforge-gold text-void-black px-8 py-4 font-ui text-sm uppercase tracking-widest rounded-sm hover:bg-yellow-500 transition-colors">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <Link to={`/read/${id}/1`} className="flex-1 flex items-center justify-center gap-2 border-2 border-starforge-gold text-starforge-gold px-8 py-4 font-ui text-sm uppercase tracking-widest rounded-sm hover:bg-starforge-gold hover:text-void-black transition-colors">
                <BookOpen className="w-5 h-5" /> Read Now
              </Link>
            </div>

            {/* Bookshelf Status */}
            <BookshelfButton bookId={id!} bookTitle={book.title} />
          </motion.div>
        </div>

        {/* Threads: Connected Books */}
        {connectedBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-24"
          >
            <h2 className="font-display text-2xl text-text-primary uppercase tracking-widest mb-2 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-starforge-gold" /> Threads
            </h2>
            <p className="font-ui text-sm text-text-secondary mb-8">Stories connected through shared themes and narrative threads</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectedBooks.map((cb, i) => (
                <motion.div
                  key={cb.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <Link
                    to={`/catalog/${cb.id}`}
                    className="group flex gap-4 bg-surface border border-border rounded-sm p-4 hover:border-starforge-gold/30 transition-all"
                  >
                    <img src={cb.cover} alt={cb.title} className="w-16 h-24 object-cover rounded-sm border border-border flex-shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <span className="font-ui text-[10px] uppercase tracking-wider text-starforge-gold">{cb.codemark}</span>
                      <h3 className="font-heading text-lg text-text-primary group-hover:text-starforge-gold transition-colors truncate">{cb.title}</h3>
                      <p className="font-ui text-xs text-text-secondary">by {cb.author}</p>
                      {cb.themes && cb.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cb.themes.slice(0, 3).map(t => (
                            <span key={t} className="font-mono text-[9px] text-text-muted bg-void-black px-1.5 py-0.5 rounded-sm border border-border">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-starforge-gold transition-colors self-center flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews */}
        <BookReviews bookId={id!} />
      </div>
    </div >
  );
}
