import { useState } from 'react';
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { submitFeedback } from '../api/api';

export default function FeedbackSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message) return;
    setStatus('loading');
    try {
      await submitFeedback(formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-line shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col gap-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream text-ink text-sm font-bold tracking-tight mb-4">
          <MessageSquare className="w-4 h-4 text-acid-deep" /> Contact Us
        </div>
        <h2 className="font-sans font-extrabold text-3xl text-ink leading-tight mb-3 tracking-tight">
          Have feedback? We're all ears.
        </h2>
        <p className="text-ink/75 mb-2 leading-relaxed">
          Spotted a scam site? Found a bug? Let us know what's on your mind. We read every single message.
        </p>
      </div>

      <div className="flex-1 w-full flex flex-col justify-end">
        {status === 'success' ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-green-soft rounded-2xl border border-green/20">
            <CheckCircle className="w-12 h-12 text-green mb-4" />
            <h3 className="font-bold text-xl text-ink mb-2">Message sent!</h3>
            <p className="text-ink/70">Thanks for reaching out. We'll get back to you if needed.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-6 text-sm font-bold text-green hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name (Optional)"
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setStatus('idle'); }}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-acid-deep focus:ring-1 focus:ring-acid-deep outline-none text-ink placeholder:text-gray/80 bg-surface transition-all text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setStatus('idle'); }}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-acid-deep focus:ring-1 focus:ring-acid-deep outline-none text-ink placeholder:text-gray/80 bg-surface transition-all text-sm"
              />
            </div>
            <textarea
              placeholder="How can we help?"
              required
              rows={3}
              value={formData.message}
              onChange={(e) => { setFormData({ ...formData, message: e.target.value }); setStatus('idle'); }}
              className="w-full px-4 py-3 rounded-xl border border-line focus:border-acid-deep focus:ring-1 focus:ring-acid-deep outline-none text-ink placeholder:text-gray/80 bg-surface transition-all resize-none text-sm"
            />
            {status === 'error' && (
              <p className="text-red font-medium text-sm flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Failed to send message.
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-ink text-white py-3.5 rounded-xl font-bold hover:bg-acid hover:text-ink transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? 'Sending...' : <>Send Message <Send className="w-4 h-4" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
