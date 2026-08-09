import { useEffect } from 'react';

/**
 * Per-guide SEO. Mirrors ProductSEO: mutates document.head with
 *  - <title>, <meta description>, <link canonical>
 *  - Open Graph + Twitter cards
 *  - JSON-LD: Article + BreadcrumbList + (optional) FAQPage
 * and cleanly restores everything on unmount so the next route starts fresh.
 *
 * Client-side injection is enough for modern crawlers (Googlebot renders JS),
 * and it matches the pattern already used for product pages.
 */
export default function GuideSEO({ guide }) {
  useEffect(() => {
    if (!guide) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/guides/${guide.slug}`;
    const title = guide.metaTitle || `${guide.title} — Damkemon`;
    const description = (guide.metaDescription || guide.dek || '').slice(0, 300);

    const prevTitle = document.title;
    document.title = title;

    // ---- meta tags ----
    const metas = [
      { name: 'description', content: description },
      { name: 'keywords', content: (guide.keywords || []).join(', ') },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: 'Damkemon' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ];

    const created = [];
    for (const t of metas) {
      const key = t.name ? 'name' : 'property';
      const val = t.name || t.property;
      let el = document.head.querySelector(`meta[${key}="${val}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(key, val);
        document.head.appendChild(el);
        created.push(el);
      } else {
        // remember & restore prior content so we don't clobber the home meta
        el.setAttribute('data-prev', el.getAttribute('content') || '');
        created.push(el);
      }
      el.setAttribute('content', t.content);
    }

    // ---- canonical ----
    let canonical = document.head.querySelector('link[rel="canonical"]');
    let canonicalCreated = false;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
      canonicalCreated = true;
    }
    const prevCanonical = canonical.getAttribute('href');
    canonical.setAttribute('href', url);

    // ---- JSON-LD blocks ----
    const article = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.metaDescription || guide.dek,
      inLanguage: 'en',
      datePublished: guide.datePublished,
      dateModified: guide.dateModified || guide.datePublished,
      keywords: (guide.keywords || []).join(', '),
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: { '@type': 'Organization', name: 'Damkemon' },
      publisher: { '@type': 'Organization', name: 'Damkemon' },
    };

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${origin}/guides` },
        { '@type': 'ListItem', position: 3, name: guide.title, item: url },
      ],
    };

    const blocks = [article, breadcrumb];

    if (Array.isArray(guide.faqs) && guide.faqs.length) {
      blocks.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: guide.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
    }

    const scripts = blocks.map((b) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-guide-seo', '');
      s.text = JSON.stringify(b);
      document.head.appendChild(s);
      return s;
    });

    return () => {
      document.title = prevTitle;
      created.forEach((el) => {
        const prev = el.getAttribute('data-prev');
        if (prev !== null) {
          el.setAttribute('content', prev);
          el.removeAttribute('data-prev');
        } else {
          el.remove();
        }
      });
      if (canonicalCreated) canonical.remove();
      else if (prevCanonical != null) canonical.setAttribute('href', prevCanonical);
      scripts.forEach((s) => s.remove());
    };
  }, [guide]);

  return null;
}
