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

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-900/30 text-green-400',
    suspended: 'bg-red-900/30 text-red-400',
    banned: 'bg-red-900/50 text-red-300',
    pending: 'bg-yellow-900/30 text-yellow-400',
    pending_verification: 'bg-yellow-900/30 text-yellow-400',
    confirmed: 'bg-green-900/30 text-green-400',
    approved: 'bg-green-900/30 text-green-400',
    rejected: 'bg-red-900/30 text-red-400',
    completed: 'bg-green-900/30 text-green-400',
    processing: 'bg-blue-900/30 text-blue-400',
    failed: 'bg-red-900/30 text-red-400',
    expired: 'bg-gray-700/50 text-gray-400',
    closed: 'bg-gray-700/50 text-gray-400',
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-700/50 text-gray-400'}`}>{status}</span>;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [kycList, setKycList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [depositFilter, setDepositFilter] = useState('');
  const [withdrawalFilter, setWithdrawalFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiCall('/api/admin/stats');
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchUsers = useCallback(async (search = '') => {
    try {
      const res = await apiCall(`/api/admin/users?limit=100${search ? `&search=${search}` : ''}`);
      const data = await res.json();
      if (data.success) setUsers(data.data.users);
    } catch (e) { console.error(e); }
  }, []);

  const fetchDeposits = useCallback(async (status = '') => {
    try {
      const res = await apiCall(`/api/admin/deposits?limit=100${status ? `&status=${status}` : ''}`);
      const data = await res.json();
      if (data.success) setDeposits(data.data.deposits);
    } catch (e) { console.error(e); }
  }, []);

  const fetchWithdrawals = useCallback(async (status = '') => {
    try {
      const res = await apiCall(`/api/admin/withdrawals?limit=100${status ? `&status=${status}` : ''}`);
      const data = await res.json();
      if (data.success) setWithdrawals(data.data.withdrawals);
    } catch (e) { console.error(e); }
  }, []);

  const fetchKyc = useCallback(async (status = '') => {
    try {
      const res = await apiCall(`/api/admin/kyc?limit=100${status ? `&status=${status}` : ''}`);
      const data = await res.json();
      if (data.success) setKycList(data.data.verifications);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'dashboard') { fetchStats(); fetchUsers(); }
    if (activeTab === 'users') fetchUsers(searchTerm);
    if (activeTab === 'deposits') fetchDeposits(depositFilter);
    if (activeTab === 'withdrawals') fetchWithdrawals(withdrawalFilter);
    if (activeTab === 'kyc') fetchKyc();
  }, [activeTab, depositFilter, withdrawalFilter]);

  const updateUserStatus = async (userId: string, status: string) => {
    setActionLoading(userId);
    try {
      const res = await apiCall('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ userId, action: 'status', value: status }),
      });
      const data = await res.json();
      if (data.success) { showToast(`User ${status} successfully`); fetchUsers(searchTerm); fetchStats(); }
      else showToast(data.error?.message || 'Action failed');
    } catch { showToast('Network error'); }
    setActionLoading(null);
  };

  const handleDepositAction = async (depositId: string, action: 'approve' | 'reject') => {
    setActionLoading(depositId);
    const reason = action === 'reject' ? prompt('Rejection reason:') : undefined;
    if (action === 'reject' && reason === null) { setActionLoading(null); return; }
    try {
      const res = await apiCall('/api/admin/deposits', {
        method: 'PATCH',
        body: JSON.stringify({ depositId, action, reason }),
      });
      const data = await res.json();
      if (data.success) { showToast(`Deposit ${action}d`); fetchDeposits(depositFilter); fetchStats(); }
      else showToast(data.error?.message || 'Action failed');
    } catch { showToast('Network error'); }
    setActionLoading(null);
  };

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject') => {
    setActionLoading(withdrawalId);
    const reason = action === 'reject' ? prompt('Rejection reason:') : undefined;
    if (action === 'reject' && reason === null) { setActionLoading(null); return; }
    try {
      const res = await apiCall('/api/admin/withdrawals', {
        method: 'PATCH',
        body: JSON.stringify({ withdrawalId, action, reason }),
      });
      const data = await res.json();
      if (data.success) { showToast(`Withdrawal ${action}d`); fetchWithdrawals(withdrawalFilter); fetchStats(); }
      else showToast(data.error?.message || 'Action failed');
    } catch { showToast('Network error'); }
    setActionLoading(null);
  };

  const handleKycAction = async (verificationId: string, action: 'approve' | 'reject') => {
    setActionLoading(verificationId);
    const reason = action === 'reject' ? prompt('Rejection reason:') : undefined;
    if (action === 'reject' && reason === null) { setActionLoading(null); return; }
    try {
      const res = await apiCall('/api/admin/kyc', {
        method: 'PATCH',
        body: JSON.stringify({ verificationId, action, reason }),
      });
      const data = await res.json();
      if (data.success) { showToast(`KYC ${action}d`); fetchKyc(); fetchStats(); }
      else showToast(data.error?.message || 'Action failed');
    } catch { showToast('Network error'); }
    setActionLoading(null);
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(searchTerm); };

  return (
    <div className="min-h-screen bg-tesla-dark text-white flex">
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-tesla-card border border-tesla-border rounded-lg px-4 py-3 text-sm shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

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
              {item.key === 'deposits' && stats?.pendingDeposits > 0 && (
                <span className="ml-auto bg-yellow-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingDeposits}</span>
              )}
              {item.key === 'withdrawals' && stats?.pendingWithdrawals > 0 && (
                <span className="ml-auto bg-yellow-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingWithdrawals}</span>
              )}
              {item.key === 'kyc' && stats?.pendingKyc > 0 && (
                <span className="ml-auto bg-yellow-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingKyc}</span>
              )}
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
        <div className="p-4 sm:p-6 max-w-7xl">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '—', color: 'text-white', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
                  { label: 'Total Deposits', value: `$${(stats?.totalDeposits || 0).toLocaleString()}`, color: 'text-green-400', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg> },
                  { label: 'Active Investments', value: stats?.activeInvestments?.toString() || '—', color: 'text-blue-400', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
                  { label: 'Total Investments', value: `$${(stats?.totalInvestments || 0).toLocaleString()}`, color: 'text-purple-400', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" /></svg> },
                ].map((s, i) => (
                  <div key={i} className="bg-tesla-card border border-tesla-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-500 text-xs font-medium">{s.label}</p>
                      <span className="text-gray-600">{s.icon}</span>
                    </div>
                    <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Pending actions row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Pending KYC', value: stats?.pendingKyc || 0, color: 'text-yellow-400', tab: 'kyc' },
                  { label: 'Pending Deposits', value: stats?.pendingDeposits || 0, color: 'text-green-400', tab: 'deposits' },
                  { label: 'Pending Withdrawals', value: stats?.pendingWithdrawals || 0, color: 'text-red-400', tab: 'withdrawals' },
                ].map((s, i) => (
                  <button key={i} onClick={() => setActiveTab(s.tab)} className="bg-tesla-card border border-tesla-border rounded-xl p-4 text-left hover:border-gray-500 transition-colors">
                    <p className="text-gray-500 text-xs font-medium mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </button>
                ))}
              </div>

              <div className="bg-tesla-card border border-tesla-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm">Recent Users</h3>
                  <button onClick={() => setActiveTab('users')} className="text-[#CC0000] text-xs hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-tesla-border">
                      <th className="text-left text-gray-500 font-medium px-3 py-2">Name</th>
                      <th className="text-left text-gray-500 font-medium px-3 py-2 hidden sm:table-cell">Email</th>
                      <th className="text-left text-gray-500 font-medium px-3 py-2">Status</th>
                      <th className="text-right text-gray-500 font-medium px-3 py-2">Joined</th>
                    </tr></thead>
                    <tbody>
                      {(stats?.recentUsers || users.slice(0, 5)).map((u: any) => (
                        <tr key={u.id} className="border-b border-tesla-border/50 last:border-0">
                          <td className="text-white px-3 py-2.5 font-medium">{u.profile?.firstName || '—'} {u.profile?.lastName || ''}</td>
                          <td className="text-gray-400 px-3 py-2.5 hidden sm:table-cell">{u.email}</td>
                          <td className="px-3 py-2.5">{statusBadge(u.status)}</td>
                          <td className="text-gray-500 px-3 py-2.5 text-right text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {(stats?.recentUsers || users).length === 0 && (
                        <tr><td colSpan={4} className="text-center text-gray-500 py-8">No users yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="flex-1 bg-tesla-card border border-tesla-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000]"
                />
                <button type="submit" className="bg-tesla-card border border-tesla-border hover:border-gray-500 px-4 py-2.5 rounded-lg text-sm transition-colors">Search</button>
                <button type="button" onClick={() => { setSearchTerm(''); fetchUsers(''); }} className="bg-tesla-card border border-tesla-border hover:border-gray-500 px-4 py-2.5 rounded-lg text-sm transition-colors">Clear</button>
              </form>
              <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-tesla-border">
                      <th className="text-left text-gray-500 font-medium px-4 py-3">Name</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Email</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">KYC</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Wallets</th>
                      <th className="text-right text-gray-500 font-medium px-4 py-3">Actions</th>
                    </tr></thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id} className="border-b border-tesla-border/50 last:border-0">
                          <td className="text-white px-4 py-3 font-medium">{u.profile?.firstName || '—'} {u.profile?.lastName || ''}</td>
                          <td className="text-gray-400 px-4 py-3 hidden sm:table-cell">{u.email}</td>
                          <td className="px-4 py-3">{statusBadge(u.status)}</td>
                          <td className="px-4 py-3 hidden md:table-cell">{statusBadge(u.kycLevel || 'LEVEL_0')}</td>
                          <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                            {u.wallets?.map((w: any) => `${w.type}: $${(w.balance||0).toLocaleString()}`).join(' | ') || '—'}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            {u.status !== 'active' && (
                              <button onClick={() => updateUserStatus(u.id, 'active')} disabled={actionLoading === u.id} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Activate</button>
                            )}
                            {u.status !== 'suspended' && u.status !== 'banned' && (
                              <button onClick={() => updateUserStatus(u.id, 'suspended')} disabled={actionLoading === u.id} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Suspend</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && <tr><td colSpan={6} className="text-center text-gray-500 py-8">No users found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DEPOSITS TAB */}
          {activeTab === 'deposits' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['', 'pending', 'pending_verification', 'confirmed', 'rejected'].map((s) => (
                  <button key={s} onClick={() => setDepositFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${depositFilter === s ? 'border-[#CC0000] text-[#CC0000]' : 'border-tesla-border text-gray-400 hover:text-white'}`}>
                    {s || 'All'}
                  </button>
                ))}
              </div>
              <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-tesla-border">
                      <th className="text-left text-gray-500 font-medium px-4 py-3">User</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3">Amount</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Method</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Date</th>
                      <th className="text-right text-gray-500 font-medium px-4 py-3">Actions</th>
                    </tr></thead>
                    <tbody>
                      {deposits.map((d: any) => (
                        <tr key={d.id} className="border-b border-tesla-border/50 last:border-0">
                          <td className="text-white px-4 py-3">
                            <div className="font-medium">{d.user?.profile?.firstName || '—'} {d.user?.profile?.lastName || ''}</div>
                            <div className="text-gray-500 text-xs">{d.user?.email}</div>
                          </td>
                          <td className="text-green-400 font-semibold px-4 py-3">${d.amount?.toLocaleString()}</td>
                          <td className="text-gray-400 px-4 py-3 hidden sm:table-cell capitalize">{d.method?.replace('_', ' ')}</td>
                          <td className="px-4 py-3">{statusBadge(d.status)}</td>
                          <td className="text-gray-500 px-4 py-3 text-xs hidden md:table-cell">{new Date(d.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            {(d.status === 'pending' || d.status === 'pending_verification') && (
                              <>
                                <button onClick={() => handleDepositAction(d.id, 'approve')} disabled={actionLoading === d.id} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                                <button onClick={() => handleDepositAction(d.id, 'reject')} disabled={actionLoading === d.id} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                      {deposits.length === 0 && <tr><td colSpan={6} className="text-center text-gray-500 py-12">No deposits found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* WITHDRAWALS TAB */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['', 'pending', 'processing', 'completed', 'rejected'].map((s) => (
                  <button key={s} onClick={() => setWithdrawalFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${withdrawalFilter === s ? 'border-[#CC0000] text-[#CC0000]' : 'border-tesla-border text-gray-400 hover:text-white'}`}>
                    {s || 'All'}
                  </button>
                ))}
              </div>
              <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-tesla-border">
                      <th className="text-left text-gray-500 font-medium px-4 py-3">User</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3">Amount</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Destination</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                      <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Date</th>
                      <th className="text-right text-gray-500 font-medium px-4 py-3">Actions</th>
                    </tr></thead>
                    <tbody>
                      {withdrawals.map((w: any) => (
                        <tr key={w.id} className="border-b border-tesla-border/50 last:border-0">
                          <td className="text-white px-4 py-3">
                            <div className="font-medium">{w.user?.profile?.firstName || '—'} {w.user?.profile?.lastName || ''}</div>
                            <div className="text-gray-500 text-xs">{w.user?.email}</div>
                          </td>
                          <td className="text-red-400 font-semibold px-4 py-3">${w.amount?.toLocaleString()}</td>
                          <td className="text-gray-400 px-4 py-3 hidden sm:table-cell capitalize">{w.destinationType}</td>
                          <td className="px-4 py-3">{statusBadge(w.status)}</td>
                          <td className="text-gray-500 px-4 py-3 text-xs hidden md:table-cell">{new Date(w.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            {w.status === 'pending' && (
                              <>
                                <button onClick={() => handleWithdrawalAction(w.id, 'approve')} disabled={actionLoading === w.id} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                                <button onClick={() => handleWithdrawalAction(w.id, 'reject')} disabled={actionLoading === w.id} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                      {withdrawals.length === 0 && <tr><td colSpan={6} className="text-center text-gray-500 py-12">No withdrawals found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* KYC TAB */}
          {activeTab === 'kyc' && (
            <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-tesla-border">
                    <th className="text-left text-gray-500 font-medium px-4 py-3">User</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Level</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Submitted</th>
                    <th className="text-right text-gray-500 font-medium px-4 py-3">Actions</th>
                  </tr></thead>
                  <tbody>
                    {kycList.map((k: any) => (
                      <tr key={k.id} className="border-b border-tesla-border/50 last:border-0">
                        <td className="text-white px-4 py-3 font-medium">{k.user?.profile?.firstName || '—'} {k.user?.profile?.lastName || ''}</td>
                        <td className="text-gray-400 px-4 py-3 hidden sm:table-cell">{k.user?.email}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-300">{k.level}</td>
                        <td className="px-4 py-3">{statusBadge(k.status)}</td>
                        <td className="text-gray-500 px-4 py-3 text-xs hidden md:table-cell">{k.submittedAt ? new Date(k.submittedAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          {k.status === 'pending' && (
                            <>
                              <button onClick={() => handleKycAction(k.id, 'approve')} disabled={actionLoading === k.id} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                              <button onClick={() => handleKycAction(k.id, 'reject')} disabled={actionLoading === k.id} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {kycList.length === 0 && <tr><td colSpan={6} className="text-center text-gray-500 py-12">No KYC submissions found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MARKET TAB */}
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