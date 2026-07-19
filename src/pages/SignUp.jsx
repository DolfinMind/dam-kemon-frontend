import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signup } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AuthLayout, { Stagger, Field } from '../components/AuthLayout';
import { AlertCircle } from 'lucide-react';

const SIGN_UP_GSI = { text: 'signup_with' };

/**
 * Regular-user registration: name + email + password, optional phone,
 * newsletter opt-in. On success the API returns a JWT (signed in right
 * away) and sends a verification email — alerts activate once verified.
 * Navigation watches `user` (not a callback) so it works no matter which
 * GSI surface signed us in.
 */
export default function SignUp() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', newsletterOptIn: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [complete, setComplete] = useState(false);

  const rawNext = search.get('next');
  const next = (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : null;
  const intent = next ? new URL(next, 'https://damkemon.com').searchParams.get('memberAction') : null;
  const copy = intent === 'track'
    ? { complete: 'Price tracking ready', heading: 'Track this price', detail: 'Create a free account and we’ll turn the alert on automatically.' }
    : intent === 'save'
      ? { complete: 'Product saved', heading: 'Save this product', detail: 'Create a free account and we’ll add it to your wishlist automatically.' }
      : { complete: 'Account ready', heading: 'Create your account', detail: 'Save a search now and we’ll watch the prices for you.' };

  useEffect(() => {
    if (!user) return undefined;
    setComplete(true);
    const timer = setTimeout(() => navigate(next || '/account?tab=saved-searches'), 1050);
    return () => clearTimeout(timer);
  }, [user, next, navigate]);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setBusy(true);
    try {
      const r = await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        newsletterOptIn: form.newsletterOptIn,
      });
      signIn(r.data.token, r.data.user); // the user-watch effect navigates
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create the account. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout complete={complete} completeLabel={copy.complete}>
      <Stagger i={0} className="text-center mb-8">
        <h1 className="font-serif text-3xl sm:text-[2.1rem] font-semibold tracking-tight leading-tight mb-2">{copy.heading}</h1>
        <p className="text-gray text-[15px]">{copy.detail}</p>
      </Stagger>

      <Stagger i={1}>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Google first — one click, no password. Email lives below the divider. */}
          <GoogleSignInButton
            featured
            divider="below"
            gsi={SIGN_UP_GSI}
            onSuccess={(d) => signIn(d.token, d.user)}
            onError={setError}
          />

          <Field label="Name" type="text" value={form.name} onChange={set('name')} autoComplete="name" required />
          <Field label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          <Field label="Password (8+ characters)" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" required />
          <Field label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="01XXXXXXXXX" />

          <label className="flex items-start gap-2 text-sm text-ink/80 cursor-pointer">
            <input type="checkbox" checked={form.newsletterOptIn} onChange={set('newsletterOptIn')} className="mt-0.5" />
            <span>Send me the weekly price-drop digest (unsubscribe anytime)</span>
          </label>

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
            {busy ? 'Creating account…' : 'Create with email'}
          </button>

          <p className="text-center text-sm text-gray">
            Already have an account?{' '}
            <Link to={next ? `/sign-in?next=${encodeURIComponent(next)}` : '/sign-in'} className="font-semibold text-ink hover:text-red transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </Stagger>
    </AuthLayout>
  );
}
