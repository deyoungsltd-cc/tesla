'use client';

import { useState, useEffect } from 'react';
import ChatWidget from '@/components/ChatWidget';

const cryptoWallets = [
  { code: 'BTC', name: 'Bitcoin', icon: '₿', color: 'text-orange-400' },
  { code: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'text-blue-400' },
  { code: 'USDT', name: 'Tether', icon: '₮', color: 'text-green-400' },
];

const giftCardBrands = ['Apple', 'Amazon', 'Google Play', 'iTunes', 'Steam', 'Vanilla', 'Visa', 'Mastercard', 'Nike', 'Walmart', 'Target', 'eBay'];

export default function DepositPage() {
  const [method, setMethod] = useState<'crypto' | 'gift_card'>('crypto');
  const [wallet, setWallet] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/deposits/history', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.success) setHistory(d.data || []); })
        .catch(() => {});
    }
  }, [success]);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (method === 'crypto') {
      if (!amount || !txHash) { setError('Enter amount and transaction hash'); return; }
      setLoading(true);
      try {
        const res = await fetch('/api/deposits', {
          method: 'POST', headers,
          body: JSON.stringify({ amount: parseFloat(amount), method: 'crypto', cryptoCurrency: wallet, txHash }),
        });
        const data = await res.json();
        if (data.success) { setSuccess('Crypto deposit submitted! Awaiting confirmation.'); setAmount(''); setTxHash(''); }
        else setError(data.error?.message || 'Failed to submit deposit');
      } catch { setError('Network error'); }
      finally { setLoading(false); }
    } else {
      if (!cardBrand || !cardCode) { setError('Select card brand and enter card code'); return; }
      setLoading(true);
      try {
        const res = await fetch('/api/deposits', {
          method: 'POST', headers,
          body: JSON.stringify({ amount: parseFloat(amount) || 0, method: 'gift_card', giftCardType: cardBrand, giftCardCode: cardCode }),
        });
        const data = await res.json();
        if (data.success) { setSuccess('Gift card submitted! Awaiting verification.'); setCardCode(''); setCardPin(''); }
        else setError(data.error?.message || 'Failed to submit');
      } catch { setError('Network error'); }
      finally { setLoading(false); }
    }
  };

  const statusBadge = (s: string) => {
    const m: Record<string, string> = { confirmed: 'bg-green-900/30 text-green-400', completed: 'bg-green-900/30 text-green-400', pending: 'bg-yellow-900/30 text-yellow-400', pending_verification: 'bg-yellow-900/30 text-yellow-400', rejected: 'bg-red-900/30 text-red-400' };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m[s] || 'bg-gray-700/50 text-gray-400'}`}>{s}</span>;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Deposit Funds</h2>
        <p className="text-gray-500 text-sm mt-0.5">Add funds via cryptocurrency or gift cards</p>
      </div>

      {/* Method Toggle */}
      <div className="flex bg-tesla-card border border-tesla-border rounded-xl p-1">
        <button onClick={() => setMethod('crypto')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${method === 'crypto' ? 'bg-[#CC0000] text-white shadow-lg' : 'text-gray-400'}`}>
          <span className="mr-1.5">₿</span> Cryptocurrency
        </button>
        <button onClick={() => setMethod('gift_card')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${method === 'gift_card' ? 'bg-[#CC0000] text-white shadow-lg' : 'text-gray-400'}`}>
          <span className="mr-1.5">🎁</span> Gift Card
        </button>
      </div>

      {error && <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}
      {success && <div className="bg-green-900/30 border border-green-800/50 text-green-400 text-sm rounded-lg px-4 py-3">{success}</div>}

      {/* Crypto Form */}
      {method === 'crypto' && (
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Select Cryptocurrency</label>
            <div className="grid grid-cols-3 gap-2">
              {cryptoWallets.map((w) => (
                <button key={w.code} onClick={() => setWallet(w.code)} className={`py-3 px-2 rounded-lg text-center transition-all ${wallet === w.code ? 'bg-[#CC0000]/10 border-2 border-[#CC0000]' : 'bg-[#1a1a1a] border-2 border-transparent hover:border-gray-600'}`}>
                  <div className={`text-xl font-bold ${w.color}`}>{w.icon}</div>
                  <div className="text-white text-xs font-semibold mt-1">{w.code}</div>
                  <div className="text-gray-500 text-[10px]">{w.name}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Amount (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Transaction Hash</label>
            <input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="Paste your transaction hash" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors font-mono text-xs" />
          </div>
          <button onClick={handleSubmit} disabled={loading || !amount || !txHash} className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
            {loading ? 'Submitting...' : 'Submit Crypto Deposit'}
          </button>
        </div>
      )}

      {/* Gift Card Form */}
      {method === 'gift_card' && (
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Gift Card Brand</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {giftCardBrands.map((b) => (
                <button key={b} onClick={() => setCardBrand(b)} className={`py-2.5 px-1 rounded-lg text-xs font-medium transition-all text-center ${cardBrand === b ? 'bg-[#CC0000]/10 border-2 border-[#CC0000] text-white' : 'bg-[#1a1a1a] border-2 border-transparent text-gray-400 hover:text-white hover:border-gray-600'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Card Code</label>
            <input type="text" value={cardCode} onChange={(e) => setCardCode(e.target.value)} placeholder="Enter gift card code" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">PIN (if required)</label>
            <input type="text" value={cardPin} onChange={(e) => setCardPin(e.target.value)} placeholder="Enter PIN" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Card Value (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter card value" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
          </div>
          <button onClick={handleSubmit} disabled={loading || !cardBrand || !cardCode} className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
            {loading ? 'Submitting...' : 'Submit Gift Card'}
          </button>
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">Deposit History</h3>
        <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-sm">No deposits yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-tesla-border">
                  <th className="text-left text-gray-500 font-medium px-4 py-3">Date</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3">Method</th>
                  <th className="text-right text-gray-500 font-medium px-4 py-3">Amount</th>
                  <th className="text-right text-gray-500 font-medium px-4 py-3">Status</th>
                </tr></thead>
                <tbody>
                  {history.map((d: any) => (
                    <tr key={d.id} className="border-b border-tesla-border/50 last:border-0">
                      <td className="text-gray-300 px-4 py-3 text-xs whitespace-nowrap">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="text-white px-4 py-3 capitalize text-xs">{d.method === 'gift_card' ? `Gift Card` : d.cryptoCurrency || d.method}</td>
                      <td className="text-green-400 px-4 py-3 text-right font-medium">${d.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{statusBadge(d.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}