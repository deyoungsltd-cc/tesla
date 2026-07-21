'use client';

import { useState } from 'react';
import ChatWidget from '@/components/ChatWidget';

const wallets = ['BTC', 'ETH', 'USDT'];

const mockHistory = [
  { id: 1, date: '2025-01-15 14:32', wallet: 'BTC', amount: '$5,000.00', txHash: '0x3a7f...e92d', status: 'Confirmed' },
  { id: 2, date: '2025-01-10 09:18', wallet: 'ETH', amount: '$2,500.00', txHash: '0x8b2c...f14a', status: 'Confirmed' },
  { id: 3, date: '2025-01-05 22:05', wallet: 'USDT', amount: '$10,000.00', txHash: '0xd1e5...c38b', status: 'Pending' },
];

export default function DepositPage() {
  const [wallet, setWallet] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!amount || !txHash) return;
    setLoading(true);
    setSuccess('');
    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, amount: parseFloat(amount), txHash }),
      });
      if (res.ok) { setSuccess('Deposit submitted successfully!'); setAmount(''); setTxHash(''); }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Deposit Funds</h2>
        <p className="text-gray-500 text-sm mt-0.5">Add funds to your account using cryptocurrency</p>
      </div>

      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Select Wallet</label>
          <div className="flex gap-2">
            {wallets.map((w) => (
              <button
                key={w}
                onClick={() => setWallet(w)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  wallet === w ? 'bg-[#CC0000] text-white' : 'bg-[#1a1a1a] text-gray-400 border border-tesla-border hover:border-gray-500'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Transaction Hash</label>
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Paste your transaction hash"
            className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors"
          />
        </div>
        {success && <div className="bg-green-900/30 border border-green-800/50 text-green-400 text-sm rounded-lg px-4 py-3">{success}</div>}
        <button
          onClick={handleSubmit}
          disabled={loading || !amount || !txHash}
          className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Submitting...' : 'Submit Deposit'}
        </button>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">Transaction History</h3>
        <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tesla-border">
                  <th className="text-left text-gray-500 font-medium px-4 py-3">Date</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3">Wallet</th>
                  <th className="text-right text-gray-500 font-medium px-4 py-3">Amount</th>
                  <th className="text-right text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Tx Hash</th>
                  <th className="text-right text-gray-500 font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((tx) => (
                  <tr key={tx.id} className="border-b border-tesla-border/50 last:border-0">
                    <td className="text-gray-300 px-4 py-3 whitespace-nowrap">{tx.date}</td>
                    <td className="text-white px-4 py-3">{tx.wallet}</td>
                    <td className="text-green-400 px-4 py-3 text-right font-medium">{tx.amount}</td>
                    <td className="text-gray-500 px-4 py-3 text-right font-mono text-xs hidden sm:table-cell">{tx.txHash}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tx.status === 'Confirmed' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}