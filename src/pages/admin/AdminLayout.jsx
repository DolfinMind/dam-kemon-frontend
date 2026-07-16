/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { crawlerAction, crawlerStatus } from '../../api/admin';
import {
  Store, Inbox, BarChart3, FileText, LogOut, Package,
  Search as SearchIcon, Clock, HardDrive, ShieldAlert,
  Activity, Tag, MessageSquare, Users, Menu, X, Bell, Plus, Settings, Play, Loader2, CheckCircle2, Database
} from 'lucide-react';

const navigation = [
  {
    label: 'MAIN MENU',
    items: [
      { to: '/admin/traffic', label: 'Traffic', icon: Activity, description: 'Acquisition and behavior' },
      { to: '/admin/catalog', label: 'Catalog', icon: Package, description: 'Products and listings' },
      { to: '/admin/pending-shops', label: 'Pending', icon: Inbox, description: 'Review submissions' },
      { to: '/admin/offers', label: 'Offers', icon: Tag, description: 'Promotional offers' },
      { to: '/admin/users', label: 'Users', icon: Users, description: 'Accounts and access' },
      { to: '/admin/reviews', label: 'Reviews', icon: ShieldAlert, description: 'Moderation queue', badge: 22 },
    ],
  },
  {
    label: 'OTHER',
    items: [
      { to: '/admin/indexer', label: 'Indexer', icon: Database, description: 'Catalog growth history' },
      { to: '/admin/crawler', label: 'Crawler', icon: Activity, description: 'Continuous crawler control' },
      { to: '/admin/newsletter', label: 'Newsletter', icon: Inbox, description: 'Subscribers and sends' },
      { to: '/admin/stats', label: 'Stats', icon: BarChart3, description: 'Marketplace performance' },
      { to: '/admin/shops', label: 'Shops', icon: Store, description: 'Manage indexed sellers' },
      { to: '/admin/search-log', label: 'Search log', icon: SearchIcon, description: 'Queries and zero results' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/admin/audit', label: 'Audit log', icon: FileText, description: 'Admin activity' },
      { to: '/admin/jobs', label: 'Jobs', icon: Clock, description: 'Background tasks' },
      { to: '/admin/cache', label: 'Cache', icon: HardDrive, description: 'Manage system cache' },
    ],
  },
];

const bottomNavigation = [
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
];

export default function AdminLayout() {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [justStarted, setJustStarted] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate('/sign-in', { replace: true });
    else if (user.role !== 'admin') navigate('/account', { replace: true });
  }, [ready, user, navigate]);

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

  // Production keeps crawl work off the API JVM. Poll the continuous Python
  // crawler instead so the header control never hits crawl_disabled_on_api.
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const tick = () =>
      crawlerStatus()
        .then((r) => setRunning(Boolean(r.data?.active)))
        .catch(() => {});
    tick();
    const t = setInterval(tick, 5000);
    return () => clearInterval(t);
  }, [user]);

  const scrapeNow = async () => {
    if (starting) return;
    const action = running ? 'restart' : 'start';
    const prompt = running
      ? 'Restart the continuous crawler now? Active work will resume after the service restarts.'
      : 'Start the continuous crawler now? Crawl work stays isolated from the API server.';
    if (!confirm(prompt)) return;
    setStarting(true);
    try {
      await crawlerAction(action);
      setRunning(true);
      setJustStarted(true);
      setTimeout(() => setJustStarted(false), 4000);
    } catch (e) {
      alert(e.response?.data?.error || 'Could not start the crawler.');
    } finally {
      setStarting(false);
    }
  };

  if (!ready) return <div className="container-tight py-16 text-center text-gray">Loading…</div>;
  if (!user || user.role !== 'admin') return null;

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
    <div className="admin-shell min-h-screen bg-[#F0F2F5] lg:p-4 xl:p-6 font-sans">
      <div className="mx-auto flex min-h-screen max-w-[1600px] overflow-hidden bg-white lg:min-h-[calc(100vh-2rem)] lg:rounded-[24px] lg:shadow-xl xl:min-h-[calc(100vh-3rem)]">
        <aside className="hidden w-[240px] shrink-0 border-r border-[#EFEFEF] bg-white lg:flex lg:flex-col py-6">
          <Sidebar pathname={pathname} onSignOut={handleSignOut} />
        </aside>

        {drawerOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <button
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setDrawerOpen(false)}
              aria-label="Dismiss admin navigation"
            />
            <aside className="relative flex h-full w-[280px] max-w-[85vw] flex-col border-r border-[#EFEFEF] bg-white shadow-2xl animate-slide-right py-6">
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
              <Sidebar pathname={pathname} onSignOut={handleSignOut} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col bg-[#FDFDFD]">
          <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between gap-4 border-b border-[#EFEFEF] bg-white px-6">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <button
                onClick={() => setDrawerOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-gray-600 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <form onSubmit={search} className="relative hidden w-full max-w-[400px] sm:block">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  aria-label="Search"
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-12 text-sm text-gray-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400 font-medium tracking-wide">
                  <span>F</span>
                  <span className="text-[10px]">⌘</span>
                </div>
              </form>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="hidden items-center -space-x-2 md:flex">
                <img src="https://i.pravatar.cc/100?img=33" className="h-8 w-8 rounded-full border-2 border-white bg-gray-100" alt="" />
                <img src="https://i.pravatar.cc/100?img=47" className="h-8 w-8 rounded-full border-2 border-white bg-gray-100" alt="" />
                <img src="https://i.pravatar.cc/100?img=12" className="h-8 w-8 rounded-full border-2 border-white bg-gray-100" alt="" />
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50">
                <Plus className="h-5 w-5" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-orange-500" />
              </button>
              
              <button
                onClick={scrapeNow}
                disabled={starting}
                className={`flex items-center gap-2 h-10 rounded-xl px-5 text-sm font-semibold shadow-sm transition focus:ring-2 ${
                  starting
                    ? 'bg-orange-100 text-orange-600 cursor-wait focus:ring-orange-200'
                    : justStarted
                      ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-200'
                      : running
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-200'
                      : 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-200'
                }`}
                title={running ? 'Continuous crawler is running; click to restart it' : 'Start the continuous crawler'}
              >
                {starting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Starting…
                  </>
                ) : justStarted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Started
                  </>
                ) : running ? (
                  <>
                    <Activity className="w-4 h-4" /> Crawler live
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start crawler
                  </>
                )}
              </button>
            </div>
          </header>

          <section className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1400px] p-6 lg:p-8">
              <Outlet />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ pathname, onSignOut }) {
  return (
    <>
      <div className="flex shrink-0 items-center gap-3 px-6 pb-6">
        <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-black text-white shadow-md">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 8-8 8-8-8 8-8Z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold leading-tight tracking-tight text-gray-900">dam.kemon</div>
          <div className="text-[11px] font-medium text-gray-400">Free Plan</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 no-scrollbar space-y-6">
        {navigation.map((group) => (
          <div key={group.label}>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`group relative flex h-10 items-center justify-between gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors ${
                      active
                        ? 'bg-orange-50/50 text-orange-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {active && <span className="absolute -left-4 h-6 w-[4px] rounded-r-full bg-orange-500" />}
                    <div className="flex items-center gap-3">
                      <Icon className={`h-[18px] w-[18px] ${active ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      {item.label}
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 px-4 pt-6">
        <div className="space-y-1 mb-4">
          {bottomNavigation.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`group flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors ${
                  active ? 'text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="https://i.pravatar.cc/100?img=5" alt="Avatar" className="h-9 w-9 shrink-0 rounded-full bg-gray-100 object-cover" />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-gray-900">Saif Mahmud</div>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-400 transition hover:bg-orange-50 hover:text-orange-500"
            title="Sign out"
          >
            <LogOut className="h-[18px] w-[18px] ml-0.5" />
          </button>
        </div>
      </div>
    </>
  );
}
