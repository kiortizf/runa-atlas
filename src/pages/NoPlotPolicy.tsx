import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Check, X, AlertTriangle, BookOpen, Heart, Scale, Flag, Award } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// NO PLOT SUBMISSIONS POLICY
// ═══════════════════════════════════════════════════════════════

export default function NoPlotPolicy() {
  return (
    <div className="min-h-screen bg-void-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/archive" className="inline-flex items-center gap-2 text-text-muted hover:text-starforge-gold font-ui text-xs uppercase tracking-widest mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-starforge-gold/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-starforge-gold" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-white">Submission Policy</h1>
              <p className="font-ui text-xs text-text-muted uppercase tracking-widest">The Runeweave Archive</p>
            </div>
          </div>

          <div className="h-px bg-white/[0.06] my-8" />

          {/* ── What Is the Archive ── */}
          <section className="mb-12">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-starforge-gold" /> What Is the Runeweave Archive?
            </h2>
            <p className="font-ui text-sm text-text-secondary leading-relaxed mb-4">
              The Runeweave Archive is a structured library of <strong className="text-white">reader-made, non-canon artifacts</strong> attached
              to published titles on Rüna Atlas. Think of it as a community museum — glossaries, playlists, moodboards,
              curated lists, craft essays, personality quizzes, and more.
            </p>
            <p className="font-ui text-sm text-text-secondary leading-relaxed">
              Artifacts are canon-adjacent documents and curatorial objects. They let the community
              "play in the universe" of any book without writing fanfiction or submitting plot ideas.
            </p>
          </section>

          {/* ── What's Allowed ── */}
          <section className="mb-12">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" /> What's Allowed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Tone pieces and atmospheric writing',
                '"Found documents" (glossaries, reports, letters)',
                'Aesthetic companions (moodboards, palettes)',
                'Playlists with streaming links',
                'Curated reading lists and comparisons',
                'Craft essays (voice, structure, themes)',
                'Research dossiers with cited sources',
                'Quizzes, bingo cards, reading challenges',
                'Maps and diagrams based on published text',
                'Object catalogs and timelines',
                'Discussion prompts and thread summaries',
                'Reading logs and annotation trails',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-400 flex-none mt-0.5" />
                  <span className="font-ui text-xs text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── What's Prohibited ── */}
          <section className="mb-12">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <X className="w-5 h-5 text-red-400" /> What's Prohibited
            </h2>
            <div className="space-y-3">
              {[
                { rule: 'No "missing scenes"', desc: 'Do not write narrative scenes that could be mistaken for canon chapters.' },
                { rule: 'No plot continuation', desc: 'Do not submit content that continues the plot, reveals new events, or introduces new major canon events.' },
                { rule: 'No "what happens next" or alternate endings', desc: 'Artifacts must not speculate on future plot events or rewrite the ending.' },
                { rule: 'No IP ownership claims', desc: 'You may not claim ownership of the original book world, characters, or IP.' },
                { rule: 'No explicit sexual content', desc: 'Even in Mature-rated artifacts, explicit sexual content is not permitted.' },
                { rule: 'No harassment or hate speech', desc: 'Content must be respectful and inclusive.' },
                { rule: 'No use of AI-generated images without disclosure', desc: 'If using AI-generated images in moodboards, you must disclose this.' },
              ].map(({ rule, desc }) => (
                <div key={rule} className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <X className="w-4 h-4 text-red-400 flex-none mt-0.5" />
                  <div>
                    <span className="font-ui text-sm text-white font-semibold">{rule}</span>
                    <p className="font-ui text-xs text-text-muted mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Licensing & IP ── */}
          <section className="mb-12">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" /> Licensing & IP
            </h2>
            <div className="space-y-4 font-ui text-sm text-text-secondary leading-relaxed">
              <div className="p-4 bg-amber-900/10 border border-amber-500/15 rounded-lg">
                <p className="mb-3">
                  <strong className="text-white">You retain rights</strong> to your original artifact text, images, and creative content.
                  By submitting, you grant Rüna Atlas a <strong className="text-amber-300">non-exclusive, worldwide, royalty-free license</strong> to
                  host, display, and promote your artifact on the platform.
                </p>
                <p className="mb-3">
                  <strong className="text-white">The platform and original author</strong> retain all rights to the underlying book world,
                  characters, plots, and intellectual property.
                </p>
                <p>
                  <strong className="text-white">No idea submission:</strong> Artifacts are for community enjoyment and discovery.
                  They are <strong className="text-amber-300">not</strong> for pitching canon ideas, and no submission will be treated as
                  a creative pitch or incorporated into canon.
                </p>
              </div>
            </div>
          </section>

          {/* ── Labeling ── */}
          <section className="mb-12">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" /> Labeling
            </h2>
            <p className="font-ui text-sm text-text-secondary leading-relaxed mb-4">
              All artifacts carry the label:
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg">
              <Shield className="w-4 h-4 text-text-muted" />
              <span className="font-ui text-xs uppercase tracking-widest text-text-muted">Reader-made · Non-canon</span>
            </div>
            <p className="font-ui text-xs text-text-muted mt-3">
              This label is not removable and appears on every artifact in the archive.
            </p>
          </section>

          {/* ── Moderation ── */}
          <section className="mb-12">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <Flag className="w-5 h-5 text-violet-400" /> Moderation
            </h2>
            <div className="space-y-4 font-ui text-sm text-text-secondary leading-relaxed">
              <p>Artifacts go through a moderation process before being published:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { level: 'Level 0', title: 'New Contributor', desc: 'First submission goes to the pending review queue.', color: 'text-text-muted' },
                  { level: 'Level 1', title: 'Trusted Contributor', desc: 'After 2 approved artifacts, new submissions auto-publish.', color: 'text-emerald-400' },
                  { level: 'Level 2', title: 'Curator', desc: 'Can create Constellation Curations and Reading Paths.', color: 'text-starforge-gold' },
                ].map(l => (
                  <div key={l.level} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg text-center">
                    <div className={`font-ui text-[10px] uppercase tracking-widest ${l.color} mb-1`}>{l.level}</div>
                    <div className="font-heading text-sm text-white mb-1">{l.title}</div>
                    <p className="font-ui text-[11px] text-text-muted">{l.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Reporting & Appeals ── */}
          <section className="mb-12">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" /> Reporting & Appeals
            </h2>
            <div className="font-ui text-sm text-text-secondary leading-relaxed space-y-3">
              <p>
                Any reader can report an artifact using the <strong className="text-white">Report</strong> button on the artifact page.
                Reports are reviewed by the moderation team.
              </p>
              <p>
                If your artifact is hidden or removed, you'll receive a notification with the reason.
                You may appeal by contacting <span className="text-starforge-gold">support@runaatlas.com</span>.
              </p>
            </div>
          </section>

          {/* ── Rate Limiting ── */}
          <section className="mb-12">
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" /> Rate Limiting
            </h2>
            <p className="font-ui text-sm text-text-secondary leading-relaxed">
              To maintain quality, contributors are limited to <strong className="text-white">5 artifact submissions per 24-hour period</strong>.
              This limit applies to all contributor levels.
            </p>
          </section>

          {/* CTA */}
          <div className="text-center py-8 border-t border-white/[0.06]">
            <Link to="/archive/submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-starforge-gold text-void-black font-ui text-sm uppercase tracking-widest rounded-lg hover:bg-yellow-400 transition-colors font-semibold">
              Submit to the Archive
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
