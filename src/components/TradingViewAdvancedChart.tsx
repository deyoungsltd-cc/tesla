'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  symbol?: string;
  interval?: string;
  theme?: 'dark' | 'light';
  style?: string | number;
  locale?: string;
  toolbar_bg?: string;
  hide_side_toolbar?: boolean;
  allow_symbol_change?: boolean;
  studies?: string[];
  height?: number;
}

export default function TradingViewAdvancedChart({
  symbol = 'NASDAQ:TSLA',
  interval = 'D',
  theme = 'dark',
  style = '1',
  locale = 'en',
  toolbar_bg = '#1a1a1a',
  hide_side_toolbar = false,
  allow_symbol_change = true,
  studies = [],
  height = 400,
}: Props) {
  // Separate refs: outerRef for sizing, innerRef for the TradingView widget only
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [widgetHeight, setWidgetHeight] = useState(height);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    const updateHeight = () => {
      if (outerRef.current) {
        const w = outerRef.current.clientWidth;
        setWidgetHeight(Math.min(Math.max(w * 0.65, 280), 550));
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const loadWidget = useCallback(() => {
    if (!innerRef.current) return;

    // TradingView will wipe the inner container and inject its own DOM
    // We use innerRef so React never tries to manage children inside it
    innerRef.current.innerHTML = '';

    const el = document.createElement('script');
    el.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    el.async = true;
    el.type = 'text/javascript';
    el.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: 'Etc/UTC',
      theme,
      style,
      locale,
      toolbar_bg,
      enable_publishing: false,
      hide_side_toolbar,
      allow_symbol_change,
      save_image: false,
      calendar: false,
      studies: studies.length > 0 ? studies : ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
      support_host: 'https://www.tradingview.com',
    });

    // Timeout: if chart doesn't load in 20s, show error state
    const timeoutId = setTimeout(() => setTimedOut(true), 20000);

    el.onload = () => {
      clearTimeout(timeoutId);
      setLoaded(true);
    };
    el.onerror = () => {
      clearTimeout(timeoutId);
      console.error('TradingView chart script failed to load');
      setTimedOut(true);
    };

    innerRef.current.appendChild(el);
  }, [symbol, interval, theme, style, locale, toolbar_bg, hide_side_toolbar, allow_symbol_change, studies]);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      if (mountedRef.current) loadWidget();
    }, 150);
    return () => { mountedRef.current = false; clearTimeout(timer); };
  }, [loadWidget]);

  return (
    <div ref={outerRef} className="w-full relative" style={{ height: `${widgetHeight}px` }}>
      {/* TradingView widget container — React NEVER renders children here */}
      <div ref={innerRef} className="w-full h-full" />
      {/* Loading overlay — controlled by React, sits on top */}
      {!loaded && !timedOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#CC0000]/30 border-t-[#CC0000] rounded-full animate-spin" />
            <span className="text-gray-600 text-xs">Loading chart...</span>
          </div>
        </div>
      )}
      {timedOut && !loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
          <div className="flex flex-col items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><path d="M12 9v4"/><circle cx="12" cy="16" r="0.5" fill="#555"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            <span className="text-gray-500 text-xs">Chart unavailable</span>
            <button onClick={() => { setTimedOut(false); setLoaded(false); loadWidget(); }} className="text-[#CC0000] text-[10px] font-medium hover:underline">Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}
