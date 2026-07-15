import { useEffect, useState } from 'react';
import { getTrending, getTrendingShops } from '../api/api';
import { Flame, ArrowRight, TrendingUp, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CategoryIcon } from '../lib/categoryIcon';
import { formatBdt } from '../lib/display';

function formatPrice(price) {
  return formatBdt(price);
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-IN');
}

export default function Trending() {
  const [trending, setTrending] = useState(null);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    getTrending()
      .then((res) => setTrending(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTrending([]));
    getTrendingShops()
      .then((res) => setShops(Array.isArray(res.data) ? res.data : []))
      .catch(() => setShops([]));
  }, []);

  return (
    <div className="w-full min-h-screen">
      <Helmet>
        <title>Trending Deals in Bangladesh - Damkemon</title>
        <meta name="description" content="The products and shops Bangladeshi shoppers are checking out right now on Damkemon. Ranked by real shopper activity." />
      </Helmet>

      <section className="container-tight pt-10 pb-16">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-red-soft text-red px-3 py-1.5 rounded-full text-xs font-bold mb-4">
            <TrendingUp className="w-4 h-4" /> Ranked by real shopper activity
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-ink leading-tight tracking-tight mb-4">
            Trending Right Now
          </h1>
          <p className="text-gray text-lg max-w-xl">
            The products shoppers on Damkemon are clicking through to buy. Compare prices before these deals move.
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
              const url = `/product/${item.slug || item.productId}`;
              const hasPrice = item.lowestPrice != null;

              return (
                <Link
                  key={item.productId}
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
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-surface-alt rounded-2xl flex items-center justify-center">
                        <CategoryIcon category={item.category} className="w-16 h-16 text-ink/20" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-sans font-bold text-lg leading-snug text-ink mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  <div className="mt-auto pt-4 flex items-end justify-between border-t border-line-strong/50">
                    <div>
                      <div className="text-[11px] font-mono text-gray font-bold uppercase tracking-widest mb-1">Lowest Tracked</div>
                      <div className="text-2xl font-bold font-mono text-ink leading-none">
                        {hasPrice ? formatPrice(item.lowestPrice) : 'Check live'}
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

        {shops.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <div className="flex items-end justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="font-sans font-extrabold text-[clamp(1.4rem,3vw,2rem)] leading-tight tracking-tight text-ink inline-flex items-center gap-2.5">
                <Store className="w-6 h-6 text-acid-deep shrink-0" />
                Trending shops
              </h2>
              <span className="text-[11px] font-mono text-gray">Based on outbound visits</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {shops.slice(0, 5).map((s, i) => (
                <div
                  key={s.siteSlug}
                  className="bg-white rounded-2xl border border-line p-4 sm:p-5"
                >
                  <span className="font-sans text-2xl font-extrabold text-ink/15 tabular-nums leading-none">{String(i + 1).padStart(2, '0')}</span>
                  <div className="mt-3 text-[15px] font-bold text-ink truncate">{s.name}</div>
                  <div className="text-[11px] text-gray mt-1 font-mono">
                    {fmtNum(s.clicks)} buyer visits · {fmtNum(s.distinctProducts)} products
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
