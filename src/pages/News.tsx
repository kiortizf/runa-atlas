import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  slug?: string;
}

const SEED_NEWS: NewsItem[] = [
  { id: '1', title: 'Rüna Atlas Acquires "The Silicon Throne" Trilogy', date: 'October 15, 2026', category: 'Acquisitions', excerpt: 'We are thrilled to announce the acquisition of a groundbreaking new cyberpunk trilogy by debut author Kaelen Vance. The first book is slated for release in Fall 2027.' },
  { id: '2', title: 'Open Call for Short Story Anthology: "Echoes of the Void"', date: 'September 28, 2026', category: 'Submissions', excerpt: 'Our next anthology will focus on stories of deep space exploration and the psychological impact of the void. Submissions open November 1st.' },
  { id: '3', title: 'Marina Solis Nominated for the Nebula Award', date: 'September 10, 2026', category: 'Awards', excerpt: 'Congratulations to Marina Solis, whose novel "Whispers of the Deep" has been nominated for this year\'s Nebula Award for Best Novel.' },
  { id: '4', title: 'Starforge Membership Program Launches', date: 'August 22, 2026', category: 'Company News', excerpt: 'Join our new membership program to get early access to releases, exclusive serials, and behind-the-scenes content from our authors.' },
];

export default function News() {
  const [news, setNews] = useState<NewsItem[]>(SEED_NEWS);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(20)),
      (snap) => {
        const data = snap.docs.map(d => {
          const raw = d.data();
          return {
            id: d.id,
            title: raw.title || '',
            date: raw.date || raw.createdAt?.toDate?.()?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || '',
            category: raw.category || 'News',
            excerpt: raw.excerpt || raw.content?.substring(0, 200) || '',
            slug: raw.slug,
          } as NewsItem;
        });
        if (data.length > 0) setNews(data);
      },
      () => { /* use seed */ }
    );
    return () => unsub();
  }, []);

  return (
    <div className="bg-void-black min-h-screen py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-6">
            News & <span className="text-starforge-gold">Events</span>
          </h1>
          <p className="font-ui text-xl text-text-secondary max-w-3xl mx-auto">
            Transmissions from the Starforge.
          </p>
        </motion.div>

        <div className="space-y-8">
          {news.map((item, idx) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface border border-border p-8 rounded-sm hover:border-starforge-gold/50 transition-colors group"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="font-ui text-xs font-semibold uppercase tracking-wider text-starforge-gold bg-starforge-gold/10 px-2 py-1 rounded-sm">
                  {item.category}
                </span>
                <span className="font-ui text-xs text-text-muted flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {item.date}
                </span>
              </div>
              <h2 className="font-heading text-2xl text-text-primary mb-3 group-hover:text-starforge-gold transition-colors">
                {item.title}
              </h2>
              <p className="font-body text-text-secondary mb-6 leading-relaxed">
                {item.excerpt}
              </p>
              <Link to={item.slug ? `/news/${item.slug}` : '#'} className="inline-flex items-center gap-2 font-ui text-sm text-text-primary hover:text-starforge-gold transition-colors uppercase tracking-wider">
                Read Full Transmission <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
