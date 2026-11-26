import React from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { MarketCategory, MarketSymbol, Timeframe } from '../types/markets';
import { formatPrice } from '../data/marketsData';
import { InteractiveChart } from './InteractiveChart';

interface MarketSummarySectionProps {
  symbols: MarketSymbol[];
  activeCategory: MarketCategory;
  onCategoryChange: (cat: MarketCategory) => void;
  selectedSymbol: MarketSymbol;
  onSelectChartSymbol: (sym: MarketSymbol) => void;
  onInspectSymbol: (sym: MarketSymbol) => void;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
}

const CATEGORIES: MarketCategory[] = [
  'Indices',
  'Stocks',
  'Crypto',
  'Forex',
  'Futures',
  'Bonds',
];

export const MarketSummarySection: React.FC<MarketSummarySectionProps> = ({
  symbols,
  activeCategory,
  onCategoryChange,
  selectedSymbol,
  onSelectChartSymbol,
  onInspectSymbol,
  timeframe,
  onTimeframeChange,
  watchlistIds,
  onToggleWatchlist,
}) => {
  const categorySymbols = symbols
    .filter((s) => s.category === activeCategory)
    .slice(0, 6);

  const isWatched = watchlistIds.includes(selectedSymbol.id);

  return (
    <section id="market-summary" className="scroll-mt-32">
      {/* Page Intro + Market Summary Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#131722] dark:text-white">
            Market summary
          </h1>
          <p className="mt-1 text-sm text-[#6A6D78] dark:text-[#868993]">
            Global benchmark indices, equities, cryptocurrencies, currencies, commodities, and sovereign yields.
          </p>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#1E222D] p-1">
          {CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-[#2A2E39] text-[#131722] dark:text-white shadow-xs'
                    : 'text-[#6A6D78] dark:text-[#9598A1] hover:text-[#131722] dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Single-Elevation Summary Workspace */}
      <div className="rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-4 sm:p-5">
        {/* Benchmark Ticker Cards Strip */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 pb-5 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
          {categorySymbols.map((sym) => {
            const isSelected = sym.id === selectedSymbol.id;
            const up = sym.changePercent >= 0;
            return (
              <button
                key={sym.id}
                type="button"
                onClick={() => onSelectChartSymbol(sym)}
                className={`group flex flex-col justify-between rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? 'border-[#2962FF] bg-[#2962FF]/[0.05] dark:bg-[#2962FF]/[0.12]'
                    : 'border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD]/70 dark:bg-[#181C27] hover:border-[#B2B5BE] dark:hover:border-[#434651]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: sym.badgeColor }}
                    >
                      {sym.badgeText}
                    </span>
                    <span className="truncate text-xs font-bold text-[#131722] dark:text-white">
                      {sym.name}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between gap-2 w-full font-mono tabular-nums">
                  <span className="text-sm font-bold text-[#131722] dark:text-[#F0F3FA]">
                    {formatPrice(sym.price, sym.decimals)}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      up ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {up ? '+' : ''}
                    {sym.changePercent.toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Symbol Banner + Large Interactive Chart */}
        <div className="pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
            <div className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: selectedSymbol.badgeColor }}
              >
                {selectedSymbol.badgeText}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onInspectSymbol(selectedSymbol)}
                    className="font-display text-base font-bold text-[#131722] dark:text-white hover:text-[#2962FF] dark:hover:text-[#5B8DEF] transition-colors flex items-center gap-1"
                  >
                    <span>{selectedSymbol.name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-xs text-[#6A6D78] dark:text-[#868993]">
                    {selectedSymbol.exchange}:{selectedSymbol.ticker}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleWatchlist(selectedSymbol.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  isWatched
                    ? 'border-[#2962FF]/40 bg-[#2962FF]/10 text-[#2962FF] dark:text-[#5B8DEF]'
                    : 'border-[#E0E3EB] dark:border-[#2A2E39] text-[#6A6D78] dark:text-[#9598A1] hover:text-[#131722] dark:hover:text-white'
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${isWatched ? 'fill-current' : ''}`} />
                <span>{isWatched ? 'Watching' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>

          <InteractiveChart
            symbol={selectedSymbol}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            onExpandClick={() => onInspectSymbol(selectedSymbol)}
            height={300}
          />
        </div>
      </div>
    </section>
  );
};
