'use client';

import ChatWidget from '@/components/ChatWidget';

const notifications = [
  { id: 1, title: 'Investment Confirmed', message: 'Your Gold Plan investment of $25,000 has been confirmed and is now active. Daily returns will begin accruing immediately.', time: '2 hours ago', unread: true },
  { id: 2, title: 'KYC Approved', message: 'Your identity verification has been approved. You now have full access to all platform features including withdrawals.', time: '1 day ago', unread: true },
  { id: 3, title: 'Daily Profit Credited', message: 'Your daily profit of $300.00 has been credited to your account from the Gold Plan investment.', time: '2 days ago', unread: false },
  { id: 4, title: 'Welcome to Tesla', message: 'Thank you for joining Tesla. Complete your KYC verification to unlock all features and start earning daily returns.', time: '5 days ago', unread: false },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-bold text-lg">Notifications</h2>
        <p className="text-gray-500 text-sm mt-0.5">Stay updated on your investment activity</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className={`bg-tesla-card border rounded-xl p-4 transition-colors ${n.unread ? 'border-[#CC0000]/30' : 'border-tesla-border'}`}>
            <div className="flex items-start gap-3">
              {n.unread && (
                <span className="w-2.5 h-2.5 bg-[#CC0000] rounded-full shrink-0 mt-1.5" />
              )}
              {!n.unread && <span className="w-2.5 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${n.unread ? 'text-white' : 'text-gray-300'}`}>{n.title}</h3>
                  <span className="text-gray-600 text-xs whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ChatWidget />
    </div>
  );
}
