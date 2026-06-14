import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Graceful "the service is catching up" state.
 *
 * Shown whenever a core API call can't be reached (timeout / network / 5xx).
 * This deliberately replaces the old developer-facing error copy that named
 * internal infrastructure and must never reach a real user. Nothing here
 * mentions servers, ports, or stack names.
 *
 * When `onRetry` is provided the component also retries on its own on a gentle
 * cadence (bounded), so a brief hiccup self-heals without the user lifting a
 * finger. As soon as the data loads, the parent stops rendering this and the
 * page appears — the user often never even notices.
 */
export default function ServiceUnavailable({
  onRetry,
  retrying = false,
  title = 'Just a moment',
  message = "We’re refreshing the latest prices from shops across Bangladesh. This usually clears within a few seconds.",
  compact = false,
  children,
}) {
  const AUTO_RETRY_SECONDS = 10;
  const MAX_AUTO_RETRIES = 5;
  const attempts = useRef(0);
  const [countdown, setCountdown] = useState(onRetry ? AUTO_RETRY_SECONDS : null);

  // Self-healing auto-retry: tick down once a second, fire onRetry at zero,
  // and give up quietly after a handful of attempts so we never hammer a
  // truly-down service. Paused while a retry is already in flight.
  useEffect(() => {
    if (!onRetry || retrying || attempts.current >= MAX_AUTO_RETRIES) return undefined;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) {
          attempts.current += 1;
          onRetry();
          return attempts.current >= MAX_AUTO_RETRIES ? null : AUTO_RETRY_SECONDS;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onRetry, retrying]);

  const manualRetry = () => {
    attempts.current = 0;
    setCountdown(AUTO_RETRY_SECONDS);
    onRetry?.();
  };

  return (
    <div className={`card-soft text-center mx-auto max-w-lg ${compact ? 'p-6 sm:p-8' : 'p-8 sm:p-12'}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-cream-soft mb-4">
        <RefreshCw className={`w-7 h-7 text-ink/70 ${retrying ? 'animate-spin' : ''}`} />
      </div>

      <div className="inline-flex items-center gap-1.5 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-green font-bold">
          Reconnecting
        </span>
      </div>

      <h2 className="font-serif text-xl sm:text-2xl font-bold italic text-ink mb-2">{title}</h2>
      <p className="text-gray text-sm max-w-md mx-auto mb-5">{message}</p>

      {onRetry && (
        <>
          <button
            onClick={manualRetry}
            disabled={retrying}
            className="btn-ghost inline-flex disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying…' : 'Retry now'}
          </button>
          {!retrying && countdown !== null && (
            <p className="text-[11px] text-ink/40 mt-3">Retrying automatically…</p>
          )}
        </>
      )}

      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
