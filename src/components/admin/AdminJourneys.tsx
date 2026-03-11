import { useState, useEffect, useCallback } from 'react';
import { Scroll, Plus, Edit2, Trash2, BookOpen, Clock, Star, Tag, ChevronRight, ChevronLeft, X, Check, FileText, Eye, EyeOff, Bold, Italic, Quote, Minus, Type, Heading1, Heading2, Heading3, AlignLeft, Copy, Sparkles } from 'lucide-react';
import AdminModal, { FormSection, FormField } from './AdminModal';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, Timestamp, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useWritingSessions } from '../../hooks/useWritingSessions';

interface Journey {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId?: string;
  slug: string;
  status: 'Active' | 'Completed' | 'Hiatus';
  visibility: 'public' | 'preview' | 'hidden';
  totalEpisodes: number;
  publishedEpisodes: number;
  genre: string;
  constellation: string;
  coverUrl?: string;
  featured?: boolean;
  lastUpdate?: any;
  createdAt?: any;
}

interface Episode {
  id: string;
  number: number;
  title: string;
  content: string;
  status: 'published' | 'scheduled' | 'draft';
  wordCount: number;
  publishDate: string;
  excerpt: string;
}

// ── Seeded Showcase Journey ──
const SEED_JOURNEY: Journey = {
  id: 'seed-ember-codex',
  title: 'The Ember Codex',
  description: 'An ancient book of forbidden magic surfaces in a crumbling library. Scholar Elara must decode its secrets before the Order of the Eclipse claims it and the power within.',
  author: 'Elara Vance',
  slug: 'the-ember-codex',
  status: 'Active',
  visibility: 'public',
  totalEpisodes: 8,
  publishedEpisodes: 3,
  genre: 'Dark Fantasy',
  constellation: 'Rising Stars',
  featured: true,
  lastUpdate: Timestamp.fromDate(new Date('2027-03-10')),
  createdAt: Timestamp.fromDate(new Date('2027-01-15')),
};

const SEED_EPISODES: Episode[] = [
  {
    id: 'ep-showcase-1', number: 1, title: 'The Dust of Ages', status: 'published',
    publishDate: '2027-01-22', wordCount: 1420, excerpt: 'An unmarked tome in a forgotten library holds a warmth that should not exist.',
    content: `# The Dust of Ages

The library smelled of old paper and forgotten dreams. Elara traced the spine of the unmarked tome, feeling a strange warmth radiating from the leather.

She had spent years searching for this exact volume, guided only by fragments of myths and half-remembered nursery rhymes. **The Ember Codex.**

> "When the stars align in the house of the serpent, the codex will awaken, and the world will burn."

She shivered, pulling her cloak tighter around her shoulders. The air in the restricted section was always cold, but this chill felt different. It felt *alive.*

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
  {
    id: 'ep-showcase-2', number: 2, title: 'Whispers in the Dark', status: 'published',
    publishDate: '2027-02-05', wordCount: 890, excerpt: 'The codex speaks. But voices in empty libraries are rarely good news.',
    content: `# Whispers in the Dark

The words on the page seemed to shift and writhe as she read them. It wasn't a language she knew, but she understood it perfectly.

She closed the book, her heart pounding in her chest. The glow faded, but the warmth remained, seeping into her skin.

> "The codex is not a book. It is a key."

The voice was a mere whisper, echoing in the empty library. Elara spun around, her lantern swinging wildly, casting long, dancing shadows.

**"Who's there?"** she called out, her voice trembling slightly.

Silence answered her.

---

She hurried out of the restricted section, the heavy tome clutched tightly to her chest. The familiar scent of old paper and dust was now tainted with the faint smell of *ozone and burning embers*.

She knew she had to leave the city. The Order would be looking for the codex, and they would not stop until they found it.`,
  },
  {
    id: 'ep-showcase-3', number: 3, title: 'The Order of the Eclipse', status: 'published',
    publishDate: '2027-02-19', wordCount: 1100, excerpt: 'They come in the dead of night. The Order has found her.',
    content: `# The Order of the Eclipse

They came in the dead of night, silent as shadows. Elara barely had time to grab the codex before her door was splintered open.

Three figures stood in the doorway, their faces hidden beneath dark hoods. The symbol of the Eclipse was emblazoned on their chests in **silver thread**.

"Give us the book, scholar," the leader hissed, his voice like dry leaves scraping against stone.

Elara backed away, her hand instinctively going to the small dagger hidden in her boot. "I don't know what you're talking about."

> "Do not lie to us. We can smell the magic on you."

The leader stepped forward, drawing a long, curved blade. The metal gleamed in the moonlight filtering through the window.

---

Elara didn't hesitate. She threw her lantern at the leader, the glass shattering and spilling burning oil across the floor.

### The Escape

In the chaos of flames and shouting, she vaulted through the window, landing hard on the cobblestones below. Pain shot through her ankle, but she forced herself to run.

Behind her, the house burned. The Order would follow. They always did.

But Elara had the codex, and now she knew its first secret: *the fire within could not be extinguished*.`,
  },
  {
    id: 'ep-showcase-4', number: 4, title: 'The Road to Ashenmoor', status: 'draft',
    publishDate: '', wordCount: 0, excerpt: '',
    content: `# The Road to Ashenmoor

*Coming soon...*`,
  },
];

export default function AdminJourneys() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const { user } = useAuth();
  const { logEpisodeSession } = useWritingSessions();

  // Episode management
  const [managingJourney, setManagingJourney] = useState<Journey | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [epForm, setEpForm] = useState<Partial<Episode>>({
    title: '', content: '', status: 'draft', publishDate: '', excerpt: '', number: 0,
  });

  const [formData, setFormData] = useState<Partial<Journey>>({
    title: '', description: '', author: '', slug: '', status: 'Active', visibility: 'hidden',
    totalEpisodes: 0, publishedEpisodes: 0, genre: '', constellation: '', coverUrl: '', featured: false,
  });

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'journeys'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Journey));
      data.sort((a, b) => {
        const dateA = a.lastUpdate instanceof Timestamp ? a.lastUpdate.toMillis() : (a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0);
        const dateB = b.lastUpdate instanceof Timestamp ? b.lastUpdate.toMillis() : (b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0);
        return dateB - dateA;
      });
      // Always include the seed journey if nothing in Firestore
      if (data.length === 0) {
        setJourneys([SEED_JOURNEY]);
      } else {
        setJourneys(data);
      }
    }, e => {
      handleFirestoreError(e, OperationType.LIST, 'journeys');
      setJourneys([SEED_JOURNEY]);
    });
    return () => unsub();
  }, [user]);

  // Load episodes when managing a journey
  useEffect(() => {
    if (!managingJourney) { setEpisodes([]); return; }
    // If it's the seed journey, use seed episodes
    if (managingJourney.id === 'seed-ember-codex') {
      setEpisodes(SEED_EPISODES);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, `journeys/${managingJourney.id}/episodes`), orderBy('number', 'asc')),
      snap => setEpisodes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Episode))),
      () => { }
    );
    return () => unsub();
  }, [managingJourney]);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleOpenModal = (journey?: Journey) => {
    if (journey) {
      setEditingJourney(journey);
      setFormData({ ...journey, visibility: journey.visibility || 'public' });
    } else {
      setEditingJourney(null);
      setFormData({
        title: '', description: '', author: user?.displayName || '', slug: '',
        status: 'Active', visibility: 'hidden', totalEpisodes: 0, publishedEpisodes: 0, genre: '', constellation: '', coverUrl: '', featured: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const slug = formData.slug || generateSlug(formData.title || '');
      const dataToSave = {
        title: formData.title, description: formData.description, author: formData.author,
        slug, status: formData.status, visibility: formData.visibility || 'public',
        totalEpisodes: Number(formData.totalEpisodes) || 0,
        publishedEpisodes: Number(formData.publishedEpisodes) || 0,
        genre: formData.genre, constellation: formData.constellation,
        coverUrl: formData.coverUrl || '', featured: !!formData.featured,
      };

      if (editingJourney) {
        await setDoc(doc(db, 'journeys', editingJourney.id), {
          ...dataToSave, lastUpdate: serverTimestamp(),
          ...(editingJourney.createdAt ? {} : { createdAt: serverTimestamp() }),
          ...(editingJourney.authorId ? {} : { authorId: user.uid }),
        }, { merge: true });
      } else {
        const ref = doc(collection(db, 'journeys'));
        await setDoc(ref, { ...dataToSave, lastUpdate: serverTimestamp(), createdAt: serverTimestamp(), authorId: user.uid });
      }
      setIsModalOpen(false);
      setEditingJourney(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'journeys');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this journey and all its episodes?')) {
      try { await deleteDoc(doc(db, 'journeys', id)); } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `journeys/${id}`);
      }
    }
  };

  // ── Episode CRUD ──
  const openEpisodeModal = (ep?: Episode) => {
    if (ep) {
      setEditingEpisode(ep);
      setEpForm(ep);
    } else {
      setEditingEpisode(null);
      setEpForm({
        title: '', content: '', status: 'draft', publishDate: '', excerpt: '',
        number: episodes.length + 1,
      });
    }
    setShowPreview(false);
    setIsEpisodeModalOpen(true);
  };

  const saveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingJourney) return;
    try {
      const wordCount = (epForm.content || '').split(/\s+/).filter(Boolean).length;
      const data = {
        title: epForm.title, content: epForm.content, status: epForm.status,
        publishDate: epForm.publishDate, excerpt: epForm.excerpt,
        number: Number(epForm.number) || episodes.length + 1,
        wordCount,
      };
      if (editingEpisode) {
        await setDoc(doc(db, `journeys/${managingJourney.id}/episodes`, editingEpisode.id), data, { merge: true });
      } else {
        const ref = doc(collection(db, `journeys/${managingJourney.id}/episodes`));
        await setDoc(ref, { ...data, createdAt: serverTimestamp() });
      }
      // Update journey episode counts
      const publishedCount = episodes.filter(ep => ep.status === 'published').length + (data.status === 'published' && !editingEpisode ? 1 : 0);
      await setDoc(doc(db, 'journeys', managingJourney.id), {
        publishedEpisodes: publishedCount,
        totalEpisodes: Math.max(Number(managingJourney.totalEpisodes), episodes.length + (editingEpisode ? 0 : 1)),
        lastUpdate: serverTimestamp(),
      }, { merge: true });

      // Auto-log writing session
      const prevWordCount = editingEpisode ? (editingEpisode as any).wordCount || 0 : 0;
      const delta = wordCount - prevWordCount;
      if (delta > 0) {
        logEpisodeSession(delta, managingJourney.title);
      }

      setIsEpisodeModalOpen(false);
      setEditingEpisode(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `journeys/${managingJourney.id}/episodes`);
    }
  };

  const deleteEpisode = async (epId: string) => {
    if (!managingJourney || !window.confirm('Delete this episode?')) return;
    try { await deleteDoc(doc(db, `journeys/${managingJourney.id}/episodes`, epId)); } catch { /* */ }
  };

  // ── Formatting Toolbar ──
  const insertFormat = useCallback((prefix: string, suffix: string, placeholder: string) => {
    const textarea = document.getElementById('episode-content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = (epForm.content || '').substring(start, end);
    const text = selected || placeholder;
    const newContent = (epForm.content || '').substring(0, start) + prefix + text + suffix + (epForm.content || '').substring(end);
    setEpForm({ ...epForm, content: newContent });
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + text.length;
    }, 10);
  }, [epForm]);

  const toolbarButtons = [
    { icon: Heading1, label: 'H1', action: () => insertFormat('\n# ', '\n', 'Chapter Title') },
    { icon: Heading2, label: 'H2', action: () => insertFormat('\n## ', '\n', 'Section Title') },
    { icon: Heading3, label: 'H3', action: () => insertFormat('\n### ', '\n', 'Sub-Section') },
    { icon: Bold, label: 'Bold', action: () => insertFormat('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertFormat('*', '*', 'italic text') },
    { icon: Quote, label: 'Quote', action: () => insertFormat('\n> ', '\n', '"A powerful quote"') },
    { icon: Minus, label: 'Break', action: () => insertFormat('\n\n---\n\n', '', '') },
  ];

  // ── Preview Renderer ──
  const renderPreview = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('### ')) return <h4 key={index} className="font-display text-xl text-starforge-gold uppercase tracking-widest mt-8 mb-4">{line.replace('### ', '')}</h4>;
      if (line.startsWith('## ')) return <h3 key={index} className="font-display text-2xl text-white uppercase tracking-widest mt-10 mb-6">{line.replace('## ', '')}</h3>;
      if (line.startsWith('# ')) return <h2 key={index} className="font-display text-3xl text-white uppercase tracking-widest mt-8 mb-6">{line.replace('# ', '')}</h2>;
      if (line.startsWith('---')) return <hr key={index} className="border-t border-border my-12" />;
      if (line.startsWith('> ')) return <blockquote key={index} className="border-l-4 border-starforge-gold pl-6 py-2 my-8 italic text-text-secondary text-xl font-body">{line.replace('> ', '')}</blockquote>;
      if (line.trim() === '') return <div key={index} className="h-4" />;
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <p key={index} className="font-body text-[15px] leading-[1.9] text-text-primary/85 mb-4">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="italic text-text-primary">{part.slice(1, -1)}</em>;
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const getDisplayDate = (dateObj: any) => {
    if (!dateObj) return 'N/A';
    if (dateObj instanceof Timestamp) return dateObj.toDate().toLocaleDateString();
    if (typeof dateObj === 'string') return new Date(dateObj).toLocaleDateString();
    return new Date(dateObj).toLocaleDateString();
  };

  const getVisibilityBadge = (v: string) => {
    switch (v) {
      case 'public': return { label: 'Public', cls: 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30', icon: Eye };
      case 'preview': return { label: 'Preview Only', cls: 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30', icon: Eye };
      case 'hidden': return { label: 'Hidden', cls: 'bg-forge-red/10 text-forge-red border-forge-red/30', icon: EyeOff };
      default: return { label: 'Public', cls: 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30', icon: Eye };
    }
  };

  const inputCls = "w-full bg-void-black border border-border/50 rounded-sm px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all font-ui text-sm";

  // ═══ EPISODE MANAGEMENT VIEW ═══
  if (managingJourney) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setManagingJourney(null)} className="text-text-muted hover:text-starforge-gold transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-heading text-2xl text-text-primary">{managingJourney.title}</h2>
            <p className="font-ui text-xs text-text-muted">Manage Episodes &middot; {episodes.length} total &middot; {episodes.filter(e => e.status === 'published').length} published</p>
          </div>
          <button onClick={() => openEpisodeModal()}
            className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black rounded-sm font-ui text-xs uppercase tracking-wider hover:bg-yellow-500">
            <Plus className="w-3.5 h-3.5" /> New Episode
          </button>
        </div>

        {/* Formatting Reference Card */}
        <div className="bg-surface border border-border rounded-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-starforge-gold" />
            <h4 className="font-ui text-xs text-text-primary uppercase tracking-wider">Formatting Reference</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px] text-text-muted">
            <span><code className="text-starforge-gold"># Title</code> Main heading</span>
            <span><code className="text-starforge-gold">## Section</code> Section heading</span>
            <span><code className="text-starforge-gold">### Sub</code> Sub heading</span>
            <span><code className="text-starforge-gold">**bold**</code> <strong className="text-white">Bold text</strong></span>
            <span><code className="text-starforge-gold">*italic*</code> <em className="text-white">Italic text</em></span>
            <span><code className="text-starforge-gold">&gt; quote</code> Block quote</span>
            <span><code className="text-starforge-gold">---</code> Scene break</span>
            <span><code className="text-starforge-gold">Blank line</code> Paragraph break</span>
          </div>
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-16 bg-surface border border-border rounded-sm">
            <FileText className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
            <p className="font-ui text-sm text-text-muted mb-4">No episodes yet. Start writing!</p>
            <button onClick={() => openEpisodeModal()}
              className="px-4 py-2 bg-starforge-gold text-void-black rounded-sm font-ui text-xs uppercase tracking-wider hover:bg-yellow-500">
              Create First Episode
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.map(ep => (
              <div key={ep.id} className={`bg-surface border rounded-sm p-4 flex items-center gap-4 ${ep.status === 'published' ? 'border-aurora-teal/20' : ep.status === 'scheduled' ? 'border-starforge-gold/20' : 'border-border'
                }`}>
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-mono text-sm shrink-0 border ${ep.status === 'published' ? 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/20' :
                  ep.status === 'scheduled' ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/20' :
                    'bg-surface-elevated text-text-muted border-border'
                  }`}>{ep.number}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading text-sm text-text-primary truncate">{ep.title || 'Untitled'}</h4>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`font-ui text-[9px] uppercase tracking-wider ${ep.status === 'published' ? 'text-aurora-teal' : ep.status === 'scheduled' ? 'text-starforge-gold' : 'text-text-muted'
                      }`}>{ep.status}</span>
                    <span className="font-mono text-[9px] text-text-muted">{ep.wordCount || 0} words</span>
                    {ep.publishDate && <span className="font-ui text-[9px] text-text-muted">{ep.publishDate}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEpisodeModal(ep)} className="p-1.5 text-text-muted hover:text-starforge-gold transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteEpisode(ep.id)} className="p-1.5 text-text-muted hover:text-forge-red transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Episode Editor Modal (Full-Width) */}
        {isEpisodeModalOpen && (
          <div className="fixed inset-0 bg-void-black/90 z-50 flex flex-col">
            {/* Top Bar */}
            <div className="border-b border-border bg-deep-space/80 backdrop-blur-md px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsEpisodeModalOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-heading text-lg text-text-primary">
                    {editingEpisode ? `Edit: ${editingEpisode.title}` : 'New Episode'}
                  </h3>
                  <p className="font-mono text-[10px] text-text-muted">
                    {(epForm.content || '').split(/\s+/).filter(Boolean).length} words
                    {epForm.status === 'draft' && ' · Draft'}
                    {epForm.status === 'published' && ' · Published'}
                    {epForm.status === 'scheduled' && ' · Scheduled'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Preview Toggle */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-sm font-ui text-xs uppercase tracking-wider transition-colors ${showPreview
                    ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/30'
                    : 'bg-surface border border-border text-text-muted hover:text-text-primary'
                    }`}
                >
                  <Eye className="w-3 h-3" /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  onClick={saveEpisode as any}
                  className="px-5 py-2 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-white transition-colors"
                >
                  {editingEpisode ? 'Update' : 'Create'}
                </button>
              </div>
            </div>

            {/* Meta fields */}
            <div className="bg-surface border-b border-border px-6 py-3 shrink-0">
              <div className="max-w-7xl mx-auto flex gap-4 flex-wrap items-center">
                <div className="flex items-center gap-2">
                  <label className="font-ui text-[10px] text-text-muted uppercase tracking-wider">#</label>
                  <input type="number" required min={1} value={epForm.number || ''} onChange={e => setEpForm({ ...epForm, number: parseInt(e.target.value) })}
                    className="w-16 bg-void-black border border-border rounded-sm px-2 py-1 text-text-primary font-mono text-sm focus:border-starforge-gold outline-none" />
                </div>
                <input type="text" required value={epForm.title} onChange={e => setEpForm({ ...epForm, title: e.target.value })}
                  placeholder="Episode title..." className="flex-1 bg-void-black border border-border rounded-sm px-3 py-1.5 text-text-primary font-heading text-base focus:border-starforge-gold outline-none" />
                <select value={epForm.status} onChange={e => setEpForm({ ...epForm, status: e.target.value as any })}
                  className="bg-void-black border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm focus:border-starforge-gold outline-none">
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
                <input type="date" value={epForm.publishDate} onChange={e => setEpForm({ ...epForm, publishDate: e.target.value })}
                  className="bg-void-black border border-border rounded-sm px-3 py-1.5 text-text-primary font-ui text-sm focus:border-starforge-gold outline-none" />
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-surface/50 border-b border-border px-6 py-2 shrink-0">
              <div className="max-w-7xl mx-auto">
                <input value={epForm.excerpt || ''} onChange={e => setEpForm({ ...epForm, excerpt: e.target.value })}
                  placeholder="Excerpt (preview text shown in table of contents)..."
                  className="w-full bg-transparent border-none text-text-secondary font-ui text-sm focus:outline-none placeholder-text-muted/30 italic" />
              </div>
            </div>

            {/* Editor + Preview */}
            <div className="flex-1 overflow-hidden flex">
              {/* Toolbar + Editor */}
              <div className={`flex flex-col ${showPreview ? 'w-1/2 border-r border-border' : 'w-full'}`}>
                {/* Formatting Toolbar */}
                <div className="border-b border-border bg-surface/30 px-4 py-2 flex gap-1 shrink-0 flex-wrap">
                  {toolbarButtons.map(btn => {
                    const Icon = btn.icon;
                    return (
                      <button key={btn.label} onClick={btn.action} title={btn.label}
                        className="p-2 text-text-muted hover:text-starforge-gold hover:bg-starforge-gold/10 rounded-sm transition-colors">
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
                {/* Content Area */}
                <textarea
                  id="episode-content"
                  value={epForm.content}
                  onChange={e => setEpForm({ ...epForm, content: e.target.value })}
                  placeholder={`# Episode Title\n\nWrite your story in Markdown...\n\n> "Blockquotes for emphasis"\n\n---\n\nScene breaks with horizontal rules`}
                  className="flex-1 w-full bg-void-black px-6 py-6 text-text-primary font-mono text-[13px] leading-relaxed focus:outline-none resize-none"
                />
              </div>

              {/* Live Preview */}
              {showPreview && (
                <div className="w-1/2 overflow-y-auto bg-void-black">
                  <div className="max-w-2xl mx-auto px-8 py-8">
                    <div className="mb-6 pb-4 border-b border-border">
                      <p className="font-ui text-[10px] text-starforge-gold uppercase tracking-widest mb-1">Episode {epForm.number} Preview</p>
                      <h2 className="font-heading text-2xl text-text-primary">{epForm.title || 'Untitled'}</h2>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      {renderPreview(epForm.content || '')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══ JOURNEY LIST VIEW ═══
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20">
            <Scroll className="w-5 h-5 text-starforge-gold" />
          </div>
          <div>
            <h2 className="font-heading text-2xl text-text-primary">Journeys CMS</h2>
            <p className="font-ui text-xs text-text-muted">Manage serialized storytelling and episodic releases</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-starforge-gold text-void-black rounded-sm font-ui text-xs uppercase tracking-wider hover:bg-yellow-500">
          <Plus className="w-3.5 h-3.5" /> New Journey
        </button>
      </div>

      <div className="space-y-3">
        {journeys.map(journey => {
          const vis = getVisibilityBadge(journey.visibility || 'public');
          const VisIcon = vis.icon;
          return (
            <div key={journey.id} className="bg-surface border border-border rounded-sm p-5 hover:border-starforge-gold/20 transition-colors">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-ui uppercase tracking-wider border ${journey.status === 'Active' ? 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30' :
                      journey.status === 'Completed' ? 'bg-starforge-gold/10 text-starforge-gold border-starforge-gold/30' :
                        'bg-forge-red/10 text-forge-red border-forge-red/30'
                      }`}>{journey.status}</span>
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-ui uppercase tracking-wider border flex items-center gap-1 ${vis.cls}`}>
                      <VisIcon className="w-2.5 h-2.5" /> {vis.label}
                    </span>
                    {journey.genre && <span className="font-ui text-[9px] text-text-muted"><Tag className="w-2.5 h-2.5 inline mr-0.5" />{journey.genre}</span>}
                    {journey.featured && <Star className="w-3 h-3 text-starforge-gold fill-starforge-gold" />}
                  </div>
                  <h3 className="font-heading text-lg text-text-primary truncate">{journey.title}</h3>
                  <p className="font-ui text-xs text-text-muted mt-0.5 line-clamp-1">{journey.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-ui text-text-muted">
                    <span><BookOpen className="w-3 h-3 inline mr-1" />{journey.author}</span>
                    <span><FileText className="w-3 h-3 inline mr-1" />{journey.publishedEpisodes || 0}/{journey.totalEpisodes || 0} episodes</span>
                    <span><Clock className="w-3 h-3 inline mr-1" />{getDisplayDate(journey.lastUpdate || journey.createdAt)}</span>
                    {journey.slug && <span className="font-mono text-[8px] text-text-muted/50">/{journey.slug}</span>}
                  </div>
                </div>
                <div className="flex lg:flex-col items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenModal(journey)} className="p-2 text-text-muted hover:text-starforge-gold rounded-sm transition-colors" title="Edit Journey"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setManagingJourney(journey)} className="p-2 text-text-muted hover:text-aurora-teal rounded-sm transition-colors" title="Manage Episodes"><ChevronRight className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(journey.id)} className="p-2 text-text-muted hover:text-forge-red rounded-sm transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {journeys.length === 0 && (
          <div className="text-center py-16 bg-surface border border-border rounded-sm">
            <Scroll className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
            <p className="font-ui text-sm text-text-muted">No journeys yet. Create one to get started.</p>
          </div>
        )}
      </div>

      {/* Journey Editor Modal */}
      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingJourney ? 'Edit Journey' : 'Create New Journey'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Journey Information">
            <FormField label="Title">
              <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value, slug: formData.slug || generateSlug(e.target.value) })} className={inputCls} placeholder="Journey title..." />
            </FormField>
            <FormField label="URL Slug">
              <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className={inputCls} placeholder="auto-generated-from-title" />
            </FormField>
            <FormField label="Description">
              <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputCls + ' resize-none'} placeholder="What is this journey about?" />
            </FormField>
            <FormField label="Cover Image URL">
              <input type="text" value={formData.coverUrl || ''} onChange={e => setFormData({ ...formData, coverUrl: e.target.value })} className={inputCls} placeholder="https://..." />
            </FormField>
          </FormSection>
          <FormSection title="Metadata">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Author">
                <input type="text" required value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className={inputCls} />
              </FormField>
              <FormField label="Genre">
                <input type="text" required value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} className={inputCls} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Constellation">
                <input type="text" value={formData.constellation} onChange={e => setFormData({ ...formData, constellation: e.target.value })} className={inputCls} />
              </FormField>
              <FormField label="Status">
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className={inputCls}>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Hiatus">Hiatus</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Total Episodes (planned)">
                <input type="number" min={0} value={formData.totalEpisodes} onChange={e => setFormData({ ...formData, totalEpisodes: parseInt(e.target.value) })} className={inputCls} />
              </FormField>
              <FormField label="Visibility">
                <select value={formData.visibility || 'public'} onChange={e => setFormData({ ...formData, visibility: e.target.value as any })} className={inputCls}>
                  <option value="public">Public (visible to all)</option>
                  <option value="preview">Preview Only (admin view only, readers see "Coming Soon")</option>
                  <option value="hidden">Hidden (not shown anywhere)</option>
                </select>
              </FormField>
              <FormField label="Featured">
                <button type="button" onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`flex items-center gap-2 w-full px-4 py-3 rounded-sm border transition-colors ${formData.featured ? 'bg-starforge-gold/10 border-starforge-gold/30 text-starforge-gold' : 'bg-void-black border-border/50 text-text-muted'}`}>
                  <Star className={`w-4 h-4 ${formData.featured ? 'fill-starforge-gold' : ''}`} /> {formData.featured ? 'Featured' : 'Not Featured'}
                </button>
              </FormField>
            </div>
          </FormSection>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 py-3 bg-starforge-gold text-void-black rounded-sm font-ui font-bold uppercase tracking-widest hover:bg-yellow-500 transition-all">
              {editingJourney ? 'Update Journey' : 'Create Journey'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 bg-surface-elevated text-text-primary rounded-sm font-ui uppercase tracking-widest border border-border hover:bg-surface transition-all">Cancel</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
