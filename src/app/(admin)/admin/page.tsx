'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });

function TeslaTLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <div className={`w-8 h-8 rounded-lg bg-[#CC0000]/10 border border-[#CC0000]/20 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.743 0L7.79 12.276h3.166l.546-1.397h5.506l.546 1.397h3.166L15.257 0h-2.514zM12 4.583l1.835 4.744h-3.67L12 4.583zM7.79 12.276L.1 24h23.8l-7.69-11.724H7.79z" fill="#CC0000"/>
      </svg>
    </div>
  );
}

const navItems = [
  { label: 'Dashboard', key: 'dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
  { label: 'Users', key: 'users', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { label: 'Deposits', key: 'deposits', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg> },
  { label: 'Withdrawals', key: 'withdrawals', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg> },
  { label: 'KYC Review', key: 'kyc', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18v16H3z" /><path d="M3 10h18" /></svg> },
  { label: 'Market', key: 'market', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
  { label: 'Settings', key: 'settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
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
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
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
  const [settingsPhotoUrl, setSettingsPhotoUrl] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminUser = localStorage.getItem('adminUser');
    if (!token || !adminUser) {
      router.replace('/admin/login');
      return;
    }
    try {
      const parsed = JSON.parse(adminUser);
      if (!parsed.adminRecord) {
        router.replace('/admin/login');
        return;
      }
    } catch { router.replace('/admin/login'); return; }
    setAuthed(true);
  }, [router]);

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
    if (activeTab === 'settings') {
      apiCall('/api/admin/settings').then(r => r.json()).then(d => {
        if (d.success && d.data?.aboutPhotoUrl) setSettingsPhotoUrl(d.data.aboutPhotoUrl);
      });
    }
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
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-tesla-border">
          <TeslaTLogo />
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
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('adminUser'); localStorage.removeItem('user'); router.push('/admin/login'); }} className="text-gray-500 hover:text-red-400 text-xs transition-colors">
            Sign Out
          </button>
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-xs block mt-2 transition-colors">
            &larr; Back to Main Site
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

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-white font-semibold text-sm">Site Settings</h3>

              {/* About Page Photo */}
              <div className="bg-tesla-card border border-tesla-border rounded-xl p-6">
                <h4 className="text-white font-medium mb-1">About Page Photo</h4>
                <p className="text-gray-500 text-xs mb-5">Upload a photo for the About page leadership section. Max 5MB. JPG, PNG, WebP.</p>

                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border border-tesla-border bg-[#1a1a1a] shrink-0">
                    {settingsPhotoUrl ? (
                      <img src={settingsPhotoUrl} alt="Current About Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No photo set</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#ff1a1a] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      {settingsLoading ? 'Uploading...' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            showToast('File too large. Max 5MB.');
                            return;
                          }
                          setSettingsLoading(true);
                          try {
                            const fd = new FormData();
                            fd.append('photo', file);
                            const token = localStorage.getItem('token');
                            const res = await fetch('/api/admin/settings', {
                              method: 'POST',
                              headers: token ? { Authorization: `Bearer ${token}` } : {},
                              body: fd,
                            });
                            const data = await res.json();
                            if (data.success) {
                              setSettingsPhotoUrl(data.data.aboutPhotoUrl);
                              showToast('Photo updated successfully!');
                            } else {
                              showToast(data.error?.message || 'Upload failed');
                            }
                          } catch {
                            showToast('Upload failed');
                          }
                          setSettingsLoading(false);
                        }}
                      />
                    </label>

                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Or paste an image URL..."
                        className="bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors"
                        defaultValue={settingsPhotoUrl || ''}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const url = (e.target as HTMLInputElement).value.trim();
                            if (!url) return;
                            setSettingsLoading(true);
                            try {
                              const token = localStorage.getItem('token');
                              const res = await fetch('/api/admin/settings', {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                },
                                body: JSON.stringify({ aboutPhotoUrl: url }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                setSettingsPhotoUrl(data.data.aboutPhotoUrl);
                                showToast('Photo URL updated!');
                              } else {
                                showToast(data.error?.message || 'Update failed');
                              }
                            } catch {
                              showToast('Update failed');
                            }
                            setSettingsLoading(false);
                          }
                        }}
                      />
                      <button
                        onClick={async () => {
                          const input = (document.querySelector('input[placeholder="Or paste an image URL..."]') as HTMLInputElement);
                          const url = input?.value.trim();
                          if (!url) return;
                          setSettingsLoading(true);
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch('/api/admin/settings', {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                              },
                              body: JSON.stringify({ aboutPhotoUrl: url }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setSettingsPhotoUrl(data.data.aboutPhotoUrl);
                              showToast('Photo URL updated!');
                            } else {
                              showToast(data.error?.message || 'Update failed');
                            }
                          } catch {
                            showToast('Update failed');
                          }
                          setSettingsLoading(false);
                        }}
                        className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium px-4 py-2 rounded-lg border border-tesla-border transition-colors self-start"
                      >
                        Save URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}