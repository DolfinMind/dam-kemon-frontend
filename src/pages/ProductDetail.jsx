import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getProduct, getProductHistory, getDailyPriceHistory, getShopTrust, getSellerTrust, affiliateUrl } from '../api/api';
import { trackView, trackClick } from '../api/analytics';
import { pushRecent } from '../api/recentlyViewed';
import { addToWishlist, removeFromWishlist, listWishlist, updateWishlistAlert } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import PriceComparisonTable from '../components/PriceComparisonTable';
import PriceHistoryChart from '../components/PriceHistoryChart';
import SmartVerdict from '../components/SmartVerdict';
import ReviewsPanel from '../components/ReviewsPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductSEO from '../components/ProductSEO';
import ServiceUnavailable from '../components/ServiceUnavailable';
import { valueScore, tierOf, deliveryText } from '../components/TrustBadge';
import {
  ArrowLeft, Star, Share2, Bell, ShieldCheck, Store, AlertTriangle, Heart,
  Crown, ExternalLink, Truck, Banknote, ArrowDown,
} from 'lucide-react';

function formatPrice(price) {
  if (!price && price !== 0) return 'N/A';
  return '৳' + Number(price).toLocaleString('en-IN');
}

const slugOf = (sp) => sp.siteSlug || sp.siteName;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  // If the user arrived from a search result, the full product travels in
  // router state — use it immediately so the page renders even when the
  // backend can't look it up (e.g. live-search results before Mongo persists).
  const seedProduct = state?.product || null;

  const [product, setProduct] = useState(seedProduct);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(!seedProduct);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!seedProduct) setLoading(true);
    setError(null);

    Promise.allSettled([
      getProduct(id),
      getProductHistory(id),
    ]).then(([productRes, historyRes]) => {
      if (cancelled) return;
      if (productRes.status === 'fulfilled') {
        setProduct(productRes.value.data);
      } else if (!seedProduct) {
        // Only surface an error if we don't already have a product to render.
        const status = productRes.reason?.response?.status;
        setError({ kind: status === 404 ? 'not_found' : 'network' });
      }
      setHistory(historyRes.status === 'fulfilled' && Array.isArray(historyRes.value.data) ? historyRes.value.data : []);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id, seedProduct, retryTick]);

  useEffect(() => {
    const pid = product?.id || id;
    if (pid) {
      trackView(pid);
      pushRecent(pid);
    }
  }, [product?.id, id]);

  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    alertsEnabled: false,
    targetPrice: '',
    alertOnDropPercent: 10,
  });

  useEffect(() => {
    if (!user) { setInWishlist(false); return; }
    const pid = product?.id || id;
    if (!pid) return;
    listWishlist().then((r) => {
      const row = (r.data || []).find((w) => (w.product?.id || w.productId) === pid);
      setInWishlist(!!row);
      if (row) {
        setAlertSettings({
          alertsEnabled: !!row.alertsEnabled,
          targetPrice: row.targetPrice ?? '',
          alertOnDropPercent: row.alertOnDropPercent != null
            ? Math.round(row.alertOnDropPercent * 100) : 10,
        });
      }
    }).catch(() => {});
  }, [user, product?.id, id]);

  const toggleWishlist = async () => {
    const pid = product?.id || id;
    if (!pid || !user) { navigate('/sign-in'); return; }
    setWishlistBusy(true);
    try {
      if (inWishlist) { await removeFromWishlist(pid); setInWishlist(false); }
      else { await addToWishlist(pid); setInWishlist(true); }
    } catch { /* noop */ }
    finally { setWishlistBusy(false); }
  };

  const openTrackPrice = async () => {
    const pid = product?.id || id;
    if (!pid) return;
    if (!user) { navigate('/sign-in'); return; }
    // Add to wishlist first if not already — alerts hang off a wishlist row
    if (!inWishlist) {
      try { await addToWishlist(pid); setInWishlist(true); }
      catch { return; }
    }
    setAlertModalOpen(true);
  };

  const saveAlertSettings = async () => {
    const pid = product?.id || id;
    if (!pid) return;
    setWishlistBusy(true);
    try {
      const tp = alertSettings.targetPrice === '' ? null : Number(alertSettings.targetPrice);
      await updateWishlistAlert(pid, {
        alertsEnabled: !!alertSettings.alertsEnabled,
        targetPrice: Number.isFinite(tp) ? tp : null,
        alertOnDropPercent: Math.max(1, Math.min(50, Number(alertSettings.alertOnDropPercent) || 10)) / 100,
      });
      setAlertModalOpen(false);
    } catch { /* noop */ }
    finally { setWishlistBusy(false); }
  };

  const [dailySeries, setDailySeries] = useState([]);
  useEffect(() => {
    const pid = product?.id || id;
    if (!pid) return;
    getDailyPriceHistory(pid, 30).then((r) => {
      setDailySeries(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {});
  }, [product?.id, id]);

  // Trust / delivery / genuineness profiles for every seller on this product,
  // fetched in one batched call keyed by shop slug.
  const [trust, setTrust] = useState({});
  useEffect(() => {
    const slugs = [...new Set((product?.prices || []).map((p) => p.siteSlug || p.siteName).filter(Boolean))];
    if (slugs.length === 0) { setTrust({}); return; }
    let alive = true;
    getShopTrust(slugs).then((r) => { if (alive && r.data) setTrust(r.data); }).catch(() => {});
    return () => { alive = false; };
  }, [product?.id, id]);

  // Per-seller reputation for marketplace sub-sellers (Daraz storefronts, etc),
  // keyed by sellerId — real, data-derived scores so we can rank one Daraz
  // seller against another, not just show the marketplace's blanket score.
  const [sellerTrust, setSellerTrust] = useState({});
  useEffect(() => {
    const ids = [...new Set((product?.prices || []).map((p) => p.sellerId).filter(Boolean))];
    if (ids.length === 0) { setSellerTrust({}); return; }
    let alive = true;
    getSellerTrust(ids).then((r) => { if (alive && r.data) setSellerTrust(r.data); }).catch(() => {});
    return () => { alive = false; };
  }, [product?.id, id]);

  // A freshly submitted review returns the seller's updated trust profile —
  // merge it so the verdict + comparison table reflect it without a refetch.
  const onTrustUpdated = (t) => {
    if (t && t.shopSlug) setTrust((m) => ({ ...m, [t.shopSlug]: t }));
  };

  // ── Decision math for the hero "best deal" champion ───────────────────────
  const pid = product?.id || id;
  const prices = product?.prices || [];
  const lowestPrice = useMemo(() => {
    const vals = prices.map((p) => p.price).filter((v) => v != null);
    return vals.length ? Math.min(...vals) : (product?.lowestPrice ?? null);
  }, [prices, product?.lowestPrice]);
  const highestPrice = useMemo(() => {
    const vals = prices.map((p) => p.price).filter((v) => v != null);
    return vals.length ? Math.max(...vals) : (product?.highestPrice ?? null);
  }, [prices, product?.highestPrice]);
  const savings = highestPrice && lowestPrice ? highestPrice - lowestPrice : 0;
  const sellerCount = prices.length;
  const cheapest = prices.find((p) => p.price === lowestPrice) || null;

  // Cheapest seller's trust signals for the champion card.
  const champShopT = cheapest ? (trust[slugOf(cheapest)] || null) : null;
  const champSellerT = cheapest?.sellerId ? (sellerTrust[cheapest.sellerId] || null) : null;
  const champScore = champSellerT?.trustScore ?? champShopT?.trustScore ?? null;
  const champTier = champScore != null ? tierOf(champScore) : null;
  const champDelivery = champShopT ? deliveryText(champShopT) : null;
  const champDiscount = cheapest?.originalPrice && cheapest?.price
    ? Math.round(((cheapest.originalPrice - cheapest.price) / cheapest.originalPrice) * 100) : 0;

  // Best value (may differ from cheapest) — drives the "smarter pick" hint.
  const bestValue = useMemo(() => {
    const ranked = prices
      .filter((p) => p.price != null)
      .map((sp) => ({ sp, v: valueScore({ price: sp.price, lowestPrice, trust: trust[slugOf(sp)] }) }))
      .sort((a, b) => b.v - a.v);
    return ranked[0]?.sp || null;
  }, [prices, lowestPrice, trust]);
  const sameAsCheapest = bestValue && cheapest && slugOf(bestValue) === slugOf(cheapest);
  const bestValueDiff = bestValue?.price != null && lowestPrice != null ? bestValue.price - lowestPrice : 0;
  const champHref = pid && cheapest
    ? affiliateUrl(pid, cheapest.siteSlug || cheapest.siteName, undefined, cheapest.productUrl)
    : (cheapest?.productUrl || '#');

  if (loading) {
    return (
      <div className="container-tight py-12">
        <LoadingSpinner text="Loading product details…" />
      </div>
    );
  }

  if (!product) {
    const isNetwork = error?.kind === 'network';
    if (isNetwork) {
      return (
        <div className="container-tight py-16 sm:py-24">
          <ServiceUnavailable onRetry={() => setRetryTick((t) => t + 1)}>
            <Link to="/" className="btn-ghost inline-flex">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </ServiceUnavailable>
        </div>
      );
    }
    return (
      <div className="container-tight py-16 sm:py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-red-soft mb-4">
          <AlertTriangle className="w-8 h-8 text-red" />
        </div>
        <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink mb-2">Product not found</h2>
        <p className="text-gray text-sm mb-6 max-w-md mx-auto">
          We can't find this product. Start a new search from the home page.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    );
  }

  const cheapestName = cheapest ? (cheapest.sellerName || cheapest.siteName) : null;
  const cheapestVia = cheapest?.sellerName ? cheapest.siteName : null;
  const bestValueName = bestValue ? (bestValue.sellerName || bestValue.siteName) : null;

  return (
    <div className="container-tight py-4 sm:py-6 lg:py-8">
      <ProductSEO product={product} />
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-gray hover:text-ink text-sm font-medium mb-4 sm:mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      {/* ── HERO: who/what (left) + the answer, "best deal" (right) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-6 sm:mb-8 items-stretch">
        {/* Identity */}
        <div className="lg:col-span-7 card-elev overflow-hidden flex flex-col sm:flex-row">
          {/* Product image — fills the panel so the card never reads as empty */}
          <div className="relative sm:w-[42%] shrink-0 bg-surface-alt flex items-center justify-center p-6 sm:p-8 min-h-[200px]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <span className="font-sans text-6xl font-extrabold text-ink/15">{(product.category || 'P')[0]}</span>
            )}
            {product.category && (
              <span className="absolute top-4 left-4 chip chip-ghost !text-[10px] !py-0.5 capitalize">{product.category}</span>
            )}
          </div>

          {/* Identity + actions, vertically centred */}
          <div className="flex-1 min-w-0 p-5 sm:p-7 flex flex-col justify-center">
            <span className={`self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold mb-3 ${
              sellerCount > 1 ? 'bg-acid-soft text-acid-deep' : 'bg-cream-soft text-ink/60'
            }`}>
              <Store className="w-3 h-3" />
              {sellerCount === 0 ? 'No sellers' : sellerCount === 1 ? '1 seller' : `${sellerCount} sellers`}
            </span>

            <h1 className="font-sans text-2xl lg:text-[30px] font-extrabold text-ink leading-[1.1] tracking-[-0.025em]">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {product.averageRating > 0 ? (
                <>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(product.averageRating || 0) ? 'text-yellow fill-yellow' : 'text-line-strong'}`} />
                    ))}
                  </div>
                  <span className="text-ink font-bold text-sm">{Number(product.averageRating).toFixed(1)}</span>
                  {product.totalReviews > 0 && (
                    <span className="text-gray text-xs">
                      ({Number(product.totalReviews).toLocaleString('en-IN')} {product.totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-gray text-xs">No reviews aggregated yet</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <button
                onClick={toggleWishlist}
                disabled={wishlistBusy}
                className={`btn-ghost ${inWishlist ? 'text-red' : ''}`}
                title={user ? (inWishlist ? 'Remove from wishlist' : 'Add to wishlist') : 'Sign in to save'}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red' : ''}`} />
                {inWishlist ? 'Saved' : 'Wishlist'}
              </button>
              <button
                onClick={openTrackPrice}
                className={`btn-ghost ${alertSettings.alertsEnabled ? 'text-green' : ''}`}
                title={alertSettings.alertsEnabled ? 'Edit price drop alert' : 'Notify me when price drops'}
              >
                <Bell className={`w-4 h-4 ${alertSettings.alertsEnabled ? 'fill-green/30' : ''}`} />
                {alertSettings.alertsEnabled ? 'Tracking' : 'Track price'}
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  if (navigator.share) navigator.share({ title: product.name, url }).catch(() => {});
                  else navigator.clipboard?.writeText(url);
                }}
                className="btn-ghost"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Best deal — the answer, big and unmissable */}
        <div className="lg:col-span-5">
          {cheapest ? (
            <div className="overflow-hidden bg-ink text-cream h-full flex flex-col p-5 sm:p-6 rounded-[20px] border border-cream/10 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-acid text-ink px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Crown className="w-3 h-3" /> Best deal
                </span>
                {champTier && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream/15 px-2.5 py-1 text-[11px] font-mono font-bold text-cream">
                    <ShieldCheck className="w-3.5 h-3.5" /> {champScore} {champTier.label.toLowerCase()}
                  </span>
                )}
              </div>

              <div className="text-[11px] font-mono uppercase tracking-wider text-cream/60">Lowest of {sellerCount} {sellerCount === 1 ? 'seller' : 'sellers'}</div>
              <h2 className="font-sans text-2xl sm:text-[28px] font-extrabold tracking-tight leading-tight mt-0.5">{cheapestName}</h2>
              {cheapestVia && <div className="text-[12px] font-mono text-cream/60 mt-0.5">via {cheapestVia}</div>}

              <div className="flex items-end gap-3 mt-4">
                <div className="font-mono text-[40px] sm:text-5xl font-bold text-acid leading-none">{formatPrice(lowestPrice)}</div>
                <div className="pb-1 flex flex-col gap-0.5">
                  {cheapest.originalPrice && cheapest.originalPrice > lowestPrice && (
                    <s className="font-mono text-xs text-cream/50">{formatPrice(cheapest.originalPrice)}</s>
                  )}
                  {champDiscount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-acid/20 text-acid rounded-md px-1.5 py-0.5 w-fit">−{champDiscount}%</span>
                  )}
                </div>
              </div>
              {savings > 0 && (
                <div className="text-[12px] font-mono text-cream/70 mt-1.5">save {formatPrice(savings)} vs the priciest seller</div>
              )}

              {/* Trust signals */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {champDelivery && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-cream/12 px-2 py-1 text-[11px] font-mono text-cream"><Truck className="w-3 h-3" /> {champDelivery}</span>
                )}
                {champShopT?.codAvailable && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-cream/12 px-2 py-1 text-[11px] font-mono text-cream"><Banknote className="w-3 h-3" /> COD</span>
                )}
                {cheapest.rating != null && cheapest.rating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-cream/12 px-2 py-1 text-[11px] font-mono text-cream"><Star className="w-3 h-3 text-acid fill-acid" /> {Number(cheapest.rating).toFixed(1)}</span>
                )}
              </div>

              {/* Primary + protected CTAs */}
              <div className="mt-auto pt-5 flex flex-col gap-2">
                <a
                  href={champHref}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => trackClick(pid, cheapest.siteSlug || cheapest.siteName)}
                  className="inline-flex items-center justify-center gap-2 bg-acid text-ink font-bold text-sm rounded-full px-5 py-3.5 hover:brightness-95 active:scale-[0.98] transition-all"
                >
                  Visit {cheapest.siteName} <ExternalLink className="w-4 h-4" />
                </a>
                <Link
                  to={`/protect?productId=${encodeURIComponent(pid)}&shopSlug=${encodeURIComponent(cheapest.siteSlug || cheapest.siteName || '')}&itemName=${encodeURIComponent(product.name || '')}&amount=${lowestPrice || ''}`}
                  className="inline-flex items-center justify-center gap-2 bg-cream/12 text-cream font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-cream/20 transition-colors"
                  title="Check scam risk & open a protected order"
                >
                  <ShieldCheck className="w-4 h-4" /> Buy Protected
                </Link>
              </div>

              {/* Cheapest-vs-smartest hint, mirroring the Smart verdict below */}
              {sellerCount > 1 && (
                <div className="mt-3 pt-3 border-t border-cream/15 text-[12px] text-cream/75 flex items-start gap-1.5">
                  {sameAsCheapest ? (
                    <><ShieldCheck className="w-3.5 h-3.5 text-acid shrink-0 mt-0.5" /> Also our smartest buy — best trust for the price.</>
                  ) : (
                    <><ArrowDown className="w-3.5 h-3.5 text-acid shrink-0 mt-0.5" /> A smarter pick — <b className="text-cream">{bestValueName}</b> for {formatPrice(Math.abs(bestValueDiff))} more — is in the Smart verdict.</>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card-elev h-full flex flex-col items-center justify-center text-center p-6 bg-cream-soft/40">
              <Store className="w-8 h-8 text-ink/20 mb-2" />
              <p className="font-sans text-lg font-extrabold text-ink">No sellers yet</p>
              <p className="text-xs text-gray mt-1">We're still tracking prices for this product.</p>
            </div>
          )}
        </div>
      </div>

      {/* Every seller, ranked — with the Smart verdict as a sticky sidebar so it
          sits beside the shops grid instead of eating a full-width band. */}
      <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 mb-6 sm:mb-8 items-start">
        <section className="lg:col-span-2 min-w-0">
          <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
            <div>
              <h2 className="font-sans text-xl sm:text-2xl font-extrabold tracking-[-0.02em] text-ink leading-tight">Compare all sellers</h2>
              <p className="text-[11px] sm:text-xs text-gray font-mono mt-0.5">
                {sellerCount} {sellerCount === 1 ? 'seller' : 'sellers'} · lowest {formatPrice(lowestPrice)}
                {savings > 0 && <> · save {formatPrice(savings)} vs highest</>}
              </p>
            </div>
          </div>
          <PriceComparisonTable prices={prices} productId={pid} trust={trust} sellerTrust={sellerTrust} />
        </section>
        <aside className="lg:col-span-1 lg:sticky lg:top-20 self-start">
          <SmartVerdict product={product} trust={trust} />
        </aside>
      </div>

      {/* 3 — Reviews & trust */}
      <section className="mb-6 sm:mb-8">
        <div className="mb-4">
          <h2 className="font-sans text-xl sm:text-2xl font-extrabold tracking-[-0.02em] text-ink leading-tight">Reviews &amp; trust</h2>
          <p className="text-[11px] sm:text-xs text-gray font-mono mt-0.5">What buyers say across every seller</p>
        </div>
        <ReviewsPanel productId={pid} product={product} onTrustUpdated={onTrustUpdated} />
      </section>

      {/* 4 — Price history */}
      <section className="mb-2">
        <PriceHistoryChart history={history} dailySeries={dailySeries} />
      </section>

      {alertModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-3 sm:p-6 animate-fade-in"
          onClick={() => setAlertModalOpen(false)}
        >
          <div
            className="bg-cream rounded-3xl shadow-[var(--shadow-lift)] border border-line-strong w-full max-w-md p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-sans text-xl sm:text-2xl font-extrabold tracking-[-0.02em] text-ink">Track this price</h3>
                <p className="text-xs text-gray mt-1">We'll email you the moment it drops.</p>
              </div>
              <button
                onClick={() => setAlertModalOpen(false)}
                className="p-1.5 -mr-1 rounded-full hover:bg-ink/5 text-gray hover:text-ink"
                aria-label="Close"
              >
                <ArrowLeft className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-4 px-3 py-2.5 rounded-2xl bg-white border border-line">
              <input
                type="checkbox"
                checked={!!alertSettings.alertsEnabled}
                onChange={(e) => setAlertSettings((s) => ({ ...s, alertsEnabled: e.target.checked }))}
                className="mt-0.5 w-4 h-4"
              />
              <span className="text-sm">
                <span className="font-semibold text-ink">Enable price alerts</span>
                <span className="block text-[11px] text-gray mt-0.5">
                  Currently lowest: <span className="font-mono">{formatPrice(lowestPrice)}</span>
                </span>
              </span>
            </label>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-mono text-gray mb-1.5">
                  Target price (notify when below)
                </label>
                <div className="flex items-center gap-2 bg-white border border-line rounded-2xl px-3 py-2">
                  <span className="text-gray font-mono">৳</span>
                  <input
                    type="number"
                    value={alertSettings.targetPrice}
                    onChange={(e) => setAlertSettings((s) => ({ ...s, targetPrice: e.target.value }))}
                    placeholder={lowestPrice ? Math.round(lowestPrice * 0.9).toString() : 'e.g. 65000'}
                    className="flex-1 bg-transparent outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-mono text-gray mb-1.5">
                  Or notify on any drop ≥ <b>{alertSettings.alertOnDropPercent}%</b>
                </label>
                <input
                  type="range"
                  min="1" max="50" step="1"
                  value={alertSettings.alertOnDropPercent}
                  onChange={(e) => setAlertSettings((s) => ({ ...s, alertOnDropPercent: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAlertModalOpen(false)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={saveAlertSettings}
                disabled={wishlistBusy}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {wishlistBusy ? 'Saving…' : 'Save alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
