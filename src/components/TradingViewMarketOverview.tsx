'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  colorTheme?: 'dark' | 'light';
  dataSource?: string;
}

export default function TradingViewMarketOverview({
  colorTheme = 'dark',
  dataSource = 'NASDAQ',
}: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const mountedRef = useRef(false);

  const loadWidget = useCallback(() => {
    if (!innerRef.current) return;
    innerRef.current.innerHTML = '';

    const el = document.createElement('script');
    el.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    el.async = true;
    el.type = 'text/javascript';
    el.innerHTML = JSON.stringify({
      colorTheme,
      dateRange: '1D',
      showChart: true,
      locale: 'en',
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      width: '100%',
      height: '100%',
      tabs: [
        {
          title: 'Indices',
          symbols: [
            { s: 'NASDAQ:NDX', d: 'Nasdaq 100' },
            { s: 'NASDAQ:IXIC', d: 'NASDAQ' },
            { s: 'FOREXCOM:SPXUSD', d: 'S&P 500' },
            { s: 'FOREXCOM:DJI', d: 'Dow 30' },
          ],
          originalTitle: 'Indices',
        },
        {
          title: 'Tech',
          symbols: [
            { s: 'NASDAQ:TSLA', d: 'Tesla' },
            { s: 'NASDAQ:AAPL', d: 'Apple' },
            { s: 'NASDAQ:GOOGL', d: 'Google' },
            { s: 'NASDAQ:MSFT', d: 'Microsoft' },
            { s: 'NASDAQ:NVDA', d: 'NVIDIA' },
            { s: 'NASDAQ:AMZN', d: 'Amazon' },
            { s: 'NASDAQ:META', d: 'Meta' },
          ],
          originalTitle: 'Tech',
        },
        {
          title: 'Crypto',
          symbols: [
            { s: 'BITSTAMP:BTCUSD', d: 'Bitcoin' },
            { s: 'BITSTAMP:ETHUSD', d: 'Ethereum' },
            { s: 'BITSTAMP:SOLUSD', d: 'Solana' },
            { s: 'COINBASE:XRPUSD', d: 'XRP' },
          ],
          originalTitle: 'Crypto',
        },
      ],
    });

    const timeoutId = setTimeout(() => setTimedOut(true), 20000);

    el.onload = () => { clearTimeout(timeoutId); setLoaded(true); };
    el.onerror = () => { clearTimeout(timeoutId); setTimedOut(true); };

    innerRef.current.appendChild(el);
  }, [colorTheme]);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      if (mountedRef.current) loadWidget();
    }, 150);
    return () => { mountedRef.current = false; clearTimeout(timer); };
  }, [loadWidget]);

  return (
    <div ref={outerRef} className="w-full relative" style={{ height: 500 }}>
      <div ref={innerRef} className="w-full h-full" />
      {!loaded && !timedOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#CC0000]/30 border-t-[#CC0000] rounded-full animate-spin" />
            <span className="text-gray-600 text-xs">Loading market data...</span>
          </div>
        </div>
      )}
      {timedOut && !loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
          <div className="flex flex-col items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><path d="M12 9v4"/><circle cx="12" cy="16" r="0.5" fill="#555"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            <span className="text-gray-500 text-xs">Market data unavailable</span>
            <button onClick={() => { setTimedOut(false); setLoaded(false); loadWidget(); }} className="text-[#CC0000] text-[10px] font-medium hover:underline">Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}
