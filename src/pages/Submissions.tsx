import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Submissions() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [formData, setFormData] = useState({
    legalName: '', penName: '', email: '', pronouns: '', bio: '',
    title: '', genre: '', wordCount: '', compTitles: '', contentWarnings: '',
    queryLetter: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const id = `RÜNA-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      await addDoc(collection(db, 'submissions'), {
        title: formData.title,
        authorId: user.uid,
        authorName: formData.legalName,
        penName: formData.penName,
        email: formData.email,
        pronouns: formData.pronouns,
        bio: formData.bio,
        genre: formData.genre,
        wordCount: parseInt(formData.wordCount) || 0,
        compTitles: formData.compTitles,
        contentWarnings: formData.contentWarnings,
        queryLetter: formData.queryLetter,
        synopsis: formData.queryLetter.substring(0, 500), // Use query letter as synopsis for rules compatibility
        manuscriptUrl: 'https://pending-upload',
        trackingId: id,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setTrackingId(id);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
      setIsSubmitting(false);
    }
  };

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
          <div className="bg-deep-space border border-border p-4 rounded-sm mb-8">
            <p className="font-ui text-xs text-text-muted uppercase tracking-wider mb-1">Tracking ID</p>
            <p className="font-mono text-lg text-starforge-gold">{trackingId}</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-starforge-gold text-void-black py-3 font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-white transition-colors"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

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
            Reading Window: OPEN (Closes Oct 31)
          </div>
        </div>

        {/* Guidelines Summary */}
        <div className="bg-surface border border-border p-6 md:p-8 rounded-sm mb-12 shadow-lg">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-starforge-gold shrink-0 mt-1" />
            <div>
              <h3 className="font-heading text-xl text-text-primary font-semibold mb-2">Before You Submit</h3>
              <p className="font-body text-text-secondary mb-4">
                We are currently seeking full-length manuscripts (70k-120k words) in speculative fiction, fantasy, and horror, particularly from marginalized voices.
              </p>
              <ul className="list-disc list-inside font-body text-sm text-text-muted space-y-2">
                <li>Simultaneous submissions are allowed (please notify us if accepted elsewhere).</li>
                <li>Please submit only one manuscript at a time.</li>
                <li>Ensure your manuscript is formatted in standard manuscript format.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Wizard */}
        <div className="bg-surface-elevated border border-border rounded-sm shadow-2xl overflow-hidden">

          {/* Progress Bar */}
          <div className="flex border-b border-border bg-deep-space">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 py-4 text-center font-ui text-xs uppercase tracking-wider border-r border-border last:border-r-0 transition-colors ${step === i ? 'bg-starforge-gold/10 text-starforge-gold border-b-2 border-b-starforge-gold' :
                  step > i ? 'text-text-primary' : 'text-text-muted'
                  }`}
              >
                Step {i}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10">

            {/* Step 1: Author Info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-heading text-2xl text-text-primary mb-6">Author Information</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Legal Name *</label>
                      <input required type="text" value={formData.legalName} onChange={e => updateField('legalName', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                    </div>
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Pen Name (Optional)</label>
                      <input type="text" value={formData.penName} onChange={e => updateField('penName', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Email Address *</label>
                      <input required type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                    </div>
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Pronouns</label>
                      <input type="text" placeholder="e.g., she/they" value={formData.pronouns} onChange={e => updateField('pronouns', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-ui text-sm text-text-secondary mb-2">Author Bio (Max 200 words) *</label>
                    <textarea required rows={4} value={formData.bio} onChange={e => updateField('bio', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-body resize-none"></textarea>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Manuscript Info */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-heading text-2xl text-text-primary mb-6">Manuscript Details</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block font-ui text-sm text-text-secondary mb-2">Manuscript Title *</label>
                    <input required type="text" value={formData.title} onChange={e => updateField('title', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Primary Genre *</label>
                      <select required value={formData.genre} onChange={e => updateField('genre', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui appearance-none">
                        <option value="">Select Genre</option>
                        <option value="fantasy">Fantasy</option>
                        <option value="scifi">Science Fiction</option>
                        <option value="horror">Horror</option>
                        <option value="romance">Queer Romance</option>
                        <option value="literary">Literary Fiction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-ui text-sm text-text-secondary mb-2">Word Count *</label>
                      <input required type="number" placeholder="e.g., 85000" value={formData.wordCount} onChange={e => updateField('wordCount', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-ui text-sm text-text-secondary mb-2">Comparable Titles (2-3) *</label>
                    <input required type="text" placeholder="e.g., Gideon the Ninth meets The Fifth Season" value={formData.compTitles} onChange={e => updateField('compTitles', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                  </div>

                  <div>
                    <label className="block font-ui text-sm text-text-secondary mb-2">Content/Trigger Warnings</label>
                    <input type="text" placeholder="Separate with commas" value={formData.contentWarnings} onChange={e => updateField('contentWarnings', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-ui" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Materials */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-heading text-2xl text-text-primary mb-6">Submission Materials</h2>

                <div className="space-y-8">
                  <div>
                    <label className="block font-ui text-sm text-text-secondary mb-2">Query Letter *</label>
                    <textarea required rows={8} placeholder="Paste your query letter here..." value={formData.queryLetter} onChange={e => updateField('queryLetter', e.target.value)} className="w-full bg-void-black border border-border rounded-sm px-4 py-2 text-text-primary focus:border-starforge-gold focus:ring-1 focus:ring-starforge-gold outline-none font-body resize-y"></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-dashed border-border rounded-sm p-6 text-center hover:border-starforge-gold/50 transition-colors bg-void-black">
                      <FileText className="w-8 h-8 text-text-muted mx-auto mb-3" />
                      <p className="font-ui text-sm text-text-primary mb-1">Upload Synopsis (PDF)</p>
                      <p className="font-ui text-xs text-text-muted mb-4">Max 2 pages</p>
                      <button type="button" className="px-4 py-2 bg-surface border border-border text-text-secondary text-xs uppercase tracking-wider rounded-sm hover:text-starforge-gold">Select File</button>
                    </div>

                    <div className="border border-dashed border-border rounded-sm p-6 text-center hover:border-starforge-gold/50 transition-colors bg-void-black">
                      <FileText className="w-8 h-8 text-text-muted mx-auto mb-3" />
                      <p className="font-ui text-sm text-text-primary mb-1">Upload Sample (PDF/DOCX)</p>
                      <p className="font-ui text-xs text-text-muted mb-4">First 3 chapters or 50 pages</p>
                      <button type="button" className="px-4 py-2 bg-surface border border-border text-text-secondary text-xs uppercase tracking-wider rounded-sm hover:text-starforge-gold">Select File</button>
                    </div>
                  </div>

                  <div className="bg-deep-space p-4 rounded-sm border border-border flex items-start gap-3">
                    <input required type="checkbox" id="terms" className="mt-1 accent-starforge-gold" />
                    <label htmlFor="terms" className="font-ui text-sm text-text-secondary leading-relaxed">
                      I confirm that this is my original work, it is not currently under contract elsewhere, and I have read the submission guidelines.
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-border flex justify-between items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-border text-text-secondary font-ui text-sm uppercase tracking-wider rounded-sm hover:text-white transition-colors"
                >
                  Back
                </button>
              ) : <div></div>}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-8 py-3 bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-white transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-starforge-gold text-void-black font-ui font-semibold uppercase tracking-wider rounded-sm hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Transmuting...' : 'Submit to Starforge'}
                  {!isSubmitting && <Send className="w-4 h-4" />}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
