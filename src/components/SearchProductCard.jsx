import { useNavigate } from 'react-router-dom';
import { ExternalLink, Crown, Store, Star, TrendingDown, ChevronRight, Megaphone } from 'lucide-react';
import { trackClick } from '../api/analytics';
import { affiliateUrl } from '../api/api';
import { CategoryIcon } from '../lib/categoryIcon';
import TrustBadge from './TrustBadge';
import { cleanName, saneSavePct } from '../lib/display';

function fmt(p) {
  if (p == null) return 'N/A';
  return '৳' + Number(p).toLocaleString('en-IN');
}

// Discovery pages only need enough shop evidence to make the spread tangible.
// The full seller list and fulfilment detail live on the product page.
const VISIBLE_SHOPS = 2;

/**
 * Product-centric comparison card. The product sits in a compact header
 * (thumbnail + title + rating); the seller line-up — the real value on a
 * price-comparison site — runs full-width below, ranked cheapest-first, each
 * price tappable straight through to the shop. "Compare N shops" opens the
 * detail page with the full trust/delivery breakdown.
 */
export default function SearchProductCard({ product, sponsored = false, query, trust = {} }) {
  const navigate = useNavigate();
  let prices = Array.isArray(product.prices) ? [...product.prices] : [];
  prices.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  // One row per seller — duplicate listings keep only their cheapest price.
  const seen = new Set();
  prices = prices.filter((p) => {
    const key = p.sellerId || `${p.siteSlug || p.siteName}|${p.sellerName || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const cheapest = prices[0];
  const numericPrices = prices.map((offer) => Number(offer.price)).filter((price) => Number.isFinite(price));
  const highestPrice = numericPrices.length ? Math.max(...numericPrices) : null;
  const sellerCount = prices.length;
  const isMulti = sellerCount > 1;
  const priceSpread = cheapest?.price != null && highestPrice != null ? highestPrice - cheapest.price : 0;
  const savingsPct = saneSavePct(cheapest?.price, highestPrice);

  const detailHref = `/product/${product.id || product.slug || ''}`;
  const goToDetail = () => navigate(detailHref, { state: { product } });

  const cheapestTrust = cheapest ? trust[cheapest.siteSlug || cheapest.siteName] || null : null;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToDetail(); } }}
      className="card-soft p-4 flex flex-col gap-3 group hover:shadow-[var(--shadow-lift)] hover:border-line-strong transition-all cursor-pointer"
    >
      {/* Header — compact product identity */}
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div className="relative w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-xl bg-surface-alt ring-1 ring-line p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <CategoryIcon category={product.category} className="w-9 h-9 text-ink/25" />
          )}
          {sponsored && (
            <span className="absolute -top-1.5 -left-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow text-ink shadow-[var(--shadow-soft)]" title="Sponsored">
              <Megaphone className="w-3 h-3" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {product.category && (
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink/60">{product.category}</span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isMulti ? 'bg-acid-soft text-acid-deep' : 'bg-cream-soft text-ink/60'
            }`}>
              <Store className="w-3 h-3" /> {isMulti ? `${sellerCount} shops` : '1 shop'}
            </span>
          </div>
          <h3 className="font-sans text-base sm:text-lg font-bold text-ink leading-snug line-clamp-2 group-hover:text-acid-deep transition-colors">
            {cleanName(product.name)}
          </h3>
          <div className="mt-1.5 flex items-center gap-2.5 flex-wrap text-[13px]">
            {product.damkemonRating != null && product.damkemonRating > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow fill-yellow" />
                <span className="font-semibold text-ink">{Number(product.damkemonRating).toFixed(1)}</span>
                {product.damkemonReviews > 0 && <span className="text-gray-soft text-xs">({product.damkemonReviews.toLocaleString('en-IN')})</span>}
              </span>
            )}
            {isMulti && savingsPct >= 5 && (
              <span className="inline-flex items-center gap-0.5 bg-acid-soft text-acid-deep text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3 h-3" /> save {savingsPct}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sellers — the value, full width */}
      {cheapest && (
        <div>
          <div className="space-y-1.5">
            {prices.slice(0, VISIBLE_SHOPS).map((sp, i) => {
              const isCheapest = i === 0;
              const delta = !isCheapest && sp.price != null && cheapest.price != null
                ? sp.price - cheapest.price
                : null;
              return (
                <a
                  key={`${sp.siteSlug || sp.siteName}-${i}`}
                  href={product.id
                    ? affiliateUrl(product.id, sp.siteSlug || sp.siteName, query, sp.productUrl)
                    : (sp.productUrl || '#')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={(e) => { e.stopPropagation(); trackClick(product.id, sp.siteSlug || sp.siteName); }}
                  className={`group/seller flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
                    isCheapest
                      ? 'border-acid/45 border-l-[3px] border-l-acid bg-acid-soft/45 hover:bg-acid-soft/70'
                      : 'bg-white border-line hover:border-line-strong'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    {isCheapest && (
                      <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-acid px-2 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-[0.1em] text-ink">
                        <Crown className="h-2.5 w-2.5" /> Damkemon Pick
                      </span>
                    )}
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-[13px] font-extrabold text-ink">{sp.sellerName || sp.siteName || 'Unknown'}</span>
                      {sp.sellerName && (
                        <span className="hidden truncate font-mono text-[10px] text-ink/55 sm:inline">via {sp.siteName}</span>
                      )}
                      {sp.inStock === false && (
                        <span className="shrink-0 font-mono text-[9px] font-bold uppercase text-red">out</span>
                      )}
                    </span>
                    {isCheapest && cheapestTrust && (
                      <TrustBadge trust={cheapestTrust} variant="compact" className="mt-1" />
                    )}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className={`block font-mono text-sm font-extrabold ${isCheapest ? 'text-acid-deep' : 'text-ink'}`}>
                      {fmt(sp.price)}
                    </span>
                    <span className={`mt-0.5 block font-mono text-[9px] font-semibold ${isCheapest ? 'text-green' : 'text-gray'}`}>
                      {isCheapest ? 'Lowest price' : delta > 0 ? `+${fmt(delta)}` : 'Same price'}
                    </span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-soft shrink-0 group-hover/seller:text-ink transition-colors" />
                </a>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-line">
            <span className="text-[12px] text-gray">
              {sellerCount > VISIBLE_SHOPS
                ? <>+{sellerCount - VISIBLE_SHOPS} more {sellerCount - VISIBLE_SHOPS === 1 ? 'shop' : 'shops'}</>
                : isMulti
                ? <>{fmt(priceSpread)} shop spread</>
                : <>Only at <span className="font-semibold text-ink">{cheapest.siteName}</span></>}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink bg-acid px-3.5 py-1.5 rounded-full hover:brightness-95 hover:-translate-y-0.5 transition-all shrink-0 shadow-sm">
              {isMulti ? `Compare ${sellerCount} shops` : 'View details'}
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
