import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signup } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { ArrowLeft, AlertCircle, UserPlus } from 'lucide-react';

/**
 * Regular-user registration: name + email + password, optional phone,
 * newsletter opt-in. On success the API returns a JWT (signed in right
 * away) and sends a verification email — alerts activate once verified.
 */
export default function SignUp() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', newsletterOptIn: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const rawNext = search.get('next');
  const next = (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : null;

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
      signIn(r.data.token, r.data.user);
      navigate(next || '/account');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create the account. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-tight py-10 sm:py-14 lg:py-16 max-w-md">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray hover:text-ink mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-acid/40 mb-4">
          <UserPlus className="w-6 h-6 text-ink" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight mb-2">Create your account</h1>
        <p className="text-gray text-[15px]">Track prices, build a wishlist, and get an email the moment a price drops.</p>
      </div>

      <form onSubmit={onSubmit} className="card-soft p-6 sm:p-8 space-y-4">
        <Field label="Name" type="text" value={form.name} onChange={set('name')} autoComplete="name" required autoFocus />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        <Field label="Password (8+ characters)" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" required />
        <Field label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="01XXXXXXXXX" />

        <label className="flex items-start gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={form.newsletterOptIn} onChange={set('newsletterOptIn')} className="mt-0.5" />
          <span>Send me the weekly price-drop digest (unsubscribe anytime)</span>
        </label>

        {error && (
          <div className="flex items-start gap-2 bg-red/10 border border-red/20 text-red px-3 py-2 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-ink text-cream font-semibold text-sm hover:bg-red disabled:opacity-50 disabled:cursor-wait transition-colors"
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-gray">
          Already have an account?{' '}
          <Link to={next ? `/sign-in?next=${encodeURIComponent(next)}` : '/sign-in'} className="font-semibold text-ink hover:text-red">
            Sign in
          </Link>
        </p>

        <GoogleSignInButton
          onSuccess={(data) => { signIn(data.token, data.user); navigate(next || '/account'); }}
          onError={setError}
        />
      </form>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wider text-gray mb-1.5">{label}</span>
      <input
        {...props}
        className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ink"
      />
    </label>
  );
}
