import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, CheckCircle, Info, Upload, X, Loader2, Save, AlertTriangle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadSubmissionFile } from '../utils/uploadFile';
import { GENRES as GENRE_DATA, IMPRINTS, THEMATIC_TAGS } from '../data/genreData';

const STEP_LABELS = ['Author Info', 'Manuscript Details', 'Materials & Submit'];

interface FileUploadState {
  file: File | null;
  progress: number;
  url: string;
  uploading: boolean;
  error: string;
}

export default function Submissions() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [selectedImprints, setSelectedImprints] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    legalName: '', penName: '', email: '', pronouns: '', bio: '',
    title: '', genre: '', wordCount: '', compTitles: '', contentWarnings: '',
    synopsis: '', queryLetter: '',
    representationStatus: 'unagented',
    previouslyPublished: 'no',
    targetAudience: '',
  });

  const toggleImprint = (id: string) => {
    if (id === 'editors-decide') {
      setSelectedImprints(prev => prev.includes(id) ? [] : [id]);
    } else {
      setSelectedImprints(prev => {
        const filtered = prev.filter(i => i !== 'editors-decide');
        return filtered.includes(id) ? filtered.filter(i => i !== id) : [...filtered, id];
      });
    }
  };
  const toggleTag = (id: string) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const [synopsisFile, setSynopsisFile] = useState<FileUploadState>({ file: null, progress: 0, url: '', uploading: false, error: '' });
  const [sampleFile, setSampleFile] = useState<FileUploadState>({ file: null, progress: 0, url: '', uploading: false, error: '' });
  const synopsisRef = useRef<HTMLInputElement>(null);
  const sampleRef = useRef<HTMLInputElement>(null);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const wordCountNum = parseInt(formData.wordCount) || 0;
  const wordCountValid = wordCountNum >= 20000 && wordCountNum <= 200000;

  // ─── File Handling ──────────────────────────────────
  const handleFileSelect = (type: 'synopsis' | 'sample', file: File | null) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const setter = type === 'synopsis' ? setSynopsisFile : setSampleFile;
      setter(prev => ({ ...prev, error: 'File exceeds 10MB limit' }));
      return;
    }
    const setter = type === 'synopsis' ? setSynopsisFile : setSampleFile;
    setter({ file, progress: 0, url: '', uploading: false, error: '' });
  };

  const uploadFile = async (type: 'synopsis' | 'sample'): Promise<string> => {
    const state = type === 'synopsis' ? synopsisFile : sampleFile;
    const setter = type === 'synopsis' ? setSynopsisFile : setSampleFile;
    if (!state.file) return '';
    if (state.url) return state.url; // Already uploaded

    setter(prev => ({ ...prev, uploading: true, error: '' }));
    try {
      const result = await uploadSubmissionFile(state.file, type, (pct) => {
        setter(prev => ({ ...prev, progress: pct }));
      });
      setter(prev => ({ ...prev, url: result.url, uploading: false }));
      return result.url;
    } catch (err) {
      setter(prev => ({ ...prev, uploading: false, error: 'Upload failed. Please try again.' }));
      throw err;
    }
  };

  // ─── Save Draft ─────────────────────────────────────
  const saveDraft = async () => {
    if (!user) return;
    setIsSavingDraft(true);
    try {
      await addDoc(collection(db, 'submissions'), {
        ...buildSubmissionData(),
        status: 'draft',
        createdAt: serverTimestamp(),
      });
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const buildSubmissionData = () => ({
    title: formData.title || 'Untitled',
    authorId: user!.uid,
    authorName: formData.legalName,
    penName: formData.penName,
    email: formData.email,
    pronouns: formData.pronouns,
    bio: formData.bio,
    genre: formData.genre,
    wordCount: parseInt(formData.wordCount) || 0,
    compTitles: formData.compTitles,
    contentWarnings: formData.contentWarnings,
    synopsis: formData.synopsis,
    queryLetter: formData.queryLetter,
    representationStatus: formData.representationStatus,
    previouslyPublished: formData.previouslyPublished,
    targetAudience: formData.targetAudience,
    imprints: selectedImprints,
    thematicTags: selectedTags,
    synopsisFileUrl: synopsisFile.url || '',
    sampleFileUrl: sampleFile.url || '',
    trackingId: `RÜNA-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
  });

  // ─── Submit ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Upload files first (with timeout)
      let synopsisUrl = synopsisFile.url || '';
      let sampleUrl = sampleFile.url || '';

      const uploadWithTimeout = async (fn: () => Promise<string>, timeoutMs = 30000): Promise<string> => {
        return Promise.race([
          fn(),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Upload timed out. Please try again.')), timeoutMs)
          ),
        ]);
      };

      if (synopsisFile.file && !synopsisFile.url) {
        synopsisUrl = await uploadWithTimeout(() => uploadFile('synopsis'));
      }
      if (sampleFile.file && !sampleFile.url) {
        sampleUrl = await uploadWithTimeout(() => uploadFile('sample'));
      }

      const data = buildSubmissionData();
      data.synopsisFileUrl = synopsisUrl;
      data.sampleFileUrl = sampleUrl;

      await addDoc(collection(db, 'submissions'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setTrackingId(data.trackingId);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Submission error:', error);
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
      alert(error?.message || 'Submission failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success Screen ─────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-void-black py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface border border-starforge-gold/30 rounded-sm p-8 text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-starforge-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-starforge-gold" />
          </div>
          <h2 className="font-display text-2xl text-text-primary uppercase tracking-widest mb-4">Submission Received</h2>
          <p className="font-body text-text-secondary mb-6">
            Your manuscript has entered the Starforge. We will review it carefully and respond within 8-12 weeks.
          </p>
          <div className="bg-deep-space border border-border p-4 rounded-sm mb-4">
            <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-1">Tracking ID</p>
            <p className="font-mono text-lg text-starforge-gold">{trackingId}</p>
          </div>
          <p className="font-ui text-xs text-text-muted mb-6">Save this ID. You can track your submission status in your Author Portal.</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/portal'}
              className="flex-1 bg-starforge-gold text-void-black py-3 font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors"
            >
              Go to Portal
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 border border-border text-text-secondary py-3 font-ui uppercase tracking-wider rounded-sm hover:text-text-primary transition-colors"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── File Upload Component ──────────────────────────
  const FileUploadZone = ({ type, state, inputRef, label, hint }: {
    type: 'synopsis' | 'sample';
    state: FileUploadState;
    inputRef: React.RefObject<HTMLInputElement | null>;
    label: string;
    hint: string;
  }) => (
    <div className={`border border-dashed rounded-sm p-6 transition-colors bg-void-black ${state.error ? 'border-forge-red/50' : state.url ? 'border-aurora-teal/50' : 'border-border hover:border-starforge-gold/50'
      }`}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        className="hidden"
        onChange={e => handleFileSelect(type, e.target.files?.[0] || null)}
      />
      {state.file ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className={`w-5 h-5 shrink-0 ${state.url ? 'text-aurora-teal' : 'text-starforge-gold'}`} />
              <span className="font-ui text-sm text-text-primary truncate">{state.file.name}</span>
            </div>
            <button type="button" onClick={() => {
              const setter = type === 'synopsis' ? setSynopsisFile : setSampleFile;
              setter({ file: null, progress: 0, url: '', uploading: false, error: '' });
            }} className="text-text-muted hover:text-forge-red transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="font-ui text-xs text-text-muted">
            {(state.file.size / (1024 * 1024)).toFixed(2)} MB
          </div>
          {state.uploading && (
            <div className="space-y-1">
              <div className="h-1.5 bg-deep-space rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-starforge-gold rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${state.progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
              <p className="font-ui text-[10px] text-text-muted text-right">{state.progress}%</p>
            </div>
          )}
          {state.url && (
            <div className="flex items-center gap-2 text-aurora-teal font-ui text-xs">
              <CheckCircle className="w-3.5 h-3.5" /> Uploaded successfully
            </div>
          )}
          {state.error && (
            <div className="flex items-center gap-2 text-forge-red font-ui text-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> {state.error}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <p className="font-ui text-sm text-text-primary mb-1">{label}</p>
          <p className="font-ui text-xs text-text-muted mb-4">{hint}</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 bg-surface border border-border text-text-secondary text-xs uppercase tracking-wider rounded-sm hover:text-starforge-gold hover:border-starforge-gold/50 transition-colors"
          >
            Select File
          </button>
        </div>
      )}
    </div>
  );

  // ─── Main Form ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-void-black py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl text-text-primary uppercase tracking-widest mb-4">
            The <span className="text-starforge-gold italic font-heading normal-case">Starforge</span> Awaits
          </h1>
          <p className="font-ui text-text-secondary tracking-widest uppercase text-sm mb-8">Submission Portal</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-aurora-teal/10 border border-aurora-teal/30 rounded-full text-aurora-teal font-ui text-sm">
            <span className="w-2 h-2 rounded-full bg-aurora-teal animate-pulse"></span>
            Reading Window: OPEN
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-surface border border-border p-6 md:p-8 rounded-sm mb-12 shadow-lg">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-starforge-gold shrink-0 mt-1" />
            <div>
              <h3 className="font-heading text-xl text-text-primary font-semibold mb-2">Before You Submit</h3>
              <p className="font-body text-text-secondary mb-4">
                One submission portal for all three imprints: <span className="text-starforge-gold">Rüna Atlas Press</span>, <span className="text-orange-400">Bohío Press</span>, and <span className="text-red-400">Void Noir</span>. Choose which imprint(s) should consider your work, or let our editors decide.
              </p>
              <ul className="list-disc list-inside font-body text-sm text-text-muted space-y-2">
                <li>We accept manuscripts 20k–200k words in speculative fiction, fantasy, horror, and literary fiction.</li>
                <li>Simultaneous submissions are allowed (please notify us if accepted elsewhere).</li>
                <li>Please submit only one manuscript at a time.</li>
                <li>Upload your synopsis and first 3 chapters or 50 pages as PDF/DOCX.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Wizard */}
        <div className="bg-surface-elevated border border-border rounded-sm shadow-2xl overflow-hidden">

          {/* Step Progress Bar */}
          <div className="flex border-b border-border bg-deep-space">
            {STEP_LABELS.map((label, i) => {
              const num = i + 1;
              const isActive = step === num;
              const isComplete = step > num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => num < step && setStep(num)}
                  className={`flex-1 py-4 text-center font-ui text-xs uppercase tracking-wider border-r border-border last:border-r-0 transition-all ${isActive ? 'bg-starforge-gold/10 text-starforge-gold border-b-2 border-b-starforge-gold' :
                    isComplete ? 'text-aurora-teal cursor-pointer hover:bg-surface' : 'text-text-muted cursor-default'
                    }`}
                >
                  <span className="hidden sm:inline">{num}. </span>{label}
                  {isComplete && <CheckCircle className="w-3 h-3 inline ml-1.5 -mt-0.5" />}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            <AnimatePresence mode="wait">

              {/* ─── Step 1: Author Info ─── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-heading text-2xl text-text-primary mb-6">Author Information</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-ui text-sm text-text-secondary mb-2">Legal Name *</label>
                        <input required type="text" value={formData.legalName} onChange={e => updateField('legalName', e.target.value)}
                          className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                      </div>
                      <div>
                        <label className="block font-ui text-sm text-text-secondary mb-2">Pen Name (Optional)</label>
                        <input type="text" value={formData.penName} onChange={e => updateField('penName', e.target.value)}
                          className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-ui text-sm text-text-secondary mb-2">Email Address *</label>
                        <input required type="email" value={formData.email} onChange={e => updateField('email', e.target.value)}
                          className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                      </div>
                      <div>
                        <label className="block font-ui text-sm text-text-secondary mb-2">Pronouns</label>
                        <input type="text" placeholder="e.g., she/they" value={formData.pronouns} onChange={e => updateField('pronouns', e.target.value)}
                          className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Author Bio (Max 200 words) *</label>
                      <textarea required rows={4} value={formData.bio} onChange={e => updateField('bio', e.target.value)}
                        placeholder="Tell us about yourself, your writing journey, and what drives your stories..."
                        className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-body resize-none" />
                      <p className="font-ui text-xs text-text-muted mt-1 text-right">
                        {formData.bio.split(/\s+/).filter(Boolean).length}/200 words
                      </p>
                    </div>
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Representation Status</label>
                      <div className="flex gap-4">
                        {[
                          { v: 'unagented', l: 'Unagented' },
                          { v: 'agented', l: 'Agented' },
                          { v: 'seeking', l: 'Seeking Representation' },
                        ].map(opt => (
                          <label key={opt.v} className={`flex items-center gap-2 px-4 py-2.5 border rounded-sm cursor-pointer transition-all font-ui text-sm ${formData.representationStatus === opt.v
                            ? 'border-starforge-gold bg-starforge-gold/10 text-starforge-gold'
                            : 'border-border text-text-secondary hover:border-text-secondary'
                            }`}>
                            <input type="radio" name="representation" value={opt.v} checked={formData.representationStatus === opt.v}
                              onChange={e => updateField('representationStatus', e.target.value)} className="sr-only" />
                            {opt.l}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Step 2: Manuscript Details ─── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-heading text-2xl text-text-primary mb-6">Manuscript Details</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Manuscript Title *</label>
                      <input required type="text" value={formData.title} onChange={e => updateField('title', e.target.value)}
                        className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui text-lg" />
                    </div>
                    {/* ── Imprint Selection ── */}
                    <div className="mb-6">
                      <label className="block font-ui text-sm text-text-secondary mb-3">Which imprint(s) should consider your work?</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {IMPRINTS.map(imp => (
                          <button key={imp.id} type="button" onClick={() => toggleImprint(imp.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${selectedImprints.includes(imp.id)
                              ? `${imp.colors.bg} ${imp.colors.text} ${imp.colors.border}`
                              : 'border-border bg-void-black text-text-secondary hover:border-text-secondary'
                            }`}>
                            <span className="text-lg">{imp.icon}</span>
                            <p className="text-xs font-semibold mt-1">{imp.name}</p>
                          </button>
                        ))}
                        <button type="button" onClick={() => toggleImprint('editors-decide')}
                          className={`p-3 rounded-lg border text-left transition-all ${selectedImprints.includes('editors-decide')
                            ? 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30'
                            : 'border-border bg-void-black text-text-secondary hover:border-text-secondary'
                          }`}>
                          <span className="text-lg">🤔</span>
                          <p className="text-xs font-semibold mt-1">Let editors decide</p>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-ui text-sm text-text-secondary mb-2">Primary Genre *</label>
                        <select required value={formData.genre} onChange={e => updateField('genre', e.target.value)}
                          className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui appearance-none">
                          <option value="">Select Genre</option>
                          {GENRE_DATA.map(g => (
                            <optgroup key={g.id} label={`${g.icon} ${g.name}`}>
                              {g.subgenres.map(sg => (
                                <option key={sg.id} value={sg.id}>{sg.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-ui text-sm text-text-secondary mb-2">Word Count *</label>
                        <input required type="number" placeholder="e.g., 85000" value={formData.wordCount} onChange={e => updateField('wordCount', e.target.value)}
                          className={`w-full bg-void-black border rounded-sm px-4 py-2.5 text-text-primary focus:ring-1 outline-none font-ui ${formData.wordCount && !wordCountValid ? 'border-ember-orange focus:border-ember-orange focus:ring-ember-orange' : 'border-border focus:border-starforge-gold focus:ring-starforge-gold'
                            }`} />
                        {formData.wordCount && !wordCountValid && (
                          <p className="font-ui text-xs text-ember-orange mt-1">We accept manuscripts between 20,000 and 200,000 words.</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Comparable Titles (2-3) *</label>
                      <input required type="text" placeholder="e.g., Gideon the Ninth meets The Fifth Season" value={formData.compTitles} onChange={e => updateField('compTitles', e.target.value)}
                        className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-ui text-sm text-text-secondary mb-2">Target Audience</label>
                        <select value={formData.targetAudience} onChange={e => updateField('targetAudience', e.target.value)}
                          className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui appearance-none">
                          <option value="">Select Audience</option>
                          <option value="ya">Young Adult (14-18)</option>
                          <option value="na">New Adult (18-25)</option>
                          <option value="adult">Adult</option>
                          <option value="crossover">Crossover (YA/Adult)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-ui text-sm text-text-secondary mb-2">Previously Published?</label>
                        <div className="flex gap-4">
                          {[{ v: 'no', l: 'No' }, { v: 'yes', l: 'Yes' }].map(opt => (
                            <label key={opt.v} className={`flex-1 text-center px-4 py-2.5 border rounded-sm cursor-pointer transition-all font-ui text-sm ${formData.previouslyPublished === opt.v
                              ? 'border-starforge-gold bg-starforge-gold/10 text-starforge-gold'
                              : 'border-border text-text-secondary hover:border-text-secondary'
                              }`}>
                              <input type="radio" name="prevPub" value={opt.v} checked={formData.previouslyPublished === opt.v}
                                onChange={e => updateField('previouslyPublished', e.target.value)} className="sr-only" />
                              {opt.l}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Content/Trigger Warnings</label>
                      <input type="text" placeholder="Separate with commas" value={formData.contentWarnings} onChange={e => updateField('contentWarnings', e.target.value)}
                        className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                    </div>

                    {/* ── Thematic Tags ── */}
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Thematic Tags (select all that apply)</label>
                      <div className="flex flex-wrap gap-2">
                        {THEMATIC_TAGS.map(tag => (
                          <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-ui transition-all border ${
                              selectedTags.includes(tag.id)
                                ? `${tag.color} border-transparent`
                                : 'bg-void-black text-text-muted border-border hover:text-text-secondary'
                            }`}>
                            {tag.hashtag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Synopsis (1-2 pages) *</label>
                      <textarea required rows={6} placeholder="Provide a complete synopsis of your manuscript including the ending..." value={formData.synopsis} onChange={e => updateField('synopsis', e.target.value)}
                        className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-body resize-y" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Step 3: Materials & Submit ─── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="font-heading text-2xl text-text-primary mb-6">Materials & Submit</h2>
                  <div className="space-y-8">
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Query Letter *</label>
                      <textarea required rows={8} placeholder="Dear Rüna Atlas editors,&#10;&#10;I am seeking publication for my [genre] novel, [TITLE], complete at [word count] words..."
                        value={formData.queryLetter} onChange={e => updateField('queryLetter', e.target.value)}
                        className="w-full bg-void-black border border-border rounded-sm px-4 py-2.5 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-body resize-y" />
                    </div>

                    <div>
                      <h3 className="font-ui text-sm text-text-secondary mb-4 uppercase tracking-wider">File Uploads</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUploadZone
                          type="synopsis"
                          state={synopsisFile}
                          inputRef={synopsisRef}
                          label="Synopsis (PDF)"
                          hint="Max 2 pages • 10MB limit"
                        />
                        <FileUploadZone
                          type="sample"
                          state={sampleFile}
                          inputRef={sampleRef}
                          label="Manuscript Sample (PDF/DOCX)"
                          hint="First 3 chapters or 50 pages • 10MB limit"
                        />
                      </div>
                    </div>

                    <div className="bg-deep-space p-4 rounded-sm border border-border flex items-start gap-3">
                      <input required type="checkbox" id="terms" className="mt-1 accent-starforge-gold" />
                      <label htmlFor="terms" className="font-ui text-sm text-text-secondary leading-relaxed">
                        I confirm that this is my original work, it is not currently under exclusive contract elsewhere, and I have read and agree to the submission guidelines.
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Navigation ─── */}
            <div className="mt-10 pt-6 border-t border-border flex justify-between items-center">
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 border border-border text-text-secondary font-ui text-sm uppercase tracking-wider rounded-sm hover:text-white transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={isSavingDraft}
                  className="px-4 py-3 text-text-muted font-ui text-sm uppercase tracking-wider rounded-sm hover:text-starforge-gold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {draftSaved ? <CheckCircle className="w-4 h-4 text-aurora-teal" /> : isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {draftSaved ? 'Saved!' : 'Save Draft'}
                </button>
              </div>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-8 py-3 bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || synopsisFile.uploading || sampleFile.uploading}
                  className="px-8 py-3 bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-yellow-500 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Transmuting...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit to Starforge</>
                  )}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
