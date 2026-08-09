import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

/** Landing page for the emailed verification link: /verify?token=… */
export default function VerifyEmail() {
  const [search] = useSearchParams();
  const { refresh } = useAuth();
  const [state, setState] = useState('working'); // working | ok | failed
  const [message, setMessage] = useState(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;   // StrictMode double-mount: the token is one-shot
    firedRef.current = true;
    const token = search.get('token');
    if (!token) { setState('failed'); setMessage('This link is missing its token.'); return; }
    verifyEmail(token)
      .then(() => { setState('ok'); refresh(); })
      .catch((e) => {
        setState('failed');
        setMessage(e.response?.data?.error || 'Could not verify this link.');
      });
  }, [search, refresh]);

  return (
    <div className="container-tight py-16 sm:py-24 max-w-md text-center">
      {state === 'working' && <p className="text-gray">Verifying your email…</p>}
      {state === 'ok' && (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-acid/40 mb-5">
            <CheckCircle2 className="w-8 h-8 text-ink" />
          </div>
          <h1 className="font-serif text-3xl font-semibold mb-2">Email verified</h1>
          <p className="text-gray text-[15px] mb-6">Price-drop alerts are now active for everything on your wishlist.</p>
          <Link to="/account" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-ink text-cream font-semibold text-sm hover:bg-red transition-colors">
            Go to my account
          </Link>
        </>
      )}
      {state === 'failed' && (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red/10 mb-5">
            <AlertTriangle className="w-8 h-8 text-red" />
          </div>
          <h1 className="font-serif text-3xl font-semibold mb-2">Link expired</h1>
          <p className="text-gray text-[15px] mb-6">{message} You can request a fresh link from your account page.</p>
          <Link to="/account" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-ink text-cream font-semibold text-sm hover:bg-red transition-colors">
            Go to my account
          </Link>
        </>
      )}
    </div>
  );
}
