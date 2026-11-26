import React, { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';
import { MarketSymbol, TechnicalRating, Timeframe } from '../types/markets';
import { formatPrice } from '../data/marketsData';
import { InteractiveChart } from './InteractiveChart';

interface SymbolInspectorModalProps {
  symbol: MarketSymbol | null;
  onClose: () => void;
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
}

const RATING_ANGLES: Record<TechnicalRating, { angle: number; color: string; buys: number; neutrals: number; sells: number }> = {
  'Strong Sell': { angle: -72, color: '#F23645', buys: 2, neutrals: 4, sells: 18 },
  Sell: { angle: -36, color: '#F77C80', buys: 4, neutrals: 7, sells: 13 },
  Neutral: { angle: 0, color: '#787B86', buys: 8, neutrals: 9, sells: 7 },
  Buy: { angle: 36, color: '#42BD9F', buys: 14, neutrals: 6, sells: 4 },
  'Strong Buy': { angle: 72, color: '#089981', buys: 18, neutrals: 4, sells: 2 },
};

const TechnicalGauge: React.FC<{ rating: TechnicalRating }> = ({ rating }) => {
  const meta = RATING_ANGLES[rating];
  const cx = 110;
  const cy = 95;
  const r = 72;

  const arcSegment = (startDeg: number, endDeg: number, color: string) => {
    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    return (
      <path
        key={`${startDeg}-${endDeg}`}
        d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
      />
    );
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="118" viewBox="0 0 220 118" aria-label={`Technical rating: ${rating}`}>
        {arcSegment(-84, -54, '#F23645')}
        {arcSegment(-48, -18, '#F77C80')}
        {arcSegment(-12, 12, '#787B86')}
        {arcSegment(18, 48, '#42BD9F')}
        {arcSegment(54, 84, '#089981')}

        {/* Needle */}
        <g transform={`translate(${cx}, ${cy}) rotate(${meta.angle})`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-58"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="text-[#131722] dark:text-white"
          />
          <circle cx="0" cy="0" r="5" className="fill-[#131722] dark:fill-white" />
        </g>
      </svg>

      <div className="text-sm font-bold" style={{ color: meta.color }}>
        {rating}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-4 text-center font-mono text-xs tabular-nums">
        <div>
          <div className="text-[10px] uppercase text-[#6A6D78] dark:text-[#868993]">Sell</div>
          <div className="font-bold text-[#F23645]">{meta.sells}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-[#6A6D78] dark:text-[#868993]">Neutral</div>
          <div className="font-bold text-[#6A6D78] dark:text-[#D1D4DC]">{meta.neutrals}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase text-[#6A6D78] dark:text-[#868993]">Buy</div>
          <div className="font-bold text-[#089981]">{meta.buys}</div>
        </div>
      </div>
    </div>
  );
};

export const SymbolInspectorModal: React.FC<SymbolInspectorModalProps> = ({
  symbol,
  onClose,
  watchlistIds,
  onToggleWatchlist,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartStyle, setChartStyle] = useState<'area' | 'candles'>('candles');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (symbol) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [symbol, onClose]);

  if (!symbol) return null;

  const isWatched = watchlistIds.includes(symbol.id);
  const rangeSpan = symbol.range52wHigh - symbol.range52wLow || 1;
  const rangePosPct = Math.max(
    0,
    Math.min(100, ((symbol.price - symbol.range52wLow) / rangeSpan) * 100)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E0E3EB] dark:border-[#2A2E39] px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: symbol.badgeColor }}
            >
              {symbol.badgeText}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-[#131722] dark:text-white">
                  {symbol.name}
                </h2>
                <span className="font-mono text-xs text-[#6A6D78] dark:text-[#868993]">
                  {symbol.exchange}:{symbol.ticker}
                </span>
              </div>
              <p className="text-xs text-[#6A6D78] dark:text-[#868993]">
                {symbol.category} · {symbol.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWatchlist(symbol.id)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isWatched
                  ? 'border-[#2962FF]/40 bg-[#2962FF]/10 text-[#2962FF] dark:text-[#5B8DEF]'
                  : 'border-[#E0E3EB] dark:border-[#2A2E39] text-[#6A6D78] dark:text-[#D1D4DC] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39]'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${isWatched ? 'fill-current' : ''}`} />
              <span>{isWatched ? 'In Watchlist' : 'Watchlist'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chart modal"
              className="rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] p-1.5 text-[#6A6D78] hover:text-[#131722] dark:hover:text-white hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chart + Sidebar Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E0E3EB] dark:divide-[#2A2E39]">
          <div className="lg:col-span-8 p-5">
            <InteractiveChart
              symbol={symbol}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              chartStyle={chartStyle}
              onChartStyleChange={setChartStyle}
              height={340}
            />
          </div>

          <div className="lg:col-span-4 p-5 space-y-6 bg-[#F8F9FD]/60 dark:bg-[#181C27]/60">
            {/* Key Statistics */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6D78] dark:text-[#868993]">
                Key statistics
              </h3>
              <dl className="mt-3 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-mono tabular-nums">
                <div>
                  <dt className="font-sans text-[11px] text-[#6A6D78] dark:text-[#868993]">
                    Prev Close
                  </dt>
                  <dd className="font-semibold text-[#131722] dark:text-white">
                    {formatPrice(symbol.prevClose, symbol.decimals)}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] text-[#6A6D78] dark:text-[#868993]">
                    Open
                  </dt>
                  <dd className="font-semibold text-[#131722] dark:text-white">
                    {formatPrice(symbol.open, symbol.decimals)}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] text-[#6A6D78] dark:text-[#868993]">
                    Day Low / High
                  </dt>
                  <dd className="font-semibold text-[#131722] dark:text-white">
                    {formatPrice(symbol.low, symbol.decimals)} – {formatPrice(symbol.high, symbol.decimals)}
                  </dd>
                </div>
                <div>
                  <dt className="font-sans text-[11px] text-[#6A6D78] dark:text-[#868993]">
                    Volume
                  </dt>
                  <dd className="font-semibold text-[#131722] dark:text-white">
                    {symbol.volume}
                  </dd>
                </div>
                {symbol.marketCap && (
                  <div>
                    <dt className="font-sans text-[11px] text-[#6A6D78] dark:text-[#868993]">
                      Market Cap
                    </dt>
                    <dd className="font-semibold text-[#131722] dark:text-white">
                      {symbol.marketCap}
                    </dd>
                  </div>
                )}
                {symbol.peRatio && (
                  <div>
                    <dt className="font-sans text-[11px] text-[#6A6D78] dark:text-[#868993]">
                      P/E Ratio
                    </dt>
                    <dd className="font-semibold text-[#131722] dark:text-white">
                      {symbol.peRatio}
                    </dd>
                  </div>
                )}
              </dl>

              {/* 52-Week Range Slider */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-[#6A6D78] dark:text-[#868993]">
                  <span>52W Low: {formatPrice(symbol.range52wLow, symbol.decimals)}</span>
                  <span>52W High: {formatPrice(symbol.range52wHigh, symbol.decimals)}</span>
                </div>
                <div className="relative mt-1.5 h-1.5 w-full rounded-full bg-[#E0E3EB] dark:bg-[#2A2E39]">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-[#2962FF] border-2 border-white dark:border-[#1E222D]"
                    style={{ left: `${rangePosPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Technical Analysis Summary Gauge */}
            <div className="border-t border-[#E0E3EB] dark:border-[#2A2E39] pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A6D78] dark:text-[#868993] mb-2">
                Technicals summary
              </h3>
              <TechnicalGauge rating={symbol.rating} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
