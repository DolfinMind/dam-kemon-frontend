import { useEffect, useState } from 'react';
import { listShops, reindexShop, setShopStatus, editShop, bulkSetShopStatus, diagCollections, reseedDirectories, syncShopFeed } from '../../api/admin';
import { RotateCcw, AlertTriangle, CheckCircle2, Clock, Edit2, X, Check, DatabaseZap, DownloadCloud, Eye, EyeOff, FileText, Rss, Zap } from 'lucide-react';

const PAGE_SIZE = 100;

const HEALTH_BADGE = {
  active: { color: 'bg-green/15 text-green', icon: CheckCircle2 },
  degraded: { color: 'bg-yellow/30 text-ink', icon: AlertTriangle },
  dormant: { color: 'bg-gray/20 text-gray', icon: Clock },
};

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [q, setQ] = useState(''); // debounced copy of searchQuery that actually hits the server
  const [sortBy, setSortBy] = useState('name');
  const [busy, setBusy] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null);

  const [diag, setDiag] = useState(null);
  const [reseeding, setReseeding] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // A failed load (commonly a 401 from an expired admin session) must not look
  // like "0 shops" — surface the real reason so the table-empty case is honest.
  const load = () =>
    listShops({
      page, size: PAGE_SIZE, sort: sortBy,
      q: q || undefined,
      health: filter !== 'all' ? filter : undefined,
    })
      .then((r) => {
        setShops(Array.isArray(r.data?.shops) ? r.data.shops : []);
        setTotal(r.data?.totalElements ?? 0);
        setLoadError(null);
      })
      .catch((e) => {
        setShops([]);
        setTotal(0);
        setLoadError(
          e?.response?.status === 401
            ? 'Your admin session expired — sign in again to load shops.'
            : `Couldn't load shops (${e?.response?.status || 'network error'}).`
        );
      });
  const loadDiag = () => diagCollections().then((r) => setDiag(r.data)).catch(() => setDiag(null));
  // load is intentionally driven by the query state below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page, filter, sortBy, q]);
  useEffect(() => { loadDiag(); }, []);
  useEffect(() => {
    const t = setTimeout(() => { setPage(0); setQ(searchQuery.trim()); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const reseed = async () => {
    setReseeding(true);
    try {
      const { data } = await reseedDirectories();
      setDiag(data);
      await load();
    } finally { setReseeding(false); }
  };

  const reindex = async (slug) => {
    setBusy('reindex:' + slug);
    try { await reindexShop(slug); }
    finally { setBusy(null); }
  };

  const syncFeed = async (slug) => {
    setBusy('feed:' + slug);
    try {
      const { data } = await syncShopFeed(slug);
      alert(data.error ? `Feed sync: ${data.error}` : `Feed sync: ${data.persisted ?? 0} items merged`);
      await load();
      loadDiag();
    } finally { setBusy(null); }
  };

  const flipStatus = async (slug, current) => {
    const next = current === 'active' ? 'blocked' : 'active';
    setBusy('status:' + slug);
    try { await setShopStatus(slug, next); await load(); }
    finally { setBusy(null); }
  };

  const toggleSelect = (slug) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    setSelected(next);
  };

  const bulkDisable = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Block ${selected.size} shops?`)) return;
    setBusy('bulk');
    try {
      await bulkSetShopStatus([...selected], 'blocked');
      setSelected(new Set());
      await load();
    } finally { setBusy(null); }
  };
  const bulkEnable = async () => {
    if (selected.size === 0) return;
    setBusy('bulk');
    try {
      await bulkSetShopStatus([...selected], 'active');
      setSelected(new Set());
      await load();
    } finally { setBusy(null); }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusy('edit');
    try {
      await editShop(editing.slug, {
        name: editing.name, baseUrl: editing.baseUrl, sitemapUrl: editing.sitemapUrl,
        feedUrl: editing.feedUrl, platform: editing.platform, requiresJs: !!editing.requiresJs,
        categories: editing.categories ? (Array.isArray(editing.categories) ? editing.categories : String(editing.categories).split(',').map(s => s.trim())) : [],
      });
      setEditing(null);
      await load();
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      {loadError && (
        <div className="flex items-center gap-2 p-3 bg-red/10 border border-red/30 rounded-xl text-sm text-red">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}
      {/* Diagnostics: live row counts + force reseed (for the "everything shows 0" bug) */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-cream-soft border border-line rounded-xl text-xs">
        {diag ? (
          <span className="font-mono text-ink/80">
            shops: <b>{String(diag.shops)}</b> · sellers: <b>{String(diag.sellers)}</b> · products: <b>{String(diag.products)}</b>
            {diag.shopSeed && <> · seed: {String(diag.shopSeed)}/{String(diag.sellerSeed)}</>}
          </span>
        ) : (
          <span className="text-gray">DB counts unavailable</span>
        )}
        <button
          onClick={reseed}
          disabled={reseeding}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink text-cream font-semibold hover:bg-ink/90 disabled:opacity-50"
          title="Re-run the shops/sellers/trust seeders now"
        >
          <DatabaseZap className={`w-3.5 h-3.5 ${reseeding ? 'animate-pulse' : ''}`} /> {reseeding ? 'Reseeding…' : 'Reseed directories'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {['all', 'active', 'degraded', 'dormant', 'failing'].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f ? 'bg-ink text-cream border-ink' : 'bg-white text-ink border-line hover:border-ink'
            }`}
          >
            {f} {filter === f && `(${total})`}
          </button>
        ))}
        
        <div className="flex-1 min-w-[200px] ml-4">
          <input 
            type="text" 
            placeholder="Search shops..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-line rounded-lg text-xs"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
          className="px-3 py-1.5 bg-white border border-line rounded-lg text-xs"
        >
          <option value="name">Sort by Name</option>
          <option value="products">Sort by Products</option>
        </select>

        <span className="text-xs text-gray ml-auto">
          {shops.length === 0 ? '0' : `${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + shops.length}`} of {total.toLocaleString()}
        </span>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-cream-soft border border-line rounded-xl text-sm">
          <span className="font-semibold">{selected.size} selected</span>
          <button onClick={bulkEnable} disabled={busy === 'bulk'} className="px-3 py-1 rounded-full bg-green text-white text-xs font-semibold hover:bg-green/90 disabled:opacity-50">
            Enable
          </button>
          <button onClick={bulkDisable} disabled={busy === 'bulk'} className="px-3 py-1 rounded-full bg-red text-white text-xs font-semibold hover:bg-red/90 disabled:opacity-50">
            Block
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray hover:text-ink">clear</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray border-b border-line">
              <th className="py-2 pr-2 w-6"></th>
              <th className="py-2 pr-3">Shop</th>
              <th className="py-2 pr-3" title="Sitemap · Feed · JavaScript">Sources</th>
              <th className="py-2 pr-3">Health</th>
              <th className="py-2 pr-3">Last run</th>
              <th className="py-2 pr-3 text-right">Products</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => {
              const badge = HEALTH_BADGE[s.health] || HEALTH_BADGE.dormant;
              const Icon = badge.icon;
              return (
                <tr key={s.slug} className="border-b border-line/50 hover:bg-cream-soft/50">
                  <td className="py-2 pr-2">
                    <input type="checkbox" checked={selected.has(s.slug)} onChange={() => toggleSelect(s.slug)} />
                  </td>
                  <td className="py-2 pr-3">
                    <div className="font-semibold">{s.name}</div>
                    <a href={s.baseUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray hover:text-ink block">
                      {s.baseUrl?.replace(/^https?:\/\//, '')}
                    </a>
                    {s.lastError && (
                      <div className="text-[10px] text-red mt-1 line-clamp-2">{s.lastError}</div>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      {s.sitemapUrl ? (
                        <a href={s.sitemapUrl} target="_blank" rel="noopener noreferrer" className="text-green hover:opacity-70" title={`Sitemap: ${s.sitemapUrl}`}>
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-gray/25" title="No sitemap — click Edit to add one">
                          <FileText className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className={s.feedUrl ? 'text-green' : 'text-gray/25'} title={s.feedUrl ? `Feed: ${s.feedUrl}` : 'No product feed'}>
                        <Rss className="w-3.5 h-3.5" />
                      </span>
                      <span className={s.requiresJs ? 'text-yellow' : 'text-gray/25'} title={s.requiresJs ? 'Requires JavaScript (Playwright render)' : 'Static HTML — no JS needed'}>
                        <Zap className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${badge.color}`}>
                      <Icon className="w-3 h-3" /> {s.health || 'active'}
                    </span>
                    {s.status && s.status !== 'active' && (
                      <div className="mt-1">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-red/15 text-red"
                          title={s.blockedBy === 'operator'
                            ? 'Hidden by you — products excluded from public search until re-enabled'
                            : 'Auto-blocked by the health rule — may self-revive when the site recovers'}
                        >
                          <EyeOff className="w-3 h-3" /> hidden{s.blockedBy === 'operator' ? ' · you' : s.blockedBy === 'auto' ? ' · auto' : ''}
                        </span>
                      </div>
                    )}
                    {s.consecutiveFailures > 0 && (
                      <div className="text-[10px] text-red mt-1">{s.consecutiveFailures} fails</div>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-xs text-gray">
                    {s.lastIndexedAt ? new Date(s.lastIndexedAt).toLocaleString() : '—'}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono" title={`In catalog now: ${(s.catalogCount ?? 0).toLocaleString()} · last crawl found: ${(s.lastIndexedCount ?? 0).toLocaleString()}`}>
                    {(s.catalogCount ?? s.lastIndexedCount ?? 0).toLocaleString()}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setEditing({ ...s, categories: (Array.isArray(s.categories) ? s.categories : []).join(', ') })}
                        className="p-1.5 rounded-full hover:bg-ink/10 text-ink"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reindex(s.slug)}
                        disabled={busy === 'reindex:' + s.slug}
                        className="p-1.5 rounded-full hover:bg-ink/10 text-ink disabled:opacity-50"
                        title="Reindex shop"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      {s.feedUrl && (
                        <button
                          onClick={() => syncFeed(s.slug)}
                          disabled={busy === 'feed:' + s.slug}
                          className="p-1.5 rounded-full hover:bg-green/15 text-green disabled:opacity-50"
                          title="Pull this shop's product feed now"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => flipStatus(s.slug, s.status)}
                        disabled={busy === 'status:' + s.slug}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
                          s.status === 'active'
                            ? 'bg-white text-red border-red/40 hover:bg-red hover:text-white'
                            : 'bg-green text-white border-green hover:bg-green/90'
                        }`}
                        title={s.status === 'active'
                          ? 'Hide this shop — stops crawling AND removes its products from public search + homepage'
                          : 'Show this shop — resumes crawling and its products reappear everywhere'}
                      >
                        {s.status === 'active'
                          ? <><EyeOff className="w-3 h-3" /> Hide</>
                          : <><Eye className="w-3 h-3" /> Show</>}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((x) => Math.max(0, x - 1))}
            disabled={page === 0}
            className="text-sm px-3 py-1.5 rounded-full border border-line hover:border-ink disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs text-gray font-mono">
            page {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
          </span>
          <button
            onClick={() => setPage((x) => x + 1)}
            disabled={(page + 1) * PAGE_SIZE >= total}
            className="text-sm px-3 py-1.5 rounded-full border border-line hover:border-ink disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-cream rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-semibold">Edit shop · {editing.slug}</h3>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-full hover:bg-ink/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Base URL" value={editing.baseUrl} onChange={(v) => setEditing({ ...editing, baseUrl: v })} />
              <Field label="Sitemap URL" value={editing.sitemapUrl || ''} onChange={(v) => setEditing({ ...editing, sitemapUrl: v })} />
              <Field label="Feed URL (Shopify products.json / Google Merchant XML)" value={editing.feedUrl || ''} onChange={(v) => setEditing({ ...editing, feedUrl: v })} />
              <Field label="Platform" value={editing.platform || ''} onChange={(v) => setEditing({ ...editing, platform: v })} />
              <Field label="Categories (comma-sep)" value={editing.categories} onChange={(v) => setEditing({ ...editing, categories: v })} />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing.requiresJs} onChange={(e) => setEditing({ ...editing, requiresJs: e.target.checked })} />
                Requires JavaScript (use Playwright)
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-full border border-line text-sm hover:border-ink">Cancel</button>
              <button onClick={saveEdit} disabled={busy === 'edit'} className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-ink text-cream font-semibold text-sm hover:bg-red disabled:opacity-50">
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wider text-gray mb-1">{label}</span>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 bg-white border border-line rounded-lg text-sm" />
    </label>
  );
}
