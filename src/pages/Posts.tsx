import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Timestamp } from 'firebase/firestore';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  publishDate: Timestamp;
  authorName: string;
};

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const allPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      console.log('[Posts] all posts from Firestore:', allPosts.length);
      const published = allPosts
        .filter(p => p.status === 'published')
        .sort((a, b) => {
          const dateA = a.publishDate?.toDate?.()?.getTime() || 0;
          const dateB = b.publishDate?.toDate?.()?.getTime() || 0;
          return dateB - dateA;
        });
      setPosts(published);
      setLoading(false);
    }, (error) => {
      console.error('[Posts] Firestore error:', error);
      handleFirestoreError(error, OperationType.LIST, 'posts');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Loading news...</div>;
  }

  return (
    <div className="bg-void-black min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-4">
            <span className="bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2">
              <Newspaper className="w-3 h-3" /> Transmissions
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-4">
            News & Updates
          </h1>
          <p className="font-ui text-text-secondary tracking-widest uppercase text-sm max-w-2xl mx-auto">
            The latest dispatches from the Runeweave.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24">
            <Newspaper className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
            <p className="font-ui text-text-secondary">No news published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <motion.div 
                key={post.id}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-surface border border-border/50 rounded-3xl p-8 flex flex-col hover:border-starforge-gold/30 transition-colors"
              >
                <div className="flex items-center gap-2 text-text-muted font-ui text-xs uppercase tracking-wider mb-4">
                  <Calendar className="w-4 h-4" />
                  {post.publishDate?.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                
                <h2 className="font-display text-2xl text-text-primary mb-2 line-clamp-2">{post.title}</h2>
                <p className="font-ui text-starforge-gold text-xs uppercase tracking-wider mb-6">by {post.authorName}</p>
                
                <p className="font-body text-text-secondary mb-8 flex-grow line-clamp-4">
                  {post.excerpt}
                </p>
                
                <div className="pt-6 border-t border-border/50 mt-auto">
                  <button className="font-ui text-sm text-starforge-gold hover:text-white transition-colors flex items-center gap-2">
                    Read More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
