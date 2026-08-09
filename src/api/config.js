// Single source of truth for where the API lives — imported by both the axios
// client (api.js) and the analytics beacon (analytics.js) so the path can be
// cloaked in exactly one place.
//
// Two independent knobs:
//   VITE_API_URL   — origin. Blank (recommended for prod) = SAME ORIGIN as the
//                    site, so calls show up in the network tab as first-party
//                    requests to your own domain instead of an obvious, separate
//                    "api.*" backend. Set only when the backend is truly on a
//                    different host.
//   VITE_API_BASE  — path prefix. Defaults to "/api". Set to an opaque value
//                    (e.g. "/_dk") and have your reverse proxy rewrite it back to
//                    the backend's /api, so the shipped bundle never advertises
//                    "/api/search", "/api/products", etc.
//
// The network tab can never be truly hidden — anything the browser fetches is
// visible to the user. This only makes the calls look first-party and stops the
// bundle from self-documenting the backend's route structure. Real protection is
// server-side (auth on /admin, rate limiting), which already exists.
const origin = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const basePath = import.meta.env.VITE_API_BASE || '/api';

export const API_BASE = `${origin}${basePath}`;
