import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Shield, Heart, Compass, BookOpen, Users, Pen } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function About() {
  const [hero, setHero] = useState({
    subtitle: 'Charting the unwritten territories of speculative fiction. Forging constellations of voice from the margins of the literary cosmos.',
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'page_configs', 'about'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.heroSubtitle) setHero(prev => ({ ...prev, subtitle: data.heroSubtitle }));
      }
    }, () => { /* use fallback */ });
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
          <span className="inline-block bg-starforge-gold/10 text-starforge-gold border border-starforge-gold/30 text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm font-ui mb-6">
            Est. 2026
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-text-primary uppercase tracking-widest mb-6">
            About <span className="text-starforge-gold">Rüna Atlas</span> <span className="text-text-muted font-heading italic normal-case">Press</span>
          </h1>
          <p className="font-body text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {hero.subtitle}
          </p>
        </motion.div>

        <div className="space-y-10">
          {/* Origin Mythology */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-border p-8 md:p-10 rounded-sm"
          >
            <h2 className="font-heading text-2xl text-text-primary mb-6 flex items-center gap-3">
              <Compass className="w-6 h-6 text-starforge-gold" /> The Name
            </h2>
            <div className="font-body text-lg text-text-secondary leading-relaxed space-y-4">
              <p>
                <span className="text-starforge-gold font-heading">Rúna</span>: the Old Norse word for secret, mystery, whispered wisdom. The runes were not letters. They were spells carved into stone so reality would remember them.
              </p>
              <p>
                <span className="text-starforge-gold font-heading">Atlas</span> did not hold the sky. He mapped the unknown so others could find their way.
              </p>
              <p className="text-text-primary font-heading text-xl border-l-4 border-starforge-gold pl-6 py-2">
                Rüna Atlas Press exists because some stories are still being kept secret. We carve them into the sky where everyone can see.
              </p>
            </div>
          </motion.section>

          {/* Manifesto */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-border p-8 md:p-10 rounded-sm"
          >
            <h2 className="font-heading text-2xl text-text-primary mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-starforge-gold" /> What We Believe
            </h2>
            <div className="space-y-6">
              {[
                { text: 'Every silenced voice is a stolen star.', color: 'text-starforge-gold' },
                { text: 'Genre fiction is not escapism. It is the only honest way to tell certain truths.', color: 'text-aurora-teal' },
                { text: 'The map is not the territory, but the story IS the map.', color: 'text-cosmic-purple' },
                { text: 'Readers do not consume stories. They join them.', color: 'text-queer-pink' },
                { text: 'A book is not finished when it is printed. It is finished when it changes someone.', color: 'text-starforge-gold' },
              ].map((belief, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <span className={`font-display text-2xl ${belief.color} shrink-0 leading-none mt-1`}>{i + 1}</span>
                  <p className="font-body text-lg text-text-secondary leading-relaxed">{belief.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* The Starforge Process */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-border p-8 md:p-10 rounded-sm"
          >
            <h2 className="font-heading text-2xl text-text-primary mb-4 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-aurora-teal" /> The Starforge Process
            </h2>
            <div className="font-body text-lg text-text-secondary leading-relaxed space-y-4">
              <p>
                We do not acquire books. We <span className="text-aurora-teal font-heading">Forge</span> them. Our editorial process is deeply collaborative: the author's vision is the guiding star, and our team provides meticulous craft support from developmental edits to cover design, ensuring every title shines at its brightest.
              </p>
              <p>
                Authors who join Rüna Atlas are not signed. They are <span className="text-aurora-teal font-heading">Inscribed</span> into the Runeweave: a collective constellation where creators uplift one another, share knowledge, and grow together.
              </p>
            </div>
          </motion.section>

          {/* What Makes Us Different */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface border border-border p-8 rounded-sm"
            >
              <h2 className="font-heading text-xl text-text-primary mb-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-queer-pink" /> Readers Shape the Story
              </h2>
              <p className="text-sm font-body text-text-secondary leading-relaxed">
                Our readers do not sit on the sidelines. They vote on anthology themes, participate in story-shaping polls, build fan communities, and interact directly with authors. At Rüna Atlas, reading is participation. The future of our catalog is charted by the constellation itself.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface border border-border p-8 rounded-sm"
            >
              <h2 className="font-heading text-xl text-text-primary mb-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-forge-red" /> Author Protection
              </h2>
              <p className="text-sm font-body text-text-secondary leading-relaxed">
                Transparent contracts. Fair royalties. Rights that remain with the creator. We believe authors should be fairly compensated for their magic. Every Inscribed author retains creative control and receives a clear, honest partnership.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface border border-border p-8 rounded-sm"
            >
              <h2 className="font-heading text-xl text-text-primary mb-4 flex items-center gap-3">
                <Pen className="w-5 h-5 text-cosmic-purple" /> Open Doors
              </h2>
              <p className="text-sm font-body text-text-secondary leading-relaxed">
                We actively seek unagented submissions during our open calls, ensuring the doors to the Starforge remain open to those who might not otherwise have access. No gatekeepers. No old-guard networks. Just extraordinary stories.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface border border-border p-8 rounded-sm"
            >
              <h2 className="font-heading text-xl text-text-primary mb-4 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-starforge-gold" /> BIPOC + Queer Speculative Focus
              </h2>
              <p className="text-sm font-body text-text-secondary leading-relaxed">
                We center stories from BIPOC, queer, disabled, and other historically marginalized creators working in speculative fiction, dark fantasy, Afrofuturism, solarpunk, and the spaces between genres that do not yet have names.
              </p>
            </motion.section>
          </div>

          {/* Ritual Language */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-starforge-gold/20 p-8 md:p-10 rounded-sm"
          >
            <h2 className="font-heading text-2xl text-text-primary mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-starforge-gold" /> The Language of the Stars
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { old: 'An author is signed', ritual: 'An author is Inscribed' },
                { old: 'A book is published', ritual: 'A book is Forged' },
                { old: 'Readers subscribe', ritual: 'Readers Chart the stars' },
                { old: 'Newsletter', ritual: 'Transmissions' },
                { old: 'Backlist', ritual: 'The Deep Sky' },
                { old: 'New releases', ritual: 'Rising Stars' },
              ].map((item, i) => (
                <div key={i} className="bg-void-black/50 border border-border rounded-sm p-4">
                  <p className="font-ui text-[10px] text-text-muted uppercase tracking-wider line-through mb-1">{item.old}</p>
                  <p className="font-heading text-sm text-starforge-gold">{item.ritual}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
