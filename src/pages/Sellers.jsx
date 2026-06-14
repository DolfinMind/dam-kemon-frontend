import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getSellers } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { SHOW_SAATHI } from '../config/features';
import {
  ArrowLeft, BadgeCheck, MessageCircle, MapPin, Clock, Store, Search,
  ExternalLink, Sparkles, AlertTriangle, Globe, ShoppingBag,
} from 'lucide-react';

// Seller types in the directory: indexed storefronts (website), marketplace
// sub-sellers (Daraz/etc.), and f-commerce pages (facebook/instagram).
const TYPE_FILTERS = [
  { id: '',            label: 'All'         },
  { id: 'website',     label: 'Websites'    },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'facebook',    label: 'Facebook'    },
];

const CATEGORY_FILTERS = [
  { id: '',            label: 'All categories' },
  { id: 'smartphone',  label: 'Phones'      },
  { id: 'laptop',      label: 'Laptops'     },
  { id: 'fashion',     label: 'Fashion'     },
  { id: 'beauty',      label: 'Beauty'      },
  { id: 'appliance',   label: 'Appliances'  },
  { id: 'book',        label: 'Books'       },
  { id: 'grocery',     label: 'Grocery'     },
];

const PAGE_SIZE = 60;
const avatarColors = ['#2563EB', '#4F46E5', '#047857', '#F59E0B', '#7C3AED', '#0F172A'];

function formatFollowers(n) {
  if (n == null) return null;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// Normalise instagram → facebook bucket for the type filter.
const bucket = (t) => (t === 'instagram' ? 'facebook' : (t || 'website'));

function TypeBadge({ type }) {
  const b = bucket(type);
  const map = {
    website:     { icon: Globe,        label: 'Website',     cls: 'text-green bg-green/10' },
    marketplace: { icon: ShoppingBag,  label: 'Marketplace', cls: 'text-red bg-red-soft'   },
    facebook:    { icon: MessageCircle, label: 'Facebook',   cls: 'text-blue bg-blue/10'   },
  };
  const { icon: Icon, label, cls } = map[b] || map.website;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setLoading(true); setError(null);
    getSellers()
      .then((res) => setSellers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('network'))
      .finally(() => setLoading(false));
  }, []);

  // Reset pagination whenever a filter changes.
  useEffect(() => { setLimit(PAGE_SIZE); }, [type, category, verifiedOnly, query]);

  const typeCounts = useMemo(() => {
    const c = { website: 0, marketplace: 0, facebook: 0 };
    sellers.forEach((s) => { c[bucket(s.type)] = (c[bucket(s.type)] || 0) + 1; });
    return c;
  }, [sellers]);

  const filtered = useMemo(() => sellers.filter((s) => {
    if (type && bucket(s.type) !== type) return false;
    if (category && !(s.categories || []).includes(category)) return false;
    if (verifiedOnly && !s.verified) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = (s.name + ' ' + (s.area || '') + ' ' + (s.city || '') + ' ' + (s.tags || []).join(' ')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [sellers, type, category, verifiedOnly, query]);

  const shown = filtered.slice(0, limit);

  return (
    <div className="container-tight py-4 sm:py-6 lg:py-8">
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-7">
        <Link to="/" className="inline-flex items-center gap-1.5 text-gray hover:text-ink text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="tag-bar mb-2 sm:mb-3"><Store className="w-4 h-4" /> Every seller on Damkemon</div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold italic text-ink tracking-tight leading-[1.05]">
          All <em className="text-red">sellers</em> across Bangladesh
        </h1>
        <p className="text-gray text-sm sm:text-base mt-2 max-w-2xl">
          {loading ? 'Loading the seller directory…' : (
            <>
              <span className="font-mono font-bold text-ink">{sellers.length.toLocaleString('en-IN')}</span> sellers —{' '}
              {typeCounts.website.toLocaleString('en-IN')} online shops,{' '}
              {typeCounts.marketplace.toLocaleString('en-IN')} marketplace storefronts,{' '}
              {typeCounts.facebook.toLocaleString('en-IN')} F-commerce pages. Every one carries real prices we compare side by side.
            </>
          )}
        </p>
        <div className="mt-4 inline-flex flex-wrap gap-2">
          {SHOW_SAATHI && (
            <Link to="/fcommerce/signup" className="btn-primary text-sm">
              <BadgeCheck className="w-4 h-4" /> List my F-commerce shop
            </Link>
          )}
          <Link to="/submit-shop" className="btn-ghost text-sm">
            <Store className="w-4 h-4" /> Submit a website shop
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elev p-3 sm:p-4 mb-4 sm:mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a seller by name or area…"
              className="w-full pl-10 pr-3 py-2.5 bg-cream-soft border border-line rounded-xl text-sm text-ink placeholder-gray-soft focus:outline-none focus:border-ink/40"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t.id || 'all'}
                onClick={() => setType(t.id)}
                className={`font-mono text-[11px] sm:text-xs px-3 py-2 rounded-full border transition-all ${
                  type === t.id ? 'bg-ink text-cream border-ink' : 'bg-white text-ink/70 border-line hover:border-line-strong'
                }`}
              >{t.label}{t.id && typeCounts[t.id] != null ? ` (${typeCounts[t.id].toLocaleString('en-IN')})` : ''}</button>
            ))}
            <button
              onClick={() => setVerifiedOnly((v) => !v)}
              className={`font-mono text-[11px] sm:text-xs px-3 py-2 rounded-full border transition-all inline-flex items-center gap-1 ${
                verifiedOnly ? 'bg-blue text-white border-blue' : 'bg-white text-ink/70 border-line hover:border-line-strong'
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5" /> Verified
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 mt-3 pt-3 border-t border-line">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c.id || 'all'}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 font-mono text-[11px] sm:text-xs px-3 sm:px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                category === c.id ? 'bg-ink text-cream border-ink' : 'bg-cream-soft text-ink/70 border-line hover:border-line-strong'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray">
          {loading ? 'Loading…' : (
            <>Showing <span className="font-mono font-bold text-ink">{shown.length.toLocaleString('en-IN')}</span> of{' '}
            <span className="font-mono font-bold text-ink">{filtered.length.toLocaleString('en-IN')}</span> {filtered.length === 1 ? 'seller' : 'sellers'}</>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading sellers…" />
      ) : error ? (
        <div className="card-soft p-8 sm:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-red-soft mb-4">
            <AlertTriangle className="w-8 h-8 text-red" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold italic text-ink mb-2">Couldn't load sellers</h2>
          <p className="text-gray text-sm">Please refresh in a moment.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-soft p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-cream-soft mb-4">
            <Store className="w-8 h-8 text-ink/30" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold italic text-ink mb-2">No sellers match</h2>
          <p className="text-gray text-sm max-w-md mx-auto mb-4">Try clearing some filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {shown.map((s, i) => {
              const avatarColor = avatarColors[i % avatarColors.length];
              const initials = (s.name || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
              const followers = formatFollowers(s.followers);
              return (
                <div key={s.id} className="card-soft p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-serif font-bold italic text-base sm:text-lg shrink-0" style={{ backgroundColor: avatarColor, color: avatarColor === '#F59E0B' ? '#0F172A' : 'white' }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-serif text-base sm:text-lg font-semibold text-ink truncate">{s.name}</h3>
                        {s.verified && <BadgeCheck className="w-4 h-4 text-blue shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <TypeBadge type={s.type} />
                        {(s.city || s.area) && (
                          <span className="text-[11px] text-gray inline-flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" /> {[s.area, s.city].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline meta — only renders the signals this seller actually has */}
                  {(s.rating || s.reviewCount || followers || s.codAvailable || s.sameDayDelivery || s.avgReplyTime) && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray">
                      {s.rating ? <span className="font-semibold text-yellow">{s.rating.toFixed(1)}★</span> : null}
                      {s.reviewCount ? <span>{s.reviewCount.toLocaleString('en-IN')} reviews</span> : null}
                      {followers ? <span>{followers} followers</span> : null}
                      {s.codAvailable && <span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-green" /> COD</span>}
                      {s.sameDayDelivery && <span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow" /> Same-day</span>}
                      {s.avgReplyTime && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {s.avgReplyTime}</span>}
                    </div>
                  )}

                  {(s.categories || []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.categories.slice(0, 3).map((c) => (
                        <span key={c} className="chip chip-ghost !text-[10px] !py-0.5 !px-2 capitalize">{c.toLowerCase()}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto pt-2">
                    {s.messengerUrl && (
                      <a href={s.messengerUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue text-white text-sm font-semibold py-2 rounded-xl hover:bg-blue/90 transition-colors">
                        <MessageCircle className="w-4 h-4" /> Message
                      </a>
                    )}
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className={`${s.messengerUrl ? '' : 'flex-1'} inline-flex items-center justify-center gap-1.5 bg-cream-soft text-ink text-sm font-semibold py-2 px-3 rounded-xl hover:bg-ink hover:text-cream transition-colors`}>
                        Visit <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {limit < filtered.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setLimit((n) => n + PAGE_SIZE)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-line-strong text-ink font-semibold text-sm hover:bg-cream-soft transition-colors"
              >
                Load more sellers ({(filtered.length - limit).toLocaleString('en-IN')} more)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
