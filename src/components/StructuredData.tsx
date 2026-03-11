import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'Book' | 'BreadcrumbList' | 'WebPage' | 'Event';
  data: Record<string, any>;
}

/**
 * StructuredData — injects JSON-LD into the document head.
 * Automatically cleans up on unmount.
 *
 * Usage:
 *   <StructuredData type="Book" data={{
 *     name: 'My Book Title',
 *     author: { '@type': 'Person', name: 'Author Name' },
 *     isbn: '978-...',
 *     bookFormat: 'Paperback',
 *   }} />
 */
export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [type, data]);

  return null;
}

// ─── Prebuilt Schema Helpers ────────────────────────────

export function BookSchema({ title, author, isbn, description, image, publisher, datePublished, genre, url }: {
  title: string;
  author: string;
  isbn?: string;
  description: string;
  image?: string;
  publisher?: string;
  datePublished?: string;
  genre?: string;
  url?: string;
}) {
  const data: Record<string, any> = {
    name: title,
    author: { '@type': 'Person', name: author },
    description,
    publisher: {
      '@type': 'Organization',
      name: publisher || 'RÜNA ATLAS PRESS',
      url: 'https://runaatlas.com',
    },
  };
  if (isbn) data.isbn = isbn;
  if (image) data.image = image;
  if (datePublished) data.datePublished = datePublished;
  if (genre) data.genre = genre;
  if (url) data.url = url;

  return <StructuredData type="Book" data={data} />;
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <StructuredData
      type="BreadcrumbList"
      data={{
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `https://runaatlas.com${item.url}`,
        })),
      }}
    />
  );
}

export function WebPageSchema({ name, description, url }: { name: string; description: string; url: string }) {
  return (
    <StructuredData
      type="WebPage"
      data={{
        name,
        description,
        url: `https://runaatlas.com${url}`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'RÜNA ATLAS PRESS',
          url: 'https://runaatlas.com',
        },
      }}
    />
  );
}

export default StructuredData;
