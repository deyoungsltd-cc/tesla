'use client';

import { useEffect, useRef } from 'react';

interface Props {
  colorTheme?: 'dark' | 'light';
  dataSource?: string;
}

export default function TradingViewMarketOverview({
  colorTheme = 'dark',
  dataSource = 'NASDAQ',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
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
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(el);
  }, [colorTheme]);

  return (
    <div ref={containerRef} className="w-full rounded-lg overflow-hidden" style={{ height: 500 }} />
  );
}