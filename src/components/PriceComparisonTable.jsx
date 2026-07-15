import { useMemo, useState } from 'react';
import { Crown, ExternalLink, Star, ShieldCheck, Truck, Banknote, ChevronDown, ChevronUp } from 'lucide-react';
import { trackClick } from '../api/analytics';
import { affiliateUrl } from '../api/api';
import { tierOf, deliveryText } from './TrustBadge';
import { formatBdt } from '../lib/display';

function formatPrice(price) {
  return formatBdt(price);
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

function sameOffer(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.productUrl && b.productUrl) return a.productUrl === b.productUrl;
  if (a.sellerId && b.sellerId) return a.sellerId === b.sellerId;
  return slugOf(a) === slugOf(b)
    && (a.sellerName || '') === (b.sellerName || '')
    && a.price === b.price;
}

/** A small, consistent signal chip so every seller card reads the same way. */
function Signal({ Icon, tone, children, title }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-md bg-cream-soft px-1.5 py-0.5 text-[11px] font-mono font-medium ${tone || 'text-gray'}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}

/**
 * A shop-first comparison surface. The recommended lowest offer stays inside
 * the list as a highlighted first row, so its evidence is never duplicated in
 * a separate card above the comparison.
 *
 *  - For a marketplace sub-seller (e.g. a Daraz storefront) we show that
 *    SELLER's own reputation (`sellerTrust`, computed from real scraped ratings
 *    + sales) plus this listing's rating and units sold.
 *  - For a first-party shop we show the shop's trust score, delivery and COD.
 */
export default function PriceComparisonTable({ prices = [], productId, fromQuery, trust = {}, sellerTrust = {}, recommended = null }) {
  const [expanded, setExpanded] = useState(false);

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
    return { it, mt, st, key: offerKey(it, i), isRecommended: sameOffer(it, recommended) };
  }), [offers, trust, sellerTrust, recommended]);

  const sorted = useMemo(
    () => [...enriched].sort((a, b) => {
      if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
      return (a.it.price ?? Infinity) - (b.it.price ?? Infinity);
    }),
    [enriched],
  );

  if (!offers.length) {
    return (
      <div className="card-soft p-8 sm:p-10 text-center">
        <p className="text-gray text-sm">No price data available</p>
      </div>
    );
  }

  const visible = expanded ? sorted : sorted.slice(0, 4);
  const hiddenCount = sorted.length - visible.length;

  return (
    <div className="@container overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)]">
      <div className="hidden @3xl:grid grid-cols-[minmax(150px,1.3fr)_minmax(160px,1fr)_minmax(100px,.6fr)_minmax(160px,auto)] gap-4 px-5 py-3 bg-cream-soft/70 border-b border-line text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-gray">
        <span>Shop</span>
        <span>Seller signals</span>
        <span>Fulfilment</span>
        <span className="text-right">Live price</span>
      </div>

      <div className="divide-y divide-line">
        {visible.map(({ it, mt, st, key, isRecommended }) => {
          const isFb = isFacebookSeller(it.siteName);
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
                ? affiliateUrl(productId, it.siteSlug || it.siteName, fromQuery, it.productUrl)
                : (it.productUrl || '#')}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => {
                trackClick(productId, it.siteSlug || it.siteName);
                try { sessionStorage.setItem('dk_outclick', '1'); } catch { /* private mode */ }
              }}
              className={`group grid grid-cols-[minmax(0,1fr)_auto] @3xl:grid-cols-[minmax(150px,1.3fr)_minmax(160px,1fr)_minmax(100px,.6fr)_minmax(160px,auto)] items-center gap-x-3 gap-y-2 px-4 sm:px-5 py-4 transition-colors ${isRecommended ? 'border-l-4 border-l-acid bg-acid-soft/35 hover:bg-acid-soft/55' : `hover:bg-cream-soft/60 ${isFb ? 'border-l-2 border-l-blue/40' : ''}`}`}
            >
              <div className="min-w-0">
                {isRecommended && (
                  <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-acid px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.1em] text-ink">
                    <Crown className="h-2.5 w-2.5" /> Damkemon Pick
                  </span>
                )}
                <h4 className="font-sans text-[15px] sm:text-base font-extrabold tracking-tight leading-tight text-ink truncate">
                  {name}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 min-w-0">
                  {it.sellerName ? (
                    <span className="text-[10px] font-mono text-gray truncate">via {it.siteName}</span>
                  ) : badge ? (
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${badge.color}`}>{badge.label}</span>
                  ) : isFb ? (
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue text-white">Facebook</span>
                  ) : null}
                  {it.inStock === false && <span className="text-[9px] font-mono font-bold text-red">Out of stock</span>}
                </div>
              </div>

              <div className="col-start-1 @3xl:col-start-auto flex flex-wrap items-center gap-1.5">
                {tier && (
                  <Signal
                    Icon={ShieldCheck}
                    tone={tier.text}
                    title={`Damkemon seller score: ${score}/100. Editorial profile plus available buyer and listing ratings; not a purchase guarantee.`}
                  >
                    <span>{score}/100</span>
                    <span className="hidden sm:inline text-gray font-sans font-normal">shop score</span>
                  </Signal>
                )}
                {it.rating != null && it.rating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-mono font-medium bg-yellow-soft text-ink">
                    <Star className="w-3 h-3 shrink-0 text-yellow fill-yellow" />
                    {Number(it.rating).toFixed(1)}
                    {it.reviewCount > 0 && <span className="text-gray">({it.reviewCount})</span>}
                    {it.soldCount > 0 && <span className="hidden sm:inline text-gray">· {fmtSold(it.soldCount)} sold</span>}
                  </span>
                )}
              </div>

              <div className="hidden min-w-0 @3xl:flex flex-wrap items-center gap-1.5 overflow-hidden">
                {dtext && <Signal Icon={Truck}>{dtext}</Signal>}
                {mt?.codAvailable && <Signal Icon={Banknote}>COD</Signal>}
              </div>

              <div className="row-start-1 row-span-2 col-start-2 @3xl:row-auto @3xl:col-auto flex items-center justify-end gap-3 text-right">
                <div>
                  <div className="font-mono text-[19px] sm:text-[21px] font-bold leading-none text-ink">{formatPrice(it.price)}</div>
                  <div className="mt-1 text-[9px] sm:text-[10px] font-mono leading-tight">
                    {isCheapest ? (
                      <span className="font-bold text-green">Lowest price</span>
                    ) : delta != null && delta > 0 ? (
                      <span className="text-gray">+{formatPrice(delta)}</span>
                    ) : null}
                  </div>
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${isRecommended ? 'bg-ink text-cream group-hover:bg-ink-soft' : 'bg-cream-soft text-ink group-hover:bg-ink group-hover:text-cream'}`}>
                  Visit <ExternalLink className="w-3.5 h-3.5" />
                </span>
                <ExternalLink className="sm:hidden w-4 h-4 text-gray group-hover:text-ink" />
              </div>
            </a>
          );
        })}
      </div>

      {sorted.length > 4 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 border-t border-line text-xs font-bold text-gray hover:text-ink hover:bg-cream-soft/60 transition-colors"
        >
          {expanded ? <><ChevronUp className="w-4 h-4" /> Show fewer shops</> : <><ChevronDown className="w-4 h-4" /> Show {hiddenCount} more {hiddenCount === 1 ? 'shop' : 'shops'}</>}
        </button>
      )}
    </div>
  );
}
