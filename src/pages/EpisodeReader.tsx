import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Scroll } from 'lucide-react';

type Episode = {
  id: string;
  number: number;
  title: string;
  content: string;
};

type Journey = {
  id: string;
  slug: string;
  title: string;
  totalEpisodes: number;
  episodes: Episode[];
};

export default function EpisodeReader() {
  const { slug, num } = useParams<{ slug: string; num: string }>();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed data
    if (slug === 'the-ember-codex') {
      const journeyData: Journey = {
        id: '1',
        slug: 'the-ember-codex',
        title: 'The Ember Codex',
        totalEpisodes: 8,
        episodes: [
          {
            id: 'ep1',
            number: 1,
            title: 'The Dust of Ages',
            content: `
# The Dust of Ages

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

The words burned themselves into her mind, and she knew, with terrifying certainty, that her life would never be the same.
            `
          },
          {
            id: 'ep2',
            number: 2,
            title: 'Whispers in the Dark',
            content: `
# Whispers in the Dark

The words on the page seemed to shift and writhe as she read them. It wasn't a language she knew, but she understood it perfectly.

She closed the book, her heart pounding in her chest. The glow faded, but the warmth remained, seeping into her skin.

> "The codex is not a book. It is a key."

The voice was a mere whisper, echoing in the empty library. Elara spun around, her lantern swinging wildly, casting long, dancing shadows.

"Who's there?" she called out, her voice trembling slightly.

Silence answered her.

---

She hurried out of the restricted section, the heavy tome clutched tightly to her chest. The familiar scent of old paper and dust was now tainted with the faint smell of ozone and burning embers.

She knew she had to leave the city. The Order would be looking for the codex, and they would not stop until they found it.
            `
          },
          {
            id: 'ep3',
            number: 3,
            title: 'The Order of the Eclipse',
            content: `
# The Order of the Eclipse

They came in the dead of night, silent as shadows. Elara barely had time to grab the codex before her door was splintered open.

Three figures stood in the doorway, their faces hidden beneath dark hoods. The symbol of the Eclipse was emblazoned on their chests in silver thread.

"Give us the book, scholar," the leader hissed, his voice like dry leaves scraping against stone.

Elara backed away, her hand instinctively going to the small dagger hidden in her boot. "I don't know what you're talking about."

> "Do not lie to us. We can smell the magic on you."

The leader stepped forward, drawing a long, curved blade. The metal gleamed in the moonlight filtering through the window.

---

Elara didn't hesitate. She threw her lantern at the leader, the glass shattering and spilling burning oil across the floor.

In the ensuing chaos, she bolted for the window, throwing herself out into the cold night air. She hit the ground rolling, the codex clutched tightly to her chest, and ran.
            `
          }
        ]
      };
      setJourney(journeyData);
      const epNum = parseInt(num || '1', 10);
      const ep = journeyData.episodes.find(e => e.number === epNum);
      setEpisode(ep || null);
    }
    setLoading(false);
  }, [slug, num]);

  if (loading) {
    return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Loading episode...</div>;
  }

  if (!journey || !episode) {
    return <div className="min-h-screen bg-void-black flex items-center justify-center text-text-primary">Episode not found.</div>;
  }

  const progressPercentage = (episode.number / journey.totalEpisodes) * 100;
  const prevEpisode = journey.episodes.find(e => e.number === episode.number - 1);
  const nextEpisode = journey.episodes.find(e => e.number === episode.number + 1);

  // Custom Markdown Parser
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('### ')) {
        return <h4 key={index} className="font-display text-xl text-starforge-gold uppercase tracking-widest mt-8 mb-4">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} className="font-display text-2xl text-white uppercase tracking-widest mt-10 mb-6">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={index} className="font-display text-3xl md:text-4xl text-white uppercase tracking-widest mt-12 mb-8">{line.replace('# ', '')}</h2>;
      }
      if (line.startsWith('---')) {
        return <hr key={index} className="border-t border-border/50 my-12" />;
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={index} className="border-l-4 border-starforge-gold pl-6 py-2 my-8 italic text-text-secondary text-xl font-body">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-4"></div>;
      }
      
      // Handle bold and italic
      let formattedLine = line;
      // Basic bold/italic replacement (not robust, but works for simple cases)
      const parts = formattedLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      
      return (
        <p key={index} className="font-body text-[17px] leading-[1.9] text-text-primary/85 mb-6">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={i} className="italic text-text-primary">{part.slice(1, -1)}</em>;
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="bg-void-black min-h-screen pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-deep-space/90 backdrop-blur-md border-b border-border/50">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-surface">
          <div 
            className="h-full bg-gradient-to-r from-starforge-gold to-[#f0c870] transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link 
            to={`/journeys/${journey.slug}`}
            className="flex items-center gap-2 text-text-secondary hover:text-starforge-gold transition-colors font-ui text-sm uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" /> {journey.title}
          </Link>
          <span className="font-ui text-xs text-text-muted uppercase tracking-widest">
            Episode {episode.number} of {journey.totalEpisodes}
          </span>
        </div>
      </div>

      {/* Reader Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="prose prose-invert max-w-none">
          {renderContent(episode.content)}
        </div>
      </div>

      {/* Chapter Navigation Footer */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/3 flex justify-start">
          {prevEpisode ? (
            <button 
              onClick={() => navigate(`/journeys/${journey.slug}/episode/${prevEpisode.number}`)}
              className="border border-starforge-gold text-starforge-gold font-ui font-medium px-4 py-2 rounded-sm hover:bg-starforge-gold/10 transition-colors flex items-center gap-2 text-sm w-full md:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div className="w-full md:w-auto px-4 py-2 text-transparent select-none">Placeholder</div>
          )}
        </div>
        
        <div className="w-full md:w-1/3 flex justify-center">
          <Link 
            to={`/journeys/${journey.slug}`}
            className="flex flex-col items-center gap-1 text-text-muted hover:text-starforge-gold transition-colors group"
          >
            <Scroll className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-ui text-[10px] uppercase tracking-widest">TOC</span>
          </Link>
        </div>
        
        <div className="w-full md:w-1/3 flex justify-end">
          {nextEpisode ? (
            <button 
              onClick={() => navigate(`/journeys/${journey.slug}/episode/${nextEpisode.number}`)}
              className="bg-starforge-gold text-void-black font-ui font-medium px-4 py-2 rounded-sm hover:bg-starforge-gold/90 transition-colors flex items-center gap-2 text-sm w-full md:w-auto justify-center"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="font-ui text-xs text-text-muted uppercase tracking-widest text-center w-full md:w-auto">
              End of published episodes
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
