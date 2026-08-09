import { useState } from 'react';
import { Tag, Check, Plus } from 'lucide-react';
import { submitOffer } from '../api/api';

/**
 * "Seen it cheaper? Add a price" — turns a shopper/seller into supply. The offer
 * is held for review server-side; on approval it becomes a comparison row, so
 * sellers-per-product grows from demand, not just crawling.
 */
export default function AddOffer({ productId }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ shopName: '', url: '', price: '' });
  const [state, setState] = useState({ busy: false, msg: '', ok: false });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, msg: '', ok: false });
    try {
      const { data } = await submitOffer(productId, {
        shopName: form.shopName,
        url: form.url,
        price: Number(form.price),
      });
      setState({ busy: false, ok: true, msg: data.message || 'Thanks! We’ll verify and add it.' });
      setForm({ shopName: '', url: '', price: '' });
    } catch (err) {
      setState({ busy: false, ok: false, msg: err?.response?.data?.error || 'Could not submit — please try again.' });
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink"
      >
        <Plus className="w-4 h-4" /> Seen it cheaper somewhere? Add the price
      </button>
    );
  }

  if (state.ok) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 text-sm text-green">
        <Check className="w-4 h-4" /> {state.msg}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 card-soft p-4 space-y-3">
      <div className="inline-flex items-center gap-1.5 text-sm font-semibold">
        <Tag className="w-4 h-4 text-acid-deep" /> Add a price you’ve seen
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          required minLength={2} maxLength={80}
          value={form.shopName} onChange={set('shopName')}
          placeholder="Shop name"
          className="px-3 py-2 rounded-lg border border-line bg-white text-sm"
        />
        <input
          required type="url"
          value={form.url} onChange={set('url')}
          placeholder="Product link (https://…)"
          className="px-3 py-2 rounded-lg border border-line bg-white text-sm sm:col-span-2"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          required type="number" min="1" step="any"
          value={form.price} onChange={set('price')}
          placeholder="Price ৳"
          className="px-3 py-2 rounded-lg border border-line bg-white text-sm w-32"
        />
        <button
          type="submit" disabled={state.busy}
          className="btn-accent !text-sm !px-4 !py-2 disabled:opacity-50"
        >
          {state.busy ? 'Submitting…' : 'Submit price'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray hover:text-ink px-2">
          Cancel
        </button>
      </div>
      {state.msg && !state.ok && <p className="text-xs text-red">{state.msg}</p>}
      <p className="text-[11px] text-gray">We verify every submission before it shows in the comparison.</p>
    </form>
  );
}
