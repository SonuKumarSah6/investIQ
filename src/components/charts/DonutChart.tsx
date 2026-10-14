import React, { useState } from 'react';
import { formatINR } from '../../utils/formatters';

interface DonutSlice {
  label: string;
  value: number;
  color: string;
  count?: number;
}

interface DonutChartProps {
  slices: DonutSlice[];
  totalValue: number;
  centerTitle?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  slices,
  totalValue,
  centerTitle = 'Portfolio',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (totalValue <= 0 || slices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
        <p className="text-sm">No asset allocation data yet.</p>
        <p className="text-xs text-slate-600 mt-1">Execute virtual trades to build positions.</p>
      </div>
    );
  }

  // Donut geometry
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const currentHovered = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0 w-[180px] h-[180px]">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 select-none overflow-visible"
        >
          {slices.map((slice, idx) => {
            const percent = slice.value / totalValue;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
          <span className="text-[11px] font-medium text-slate-400">
            {currentHovered ? currentHovered.label : centerTitle}
          </span>
          <span className="text-sm font-bold text-white font-mono mt-0.5">
            {currentHovered
              ? `${((currentHovered.value / totalValue) * 100).toFixed(1)}%`
              : formatINR(totalValue, false)}
          </span>
        </div>
      </div>

      {/* Clean Legend list (Zero-pill text design) */}
      <div className="flex-1 w-full flex flex-col gap-2">
        {slices.map((slice, idx) => {
          const percent = ((slice.value / totalValue) * 100).toFixed(1);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={slice.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between text-xs py-1 px-2 rounded cursor-pointer transition-colors ${
                isHovered ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-slate-300 font-medium truncate">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
                <span className="text-slate-400">{formatINR(slice.value, false)}</span>
                <span className="text-slate-200 font-semibold">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
