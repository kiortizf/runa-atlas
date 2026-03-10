import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const CODEMARKS = [
  'All',
  '⚔️ Speculative Fiction',
  '🌙 Dark Fantasy',
  '💀 Horror',
  '💜 Queer Romance',
  '🔥 Dystopian',
  '✨ Magical Realism',
  '🗡️ Epic Fantasy',
  '🌊 Literary Fiction',
  '🎭 Genre-Blending'
];

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

export default function Catalog() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const booksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[];
        setBooks(booksData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesFilter = activeFilter === 'All' || book.codemark === activeFilter;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-void-black min-h-screen py-16 flex items-center justify-center">
        <div className="text-starforge-gold font-ui text-xl uppercase tracking-widest animate-pulse">Loading Catalog...</div>
      </div>
    );
  }

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            The <span className="text-starforge-gold italic font-heading normal-case">Constellation</span>
          </h1>
          <p className="font-ui text-text-secondary tracking-widest uppercase text-sm">Explore our catalog of starpoints</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-border pb-8">
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search titles, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-sm bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-starforge-gold focus:border-starforge-gold font-ui text-sm"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm bg-surface text-text-primary font-ui text-sm hover:border-starforge-gold/50 transition-colors">
                <Filter className="w-4 h-4" />
                Genre: {activeFilter.split(' ')[1] || 'All'}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border rounded-sm shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <div className="py-1 max-h-64 overflow-y-auto">
                  {CODEMARKS.map((mark) => (
                    <button
                      key={mark}
                      onClick={() => setActiveFilter(mark)}
                      className={`block w-full text-left px-4 py-2 text-sm font-ui ${
                        activeFilter === mark 
                          ? 'bg-starforge-gold/10 text-starforge-gold' 
                          : 'text-text-secondary hover:bg-void-black hover:text-text-primary'
                      }`}
                    >
                      {mark}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="font-ui text-sm text-text-muted">
              Showing {filteredBooks.length} results
            </div>
          </div>
        </div>

        {/* Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredBooks.map((book, idx) => (
              <motion.div 
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                <Link to={`/catalog/${book.id}`} className="block">
                  <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded-sm border border-border group-hover:border-starforge-gold/50 transition-colors shadow-lg">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-void-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <span className="px-6 py-2 border border-starforge-gold text-starforge-gold font-ui text-sm uppercase tracking-widest bg-void-black/80">
                        View Details
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-ui text-[10px] uppercase tracking-widest text-text-muted">{book.codemark}</div>
                    <div className="flex items-center gap-2">
                      {book.editionType !== 'Standard' && (
                        <span className="font-ui text-[9px] uppercase tracking-wider bg-starforge-gold/20 text-starforge-gold px-1.5 py-0.5 rounded-sm">
                          {book.editionType}
                        </span>
                      )}
                      <div className="font-ui text-xs text-text-secondary">{book.format}</div>
                    </div>
                  </div>
                  
                  <h3 className="font-heading text-xl text-text-primary font-semibold mb-1 group-hover:text-starforge-gold transition-colors line-clamp-1">{book.title}</h3>
                  
                  <div className="flex justify-between items-center">
                    <p className="font-ui text-sm text-text-secondary">{book.author}</p>
                    <p className="font-mono text-sm text-starforge-gold">{book.price}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <h3 className="font-heading text-2xl text-text-primary mb-2">No starpoints found</h3>
            <p className="font-ui text-text-secondary">Try adjusting your search or filters.</p>
            <button 
              onClick={() => { setActiveFilter('All'); setSearchQuery(''); }}
              className="mt-6 px-6 py-2 border border-border text-text-primary font-ui text-sm uppercase tracking-wider hover:border-starforge-gold hover:text-starforge-gold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
