import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { trackPageView } from './api/analytics';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import AssistantWidget from './components/AssistantWidget';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './auth/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import { SHOW_SAATHI, SHOW_PUBLIC_DASHBOARD, SHOW_ASSISTANT } from './config/features';

// Eager: the landing page + search are the hot path.
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';

// Lazy-load everything else so the initial bundle stays slim.
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Browse = lazy(() => import('./pages/Browse'));
const Drops = lazy(() => import('./pages/Drops'));
const Compare = lazy(() => import('./pages/Compare'));
const Trending = lazy(() => import('./pages/Trending'));
const Sellers = lazy(() => import('./pages/Sellers'));
const Guides = lazy(() => import('./pages/Guides'));
const GuideDetail = lazy(() => import('./pages/GuideDetail'));
// Gated by feature flags so the bundler drops these chunks entirely when the
// feature is hidden — the page code never ships, not just unlinked.
const Dashboard = SHOW_PUBLIC_DASHBOARD ? lazy(() => import('./pages/Dashboard')) : null;
const SubmitShop = lazy(() => import('./pages/SubmitShop'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Account = lazy(() => import('./pages/Account'));
const FcommerceSignup = SHOW_SAATHI ? lazy(() => import('./pages/FcommerceSignup')) : null;
const Saathi = SHOW_SAATHI ? lazy(() => import('./pages/Saathi')) : null;
const SaathiSignup = SHOW_SAATHI ? lazy(() => import('./pages/SaathiSignup')) : null;
const SaathiDashboard = SHOW_SAATHI ? lazy(() => import('./pages/SaathiDashboard')) : null;
const SaathiProfile = SHOW_SAATHI ? lazy(() => import('./pages/SaathiProfile')) : null;
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminIndexer = lazy(() => import('./pages/admin/AdminIndexer'));
const AdminCrawler = lazy(() => import('./pages/admin/AdminCrawler'));
const AdminShops = lazy(() => import('./pages/admin/AdminShops'));
const AdminPendingShops = lazy(() => import('./pages/admin/AdminPendingShops'));
const AdminOffers = lazy(() => import('./pages/admin/AdminOffers'));
const AdminAuditLog = lazy(() => import('./pages/admin/AdminAuditLog'));
const AdminStats = lazy(() => import('./pages/admin/AdminStats'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminCatalog = lazy(() => import('./pages/admin/AdminCatalog'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSearchLog = lazy(() => import('./pages/admin/AdminSearchLog'));
const AdminCache = lazy(() => import('./pages/admin/AdminCache'));
const AdminJobs = lazy(() => import('./pages/admin/AdminJobs'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminFeedback = lazy(() => import('./pages/admin/AdminFeedback'));

function PageFallback() {
  return (
    <div className="container-tight py-16">
      <LoadingSpinner text="Loading…" />
    </div>
  );
}

// Fires a page-view beacon on every SPA route change so the backend records the
// full navigation journey, not just API calls. Renders nothing.
function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);
  return null;
}

function RouteRobots() {
  const { pathname } = useLocation();
  const privateRoute = pathname.startsWith('/admin')
    || pathname.startsWith('/account')
    || ['/sign-in', '/sign-up', '/verify-email', '/forgot-password', '/reset-password']
      .some((path) => pathname.startsWith(path));
  const utilityRoute = ['/search', '/compare', '/submit-shop', '/sellers']
    .some((path) => pathname.startsWith(path));
  const fixedCanonical = new Set(['/drops', '/trending']).has(pathname)
    ? `https://damkemon.com${pathname}`
    : null;
  return (
    <Helmet>
      <meta
        name="robots"
        content={privateRoute ? 'noindex, nofollow' : utilityRoute ? 'noindex, follow' : 'index, follow'}
      />
      {fixedCanonical && <link rel="canonical" href={fixedCanonical} />}
    </Helmet>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageTracker />
      <RouteRobots />
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-cream">
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/category/:category" element={<Browse />} />
                <Route path="/drops" element={<Drops />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/sellers" element={<Sellers />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/guides/buying-from-unknown-seller-use-protect" element={<Navigate to="/guides/buying-from-unknown-seller-check-risk" replace />} />
                <Route path="/guides/:slug" element={<GuideDetail />} />
                <Route path="/submit-shop" element={<SubmitShop />} />
                {SHOW_SAATHI && (
                  <>
                    <Route path="/fcommerce/signup" element={<FcommerceSignup />} />
                    <Route path="/saathi" element={<Saathi />} />
                    <Route path="/saathi/signup" element={<SaathiSignup />} />
                    <Route path="/saathi/dashboard" element={<SaathiDashboard />} />
                    <Route path="/p/:slug" element={<SaathiProfile />} />
                  </>
                )}
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/account" element={<Account />} />
                {SHOW_PUBLIC_DASHBOARD && <Route path="/dashboard" element={<Dashboard />} />}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminIndexer />} />
                  <Route path="indexer" element={<AdminIndexer />} />
                  <Route path="crawler" element={<AdminCrawler />} />
                  <Route path="shops" element={<AdminShops />} />
                  <Route path="pending-shops" element={<AdminPendingShops />} />
                  <Route path="offers" element={<AdminOffers />} />
                  <Route path="catalog" element={<AdminCatalog />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="users/:id" element={<AdminUsers />} />
                  <Route path="search-log" element={<AdminSearchLog />} />
                  <Route path="traffic" element={<AdminAnalytics />} />
                  <Route path="stats" element={<AdminStats />} />
                  <Route path="cache" element={<AdminCache />} />
                  <Route path="jobs" element={<AdminJobs />} />
                  <Route path="audit" element={<AdminAuditLog />} />
                  <Route path="newsletter" element={<AdminNewsletter />} />
                  <Route path="feedback" element={<AdminFeedback />} />
                </Route>
                {/* Hidden/unknown paths (incl. gated Saathi & dashboard) → home. */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <BottomNav />
          {SHOW_ASSISTANT && <AssistantWidget />}
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
