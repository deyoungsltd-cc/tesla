'use client';

import { useEffect, useRef } from 'react';

export default function TradingViewCryptoMarket() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = document.createElement('script');
    el.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    el.async = true;
    el.type = 'text/javascript';
    el.innerHTML = JSON.stringify({
      width: '100%',
      height: 400,
      defaultColumn: 'overview',
      defaultScreen: 'most_capitalized',
      market: 'crypto',
      showToolbar: true,
      colorTheme: 'dark',
      locale: 'en',
      isTransparent: true,
    });
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(el);
  }, []);

  return (
    <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
  );
}