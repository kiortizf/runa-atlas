import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, Heart, Clock, Settings, LogOut, Search, Filter } from 'lucide-react';

const LIBRARY_BOOKS = [
  {
    id: '1',
    title: 'The Obsidian Crown',
    author: 'Elara Vance',
    cover: 'https://picsum.photos/seed/obsidian/400/600',
    format: 'Ebook',
    progress: 45,
    purchasedAt: '2026-01-15',
    editionType: 'Standard'
  },
  {
    id: '2',
    title: 'Neon Requiem',
    author: 'Jax Thorne',
    cover: 'https://picsum.photos/seed/neon/400/600',
    format: 'Audiobook',
    progress: 12,
    purchasedAt: '2026-02-28',
    editionType: 'Standard'
  },
  {
    id: '4',
    title: 'Star-Crossed Circuits',
    author: 'Leo Vance',
    cover: 'https://picsum.photos/seed/circuits/400/600',
    format: 'Ebook',
    progress: 100,
    purchasedAt: '2025-11-10',
    editionType: 'Interactive'
  }
];

const WISHLIST = [
  {
    id: '3',
    title: 'Whispers of the Deep',
    author: 'Marina Solis',
    cover: 'https://picsum.photos/seed/whispers/400/600',
    price: '$24.99',
    format: 'Hardcover',
    editionType: 'Signed'
  }
];

export default function Library() {
  const [activeTab, setActiveTab] = useState('library');

  return (
    <div className="min-h-screen bg-void-black flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-deep-space border-r border-border flex flex-col h-auto md:h-screen sticky top-0">
        <div className="p-6 border-b border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface border border-aurora-teal/30 flex items-center justify-center overflow-hidden">
            <span className="font-display text-xl text-aurora-teal">R</span>
          </div>
          <div>
            <h2 className="font-heading text-lg text-text-primary">Reader Account</h2>
            <p className="font-ui text-xs text-aurora-teal uppercase tracking-wider">Navigator Tier</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('library')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === 'library' ? 'bg-aurora-teal/10 text-aurora-teal' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
          >
            <BookOpen className="w-4 h-4" /> My Library
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === 'wishlist' ? 'bg-aurora-teal/10 text-aurora-teal' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
          >
            <Heart className="w-4 h-4" /> Wishlist
            <span className="ml-auto bg-surface-elevated text-text-muted text-[10px] px-2 py-0.5 rounded-full">1</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === 'orders' ? 'bg-aurora-teal/10 text-aurora-teal' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
          >
            <Clock className="w-4 h-4" /> Order History
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm transition-colors ${activeTab === 'settings' ? 'bg-aurora-teal/10 text-aurora-teal' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-sm font-ui text-sm text-text-muted hover:text-forge-red transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Topbar */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-border">
          <h1 className="font-display text-3xl text-text-primary uppercase tracking-widest">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          
          {activeTab === 'library' && (
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Search library..." className="pl-9 pr-4 py-2 bg-surface border border-border rounded-sm font-ui text-sm text-text-primary focus:outline-none focus:border-aurora-teal" />
              </div>
              <button className="p-2 border border-border rounded-sm text-text-secondary hover:text-aurora-teal transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Library Content */}
        {activeTab === 'library' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {LIBRARY_BOOKS.map((book) => (
                <div key={book.id} className="group">
                  <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded-sm border border-border group-hover:border-aurora-teal/50 transition-colors shadow-lg">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-void-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 gap-3 backdrop-blur-sm">
                      <button className="w-full py-2 bg-aurora-teal text-void-black font-ui text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-white transition-colors flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" /> Read Now
                      </button>
                      <button className="w-full py-2 border border-border text-text-primary font-ui text-xs uppercase tracking-wider rounded-sm hover:border-aurora-teal hover:text-aurora-teal transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download EPUB
                      </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-surface">
                      <div 
                        className={`h-full ${book.progress === 100 ? 'bg-starforge-gold' : 'bg-aurora-teal'}`} 
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {book.editionType !== 'Standard' && (
                        <span className="font-ui text-[9px] uppercase tracking-wider bg-aurora-teal/20 text-aurora-teal px-1.5 py-0.5 rounded-sm">
                          {book.editionType}
                        </span>
                      )}
                      <div className="font-ui text-[10px] uppercase tracking-widest text-text-muted">{book.format}</div>
                    </div>
                    <div className="font-ui text-[10px] text-text-muted">{book.progress}%</div>
                  </div>
                  
                  <h3 className="font-heading text-lg text-text-primary font-semibold mb-1 group-hover:text-aurora-teal transition-colors truncate">{book.title}</h3>
                  <p className="font-ui text-xs text-text-secondary">{book.author}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Wishlist Content */}
        {activeTab === 'wishlist' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {WISHLIST.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {WISHLIST.map((book) => (
                  <div key={book.id} className="group">
                    <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded-sm border border-border group-hover:border-aurora-teal/50 transition-colors shadow-lg">
                      <img src={book.cover} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-void-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 gap-3 backdrop-blur-sm">
                        <button className="w-full py-2 bg-aurora-teal text-void-black font-ui text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-white transition-colors flex items-center justify-center gap-2">
                          Add to Cart
                        </button>
                        <button className="w-full py-2 border border-border text-forge-red font-ui text-xs uppercase tracking-wider rounded-sm hover:border-forge-red transition-colors flex items-center justify-center gap-2">
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {book.editionType !== 'Standard' && (
                          <span className="font-ui text-[9px] uppercase tracking-wider bg-aurora-teal/20 text-aurora-teal px-1.5 py-0.5 rounded-sm">
                            {book.editionType}
                          </span>
                        )}
                        <div className="font-ui text-[10px] uppercase tracking-widest text-text-muted">{book.format}</div>
                      </div>
                      <div className="font-mono text-xs text-aurora-teal">{book.price}</div>
                    </div>
                    
                    <h3 className="font-heading text-lg text-text-primary font-semibold mb-1 group-hover:text-aurora-teal transition-colors truncate">{book.title}</h3>
                    <p className="font-ui text-xs text-text-secondary">{book.author}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32">
                <Heart className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-heading text-2xl text-text-primary mb-2">Your wishlist is empty</h3>
                <p className="font-ui text-text-secondary">Explore the catalog to find your next adventure.</p>
              </div>
            )}
          </motion.div>
        )}

      </main>
    </div>
  );
}
