'use client';

export default function TradingViewWidget() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-tesla-border">
      <iframe
        title="TradingView TSLA Chart"
        src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=NASDAQ%3ATSLA&interval=D&theme=dark&style=1&locale=en&toolbar_bg=%231a1a1a&enable_publishing=false&allow_symbol_change=true&container_id=tradingview"
        width="100%"
        height="500"
        style={{ border: 'none' }}
        allowFullScreen
      />
    </div>
  );
}