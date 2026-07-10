import { useEffect, useRef } from 'react';
import NewsletterInline from './NewsletterInline';

export default function NewsletterModal({ open, onClose }) {
  const overlayRef = useRef(null);

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

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl transform scale-100 animate-in zoom-in-95 duration-300">
        <NewsletterInline 
          title="Join the smart shoppers club" 
          dismissible={true}
          onDismiss={onClose}
        />
        <div className="absolute top-3 right-3 sm:hidden">
          {/* On mobile, NewsletterInline close button might be cramped, but it handles its own dismiss. 
              We'll just pass a wrapped close function if we could, but NewsletterInline dismisses itself internally. 
              To make the modal close when the internal NewsletterInline dismisses, we can detect clicks or let it hide. 
              Wait, NewsletterInline has its own close state `hidden`, if it gets hidden, the modal might just be an empty box?
          */}
        </div>
      </div>
    </div>
  );
}
