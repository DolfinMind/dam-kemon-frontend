// Anonymous, no-PII telemetry. The anon id is a UUID minted once per
// browser and stored in localStorage. The server treats it as best-effort
// uniqueness, never identity.
//
// All event hits go via sendBeacon so they don't add latency to the user's
// navigation. We fall back to fetch(..., {keepalive: true}) when sendBeacon
// is unavailable (older browsers, locked-down environments).

import { API_BASE } from './config';

const ANON_KEY = 'dk_anon_id';

export function getAnonId() {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = (crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function fireBeacon(path, payload) {
  const url = `${API_BASE}${path}`;
  const body = JSON.stringify({ ...payload, anonId: getAnonId() });
  let token = null;
  try { token = localStorage.getItem('dk_auth_token'); } catch { /* anonymous */ }
  try {
    // sendBeacon cannot attach Authorization. Signed-in activity uses fetch so
    // JwtAuthFilter can link the event to the real user; guests keep the cheap beacon.
    if (!token && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    /* fall through to fetch */
  }
  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      keepalive: true,
      mode: 'cors',
    }).catch(() => {});
  } catch {
    /* swallow — analytics must never break the UI */
  }
}

export const trackView = (productId) => {
  if (!productId) return;
  fireBeacon('/events/view', { productId });
};

export const trackClick = (productId, sellerSlug) => {
  if (!productId && !sellerSlug) return;
  fireBeacon('/events/click', { productId, sellerSlug });
};

// Autosuggest pick: the user typed `query` and clicked suggestion `name`.
// Powers the admin search log's "searched X, chose Y" view.
export const trackSuggestClick = (query, productId, productName) => {
  if (!productId && !productName) return;
  fireBeacon('/events/suggest-click', { query, productId, productName });
};

// A single-page-app route change. Fired on every navigation so the backend sees
// the full page-by-page journey, not just API calls. The referrer is the
// browser's document.referrer (external entry) — internal hops are reconstructed
// server-side from the sequence of page views per anon id.
export const trackPageView = (path) => {
  metaPixelPageView();
  let p = path;
  try {
    if (!p) p = `${location.pathname}${location.search}`;
  } catch {
    /* no window */
  }
  if (!p) return;
  let referer = null;
  try { referer = document.referrer || null; } catch { /* ignore */ }
  fireBeacon('/events/pageview', { path: p, referer });
};

// Meta Pixel for ad retargeting. Inert until VITE_META_PIXEL_ID is set at
// build time; bootstraps fbq on the first page view, then logs one PageView
// per SPA navigation. ponytail: PageView only — add ViewContent/Lead events
// when ad campaigns need conversion optimization.
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

function metaPixelPageView() {
  if (!PIXEL_ID) return;
  try {
    if (!window.fbq) {
      const n = (window.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(s);
      window.fbq('init', PIXEL_ID);
    }
    window.fbq('track', 'PageView');
  } catch {
    /* analytics must never break the UI */
  }
}
