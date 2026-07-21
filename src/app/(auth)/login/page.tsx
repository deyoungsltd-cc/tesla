'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import ChatWidget from '@/components/ChatWidget';

function TeslaLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8C50 8 30 8 20 12L16 40C16 40 10 72 8 88H28L32 56H48V88H52V56H68L72 88H92C92 88 84 40 84 40L80 12C70 8 50 8 50 8Z" fill="#CC0000" />
      <rect x="36" y="4" width="28" height="8" rx="4" fill="#CC0000" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        Cookies.set('token', data.token, { expires: 7 });
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@teslaprimecapital.com');
    setPassword('Admin@123');
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@teslaprimecapital.com', password: 'Admin@123' }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        Cookies.set('token', data.token, { expires: 7 });
        router.push('/dashboard');
      } else {
        setError(data.error || 'Demo login failed.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tesla-dark flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <TeslaLogo className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your TeslaPrimeCapital account</p>
        </div>

        <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 text-right">
            <a href="#" className="text-[#CC0000] text-sm hover:underline">Forgot password?</a>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 bg-[#CC0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-3 border border-tesla-border hover:border-gray-500 text-gray-300 hover:text-white font-medium py-3 rounded-lg transition-colors text-sm"
          >
            Demo Login (Admin)
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#CC0000] hover:underline font-medium">Sign Up</Link>
          </p>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}