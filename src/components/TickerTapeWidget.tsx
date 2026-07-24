'use client';

import { useEffect, useRef } from 'react';

interface Props {
  symbols?: string[];
  colorTheme?: 'dark' | 'light';
  height?: number;
}

export default function TickerTapeWidget({ symbols, colorTheme = 'dark', height = 46 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

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
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(el);
  }, []);

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div ref={containerRef} className="tradingview-widget-container w-full" />
    </div>
  );
}
