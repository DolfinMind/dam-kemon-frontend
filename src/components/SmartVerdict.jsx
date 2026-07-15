import { Link } from 'react-router-dom';
import {
  Sparkles, TrendingDown, ShieldCheck, BadgeCheck, Truck, RotateCcw, ArrowRight,
} from 'lucide-react';
import {
  valueScore, deliveryText, returnText, authenticityMeta, tierOf,
} from './TrustBadge';
import { formatBdt } from '../lib/display';

const fmt = formatBdt;
const slugOf = (sp) => sp.siteSlug || sp.siteName;
// Prefer the real marketplace sub-seller (e.g. a Daraz storefront), noting the
// marketplace it sits on; first-party shops just show their name.
const sellerLabel = (sp) => (sp.sellerName ? `${sp.sellerName} · ${sp.siteName}` : sp.siteName);

/**
 * The decision layer, distilled. Instead of leaving the buyer to eyeball a
 * price table, this panel answers the questions people actually ask:
 * where's it cheapest, what seller signals are available, typical delivery,
 * and whether another option may offer better value for similar money.
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

  const bottomLine = !multi ? (
    <>Only one seller here: <b className="text-ink">{sellerLabel(cheapest)}</b> at <b className="text-acid-deep">{fmt(lowest)}</b>.</>
  ) : sameAsCheapest ? (
    <><b className="text-ink">{sellerLabel(cheapest)}</b> is cheapest at <b className="text-acid-deep">{fmt(lowest)}</b> and has the strongest available signals among {prices.length} sellers.</>
  ) : (
    <>Cheapest is <b className="text-ink">{sellerLabel(cheapest)}</b> at <b className="text-acid-deep">{fmt(lowest)}</b>; <b className="text-ink">{sellerLabel(recommended)}</b> has stronger available signals for <b className="text-acid-deep">{fmt(Math.abs(diff))}</b> more.</>
  );

  return (
    <section className="mb-4">
      <div className="rounded-[1.5rem] bg-surface border border-line shadow-sm overflow-hidden flex flex-col">
        {/* Sleek, dynamic header */}
        <div className="relative bg-gradient-to-r from-acid-soft/80 via-surface to-surface border-b border-line px-5 sm:px-6 py-4 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-acid/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-acid shadow-[0_4px_12px_rgba(159,226,49,0.3)] text-ink shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="font-sans text-[17px] font-extrabold tracking-tight text-ink">Smart verdict</h2>
                <span className="text-[10px] text-gray font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-black/[0.03]">Price &amp; seller context</span>
              </div>
              <p className="font-sans text-[14px] font-medium leading-snug text-ink/80">
                {bottomLine}
              </p>
            </div>
          </div>
        </div>

        {/* 5-item asymmetrical grid to eliminate holes (6 cols on lg, 2 on sm) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-px bg-line">
          <Cell
            spanClass="lg:col-span-2 sm:col-span-1"
            icon={TrendingDown}
            tone="text-green"
            bgTone="bg-green-soft/50 group-hover:bg-green-soft"
            q="Where is it cheapest?"
            a={fmt(lowest)}
            sub={<>on <b className="text-ink">{sellerLabel(cheapest)}</b>{multi ? ` · ${prices.length} sellers compared` : ''}</>}
          />
          <Cell
            spanClass="lg:col-span-2 sm:col-span-1"
            icon={ShieldCheck}
            tone={tier ? tier.text : 'text-gray'}
            bgTone={tier ? 'bg-acid-soft/50 group-hover:bg-acid-soft' : 'bg-cream-soft'}
            q="Seller score"
            a={recT ? `${recT.trustScore}/100 · ${tier.label}` : 'Not yet rated'}
            sub={recT
              ? <>{recT.ratingCount > 0 ? `${recT.ratingCount} buyer review${recT.ratingCount === 1 ? '' : 's'}` : 'editorial baseline; no buyer reviews yet'}{recT.recommendRate != null ? ` · ${recT.recommendRate}% recommend` : ''}</>
              : <>be the first to review this seller</>}
          />
          <Cell
            spanClass="lg:col-span-2 sm:col-span-1"
            icon={BadgeCheck}
            tone={auth ? auth.tone : 'text-gray'}
            bgTone="bg-blue-50/50 group-hover:bg-blue-50"
            q="What kind of seller?"
            a={auth ? auth.label : 'Unverified'}
            sub={recT?.warranty ? <>{recT.warranty}</> : <>warranty varies by seller</>}
          />
          <Cell
            spanClass="lg:col-span-3 sm:col-span-1"
            icon={Truck}
            tone="text-ink"
            bgTone="bg-orange-50/50 group-hover:bg-orange-50"
            q="Typical delivery"
            a={dtext || 'Varies'}
            sub={recT ? <>{recT.codAvailable ? 'Cash on delivery available' : 'Prepaid only'}{recT.avgReportedDelivery != null ? ' · buyer-reported' : ''}</> : <>add a review with your delivery time</>}
          />
          <Cell
            spanClass="lg:col-span-3 sm:col-span-2"
            icon={RotateCcw}
            tone="text-ink"
            bgTone="bg-purple-50/50 group-hover:bg-purple-50"
            q="Listed return window"
            a={recT ? returnText(recT) : '—'}
            sub={recT ? <>at {sellerLabel(recommended)}</> : <>check the seller’s policy</>}
          />
        </div>

        {/* Better alternative */}
        {product?.category && (
          <Link
            to={`/category/${encodeURIComponent(product.category)}`}
            className="flex items-center justify-between gap-2 px-5 py-3.5 bg-neutral-bg hover:bg-cream transition-colors group border-t border-line"
          >
            <span className="text-sm font-medium text-ink/70">
              Looking for alternatives? <span className="text-ink">Compare other <b className="capitalize font-bold text-acid-deep">{product.category}</b>.</span>
            </span>
            <span className="w-8 h-8 rounded-full bg-line flex items-center justify-center group-hover:bg-acid transition-colors shrink-0">
              <ArrowRight className="w-4 h-4 text-ink" />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

function Cell({ spanClass, icon: Icon, tone, bgTone, q, a, sub }) {
  return (
    <div className={`group flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-5 bg-surface hover:bg-surface-hover transition-colors ${spanClass}`}>
      <span className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-[12px] shrink-0 transition-colors ${bgTone || 'bg-cream-soft'} ${tone}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-gray leading-tight mb-1">{q}</div>
        <div className={`font-sans text-[14px] sm:text-[16px] font-extrabold ${tone} leading-[1.2]`}>{a}</div>
        <div className="text-[11px] text-gray leading-snug mt-1.5">{sub}</div>
      </div>
    </div>
  );
}
