import React, { useMemo, useRef, useState } from 'react';
import { BarChart2, TrendingUp, Maximize2 } from 'lucide-react';
import { MarketSymbol, OhlcPoint, Timeframe } from '../types/markets';
import { formatPrice, generateOhlcSeries } from '../data/marketsData';

interface InteractiveChartProps {
  symbol: MarketSymbol;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  chartStyle?: 'area' | 'candles';
  onChartStyleChange?: (style: 'area' | 'candles') => void;
  onExpandClick?: () => void;
  height?: number;
  compact?: boolean;
}

const TIMEFRAMES: Timeframe[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'All'];

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  symbol,
  timeframe,
  onTimeframeChange,
  chartStyle: controlledStyle,
  onChartStyleChange,
  onExpandClick,
  height = 310,
  compact = false,
}) => {
  const [internalStyle, setInternalStyle] = useState<'area' | 'candles'>('area');
  const chartStyle = controlledStyle ?? internalStyle;
  const setChartStyle = onChartStyleChange ?? setInternalStyle;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const series: OhlcPoint[] = useMemo(
    () => generateOhlcSeries(symbol, timeframe),
    [symbol, timeframe]
  );

  const svgWidth = 880;
  const svgHeight = height;
  const margin = { top: 18, right: 76, bottom: 26, left: 10 };
  const plotW = svgWidth - margin.left - margin.right;
  const plotH = svgHeight - margin.top - margin.bottom;

  const { minVal, maxVal, prevClose } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const pt of series) {
      const lo = chartStyle === 'candles' ? pt.low : pt.close;
      const hi = chartStyle === 'candles' ? pt.high : pt.close;
      if (lo < min) min = lo;
      if (hi > max) max = hi;
    }
    const baseRef = timeframe === '1D' ? symbol.prevClose : series[0]?.open ?? symbol.prevClose;
    min = Math.min(min, baseRef);
    max = Math.max(max, baseRef);
    const pad = (max - min || 1) * 0.08;
    return { minVal: min - pad, maxVal: max + pad, prevClose: baseRef };
  }, [series, chartStyle, timeframe, symbol.prevClose]);

  const firstClose = timeframe === '1D' ? symbol.prevClose : series[0]?.open ?? symbol.prevClose;
  const lastClose = series[series.length - 1]?.close ?? symbol.price;
  const tfDelta = lastClose - firstClose;
  const tfDeltaPct = firstClose ? (tfDelta / firstClose) * 100 : 0;
  const isPositive = tfDelta >= 0;

  const accentColor = isPositive ? '#089981' : '#F23645';
  const gradId = React.useId();

  const xForIdx = (idx: number) =>
    margin.left + (idx / Math.max(series.length - 1, 1)) * plotW;

  const yForVal = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1);
    return margin.top + plotH - ratio * plotH;
  };

  const areaLinePath = useMemo(() => {
    if (series.length === 0) return '';
    return series
      .map(
        (pt, i) =>
          `${i === 0 ? 'M' : 'L'} ${xForIdx(i).toFixed(1)} ${yForVal(pt.close).toFixed(1)}`
      )
      .join(' ');
  }, [series, minVal, maxVal]);

  const areaFillPath = useMemo(() => {
    if (series.length === 0) return '';
    const lastX = xForIdx(series.length - 1).toFixed(1);
    const firstX = xForIdx(0).toFixed(1);
    const bottomY = (margin.top + plotH).toFixed(1);
    return `${areaLinePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [areaLinePath, series.length, plotH]);

  const yTicks = useMemo(() => {
    const steps = 4;
    const arr: number[] = [];
    for (let i = 0; i <= steps; i++) {
      arr.push(minVal + ((maxVal - minVal) * i) / steps);
    }
    return arr;
  }, [minVal, maxVal]);

  const xTickIndices = useMemo(() => {
    if (series.length < 2) return [0];
    const count = 6;
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      out.push(Math.round((i / (count - 1)) * (series.length - 1)));
    }
    return out;
  }, [series.length]);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || series.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const clampedX = Math.max(margin.left, Math.min(margin.left + plotW, relX));
    const idx = Math.round(((clampedX - margin.left) / plotW) * (series.length - 1));
    setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)));
  };

  const activePoint = hoverIdx !== null ? series[hoverIdx] : series[series.length - 1];
  const activeX = hoverIdx !== null ? xForIdx(hoverIdx) : null;
  const activeY = hoverIdx !== null && activePoint ? yForVal(activePoint.close) : null;
  const baselineY = yForVal(prevClose);

  const candleWidth = Math.max(3, Math.min(11, (plotW / Math.max(series.length, 1)) * 0.62));

  return (
    <div className="w-full select-none">
      {/* Top OHLC / Period readout */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-[#131722] dark:text-[#F0F3FA] tabular-nums">
              {formatPrice(activePoint?.close ?? symbol.price, symbol.decimals)}
            </span>
            {symbol.unit && (
              <span className="text-xs font-medium text-[#6A6D78] dark:text-[#868993]">
                {symbol.unit}
              </span>
            )}
          </div>
          <div
            className={`flex items-center gap-1 font-mono text-sm font-semibold tabular-nums ${
              isPositive ? 'text-[#089981]' : 'text-[#F23645]'
            }`}
          >
            <span>{isPositive ? '▲' : '▼'}</span>
            <span>
              {isPositive ? '+' : ''}
              {formatPrice(tfDelta, symbol.decimals)}
            </span>
            <span>
              ({isPositive ? '+' : ''}
              {tfDeltaPct.toFixed(2)}%)
            </span>
            <span className="ml-1 font-sans text-xs font-normal text-[#6A6D78] dark:text-[#868993]">
              {timeframe === '1D' ? 'Today' : `${timeframe} change`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activePoint && (
            <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-[#6A6D78] dark:text-[#868993] tabular-nums">
              <span>O {formatPrice(activePoint.open, symbol.decimals)}</span>
              <span>H {formatPrice(activePoint.high, symbol.decimals)}</span>
              <span>L {formatPrice(activePoint.low, symbol.decimals)}</span>
              <span>C {formatPrice(activePoint.close, symbol.decimals)}</span>
            </div>
          )}

          <div className="flex items-center rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] bg-[#F8F9FD] dark:bg-[#1E222D] p-0.5">
            <button
              type="button"
              onClick={() => setChartStyle('area')}
              title="Area chart"
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                chartStyle === 'area'
                  ? 'bg-white dark:bg-[#2A2E39] text-[#131722] dark:text-white shadow-xs'
                  : 'text-[#6A6D78] dark:text-[#868993] hover:text-[#131722] dark:hover:text-white'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {!compact && <span>Area</span>}
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('candles')}
              title="Candlestick chart"
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                chartStyle === 'candles'
                  ? 'bg-white dark:bg-[#2A2E39] text-[#131722] dark:text-white shadow-xs'
                  : 'text-[#6A6D78] dark:text-[#868993] hover:text-[#131722] dark:hover:text-white'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              {!compact && <span>Candles</span>}
            </button>
          </div>

          {onExpandClick && (
            <button
              type="button"
              onClick={onExpandClick}
              className="flex items-center gap-1.5 rounded-lg border border-[#E0E3EB] dark:border-[#2A2E39] px-2.5 py-1.5 text-xs font-medium text-[#131722] dark:text-[#D1D4DC] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] transition-colors whitespace-nowrap shrink-0"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Superchart</span>
            </button>
          )}
        </div>
      </div>

      {/* Main SVG Plot */}
      <div className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIdx(null)}
          role="img"
          aria-label={`${symbol.name} ${timeframe} interactive price chart`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.24" />
              <stop offset="92%" stopColor={accentColor} stopOpacity="0.02" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Right Y-Axis Ticks */}
          {yTicks.map((tick, idx) => {
            const y = yForVal(tick);
            return (
              <g key={idx}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotW}
                  y2={y}
                  className="stroke-[#E0E3EB]/75 dark:stroke-[#2A2E39]/80"
                  strokeWidth="1"
                />
                <text
                  x={margin.left + plotW + 8}
                  y={y + 3.5}
                  className="fill-[#6A6D78] dark:fill-[#868993] text-[10.5px] font-mono tabular-nums"
                >
                  {formatPrice(tick, symbol.decimals)}
                </text>
              </g>
            );
          })}

          {/* Baseline / Previous Close */}
          <line
            x1={margin.left}
            y1={baselineY}
            x2={margin.left + plotW}
            y2={baselineY}
            className="stroke-[#9598A1] dark:stroke-[#5D606B]"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* X-Axis Timestamps */}
          {xTickIndices.map((ptIdx) => {
            const pt = series[ptIdx];
            if (!pt) return null;
            const x = xForIdx(ptIdx);
            return (
              <text
                key={ptIdx}
                x={x}
                y={svgHeight - 6}
                textAnchor="middle"
                className="fill-[#6A6D78] dark:fill-[#868993] text-[10.5px] font-mono"
              >
                {pt.time}
              </text>
            );
          })}

          {/* Chart Series: Area or Candles */}
          {chartStyle === 'area' ? (
            <>
              <path d={areaFillPath} fill={`url(#${gradId})`} />
              <path
                d={areaLinePath}
                fill="none"
                stroke={accentColor}
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <g>
              {series.map((pt, idx) => {
                const cx = xForIdx(idx);
                const yOpen = yForVal(pt.open);
                const yClose = yForVal(pt.close);
                const yHigh = yForVal(pt.high);
                const yLow = yForVal(pt.low);
                const up = pt.close >= pt.open;
                const color = up ? '#089981' : '#F23645';
                const top = Math.min(yOpen, yClose);
                const bodyH = Math.max(1.5, Math.abs(yClose - yOpen));
                return (
                  <g key={idx}>
                    <line
                      x1={cx}
                      y1={yHigh}
                      x2={cx}
                      y2={yLow}
                      stroke={color}
                      strokeWidth="1.2"
                    />
                    <rect
                      x={cx - candleWidth / 2}
                      y={top}
                      width={candleWidth}
                      height={bodyH}
                      fill={color}
                      rx="0.75"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Current Price Tag on Right Axis */}
          {hoverIdx === null && (
            <g transform={`translate(${margin.left + plotW + 2}, ${yForVal(lastClose) - 10})`}>
              <rect width="72" height="20" rx="3" fill={accentColor} />
              <text
                x="36"
                y="13.5"
                textAnchor="middle"
                className="fill-white text-[10.5px] font-mono font-semibold tabular-nums"
              >
                {formatPrice(lastClose, symbol.decimals)}
              </text>
            </g>
          )}

          {/* Crosshair on Hover */}
          {hoverIdx !== null && activeX !== null && activeY !== null && activePoint && (
            <g>
              <line
                x1={activeX}
                y1={margin.top}
                x2={activeX}
                y2={margin.top + plotH}
                className="stroke-[#787B86] dark:stroke-[#9598A1]"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1={margin.left}
                y1={activeY}
                x2={margin.left + plotW}
                y2={activeY}
                className="stroke-[#787B86] dark:stroke-[#9598A1]"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={activeX}
                cy={activeY}
                r="4.5"
                fill={accentColor}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Y-Axis Hover Tag */}
              <g transform={`translate(${margin.left + plotW + 2}, ${activeY - 10})`}>
                <rect width="72" height="20" rx="3" fill="#131722" />
                <text
                  x="36"
                  y="13.5"
                  textAnchor="middle"
                  className="fill-white text-[10.5px] font-mono font-semibold tabular-nums"
                >
                  {formatPrice(activePoint.close, symbol.decimals)}
                </text>
              </g>
              {/* X-Axis Hover Tag */}
              <g transform={`translate(${Math.max(24, Math.min(plotW - 24, activeX)) - 34}, ${svgHeight - 20})`}>
                <rect width="68" height="18" rx="3" fill="#131722" />
                <text
                  x="34"
                  y="12.5"
                  textAnchor="middle"
                  className="fill-white text-[10px] font-mono"
                >
                  {activePoint.time}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Timeframe Bar */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E0E3EB] dark:border-[#2A2E39] pt-2.5">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {TIMEFRAMES.map((tf) => {
            const active = tf === timeframe;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange(tf)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#2962FF]/12 text-[#2962FF] dark:bg-[#2962FF]/20 dark:text-[#5B8DEF]'
                    : 'text-[#6A6D78] dark:text-[#868993] hover:bg-[#F0F3FA] dark:hover:bg-[#2A2E39] hover:text-[#131722] dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-[#6A6D78] dark:text-[#868993] font-mono tabular-nums">
          {symbol.exchange}:{symbol.ticker} · Real-time simulation
        </div>
      </div>
    </div>
  );
};
