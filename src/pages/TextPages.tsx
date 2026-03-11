import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// ─── Reusable Firestore-connected legal page ─────────
function LegalPage({ pageKey, fallbackTitle, fallbackContent }: {
  pageKey: string; fallbackTitle: string; fallbackContent: string;
}) {
  const [title, setTitle] = useState(fallbackTitle);
  const [content, setContent] = useState(fallbackContent);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'legal_pages', pageKey), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.title) setTitle(data.title);
        if (data.content) setContent(data.content);
      }
    }, () => { /* use fallbacks */ });
    return () => unsub();
  }, [pageKey]);

  return (
    <div className="bg-void-black min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-display text-4xl text-text-primary uppercase tracking-widest mb-6">{title}</h1>
          <div
            className="prose prose-invert prose-p:font-body prose-headings:font-heading text-text-secondary
              prose-h2:text-text-primary prose-h2:font-heading prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
              prose-p:leading-relaxed prose-li:text-text-secondary prose-a:text-starforge-gold"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Minimal markdown → html ─────────
function markdownToHtml(md: string): string {
  if (!md) return '';
  // If content already looks like HTML, return as-is
  if (md.trim().startsWith('<')) return md;
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^(?!<[hul])(.*\S.*)$/gm, '<p>$1</p>')
    .replace(/\n{2,}/g, '');
}

// ─── Individual page exports ─────────
export function Privacy() {
  return <LegalPage
    pageKey="privacy"
    fallbackTitle="Privacy Policy"
    fallbackContent={`Last updated: October 2026

At Rüna Atlas Press, we take your privacy seriously. This policy describes how we collect, use, and handle your personal information.

## Information We Collect

We collect information you provide directly to us when you create an account, chart the stars with our newsletter, make a purchase, or contact us for support.

## How We Use Your Information

We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.`}
  />;
}

export function Terms() {
  return <LegalPage
    pageKey="terms"
    fallbackTitle="Terms of Service"
    fallbackContent={`Last updated: October 2026

Please read these terms carefully before using our services.

## Acceptance of Terms

By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations.

## Intellectual Property

All content published by Rüna Atlas Press, including text, graphics, logos, and images, is the property of Rüna Atlas Press or its authors and is protected by copyright laws.`}
  />;
}

export function Accessibility() {
  return <LegalPage
    pageKey="accessibility"
    fallbackTitle="Accessibility Statement"
    fallbackContent={`Rüna Atlas Press is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.

## Conformance Status

We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA.

## Feedback

We welcome your feedback on the accessibility of our website. Please let us know if you encounter accessibility barriers by contacting us through our Contact page.`}
  />;
}

export function Rights() {
  return <LegalPage
    pageKey="rights"
    fallbackTitle="Foreign Rights"
    fallbackContent={`Rüna Atlas Press actively licenses translation and territorial rights for our titles across the globe.

## Inquiries

For all foreign rights inquiries, including translation, audio, and film/TV rights, please contact our rights department at rights@runaatlas.com.

Please include the specific title(s) you are interested in and the territories or languages you represent.`}
  />;
}

export function Press() {
  return <LegalPage
    pageKey="press"
    fallbackTitle="Press Kit"
    fallbackContent={`Welcome to the Rüna Atlas Press media room. Here you will find resources for media professionals.

## Media Contacts

For review copies, author interviews, or general media inquiries, please contact press@runaatlas.com.

## Brand Assets

High-resolution logos, author photos, and book covers are available upon request.`}
  />;
}
