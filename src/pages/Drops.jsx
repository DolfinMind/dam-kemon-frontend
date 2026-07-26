import { useEffect, useState } from 'react';
import { Flame, Share2 } from 'lucide-react';
import { getHotDrops } from '../api/api';
import { DropCard } from '../components/HotDropsRail';
import NewsletterInline from '../components/NewsletterInline';

/**
 * Public, shareable mirror of the weekly drops email — the landing target for
 * social posts. Same data as the homepage rail, bigger grid, newsletter CTA
 * front and center.
 */
export default function Drops() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    document.title = "This week's biggest price drops — Damkemon";
    getHotDrops(24).then((r) => {
      setItems(Array.isArray(r.data) ? r.data : []);
    }).catch(() => setItems([]));
  }, []);

  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: "This week's biggest price drops — Damkemon", url }).catch(() => {});
    else navigator.clipboard?.writeText(url);
  };

  return (
    <div className="container-tight py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="tag-bar mb-2 inline-flex items-center gap-1.5 text-red">
            <Flame className="w-3.5 h-3.5" /> Price drops
          </div>
          <h1 className="font-serif font-semibold text-[clamp(1.75rem,4vw,2.75rem)] leading-tight">
            This week&apos;s biggest <em className="text-red">price drops</em>
          </h1>
          <p className="text-gray text-sm mt-2 max-w-xl">
            Real drops below each product&apos;s 7-day typical market low — so one expensive seller or bad scrape cannot fake a deal.
          </p>
        </div>
        <button onClick={share} className="btn-ghost inline-flex shrink-0" aria-label="Share this page">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      <div className="mb-8">
        <NewsletterInline title="Get this list in your inbox every Monday" />
      </div>

      {items === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card-soft aspect-[3/4] animate-pulse bg-cream-soft" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card-soft p-10 text-center text-gray text-sm">
          No big drops right now — subscribe above to get Monday&apos;s list.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((p) => <DropCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
