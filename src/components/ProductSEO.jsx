import { Helmet } from 'react-helmet-async';

/**
 * Injects:
 *  - <title> and <meta description>
 *  - Open Graph + Twitter cards (so WhatsApp/FB previews look real)
 *  - schema.org Product JSON-LD (Google Shopping eligibility)
 */
export default function ProductSEO({ product }) {
  if (!product) return null;

  const title = `${product.name} Price in Bangladesh - Damkemon`;
  const description = (product.description || `Compare ${product.name} prices across Bangladesh shops. Lowest price is ৳${product.lowestPrice}.`).slice(0, 240);
  const apiBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
    : (typeof window !== 'undefined' ? window.location.origin : '');
  const image = product.id
    ? `${apiBase}/api/og/product/${product.id}.png`
    : (product.imageUrl || '');
  const url = typeof window !== 'undefined' ? window.location.href : '';

  // JSON-LD
  const ld = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl ? [product.imageUrl] : undefined,
    description: product.description || undefined,
    offers: (product.prices || []).map((p) => ({
      '@type': 'Offer',
      url: p.productUrl,
      priceCurrency: p.currency || 'BDT',
      price: p.price,
      availability: p.inStock === false
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: p.siteName },
    })),
  };
  
  if (product.averageRating > 0 && product.totalReviews > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.totalReviews,
    };
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="product" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <script type="application/ld+json">
        {JSON.stringify(ld)}
      </script>
    </Helmet>
  );
}
