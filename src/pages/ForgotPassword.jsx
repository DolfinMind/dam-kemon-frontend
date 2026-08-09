import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { ArrowLeft, MailCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await forgotPassword(email.trim()); } catch { /* opaque on purpose */ }
    setBusy(false);
    setSent(true);
  };

  return (
    <div className="container-tight py-10 sm:py-14 lg:py-16 max-w-md">
      <Link to="/sign-in" className="inline-flex items-center gap-1.5 text-sm text-gray hover:text-ink mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>

      {sent ? (
        <div className="card-soft p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-acid/40 mb-4">
            <MailCheck className="w-6 h-6 text-ink" />
          </div>
          <h1 className="font-serif text-2xl font-semibold mb-2">Check your inbox</h1>
          <p className="text-gray text-sm">
            If an account exists for <b>{email}</b>, a reset link is on its way. It works once and expires in 1 hour.
          </p>
        </div>
      ) : (
        <>
          <h1 className="font-serif text-3xl font-semibold mb-2 text-center">Forgot your password?</h1>
          <p className="text-gray text-[15px] text-center mb-6">We&apos;ll email you a link to set a new one.</p>
          <form onSubmit={onSubmit} className="card-soft p-6 sm:p-8 space-y-4">
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-wider text-gray mb-1.5">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
                className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ink"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-ink text-cream font-semibold text-sm hover:bg-red disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
