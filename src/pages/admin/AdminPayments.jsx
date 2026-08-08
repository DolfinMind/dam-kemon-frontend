/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, AppWindow, BadgeDollarSign, CheckCircle2, CircleDollarSign,
  ExternalLink, KeyRound, Loader2, Package, RefreshCw, ShieldCheck,
  Webhook, XCircle,
} from 'lucide-react';
import {
  disablePaymentLicense, ensurePaymentWebhook, getPaymentOverview, getPaymentProviderStatus,
  listPaymentApplications, listPaymentProducts, listPaymentProviderCatalog,
  listPaymentRecords, listPaymentWebhooks, refundPaymentOrder,
} from '../../api/payments';

const RESOURCES = [
  { id: 'checkouts', label: 'Checkouts' },
  { id: 'orders', label: 'Orders' },
  { id: 'licenses', label: 'Licenses' },
  { id: 'entitlements', label: 'Entitlements' },
  { id: 'webhook-events', label: 'Webhook events' },
];

const compactId = (value) => {
  if (value == null || value === '') return '—';
  const text = String(value);
  return text.length > 17 ? `${text.slice(0, 8)}…${text.slice(-6)}` : text;
};
const dateTime = (value) => value ? new Date(value).toLocaleString() : '—';
const number = (value) => Number(value || 0).toLocaleString();
const money = (value, currency = 'USD') => {
  if (value == null) return '—';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount); } catch { return `${amount.toFixed(2)} ${currency}`; }
};
const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

function Status({ value }) {
  const text = String(value || 'unknown').replaceAll('_', ' ');
  const good = /active|paid|completed|succeeded|delivered|enabled|verified/.test(text.toLowerCase());
  const bad = /fail|error|refund|disabled|revoked|expired/.test(text.toLowerCase());
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${good ? 'bg-emerald-50 text-emerald-700' : bad ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{text}</span>;
}

function Metric({ label, value, icon: Icon, tone = 'orange', hint }) {
  const tones = { orange: 'bg-orange-50 text-orange-500', green: 'bg-emerald-50 text-emerald-600', violet: 'bg-violet-50 text-violet-600', blue: 'bg-sky-50 text-sky-600' };
  return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-gray-950">{value}</p></div><div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div></div>
    {hint && <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-400">{hint}</p>}
  </div>;
}

function DataTable({ resource, rows, onRefund, onDisable }) {
  if (!rows.length) return <div className="rounded-xl border border-dashed border-gray-200 px-5 py-10 text-center text-sm text-gray-400">No {resource} recorded in this mode yet.</div>;
  return <div className="overflow-x-auto rounded-xl border border-gray-100"><table className="min-w-full text-left text-xs"><thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500"><tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Application / product</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Amount / detail</th><th className="px-4 py-3">Updated</th>{(resource === 'orders' || resource === 'licenses') && <th className="px-4 py-3 text-right">Action</th>}</tr></thead><tbody className="divide-y divide-gray-100 bg-white">{rows.map((row, index) => {
    const id = first(row.id, row.orderId, row.checkoutId, row.licenseId, row.eventId, `${resource}-${index}`);
    const app = first(row.applicationName, row.applicationId, row.appId, row.productName, row.productId, '—');
    const status = first(row.status, row.state, row.eventName, row.type);
    const detail = resource === 'orders' ? money(Number(first(row.total, row.amount, row.totalAmount, 0)) / 100, first(row.currency, row.currencyCode, 'USD')) : first(row.eventName, row.activationLimit != null ? `${row.activationUsage || 0}/${row.activationLimit} activations` : row.providerId, row.providerReference, '—');
    const updated = first(row.updatedAt, row.createdAt, row.occurredAt, row.receivedAt);
    return <tr key={String(id)} className="text-gray-700"><td className="px-4 py-3 font-mono text-[11px]" title={String(id)}>{compactId(id)}</td><td className="max-w-[190px] px-4 py-3 font-medium">{app}</td><td className="px-4 py-3"><Status value={status} /></td><td className="px-4 py-3 whitespace-nowrap">{detail}</td><td className="px-4 py-3 whitespace-nowrap text-gray-500">{dateTime(updated)}</td>{resource === 'orders' && <td className="px-4 py-3 text-right"><button onClick={() => onRefund(row)} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Refund</button></td>}{resource === 'licenses' && <td className="px-4 py-3 text-right"><button onClick={() => onDisable(row)} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Disable</button></td>}</tr>;
  })}</tbody></table></div>;
}

function ConfirmAction({ action, onClose, onConfirm, working }) {
  const [confirmation, setConfirmation] = useState('');
  useEffect(() => setConfirmation(''), [action]);
  if (!action) return null;
  const phrase = action.kind === 'refund' ? 'REFUND' : 'DISABLE';
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4" role="presentation"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="payment-confirm-title"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600"><AlertTriangle className="h-5 w-5" /></div><div><h2 id="payment-confirm-title" className="font-bold text-gray-950">{action.kind === 'refund' ? 'Refund this order?' : 'Disable this license?'}</h2><p className="mt-1 text-sm leading-6 text-gray-600">{action.kind === 'refund' ? 'This requests a provider refund and may revoke access. It cannot be undone from this panel.' : 'This removes payment access for this license. Re-enabling requires a separate audited operator action.'}</p></div></div><p className="mt-5 text-xs text-gray-500">Provider reference: <span className="font-mono text-gray-700">{compactId(action.id)}</span></p><label className="mt-5 block text-sm font-medium text-gray-800">Type the exact provider reference to continue<input autoFocus value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" /></label><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} disabled={working} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button><button onClick={onConfirm} disabled={working || confirmation !== action.id} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">{working && <Loader2 className="h-4 w-4 animate-spin" />}Confirm {phrase.toLowerCase()}</button></div></div></div>;
}

export default function AdminPayments() {
  const [testMode, setTestMode] = useState(true);
  const [tab, setTab] = useState('checkouts');
  const [overview, setOverview] = useState(null);
  const [provider, setProvider] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState('');
  const [products, setProducts] = useState([]);
  const [records, setRecords] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState(null);
  const [actionWorking, setActionWorking] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const load = useCallback(async () => {
    setError('');
    const appId = selectedApp;
    const requests = [getPaymentOverview(appId || undefined, testMode), getPaymentProviderStatus(testMode), appId ? listPaymentProducts(appId) : Promise.resolve({ data: [] }), listPaymentRecords(tab, appId || undefined, testMode)];
    const results = await Promise.allSettled(requests);
    const value = (index, fallback) => results[index]?.status === 'fulfilled' ? results[index].value.data ?? fallback : fallback;
    setOverview(value(0, null)); setProvider(value(1, null)); setProducts(value(2, [])); setRecords(value(3, []));
    const mapped = value(2, []).find((product) => product.testMode === testMode && product.active);
    if (appId && mapped?.storeId) {
      const [catalogResult, webhookResult] = await Promise.allSettled([listPaymentProviderCatalog(appId, mapped.storeId, testMode), listPaymentWebhooks(appId, mapped.storeId, testMode)]);
      setCatalog(catalogResult.status === 'fulfilled' ? catalogResult.value.data : null);
      setWebhooks(webhookResult.status === 'fulfilled' ? webhookResult.value.data : []);
    } else { setCatalog(null); setWebhooks([]); }
    if (!results.some((result) => result.status === 'fulfilled')) setError('Payment data is unavailable. Check the admin session and payment-service configuration.');
  }, [selectedApp, tab, testMode]);

  useEffect(() => {
    listPaymentApplications().then((response) => {
      const items = response.data || [];
      setApplications(items);
      setSelectedApp((current) => current || items[0]?.appId || '');
    }).catch(() => setApplications([]));
  }, []);
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [load]);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const runAction = async () => { if (!action) return; setActionWorking(true); setError(''); try { if (action.kind === 'refund') await refundPaymentOrder(action.id, action.id); else await disablePaymentLicense(action.id, action.id); setAction(null); await load(); } catch (err) { setError(err.response?.data?.message || 'The payment action was rejected. No local status was changed.'); } finally { setActionWorking(false); } };
  const ready = Boolean(provider?.configured && provider?.reachable);
  const stats = overview?.metrics || overview || {};
  const revenue = Array.isArray(stats.revenue) ? stats.revenue[0] : null;
  const events = useMemo(() => Array.isArray(webhooks) ? webhooks : webhooks?.items || [], [webhooks]);
  const providerCatalog = catalog?.products || [];
  const currentRecords = Array.isArray(records) ? records : records?.items || [];
  const visibleApps = Array.isArray(applications) ? applications : applications?.items || [];
  const visibleProducts = (Array.isArray(products) ? products : products?.items || []).filter((product) => product.testMode === testMode);
  const currentProduct = visibleProducts.find((product) => product.testMode === testMode && product.active);
  const ensureWebhook = async () => { if (!currentProduct?.storeId || !selectedApp || !webhookUrl) return; setRefreshing(true); setError(''); try { await ensurePaymentWebhook(selectedApp, currentProduct.storeId, testMode, webhookUrl); await load(); setWebhookUrl(''); } catch (err) { setError(err.response?.data?.message || 'Webhook configuration was rejected. Confirm the exact configured HTTPS URL.'); } finally { setRefreshing(false); } };

  return <div className="space-y-6 animate-fade-in pb-10">
    <section className="relative overflow-hidden rounded-[28px] bg-gray-950 px-6 py-7 text-white shadow-xl shadow-gray-200/60 sm:px-8"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" /><div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div className="max-w-2xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200"><span className={`h-1.5 w-1.5 rounded-full ${ready ? 'bg-emerald-400' : 'bg-amber-300'}`} />Lemon Squeezy operations</div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payments, kept in one safe place</h1><p className="mt-2 text-sm leading-6 text-gray-400">Revenue, delivery, webhook health, applications, and product mappings. License keys, secrets, and customer contact details are intentionally never displayed.</p></div><div className="flex flex-wrap items-center gap-2"><select value={selectedApp} onChange={(event) => setSelectedApp(event.target.value)} className="h-10 max-w-[180px] rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white outline-none"><option value="" className="text-gray-950">All applications</option>{visibleApps.map((app) => <option key={app.appId} value={app.appId} className="text-gray-950">{app.displayName || app.appId}</option>)}</select><div className="rounded-xl border border-white/10 bg-white/5 p-1" role="group" aria-label="Payment environment">{[[true, 'Sandbox'], [false, 'Live']].map(([value, label]) => <button key={label} onClick={() => setTestMode(value)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${testMode === value ? 'bg-white text-gray-950' : 'text-gray-300 hover:bg-white/10'}`}>{label}</button>)}</div><button onClick={refresh} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold hover:bg-orange-400 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh</button></div></div></section>
    {error && <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"><Metric label="Net revenue" value={revenue ? money(Number(revenue.net || 0) / 100, revenue.currency) : '—'} icon={CircleDollarSign} tone="green" hint={testMode ? 'Sandbox totals only' : 'Paid orders less refunds'} /><Metric label="Paid orders" value={number(stats.orders?.primary)} icon={BadgeDollarSign} tone="orange" hint="Provider-confirmed only" /><Metric label="Active licenses" value={number(stats.licenses?.primary)} icon={KeyRound} tone="violet" hint="No full keys are shown" /><Metric label="Webhook health" value={stats.webhooks?.total ? `${Math.round((stats.webhooks.primary / stats.webhooks.total) * 100)}%` : '—'} icon={Webhook} tone="blue" hint="Processed webhook events" /></div>
    <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]"><div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-gray-950">Lifecycle activity</h2><p className="mt-1 text-sm text-gray-500">Filter each operational record independently by sandbox or live mode.</p></div><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{ready ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{ready ? 'Provider ready' : 'Provider not ready'}</span></div><div className="mt-5 flex gap-1 overflow-x-auto border-b border-gray-100 pb-px" role="tablist" aria-label="Payment records">{RESOURCES.map((item) => <button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition ${tab === item.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-950'}`}>{item.label}</button>)}</div><div className="mt-5">{loading ? <div className="py-10 text-center text-sm text-gray-400"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading payment records…</div> : <DataTable resource={tab} rows={currentRecords} onRefund={(row) => setAction({ kind: 'refund', id: row.providerOrderId })} onDisable={(row) => setAction({ kind: 'disable', id: row.providerLicenseId })} />}</div></div><aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" /><h2 className="font-bold text-gray-950">Provider safeguards</h2></div><div className="mt-4 space-y-3 text-sm"><Safety label="Provider API" value={provider?.configured ? 'Configured' : 'Missing'} good={Boolean(provider?.configured)} /><Safety label="Provider connection" value={provider?.reachable ? 'Reachable' : 'Unavailable'} good={Boolean(provider?.reachable)} /><Safety label="Mode" value={testMode ? 'Sandbox only' : 'Live provider data'} good={testMode} /><Safety label="Last provider check" value={dateTime(provider?.checkedAt)} /></div><p className="mt-5 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500">Inbound webhooks are signature-verified by the payment service. This panel never receives provider API keys, webhook secrets, raw payment data, or full license keys.</p></aside></section>
    <section className="grid gap-5 xl:grid-cols-2"><Panel title="Applications" icon={AppWindow} empty="No registered applications yet."><div className="divide-y divide-gray-100">{visibleApps.map((app, index) => <div key={String(first(app.id, app.applicationId, index))} className="flex items-center justify-between gap-4 py-3"><div><p className="font-semibold text-gray-900">{first(app.name, app.applicationId, app.id)}</p><p className="mt-0.5 text-xs text-gray-500">{first(app.publicLicense ? 'Public license flow' : null, app.authMode, app.status, 'Configured')}</p></div><Status value={first(app.status, app.enabled === false ? 'disabled' : 'enabled')} /></div>)}</div></Panel><Panel title="Product mappings" icon={Package} empty="No payment products mapped in this mode yet."><div className="divide-y divide-gray-100">{visibleProducts.map((product, index) => <div key={String(first(product.id, product.productId, index))} className="flex items-center justify-between gap-4 py-3"><div><p className="font-semibold text-gray-900">{first(product.name, product.productName, product.productId)}</p><p className="mt-0.5 font-mono text-[11px] text-gray-500">{compactId(first(product.variantId, product.providerVariantId, product.id))}</p></div><Status value={first(product.status, product.enabled === false ? 'disabled' : 'active')} /></div>)}</div></Panel></section>
    <section className="grid gap-5 xl:grid-cols-2"><Panel title="Provider catalogue" icon={ExternalLink} empty="Select an application with an active product mapping to load the redacted provider catalogue."><div className="divide-y divide-gray-100">{providerCatalog.slice(0, 8).map((item, index) => <div key={String(first(item.id, item.productId, index))} className="flex items-center justify-between gap-4 py-3"><div><p className="font-semibold text-gray-900">{first(item.name, item.productName, 'Unnamed product')}</p><p className="mt-0.5 text-xs text-gray-500">{compactId(first(item.id, item.productId))}</p></div><Status value={first(item.status, 'available')} /></div>)}</div></Panel><Panel title="Webhook destinations" icon={Webhook} empty="No redacted webhook destinations returned for this mode."><div className="divide-y divide-gray-100">{events.slice(0, 8).map((event, index) => <div key={String(first(event.id, event.eventId, index))} className="flex items-center justify-between gap-4 py-3"><div><p className="font-semibold text-gray-900">{event.url || 'Configured destination'}</p><p className="mt-0.5 text-xs text-gray-500">{(event.events || []).join(', ') || dateTime(event.updatedAt)}</p></div><Status value="configured" /></div>)}</div>{currentProduct && selectedApp && <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3"><p className="text-xs leading-5 text-amber-900">To create or repair this mode’s webhook, type the exact HTTPS callback URL configured on the server. The server checks it before writing to Lemon Squeezy.</p><label className="sr-only" htmlFor="payment-webhook-url">Webhook URL</label><input id="payment-webhook-url" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} placeholder="https://example.com/api/payments/v1/webhooks/lemon-squeezy" className="mt-3 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-500" /><button onClick={ensureWebhook} disabled={refreshing || !webhookUrl.startsWith('https://')} className="mt-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50">Ensure webhook</button></div>}</Panel></section>
    <ConfirmAction action={action} onClose={() => !actionWorking && setAction(null)} onConfirm={runAction} working={actionWorking} />
  </div>;
}

function Safety({ label, value, good }) { return <div className="flex items-center justify-between gap-3"><span className="text-gray-500">{label}</span><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${good === undefined ? 'text-gray-700' : good ? 'text-emerald-700' : 'text-amber-700'}`}>{good === undefined ? null : good ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{value}</span></div>; }
function Panel({ title, icon: Icon, empty, children }) { return <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-orange-500" /><h2 className="font-bold text-gray-950">{title}</h2></div><div className="mt-4">{children}</div><p className="sr-only">{empty}</p></section>; }
