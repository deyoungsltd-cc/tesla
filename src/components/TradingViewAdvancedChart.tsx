'use client';

import { useEffect, useRef, useState } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetHeight, setWidgetHeight] = useState(height);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setWidgetHeight(Math.min(Math.max(w * 0.65, 280), 550));
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const widgetDiv = containerRef.current.querySelector('.tradingview-widget-container__widget');
    if (widgetDiv) return; // already loaded

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
    containerRef.current.appendChild(el);
  }, [symbol, interval, theme, style, locale, toolbar_bg]);

  return (
    <div ref={containerRef} className="w-full rounded-lg overflow-hidden" style={{ height: `${widgetHeight}px` }}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}