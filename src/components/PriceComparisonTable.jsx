import { useMemo, useState } from 'react';
import { ExternalLink, Star, Crown, Award, Info, ShieldCheck, Truck, Banknote } from 'lucide-react';
import { trackClick } from '../api/analytics';
import { affiliateUrl } from '../api/api';
import { tierOf, valueScore, deliveryText } from './TrustBadge';

function formatPrice(price) {
  if (!price && price !== 0) return 'N/A';
  return '৳' + Number(price).toLocaleString('en-IN');
}

function fmtSold(n) {
  if (!n) return null;
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return String(n);
}

const sellerBadges = {
  Daraz: { label: 'Mall', color: 'bg-red text-white' },
  Startech: { label: 'Official', color: 'bg-ink text-cream' },
  'Ryans Computers': { label: 'Official', color: 'bg-ink text-cream' },
  Chaldal: { label: 'Mall', color: 'bg-green text-white' },
  Pickaboo: { label: 'Official', color: 'bg-ink text-cream' },
  Rokomari: { label: 'Mall', color: 'bg-green text-white' },
};

function isFacebookSeller(name) {
  return name?.toLowerCase().includes('facebook') || name?.toLowerCase().includes('fb');
}

const slugOf = (it) => it.siteSlug || it.siteName;
const offerKey = (it, i) => it.productUrl || `${slugOf(it)}#${it.sellerId || i}`;

/** A small, consistent signal chip so every seller card reads the same way. */
function Signal({ Icon, tone, children, title, dark }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-mono font-medium ${
        dark ? 'bg-cream/10' : 'bg-cream-soft'
      } ${tone || (dark ? 'text-cream/85' : 'text-gray')}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}

/**
 * Per-seller comparison as a responsive card GRID — sellers tile across the
 * width (3-up desktop / 2-up tablet / 1-up mobile) instead of one tall column,
 * so a product with many sellers stays compact and scannable.
 *
 * Readability-first: every card uses the SAME white canvas and the SAME signal
 * row, so the eye compares like-with-like. Colour is reserved for meaning — the
 * #1 pick (cheapest or best-value, per the toggle) is the only card lifted onto
 * the forest-green surface, and price deltas vs the lowest are spelled out so
 * the trade-off is explicit rather than something the buyer has to compute.
 *
 *  - For a marketplace sub-seller (e.g. a Daraz storefront) we show that
 *    SELLER's own reputation (`sellerTrust`, computed from real scraped ratings
 *    + sales) plus this listing's rating and units sold.
 *  - For a first-party shop we show the shop's trust score, delivery and COD.
 */
export default function PriceComparisonTable({ prices = [], productId, trust = {}, sellerTrust = {} }) {
  const [sortMode, setSortMode] = useState('price'); // 'price' | 'value'

  // Defensive de-dup: the same seller/offer must never appear twice in one
  // comparison set (item 1). Identity = the offer URL, else siteSlug+seller+price.
  const offers = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const it of (prices || [])) {
      const key = it.productUrl
        ? `u:${it.productUrl}`
        : `s:${(it.siteSlug || it.siteName || '').toLowerCase()}|${it.sellerId || ''}|${it.price ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out;
  }, [prices]);

  const lowestPrice = useMemo(() => {
    const vals = offers.map((p) => p.price).filter((v) => v != null);
    return vals.length ? Math.min(...vals) : null;
  }, [offers]);

  const enriched = useMemo(() => offers.map((it, i) => {
    const mt = trust[slugOf(it)] || null;                                   // marketplace / shop trust
    const st = it.sellerId ? (sellerTrust[it.sellerId] || null) : null;     // per-seller reputation
    const effTrust = st ? { ...(mt || {}), trustScore: st.trustScore } : mt; // blend for best-value
    return { it, mt, st, key: offerKey(it, i), value: valueScore({ price: it.price, lowestPrice, trust: effTrust }) };
  }), [offers, trust, sellerTrust, lowestPrice]);

  const sorted = useMemo(() => {
    const arr = [...enriched];
    if (sortMode === 'value') arr.sort((a, b) => b.value - a.value);
    else arr.sort((a, b) => (a.it.price ?? Infinity) - (b.it.price ?? Infinity));
    return arr;
  }, [enriched, sortMode]);

  if (!offers.length) {
    return (
      <div className="card-soft p-8 sm:p-10 text-center">
        <p className="text-gray text-sm">No price data available</p>
      </div>
    );
  }

  const hasTrust = Object.keys(trust).length > 0 || Object.keys(sellerTrust).length > 0;
  const topIsValue = sortMode === 'value';

  return (
    <div className="space-y-4">
      {/* Sort toggle + what "best value" means */}
      {offers.length > 1 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1 bg-white border border-line rounded-full p-1 shadow-[var(--shadow-soft)]">
            {[['price', 'Cheapest', Crown], ['value', 'Best value', Award]].map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setSortMode(id)}
                aria-pressed={sortMode === id}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                  sortMode === id ? 'bg-ink text-cream shadow-sm' : 'text-gray hover:text-ink'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${sortMode === id ? 'text-acid' : ''}`} /> {label}
              </button>
            ))}
          </div>
          {hasTrust && (
            <span className="text-[11px] text-gray font-mono inline-flex items-center gap-1.5 max-w-xs">
              <Info className="w-3.5 h-3.5 shrink-0" /> Best value weighs trust, delivery &amp; returns — not just price
            </span>
          )}
        </div>
      )}

      {/* Seller grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {sorted.map(({ it, mt, st, key }, idx) => {
          const isTop = idx === 0 && offers.length > 1;
          const isFb = isFacebookSeller(it.siteName);
          const discount = it.originalPrice && it.price
            ? Math.round(((it.originalPrice - it.price) / it.originalPrice) * 100) : 0;
          const badge = sellerBadges[it.siteName];
          const name = it.sellerName || it.siteName || 'Unknown Seller';
          const score = st ? st.trustScore : (mt ? mt.trustScore : null);
          const tier = score != null ? tierOf(score) : null;
          const dtext = mt ? deliveryText(mt) : null;
          const isCheapest = it.price != null && it.price === lowestPrice;
          const delta = (it.price != null && lowestPrice != null) ? it.price - lowestPrice : null;

          return (
            <a
              key={key}
              href={productId
                ? affiliateUrl(productId, it.siteSlug || it.siteName, undefined, it.productUrl)
                : (it.productUrl || '#')}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => trackClick(productId, it.siteSlug || it.siteName)}
              className={`group relative flex flex-col rounded-2xl p-4 sm:p-5 transition-all ${
                isTop
                  ? 'bg-ink text-cream shadow-[var(--shadow-lift)] ring-1 ring-ink/80'
                  : isFb
                  ? 'bg-white border border-blue/25 hover:border-blue/45 hover:shadow-[var(--shadow-soft)]'
                  : 'bg-white border border-line hover:border-line-strong hover:shadow-[var(--shadow-soft)]'
              }`}
            >
              {/* Rank ribbon (winner) or rank number */}
              {isTop ? (
                <span className="self-start inline-flex items-center gap-1.5 bg-acid text-ink text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2.5">
                  {topIsValue ? <Award className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                  {topIsValue ? 'Best value' : 'Cheapest'}
                </span>
              ) : (
                <span className="absolute top-4 right-4 inline-flex items-center justify-center w-6 h-6 rounded-full bg-cream-soft text-ink/40 font-mono text-xs font-bold">
                  {idx + 1}
                </span>
              )}

              {/* Seller identity */}
              <div className="pr-8">
                <h4 className={`font-sans text-lg sm:text-xl font-extrabold tracking-tight leading-tight ${isTop ? 'text-cream' : 'text-ink'}`}>
                  {name}
                </h4>
                <div className="mt-1">
                  {it.sellerName ? (
                    <span className={`text-[11px] font-mono ${isTop ? 'text-cream/70' : 'text-gray'}`}>via {it.siteName}</span>
                  ) : badge ? (
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${isTop ? 'bg-cream/15 text-cream' : badge.color}`}>{badge.label}</span>
                  ) : isFb ? (
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${isTop ? 'bg-cream/15 text-cream' : 'bg-blue text-white'}`}>Facebook</span>
                  ) : (
                    <span className={`text-[11px] font-mono ${isTop ? 'text-cream/70' : 'text-gray'}`}>{it.siteName}</span>
                  )}
                </div>
              </div>

              {/* Signals — same shape on every card */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {tier && (
                  <Signal
                    Icon={ShieldCheck}
                    dark={isTop}
                    tone={isTop ? 'text-cream' : tier.text}
                    title={`Damkemon score: ${score}/100`}
                  >
                    <span className={isTop ? 'text-cream' : ''}>{score}/100</span>
                    <span className={isTop ? 'text-cream/70 font-sans font-normal' : 'text-gray font-sans font-normal'}>Damkemon score</span>
                  </Signal>
                )}
                {it.rating != null && it.rating > 0 && (
                  <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-mono font-medium ${isTop ? 'bg-cream/10 text-cream' : 'bg-cream-soft text-ink'}`}>
                    <Star className={`w-3 h-3 shrink-0 ${isTop ? 'text-acid fill-acid' : 'text-yellow fill-yellow'}`} />
                    {Number(it.rating).toFixed(1)}
                    {it.reviewCount > 0 && <span className={isTop ? 'text-cream/60' : 'text-gray-soft'}>({it.reviewCount})</span>}
                    {it.soldCount > 0 && <span className={isTop ? 'text-cream/60' : 'text-gray-soft'}>· {fmtSold(it.soldCount)} sold</span>}
                  </span>
                )}
                {dtext && (
                  <Signal Icon={Truck} dark={isTop} tone={isTop ? 'text-cream' : 'text-gray'}>{dtext}</Signal>
                )}
                {mt?.codAvailable && (
                  <Signal Icon={Banknote} dark={isTop} tone={isTop ? 'text-cream' : 'text-gray'}>COD</Signal>
                )}
                {it.inStock === false && (
                  <Signal dark={isTop} tone={isTop ? 'text-cream' : 'text-red'}>Out of stock</Signal>
                )}
              </div>

              {/* Price + visit */}
              <div className={`mt-auto pt-4 border-t flex items-center justify-between gap-3 ${isTop ? 'border-cream/20' : 'border-line'}`}>
                <div className="min-w-0">
                  <div className={`font-mono text-[24px] sm:text-[26px] font-bold leading-none ${isTop ? 'text-acid' : 'text-ink'}`}>
                    {formatPrice(it.price)}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[11px] font-mono leading-tight">
                    {it.originalPrice && it.originalPrice > it.price && (
                      <s className={isTop ? 'text-cream/50' : 'text-gray-soft'}>{formatPrice(it.originalPrice)}</s>
                    )}
                    {isCheapest ? (
                      <span className={`font-bold ${isTop ? 'text-cream' : 'text-green'}`}>Lowest price</span>
                    ) : delta != null && delta > 0 ? (
                      <span className="text-gray truncate">+{formatPrice(delta)} vs lowest</span>
                    ) : null}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                    isTop
                      ? 'bg-acid text-ink'
                      : 'bg-cream-soft text-ink group-hover:bg-ink group-hover:text-cream'
                  }`}
                >
                  {discount > 0 && <span className={`mr-0.5 ${isTop ? 'text-ink' : 'text-red'} font-bold`}>−{discount}%</span>}
                  Visit <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
