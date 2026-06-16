import { Link } from 'react-router-dom';
import {
  Sparkles, TrendingDown, ShieldCheck, BadgeCheck, Truck, RotateCcw, ArrowRight, Award,
} from 'lucide-react';
import {
  valueScore, deliveryText, returnText, authenticityMeta, tierOf,
} from './TrustBadge';

const fmt = (p) => (p == null ? 'N/A' : '৳' + Number(p).toLocaleString('en-IN'));
const slugOf = (sp) => sp.siteSlug || sp.siteName;
// Prefer the real marketplace sub-seller (e.g. a Daraz storefront), noting the
// marketplace it sits on; first-party shops just show their name.
const sellerLabel = (sp) => (sp.sellerName ? `${sp.sellerName} · ${sp.siteName}` : sp.siteName);

/**
 * The decision layer, distilled. Instead of leaving the buyer to eyeball a
 * price table, this panel answers the questions people actually ask:
 * where's it cheapest, is the seller trustworthy, is it genuine, how long is
 * delivery, and is there a better-value option for similar money.
 *
 * It opens with one plain-language "bottom line" sentence — the whole verdict
 * in a breath — then backs it with a scannable grid of the six questions, so a
 * hurried buyer can stop at the headline and a careful one can read the
 * evidence. Works price-only when trust data is unavailable.
 */
export default function SmartVerdict({ product, trust = {} }) {
  const prices = (product?.prices || []).filter((p) => p.price != null);
  if (prices.length === 0) return null;

  const lowest = Math.min(...prices.map((p) => p.price));
  const cheapest = prices.find((p) => p.price === lowest) || prices[0];

  const ranked = prices
    .map((sp) => ({ sp, t: trust[slugOf(sp)] || null, value: valueScore({ price: sp.price, lowestPrice: lowest, trust: trust[slugOf(sp)] }) }))
    .sort((a, b) => b.value - a.value);

  const best = ranked[0];
  const recommended = best?.sp || cheapest;
  const recT = (best && best.t) || trust[slugOf(cheapest)] || null;
  const sameAsCheapest = slugOf(recommended) === slugOf(cheapest);
  const diff = recommended.price != null && cheapest.price != null ? recommended.price - cheapest.price : 0;

  const auth = recT ? authenticityMeta(recT.authenticity) : null;
  const tier = recT ? tierOf(recT.trustScore) : null;
  const dtext = recT ? deliveryText(recT) : null;
  const multi = prices.length > 1;

  // Bottom line — the verdict as a single, plain-English sentence.
  const bottomLine = !multi ? (
    <>Only one seller here: <b className="text-cream">{sellerLabel(cheapest)}</b> at <b className="text-acid">{fmt(lowest)}</b>.</>
  ) : sameAsCheapest ? (
    <>Buy from <b className="text-cream">{sellerLabel(cheapest)}</b> at <b className="text-acid">{fmt(lowest)}</b> — it's the cheapest <i>and</i> the most trustworthy of {prices.length} sellers.</>
  ) : (
    <>Cheapest is <b className="text-cream">{sellerLabel(cheapest)}</b> at <b className="text-acid">{fmt(lowest)}</b>, but <b className="text-cream">{sellerLabel(recommended)}</b> is the smarter buy for just <b className="text-acid">{fmt(Math.abs(diff))}</b> more.</>
  );

  return (
    <section>
      <div className="card-elev overflow-hidden">
        {/* Header + plain-language verdict on the forest-green "smart" surface */}
        <div className="bg-green text-cream px-4 sm:px-5 py-4">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-acid text-ink shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div>
              <h2 className="font-sans text-base font-extrabold tracking-tight leading-none">Smart verdict</h2>
              <p className="text-[10px] text-cream/70 font-mono mt-0.5 uppercase tracking-wider">Beyond price — trust &amp; delivery</p>
            </div>
          </div>
          <p className="font-sans text-sm sm:text-base font-bold leading-snug text-cream/95">
            {bottomLine}
          </p>
        </div>

        {/* The six questions, as a scannable evidence grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-line">
          <Cell
            icon={TrendingDown}
            tone="text-green"
            q="Where is it cheapest?"
            a={fmt(lowest)}
            sub={<>on <b className="text-ink">{sellerLabel(cheapest)}</b>{multi ? ` · ${prices.length} sellers compared` : ''}</>}
          />
          <Cell
            icon={ShieldCheck}
            tone={tier ? tier.text : 'text-gray'}
            q="DamKemon score"
            a={recT ? `${recT.trustScore}/100 · ${tier.label}` : 'Not yet rated'}
            sub={recT
              ? <>{recT.ratingCount > 0 ? `${recT.ratingCount} buyer review${recT.ratingCount === 1 ? '' : 's'}` : 'baseline reputation'}{recT.recommendRate != null ? ` · ${recT.recommendRate}% recommend` : ''}</>
              : <>be the first to review this seller</>}
          />
          <Cell
            icon={BadgeCheck}
            tone={auth ? auth.tone : 'text-gray'}
            q="Is the product genuine?"
            a={auth ? auth.label : 'Unverified'}
            sub={recT?.warranty ? <>{recT.warranty}</> : <>warranty varies by seller</>}
          />
          <Cell
            icon={Truck}
            tone="text-ink"
            q="How long will delivery take?"
            a={dtext || 'Varies'}
            sub={recT ? <>{recT.codAvailable ? 'Cash on delivery available' : 'Prepaid only'}{recT.avgReportedDelivery != null ? ' · buyer-reported' : ''}</> : <>add a review with your delivery time</>}
          />
          <Cell
            icon={RotateCcw}
            tone="text-ink"
            q="What if I need to return it?"
            a={recT ? returnText(recT) : '—'}
            sub={recT ? <>at {sellerLabel(recommended)}</> : <>check the seller's policy</>}
          />
        </div>

        {/* Better alternative */}
        {product?.category && (
          <Link
            to={`/browse?category=${encodeURIComponent(product.category)}`}
            className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 bg-cream-soft/60 border-t border-line hover:bg-cream-soft transition-colors group"
          >
            <span className="text-sm text-ink/80">
              Is there a better alternative? <span className="text-gray">Compare other <b className="capitalize text-ink">{product.category}</b>.</span>
            </span>
            <ArrowRight className="w-4 h-4 text-ink/60 group-hover:translate-x-0.5 group-hover:text-ink transition-transform shrink-0" />
          </Link>
        )}
      </div>
    </section>
  );
}

function Cell({ icon: Icon, tone, q, a, sub }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 bg-surface">
      <span className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] sm:rounded-xl bg-cream-soft shrink-0 ${tone}`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0">
        <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-gray leading-tight mb-0.5">{q}</div>
        <div className={`font-sans text-[13px] sm:text-[15px] font-extrabold ${tone} leading-[1.15]`}>{a}</div>
        <div className="text-[10px] sm:text-[11px] text-gray leading-snug mt-1">{sub}</div>
      </div>
    </div>
  );
}
