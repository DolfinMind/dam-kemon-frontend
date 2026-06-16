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
import { CategoryIcon } from '../lib/categoryIcon';

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
  const [ourReviews, setOurReviews] = useState(null);
  const [loading, setLoading] = useState(!seedProduct);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  const ratedReviews = ourReviews ? ourReviews.filter((r) => r.rating != null) : [];
  const avgOurRating = ratedReviews.length
    ? ratedReviews.reduce((s, r) => s + r.rating, 0) / ratedReviews.length
    : null;

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

      {/* ── HERO: Sleek Product Overview ──────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-8 sm:mb-12">
        {/* Product Image — Large, edge-to-edge subtle background */}
        <div className="lg:w-5/12 shrink-0">
          <div className="relative w-full aspect-square rounded-[2rem] bg-surface-alt flex items-center justify-center p-8 sm:p-12 overflow-hidden border border-line-strong/50">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <CategoryIcon category={product.category} className="w-24 h-24 text-ink/10" />
            )}
            {product.category && (
              <span className="absolute top-5 left-5 chip chip-ghost !text-[11px] !py-1 capitalize bg-white/80 backdrop-blur-md">{product.category}</span>
            )}
          </div>
        </div>

        {/* Product Details & Best Deal */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold mb-4 ${
              sellerCount > 1 ? 'bg-acid-soft text-acid-deep' : 'bg-cream-soft text-ink/60'
            }`}>
              <Store className="w-3.5 h-3.5" />
              {sellerCount === 0 ? 'No sellers' : sellerCount === 1 ? '1 seller tracked' : `${sellerCount} sellers tracked`}
            </span>

            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink leading-[1.05] tracking-[-0.03em] mb-4">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              {avgOurRating != null ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(avgOurRating) ? 'text-yellow fill-yellow' : 'text-line-strong'}`} />
                    ))}
                  </div>
                  <span className="text-ink font-bold text-sm">{avgOurRating.toFixed(1)}</span>
                  <span className="text-gray text-xs">
                    ({ratedReviews.length} {ratedReviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : ourReviews === null ? (
                <span className="text-gray text-xs animate-pulse">Loading reviews...</span>
              ) : (
                <button
                  onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray hover:text-ink text-xs transition-colors flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 text-yellow fill-yellow/20" /> Be the first to review
                </button>
              )}

              <div className="w-px h-4 bg-line-strong hidden sm:block" />

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleWishlist}
                  disabled={wishlistBusy}
                  className={`text-sm font-medium flex items-center gap-1.5 hover:text-ink transition-colors ${inWishlist ? 'text-red' : 'text-gray'}`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red' : ''}`} />
                  {inWishlist ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={openTrackPrice}
                  className={`text-sm font-medium flex items-center gap-1.5 hover:text-ink transition-colors ${alertSettings.alertsEnabled ? 'text-green' : 'text-gray'}`}
                >
                  <Bell className={`w-4 h-4 ${alertSettings.alertsEnabled ? 'fill-green/30' : ''}`} />
                  {alertSettings.alertsEnabled ? 'Tracking' : 'Track drops'}
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    if (navigator.share) navigator.share({ title: product.name, url }).catch(() => {});
                    else navigator.clipboard?.writeText(url);
                  }}
                  className="text-sm font-medium text-gray hover:text-ink flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>

          <hr className="border-line-strong/50 mb-6" />

          {/* Seamless Best Deal Block */}
          {cheapest ? (
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-gray font-bold">Lowest price available</span>
                  {savings > 0 && (
                    <span className="inline-flex items-center gap-1 bg-green/10 text-green px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                      Save {formatPrice(savings)}
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-3">
                  <div className="font-mono text-4xl sm:text-[44px] font-bold text-ink leading-none">{formatPrice(lowestPrice)}</div>
                  <div className="pb-1 flex flex-col gap-0.5">
                    {cheapest.originalPrice && cheapest.originalPrice > lowestPrice && (
                      <s className="font-mono text-sm text-gray-soft">{formatPrice(cheapest.originalPrice)}</s>
                    )}
                    {champDiscount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-red">−{champDiscount}%</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-cream-soft rounded-[1.25rem] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-line">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-acid text-ink px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
                      <Crown className="w-3 h-3" /> Best value
                    </span>
                    <span className="font-sans font-bold text-ink text-base">{cheapestName}</span>
                    {cheapestVia && <span className="text-[11px] font-mono text-gray">via {cheapestVia}</span>}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {champTier && (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium ${champTier.text}`}>
                        <ShieldCheck className="w-3.5 h-3.5" /> {champScore}/100 DamKemon score
                      </span>
                    )}
                    {champDelivery && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray">
                        <Truck className="w-3 h-3" /> {champDelivery}
                      </span>
                    )}
                    {champShopT?.codAvailable && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray">
                        <Banknote className="w-3 h-3" /> COD
                      </span>
                    )}
                  </div>

                  {sellerCount > 1 && !sameAsCheapest && bestValueName && (
                    <div className="mt-2 text-[11px] text-gray/80 flex items-start gap-1">
                      <ArrowDown className="w-3.5 h-3.5 text-gray shrink-0" />
                      <span>Note: <b className="text-ink">{bestValueName}</b> is a smarter pick for {formatPrice(Math.abs(bestValueDiff))} more (see Smart Verdict).</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <a
                    href={champHref}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackClick(pid, cheapest.siteSlug || cheapest.siteName)}
                    className="btn-primary !px-6 !py-3 w-full sm:w-auto text-center"
                  >
                    Visit store <ExternalLink className="w-4 h-4" />
                  </a>
                  <Link
                    to={`/protect?productId=${encodeURIComponent(pid)}&shopSlug=${encodeURIComponent(cheapest.siteSlug || cheapest.siteName || '')}&itemName=${encodeURIComponent(product.name || '')}&amount=${lowestPrice || ''}`}
                    className="text-[11px] font-mono font-medium text-gray hover:text-ink transition-colors inline-flex items-center justify-center gap-1 w-full sm:w-auto"
                  >
                    <ShieldCheck className="w-3 h-3" /> Buy Protected
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-cream-soft rounded-[1.25rem] border border-line p-8 flex flex-col items-center justify-center text-center">
              <Store className="w-8 h-8 text-ink/20 mb-3" />
              <p className="font-sans text-lg font-extrabold text-ink">No sellers found yet</p>
              <p className="text-sm text-gray mt-1">We're actively scanning the market for this product.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Compare & Verdict ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-8 mb-8 sm:mb-12">
        <section>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink leading-tight mb-1">Compare all sellers</h2>
              <p className="text-[12px] text-gray font-mono">
                {sellerCount} {sellerCount === 1 ? 'seller' : 'sellers'} · Lowest: <span className="font-bold">{formatPrice(lowestPrice)}</span>
                {savings > 0 && <> · Save up to {formatPrice(savings)} vs highest</>}
              </p>
            </div>
          </div>
          <PriceComparisonTable prices={prices} productId={pid} trust={trust} sellerTrust={sellerTrust} />
        </section>

        <section>
          <SmartVerdict product={product} trust={trust} />
        </section>
      </div>

      {/* ── Reviews & trust ────────────────────────────────────────────────── */}
      <section id="reviews-section" className="mb-8 sm:mb-12">
        <div className="mb-5">
          <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink leading-tight mb-1">Reviews &amp; Trust</h2>
          <p className="text-sm text-gray">What buyers say across every seller.</p>
        </div>
        <ReviewsPanel productId={pid} product={product} onTrustUpdated={onTrustUpdated} onReviewsLoaded={setOurReviews} />
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
