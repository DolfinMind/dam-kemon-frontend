import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Search, Truck, ArrowRight, AlertTriangle, Wallet, TrendingDown,
} from 'lucide-react';

// Demo "scam risk" the meter animates to (0–100, higher = riskier).
const RISK = 58;

/**
 * Damkemon Protect homepage spotlight. Buyer-trust feature: matching prices is
 * table stakes; in BD the real fear is paying a seller (often an FB page) and
 * getting scammed. The right-hand card animates a live risk check — score
 * counts up, scam flags slide in, then a "protected" stamp lands — so the
 * value lands at a glance. Motion is gated on scroll-in and respects
 * prefers-reduced-motion (see .pm-* rules in index.css).
 */
export default function ProtectShowcase() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [score, setScore] = useState(0);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, analyzing, result
  const [scanText, setScanText] = useState('');
  const [resultData, setResultData] = useState(null);

  // Reveal + sequence trigger when the panel scrolls into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Helper to animate the score up
  const animateScore = (targetScore) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setScore(targetScore); return; }
    let raf, start;
    const dur = 1100;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      setScore(Math.round((1 - Math.pow(1 - p, 3)) * targetScore));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!url.trim() || status === 'analyzing') return;
    setStatus('analyzing');
    setScore(0);
    setResultData(null);
    setScanText('Resolving link...');
    
    // Sequence of analysis steps
    const steps = [
      { t: 600, text: 'Fetching domain history...' },
      { t: 1200, text: 'Checking bKash personal/merchant records...' },
      { t: 1800, text: 'Scanning customer reviews & complaints...' },
      { t: 2400, text: 'Calculating final scam risk...' }
    ];
    
    steps.forEach(({ t, text }) => {
      setTimeout(() => setScanText(text), t);
    });

    // Mock result based on input
    setTimeout(() => {
      const u = url.toLowerCase();
      const isFb = u.includes('facebook.com') || u.includes('fb.com');
      const isDaraz = u.includes('daraz.com');
      const isStarTech = u.includes('startech.com');
      
      let finalScore = 58;
      let flags = [];
      let name = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      let type = 'Online Shop';

      if (isDaraz || isStarTech) {
        finalScore = 12;
        name = isDaraz ? 'Daraz' : 'StarTech';
        flags = [
          { text: 'Verified merchant account', bad: false },
          { text: 'Trusted return policy detected', bad: false }
        ];
      } else if (isFb) {
        finalScore = 84;
        name = 'Unknown Facebook Page';
        type = 'Facebook Page';
        flags = [
          { text: 'Seller asks for bKash Send Money (personal)', bad: true },
          { text: 'No physical store address found', bad: true },
          { text: 'Page name changed 3 times recently', bad: true }
        ];
      } else {
        finalScore = 45;
        flags = [
          { text: 'Standard payment gateway detected', bad: false },
          { text: 'Domain registered recently', bad: true },
          { text: 'Price is 20% below the market average', bad: true }
        ];
      }

      setResultData({ name, type, flags, finalScore });
      setStatus('result');
      animateScore(finalScore);
    }, 3200);
  };

  // Dynamic glow color
  let auroraColor = 'bg-lime/15';
  if (status === 'result' && resultData) {
    if (resultData.finalScore > 60) auroraColor = 'bg-red/20';
    else if (resultData.finalScore > 30) auroraColor = 'bg-yellow/15';
    else auroraColor = 'bg-green/20';
  }

  return (
    <section className="container-tight py-10 sm:py-14 lg:py-18">
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-3xl bg-ink text-cream p-6 sm:p-10 lg:p-12 ${inView ? 'pm-in' : ''}`}
      >
        {/* drifting aurora */}
        <div className={`absolute top-0 right-0 w-full h-full pointer-events-none transition-colors duration-1000 ${auroraColor}`}>
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-current blur-3xl pointer-events-none animate-blob" />
          <div className="absolute -bottom-28 -left-16 w-96 h-96 rounded-full bg-current blur-3xl pointer-events-none animate-blob" style={{ animationDelay: '6s', opacity: 0.8 }} />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* LEFT — message */}
          <div>
            <div className="tag-bar text-lime mb-4 inline-flex items-center gap-2 pm-reveal">
              <span className="relative inline-flex w-4 h-4 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-lime/50 pm-ring" />
                <ShieldCheck className="w-4 h-4 relative" />
              </span>
              Damkemon Protect
            </div>

            <h2 className="font-serif font-semibold leading-[1.02] tracking-tight text-[clamp(2rem,5.2vw,3.4rem)] pm-reveal d1">
              Buy from anyone.<br />
              <span className="scribble-underline">
                <em className="text-lime">Without the fear.</em>
                <svg viewBox="0 0 200 14" preserveAspectRatio="none">
                  <path d="M2 10 Q 50 2, 100 8 T 198 6" stroke="#D4F542" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-scribble" />
                </svg>
              </span>
            </h2>

            <p className="text-cream/60 text-sm sm:text-base mt-5 max-w-md pm-reveal d2">
              Found it cheaper on a Facebook page? Before you pay, Damkemon scores the
              scam risk, puts your order on record, and stands behind you if it goes wrong.
            </p>

            <form onSubmit={handleAnalyze} className="mt-6 pm-reveal d3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-cream/40" />
                  </div>
                  <input 
                    type="text" 
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="Paste FB page or shop link..."
                    className="w-full bg-cream/[0.06] border border-cream/20 text-cream placeholder-cream/40 rounded-xl pl-10 pr-4 py-3.5 outline-none focus:border-lime focus:bg-cream/[0.1] transition-all text-sm"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={status === 'analyzing' || !url.trim()}
                  className="btn-accent shrink-0 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
                >
                  {status === 'analyzing' ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" /> Analyzing</span>
                  ) : (
                    <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Analyze Risk</span>
                  )}
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 mt-7 pm-reveal d4">
              <MiniStep icon={Search} label="Check" />
              <Dash />
              <MiniStep icon={ShieldCheck} label="Protect" />
              <Dash />
              <MiniStep icon={Truck} label="Resolve" />
            </div>
          </div>

          {/* RIGHT — animated live risk check */}
          <div className="relative pm-reveal d2 min-h-[280px] flex flex-col justify-center">
            {status === 'idle' && (
              <div className="rounded-2xl bg-cream/[0.04] border border-cream/10 p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-cream/5 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-cream/20" />
                </div>
                <h3 className="font-sans font-bold text-cream/80 text-lg mb-2">Check any seller instantly</h3>
                <p className="text-cream/50 text-sm max-w-xs">Paste a link to see their scam risk score before you send an advance payment.</p>
              </div>
            )}

            {status === 'analyzing' && (
              <div className="rounded-2xl bg-cream/[0.06] border border-lime/30 p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[240px]">
                <div className="pm-scan absolute inset-x-0 h-32 -top-32 bg-gradient-to-b from-transparent via-lime/10 to-transparent pointer-events-none" />
                <div className="relative z-10 w-16 h-16 rounded-full bg-lime/10 flex items-center justify-center mb-5 animate-pulse">
                  <Search className="w-8 h-8 text-lime" />
                </div>
                <div className="relative z-10 font-mono text-sm text-lime animate-pulse">{scanText}</div>
              </div>
            )}

            {status === 'result' && resultData && (
              <>
                <Chip className="pm-chip pm-float-a -top-3 left-2 sm:-left-4" tone={resultData.finalScore > 60 ? "bg-red-soft text-red" : "bg-green-soft text-green"}>
                  <Wallet className="w-3 h-3" /> {resultData.finalScore > 60 ? 'bKash personal?' : 'Safe payment'}
                </Chip>

                <div className="relative rounded-2xl bg-cream/[0.08] backdrop-blur-md border border-cream/20 p-5 overflow-hidden transition-colors shadow-2xl">
                  
                  <div className="relative flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-cream/50 inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse-dot ${resultData.finalScore > 60 ? 'bg-red' : resultData.finalScore > 30 ? 'bg-yellow' : 'bg-green'}`} /> Risk analysis complete
                    </span>
                  </div>

                  <div className="relative flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center font-serif italic font-bold text-cream">
                      {resultData.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-cream text-sm truncate">{resultData.name}</div>
                      <div className="text-[11px] text-cream/60 font-mono">{resultData.type}</div>
                    </div>
                  </div>

                  <div className="relative mb-5">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[11px] uppercase tracking-wider font-mono text-cream/60">Scam risk</span>
                      <span className={`font-serif text-3xl font-bold italic tabular-nums ${resultData.finalScore > 60 ? 'text-red' : resultData.finalScore > 30 ? 'text-yellow' : 'text-green'}`}>
                        {score}<span className="text-cream/40 text-sm not-italic font-sans">/100</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-cream/10 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${resultData.finalScore > 60 ? 'bg-red' : resultData.finalScore > 30 ? 'bg-yellow' : 'bg-green'}`} 
                        style={{ width: `${score}%` }} 
                      />
                    </div>
                  </div>

                  <div className="relative space-y-2 mb-5">
                    {resultData.flags.map((flag, idx) => (
                      <Flag key={idx} bad={flag.bad}>{flag.text}</Flag>
                    ))}
                  </div>

                  <div className="relative flex items-center justify-between gap-2 rounded-xl bg-cream/5 border border-cream/10 text-cream px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 font-semibold text-sm">
                      <ShieldCheck className="w-4 h-4" /> Want to be safe?
                    </span>
                    <Link to="/protect" className="font-mono text-[10px] uppercase font-bold tracking-wider bg-lime text-ink rounded-md px-2 py-1 hover:bg-lime/90 transition-colors">
                      Protect Order
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStep({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cream/10 text-lime">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <span className="font-mono text-[11px] uppercase tracking-wider text-cream/70">{label}</span>
    </div>
  );
}

function Dash() {
  return <span className="w-5 h-px bg-cream/20 shrink-0" />;
}

function Chip({ children, className = '', tone }) {
  return (
    <div className={`absolute z-10 hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-lg ${tone} ${className}`}>
      {children}
    </div>
  );
}

function Flag({ children, bad }) {
  return (
    <div className="flex items-start gap-2 text-[13px] text-cream/70">
      {bad ? (
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-red shrink-0" />
      ) : (
        <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-green shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}
