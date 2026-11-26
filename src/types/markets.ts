export type MarketCategory =
  | 'Indices'
  | 'Stocks'
  | 'Crypto'
  | 'Forex'
  | 'Futures'
  | 'Bonds';

export type Timeframe = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'All';

export type TechnicalRating =
  | 'Strong Buy'
  | 'Buy'
  | 'Neutral'
  | 'Sell'
  | 'Strong Sell';

export interface OhlcPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSymbol {
  id: string;
  ticker: string;
  exchange: string;
  name: string;
  category: MarketCategory;
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  range52wLow: number;
  range52wHigh: number;
  volume: string;
  marketCap?: string;
  peRatio?: string;
  unit?: string;
  decimals: number;
  badgeColor: string;
  badgeText: string;
  subGroup?: string;
  rating: TechnicalRating;
  sparkline: number[];
  description: string;
}

export interface SectorPerformance {
  name: string;
  changePercent: number;
  marketCap: string;
  leaders: string[];
}

export interface NewsStory {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: MarketCategory | 'Economy';
  tickers: string[];
  summary: string;
  body: string[];
}

export interface CommunityIdea {
  id: string;
  ticker: string;
  exchange: string;
  title: string;
  author: string;
  publishedAt: string;
  direction: 'Long' | 'Short' | 'Neutral';
  timeframeLabel: string;
  likes: number;
  comments: number;
  thesis: string;
  entryZone: string;
  targetPrice: string;
  stopLevel: string;
  chartSeed: number;
  trendBias: number;
}

export interface EconomicEvent {
  id: string;
  time: string;
  dateLabel: 'Today' | 'Tomorrow' | 'This Week';
  country: string;
  currency: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  actual: string;
  forecast: string;
  prior: string;
}

export interface YieldCurvePoint {
  maturity: string;
  current: number;
  oneMonthAgo: number;
  oneYearAgo: number;
}
