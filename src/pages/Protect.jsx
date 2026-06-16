import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck, Search, Truck, ArrowRight, ShieldAlert, Check, Loader2, Sparkles, Copy, Lock
} from 'lucide-react';
import { protectGetOrder, protectConfirmOrder, protectDisputeOrder } from '../api/api';

const PAYMENTS = [
  { v: 'cod', label: 'Cash on Delivery (COD)' },
  { v: 'bkash_personal', label: 'bKash (Send Money)' },
  { v: 'bkash_merchant', label: 'bKash (Merchant)' },
  { v: 'card', label: 'Card / Bank' },
];

export default function Protect() {
  const [params] = useSearchParams();
  const [step, setStep] = useState('input'); // input, analyzing, result, protect_setup, protected
  const [query, setQuery] = useState('');
  const [scanText, setScanText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [orderForm, setOrderForm] = useState({ itemName: '', amount: '', paymentMethod: 'cod' });
  const [createdOrder, setCreatedOrder] = useState(null);
  
  // Track/Resolve state
  const [trackCode, setTrackCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // Focus effect for the massive input
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Check if coming from a product page
    const productId = params.get('productId');
    const shopSlug = params.get('shopSlug');
    if (productId && shopSlug) {
      setQuery(shopSlug);
      // Auto-analyze
      // (For this mock we just leave it in input state, but real app would trigger analysis)
    }
  }, [params]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setStep('analyzing');
    setScanText('Detecting platform...');
    
    const steps = [
      { t: 400, text: 'Querying scam reports database...' },
      { t: 800, text: 'Analyzing seller history & signals...' },
      { t: 1200, text: 'Finalizing trust score...' }
    ];
    
    steps.forEach(({ t, text }) => {
      setTimeout(() => setScanText(text), t);
    });

    try {
      const res = await protectAssess({ query });
      // Keep analyzing state for at least 1.5s to show animation
      setTimeout(() => {
        setResultData(res.data);
        setStep('result');
      }, 1500);
    } catch (error) {
      setTimeout(() => {
        setResultData({
          name: 'Unknown',
          type: 'Error Analysis',
          flags: [{ text: 'Could not connect to Damkemon Escrow', bad: true }],
          finalScore: 50,
          status: 'medium'
        });
        setStep('result');
      }, 1500);
    }
  };

  const handleProtectOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.itemName) return;
    setBusy(true);
    try {
      const res = await protectCreateOrder({
        query,
        ...orderForm
      });
      setCreatedOrder(res.data.order);
      setStep('protected');
    } catch (error) {
      alert("Failed to create protected order.");
    } finally {
      setBusy(false);
    }
  };

  const loadTrack = async (e) => {
    e?.preventDefault();
    if (!trackCode.trim()) return;
    setBusy(true); setErr(null); setTrackedOrder(null);
    try {
      const res = await protectGetOrder(trackCode.trim());
      setTrackedOrder(res.data);
    } catch { setErr('No protected order found for that code.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="container-tight py-12 sm:py-20 max-w-4xl min-h-[80vh] flex flex-col">
      {/* Hero Header */}
      <div className="text-center mb-10 sm:mb-16">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ink text-cream mb-4 shadow-xl">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-sans font-extrabold text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] tracking-[-0.04em] text-ink mb-4">
          The Trust Vault
        </h1>
        <p className="text-gray text-lg sm:text-xl max-w-2xl mx-auto font-medium">
          Drop any shop link, Facebook page, or bKash number below. <br className="hidden sm:block"/>
          We instantly analyze the scam risk and protect your purchase.
        </p>
      </div>

      {/* Main Interactive Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto relative z-10">
        
        {step === 'input' && (
          <form onSubmit={handleAnalyze} className={`relative transition-all duration-500 ease-out ${isFocused ? 'scale-[1.02] -translate-y-2' : ''}`}>
            {/* Ambient glow behind input */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-lime via-acid to-green rounded-[2rem] blur-xl opacity-20 transition-opacity duration-500 ${isFocused ? 'opacity-40' : ''}`} />
            
            <div className="relative bg-surface rounded-[2rem] p-2 shadow-2xl border border-line-strong flex items-center">
              <div className="pl-6 pr-2">
                <Search className={`w-6 h-6 transition-colors ${isFocused ? 'text-ink' : 'text-gray-soft'}`} />
              </div>
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Paste URL or phone number..."
                className="flex-1 bg-transparent border-none text-xl sm:text-2xl py-6 px-2 outline-none text-ink placeholder:text-gray-soft font-medium"
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!query.trim()}
                className="bg-ink hover:bg-ink-soft text-cream rounded-[1.5rem] px-8 py-5 text-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 mr-1"
              >
                Analyze
              </button>
            </div>
          </form>
        )}

        {step === 'analyzing' && (
          <div className="relative bg-surface rounded-[2rem] p-12 shadow-2xl border border-line flex flex-col items-center justify-center text-center overflow-hidden min-h-[300px]">
             {/* Scanning laser background */}
             <div className="pm-scan absolute inset-x-0 h-32 -top-32 bg-gradient-to-b from-transparent via-lime/20 to-transparent pointer-events-none" />
             <div className="relative z-10 w-20 h-20 rounded-full bg-cream flex items-center justify-center mb-6 shadow-soft animate-pulse">
               <ShieldCheck className="w-10 h-10 text-ink" />
             </div>
             <h3 className="relative z-10 font-mono text-xl text-ink font-bold animate-pulse">{scanText}</h3>
          </div>
        )}

        {step === 'result' && resultData && (
          <div className="animate-slide-up">
            <div className={`relative bg-surface rounded-[2rem] p-8 shadow-2xl border-2 overflow-hidden ${
              resultData.status === 'high' ? 'border-red/40 shadow-[0_20px_60px_-15px_rgba(255,69,33,0.15)]' : 
              resultData.status === 'low' ? 'border-green/40 shadow-[0_20px_60px_-15px_rgba(15,77,42,0.15)]' : 
              'border-yellow/40 shadow-[0_20px_60px_-15px_rgba(255,210,63,0.15)]'
            }`}>
              {/* Colored ambient glow */}
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none ${
                resultData.status === 'high' ? 'bg-red' : resultData.status === 'low' ? 'bg-green' : 'bg-yellow'
              }`} />

              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-gray mb-2">Trust Passport</div>
                  <h2 className="text-2xl font-bold text-ink truncate max-w-[200px] sm:max-w-xs">{resultData.name}</h2>
                  <p className="text-gray font-mono text-sm mt-1">{resultData.type}</p>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-serif italic font-extrabold tabular-nums ${
                    resultData.status === 'high' ? 'text-red' : resultData.status === 'low' ? 'text-green' : 'text-yellow'
                  }`}>
                    {resultData.finalScore}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray mt-1">Risk Score</div>
                </div>
              </div>

              <div className="space-y-3 mb-10">
                {resultData.flags.map((flag, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-cream/50 rounded-xl p-3">
                    {flag.bad ? <ShieldAlert className="w-5 h-5 mt-0.5 text-red shrink-0" /> : <Check className="w-5 h-5 mt-0.5 text-green shrink-0" />}
                    <span className="text-ink font-medium text-sm sm:text-base">{flag.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <button onClick={() => setStep('protect_setup')} className="flex-1 btn-acid text-lg py-4 border border-acid-deep/20">
                  <Sparkles className="w-5 h-5" /> Generate Protection Shield
                </button>
                <button onClick={() => { setStep('input'); setQuery(''); }} className="btn-ghost py-4 px-6 bg-surface">
                  Check another
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'protect_setup' && (
          <div className="animate-slide-up bg-surface rounded-[2rem] p-8 shadow-2xl border border-line relative">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('result')} className="p-2 hover:bg-cream rounded-full transition-colors text-gray">
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <h2 className="text-2xl font-bold text-ink">Protect this order</h2>
            </div>
            
            <p className="text-gray mb-8">Just a few details to register your purchase and activate Damkemon Escrow tracking.</p>

            <form onSubmit={handleProtectOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">What exactly are you buying?</label>
                <input required type="text" value={orderForm.itemName} onChange={e => setOrderForm({...orderForm, itemName: e.target.value})} placeholder="e.g. iPhone 15 Pro 256GB Natural Titanium" className="w-full bg-cream border border-line rounded-xl px-4 py-3 outline-none focus:border-ink transition-colors" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">Amount (৳)</label>
                  <input required type="number" min="0" value={orderForm.amount} onChange={e => setOrderForm({...orderForm, amount: e.target.value})} placeholder="125000" className="w-full bg-cream border border-line rounded-xl px-4 py-3 font-mono outline-none focus:border-ink transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">Payment Method</label>
                  <select value={orderForm.paymentMethod} onChange={e => setOrderForm({...orderForm, paymentMethod: e.target.value})} className="w-full bg-cream border border-line rounded-xl px-4 py-3 outline-none focus:border-ink transition-colors appearance-none">
                    {PAYMENTS.map(p => <option key={p.v} value={p.v}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={busy || !orderForm.itemName} className="w-full btn-primary py-4 rounded-xl font-bold text-lg mt-4 disabled:opacity-50 flex items-center justify-center gap-2 border border-transparent">
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Activate Protection</>}
              </button>
            </form>
          </div>
        )}

        {step === 'protected' && createdOrder && (
          <div className="animate-slide-up bg-surface rounded-[2rem] p-10 shadow-2xl border-2 border-green/30 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-soft text-green mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-ink mb-2">Shield Activated</h2>
            <p className="text-gray mb-8">Your purchase is registered. If anything goes wrong, you can open a dispute using this secure token.</p>
            
            <div className="inline-flex items-center gap-4 bg-cream border border-line-strong rounded-2xl p-2 pr-6 mb-8 max-w-full overflow-hidden">
              <div className="bg-white rounded-xl py-3 px-4 sm:px-6 font-mono text-xl sm:text-2xl font-bold tracking-wider text-ink shadow-sm truncate">
                {createdOrder.protectionCode}
              </div>
              <button 
                onClick={() => navigator.clipboard?.writeText(createdOrder.protectionCode)}
                className="text-gray hover:text-ink transition-colors flex items-center gap-2 font-semibold shrink-0"
              >
                <Copy className="w-5 h-5" /> <span className="hidden sm:inline">Copy</span>
              </button>
            </div>

            <div>
              <button onClick={() => { setStep('input'); setQuery(''); setOrderForm({itemName:'', amount:'', paymentMethod:'cod'}); }} className="font-semibold text-ink hover:underline">
                Protect another order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Section - Mini Dashboard style */}
      <div className="mt-20 w-full max-w-2xl mx-auto border-t border-line pt-12 mb-12">
        <h3 className="font-serif font-bold text-2xl text-ink mb-6 flex items-center gap-3">
          <Truck className="w-6 h-6" /> Manage an Order
        </h3>
        
        <form onSubmit={loadTrack} className="flex gap-3 max-w-md">
          <input 
            value={trackCode} 
            onChange={(e) => setTrackCode(e.target.value.toUpperCase())} 
            placeholder="Enter Shield Token (DK-XXXXXX)"
            className="flex-1 bg-surface border border-line-strong rounded-xl px-5 py-3 font-mono uppercase outline-none focus:border-ink transition-colors" 
          />
          <button type="submit" disabled={busy || !trackCode.trim()} className="bg-cream hover:bg-line border border-line-strong text-ink font-bold px-6 py-3 rounded-xl transition-colors shrink-0 disabled:opacity-50">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track'}
          </button>
        </form>
        {err && <p className="text-red text-sm mt-3 font-medium">{err}</p>}

        {trackedOrder && (
          <div className="mt-8 bg-surface border border-line rounded-2xl p-6 shadow-sm animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-ink text-lg">{trackedOrder.itemName || 'Protected order'}</div>
              <span className={`text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full ${
                trackedOrder.status === 'confirmed' ? 'text-green bg-green-soft' : 
                trackedOrder.status === 'disputed' ? 'text-red bg-red-soft' : 'text-yellow bg-yellow-soft'
              }`}>
                {trackedOrder.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray mb-6 bg-cream/50 rounded-xl p-4">
              <div><span className="block text-[10px] uppercase font-mono tracking-wider mb-1">Seller</span> <span className="font-medium text-ink">{trackedOrder.sellerName || trackedOrder.shopSlug || 'Unknown'}</span></div>
              <div><span className="block text-[10px] uppercase font-mono tracking-wider mb-1">Amount</span> <span className="font-medium font-mono text-ink">৳{trackedOrder.amount || 'N/A'}</span></div>
              <div><span className="block text-[10px] uppercase font-mono tracking-wider mb-1">Risk at purchase</span> <span className="font-medium text-ink">{trackedOrder.riskScore}/100</span></div>
            </div>

            {trackedOrder.status === 'open' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 bg-ink text-cream hover:bg-ink-soft py-3 rounded-xl font-bold transition-colors">
                  I received it safely
                </button>
                <button className="flex-1 bg-cream border border-line-strong text-red hover:bg-red-soft py-3 rounded-xl font-bold transition-colors">
                  Report an issue
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
