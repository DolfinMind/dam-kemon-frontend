import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { googleLogin, getAuthConfig } from '../api/auth';
import { useAuth } from '../auth/AuthContext';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Google One Tap for anonymous visitors — the floating prompt, once per
 * session, everywhere except the auth pages (GoogleSignInButton owns the GSI
 * callback there). Client id comes from the backend at runtime, same as the
 * button, so shipping unconfigured is safe. Renders nothing.
 */
export default function GoogleOneTap() {
  const { user, ready, signIn } = useAuth();
  const { pathname } = useLocation();
  const onAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  // If the visitor signs in some other way while the prompt floats, close it.
  useEffect(() => {
    if (user) window.google?.accounts?.id?.cancel?.();
  }, [user]);

  useEffect(() => {
    if (!ready || user || onAuthPage) return;
    if (sessionStorage.getItem('dk_onetap')) return;
    let cancelled = false;

    const init = (clientId) => {
      if (cancelled || !window.google?.accounts?.id) return;
      sessionStorage.setItem('dk_onetap', '1');
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            const r = await googleLogin(resp.credential);
            signIn(r.data.token, r.data.user);
          } catch { /* prompt just closes; the sign-in page still works */ }
        },
      });
      window.google.accounts.id.prompt();
    };

    getAuthConfig().then((r) => {
      const clientId = r.data?.googleClientId;
      if (!clientId || cancelled) return;
      if (window.google?.accounts?.id) { init(clientId); return; }
      let script = document.querySelector(`script[src="${GSI_SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = GSI_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', () => init(clientId));
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [ready, user, onAuthPage, signIn]);

  return null;
}
