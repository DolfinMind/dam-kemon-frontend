import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Radio, Users, Activity, Eye, Search as SearchIcon, MousePointerClick,
  Globe, Server, Clock, TrendingUp, Map as MapIcon,
  Store, Package, Layers, Crown, Filter, MessageSquare, AlertTriangle,
  Trophy, SearchX, Award, Smartphone, ExternalLink
} from 'lucide-react';
import {
  analyticsOverview, analyticsHourly, analyticsDailyUsers,
  analyticsTopSearches, analyticsTopIps, analyticsTopPaths,
  analyticsFunnel, analyticsShopClicksByCategory, analyticsTopShops,
  analyticsTopProducts, analyticsTopConvertingSearches,
  analyticsResultShops, analyticsZeroResultSearches, analyticsShopPriceWins,
  analyticsDevices, analyticsReferrers,
} from '../../api/admin';

const num = (n) => (n == null ? '—' : Number(n).toLocaleString());

function timeAgo(ts) {
  if (!ts) return '—';
  const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const LEADERBOARD_RANGES = [{ label: '24h', days: 1 }, { label: '7d', days: 7 }, { label: '30d', days: 30 }];
const DAILY_RANGES = [{ label: '14d', days: 14 }, { label: '30d', days: 30 }, { label: '90d', days: 90 }];

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [daily, setDaily] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [topIps, setTopIps] = useState([]);
  const [topPaths, setTopPaths] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [shopCat, setShopCat] = useState([]);
  const [topShops, setTopShops] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [convSearches, setConvSearches] = useState([]);
  const [resultShops, setResultShops] = useState([]);
  const [zeroSearches, setZeroSearches] = useState([]);
  const [priceWins, setPriceWins] = useState([]);
  const [devices, setDevices] = useState(null);
  const [referrers, setReferrers] = useState([]);
  const [windowDays, setWindowDays] = useState(7);
  const [dailyDays, setDailyDays] = useState(14);
  const [live, setLive] = useState(true);
  const liveRef = useRef(live);
  liveRef.current = live;

  // Leaderboards + histogram — refetch when the window changes.
  useEffect(() => {
    analyticsHourly(windowDays).then((r) => setHourly(r.data)).catch(() => {});
    analyticsTopSearches(windowDays, 25).then((r) => setTopSearches(r.data || [])).catch(() => {});
    analyticsTopIps(windowDays, 25).then((r) => setTopIps(r.data || [])).catch(() => {});
    analyticsTopPaths(windowDays, 12).then((r) => setTopPaths(r.data || [])).catch(() => {});
    analyticsFunnel(windowDays).then((r) => setFunnel(r.data)).catch(() => {});
    analyticsShopClicksByCategory(windowDays, 12, 5).then((r) => setShopCat(r.data || [])).catch(() => {});
    analyticsTopShops(windowDays, 15).then((r) => setTopShops(r.data || [])).catch(() => {});
    analyticsTopProducts(windowDays, 15).then((r) => setTopProducts(r.data || [])).catch(() => {});
    analyticsTopConvertingSearches(windowDays, 15).then((r) => setConvSearches(r.data || [])).catch(() => {});
    analyticsResultShops(windowDays, 15).then((r) => setResultShops(r.data || [])).catch(() => {});
    analyticsZeroResultSearches(windowDays, 25).then((r) => setZeroSearches(r.data || [])).catch(() => {});
    analyticsShopPriceWins(15).then((r) => setPriceWins(r.data || [])).catch(() => {});
    analyticsDevices(windowDays).then((r) => setDevices(r.data)).catch(() => {});
    analyticsReferrers(windowDays, 15).then((r) => setReferrers(r.data || [])).catch(() => {});
  }, [windowDays]);

  useEffect(() => {
    analyticsDailyUsers(dailyDays).then((r) => setDaily(r.data || [])).catch(() => {});
  }, [dailyDays]);

  // Live counters — poll while "live" is on.
  useEffect(() => {
    const pullOverview = () => analyticsOverview().then((r) => setOverview(r.data)).catch(() => {});
    pullOverview();
    const t = setInterval(() => {
      if (!liveRef.current) return;
      pullOverview();
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const buckets = hourly?.buckets || [];
  const peakHour = hourly?.peakHour;

  return (
    <div className="space-y-8">
      {/* ── header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold inline-flex items-center gap-2">
            <Activity className="w-5 h-5 text-red" /> Traffic &amp; Activity
          </h2>
          <p className="text-xs text-gray mt-0.5">
            Human traffic only — bots &amp; crawlers are excluded everywhere except Top IPs, Devices and the request feed.
            {overview?.timezone && <> Times in <span className="font-mono">{overview.timezone}</span>.</>}
          </p>
        </div>
        <button
          onClick={() => setLive((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            live ? 'bg-green/10 text-green border-green/30' : 'bg-cream-soft text-gray border-line'
          }`}
          title="Auto-refresh live counters"
        >
          <Radio className={`w-3.5 h-3.5 ${live ? 'animate-pulse' : ''}`} /> {live ? 'Live' : 'Paused'}
        </button>
      </div>

      {/* ── KPI cards ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi icon={Radio} label="Active now" value={num(overview?.activeNow)} accent hint="humans · last 5 min" />
        <Kpi icon={Users} label="Visitors today" value={num(overview?.visitorsToday)} />
        <Kpi icon={Server} label="Requests today" value={num(overview?.requestsToday)} hint={`${num(overview?.requestsLastHour)} last hr`} />
        <Kpi icon={SearchIcon} label="Searches today" value={num(overview?.searchesToday)} />
        <Kpi icon={Store} label="Total Shops" value={num(overview?.totalShops)} hint={`${num(overview?.failingShops)} failing`} />
        <Kpi icon={MessageSquare} label="Community Reviews" value={num(overview?.totalCommunityReviews)} />
        <Kpi icon={AlertTriangle} label="Flagged Reviews" value={num(overview?.flaggedReviews)} accent={overview?.flaggedReviews > 0} />
        <Kpi icon={Activity} label="Search Conv. Rate" value={`${overview?.searchConversionRate || 0}%`} hint="today" />
      </section>

      {/* ── window selector ── */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray font-mono uppercase tracking-wider">Window</span>
        <RangeToggle ranges={LEADERBOARD_RANGES} value={windowDays} onChange={setWindowDays} />
      </div>

      {/* ── peak hour ── */}
      <section className="card-soft p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-serif text-lg font-semibold inline-flex items-center gap-2">
            <Clock className="w-4 h-4" /> Activity by hour of day
          </h3>
          {peakHour != null && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red/10 text-red">
              <TrendingUp className="w-3.5 h-3.5" /> Peak hour · {hourly.peakHourLabel}
            </span>
          )}
        </div>
        {buckets.length === 0 ? (
          <Empty>No traffic recorded in this window yet.</Empty>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={buckets} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: 'var(--color-gray)', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(h) => `${String(h).padStart(2, '0')}`} interval={1} />
                <YAxis tick={{ fill: 'var(--color-gray)', fontSize: 10 }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'var(--color-line)' }} content={<HourTooltip />} />
                <Bar dataKey="activity" radius={[3, 3, 0, 0]} maxBarSize={26}>
                  {buckets.map((b) => (
                    <Cell key={b.hour} fill={b.hour === peakHour ? 'var(--color-red)' : 'var(--color-gray-soft)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {hourly?.peakHourSearches?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-line">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gray mb-2">
                  Top searches during peak hour ({hourly.peakHourLabel})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {hourly.peakHourSearches.map((s) => (
                    <Link key={s.query} to={`/search?q=${encodeURIComponent(s.query)}`}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-cream-soft border border-line hover:border-ink transition-colors">
                      <span>{s.query}</span>
                      <span className="font-mono text-gray">{s.hits}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── users per day ── */}
      <section className="card-soft p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-serif text-lg font-semibold inline-flex items-center gap-2">
            <Users className="w-4 h-4" /> Users per day
          </h3>
          <RangeToggle ranges={DAILY_RANGES} value={dailyDays} onChange={setDailyDays} />
        </div>
        {daily.length === 0 ? (
          <Empty>No daily data yet.</Empty>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={daily} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-blue)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-green)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--color-gray)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={{ fill: 'var(--color-gray)', fontSize: 10 }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
              <Tooltip content={<DailyTooltip />} />
              <Area type="monotone" dataKey="pageViews" name="Page views" stroke="var(--color-green)" strokeWidth={1.5} fill="url(#gViews)" />
              <Area type="monotone" dataKey="users" name="Visitors" stroke="var(--color-blue)" strokeWidth={2} fill="url(#gUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* ════════ Search result intelligence ════════ */}
      <div className="pt-2 border-t border-line">
        <h3 className="font-serif text-lg font-semibold inline-flex items-center gap-2">
          <Trophy className="w-5 h-5 text-red" /> Search result intelligence
        </h3>
        <p className="text-xs text-gray mt-0.5">
          Which shops surface first, what shoppers can&apos;t find, and who wins on price. Window: last {windowDays}d
          {' '}(price-win is computed live over the catalog).
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* shops shown first in results */}
        <div>
          <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
            <Crown className="w-4 h-4" /> Shops shown first in results
          </h3>
          {resultShops.length === 0 ? (
            <Empty>No searches with results logged in this window yet — fills in as people search.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                    <th className="py-2 pr-3">Shop</th>
                    <th className="py-2 pr-3 text-right">Shown 1st</th>
                    <th className="py-2 pr-3 text-right">Share</th>
                    <th className="py-2 pr-3 text-right">Appears</th>
                  </tr>
                </thead>
                <tbody>
                  {resultShops.map((s, i) => (
                    <tr key={s.siteSlug} className="border-b border-line/50">
                      <td className="py-2 pr-3 capitalize font-medium inline-flex items-center gap-1">
                        {i === 0 && <Crown className="w-3 h-3 text-yellow shrink-0" />}{s.siteSlug}
                      </td>
                      <td className="py-2 pr-3 text-right font-mono font-bold">{num(s.shownFirst)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-gray">{s.shownFirstPct == null ? '—' : `${s.shownFirstPct}%`}</td>
                      <td className="py-2 pr-3 text-right font-mono text-gray">{num(s.appears)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* zero-result searches */}
        <div>
          <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
            <SearchX className="w-4 h-4" /> Searches with no results
          </h3>
          {zeroSearches.length === 0 ? (
            <Empty>No empty searches in this window — your catalog is covering demand.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                    <th className="py-2 pr-3">Query</th>
                    <th className="py-2 pr-3 text-right">Searches</th>
                    <th className="py-2 pr-3">Last</th>
                  </tr>
                </thead>
                <tbody>
                  {zeroSearches.map((s) => (
                    <tr key={s.query} className="border-b border-line/50">
                      <td className="py-2 pr-3">
                        <Link to={`/search?q=${encodeURIComponent(s.query)}`} className="hover:text-red">{s.query}</Link>
                      </td>
                      <td className="py-2 pr-3 text-right font-mono font-bold text-red">{num(s.hits)}</td>
                      <td className="py-2 pr-3 text-gray text-xs whitespace-nowrap">{timeAgo(s.lastSeen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* shop price-win rate */}
      <section>
        <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
          <Award className="w-4 h-4" /> Shop price-win rate
          <span className="text-[10px] font-mono normal-case tracking-normal text-gray">cheapest-offer share where the shop appears</span>
        </h3>
        {priceWins.length === 0 ? <Empty>No catalog price data yet.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                  <th className="py-2 pr-3">Shop</th>
                  <th className="py-2 pr-3">Win rate</th>
                  <th className="py-2 pr-3 text-right">Wins</th>
                  <th className="py-2 pr-3 text-right">Appears on</th>
                </tr>
              </thead>
              <tbody>
                {priceWins.map((s) => (
                  <tr key={s.siteSlug} className="border-b border-line/50">
                    <td className="py-2 pr-3 capitalize font-medium">{s.siteSlug}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-[5rem] h-2 rounded-full bg-cream-soft overflow-hidden">
                          <div className="h-full bg-green rounded-full" style={{ width: `${Math.min(100, s.winRate || 0)}%` }} />
                        </div>
                        <span className="w-12 text-right font-mono text-xs font-bold">{s.winRate == null ? '—' : `${s.winRate}%`}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-right font-mono text-gray">{num(s.wins)}</td>
                    <td className="py-2 pr-3 text-right font-mono text-gray">{num(s.appearances)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ════════ Outbound clicks & conversion ════════ */}
      <div className="pt-2 border-t border-line">
        <h3 className="font-serif text-lg font-semibold inline-flex items-center gap-2">
          <MousePointerClick className="w-5 h-5 text-red" /> Outbound clicks &amp; conversion
        </h3>
        <p className="text-xs text-gray mt-0.5">
          Where the traffic we send actually goes — by shop, category and product. Window: last {windowDays}d.
        </p>
      </div>

      {/* ── funnel ── */}
      <section className="card-soft p-5">
        <h3 className="font-serif text-base font-semibold mb-4 inline-flex items-center gap-2">
          <Filter className="w-4 h-4" /> Search → view → click funnel
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FunnelStage icon={SearchIcon} label="Searches" value={funnel?.searches} />
          <FunnelStage icon={Eye} label="Product views" value={funnel?.productViews} rate={funnel?.searchToView} rateLabel="of searches" />
          <FunnelStage icon={MousePointerClick} label="Outbound clicks" value={funnel?.outboundClicks} rate={funnel?.viewToClick} rateLabel="of views" accent />
        </div>
        {funnel?.searchToClick != null && (
          <p className="text-xs text-gray mt-3">
            End-to-end: <span className="font-mono font-bold text-ink">{funnel.searchToClick}%</span> of searches turn into an outbound click.
          </p>
        )}
      </section>

      {/* ── which shop wins which category ── */}
      <section>
        <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
          <Layers className="w-4 h-4" /> Which shop wins which category
        </h3>
        {shopCat.length === 0 ? (
          <Empty>No outbound clicks recorded in this window yet — this fills in as shoppers click through to shops.</Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shopCat.map((c) => {
              const max = c.shops?.[0]?.clicks || 1;
              return (
                <div key={c.category} className="card-soft p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold capitalize">{c.category}</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray">{num(c.totalClicks)} clicks</span>
                  </div>
                  <div className="space-y-2">
                    {c.shops.map((s, i) => (
                      <div key={s.siteSlug} className="flex items-center gap-2">
                        <span className="w-4 text-[10px] font-mono text-gray text-right">{i + 1}</span>
                        <span className="w-28 truncate text-sm capitalize inline-flex items-center gap-1" title={s.siteSlug}>
                          {i === 0 && <Crown className="w-3 h-3 text-yellow shrink-0" />}{s.siteSlug}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-cream-soft overflow-hidden">
                          <div className="h-full bg-red rounded-full" style={{ width: `${Math.max(6, (s.clicks / max) * 100)}%` }} />
                        </div>
                        <span className="w-8 text-right font-mono text-xs font-bold">{num(s.clicks)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── top shops + most-clicked products ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
            <Store className="w-4 h-4" /> Top shops by outbound clicks
          </h3>
          {topShops.length === 0 ? <Empty>No outbound clicks yet.</Empty> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                    <th className="py-2 pr-3">Shop</th>
                    <th className="py-2 pr-3 text-right">Clicks</th>
                    <th className="py-2 pr-3 text-right">Products</th>
                    <th className="py-2 pr-3 text-right">Cats</th>
                    <th className="py-2 pr-3">Last</th>
                  </tr>
                </thead>
                <tbody>
                  {topShops.map((s) => (
                    <tr key={s.siteSlug} className="border-b border-line/50">
                      <td className="py-2 pr-3 capitalize font-medium">{s.siteSlug}</td>
                      <td className="py-2 pr-3 text-right font-mono font-bold">{num(s.clicks)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-gray">{num(s.distinctProducts)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-gray">{num(s.distinctCategories)}</td>
                      <td className="py-2 pr-3 text-gray text-xs whitespace-nowrap">{timeAgo(s.lastSeen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
            <Package className="w-4 h-4" /> Most-clicked products
          </h3>
          {topProducts.length === 0 ? <Empty>No outbound clicks yet.</Empty> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                    <th className="py-2 pr-3">Product</th>
                    <th className="py-2 pr-3 text-right">Clicks</th>
                    <th className="py-2 pr-3 text-right">Shops</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.productId} className="border-b border-line/50">
                      <td className="py-2 pr-3 max-w-[18rem]">
                        <Link to={`/product/${p.productId}`} className="hover:text-red line-clamp-1" title={p.name}>
                          {p.name || p.productId}
                        </Link>
                        {p.category && <span className="text-[10px] font-mono uppercase tracking-wider text-gray">{p.category}</span>}
                      </td>
                      <td className="py-2 pr-3 text-right font-mono font-bold align-top">{num(p.clicks)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-gray align-top">{num(p.distinctShops)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── searches that convert to clicks ── */}
      <section>
        <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Searches that convert to clicks
        </h3>
        {convSearches.length === 0 ? <Empty>No search-attributed clicks in this window yet.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                  <th className="py-2 pr-3">Search</th>
                  <th className="py-2 pr-3 text-right">Clicks</th>
                  <th className="py-2 pr-3 text-right">Products</th>
                  <th className="py-2 pr-3 text-right">Shops</th>
                </tr>
              </thead>
              <tbody>
                {convSearches.map((s) => (
                  <tr key={s.query} className="border-b border-line/50">
                    <td className="py-2 pr-3">
                      <Link to={`/search?q=${encodeURIComponent(s.query)}`} className="hover:text-red">{s.query}</Link>
                    </td>
                    <td className="py-2 pr-3 text-right font-mono font-bold">{num(s.clicks)}</td>
                    <td className="py-2 pr-3 text-right font-mono text-gray">{num(s.distinctProducts)}</td>
                    <td className="py-2 pr-3 text-right font-mono text-gray">{num(s.distinctShops)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── most searched + top IPs ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
            <SearchIcon className="w-4 h-4" /> Most searched
          </h3>
          {topSearches.length === 0 ? <Empty>No searches in this window.</Empty> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                    <th className="py-2 pr-3">Query</th>
                    <th className="py-2 pr-3 text-right">Searches</th>
                    <th className="py-2 pr-3 text-right">Zero-result</th>
                  </tr>
                </thead>
                <tbody>
                  {topSearches.map((s) => (
                    <tr key={s.query} className="border-b border-line/50">
                      <td className="py-2 pr-3">
                        <Link to={`/search?q=${encodeURIComponent(s.query)}`} className="hover:text-red">{s.query}</Link>
                      </td>
                      <td className="py-2 pr-3 text-right font-mono font-bold">{num(s.hits)}</td>
                      <td className={`py-2 pr-3 text-right font-mono ${s.zeroResults > 0 ? 'text-red' : 'text-gray'}`}>
                        {s.zeroResults > 0 ? num(s.zeroResults) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
            <Globe className="w-4 h-4" /> Top IP addresses
          </h3>
          {topIps.length === 0 ? <Empty>No requests logged yet.</Empty> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                    <th className="py-2 pr-3">IP</th>
                    <th className="py-2 pr-3 text-right">Requests</th>
                    <th className="py-2 pr-3 text-right">Paths</th>
                    <th className="py-2 pr-3">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {topIps.map((ip, i) => (
                    <tr key={(ip.ip || ip.ipHash || i)} className="border-b border-line/50">
                      <td className="py-2 pr-3 font-mono text-xs">
                        {ip.ip || <span className="text-gray">hash:{ip.ipHash}</span>}
                        {ip.userIds?.length > 0 && (
                          <span className="ml-1.5 text-[10px] text-green" title={ip.userIds.join(', ')}>· signed-in</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-right font-mono font-bold">{num(ip.requests)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-gray">{num(ip.distinctPaths)}</td>
                      <td className="py-2 pr-3 text-gray text-xs whitespace-nowrap">{timeAgo(ip.lastSeen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── devices & traffic sources ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Devices
          </h3>
          {!devices?.devices?.length ? <Empty>No page views in this window.</Empty> : (
            <div className="space-y-2">
              {devices.devices.map((d) => (
                <div key={d.device} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-mono uppercase tracking-wider text-gray">{d.device}</span>
                  <div className="flex-1 h-5 rounded-full bg-cream-soft overflow-hidden">
                    <div className="h-full bg-acid rounded-full" style={{ width: `${Math.max(2, d.pct)}%` }} />
                  </div>
                  <span className="w-24 text-right text-xs font-mono">
                    <b>{d.pct}%</b> <span className="text-gray">· {num(d.views)}</span>
                  </span>
                </div>
              ))}
              <p className="text-[11px] text-gray pt-1">{num(devices.totalViews)} page views · share of views per device class</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Traffic sources
          </h3>
          {referrers.length === 0 ? <Empty>No page views in this window.</Empty> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                    <th className="py-2 pr-3">Referrer</th>
                    <th className="py-2 pr-3 text-right">Views</th>
                    <th className="py-2 pr-3 text-right">Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {referrers.map((r) => (
                    <tr key={r.referrer} className="border-b border-line/50">
                      <td className="py-2 pr-3 font-mono text-xs">{r.referrer}</td>
                      <td className="py-2 pr-3 text-right font-mono font-bold">{num(r.views)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-gray">{num(r.visitors)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── busiest endpoints ── */}
      <section>
        <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
          <MapIcon className="w-4 h-4" /> Busiest endpoints
        </h3>
        {topPaths.length === 0 ? <Empty>No request data yet.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                  <th className="py-2 pr-3">Path</th>
                  <th className="py-2 pr-3 text-right">Hits</th>
                  <th className="py-2 pr-3 text-right">Avg latency</th>
                </tr>
              </thead>
              <tbody>
                {topPaths.map((p) => (
                  <tr key={p.path} className="border-b border-line/50">
                    <td className="py-2 pr-3 font-mono text-xs">{p.path}</td>
                    <td className="py-2 pr-3 text-right font-mono font-bold">{num(p.hits)}</td>
                    <td className="py-2 pr-3 text-right font-mono text-gray">{p.avgLatencyMs == null ? '—' : `${p.avgLatencyMs}ms`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint, accent }) {
  return (
    <div className={`card-soft p-4 ${accent ? 'ring-1 ring-red/30' : ''}`}>
      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray mb-1">
        <Icon className={`w-3 h-3 ${accent ? 'text-red' : ''}`} /> {label}
      </div>
      <div className="font-serif text-2xl font-bold mt-1 leading-none">{value}</div>
      {hint && <div className="text-[10px] text-gray font-mono mt-1">{hint}</div>}
    </div>
  );
}

function FunnelStage({ icon: Icon, label, value, rate, rateLabel, accent }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? 'bg-red/5 border-red/30' : 'bg-cream-soft border-line'}`}>
      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray mb-1">
        <Icon className={`w-3 h-3 ${accent ? 'text-red' : ''}`} /> {label}
      </div>
      <div className="font-serif text-2xl font-bold leading-none">{num(value)}</div>
      {rate != null && <div className="text-[10px] text-gray font-mono mt-1">{rate}% {rateLabel}</div>}
    </div>
  );
}

function RangeToggle({ ranges, value, onChange }) {
  return (
    <div className="flex gap-1 bg-cream-soft rounded-full p-1">
      {ranges.map((r) => (
        <button
          key={r.label}
          onClick={() => onChange(r.days)}
          className={`px-3 py-1 text-[11px] font-mono font-semibold rounded-full transition-all ${
            value === r.days ? 'bg-ink text-cream shadow-sm' : 'text-gray hover:text-ink'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function Empty({ children }) {
  return <p className="text-sm text-gray card-soft p-6 text-center">{children}</p>;
}

function HourTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface rounded-xl p-3 shadow-lg border border-line-strong text-xs space-y-1">
      <p className="font-mono font-bold text-ink">{d.label}</p>
      <Row label="Searches" value={d.searches} />
      <Row label="Page views" value={d.pageViews} />
      <Row label="Requests" value={d.requests} />
    </div>
  );
}

function DailyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-xl p-3 shadow-lg border border-line-strong text-xs space-y-1">
      <p className="font-mono text-gray mb-1">{new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
      {payload.map((p) => <Row key={p.dataKey} label={p.name} value={p.value} color={p.color} />)}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      {color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
      <span className="text-gray">{label}</span>
      <span className="ml-auto font-mono font-bold text-ink">{num(value)}</span>
    </div>
  );
}
