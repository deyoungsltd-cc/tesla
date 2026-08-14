'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('token');
    document.cookie = 'adminToken=; path=/; max-age=0';
    document.cookie = 'token=; path=/; max-age=0';
  }, []);

  return (
    <div className="min-h-screen bg-tesla-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-white mb-2">Session Expired</h1>
        <p className="text-gray-400 text-sm mb-6">
          Your admin session is invalid or has expired. Please sign in again.
        </p>
        <button
          onClick={() => router.push('/admin/login')}
          className="bg-[#CC0000] text-white px-6 py-2 rounded-xl text-sm font-bold"
        >
          Sign In Again
        </button>
      </div>
    </div>
  );
}
