/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Star, Store, TrendingDown } from 'lucide-react';
import { CategoryIcon } from '../lib/categoryIcon';

function formatPrice(price) {
  if (price == null) return 'Price unavailable';
  return `৳${Number(price).toLocaleString('en-IN')}`;
}

export default function HomeProductCard({ item, trust = {}, className = '' }) {
  const offers = Array.isArray(item.offers)
    ? [...item.offers]
        .filter((offer) => Number.isFinite(Number(offer.price)))
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(1, 3)
    : [];
  const sellerCount = item.sellers || offers.length;
  const previewOffer = offers[0];
  const previewTrust = previewOffer ? trust[previewOffer.siteSlug || previewOffer.siteName] : null;
  const href = `/product/${item.id || item.slug}`;

  return (
    <article
      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-black/[0.06] bg-[#F7F5EF] text-ink shadow-[0_16px_45px_-28px_rgba(21,19,26,0.4)] transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-acid/60 hover:shadow-[0_26px_60px_-28px_rgba(21,19,26,0.65)] focus-within:ring-2 focus-within:ring-acid focus-within:ring-offset-4 focus-within:ring-offset-cream motion-reduce:transition-none ${className}`}
    >
      <Link
        to={href}
        state={item.product ? { product: item.product } : undefined}
        aria-label={`${item.name}, ${formatPrice(item.price)}${sellerCount ? `, compare ${sellerCount} sellers` : ''}`}
        className="flex h-full flex-col focus-visible:outline-none"
      >
        <div className="relative aspect-[5/4] overflow-hidden bg-[#E9E7E2]">
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon category={item.category} className="h-14 w-14 text-black/10" />
        </div>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="relative h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        )}

        {item.pct > 0 && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-red px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white shadow-lg shadow-red/20 sm:left-4 sm:top-4 sm:text-[11px]">
            <TrendingDown className="h-3 w-3" /> {Math.round(item.pct)}% off
          </span>
        )}

        {sellerCount > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-black/55 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-md sm:right-4 sm:top-4">
            <Store className="h-3 w-3" /> {sellerCount} {sellerCount === 1 ? 'seller' : 'sellers'}
          </span>
        )}
        </div>

        <div className="relative z-10 flex flex-1 flex-col bg-[#F7F5EF] p-4 sm:p-5">
        <div className="mb-2.5 flex min-h-5 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/50">
          {item.category && <span className="truncate">{item.category}</span>}
          {item.rating > 0 && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-ink/70">
              <Star className="h-3 w-3 fill-acid text-acid" />
              {Number(item.rating).toFixed(1)}
              {item.reviews > 0 && <span className="text-ink/40">({item.reviews})</span>}
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-[16px] font-extrabold leading-[1.25] tracking-[-0.015em] text-ink sm:text-[18px]">
          {item.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <span className="text-xl font-extrabold tracking-[-0.03em] text-ink sm:text-2xl">
            {formatPrice(item.price)}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-acid">
            Details <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
        </div>
      </Link>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 flex translate-y-8 scale-[0.98] flex-col bg-[#101010]/[0.98] p-5 opacity-0 backdrop-blur-xl transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-acid to-transparent" />
        <Link
          to={href}
          state={item.product ? { product: item.product } : undefined}
          tabIndex={-1}
          aria-label={`Open ${item.name}`}
          className="absolute inset-0 z-0 hidden md:block"
        />
        <div className="pointer-events-none relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-acid">
            {offers.length ? 'Live price comparison' : 'Deal details'}
          </span>
          <h4 className="mt-1 text-xl font-extrabold tracking-tight text-white">
            {offers.length ? 'Choose your seller' : 'Why this price stands out'}
          </h4>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">{item.name}</p>
        </div>

        {offers.length ? (
          <div className="pointer-events-none relative z-10 mt-4 space-y-2">
            {offers.map((offer, index) => {
              const seller = offer.sellerName || offer.siteName || 'Unknown seller';
              return (
                <div
                  key={`${offer.sellerId || offer.siteSlug || offer.siteName}-${index}`}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/65">
                    <Store className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-extrabold text-white">{seller}</span>
                    <span className="block truncate text-[9px] font-semibold uppercase tracking-wider text-white/40">
                      {offer.sellerName && offer.siteName ? `via ${offer.siteName}` : 'Preview seller'}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-extrabold text-white">{formatPrice(offer.price)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pointer-events-none relative z-10 mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-white/40">Current price</span>
              <span className="mt-1 block text-base font-extrabold text-white">{formatPrice(item.price)}</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-white/40">Tracked across</span>
              <span className="mt-1 block text-base font-extrabold text-white">{sellerCount || 'Live'} {sellerCount ? 'sellers' : ''}</span>
            </div>
            <p className="col-span-2 mt-1 text-xs leading-relaxed text-white/50">
              Open the product to see the latest seller, trust, delivery and price-history details.
            </p>
          </div>
        )}

        <div className="pointer-events-none relative z-10 mt-auto pt-4">
          {previewTrust?.trustScore != null && (
            <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-white/55">
              <ShieldCheck className="h-3.5 w-3.5 text-acid" />
              Preview seller trust score: {previewTrust.trustScore}/100
            </div>
          )}
          <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-acid px-2.5 py-3 text-center text-[10px] font-extrabold uppercase leading-tight tracking-[0.06em] text-ink shadow-[0_10px_30px_-12px_rgba(159,226,49,0.75)]">
            {sellerCount > 1 ? `Compare ${sellerCount} sellers` : 'View product details'}
            <ArrowRight className="h-4 w-4 shrink-0" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function HomeProductCardSkeleton({ className = '' }) {
  return (
    <div className={`h-full overflow-hidden rounded-[1.5rem] border border-black/[0.06] bg-[#F7F5EF] ${className}`}>
      <div className="aspect-[5/4] animate-pulse bg-black/[0.06]" />
      <div className="space-y-3 p-5">
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-black/[0.06]" />
        <div className="h-5 animate-pulse rounded bg-black/[0.06]" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-black/[0.06]" />
        <div className="h-7 w-1/2 animate-pulse rounded bg-black/[0.06] pt-4" />
      </div>
    </div>
  );
}
