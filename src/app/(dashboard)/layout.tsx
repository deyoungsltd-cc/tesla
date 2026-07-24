'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import TeslaLogo from '@/components/TeslaLogo';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/investments': 'Investments',
  '/deposit': 'Deposit',
  '/withdraw': 'Withdraw',
  '/kyc': 'KYC Verification',
  '/profile': 'Profile',
  '/referral': 'Referrals',
  '/notifications': 'Notifications',
  '/support': 'Support',
  '/security': 'Security',
  '/market': 'Market Overview',
};

const bottomNav = [
  { href: '/dashboard', label: 'Home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { href: '/investments', label: 'Invest', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
  { href: '/deposit', label: 'Deposit', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg> },
  { href: '/withdraw', label: 'Withdraw', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg> },
  { href: '/profile', label: 'Profile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = titles[pathname] || 'Dashboard';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-tesla-dark flex flex-col">
      <header className="sticky top-0 z-40 bg-tesla-dark/95 backdrop-blur-md border-b border-tesla-border shrink-0">
        <div className="flex items-center justify-between h-14 px-4 max-w-4xl w-full mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeslaLogo variant="compact" className="h-8 shrink-0" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/notifications" className="relative text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#CC0000] rounded-full" />
            </Link>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-[#CC0000] flex items-center justify-center text-white text-xs font-bold">
              ME
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-5 pb-24 max-w-4xl w-full mx-auto animate-fade-in overflow-x-hidden">
        {children}
      </main>
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-tesla-card/95 backdrop-blur-md border-t border-tesla-border safe-bottom">
        <div className="flex items-center justify-around h-14 md:h-16 max-w-lg mx-auto">
          {bottomNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${active ? 'text-[#CC0000]' : 'text-gray-500'}`}>
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}