import { useEffect, useState } from 'react';
import { Mail, Check, X } from 'lucide-react';
import { subscribeNewsletter, getHeadlineStats } from '../api/api';
import { trackClick } from '../api/analytics';

const SNOOZE_MS = 14 * 24 * 3600 * 1000; // dismissed → quiet for 14 days

function eligible() {
  try {
    if (localStorage.getItem('dk_nl')) return false; // already subscribed
    return Date.now() - Number(localStorage.getItem('dk_nl_x') || 0) > SNOOZE_MS;
  } catch { return true; }
}

/**
 * Compact one-row newsletter capture for value moments (product page, empty
 * search, /drops). Self-silencing: hides after subscribe forever and after
 * dismiss for 14 days, shared across all placements via localStorage.
 */
export default function NewsletterInline({ title = "Get Monday's biggest price drops in your inbox", dismissible = true, onDismiss }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [hidden, setHidden] = useState(() => !eligible());
  const [readers, setReaders] = useState(null);

  useEffect(() => {
    if (hidden) return;
    getHeadlineStats().then((r) => {
      const n = Number(r.data?.newsletterReaders);
      // ponytail: floor of 50 so an early list never reads as weak proof
      if (Number.isFinite(n) && n >= 50) setReaders(n);
    }).catch(() => {});
  }, [hidden]);

  if (hidden) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await subscribeNewsletter(email);
      try { localStorage.setItem('dk_nl', '1'); } catch { /* private mode */ }
      trackClick('newsletter-subscribe', 'inline-form');
      setStatus('done');
      if (onDismiss) setTimeout(onDismiss, 2000); // Close modal automatically after 2s on success
    } catch {
      setStatus('error');
    }
  };

  const dismiss = () => {
    try { localStorage.setItem('dk_nl_x', String(Date.now())); } catch { /* private mode */ }
    setHidden(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="relative bg-acid-soft border border-acid/25 rounded-2xl p-4 sm:p-5">
      {dismissible && status !== 'done' && (
        <button onClick={dismiss} aria-label="Dismiss" className="absolute top-3 right-3 text-ink/35 hover:text-ink transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
      {status === 'done' ? (
        <div className="flex items-center gap-2.5 text-acid-deep font-bold text-sm">
          <Check className="w-5 h-5 shrink-0" /> You're in — see you Monday morning.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0 sm:flex-1">
            <Mail className="w-5 h-5 text-acid-deep shrink-0" />
            <div className="min-w-0">
              <div className="font-sans font-bold text-ink text-sm leading-snug">{title}</div>
              <div className="text-[11px] text-ink/60 mt-0.5">
                Free, every Monday 9AM{readers ? ` · ${readers.toLocaleString('en-IN')} readers` : ''} · unsubscribe anytime
              </div>
            </div>
          </div>
          <form onSubmit={submit} className="flex gap-2 shrink-0 w-full sm:w-auto">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
              className="flex-1 sm:w-52 px-3.5 py-2.5 rounded-xl border border-line bg-white text-sm text-ink outline-none focus:ring-2 ring-acid/40 placeholder:text-gray"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-ink text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-acid hover:text-ink transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? '…' : 'Subscribe'}
            </button>
          </form>
        </div>
      )}
      {status === 'error' && (
        <p className="text-red text-xs font-medium mt-2">Something went wrong — try again.</p>
      )}
    </div>
  );
}
