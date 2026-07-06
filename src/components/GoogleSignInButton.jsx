import { useEffect, useRef, useState } from 'react';
import { googleLogin } from '../api/auth';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Official Google Identity Services button. Renders nothing when no client id
 * is configured (VITE_GOOGLE_CLIENT_ID), so shipping unconfigured is safe.
 * On success the parent receives {token, user} from our backend — the Google
 * credential never leaves this component except to /api/auth/google.
 */
export default function GoogleSignInButton({ onSuccess, onError }) {
  const slotRef = useRef(null);
  const handlersRef = useRef({ onSuccess, onError });
  handlersRef.current = { onSuccess, onError };
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || !slotRef.current) return;
    let cancelled = false;

    const init = () => {
      if (cancelled || !window.google?.accounts?.id || !slotRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
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
        theme: 'outline', size: 'large', shape: 'pill',
        text: 'continue_with', width: 300,
      });
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
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
    }
    return () => { cancelled = true; };
  }, []);

  if (!CLIENT_ID || failed) return null;

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
