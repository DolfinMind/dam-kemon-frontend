import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { passwordLogin } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AuthLayout, { Stagger, Field } from '../components/AuthLayout';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const SIGN_IN_GSI = { text: 'signin_with' };

/**
 * Sign-in for everyone: regular users type their email, the owner a
 * username — one field, one endpoint, server returns a 30-day JWT. After
 * success we honor a {@code ?next=...} query param so pages that gate
 * behind auth can round-trip the user back to themselves. Falls back to
 * /admin for admin role, /account otherwise. Navigation watches `user`
 * (not a callback) so it works no matter which GSI surface signed us in.
 */
export default function SignIn() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [complete, setComplete] = useState(false);
  const justReset = search.get('reset') === '1';

  // Whitelist next= targets — only relative paths starting with "/" to
  // prevent open-redirect attacks via ?next=https://evil.com.
  const rawNext = search.get('next');
  const next = (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : null;
  const intent = next ? new URL(next, 'https://damkemon.com').searchParams.get('memberAction') : null;
  const copy = intent === 'track'
    ? { complete: 'Price tracking ready', heading: 'Sign in to track this price', detail: 'We’ll turn the alert on as soon as you’re back.' }
    : intent === 'save'
      ? { complete: 'Product saved', heading: 'Sign in to save this product', detail: 'We’ll add it to your wishlist as soon as you’re back.' }
      : { complete: 'Welcome back', heading: 'Welcome back', detail: 'Sign in to continue to Damkemon.' };

  useEffect(() => {
    if (!user) return undefined;
    setComplete(true);
    const timer = setTimeout(() => navigate(next || (user.role === 'admin' ? '/admin' : '/account')), 1050);
    return () => clearTimeout(timer);
  }, [user, next, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await passwordLogin(username, password);
      signIn(r.data.token, r.data.user); // the user-watch effect navigates
    } catch (err) {
      setError(err.response?.data?.error || 'Could not sign in. Check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout complete={complete} completeLabel={copy.complete}>
      <Stagger i={0} className="text-center mb-8">
        <h1 className="font-serif text-3xl sm:text-[2.1rem] font-semibold tracking-tight leading-tight mb-2">
          {copy.heading}
        </h1>
        <p className="text-gray text-[15px]">{copy.detail}</p>
      </Stagger>

      {justReset && (
        <Stagger i={1}>
          <div className="mb-4 flex items-center justify-center gap-2 bg-acid/20 border border-acid/50 text-ink px-4 py-3 rounded-xl text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Password updated — sign in with your new password.
          </div>
        </Stagger>
      )}

      <Stagger i={1}>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Google first — one click, no password. Email lives below the divider. */}
          <GoogleSignInButton
            featured
            divider="below"
            gsi={SIGN_IN_GSI}
            onSuccess={(d) => signIn(d.token, d.user)}
            onError={setError}
          />

          <Field
            label="Email or username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            // key replays the shake when the message changes on retry
            <div key={error} className="animate-shake flex items-start gap-2 bg-red/10 border border-red/20 text-red px-3 py-2 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="h-12 w-full inline-flex items-center justify-center gap-2 px-5 rounded-2xl border border-line-strong bg-white/80 text-ink font-semibold text-sm hover:bg-white hover:border-ink/25 hover:-translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait transition-all shadow-[var(--shadow-soft)]"
          >
            {busy ? 'Signing in…' : 'Continue with email'}
          </button>

          <div className="flex items-center justify-between pt-1 text-sm">
            <Link to="/forgot-password" className="text-gray hover:text-ink transition-colors">Forgot password?</Link>
            <Link
              to={next ? `/sign-up?next=${encodeURIComponent(next)}` : '/sign-up'}
              className="font-semibold text-ink hover:text-red transition-colors"
            >
              Create an account
            </Link>
          </div>
        </form>
      </Stagger>
    </AuthLayout>
  );
}
