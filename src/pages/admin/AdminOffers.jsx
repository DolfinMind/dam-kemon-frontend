import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listOffers, approveOffer, rejectOffer } from '../../api/admin';
import { Check, X, ExternalLink, Tag } from 'lucide-react';

const fmt = (p) => (p == null ? '—' : '৳' + Number(p).toLocaleString('en-IN'));

export default function AdminOffers() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(null);

  const load = () =>
    listOffers().then((r) => setItems(Array.isArray(r.data) ? r.data : [])).catch(() => setItems([]));

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setBusy(id);
    try { await approveOffer(id); await load(); }
    finally { setBusy(null); }
  };
  const reject = async (id) => {
    setBusy(id);
    try { await rejectOffer(id, 'rejected via admin console'); await load(); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-lg font-semibold inline-flex items-center gap-2">
          <Tag className="w-5 h-5 text-acid-deep" /> Community offers · {items.length}
        </h2>
        <p className="text-xs text-gray mt-0.5">
          Shopper/seller-submitted prices. Approve to add a comparison row to the product — depth without a crawl.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray card-soft p-6 text-center">No offers awaiting review.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((o) => (
            <li key={o.id} className="card-soft p-4 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">
                  {o.shopName} · <span className="font-mono">{fmt(o.price)}</span>
                </div>
                <Link to={`/product/${o.productId}`} className="text-xs text-ink/70 hover:text-ink">
                  {o.productName || o.productId}
                </Link>
                <div className="mt-1">
                  <a href={o.url} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-gray hover:text-ink inline-flex items-center gap-1 break-all">
                    {o.url} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                {o.contactEmail && <div className="text-[11px] text-gray mt-1">from {o.contactEmail}</div>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => approve(o.id)} disabled={busy === o.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green text-white text-xs font-semibold hover:bg-green/90 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => reject(o.id)} disabled={busy === o.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-cream-soft border border-line text-ink text-xs font-semibold hover:border-red hover:text-red disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
