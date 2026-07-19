import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity, ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight,
  Clock3, ExternalLink, Eye, Heart, LogIn, Mail, MessageSquare, MousePointerClick,
  Search, ShieldCheck, Sparkles, Star, UserPlus, Users,
} from 'lucide-react';
import { adminUser, adminUserConversion, adminUsers } from '../../api/admin';

export default function AdminUsers() {
  const { id } = useParams();
  return id ? <UserDetail id={id} /> : <UserList />;
}

function UserList() {
  const [days, setDays] = useState(30);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [conversion, setConversion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminUserConversion(days).then((r) => setConversion(r.data)).catch(() => setConversion(null));
  }, [days]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      adminUsers({ page, size: 30, q: query, days })
        .then((r) => setData(r.data))
        .catch(() => setData({ items: [], page: 0, pages: 0, total: 0 }))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [days, page, query]);

  const changeSearch = (value) => {
    setQuery(value);
    setPage(0);
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[.18em] text-green mb-2">
            <Activity className="w-3.5 h-3.5" /> Customer intelligence
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Users & conversion</h2>
          <p className="text-sm text-gray mt-1">See who joined, what they do, and where free visitors become members.</p>
        </div>
        <select
          value={days}
          onChange={(e) => { setDays(Number(e.target.value)); setPage(0); }}
          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold outline-none focus:border-ink"
          aria-label="Analytics time period"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric icon={Users} label="Total users" value={conversion?.totalUsers} tone="ink" />
        <Metric icon={UserPlus} label="New accounts" value={conversion?.newUsers} tone="blue" />
        <Metric icon={Sparkles} label="Activated" value={conversion?.activatedUsers} tone="green" />
        <Metric icon={ArrowRight} label="Visitor → user" value={conversion ? `${conversion.conversionRate}%` : null} tone="red" />
      </section>

      <ConversionFunnel data={conversion} />

      <section className="card-soft overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold">All users</h3>
            <p className="text-xs text-gray mt-0.5">Each user opens into a private activity timeline.</p>
          </div>
          <label className="relative block sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
            <input
              value={query}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="Search name or email"
              className="w-full rounded-full border border-line bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-ink"
            />
          </label>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray">Loading users…</div>
        ) : !data?.items?.length ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-gray/50 mx-auto mb-2" />
            <p className="font-semibold">No users found</p>
            <p className="text-sm text-gray">Try a different search.</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
                    <th className="px-5 py-3">User</th>
                    <th className="px-4 py-3">Joined via</th>
                    <th className="px-4 py-3">Last active</th>
                    <th className="px-4 py-3 text-right">Activity</th>
                    <th className="px-5 py-3 text-right">Trust</th>
                  </tr>
                </thead>
                <tbody>{data.items.map((user) => <UserRow key={user.id} user={user} />)}</tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-line">
              {data.items.map((user) => <UserCard key={user.id} user={user} />)}
            </div>
          </>
        )}

        <Pagination data={data} page={page} setPage={setPage} />
      </section>

      <p className="text-[11px] text-gray text-center">
        Activity is retained for 30 days. Credentials, tokens, request bodies, and raw IP addresses are never shown here.
      </p>
    </div>
  );
}

function ConversionFunnel({ data }) {
  const visitors = data?.visitors || 0;
  const signedUp = data?.newUsers || 0;
  const activated = data?.activatedUsers || 0;
  const width = (value) => `${Math.max(value > 0 ? 8 : 0, visitors ? Math.min(100, value / visitors * 100) : 0)}%`;

  return (
    <section className="relative overflow-hidden rounded-[1.6rem] bg-ink text-white p-5 sm:p-7">
      <div className="absolute -right-10 -top-16 w-52 h-52 rounded-full bg-green/20 blur-3xl" />
      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="lg:w-56 shrink-0">
          <p className="text-[10px] font-mono uppercase tracking-[.18em] text-green-light">Free-user funnel</p>
          <h3 className="font-serif text-xl font-bold mt-1">From curious to committed</h3>
          <p className="text-xs text-white/55 mt-2">Activation means a new member saved a product, enabled an alert, or saved a search.</p>
        </div>
        <div className="flex-1 space-y-3">
          <FunnelStep label="Free visitors" value={visitors} width="100%" color="bg-blue" />
          <FunnelStep label="Created account" value={signedUp} width={width(signedUp)} color="bg-red" detail={`${data?.conversionRate || 0}% conversion`} />
          <FunnelStep label="Activated member" value={activated} width={width(activated)} color="bg-green" detail={`${data?.activationRate || 0}% of signups`} />
        </div>
        <div className="grid grid-cols-2 gap-2 lg:w-48 shrink-0">
          <MiniStat label="Google" value={data?.googleSignups} />
          <MiniStat label="Email" value={data?.emailSignups} />
          <MiniStat label="Active users" value={data?.activeRegistered} className="col-span-2" />
        </div>
      </div>
    </section>
  );
}

function FunnelStep({ label, value, width, color, detail }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold">{label}</span>
        <span className="font-mono text-white/65">{formatNumber(value)}{detail ? ` · ${detail}` : ''}</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-3 ${className}`}>
      <p className="text-[9px] uppercase tracking-wider text-white/45">{label}</p>
      <p className="font-serif text-xl font-bold mt-1">{formatNumber(value)}</p>
    </div>
  );
}

function UserRow({ user }) {
  return (
    <tr className="border-b border-line/60 last:border-0 hover:bg-white transition-colors group">
      <td className="px-5 py-3.5"><Link to={`/admin/users/${user.id}`}><UserIdentity user={user} /></Link></td>
      <td className="px-4 py-3.5"><SourcePill source={user.signupSource} /></td>
      <td className="px-4 py-3.5 text-xs text-gray">{relativeTime(user.lastActiveAt || user.lastLoginAt)}</td>
      <td className="px-4 py-3.5 text-right">
        <span className="font-mono font-bold">{formatNumber(user.activityCount)}</span>
        <span className="block text-[10px] text-gray">{user.searches || 0} search · {user.clicks || 0} click</span>
      </td>
      <td className="px-5 py-3.5">
        <Link to={`/admin/users/${user.id}`} className="flex items-center justify-end gap-2" aria-label={`Open ${displayName(user)}`}>
          <span className="inline-flex items-center gap-1 font-mono text-xs"><Star className="w-3 h-3 text-green" />{user.reputation ?? 1}</span>
          <ChevronRight className="w-4 h-4 text-gray group-hover:translate-x-0.5 group-hover:text-ink transition-all" />
        </Link>
      </td>
    </tr>
  );
}

function UserCard({ user }) {
  return (
    <Link to={`/admin/users/${user.id}`} className="block p-4 hover:bg-white transition-colors">
      <div className="flex items-center justify-between gap-3">
        <UserIdentity user={user} />
        <ChevronRight className="w-4 h-4 text-gray shrink-0" />
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-gray">
        <SourcePill source={user.signupSource} />
        <span>{formatNumber(user.activityCount)} actions · {relativeTime(user.lastActiveAt || user.lastLoginAt)}</span>
      </div>
    </Link>
  );
}

function UserIdentity({ user }) {
  return (
    <span className="flex items-center gap-3 min-w-0">
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-line shrink-0" />
      ) : (
        <span className="w-9 h-9 rounded-full bg-green/15 text-green inline-grid place-items-center font-serif font-bold shrink-0">
          {displayName(user).slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="min-w-0">
        <span className="font-semibold truncate flex items-center gap-1.5">
          {displayName(user)}
          {user.emailVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue shrink-0" />}
        </span>
        <span className="block text-xs text-gray truncate">{user.email || user.username}</span>
      </span>
    </span>
  );
}

function SourcePill({ source }) {
  const google = source === 'google';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${google ? 'bg-blue/10 text-blue' : 'bg-green/10 text-green'}`}>
      {google ? <Sparkles className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
      {google ? 'Google' : source === 'owner-bootstrap' ? 'Owner' : 'Email'}
    </span>
  );
}

function Pagination({ data, page, setPage }) {
  if (!data || data.pages <= 1) return null;
  return (
    <div className="px-4 py-3 border-t border-line flex items-center justify-between text-xs text-gray">
      <span>{formatNumber(data.total)} users · page {page + 1} of {data.pages}</span>
      <div className="flex gap-2">
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-full border border-line disabled:opacity-30 hover:border-ink">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button disabled={page + 1 >= data.pages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-full border border-line disabled:opacity-30 hover:border-ink">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function UserDetail({ id }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setData(null);
    setError(false);
    adminUser(id).then((r) => setData(r.data)).catch(() => setError(true));
  }, [id]);

  if (error) return <p className="card-soft p-10 text-center text-gray">This user could not be found.</p>;
  if (!data) return <p className="card-soft p-10 text-center text-gray">Loading activity…</p>;

  const { user, counts, activity } = data;
  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray hover:text-ink">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      <section className="relative overflow-hidden rounded-[1.6rem] bg-ink text-white p-6 sm:p-8">
        <div className="absolute -right-12 -top-20 w-64 h-64 rounded-full bg-green/20 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-3xl object-cover border border-white/15" />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-green text-ink grid place-items-center font-serif text-3xl font-bold">
              {displayName(user).slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-3xl font-bold truncate">{displayName(user)}</h2>
              {user.emailVerified && <span className="inline-flex items-center gap-1 text-[10px] rounded-full bg-blue/20 text-blue-light px-2 py-1"><ShieldCheck className="w-3 h-3" /> Verified</span>}
            </div>
            <p className="text-white/60 mt-1">{user.email || user.username}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-white/55">
              <span>Joined {formatDate(user.createdAt)}</span>
              <span>Last login {relativeTime(user.lastLoginAt)}</span>
              {user.district && <span>{user.district}, Bangladesh</span>}
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 sm:text-right">
            <SourcePill source={user.signupSource} />
            <span className="inline-flex items-center sm:justify-end gap-1 text-sm font-semibold"><Star className="w-4 h-4 text-green" /> {user.reputation ?? 1} reputation</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <CountCard icon={Heart} label="Wishlist" value={counts.wishlist} />
        <CountCard icon={Search} label="Saved" value={counts.savedSearches} />
        <CountCard icon={MessageSquare} label="Reviews" value={counts.reviews} />
        <CountCard icon={Star} label="Votes" value={counts.reviewVotes} />
        <CountCard icon={ExternalLink} label="Shop clicks" value={counts.shopClicks} />
        <CountCard icon={Eye} label="Events" value={counts.events} />
        <CountCard icon={Activity} label="API actions" value={counts.requests} />
      </section>

      {(user.phone || user.interests?.length || user.newsletterOptIn != null) && (
        <section className="card-soft p-5">
          <h3 className="font-serif text-lg font-bold mb-3">Customer profile</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {user.phone && <span className="rounded-full bg-white border border-line px-3 py-1.5">{user.phone}</span>}
            {user.interests?.map((interest) => <span key={interest} className="rounded-full bg-green/10 text-green px-3 py-1.5">{interest}</span>)}
            <span className="rounded-full bg-white border border-line px-3 py-1.5">Newsletter: {user.newsletterOptIn ? 'subscribed' : 'not subscribed'}</span>
          </div>
        </section>
      )}

      <section className="card-soft overflow-hidden">
        <div className="p-5 border-b border-line flex items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-bold">Activity timeline</h3>
            <p className="text-xs text-gray mt-1">Newest first · product events and authenticated API actions.</p>
          </div>
          <span className="text-xs font-mono text-gray">{activity.length} shown</span>
        </div>
        {activity.length === 0 ? (
          <div className="p-12 text-center text-gray text-sm">No activity recorded in the last 30 days.</div>
        ) : (
          <ol className="divide-y divide-line/70">
            {activity.map((item, index) => <ActivityItem key={`${item.source}-${item.id || index}`} item={item} />)}
          </ol>
        )}
      </section>
    </div>
  );
}

function ActivityItem({ item }) {
  const Icon = activityIcon(item);
  return (
    <li className="p-4 sm:px-5 flex gap-3 hover:bg-white/70 transition-colors">
      <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${item.source === 'request' ? 'bg-blue/10 text-blue' : 'bg-green/10 text-green'}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
          <p className="text-sm font-semibold truncate">{item.label}</p>
          <time className="text-[11px] text-gray shrink-0">{formatDateTime(item.ts)}</time>
        </div>
        <p className="text-[11px] text-gray mt-1 truncate">
          {item.source === 'request'
            ? `${item.status || '—'} · ${item.latencyMs ?? '—'} ms${item.query ? ` · ${item.query}` : ''}`
            : [item.path, item.productId, item.sellerSlug].filter(Boolean).join(' · ') || item.type}
        </p>
      </div>
    </li>
  );
}

function activityIcon(item) {
  if (item.type?.includes('login') || item.type?.includes('signup')) return LogIn;
  if (item.type === 'search' || item.type === 'suggest_click') return Search;
  if (item.type === 'click') return MousePointerClick;
  if (item.type === 'view' || item.type === 'pageview') return Eye;
  if (item.type === 'email_verified') return ShieldCheck;
  return item.source === 'request' ? Activity : Clock3;
}

function Metric({ icon: Icon, label, value, tone }) {
  const tones = {
    ink: 'bg-ink text-white', blue: 'bg-blue/10 text-blue', green: 'bg-green/10 text-green', red: 'bg-red/10 text-red',
  };
  return (
    <div className="card-soft p-4 sm:p-5">
      <span className={`w-8 h-8 rounded-xl grid place-items-center ${tones[tone]}`}><Icon className="w-4 h-4" /></span>
      <p className="text-[10px] uppercase tracking-wider text-gray mt-3">{label}</p>
      <p className="font-serif text-2xl sm:text-3xl font-bold mt-0.5">{value == null ? '—' : typeof value === 'number' ? formatNumber(value) : value}</p>
    </div>
  );
}

function CountCard({ icon: Icon, label, value }) {
  return (
    <div className="card-soft p-3.5">
      <Icon className="w-4 h-4 text-green" />
      <p className="font-serif text-xl font-bold mt-2">{formatNumber(value)}</p>
      <p className="text-[9px] uppercase tracking-wider text-gray">{label}</p>
    </div>
  );
}

function displayName(user) {
  return user.displayName || user.username || user.email?.split('@')[0] || 'Unnamed user';
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-BD');
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium' }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function relativeTime(value) {
  if (!value) return 'Never';
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  const [amount, unit] = abs < 60 ? [seconds, 'second']
    : abs < 3600 ? [Math.round(seconds / 60), 'minute']
      : abs < 86400 ? [Math.round(seconds / 3600), 'hour']
        : abs < 2592000 ? [Math.round(seconds / 86400), 'day']
          : [Math.round(seconds / 2592000), 'month'];
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(amount, unit);
}
