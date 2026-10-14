import React, { useState, useMemo } from 'react';
import { formatINR, formatPercent } from '../../utils/formatters';
import { PortfolioSnapshot } from '../../types';

interface PortfolioTrendChartProps {
  currentValue: number;
  initialValue?: number;
  totalGain: number;
  totalGainPercent: number;
  snapshots?: PortfolioSnapshot[];
}

export const PortfolioTrendChart: React.FC<PortfolioTrendChartProps> = ({
  currentValue,
  initialValue = 1000000,
  totalGain,
  totalGainPercent,
  snapshots = [],
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    value: number;
    sublabel?: string;
  } | null>(null);

  // Construct true historical points from recorded snapshots without fabrication
  const pointsData = useMemo(() => {
    // Sort snapshots ascending by timestamp
    const sortedSnaps = [...snapshots]
      .filter((s) => s.totalPortfolioValue > 0)
      .sort((a, b) => a.timestamp - b.timestamp);

    const pts: Array<{ label: string; value: number; sublabel?: string }> = [
      {
        label: 'Inception',
        value: initialValue,
        sublabel: 'Account Opening Capital',
      },
    ];

    // Add deduplicated/recorded snapshots
    sortedSnaps.forEach((s) => {
      pts.push({
        label: s.dateFormatted || 'Snapshot',
        value: s.totalPortfolioValue,
        sublabel: `Cash: ${formatINR(s.cash)} · Eq: ${formatINR(s.holdingsMarketValue)}`,
      });
    });

    // Add current live state if distinct or last point
    pts.push({
      label: 'Current Live',
      value: currentValue,
      sublabel: 'Verified Real Market Valuation',
    });

    return pts;
  }, [snapshots, initialValue, currentValue]);

  const min = Math.min(...pointsData.map((s) => s.value), initialValue * 0.98);
  const max = Math.max(...pointsData.map((s) => s.value), initialValue * 1.02);
  const range = max - min || 1;

  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 16, bottom: 26, left: 16 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;

  const points = pointsData.map((s, idx) => {
    const divisor = Math.max(1, pointsData.length - 1);
    const x = padding.left + (idx / divisor) * w;
    const y = padding.top + h - ((s.value - min) / range) * h;
    return { x, y, ...s };
  });

  const lineD = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  const areaD = `${lineD} L ${points[points.length - 1].x.toFixed(1)},${padding.top + h} L ${points[0].x.toFixed(1)},${padding.top + h} Z`;

  const isUp = currentValue >= initialValue;
  const color = isUp ? '#10B981' : '#F43F5E';
  const baselineY = padding.top + h - ((initialValue - min) / range) * h;

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs text-slate-400">Total Portfolio Valuation</span>
          <div className="text-xl font-bold font-mono text-white">
            {formatINR(hoveredPoint ? hoveredPoint.value : currentValue)}
          </div>
        </div>
        <div className="text-right">
          <span
            className={`text-xs font-semibold font-mono ${
              totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalGain >= 0 ? '+' : ''}
            {formatINR(totalGain)} ({formatPercent(totalGainPercent)})
          </span>
          <div className="text-[11px] text-slate-500 font-mono">
            {hoveredPoint ? hoveredPoint.label : 'Verified Total Return'}
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[25/9]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Baseline reference line for initial starting virtual cash */}
          <line
            x1={padding.left}
            y1={baselineY}
            x2={width - padding.right}
            y2={baselineY}
            stroke="#334155"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          <path d={areaD} fill="url(#portfolioGradient)" />
          <path
            d={lineD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.label === p.label ? 5.5 : 3.5}
                fill={color}
                className="cursor-pointer transition-all"
                onMouseEnter={() =>
                  setHoveredPoint({
                    label: p.label,
                    value: p.value,
                    sublabel: p.sublabel,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}

          {/* X axis labels */}
          <text x={padding.left} y={height - 6} className="text-[10px] fill-slate-500 font-mono">
            Start: {formatINR(initialValue)}
          </text>
          <text
            x={width - padding.right}
            y={height - 6}
            textAnchor="end"
            className="text-[10px] fill-slate-500 font-mono"
          >
            Latest: {formatINR(currentValue)}
          </text>
        </svg>
      </div>

      {hoveredPoint?.sublabel && (
        <div className="text-[11px] text-slate-400 mt-1 text-center font-mono">
          {hoveredPoint.label}: {hoveredPoint.sublabel}
        </div>
      )}

      {snapshots.length === 0 && (
        <div className="text-[11px] text-slate-500 mt-2 text-center">
          Tracking authentic trajectory from initial {formatINR(initialValue)} virtual capital. Cloud snapshots are recorded automatically.
        </div>
      )}
    </div>
  );
};
