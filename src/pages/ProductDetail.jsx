import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getProduct, getProductHistory, getDailyPriceHistory, getShopTrust, getSellerTrust } from '../api/api';
import { trackAction, trackView } from '../api/analytics';
import { pushRecent } from '../api/recentlyViewed';
import { addToWishlist, removeFromWishlist, listWishlist, updateWishlistAlert } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import PriceComparisonTable from '../components/PriceComparisonTable';
import PriceHistoryChart from '../components/PriceHistoryChart';
import ReviewsPanel from '../components/ReviewsPanel';
import AddOffer from '../components/AddOffer';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductSEO from '../components/ProductSEO';
import ServiceUnavailable from '../components/ServiceUnavailable';
import NewsletterInline from '../components/NewsletterInline';
import FeedbackPulse from '../components/FeedbackPulse';
import {
  ArrowLeft, Share2, Bell, Store, AlertTriangle, Heart, Clock, ChevronDown,
} from 'lucide-react';
import { CategoryIcon } from '../lib/categoryIcon';
import { cleanName, saneSavePct, relTime } from '../lib/display';

function formatPrice(price) {
  if (!price && price !== 0) return 'N/A';
  return '৳' + Number(price).toLocaleString('en-IN');
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, pathname, search } = useLocation();
  // If the user arrived from a search result, the full product travels in
  // router state — use it immediately so the page renders even when the
  // backend can't look it up (e.g. live-search results before Mongo persists).
  const seedProduct = state?.product || null;

  const [product, setProduct] = useState(seedProduct);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(!seedProduct);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);
  const { user } = useAuth();
  const pid = product?.id || id;
  const memberAction = new URLSearchParams(search).get('memberAction');

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

  // Value-moment newsletter ask: only from the 2nd product viewed this
  // session — a first-time lander hasn't seen the value yet.
  const [showNewsletter, setShowNewsletter] = useState(false);
  useEffect(() => {
    try {
      // Count distinct products viewed — a Set so remounts (and StrictMode's
      // double effect run) can't inflate the count and fire the ask early.
      const ids = new Set(JSON.parse(sessionStorage.getItem('dk_pv') || '[]'));
      ids.add(id);
      sessionStorage.setItem('dk_pv', JSON.stringify([...ids]));
      if (ids.size >= 2) {
        if (localStorage.getItem('dk_nl')) return;
        if (Date.now() - Number(localStorage.getItem('dk_nl_x') || 0) < 14 * 24 * 3600 * 1000) return;
        // Drives only the inline card below the price table — the modal ask
        // lives solely in ExitIntentModal now (10s dwell, once per session).
        setShowNewsletter(true);
      }
    } catch { /* private mode */ }
  }, [id]);

  // One-click pulse survey, armed when the shopper returns from a store tab —
  // the moment they know whether we actually helped.
  const [pulseArmed, setPulseArmed] = useState(false);
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && sessionStorage.getItem('dk_outclick')) {
        sessionStorage.removeItem('dk_outclick');
        setPulseArmed(true);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [memberNotice, setMemberNotice] = useState(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    alertsEnabled: false,
    targetPrice: '',
    alertOnDropPercent: 10,
  });

  useEffect(() => {
    if (!user) { setInWishlist(false); return; }
    if (memberAction) return; // the pending-action effect owns this first load
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
  }, [user, pid, memberAction]);

  // Complete the exact action that motivated signup. The intent lives in the
  // whitelisted relative next URL, so it survives both Google and email auth.
  useEffect(() => {
    // Wait for the canonical Mongo ID; the route may contain a product slug.
    if (!user || !product?.id || !['save', 'track'].includes(memberAction)) return;
    const track = memberAction === 'track';
    const targetPid = product.id;
    const cleanParams = new URLSearchParams(search);
    cleanParams.delete('memberAction');
    const cleanPath = `${pathname}${cleanParams.size ? `?${cleanParams}` : ''}`;
    setWishlistBusy(true);
    addToWishlist(targetPid, track)
      .then(() => {
        setInWishlist(true);
        if (track) setAlertSettings((s) => ({ ...s, alertsEnabled: true }));
        setMemberNotice(track
          ? 'Price tracking is on. We’ll email you when it drops.'
          : 'Product saved to your wishlist.');
        trackAction(`member_action_completed_${memberAction}`, targetPid);
      })
      .catch(() => setMemberNotice('Your account is ready, but that action could not be saved. Try again.'))
      .finally(() => {
        setWishlistBusy(false);
        navigate(cleanPath, { replace: true, state });
      });
  }, [user, product?.id, memberAction, navigate, pathname, search, state]);

  const requestMemberAction = (action) => {
    const params = new URLSearchParams(search);
    params.set('memberAction', action);
    const next = `${pathname}?${params.toString()}`;
    trackAction(`member_intent_${action}`, pid);
    navigate(`/sign-up?next=${encodeURIComponent(next)}`);
  };

  const toggleWishlist = async () => {
    if (!pid) return;
    if (!user) { requestMemberAction('save'); return; }
    setWishlistBusy(true);
    try {
      if (inWishlist) { await removeFromWishlist(pid); setInWishlist(false); }
      else {
        await addToWishlist(pid, false);
        setInWishlist(true);
        setMemberNotice('Product saved to your wishlist.');
        trackAction('member_action_completed_save', pid);
      }
    } catch { /* noop */ }
    finally { setWishlistBusy(false); }
  };

  const openTrackPrice = async () => {
    if (!pid) return;
    if (!user) { requestMemberAction('track'); return; }
    // Turn tracking on with this click; the modal only customizes the threshold.
    if (!alertSettings.alertsEnabled) {
      setWishlistBusy(true);
      try {
        await addToWishlist(pid, true);
        setInWishlist(true);
        setAlertSettings((s) => ({ ...s, alertsEnabled: true }));
        setMemberNotice('Price tracking is on. We’ll email you when it drops.');
        trackAction('member_action_completed_track', pid);
      }
      catch { return; }
      finally { setWishlistBusy(false); }
    }
    setAlertSettings((s) => ({ ...s, alertsEnabled: true }));
    setAlertModalOpen(true);
  };

  const saveAlertSettings = async () => {
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
      if (alertSettings.alertsEnabled) {
        setMemberNotice('Price tracking is on. We’ll email you when it drops.');
      }
    } catch { /* noop */ }
    finally { setWishlistBusy(false); }
  };

  const [dailySeries, setDailySeries] = useState([]);
  useEffect(() => {
    if (!pid) return;
    getDailyPriceHistory(pid, 30).then((r) => {
      setDailySeries(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {});
  }, [pid]);

  // Trust / delivery / genuineness profiles for every seller on this product,
  // fetched in one batched call keyed by shop slug.
  const [trust, setTrust] = useState({});
  useEffect(() => {
    const slugs = [...new Set((product?.prices || []).map((p) => p.siteSlug || p.siteName).filter(Boolean))];
    if (slugs.length === 0) { setTrust({}); return; }
    let alive = true;
    getShopTrust(slugs).then((r) => { if (alive && r.data) setTrust(r.data); }).catch(() => {});
    return () => { alive = false; };
  }, [product?.id, product?.prices, id]);

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
  }, [product?.id, product?.prices, id]);

  // A freshly submitted review returns the seller's updated trust profile —
  // merge it so the comparison table reflects it without a refetch.
  const onTrustUpdated = (t) => {
    if (t && t.shopSlug) setTrust((m) => ({ ...m, [t.shopSlug]: t }));
  };

  // ── Decision math for the hero "best deal" champion ───────────────────────
  // One row per seller — duplicate listings keep only their cheapest price.
  const prices = useMemo(() => {
    const sorted = [...(product?.prices || [])].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    const seen = new Set();
    return sorted.filter((p) => {
      const key = p.sellerId || `${p.siteSlug || p.siteName}|${p.sellerName || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [product?.prices]);
  const lowestPrice = useMemo(() => {
    const vals = prices.map((p) => p.price).filter((v) => v != null);
    return vals.length ? Math.min(...vals) : (product?.lowestPrice ?? null);
  }, [prices, product?.lowestPrice]);
  const highestPrice = useMemo(() => {
    // Prefer the index-time field so the comparison spread is stable.
    if (product?.highestPrice != null) return product.highestPrice;
    const vals = prices.map((p) => p.price).filter((v) => v != null);
    return vals.length ? Math.max(...vals) : null;
  }, [prices, product?.highestPrice]);
  // Hidden when the spread is implausible for one product (bad match, not a deal).
  const savings = saneSavePct(lowestPrice, highestPrice) > 0 ? highestPrice - lowestPrice : 0;
  const sellerCount = product?.totalSellerCount ?? prices.length;
  const cheapest = prices.find((p) => p.price === lowestPrice) || null;
  const pick = cheapest;

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
          We can’t find this product. Start a new search from the home page.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container-tight py-3 sm:py-5 lg:py-6">
      <ProductSEO product={product} />
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-gray hover:text-ink text-xs font-bold mb-3 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      {/* Product identity is context, not the destination. */}
      <header className="rounded-3xl border border-line bg-white p-3 sm:p-4 mb-4 sm:mb-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-surface-alt border border-line flex items-center justify-center p-2 overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <CategoryIcon category={product.category} className="w-8 h-8 text-ink/15" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-sans text-lg sm:text-2xl lg:text-[28px] font-extrabold text-ink leading-tight tracking-[-0.025em] line-clamp-2">
              {cleanName(product.name)}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] font-mono text-gray">
              <span className="inline-flex items-center gap-1 font-bold text-ink"><Store className="w-3.5 h-3.5" /> {sellerCount} {sellerCount === 1 ? 'shop' : 'shops'}</span>
              {relTime(product.lastScraped || product.updatedAt) && (
                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Checked {relTime(product.lastScraped || product.updatedAt)}</span>
              )}
              {product.category && <span className="capitalize hidden sm:inline">{product.category}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button onClick={toggleWishlist} disabled={wishlistBusy} aria-label={inWishlist ? 'Remove from saved products' : 'Save product'} title={inWishlist ? 'Saved' : 'Save'} className={`w-9 h-9 sm:w-auto sm:px-3 rounded-full border inline-flex items-center justify-center gap-1.5 text-xs font-bold transition-colors ${inWishlist ? 'border-red/30 bg-red-soft text-red' : 'border-line text-gray hover:text-ink'}`}>
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red' : ''}`} /><span className="hidden sm:inline">{inWishlist ? 'Saved' : 'Save'}</span>
            </button>
            <button onClick={openTrackPrice} disabled={wishlistBusy} aria-label="Track price drops" title="Track price drops" className={`w-9 h-9 sm:w-auto sm:px-3 rounded-full border inline-flex items-center justify-center gap-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${alertSettings.alertsEnabled ? 'border-green/30 bg-green-soft text-green' : 'border-line text-gray hover:text-ink'}`}>
              <Bell className="w-4 h-4" /><span className="hidden sm:inline">{alertSettings.alertsEnabled ? 'Tracking' : 'Track'}</span>
            </button>
            <button
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) navigator.share({ title: product.name, url }).catch(() => {});
                else navigator.clipboard?.writeText(url);
              }}
              aria-label="Share this comparison"
              title="Share"
              className="w-9 h-9 rounded-full border border-line text-gray hover:text-ink inline-flex items-center justify-center transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {memberNotice && (
          <p role="status" className="mt-3 rounded-2xl bg-acid-soft px-3 py-2 text-center text-xs font-semibold text-ink">
            {memberNotice}
          </p>
        )}
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,.85fr)] gap-5 lg:gap-6 items-start">
        <section aria-labelledby="price-check-title" className="min-w-0">
          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-acid-deep mb-1">Shop-first comparison</p>
              <h2 id="price-check-title" className="font-sans text-xl sm:text-2xl font-extrabold tracking-[-0.02em] text-ink">See the shops, not the sales pitch</h2>
            </div>
            <p className="hidden sm:block text-right text-[10px] font-mono text-gray shrink-0">
              Lowest {formatPrice(lowestPrice)}<br />
              {savings > 0 ? `${formatPrice(savings)} price spread` : `${sellerCount} live ${sellerCount === 1 ? 'offer' : 'offers'}`}
            </p>
          </div>

          <PriceComparisonTable
            prices={prices}
            productId={pid}
            trust={trust}
            sellerTrust={sellerTrust}
            recommended={pick}
          />

          {showNewsletter && <div className="mt-4"><NewsletterInline /></div>}
          <AddOffer productId={pid} />
        </section>

        <section id="reviews-section" aria-labelledby="reviews-title" className="min-w-0">
          <div className="mb-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-acid-deep mb-1">Buyer reality check</p>
            <h2 id="reviews-title" className="font-sans text-xl sm:text-2xl font-extrabold tracking-[-0.02em] text-ink">What happened after checkout</h2>
            <p className="text-xs text-gray mt-1">Seller-specific reviews, delivery and trust—not product hype.</p>
          </div>
          <ReviewsPanel productId={pid} product={product} onTrustUpdated={onTrustUpdated} initialVisible={3} />
        </section>
      </main>

      <details className="group mt-5 rounded-3xl border border-line bg-white overflow-hidden">
        <summary className="list-none cursor-pointer flex items-center justify-between gap-3 px-4 sm:px-5 py-4 text-sm font-bold text-ink hover:bg-cream-soft/50 transition-colors">
          <span>
            Price history <span className="ml-1 text-xs font-normal text-gray">See whether today’s price is actually good</span>
          </span>
          <ChevronDown className="w-4 h-4 text-gray transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-line p-3 sm:p-5">
          <PriceHistoryChart history={history} dailySeries={dailySeries} />
        </div>
      </details>

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
                <h3 className="font-sans text-xl sm:text-2xl font-extrabold tracking-[-0.02em] text-ink">Plan a Genius Comeback</h3>
                <p className="text-xs text-gray mt-1">Smart shoppers wait. We’ll email you the moment the price drops.</p>
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
      <FeedbackPulse armed={pulseArmed} />
    </div>
  );
}
