import { useEffect, useState } from 'react';
import NewsletterModal from './NewsletterModal';
import { useAuth } from '../auth/AuthContext';

export default function ExitIntentModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    // Only show if not logged in and not already dismissed/subscribed
    if (user) return;
    try {
      if (sessionStorage.getItem('dk_exit_shown')) return;
      if (localStorage.getItem('dk_nl') || localStorage.getItem('dk_nl_x')) return;
    } catch { /* ignore */ }

    const onMouseLeave = (e) => {
      // Trigger if mouse goes off the top edge (likely going for address bar or tab close)
      if (e.clientY < 10) {
        setOpen(true);
        try { sessionStorage.setItem('dk_exit_shown', '1'); } catch { /* ignore */ }
      }
    };

    document.addEventListener('mouseleave', onMouseLeave);
    return () => document.removeEventListener('mouseleave', onMouseLeave);
  }, [user]);

  if (!open) return null;

  return (
    <NewsletterModal open={open} onClose={() => setOpen(false)} isExitIntent={true} />
  );
}
