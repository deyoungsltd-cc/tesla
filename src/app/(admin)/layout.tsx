import type { Metadata } from 'next';
import AdminAuthGate from '@/components/AdminAuthGate';

export const metadata: Metadata = {
  title: 'Admin Panel - TeslaPrime',
  robots: 'noindex, nofollow',
};

// Force dynamic rendering — prevent static prerender of auth-gated pages
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-tesla-dark text-white">
        {children}
      </div>
    </AdminAuthGate>
  );
}
