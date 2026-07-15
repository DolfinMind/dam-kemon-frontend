// Authenticated-API client. Reads the JWT from localStorage and attaches
// it to every request as `Authorization: Bearer ...`. Falls back to the
// unauthenticated client (api.js) for public endpoints.

import api from './api';

const TOKEN_KEY = 'dk_auth_token';

export function getAuthToken() {
  try { return localStorage.getItem(TOKEN_KEY); }
  catch { return null; }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode — auth becomes session-only */
  }
}

// Stamp every outbound request with the bearer when present.
api.interceptors.request.use((config) => {
  const t = getAuthToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Only the authoritative session check may invalidate a token. A downstream
// admin dependency can also answer 401; treating every 401 as an expired
// Damkemon JWT signs the owner out of the entire panel.
api.interceptors.response.use(
  (r) => r,
  (e) => {
    const requestUrl = String(e.config?.url || '').split('?')[0];
    if (e.response?.status === 401 && requestUrl.endsWith('/auth/me') && getAuthToken()) {
      setAuthToken(null);
    }
    return Promise.reject(e);
  }
);

/** Sign-in for everyone: owners type a username, users their email. 30-day JWT. */
export const passwordLogin = (identifier, password) =>
  api.post('/auth/login', { username: identifier, password });

/** Regular-user registration. Returns {token, user} — signed in immediately. */
export const signup = ({ name, email, password, phone, newsletterOptIn }) =>
  api.post('/auth/signup', { name, email, password, phone, newsletterOptIn });

/** Google Identity Services: exchange the Google ID token for our JWT. */
export const googleLogin = (credential) =>
  api.post('/auth/google', { credential });

/** Public runtime client config (Google client id, …) — backend env is the
 *  single source of truth, so no build-time var is needed. */
export const getAuthConfig = () => api.get('/auth/config');

export const verifyEmail = (token) => api.post('/auth/verify', { token });
export const resendVerification = () => api.post('/auth/resend-verification');
export const forgotPassword = (email) => api.post('/auth/forgot', { email });
export const resetPassword = (token, password) =>
  api.post('/auth/reset', { token, password });

/** Partial profile update (phone, district, gender, birthYear, interests…). */
export const updateProfile = (patch) => api.patch('/auth/profile', patch);

export const getMe = () => api.get('/auth/me');

export const signOut = () => api.post('/auth/sign-out');

// Account endpoints
export const listSavedSearches = () => api.get('/account/saved-searches');
export const addSavedSearch = (query, notifyEmail) =>
  api.post('/account/saved-searches', { query, notifyEmail });
export const removeSavedSearch = (id) => api.delete(`/account/saved-searches/${id}`);

export const listWishlist = () => api.get('/account/wishlist');
export const addToWishlist = (productId) => api.post('/account/wishlist', { productId });
export const removeFromWishlist = (productId) => api.delete(`/account/wishlist/${productId}`);

/**
 * Patch the alert settings for a single watched product. Body may include
 * any of: targetPrice, alertOnDropPercent (0..1), notifyChannel, alertsEnabled.
 */
export const updateWishlistAlert = (productId, patch) =>
  api.patch(`/account/wishlist/${productId}`, patch);

/** In-app notification feed for the bell dropdown. */
export const listNotifications = (limit = 20) =>
  api.get('/account/notifications', { params: { limit } });

export const markNotificationsRead = () =>
  api.post('/account/notifications/read');

// ─── Saathi: FB-commerce seller toolkit ───
export const saathiSignup = (payload) => api.post('/saathi/signup', payload);
export const saathiMe = () => api.get('/saathi/me');
export const saathiUpdate = (patch) => api.patch('/saathi/me', patch);
export const saathiSubmitVerification = (payload) => api.post('/saathi/verify', payload);
export const saathiListProducts = () => api.get('/saathi/products');
export const saathiAttachProduct = (productId, listedPrice, note) =>
  api.post('/saathi/products', { productId, listedPrice, note });
export const saathiDetachProduct = (productId) =>
  api.delete(`/saathi/products/${encodeURIComponent(productId)}`);
export const saathiLiveAssist = (q) => api.get('/saathi/live-assist', { params: { q } });
export const saathiRecentQueries = (limit = 30) =>
  api.get('/saathi/queries', { params: { limit } });
export const saathiStats = () => api.get('/saathi/stats');
export const saathiPublicProfile = (slug) =>
  api.get(`/saathi/p/${encodeURIComponent(slug)}`);

// ─── Saathi: Messenger bot connection ───
export const saathiConnectMessenger = (pageId, pageAccessToken) =>
  api.post('/saathi/messenger/connect', { pageId, pageAccessToken });
export const saathiDisconnectMessenger = () =>
  api.post('/saathi/messenger/disconnect');
export const saathiTestBot = (q) =>
  api.get('/saathi/messenger/test', { params: { q } });
