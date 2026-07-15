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
  { Icon: Store, text: 'Every shop selling the product — the full comparison, not just the top 4', tone: 'bg-acid-soft text-acid-deep' },
  { Icon: LineChart, text: 'Full price history to check whether a discount is real', tone: 'bg-blue-soft text-blue' },
  { Icon: MessageSquare, text: 'All buyer reviews — delivery, genuineness, after-sales', tone: 'bg-violet/10 text-violet' },
  { Icon: Bell, text: 'Free price-drop alerts on anything you track', tone: 'bg-red-soft text-red' },
];

export default function SignupGate({ title, subtitle, compact = false }) {
  const { signIn } = useAuth();
  const { pathname, search } = useLocation();
  const next = encodeURIComponent(pathname + search);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-acid/30 bg-gradient-to-br from-white via-acid-soft/40 to-lime-soft/70 text-center shadow-[var(--shadow-card)] ${compact ? 'p-4 sm:p-5' : 'p-6 sm:p-9'}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-acid/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-red/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-acid shadow-[var(--shadow-soft)]">
          <Lock className="h-3 w-3" /> Free member access
        </span>
        <h3 className="font-sans text-xl font-extrabold tracking-[-0.03em] text-ink sm:text-2xl">{title}</h3>
        {subtitle && <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-gray sm:text-sm">{subtitle}</p>}

        {!compact && (
          <ul className="mx-auto mb-1 mt-6 grid max-w-2xl gap-2.5 text-left sm:grid-cols-2">
            {MEMBER_BENEFITS.map(({ Icon, text, tone }) => (
              <li key={text} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/75 p-3.5 text-[13px] font-semibold leading-snug text-ink/85 shadow-[var(--shadow-soft)] backdrop-blur-sm">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="pt-0.5">{text}</span>
              </li>
            ))}
          </ul>
        )}

        <div className={`mx-auto mt-5 flex max-w-lg flex-col items-center rounded-[1.4rem] bg-ink px-4 py-5 text-cream shadow-[var(--shadow-lift)] ${compact ? '' : 'sm:px-6'}`}>
          <p className="mb-3 text-sm font-bold">Unlock everything in one click</p>
          <GoogleSignInButton
            divider="none"
            onSuccess={(d) => signIn(d.token, d.user)}
            fallback={(
              <button type="button" disabled className="flex h-11 w-full max-w-[300px] items-center justify-center gap-2 rounded-full border border-cream/15 bg-white text-sm font-bold text-ink opacity-90">
                <span className="bg-gradient-to-r from-blue via-red to-yellow bg-clip-text text-lg font-black text-transparent">G</span>
                Continue with Google
              </button>
            )}
          />
          <Link
            to={`/sign-up?next=${next}`}
            className="mt-3 text-xs font-bold text-acid underline decoration-acid/50 underline-offset-4 transition hover:text-cream"
          >
            or continue with email
          </Link>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-cream/55">
            <span className="rounded-full border border-cream/10 px-2 py-1">Free forever</span>
            <span className="rounded-full border border-cream/10 px-2 py-1">10 seconds</span>
            <span className="rounded-full border border-cream/10 px-2 py-1">No card</span>
          </div>
        </div>
      </div>
    </div>
  );
}
