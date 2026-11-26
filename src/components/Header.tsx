import React, { useEffect, useRef, useState } from 'react';
import { Bookmark, Moon, Search, Sun, Activity, X } from 'lucide-react';
import { MarketSymbol } from '../types/markets';
import { formatPrice } from '../data/marketsData';

interface HeaderProps {
  symbols: MarketSymbol[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  liveStream: boolean;
  onToggleLiveStream: () => void;
  watchlistCount: number;
  onOpenWatchlist: () => void;
  onSelectSymbol: (sym: MarketSymbol) => void;
  onLaunchChart: () => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
}

const SUBNAV_ITEMS = [
  { id: 'market-summary', label: 'World Overview' },
  { id: 'stocks-section', label: 'US Stocks' },
  { id: 'crypto-forex-section', label: 'Crypto' },
  { id: 'forex-panel', label: 'Forex' },
  { id: 'futures-bonds-section', label: 'Futures' },
  { id: 'bonds-panel', label: 'Bonds' },
  { id: 'calendar-panel', label: 'Economy' },
  { id: 'community-news-section', label: 'News & Ideas' },
];

export const Header: React.FC<HeaderProps> = ({
  symbols,
  darkMode,
  onToggleDarkMode,
  liveStream,
  onToggleLiveStream,
  watchlistCount,
  onOpenWatchlist,
  onSelectSymbol,
  onLaunchChart,
  activeSection,
  onNavigateSection,
}) => {
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = query.trim()
    ? symbols
        .filter(
          (s) =>
            s.ticker.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.category.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : symbols.slice(0, 6);

  return (
    <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#131722]/95 backdrop-blur-md border-b border-[#E0E3EB] dark:border-[#2A2E39]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 h-14">
        {/* Zone 1: Single-line Brand wordmark */}
        <a
          href="#market-summary"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('market-summary');
          }}
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-[#131722] dark:text-white whitespace-nowrap shrink-0"
        >
          <svg
            width="28"
            height="18"
            viewBox="0 0 36 24"
            fill="none"
            aria-hidden="true"
            className="text-[#131722] dark:text-white"
          >
            <path d="M2 5H15V10H10V21H5V10H2V5Z" fill="currentColor" />
            <circle cx="19" cy="7.5" r="3" fill="#2962FF" />
            <path d="M23.5 5H29L22.5 21H17L23.5 5Z" fill="currentColor" />
          </svg>
          <span>TradingView</span>
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6A6D78] dark:text-[#9598A1]">
          <button
            type="button"
            onClick={onLaunchChart}
            className="hover:text-[#131722] dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('community-news-section')}
            className="hover:text-[#131722] dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Community
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('market-summary')}
            className="relative py-4 text-[#131722] dark:text-white font-semibold whitespace-nowrap shrink-0 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2962FF]"
          >
            Markets
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('calendar-panel')}
            className="hover:text-[#131722] dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Calendars
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('futures-bonds-section')}
            className="hover:text-[#131722] dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Screeners
          </button>
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onLaunchChart}
            className="rounded-lg bg-[#2962FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E53E5] transition-colors whitespace-nowrap shrink-0"
          >
            Launch Chart
          </button>
        </div>
      </header>

      {/* Markets Sub-Navigation & Utility Toolbar */}
      <div className="border-t border-[#E0E3EB]/80 dark:border-[#2A2E39]/80 bg-[#F8F9FD] dark:bg-[#181C27]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2">
          {/* Asset Class Sub-Bar */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {SUBNAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigateSection(item.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white dark:bg-[#2A2E39] text-[#2962FF] dark:text-white shadow-xs border border-[#E0E3EB] dark:border-[#363A45]'
                      : 'text-[#6A6D78] dark:text-[#9598A1] hover:text-[#131722] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#2A2E39]/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Search & Workspace Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Live Search Box */}
            <div ref={searchRef} className="relative">
              <div className="flex items-center gap-2 rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] px-2.5 py-1.5 w-48 sm:w-64 focus-within:border-[#2962FF] transition-colors">
                <Search className="h-3.5 w-3.5 text-[#6A6D78] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  placeholder="Search symbol (⌘K)"
                  className="w-full bg-transparent text-xs text-[#131722] dark:text-white placeholder:text-[#868993] focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="text-[#868993] hover:text-[#131722] dark:hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {searchFocused && (
                <div className="absolute right-0 mt-1.5 w-80 sm:w-96 rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] shadow-xl overflow-hidden z-50">
                  <div className="border-b border-[#E0E3EB] dark:border-[#2A2E39] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#6A6D78] dark:text-[#868993]">
                    {query.trim() ? 'Matching Instruments' : 'Popular Markets'}
                  </div>
                  {filtered.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-[#6A6D78] dark:text-[#868993]">
                      No instruments match "{query}"
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E0E3EB]/60 dark:divide-[#2A2E39]/60">
                      {filtered.map((sym) => {
                        const up = sym.changePercent >= 0;
                        return (
                          <button
                            key={sym.id}
                            type="button"
                            onClick={() => {
                              onSelectSymbol(sym);
                              setSearchFocused(false);
                              setQuery('');
                            }}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: sym.badgeColor }}
                              >
                                {sym.badgeText}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-bold text-[#131722] dark:text-white">
                                    {sym.ticker}
                                  </span>
                                  <span className="text-[11px] text-[#6A6D78] dark:text-[#868993]">
                                    {sym.exchange}
                                  </span>
                                </div>
                                <div className="truncate text-xs text-[#6A6D78] dark:text-[#9598A1]">
                                  {sym.name}
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-mono tabular-nums shrink-0">
                              <div className="text-xs font-semibold text-[#131722] dark:text-white">
                                {formatPrice(sym.price, sym.decimals)}
                              </div>
                              <div
                                className={`text-[11px] font-medium ${
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
                  )}
                </div>
              )}
            </div>

            {/* Live Quotes Toggle */}
            <button
              type="button"
              onClick={onToggleLiveStream}
              title="Toggle simulated live quote ticks"
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                liveStream
                  ? 'border-[#089981]/40 bg-[#089981]/10 text-[#089981]'
                  : 'border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] text-[#6A6D78] dark:text-[#9598A1]'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{liveStream ? 'Live Ticks' : 'Paused'}</span>
            </button>

            {/* Watchlist Drawer Button */}
            <button
              type="button"
              onClick={onOpenWatchlist}
              className="flex items-center gap-1.5 rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] px-2.5 py-1.5 text-xs font-medium text-[#131722] dark:text-[#D1D4DC] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] transition-colors whitespace-nowrap shrink-0"
            >
              <Bookmark className="h-3.5 w-3.5 text-[#2962FF]" />
              <span className="hidden sm:inline">Watchlist</span>
              <span className="font-mono text-[11px] font-semibold text-[#2962FF] tabular-nums">
                {watchlistCount}
              </span>
            </button>

            {/* Light / Dark Mode Switch */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] text-[#6A6D78] dark:text-[#D1D4DC] hover:text-[#131722] dark:hover:text-white transition-colors shrink-0"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
