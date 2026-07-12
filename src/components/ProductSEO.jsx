import { Helmet } from 'react-helmet-async';

/**
 * Injects:
 *  - <title> and <meta description>
 *  - Open Graph + Twitter cards (so WhatsApp/FB previews look real)
 *  - schema.org Product JSON-LD (Google Shopping eligibility)
 */
export default function ProductSEO({ product }) {
  if (!product) return null;

  // Price in the title = the CTR lever on "<name> price in bangladesh" SERPs.
  const fromPrice = product.lowestPrice != null
    ? ` — from ৳${Number(product.lowestPrice).toLocaleString('en-IN')}`
    : '';
  const title = `${product.name} Price in Bangladesh${fromPrice} - Damkemon`;
  const description = (product.description || `Compare ${product.name} prices across Bangladesh shops. Lowest price is ৳${product.lowestPrice}.`).slice(0, 240);
  const apiBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
    : (typeof window !== 'undefined' ? window.location.origin : '');
  const image = product.id
    ? `${apiBase}/api/og/product/${product.id}.png`
    : (product.imageUrl || '');
  const url = typeof window !== 'undefined' ? window.location.href : '';

  // JSON-LD. AggregateOffer (not per-seller offers): the visible offer list is
  // capped for signed-out visitors — and Googlebot browses signed out — so
  // per-seller markup would drift from the page. lowPrice/highPrice/offerCount
  // are index-time fields, true in both the gated and the full view.
  const offerCount = product.totalSellerCount ?? (product.prices || []).length;
  const ld = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl ? [product.imageUrl] : undefined,
    description: product.description || undefined,
    offers: product.lowestPrice != null ? {
      '@type': 'AggregateOffer',
      priceCurrency: 'BDT',
      lowPrice: product.lowestPrice,
      highPrice: product.highestPrice ?? product.lowestPrice,
      offerCount: offerCount || undefined,
    } : undefined,
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
