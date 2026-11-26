import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MarketSymbol } from '../types/markets';
import { CURRENCY_CROSS_RATES, formatPrice } from '../data/marketsData';
import { Sparkline } from './Sparkline';

interface CryptoForexSectionProps {
  symbols: MarketSymbol[];
  onInspectSymbol: (sym: MarketSymbol) => void;
}

export const CryptoForexSection: React.FC<CryptoForexSectionProps> = ({
  symbols,
  onInspectSymbol,
}) => {
  const [forexView, setForexView] = useState<'pairs' | 'matrix'>('pairs');

  const cryptos = symbols.filter((s) => s.category === 'Crypto');
  const forex = symbols.filter((s) => s.category === 'Forex');
  const crossCols = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD'];

  return (
    <section id="crypto-forex-section" className="scroll-mt-32 pt-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Crypto Panel (6 cols) */}
        <div className="lg:col-span-6 rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-[#131722] dark:text-white">
                Crypto
              </h2>
              <p className="text-xs text-[#6A6D78] dark:text-[#868993]">
                Digital assets, total capitalization, and market dominance.
              </p>
            </div>
            <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#6A6D78] dark:text-[#868993]">
                  Total Cap
                </div>
                <div className="font-bold text-[#131722] dark:text-white">
                  $3.18T <span className="text-[#089981]">+3.1%</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#6A6D78] dark:text-[#868993]">
                  BTC Dom
                </div>
                <div className="font-bold text-[#131722] dark:text-white">
                  58.8%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E0E3EB]/80 dark:border-[#2A2E39]/80 text-[11px] font-semibold uppercase tracking-wider text-[#6A6D78] dark:text-[#868993]">
                  <th className="py-2 pr-2">Coin</th>
                  <th className="py-2 px-2 text-right">Price</th>
                  <th className="py-2 px-2 text-right">24h %</th>
                  <th className="py-2 px-2 text-right hidden sm:table-cell">Mkt Cap</th>
                  <th className="py-2 pl-2 text-right">7D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E3EB]/60 dark:divide-[#2A2E39]/60 text-xs">
                {cryptos.map((sym) => {
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
                            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: sym.badgeColor }}
                          >
                            {sym.badgeText}
                          </span>
                          <div>
                            <div className="font-mono font-bold text-[#131722] dark:text-white group-hover:text-[#2962FF] flex items-center gap-1">
                              <span>{sym.ticker}</span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[11px] text-[#6A6D78] dark:text-[#868993]">
                              {sym.name.replace(' / U.S. Dollar', '')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-[#131722] dark:text-[#F0F3FA] tabular-nums">
                        ${formatPrice(sym.price, sym.decimals)}
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
                        {sym.marketCap}
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

        {/* Forex Panel (6 cols) */}
        <div
          id="forex-panel"
          className="scroll-mt-32 lg:col-span-6 rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-[#131722] dark:text-white">
                Forex
              </h2>
              <p className="text-xs text-[#6A6D78] dark:text-[#868993]">
                Dollar Index benchmark, G10 spot pairs, and live cross-rates.
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#181C27] p-0.5">
              <button
                type="button"
                onClick={() => setForexView('pairs')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  forexView === 'pairs'
                    ? 'bg-white dark:bg-[#2A2E39] text-[#131722] dark:text-white shadow-xs'
                    : 'text-[#6A6D78] dark:text-[#9598A1]'
                }`}
              >
                Major Pairs
              </button>
              <button
                type="button"
                onClick={() => setForexView('matrix')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  forexView === 'matrix'
                    ? 'bg-white dark:bg-[#2A2E39] text-[#131722] dark:text-white shadow-xs'
                    : 'text-[#6A6D78] dark:text-[#9598A1]'
                }`}
              >
                Cross Matrix
              </button>
            </div>
          </div>

          {forexView === 'pairs' ? (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E0E3EB]/80 dark:border-[#2A2E39]/80 text-[11px] font-semibold uppercase tracking-wider text-[#6A6D78] dark:text-[#868993]">
                    <th className="py-2 pr-2">Pair</th>
                    <th className="py-2 px-2 text-right">Rate</th>
                    <th className="py-2 px-2 text-right">Chg</th>
                    <th className="py-2 px-2 text-right">Chg %</th>
                    <th className="py-2 pl-2 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E3EB]/60 dark:divide-[#2A2E39]/60 text-xs">
                  {forex.map((sym) => {
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
                        </td>
                        <td
                          className={`py-2.5 px-2 text-right font-mono tabular-nums ${
                            up ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {up ? '+' : ''}
                          {formatPrice(sym.change, sym.decimals)}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-right font-mono font-semibold tabular-nums ${
                            up ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {up ? '▲ +' : '▼ '}
                          {sym.changePercent.toFixed(2)}%
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
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-right border-collapse font-mono text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-[#E0E3EB] dark:border-[#2A2E39] text-[11px] text-[#6A6D78] dark:text-[#868993]">
                    <th className="py-2 text-left">Base</th>
                    {crossCols.map((c) => (
                      <th key={c} className="py-2 px-2">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E3EB]/60 dark:divide-[#2A2E39]/60">
                  {CURRENCY_CROSS_RATES.map((row) => (
                    <tr key={row.base} className="hover:bg-[#F0F3FA]/60 dark:hover:bg-[#2A2E39]/40">
                      <td className="py-3 text-left font-bold text-[#131722] dark:text-white">
                        1 {row.base}
                      </td>
                      {crossCols.map((col) => (
                        <td
                          key={col}
                          className={`py-3 px-2 ${
                            col === row.base
                              ? 'text-[#868993]'
                              : 'text-[#131722] dark:text-[#D1D4DC]'
                          }`}
                        >
                          {col === row.base ? '—' : row.rates[col]?.toFixed(4)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
