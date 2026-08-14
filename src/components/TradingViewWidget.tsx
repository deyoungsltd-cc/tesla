'use client';

import { useEffect, useRef, useState } from 'react';

export default function TradingViewWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(350);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setHeight(Math.min(Math.max(w * 0.6, 250), 500));
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div ref={containerRef} className="w-full" style={{ height: `${height}px` }}>
      <iframe
        title="TradingView TSLA Chart"
        src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=NASDAQ%3ATSLA&interval=D&theme=dark&style=1&locale=en&toolbar_bg=%231a1a1a&enable_publishing=false&allow_symbol_change=true&container_id=tradingview"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        allowFullScreen
      />
    </div>
  );
}