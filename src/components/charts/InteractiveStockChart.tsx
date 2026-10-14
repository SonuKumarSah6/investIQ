import React, { useState, useRef, useMemo } from 'react';
import { StockHistoricalPoint } from '../../types';
import { formatINR, formatPercent } from '../../utils/formatters';

interface InteractiveStockChartProps {
  historyMap: {
    '1D': StockHistoricalPoint[];
    '1W': StockHistoricalPoint[];
    '1M': StockHistoricalPoint[];
    '1Y': StockHistoricalPoint[];
    'ALL': StockHistoricalPoint[];
  };
  currentPrice: number;
  symbol: string;
}

export const InteractiveStockChart: React.FC<InteractiveStockChartProps> = ({
  historyMap,
  currentPrice,
  symbol,
}) => {
  const timeframes = ['1D', '1W', '1M', '1Y', 'ALL'] as const;

  // Prefer 1M or 1W on load to show rich multi-day trend line immediately
  const initialTf = useMemo<'1D' | '1W' | '1M' | '1Y' | 'ALL'>(() => {
    if (historyMap['1M'] && historyMap['1M'].length > 1) return '1M';
    if (historyMap['1W'] && historyMap['1W'].length > 1) return '1W';
    if (historyMap['ALL'] && historyMap['ALL'].length > 1) return 'ALL';
    return '1D';
  }, [historyMap]);

  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>(initialTf);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const points = useMemo(() => {
    return historyMap[timeframe] || [];
  }, [historyMap, timeframe]);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;
  const displayPrice = activePoint ? activePoint.price : currentPrice;

  const firstPrice = points.length > 0 ? points[0].price : currentPrice;
  const isPositive = displayPrice >= firstPrice;
  const periodChange = displayPrice - firstPrice;
  const periodChangePercent = firstPrice > 0 ? (periodChange / firstPrice) * 100 : 0;

  // Chart dimensions
  const width = 680;
  const height = 280;
  const padding = { top: 20, right: 16, bottom: 32, left: 16 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minPrice = useMemo(() => {
    if (points.length === 0) return 0;
    return Math.min(...points.map((p) => p.low || p.price)) * 0.998;
  }, [points]);

  const maxPrice = useMemo(() => {
    if (points.length === 0) return 100;
    return Math.max(...points.map((p) => p.high || p.price)) * 1002 / 1000;
  }, [points]);

  const priceRange = maxPrice - minPrice || 1;

  // Calculate coordinates
  const svgPoints = useMemo(() => {
    if (points.length <= 1) return [];
    return points.map((p, idx) => {
      const x = padding.left + (idx / (points.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((p.price - minPrice) / priceRange) * chartHeight;
      return { x, y, point: p };
    });
  }, [points, minPrice, priceRange, chartWidth, chartHeight, padding.left, padding.top]);

  const linePathD = useMemo(() => {
    if (svgPoints.length === 0) return '';
    return `M ${svgPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  }, [svgPoints]);

  const areaPathD = useMemo(() => {
    if (svgPoints.length === 0) return '';
    const bottomY = padding.top + chartHeight;
    const firstX = svgPoints[0].x.toFixed(1);
    const lastX = svgPoints[svgPoints.length - 1].x.toFixed(1);
    return `${linePathD} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [linePathD, svgPoints, padding.top, chartHeight]);

  // Handle pointer hover
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!containerRef.current || svgPoints.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * width;

    let closestIdx = 0;
    let minDistance = Infinity;

    svgPoints.forEach((p, idx) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const strokeColor = isPositive ? '#10B981' : '#F43F5E';
  const gradientId = `chartGradient-${symbol}-${timeframe}`;

  return (
    <div className="w-full flex flex-col bg-[#0F172A]/70 border border-slate-800/80 rounded-xl p-4 lg:p-6" ref={containerRef}>
      {/* Chart Top Header & Price Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-mono">
              {formatINR(displayPrice)}
            </span>
            <span
              className={`text-sm font-semibold font-mono ${
                periodChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {periodChange >= 0 ? '+' : ''}
              {formatINR(periodChange)} ({formatPercent(periodChangePercent)})
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {activePoint ? (
              <span>
                Trading Date: <strong className="text-slate-200 font-mono">{activePoint.date}</strong> · Volume: {activePoint.volume.toLocaleString('en-IN')} shares
              </span>
            ) : points.length > 1 ? (
              <span>
                Range: <span className="text-slate-300 font-mono">{points[0].date}</span> to <span className="text-slate-300 font-mono">{points[points.length - 1].date}</span> ({points.length} authentic sessions) · Resolution: Daily EOD
              </span>
            ) : points.length === 1 ? (
              <span>
                End-of-day single session: <span className="text-slate-300 font-mono">{points[0].date}</span>
              </span>
            ) : (
              <span className="text-rose-400">No genuine historical candles available</span>
            )}
          </div>
        </div>

        {/* Timeframe Segmented Control (Only switchable if points exist for timeframe) */}
        <div className="inline-flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg self-start sm:self-auto">
          {timeframes.map((tf) => {
            const hasData = Boolean(historyMap[tf] && historyMap[tf].length > 0);
            return (
              <button
                key={tf}
                type="button"
                disabled={!hasData}
                onClick={() => {
                  setTimeframe(tf);
                  setHoverIndex(null);
                }}
                title={hasData ? `View ${tf} historical candles (${historyMap[tf].length} sessions)` : `No ${tf} data recorded`}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  timeframe === tf
                    ? 'bg-slate-700/80 text-white shadow-sm'
                    : hasData
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    : 'text-slate-600 cursor-not-allowed opacity-40'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas or Honest State */}
      {points.length === 0 ? (
        <div className="w-full aspect-[21/9] min-h-[200px] flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-center">
          <div className="text-sm font-semibold text-slate-300">No historical market data available</div>
          <p className="text-xs text-slate-500 max-w-md mt-1">
            Genuine historical Bhavcopy records for {symbol} under the {timeframe} interval could not be retrieved from TejHQ. InvestIQ strictly prohibits synthetic or invented chart points.
          </p>
        </div>
      ) : points.length === 1 ? (
        <div className="w-full aspect-[21/9] min-h-[200px] flex flex-col justify-center p-6 border border-slate-800 rounded-xl bg-slate-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
            <span>End-of-Day Snapshot for <strong className="text-white font-mono">{points[0].date}</strong></span>
            <span className="text-emerald-400 font-mono font-semibold">1 Trading Session</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Open</span>
              <span className="text-base text-white font-bold">{formatINR(points[0].open || points[0].price)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Day High</span>
              <span className="text-base text-emerald-400 font-bold">{formatINR(points[0].high || points[0].price)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Day Low</span>
              <span className="text-base text-rose-400 font-bold">{formatINR(points[0].low || points[0].price)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Day Close</span>
              <span className="text-base text-white font-bold">{formatINR(points[0].close || points[0].price)}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Volume: <strong className="text-slate-200">{points[0].volume.toLocaleString('en-IN')}</strong> shares</span>
            <span className="text-slate-500 italic">Select 1W, 1M, 1Y, or ALL above to plot multi-session trend lines.</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full aspect-[21/9] min-h-[220px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible select-none cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={width - padding.right}
              y2={padding.top}
              stroke="#1E293B"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <line
              x1={padding.left}
              y1={padding.top + chartHeight / 2}
              x2={width - padding.right}
              y2={padding.top + chartHeight / 2}
              stroke="#1E293B"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={width - padding.right}
              y2={padding.top + chartHeight}
              stroke="#1E293B"
              strokeDasharray="4 4"
              strokeWidth="1"
            />

            {/* Area fill */}
            {areaPathD && <path d={areaPathD} fill={`url(#${gradientId})`} />}

            {/* Main trend line */}
            {linePathD && (
              <path
                d={linePathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hover Crosshair & Data Indicator */}
            {hoverIndex !== null && svgPoints[hoverIndex] && (
              <g>
                <line
                  x1={svgPoints[hoverIndex].x}
                  y1={padding.top}
                  x2={svgPoints[hoverIndex].x}
                  y2={padding.top + chartHeight}
                  stroke="#64748B"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={svgPoints[hoverIndex].x}
                  cy={svgPoints[hoverIndex].y}
                  r="4.5"
                  fill={strokeColor}
                  stroke="#0F172A"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* X Axis Date Labels */}
            {svgPoints.length > 0 && (
              <g className="text-[10px] fill-slate-500 font-mono select-none">
                <text x={padding.left} y={height - 10} textAnchor="start">
                  {svgPoints[0].point.date}
                </text>
                {svgPoints.length > 2 && (
                  <text
                    x={padding.left + chartWidth / 2}
                    y={height - 10}
                    textAnchor="middle"
                  >
                    {svgPoints[Math.floor(svgPoints.length / 2)].point.date}
                  </text>
                )}
                <text x={width - padding.right} y={height - 10} textAnchor="end">
                  {svgPoints[svgPoints.length - 1].point.date}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}

      {/* Day Range Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Period Low:</span>
          <span className="font-mono text-slate-300">{formatINR(minPrice)}</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          GENUINE EOD MARKET CANDLES · TEJHQ BHAVCOPY
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Period High:</span>
          <span className="font-mono text-slate-300">{formatINR(maxPrice)}</span>
        </div>
      </div>
    </div>
  );
};
