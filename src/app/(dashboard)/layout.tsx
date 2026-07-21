'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

function TeslaLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8C50 8 30 8 20 12L16 40C16 40 10 72 8 88H28L32 56H48V88H52V56H68L72 88H92C92 88 84 40 84 40L80 12C70 8 50 8 50 8Z" fill="#CC0000" />
      <rect x="36" y="4" width="28" height="8" rx="4" fill="#CC0000" />
    </svg>
  );
}

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
  '/market': 'Market Overview',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const title = titles[pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-tesla-dark">
      <header className="sticky top-0 z-40 bg-tesla-dark/95 backdrop-blur-md border-b border-tesla-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-white font-semibold text-base">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="relative text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#CC0000] rounded-full border-2 border-tesla-dark" />
            </Link>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-[#CC0000] flex items-center justify-center text-white text-xs font-bold">
              JD
            </Link>
          </div>
        </div>
      </header>
      <main className="px-5 py-6 pb-24 max-w-4xl mx-auto animate-fade-in">
        {children}
      </main>
    </div>
  );
}