'use client';

import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', iconPath: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  { label: 'Investments', href: '/investments', iconPath: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { label: 'Referrals', href: '/referral', iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { label: 'KYC Verification', href: '/kyc', iconPath: 'M3 4h18v16H3zM3 10h18' },
  { label: 'Notifications', href: '/notifications', iconPath: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' },
  { label: 'Support', href: '/support', iconPath: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01' },
  { label: 'Transfer to', href: '/withdraw', iconPath: 'M12 5v14M19 12l-7 7-7-7' },
];

function MenuIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-5">
      {/* User Card */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#CC0000] flex items-center justify-center text-white text-xl font-bold shrink-0">
          JD
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-white font-bold text-lg">John Doe</h2>
            <span className="bg-[#CC0000]/15 text-[#CC0000] text-[10px] font-bold px-2 py-0.5 rounded-full">Investor</span>
            <span className="bg-amber-600/15 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Level 2</span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5 truncate">john.doe@example.com</p>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-4">
        <p className="text-gray-500 text-xs font-medium mb-1">Wallet Address</p>
        <p className="text-gray-300 text-sm font-mono break-all">0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38</p>
      </div>

      {/* Menu */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl overflow-hidden">
        {menuItems.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[#2a2a2a] transition-colors ${i < menuItems.length - 1 ? 'border-b border-tesla-border/50' : ''}`}
          >
            <span className="text-gray-400"><MenuIcon d={item.iconPath} /></span>
            <span className="text-white text-sm font-medium flex-1">{item.label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/deposit" className="bg-[#CC0000] hover:bg-[#a30000] text-white text-sm font-semibold py-3 rounded-xl text-center transition-colors">
          Deposit
        </Link>
        <Link href="/withdraw" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl text-center transition-colors">
          Withdraw
        </Link>
      </div>

      <ChatWidget />
    </div>
  );
}
