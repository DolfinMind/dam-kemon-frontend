import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';

/** Landing page for the emailed reset link: /reset-password?token=… */
export default function ResetPassword() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const token = search.get('token');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setBusy(true);
    try {
      await resetPassword(token, password);
      navigate('/sign-in?reset=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset the password.');
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="container-tight py-16 max-w-md text-center">
        <p className="text-gray">This link is missing its token. <Link to="/forgot-password" className="font-semibold text-ink hover:text-red">Request a new one.</Link></p>
      </div>
    );
  }

  return (
    <div className="container-tight py-10 sm:py-14 lg:py-16 max-w-md">
      <Link to="/sign-in" className="inline-flex items-center gap-1.5 text-sm text-gray hover:text-ink mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-acid/40 mb-4">
          <KeyRound className="w-6 h-6 text-ink" />
        </div>
        <h1 className="font-serif text-3xl font-semibold mb-2">Set a new password</h1>
      </div>

      <form onSubmit={onSubmit} className="card-soft p-6 sm:p-8 space-y-4">
        <label className="block">
          <span className="block text-xs font-mono uppercase tracking-wider text-gray mb-1.5">New password (8+ characters)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            autoFocus
            className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ink"
          />
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
          {busy ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </div>
  );
}
