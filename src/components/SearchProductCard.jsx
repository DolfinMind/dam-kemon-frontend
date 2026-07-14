import { useNavigate } from 'react-router-dom';
import { Store, Star, TrendingDown, ChevronRight, Megaphone } from 'lucide-react';
import { CategoryIcon } from '../lib/categoryIcon';
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
 * shop rows are evidence, not outbound links. Every interaction opens the
 * detail page, where the shopper can review the full comparison before leaving.
 */
export default function SearchProductCard({ product, sponsored = false }) {
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
  const previewPrices = prices.slice(1, VISIBLE_SHOPS + 1);
  const numericPrices = prices.map((offer) => Number(offer.price)).filter((price) => Number.isFinite(price));
  const highestPrice = numericPrices.length ? Math.max(...numericPrices) : null;
  const sellerCount = prices.length;
  const isMulti = sellerCount > 1;
  const priceSpread = cheapest?.price != null && highestPrice != null ? highestPrice - cheapest.price : 0;
  const savingsPct = saneSavePct(cheapest?.price, highestPrice);

  const detailHref = `/product/${product.id || product.slug || ''}`;
  const goToDetail = () => navigate(detailHref, { state: { product } });

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
      {previewPrices.length > 0 && (
        <div>
          <div className="space-y-1.5">
            {previewPrices.map((sp, i) => {
              const delta = sp.price != null && cheapest?.price != null
                ? sp.price - cheapest.price
                : null;
              return (
                <div
                  key={`${sp.siteSlug || sp.siteName}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-[13px] font-extrabold text-ink">{sp.sellerName || sp.siteName || 'Unknown'}</span>
                      {sp.sellerName && (
                        <span className="hidden truncate font-mono text-[10px] text-ink/55 sm:inline">via {sp.siteName}</span>
                      )}
                      {sp.inStock === false && (
                        <span className="shrink-0 font-mono text-[9px] font-bold uppercase text-red">out</span>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-sm font-extrabold text-ink">
                      {fmt(sp.price)}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9px] font-semibold text-gray">
                      {delta > 0 ? `+${fmt(delta)}` : 'Same price'}
                    </span>
                  </span>
                </div>
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
