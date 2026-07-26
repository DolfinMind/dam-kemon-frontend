/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';
import {
  Filter, Plus, ArrowRight, Users, X, Search as SearchIcon,
  Store, Globe, Smartphone, SearchX, Activity, Package, RefreshCw, TrendingUp,
} from 'lucide-react';
import {
  analyticsOverview, analyticsHourly, analyticsDailyUsers,
  analyticsTopProducts, analyticsFunnel, analyticsTopSearches,
  analyticsZeroResultSearches, analyticsTopShops, analyticsDevices, analyticsReferrers,
  analyticsCatalogGrowth,
} from '../../api/admin';

// ─────────────────────────────────────────────────────────────────────────────
//  Operator dashboard backed by focused analytics endpoints. Fetches degrade
//  independently so one slow series never takes down the whole page.
// ─────────────────────────────────────────────────────────────────────────────

const RANGES = [{ label: '7d', days: 7 }, { label: '14d', days: 14 }, { label: '30d', days: 30 }];
const WIDGET_KEY = 'dk_admin_widgets';

// Optional widgets (off by default — keeping the first-load screen identical to
// the mock). Each maps 1:1 to a real endpoint that was previously unused.
const OPTIONAL_WIDGETS = [
  { id: 'topSearches', label: 'Top searches', icon: SearchIcon, fetch: (d) => analyticsTopSearches(d, 12) },
  { id: 'zeroSearches', label: 'Catalog gaps', icon: SearchX, fetch: (d) => analyticsZeroResultSearches(d, 10) },
  { id: 'topShops', label: 'Top shops', icon: Store, fetch: (d) => analyticsTopShops(d, 8) },
  { id: 'funnel', label: 'Funnel', icon: Activity, fetch: (d) => analyticsFunnel(d) },
  { id: 'devices', label: 'Devices', icon: Smartphone, fetch: (d) => analyticsDevices(d) },
  { id: 'referrers', label: 'Referrers', icon: Globe, fetch: (d) => analyticsReferrers(d, 8) },
];
const DEFAULT_ENABLED = []; // default screen = the 6 core cards only

const num = (n) => (n == null ? '—' : Number(n).toLocaleString());
const pct = (n, suffix = '%') => (n == null ? '—' : `${Number(n).toFixed(n >= 10 ? 0 : 1)}${suffix}`);

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('14d');
  const windowDays = RANGES.find((r) => r.label === timeRange)?.days ?? 14;

  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [daily, setDaily] = useState([]);
  const [hourly, setHourly] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');

  // Optional-widget state.
  const [enabled, setEnabled] = useState(() => loadWidgets());
  const [widgetPanel, setWidgetPanel] = useState(false);
  const [widgetData, setWidgetData] = useState({});
  const liveRef = useRef(live);
  liveRef.current = live;

  const pullOverview = useCallback(async () => {
    try {
      const r = await analyticsOverview();
      setOverview(r.data);
      setLastUpdated(new Date());
      return true;
    } catch {
      return false;
    }
  }, []);

  const pullWindow = useCallback(async () => {
    const results = await Promise.allSettled([
      analyticsDailyUsers(Math.min(windowDays, 30)),
      analyticsHourly(windowDays),
      analyticsCatalogGrowth(windowDays),
      analyticsFunnel(windowDays),
      analyticsTopProducts(windowDays, 6),
    ]);
    if (results[0].status === 'fulfilled') setDaily(results[0].value.data || []);
    if (results[1].status === 'fulfilled') setHourly(results[1].value.data);
    if (results[2].status === 'fulfilled') setGrowth(results[2].value.data);
    if (results[3].status === 'fulfilled') setFunnel(results[3].value.data);
    if (results[4].status === 'fulfilled') setTopProducts(results[4].value.data || []);
    return results.some((result) => result.status === 'fulfilled');
  }, [windowDays]);

  const pullWidgets = useCallback(async () => {
    const widgets = OPTIONAL_WIDGETS.filter((w) => enabled.includes(w.id));
    const results = await Promise.allSettled(widgets.map((w) => w.fetch(windowDays)));
    results.forEach((result, index) => {
      if (result.status !== 'fulfilled') return;
      setWidgetData((state) => ({ ...state, [widgets[index].id]: result.value.data }));
    });
    return widgets.length === 0 || results.some((result) => result.status === 'fulfilled');
  }, [enabled, windowDays]);

  const refreshAll = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshError('');
    const results = await Promise.all([pullOverview(), pullWindow(), pullWidgets()]);
    if (results.some(Boolean)) setLastUpdated(new Date());
    else setRefreshError('Refresh failed — check your admin session.');
    setRefreshing(false);
  }, [pullOverview, pullWidgets, pullWindow, refreshing]);

  useEffect(() => {
    pullOverview();
    if (!live) return;
    const t = setInterval(() => { if (liveRef.current) pullOverview(); }, 30000);
    return () => clearInterval(t);
  }, [pullOverview, live]);

  useEffect(() => { pullWindow(); }, [pullWindow]);

  // Each optional widget fetches lazily only when enabled, and respects window.
  useEffect(() => { pullWidgets(); }, [pullWidgets]);

  const toggleWidget = (id) => {
    setEnabled((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(WIDGET_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  };

  const peakHour = hourly?.peakHourLabel ?? '—';
  const dailyViewed = daily.reduce((a, d) => a + (Number(d.pageViews) || 0), 0);
  const dailyVisitors = daily.reduce((a, d) => a + (Number(d.users) || 0), 0);
  const convRate = overview?.clicksPer100Searches
    ?? funnel?.clicksPer100Searches
    ?? overview?.searchConversionRate
    ?? funnel?.searchToClick;
  const catalogDaily = growth?.daily || [];
  const averageNewProducts = catalogDaily.length
    ? Math.round((Number(growth?.newProducts) || 0) / catalogDaily.length)
    : 0;

  // Hourly bar data: 24 buckets, mark the peak.
  const hourlyBars = useMemo(() => {
    const buckets = hourly?.buckets || [];
    return buckets.map((b) => ({ hour: `${b.hour}h`, value: Number(b.activity) || 0, isHighest: b.hour === hourly?.peakHour }));
  }, [hourly]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <section className="relative overflow-hidden rounded-[28px] bg-gray-950 px-6 py-6 text-white shadow-xl shadow-gray-200/60 sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-28 w-28 rounded-full bg-amber-300/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
              <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              Operator pulse
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Catalog and marketplace growth</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
              Monitor new products, seller coverage, traffic and conversion without putting heavy polling pressure on the API.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              {RANGES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setTimeRange(r.label)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    timeRange === r.label ? 'bg-white text-gray-950' : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
              title="Refresh all dashboard data"
              aria-label="Refresh all dashboard data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setWidgetPanel(true)}
              className="flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              <Plus className="h-4 w-4" /> Add widget
            </button>
            <div className={`basis-full text-right text-[10px] ${refreshError ? 'text-red-300' : 'text-gray-500'}`}>
              {refreshError || (lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Connecting to analytics…')}
            </div>
          </div>
        </div>
      </section>

      {/* Headline metrics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total products</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{num(growth?.totalProducts)}</h2>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-500">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> +{num(growth?.newProducts)}
            </span>
            <span className="text-xs text-gray-400">new in {timeRange}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Seller network</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{num(growth?.totalSellers)}</h2>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-500">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <MiniStat label="Marketplace" value={num(growth?.marketplaceSellers)} />
            <MiniStat label="Active shops" value={num(growth?.activeShops)} />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Today&apos;s traffic</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                {live ? 'live' : 'paused'}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  {num(overview?.likelyHumanVisitorsToday ?? overview?.visitorsToday)}
                </h2>
                <span className="text-sm text-gray-500">likely human visitors today</span>
              </div>
              <div className="h-12 w-16 flex items-end gap-1">
                {hourlyBars.slice(0, 3).map((b, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm ${b.isHighest ? 'bg-orange-500' : 'bg-orange-300'}`}
                    style={{ height: `${20 + Math.min(80, (b.value % 10) * 8 + 30)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center">
            <MiniStat label="Page views" value={num(overview?.pageViewsToday)} />
            <MiniStat label="Searchers" value={num(overview?.uniqueSearchersToday)} />
            <MiniStat label="Searches" value={num(overview?.searchesToday)} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center">
            <MiniStat label="Known bots" value={num(overview?.knownBotVisitorsToday)} />
            <MiniStat label="Suspected" value={num(overview?.suspectedBotVisitorsToday)} />
            <MiniStat label="Unclassified" value={num(overview?.unclassifiedVisitorsToday)} />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Search click rate</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{convRate != null ? pct(convRate) : '—'}</h2>
                <span className="text-sm text-gray-500">outbound clicks per 100 searches</span>
              </div>
              <div className="h-14 w-14 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: Number(convRate) || 0 },
                        { value: Math.max(0, 100 - (Number(convRate) || 0)) },
                      ]}
                      cx="50%" cy="50%"
                      innerRadius={18} outerRadius={24}
                      startAngle={90} endAngle={-270}
                      dataKey="value" stroke="none"
                    >
                      <Cell fill="#F97316" />
                      <Cell fill="#FFF7ED" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-center">
            <MiniStat label="Likely-human views" value={num(overview?.productViewsToday)} />
            <MiniStat label="Active now" value={num(overview?.activeNow)} />
          </div>
        </div>
      </div>

      <p className="px-1 text-[11px] text-gray-500">
        Likely-human metrics require newly classified public traffic. Older events remain unclassified instead of being counted as people.
      </p>

      {/* Catalog velocity */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[260px_1fr] lg:p-6">
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                <TrendingUp className="h-3 w-3" /> Catalog velocity
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">+{num(growth?.newProducts)}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">Products added across the selected {timeRange} window.</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Daily avg</div>
                <div className="mt-1 text-lg font-bold text-gray-900">{num(averageNewProducts)}</div>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Recoverable</div>
                <div className="mt-1 text-lg font-bold text-amber-900">{num(growth?.recoverableShops)}</div>
              </div>
            </div>
          </div>
          <div className="h-[210px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={catalogDaily} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="catalogGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} tickFormatter={(d) => String(d).slice(5)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgb(15 23 42 / 0.12)' }}
                  formatter={(value) => [num(value), 'New products']}
                />
                <Area type="monotone" dataKey="products" stroke="#F97316" strokeWidth={3} fill="url(#catalogGrowth)" activeDot={{ r: 5, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row: Analytics Chart + Funnel gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily traffic area chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-6">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Analytics</span>
              <div className="flex gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{num(dailyViewed)}</span>
                    <span className="text-sm text-gray-400">views</span>
                  </div>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{num(dailyVisitors)}</span>
                    <span className="text-sm text-gray-400">likely humans</span>
                  </div>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{num(overview?.activeNow)}</span>
                    <span className="text-sm text-gray-400">active now</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLive((v) => !v)}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  live ? 'border-emerald-200 text-emerald-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-3 w-3" /> {live ? 'Live' : 'Paused'}
              </button>
            </div>
          </div>
          <div className="h-[240px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} tickFormatter={(d) => String(d).slice(5)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="users" name="Likely humans" stroke="#94a3b8" strokeWidth={2} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="pageViews" stroke="#F97316" strokeWidth={3} fill="url(#colorViews)" activeDot={{ r: 6, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel performance gauge */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1 flex flex-col items-center relative">
          <div className="w-full text-left mb-6">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Funnel</span>
          </div>

          <div className="relative w-48 h-24 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-24 rounded-full border-[12px] border-orange-100" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />
            <div
              className="absolute inset-x-0 top-0 h-24 rounded-full border-[12px] border-orange-500"
              style={{ clipPath: `polygon(0 0, ${Math.min(100, Math.max(0, Number(funnel?.clicksPer100Views ?? funnel?.viewToClick) || 0))}% 0, ${Math.min(100, Math.max(0, Number(funnel?.clicksPer100Views ?? funnel?.viewToClick) || 0))}% 50%, 0 50%)` }}
            />
            <div className="text-center -mt-2">
              <h3 className="text-3xl font-bold text-gray-900">{pct(funnel?.clicksPer100Views ?? funnel?.viewToClick)}</h3>
              <p className="text-xs text-gray-400 mt-1">clicks per 100 views</p>
            </div>
          </div>

          <div className="mt-auto w-full border-t border-gray-100 pt-4 flex flex-col gap-3">
            <FunnelRow label="Searches" value={num(funnel?.searches)} />
            <FunnelRow label="Product views" value={num(funnel?.productViews)} />
            <FunnelRow label="Outbound clicks" value={num(funnel?.outboundClicks)} highlight />
          </div>
        </div>
      </div>

      {/* Bottom Row: hourly + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly visits */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Peak hour</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-gray-900">{peakHour}</h3>
                  <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">peak</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[120px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyBars} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} interval={3} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={8}>
                  {hourlyBars.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isHighest ? '#F97316' : '#FFEDD5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top products table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Top clicked products</span>
            <Link to="/admin/stats" className="text-xs font-semibold text-orange-500 flex items-center gap-1 hover:text-orange-600 transition">
              See Details <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Clicks</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Shops</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray text-sm">No outbound clicks in this window yet.</td>
                  </tr>
                ) : topProducts.map((p) => (
                  <tr key={p.productId || p.name} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {(p.name || p.productId || '?').charAt(0)}
                        </div>
                        <Link to={`/product/${p.productId}`} className="text-sm font-semibold text-gray-900 hover:text-orange-600">
                          {p.name || p.productId}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 font-mono">{num(p.clicks)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 font-mono">{num(p.distinctShops)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 truncate max-w-[140px]">{p.category || '—'}</td>
                    <td className="px-5 py-4 text-right text-xs text-gray-400">{p.lastSeen ? timeAgo(p.lastSeen) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Optional widgets (Add Widget panel toggles these on) */}
      {enabled.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {OPTIONAL_WIDGETS.filter((w) => enabled.includes(w.id)).map((w) => (
            <OptionalWidget key={w.id} widget={w} data={widgetData[w.id]} />
          ))}
        </div>
      )}

      {/* Add Widget side panel */}
      {widgetPanel && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setWidgetPanel(false)}
            aria-label="Close widget panel"
          />
          <aside className="absolute right-0 top-0 h-full w-[340px] max-w-[88vw] bg-white shadow-2xl flex flex-col animate-slide-down">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add widgets</h3>
                <p className="text-xs text-gray-500">Toggle a card on/off. Your choice is remembered.</p>
              </div>
              <button
                onClick={() => setWidgetPanel(false)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {OPTIONAL_WIDGETS.map((w) => {
                const Icon = w.icon;
                const on = enabled.includes(w.id);
                return (
                  <button
                    key={w.id}
                    onClick={() => toggleWidget(w.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      on ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`grid h-9 w-9 place-items-center rounded-lg ${on ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900">{w.label}</div>
                      <div className="text-[11px] text-gray-500">{on ? 'Shown on dashboard' : 'Hidden'}</div>
                    </div>
                    <span className={`relative h-5 w-9 rounded-full transition ${on ? 'bg-orange-500' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-4' : 'left-0.5'}`} />
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── small building blocks ─────────────────────────────

function MiniStat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-base font-bold text-gray-900 mt-0.5">{value}</div>
    </div>
  );
}

function FunnelRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-1 rounded-full ${highlight ? 'bg-orange-500' : 'bg-orange-200'}`} />
        <span className={`font-medium ${highlight ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>
      </div>
      <span className="text-gray-400 font-mono">{value}</span>
    </div>
  );
}

/** Renders one optional widget by id, reading its already-fetched data. */
function OptionalWidget({ widget, data }) {
  const title = widget.label;
  const rows = optionalRows(widget.id, data);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <widget.icon className="h-4 w-4 text-orange-500" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
        <span className="ml-auto text-[10px] text-gray-400 font-mono">{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">No data in this window.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.slice(0, 8).map((r, i) => {
            const key = r.label || r.query || r.siteSlug || r.referrer || r.productId || r.device || i;
            const metric = r.value ?? r.clicks ?? r.hits ?? r.views ?? r.appearances ?? r.visitors;
            return (
              <li key={key} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                <span className="truncate text-gray-700 mr-2">{String(key)}</span>
                <span className="font-mono text-gray-400 shrink-0">{r.formatted ?? num(metric)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ───────────────────────────── helpers ─────────────────────────────

function optionalRows(id, data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  if (id === 'devices') return Array.isArray(data.devices) ? data.devices : [];
  if (id === 'funnel') {
    return [
      { label: 'Searches', value: data.searches },
      { label: 'Product views', value: data.productViews },
      { label: 'Outbound clicks', value: data.outboundClicks },
      { label: 'Clicks / 100 searches', formatted: pct(data.clicksPer100Searches ?? data.searchToClick) },
    ];
  }
  return [];
}

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function loadWidgets() {
  try {
    const raw = localStorage.getItem(WIDGET_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : DEFAULT_ENABLED;
  } catch {
    return DEFAULT_ENABLED;
  }
}
