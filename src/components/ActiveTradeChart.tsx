'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

/**
 * ActiveTradeChart
 *
 * A live, animated chart that simulates an "active trade" on the user's
 * investment portfolio.
 *
 * BEHAVIOR:
 *   - Only renders the live chart if `investedAmount > 0`.
 *     If the user has no active investments, renders a "Start investing
 *     to activate your live trade" placeholder instead.
 *
 *   - `startBalance` defaults to `investedAmount`. Larger investments
 *     produce larger absolute swings (the magnitude is scaled as a
 *     percentage of startBalance), so the chart visibly reflects the
 *     size of the user's position.
 *
 *   - Polls `/api/chart-events` every 5 seconds. When the admin fires
 *     a "spike" from the admin panel, the next tick on this chart
 *     jumps by the configured magnitude (e.g. +10%, -5%) instead of
 *     the usual small random move. Each spike fires exactly once
 *     (the API marks it consumed on read).
 *
 *   - A toast-style banner appears briefly when a spike fires, showing
 *     the direction (+/-), the magnitude, and the optional admin message.
 *
 * Props:
 *   - investedAmount: total $ currently in active investments
 *                    (if 0 → show placeholder)
 *   - startBalance:   starting portfolio value for the chart
 *                    (defaults to investedAmount)
 *   - ticker:         label shown next to the pulse (defaults to 'TSLA')
 *   - pollIntervalMs: how often to check for admin spikes (default 5000)
 */

interface Tick {
  t: string;       // HH:MM:SS
  v: number;       // value at this tick
}

interface SpikeEvent {
  id: string;
  direction: 'up' | 'down';
  magnitudePct: number;
  message: string | null;
  createdAt: string;
}

interface Props {
  investedAmount?: number;
  startBalance?: number;
  ticker?: string;
  pollIntervalMs?: number;
}

const DEFAULT_START = 10000;

export default function ActiveTradeChart({
  investedAmount = 0,
  startBalance,
  ticker = 'TSLA',
  pollIntervalMs = 5000,
}: Props) {
  // ── Resolve the actual starting balance ──
  // If caller passes startBalance explicitly, use it; otherwise use investedAmount;
  // otherwise fall back to default (only happens if caller passes neither).
  const effectiveStart =
    startBalance ?? (investedAmount > 0 ? investedAmount : DEFAULT_START);

  // ── If user has no active investments → show placeholder ──
  if (investedAmount <= 0) {
    return <InvestmentPlaceholder />;
  }

  return (
    <LiveChart
      investedAmount={investedAmount}
      startBalance={effectiveStart}
      ticker={ticker}
      pollIntervalMs={pollIntervalMs}
    />
  );
}

// ════════════════════════════════════════════════════════
// PLACEHOLDER (shown when user has 0 active investments)
// ════════════════════════════════════════════════════════

function InvestmentPlaceholder() {
  return (
    <div className="bg-tesla-card border border-tesla-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-tesla-border flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5 opacity-50">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-500" />
        </span>
        <span className="text-gray-500 font-bold text-sm">TSLA</span>
        <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-800/40 text-gray-500 border border-gray-700/40 text-[10px] font-bold uppercase tracking-wider">
          Trade Idle
        </span>
      </div>
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/50 border border-gray-700/50 mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <p className="text-white font-semibold text-sm">
          Activate your live trade
        </p>
        <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">
          Your live trade chart will start moving the moment you invest.
          Pick a plan on the <span className="text-tesla-red">Investments</span> page to begin.
        </p>
        <a
          href="/investments"
          className="inline-block mt-4 px-4 py-2 rounded-md bg-tesla-red text-white text-xs font-semibold hover:bg-red-700 transition-colors"
        >
          Browse Plans
        </a>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// LIVE CHART
// ════════════════════════════════════════════════════════

function LiveChart({
  investedAmount,
  startBalance,
  ticker,
  pollIntervalMs,
}: {
  investedAmount: number;
  startBalance: number;
  ticker: string;
  pollIntervalMs: number;
}) {
  // ── Seed an initial 30-tick history so the chart isn't empty on mount ──
  const initialHistory: Tick[] = useMemo(() => {
    const now = Date.now();
    const arr: Tick[] = [];
    let v = startBalance;
    for (let i = 29; i >= 0; i--) {
      const drift = (Math.random() - 0.45) * (startBalance * 0.004);
      v = Math.max(startBalance * 0.95, v + drift);
      const d = new Date(now - i * 2000);
      arr.push({
        t: d.toLocaleTimeString('en-US', { hour12: false }),
        v: Number(v.toFixed(2)),
      });
    }
    return arr;
  }, [startBalance]);

  const [history, setHistory] = useState<Tick[]>(initialHistory);
  const [paused, setPaused] = useState(false);
  const [lastSpikeBanner, setLastSpikeBanner] = useState<SpikeEvent | null>(null);

  // Refs for the tick loop:
  //   pendingSpike: when set, the next tick applies this spike instead of a normal move
  //   startBalanceRef: latest startBalance so the interval closure always sees fresh value
  const pendingSpikeRef = useRef<SpikeEvent | null>(null);
  const startBalanceRef = useRef(startBalance);
  startBalanceRef.current = startBalance;

  // ── Poll for admin spikes ──
  useEffect(() => {
    let cancelled = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const poll = async () => {
      try {
        const res = await fetch('/api/chart-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        const spikes: SpikeEvent[] = json?.data?.spikes || [];
        if (spikes.length > 0) {
          // Apply the most recent spike (other unconsumed spikes are
          // already marked consumed by the API, so they won't fire twice).
          const latest = spikes[spikes.length - 1];
          pendingSpikeRef.current = latest;
          setLastSpikeBanner(latest);
          // Auto-hide the banner after 6 seconds
          setTimeout(() => {
            if (!cancelled) setLastSpikeBanner(null);
          }, 6000);
        }
      } catch {
        /* swallow — polling is best-effort */
      }
    };

    poll(); // fire once immediately
    const id = setInterval(poll, pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pollIntervalMs]);

  // ── Tick loop (every 2s) ──
  useEffect(() => {
    if (paused) return;

    const id = setInterval(() => {
      setHistory((prev) => {
        const last = prev[prev.length - 1]?.v ?? startBalanceRef.current;
        const start = startBalanceRef.current;
        let next: number;

        const spike = pendingSpikeRef.current;
        if (spike) {
          // ── Apply spike: jump by magnitudePct of startBalance ──
          const sign = spike.direction === 'up' ? 1 : -1;
          const jump = start * (spike.magnitudePct / 100);
          next = Math.max(start * 0.5, last + sign * jump);
          pendingSpikeRef.current = null; // consume locally
        } else {
          // ── Normal biased-up random walk ──
          // Magnitude scales with invested amount (bigger position = bigger swings).
          const dir = Math.random() < 0.55 ? 1 : -1;
          const magnitude = Math.random() * (start * 0.006);
          const volatilitySpike =
            Math.random() < 0.05 ? (Math.random() - 0.5) * (start * 0.02) : 0;
          next = Math.max(start * 0.85, last + dir * magnitude + volatilitySpike);
        }

        const d = new Date();
        const tick: Tick = {
          t: d.toLocaleTimeString('en-US', { hour12: false }),
          v: Number(next.toFixed(2)),
        };
        return [...prev, tick].slice(-30);
      });
    }, 2000);

    return () => clearInterval(id);
  }, [paused]);

  const current = history[history.length - 1]?.v ?? startBalance;
  const delta = current - startBalance;
  const deltaPct = (delta / startBalance) * 100;
  const isUp = delta >= 0;

  const strokeColor = isUp ? '#22c55e' : '#ef4444';
  const gradientId = isUp ? 'grad-up' : 'grad-down';

  return (
    <div className="bg-tesla-card border border-tesla-border rounded-2xl overflow-hidden relative">
      {/* Spike banner */}
      {lastSpikeBanner && (
        <div
          className={`absolute top-0 left-0 right-0 z-10 px-4 py-2 text-xs font-semibold flex items-center gap-2 ${
            lastSpikeBanner.direction === 'up'
              ? 'bg-green-900/60 text-green-300 border-b border-green-700/50'
              : 'bg-red-900/60 text-red-300 border-b border-red-700/50'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {lastSpikeBanner.direction === 'up' ? (
              <polyline points="6 15 12 9 18 15" />
            ) : (
              <polyline points="6 9 12 15 18 9" />
            )}
          </svg>
          <span>
            {lastSpikeBanner.direction === 'up' ? '+' : '-'}
            {lastSpikeBanner.magnitudePct}% market move
          </span>
          {lastSpikeBanner.message && (
            <span className="opacity-70 font-normal truncate">
              · {lastSpikeBanner.message}
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-3 border-b border-tesla-border flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-white font-bold text-sm">{ticker}</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-700/40 text-[10px] font-bold uppercase tracking-wider">
            Trade Active
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider">Live P&amp;L</p>
            <p className={`font-bold text-sm ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              {isUp ? '+' : ''}${delta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="ml-1 text-[10px]">
                ({isUp ? '+' : ''}{deltaPct.toFixed(2)}%)
              </span>
            </p>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="text-[10px] font-semibold px-2 py-1 rounded-md border border-tesla-border text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            title={paused ? 'Resume live feed' : 'Pause live feed'}
          >
            {paused ? 'PAUSED' : 'LIVE'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-gray-500 text-[10px] uppercase">Current Value</p>
              <p className="text-white text-lg font-bold">
                ${current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-px h-8 bg-tesla-border" />
            <div>
              <p className="text-gray-500 text-[10px] uppercase">Invested</p>
              <p className="text-gray-300 text-sm font-semibold">
                ${investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-px h-8 bg-tesla-border" />
            <div>
              <p className="text-gray-500 text-[10px] uppercase">Status</p>
              <p className="text-green-400 text-sm font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Trading
              </p>
            </div>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-up" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-down" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                tick={{ fill: '#6b7280', fontSize: 9 }}
                axisLine={{ stroke: '#2a2a2a' }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={['dataMin - 50', 'dataMax + 50']}
                tick={{ fill: '#6b7280', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(v: any) => [`$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Value']}
              />
              <ReferenceLine
                y={startBalance}
                stroke="#4b5563"
                strokeDasharray="4 4"
                label={{ value: 'Entry', fill: '#6b7280', fontSize: 9, position: 'insideTopLeft' }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-gray-600 text-[10px] mt-2">
          Live simulated trade indicator. Performance updates every 2 seconds. Invested: ${investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
        </p>
      </div>
    </div>
  );
}
