/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, CloudDownload, Play, RefreshCw, RotateCw, Square, Terminal } from 'lucide-react';
import { crawlerAction, crawlerLogs, crawlerStatus } from '../../api/admin';

const errorMessage = (error) =>
  error?.response?.data?.error ||
  error?.response?.data?.detail ||
  `Crawler control is unavailable (${error?.response?.status || 'network error'}).`;

export default function AdminCrawler() {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState('');
  const [lines, setLines] = useState(300);
  const [busy, setBusy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const logView = useRef(null);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [statusResponse, logResponse] = await Promise.all([
        crawlerStatus(),
        crawlerLogs(lines),
      ]);
      setStatus(statusResponse.data);
      setLogs(logResponse.data?.logs || 'No crawler logs yet.');
      setError('');
      setUpdatedAt(new Date());
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [lines]);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => refresh(true), 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (logView.current) logView.current.scrollTop = logView.current.scrollHeight;
  }, [logs]);

  const runAction = async (action) => {
    const prompts = {
      stop: 'Stop the Python crawler?',
      restart: 'Restart the Python crawler?',
      deploy: 'Deploy the latest crawler from main? It will smoke-test and restart automatically.',
    };
    if (prompts[action] && !confirm(prompts[action])) return;
    setBusy(action);
    try {
      await crawlerAction(action);
      setError('');
      if (action === 'deploy') {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        await refresh(true);
      } else {
        setTimeout(() => refresh(true), 800);
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(null);
    }
  };

  const active = Boolean(status?.active);

  return (
    <div className="space-y-4">
      <section className="card-soft overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-4 sm:p-5">
          <div>
            <h2 className="font-serif text-xl font-semibold inline-flex items-center gap-2">
              <Activity className="h-5 w-5" /> Python crawler
            </h2>
            <p className="mt-1 text-xs text-gray">Remote service control · refreshes every 5 seconds</p>
          </div>
          <div
            role="status"
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs font-bold ${
              active ? 'bg-acid/20 text-ink' : 'bg-red/10 text-red'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${active ? 'bg-acid animate-pulse' : 'bg-red'}`} />
            {loading ? 'Checking' : active ? 'Running' : status ? 'Stopped' : 'Unavailable'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
          <Stat label="State" value={status ? `${status.state} / ${status.subState}` : '—'} />
          <Stat label="PID" value={status?.pid || '—'} />
          <Stat label="Memory" value={formatMemory(status?.memoryBytes)} />
          <Stat label="Restarts" value={status?.restarts ?? '—'} />
          <Stat label="Version" value={status?.version || '—'} />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line p-4 sm:p-5">
          <ActionButton
            icon={Play}
            label="Start"
            onClick={() => runAction('start')}
            disabled={active || Boolean(busy)}
            busy={busy === 'start'}
          />
          <ActionButton
            icon={Square}
            label="Stop"
            onClick={() => runAction('stop')}
            disabled={!active || Boolean(busy)}
            busy={busy === 'stop'}
          />
          <ActionButton
            icon={RotateCw}
            label="Restart"
            onClick={() => runAction('restart')}
            disabled={!active || Boolean(busy)}
            busy={busy === 'restart'}
          />
          <ActionButton
            icon={CloudDownload}
            label="Deploy latest"
            onClick={() => runAction('deploy')}
            disabled={Boolean(busy)}
            busy={busy === 'deploy'}
          />
          {status?.startedAt && (
            <span className="ml-auto text-[11px] text-gray">Started {status.startedAt}</span>
          )}
        </div>

        {error && (
          <p role="alert" className="border-t border-red/20 bg-red/10 px-4 py-3 text-sm font-semibold text-red sm:px-5">
            {error}
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-ink bg-ink shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 px-4 py-3 text-cream">
          <h3 className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <Terminal className="h-4 w-4 text-acid" /> Crawler journal
          </h3>
          <div className="flex items-center gap-2">
            <label className="font-mono text-[11px] text-cream/65">
              Lines
              <select
                value={lines}
                onChange={(event) => setLines(Number(event.target.value))}
                className="ml-2 rounded-lg border border-white/20 bg-ink px-2 py-1 text-cream outline-none focus:border-acid"
              >
                <option value={100}>100</option>
                <option value={300}>300</option>
                <option value={1000}>1000</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold hover:border-acid hover:text-acid disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
        <pre
          ref={logView}
          tabIndex={0}
          aria-label="Crawler service logs"
          className="min-h-80 max-h-[60vh] overflow-auto whitespace-pre-wrap break-words border-l-4 border-acid p-4 font-mono text-[11px] leading-5 text-cream/85 sm:p-5 sm:text-xs"
        >
          {loading && !logs ? 'Loading crawler journal…' : logs || 'No crawler logs yet.'}
        </pre>
        <div className="border-t border-white/10 px-4 py-2 text-right font-mono text-[10px] text-cream/45">
          {updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : 'Waiting for first update'}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-cream-soft p-3 sm:p-4">
      <div className="font-mono text-[10px] uppercase tracking-wider text-gray">{label}</div>
      <div className="mt-1 truncate font-mono text-sm font-bold text-ink" title={String(value)}>{value}</div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, disabled, busy }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-red disabled:cursor-not-allowed disabled:opacity-35"
    >
      <Icon className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
      {busy ? 'Working…' : label}
    </button>
  );
}

function formatMemory(bytes) {
  if (!bytes) return '—';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
