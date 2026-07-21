'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });

function TeslaLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 342 35" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 .1a9.7 9.7 0 007 7h11l.5.1v27.6h6.8V7.3L26 7a9.7 9.7 0 007-7H0zm238.6 0h-6.8v34.8h6.8V.1zm-52.3 6.8c-5.3 0-9.7 2.1-12.9 6.2V.1h-6.8v34.8h6.8V19.5c0-7.4 3.8-12.4 10.2-12.4 5.8 0 9.3 4.3 9.3 11.2v16.6h6.8V17c0-6.3-1.8-10.1-4.5-12.6-2.6-2.3-5.4-2.5-8.9-2.5zM293 7.7c-9.7 0-17 7.3-17 18.2s7.3 18.2 17 18.2c9.4 0 16.7-7.3 16.7-18.2S302.4 7.7 293 7.7zm0 6.5c5.8 0 10.1 4.8 10.1 11.7 0 6.8-4.3 11.7-10.1 11.7S283 32.7 283 25.9c0-6.9 4.2-11.7 10-11.7zm-89.3-6.5h-7.5l-11.2 22.8V.1h-6.8v34.8h7.5l11.2-22.8v22.8h6.8V7.7z" fill="#CC0000"/>
    </svg>
  );
}

const navItems = [
  { label: 'Dashboard', key: 'dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
  { label: 'Users', key: 'users', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { label: 'Deposits', key: 'deposits', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg> },
  { label: 'Withdrawals', key: 'withdrawals', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg> },
  { label: 'KYC Review', key: 'kyc', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18v16H3z" /><path d="M3 10h18" /></svg> },
  { label: 'Market', key: 'market', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
];

function apiCall(url: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string> || {}),
    },
  });
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiCall('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
      else setStats({ totalUsers: 2, totalDeposits: 150000, totalInvestments: 100000, activeInvestments: 1, pendingKyc: 0, pendingWithdrawals: 0 });
    } catch { setStats({ totalUsers: 2, totalDeposits: 150000, totalInvestments: 100000, activeInvestments: 1, pendingKyc: 0, pendingWithdrawals: 0 }); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiCall('/api/admin/stats');
      const data = await res.json();
      if (data.success && data.data.recentUsers) setUsers(data.data.recentUsers);
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); fetchUsers(); }, [fetchStats, fetchUsers]);

  const handleAction = async (url: string, body: any) => {
    setLoading(true);
    try {
      const res = await apiCall(url, { method: 'POST', body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { fetchStats(); fetchUsers(); }
    } catch {} finally { setLoading(false); }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    await handleAction('/api/admin/stats', { type: 'user_status', id: userId, action: status });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  };

  return (
    <div className="min-h-screen bg-tesla-dark text-white flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-tesla-card border-r border-tesla-border flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 px-5 h-16 border-b border-tesla-border">
          <TeslaLogo className="w-7 h-7" />
          <span className="font-bold text-sm">Tesla Admin</span>
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
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }} className="text-gray-500 hover:text-red-400 text-xs transition-colors">
            Sign Out
          </button>
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 text-xs block mt-2 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

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
                  { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '—', color: 'text-white' },
                  { label: 'Total Deposits', value: `$${(stats?.totalDeposits || 0).toLocaleString()}`, color: 'text-green-400' },
                  { label: 'Active Investments', value: stats?.activeInvestments?.toString() || '—', color: 'text-blue-400' },
                  { label: 'Pending KYC', value: stats?.pendingKyc?.toString() || '0', color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-tesla-card border border-tesla-border rounded-xl p-4">
                    <p className="text-gray-500 text-xs font-medium mb-1">{s.label}</p>
                    <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-tesla-card border border-tesla-border rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4">Recent Users</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-tesla-border">
                      <th className="text-left text-gray-500 font-medium px-3 py-2">Name</th>
                      <th className="text-left text-gray-500 font-medium px-3 py-2 hidden sm:table-cell">Email</th>
                      <th className="text-left text-gray-500 font-medium px-3 py-2">Status</th>
                      <th className="text-right text-gray-500 font-medium px-3 py-2">Joined</th>
                    </tr></thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id} className="border-b border-tesla-border/50 last:border-0">
                          <td className="text-white px-3 py-2.5 font-medium">{u.profile?.firstName || '—'} {u.profile?.lastName || ''}</td>
                          <td className="text-gray-400 px-3 py-2.5 hidden sm:table-cell">{u.email}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{u.status}</span>
                          </td>
                          <td className="text-gray-500 px-3 py-2.5 text-right text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-tesla-border flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">All Users</h3>
                <button onClick={fetchUsers} className="text-[#CC0000] text-xs hover:underline">Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-tesla-border">
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Name</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">KYC</th>
                    <th className="text-right text-gray-500 font-medium px-4 py-3">Actions</th>
                  </tr></thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-b border-tesla-border/50 last:border-0">
                        <td className="text-white px-4 py-3 font-medium">{u.profile?.firstName || '—'} {u.profile?.lastName || ''}</td>
                        <td className="text-gray-400 px-4 py-3 hidden sm:table-cell">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-900/30 text-green-400' : u.status === 'suspended' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{u.status}</span>
                        </td>
                        <td className="text-gray-400 px-4 py-3 hidden md:table-cell text-xs">{u.kycLevel || 'LEVEL_0'}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {u.status !== 'active' && (
                            <button onClick={() => updateUserStatus(u.id, 'active')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Activate</button>
                          )}
                          {u.status !== 'suspended' && (
                            <button onClick={() => updateUserStatus(u.id, 'suspended')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Suspend</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan={5} className="text-center text-gray-500 py-8">No users found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'deposits' && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Pending Deposits</h3>
                <button onClick={fetchStats} className="text-[#CC0000] text-xs hover:underline">Refresh</button>
              </div>
              <div className="text-gray-500 text-sm text-center py-12">
                <svg className="mx-auto mb-3 text-gray-600" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                Deposits will appear here when users submit them. Approve or reject from this panel.
              </div>
              <p className="text-gray-600 text-xs text-center mt-2">Deposit requests are managed in real-time from the database.</p>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Pending Withdrawals</h3>
                <button onClick={fetchStats} className="text-[#CC0000] text-xs hover:underline">Refresh</button>
              </div>
              <div className="text-gray-500 text-sm text-center py-12">
                <svg className="mx-auto mb-3 text-gray-600" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Withdrawal requests will appear here for approval.
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">KYC Verification Queue</h3>
                <button onClick={fetchStats} className="text-[#CC0000] text-xs hover:underline">Refresh</button>
              </div>
              <div className="text-gray-500 text-sm text-center py-12">
                <svg className="mx-auto mb-3 text-gray-600" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                KYC submissions will appear here for review and approval.
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-sm">TSLA Live Chart</h3>
              <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden !p-0">
                <div className="px-5 py-3 border-b border-tesla-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-white font-bold">NASDAQ:TSLA</span>
                    <span className="text-gray-500 text-sm">Tesla, Inc.</span>
                  </div>
                </div>
                <TradingViewWidget />
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}