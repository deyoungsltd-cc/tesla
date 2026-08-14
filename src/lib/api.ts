import { useAuthStore } from '@/store/useAuthStore';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Request failed');
  return json.success ? json.data : json;
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
    upload: (formData: FormData) => {
      const token = useAuthStore.getState().token;
      return fetch('/api/kyc/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }).then(async (res) => {
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          if (!json.success) throw new Error(json.error?.message || 'Upload failed');
          return json.success ? json.data : json;
        } catch (e) {
          if (e instanceof SyntaxError) throw new Error(`Server returned invalid response. Please try again.`);
          throw e;
        }
      });
    },
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
    avatar: (formData: FormData) => {
      const token = useAuthStore.getState().token;
      return fetch('/api/user/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }).then((res) => res.json());
    },
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
    setKycCode: (userId: string, body: { code: string; notifyUser?: boolean; adminMessage?: string }) =>
      apiFetch(`/api/admin/users/${userId}/kyc-code`, { method: 'POST', body: JSON.stringify(body) }),
    stats: () => apiFetch('/api/admin/stats'),
    sendMessage: (body: any) => apiFetch('/api/admin/messages', { method: 'POST', body: JSON.stringify(body) }),
    patchUser: (body: any) => apiFetch('/api/admin/users', { method: 'PATCH', body: JSON.stringify(body) }),
    auditLog: (params?: string) => apiFetch(`/api/admin/audit-log${params ? '?' + params : ''}`),
    vehicles: {
      orders: (params?: string) => apiFetch(`/api/admin/vehicles${params ? '?' + params : ''}`),
      list: () => apiFetch('/api/admin/vehicles?type=vehicles'),
      updateOrder: (id: string, body: any) => apiFetch(`/api/admin/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
      updateVehicle: (id: string, body: any) => apiFetch(`/api/admin/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify({ ...body, _target: 'vehicle' }) }),
      deleteVehicle: (id: string) => apiFetch(`/api/admin/vehicles/${id}?target=vehicle`, { method: 'DELETE' }),
      createVehicle: (body: any) => apiFetch('/api/admin/vehicles', { method: 'POST', body: JSON.stringify(body) }),
    },
  },
  vehicles: {
    list: (params?: string) => apiFetch(`/api/vehicles${params ? '?' + params : ''}`),
    myOrders: () => apiFetch('/api/vehicles/my-orders'),
    createOrder: (body: any) => apiFetch('/api/vehicles/order', { method: 'POST', body: JSON.stringify(body) }),
    tracking: (orderId: string) => apiFetch(`/api/vehicles/tracking?orderId=${orderId}`),
    trackByCode: (orderNumber: string) => apiFetch(`/api/vehicles/track-by-code?orderNumber=${encodeURIComponent(orderNumber)}`),
    getBySlug: (slug: string) => apiFetch(`/api/vehicles/slug?slug=${encodeURIComponent(slug)}`),
    cancelOrder: (orderId: string) => apiFetch(`/api/vehicles/cancel-order?orderId=${orderId}`, { method: 'POST' }),
    submitDeposit: (body: any) => apiFetch('/api/vehicles/deposit', { method: 'POST', body: JSON.stringify(body) }),
    invoice: (orderId: string) => fetch(`/api/vehicles/invoice?orderId=${orderId}`, {
      headers: { Authorization: 'Bearer ' + useAuthStore.getState().token },
    }).then(res => res.text()),
  },
};