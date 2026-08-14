'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const mountedRef = useRef(false);

  const loadWidget = useCallback(() => {
    if (!innerRef.current) return;
    innerRef.current.innerHTML = '';

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

    const timeoutId = setTimeout(() => setTimedOut(true), 20000);

    el.onload = () => { clearTimeout(timeoutId); setLoaded(true); };
    el.onerror = () => { clearTimeout(timeoutId); setTimedOut(true); };

    innerRef.current.appendChild(el);
  }, [symbol, colorTheme, isTransparent, locale]);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      if (mountedRef.current) loadWidget();
    }, 200);
    return () => { mountedRef.current = false; clearTimeout(timer); };
  }, [loadWidget]);

  return (
    <div ref={outerRef} className="w-full relative" style={{ minHeight: 250 }}>
      <div ref={innerRef} className="w-full" style={{ minHeight: 250 }} />
      {!loaded && !timedOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#CC0000]/30 border-t-[#CC0000] rounded-full animate-spin" />
            <span className="text-gray-600 text-xs">Loading analysis...</span>
          </div>
        </div>
      )}
      {timedOut && !loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
          <div className="flex flex-col items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><path d="M12 9v4"/><circle cx="12" cy="16" r="0.5" fill="#555"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            <span className="text-gray-500 text-xs">Analysis unavailable</span>
            <button onClick={() => { setTimedOut(false); setLoaded(false); loadWidget(); }} className="text-[#CC0000] text-[10px] font-medium hover:underline">Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}
