'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import ChatWidget from '@/components/ChatWidget';

// Dynamic imports for TradingView widgets (no SSR)
const TickerTapeWidget = dynamic(() => import('@/components/TickerTapeWidget'), { ssr: false });
const TradingViewAdvancedChart = dynamic(() => import('@/components/TradingViewAdvancedChart'), { ssr: false });
const TradingViewTechnicalAnalysis = dynamic(() => import('@/components/TradingViewTechnicalAnalysis'), { ssr: false });

const news = [
  {
    title: 'Tesla Stock Rises as Musk Announces New AI Partnership',
    source: 'Reuters',
    time: '2 hours ago',
    sentiment: 'bullish',
    summary: 'Tesla shares jumped 3.2% after CEO Elon Musk revealed a strategic AI partnership that could revolutionize autonomous driving capabilities across the fleet.',
  },
  {
    title: 'Tesla Q4 Deliveries Exceed Wall Street Expectations',
    source: 'Bloomberg',
    time: '4 hours ago',
    sentiment: 'bullish',
    summary: 'Tesla delivered 510,000 vehicles in Q4, surpassing analyst estimates of 485,000. Model Y remained the best-selling EV globally for the third consecutive quarter.',
  },
  {
    title: 'Tesla Energy Division Reports Record Revenue Growth',
    source: 'CNBC',
    time: '6 hours ago',
    sentiment: 'bullish',
    summary: 'Tesla Energy reported a 40% year-over-year revenue increase driven by massive Megapack deployments and growing Powerwall demand across residential markets.',
  },
  {
    title: 'Goldman Sachs Raises Tesla Price Target to $520',
    source: 'MarketWatch',
    time: '8 hours ago',
    sentiment: 'bullish',
    summary: 'Goldman Sachs upgraded Tesla from Neutral to Buy, setting a 12-month price target of $520 citing strong FSD adoption rates and improving margins.',
  },
  {
    title: 'Tesla Expands Supercharger Network to 60,000 Stations',
    source: 'The Verge',
    time: '12 hours ago',
    sentiment: 'neutral',
    summary: 'Tesla announced its Supercharger network has reached 60,000 stalls globally, with plans to open 15,000 more locations to non-Tesla EVs by end of year.',
  },
];

const investmentPlans = [
  { name: 'Starter Plan', min: '$500', return: '3.5%', duration: '7 days', badge: 'Popular' },
  { name: 'Growth Plan', min: '$5,000', return: '5.2%', duration: '14 days', badge: 'Best Value' },
  { name: 'Premium Plan', min: '$25,000', return: '7.8%', duration: '30 days', badge: 'High Yield' },
  { name: 'Elite Plan', min: '$100,000', return: '12.5%', duration: '60 days', badge: 'VIP' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('Investor');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    if (user?.profile?.firstName) {
      setUserName(user.profile.firstName);
    }
  }, [user]);

  const activeWallet = user?.wallets?.find(w => w.type === (user?.activeMode || 'demo'));

  return (
    <div className="space-y-5 -mx-4 px-4">
      {/* ── TICKER TAPE ── */}
      <div className="-mx-4 px-0">
        <TickerTapeWidget />
      </div>

      {/* ── GREETING ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs">{greeting}</p>
          <h1 className="text-white text-lg font-bold">{userName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${(user?.activeMode || 'demo') === 'demo' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/40' : 'bg-green-900/30 text-green-400 border border-green-700/40'}`}>
            {(user?.activeMode || 'demo') === 'demo' ? 'Demo Mode' : 'Live Mode'}
          </div>
          <Link href="/notifications" className="relative w-9 h-9 rounded-full bg-tesla-card border border-tesla-border flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#CC0000] rounded-full border-2 border-tesla-dark" />
          </Link>
        </div>
      </div>

      {/* ── ACCOUNT BALANCE CARD ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#CC0000]/20 via-tesla-card to-tesla-card border border-[#CC0000]/20 rounded-2xl p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CC0000]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#CC0000]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Balance</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-[10px] font-medium">LIVE</span>
            </div>
          </div>
          <p className="text-white text-3xl font-bold mb-1">
            ${activeWallet?.balance?.toLocaleString() || '0.00'}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div>
              <p className="text-gray-500 text-[10px] uppercase">Available</p>
              <p className="text-white text-sm font-semibold">${activeWallet?.availableBalance?.toLocaleString() || '0.00'}</p>
            </div>
            <div className="w-px h-8 bg-tesla-border" />
            <div>
              <p className="text-gray-500 text-[10px] uppercase">Locked</p>
              <p className="text-white text-sm font-semibold">${activeWallet?.lockedBalance?.toLocaleString() || '0.00'}</p>
            </div>
            <div className="w-px h-8 bg-tesla-border" />
            <div>
              <p className="text-gray-500 text-[10px] uppercase">Profits</p>
              <p className="text-green-400 text-sm font-semibold">+$89,500.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: '/deposit', label: 'Deposit', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>, color: 'bg-green-900/20 text-green-400 border-green-800/30' },
          { href: '/withdraw', label: 'Withdraw', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>, color: 'bg-blue-900/20 text-blue-400 border-blue-800/30' },
          { href: '/investments', label: 'Invest', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, color: 'bg-[#CC0000]/10 text-[#CC0000] border-[#CC0000]/20' },
          { href: '/referral', label: 'Refer', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, color: 'bg-purple-900/20 text-purple-400 border-purple-800/30' },
        ].map((action) => (
          <Link key={action.href} href={action.href} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${action.color} transition-all hover:scale-[1.02] active:scale-95`}>
            {action.icon}
            <span className="text-[10px] font-semibold">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* ── TSLA MAIN CHART ── */}
      <div className="bg-tesla-card border border-tesla-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-tesla-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#CC0000] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">T</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold">TSLA</p>
              <p className="text-gray-500 text-[10px]">Tesla, Inc. &middot; NASDAQ</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-bold">$430.60</p>
            <p className="text-red-400 text-[10px] font-medium">-2.05% (-$9.02)</p>
          </div>
        </div>
        <TradingViewAdvancedChart symbol="NASDAQ:TSLA" interval="D" />
      </div>

      {/* ── TECHNICAL ANALYSIS ── */}
      <div className="bg-tesla-card border border-tesla-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-tesla-border">
          <p className="text-white text-sm font-semibold">Technical Analysis</p>
          <p className="text-gray-500 text-[10px]">Buy/Sell signals based on popular indicators</p>
        </div>
        <div className="p-2">
          <TradingViewTechnicalAnalysis symbol="NASDAQ:TSLA" />
        </div>
      </div>

      {/* ── INVESTMENT PLANS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-white font-bold text-sm">Investment Plans</h2>
            <p className="text-gray-500 text-[10px]">Choose a plan that suits your goals</p>
          </div>
          <Link href="/investments" className="text-[#CC0000] text-xs font-medium hover:underline">View All</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {investmentPlans.map((plan) => (
            <div key={plan.name} className="min-w-[160px] bg-tesla-card border border-tesla-border rounded-xl p-4 flex-shrink-0 hover:border-[#CC0000]/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  plan.badge === 'VIP' ? 'bg-purple-900/30 text-purple-400' :
                  plan.badge === 'High Yield' ? 'bg-yellow-900/30 text-yellow-400' :
                  plan.badge === 'Best Value' ? 'bg-green-900/30 text-green-400' :
                  'bg-[#CC0000]/10 text-[#CC0000]'
                }`}>{plan.badge}</span>
              </div>
              <p className="text-white text-sm font-bold mb-1">{plan.name}</p>
              <p className="text-green-400 text-lg font-bold mb-1">{plan.return}</p>
              <p className="text-gray-500 text-[10px]">Min: {plan.min} &middot; {plan.duration}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── NEWS FEED ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#CC0000] flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">T</span>
            </div>
            <h2 className="text-white font-bold text-sm">TSLA Top Stories</h2>
          </div>
          <Link href="/market" className="text-[#CC0000] text-xs font-medium hover:underline">See All</Link>
        </div>
        <div className="space-y-3">
          {news.slice(0, 4).map((article, i) => (
            <div key={i} className="bg-tesla-card border border-tesla-border rounded-xl p-4 hover:border-[#CC0000]/20 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#CC0000] text-[10px] font-bold">{article.source}</span>
                <span className="text-gray-700 text-[10px]">&middot;</span>
                <span className="text-gray-600 text-[10px]">{article.time}</span>
                <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  article.sentiment === 'bullish' ? 'bg-green-900/30 text-green-400' :
                  article.sentiment === 'bearish' ? 'bg-red-900/30 text-red-400' :
                  'bg-gray-800 text-gray-400'
                }`}>{article.sentiment.toUpperCase()}</span>
              </div>
              <h4 className="text-white text-sm font-semibold leading-snug mb-1.5">{article.title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">{article.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── REFERRAL SECTION ── */}
      <div className="bg-gradient-to-br from-[#CC0000]/10 via-tesla-card to-tesla-card border border-[#CC0000]/20 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#CC0000]/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-bold">Refer & Earn</p>
            <p className="text-gray-500 text-xs">Earn up to 10% commission on referrals</p>
          </div>
          <div className="ml-auto">
            <Link href="/referral" className="text-[#CC0000] text-xs font-bold hover:underline">Details →</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#1a1a1a] border border-tesla-border rounded-lg px-3 py-2.5 text-xs text-gray-400 truncate">
            https://yourdomain.com/ref/{user?.referralCode || '------'}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://yourdomain.com/ref/${user?.referralCode || ''}`);
            }}
            className="w-10 h-10 bg-[#CC0000] rounded-lg flex items-center justify-center shrink-0 hover:bg-[#a30000] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── MARKET STATS ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-[10px] uppercase font-medium">Nasdaq</p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <p className="text-white text-base font-bold">19,842.31</p>
          <p className="text-green-400 text-[10px]">+1.24%</p>
        </div>
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-[10px] uppercase font-medium">S&P 500</p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <p className="text-white text-base font-bold">5,987.15</p>
          <p className="text-green-400 text-[10px]">+0.68%</p>
        </div>
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-[10px] uppercase font-medium">BTC/USD</p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
          </div>
          <p className="text-white text-base font-bold">$68,420</p>
          <p className="text-red-400 text-[10px]">-0.93%</p>
        </div>
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-500 text-[10px] uppercase font-medium">ETH/USD</p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <p className="text-white text-base font-bold">$3,845</p>
          <p className="text-green-400 text-[10px]">+1.57%</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="text-center pt-2 pb-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex items-center gap-1.5 text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="text-[10px]">256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span className="text-[10px]">Secured</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="text-[10px]">24/7</span>
          </div>
        </div>
        <p className="text-gray-700 text-[10px]">&copy; {new Date().getFullYear()} Tesla Prime Capital. All rights reserved.</p>
      </div>

      <ChatWidget />
    </div>
  );
}