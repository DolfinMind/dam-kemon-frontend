const BASE = 'https://damkemon.com';

/** Return a canonical internal path, or null for an external/ambiguous target. */
export function safeNextPath(raw) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || /\\|%5c/i.test(raw)) return null;
  try {
    const url = new URL(raw, BASE);
    if (url.origin !== BASE) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
