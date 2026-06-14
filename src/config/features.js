/**
 * Public-surface feature flags.
 *
 * Flip a value to `true` to re-expose that area everywhere at once — the
 * router (App.jsx) and every nav/link entry point (Navbar, Footer, BottomNav,
 * Home, Sellers) read from here. Hidden routes render a redirect to home and
 * their page chunk is never fetched, so the feature is gone from the public
 * site and from normal network traffic — not just unlinked.
 */

// Damkemon Saathi — the F-commerce seller toolkit: landing (/saathi), signup,
// seller dashboard, public storefronts (/p/:slug) and F-commerce onboarding
// (/fcommerce/signup). Hidden from the public site for now.
export const SHOW_SAATHI = false;

// The public live stats page at /dashboard. Hidden from the public site for now.
export const SHOW_PUBLIC_DASHBOARD = false;
