// Admin / operator-only API surface.
//
// Deliberately split out of api.js: api.js is in the eager main bundle (the
// landing page imports search from it), so anything defined there ships to every
// visitor and self-documents the backend. These operational endpoints
// (reindex, catalog edit, cache flush, job triggers, search logs…) are only ever
// called from the lazy-loaded /admin pages, so keeping them here means they land
// only in the admin chunk — out of the public bundle a casual visitor downloads.
//
// They are gated server-side regardless (admin JWT or X-Admin-Key); this is just
// not advertising them to everyone.
import api from './api';

// ─── Indexer ───
export const triggerReindex = () => api.post('/admin/index/run');
export const indexStatus = () => api.get('/admin/index/status');
export const retryFailedShops = () => api.post('/admin/index/retry');
export const getIndexerHistory = (limit = 30) =>
  api.get('/admin/index/history', { params: { limit } });
export const reindexShop = (slug) => api.post(`/admin/index/shop/${encodeURIComponent(slug)}`);

// ─── Shops ───
export const listShops = (params = {}) => api.get('/admin/shops', { params });
export const setShopStatus = (slug, status) =>
  api.post(`/admin/shops/${encodeURIComponent(slug)}/status`, { status });
export const editShop = (slug, patch) =>
  api.patch(`/admin/shops/${encodeURIComponent(slug)}`, patch);
export const bulkSetShopStatus = (slugs, status) =>
  api.post('/admin/shops/bulk-status', { slugs, status });

// ─── Pending shops ───
export const listPendingShops = () => api.get('/admin/pending-shops');
export const approvePendingShop = (id) => api.post(`/admin/pending-shops/${id}/approve`);
export const rejectPendingShop = (id, note) => api.post(`/admin/pending-shops/${id}/reject`, { note });

// ─── Merchant feed sync (pull a shop's published catalog) ───
export const syncShopFeed = (slug) => api.post(`/admin/feeds/sync/${encodeURIComponent(slug)}`);

// ─── Diagnostics: collection counts + force reseed ───
export const diagCollections = () => api.get('/admin/diag/collections');
export const reseedDirectories = () => api.post('/admin/diag/reseed');

// ─── Community offers (moderation) ───
export const listOffers = () => api.get('/admin/offers');
export const approveOffer = (id) => api.post(`/admin/offers/${id}/approve`);
export const rejectOffer = (id, note) => api.post(`/admin/offers/${id}/reject`, { note });

// ─── Catalog ───
export const adminListCatalog = (params = {}) =>
  api.get('/admin/catalog', { params });
export const adminCreateProduct = (body) =>
  api.post('/admin/catalog', body);
export const adminSellerDepth = () => api.get('/admin/catalog/seller-depth');
export const adminEditProduct = (id, patch) =>
  api.patch(`/admin/catalog/${id}`, patch);
export const adminDeleteProduct = (id) =>
  api.delete(`/admin/catalog/${id}`);
export const adminMergeProducts = (toId, fromId) =>
  api.post(`/admin/catalog/${toId}/merge`, { from: fromId });

// ─── Reviews moderation ───
export const adminFlaggedReviews = () => api.get('/admin/reviews/flagged');
export const adminSetReviewStatus = (id, status) =>
  api.post(`/admin/reviews/${id}/status`, { status });

// ─── Users, activity & signup conversion ───
export const adminUsers = (params = {}) => api.get('/admin/users', { params });
export const adminUser = (id) => api.get(`/admin/users/${encodeURIComponent(id)}`);
export const adminUserConversion = (days = 30) =>
  api.get('/admin/users/conversion', { params: { days } });

// ─── Cache ───
export const listCaches = () => api.get('/admin/cache');
export const flushCache = (name) => api.post(`/admin/cache/${name}/flush`);
export const flushAllCaches = () => api.post('/admin/cache/flush-all');

// ─── Jobs ───
export const listJobs = () => api.get('/admin/jobs');
export const runJob = (id) => api.post(`/admin/jobs/${id}/run`);
export const jobRuns = (id) => api.get(`/admin/jobs/${id}/runs`);

// ─── Remote Python crawler ───
export const crawlerStatus = () => api.get('/admin/crawler/status');
export const crawlerLogs = (lines = 300) =>
  api.get('/admin/crawler/logs', { params: { lines } });
export const crawlerAction = (action) =>
  api.post(`/admin/crawler/actions/${encodeURIComponent(action)}`);

// ─── Search log + latency ───
export const recentSearches = (limit = 200) =>
  api.get('/admin/stats/recent-searches', { params: { limit } });
export const searchLatency = () => api.get('/admin/stats/latency');
export const recentSuggestClicks = (limit = 100) =>
  api.get('/admin/stats/suggest-clicks', { params: { limit } });

// ─── Traffic analytics (full-funnel logging) ───
export const analyticsOverview = () => api.get('/admin/analytics/overview');
export const analyticsTopSearches = (days = 7, limit = 25) =>
  api.get('/admin/analytics/top-searches', { params: { days, limit } });
export const analyticsHourly = (days = 7) =>
  api.get('/admin/analytics/hourly', { params: { days } });
export const analyticsDailyUsers = (days = 14) =>
  api.get('/admin/analytics/daily-users', { params: { days } });
export const analyticsCatalogGrowth = (days = 14) =>
  api.get('/admin/analytics/catalog-growth', { params: { days } });
export const analyticsTopIps = (days = 7, limit = 25) =>
  api.get('/admin/analytics/top-ips', { params: { days, limit } });
export const analyticsTopPaths = (days = 7, limit = 25) =>
  api.get('/admin/analytics/top-paths', { params: { days, limit } });
export const analyticsRequests = (limit = 100) =>
  api.get('/admin/analytics/requests', { params: { limit } });
export const analyticsDevices = (days = 7) =>
  api.get('/admin/analytics/devices', { params: { days } });
export const analyticsReferrers = (days = 7, limit = 15) =>
  api.get('/admin/analytics/referrers', { params: { days, limit } });

// ─── Outbound-click intelligence (which shop wins which category, etc.) ───
export const analyticsFunnel = (days = 7) =>
  api.get('/admin/analytics/funnel', { params: { days } });
export const analyticsShopClicksByCategory = (days = 7, categories = 12, shops = 5) =>
  api.get('/admin/analytics/shop-clicks-by-category', { params: { days, categories, shops } });
export const analyticsTopShops = (days = 7, limit = 25) =>
  api.get('/admin/analytics/top-shops', { params: { days, limit } });
export const analyticsTopProducts = (days = 7, limit = 25) =>
  api.get('/admin/analytics/top-products', { params: { days, limit } });
export const analyticsTopConvertingSearches = (days = 7, limit = 25) =>
  api.get('/admin/analytics/top-converting-searches', { params: { days, limit } });

// ─── Search result intelligence ───
export const analyticsResultShops = (days = 7, limit = 15) =>
  api.get('/admin/analytics/result-shops', { params: { days, limit } });
export const analyticsZeroResultSearches = (days = 7, limit = 25) =>
  api.get('/admin/analytics/zero-result-searches', { params: { days, limit } });
export const analyticsShopPriceWins = (limit = 15) =>
  api.get('/admin/analytics/shop-price-wins', { params: { limit } });

// ─── Newsletter & Feedback ───
export const newsletterAnalytics = () => api.get('/admin/newsletter/analytics');
export const listSubscribers = (page = 0, size = 50) =>
  api.get('/admin/newsletter/subscribers', { params: { page, size } });
export const triggerNewsletter = () => api.post('/admin/newsletter/send');

export const getFeedback = () => api.get('/admin/feedback');
