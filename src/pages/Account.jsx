import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { trackAction } from '../api/analytics';
import {
  listSavedSearches, addSavedSearch, removeSavedSearch,
  listWishlist, removeFromWishlist, updateWishlistAlert,
  listNotifications, markNotificationsRead,
  resendVerification, updateProfile,
} from '../api/auth';
import { accountSearchHistory, getMyReviews } from '../api/api';
import {
  User as UserIcon, Bell, Heart, LogOut, Plus, X, ArrowRight, Search as SearchIcon, History, TrendingDown, Inbox,
  MailWarning, Check, Award, MessageSquare, BadgeCheck,
} from 'lucide-react';

// Bangladesh's 64 districts — the profile's location dropdown.
const DISTRICTS = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura','Brahmanbaria','Chandpur','Chattogram',
  'Chuadanga','Cox\'s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni','Gaibandha','Gazipur',
  'Gopalganj','Habiganj','Jamalpur','Jashore','Jhalokati','Jhenaidah','Joypurhat','Khagrachhari','Khulna',
  'Kishoreganj','Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura','Manikganj','Meherpur',
  'Moulvibazar','Munshiganj','Mymensingh','Naogaon','Narail','Narayanganj','Narsingdi','Natore',
  'Nawabganj','Netrokona','Nilphamari','Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari',
  'Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur','Sirajganj','Sunamganj','Sylhet',
  'Tangail','Thakurgaon',
];

// Catalog categories a user can follow — mirrors the category focus.
const INTERESTS = ['smartphones', 'laptops', 'desktops & pc', 'monitors', 'components', 'audio', 'accessories'];

function fmt(p) { if (p == null) return 'N/A'; return '৳' + Number(p).toLocaleString('en-IN'); }

export default function Account() {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const requestedTab = search.get('tab');
  const [tab, setTab] = useState(['notifications', 'wishlist', 'saved-searches', 'history', 'contributions', 'profile'].includes(requestedTab)
    ? requestedTab : 'notifications');

  useEffect(() => {
    if (ready && !user) navigate('/sign-in');
  }, [ready, user, navigate]);

  if (!ready) return <div className="container-tight py-16 text-center text-gray">Loading…</div>;
  if (!user) return null;

  return (
    <div className="container-tight py-10 sm:py-14 lg:py-16 max-w-4xl">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-ink text-cream font-serif text-lg flex items-center justify-center font-semibold">
              {(user.displayName || user.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold leading-none">
                {user.displayName || user.email}
              </h1>
              <p className="text-xs text-gray mt-1 flex items-center gap-2 flex-wrap">
                {user.email}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-acid-soft text-acid-deep font-mono text-[10px] font-bold" title="Community reputation">
                  <Award className="w-3 h-3" /> {user.reputation || 1} points
                </span>
                {user.role === 'admin' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red/15 text-red font-mono text-[10px] uppercase tracking-wider">admin</span>}
              </p>
            </div>
          </div>
        </div>
        {user.role === 'admin' && (
          <Link to="/admin" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink text-ink text-xs font-semibold hover:bg-ink hover:text-cream transition-colors">
            Admin <ArrowRight className="w-3 h-3" />
          </Link>
        )}
        <button
          onClick={() => { signOut(); navigate('/'); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-soft border border-line text-ink text-xs font-semibold hover:border-ink transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>

      {user.emailVerified === false && <VerifyBanner />}

      <div className="flex gap-2 border-b border-line mb-6 overflow-x-auto no-scrollbar">
        <TabBtn active={tab === 'notifications'} onClick={() => setTab('notifications')} icon={Inbox}>
          Notifications
        </TabBtn>
        <TabBtn active={tab === 'wishlist'} onClick={() => setTab('wishlist')} icon={Heart}>
          Wishlist
        </TabBtn>
        <TabBtn active={tab === 'saved-searches'} onClick={() => setTab('saved-searches')} icon={Bell}>
          Saved searches
        </TabBtn>
        <TabBtn active={tab === 'history'} onClick={() => setTab('history')} icon={History}>
          History
        </TabBtn>
        <TabBtn active={tab === 'contributions'} onClick={() => setTab('contributions')} icon={Award}>
          Contributions
        </TabBtn>
        <TabBtn active={tab === 'profile'} onClick={() => setTab('profile')} icon={UserIcon}>
          Profile
        </TabBtn>
      </div>

      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'saved-searches' && <SavedSearchesTab />}
      {tab === 'wishlist' && <WishlistTab />}
      {tab === 'history' && <HistoryTab />}
      {tab === 'contributions' && <ContributionsTab />}
      {tab === 'profile' && <ProfileTab />}
    </div>
  );
}

/** Shown while the signup verification link hasn't been clicked — alert
 *  emails stay off until it is. */
function VerifyBanner() {
  const [state, setState] = useState('idle'); // idle | busy | sent

  const resend = async () => {
    setState('busy');
    try { await resendVerification(); setState('sent'); }
    catch { setState('idle'); }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 px-4 py-3 bg-yellow-soft border border-yellow rounded-2xl text-sm">
      <MailWarning className="w-4 h-4 shrink-0 text-ink" />
      <span className="flex-1 min-w-[16rem] text-ink/80">
        Verify your email to activate price-drop alerts — check your inbox for the link.
      </span>
      {state === 'sent' ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green">
          <Check className="w-3.5 h-3.5" /> Sent — check your inbox
        </span>
      ) : (
        <button
          onClick={resend}
          disabled={state === 'busy'}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink text-cream hover:bg-red disabled:opacity-50 transition-colors"
        >
          {state === 'busy' ? 'Sending…' : 'Resend link'}
        </button>
      )}
    </div>
  );
}

/** Everything about you — all optional, saved with one button. */
function ProfileTab() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    district: user?.district || '',
    gender: user?.gender || '',
    birthYear: user?.birthYear || '',
    interests: user?.interests || [],
    newsletterOptIn: user?.newsletterOptIn !== false,
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => { setSaved(false); setForm({ ...form, [k]: e.target.value }); };
  const toggleInterest = (i) => {
    setSaved(false);
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateProfile({
        displayName: form.displayName,
        phone: form.phone,
        district: form.district,
        gender: form.gender,
        birthYear: form.birthYear === '' ? null : Number(form.birthYear),
        interests: form.interests,
        newsletterOptIn: form.newsletterOptIn,
      });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save. Try again.');
    } finally { setBusy(false); }
  };

  const input = 'w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ink';
  const label = 'block text-xs font-mono uppercase tracking-wider text-gray mb-1.5';

  return (
    <form onSubmit={save} className="card-soft p-6 sm:p-8 space-y-4 max-w-xl">
      <p className="text-sm text-gray">
        Everything here is optional — it helps us tailor deals and the weekly digest to you.
      </p>
      <label className="block">
        <span className={label}>Name</span>
        <input type="text" value={form.displayName} onChange={set('displayName')} className={input} />
      </label>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className={label}>Phone</span>
          <input type="tel" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" className={input} />
        </label>
        <label className="block">
          <span className={label}>District</span>
          <select value={form.district} onChange={set('district')} className={input}>
            <option value="">—</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={label}>Gender</span>
          <select value={form.gender} onChange={set('gender')} className={input}>
            <option value="">—</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block">
          <span className={label}>Birth year</span>
          <input type="number" min="1920" max={new Date().getFullYear()} value={form.birthYear}
                 onChange={set('birthYear')} className={input} />
        </label>
      </div>
      <div>
        <span className={label}>I care about</span>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button
              type="button"
              key={i}
              onClick={() => toggleInterest(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
                form.interests.includes(i)
                  ? 'bg-acid text-ink border-acid'
                  : 'bg-white text-ink/70 border-line hover:border-ink'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-start gap-2 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={form.newsletterOptIn}
          onChange={(e) => { setSaved(false); setForm({ ...form, newsletterOptIn: e.target.checked }); }}
          className="mt-0.5"
        />
        <span>Weekly price-drop digest</span>
      </label>

      {error && <p className="text-sm text-red">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-ink text-cream font-semibold text-sm hover:bg-red disabled:opacity-50 transition-colors"
        >
          {busy ? 'Saving…' : 'Save profile'}
        </button>
        {saved && <span className="inline-flex items-center gap-1 text-sm text-green"><Check className="w-4 h-4" /> Saved</span>}
      </div>
    </form>
  );
}

function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
        active ? 'text-ink border-ink' : 'text-gray border-transparent hover:text-ink'
      }`}
    >
      <Icon className="w-4 h-4" /> {children}
    </button>
  );
}

function ContributionsTab() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReviews()
      .then((r) => setReviews(Array.isArray(r.data) ? r.data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray text-sm">Loading…</p>;
  const trusted = reviews.filter((r) => r.trusted || r.verified).length;
  const netScore = reviews.reduce((sum, r) => sum + (r.score || 0), 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Reputation', user?.reputation || 1],
          ['Reviews', reviews.length],
          ['Trusted', trusted],
        ].map(([label, value]) => (
          <div key={label} className="card-soft p-4 text-center">
            <div className="font-serif text-2xl font-bold text-ink">{value}</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-gray mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-ink text-cream p-4 flex items-start gap-3">
        <Award className="w-5 h-5 text-acid shrink-0 mt-0.5" />
        <p className="text-sm text-cream/75 leading-relaxed">
          Helpful review upvotes earn <strong className="text-cream">+10</strong>; downvotes cost <strong className="text-cream">2</strong>.
          Reviews become trusted at 5 net votes and 50 reputation, or instantly with a verified purchase. Your reviews have {netScore} net points.
        </p>
      </div>
      {!reviews.length ? (
        <div className="card-soft py-12 text-center">
          <MessageSquare className="w-9 h-9 text-ink/20 mx-auto mb-3" />
          <p className="text-sm text-gray">Your product reviews will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {reviews.map((r) => (
            <li key={r.id} className="card-soft p-4 flex items-start gap-3">
              <div className="w-12 text-center shrink-0">
                <div className="font-mono text-lg font-bold text-ink">{r.score || 0}</div>
                <div className="font-mono text-[9px] uppercase text-gray">points</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/product/${r.productId}`} className="font-semibold text-sm text-ink hover:text-red transition-colors">
                    {r.title || 'Your product review'}
                  </Link>
                  {(r.trusted || r.verified) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-acid-soft text-acid-deep px-2 py-0.5 text-[9px] font-mono uppercase font-bold">
                      <BadgeCheck className="w-3 h-3" /> Trusted
                    </span>
                  )}
                </div>
                {r.content && <p className="text-sm text-gray mt-1 line-clamp-2">{r.content}</p>}
                <p className="text-[10px] font-mono text-gray mt-2">{r.upvoteCount || 0} up · {r.downvoteCount || 0} down</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SavedSearchesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuery, setNewQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () =>
    listSavedSearches()
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    setBusy(true);
    try {
      await addSavedSearch(newQuery.trim());
      trackAction('saved_search_created');
      setNewQuery('');
      await reload();
    }
    catch { /* ignore */ }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    try { await removeSavedSearch(id); setItems((xs) => xs.filter((x) => x.id !== id)); }
    catch { /* ignore */ }
  };

  return (
    <div>
      <form onSubmit={add} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
          placeholder="e.g. iphone 17 pro"
          className="flex-1 bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={busy || !newQuery.trim()}
          className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-ink text-cream font-semibold text-sm hover:bg-red disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" /> Track
        </button>
      </form>

      {loading ? (
        <p className="text-gray text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12 card-soft">
          <Bell className="w-10 h-10 text-ink/20 mx-auto mb-3" />
          <p className="text-gray text-sm">No saved searches yet.</p>
          <p className="text-gray text-xs mt-1">Add one above and we’ll email you when prices drop.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 card-soft px-4 py-3">
              <Link to={`/search?q=${encodeURIComponent(s.query)}`} className="flex-1 min-w-0 group">
                <div className="inline-flex items-center gap-1.5">
                  <SearchIcon className="w-3.5 h-3.5 text-gray" />
                  <span className="font-semibold text-sm truncate group-hover:text-acid-deep transition-colors">{s.query}</span>
                </div>
                {s.lastSeenLowest && (
                  <span className="block text-[11px] text-gray mt-0.5">cheapest seen ৳{Number(s.lastSeenLowest).toLocaleString('en-IN')}</span>
                )}
              </Link>
              <button
                onClick={() => remove(s.id)}
                className="shrink-0 p-1.5 rounded-full hover:bg-red/10 hover:text-red text-gray transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accountSearchHistory()
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray text-sm">Loading…</p>;
  if (!items.length) {
    return (
      <div className="text-center py-12 card-soft">
        <History className="w-10 h-10 text-ink/20 mx-auto mb-3" />
        <p className="text-gray text-sm">No searches recorded yet.</p>
        <p className="text-gray text-xs mt-1">We only keep your history when you’re signed in.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-1">
      {items.map((h, i) => (
        <li key={i} className="flex items-center justify-between py-2 border-b border-line/50">
          <Link to={`/search?q=${encodeURIComponent(h.query)}`} className="text-sm hover:text-acid-deep truncate">{h.query}</Link>
          <span className="text-[11px] text-gray font-mono ml-2 whitespace-nowrap">
            {h.resultCount ?? 0} results · {new Date(h.ts).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
}

function WishlistTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listWishlist()
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId) => {
    try { await removeFromWishlist(productId); setItems((xs) => xs.filter((x) => x.product?.id !== productId && x.productId !== productId)); }
    catch { /* ignore */ }
  };

  const toggleAlert = async (productId, currentEnabled) => {
    try {
      await updateWishlistAlert(productId, { alertsEnabled: !currentEnabled });
      if (!currentEnabled) trackAction('member_action_completed_track', productId);
      setItems((xs) => xs.map((x) =>
        (x.product?.id === productId || x.productId === productId)
          ? { ...x, alertsEnabled: !currentEnabled } : x));
    } catch { /* ignore */ }
  };

  if (loading) return <p className="text-gray text-sm">Loading…</p>;
  if (!items.length) {
    return (
      <div className="text-center py-12 card-soft">
        <Heart className="w-10 h-10 text-ink/20 mx-auto mb-3" />
        <p className="text-gray text-sm">Your wishlist is empty.</p>
        <p className="text-gray text-xs mt-1">Tap the heart on any product to save it.</p>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((w) => {
        const pid = w.product?.id || w.productId;
        const dropTarget = w.targetPrice;
        return (
          <li key={w.id} className="card-soft p-3 flex gap-3 items-start">
            {w.product?.imageUrl && (
              <img src={w.product.imageUrl} alt={w.product.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {w.product ? (
                <>
                  <Link to={`/product/${w.product.id || w.product.slug}`} className="block">
                    <span className="font-serif text-sm font-semibold line-clamp-2 hover:text-acid-deep transition-colors">{w.product.name}</span>
                  </Link>
                  <div className="mt-1 inline-flex items-baseline gap-2">
                    <span className="font-mono text-base font-bold">{fmt(w.product.lowestPrice)}</span>
                    {w.priceAtAdd && w.product.lowestPrice && w.product.lowestPrice < w.priceAtAdd && (
                      <span className="text-[11px] text-green font-mono">↓ {fmt(w.priceAtAdd - w.product.lowestPrice)}</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggleAlert(pid, w.alertsEnabled)}
                      className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                        w.alertsEnabled
                          ? 'bg-green/15 text-green border border-green/30'
                          : 'bg-cream-soft text-gray border border-line hover:border-ink hover:text-ink'
                      }`}
                    >
                      <Bell className="w-3 h-3" /> {w.alertsEnabled ? 'Alerts on' : 'Alerts off'}
                    </button>
                    {dropTarget && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-ink/5 text-ink/70">
                        target {fmt(dropTarget)}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray italic">Product removed from catalog</p>
              )}
            </div>
            <button
              onClick={() => remove(pid)}
              className="shrink-0 p-1.5 rounded-full hover:bg-red/10 hover:text-red text-gray transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function NotificationsTab() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listNotifications(30)
      .then((r) => {
        const data = r.data || {};
        setItems(Array.isArray(data.items) ? data.items : []);
        setUnread(data.unread || 0);
      })
      .catch(() => { setItems([]); setUnread(0); })
      .finally(() => setLoading(false));
  }, []);

  const markRead = async () => {
    try { await markNotificationsRead(); setUnread(0);
      setItems((xs) => xs.map((n) => ({ ...n, unread: false }))); }
    catch { /* ignore */ }
  };

  if (loading) return <p className="text-gray text-sm">Loading…</p>;
  if (!items.length) {
    return (
      <div className="text-center py-12 card-soft">
        <Inbox className="w-10 h-10 text-ink/20 mx-auto mb-3" />
        <p className="text-gray text-sm">No notifications yet.</p>
        <p className="text-gray text-xs mt-1">Turn on alerts on any product to get notified when its price drops.</p>
      </div>
    );
  }
  return (
    <div>
      {unread > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[12px] text-gray font-mono">{unread} unread</span>
          <button onClick={markRead} className="text-[12px] font-semibold text-ink hover:text-acid-deep transition-colors">Mark all read</button>
        </div>
      )}
      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.id} className={`card-soft p-3 flex items-start gap-3 ${n.unread ? 'border-yellow' : ''}`}>
            {n.productImageUrl && <img src={n.productImageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <Link to={`/product/${n.productId}`} className="block">
                <span className="font-serif text-sm font-semibold line-clamp-1 hover:text-acid-deep transition-colors">{n.productName}</span>
              </Link>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-green font-bold">
                  <TrendingDown className="w-3 h-3" /> {fmt(n.currentPrice)}
                </span>
                {n.priceAtAdd && n.priceAtAdd > n.currentPrice && (
                  <span className="text-[10px] font-mono text-gray">↓ {fmt(n.priceAtAdd - n.currentPrice)} from your save</span>
                )}
                <span className="text-[10px] font-mono text-gray ml-auto">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
