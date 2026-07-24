'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || 'Login failed');
        return;
      }

      if (!data.data.user.adminRecord) {
        setError('This account does not have admin access.');
        return;
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.data.user));
      router.push('/admin');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tesla-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#CC0000]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#CC0000]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#CC0000]/10 border border-[#CC0000]/20 mb-5">
            <svg viewBox="0 0 24 24" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5.362l2.475-3.026s4.245.09 8.471 2.054c-1.082 1.636-3.231 2.438-3.231 2.438-.146-1.439-1.154-1.79-4.354-1.79L12 24 8.619 5.034c-3.18 0-4.188.354-4.335 1.792 0 0-2.146-.795-3.229-2.43C5.28 2.431 9.525 2.34 9.525 2.34L12 5.362h-.004.004zm0-3.899c3.415-.03 7.326.528 11.328 2.28.535-.968.672-1.395.672-1.395C19.625.612 15.528.015 12 0 8.472.015 4.375.61 0 2.349c0 0 .195.525.672 1.396C4.674 1.989 8.585 1.435 12 1.46V1.463z" fill="#CC0000"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Tesla Prime Capital Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tesla.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000]/50 focus:shadow-[0_0_20px_rgba(204,0,0,0.08)] transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000]/50 focus:shadow-[0_0_20px_rgba(204,0,0,0.08)] transition-all duration-300"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CC0000] hover:bg-[#ff1a1a] disabled:bg-[#CC0000]/50 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(204,0,0,0.3)] hover:shadow-[0_4px_25px_rgba(204,0,0,0.4)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <a href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
            ← Back to main site
          </a>
        </div>
      </div>
    </div>
  );
}
