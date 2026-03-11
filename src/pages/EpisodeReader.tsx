import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Scroll, Clock, MessageSquare, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, doc, getDoc, onSnapshot, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

type Episode = {
  id: string;
  number: number;
  title: string;
  content: string;
  wordCount?: number;
};

type Journey = {
  id: string;
  slug: string;
  title: string;
  totalEpisodes: number;
};

type Annotation = {
  paragraphIndex: number;
  authorName: string;
  text: string;
};

// Seed annotations mapped to paragraph indices
const SEED_ANNOTATIONS: Record<number, Annotation[]> = {
  1: [
    { paragraphIndex: 2, authorName: 'Elara Vance', text: 'The "warmth radiating from the leather" was the first detail I wrote for the entire series. Everything grew from that one sensory image.' },
    { paragraphIndex: 6, authorName: 'Elara Vance', text: 'I rewrote the nursery rhyme about thirty times. In earlier drafts, the Ember Codex was called the Bone Codex, which felt too heavy. "Ember" carries both warmth and destruction.' },
    { paragraphIndex: 14, authorName: 'Elara Vance', text: 'The blank pages were inspired by a real experience. I once opened a very old book in a Portuguese archive and the ink had entirely faded. The pages looked blank but held ghost impressions under UV light.' },
    { paragraphIndex: 18, authorName: 'Elara Vance', text: 'Ignis. Vita. Mors. I wanted the magic to feel ancient and earned, not flashy. Latin felt right because the Marrow System draws from real-world mythological traditions.' },
  ],
  2: [
    { paragraphIndex: 2, authorName: 'Elara Vance', text: 'The codex speaking directly to Elara was a late addition. My editor pushed me to make the book feel sentient earlier in the story, which completely changed the dynamic.' },
    { paragraphIndex: 8, authorName: 'Elara Vance', text: 'The smell of ozone and burning embers. I wanted readers to feel the magic physically before understanding it intellectually. The body knows before the mind does.' },
  ],
};

// Seed content
const SEED_CONTENT: Record<number, { title: string; content: string }> = {
  1: {
    title: 'The Dust of Ages',
    content: `# The Dust of Ages

The library smelled of old paper and forgotten dreams. Elara traced the spine of the unmarked tome, feeling a strange warmth radiating from the leather.

She had spent years searching for this exact volume, guided only by fragments of myths and half-remembered nursery rhymes. The Ember Codex.

> "When the stars align in the house of the serpent, the codex will awaken, and the world will burn."

She shivered, pulling her cloak tighter around her shoulders. The air in the restricted section was always cold, but this chill felt different. It felt alive.

## A Discovery

She opened the book. The pages were blank.

"What?" she whispered, her voice echoing in the silent hall.

She flipped through the pages, her frustration mounting. Had she been wrong? Had the myths lied?

---

Suddenly, a faint glow began to emanate from the center of the book. The blank pages seemed to absorb the dim light of her lantern, glowing with an inner fire.

Words began to form, written in a language she had never seen before, yet somehow, she understood every word.

### The First Incantation

*Ignis. Vita. Mors.*

Fire. Life. Death.

The words burned themselves into her mind, and she knew, with terrifying certainty, that her life would never be the same.`,
  },
  2: {
    title: 'Whispers in the Dark',
    content: `# Whispers in the Dark

The words on the page seemed to shift and writhe as she read them. It wasn't a language she knew, but she understood it perfectly.

She closed the book, her heart pounding in her chest. The glow faded, but the warmth remained, seeping into her skin.

> "The codex is not a book. It is a key."

The voice was a mere whisper, echoing in the empty library. Elara spun around, her lantern swinging wildly, casting long, dancing shadows.

"Who's there?" she called out, her voice trembling slightly.

Silence answered her.

---

She hurried out of the restricted section, the heavy tome clutched tightly to her chest. The familiar scent of old paper and dust was now tainted with the faint smell of ozone and burning embers.

She knew she had to leave the city. The Order would be looking for the codex, and they would not stop until they found it.`,
  },
  3: {
    title: 'The Order of the Eclipse',
    content: `# The Order of the Eclipse

They came in the dead of night, silent as shadows. Elara barely had time to grab the codex before her door was splintered open.

Three figures stood in the doorway, their faces hidden beneath dark hoods. The symbol of the Eclipse was emblazoned on their chests in silver thread.

"Give us the book, scholar," the leader hissed, his voice like dry leaves scraping against stone.

Elara backed away, her hand instinctively going to the small dagger hidden in her boot. "I don't know what you're talking about."

> "Do not lie to us. We can smell the magic on you."

The leader stepped forward, drawing a long, curved blade. The metal gleamed in the moonlight filtering through the window.

---

Elara didn't hesitate. She threw her lantern at the leader, the glass shattering and spilling burning oil across the floor.

In the ensuing chaos, she bolted for the window, throwing herself out into the cold night air. She hit the ground rolling, the codex clutched tightly to her chest, and ran.`,
  },
};

export default function EpisodeReader() {
  const { slug, num } = useParams<{ slug: string; num: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showAnnotations, setShowAnnotations] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const unsub = onSnapshot(collection(db, 'journeys'), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Journey));
      const found = all.find(j => (j.slug || j.id) === slug);

      if (found) {
        setJourney(found);
        const epUnsub = onSnapshot(
          query(collection(db, `journeys/${found.id}/episodes`), orderBy('number', 'asc')),
          epSnap => {
            const eps = epSnap.docs.map(d => ({ id: d.id, ...d.data() } as Episode));
            const epNum = parseInt(num || '1', 10);
            if (eps.length > 0) {
              setEpisodes(eps);
              setEpisode(eps.find(e => e.number === epNum) || null);
            } else if (slug === 'the-ember-codex' || slug === 'seed-1') {
              // Use seed content
              const seedEps = Object.entries(SEED_CONTENT).map(([n, data]) => ({
                id: `ep${n}`, number: parseInt(n), title: data.title, content: data.content,
              }));
              setEpisodes(seedEps);
              setEpisode(seedEps.find(e => e.number === epNum) || null);
            }
            setLoading(false);
          },
          () => {
            if (slug === 'the-ember-codex' || slug === 'seed-1') {
              const seedEps = Object.entries(SEED_CONTENT).map(([n, data]) => ({
                id: `ep${n}`, number: parseInt(n), title: data.title, content: data.content,
              }));
              setEpisodes(seedEps);
              const epNum = parseInt(num || '1', 10);
              setEpisode(seedEps.find(e => e.number === epNum) || null);
            }
            setLoading(false);
          }
        );
        return () => epUnsub();
      } else if (slug === 'the-ember-codex' || slug === 'seed-1') {
        setJourney({ id: 'seed-1', slug: 'the-ember-codex', title: 'The Ember Codex', totalEpisodes: 8 });
        const seedEps = Object.entries(SEED_CONTENT).map(([n, data]) => ({
          id: `ep${n}`, number: parseInt(n), title: data.title, content: data.content,
        }));
        setEpisodes(seedEps);
        const epNum = parseInt(num || '1', 10);
        setEpisode(seedEps.find(e => e.number === epNum) || null);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, () => {
      if (slug === 'the-ember-codex' || slug === 'seed-1') {
        setJourney({ id: 'seed-1', slug: 'the-ember-codex', title: 'The Ember Codex', totalEpisodes: 8 });
        const seedEps = Object.entries(SEED_CONTENT).map(([n, data]) => ({
          id: `ep${n}`, number: parseInt(n), title: data.title, content: data.content,
        }));
        setEpisodes(seedEps);
        const epNum = parseInt(num || '1', 10);
        setEpisode(seedEps.find(e => e.number === epNum) || null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [slug, num]);

  // Track scroll progress + mark as read at bottom
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - windowHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));

      // Mark as read when user reaches 90%
      if (progress > 90 && user && journey && episode) {
        setDoc(doc(db, `users/${user.uid}/readingProgress/${journey.id}/episodes`, episode.id), { readAt: new Date() }).catch(() => { });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, journey, episode]);

  // Scroll to top on episode change
  useEffect(() => { window.scrollTo(0, 0); }, [num]);

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('### ')) return <h4 key={index} className="font-display text-xl text-starforge-gold uppercase tracking-widest mt-8 mb-4">{line.replace('### ', '')}</h4>;
      if (line.startsWith('## ')) return <h3 key={index} className="font-display text-2xl text-white uppercase tracking-widest mt-10 mb-6">{line.replace('## ', '')}</h3>;
      if (line.startsWith('# ')) return <h2 key={index} className="font-display text-3xl md:text-4xl text-white uppercase tracking-widest mt-12 mb-8">{line.replace('# ', '')}</h2>;
      if (line.startsWith('---')) return <hr key={index} className="border-t border-border my-12" />;
      if (line.startsWith('> ')) return <blockquote key={index} className="border-l-4 border-starforge-gold pl-6 py-2 my-8 italic text-text-secondary text-xl font-body">{line.replace('> ', '')}</blockquote>;
      if (line.trim() === '') return <div key={index} className="h-4" />;

      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <p key={index} className="font-body text-[17px] leading-[1.9] text-text-primary/85 mb-6">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="italic text-text-primary">{part.slice(1, -1)}</em>;
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    });
  };

  if (loading) return <div className="min-h-screen bg-void-black flex items-center justify-center text-starforge-gold font-ui text-xl uppercase tracking-widest animate-pulse">Loading episode...</div>;
  if (!journey || !episode) return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Episode not found.</div>;

  const wordCount = episode.content ? episode.content.split(/\s+/).length : (episode as any).wordCount || 0;
  const readTime = Math.ceil(wordCount / 250);
  const prevEpisode = episodes.find(e => e.number === episode.number - 1);
  const nextEpisode = episodes.find(e => e.number === episode.number + 1);

  return (
    <div className="bg-void-black min-h-screen pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-deep-space/90 backdrop-blur-md border-b border-border">
        {/* Scroll Progress Bar */}
        <div className="h-0.5 w-full bg-surface">
          <div className="h-full bg-gradient-to-r from-starforge-gold to-aurora-teal transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to={`/journeys/${journey.slug || journey.id}`}
            className="flex items-center gap-2 text-text-muted hover:text-starforge-gold transition-colors font-ui text-sm uppercase tracking-wider">
            <ChevronLeft className="w-4 h-4" /> {journey.title}
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-ui text-[10px] text-text-muted"><Clock className="w-3 h-3" /> {readTime} min</span>
            <span className="font-ui text-[10px] text-text-muted uppercase tracking-widest">
              Ep {episode.number}/{journey.totalEpisodes}
            </span>
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full font-ui text-[10px] uppercase tracking-wider transition-all ${showAnnotations
                  ? 'bg-starforge-gold/20 text-starforge-gold border border-starforge-gold/30'
                  : 'text-text-muted hover:text-starforge-gold border border-transparent hover:border-border'
                }`}
              title="Toggle author annotations"
            >
              <MessageSquare className="w-3 h-3" /> Notes
            </button>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div ref={contentRef} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="prose prose-invert max-w-none">
          {renderContent(episode.content)}

          {/* Annotations Layer */}
          {showAnnotations && (SEED_ANNOTATIONS[episode.number] || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 pt-8 border-t border-starforge-gold/30"
            >
              <h3 className="font-display text-lg text-starforge-gold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Star className="w-4 h-4" /> Author Notes
              </h3>
              <div className="space-y-4">
                {(SEED_ANNOTATIONS[episode.number] || []).map((ann, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-surface border-l-2 border-starforge-gold p-4 rounded-r-sm"
                  >
                    <p className="font-body text-sm text-text-secondary leading-relaxed">{ann.text}</p>
                    <p className="font-ui text-[10px] text-starforge-gold mt-2 flex items-center gap-1">
                      <Star className="w-3 h-3" /> {ann.authorName}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Chapter Navigation Footer */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/3 flex justify-start">
          {prevEpisode ? (
            <button onClick={() => navigate(`/journeys/${journey.slug || journey.id}/episode/${prevEpisode.number}`)}
              className="border border-starforge-gold/30 text-starforge-gold font-ui text-sm px-4 py-2 rounded-sm hover:bg-starforge-gold/5 transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          ) : <div className="w-full md:w-auto px-4 py-2 text-transparent select-none">.</div>}
        </div>
        <div className="w-full md:w-1/3 flex justify-center">
          <Link to={`/journeys/${journey.slug || journey.id}`}
            className="flex flex-col items-center gap-1 text-text-muted hover:text-starforge-gold transition-colors group">
            <Scroll className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-ui text-[9px] uppercase tracking-widest">Contents</span>
          </Link>
        </div>
        <div className="w-full md:w-1/3 flex justify-end">
          {nextEpisode ? (
            <button onClick={() => navigate(`/journeys/${journey.slug || journey.id}/episode/${nextEpisode.number}`)}
              className="bg-starforge-gold text-void-black font-ui text-sm px-4 py-2 rounded-sm hover:bg-yellow-500 transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="font-ui text-xs text-text-muted uppercase tracking-widest text-center w-full md:w-auto">End of published episodes</span>
          )}
        </div>
      </div>
    </div>
  );
}
