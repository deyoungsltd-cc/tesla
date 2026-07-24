import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login - Tesla Prime Capital',
  robots: 'noindex, nofollow',
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-tesla-dark text-white">
      {children}
    </div>
  );
}
