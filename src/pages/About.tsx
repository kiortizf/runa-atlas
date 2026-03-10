import { motion } from 'framer-motion';
import { Star, Sparkles, Shield, Heart } from 'lucide-react';

export default function About() {
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
            About <span className="text-starforge-gold">Rüna Atlas</span>
          </h1>
          <p className="font-ui text-xl text-text-secondary max-w-3xl mx-auto italic">
            Forging constellations of voice from marginalized creators.
          </p>
        </motion.div>

        <div className="space-y-12 font-body text-lg text-text-secondary leading-relaxed">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-border p-8 rounded-sm"
          >
            <h2 className="font-heading text-2xl text-text-primary mb-4 flex items-center gap-3">
              <Star className="w-6 h-6 text-starforge-gold" /> Our Mission
            </h2>
            <p className="mb-4">
              Rüna Atlas Publishing was founded on a singular belief: that the universe of speculative fiction is vast, yet too often we only see the same few stars. We exist to chart new territories, to find the brilliant, marginalized voices that have been pushed to the edges of the galaxy, and to bring them to the center of the constellation.
            </p>
            <p>
              We are a celestial forge, transmuting raw narratives into polished stars. We champion stories that challenge, inspire, and redefine what is possible in sci-fi, fantasy, and beyond.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface border border-border p-8 rounded-sm"
          >
            <h2 className="font-heading text-2xl text-text-primary mb-4 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-aurora-teal" /> The Starforge Process
            </h2>
            <p className="mb-4">
              We don't just acquire books; we forge partnerships. Our editorial process is highly collaborative, ensuring that the author's vision remains the guiding light. We provide meticulous attention to detail, from developmental edits to stunning cover design, ensuring every book shines its brightest.
            </p>
            <p>
              Our authors are part of the Runeweave—a supportive community where creators uplift one another, share knowledge, and grow together.
            </p>
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface border border-border p-8 rounded-sm"
            >
              <h2 className="font-heading text-xl text-text-primary mb-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-forge-red" /> Author Protection
              </h2>
              <p className="text-sm">
                We offer transparent contracts, fair royalty splits, and a commitment to protecting our authors' rights. We believe that creators should be fairly compensated for their magic.
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface border border-border p-8 rounded-sm"
            >
              <h2 className="font-heading text-xl text-text-primary mb-4 flex items-center gap-3">
                <Heart className="w-5 h-5 text-queer-pink" /> Community First
              </h2>
              <p className="text-sm">
                We actively seek out unagented submissions during our open calls, ensuring that the doors to the Starforge remain open to those who might not otherwise have access.
              </p>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
