import axios from 'axios';
import { getAnonId } from './analytics';
import { API_BASE } from './config';

// Where every request goes. Cloaked/same-origin config lives in ./config.
const baseURL = API_BASE;

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const id = getAnonId();
  if (id) config.headers['X-Anon-Id'] = id;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status !== 429) {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export const searchProducts = (query, page = 0, size = 20) =>
  api.get('/search', { params: { q: query, page, size } });

/** Autocomplete dropdown — returns up to N matching products by prefix. */
export const suggestProducts = (prefix, limit = 8) =>
  api.get('/search/suggest', { params: { q: prefix, limit } });

export const getProduct = (id) =>
  api.get(`/products/${id}`);

export const getProductHistory = (id) =>
  api.get(`/products/${id}/history`);

export const getSites = () =>
  api.get('/sites');

export const getDashboardStats = () =>
  api.get('/dashboard/stats');

export const triggerScrape = (query, sites) =>
  api.post('/scrape', { query, sites });

export const getAllProducts = (page = 0, size = 20, category) =>
  api.get('/products', { params: { page, size, ...(category ? { category } : {}) } });

/** Distinct catalog categories — powers the Browse filter chips. */
export const getCategories = () => api.get('/products/categories');

export const compareProducts = (ids) =>
  api.get('/compare', { params: { ids: Array.isArray(ids) ? ids.join(',') : ids } });

export const getSellers = (params = {}) =>
  api.get('/sellers', { params });

/**
 * Public directory of indexed shops (active shops + catalog size). Powers the
 * shop-vs-shop comparison picker. Trust/delivery signals for selected shops
 * come from getShopTrust().
 */
export const getShops = () => api.get('/shops');

export const getSeller = (id) =>
  api.get(`/sellers/${id}`);

/** Public-facing live counters: active users, trending searches, hot drops. */
export const getLiveStats = () => api.get('/stats/live');
export const getTrendingSearches = (limit = 10) =>
  api.get('/stats/trending', { params: { limit } });
export const getHotDrops = (limit = 12) =>
  api.get('/stats/hot-drops', { params: { limit } });
export const getWorldCup = (limit = 12) =>
  api.get('/stats/world-cup', { params: { limit } });

/** Public shop submission. */
export const submitShop = (payload) => api.post('/shops/submit', payload);

// ─── Trust & delivery decision layer ───
/**
 * Batch-fetch the trust/delivery/genuineness profile for a set of shop
 * slugs (the siteSlug on each SitePrice). Returns a slug→profile map.
 */
export const getShopTrust = (slugs) =>
  api.get('/trust/shops', { params: { slugs: Array.isArray(slugs) ? slugs.join(',') : slugs } });

/**
 * Per-seller reputation for marketplace sub-sellers (e.g. Daraz storefronts),
 * keyed by sellerId. Returns a sellerId→profile map; unknown ids are omitted.
 */
export const getSellerTrust = (ids) =>
  api.get('/trust/sellers', { params: { ids: Array.isArray(ids) ? ids.join(',') : ids } });

/** Community + scraped reviews for a product, newest first. */
export const getProductReviews = (idOrSlug) =>
  api.get(`/products/${idOrSlug}/reviews`);

/**
 * Submit a community review. Anonymous — the X-Anon-Id header (added by the
 * request interceptor) is the identity, one review per product. Payload:
 * { rating, title, content, reviewerName, shopSlug, siteName,
 *   deliveryDaysReported, wouldRecommend, trustVote }.
 */
export const postProductReview = (idOrSlug, payload) =>
  api.post(`/products/${idOrSlug}/reviews`, payload);

/** Lightweight delivery-time report (no full review). { shopSlug, days }. */
export const postDeliveryReport = (idOrSlug, payload) =>
  api.post(`/products/${idOrSlug}/delivery-report`, payload);

/** Upvote a review as helpful. */
export const markReviewHelpful = (id) => api.post(`/reviews/${id}/helpful`);

/** "দরদাম" shopping assistant — { reply, products[], trust{}, suggestions[] }. */
export const assistantChat = (message) => api.post('/assistant/chat', { message });

// ─── Damkemon Protect (buyer protection) ───
/** Scam-risk verdict for a purchase. { sellerName?, shopSlug?, productId?, amount?, paymentMethod }. */
export const protectAssess = (payload) => api.post('/protect/assess', payload);
/** Open a protected order; returns { order, risk } with a protection code. */
export const protectCreateOrder = (payload) => api.post('/protect/orders', payload);
export const protectGetOrder = (code) => api.get(`/protect/orders/${encodeURIComponent(code)}`);
export const protectConfirmOrder = (code) => api.post(`/protect/orders/${encodeURIComponent(code)}/confirm`);
export const protectDisputeOrder = (code, reason) =>
  api.post(`/protect/orders/${encodeURIComponent(code)}/dispute`, { reason });

/** Hydrate a list of product ids — used by the recently-viewed rail. */
export const getProductsByIds = (ids) =>
  api.get('/products/by-ids', { params: { ids: Array.isArray(ids) ? ids.join(',') : ids } });

/** Daily-bucketed price history series for the price-history chart. */
export const getDailyPriceHistory = (id, days = 30) =>
  api.get(`/products/${id}/history/daily`, { params: { days } });

// ─── Account: per-user search history ───
export const accountSearchHistory = () => api.get('/account/search-history');

/**
 * Tracked outbound URL for "Visit shop" buttons. The backend records the
 * click + appends affiliate parameters before 302-ing to the shop. Pass
 * the search query when known so attribution analytics know what led to
 * the click.
 */
export const affiliateUrl = (productId, siteSlug, fromQuery, offerUrl) => {
  if (!productId) return '#';
  const base = `${baseURL}/r/${encodeURIComponent(productId)}`;
  const params = new URLSearchParams();
  if (siteSlug) params.set('site', siteSlug);
  // Specific offer URL — disambiguates between multiple sellers of the same
  // product within one marketplace (e.g. two Daraz storefronts).
  if (offerUrl) params.set('u', offerUrl);
  if (fromQuery) params.set('q', fromQuery);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
};

// ─── Engagement: Newsletter & Feedback ───
export const subscribeNewsletter = (email) => api.post('/newsletter', { email });
export const submitFeedback = (data) => api.post('/feedback', data);

export default api;
