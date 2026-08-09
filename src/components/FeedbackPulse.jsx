import { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { submitFeedback } from '../api/api';

const SNOOZE_MS = 14 * 24 * 3600 * 1000; // one ask per 14 days, site-wide

function eligible() {
  try {
    return Date.now() - Number(localStorage.getItem('dk_pulse_x') || 0) > SNOOZE_MS;
  } catch { return true; }
}

/**
 * One-click pulse survey, shown when `armed` flips true (the parent decides
 * the value moment — e.g. the shopper came back from a store visit). A vote
 * posts instantly as anonymous feedback; a follow-up text box is optional.
 */
export default function FeedbackPulse({ armed }) {
  const [visible, setVisible] = useState(false);
  const [voted, setVoted] = useState(null); // 'up' | 'down'
  const [detail, setDetail] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (armed && eligible()) setVisible(true);
  }, [armed]);

  if (!visible) return null;

  const snooze = () => {
    try { localStorage.setItem('dk_pulse_x', String(Date.now())); } catch { /* private mode */ }
    setVisible(false);
  };

  const vote = (v) => {
    setVoted(v);
    try { localStorage.setItem('dk_pulse_x', String(Date.now())); } catch { /* private mode */ }
    submitFeedback({ name: 'pulse', message: `PULSE ${v} — ${window.location.pathname}` }).catch(() => {});
  };

  const sendDetail = (e) => {
    e.preventDefault();
    if (detail.trim()) {
      submitFeedback({ name: 'pulse-detail', message: `${detail.trim()} — ${window.location.pathname}` }).catch(() => {});
    }
    setSent(true);
    setTimeout(() => setVisible(false), 1500);
  };

  return (
    <div className="fixed bottom-24 md:bottom-5 left-4 z-40 w-[calc(100%-2rem)] max-w-xs bg-white border border-line rounded-2xl shadow-lg p-4">
      <button onClick={snooze} aria-label="Dismiss" className="absolute top-3 right-3 text-ink/35 hover:text-ink transition-colors">
        <X className="w-4 h-4" />
      </button>
      {!voted ? (
        <>
          <p className="font-sans font-bold text-ink text-sm pr-5">Did Damkemon help you find a better price?</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => vote('up')} className="flex-1 inline-flex items-center justify-center gap-1.5 border border-line rounded-xl py-2 text-sm font-bold text-ink hover:border-green hover:text-green transition-colors">
              <ThumbsUp className="w-4 h-4" /> Yes
            </button>
            <button onClick={() => vote('down')} className="flex-1 inline-flex items-center justify-center gap-1.5 border border-line rounded-xl py-2 text-sm font-bold text-ink hover:border-red hover:text-red transition-colors">
              <ThumbsDown className="w-4 h-4" /> Not really
            </button>
          </div>
        </>
      ) : sent ? (
        <p className="font-sans font-bold text-ink text-sm">Thanks — this helps us get better.</p>
      ) : (
        <form onSubmit={sendDetail}>
          <p className="font-sans font-bold text-ink text-sm pr-5">
            {voted === 'up' ? 'Great! Anything we could do better?' : 'What should we fix?'}
          </p>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Optional — one line is plenty"
            className="w-full mt-2 px-3 py-2 rounded-xl border border-line text-sm text-ink outline-none focus:ring-2 ring-acid/40 placeholder:text-gray resize-none"
          />
          <button type="submit" className="w-full mt-2 bg-ink text-white rounded-xl py-2 text-sm font-bold hover:bg-acid hover:text-ink transition-colors">
            {detail.trim() ? 'Send' : 'Done'}
          </button>
        </form>
      )}
    </div>
  );
}
