import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getDashboardStats, getHotDrops, getAllProducts, getTrendingSearches, getLiveStats,
  getShops, getShopTrust,
} from '../api/api';
import SearchBar from '../components/SearchBar';
import AlphaBadge from '../components/AlphaBadge';
import ProtectShowcase from '../components/ProtectShowcase';
import { SHOW_SAATHI } from '../config/features';
import { TrustScore, deliveryText } from '../components/TrustBadge';
import {
  Sparkles, ShieldCheck, Store, ArrowRight, Crown, Flame, Truck,
  Radio, MessageSquare, BadgeCheck, ShoppingBag, TrendingDown,
} from 'lucide-react';

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

    // Top-deals grid: prefer real hot-drops; fall back to featured catalog with
    // cross-seller savings so the grid is never empty.
    getHotDrops(8)
      .then((r) => {
        const drops = Array.isArray(r.data) ? r.data : [];
        if (drops.length >= 4) { setDeals(drops.slice(0, 8).map(fromDrop)); return; }
        return getAllProducts(0, 12).then((res) => {
          const ps = (res.data?.content || []).filter((p) => p.lowestPrice != null && p.imageUrl);
          setDeals(ps.slice(0, 8).map(fromProduct));
        });
      })
      .catch(() => {
        getAllProducts(0, 12).then((res) => {
          const ps = (res.data?.content || []).filter((p) => p.lowestPrice != null && p.imageUrl);
          setDeals(ps.slice(0, 8).map(fromProduct));
        }).catch(() => {});
      });

    // Sidebar: most-trusted well-stocked shops (real trust scores).
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

  const steps = [
    { num: '01', title: 'Search once', desc: 'Type any product and see every shop that sells it — no more juggling a dozen browser tabs.', icon: Sparkles },
    { num: '02', title: 'Compare side by side', desc: 'Every seller’s price, trust score and delivery promise lined up in a single, honest row.', icon: Store },
    { num: '03', title: 'Buy with confidence', desc: 'Pick the lowest price from a seller you can trust — and never quietly overpay again.', icon: ShieldCheck },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="container-tight pt-5 sm:pt-7 lg:pt-9">
        <div className="relative rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden border border-line-strong bg-gradient-to-br from-lime-soft via-cream-soft to-blue-soft p-6 sm:p-10 lg:p-14">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-red/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-12 w-80 h-80 rounded-full bg-lime/20 blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="tag-bar"><Store className="w-3.5 h-3.5" /> Bangladesh price comparison</div>
                <AlphaBadge />
              </div>
              <h1 className="font-serif font-semibold leading-[0.95] tracking-[-0.03em] text-[clamp(2.4rem,6.5vw,4.5rem)] text-ink">
                <em className="text-red font-medium">Dam kemon,</em><br />really?
              </h1>
              <p className="text-[15px] sm:text-lg text-ink/70 max-w-xl mt-4 mb-6 leading-relaxed">
                One search across <span className="font-semibold text-ink">{stats?.totalSellers ? fmtNum(stats.totalSellers) : (stats?.totalSites ?? '2,000+')} Bangladesh shops</span> —
                every seller's price &amp; trust, side by side. The smart buy wins.
              </p>
              <SearchBar large onSearch={handleSearch} sellerCount={stats?.totalSellers} />

              {/* Compact live index for mobile/tablet — desktop shows the full panel on the right. */}
              <div className="mt-6 lg:hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gray">Right now on Damkemon</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <StatTile value={stats?.totalProducts} label="products" loading={statsLoading} />
                  <StatTile value={stats?.totalSellers ?? stats?.totalSites} label="shops" loading={statsLoading} />
                  <StatTile value={stats?.totalPricePoints} label="prices" loading={statsLoading} />
                </div>
              </div>
            </div>

            {/* Live "indexed now" panel */}
            <div className="hidden lg:flex justify-end">
              <div className="relative w-full max-w-sm">
                <div className="rounded-3xl bg-surface/85 backdrop-blur border border-line p-6 shadow-[var(--shadow-soft)]">
                  <div className="font-mono text-[11px] uppercase tracking-wider text-gray mb-3">Right now on Damkemon</div>
                  <div className="grid grid-cols-3 gap-2">
                    <StatTile value={stats?.totalProducts} label="products" loading={statsLoading} />
                    <StatTile value={stats?.totalSellers ?? stats?.totalSites} label="shops" loading={statsLoading} />
                    <StatTile value={stats?.totalPricePoints} label="prices" loading={statsLoading} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-line flex items-center gap-2 text-[12px] text-gray">
                    <span className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
                    {live ? <>{fmtNum(live.searchesToday)} searches today · {fmtNum(live.viewsToday)} views</> : 'Real prices, compared live'}
                  </div>
                </div>
                <div className="absolute -top-3 -left-3 bg-white py-1.5 px-3 rounded-full shadow-[var(--shadow-soft)] border border-line inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green" />
                  <span className="text-[11px] font-mono font-bold text-ink">Verified trust</span>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-ink text-cream py-1.5 px-3 rounded-full shadow-[var(--shadow-soft)] inline-flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-yellow" />
                  <span className="text-[11px] font-mono font-bold">Cheapest wins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending now (real search signal) ──────────────────── */}
      {trending.length >= 3 && (
        <section className="container-tight pt-6 sm:pt-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red animate-pulse-dot" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-gray">Trending now</span>
            {live?.searchesToday > 0 && (
              <span className="text-[11px] text-gray-soft">· {fmtNum(live.searchesToday)} searches today</span>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {trending.map((t, i) => (
              <Link
                key={t.query}
                to={`/search?q=${encodeURIComponent(t.query)}`}
                className="shrink-0 inline-flex items-center gap-2 bg-white border border-line rounded-2xl px-3.5 py-2.5 hover:border-ink hover:shadow-[var(--shadow-soft)] transition-all group"
              >
                <span className="font-mono text-[11px] text-gray-soft">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm font-semibold text-ink capitalize group-hover:text-red transition-colors truncate max-w-[170px]">{t.query}</span>
                <span className="font-mono text-[10px] text-gray bg-cream-soft rounded-full px-1.5 py-0.5">{t.hits}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Top deals + trusted-shops sidebar ──────────────────── */}
      <section className="container-tight py-8 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Deals grid */}
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between mb-4 sm:mb-5">
              <div>
                <div className="tag-bar mb-2 inline-flex items-center gap-1.5 text-red">
                  <Flame className="w-3.5 h-3.5" /> Top deals right now
                </div>
                <h2 className="font-serif font-semibold text-[clamp(1.5rem,3.5vw,2.25rem)] leading-tight">
                  Where you <em className="text-red">save most</em>
                </h2>
              </div>
              <Link to="/browse" className="text-sm font-semibold text-ink/70 hover:text-ink inline-flex items-center gap-1.5 shrink-0">
                Browse all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="columns-2 gap-4 sm:gap-5">
              {deals.map((d, i) => (
                <Link
                  key={d.id}
                  to={`/product/${d.id || d.slug}`}
                  state={d.product ? { product: d.product } : undefined}
                  className="card-soft overflow-hidden flex flex-col group hover:shadow-[var(--shadow-lift)] hover:border-line-strong transition-all mb-4 sm:mb-5 break-inside-avoid"
                >
                  <div className={`relative ${['h-52 sm:h-60', 'h-40 sm:h-44', 'h-48 sm:h-56', 'h-44 sm:h-52'][i % 4]} bg-cream-soft flex items-center justify-center overflow-hidden`}>
                    {d.imageUrl ? (
                      <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span className="font-serif text-5xl italic text-ink/15">{(d.category || 'P')[0]}</span>
                    )}
                    {d.pct > 0 && (
                      <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded-full ${
                        d.kind === 'drop' ? 'bg-red text-white' : 'bg-lime text-ink'
                      }`}>
                        <TrendingDown className="w-3 h-3" /> {d.kind === 'drop' ? `${d.pct}% drop` : `save ${d.pct}%`}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    {d.category && <span className="font-mono text-[10px] uppercase tracking-wider text-gray mb-1">{d.category}</span>}
                    <h3 className="font-serif text-[15px] sm:text-base font-semibold text-ink leading-snug line-clamp-2 group-hover:text-red transition-colors">{d.name}</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-mono text-lg sm:text-xl font-bold text-ink">{fmt(d.price)}</span>
                      {d.oldPrice && <span className="font-mono text-xs text-gray-soft line-through">{fmt(d.oldPrice)}</span>}
                    </div>
                    <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-[12px] text-gray">
                      {d.sellers > 1 ? (
                        <span className="inline-flex items-center gap-1 text-green font-semibold"><Crown className="w-3.5 h-3.5" /> {d.sellers} sellers</span>
                      ) : (
                        <span className="inline-flex items-center gap-1"><Store className="w-3.5 h-3.5" /> compare sellers</span>
                      )}
                      <span className="inline-flex items-center gap-1 font-semibold text-ink/70 group-hover:text-red transition-colors">
                        Compare <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 sm:space-y-6">
            {shops.length > 0 && (
              <div className="card-soft p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-green" />
                  <h3 className="font-serif text-lg font-bold italic text-ink">Most trusted shops</h3>
                </div>
                <div className="space-y-3.5">
                  {shops.map((s, i) => (
                    <Link key={s.slug} to={`/browse`} className="flex items-center gap-3 group">
                      <span className="font-serif text-lg font-bold italic text-ink/25 w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink truncate group-hover:text-red transition-colors">{s.name}</div>
                        <div className="text-[11px] text-gray inline-flex items-center gap-2">
                          <span className="font-mono">{fmtNum(s.productCount)} products</span>
                          {s.trust && deliveryText(s.trust) && (
                            <span className="inline-flex items-center gap-0.5"><Truck className="w-3 h-3" /> {deliveryText(s.trust)}</span>
                          )}
                        </div>
                      </div>
                      {s.trust?.trustScore != null && <TrustScore score={s.trust.trustScore} size="sm" showLabel={false} />}
                    </Link>
                  ))}
                </div>
                <Link to="/sellers" className="mt-5 w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-line-strong text-ink/70 font-medium text-sm hover:bg-cream-soft transition-colors">
                  All sellers <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Protect CTA — real Damkemon feature */}
            <div className="rounded-2xl bg-green-soft border border-line p-6 text-center">
              <div className="w-14 h-14 bg-surface rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-[var(--shadow-soft)]">
                <ShieldCheck className="w-7 h-7 text-green" />
              </div>
              <h3 className="font-serif text-lg font-bold italic text-ink">Buying from an unknown seller?</h3>
              <p className="text-sm text-ink/70 mt-1.5 mb-4">Check the scam risk and open a protected order before you pay.</p>
              <Link to="/protect" className="btn-primary w-full justify-center">
                <ShieldCheck className="w-4 h-4" /> Try Damkemon Protect
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Damkemon Protect — buyer-trust spotlight (animated). */}
      <ProtectShowcase />

      {/* Saathi cross-sell — the seller side of the two-sided marketplace. */}
      {SHOW_SAATHI && (
      <section className="relative overflow-hidden">
        <div className="container-tight py-10 sm:py-14 lg:py-18">
          <div className="rounded-3xl bg-gradient-to-br from-blue-soft via-cream-soft to-lime-soft border border-line-strong p-6 sm:p-10 lg:p-14 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-red/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-12 w-72 h-72 rounded-full bg-lime/20 blur-3xl pointer-events-none" />

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink text-cream text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3 h-3 text-yellow" /> New
                </span>
                <h2 className="font-serif text-[clamp(1.6rem,4.2vw,2.75rem)] font-bold italic leading-[1.05] tracking-tight text-ink mb-2">
                  Run an FB shop?<br />
                  Meet your <span className="text-red">Saathi</span>.
                </h2>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/55 mb-4">A seller's companion</p>
                <p className="text-ink/75 text-sm sm:text-[15px] leading-relaxed max-w-md mb-5">
                  Quote smart prices on FB Live. Auto-reply to "দাম কত?" in Messenger. Earn the verified badge that builds buyer trust. ৳999/mo. 14 days free.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/saathi" className="btn-primary">Open my Saathi shop <ArrowRight className="w-4 h-4" /></Link>
                  <Link to="/saathi#how" className="btn-ghost">See how it works</Link>
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SaathiFeatureChip icon={Radio} title="Live price assist" tone="bg-red-soft text-red" />
                <SaathiFeatureChip icon={MessageSquare} title="Messenger auto-reply" tone="bg-blue-soft text-blue" />
                <SaathiFeatureChip icon={BadgeCheck} title="Verified badge" tone="bg-lime-soft text-green" />
                <SaathiFeatureChip icon={ShoppingBag} title="Public storefront" tone="bg-yellow-soft text-ink" />
              </ul>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* How it works */}
      <section className="bg-ink text-cream py-14 sm:py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-red/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-lime/10 blur-3xl pointer-events-none" />
        <div className="container-tight relative">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="tag-bar text-lime mb-3 sm:mb-4">Why Damkemon</div>
            <h2 className="font-serif font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(1.85rem,5vw,3.5rem)]">
              Buy smarter. <em className="text-lime">Pay less.</em>
            </h2>
            <p className="text-cream/55 text-sm sm:text-base mt-3 max-w-xl">
              Every shop in Bangladesh, every price, every trust signal — together in one place, so the smartest buy is always just one search away.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="relative pt-12 sm:pt-14 group">
                  <div className="absolute top-0 left-0 flex items-center gap-3">
                    <span className="font-serif text-4xl sm:text-5xl font-bold italic text-lime/80 leading-none">{s.num}</span>
                    <div className="w-10 h-10 rounded-2xl bg-cream/10 flex items-center justify-center group-hover:bg-lime group-hover:text-ink transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-cream/55 text-sm sm:text-[15px] leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// Count a number up from 0 → target once the value arrives (easeOutCubic).
// Honours prefers-reduced-motion, and re-animates if the target later changes.
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

function StatTile({ value, label, loading }) {
  const display = useCountUp(value);
  return (
    <div className="text-center rounded-xl bg-cream-soft/70 py-2.5">
      <div className="font-serif text-base sm:text-lg font-bold italic text-ink leading-none tabular-nums flex items-center justify-center min-h-[1.5rem] sm:min-h-[1.75rem]">
        {display != null ? (
          Number(display).toLocaleString('en-IN')
        ) : loading ? (
          <span className="block h-4 sm:h-5 w-9 rounded bg-ink/10 animate-pulse" aria-label="loading" />
        ) : (
          '—'
        )}
      </div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-gray mt-1">{label}</div>
    </div>
  );
}

function SaathiFeatureChip({ icon: Icon, title, tone }) {
  return (
    <li className="bg-surface/85 backdrop-blur border border-line rounded-2xl p-3 flex items-center gap-2.5">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${tone}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="font-serif text-[15px] font-semibold text-ink">{title}</span>
    </li>
  );
}
