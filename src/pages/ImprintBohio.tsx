import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Sun, Waves, Heart,
  Flame, Globe, Users, Feather, Star, Sparkles
} from 'lucide-react';
import { BOHIO_GENRES } from '../data/genreData';
import { usePageSEO } from '../hooks/usePageSEO';

// ═══════════════════════════════════════════════════════════════
// BOHÍO PRESS — IMPRINT LANDING PAGE
// ═══════════════════════════════════════════════════════════════
// Pa'l mundo desde Borinquen
// Terracotta #C2410C · Ocean Blue #0EA5E9 · Palm Green #16A34A
// Sunset Gold #F59E0B · Warm Sand #D4A574
// ═══════════════════════════════════════════════════════════════

const EXCITES_US = [
  'Magical realism rooted in actual PR experience',
  'Taíno mythology reclaimed by Boricua writers',
  'Diaspora stories that aren\'t just trauma',
  'Afro-Boricua protagonists, front and center',
  'Hurricane narratives with agency, not just suffering',
  'Queer Boricua joy and complexity',
  'Small-town PR (not just San Juan)',
  'Code-switching that sings',
  'Found family that feels like real familia',
  'Political without being polemic',
  'Funny, because we\'re funny',
];

const TIRED_OF = [
  'PR as backdrop for non-PR protagonists',
  'Trauma without hope or agency',
  'Hurricane María as disaster porn',
  'Taíno mythology without Taíno descendants',
  'Erasing Blackness in Puerto Rico',
  '"Exotic island" flattening',
  'Explaining every Spanish word',
  'Poverty as aesthetic',
];

const WHO_CAN_SUBMIT = [
  { label: 'Island-born', desc: 'Born and/or raised on the island', icon: Sun },
  { label: 'Diaspora-born', desc: 'Nuyorican, Orlando, Chicago, and beyond', icon: Globe },
  { label: 'Heritage', desc: 'One or more PR parents or grandparents', icon: Heart },
  { label: 'Self-identified', desc: 'You know who you are. We trust you.', icon: Star },
];

// Floating firefly particles for tropical ambiance
function Firefly({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        background: `radial-gradient(circle, rgba(245,158,11,${0.3 + Math.random() * 0.3}), transparent)`,
        filter: 'blur(0.5px)',
      }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{
        y: '-10vh',
        opacity: [0, 0.8, 0.3, 0.7, 0],
        x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, 0],
      }}
      transition={{ duration: 14 + Math.random() * 10, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export default function ImprintBohio() {
  usePageSEO({
    title: 'Bohío Press',
    description: 'Bohío Press — Pa\'l mundo desde Borinquen. The Puerto Rican imprint of RÜNA ATLAS PRESS publishing Boricua speculative fiction, magical realism, and diaspora stories.',
  });
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.03]);
  const imgY = useTransform(scrollYProgress, [0, 0.3], [0, 60]);

  return (
    <div className="min-h-screen text-white relative overflow-hidden"
      style={{ background: '#0c0a08' }}>

      {/* ── Ambient Fireflies ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <Firefly key={i} delay={i * 1.4} x={3 + (i * 6.5) % 92} size={2 + Math.random() * 4} />
        ))}
      </div>

      {/* ═══ HERO ═══ */}
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[100vh] flex items-center justify-center z-20">

        {/* Hero image background */}
        <motion.div className="absolute inset-0" style={{ y: imgY }}>
          <img src="/images/imprints/bohio-hero.png" alt=""
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.45, filter: 'saturate(1.1) brightness(0.6)' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(12,10,8,0.3) 0%, rgba(12,10,8,0.85) 75%, #0c0a08 100%)' }} />
        </motion.div>

        {/* Warm radial bleeds */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 40% 70%, rgba(194,65,12,0.1) 0%, transparent 60%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(14,165,233,0.06) 0%, transparent 50%)' }} />

        <div className="text-center px-6 max-w-4xl relative">


          {/* Title */}
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.3 }} className="mb-6">
            <span className="font-display text-6xl md:text-8xl lg:text-9xl tracking-[0.2em] uppercase block"
              style={{ color: '#F97316', textShadow: '0 0 40px rgba(249,115,22,0.2)' }}>
              Bohío
            </span>
            <span className="font-display text-5xl md:text-7xl lg:text-8xl tracking-[0.4em] uppercase block mt-[-0.1em]"
              style={{ color: '#0EA5E9', textShadow: '0 0 20px rgba(14,165,233,0.15)' }}>
              Press
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 1 }}
            className="font-heading text-xl md:text-2xl italic mb-4"
            style={{ color: '#F59E0B' }}>
            "Home is the story we carry"
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }}
            className="font-ui text-[11px] uppercase tracking-[0.5em]"
            style={{ color: 'rgba(249,115,22,0.5)' }}>
            Pa'l mundo desde Borinquen
          </motion.p>

          {/* Scroll indicator */}
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="mt-16">
            <div className="w-px h-16 mx-auto" style={{ background: 'linear-gradient(to bottom, rgba(249,115,22,0.4), transparent)' }} />
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="relative z-20">

        {/* ── Manifesto ── */}
        <div className="max-w-3xl mx-auto px-6 py-28">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.5 }}>
            <p className="font-body text-lg md:text-xl leading-[2] tracking-wide"
              style={{ color: 'rgba(245,158,11,0.7)' }}>
              The bohío was the Taíno home — circular, thatched, communal.
            </p>
            <p className="font-body text-lg md:text-xl leading-[2] tracking-wide mt-4"
              style={{ color: 'rgba(212,165,116,0.6)' }}>
              It represents shelter, ancestry, survival, and home even in displacement.
            </p>
            <p className="font-body text-lg md:text-xl leading-[2] tracking-wide mt-8"
              style={{ color: 'rgba(212,165,116,0.5)' }}>
              Bohío Press carries that spirit: stories rooted in la isla,
              <br />written by Boricuas for everyone,
              <br />but <span style={{ color: '#F97316' }}>unapologetically from us.</span>
            </p>
          </motion.div>
        </div>

        {/* Warm divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 10%, #F97316 50%, transparent 90%)', opacity: 0.3 }} />

        {/* ── WHO CAN SUBMIT ── */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <h2 className="font-display text-xs uppercase tracking-[0.4em] mb-2" style={{ color: 'rgba(212,165,116,0.4)' }}>
              Who We Seek
            </h2>
            <h3 className="font-heading text-3xl md:text-4xl mb-12" style={{ color: '#F97316' }}>
              Boricua Authors
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {WHO_CAN_SUBMIT.map((item, i) => (
                <motion.div key={item.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl border text-center transition-all duration-300 hover:border-orange-400/30"
                  style={{ borderColor: 'rgba(249,115,22,0.12)', background: 'rgba(249,115,22,0.03)' }}>
                  <item.icon className="w-6 h-6 mx-auto mb-3" style={{ color: '#F97316' }} />
                  <h4 className="text-sm font-semibold mb-1" style={{ color: '#F59E0B' }}>{item.label}</h4>
                  <p className="text-[10px]" style={{ color: 'rgba(212,165,116,0.5)' }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Warm divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 10%, #F97316 50%, transparent 90%)', opacity: 0.2 }} />

        {/* ── LANGUAGE POLICY ── */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="md:col-span-3 p-8 rounded-2xl border"
              style={{ borderColor: 'rgba(14,165,233,0.15)', background: 'rgba(14,165,233,0.03)' }}>
              <h2 className="font-display text-xs uppercase tracking-[0.4em] mb-2" style={{ color: 'rgba(14,165,233,0.4)' }}>
                Language
              </h2>
              <h3 className="font-heading text-2xl md:text-3xl mb-6" style={{ color: '#0EA5E9' }}>
                Spanglish Is Standard
              </h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(212,165,116,0.6)' }}>
                No italics for Spanish. No glossaries. No apologies.
              </p>
              <ul className="space-y-3">
                {[
                  'Full English with Spanish woven in',
                  'Full Spanish (we\'ll publish in Spanish)',
                  'Code-switching throughout',
                  'Author\'s choice — we don\'t police language',
                ].map((item, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-sm" style={{ color: 'rgba(14,165,233,0.7)' }}>
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-none" style={{ color: '#0EA5E9' }} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="md:col-span-2">
              <img src="/images/imprints/bohio-coqui.png" alt="Coquí — Puerto Rico's iconic tree frog"
                className="w-full rounded-2xl shadow-2xl"
                style={{ filter: 'saturate(1.05)', boxShadow: '0 25px 60px rgba(249,115,22,0.1)' }} />
              <p className="text-center text-[10px] mt-3 italic" style={{ color: 'rgba(212,165,116,0.3)' }}>
                Where the coquí sings in every genre
              </p>
            </motion.div>
          </div>
        </div>

        {/* Warm divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 10%, #F97316 50%, transparent 90%)', opacity: 0.2 }} />

        {/* ── GENRES ── */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <h2 className="font-display text-xs uppercase tracking-[0.4em] mb-2" style={{ color: 'rgba(212,165,116,0.4)' }}>
              Our Genres
            </h2>
            <h3 className="font-heading text-3xl md:text-4xl mb-12" style={{ color: '#F97316' }}>
              Stories Rooted in La Isla
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {BOHIO_GENRES.map((sg, i) => (
                <motion.div key={sg.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 py-3 group"
                  style={{ borderBottom: '1px solid rgba(249,115,22,0.06)' }}>
                  <Sun className="w-4 h-4 mt-0.5 flex-none" style={{ color: '#F59E0B' }} />
                  <div>
                    <span className="text-sm font-medium" style={{ color: 'rgba(249,115,22,0.8)' }}>{sg.name}</span>
                    {sg.description && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(212,165,116,0.4)' }}>{sg.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Warm divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 10%, #F97316 50%, transparent 90%)', opacity: 0.2 }} />

        {/* ── EXCITES / TIRED OF ── */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border"
            style={{ borderColor: 'rgba(249,115,22,0.12)' }}>

            {/* EXCITES US */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="p-8 md:p-10 relative"
              style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(249,115,22,0.04) 100%)' }}>
              <div className="absolute top-0 right-0 text-[100px] font-display leading-none select-none pointer-events-none"
                style={{ color: 'rgba(22,163,74,0.04)' }}>♥</div>
              <Heart className="w-6 h-6 mb-4" style={{ color: '#16A34A' }} />
              <h3 className="font-display text-xs uppercase tracking-[0.4em] mb-6" style={{ color: '#16A34A' }}>
                What Excites Us
              </h3>
              <ul className="space-y-2.5">
                {EXCITES_US.map((item, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 text-sm" style={{ color: 'rgba(212,165,116,0.7)' }}>
                    <Sparkles className="w-3 h-3 mt-0.5 flex-none" style={{ color: '#16A34A' }} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* TIRED OF */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="p-8 md:p-10 border-t md:border-t-0 md:border-l relative"
              style={{ borderColor: 'rgba(249,115,22,0.08)', background: 'rgba(194,65,12,0.02)' }}>
              <div className="absolute top-0 right-0 text-[100px] font-display leading-none select-none pointer-events-none"
                style={{ color: 'rgba(194,65,12,0.04)' }}>✕</div>
              <Flame className="w-6 h-6 mb-4" style={{ color: '#DC2626' }} />
              <h3 className="font-display text-xs uppercase tracking-[0.4em] mb-6" style={{ color: '#DC2626' }}>
                What We're Tired Of
              </h3>
              <ul className="space-y-2.5">
                {TIRED_OF.map((item, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 text-sm" style={{ color: 'rgba(194,65,12,0.5)' }}>
                    <span className="mt-0.5">✕</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* ── PULL QUOTE ── */}
        <div className="relative py-28 overflow-hidden">
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.05) 0%, transparent 60%)' }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 1.2 }}
            className="max-w-3xl mx-auto px-6 text-center relative">
            <div className="text-6xl mb-4" style={{ color: 'rgba(249,115,22,0.2)' }}>"</div>
            <p className="font-body text-xl md:text-2xl leading-relaxed" style={{ color: 'rgba(212,165,116,0.5)' }}>
              We don't translate. We don't italicize.
              <br />And we don't explain.
            </p>
            <p className="font-heading text-2xl md:text-3xl mt-6 font-semibold"
              style={{ color: '#F97316', textShadow: '0 0 30px rgba(249,115,22,0.15)' }}>
              Pa'l mundo desde Borinquen.
            </p>
            <div className="text-6xl mt-4 rotate-180" style={{ color: 'rgba(249,115,22,0.2)' }}>"</div>
          </motion.div>
        </div>

        {/* Warm divider */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 10%, #F97316 50%, transparent 90%)', opacity: 0.2 }} />

        {/* ── CROSSOVER SECTION ── */}
        <div className="max-w-5xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <h2 className="font-display text-xs uppercase tracking-[0.4em] mb-2" style={{ color: 'rgba(212,165,116,0.4)' }}>
              One Pipeline
            </h2>
            <h3 className="font-heading text-3xl md:text-4xl mb-12" style={{ color: 'rgba(212,165,116,0.7)' }}>
              Three Imprints
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/for-authors" className="p-5 rounded-xl border transition-all duration-300 hover:border-[#C6A92B]/40 group"
                style={{ borderColor: 'rgba(198,169,43,0.15)', background: 'rgba(198,169,43,0.03)' }}>
                <span className="text-xl">✦</span>
                <h4 className="text-sm font-semibold mt-2" style={{ color: '#C6A92B' }}>Rüna Atlas Press</h4>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(212,165,116,0.4)' }}>BIPOC/Queer speculative fiction</p>
                <p className="text-[10px] italic mt-0.5" style={{ color: 'rgba(198,169,43,0.5)' }}>Cosmic · Hopeful</p>
              </Link>

              <div className="p-5 rounded-xl border relative"
                style={{ borderColor: 'rgba(249,115,22,0.3)', background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(14,165,233,0.04))' }}>
                <div className="absolute inset-0 rounded-xl" style={{ boxShadow: 'inset 0 0 30px rgba(249,115,22,0.05)' }} />
                <span className="text-xl relative">☀</span>
                <h4 className="text-sm font-semibold mt-2 relative" style={{ color: '#F97316' }}>Bohío Press</h4>
                <p className="text-[10px] mt-1 relative" style={{ color: 'rgba(212,165,116,0.4)' }}>Puerto Rican authors</p>
                <p className="text-[10px] italic mt-0.5 relative" style={{ color: 'rgba(249,115,22,0.6)' }}>Warm · Rooted</p>
                <div className="absolute top-2 right-2 text-[8px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316' }}>You are here</div>
              </div>

              <Link to="/imprints/void-noir" className="p-5 rounded-xl border transition-all duration-300 hover:border-red-500/40 group"
                style={{ borderColor: 'rgba(139,0,0,0.15)', background: 'rgba(139,0,0,0.03)' }}>
                <span className="text-xl">🌑</span>
                <h4 className="text-sm font-semibold mt-2 text-red-500">Void Noir</h4>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(212,165,116,0.4)' }}>Horror & dark fiction</p>
                <p className="text-[10px] italic mt-0.5 text-red-400/50">Dread · Literary</p>
              </Link>
            </div>

            {/* Crossover rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-5 rounded-xl border" style={{ borderColor: 'rgba(249,115,22,0.1)', background: 'rgba(249,115,22,0.02)' }}>
                <h4 className="text-xs font-semibold mb-3" style={{ color: '#F97316' }}>Bohío Press publishes when:</h4>
                <ul className="space-y-1.5 text-xs" style={{ color: 'rgba(212,165,116,0.5)' }}>
                  <li>• PR author writing a PR-rooted story</li>
                  <li>• PR identity central to the work</li>
                  <li>• Borikén setting, diaspora experience, or Taíno roots</li>
                </ul>
              </div>
              <div className="p-5 rounded-xl border" style={{ borderColor: 'rgba(198,169,43,0.1)', background: 'rgba(198,169,43,0.02)' }}>
                <h4 className="text-xs font-semibold mb-3" style={{ color: '#C6A92B' }}>Rüna Atlas publishes when:</h4>
                <ul className="space-y-1.5 text-xs" style={{ color: 'rgba(212,165,116,0.5)' }}>
                  <li>• PR author writing a non-PR story</li>
                  <li>• Story fits broader BIPOC/Queer spec-fic</li>
                  <li>• Author choice if ambiguous</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══ CTA ═══ */}
        <div className="relative py-32">
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(249,115,22,0.05), transparent)' }} />

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1 }} className="text-center relative px-6">
            <h3 className="font-display text-xs uppercase tracking-[0.4em] mb-3" style={{ color: 'rgba(212,165,116,0.4)' }}>
              ¿Listo?
            </h3>
            <h2 className="font-heading text-3xl md:text-4xl mb-6" style={{ color: '#F97316' }}>
              Submit once. Check the Bohío box.
              <br />We'll take it from there.
            </h2>
            <p className="text-sm max-w-md mx-auto mb-10" style={{ color: 'rgba(212,165,116,0.4)' }}>
              One portal. All three imprints.
              <br />Your story finds its home.
            </p>
            <Link to="/submissions"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-lg font-ui font-semibold uppercase tracking-[0.2em] text-sm transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, #F97316, #C2410C)',
                color: 'white',
                boxShadow: '0 0 30px rgba(249,115,22,0.2)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(249,115,22,0.4)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(249,115,22,0.2)'; }}>
              <Feather className="w-5 h-5" />
              Submit to Bohío Press
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
