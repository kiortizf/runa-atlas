import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Skull, Eye, EyeOff,
  Feather, Moon, Ghost, Flame, Brain
} from 'lucide-react';
import { VOID_NOIR_GENRES } from '../data/genreData';
import { usePageSEO } from '../hooks/usePageSEO';

// ═══════════════════════════════════════════════════════════════
// VOID NOIR — IMPRINT LANDING PAGE
// ═══════════════════════════════════════════════════════════════
// "Where the dark looks back"
// Blood Moon #8b0000 · Bone White #f5f5dc · Rot Green #2d4a3e
// Bruise Purple #2d1f3d · Ember Orange #c2410c · Corpse Gray #4a4a4a
// ═══════════════════════════════════════════════════════════════

const VOID_NOIR_IS = [
  'Queer horror',
  'BIPOC horror',
  'Horror that interrogates power',
  'Horror where marginalized people survive (or die meaningfully)',
  'Beautiful prose that happens to terrify',
  'Monsters that are metaphors',
  'Trauma explored, not exploited',
  'Cerebral > visceral (though visceral welcome)',
];

const VOID_NOIR_IS_NOT = [
  'Torture porn',
  'Gore for shock value',
  'White male dominated',
  'Lovecraft without the reckoning',
  '"Elevated horror" (pretentious term we reject)',
];

const PRIMARY_GENRES = [
  { name: 'Horror', desc: 'All subgenres', icon: Skull },
  { name: 'Dark Fantasy', desc: 'Where magic meets dread', icon: Moon },
  { name: 'Gothic Fiction', desc: 'Crumbling estates, family secrets', icon: Ghost },
  { name: 'Weird Fiction / New Weird', desc: 'Defying classification', icon: Eye },
];

const ADJACENT_GENRES = [
  'Psychological Thriller (with speculative elements)',
  'Dark Literary Fiction',
  'Supernatural Suspense',
  'Grimdark (selective)',
];

// Floating particle component for ambient dread
function DriftingParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        background: `radial-gradient(circle, rgba(139,0,0,${0.15 + Math.random() * 0.15}), transparent)`,
        filter: 'blur(1px)',
      }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{ y: '-10vh', opacity: [0, 0.6, 0.3, 0] }}
      transition={{ duration: 18 + Math.random() * 12, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export default function ImprintVoidNoir() {
  usePageSEO({
    title: 'Void Noir',
    description: 'Void Noir — Where the dark looks back. The horror and dark fiction imprint of RÜNA ATLAS PRESS. Queer horror, BIPOC horror, gothic fiction, and weird fiction from marginalized creators.',
  });
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.05]);
  const [flickerText, setFlickerText] = useState(true);

  // Subtle text flicker on the tagline
  useEffect(() => {
    const interval = setInterval(() => {
      setFlickerText(false);
      setTimeout(() => setFlickerText(true), 80 + Math.random() * 120);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white relative overflow-hidden"
      style={{ background: '#0a0a0a' }}>

      {/* ── Ambient Particles ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <DriftingParticle
            key={i}
            delay={i * 1.8}
            x={5 + (i * 7) % 90}
            size={3 + Math.random() * 5}
          />
        ))}
      </div>

      {/* ── Vignette Overlay ── */}
      <div className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* ═══ HERO ═══ */}
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[100vh] flex items-center justify-center z-20">

        {/* Hero image background */}
        <div className="absolute inset-0">
          <img src="/images/imprints/void-noir-hero.png" alt=""
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.35, filter: 'saturate(0.8) brightness(0.5)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.9) 80%, #0a0a0a 100%)' }} />
        </div>

        {/* Multi-layer radial bleeds */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(139,0,0,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(45,31,61,0.15) 0%, transparent 50%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 100%, rgba(139,0,0,0.08) 0%, transparent 40%)' }} />

        {/* Horizontal bleed line */}
        <div className="absolute top-1/2 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,0,0,0.2), transparent)' }} />

        <div className="text-center px-6 max-w-4xl relative">
          {/* Moon icon with pulse */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-10"
          >
            <span className="text-7xl md:text-8xl block" style={{ filter: 'drop-shadow(0 0 30px rgba(139,0,0,0.4))' }}>🌑</span>
          </motion.div>

          {/* Title — staggered letters */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.3 }}
            className="mb-6"
          >
            <span className="font-display text-6xl md:text-8xl lg:text-9xl tracking-[0.3em] uppercase block"
              style={{ color: '#8b0000', textShadow: '0 0 40px rgba(139,0,0,0.3)' }}>
              Void
            </span>
            <span className="font-display text-5xl md:text-7xl lg:text-8xl tracking-[0.5em] uppercase block mt-[-0.1em]"
              style={{ color: '#f5f5dc', textShadow: '0 0 20px rgba(245,245,220,0.1)' }}>
              Noir
            </span>
          </motion.h1>

          {/* Tagline with flicker */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="font-heading text-xl md:text-2xl italic mb-12 transition-opacity duration-75"
            style={{ color: flickerText ? '#8b0000' : 'transparent' }}
          >
            "Where the dark looks back"
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-8"
          >
            <div className="w-px h-16 mx-auto" style={{ background: 'linear-gradient(to bottom, rgba(139,0,0,0.4), transparent)' }} />
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ MANIFESTO ═══ */}
      <div className="relative z-20">
        <div className="max-w-3xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.5 }}
          >
            <p className="font-body text-lg md:text-xl leading-[2] tracking-wide"
              style={{ color: '#f5f5dc', opacity: 0.7 }}>
              Some stories don't want to be told in daylight.
            </p>
            <p className="font-body text-lg md:text-xl leading-[2] tracking-wide mt-4"
              style={{ color: '#f5f5dc', opacity: 0.7 }}>
              Void Noir is where they live.
            </p>
            <p className="font-body text-lg md:text-xl leading-[2] tracking-wide mt-8"
              style={{ color: '#f5f5dc', opacity: 0.5 }}>
              Queer nightmares. Inherited hauntings. Bodies that remember.
              <br />
              We publish the horror that mainstream won't touch —
              <br />
              <span style={{ color: '#8b0000' }}>because it hits too close.</span>
            </p>
          </motion.div>
        </div>

        {/* Blood divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 10%, #8b0000 50%, transparent 90%)', opacity: 0.4 }} />

        {/* ═══ PRIMARY GENRES ═══ */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <h2 className="font-display text-xs uppercase tracking-[0.4em] mb-2" style={{ color: '#4a4a4a' }}>
              We Publish
            </h2>
            <h3 className="font-heading text-3xl md:text-4xl mb-12" style={{ color: '#8b0000' }}>
              The Genres That Haunt
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {PRIMARY_GENRES.map((g, i) => (
                <motion.div
                  key={g.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  className="group relative p-6 rounded-xl border transition-all duration-500 hover:border-[#8b0000]/40"
                  style={{
                    borderColor: 'rgba(139,0,0,0.15)',
                    background: 'linear-gradient(135deg, rgba(139,0,0,0.04) 0%, rgba(45,31,61,0.04) 100%)',
                  }}
                >
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: 'radial-gradient(circle at center, rgba(139,0,0,0.06), transparent 70%)' }} />
                  <g.icon className="w-8 h-8 mb-4 transition-colors duration-300" style={{ color: '#8b0000' }} />
                  <h4 className="font-heading text-lg mb-1" style={{ color: '#f5f5dc' }}>{g.name}</h4>
                  <p className="text-sm" style={{ color: '#4a4a4a' }}>{g.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Adjacent */}
            <div className="p-5 rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)' }}>
              <h4 className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: '#4a4a4a' }}>Also Accepting</h4>
              <div className="flex flex-wrap gap-2">
                {ADJACENT_GENRES.map(g => (
                  <span key={g} className="px-3 py-1.5 text-xs rounded-lg border"
                    style={{ color: 'rgba(139,0,0,0.6)', borderColor: 'rgba(139,0,0,0.1)', background: 'rgba(139,0,0,0.03)' }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Blood divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 10%, #8b0000 50%, transparent 90%)', opacity: 0.3 }} />

        {/* ═══ HORROR SUB-CATEGORIES ═══ */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <h2 className="font-display text-xs uppercase tracking-[0.4em] mb-2" style={{ color: '#4a4a4a' }}>
              Sub-Categories
            </h2>
            <h3 className="font-heading text-3xl md:text-4xl mb-12" style={{ color: '#8b0000' }}>
              Every Shade of Dark
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {VOID_NOIR_GENRES.map((sg, i) => (
                <motion.div
                  key={sg.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 py-3 group"
                  style={{ borderBottom: '1px solid rgba(139,0,0,0.06)' }}
                >
                  <span className="mt-1 text-xs transition-colors duration-300 group-hover:scale-110"
                    style={{ color: '#8b0000' }}>◆</span>
                  <div>
                    <span className="text-sm font-medium transition-colors duration-300"
                      style={{ color: '#f5f5dc', opacity: 0.8 }}>{sg.name}</span>
                    {sg.description && (
                      <p className="text-xs mt-0.5" style={{ color: '#4a4a4a' }}>{sg.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Blood divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 10%, #8b0000 50%, transparent 90%)', opacity: 0.3 }} />

        {/* ═══ IS / IS NOT ═══ */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 rounded-2xl overflow-hidden border"
            style={{ borderColor: 'rgba(139,0,0,0.12)' }}>

            {/* IS */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="p-8 md:p-10 relative"
              style={{ background: 'linear-gradient(135deg, rgba(139,0,0,0.08) 0%, rgba(139,0,0,0.03) 100%)' }}
            >
              <div className="absolute top-0 right-0 text-[120px] font-display leading-none select-none pointer-events-none"
                style={{ color: 'rgba(139,0,0,0.04)' }}>✦</div>
              <Eye className="w-6 h-6 mb-4" style={{ color: '#8b0000' }} />
              <h3 className="font-display text-xs uppercase tracking-[0.4em] mb-6" style={{ color: '#8b0000' }}>
                Void Noir Is
              </h3>
              <ul className="space-y-3">
                {VOID_NOIR_IS.map((item, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 text-sm" style={{ color: 'rgba(245,245,220,0.7)' }}>
                    <span style={{ color: '#8b0000' }} className="mt-0.5">✦</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* IS NOT */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="p-8 md:p-10 border-t md:border-t-0 md:border-l relative"
              style={{ borderColor: 'rgba(139,0,0,0.1)', background: 'rgba(255,255,255,0.01)' }}
            >
              <div className="absolute top-0 right-0 text-[120px] font-display leading-none select-none pointer-events-none"
                style={{ color: 'rgba(74,74,74,0.04)' }}>✕</div>
              <EyeOff className="w-6 h-6 mb-4" style={{ color: '#4a4a4a' }} />
              <h3 className="font-display text-xs uppercase tracking-[0.4em] mb-6" style={{ color: '#4a4a4a' }}>
                Void Noir Is Not
              </h3>
              <ul className="space-y-3">
                {VOID_NOIR_IS_NOT.map((item, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 text-sm" style={{ color: '#4a4a4a' }}>
                    <span className="mt-0.5">✕</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* ═══ THE VOICE — DRAMATIC QUOTE ═══ */}
        <div className="relative py-32 overflow-hidden">
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(139,0,0,0.06) 0%, transparent 60%)' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="max-w-3xl mx-auto px-6 text-center relative"
          >
            <div className="text-6xl mb-6" style={{ color: 'rgba(139,0,0,0.2)' }}>"</div>
            <p className="font-body text-xl md:text-2xl leading-relaxed"
              style={{ color: 'rgba(245,245,220,0.5)' }}>
              You've been afraid of the dark
              <br />your whole life.
            </p>
            <p className="font-heading text-2xl md:text-3xl mt-6 font-semibold"
              style={{ color: '#8b0000', textShadow: '0 0 30px rgba(139,0,0,0.2)' }}>
              Time to find out why.
            </p>
            <div className="text-6xl mt-6 rotate-180" style={{ color: 'rgba(139,0,0,0.2)' }}>"</div>
          </motion.div>
        </div>

        {/* Blood divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 10%, #8b0000 50%, transparent 90%)', opacity: 0.3 }} />

        {/* ═══ THE FAMILY ═══ */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <h2 className="font-display text-xs uppercase tracking-[0.4em] mb-2" style={{ color: '#4a4a4a' }}>
              One Pipeline
            </h2>
            <h3 className="font-heading text-3xl md:text-4xl mb-12" style={{ color: '#f5f5dc', opacity: 0.8 }}>
              Three Imprints
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/for-authors" className="p-5 rounded-xl border transition-all duration-300 hover:border-[#C6A92B]/40 group"
                style={{ borderColor: 'rgba(198,169,43,0.15)', background: 'rgba(198,169,43,0.03)' }}>
                <span className="text-xl">✦</span>
                <h4 className="text-sm font-semibold mt-2 transition-colors" style={{ color: '#C6A92B' }}>Rüna Atlas Press</h4>
                <p className="text-[10px] mt-1" style={{ color: '#4a4a4a' }}>BIPOC/Queer speculative fiction</p>
                <p className="text-[10px] italic mt-0.5" style={{ color: 'rgba(198,169,43,0.5)' }}>Cosmic · Hopeful</p>
              </Link>

              <div className="p-5 rounded-xl border relative"
                style={{ borderColor: 'rgba(139,0,0,0.3)', background: 'linear-gradient(135deg, rgba(139,0,0,0.08), rgba(45,31,61,0.06))' }}>
                <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 30px rgba(139,0,0,0.05)' }} />
                <span className="text-xl relative">🌑</span>
                <h4 className="text-sm font-semibold mt-2 relative" style={{ color: '#8b0000' }}>Void Noir</h4>
                <p className="text-[10px] mt-1 relative" style={{ color: '#4a4a4a' }}>Horror & dark fiction</p>
                <p className="text-[10px] italic mt-0.5 relative" style={{ color: 'rgba(139,0,0,0.6)' }}>Dread · Literary</p>
                <div className="absolute top-2 right-2 text-[8px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(139,0,0,0.15)', color: '#8b0000' }}>You are here</div>
              </div>

              <Link to="/imprints/bohio" className="p-5 rounded-xl border transition-all duration-300 hover:border-orange-400/40 group"
                style={{ borderColor: 'rgba(249,115,22,0.15)', background: 'rgba(249,115,22,0.03)' }}>
                <span className="text-xl">☀</span>
                <h4 className="text-sm font-semibold mt-2 transition-colors text-orange-400">Bohío Press</h4>
                <p className="text-[10px] mt-1" style={{ color: '#4a4a4a' }}>Puerto Rican authors</p>
                <p className="text-[10px] italic mt-0.5 text-orange-400/50">Warm · Rooted</p>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ═══ CTA — SUBMIT ═══ */}
        <div className="relative py-32">
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(139,0,0,0.06), transparent)' }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center relative px-6"
          >
            <h3 className="font-display text-xs uppercase tracking-[0.4em] mb-3" style={{ color: '#4a4a4a' }}>
              Ready?
            </h3>
            <h2 className="font-heading text-3xl md:text-4xl mb-6" style={{ color: '#8b0000' }}>
              Fear, finally told by us.
            </h2>
            <p className="text-sm max-w-md mx-auto mb-10" style={{ color: 'rgba(245,245,220,0.4)' }}>
              Submit your horror, dark fiction, or gothic work.
              <br />One portal. All three imprints.
            </p>
            <Link to="/submissions"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-lg font-ui font-semibold uppercase tracking-[0.2em] text-sm transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, #8b0000, #5c0000)',
                color: '#f5f5dc',
                boxShadow: '0 0 30px rgba(139,0,0,0.2)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(139,0,0,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(139,0,0,0.2)';
              }}
            >
              <Feather className="w-5 h-5" />
              Submit to Void Noir
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
