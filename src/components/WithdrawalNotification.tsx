'use client';

import { useState, useEffect, useCallback } from 'react';

interface WithdrawalEvent {
  name: string;
  amount: string;
  currency: string;
  method: string;
  time: string;
  country: string;
}

const withdrawalData: WithdrawalEvent[] = [
  { name: 'Chen W.', amount: '$55,000', currency: 'USDT', method: 'Crypto', time: '2 min ago', country: 'China' },
  { name: 'Sarah J.', amount: '$28,500', currency: 'BTC', method: 'Crypto', time: '5 min ago', country: 'United States' },
  { name: 'Michael R.', amount: '$42,300', currency: 'ETH', method: 'Crypto', time: '8 min ago', country: 'United Kingdom' },
  { name: 'Aisha K.', amount: '$18,750', currency: 'USDT', method: 'Crypto', time: '12 min ago', country: 'Nigeria' },
  { name: 'David L.', amount: '$92,100', currency: 'BTC', method: 'Crypto', time: '15 min ago', country: 'Germany' },
  { name: 'Maria G.', amount: '$31,400', currency: 'ETH', method: 'Crypto', time: '18 min ago', country: 'Brazil' },
  { name: 'Yuki T.', amount: '$67,800', currency: 'USDT', method: 'Crypto', time: '22 min ago', country: 'Japan' },
  { name: 'Oluwaseun A.', amount: '$15,600', currency: 'BTC', method: 'Crypto', time: '25 min ago', country: 'Ghana' },
  { name: 'Pierre D.', amount: '$38,900', currency: 'ETH', method: 'Crypto', time: '28 min ago', country: 'France' },
  { name: 'Fatima S.', amount: '$73,200', currency: 'USDT', method: 'Crypto', time: '31 min ago', country: 'UAE' },
  { name: 'James O.', amount: '$21,500', currency: 'BTC', method: 'Crypto', time: '35 min ago', country: 'Canada' },
  { name: 'Ling Z.', amount: '$85,000', currency: 'USDT', method: 'Crypto', time: '38 min ago', country: 'Singapore' },
  { name: 'Ahmed M.', amount: '$47,300', currency: 'ETH', method: 'Crypto', time: '42 min ago', country: 'Saudi Arabia' },
  { name: 'Emma B.', amount: '$56,700', currency: 'BTC', method: 'Crypto', time: '45 min ago', country: 'Australia' },
  { name: 'Carlos R.', amount: '$29,800', currency: 'USDT', method: 'Crypto', time: '48 min ago', country: 'Mexico' },
  { name: 'Olga P.', amount: '$64,500', currency: 'ETH', method: 'Crypto', time: '52 min ago', country: 'Russia' },
  { name: 'Kofi M.', amount: '$12,300', currency: 'BTC', method: 'Crypto', time: '55 min ago', country: 'Kenya' },
  { name: 'Hans M.', amount: '$98,700', currency: 'USDT', method: 'Crypto', time: '1 hr ago', country: 'Switzerland' },
  { name: 'Priya S.', amount: '$41,200', currency: 'ETH', method: 'Crypto', time: '1 hr ago', country: 'India' },
  { name: 'Robert N.', amount: '$76,400', currency: 'BTC', method: 'Crypto', time: '1 hr ago', country: 'Netherlands' },
];

export default function WithdrawalNotification() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const showNotification = useCallback((index: number) => {
    const event = withdrawalData[index % withdrawalData.length];
    setIsExiting(false);
    setIsVisible(true);

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 400);
    }, 5000);

    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    // Initial delay before first notification
    const initialDelay = setTimeout(() => {
      showNotification(currentIndex);
    }, 3000);

    return () => clearTimeout(initialDelay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % withdrawalData.length;
      setCurrentIndex(nextIndex);
      showNotification(nextIndex);
    }, 12000); // Show new notification every 12 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isPaused]);

  const current = withdrawalData[currentIndex % withdrawalData.length];

  if (!isVisible || !current) return null;

  return (
    <div
      className={`fixed bottom-24 md:bottom-6 left-4 z-[999] max-w-xs transition-all duration-400 ${
        isExiting
          ? 'opacity-0 translate-y-4 translate-x-0'
          : 'opacity-100 translate-y-0 translate-x-0'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-tesla-card border border-tesla-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Green top bar */}
        <div className="h-1 bg-gradient-to-r from-green-500 to-green-400" />
        
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Withdrawal Successful</p>
              <p className="text-gray-600 text-[9px]">{current.time}</p>
            </div>
            <button
              onClick={() => { setIsExiting(true); setTimeout(() => setIsVisible(false), 400); }}
              className="ml-auto text-gray-600 hover:text-gray-400 transition-colors p-0.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Amount */}
          <p className="text-white text-xl font-bold mb-1">{current.amount}</p>
          
          {/* Details */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-green-900/20 text-green-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {current.currency}
            </span>
            <span className="bg-tesla-input text-gray-400 text-[10px] px-2 py-0.5 rounded-full">
              {current.method}
            </span>
            <span className="text-gray-600 text-[10px]">{current.country}</span>
          </div>

          {/* User */}
          <div className="mt-3 pt-3 border-t border-tesla-border flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#CC0000] to-[#8B0000] flex items-center justify-center text-white text-[8px] font-bold shrink-0">
              {current.name.charAt(0)}
            </div>
            <p className="text-gray-400 text-xs">{current.name} received funds</p>
          </div>
        </div>
      </div>
    </div>
  );
}
