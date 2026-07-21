'use client';

import dynamic from 'next/dynamic';
import ChatWidget from '@/components/ChatWidget';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });

const news = [
  { title: 'Tesla Q4 Deliveries Exceed Expectations', source: 'Reuters', time: '2 hours ago', summary: 'Tesla delivered 495,570 vehicles in Q4 2024, beating analyst estimates of 473,000. The strong performance was driven by Model Y demand in China and Europe.' },
  { title: 'Tesla Full Self-Driving Receives Regulatory Approval in New Markets', source: 'Bloomberg', time: '5 hours ago', summary: 'Tesla FSD has received preliminary approval for deployment in three new European markets, expanding its autonomous driving footprint.' },
  { title: 'Tesla Energy Revenue Surges 40% Year-Over-Year', source: 'CNBC', time: '1 day ago', summary: 'Tesla Energy division reported record revenue driven by Megapack deployments and Powerwall demand, signaling diversification beyond automotive.' },
];

export default function MarketPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Market Overview</h2>
        <p className="text-gray-500 text-sm mt-0.5">Live charts and latest market news</p>
      </div>

      <TradingViewWidget />

      {/* TSLA News */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">Latest TSLA News</h3>
        <div className="space-y-3">
          {news.map((article, i) => (
            <div key={i} className="bg-tesla-card border border-tesla-border rounded-xl p-4 hover:border-[#CC0000]/30 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[#CC0000] text-xs font-semibold">{article.source}</span>
                <span className="text-gray-600 text-xs">&middot;</span>
                <span className="text-gray-600 text-xs">{article.time}</span>
              </div>
              <h4 className="text-white text-sm font-semibold mb-1">{article.title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">{article.summary}</p>
            </div>
          ))}
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
