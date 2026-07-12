import { useEffect, useRef, useState } from 'react';
import { googleLogin, getAuthConfig } from '../api/auth';
import { Sparkles } from 'lucide-react';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Official Google Identity Services button. The client id comes from the
 * backend at runtime (GET /api/auth/config) — the backend GOOGLE_CLIENT_ID
 * env is the single source of truth, so there's no build-time var and no CI
 * variable. Renders `fallback` (default nothing) until a non-empty client id
 * arrives, so shipping unconfigured is safe. On success the parent receives
 * {token, user}; the Google credential never leaves this component except to
 * /api/auth/google.
 *
 * `divider` places the "or" separator ('above' | 'below' | 'none') so the
 * button works both under an email form and as the lead action above one.
 * `gsi` overrides the rendered button options (size, text, width…) for
 * compact placements like the navbar.
 *
 * GSI has ONE global callback (last initialize wins across this button and
 * GoogleOneTap) — every mount must therefore keep onSuccess equivalent to
 * signIn(token, user); pages that need to redirect afterwards watch `user`
 * instead of relying on their own callback firing.
 */
export default function GoogleSignInButton({ onSuccess, onError, divider = 'above', gsi, fallback = null, featured = false }) {
  const slotRef = useRef(null);
  const handlersRef = useRef({ onSuccess, onError });
  handlersRef.current = { onSuccess, onError };
  const [clientId, setClientId] = useState(null);
  const [configReady, setConfigReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // 1. Pull the client id from the backend once.
  useEffect(() => {
    let alive = true;
    getAuthConfig()
      .then((r) => { if (alive) setClientId(r.data?.googleClientId || null); })
      .catch(() => { /* local preview handles unavailable config */ })
      .finally(() => { if (alive) setConfigReady(true); });
    return () => { alive = false; };
  }, []);

  // 2. Once we have a client id, load GSI and render the official button.
  useEffect(() => {
    if (!clientId || !slotRef.current) return;
    let cancelled = false;

    const init = () => {
      if (cancelled || !window.google?.accounts?.id || !slotRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            const r = await googleLogin(resp.credential);
            handlersRef.current.onSuccess?.(r.data);
          } catch (e) {
            handlersRef.current.onError?.(e.response?.data?.error || 'Google sign-in failed — try again.');
          }
        },
      });
      const available = Math.floor(slotRef.current.getBoundingClientRect().width || 300);
      window.google.accounts.id.renderButton(slotRef.current, {
        theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with',
        width: Math.min(featured ? 400 : 300, available), ...gsi,
      });
    };

    if (window.google?.accounts?.id) {
      init();
      return () => { cancelled = true; };
    }
    let script = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', init);
    script.addEventListener('error', () => setFailed(true));
    return () => { cancelled = true; script.removeEventListener('load', init); };
  }, [clientId, featured, gsi]);

  const sep = (
    <div className="flex items-center gap-3 my-4">
      <span className="flex-1 h-px bg-line" />
      <span className="text-[11px] font-mono uppercase tracking-wider text-gray">or use email</span>
      <span className="flex-1 h-px bg-line" />
    </div>
  );

  if ((!clientId || failed) && !featured) return fallback;

  const control = clientId && !failed ? (
    <div ref={slotRef} className={`flex w-full justify-center ${gsi?.size === 'medium' ? 'min-h-[32px]' : 'min-h-[44px]'}`} />
  ) : !configReady ? (
    <div className="h-11 w-full animate-pulse rounded-full bg-line" />
  ) : (
    <button type="button" disabled className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-line-strong bg-white text-sm font-semibold text-ink opacity-80">
      <GoogleMark /> Continue with Google
    </button>
  );

  return (
    <div>
      {divider === 'above' && sep}
      {featured ? (
        <div className="group relative rounded-[1.6rem] border border-acid/45 bg-gradient-to-br from-acid-soft via-white to-lime-soft p-3 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-acid shadow-[var(--shadow-soft)]">
            <Sparkles className="h-3 w-3" /> Recommended
          </div>
          <div className="rounded-[1.15rem] border border-white/80 bg-white/75 px-3 pb-3 pt-5 backdrop-blur-sm">
            <p className="mb-3 text-center text-[13px] font-semibold text-ink">The fastest way into Damkemon</p>
            {control}
            <p className="mt-2.5 text-center text-[11px] text-gray">One click · no password to remember</p>
            {!clientId && configReady && <p className="mt-1 text-center text-[9px] font-mono uppercase tracking-wider text-gray-soft">Local preview</p>}
          </div>
        </div>
      ) : control}
      {divider === 'below' && sep}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.28.32-1.86V7.52H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.48l3.34-2.62Z" />
      <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.94 5.52l3.34 2.62C7.19 7.77 9.4 6.01 12 6.01Z" />
    </svg>
  );
}
