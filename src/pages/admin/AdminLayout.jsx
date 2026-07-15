import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { triggerReindex, indexStatus } from '../../api/admin';
import {
  Shield, Database, Store, Inbox, BarChart3, FileText, LogOut, Package,
  Search as SearchIcon, Clock, HardDrive, Play, Loader2, CheckCircle2, ShieldAlert,
  Activity, Tag, MessageSquare, Users, Server, Menu, X, ExternalLink,
} from 'lucide-react';

const navigation = [
  {
    label: 'Operations',
    items: [
      { to: '/admin/indexer', label: 'Indexer', icon: Database, description: 'Runs and scrape controls' },
      { to: '/admin/crawler', label: 'Crawler', icon: Server, description: 'Crawler health and queues' },
      { to: '/admin/jobs', label: 'Jobs', icon: Clock, description: 'Background tasks' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/shops', label: 'Shops', icon: Store, description: 'Manage indexed sellers' },
      { to: '/admin/pending-shops', label: 'Pending shops', icon: Inbox, description: 'Review submissions' },
      { to: '/admin/catalog', label: 'Catalog', icon: Package, description: 'Products and listings' },
      { to: '/admin/offers', label: 'Offers', icon: Tag, description: 'Offer quality and prices' },
      { to: '/admin/reviews', label: 'Reviews', icon: ShieldAlert, description: 'Moderation queue' },
      { to: '/admin/users', label: 'Users', icon: Users, description: 'Accounts and access' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/admin/traffic', label: 'Traffic', icon: Activity, description: 'Acquisition and behavior' },
      { to: '/admin/stats', label: 'Stats', icon: BarChart3, description: 'Marketplace performance' },
      { to: '/admin/search-log', label: 'Search log', icon: SearchIcon, description: 'Queries and zero results' },
      { to: '/admin/newsletter', label: 'Newsletter', icon: Inbox, description: 'Subscribers and sends' },
      { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare, description: 'User feedback' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/cache', label: 'Cache', icon: HardDrive, description: 'Cache controls' },
      { to: '/admin/audit', label: 'Audit log', icon: FileText, description: 'Admin activity' },
    ],
  },
];

const navItems = navigation.flatMap((group) => group.items);

export default function AdminLayout() {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [running, setRunning] = useState(false);
  const [justStarted, setJustStarted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate('/sign-in', { replace: true });
    else if (user.role !== 'admin') navigate('/account', { replace: true });
  }, [ready, user, navigate]);

  // The header only needs a coarse heartbeat; the Indexer tab owns its faster
  // progress poll. Pause in background tabs so this does not flood the audit log.
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      indexStatus()
        .then((r) => setRunning(Boolean(r.data?.inProgress)))
        .catch(() => {});
    };
    tick();
    const t = setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [user]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    const close = (event) => event.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', close);
    };
  }, [drawerOpen]);

  const scrapeNow = async () => {
    if (running) return;
    if (!confirm('Kick off a full nightly indexer run right now? This will take 30–90 minutes.')) return;
    try {
      await triggerReindex();
      setRunning(true);
      setJustStarted(true);
      setTimeout(() => setJustStarted(false), 4000);
    } catch (e) {
      alert(e.response?.data?.error || 'Could not start the indexer.');
    }
  };

  if (!ready) return <div className="container-tight py-16 text-center text-gray">Loading…</div>;
  if (!user || user.role !== 'admin') return null;

  const page = pathname === '/admin'
    ? navItems[0]
    : navItems.find((item) => pathname.startsWith(item.to)) || navItems[0];

  const search = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="admin-shell min-h-screen bg-[#e9ebef] lg:p-3 xl:p-5">
      <div className="mx-auto flex min-h-screen max-w-[1600px] overflow-hidden bg-[#fbfbfa] lg:min-h-[calc(100vh-1.5rem)] lg:rounded-[22px] lg:border lg:border-white lg:shadow-[0_18px_55px_rgba(23,26,35,0.08)] xl:min-h-[calc(100vh-2.5rem)]">
        <aside className="hidden w-[252px] shrink-0 border-r border-line bg-[#f7f7f6] lg:flex lg:flex-col">
          <Sidebar user={user} pathname={pathname} onSignOut={handleSignOut} />
        </aside>

        {drawerOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
              onClick={() => setDrawerOpen(false)}
              aria-label="Dismiss admin navigation"
            />
            <aside className="relative flex h-full w-[288px] max-w-[86vw] flex-col border-r border-line bg-[#f7f7f6] shadow-2xl animate-slide-down">
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-ink"
                aria-label="Close admin navigation"
              >
                <X className="h-4 w-4" />
              </button>
              <Sidebar user={user} pathname={pathname} onSignOut={handleSignOut} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-white/95 px-3 backdrop-blur-xl sm:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-ink lg:hidden"
                aria-label="Open admin navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <form onSubmit={search} className="relative hidden w-full max-w-[340px] sm:block">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products"
                  aria-label="Search products"
                  className="h-9 w-full rounded-lg border border-line bg-[#fafafa] pl-9 pr-3 text-sm outline-none transition focus:border-red/40 focus:bg-white focus:ring-2 focus:ring-red/10"
                />
              </form>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/"
                className="hidden h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink transition-colors hover:border-line-strong sm:inline-flex"
              >
                View site <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <div className="hidden h-9 w-9 place-items-center rounded-full bg-ink text-xs font-bold text-white md:grid" title={user.email}>
                {user.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <button
                onClick={scrapeNow}
                disabled={running}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-colors sm:px-4 ${
                  running
                    ? 'cursor-wait bg-green'
                    : justStarted
                      ? 'bg-green'
                      : 'bg-red hover:bg-[#e83a18]'
                }`}
                title="Trigger a full indexer run now (otherwise runs nightly at 03:00)"
              >
                {running ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> <span className="hidden sm:inline">Scraping…</span></>
                ) : justStarted ? (
                  <><CheckCircle2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Started</span></>
                ) : (
                  <><Play className="h-3.5 w-3.5" /> <span>Scrape now</span></>
                )}
              </button>
            </div>
          </header>

          <section className="flex-1 overflow-y-auto">
            <div className="admin-content mx-auto max-w-[1320px] p-4 sm:p-6 xl:p-8">
              <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red">Admin console</p>
                  <h1 className="text-2xl font-bold tracking-[-0.025em] text-ink sm:text-[28px]">{page.label}</h1>
                  <p className="mt-1 text-xs text-gray sm:text-sm">{page.description}</p>
                </div>
                <span className="hidden items-center gap-1.5 text-[11px] text-gray sm:inline-flex">
                  <span className={`h-1.5 w-1.5 rounded-full ${running ? 'animate-pulse bg-yellow' : 'bg-green'}`} />
                  {running ? 'Indexer running' : 'Systems ready'}
                </span>
              </div>
              <Outlet />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ user, pathname, onSignOut }) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-ink text-white shadow-sm">
          <Shield className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold leading-tight tracking-[-0.02em]">dam<span className="text-red">.</span>kemon</div>
          <div className="text-[10px] leading-tight text-gray">Admin workspace</div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 no-scrollbar" aria-label="Admin navigation">
        {navigation.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <div className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.15em] text-gray/75">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.to
                  || (item.to === '/admin/indexer' && pathname === '/admin')
                  || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[12px] font-medium transition-colors ${
                      active
                        ? 'border border-line bg-white text-ink shadow-[0_1px_2px_rgba(21,19,26,0.04)]'
                        : 'border border-transparent text-gray hover:bg-white/75 hover:text-ink'
                    }`}
                  >
                    {active && <span className="absolute -left-3 h-5 w-[3px] rounded-r-full bg-red" />}
                    <Icon className={`h-3.5 w-3.5 ${active ? 'text-red' : ''}`} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-soft text-xs font-bold text-red">
            {user.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-semibold text-ink">Administrator</div>
            <div className="truncate text-[9px] text-gray">{user.email}</div>
          </div>
          <button
            onClick={onSignOut}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray transition-colors hover:bg-cream-soft hover:text-red"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
