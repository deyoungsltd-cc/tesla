'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ChatWidget from '@/components/ChatWidget';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });

const plans = [
  { name: 'Basic', badge: 'STARTER', badgeColor: 'bg-gray-600', min: 200, max: 4999, daily: 0.5, duration: 30, model: 'Model 3', image: 'https://cdn.motor1.com/images/mgl/3r5Xj/s1/tesla-model-3.jpg' },
  { name: 'Silver', badge: 'POPULAR', badgeColor: 'bg-[#CC0000]', min: 5000, max: 9999, daily: 0.8, duration: 21, model: 'Model Y', image: 'https://cdn.motor1.com/images/mgl/8N3Eo/s1/tesla-model-y.jpg' },
  { name: 'Gold', badge: 'PREMIUM', badgeColor: 'bg-amber-600', min: 10000, max: 49999, daily: 1.2, duration: 14, model: 'Model S', image: 'https://cdn.motor1.com/images/mgl/MY1YN/s1/tesla-model-s.jpg' },
  { name: 'Platinum', badge: 'ELITE', badgeColor: 'bg-purple-600', min: 50000, max: 100000, daily: 1.8, duration: 7, model: 'Model X', image: 'https://cdn.motor1.com/images/mgl/Q0KNR/s1/tesla-model-x.jpg' },
];

export default function InvestmentsPage() {
  const [modal, setModal] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedPlan = modal !== null ? plans[modal] : null;
  const numAmount = parseFloat(amount) || 0;
  const dailyReturn = selectedPlan ? (numAmount * selectedPlan.daily) / 100 : 0;
  const totalReturn = dailyReturn * (selectedPlan?.duration || 0);

  const handleInvest = async () => {
    if (!selectedPlan || !amount || numAmount < selectedPlan.min || numAmount > selectedPlan.max) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId: selectedPlan.name.toLowerCase(), amount: numAmount, mode: 'demo' }),
      });
      const data = await res.json();
      if (res.ok && data.success) { setModal(null); setAmount(''); }
      else alert(data.error?.message || 'Investment failed');
    } catch { alert('Network error'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Investment Plans</h2>
        <p className="text-gray-500 text-sm mt-0.5">Choose a plan and start earning daily returns</p>
      </div>

      {/* TradingView Chart */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden !p-0">
        <div className="px-4 py-2.5 border-b border-tesla-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-bold text-sm">NASDAQ:TSLA</span>
            <span className="text-gray-500 text-xs">Live</span>
          </div>
        </div>
        <TradingViewWidget />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan, i) => (
          <div key={i} className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden hover:border-[#CC0000]/40 transition-colors">
            <div className="relative h-32">
              <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-tesla-card via-transparent to-transparent" />
              <span className={`absolute top-2 left-2 ${plan.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>{plan.badge}</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{plan.name} <span className="text-gray-500 text-xs font-normal">&middot; {plan.model}</span></h3>
                <span className="text-[#CC0000] font-bold">{plan.daily}%/day</span>
              </div>
              <p className="text-gray-500 text-xs mb-3">${plan.min.toLocaleString()} — ${plan.max.toLocaleString()} &middot; {plan.duration} days</p>
              <button
                onClick={() => { setModal(i); setAmount(''); }}
                className="w-full bg-[#CC0000] hover:bg-[#a30000] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Invest Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal !== null && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModal(null)} />
          <div className="relative w-full sm:max-w-md bg-tesla-card border border-tesla-border rounded-t-2xl sm:rounded-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="relative h-36">
              <img src={selectedPlan.image} alt={selectedPlan.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-tesla-card via-transparent to-transparent" />
              <button onClick={() => setModal(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-bold text-lg">{selectedPlan.name} Plan <span className="text-gray-500 text-sm font-normal">&middot; {selectedPlan.model}</span></h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${selectedPlan.badgeColor}`}>{selectedPlan.badge}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
                <span>{selectedPlan.daily}% daily</span>
                <span>{selectedPlan.duration} days</span>
                <span>${selectedPlan.min.toLocaleString()}—${selectedPlan.max.toLocaleString()}</span>
              </div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Investment Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`$${selectedPlan.min} — $${selectedPlan.max}`}
                className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors"
              />
              {numAmount > 0 && numAmount >= selectedPlan.min && numAmount <= selectedPlan.max && (
                <div className="mt-3 bg-[#1a1a1a] rounded-lg p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Daily Return</span><span className="text-green-400 font-medium">+${dailyReturn.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="text-white">{selectedPlan.duration} days</span></div>
                  <div className="border-t border-tesla-border pt-1.5 flex justify-between"><span className="text-gray-300 font-medium">Total Return</span><span className="text-green-400 font-bold">+${totalReturn.toFixed(2)}</span></div>
                </div>
              )}
              {numAmount > 0 && (numAmount < selectedPlan.min || numAmount > selectedPlan.max) && (
                <p className="text-red-400 text-xs mt-2">Amount must be between ${selectedPlan.min.toLocaleString()} and ${selectedPlan.max.toLocaleString()}</p>
              )}
              <button
                onClick={handleInvest}
                disabled={loading || !amount || numAmount < selectedPlan.min || numAmount > selectedPlan.max}
                className="w-full mt-5 bg-[#CC0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                {loading ? 'Processing...' : `Invest $${(numAmount || 0).toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatWidget />
    </div>
  );
}