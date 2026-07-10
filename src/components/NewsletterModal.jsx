import { useEffect, useRef, useState } from 'react';
import { subscribeNewsletter } from '../api/api';
import { Mail, Check, X, ShieldCheck, Flame, ArrowRight } from 'lucide-react';
import { trackClick } from '../api/analytics';

export default function NewsletterModal({ open, onClose, isExitIntent = false }) {
  const overlayRef = useRef(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await subscribeNewsletter(email);
      try { localStorage.setItem('dk_nl', '1'); } catch { /* private mode */ }
      trackClick('newsletter-subscribe', 'modal-form');
      setStatus('done');
      setTimeout(onClose, 2500); // Close modal automatically after 2.5s on success
    } catch {
      setStatus('error');
    }
  };

  const dismiss = () => {
    try { localStorage.setItem('dk_nl_x', String(Date.now())); } catch { /* private mode */ }
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === overlayRef.current) dismiss();
      }}
    >
      <div className="relative w-full max-w-4xl bg-surface rounded-[2rem] shadow-2xl overflow-hidden transform scale-100 animate-in zoom-in-95 duration-500 flex flex-col md:flex-row border border-line-strong/30">
        
        {/* Left Side: Image/Graphic */}
        <div className="hidden md:block md:w-5/12 bg-ink relative">
          <img 
            src="/newsletter-bg.jpg" 
            alt="Abstract 3D Shapes" 
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60"></div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="inline-flex items-center gap-1.5 bg-acid/20 backdrop-blur-md text-acid-deep px-3 py-1.5 rounded-full text-xs font-bold mb-4 border border-acid/30">
              <ShieldCheck className="w-4 h-4" /> Trusted by 15k+ Shoppers
            </div>
          </div>
        </div>

        {/* Right Side: Content & Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center relative bg-white">
          <button 
            onClick={dismiss} 
            aria-label="Dismiss" 
            className="absolute top-6 right-6 text-gray hover:text-ink transition-colors bg-surface-alt hover:bg-line-strong p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 text-acid-deep font-bold text-xs uppercase tracking-widest mb-4">
            <Flame className="w-4 h-4" /> Exclusive Alerts
          </div>

          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold leading-[1.1] tracking-tight text-ink mb-4">
            {isExitIntent 
              ? "Wait! Don't buy anything yet."
              : "Don't overpay for your next gadget."}
          </h2>
          
          <p className="text-gray text-[15px] sm:text-base leading-relaxed mb-8 max-w-md">
            {isExitIntent
              ? "Join 15,000+ smart shoppers who get our top secret tech deals every Monday. We track the market so you never overpay."
              : "Join the top 1% of smart shoppers in Bangladesh. We track the market and send you the biggest price drops and exclusive deals every Monday morning."}
          </p>

          {status === 'done' ? (
            <div className="bg-acid-soft border border-acid/40 rounded-2xl p-6 text-center animate-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-acid text-ink rounded-full mb-4 shadow-lg">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-ink mb-1">You're on the list!</h3>
              <p className="text-ink/70 text-sm">Keep an eye on your inbox this Monday.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                  className="block w-full pl-11 pr-4 py-4 rounded-xl border border-line bg-surface-alt text-ink text-base outline-none focus:ring-2 focus:ring-acid/50 focus:border-acid transition-all"
                />
              </div>
              
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-ink text-white py-4 rounded-xl text-base font-bold hover:bg-acid hover:text-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2 group shadow-xl shadow-ink/10"
              >
                {status === 'loading' ? 'Subscribing...' : (
                  <>
                    Yes, I want price drops <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              {status === 'error' && (
                <p className="text-red text-sm font-medium mt-2 text-center animate-in slide-in-from-top-2">
                  Something went wrong. Please try again.
                </p>
              )}

              <button 
                type="button" 
                onClick={dismiss}
                className="text-gray hover:text-ink text-[13px] font-medium mt-4 transition-colors underline decoration-line hover:decoration-ink underline-offset-4"
              >
                No thanks, I prefer paying full price
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
