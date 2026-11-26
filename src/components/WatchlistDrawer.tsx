import React from 'react';
import { Bookmark, Plus, Trash2, X } from 'lucide-react';
import { MarketSymbol } from '../types/markets';
import { formatPrice } from '../data/marketsData';
import { Sparkline } from './Sparkline';

interface WatchlistDrawerProps {
  open: boolean;
  onClose: () => void;
  symbols: MarketSymbol[];
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onInspectSymbol: (sym: MarketSymbol) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  open,
  onClose,
  symbols,
  watchlistIds,
  onToggleWatchlist,
  onInspectSymbol,
}) => {
  if (!open) return null;

  const watchedSymbols = symbols.filter((s) => watchlistIds.includes(s.id));
  const suggestions = symbols
    .filter((s) => !watchlistIds.includes(s.id))
    .slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-md h-full bg-white dark:bg-[#1E222D] border-l border-[#E0E3EB] dark:border-[#2A2E39] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E0E3EB] dark:border-[#2A2E39] px-5 py-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-[#2962FF]" />
            <h2 className="font-display text-base font-bold text-[#131722] dark:text-white">
              Watchlist
            </h2>
            <span className="font-mono text-xs text-[#6A6D78] dark:text-[#868993] tabular-nums">
              ({watchedSymbols.length})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close watchlist"
            className="rounded-lg p-1.5 text-[#6A6D78] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E0E3EB]/70 dark:divide-[#2A2E39]/70">
          {watchedSymbols.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-[#131722] dark:text-white">
                Your watchlist is empty
              </p>
              <p className="mt-1 text-xs text-[#6A6D78] dark:text-[#868993]">
                Star any index, stock, crypto, currency pair, or bond to track it here.
              </p>
              <div className="mt-5 space-y-2 text-left">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6A6D78]">
                  Quick add benchmarks
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onToggleWatchlist(s.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] px-3 py-2 text-xs hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39]"
                  >
                    <span className="font-mono font-bold text-[#131722] dark:text-white">
                      {s.ticker} — <span className="font-sans font-normal text-[#6A6D78]">{s.name}</span>
                    </span>
                    <Plus className="h-3.5 w-3.5 text-[#2962FF]" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            watchedSymbols.map((sym) => {
              const up = sym.changePercent >= 0;
              return (
                <div
                  key={sym.id}
                  onClick={() => {
                    onInspectSymbol(sym);
                    onClose();
                  }}
                  className="group flex items-center justify-between gap-3 px-5 py-3.5 cursor-pointer hover:bg-[#F0F3FA]/70 dark:hover:bg-[#2A2E39]/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: sym.badgeColor }}
                    >
                      {sym.badgeText}
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-bold text-[#131722] dark:text-white">
                        {sym.ticker}
                      </div>
                      <div className="truncate text-[11px] text-[#6A6D78] dark:text-[#868993] max-w-[140px]">
                        {sym.name}
                      </div>
                    </div>
                  </div>

                  <Sparkline data={sym.sparkline} positive={up} width={56} height={20} />

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-xs font-bold text-[#131722] dark:text-white">
                        {formatPrice(sym.price, sym.decimals)}
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(sym.id);
                      }}
                      aria-label={`Remove ${sym.ticker} from watchlist`}
                      className="rounded p-1 text-[#868993] opacity-60 group-hover:opacity-100 hover:text-[#F23645]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};
