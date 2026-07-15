/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { diagCollections, reseedDirectories } from '../../api/admin';
import {
  Settings, Database, HardDrive, Clock, RefreshCw, Loader2,
  CheckCircle2, AlertTriangle, ArrowRight, Layers,
} from 'lucide-react';

export default function AdminSettings() {
  const [diag, setDiag] = useState(null);
  const [diagLoading, setDiagLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);
  const [reseedResult, setReseedResult] = useState(null);

  const loadDiag = () => {
    setDiagLoading(true);
    diagCollections()
      .then((r) => setDiag(r.data))
      .catch(() => setDiag(null))
      .finally(() => setDiagLoading(false));
  };

  useEffect(() => { loadDiag(); }, []);

  const reseed = async () => {
    if (!confirm('Force reseed all directories? This reloads shop/seller/trust data from the config files.')) return;
    setReseeding(true);
    setReseedResult(null);
    try {
      const { data } = await reseedDirectories();
      setReseedResult(data);
      loadDiag(); // refresh counts
    } catch (e) {
      setReseedResult({ error: e.response?.data?.error || 'Reseed failed' });
    } finally {
      setReseeding(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">System diagnostics, directory maintenance, and quick links.</p>
      </div>

      {/* Collection counts */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Collection counts</h2>
            <p className="text-xs text-gray-500">Live row counts from each MongoDB collection</p>
          </div>
          <button
            onClick={loadDiag}
            disabled={diagLoading}
            className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${diagLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {diagLoading && !diag ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : diag ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CountCard label="Products" value={diag.products} color="orange" />
            <CountCard label="Shops" value={diag.shops} color="blue" />
            <CountCard label="Sellers" value={diag.sellers} color="green" />
            <CountCard label="Pending offers" value={diag.pendingOffers} color="violet" />
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Could not load collection counts.</p>
        )}
      </div>

      {/* Reseed */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Directory seed</h2>
            <p className="text-xs text-gray-500">Force-reload shop, seller, and trust directories from config files</p>
          </div>
        </div>

        <button
          onClick={reseed}
          disabled={reseeding}
          className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition shadow-sm disabled:opacity-50"
        >
          {reseeding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Reseeding…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" /> Reseed directories
            </>
          )}
        </button>

        {reseedResult && (
          <div className={`mt-4 rounded-xl p-4 text-sm ${reseedResult.error ? 'bg-red-50 text-red' : 'bg-green-50 text-green'}`}>
            {reseedResult.error ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{reseedResult.error}</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Seed results:</span>
                </div>
                {Object.entries(reseedResult).map(([key, val]) => (
                  <span key={key} className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-white px-2.5 py-1 text-xs font-mono">
                    <span className="text-gray-500">{key}</span>
                    <span className="font-bold">{String(val)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickLink
            to="/admin/cache"
            icon={HardDrive}
            label="Cache"
            description="Flush caches and view hit rates"
          />
          <QuickLink
            to="/admin/jobs"
            icon={Clock}
            label="Background jobs"
            description="Run and inspect scheduled tasks"
          />
          <QuickLink
            to="/admin/audit"
            icon={Settings}
            label="Audit log"
            description="Admin activity and request history"
          />
        </div>
      </div>
    </div>
  );
}

function CountCard({ label, value, color }) {
  const colorMap = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colorMap[color] || colorMap.orange}`}>
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-2 font-mono">
        {typeof value === 'number' ? value.toLocaleString() : String(value ?? '—')}
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/50"
    >
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-50 group-hover:bg-orange-100 flex items-center justify-center text-gray-400 group-hover:text-orange-500 transition">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 truncate">{description}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 transition shrink-0" />
    </Link>
  );
}
