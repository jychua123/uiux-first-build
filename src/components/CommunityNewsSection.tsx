import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Heart,
  MessageSquare,
  X,
} from 'lucide-react';
import { CommunityIdea, MarketSymbol, NewsStory } from '../types/markets';

interface CommunityNewsSectionProps {
  ideas: CommunityIdea[];
  stories: NewsStory[];
  symbols: MarketSymbol[];
  onInspectSymbol: (sym: MarketSymbol) => void;
}

const IdeaChartPreview: React.FC<{ idea: CommunityIdea }> = ({ idea }) => {
  const isLong = idea.direction === 'Long';
  const candles = useMemo(() => {
    const out: { o: number; h: number; l: number; c: number }[] = [];
    let cur = isLong ? 42 : 76;
    for (let i = 0; i < 24; i++) {
      const wave = Math.sin((i + idea.chartSeed) * 0.6) * 5.2;
      const drift = idea.trendBias * 1.45;
      const o = cur;
      const c = Math.max(14, Math.min(92, o + drift + wave * 0.45));
      const h = Math.min(98, Math.max(o, c) + 3 + ((i * 7) % 4));
      const l = Math.max(6, Math.min(o, c) - 3 - ((i * 5) % 4));
      out.push({ o, h, l, c });
      cur = c;
    }
    return out;
  }, [idea, isLong]);

  const w = 320;
  const h = 132;
  const yFor = (v: number) => h - 10 - (v / 100) * (h - 20);
  const trendY1 = yFor(candles[3].c);
  const trendY2 = yFor(candles[22].c);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-36 rounded-lg bg-[#131722] border border-[#2A2E39]"
      aria-label={`Technical chart setup for ${idea.ticker}`}
    >
      {/* Subtle grid */}
      {[28, 66, 104].map((gy) => (
        <line
          key={gy}
          x1="0"
          y1={gy}
          x2={w}
          y2={gy}
          stroke="#2A2E39"
          strokeWidth="0.7"
        />
      ))}

      {/* Target Zone Band */}
      <rect
        x="16"
        y={isLong ? 14 : 92}
        width={w - 32}
        height="22"
        fill={isLong ? '#089981' : '#F23645'}
        fillOpacity="0.12"
      />

      {/* Trendline Overlay */}
      <line
        x1={42}
        y1={trendY1}
        x2={296}
        y2={trendY2}
        stroke="#2962FF"
        strokeWidth="1.6"
        strokeDasharray="4 3"
      />

      {/* Candlesticks */}
      {candles.map((c, idx) => {
        const x = 16 + idx * 12.5;
        const up = c.c >= c.o;
        const col = up ? '#089981' : '#F23645';
        const top = Math.min(yFor(c.o), yFor(c.c));
        const bodyH = Math.max(2, Math.abs(yFor(c.c) - yFor(c.o)));
        return (
          <g key={idx}>
            <line
              x1={x}
              y1={yFor(c.h)}
              x2={x}
              y2={yFor(c.l)}
              stroke={col}
              strokeWidth="1.1"
            />
            <rect
              x={x - 3}
              y={top}
              width="6"
              height={bodyH}
              fill={col}
              rx="0.6"
            />
          </g>
        );
      })}

      {/* Ticker watermark tag top-left (readable label) */}
      <text
        x="12"
        y="20"
        className="fill-[#D1D4DC] text-[10px] font-mono font-bold"
      >
        {idea.ticker} · {idea.timeframeLabel}
      </text>
    </svg>
  );
};

export const CommunityNewsSection: React.FC<CommunityNewsSectionProps> = ({
  ideas,
  stories,
  symbols,
  onInspectSymbol,
}) => {
  const [newsCategory, setNewsCategory] = useState<string>('All');
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [activeStory, setActiveStory] = useState<NewsStory | null>(null);
  const [activeIdea, setActiveIdea] = useState<CommunityIdea | null>(null);

  const filteredStories = useMemo(() => {
    if (newsCategory === 'All') return stories;
    return stories.filter((s) => s.category === newsCategory);
  }, [stories, newsCategory]);

  const toggleLike = (id: string) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTickerClick = (ticker: string) => {
    const found = symbols.find(
      (s) => s.ticker.toUpperCase() === ticker.toUpperCase()
    );
    if (found) onInspectSymbol(found);
  };

  return (
    <section id="community-news-section" className="scroll-mt-32 pt-10 space-y-10">
      {/* Community Ideas */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#131722] dark:text-white">
              Community ideas
            </h2>
            <p className="text-xs text-[#6A6D78] dark:text-[#868993]">
              Featured technical setups and macro outlooks published by analysts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {ideas.map((idea) => {
            const liked = likedIds.includes(idea.id);
            const isLong = idea.direction === 'Long';
            return (
              <article
                key={idea.id}
                onClick={() => setActiveIdea(idea)}
                className="group cursor-pointer rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-4 hover:border-[#2962FF]/60 transition-colors flex flex-col justify-between"
              >
                <div>
                  <IdeaChartPreview idea={idea} />

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#6A6D78] dark:text-[#868993]">
                      <span className="font-mono font-bold text-[#131722] dark:text-white">
                        {idea.ticker}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{idea.author}</span>
                      <span aria-hidden="true">·</span>
                      <span>{idea.publishedAt}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold shrink-0 ${
                        isLong ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}
                    >
                      {isLong ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {idea.direction}
                    </span>
                  </div>

                  <h3 className="mt-2 font-display text-sm font-bold leading-snug text-[#131722] dark:text-white group-hover:text-[#2962FF] transition-colors">
                    {idea.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6A6D78] dark:text-[#9598A1] line-clamp-2">
                    {idea.thesis}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#E0E3EB]/70 dark:border-[#2A2E39]/70 pt-3 text-xs text-[#6A6D78] dark:text-[#868993]">
                  <div className="flex items-center gap-4 font-mono tabular-nums">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(idea.id);
                      }}
                      className={`flex items-center gap-1 transition-colors ${
                        liked ? 'text-[#F23645]' : 'hover:text-[#131722] dark:hover:text-white'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
                      <span>{idea.likes + (liked ? 1 : 0)}</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{idea.comments}</span>
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-medium text-[#2962FF]">
                    Target {idea.targetPrice}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Top Stories */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#131722] dark:text-white">
              Top stories
            </h2>
            <p className="text-xs text-[#6A6D78] dark:text-[#868993]">
              Market-moving headlines and wire coverage across global asset classes.
            </p>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#1E222D] p-1">
            {['All', 'Indices', 'Stocks', 'Crypto', 'Forex', 'Futures'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setNewsCategory(cat)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  newsCategory === cat
                    ? 'bg-white dark:bg-[#2A2E39] text-[#131722] dark:text-white shadow-xs'
                    : 'text-[#6A6D78] dark:text-[#9598A1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="group cursor-pointer rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-4 hover:border-[#2962FF]/60 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-[#6A6D78] dark:text-[#868993]">
                  <span className="font-semibold text-[#131722] dark:text-[#D1D4DC]">
                    {story.source}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{story.publishedAt}</span>
                  <span aria-hidden="true">·</span>
                  <span>{story.category}</span>
                </div>

                <h3 className="mt-2 font-display text-sm font-bold leading-snug text-[#131722] dark:text-white group-hover:text-[#2962FF] transition-colors">
                  {story.title}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-[#6A6D78] dark:text-[#9598A1] line-clamp-2">
                  {story.summary}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-[#E0E3EB]/60 dark:border-[#2A2E39]/60">
                {story.tickers.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTickerClick(t);
                    }}
                    className="font-mono text-[11px] font-bold text-[#2962FF] hover:underline"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#6A6D78] dark:text-[#868993]">
                <span className="font-semibold text-[#131722] dark:text-white">
                  {activeStory.source}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeStory.publishedAt}</span>
                <span aria-hidden="true">·</span>
                <span>{activeStory.category}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveStory(null)}
                aria-label="Close story"
                className="rounded-lg p-1 text-[#6A6D78] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-[#131722] dark:text-white leading-snug">
              {activeStory.title}
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#434651] dark:text-[#B2B5BE]">
              {activeStory.body.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#E0E3EB] dark:border-[#2A2E39] pt-4">
              <span className="text-xs text-[#6A6D78] dark:text-[#868993]">
                Related symbols:
              </span>
              {activeStory.tickers.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setActiveStory(null);
                    handleTickerClick(t);
                  }}
                  className="rounded-md border border-[#E0E3EB] dark:border-[#2A2E39] px-2.5 py-1 font-mono text-xs font-bold text-[#2962FF] hover:bg-[#2962FF]/10"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Community Idea Detail Modal */}
      {activeIdea && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setActiveIdea(null)}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-[#E0E3EB] dark:border-[#2A2E39] bg-white dark:bg-[#1E222D] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#6A6D78] dark:text-[#868993]">
                <span className="font-mono font-bold text-[#131722] dark:text-white">
                  {activeIdea.exchange}:{activeIdea.ticker}
                </span>
                <span aria-hidden="true">·</span>
                <span>by {activeIdea.author}</span>
                <span aria-hidden="true">·</span>
                <span>{activeIdea.publishedAt}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveIdea(null)}
                aria-label="Close idea"
                className="rounded-lg p-1 text-[#6A6D78] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-2 font-display text-lg font-bold text-[#131722] dark:text-white">
              {activeIdea.title}
            </h3>

            <div className="mt-4">
              <IdeaChartPreview idea={activeIdea} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-[#F8F9FD] dark:bg-[#181C27] p-3 font-mono text-xs tabular-nums">
              <div>
                <div className="text-[10px] uppercase text-[#6A6D78] dark:text-[#868993]">
                  Entry Zone
                </div>
                <div className="font-bold text-[#131722] dark:text-white">
                  {activeIdea.entryZone}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#6A6D78] dark:text-[#868993]">
                  Target
                </div>
                <div className="font-bold text-[#089981]">
                  {activeIdea.targetPrice}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#6A6D78] dark:text-[#868993]">
                  Invalidation
                </div>
                <div className="font-bold text-[#F23645]">
                  {activeIdea.stopLevel}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#434651] dark:text-[#B2B5BE]">
              {activeIdea.thesis}
            </p>

            <div className="mt-5 flex justify-end gap-2 border-t border-[#E0E3EB] dark:border-[#2A2E39] pt-4">
              <button
                type="button"
                onClick={() => {
                  const sym = symbols.find((s) => s.ticker === activeIdea.ticker);
                  setActiveIdea(null);
                  if (sym) onInspectSymbol(sym);
                }}
                className="rounded-lg bg-[#2962FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E53E5] transition-colors"
              >
                Open {activeIdea.ticker} Superchart
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
