'use client';

import { useState } from 'react';
import ChatWidget from '@/components/ChatWidget';

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const balance = 24580.50;
  const feePercent = 21;
  const numAmount = parseFloat(amount) || 0;
  const fee = (numAmount * feePercent) / 100;
  const net = numAmount - fee;

  const handleSubmit = async () => {
    if (!amount || !walletAddress || numAmount > balance || numAmount <= 0) return;
    setLoading(true);
    setSuccess('');
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount, walletAddress, fee }),
      });
      if (res.ok) { setSuccess('Withdrawal request submitted successfully!'); setAmount(''); setWalletAddress(''); }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Withdraw Funds</h2>
        <p className="text-gray-500 text-sm mt-0.5">Request a withdrawal to your crypto wallet</p>
      </div>

      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <span className="text-gray-400 text-sm">Available Balance</span>
          <span className="text-white text-2xl font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {numAmount > 0 && numAmount <= balance && (
            <div className="bg-[#1a1a1a] rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Withdrawal Fee ({feePercent}%)</span><span className="text-red-400 font-medium">-${fee.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-300 font-medium">You Receive</span><span className="text-green-400 font-bold">${net.toFixed(2)}</span></div>
            </div>
          )}

          {numAmount > balance && (
            <p className="text-red-400 text-xs">Insufficient balance</p>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your wallet address"
              className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {success && <div className="bg-green-900/30 border border-green-800/50 text-green-400 text-sm rounded-lg px-4 py-3">{success}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading || !amount || !walletAddress || numAmount > balance || numAmount <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Submitting...' : 'Submit Withdrawal'}
          </button>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}