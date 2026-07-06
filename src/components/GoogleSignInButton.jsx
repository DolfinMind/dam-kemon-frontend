import { useEffect, useRef, useState } from 'react';
import { googleLogin, getAuthConfig } from '../api/auth';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Official Google Identity Services button. The client id comes from the
 * backend at runtime (GET /api/auth/config) — the backend GOOGLE_CLIENT_ID
 * env is the single source of truth, so there's no build-time var and no CI
 * variable. Renders nothing until a non-empty client id arrives, so shipping
 * unconfigured is safe. On success the parent receives {token, user}; the
 * Google credential never leaves this component except to /api/auth/google.
 */
export default function GoogleSignInButton({ onSuccess, onError }) {
  const slotRef = useRef(null);
  const handlersRef = useRef({ onSuccess, onError });
  handlersRef.current = { onSuccess, onError };
  const [clientId, setClientId] = useState(null);
  const [failed, setFailed] = useState(false);

  // 1. Pull the client id from the backend once.
  useEffect(() => {
    let alive = true;
    getAuthConfig()
      .then((r) => { if (alive) setClientId(r.data?.googleClientId || null); })
      .catch(() => { /* button just stays hidden */ });
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
      window.google.accounts.id.renderButton(slotRef.current, {
        theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: 300,
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
  }, [clientId]);

  if (!clientId || failed) return null;

  return (
    <div>
      <div className="flex items-center gap-3 my-4">
        <span className="flex-1 h-px bg-line" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-gray">or</span>
        <span className="flex-1 h-px bg-line" />
      </div>
      <div ref={slotRef} className="flex justify-center min-h-[44px]" />
    </div>
  );
}
