'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import Layout from '@/components/tpc/layout';
import Landing from '@/components/tpc/landing';
import Auth from '@/components/tpc/auth';
import Dashboard from '@/components/tpc/dashboard';
import Plans from '@/components/tpc/plans';
import Investments from '@/components/tpc/investments';
import Deposits from '@/components/tpc/deposits';
import Withdrawals from '@/components/tpc/withdrawals';
import Referral from '@/components/tpc/referral';
import Kyc from '@/components/tpc/kyc';
import Profile from '@/components/tpc/profile';
import Support from '@/components/tpc/support';
import Admin from '@/components/tpc/admin';

type PageKey = 'dashboard' | 'plans' | 'deposits' | 'withdrawals' | 'investments' | 'referral' | 'kyc' | 'profile' | 'support' | 'admin';

const pageTitles: Record<PageKey, string> = {
  dashboard: 'Dashboard',
  plans: 'Investment Plans',
  deposits: 'Deposits',
  withdrawals: 'Withdrawals',
  investments: 'Investments',
  referral: 'Referral Program',
  kyc: 'KYC Verification',
  profile: 'Profile & Settings',
  support: 'Support',
  admin: 'Admin Panel',
};

export default function Home() {
  const { user, setAuth, logout, setLoading } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [activePage, setActivePage] = useState<PageKey>('dashboard');
  const [initChecked, setInitChecked] = useState(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('tpc_token') : null;
    const init = async () => {
      if (storedToken) {
        try {
          const data = await api.auth.me();
          setAuth(data.user || data, storedToken);
        } catch {
          logout();
        }
      }
      setLoading(false);
      setInitChecked(true);
    };
    init();
  }, []);

  if (!initChecked) return null;

  if (!user) {
    return (
      <>
        <Landing
          onLogin={() => setAuthMode('login')}
          onRegister={() => setAuthMode('register')}
          onShowPlans={() => setAuthMode('register')}
        />
        <Auth mode={authMode} onClose={() => setAuthMode(null)} onSwitch={(m) => setAuthMode(m)} />
      </>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard navigate={setActivePage} />;
      case 'plans': return <Plans navigate={setActivePage} />;
      case 'investments': return <Investments />;
      case 'deposits': return <Deposits />;
      case 'withdrawals': return <Withdrawals />;
      case 'referral': return <Referral />;
      case 'kyc': return <Kyc />;
      case 'profile': return <Profile />;
      case 'support': return <Support />;
      case 'admin': return <Admin />;
      default: return null;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage} pageTitle={pageTitles[activePage]}>
      {renderPage()}
    </Layout>
  );
}