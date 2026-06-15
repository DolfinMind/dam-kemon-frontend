import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Radio, Users, Activity, Eye, Search as SearchIcon, MousePointerClick,
  Globe, Server, Clock, TrendingUp, Map as MapIcon,
} from 'lucide-react';
import {
  analyticsOverview, analyticsHourly, analyticsDailyUsers,
  analyticsTopSearches, analyticsTopIps, analyticsTopPaths, analyticsRequests,
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
  const [requests, setRequests] = useState([]);
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
  }, [windowDays]);

  useEffect(() => {
    analyticsDailyUsers(dailyDays).then((r) => setDaily(r.data || [])).catch(() => {});
  }, [dailyDays]);

  // Live counters + request feed — poll while "live" is on.
  useEffect(() => {
    const pullOverview = () => analyticsOverview().then((r) => setOverview(r.data)).catch(() => {});
    const pullFeed = () => analyticsRequests(60).then((r) => setRequests(r.data || [])).catch(() => {});
    pullOverview();
    pullFeed();
    const t = setInterval(() => {
      if (!liveRef.current) return;
      pullOverview();
      pullFeed();
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
            Every search, page view and request — logged.
            {overview?.timezone && <> Times in <span className="font-mono">{overview.timezone}</span>.</>}
          </p>
        </div>
        <button
          onClick={() => setLive((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            live ? 'bg-green/10 text-green border-green/30' : 'bg-cream-soft text-gray border-line'
          }`}
          title="Auto-refresh live counters and the request feed"
        >
          <Radio className={`w-3.5 h-3.5 ${live ? 'animate-pulse' : ''}`} /> {live ? 'Live' : 'Paused'}
        </button>
      </div>

      {/* ── KPI cards ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi icon={Radio} label="Active now" value={num(overview?.activeNow)} accent hint="last 5 min" />
        <Kpi icon={Users} label="Visitors today" value={num(overview?.visitorsToday)} />
        <Kpi icon={Server} label="Requests today" value={num(overview?.requestsToday)} hint={`${num(overview?.requestsLastHour)} last hr`} />
        <Kpi icon={Eye} label="Page views today" value={num(overview?.pageViewsToday)} />
        <Kpi icon={SearchIcon} label="Searches today" value={num(overview?.searchesToday)} />
        <Kpi icon={Eye} label="Product views" value={num(overview?.productViewsToday)} />
        <Kpi icon={MousePointerClick} label="Outbound clicks" value={num(overview?.clicksToday)} />
        <Kpi icon={Globe} label="Unique IPs today" value={num(overview?.ipsToday)} />
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

      {/* ── live request feed ── */}
      <section>
        <h3 className="font-serif text-lg font-semibold mb-3 inline-flex items-center gap-2">
          <Server className="w-4 h-4" /> Live request feed
          {live && <span className="inline-flex items-center gap-1 text-[10px] font-mono text-green"><Radio className="w-3 h-3 animate-pulse" /> streaming</span>}
        </h3>
        {requests.length === 0 ? <Empty>No requests captured yet.</Empty> : (
          <div className="overflow-x-auto max-h-[28rem] overflow-y-auto rounded-lg border border-line">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-cream">
                <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                  <th className="py-2 px-3">When</th>
                  <th className="py-2 pr-3">Method</th>
                  <th className="py-2 pr-3">Path</th>
                  <th className="py-2 pr-3 text-right">Status</th>
                  <th className="py-2 pr-3 text-right">ms</th>
                  <th className="py-2 pr-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-line/50">
                    <td className="py-1.5 px-3 text-gray whitespace-nowrap">{timeAgo(r.ts)}</td>
                    <td className="py-1.5 pr-3 font-mono font-semibold">{r.method}</td>
                    <td className="py-1.5 pr-3 font-mono max-w-[20rem] truncate" title={`${r.path}${r.query ? '?' + r.query : ''}`}>
                      {r.path}{r.query ? <span className="text-gray">?{r.query}</span> : null}
                    </td>
                    <td className={`py-1.5 pr-3 text-right font-mono ${r.status >= 500 ? 'text-red' : r.status >= 400 ? 'text-yellow' : 'text-green'}`}>{r.status}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-gray">{r.latencyMs}</td>
                    <td className="py-1.5 pr-3 font-mono text-gray">{r.ip || `hash:${r.ipHash || '—'}`}</td>
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
