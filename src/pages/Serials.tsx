import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Lock, Star, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

type Chapter = {
  num: number;
  title: string;
  free: boolean;
  content: string;
};

type Serial = {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  status: string;
  latestChapter: number;
  nextRelease: string | null;
  synopsis: string;
  chapters: Chapter[];
};

export default function Serials() {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [activeSerial, setActiveSerial] = useState<Serial | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'serials'), orderBy('createdAt', 'desc')),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Serial));
        setSerials(data);
        setActiveSerial(prev => data.find(s => s.id === prev?.id) || data[0] || null);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const handleNextChapter = () => {
    if (!activeChapter) return;
    const currentIndex = activeSerial.chapters.findIndex(c => c.num === activeChapter.num);
    if (currentIndex < activeSerial.chapters.length - 1) {
      setActiveChapter(activeSerial.chapters[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevChapter = () => {
    if (!activeChapter) return;
    const currentIndex = activeSerial.chapters.findIndex(c => c.num === activeChapter.num);
    if (currentIndex > 0) {
      setActiveChapter(activeSerial.chapters[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  if (activeChapter) {
    const currentIndex = activeSerial.chapters.findIndex(c => c.num === activeChapter.num);
    const hasNext = currentIndex < activeSerial.chapters.length - 1;
    const hasPrev = currentIndex > 0;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-void-black min-h-screen py-16"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => setActiveChapter(null)} 
            className="mb-12 text-starforge-gold flex items-center gap-2 hover:text-white transition-colors font-ui text-sm tracking-wider uppercase"
          >
            <ChevronLeft className="w-4 h-4" /> Back to {activeSerial.title}
          </button>

          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl md:text-5xl text-text-primary mb-4">
              Chapter {activeChapter.num}: {activeChapter.title}
            </h2>
            <p className="font-ui text-text-muted uppercase tracking-widest text-sm">
              {activeSerial.title} by {activeSerial.author}
            </p>
          </div>

          {activeChapter.free ? (
            <div className="font-body text-lg md:text-xl text-text-primary leading-relaxed space-y-8 mb-16">
              {activeChapter.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="bg-surface-elevated border border-border p-12 text-center rounded-sm mb-16">
              <Lock className="w-12 h-12 text-starforge-gold mx-auto mb-6" />
              <h3 className="font-heading text-3xl text-text-primary mb-4">This chapter is locked</h3>
              <p className="font-ui text-text-secondary mb-8 max-w-md mx-auto">
                Subscribe to unlock this chapter and support {activeSerial.author} in continuing this journey.
              </p>
              <button className="px-8 py-4 bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
                Subscribe for $4.99/mo
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="pt-8 border-t border-border flex items-center justify-between">
            <button 
              onClick={handlePrevChapter}
              disabled={!hasPrev}
              className={`flex items-center gap-2 font-ui uppercase tracking-wider text-sm ${hasPrev ? 'text-text-primary hover:text-starforge-gold' : 'text-text-muted opacity-50 cursor-not-allowed'}`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            
            <button 
              onClick={handleNextChapter}
              disabled={!hasNext}
              className={`flex items-center gap-2 font-ui uppercase tracking-wider text-sm ${hasNext ? 'text-text-primary hover:text-starforge-gold' : 'text-text-muted opacity-50 cursor-not-allowed'}`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-void-black min-h-screen py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            EPISODIC <span className="text-starforge-gold italic font-heading normal-case">Journeys</span>
          </h1>
          <p className="font-ui text-text-secondary tracking-widest uppercase text-sm">CHAPTER-BY-CHAPTER SERIALIZED STORYTELLING</p>
        </div>

        {/* Featured Serial Hero */}
        <section className="mb-24 relative overflow-hidden rounded-sm border border-border bg-deep-space">
          <div className="absolute inset-0 bg-gradient-to-r from-void-black via-void-black/80 to-transparent z-10"></div>
          <img src={activeSerial.cover} alt={activeSerial.title} className="absolute inset-0 w-full h-full object-cover opacity-30 object-right" referrerPolicy="no-referrer" />
          
          <div className="relative z-20 p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/3 shrink-0">
              <img src={activeSerial.cover} alt={activeSerial.title} className="w-full rounded-sm shadow-2xl border border-starforge-gold/30" referrerPolicy="no-referrer" />
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-ui text-[10px] uppercase tracking-wider bg-aurora-teal/20 text-aurora-teal px-2 py-1 rounded-sm">
                  {activeSerial.genre}
                </span>
                <span className={`font-ui text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${activeSerial.status === 'Ongoing' ? 'bg-ember-orange/20 text-ember-orange' : 'bg-surface-elevated text-text-muted'}`}>
                  {activeSerial.status}
                </span>
              </div>
              
              <h2 className="font-heading text-4xl md:text-5xl text-text-primary mb-2">{activeSerial.title}</h2>
              <p className="font-ui text-sm text-starforge-gold uppercase tracking-wider mb-6">By {activeSerial.author}</p>
              
              <p className="font-body text-lg text-text-secondary mb-8 leading-relaxed max-w-2xl">
                {activeSerial.synopsis}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <button 
                  onClick={() => {
                    setActiveChapter(activeSerial.chapters[0]);
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-white transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" /> Read Chapter 1 (Free)
                </button>
                <button className="flex items-center gap-2 px-6 py-3 border border-starforge-gold/50 text-starforge-gold font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-starforge-gold/10 transition-colors">
                  <Star className="w-4 h-4" /> Subscribe for $4.99/mo
                </button>
              </div>
              
              {activeSerial.nextRelease && (
                <div className="flex items-center gap-2 font-ui text-sm text-text-muted bg-surface/50 inline-flex px-4 py-2 rounded-sm border border-border">
                  <Clock className="w-4 h-4 text-aurora-teal" /> Next chapter drops in {activeSerial.nextRelease}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Chapter List */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <h3 className="font-heading text-3xl text-text-primary">Chapters</h3>
            <span className="font-ui text-sm text-text-muted">{activeSerial.chapters.length} Available</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSerial.chapters.map((chapter) => (
              <div 
                key={chapter.num} 
                onClick={() => {
                  setActiveChapter(chapter);
                  window.scrollTo(0, 0);
                }}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm hover:border-starforge-gold/30 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xl text-starforge-gold opacity-50 w-8">{chapter.num}</span>
                  <span className="font-ui text-text-primary group-hover:text-starforge-gold transition-colors">{chapter.title}</span>
                </div>
                <div>
                  {chapter.free ? (
                    <span className="font-ui text-[10px] uppercase tracking-wider bg-aurora-teal/10 text-aurora-teal px-2 py-1 rounded-sm flex items-center gap-1">
                      Free <ChevronRight className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="font-ui text-[10px] uppercase tracking-wider bg-surface-elevated text-text-muted px-2 py-1 rounded-sm flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Subscriber
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Serials */}
        <section>
          <h3 className="font-heading text-2xl text-text-primary mb-8">More Serialized Journeys</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {serials.map((serial) => (
              <div 
                key={serial.id} 
                className={`cursor-pointer group ${activeSerial.id === serial.id ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => {
                  setActiveSerial(serial);
                  setActiveChapter(null);
                  window.scrollTo(0, 0);
                }}
              >
                <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded-sm border border-border group-hover:border-starforge-gold/50 transition-colors">
                  <img src={serial.cover} alt={serial.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                </div>
                <h4 className="font-heading text-lg text-text-primary group-hover:text-starforge-gold transition-colors truncate">{serial.title}</h4>
                <p className="font-ui text-xs text-text-secondary">{serial.author}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </motion.div>
  );
}
