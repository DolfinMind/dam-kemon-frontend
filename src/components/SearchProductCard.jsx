import { useNavigate } from 'react-router-dom';
import { ExternalLink, Crown, Store, Star, TrendingDown, ChevronRight, Megaphone, Sparkles } from 'lucide-react';
import { trackClick } from '../api/analytics';
import { affiliateUrl } from '../api/api';
import { CategoryIcon } from '../lib/categoryIcon';
import TrustBadge from './TrustBadge';

function fmt(p) {
  if (p == null) return 'N/A';
  return '৳' + Number(p).toLocaleString('en-IN');
}

// Seller rows surfaced directly on the card; the rest live on the detail page.
const VISIBLE_SELLERS = 4;

/**
 * Product-centric comparison card. The product sits in a compact header
 * (thumbnail + title + rating); the seller line-up — the real value on a
 * price-comparison site — runs full-width below, ranked cheapest-first, each
 * price tappable straight through to the shop. "Compare N prices" opens the
 * detail page with the full trust/delivery breakdown.
 */
export default function SearchProductCard({ product, rank, sponsored = false, query, trust = {}, smartPick = false }) {
  const navigate = useNavigate();
  const prices = Array.isArray(product.prices) ? [...product.prices] : [];
  prices.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  const cheapest = prices[0];
  const highest = prices[prices.length - 1];
  const sellerCount = prices.length;
  const isMulti = sellerCount > 1;
  const savings = cheapest && highest && highest.price > cheapest.price
    ? highest.price - cheapest.price : 0;
  const savingsPct = savings && highest?.price
    ? Math.round((savings / highest.price) * 100) : 0;

  const detailHref = `/product/${product.id || product.slug || ''}`;
  const goToDetail = () => navigate(detailHref, { state: { product } });

  const rating = product.averageRating;
  const totalReviews = product.totalReviews;
  const cheapestTrust = cheapest ? trust[cheapest.siteSlug || cheapest.siteName] || null : null;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToDetail(); } }}
      className="card-soft p-4 sm:p-5 flex flex-col gap-4 group hover:shadow-[var(--shadow-lift)] hover:border-line-strong transition-all cursor-pointer"
    >
      {/* Header — compact product identity */}
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div className="relative w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-xl bg-surface-alt ring-1 ring-line p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
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
          {sponsored ? (
            <span className="absolute -top-1.5 -left-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow text-ink shadow-[var(--shadow-soft)]" title="Sponsored">
              <Megaphone className="w-3 h-3" />
            </span>
          ) : smartPick ? (
            <span className="absolute -top-1.5 -left-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-acid text-ink shadow-[var(--shadow-soft)]" title="Smart pick">
              <Sparkles className="w-3 h-3" />
            </span>
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {product.category && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray">{product.category}</span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isMulti ? 'bg-acid-soft text-acid-deep' : 'bg-cream-soft text-ink/60'
            }`}>
              <Store className="w-3 h-3" /> {isMulti ? `${sellerCount} sellers` : '1 seller'}
            </span>
          </div>
          <h3 className="font-sans text-base sm:text-lg font-bold text-ink leading-snug line-clamp-2 group-hover:text-acid-deep transition-colors">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2.5 flex-wrap text-[13px]">
            {product.damkemonRating != null && product.damkemonRating > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow fill-yellow" />
                <span className="font-semibold text-ink">{Number(product.damkemonRating).toFixed(1)}</span>
                {product.damkemonReviews > 0 && <span className="text-gray-soft text-xs">({product.damkemonReviews.toLocaleString('en-IN')})</span>}
              </span>
            ) : (
              <span className="text-gray-soft text-[11px] flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow fill-yellow/20" /> No reviews yet
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
            {prices.slice(0, VISIBLE_SELLERS).map((sp, i) => {
              const isCheapest = i === 0;
              return (
                <a
                  key={`${sp.siteSlug || sp.siteName}-${i}`}
                  href={product.id
                    ? affiliateUrl(product.id, sp.siteSlug || sp.siteName, query, sp.productUrl)
                    : (sp.productUrl || '#')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={(e) => { e.stopPropagation(); trackClick(product.id, sp.siteSlug || sp.siteName); }}
                  className={`group/seller flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-colors ${
                    isCheapest
                      ? 'bg-acid-soft border-acid/40 hover:bg-acid/20'
                      : 'bg-white border-line hover:border-line-strong'
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                    isCheapest ? 'bg-ink text-acid' : 'bg-cream-soft text-ink/50'
                  }`}>
                    {isCheapest ? <Crown className="w-3 h-3" /> : i + 1}
                  </span>
                  <span className="flex-1 min-w-0 inline-flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-ink truncate">{sp.sellerName || sp.siteName || 'Unknown'}</span>
                    {sp.sellerName && (
                      <span className="hidden lg:inline text-[10px] text-gray font-mono shrink-0">· {sp.siteName}</span>
                    )}
                    {isCheapest && (
                      <span className="hidden sm:inline text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-ink text-acid">Lowest</span>
                    )}
                    {sp.inStock === false && (
                      <span className="text-[9px] font-mono font-bold uppercase text-red">out</span>
                    )}
                  </span>
                  <span className={`font-mono text-sm font-bold shrink-0 ${isCheapest ? 'text-acid-deep' : 'text-ink'}`}>
                    {fmt(sp.price)}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-soft shrink-0 group-hover/seller:text-ink transition-colors" />
                </a>
              );
            })}
          </div>

          {cheapestTrust && (
            <div className="mt-2">
              <TrustBadge trust={cheapestTrust} variant="compact" />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-line">
            <span className="text-[12px] text-gray">
              {sellerCount > VISIBLE_SELLERS
                ? <>+{sellerCount - VISIBLE_SELLERS} more {sellerCount - VISIBLE_SELLERS === 1 ? 'seller' : 'sellers'}</>
                : isMulti
                ? <>Cheapest at <span className="font-semibold text-ink">{cheapest.siteName}</span></>
                : <>Only on <span className="font-semibold text-ink">{cheapest.siteName}</span></>}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink bg-acid px-3.5 py-1.5 rounded-full hover:brightness-95 hover:-translate-y-0.5 transition-all shrink-0 shadow-sm">
              {isMulti ? `Compare ${sellerCount} prices` : 'View details'}
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
