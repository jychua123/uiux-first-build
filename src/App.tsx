import React, { useEffect, useMemo, useState } from 'react';
import {
  COMMUNITY_IDEAS,
  ECONOMIC_EVENTS,
  MARKET_SYMBOLS,
  NEWS_STORIES,
  US_SECTORS,
  YIELD_CURVE_DATA,
} from './data/marketsData';
import { MarketCategory, MarketSymbol, Timeframe } from './types/markets';
import { Header } from './components/Header';
import { MarketSummarySection } from './components/MarketSummarySection';
import { StocksSection } from './components/StocksSection';
import { CryptoForexSection } from './components/CryptoForexSection';
import { FuturesBondsSection } from './components/FuturesBondsSection';
import { CommunityNewsSection } from './components/CommunityNewsSection';
import { SymbolInspectorModal } from './components/SymbolInspectorModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { Footer } from './components/Footer';

const DEFAULT_WATCHLIST = ['spx', 'nvda', 'btcusd', 'gc1', 'us10y'];

export default function App() {
  const [symbols, setSymbols] = useState<MarketSymbol[]>(MARKET_SYMBOLS);
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('Indices');
  const [chartSymbolId, setChartSymbolId] = useState<string>('spx');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [inspectedSymbolId, setInspectedSymbolId] = useState<string | null>(null);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('market-summary');
  const [liveStream, setLiveStream] = useState(true);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tv_markets_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tv_markets_watchlist');
      return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('tv_markets_theme', darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage failure
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem('tv_markets_watchlist', JSON.stringify(watchlistIds));
    } catch {
      // ignore storage failure
    }
  }, [watchlistIds]);

  // Subtle live market quote tick simulation
  useEffect(() => {
    if (!liveStream) return;
    const timer = window.setInterval(() => {
      setSymbols((prev) =>
        prev.map((sym) => {
          if (Math.random() > 0.35) return sym;
          const microMove = (Math.random() - 0.49) * 0.0014;
          const nextPrice = Number(
            Math.max(0.0001, sym.price * (1 + microMove)).toFixed(sym.decimals)
          );
          const nextChange = Number((nextPrice - sym.prevClose).toFixed(sym.decimals));
          const nextPct = Number(
            ((nextChange / (sym.prevClose || 1)) * 100).toFixed(2)
          );
          const nextSpark = [...sym.sparkline.slice(1), nextPrice];
          return {
            ...sym,
            price: nextPrice,
            change: nextChange,
            changePercent: nextPct,
            high: Math.max(sym.high, nextPrice),
            low: Math.min(sym.low, nextPrice),
            sparkline: nextSpark,
          };
        })
      );
    }, 2400);
    return () => window.clearInterval(timer);
  }, [liveStream]);

  const selectedChartSymbol = useMemo(
    () => symbols.find((s) => s.id === chartSymbolId) ?? symbols[0],
    [symbols, chartSymbolId]
  );

  const inspectedSymbol = useMemo(
    () => symbols.find((s) => s.id === inspectedSymbolId) ?? null,
    [symbols, inspectedSymbolId]
  );

  const handleCategoryChange = (cat: MarketCategory) => {
    setActiveCategory(cat);
    const firstInCat = symbols.find((s) => s.category === cat);
    if (firstInCat) {
      setChartSymbolId(firstInCat.id);
    }
  };

  const handleToggleWatchlist = (id: string) => {
    setWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#131722] text-[#131722] dark:text-[#D1D4DC] transition-colors">
      <Header
        symbols={symbols}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        liveStream={liveStream}
        onToggleLiveStream={() => setLiveStream((l) => !l)}
        watchlistCount={watchlistIds.length}
        onOpenWatchlist={() => setWatchlistOpen(true)}
        onSelectSymbol={(sym) => setInspectedSymbolId(sym.id)}
        onLaunchChart={() => setInspectedSymbolId(selectedChartSymbol.id)}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
      />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-6 pb-8">
        <MarketSummarySection
          symbols={symbols}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          selectedSymbol={selectedChartSymbol}
          onSelectChartSymbol={(sym) => setChartSymbolId(sym.id)}
          onInspectSymbol={(sym) => setInspectedSymbolId(sym.id)}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          watchlistIds={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
        />

        <StocksSection
          symbols={symbols}
          sectors={US_SECTORS}
          watchlistIds={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
          onInspectSymbol={(sym) => setInspectedSymbolId(sym.id)}
        />

        <CryptoForexSection
          symbols={symbols}
          onInspectSymbol={(sym) => setInspectedSymbolId(sym.id)}
        />

        <FuturesBondsSection
          symbols={symbols}
          yieldCurve={YIELD_CURVE_DATA}
          economicEvents={ECONOMIC_EVENTS}
          onInspectSymbol={(sym) => setInspectedSymbolId(sym.id)}
        />

        <CommunityNewsSection
          ideas={COMMUNITY_IDEAS}
          stories={NEWS_STORIES}
          symbols={symbols}
          onInspectSymbol={(sym) => setInspectedSymbolId(sym.id)}
        />
      </main>

      <Footer
        onNavigateSection={handleNavigateSection}
        onLaunchChart={() => setInspectedSymbolId(selectedChartSymbol.id)}
      />

      <SymbolInspectorModal
        symbol={inspectedSymbol}
        onClose={() => setInspectedSymbolId(null)}
        watchlistIds={watchlistIds}
        onToggleWatchlist={handleToggleWatchlist}
      />

      <WatchlistDrawer
        open={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        symbols={symbols}
        watchlistIds={watchlistIds}
        onToggleWatchlist={handleToggleWatchlist}
        onInspectSymbol={(sym) => setInspectedSymbolId(sym.id)}
      />
    </div>
  );
}
