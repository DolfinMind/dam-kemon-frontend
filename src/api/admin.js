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
export const listShops = () => api.get('/admin/shops');
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

// ─── Catalog ───
export const adminListCatalog = (params = {}) =>
  api.get('/admin/catalog', { params });
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

// ─── Cache ───
export const listCaches = () => api.get('/admin/cache');
export const flushCache = (name) => api.post(`/admin/cache/${name}/flush`);
export const flushAllCaches = () => api.post('/admin/cache/flush-all');

// ─── Jobs ───
export const listJobs = () => api.get('/admin/jobs');
export const runJob = (id) => api.post(`/admin/jobs/${id}/run`);
export const jobRuns = (id) => api.get(`/admin/jobs/${id}/runs`);

// ─── Search log + latency ───
export const recentSearches = (limit = 200) =>
  api.get('/admin/stats/recent-searches', { params: { limit } });
export const searchLatency = () => api.get('/admin/stats/latency');
