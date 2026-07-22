'use client';

import { useEffect, useRef } from 'react';

interface Props {
  symbol?: string;
  colorTheme?: 'dark' | 'light';
  isTransparent?: boolean;
  height?: number;
  locale?: string;
}

export default function TradingViewTechnicalAnalysis({
  symbol = 'NASDAQ:TSLA',
  colorTheme = 'dark',
  isTransparent = true,
  locale = 'en',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = document.createElement('script');
    el.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    el.async = true;
    el.type = 'text/javascript';
    el.innerHTML = JSON.stringify({
      interval: '1h',
      width: '100%',
      isTransparent,
      height: 250,
      symbol,
      showIntervalTabs: true,
      colorTheme,
      locale,
    });
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(el);
  }, [symbol]);

  return (
    <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
  );
}