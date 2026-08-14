import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  status: string;
  kycLevel: string;
  kycVerificationCode: string | null;
  activeMode: 'demo' | 'live';
  referralCode: string;
  twoFactorEnabled: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    country?: string;
  };
  adminRecord?: {
    role: string;
    isSuperAdmin: boolean;
  };
  wallets?: Array<{
    id: string;
    type: 'demo' | 'live';
    balance: number;
    availableBalance: number;
    lockedBalance: number;
  }>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  fetchUser: () => Promise<void>;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  getActiveWallet: () => any;
}

// Restore user from localStorage on init (client-side only)
function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isLoading: !!getStoredToken(),

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Set token cookie for middleware protection
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
    }
    set({ user, token, isLoading: false });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Clear token cookie
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    }
    set({ user: null, token: null, isLoading: false });
  },

  setLoading: (val: boolean) => set({ isLoading: val }),

  // Fetch fresh user data from API (used when store has token but no user)
  fetchUser: async () => {
    const { token } = get();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        set({ user: data.data, isLoading: false });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.data));
        }
      } else {
        // Token invalid — clear auth
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        set({ user: null, token: null, isLoading: false });
      }
    } catch {
      // Network error — keep existing data
      set({ isLoading: false });
    }
  },

  isAdmin: () => {
    const { user } = get();
    return !!user?.adminRecord;
  },

  isSuperAdmin: () => {
    const { user } = get();
    return !!user?.adminRecord?.isSuperAdmin;
  },

  getActiveWallet: () => {
    const { user } = get();
    if (!user?.wallets) return null;
    return user.wallets.find(w => w.type === user.activeMode);
  },
}));
