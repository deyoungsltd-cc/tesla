'use client';

import React, { useState, useMemo, useCallback } from 'react';

// ════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════

interface InvestmentCorrelationChartProps {
  className?: string;
}

type Period = '7D' | '1M' | '3M' | '6M' | '1Y';

interface Series {
  label: string;
  color: string;
  data: number[];
}

// ════════════════════════════════════════════════════════════════
// Seeded PRNG for deterministic mock data
// ════════════════════════════════════════════════════════════════

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ════════════════════════════════════════════════════════════════
// Mock data generation
// ════════════════════════════════════════════════════════════════

function generateSeriesData(days: number, seed: number, config: {
  dailyDrift: number;
  volatility: number;
  meanRevertStrength?: number;
  maxDrawdown?: number;
}): number[] {
  const rng = createRng(seed);
  const data: number[] = [0];
  const mr = config.meanRevertStrength ?? 0;
  const maxDD = config.maxDrawdown ?? 0.5;

  for (let i = 1; i < days; i++) {
    const prev = data[i - 1];
    const noise = (rng() - 0.5) * 2 * config.volatility;
    const reversion = mr * (0 - prev / (i + 1));
    const change = config.dailyDrift + noise + reversion;
    let next = prev + change;
    const highSoFar = Math.max(...data.slice(0, i + 1));
    const minAllowed = highSoFar - maxDD * 100;
    next = Math.max(minAllowed, next);
    data.push(next);
  }
  return data;
}

function getDataForPeriod(period: Period): Series[] {
  const daysMap: Record<Period, number> = {
    '7D': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
  };
  const days = daysMap[period];
  const seedBase = days * 137;

  const portfolio = generateSeriesData(days, seedBase + 1, {
    dailyDrift: 1.5,
    volatility: 0.3,
    meanRevertStrength: 0.05,
    maxDrawdown: 0.02,
  });

  const tsla = generateSeriesData(days, seedBase + 2, {
    dailyDrift: 0.8,
    volatility: 3.5,
    meanRevertStrength: 0.02,
    maxDrawdown: 0.15,
  });

  const sp500 = generateSeriesData(days, seedBase + 3, {
    dailyDrift: 0.05,
    volatility: 0.8,
    meanRevertStrength: 0.1,
    maxDrawdown: 0.06,
  });

  const btc = generateSeriesData(days, seedBase + 4, {
    dailyDrift: 0.3,
    volatility: 5.0,
    meanRevertStrength: 0.01,
    maxDrawdown: 0.25,
  });

  return [
    { label: 'TPC Portfolio', color: '#22C55E', data: portfolio },
    { label: 'TSLA', color: '#EF4444', data: tsla },
    { label: 'S&P 500', color: '#3B82F6', data: sp500 },
    { label: 'BTC', color: '#F59E0B', data: btc },
  ];
}

// ════════════════════════════════════════════════════════════════
// SVG path builder
// ════════════════════════════════════════════════════════════════

interface ChartDimensions {
  svgWidth: number;
  svgHeight: number;
  padding: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
}

function buildSvgPath(
  data: number[],
  dims: ChartDimensions,
  globalMin: number,
  globalMax: number,
): string {
  const { padding, plotWidth, plotHeight } = dims;
  const range = globalMax - globalMin || 1;

  return data
    .map((val, i) => {
      const x = padding.left + (i / (data.length - 1)) * plotWidth;
      const y = padding.top + plotHeight - ((val - globalMin) / range) * plotHeight;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildAreaPath(
  data: number[],
  dims: ChartDimensions,
  globalMin: number,
  globalMax: number,
): string {
  const line = buildSvgPath(data, dims, globalMin, globalMax);
  const { padding, plotHeight, plotWidth } = dims;
  const lastX = padding.left + plotWidth;
  const firstX = padding.left;
  const baseline = padding.top + plotHeight;
  return `${line} L ${lastX.toFixed(2)} ${baseline} L ${firstX.toFixed(2)} ${baseline} Z`;
}

// ════════════════════════════════════════════════════════════════
// Period selector
// ════════════════════════════════════════════════════════════════

const PERIODS: Period[] = ['7D', '1M', '3M', '6M', '1Y'];

// ════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════

export default function InvestmentCorrelationChart({
  className,
}: InvestmentCorrelationChartProps) {
  const [activePeriod, setActivePeriod] = useState<Period>('1M');

  const handlePeriodChange = useCallback((p: Period) => {
    setActivePeriod(p);
  }, []);

  const series = useMemo(() => getDataForPeriod(activePeriod), [activePeriod]);

  const { globalMin, globalMax } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const s of series) {
      for (const v of s.data) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const pad = (max - min) * 0.08 || 1;
    return { globalMin: min - pad, globalMax: max + pad };
  }, [series]);

  const dims: ChartDimensions = useMemo(() => {
    const padding = { top: 12, right: 56, bottom: 28, left: 52 };
    const svgWidth = 800;
    const svgHeight = 360;
    return {
      svgWidth,
      svgHeight,
      padding,
      plotWidth: svgWidth - padding.left - padding.right,
      plotHeight: svgHeight - padding.top - padding.bottom,
    };
  }, []);

  const yTicks = useMemo(() => {
    const range = globalMax - globalMin;
    const step = range / 5;
    const ticks: number[] = [];
    for (let i = 0; i <= 5; i++) {
      ticks.push(globalMin + step * i);
    }
    return ticks;
  }, [globalMin, globalMax]);

  const xLabels = useMemo(() => {
    const n = series[0]?.data.length ?? 1;
    const labelCount = Math.min(6, n);
    const step = Math.floor((n - 1) / (labelCount - 1)) || 1;
    const labels: { index: number; text: string }[] = [];
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.min(i * step, n - 1);
      const daysAgo = n - 1 - idx;
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      const text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push({ index: idx, text });
    }
    return labels;
  }, [series]);

  const finalReturns = useMemo(() => {
    return series.map((s) => s.data[s.data.length - 1]);
  }, [series]);

  return (
    <div
      className={`bg-tesla-card border border-tesla-border rounded-2xl overflow-hidden animate-fade-in ${className ?? ''}`}
    >
      {/* Header */}
      <div className="px-4 sm:px-5 pt-4 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Investment Correlation
            </h3>
            <p className="text-[11px] text-tesla-gray-400 mt-0.5">
              Portfolio performance vs. market benchmarks
            </p>
          </div>

          <div className="flex items-center gap-1 bg-tesla-input rounded-lg p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-200 ${
                  activePeriod === p
                    ? 'bg-tesla-border text-white shadow-sm'
                    : 'text-tesla-gray-400 hover:text-tesla-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Legend with returns */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-3 border-b border-tesla-border/50">
          {series.map((s, i) => {
            const ret = finalReturns[i];
            const isPositive = ret >= 0;
            return (
              <div key={s.label} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-[11px] text-tesla-gray-300 font-medium">
                  {s.label}
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {ret.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 sm:px-3 pt-2 pb-3">
        <svg
          viewBox={`0 0 ${dims.svgWidth} ${dims.svgHeight}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Investment correlation chart showing portfolio performance vs market benchmarks"
        >
          <defs>
            {series.map((s, i) => (
              <linearGradient
                key={`grad-${i}`}
                id={`area-grad-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const range = globalMax - globalMin;
            const y =
              dims.padding.top +
              dims.plotHeight -
              ((tick - globalMin) / range) * dims.plotHeight;
            return (
              <line
                key={`grid-${i}`}
                x1={dims.padding.left}
                y1={y}
                x2={dims.padding.left + dims.plotWidth}
                y2={y}
                stroke="#333333"
                strokeWidth={0.5}
                strokeDasharray={i === 0 ? 'none' : '4 4'}
              />
            );
          })}

          {/* Y-axis labels */}
          {yTicks.map((tick, i) => {
            const range = globalMax - globalMin;
            const y =
              dims.padding.top +
              dims.plotHeight -
              ((tick - globalMin) / range) * dims.plotHeight;
            return (
              <text
                key={`ylabel-${i}`}
                x={dims.padding.left - 8}
                y={y + 3}
                textAnchor="end"
                fill="#737373"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
              >
                {tick >= 0 ? '+' : ''}
                {tick.toFixed(1)}%
              </text>
            );
          })}

          {/* X-axis labels */}
          {xLabels.map(({ index, text }, i) => {
            const n = series[0]?.data.length ?? 1;
            const x =
              dims.padding.left +
              (index / (n - 1)) * dims.plotWidth;
            return (
              <text
                key={`xlabel-${i}`}
                x={x}
                y={dims.svgHeight - 6}
                textAnchor="middle"
                fill="#737373"
                fontSize="10"
                fontFamily="ui-monospace, monospace"
              >
                {text}
              </text>
            );
          })}

          {/* Zero baseline */}
          {globalMin < 0 && globalMax > 0 && (
            <line
              x1={dims.padding.left}
              y1={
                dims.padding.top +
                dims.plotHeight -
                ((0 - globalMin) / (globalMax - globalMin)) * dims.plotHeight
              }
              x2={dims.padding.left + dims.plotWidth}
              y2={
                dims.padding.top +
                dims.plotHeight -
                ((0 - globalMin) / (globalMax - globalMin)) * dims.plotHeight
              }
              stroke="#555555"
              strokeWidth={0.8}
            />
          )}

          {/* Area fills */}
          {series.map((s, i) => (
            <path
              key={`area-${i}`}
              d={buildAreaPath(s.data, dims, globalMin, globalMax)}
              fill={`url(#area-grad-${i})`}
              stroke="none"
            />
          ))}

          {/* Line paths */}
          {series.map((s, i) => (
            <path
              key={`line-${i}`}
              d={buildSvgPath(s.data, dims, globalMin, globalMax)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.9}
            />
          ))}

          {/* End-of-line dots */}
          {series.map((s, i) => {
            const lastVal = s.data[s.data.length - 1];
            const range = globalMax - globalMin;
            const x = dims.padding.left + dims.plotWidth;
            const y =
              dims.padding.top +
              dims.plotHeight -
              ((lastVal - globalMin) / range) * dims.plotHeight;
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r={3.5}
                fill={s.color}
                stroke="#222222"
                strokeWidth={1.5}
              />
            );
          })}

          {/* End-of-line value labels */}
          {series.map((s, i) => {
            const lastVal = s.data[s.data.length - 1];
            const range = globalMax - globalMin;
            const x = dims.padding.left + dims.plotWidth + 6;
            const y =
              dims.padding.top +
              dims.plotHeight -
              ((lastVal - globalMin) / range) * dims.plotHeight;
            return (
              <text
                key={`endlabel-${i}`}
                x={x}
                y={y + 3}
                textAnchor="start"
                fill={s.color}
                fontSize="9"
                fontWeight="600"
                fontFamily="ui-monospace, monospace"
              >
                {lastVal >= 0 ? '+' : ''}{lastVal.toFixed(1)}%
              </text>
            );
          })}
        </svg>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-[10px] text-tesla-gray-500">
          Simulated correlation data for illustrative purposes only. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}
