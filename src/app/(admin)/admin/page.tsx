'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function TeslaLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8C50 8 30 8 20 12L16 40C16 40 10 72 8 88H28L32 56H48V88H52V56H68L72 88H92C92 88 84 40 84 40L80 12C70 8 50 8 50 8Z" fill="#CC0000" />
      <rect x="36" y="4" width="28" height="8" rx="4" fill="#CC0000" />
    </svg>
  );
}

const navItems = [
  { label: 'Dashboard', key: 'dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
  { label: 'User Management', key: 'users', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { label: 'Pending Deposits', key: 'deposits', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg> },
  { label: 'Pending Withdrawals', key: 'withdrawals', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg> },
  { label: 'KYC Review', key: 'kyc', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18v16H3z" /><path d="M3 10h18" /></svg> },
];

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', plan: 'Gold', status: 'Active', date: '2025-01-10' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', plan: 'Silver', status: 'Active', date: '2025-01-12' },
  { id: 3, name: 'Bob Wilson', email: 'bob.wilson@example.com', plan: 'Basic', status: 'Pending', date: '2025-01-14' },
];

const mockDeposits = [
  { id: 1, user: 'John Doe', amount: '$25,000', wallet: 'BTC', txHash: '0x3a7f...e92d', date: '2025-01-15' },
  { id: 2, user: 'Jane Smith', amount: '$7,500', wallet: 'ETH', txHash: '0x8b2c...f14a', date: '2025-01-16' },
];

const mockWithdrawals = [
  { id: 1, user: 'John Doe', amount: '$5,000', wallet: 'USDT', address: '0x742d...bD38', date: '2025-01-17' },
];

const mockKyc = [
  { id: 1, user: 'Bob Wilson', type: 'Drivers License', date: '2025-01-14' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<{ totalUsers: number; totalDeposits: number; totalWithdrawals: number; pendingKyc: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {
        setStats({ totalUsers: 45032, totalDeposits: 2400000000, totalWithdrawals: 1800000000, pendingKyc: 24 });
      });
  }, []);

  const handleAction = async (type: string, id: number, action: string) => {
    try {
      const res = await fetch(`/api/admin/stats`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id, action }) });
      return res.ok;
    } catch { return false; }
  };

  return (
    <div className="min-h-screen bg-tesla-dark text-white flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-tesla-card border-r border-tesla-border flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 px-5 h-16 border-b border-tesla-border">
          <TeslaLogo className="w-7 h-7" />
          <span className="font-bold text-sm">TPC Admin</span>
          <button className="lg:hidden ml-auto text-gray-400" onClick={() => setSidebarOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.key ? 'bg-[#CC0000]/10 text-[#CC0000]' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-tesla-border">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-tesla-dark/95 backdrop-blur-md border-b border-tesla-border h-14 flex items-center px-4 gap-3">
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <h1 className="font-semibold">{navItems.find((n) => n.key === activeTab)?.label || 'Dashboard'}</h1>
        </header>
        <div className="p-4 sm:p-6 max-w-6xl animate-fade-in">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '45,032', color: 'text-white' },
                  { label: 'Total Deposits', value: `$${(stats?.totalDeposits || 2400000000).toLocaleString()}`, color: 'text-green-400' },
                  { label: 'Total Withdrawals', value: `$${(stats?.totalWithdrawals || 1800000000).toLocaleString()}`, color: 'text-red-400' },
                  { label: 'Pending KYC', value: stats?.pendingKyc?.toString() || '24', color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-tesla-card border border-tesla-border rounded-xl p-4">
                    <p className="text-gray-500 text-xs font-medium mb-1">{s.label}</p>
                    <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-tesla-border">
                      <th className="text-left text-gray-500 font-medium px-4 py-3">Name</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Email</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3">Plan</th>
                      <th className="text-right text-gray-500 font-medium px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((u) => (
                      <tr key={u.id} className="border-b border-tesla-border/50 last:border-0">
                        <td className="text-white px-4 py-3 font-medium">{u.name}</td>
                        <td className="text-gray-400 px-4 py-3 hidden sm:table-cell">{u.email}</td>
                        <td className="text-gray-300 px-4 py-3">{u.plan}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{u.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'deposits' && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-tesla-border">
                      <th className="text-left text-gray-500 font-medium px-4 py-3">User</th>
                      <th className="text-right text-gray-500 font-medium px-4 py-3">Amount</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Wallet</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Tx Hash</th>
                      <th className="text-right text-gray-500 font-medium px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDeposits.map((d) => (
                      <tr key={d.id} className="border-b border-tesla-border/50 last:border-0">
                        <td className="text-white px-4 py-3 font-medium">{d.user}</td>
                        <td className="text-green-400 px-4 py-3 text-right font-medium">{d.amount}</td>
                        <td className="text-gray-400 px-4 py-3 hidden sm:table-cell">{d.wallet}</td>
                        <td className="text-gray-500 px-4 py-3 font-mono text-xs hidden md:table-cell">{d.txHash}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleAction('deposit', d.id, 'approve')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                          <button onClick={() => handleAction('deposit', d.id, 'reject')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-tesla-border">
                      <th className="text-left text-gray-500 font-medium px-4 py-3">User</th>
                      <th className="text-right text-gray-500 font-medium px-4 py-3">Amount</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Wallet</th>
                      <th className="text-right text-gray-500 font-medium px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockWithdrawals.map((w) => (
                      <tr key={w.id} className="border-b border-tesla-border/50 last:border-0">
                        <td className="text-white px-4 py-3 font-medium">{w.user}</td>
                        <td className="text-red-400 px-4 py-3 text-right font-medium">{w.amount}</td>
                        <td className="text-gray-400 px-4 py-3 hidden sm:table-cell">{w.wallet} &middot; {w.address}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleAction('withdrawal', w.id, 'approve')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                          <button onClick={() => handleAction('withdrawal', w.id, 'reject')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-tesla-border">
                      <th className="text-left text-gray-500 font-medium px-4 py-3">User</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Document Type</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3">Date</th>
                      <th className="text-right text-gray-500 font-medium px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockKyc.map((k) => (
                      <tr key={k.id} className="border-b border-tesla-border/50 last:border-0">
                        <td className="text-white px-4 py-3 font-medium">{k.user}</td>
                        <td className="text-gray-400 px-4 py-3 hidden sm:table-cell">{k.type}</td>
                        <td className="text-gray-400 px-4 py-3">{k.date}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleAction('kyc', k.id, 'approve')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                          <button onClick={() => handleAction('kyc', k.id, 'reject')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
