'use client';

import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">Account Balance</p>
          <p className="text-white text-xl sm:text-2xl font-bold">$150,000<span className="text-gray-500 text-sm">.00</span></p>
        </div>
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">Active Investments</p>
          <p className="text-white text-xl sm:text-2xl font-bold">$100,000<span className="text-gray-500 text-sm">.00</span></p>
        </div>
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">Profits</p>
          <p className="text-green-400 text-xl sm:text-2xl font-bold">+$89,500<span className="text-green-500 text-sm">.00</span></p>
        </div>
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">Withdrawals</p>
          <p className="text-white text-xl sm:text-2xl font-bold">$0<span className="text-gray-500 text-sm">.00</span></p>
        </div>
      </div>

      {/* Deposits */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
        <p className="text-gray-500 text-xs font-medium mb-1">Deposits</p>
        <p className="text-white text-xl sm:text-2xl font-bold">$0<span className="text-gray-500 text-sm">.00</span></p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/referral" className="bg-tesla-card border border-tesla-border rounded-xl p-4 hover:border-[#CC0000]/40 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 bg-[#CC0000]/10 rounded-lg flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Referrals</p>
            <p className="text-gray-500 text-xs">Earn bonus rewards</p>
          </div>
        </Link>
        <Link href="/market" className="bg-tesla-card border border-tesla-border rounded-xl p-4 hover:border-[#CC0000]/40 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 bg-[#CC0000]/10 rounded-lg flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Market Overview</p>
            <p className="text-gray-500 text-xs">Live market data</p>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-gray-600 text-xs">Tesla</p>
      </div>

      <ChatWidget />
    </div>
  );
}