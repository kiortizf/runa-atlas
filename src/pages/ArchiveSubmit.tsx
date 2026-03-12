import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit as fbLimit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, AlertTriangle, Plus, X, Loader2,
  Sparkles, Route, ArrowLeftRight, Waves, MessageCircleQuestion, ScrollText,
  BookOpenCheck, Footprints, Quote, Wrench, FileSearch, Image, Music,
  Palette, PaintBucket, NotebookPen, Mail, FileImage, FileWarning,
  UtensilsCrossed, Map, Archive, Clock, Grid3X3, HelpCircle, Search, Trophy,
} from 'lucide-react';
import {
  ARCHIVE_CATEGORIES, ARTIFACT_TYPE_META, RATING_META,
  CONTENT_WARNING_SUGGESTIONS, TAG_SUGGESTIONS, ARCHIVE_PROMPTS,
  type ArtifactType, type ArtifactCategory, type ArtifactRating,
  getCategoryForType,
} from '../data/archiveTypes';

// ═══════════════════════════════════════════════════════════════
// ARCHIVE SUBMIT — Multi-Step Artifact Creation
// ═══════════════════════════════════════════════════════════════

const ICON_MAP: Record<string, any> = {
  Sparkles, Route, ArrowLeftRight, Waves, MessageCircleQuestion, ScrollText,
  BookOpenCheck, Footprints, Quote, Wrench, FileSearch, Image, Music,
  Palette, PaintBucket, NotebookPen, Mail, FileImage, FileWarning,
  UtensilsCrossed, Map, Archive, Clock, Grid3X3: Grid3X3, HelpCircle, Search, Trophy,
};
function getIcon(n: string) { return ICON_MAP[n] || Sparkles; }

const STEPS = ['Type', 'Content', 'Metadata', 'Review'];

export default function ArchiveSubmit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── Form State ──
  const [selectedCategory, setSelectedCategory] = useState<ArtifactCategory | null>(null);
  const [selectedType, setSelectedType] = useState<ArtifactType | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [rating, setRating] = useState<ArtifactRating>('G');
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);
  const [spoilsEnding, setSpoilsEnding] = useState(false);
  const [safeThroughChapter, setSafeThroughChapter] = useState<number | undefined>(undefined);
  const [membershipGated, setMembershipGated] = useState(false);
  const [bookId, setBookId] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  // External links for playlists
  const [links, setLinks] = useState<{ platform: string; url: string; label: string }[]>([]);

  // Random prompt for the selected type
  const randomPrompt = useMemo(() => {
    if (!selectedType) return null;
    const typePrompts = ARCHIVE_PROMPTS.filter(p => p.type === selectedType);
    return typePrompts.length > 0 ? typePrompts[Math.floor(Math.random() * typePrompts.length)] : null;
  }, [selectedType]);

  // ── Validation ──
  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedType;
      case 1: return title.trim().length >= 3 && body.trim().length >= 20;
      case 2: return true; // metadata is optional except rating
      case 3: return acknowledged;
      default: return false;
    }
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!user || !selectedType) return;
    setSubmitting(true);
    try {
      // Rate-limit check: max 5 per day
      const dayAgo = new Date(); dayAgo.setHours(dayAgo.getHours() - 24);
      const limitQ = query(
        collection(db, 'archive_artifacts'),
        where('authorUserId', '==', user.uid),
        where('createdAt', '>=', dayAgo),
        fbLimit(6)
      );
      const snap = await getDocs(limitQ);
      if (snap.size >= 5) {
        alert('You\'ve reached the daily submission limit (5 artifacts per 24 hours). Please try again later.');
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'archive_artifacts'), {
        type: selectedType,
        category: getCategoryForType(selectedType),
        bookId: bookId || null,
        bookTitle: bookTitle || null,
        constellationId: null,
        imprintId: null,
        title: title.trim(),
        summary: summary.trim(),
        body: body.trim(),
        tags,
        rating,
        contentWarnings,
        spoilerScope: { safeThroughChapter: safeThroughChapter || null, spoilsEnding },
        media: [],
        links,
        curatedBooks: [],
        authorUserId: user.uid,
        authorDisplayName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || null,
        status: 'pending',
        membershipGated,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        bookmarks: 0,
        views: 0,
        reports: 0,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit artifact. Please try again.');
    }
    setSubmitting(false);
  };

  // ── Success State ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl text-white mb-3">Artifact Submitted</h2>
          <p className="font-ui text-sm text-text-secondary mb-8">
            Your artifact is now in the moderation queue. You'll be notified when it's published.
            Trusted contributors with 2+ approved artifacts get auto-publish privileges.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/archive" className="px-5 py-2.5 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-widest rounded-lg font-semibold">
              Browse Archive
            </Link>
            <button onClick={() => { setSubmitted(false); setStep(0); setSelectedType(null); setSelectedCategory(null); setTitle(''); setSummary(''); setBody(''); setTags([]); setAcknowledged(false); }}
              className="px-5 py-2.5 border border-white/[0.1] text-text-secondary font-ui text-xs uppercase tracking-widest rounded-lg hover:text-white transition-colors">
              Submit Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back */}
        <Link to="/archive" className="inline-flex items-center gap-2 text-text-muted hover:text-starforge-gold font-ui text-xs uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        <h1 className="font-display text-3xl text-white mb-2">Submit to the Archive</h1>
        <p className="font-ui text-sm text-text-secondary mb-8">
          Create a non-canon, reader-made artifact. Not fanfiction — no plot submissions, alternate endings, or missing scenes.
        </p>

        {/* ── Progress Steps ── */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-starforge-gold' : 'text-text-muted/30'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-ui text-xs font-bold ${
                  i < step ? 'bg-starforge-gold text-void-black' :
                  i === step ? 'border-2 border-starforge-gold text-starforge-gold' :
                  'border border-white/[0.1] text-text-muted/30'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="font-ui text-[10px] uppercase tracking-widest hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-starforge-gold/50' : 'bg-white/[0.06]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ═══ STEP 0: Type Selection ═══ */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-ui text-xs uppercase tracking-widest text-text-muted mb-6">Choose a category & type</h2>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {ARCHIVE_CATEGORIES.map(cat => (
                  <button key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setSelectedType(null); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-xs uppercase tracking-widest transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-starforge-gold/15 text-starforge-gold border border-starforge-gold/30'
                        : 'text-text-secondary hover:text-white border border-white/[0.06]'
                    }`}>
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              {/* Type cards within selected category */}
              {selectedCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ARCHIVE_CATEGORIES.find(c => c.id === selectedCategory)!.types.map(t => {
                    const meta = ARTIFACT_TYPE_META[t];
                    const Icon = getIcon(meta.icon);
                    const isSelected = selectedType === t;
                    return (
                      <button key={t}
                        onClick={() => setSelectedType(t)}
                        className={`text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-starforge-gold/10 border-starforge-gold/30'
                            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                          <span className={`font-ui text-sm font-semibold ${isSelected ? 'text-starforge-gold' : 'text-white'}`}>{meta.label}</span>
                        </div>
                        <p className="font-ui text-[11px] text-text-secondary leading-relaxed mb-3">{meta.description}</p>
                        {/* Examples */}
                        <div className="space-y-1.5">
                          {meta.examples.slice(0, 2).map((ex, i) => (
                            <div key={i} className="text-[10px] font-ui text-text-muted bg-white/[0.02] px-2 py-1 rounded">
                              <span className="text-text-secondary">Example:</span> "{ex.title}"
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ STEP 1: Content ═══ */}
          {step === 1 && selectedType && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-6">
                {(() => { const Icon = getIcon(ARTIFACT_TYPE_META[selectedType].icon); return <Icon className={`w-4 h-4 ${ARTIFACT_TYPE_META[selectedType].color}`} />; })()}
                <h2 className="font-ui text-xs uppercase tracking-widest text-text-muted">{ARTIFACT_TYPE_META[selectedType].label}</h2>
              </div>

              {/* Random prompt */}
              {randomPrompt && (
                <div className="mb-6 p-4 bg-starforge-gold/5 border border-starforge-gold/20 rounded-lg">
                  <span className="font-ui text-[10px] uppercase tracking-widest text-starforge-gold">Prompt Idea</span>
                  <p className="font-ui text-sm text-text-secondary mt-1">{randomPrompt.prompt}</p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="font-ui text-xs uppercase tracking-widest text-text-muted mb-2 block">Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120}
                    placeholder="Give your artifact a title…"
                    className="w-full bg-surface border border-white/[0.08] rounded-lg px-4 py-3 font-ui text-sm text-white focus:outline-none focus:border-starforge-gold transition-colors"
                  />
                  <span className="font-ui text-[10px] text-text-muted mt-1 block">{title.length}/120</span>
                </div>

                <div>
                  <label className="font-ui text-xs uppercase tracking-widest text-text-muted mb-2 block">Summary</label>
                  <textarea value={summary} onChange={e => setSummary(e.target.value)} maxLength={300} rows={2}
                    placeholder="A brief description shown in the archive grid…"
                    className="w-full bg-surface border border-white/[0.08] rounded-lg px-4 py-3 font-ui text-sm text-white focus:outline-none focus:border-starforge-gold transition-colors resize-none"
                  />
                  <span className="font-ui text-[10px] text-text-muted mt-1 block">{summary.length}/300</span>
                </div>

                <div>
                  <label className="font-ui text-xs uppercase tracking-widest text-text-muted mb-2 block">Body *</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} rows={12}
                    placeholder="Write your artifact here. Markdown is supported…"
                    className="w-full bg-surface border border-white/[0.08] rounded-lg px-4 py-3 font-ui text-sm text-white focus:outline-none focus:border-starforge-gold transition-colors resize-y font-mono text-xs leading-relaxed"
                  />
                  <span className="font-ui text-[10px] text-text-muted mt-1 block">{body.length} characters · Minimum 20</span>
                </div>

                {/* External links for playlists etc */}
                {(['PLAYLIST', 'MOODBOARD', 'STYLE_ATLAS', 'COLOR_PALETTE'] as ArtifactType[]).includes(selectedType) && (
                  <div>
                    <label className="font-ui text-xs uppercase tracking-widest text-text-muted mb-2 block">External Links</label>
                    {links.map((link, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <select value={link.platform} onChange={e => { const n = [...links]; n[i].platform = e.target.value; setLinks(n); }}
                          className="w-32 bg-surface border border-white/[0.08] rounded-lg px-2 py-2 font-ui text-xs text-white focus:outline-none">
                          <option value="spotify">Spotify</option>
                          <option value="apple">Apple Music</option>
                          <option value="youtube">YouTube</option>
                          <option value="other">Other</option>
                        </select>
                        <input value={link.url} onChange={e => { const n = [...links]; n[i].url = e.target.value; setLinks(n); }}
                          placeholder="https://…" className="flex-1 bg-surface border border-white/[0.08] rounded-lg px-3 py-2 font-ui text-xs text-white focus:outline-none" />
                        <input value={link.label} onChange={e => { const n = [...links]; n[i].label = e.target.value; setLinks(n); }}
                          placeholder="Track name" className="w-40 bg-surface border border-white/[0.08] rounded-lg px-3 py-2 font-ui text-xs text-white focus:outline-none" />
                        <button onClick={() => setLinks(links.filter((_, j) => j !== i))} className="text-text-muted hover:text-red-400"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => setLinks([...links, { platform: 'spotify', url: '', label: '' }])}
                      className="flex items-center gap-1 text-starforge-gold font-ui text-xs uppercase tracking-widest hover:text-yellow-300">
                      <Plus className="w-3 h-3" /> Add Link
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 2: Metadata ═══ */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-ui text-xs uppercase tracking-widest text-text-muted mb-6">Details & Safety</h2>

              <div className="space-y-6">
                {/* Book attachment */}
                <div>
                  <label className="font-ui text-xs uppercase tracking-widest text-text-muted mb-2 block">Attach to a Book (optional)</label>
                  <input value={bookTitle} onChange={e => setBookTitle(e.target.value)}
                    placeholder="Search by book title…"
                    className="w-full bg-surface border border-white/[0.08] rounded-lg px-4 py-3 font-ui text-sm text-white focus:outline-none focus:border-starforge-gold transition-colors"
                  />
                  <span className="font-ui text-[10px] text-text-muted mt-1 block">Type a book title to attach (book linking will be enhanced in a future update)</span>
                </div>

                {/* Rating */}
                <div>
                  <label className="font-ui text-xs uppercase tracking-widest text-text-muted mb-3 block">Rating *</label>
                  <div className="flex gap-3">
                    {(['G', 'TEEN', 'MATURE'] as ArtifactRating[]).map(r => (
                      <button key={r} onClick={() => setRating(r)}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          rating === r
                            ? `${RATING_META[r].color} bg-white/[0.06] border-white/[0.2]`
                            : 'text-text-secondary border-white/[0.06] hover:text-white'
                        }`}>
                        <div className="font-ui text-sm font-semibold">{RATING_META[r].label}</div>
                        <div className="font-ui text-[10px] text-text-muted mt-1">{RATING_META[r].description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Warnings */}
                <div>
                  <label className="font-ui text-xs uppercase tracking-widest text-text-muted mb-2 block">Content Warnings</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {CONTENT_WARNING_SUGGESTIONS.map(w => (
                      <button key={w} onClick={() => setContentWarnings(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w])}
                        className={`px-3 py-1 rounded-full font-ui text-[11px] transition-all ${
                          contentWarnings.includes(w) ? 'bg-amber-500/15 text-amber-400 border border-amber-400/30' : 'text-text-secondary border border-white/[0.06] hover:text-white'
                        }`}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spoiler Scope */}
                <div>
                  <label className="font-ui text-xs uppercase tracking-widest text-text-muted mb-3 block">Spoiler Scope</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={spoilsEnding} onChange={e => setSpoilsEnding(e.target.checked)}
                        className="w-4 h-4 accent-red-400" />
                      <span className="font-ui text-sm text-text-secondary">This artifact spoils the ending</span>
                    </label>
                    {!spoilsEnding && (
                      <div className="flex items-center gap-3">
                        <span className="font-ui text-sm text-text-secondary">Safe through chapter:</span>
                        <input type="number" min={1} value={safeThroughChapter || ''} onChange={e => setSafeThroughChapter(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-20 bg-surface border border-white/[0.08] rounded-lg px-3 py-2 font-ui text-sm text-white focus:outline-none text-center" placeholder="All" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="font-ui text-xs uppercase tracking-widest text-text-muted mb-2 block">Tags (up to 10)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(t => (
                      <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] text-text-secondary font-ui text-[11px]">
                        #{t}
                        <button onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && tagInput && tags.length < 10 && !tags.includes(tagInput)) {
                          setTags([...tags, tagInput]); setTagInput('');
                        }
                      }}
                      placeholder="Add a tag…" maxLength={30}
                      className="flex-1 bg-surface border border-white/[0.08] rounded-lg px-3 py-2 font-ui text-xs text-white focus:outline-none" />
                    <button onClick={() => { if (tagInput && tags.length < 10 && !tags.includes(tagInput)) { setTags([...tags, tagInput]); setTagInput(''); } }}
                      className="px-3 py-2 bg-white/[0.06] rounded-lg text-text-secondary font-ui text-xs hover:text-white transition-colors">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_SUGGESTIONS.filter(t => !tags.includes(t)).slice(0, 15).map(t => (
                      <button key={t} onClick={() => tags.length < 10 && setTags([...tags, t])}
                        className="px-2 py-0.5 font-ui text-[10px] text-text-muted hover:text-white border border-white/[0.04] rounded-full transition-colors">
                        +{t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Membership gating */}
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                  <input type="checkbox" checked={membershipGated} onChange={e => setMembershipGated(e.target.checked)}
                    className="w-4 h-4 accent-starforge-gold" />
                  <div>
                    <span className="font-ui text-sm text-white">Members Only</span>
                    <p className="font-ui text-[10px] text-text-muted">Only logged-in members can view this artifact</p>
                  </div>
                </label>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 3: Review ═══ */}
          {step === 3 && selectedType && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-ui text-xs uppercase tracking-widest text-text-muted mb-6">Review & Submit</h2>

              {/* Preview card */}
              <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {(() => { const Icon = getIcon(ARTIFACT_TYPE_META[selectedType].icon); return <Icon className={`w-4 h-4 ${ARTIFACT_TYPE_META[selectedType].color}`} />; })()}
                  <span className={`font-ui text-[10px] uppercase tracking-widest ${ARTIFACT_TYPE_META[selectedType].color}`}>
                    {ARTIFACT_TYPE_META[selectedType].label}
                  </span>
                  <span className={`font-ui text-[10px] uppercase tracking-widest ml-2 ${RATING_META[rating].color}`}>
                    {RATING_META[rating].label}
                  </span>
                </div>
                <h3 className="font-heading text-xl text-white mb-2">{title || 'Untitled'}</h3>
                {summary && <p className="font-ui text-sm text-text-secondary mb-3 italic">{summary}</p>}
                <div className="font-ui text-xs text-text-secondary leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {body.slice(0, 500)}{body.length > 500 && '…'}
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/[0.04]">
                    {tags.map(t => <span key={t} className="font-mono text-[10px] text-text-muted">#{t}</span>)}
                  </div>
                )}
                {bookTitle && (
                  <div className="mt-3 font-ui text-[10px] text-text-muted">📖 {bookTitle}</div>
                )}
                <div className="mt-3 font-ui text-[9px] uppercase tracking-widest text-text-muted/50">
                  Reader-made · Non-canon
                </div>
              </div>

              {/* Rules acknowledgment */}
              <div className="p-5 bg-amber-900/10 border border-amber-500/20 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-none mt-0.5" />
                  <div>
                    <h4 className="font-ui text-sm text-amber-400 font-semibold mb-2">Submission Agreement</h4>
                    <ul className="space-y-2 font-ui text-xs text-text-secondary leading-relaxed">
                      <li>• This is <strong>not fanfiction</strong>. I am not submitting missing scenes, plot continuations, alternate endings, or canon events.</li>
                      <li>• I retain rights to my original text/images. I grant Rüna Atlas a non-exclusive license to host and display this artifact.</li>
                      <li>• The platform and original author retain all rights to the underlying book world, characters, and IP.</li>
                      <li>• This submission is for community enjoyment and discovery — <strong>not for pitching canon ideas</strong>.</li>
                      <li>• My artifact is labeled "Reader-made, non-canon" and I agree to this designation.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer mb-6">
                <input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)}
                  className="w-5 h-5 accent-starforge-gold" />
                <span className="font-ui text-sm text-white">I understand and agree to the submission policy</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation Buttons ── */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.06]">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 font-ui text-xs uppercase tracking-widest text-text-secondary hover:text-white disabled:opacity-20 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
              className="flex items-center gap-2 px-5 py-2.5 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-widest rounded-lg disabled:opacity-30 hover:bg-yellow-400 transition-colors font-semibold">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed() || submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-starforge-gold text-void-black font-ui text-xs uppercase tracking-widest rounded-lg disabled:opacity-30 hover:bg-yellow-400 transition-colors font-semibold">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? 'Submitting…' : 'Submit Artifact'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
