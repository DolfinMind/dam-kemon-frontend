import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router v6 keeps the browser's scroll position across navigations, so
// opening a product from a scrolled-down search page would land you mid-page
// (looked like the page "started at the bottom"). Reset to the top whenever the
// path changes — but leave in-page hash links (#section) alone.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
