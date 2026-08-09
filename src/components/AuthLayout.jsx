import { Check } from 'lucide-react';

/** A focused, full-screen auth surface. Fixed positioning intentionally hides
 * the storefront navbar/footer while sign-in is in progress. */
export default function AuthLayout({ children, complete = false, completeLabel = 'You’re in' }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-cream text-ink">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-acid/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-lime/10 blur-3xl animate-blob" style={{ animationDelay: '-10s' }} />
      </div>

      <a href="/" className="fixed left-5 top-5 z-10 flex items-center gap-2 sm:left-8 sm:top-7" aria-label="Damkemon home">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-serif text-lg font-bold italic text-cream shadow-[var(--shadow-soft)]">d</span>
        <span className="font-serif text-xl font-bold italic tracking-tight">dam<span className="text-red">.</span>kemon</span>
      </a>

      <main className="relative flex min-h-full items-center justify-center px-5 pb-12 pt-24 sm:px-8 sm:py-24">
        <div className="w-full max-w-[27rem]">
          {complete ? <AuthSuccess label={completeLabel} /> : children}
          {!complete && (
            <p className="mt-7 text-center text-[11px] leading-relaxed text-gray">
              By continuing, you agree to use Damkemon responsibly and keep the community useful.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function AuthSuccess({ label }) {
  return (
    <div className="animate-auth-success text-center" role="status" aria-live="polite">
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-acid/25 animate-auth-ring" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ink text-acid shadow-[var(--shadow-lift)]">
          <Check className="h-7 w-7 animate-auth-check" strokeWidth={2.5} />
        </span>
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{label}</h1>
      <p className="mt-2 text-sm text-gray">Opening your account…</p>
      <div className="mx-auto mt-6 h-1 w-32 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-acid animate-auth-progress" />
      </div>
    </div>
  );
}

export function Stagger({ i = 0, className = '', children }) {
  return <div className={`opacity-0 animate-fade-in-up ${className}`} style={{ animationDelay: `${i * 70}ms` }}>{children}</div>;
}

export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink/75">{label}</span>
      <input {...props} className="h-12 w-full rounded-2xl border border-line-strong bg-white/90 px-4 text-[15px] text-ink shadow-[var(--shadow-soft)] outline-none transition focus:border-ink/30 focus:ring-4 focus:ring-acid/20" />
    </label>
  );
}
