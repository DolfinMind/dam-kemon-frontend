import { useState, useEffect } from 'react';
import { ShoppingBag, TrendingDown, BellRing, Sparkles } from 'lucide-react';

// Simulated recent activity to generate FOMO and trust
const ACTIVITY_POOL = [
  { icon: TrendingDown, text: "Someone in Dhaka just saved ৳450 on Apple AirPods Pro.", type: "saving" },
  { icon: ShoppingBag, text: "Ahsan bought Samsung S24 at the lowest price this month.", type: "purchase" },
  { icon: BellRing, text: "A new price drop was just detected for Sony WH-1000XM5.", type: "drop" },
  { icon: Sparkles, text: "Nafisa tracked a deal for MacBook Air M2.", type: "track" },
  { icon: TrendingDown, text: "Price dropped by ৳1200 on an LG Refrigerator.", type: "saving" }
];

export default function SocialProofToasts() {
  const [currentToast, setCurrentToast] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Wait 15s before showing the first toast
    let timeout;
    
    const showToast = () => {
      // Pick random toast
      const randomToast = ACTIVITY_POOL[Math.floor(Math.random() * ACTIVITY_POOL.length)];
      setCurrentToast(randomToast);
      setIsVisible(true);
      
      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      
      // Schedule next toast (between 15s and 45s)
      const nextDelay = Math.floor(Math.random() * 30000) + 15000;
      timeout = setTimeout(showToast, nextDelay);
    };

    timeout = setTimeout(showToast, 15000);

    return () => clearTimeout(timeout);
  }, []);

  if (!currentToast) return null;

  const Icon = currentToast.icon;
  const isSaving = currentToast.type === 'saving';
  const isDrop = currentToast.type === 'drop';

  return (
    <div
      className={`fixed top-4 right-4 md:top-6 md:right-6 z-50 transition-all duration-500 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-surface border border-line-strong rounded-2xl shadow-xl shadow-ink/5 p-3 pr-4 flex items-center gap-3 max-w-sm backdrop-blur-md">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isSaving ? 'bg-acid-soft text-acid-deep' : 
          isDrop ? 'bg-red-soft text-red' : 
          'bg-cream text-ink'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-sm text-ink/80 font-medium leading-snug">
          <span className="font-bold text-ink mr-1">Live:</span>
          {currentToast.text}
        </div>
      </div>
    </div>
  );
}
