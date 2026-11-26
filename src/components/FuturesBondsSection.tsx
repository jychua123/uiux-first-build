import React, { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  EconomicEvent,
  MarketSymbol,
  YieldCurvePoint,
} from '../types/markets';
import { formatPrice } from '../data/marketsData';
import { Sparkline } from './Sparkline';

interface FuturesBondsSectionProps {
  symbols: MarketSymbol[];
  yieldCurve: YieldCurvePoint[];
  economicEvents: EconomicEvent[];
  onInspectSymbol: (sym: MarketSymbol) => void;
}

export const FuturesBondsSection: React.FC<FuturesBondsSectionProps> = ({
  symbols,
  yieldCurve,
  economicEvents,
  onInspectSymbol,
}) => {
  const [futuresFilter, setFuturesFilter] = useState<'All' | 'Metals' | 'Energy' | 'Index Futures'>('All');
  const [impactFilter, setImpactFilter] = useState<'All' | 'High' | 'Today'>('All');
  const [hoverYieldIdx, setHoverYieldIdx] = useState<number | null>(null);

  const futures = useMemo(() => {
    const all = symbols.filter((s) => s.category === 'Futures');
    if (futuresFilter === 'All') return all;
    return all.filter((s) => s.subGroup === futuresFilter);
  }, [symbols, futuresFilter]);

  const bonds = useMemo(() => symbols.filter((s) => s.category === 'Bonds'), [symbols]);

  const filteredEvents = useMemo(() => {
    if (impactFilter === 'High') return economicEvents.filter((e) => e.impact === 'High');
    if (impactFilter === 'Today') return economicEvents.filter((e) => e.dateLabel === 'Today');
    return economicEvents;
  }, [economicEvents, impactFilter]);

  // Yield Curve SVG geometry
  const ycW = 460;
  const ycH = 190;
  const ycPad = { top: 18, right: 20, bottom: 26, left: 36 };
  const plotW = ycW - ycPad.left - ycPad.right;
  const plotH = ycH - ycPad.top - ycPad.bottom;

  const { ycMin, ycMax } = useMemo(() => {
    const allVals = yieldCurve.flatMap((p) => [p.current, p.oneMonthAgo, p.oneYearAgo]);
    const min = Math.floor((Math.min(...allVals) - 0.15) * 10) / 10;
    const max = Math.ceil((Math.max(...allVals) + 0.15) * 10) / 10;
    return { ycMin: min, ycMax: max };
  }, [yieldCurve]);

  const xYc = (i: number) =>
    ycPad.left + (i / Math.max(yieldCurve.length - 1, 1)) * plotW;
  const yYc = (v: number) =>
    ycPad.top + plotH - ((v - ycMin) / (ycMax - ycMin || 1)) * plotH;

  const buildPath = (key: 'current' | 'oneMonthAgo' | 'oneYearAgo') =>
    yieldCurve
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xYc(i).toFixed(1)} ${yYc(pt[key]).toFixed(1)}`)
      .join(' ');

  const hoveredYield = hoverYieldIdx !== null ? yieldCurve[hoverYieldIdx] : yieldCurve[6];

  return (
    <section id="futures-bonds-section" className="scroll-mt-32 pt-10 space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Futures & Commodities (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-[#131722] dark:text-white">
                Futures &amp; commodities
              </h2>
              <p className="text-xs text-[#6A6D78] dark:text-[#868993]">
                Precious metals, energy benchmarks, industrial copper, and index futures.
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#181C27] p-0.5">
              {(['All', 'Metals', 'Energy', 'Index Futures'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFuturesFilter(tab)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    futuresFilter === tab
                      ? 'bg-white dark:bg-[#2A2E39] text-[#131722] dark:text-white shadow-xs'
                      : 'text-[#6A6D78] dark:text-[#9598A1]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E0E3EB]/80 dark:border-[#2A2E39]/80 text-[11px] font-semibold uppercase tracking-wider text-[#6A6D78] dark:text-[#868993]">
                  <th className="py-2 pr-2">Contract</th>
                  <th className="py-2 px-2 text-right">Last</th>
                  <th className="py-2 px-2 text-right">Chg %</th>
                  <th className="py-2 px-2 text-right hidden sm:table-cell">Vol</th>
                  <th className="py-2 pl-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E3EB]/60 dark:divide-[#2A2E39]/60 text-xs">
                {futures.map((sym) => {
                  const up = sym.changePercent >= 0;
                  return (
                    <tr
                      key={sym.id}
                      onClick={() => onInspectSymbol(sym)}
                      className="group cursor-pointer hover:bg-[#F0F3FA]/70 dark:hover:bg-[#2A2E39]/50 transition-colors"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: sym.badgeColor }}
                          >
                            {sym.badgeText}
                          </span>
                          <div>
                            <div className="font-mono font-bold text-[#131722] dark:text-white group-hover:text-[#2962FF] flex items-center gap-1">
                              <span>{sym.ticker}</span>
                              <span className="font-sans text-[10px] font-normal text-[#6A6D78]">
                                {sym.exchange}
                              </span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[11px] text-[#6A6D78] dark:text-[#868993]">
                              {sym.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-[#131722] dark:text-[#F0F3FA] tabular-nums">
                        {formatPrice(sym.price, sym.decimals)}
                        {sym.unit && (
                          <div className="text-[10px] font-normal text-[#868993]">
                            {sym.unit}
                          </div>
                        )}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right font-mono font-semibold tabular-nums ${
                          up ? 'text-[#089981]' : 'text-[#F23645]'
                        }`}
                      >
                        {up ? '▲ +' : '▼ '}
                        {sym.changePercent.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-[#6A6D78] dark:text-[#9598A1] tabular-nums hidden sm:table-cell">
                        {sym.volume}
                      </td>
                      <td className="py-2 pl-2">
                        <div className="flex justify-end">
                          <Sparkline data={sym.sparkline} positive={up} width={68} height={22} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bonds & US Treasury Yield Curve (6 cols) */}
        <div
          id="bonds-panel"
          className="scroll-mt-32 lg:col-span-6 rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-[#131722] dark:text-white">
                Bonds &amp; yield curve
              </h2>
              <p className="text-xs text-[#6A6D78] dark:text-[#868993]">
                U.S. Treasury maturity curve and global 10-year sovereign yields.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-[#2962FF]">
                <span className="h-0.5 w-3 bg-[#2962FF] inline-block" />
                Current
              </span>
              <span className="flex items-center gap-1.5 text-[#089981]">
                <span className="h-0.5 w-3 bg-[#089981] inline-block" />
                1M Ago
              </span>
              <span className="flex items-center gap-1.5 text-[#868993]">
                <span className="h-0.5 w-3 bg-[#868993] inline-block" />
                1Y Ago
              </span>
            </div>
          </div>

          {/* Interactive Yield Curve Readout + SVG */}
          <div className="mt-3 rounded-lg bg-[#F8F9FD] dark:bg-[#181C27] p-3">
            {hoveredYield && (
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs font-mono tabular-nums">
                <span className="font-bold text-[#131722] dark:text-white">
                  US {hoveredYield.maturity} Treasury
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-[#2962FF] font-semibold">
                    Now: {hoveredYield.current.toFixed(2)}%
                  </span>
                  <span className="text-[#089981]">
                    1M: {hoveredYield.oneMonthAgo.toFixed(2)}%
                  </span>
                  <span className="text-[#6A6D78] dark:text-[#868993]">
                    1Y: {hoveredYield.oneYearAgo.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            <svg viewBox={`0 0 ${ycW} ${ycH}`} className="w-full h-auto">
              {[0, 0.33, 0.66, 1].map((t, idx) => {
                const v = ycMin + (ycMax - ycMin) * t;
                const y = yYc(v);
                return (
                  <g key={idx}>
                    <line
                      x1={ycPad.left}
                      y1={y}
                      x2={ycPad.left + plotW}
                      y2={y}
                      className="stroke-[#E0E3EB] dark:stroke-[#2A2E39]"
                      strokeWidth="1"
                    />
                    <text
                      x={ycPad.left - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-[#6A6D78] dark:fill-[#868993] text-[9.5px] font-mono tabular-nums"
                    >
                      {v.toFixed(1)}%
                    </text>
                  </g>
                );
              })}

              <path
                d={buildPath('oneYearAgo')}
                fill="none"
                stroke="#868993"
                strokeWidth="1.4"
                strokeDasharray="3 3"
              />
              <path
                d={buildPath('oneMonthAgo')}
                fill="none"
                stroke="#089981"
                strokeWidth="1.6"
              />
              <path
                d={buildPath('current')}
                fill="none"
                stroke="#2962FF"
                strokeWidth="2.3"
              />

              {yieldCurve.map((pt, i) => {
                const x = xYc(i);
                const y = yYc(pt.current);
                const active = hoverYieldIdx === i;
                return (
                  <g
                    key={pt.maturity}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverYieldIdx(i)}
                    onMouseLeave={() => setHoverYieldIdx(null)}
                  >
                    <rect
                      x={x - 16}
                      y={ycPad.top}
                      width="32"
                      height={plotH}
                      fill="transparent"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 4.5 : 3}
                      fill="#2962FF"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      x={x}
                      y={ycH - 6}
                      textAnchor="middle"
                      className={`text-[10px] font-mono ${
                        active
                          ? 'fill-[#2962FF] font-bold'
                          : 'fill-[#6A6D78] dark:fill-[#868993]'
                      }`}
                    >
                      {pt.maturity}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Sovereign Yields Quick Grid */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bonds.map((sym) => {
              const up = sym.changePercent >= 0;
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => onInspectSymbol(sym)}
                  className="flex items-center justify-between rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] px-3 py-2 text-left hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold text-[#131722] dark:text-white">
                      {sym.ticker}
                    </div>
                    <div className="truncate text-[11px] text-[#6A6D78] dark:text-[#868993]">
                      {sym.name}
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums shrink-0 pl-2">
                    <div className="text-xs font-bold text-[#131722] dark:text-white">
                      {sym.price.toFixed(3)}%
                    </div>
                    <div
                      className={`text-[11px] font-semibold ${
                        up ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}
                    >
                      {up ? '+' : ''}
                      {sym.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Economic Calendar Strip */}
      <div
        id="calendar-panel"
        className="scroll-mt-32 rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#131722] dark:text-white">
              Economic calendar
            </h2>
            <p className="text-xs text-[#6A6D78] dark:text-[#868993]">
              Key macroeconomic releases, inflation prints, and central bank events.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#181C27] p-0.5">
            {(['All', 'High', 'Today'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setImpactFilter(f)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  impactFilter === f
                    ? 'bg-white dark:bg-[#2A2E39] text-[#131722] dark:text-white shadow-xs'
                    : 'text-[#6A6D78] dark:text-[#9598A1]'
                }`}
              >
                {f === 'High' ? 'High Impact' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E3EB]/80 dark:border-[#2A2E39]/80 text-[11px] font-semibold uppercase tracking-wider text-[#6A6D78] dark:text-[#868993]">
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 px-2">Cur</th>
                <th className="py-2 px-2">Event</th>
                <th className="py-2 px-2">Impact</th>
                <th className="py-2 px-2 text-right">Actual</th>
                <th className="py-2 px-2 text-right">Forecast</th>
                <th className="py-2 pl-2 text-right">Prior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3EB]/60 dark:divide-[#2A2E39]/60 text-xs">
              {filteredEvents.map((ev) => (
                <tr
                  key={ev.id}
                  className="hover:bg-[#F0F3FA]/60 dark:hover:bg-[#2A2E39]/40 transition-colors"
                >
                  <td className="py-2.5 pr-3 font-mono text-[#6A6D78] dark:text-[#9598A1] tabular-nums whitespace-nowrap">
                    {ev.dateLabel} · {ev.time}
                  </td>
                  <td className="py-2.5 px-2 font-mono font-bold text-[#131722] dark:text-white">
                    {ev.currency}
                  </td>
                  <td className="py-2.5 px-2 font-medium text-[#131722] dark:text-[#E2E8F0]">
                    {ev.event}
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span
                      className={`font-semibold ${
                        ev.impact === 'High'
                          ? 'text-[#F23645]'
                          : ev.impact === 'Medium'
                          ? 'text-[#D97706]'
                          : 'text-[#6A6D78] dark:text-[#868993]'
                      }`}
                    >
                      {ev.impact}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-[#131722] dark:text-white tabular-nums">
                    {ev.actual}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-[#6A6D78] dark:text-[#9598A1] tabular-nums">
                    {ev.forecast}
                  </td>
                  <td className="py-2.5 pl-2 text-right font-mono text-[#6A6D78] dark:text-[#9598A1] tabular-nums">
                    {ev.prior}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
