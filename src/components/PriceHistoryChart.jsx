import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const ranges = [
  { label: '7d', days: 7, noun: '7-day' },
  { label: '30d', days: 30, noun: '30-day' },
  { label: '90d', days: 90, noun: '90-day' },
  { label: 'All', days: null, noun: 'all-time' },
];

function formatPrice(value) {
  return `৳${Math.round(Number(value)).toLocaleString('en-IN')}`;
}

function dateKey(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function displayDate(value, includeYear = false) {
  if (!value) return '';
  const date = new Date(`${dateKey(value)}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function PriceTooltip({ active, payload, typical }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const difference = row.low - typical;
  const relation = Math.abs(difference) < 1
    ? 'Right at the typical low'
    : `${formatPrice(Math.abs(difference))} ${difference < 0 ? 'below' : 'above'} typical`;

  return (
    <div className="min-w-[190px] rounded-2xl border border-line-strong bg-white p-3.5 shadow-lg">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-gray">
        {displayDate(row.dateKey, true)}
      </p>
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <span className="text-xs text-gray">Lowest shop price</span>
        <span className="font-mono text-sm font-extrabold text-ink">{formatPrice(row.low)}</span>
      </div>
      {row.lowShop && (
        <p className="mt-0.5 text-right text-[11px] font-semibold text-acid-deep">{row.lowShop}</p>
      )}
      {row.marketMin != null && row.marketMax != null && row.marketMax > row.marketMin && (
        <div className="mt-2 border-t border-line pt-2">
          <div className="flex items-center justify-between gap-4 text-[11px] text-gray">
            <span>{row.shopCount} shops ranged</span>
            <span className="font-mono text-ink">
              {formatPrice(row.marketMin)}–{formatPrice(row.marketMax)}
            </span>
          </div>
        </div>
      )}
      <p className="mt-2 rounded-lg bg-cream-soft px-2 py-1.5 text-[10px] font-semibold text-gray">
        {relation}
      </p>
    </div>
  );
}

export default function PriceHistoryChart({ history = [], dailySeries = [] }) {
  const [selectedRange, setSelectedRange] = useState('30d');

  const insight = useMemo(() => {
    const range = ranges.find((item) => item.label === selectedRange) || ranges[1];

    // A daily shop snapshot lets us draw the real market corridor: the cheapest
    // available offer through to the most expensive one, plus the shop at the floor.
    const snapshots = new Map();
    history.forEach((entry) => {
      const key = dateKey(entry.date || entry.recordedAt || entry.scrapedAt);
      const price = Number(entry.price);
      if (!key || !Number.isFinite(price) || price <= 0) return;
      if (!snapshots.has(key)) snapshots.set(key, []);
      snapshots.get(key).push({
        price,
        shop: entry.siteName || entry.site || 'Unknown shop',
      });
    });

    const snapshotDays = [...snapshots.entries()].map(([key, offers]) => {
      const sorted = [...offers].sort((a, b) => a.price - b.price);
      return {
        dateKey: key,
        low: sorted[0].price,
        lowShop: sorted[0].shop,
        marketMin: sorted[0].price,
        marketMax: sorted[sorted.length - 1].price,
        shopCount: new Set(sorted.map((offer) => offer.shop)).size,
      };
    });

    // The daily endpoint has a continuous calendar series, while raw snapshots
    // carry shop identity and the full market spread. Merge both for the best view.
    const byDate = new Map(snapshotDays.map((row) => [row.dateKey, row]));
    dailySeries.forEach((entry) => {
      const key = dateKey(entry.date);
      const price = Number(entry.price);
      if (!key || !Number.isFinite(price) || price <= 0) return;
      const snapshot = byDate.get(key);
      byDate.set(key, {
        dateKey: key,
        low: price,
        lowShop: snapshot?.lowShop || null,
        marketMin: snapshot?.marketMin ?? null,
        marketMax: snapshot?.marketMax ?? null,
        shopCount: snapshot?.shopCount || null,
      });
    });

    let data = [...byDate.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    if (range.days && data.length) {
      const last = new Date(`${data[data.length - 1].dateKey}T00:00:00`);
      const cutoff = new Date(last.getTime() - (range.days - 1) * 86400000);
      data = data.filter((row) => new Date(`${row.dateKey}T00:00:00`) >= cutoff);
    }

    data = data.map((row) => ({
      ...row,
      date: displayDate(row.dateKey),
      corridor: row.marketMin != null && row.marketMax != null
        ? [row.marketMin, row.marketMax]
        : null,
    }));

    if (!data.length) return { data: [], range };

    const lows = data.map((row) => row.low);
    const typical = median(lows);
    const floor = Math.min(...lows);
    const latest = data[data.length - 1];
    const difference = latest.low - typical;
    const percent = typical ? Math.round((Math.abs(difference) / typical) * 100) : 0;
    const atFloor = latest.low <= floor * 1.005;

    const allBounds = data.flatMap((row) => [
      row.marketMin ?? row.low,
      row.marketMax ?? row.low,
    ]);
    const minBound = Math.min(...allBounds);
    const maxBound = Math.max(...allBounds);
    const padding = Math.max((maxBound - minBound) * 0.12, maxBound * 0.035, 1);

    let contextLabel = 'At the usual market low';
    let contextDetail = `Today is close to the median lowest price from the ${range.noun} view.`;
    let contextTone = 'neutral';

    if (percent >= 2) {
      contextLabel = `${formatPrice(Math.abs(difference))} ${difference < 0 ? 'below' : 'above'} the usual low`;
      contextDetail = `Today’s lowest shop price is ${percent}% ${difference < 0 ? 'under' : 'over'} the ${range.noun} median.`;
      contextTone = difference < 0 ? 'good' : 'high';
    }

    return {
      data,
      range,
      typical,
      floor,
      latest,
      atFloor,
      contextLabel,
      contextDetail,
      contextTone,
      domain: [Math.max(0, Math.floor(minBound - padding)), Math.ceil(maxBound + padding)],
      snapshotDayCount: data.filter((row) => row.shopCount).length,
    };
  }, [history, dailySeries, selectedRange]);

  if (!history.length && !dailySeries.length) {
    return (
      <div className="rounded-2xl bg-cream-soft p-7 text-center">
        <p className="font-bold text-ink">Price tracking has just started</p>
        <p className="mt-1 text-xs text-gray">Come back after we collect a few daily shop prices.</p>
      </div>
    );
  }

  const toneClasses = {
    good: 'bg-acid-soft text-acid-deep border-acid/30',
    high: 'bg-yellow-soft text-ink border-yellow/40',
    neutral: 'bg-cream-soft text-ink border-line',
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className="flex flex-col gap-4 border-b border-line px-3 pb-4 pt-1 sm:flex-row sm:items-start sm:justify-between sm:px-1">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-acid-deep">
            Price in context
          </p>
          <h3 className="mt-1 text-lg font-extrabold tracking-[-0.02em] text-ink sm:text-xl">
            Is today’s lowest shop price unusual?
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-gray">
            The line is the cheapest offer each day. The shaded corridor is the gap between shops.
          </p>
        </div>

        <div className="flex w-fit shrink-0 gap-1 rounded-full bg-cream-soft p-1" aria-label="Price history period">
          {ranges.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => setSelectedRange(range.label)}
              aria-pressed={selectedRange === range.label}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] font-bold transition-colors sm:px-3.5 ${
                selectedRange === range.label
                  ? 'bg-ink text-cream shadow-sm'
                  : 'text-gray hover:text-ink'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {insight.data.length > 0 && (
        <>
          <div className="grid gap-2 px-3 py-4 sm:grid-cols-[1fr_1fr_1.5fr] sm:px-1">
            <div className="rounded-2xl border border-line bg-cream-soft/55 px-3.5 py-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-gray">Today’s low</p>
              <p className="mt-1 font-mono text-xl font-extrabold text-ink sm:text-2xl">
                {formatPrice(insight.latest.low)}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-semibold text-gray">
                {insight.latest.lowShop || 'Across tracked shops'}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-cream-soft/55 px-3.5 py-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-gray">Usual lowest</p>
              <p className="mt-1 font-mono text-xl font-extrabold text-ink sm:text-2xl">
                {formatPrice(insight.typical)}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-gray">Median · {insight.range.noun}</p>
            </div>

            <div className={`rounded-2xl border px-3.5 py-3 ${toneClasses[insight.contextTone]}`}>
              <div className="flex h-full flex-col justify-center">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] opacity-65">What changed</p>
                <p className="mt-1 text-sm font-extrabold leading-tight sm:text-base">{insight.contextLabel}</p>
                <p className="mt-1 text-[11px] leading-relaxed opacity-75">{insight.contextDetail}</p>
              </div>
            </div>
          </div>

          <div
            className="h-[230px] w-full sm:h-[300px]"
            role="img"
            aria-label={`Price history for ${insight.range.noun}. Today’s lowest price is ${formatPrice(insight.latest.low)}, compared with a typical lowest price of ${formatPrice(insight.typical)}.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={insight.data} margin={{ top: 18, right: 10, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="marketCorridor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9FE231" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#9FE231" stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(21,19,26,0.065)" strokeDasharray="3 5" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={42}
                  tick={{ fill: '#6B6B6B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={54}
                  domain={insight.domain}
                  tickCount={4}
                  tick={{ fill: '#6B6B6B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(value) => value >= 1000 ? `৳${(value / 1000).toFixed(value % 1000 ? 1 : 0)}k` : `৳${value}`}
                />
                <Tooltip
                  content={<PriceTooltip typical={insight.typical} />}
                  cursor={{ stroke: '#15131A', strokeWidth: 1, strokeDasharray: '3 4', opacity: 0.25 }}
                />
                <Area
                  type="monotone"
                  dataKey="corridor"
                  stroke="#73A724"
                  strokeWidth={1}
                  strokeOpacity={0.25}
                  fill="url(#marketCorridor)"
                  connectNulls
                  isAnimationActive={false}
                />
                <ReferenceLine
                  y={insight.typical}
                  stroke="#6B6B6B"
                  strokeDasharray="5 5"
                  strokeWidth={1.25}
                  label={{
                    value: 'USUAL LOW',
                    position: 'insideTopRight',
                    fill: '#6B6B6B',
                    fontSize: 9,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 700,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  name="Lowest shop price"
                  stroke="#15131A"
                  strokeWidth={3}
                  dot={({ cx, cy, index }) => index === insight.data.length - 1 ? (
                    <g>
                      <circle cx={cx} cy={cy} r="7" fill="#FFFFFF" stroke="#15131A" strokeWidth="2" />
                      <circle cx={cx} cy={cy} r="3.5" fill="#9FE231" />
                    </g>
                  ) : null}
                  activeDot={{ r: 5, fill: '#9FE231', stroke: '#15131A', strokeWidth: 2 }}
                  isAnimationActive={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex flex-col gap-3 border-t border-line px-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-gray">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full bg-ink" /> Lowest shop
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-4 rounded-sm border border-acid-deep/20 bg-acid/20" /> Shop spread
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 border-t border-dashed border-gray" /> Usual low
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-gray sm:text-right">
              {insight.atFloor
                ? `Today matches the lowest price in this ${insight.range.noun} view.`
                : `${formatPrice(insight.latest.low - insight.floor)} above the ${insight.range.noun} floor of ${formatPrice(insight.floor)}.`}
              {insight.snapshotDayCount > 0 && ` Shop spread available for ${insight.snapshotDayCount} tracked days.`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
