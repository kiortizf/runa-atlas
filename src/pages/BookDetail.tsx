import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'books', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setBook({ id: docSnap.id, ...docSnap.data() } as Book);
        } else {
          console.log("No such document!");
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
              {/* Decorative background element */}
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
              <div className="flex items-center gap-3 mb-4">
                <span className="font-ui text-xs uppercase tracking-widest text-starforge-gold border border-starforge-gold/30 px-2 py-1 rounded-sm bg-starforge-gold/5">
                  {book.codemark}
                </span>
                {book.editionType !== 'Standard' && (
                  <span className="font-ui text-xs uppercase tracking-widest text-aurora-teal border border-aurora-teal/30 px-2 py-1 rounded-sm bg-aurora-teal/5">
                    {book.editionType}
                  </span>
                )}
              </div>
              
              <h1 className="font-heading text-4xl md:text-5xl text-text-primary mb-2">{book.title}</h1>
              <p className="font-ui text-xl text-text-secondary">by {book.author}</p>
            </div>

            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
              <div className="font-mono text-3xl text-starforge-gold">${book.price.toFixed(2)}</div>
              <div className="flex items-center gap-1 text-text-muted">
                <Star className="w-4 h-4 fill-starforge-gold text-starforge-gold" />
                <Star className="w-4 h-4 fill-starforge-gold text-starforge-gold" />
                <Star className="w-4 h-4 fill-starforge-gold text-starforge-gold" />
                <Star className="w-4 h-4 fill-starforge-gold text-starforge-gold" />
                <Star className="w-4 h-4 fill-starforge-gold text-starforge-gold" />
                <span className="font-ui text-sm ml-2">(12)</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-ui text-sm uppercase tracking-widest text-text-muted mb-4">Synopsis</h3>
              <p className="font-ui text-text-secondary leading-relaxed whitespace-pre-line">
                {book.synopsis}
              </p>
            </div>

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

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 bg-starforge-gold text-void-black px-8 py-4 font-ui text-sm uppercase tracking-widest rounded-sm hover:bg-yellow-500 transition-colors">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-border text-text-primary px-8 py-4 font-ui text-sm uppercase tracking-widest rounded-sm hover:border-starforge-gold hover:text-starforge-gold transition-colors">
                Add to Wishlist
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
