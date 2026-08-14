'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const adminUser = localStorage.getItem('adminUser');

    // Must have both token and user data in localStorage
    if (!adminToken || !adminUser) {
      router.replace('/admin/login');
      return;
    }

    // Verify stored user has adminRecord
    try {
      const parsed = JSON.parse(adminUser);
      if (!parsed.adminRecord) {
        router.replace('/admin/login');
        return;
      }
    } catch {
      router.replace('/admin/login');
      return;
    }

    // Verify token with server — but don't block on network error
    // If the server is unreachable, trust the localStorage data
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.adminRecord) {
          setAuthed(true);
        } else {
          // Token invalid or user is not admin
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('token');
          document.cookie = 'adminToken=; path=/; max-age=0';
          document.cookie = 'token=; path=/; max-age=0';
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        // Network error — trust localStorage and let user in
        // API calls will fail naturally if token is truly invalid
        setAuthed(true);
      })
      .finally(() => setChecking(false));
  }, [router]);

  if (checking || !authed) {
    return (
      <div className="min-h-screen bg-tesla-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#CC0000]/30 border-t-[#CC0000] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
