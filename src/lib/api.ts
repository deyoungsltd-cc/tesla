import { useAuthStore } from '@/store/useAuthStore';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; referralCode?: string }) =>
      apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => apiFetch('/api/auth/me'),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  },
  plans: {
    list: () => apiFetch('/api/plans'),
    get: (slug: string) => apiFetch(`/api/plans/${slug}`),
  },
  deposits: {
    create: (body: any) => apiFetch('/api/deposits', { method: 'POST', body: JSON.stringify(body) }),
    history: (params?: string) => apiFetch(`/api/deposits/history${params ? '?' + params : ''}`),
  },
  withdrawals: {
    create: (body: any) => apiFetch('/api/withdrawals', { method: 'POST', body: JSON.stringify(body) }),
    history: (params?: string) => apiFetch(`/api/withdrawals/history${params ? '?' + params : ''}`),
  },
  investments: {
    create: (body: { planId: string; amount: number; mode: string }) =>
      apiFetch('/api/investments', { method: 'POST', body: JSON.stringify(body) }),
    active: () => apiFetch('/api/investments/active'),
    history: (params?: string) => apiFetch(`/api/investments/history${params ? '?' + params : ''}`),
  },
  wallet: {
    get: () => apiFetch('/api/wallet'),
    transactions: (type: string, params?: string) =>
      apiFetch(`/api/wallet/transactions?type=${type}${params ? '&' + params : ''}`),
  },
  referral: {
    info: () => apiFetch('/api/referral'),
    apply: (code: string) => apiFetch('/api/referral/apply', { method: 'POST', body: JSON.stringify({ code }) }),
  },
  kyc: {
    submit: (body: any) => apiFetch('/api/kyc/submit', { method: 'POST', body: JSON.stringify(body) }),
    status: () => apiFetch('/api/kyc/status'),
  },
  notifications: {
    list: (params?: string) => apiFetch(`/api/notifications${params ? '?' + params : ''}`),
    markRead: (id: string) => apiFetch('/api/notifications', { method: 'PUT', body: JSON.stringify({ notificationId: id }) }),
    unreadCount: () => apiFetch('/api/notifications/unread-count'),
  },
  support: {
    create: (body: { subject: string; message: string }) =>
      apiFetch('/api/support', { method: 'POST', body: JSON.stringify(body) }),
    list: () => apiFetch('/api/support'),
  },
  user: {
    profile: () => apiFetch('/api/user/profile'),
    updateProfile: (body: any) => apiFetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(body) }),
    setMode: (mode: string) => apiFetch('/api/user/mode', { method: 'PUT', body: JSON.stringify({ mode }) }),
  },
  admin: {
    users: (params?: string) => apiFetch(`/api/admin/users${params ? '?' + params : ''}`),
    userDetail: (id: string) => apiFetch(`/api/admin/users/${id}`),
    updateUser: (id: string, body: any) => apiFetch(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deposits: (params?: string) => apiFetch(`/api/admin/deposits${params ? '?' + params : ''}`),
    approveDeposit: (id: string) => apiFetch(`/api/admin/deposits/${id}/approve`, { method: 'POST' }),
    rejectDeposit: (id: string, reason: string) => apiFetch(`/api/admin/deposits/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
    withdrawals: (params?: string) => apiFetch(`/api/admin/withdrawals${params ? '?' + params : ''}`),
    approveWithdrawal: (id: string) => apiFetch(`/api/admin/withdrawals/${id}/approve`, { method: 'POST' }),
    rejectWithdrawal: (id: string, reason: string) => apiFetch(`/api/admin/withdrawals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
    kycPending: () => apiFetch('/api/admin/kyc'),
    approveKyc: (id: string) => apiFetch(`/api/admin/kyc/${id}/approve`, { method: 'POST' }),
    rejectKyc: (id: string, reason: string) => apiFetch(`/api/admin/kyc/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
    stats: () => apiFetch('/api/admin/stats'),
  },
};