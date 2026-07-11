import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown } from 'lucide-react';
import { getHotDrops } from '../api/api';
import { cleanName } from '../lib/display';

// Real price-drop events from the tracker — never invented activity. An empty
// feed renders nothing, and each drop links to its product page.
const MAX_TOASTS = 3; // per session — inform, don't nag

export default function SocialProofToasts() {
  const [drops, setDrops] = useState([]);
  const [idx, setIdx] = useState(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getHotDrops(6)
      .then((r) => {
        const ds = (Array.isArray(r.data) ? r.data : [])
          .filter((d) => d.id && d.name && d.currentPrice != null)
          .slice(0, MAX_TOASTS);
        setDrops(ds);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!drops.length) return;
    const timers = [];
    drops.forEach((_, i) => {
      const at = 15000 + i * 30000;
      timers.push(setTimeout(() => { setIdx(i); setVisible(true); }, at));
      timers.push(setTimeout(() => setVisible(false), at + 6000));
    });
    return () => timers.forEach(clearTimeout);
  }, [drops]);

  const drop = drops[idx];
  if (!drop) return null;

  return (
    <div
      className={`fixed top-4 right-4 md:top-6 md:right-6 z-50 transition-all duration-500 transform ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'
      }`}
    >
      <Link
        to={`/product/${drop.id}`}
        onClick={() => setVisible(false)}
        className="bg-surface border border-line-strong rounded-2xl shadow-xl shadow-ink/5 p-3 pr-4 flex items-center gap-3 max-w-sm backdrop-blur-md hover:border-ink/30 transition-colors"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-acid-soft text-acid-deep">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div className="text-sm text-ink/80 font-medium leading-snug">
          <span className="font-bold text-ink mr-1">Price drop:</span>
          {cleanName(drop.name)} — now ৳{Number(drop.currentPrice).toLocaleString('en-IN')}
        </div>
      </Link>
    </div>
  );
}
