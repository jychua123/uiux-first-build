import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Search, Star } from 'lucide-react';
import { MarketSymbol, SectorPerformance } from '../types/markets';
import { formatPrice } from '../data/marketsData';
import { Sparkline } from './Sparkline';

interface StocksSectionProps {
  symbols: MarketSymbol[];
  sectors: SectorPerformance[];
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onInspectSymbol: (sym: MarketSymbol) => void;
}

type StockTab = 'All' | 'Gainers' | 'Active' | 'Losers';

export const StocksSection: React.FC<StocksSectionProps> = ({
  symbols,
  sectors,
  watchlistIds,
  onToggleWatchlist,
  onInspectSymbol,
}) => {
  const [tab, setTab] = useState<StockTab>('All');
  const [filterText, setFilterText] = useState('');

  const stocks = useMemo(() => {
    const allStocks = symbols.filter((s) => s.category === 'Stocks');
    let scoped = allStocks;
    if (tab === 'Gainers') {
      scoped = [...allStocks]
        .filter((s) => s.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent);
    } else if (tab === 'Losers') {
      scoped = [...allStocks]
        .filter((s) => s.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent);
    } else if (tab === 'Active') {
      scoped = allStocks.filter((s) => s.subGroup === 'Active' || s.changePercent > 3);
    }

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      scoped = scoped.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }
    return scoped;
  }, [symbols, tab, filterText]);

  return (
    <section id="stocks-section" className="scroll-mt-32 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-[#131722] dark:text-white">
            US Stocks
          </h2>
          <p className="text-xs text-[#6A6D78] dark:text-[#868993]">
            Top equities by daily performance, volume activity, and sector rotation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#1E222D] p-1">
            {(['All', 'Gainers', 'Active', 'Losers'] as StockTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                  tab === t
                    ? 'bg-white dark:bg-[#2A2E39] text-[#131722] dark:text-white shadow-xs'
                    : 'text-[#6A6D78] dark:text-[#9598A1] hover:text-[#131722] dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] px-2.5 py-1.5 w-44">
            <Search className="h-3.5 w-3.5 text-[#6A6D78]" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter ticker..."
              className="w-full bg-transparent text-xs text-[#131722] dark:text-white placeholder:text-[#868993] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left 8 Columns: High-Density Equities Screener Table */}
        <div className="lg:col-span-8 rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#181C27] text-[11px] font-semibold uppercase tracking-wider text-[#6A6D78] dark:text-[#868993]">
                  <th className="py-2.5 pl-4 pr-2">Symbol</th>
                  <th className="py-2.5 px-2 text-right">Last</th>
                  <th className="py-2.5 px-2 text-right">Chg %</th>
                  <th className="py-2.5 px-2 text-right hidden sm:table-cell">Vol</th>
                  <th className="py-2.5 px-2 text-right hidden md:table-cell">Mkt Cap</th>
                  <th className="py-2.5 px-2 text-right hidden md:table-cell">P/E</th>
                  <th className="py-2.5 px-3 text-center hidden sm:table-cell">Trend</th>
                  <th className="py-2.5 pl-2 pr-4 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E3EB]/70 dark:divide-[#2A2E39]/70 text-xs">
                {stocks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#6A6D78] dark:text-[#868993]">
                      No equities match your current filter.
                    </td>
                  </tr>
                ) : (
                  stocks.map((sym) => {
                    const up = sym.changePercent >= 0;
                    const watched = watchlistIds.includes(sym.id);
                    const ratingColor = sym.rating.includes('Buy')
                      ? 'text-[#089981]'
                      : sym.rating.includes('Sell')
                      ? 'text-[#F23645]'
                      : 'text-[#6A6D78] dark:text-[#9598A1]';
                    return (
                      <tr
                        key={sym.id}
                        onClick={() => onInspectSymbol(sym)}
                        className="group cursor-pointer hover:bg-[#F0F3FA]/70 dark:hover:bg-[#2A2E39]/50 transition-colors"
                      >
                        <td className="py-2.5 pl-4 pr-2">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWatchlist(sym.id);
                              }}
                              aria-label={`Toggle ${sym.ticker} watchlist`}
                              className={`transition-colors ${
                                watched
                                  ? 'text-[#2962FF]'
                                  : 'text-[#B2B5BE] opacity-60 group-hover:opacity-100 hover:text-[#2962FF]'
                              }`}
                            >
                              <Star className={`h-3.5 w-3.5 ${watched ? 'fill-current' : ''}`} />
                            </button>
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: sym.badgeColor }}
                            >
                              {sym.badgeText}
                            </span>
                            <div className="min-w-0">
                              <div className="font-mono font-bold text-[#131722] dark:text-white group-hover:text-[#2962FF] transition-colors flex items-center gap-1">
                                <span>{sym.ticker}</span>
                                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="truncate max-w-[140px] sm:max-w-[190px] text-[11px] text-[#6A6D78] dark:text-[#868993]">
                                {sym.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-semibold text-[#131722] dark:text-[#F0F3FA] tabular-nums">
                          {formatPrice(sym.price, sym.decimals)}
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
                        <td className="py-2.5 px-2 text-right font-mono text-[#131722] dark:text-[#D1D4DC] tabular-nums hidden md:table-cell">
                          {sym.marketCap ?? '—'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-[#6A6D78] dark:text-[#9598A1] tabular-nums hidden md:table-cell">
                          {sym.peRatio ?? '—'}
                        </td>
                        <td className="py-2 px-3 hidden sm:table-cell">
                          <div className="flex justify-center">
                            <Sparkline data={sym.sparkline} positive={up} width={72} height={22} />
                          </div>
                        </td>
                        <td className={`py-2.5 pl-2 pr-4 text-right font-semibold whitespace-nowrap ${ratingColor}`}>
                          {sym.rating}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Columns: US Sector Performance */}
        <div className="lg:col-span-4 rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <h3 className="font-display text-sm font-bold text-[#131722] dark:text-white">
              Sector performance
            </h3>
            <span className="text-[11px] font-medium text-[#6A6D78] dark:text-[#868993]">
              1D Change
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {sectors.map((sec) => {
              const up = sec.changePercent >= 0;
              const barPct = Math.min(100, (Math.abs(sec.changePercent) / 1.8) * 100);
              return (
                <div key={sec.name} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-[#131722] dark:text-[#D1D4DC] truncate">
                      {sec.name}
                    </span>
                    <span
                      className={`font-mono font-semibold tabular-nums shrink-0 ${
                        up ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}
                    >
                      {up ? '+' : ''}
                      {sec.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#F0F3FA] dark:bg-[#2A2E39] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        up ? 'bg-[#089981]' : 'bg-[#F23645]'
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6A6D78] dark:text-[#868993]">
                    <span>Cap {sec.marketCap}</span>
                    <span>{sec.leaders.join(' · ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
