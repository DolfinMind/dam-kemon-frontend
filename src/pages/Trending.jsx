import { useEffect, useState } from 'react';
import { getTrending } from '../api/api';
import { Flame, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function formatPrice(price) {
  if (price == null) return 'N/A';
  return '৳' + Number(price).toLocaleString('en-IN');
}

export default function Trending() {
  const [trending, setTrending] = useState(null);

  useEffect(() => {
    getTrending()
      .then((res) => {
        setTrending(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setTrending([]));
  }, []);

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <Helmet>
        <title>Trending Deals in Bangladesh - Damkemon</title>
        <meta name="description" content="Discover the hottest tech and gadget deals that everyone in Bangladesh is buying right now. Updated every 24 hours." />
      </Helmet>

      <section className="container-tight pt-10 pb-16">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-red-soft text-red px-3 py-1.5 rounded-full text-xs font-bold mb-4">
            <TrendingUp className="w-4 h-4" /> Updated Real-Time
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-ink leading-tight tracking-tight mb-4">
            Trending Right Now
          </h1>
          <p className="text-gray text-lg max-w-xl">
            These are the most clicked and purchased products on Damkemon in the last 24 hours. Don't miss out on these deals before they expire.
          </p>
        </div>

        {trending === null ? (
          <div className="flex items-center justify-center py-20 text-gray animate-pulse font-medium">
            Loading trending deals...
          </div>
        ) : trending.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray font-medium">
            Not enough data to determine trends yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((item, idx) => {
              const url = `/product/${item.product_slug || item.product_id}`;
              const hasPrice = item.lowest_price != null;
              
              return (
                <Link
                  key={item.product_id}
                  to={url}
                  className="group flex flex-col bg-white rounded-3xl border border-line p-6 hover:shadow-xl hover:border-acid transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-acid-soft rounded-bl-[100px] -z-10 group-hover:scale-125 transition-transform duration-500" />
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink text-white font-bold text-sm">
                      #{idx + 1}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red">
                      <Flame className="w-3.5 h-3.5" /> Hot
                    </span>
                  </div>

                  <div className="w-full aspect-square flex items-center justify-center mb-6">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-surface-alt rounded-2xl" />
                    )}
                  </div>

                  <h3 className="font-sans font-bold text-lg leading-snug text-ink mb-2 line-clamp-2">
                    {item.product_name}
                  </h3>

                  <div className="mt-auto pt-4 flex items-end justify-between border-t border-line-strong/50">
                    <div>
                      <div className="text-[11px] font-mono text-gray font-bold uppercase tracking-widest mb-1">Lowest Tracked</div>
                      <div className="text-2xl font-bold font-mono text-ink leading-none">
                        {hasPrice ? formatPrice(item.lowest_price) : 'Check live'}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center group-hover:bg-acid group-hover:text-ink transition-colors text-ink">
                      <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
