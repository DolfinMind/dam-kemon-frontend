import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getDashboardStats, getHotDrops, getAllProducts, getTrendingSearches, getLiveStats,
  getShops, getShopTrust,
} from '../api/api';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import SearchBar from '../components/SearchBar';
import AlphaBadge from '../components/AlphaBadge';
import ProtectShowcase from '../components/ProtectShowcase';
import { TrustScore, deliveryText } from '../components/TrustBadge';
import { CategoryIcon } from '../lib/categoryIcon';
import {
  ArrowRight, Play, Sparkles, ShieldCheck, Store, Crown, Flame,
  TrendingDown, TrendingUp, Search, Plus, Minus, Database, Layers, Zap, Star,
  BadgeCheck, Truck,
} from 'lucide-react';
// Phosphor duotone for the landing's feature icons — adds a premium, two-tone
// weight where Lucide's flat line look is more utilitarian.
import {
  MagnifyingGlass as PhSearch, Storefront as PhStore,
  ShieldCheck as PhShieldCheck, SealCheck as PhSealCheck,
} from '@phosphor-icons/react';

function fmt(p) {
  if (p == null) return 'N/A';
  return '৳' + Number(p).toLocaleString('en-IN');
}
const fmtNum = (n) => (n == null ? '—' : Number(n).toLocaleString('en-IN'));

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
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [live, setLive] = useState(null);
  const [trending, setTrending] = useState([]);
  const [deals, setDeals] = useState([]);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    getDashboardStats().then((r) => setStats(r.data)).catch(() => {}).finally(() => setStatsLoading(false));
    getLiveStats().then((r) => setLive(r.data)).catch(() => {});
    getTrendingSearches(10).then((r) => setTrending(Array.isArray(r.data) ? r.data : [])).catch(() => {});

    // Examples grid: prefer real hot-drops; fall back to featured catalog with
    // cross-seller savings so the grid is never empty.
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
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="container-tight pt-4 sm:pt-6 lg:pt-8 pb-6 text-center flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="chip chip-ghost !text-ink/70">
            <Store className="w-3.5 h-3.5 text-acid-deep" /> Bangladesh price comparison
          </span>
          <AlphaBadge />
        </div>

        <h1 className="font-sans font-extrabold leading-[0.95] tracking-[-0.04em] text-[clamp(2.5rem,5vw,4.5rem)] text-ink max-w-4xl mx-auto">
          <span className="bg-acid px-3 py-1 -ml-3 mr-1 inline-block">Compare</span> prices across <span className="text-acid-deep">every online shop</span> in Bangladesh.
        </h1>
        
        <p className="text-[15px] sm:text-lg text-ink/65 max-w-2xl mx-auto mt-6 mb-10 leading-relaxed">
          Stop guessing if you are getting a good deal. Instantly compare prices from trusted BD e-commerce sites, check scam risks, and track price drops.
        </p>

        {/* Search & Stats Row */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 lg:gap-6">
            {/* Products Stat (Left) */}
            <div className="hidden md:flex shrink-0 w-44 lg:w-52 text-left">
              <StatBlock
                value={stats?.totalProducts}
                loading={statsLoading}
                label="Products"
              />
            </div>

            {/* Search Bar (Center Focus) */}
            <div className="w-full max-w-2xl flex-1 relative z-10 flex flex-col justify-center text-left">
              <SearchBar large onSearch={handleSearch} sellerCount={stats?.totalSellers} />
            </div>

            {/* Sellers Stat (Right) */}
            <div className="hidden md:flex shrink-0 w-44 lg:w-52 text-left">
              <StatBlock
                value={stats?.totalSellers ?? stats?.totalSites}
                loading={statsLoading}
                label="Sellers"
                tone="acid"
              />
            </div>
          </div>

          {/* Mobile-only stats row (below search) */}
          <div className="md:hidden grid grid-cols-2 gap-4 mt-6 text-left">
             <StatBlock
               value={stats?.totalProducts}
               loading={statsLoading}
               label="Products"
             />
             <StatBlock
               value={stats?.totalSellers ?? stats?.totalSites}
               loading={statsLoading}
               label="Sellers"
               tone="acid"
             />
          </div>
        </div>

        {/* Trust micro-proofs below search */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-ink/65">
          <span className="inline-flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-acid-deep" /> Real prices, never fake</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-acid-deep" /> Scam-risk checked</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-acid-deep" /> Free for shoppers</span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <a href="#how" className="btn-ghost group">
            <Play className="w-3.5 h-3.5 fill-current" /> See how it works
          </a>
          <div className="flex items-center gap-2 text-[13px] text-ink/55">
            <span className="w-2 h-2 rounded-full bg-acid animate-pulse-dot" />
            {live ? <>{fmtNum(live.searchesToday)} searches today</> : 'Live across BD shops'}
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
              Biggest price drops <span className="text-acid-deep">right now</span>
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
                    {d.oldPrice && <span className="text-[12px] font-semibold text-[#A3A3A3] line-through">{fmt(d.oldPrice)}</span>}
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

      {/* ── Trust marquee ────────────────────────────────────────── */}
      <section className="container-tight pt-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gray shrink-0 max-w-[10rem] leading-relaxed">
            Comparing Bangladesh's biggest shops
          </p>
          <div className="relative flex-1 overflow-hidden mask-fade">
            <div className="flex items-center gap-8 sm:gap-12 animate-scroll w-max">
              {[...MARQUEE_SHOPS, ...MARQUEE_SHOPS].map((shop, i) => (
                <span key={i} className="flex items-center gap-3 font-sans font-bold text-lg sm:text-xl text-ink/40 whitespace-nowrap">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${shop.domain}&sz=128`} 
                    alt={shop.name} 
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain mix-blend-multiply opacity-60 grayscale" 
                  />
                  {shop.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Damkemon Protect spotlight — the standout anti-scam differentiator.
            This component already existed but was never rendered on the homepage. ── */}
      <ProtectShowcase />

      {/* ── "Out of the box" intro + feature cards ───────────────── */}
      <section className="container-tight pt-8 sm:pt-12">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-start">
          <h2 className="font-sans font-extrabold text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.03em] text-ink">
            The ultimate price comparison engine for Bangladesh
          </h2>
          <p className="text-ink/65 text-[15px] sm:text-lg leading-relaxed lg:pt-2">
            Whether you are looking for the lowest iPhone price in BD, the best laptop deals, or verified authentic electronics, we bring every shop together in one place. Line up the exact product across major platforms and hundreds of other sellers. We score each shop for trust, so you can buy safely with real prices—never fake discounts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-10">
          {/* Stat card (MAC's 920+) */}
          <div className="rounded-[1.75rem] bg-ink text-cream p-7 sm:p-9 relative overflow-hidden min-h-[260px] flex flex-col justify-between">
            <div className="absolute -bottom-12 -left-10 w-56 h-56 rounded-full bg-acid/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="font-sans text-[clamp(3rem,7vw,4.5rem)] font-extrabold leading-none tracking-tight">
                <CountUp value={stats?.totalPricePoints} />
                <span className="text-acid">+</span>
              </div>
              <p className="text-cream/60 text-sm mt-2 max-w-[24ch]">prices compared so far — and growing every day</p>
            </div>
            <div className="relative flex items-center gap-2.5 mt-6">
              {[PhStore, PhSearch, PhShieldCheck, PhSealCheck].map((Icon, i) => (
                <span key={i} className="w-11 h-11 rounded-2xl bg-cream/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-acid" weight="duotone" />
                </span>
              ))}
              <span className="w-11 h-11 rounded-2xl bg-acid text-ink flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* HOW WE WORK card */}
          <a href="#how" className="group rounded-[1.75rem] bg-neutral-bg border border-line p-7 sm:p-9 relative overflow-hidden min-h-[260px] flex flex-col justify-between hover:border-line-strong transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-sans font-extrabold text-[clamp(1.4rem,3.5vw,2.25rem)] tracking-[0.12em] text-ink/85 leading-none">
                HOW&nbsp;WE&nbsp;WORK
              </span>
            </div>
            <p className="text-ink/55 text-sm max-w-[34ch]">
              Search, compare, and buy with confidence — the three steps that put every BD seller in one honest row.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink inline-flex items-center gap-1.5">
                Watch the flow <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="w-16 h-16 rounded-full bg-acid flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(159,226,49,0.6)] group-hover:scale-105 transition-transform">
                <Play className="w-6 h-6 text-ink fill-ink ml-0.5" />
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* ── Most-trusted shops + Testimonial ─────────────────────── */}
      <section className="container-tight pt-8 sm:pt-12">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-stretch">
          {/* Trusted shops */}
          <div className="rounded-[1.75rem] bg-neutral-bg border border-line p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck className="w-5 h-5 text-acid-deep" />
              <h3 className="font-sans text-lg font-bold text-ink">Most-trusted shops</h3>
            </div>
            <div className="space-y-4">
              {(shops.length ? shops : Array.from({ length: 5 })).map((s, i) => (
                s ? (
                  <Link key={s.slug} to="/sellers" className="flex items-center gap-3 group">
                    <span className="font-sans text-lg font-extrabold text-ink/20 w-6 shrink-0 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink truncate group-hover:text-acid-deep transition-colors">{s.name}</div>
                      <div className="text-[11px] text-gray inline-flex items-center gap-2">
                        <span className="font-mono">{fmtNum(s.productCount)} products</span>
                        {s.trust && deliveryText(s.trust) && (
                          <span className="inline-flex items-center gap-0.5"><Truck className="w-3 h-3" /> {deliveryText(s.trust)}</span>
                        )}
                      </div>
                    </div>
                    {s.trust?.trustScore != null && <TrustScore score={s.trust.trustScore} size="sm" showLabel={false} />}
                  </Link>
                ) : (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-sans text-lg font-extrabold text-ink/15 w-6 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1 h-8 rounded-lg bg-ink/[0.04] animate-pulse" />
                  </div>
                )
              ))}
            </div>
            <Link to="/sellers" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-acid-deep transition-colors">
              All sellers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Testimonial carousel */}
          <Testimonials />
        </div>
      </section>

      {/* ── How it works (steps) ─────────────────────────────────── */}
      <section id="how" className="container-tight pt-8 sm:pt-12 scroll-mt-24">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-px bg-acid-deep" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gray">How it works</span>
        </div>
        <h2 className="font-sans font-extrabold text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.03em] text-ink max-w-2xl mb-10">
          The whole market, <span className="text-acid-deep">one search.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="group rounded-[1.5rem] bg-surface border border-line p-7 hover:shadow-[var(--shadow-lift)] hover:border-line-strong transition-all relative">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-sans text-5xl font-extrabold text-ink/10 leading-none tabular-nums">{s.num}</span>
                  <span className="w-12 h-12 rounded-2xl bg-acid-soft text-acid-deep flex items-center justify-center group-hover:bg-acid group-hover:text-ink transition-colors">
                    <Icon className="w-5 h-5" weight="duotone" />
                  </span>
                </div>
                <h3 className="font-sans text-lg font-bold text-ink mb-2">{s.title}</h3>
                <p className="text-ink/60 text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-5 w-6 h-6 text-ink/15 z-10" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="container-tight pt-8 sm:pt-12">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-14">
          <div>
            <h2 className="font-sans font-extrabold text-[clamp(1.8rem,4.5vw,2.75rem)] leading-[1.05] tracking-[-0.03em] text-ink">
              Price-comparison FAQs
            </h2>
            <p className="text-ink/60 text-[15px] mt-4 mb-7 leading-relaxed max-w-sm">
              Learn how Damkemon gathers live prices, scores seller trust, and protects your online shopping in Bangladesh from advance payment scams.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/browse" className="btn-primary">Browse products</Link>
              <Link to="/protect" className="btn-ghost">Try Protect</Link>
            </div>
          </div>
          <Faq />
        </div>
      </section>

      {/* ── Guides & insights ────────────────────────────────────── */}
      <section className="container-tight pt-8 sm:pt-12">
        <div className="flex items-end justify-between mb-8 gap-4">
          <h2 className="font-sans font-extrabold text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.05] tracking-[-0.03em] text-ink max-w-xl">
            Guides that help you buy smarter in Bangladesh.
          </h2>
          <Link to="/guides" className="text-sm font-semibold text-ink/70 hover:text-ink inline-flex items-center gap-1.5 shrink-0">
            See more <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {INSIGHTS.map((p) => (
            <Link key={p.title} to={p.to} className="group card-soft p-6 flex flex-col">
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${p.tone}`}>
                <p.icon className="w-5 h-5" weight="duotone" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray mb-2">{p.read} min read</span>
              <h3 className="font-sans text-lg font-bold text-ink leading-snug group-hover:text-acid-deep transition-colors">{p.title}</h3>
              <p className="text-ink/60 text-sm mt-2 leading-relaxed flex-1">{p.desc}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                Read guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Big CTA (dark band) ──────────────────────────────────── */}
      <section className="container-tight pt-6 sm:pt-8 pb-4">
        <div className="rounded-[2rem] bg-ink text-cream px-6 sm:px-10 lg:px-16 py-14 sm:py-20 relative overflow-hidden">
          <div className="absolute -top-24 right-10 w-96 h-96 rounded-full bg-acid/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-10 w-96 h-96 rounded-full bg-red/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <h2 className="font-sans font-extrabold text-[clamp(2rem,5.5vw,4rem)] leading-[1.0] tracking-[-0.03em] max-w-2xl">
              Ready to find the<br />best price?
            </h2>
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4">
              <button onClick={() => document.querySelector('input')?.focus()} className="btn-acid shrink-0 !text-base !px-7 !py-4">
                Search a product <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-cream/50 text-[13px] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-acid shrink-0" /> Free for shoppers, always.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── data ───────────────────────── */

const MARQUEE_SHOPS = [
  { name: 'StarTech', domain: 'startech.com.bd' },
  { name: 'Daraz', domain: 'daraz.com.bd' },
  { name: 'Ryans', domain: 'ryanscomputers.com' },
  { name: 'Pickaboo', domain: 'pickaboo.com' },
  { name: 'TechLand', domain: 'techlandbd.com' },
  { name: 'Othoba', domain: 'othoba.com' },
  { name: 'Gadget & Gear', domain: 'gadgetandgear.com' },
  { name: 'Computer Source', domain: 'computersourcebd.com' },
  { name: 'AjkerDeal', domain: 'ajkerdeal.com' },
  { name: 'Diamu', domain: 'diamu.com.bd' }
];

const STEPS = [
  { num: '01', title: 'Search once', desc: 'Type any product and see every shop in Bangladesh that sells it — no more juggling a dozen browser tabs.', icon: PhSearch },
  { num: '02', title: 'Compare side by side', desc: 'Every seller’s price, trust score and delivery promise lined up in a single, honest row.', icon: PhStore },
  { num: '03', title: 'Buy with confidence', desc: 'Pick the lowest price from a seller you can trust — and never quietly overpay again.', icon: PhShieldCheck },
];

// NOTE: placeholder testimonials — swap in real shopper quotes when you have them.
const QUOTES = [
  { text: 'I used to open six tabs to check one phone price. Now it’s a single search and I can see who’s actually cheapest — and who I can trust to deliver.', name: 'Rafa H.', role: 'Shopper · Dhaka' },
  { text: 'The trust score flagged a seller with a suspiciously low price. Damkemon basically saved me from a scam before I paid a taka.', name: 'Tanvir A.', role: 'Shopper · Chattogram' },
  { text: 'Finally, a Bangladesh price comparison that doesn’t show made-up prices. What it says is the price, is the price.', name: 'Nusrat J.', role: 'Shopper · Sylhet' },
];

const INSIGHTS = [
  { title: 'Why one search beats ten browser tabs', desc: 'See every shop that sells your product — price, trust and delivery, side by side.', read: 4, to: '/guides/why-one-search-beats-ten-browser-tabs', icon: PhSearch, tone: 'bg-acid-soft text-acid-deep' },
  { title: 'Buying from an unknown seller? Use Protect', desc: 'Check the scam risk and open a protected order before you hand over money.', read: 3, to: '/guides/buying-from-unknown-seller-use-protect', icon: PhShieldCheck, tone: 'bg-green-soft text-green' },
  { title: 'How our trust score spots fake low prices', desc: 'Delivery signals, review history and stock depth — combined into one number.', read: 5, to: '/guides/how-trust-score-spots-fake-low-prices', icon: PhSealCheck, tone: 'bg-yellow-soft text-ink' },
];

/* ───────────────────────── pieces ───────────────────────── */

// Count a number up from 0 → target once it arrives (easeOutCubic).
function useCountUp(target, duration = 1400) {
  const [display, setDisplay] = useState(null);
  const fromRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    if (target == null) { setDisplay(null); return; }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) { setDisplay(target); fromRef.current = target; return; }
    const from = fromRef.current;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(from + (target - from) * ease(t)));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return display;
}

function CountUp({ value }) {
  const d = useCountUp(value);
  return d != null ? Number(d).toLocaleString('en-IN') : '—';
}

// MAC-style stat block: big number + plus + caption.
function StatBlock({ value, label, loading, tone }) {
  const display = useCountUp(value);
  const acid = tone === 'acid';
  return (
    <div className={`rounded-[1.25rem] px-5 py-4 sm:py-[1.15rem] border ${acid ? 'bg-acid border-acid' : 'bg-surface border-line'} flex flex-col justify-center`}>
      <div className={`font-sans text-[clamp(1.85rem,4.4vw,2.9rem)] font-extrabold leading-none tracking-tight tabular-nums text-ink`}>
        {display != null ? Number(display).toLocaleString('en-IN') : (loading ? <span className="inline-block h-7 w-14 rounded bg-ink/10 animate-pulse" /> : '—')}
        <span className={acid ? 'text-ink/70' : 'text-acid-deep'}>+</span>
      </div>
      <p className={`font-sans font-bold text-base sm:text-lg tracking-[-0.01em] mt-1.5 ${acid ? 'text-ink' : 'text-ink/85'}`}>{label}</p>
    </div>
  );
}

// Green growth bars (recharts) — a stylized rising trend ending near the real total.
function GrowthBars({ total }) {
  const data = useMemo(() => {
    const end = total && total > 0 ? total : 100;
    const f = [0.16, 0.27, 0.36, 0.5, 0.62, 0.78, 0.9, 1];
    return f.map((x, i) => ({ name: i, v: Math.round(end * x) }));
  }, [total]);
  return (
    <div className="relative h-28 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barCategoryGap="22%">
          <Bar dataKey="v" radius={[5, 5, 0, 0]} isAnimationActive>
            {data.map((_, i) => (
              <Cell key={i} fill={i === data.length - 1 ? '#9FE231' : i >= data.length - 3 ? 'rgba(159,226,49,0.65)' : 'rgba(159,226,49,0.28)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  const q = QUOTES[i];
  const go = (d) => setI((p) => (p + d + QUOTES.length) % QUOTES.length);
  return (
    <div className="rounded-[1.75rem] bg-acid p-7 sm:p-10 flex flex-col justify-between min-h-[260px]">
      <div>
        <div className="flex gap-0.5 mb-5">
          {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="w-4 h-4 text-ink fill-ink" />)}
        </div>
        <blockquote className="font-sans text-ink text-xl sm:text-[1.7rem] font-semibold leading-snug tracking-[-0.01em]">
          “{q.text}”
        </blockquote>
      </div>
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-ink text-acid flex items-center justify-center font-sans font-bold">
            {q.name[0]}
          </span>
          <div>
            <div className="font-sans font-bold text-ink text-sm">{q.name}</div>
            <div className="text-ink/60 text-xs">{q.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-ink/60 text-xs tabular-nums mr-1">{String(i + 1).padStart(2, '0')}/{String(QUOTES.length).padStart(2, '0')}</span>
          <button onClick={() => go(-1)} aria-label="Previous" className="w-9 h-9 rounded-full border border-ink/20 text-ink flex items-center justify-center hover:bg-ink hover:text-acid transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
          <button onClick={() => go(1)} aria-label="Next" className="w-9 h-9 rounded-full bg-ink text-acid flex items-center justify-center hover:opacity-90 transition-opacity">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const FAQS = [
  { q: 'Where do the prices come from?', a: 'We bring together prices from shops right across Bangladesh and keep them updated, so a single search shows you a complete, side-by-side comparison in an instant.' },
  { q: 'Are the prices accurate and live?', a: 'We show real prices straight from each shop and keep them fresh — never fabricated numbers. If a listing goes stale we flag it rather than guess.' },
  { q: 'How does the trust score work?', a: 'Each shop is scored on real signals — delivery reliability, review history, how long it’s been active and how deep its stock is — combined into one number so you can spot a risky seller at a glance.' },
  { q: 'What is Damkemon Protect?', a: 'Buying from an unknown seller? Protect lets you check the scam risk and open a protected order before you pay, so your money isn’t gone if the deal goes wrong.' },
  { q: 'Is damkemon free to use?', a: 'Yes — searching and comparing prices is completely free for shoppers, always.' },
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-line border-t border-line">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between gap-4 py-5 text-left group"
            >
              <span className={`font-sans font-bold text-[15px] sm:text-base transition-colors ${isOpen ? 'text-ink' : 'text-ink/80 group-hover:text-ink'}`}>{f.q}</span>
              <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-acid text-ink' : 'bg-ink/[0.06] text-ink/60'}`}>
                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
              <p className="overflow-hidden text-ink/65 text-sm leading-relaxed max-w-xl">{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
