import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageSEOOptions {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SITE_NAME = 'RÜNA ATLAS PRESS';
const BASE_URL = 'https://runaatlas.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * usePageSEO — dynamically updates document metadata per route.
 * Call this hook in every page component for unique SEO per page.
 *
 * Usage:
 *   usePageSEO({
 *     title: 'Our Catalog',
 *     description: 'Browse our collection of speculative fiction...'
 *   });
 */
export function usePageSEO({ title, description, ogImage, ogType, noIndex }: PageSEOOptions) {
  const location = useLocation();
  const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${location.pathname}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to set/create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Primary meta
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', ogType || 'website');

    // Twitter Card
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = `${SITE_NAME} — Speculative Fiction from Marginalized Voices`;
    };
  }, [fullTitle, description, canonicalUrl, image, ogType, noIndex]);
}

export default usePageSEO;
