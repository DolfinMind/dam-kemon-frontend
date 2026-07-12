import { Link, useLocation } from 'react-router-dom';
import { Lock, Store, LineChart, Bell, MessageSquare } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';
import { useAuth } from '../auth/AuthContext';

/**
 * Inline signup wall for member-gated content (more shops, full reviews,
 * price history). Google-first: one click signs the visitor in on the spot
 * and the gated content renders live, no page round-trip. Inline by design —
 * no popups (see feedback-popup-restraint).
 */
export const MEMBER_BENEFITS = [
  { Icon: Store, text: 'Every shop selling the product — the full comparison, not just the top 4' },
  { Icon: LineChart, text: 'Full price history, so a fake “discount” can’t fool you' },
  { Icon: MessageSquare, text: 'All buyer reviews — delivery, genuineness, after-sales' },
  { Icon: Bell, text: 'Free price-drop alerts on anything you track' },
];

export default function SignupGate({ title, subtitle, compact = false }) {
  const { signIn } = useAuth();
  const { pathname, search } = useLocation();
  const next = encodeURIComponent(pathname + search);

  return (
    <div className={`rounded-3xl border border-line bg-white text-center shadow-[var(--shadow-soft)] ${compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'}`}>
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-acid/30 mb-3">
        <Lock className="w-5 h-5 text-ink" />
      </div>
      <h3 className="font-sans text-lg sm:text-xl font-extrabold tracking-[-0.02em] text-ink">{title}</h3>
      {subtitle && <p className="text-xs sm:text-sm text-gray mt-1 max-w-md mx-auto">{subtitle}</p>}
      {!compact && (
        <ul className="mt-4 mb-1 max-w-md mx-auto text-left space-y-2">
          {MEMBER_BENEFITS.map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 text-[13px] font-medium text-ink/85">
              <Icon className="w-4 h-4 mt-0.5 shrink-0 text-acid-deep" /> {text}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-col items-center gap-2">
        <GoogleSignInButton divider="none" onSuccess={(d) => signIn(d.token, d.user)} />
        <Link
          to={`/sign-up?next=${next}`}
          className="text-xs font-bold text-gray hover:text-ink underline underline-offset-2"
        >
          or create a free account with email
        </Link>
        <p className="text-[10px] font-mono text-gray-soft">Free forever · takes about 10 seconds</p>
      </div>
    </div>
  );
}
