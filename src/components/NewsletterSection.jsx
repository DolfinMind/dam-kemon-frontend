import { useState } from 'react';
import { Mail, Check, AlertCircle } from 'lucide-react';
import { subscribeNewsletter } from '../api/api';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await subscribeNewsletter(email);
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-acid-soft rounded-[2rem] p-8 sm:p-10 text-center border border-acid/20 shadow-sm relative overflow-hidden h-full flex flex-col justify-center">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-acid rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-lime rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-line">
          <Mail className="w-8 h-8 text-acid-deep" />
        </div>
        <h2 className="font-sans font-extrabold text-3xl text-ink leading-tight mb-3 tracking-tight">
          Never miss a price drop
        </h2>
        <p className="text-ink/75 mb-8">
          Join thousands of smart shoppers. Get weekly alerts on massive price cuts, new tech, and scam-risk updates directly to your inbox.
        </p>

        {status === 'success' ? (
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-acid text-acid-deep font-bold flex items-center justify-center gap-3">
            <Check className="w-6 h-6" /> You're on the list! Keep an eye on your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
            <input
              type="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
              className="w-full px-5 py-3.5 sm:py-4 rounded-xl border border-line focus:ring-4 ring-acid/30 outline-none text-ink bg-white shadow-sm placeholder:text-gray"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-ink text-white px-8 py-3.5 sm:py-4 rounded-xl font-bold hover:bg-acid hover:text-ink transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-sm flex items-center justify-center"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red font-medium text-sm mt-3 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Something went wrong. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
