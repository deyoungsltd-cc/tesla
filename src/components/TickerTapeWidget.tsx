'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  symbols?: string[];
  colorTheme?: 'dark' | 'light';
  height?: number;
}

export default function TickerTapeWidget({ symbols, colorTheme = 'dark', height = 46 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptCreated = useRef(false);
  const [loaded, setLoaded] = useState(false);

  const defaultSymbols = [
    { proName: 'NASDAQ:TSLA', title: 'TSLA' },
    { proName: 'NASDAQ:GOOGL', title: 'GOOGL' },
    { proName: 'NASDAQ:AAPL', title: 'AAPL' },
    { proName: 'NASDAQ:AMZN', title: 'AMZN' },
    { proName: 'NASDAQ:MSFT', title: 'MSFT' },
    { proName: 'NASDAQ:NVDA', title: 'NVDA' },
    { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD' },
    { proName: 'BITSTAMP:ETHUSD', title: 'ETH/USD' },
  ];

  const symbolList = symbols?.map(s => ({ proName: s, title: s.split(':').pop() || s })) || defaultSymbols;

  useEffect(() => {
    if (!containerRef.current) return;
    if (scriptCreated.current) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      containerRef.current.innerHTML = '';

      const el = document.createElement('script');
      el.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      el.async = true;
      el.type = 'text/javascript';
      el.innerHTML = JSON.stringify({
        symbols: symbolList,
        showSymbolLogo: true,
        isTransparent: true,
        displayMode: 'adaptive',
        colorTheme,
        locale: 'en',
      });

      el.onload = () => setLoaded(true);
      el.onerror = () => {
        console.error('Ticker tape script failed to load');
        setTimeout(() => {
          if (containerRef.current && !scriptCreated.current) {
            const retry = document.createElement('script');
            retry.src = el.src;
            retry.async = true;
            retry.type = 'text/javascript';
            retry.innerHTML = el.innerHTML;
            containerRef.current.appendChild(retry);
            scriptCreated.current = true;
          }
        }, 2000);
      };

      containerRef.current.appendChild(el);
      scriptCreated.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, [colorTheme]);

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <div ref={containerRef} className="tradingview-widget-container w-full" />
    </div>
  );
}
