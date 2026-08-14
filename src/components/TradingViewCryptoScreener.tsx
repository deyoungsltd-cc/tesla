'use client';

import { useEffect, useRef } from 'react';

export default function TradingViewCryptoMarket() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!innerRef.current) return;
    innerRef.current.innerHTML = '';
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
    innerRef.current.appendChild(el);
  }, []);

  return (
    <div ref={outerRef} className="w-full relative" style={{ minHeight: 400 }}>
      <div ref={innerRef} className="w-full" style={{ minHeight: 400 }} />
    </div>
  );
}
