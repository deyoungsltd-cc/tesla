'use client';

import { useState } from 'react';
import ChatWidget from '@/components/ChatWidget';

const markets = [
  { name: 'S&P 500', value: '5,998.74', change: '+1.23%', up: true },
  { name: 'NASDAQ', value: '19,211.10', change: '+1.67%', up: true },
  { name: 'DOW', value: '42,875.44', change: '-0.32%', up: false },
  { name: 'BTC', value: '$104,230', change: '+3.45%', up: true },
];

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const referralLink = 'https://teslaprimecapital.com/ref/JOHNDOE2025';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Referral Program</h2>
        <p className="text-gray-500 text-sm mt-0.5">Invite friends and earn bonus rewards</p>
      </div>

      {/* Referral Stats */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Total Earnings</p>
            <p className="text-white text-2xl font-bold">$0<span className="text-gray-500 text-sm">.00</span></p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Total Referrals</p>
            <p className="text-white text-2xl font-bold">0</p>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-3 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-transparent text-gray-300 text-sm font-mono outline-none min-w-0 truncate"
          />
          <button
            onClick={handleCopy}
            className="shrink-0 bg-[#CC0000] hover:bg-[#a30000] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* TSLA Stock Widget */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-[#CC0000] rounded-full animate-pulse" />
          TSLA Stock
        </h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-gray-400 text-xs">Tesla, Inc.</p>
            <p className="text-white text-2xl font-bold mt-0.5">$352.80</p>
          </div>
          <span className="text-green-400 text-sm font-semibold bg-green-900/20 px-2 py-0.5 rounded">+2.34%</span>
        </div>
        {/* Mini chart placeholder */}
        <div className="mt-3 h-20 flex items-end gap-[2px]">
          {[40, 55, 35, 60, 45, 70, 50, 65, 75, 60, 80, 70, 85, 90, 78, 95, 88, 92, 85, 100].map((h, i) => (
            <div key={i} className="flex-1 bg-green-500/20 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Market Overview */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">Market Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          {markets.map((m) => (
            <div key={m.name} className="bg-tesla-card border border-tesla-border rounded-xl p-4">
              <p className="text-gray-500 text-xs font-medium">{m.name}</p>
              <p className="text-white font-bold text-lg mt-0.5">{m.value}</p>
              <span className={`text-xs font-semibold ${m.up ? 'text-green-400' : 'text-red-400'}`}>{m.change}</span>
            </div>
          ))}
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
