import { useEffect, useState } from 'react';
import NewsletterModal from './NewsletterModal';
import { useAuth } from '../auth/AuthContext';

export default function ExitIntentModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    // Only show if not logged in, max once per session, never for subscribers,
    // and snoozed 14 days after a dismissal.
    if (user) return;
    try {
      if (sessionStorage.getItem('dk_exit_shown')) return;
      if (localStorage.getItem('dk_nl')) return;
      if (Date.now() - Number(localStorage.getItem('dk_nl_x') || 0) < 14 * 24 * 3600 * 1000) return;
    } catch { /* ignore */ }

    // ponytail: exit-intent mouse tracking nagged on every tab switch — a plain
    // 10s dwell timer is the whole feature now.
    const t = setTimeout(() => {
      setOpen(true);
      try { sessionStorage.setItem('dk_exit_shown', '1'); } catch { /* ignore */ }
    }, 10000);
    return () => clearTimeout(t);
  }, [user]);

  if (!open) return null;

  return (
    <NewsletterModal open={open} onClose={() => setOpen(false)} />
  );
}
