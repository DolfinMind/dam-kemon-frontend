import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, ArrowRight, Lock } from 'lucide-react';

export default function ProtectShowcase() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (url.trim()) {
      navigate('/protect?q=' + encodeURIComponent(url));
    }
  };

  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 relative overflow-hidden bg-cream">
      {/* Background ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-lime/20 via-acid/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div 
        ref={ref}
        className={`max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center ${inView ? 'pm-in' : ''}`}
      >
        {/* LEFT COLUMN: Copy & Input */}
        <div className="lg:col-span-5 text-center lg:text-left pt-8 lg:pt-0">
          <div className="inline-flex items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-full bg-surface border border-line-strong text-ink text-sm font-bold tracking-wide uppercase mb-6 shadow-sm pm-reveal">
            <Lock className="w-4 h-4 text-lime-deep" /> Damkemon Trust Vault
          </div>
          
          <h2 className="font-sans font-extrabold leading-[1.05] tracking-[-0.04em] text-[clamp(2.5rem,6vw,4.5rem)] text-ink pm-reveal d1 mb-6">
            Buy from anyone.<br />
            <span className="text-lime-deep bg-lime/20 px-2 rounded-xl italic">Without the fear.</span>
          </h2>
          
          <p className="text-gray text-lg sm:text-xl font-medium max-w-lg mx-auto lg:mx-0 mb-10 pm-reveal d2">
            Found it cheaper on a Facebook page? Drop the link. We instantly analyze the scam risk and protect your purchase if things go wrong.
          </p>

          <form onSubmit={handleAnalyze} className="relative max-w-lg mx-auto lg:mx-0 pm-reveal d3">
            <div className="absolute -inset-1 bg-gradient-to-r from-lime via-acid to-green rounded-[1.5rem] blur-lg opacity-30 pointer-events-none" />
            <div className="relative bg-surface rounded-[1.5rem] p-2 shadow-xl border border-line-strong flex items-center">
              <div className="pl-4 pr-2">
                <Search className="w-5 h-5 text-gray-soft" />
              </div>
              <input 
                type="text" 
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Paste FB page or link..."
                className="flex-1 bg-transparent border-none text-base sm:text-lg py-3 sm:py-4 px-2 outline-none text-ink placeholder:text-gray-soft font-medium"
              />
              <button 
                type="submit" 
                disabled={!url.trim()}
                className="bg-ink hover:bg-ink-soft text-cream rounded-[1rem] px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Scan <span className="hidden sm:inline">Now</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Visual Mockup */}
        <div className="lg:col-span-7 relative flex justify-center lg:justify-end pm-reveal d4">
          <div className="relative w-full max-w-[500px] aspect-square sm:aspect-auto sm:h-[600px] flex items-center justify-center">
            {/* Decorative circles */}
            <div className="absolute inset-0 border border-line-strong rounded-full scale-[0.8] opacity-50" />
            <div className="absolute inset-0 border border-line-strong rounded-full scale-[1.1] opacity-20" />
            
            {/* The Floating Card */}
            <div className="relative z-10 w-full sm:w-[400px] bg-surface rounded-[2rem] p-6 sm:p-8 shadow-2xl border-2 border-green/30 rotate-2 hover:rotate-0 transition-transform duration-500 hover:shadow-[0_20px_80px_-20px_rgba(15,77,42,0.2)]">
               <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-green blur-3xl opacity-10 pointer-events-none" />
               
               <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray mb-1">Trust Passport</div>
                    <div className="w-24 h-5 bg-line rounded-md mb-2 animate-pulse" />
                    <div className="w-16 h-3 bg-line-light rounded-md" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-serif italic font-extrabold text-green">12</div>
                    <div className="text-[9px] font-mono uppercase tracking-wider text-gray mt-1">Risk Score</div>
                  </div>
               </div>

               <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 bg-cream rounded-xl p-3">
                    <ShieldCheck className="w-5 h-5 text-green" />
                    <div className="w-32 h-3 bg-line rounded-md" />
                  </div>
                  <div className="flex items-center gap-3 bg-cream rounded-xl p-3">
                    <ShieldCheck className="w-5 h-5 text-green" />
                    <div className="w-48 h-3 bg-line rounded-md" />
                  </div>
               </div>

               <div className="w-full bg-green/10 text-green-deep font-bold text-center py-3 rounded-xl border border-green/20 flex items-center justify-center gap-2">
                 <Lock className="w-4 h-4" /> Protected by Damkemon
               </div>
            </div>

            {/* Bad floating card (behind, blurred slightly) */}
            <div className="absolute z-0 w-full sm:w-[360px] bg-surface/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl border-2 border-red/20 -rotate-6 -translate-x-4 sm:-translate-x-12 translate-y-12 opacity-60">
               <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray mb-1">Trust Passport</div>
                    <div className="w-20 h-5 bg-line rounded-md mb-2" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-serif italic font-extrabold text-red">95</div>
                  </div>
               </div>
               <div className="w-full bg-red/10 text-red font-bold text-center py-2 rounded-xl border border-red/20 text-sm">
                 Critical Scam Risk
               </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
