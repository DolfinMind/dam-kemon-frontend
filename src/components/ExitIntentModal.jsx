import { useEffect, useState } from 'react';
import NewsletterInline from './NewsletterInline';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg transform scale-100 animate-in zoom-in-95 duration-300 shadow-2xl rounded-2xl">
        <NewsletterInline 
          title="Wait! Don't leave without our best deals" 
          dismissible={true}
          onDismiss={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
