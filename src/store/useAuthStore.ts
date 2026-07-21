import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  status: string;
  kycLevel: string;
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
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  getActiveWallet: () => any;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: true,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') localStorage.setItem('token', token);
    set({ user, token, isLoading: false });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    set({ user: null, token: null, isLoading: false });
  },

  setLoading: (val: boolean) => set({ isLoading: val }),

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