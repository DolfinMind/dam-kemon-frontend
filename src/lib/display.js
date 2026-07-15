// Display-layer honesty guards, shared by Home, search cards and detail page.

// Strip scraped SEO cruft ("… price in Bangladesh 2025", "Buy … at Shop BD")
// from product titles. ponytail: two observed patterns only — extend as new
// cruft shows up in the catalog, don't try to solve titles in general.
export const cleanName = (n = '') => {
  let s = n.replace(/\s*[-–—|,:(]*\s*(best\s+|latest\s+)?price\s+in\s+(bangladesh|bd)\b[^)]*\)?\s*$/i, '');
  if (/^buy\s+/i.test(s)) s = s.replace(/^buy\s+/i, '').replace(/\s+at\s+[\w .&'’-]{2,30}$/i, '');
  return s.replace(/\s{2,}/g, ' ').trim() || n;
};

// "3h ago" / "2 days ago" from an ISO timestamp; null when unparseable.
export const relTime = (iso) => {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const h = Math.max(0, Math.round((Date.now() - t) / 3600000));
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
};

// Cross-seller savings % — 0 when the spread is implausible for one product.
// ponytail: >60% same-product spread is a bad match, not a deal; tune if real sales exceed it.
export const saneSavePct = (lo, hi) => {
  if (lo == null || hi == null || hi <= lo) return 0;
  const pct = Math.round(((hi - lo) / hi) * 100);
  return pct > 60 ? 0 : pct;
};

// BDT has no everyday fractional unit. Scraper averages occasionally arrive as
// decimals; round at the display boundary without mutating comparison data.
export const formatBdt = (value, fallback = 'N/A') => {
  const n = Number(value);
  return Number.isFinite(n) ? `৳${Math.round(n).toLocaleString('en-IN')}` : fallback;
};
