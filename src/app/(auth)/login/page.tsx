'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';
import { useAuthStore } from '@/store/useAuthStore';
import TeslaLogo from '@/components/TeslaLogo';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load saved email (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('remembered_email');
      if (saved) { setEmail(saved); setRememberMe(true); }
    } catch {}
  }, []);

  const doLogin = async () => {
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
      if (res.ok && data.success && data.data?.token) {
        // Save remembered email
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }

        setAuth(data.data.user, data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        if (data.data.user?.adminRecord) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error?.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doLogin();
  };

  return (
    <div className="min-h-screen bg-tesla-dark flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <TeslaLogo className="w-24 h-auto mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your Tesla Prime Capital account</p>
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
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                autoComplete="email"
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
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#CC0000] w-3.5 h-3.5"
              />
              <span className="text-gray-400 text-xs">Remember me</span>
            </label>
            <Link href="#" className="text-[#CC0000] text-xs hover:underline">Forgot password?</Link>
          </div>

          <button
            onClick={doLogin}
            disabled={loading}
            className="w-full mt-6 bg-[#CC0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg transition-colors text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>

          {/* Security badges */}
          <div className="mt-5 pt-4 border-t border-tesla-border">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-gray-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span className="text-[10px]">256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span className="text-[10px]">Secured</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                <span className="text-[10px]">24/7 Support</span>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#CC0000] hover:underline font-medium">Create Account</Link>
          </p>
        </div>

        {/* Copyright footer */}
        <p className="text-center text-gray-700 text-[10px] mt-6">
          &copy; {new Date().getFullYear()} Tesla Prime Capital. All rights reserved.
        </p>
      </div>
      <ChatWidget />
    </div>
  );
}