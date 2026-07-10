import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  getHotDrops, getAllProducts, getMostSellers, getShowcase,
  getShops, getShopTrust, subscribeNewsletter,
} from '../api/api';
import SearchBar from '../components/SearchBar';
import SearchProductCard from '../components/SearchProductCard';
import SearchProductCardSkeleton from '../components/SearchProductCardSkeleton';
import { useAuth } from '../auth/AuthContext';
// ponytail: Protect hidden from frontend per request.
// import ProtectShowcase from '../components/ProtectShowcase';
import { TrustScore, deliveryText } from '../components/TrustBadge';
import { CategoryIcon } from '../lib/categoryIcon';
import FeedbackPulse from '../components/FeedbackPulse';
import LiveActivityPill from '../components/LiveActivityPill';
import {
  ArrowRight, ShieldCheck, Flame, TrendingDown, Truck, Heart, Check,
} from 'lucide-react';

function fmt(p) {
  if (p == null) return 'N/A';
  return '৳' + Number(p).toLocaleString('en-IN');
}
const fmtNum = (n) => (n == null ? '—' : Number(n).toLocaleString('en-IN'));

// Quick paths into the catalog — doubles as "what we cover", right under search.
const QUICK_CATS = [
  { label: 'Smartphones', category: 'smartphones' },
  { label: 'Laptops', category: 'laptops' },
  { label: 'Desktops & PC', category: 'desktops & pc' },
  { label: 'Monitors', category: 'monitors' },
  { label: 'Audio', category: 'headphones & audio' },
  { label: 'Accessories', category: 'accessories' },
];

// Normalise a hot-drop or a catalog product into one card shape.
function fromDrop(p) {
  return {
    id: p.id, slug: p.slug, name: p.name, category: p.category, imageUrl: p.imageUrl,
    price: p.currentPrice, oldPrice: p.peakPrice, pct: p.dropPct, kind: 'drop', sellers: null,
  };
}
function fromProduct(p) {
  const sellers = Array.isArray(p.prices) ? p.prices.length : 0;
  const lo = p.lowestPrice, hi = p.highestPrice;
  const savePct = (hi != null && lo != null && hi > lo) ? Math.round((hi - lo) / hi * 100) : 0;
  return {
    id: p.id, slug: p.slug, name: p.name, category: p.category, imageUrl: p.imageUrl,
    price: lo, oldPrice: savePct > 0 ? hi : null, pct: savePct, kind: 'save', sellers,
    product: p,
  };
}

export default function Home() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [shops, setShops] = useState([]);
  const [allProducts, setAllProducts] = useState(null);   // null = loading
  const [allProductsTrust, setAllProductsTrust] = useState({});
  const [homePulseArmed, setHomePulseArmed] = useState(false);

  useEffect(() => {
    // Arm feedback pulse after 10 seconds
    const timer = setTimeout(() => setHomePulseArmed(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // All Products Grid — grab 24 products with the most sellers (minimum 6).
    getMostSellers(24, 6)
      .then((res) => {
        const ps = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setAllProducts(ps);
        const slugs = [...new Set(ps.map((p) => {
          const prices = (p.prices || []).slice().sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
          return prices[0]?.siteSlug || prices[0]?.siteName;
        }).filter(Boolean))].slice(0, 50);
        if (slugs.length) {
          getShopTrust(slugs).then((tr) => setAllProductsTrust(tr.data || {})).catch(() => {});
        }
      })
      .catch(() => setAllProducts([]));

    // Deals rail: prefer real hot-drops; fall back to featured catalog with
    // cross-seller savings so the rail is never empty.
    getHotDrops(10)
      .then((r) => {
        const drops = Array.isArray(r.data) ? r.data : [];
        if (drops.length >= 4) { setDeals(drops.slice(0, 10).map(fromDrop)); return; }
        return getAllProducts(0, 14).then((res) => {
          const ps = (res.data?.content || []).filter((p) => p.lowestPrice != null && p.imageUrl);
          setDeals(ps.slice(0, 10).map(fromProduct));
        });
      })
      .catch(() => {
        getAllProducts(0, 14).then((res) => {
          const ps = (res.data?.content || []).filter((p) => p.lowestPrice != null && p.imageUrl);
          setDeals(ps.slice(0, 10).map(fromProduct));
        }).catch(() => {});
      });

    // Most-trusted well-stocked shops (real trust scores).
    getShops().then((r) => {
      const dir = (Array.isArray(r.data) ? r.data : []).filter((s) => s.productCount > 0).slice(0, 14);
      if (!dir.length) return;
      getShopTrust(dir.map((s) => s.slug))
        .then((tr) => {
          const t = tr.data || {};
          const ranked = dir
            .map((s) => ({ ...s, trust: t[s.slug] || null }))
            .sort((a, b) => (b.trust?.trustScore ?? 0) - (a.trust?.trustScore ?? 0))
            .slice(0, 5);
          setShops(ranked);
        })
        .catch(() => setShops(dir.slice(0, 5)));
    }).catch(() => {});
  }, []);

  const handleSearch = (query) => {
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <title>Damkemon - The Ultimate Price Comparison Engine</title>
        <meta name="description" content="Find the best deals on laptops, phones, and tech gear across trusted BD sellers. Never overpay again." />
      </Helmet>

      {/* ── Hero: the brand question, a search box, and nothing else ── */}
      <section className="relative container-tight pt-6 sm:pt-10 lg:pt-14 pb-8 text-center flex flex-col items-center">
        {/* The taka sign IS the subject — one quiet watermark, no decoration elsewhere. */}
        <span
          aria-hidden="true"
          className="hidden md:block absolute -top-16 -right-8 lg:right-4 font-sans font-extrabold text-[22rem] lg:text-[28rem] leading-none text-acid/15 select-none pointer-events-none -rotate-6"
        >
          ৳
        </span>

        <div className="relative">
          <h1 className="max-w-4xl mx-auto mb-4">
            <span className="block font-sans font-extrabold leading-[0.92] tracking-[-0.04em] text-[clamp(3.2rem,8vw,6.5rem)] text-ink">
              Dam <span className="bg-acid px-3 -mx-1 inline-block">kemon?</span>
            </span>
          </h1>

          <div className="w-full max-w-2xl mx-auto relative z-10 text-left mt-6">
            <SearchBar large onSearch={handleSearch} />
          </div>

          {/* Quick paths into the catalog */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-2xl mx-auto">
            {QUICK_CATS.map((c) => (
              <Link
                key={c.category}
                to={`/browse?category=${encodeURIComponent(c.category)}`}
                className="inline-flex items-center gap-1.5 bg-white border border-line hover:border-ink text-ink/80 hover:text-ink text-[13px] font-semibold px-3.5 py-2 rounded-full transition-colors"
              >
                <CategoryIcon category={c.category} className="w-3.5 h-3.5 text-acid-deep" />
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Today's deals (scroll rail) ──────────────────────────── */}
      <section className="container-tight pt-6 sm:pt-8">
        <div className="flex items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#FFECE8] text-[#FF4A2A] px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3">
              <Flame className="w-3 h-3" /> Today's deals
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A2A] animate-pulse-dot ml-0.5" />
            </div>
            <h2 className="font-sans font-extrabold text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight tracking-tight text-[#2A2A2A]">
              Deals you can check <span className="text-acid-deep">right now</span>
            </h2>
          </div>
          <Link to="/browse" className="text-[13px] font-bold text-[#A3A3A3] hover:text-[#2A2A2A] transition-colors inline-flex items-center gap-1.5 shrink-0 uppercase tracking-widest">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 pb-4">
          {(deals.length ? deals : Array.from({ length: 6 })).slice(0, 10).map((d, i) => (
            d ? (
              <Link
                key={d.id}
                to={`/product/${d.id || d.slug}`}
                state={d.product ? { product: d.product } : undefined}
                className="group snap-start shrink-0 w-[170px] sm:w-[220px] bg-white rounded-[1.25rem] overflow-hidden flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-black/[0.03] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-square bg-[#F8F8F6] flex items-center justify-center p-5 overflow-hidden">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <CategoryIcon category={d.category} className="w-10 h-10 text-black/10" />
                  )}
                  {d.pct > 0 && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-[#FF4A2A] text-white shadow-sm">
                      <TrendingDown className="w-3 h-3" /> {d.kind === 'drop' ? `${d.pct}%` : `save ${d.pct}%`}
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col bg-white">
                  {d.category && <span className="text-[9px] uppercase tracking-widest text-[#8C8C8C] font-bold mb-1.5">{d.category}</span>}
                  <h3 className="font-sans text-[14px] font-bold text-[#2A2A2A] leading-[1.3] line-clamp-2 group-hover:text-acid-deep transition-colors">{d.name}</h3>
                  <div className="mt-auto pt-4 flex items-baseline flex-wrap gap-x-2 gap-y-1">
                    <span className="font-sans text-[1.15rem] font-extrabold text-[#2A2A2A] tracking-tight">{fmt(d.price)}</span>
                    {/* ponytail: cut price hidden per request — only show the live price. */}
                  </div>
                </div>
              </Link>
            ) : (
              <div key={i} className="snap-start shrink-0 w-[170px] sm:w-[220px] bg-white rounded-[1.25rem] overflow-hidden border border-black/[0.03] shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
                <div className="aspect-square bg-[#F8F8F6] animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-2 w-1/3 rounded bg-black/5 animate-pulse" />
                  <div className="h-4 rounded bg-black/5 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-black/5 animate-pulse" />
                  <div className="h-5 w-1/2 rounded bg-black/5 animate-pulse mt-4" />
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* ponytail: Protect spotlight hidden from frontend per request. Restore to bring it back. */}
      {/* <ProtectShowcase /> */}

      {/* ── All Products Grid ────── */}
      <section className="container-tight pt-10 sm:pt-16">
        <div className="flex items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h2 className="font-sans font-extrabold text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight tracking-tight text-ink">
              Everything you need, <span className="text-acid-deep">in one place.</span>
            </h2>
            <p className="text-ink/60 text-[14px] sm:text-[16px] mt-2 font-medium max-w-xl">
              Browse our complete collection of products at the best prices, sorted just for you.
            </p>
          </div>
          <Link
            to="/browse"
            className="hidden sm:inline-flex text-[13px] font-bold text-[#A3A3A3] hover:text-[#2A2A2A] transition-colors items-center gap-1.5 shrink-0 uppercase tracking-widest"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {allProducts === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <SearchProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {allProducts.map((p) => (
                <SearchProductCard key={p.id || p.slug} product={p} trust={allProductsTrust} />
              ))}
            </div>
            
            <div className="mt-10 flex justify-center">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 bg-ink text-white hover:bg-ink/90 font-bold text-[14px] px-8 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                Browse all products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ── Trust strip: who you can safely buy from, one row ────── */}
      <section className="container-tight pt-10 sm:pt-14">
        <div className="flex items-end justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="font-sans font-extrabold text-[clamp(1.4rem,3vw,2rem)] leading-tight tracking-tight text-ink inline-flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-acid-deep shrink-0" />
            Shops you can trust
          </h2>
          <Link to="/sellers" className="text-[13px] font-bold text-[#A3A3A3] hover:text-[#2A2A2A] transition-colors inline-flex items-center gap-1.5 shrink-0 uppercase tracking-widest">
            All sellers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 pb-4">
          {(shops.length ? shops : Array.from({ length: 5 })).map((s, i) => (
            s ? (
              <Link
                key={s.slug}
                to="/sellers"
                className="group snap-start shrink-0 w-[230px] bg-white rounded-2xl border border-line hover:border-ink/30 p-4 sm:p-5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-sans text-2xl font-extrabold text-ink/15 tabular-nums leading-none">{String(i + 1).padStart(2, '0')}</span>
                  {s.trust?.trustScore != null && <TrustScore score={s.trust.trustScore} size="sm" showLabel={false} />}
                </div>
                <div className="mt-3 text-[15px] font-bold text-ink truncate group-hover:text-acid-deep transition-colors">{s.name}</div>
                <div className="text-[11px] text-gray mt-1 flex items-center gap-2">
                  <span className="font-mono">{fmtNum(s.productCount)} products</span>
                  {s.trust && deliveryText(s.trust) && (
                    <span className="inline-flex items-center gap-0.5"><Truck className="w-3 h-3" /> {deliveryText(s.trust)}</span>
                  )}
                </div>
              </Link>
            ) : (
              <div key={i} className="snap-start shrink-0 w-[230px] h-28 bg-white rounded-2xl border border-line animate-pulse" />
            )
          ))}
        </div>
      </section>

      {/* ── Close: turn a visit into a tracked price ─────────────── */}
      <section className="container-tight pt-10 sm:pt-14 pb-14 sm:pb-20">
        <CloseBand />
      </section>
      
      <FeedbackPulse armed={homePulseArmed} />
    </div>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

// One conversion block instead of four content sections: wishlist alerts for
// the signed-out, the weekly digest for everyone.
function CloseBand() {
  const { user } = useAuth();
  return (
    <div className="rounded-[2rem] bg-ink text-cream p-7 sm:p-10 lg:p-12 relative overflow-hidden">
      <span
        aria-hidden="true"
        className="absolute -bottom-24 -left-6 font-sans font-extrabold text-[16rem] leading-none text-acid/10 select-none pointer-events-none"
      >
        ৳
      </span>
      <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-cream px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 animate-bounce">
            🔥 Join 10,000+ smart shoppers
          </div>
          <h2 className="font-sans font-extrabold text-[clamp(1.7rem,3.6vw,2.6rem)] leading-[1.05] tracking-[-0.02em]">
            Never quietly <span className="text-acid">overpay</span> again.
          </h2>
          <p className="text-cream/60 text-[15px] mt-3 max-w-md">
            Wishlist any product and we&apos;ll email you the moment its price drops at any shop.
          </p>
          <Link
            to={user ? '/account' : '/sign-up'}
            className="mt-6 inline-flex items-center gap-2 bg-acid text-ink font-bold text-sm px-6 py-3.5 rounded-full hover:brightness-95 transition-all"
          >
            <Heart className="w-4 h-4" />
            {user ? 'Open your wishlist' : 'Create a free account'}
          </Link>
        </div>
        <NewsletterMini />
      </div>
    </div>
  );
}

function NewsletterMini() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | busy | done
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('busy');
    setError(null);
    try {
      await subscribeNewsletter(email.trim());
      setState('done');
    } catch {
      setError('Could not subscribe — try again.');
      setState('idle');
    }
  };

  return (
    <div className="lg:border-l lg:border-cream/10 lg:pl-14">
      <h3 className="font-sans text-lg font-bold">The Monday digest</h3>
      <p className="text-cream/60 text-sm mt-1.5 max-w-sm">
        The week&apos;s biggest real price drops, once a week. No spam, unsubscribe anytime.
      </p>
      {state === 'done' ? (
        <p className="mt-5 inline-flex items-center gap-2 text-acid font-semibold text-sm">
          <Check className="w-4 h-4" /> You&apos;re on the list — see you Monday.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 flex gap-2 max-w-sm">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 min-w-0 bg-cream/10 border border-cream/20 rounded-full px-4 py-2.5 text-sm text-cream placeholder-cream/40 focus:outline-none focus:border-acid"
          />
          <button
            type="submit"
            disabled={state === 'busy'}
            className="shrink-0 bg-cream text-ink text-sm font-bold px-5 py-2.5 rounded-full hover:bg-acid transition-colors disabled:opacity-60"
          >
            {state === 'busy' ? '…' : 'Join'}
          </button>
        </form>
      )}
      {error && <p className="text-red text-xs mt-2">{error}</p>}
    </div>
  );
}
