'use client';

import React, { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface AuthProps {
  mode: 'login' | 'register' | null;
  onClose: () => void;
  onSwitch: (mode: 'login' | 'register') => void;
}

function TeslaAuthLogo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-red glow-red">
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
          <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6L12 2z" fill="white" opacity="0.15"/>
          <path d="M12 4L6 7v5c0 4.42 3.13 8.55 6 9.5 2.87-.95 6-5.08 6-9.5V7L12 4z" stroke="white" strokeWidth="1.5" fill="none"/>
          <text x="12" y="15" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">T</text>
        </svg>
      </div>
      <div className="text-center">
        <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          TeslaPrime<span className="text-red-500">Capital</span>
        </span>
      </div>
    </div>
  );
}

export default function Auth({ mode, onClose, onSwitch }: AuthProps) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-md border-white/[0.06] bg-[#0a0a0a] p-0 overflow-hidden sm:max-w-md rounded-2xl"
        showCloseButton={false}
      >
        {mode === 'login' && <LoginForm onClose={onClose} onSwitch={onSwitch} />}
        {mode === 'register' && <RegisterForm onClose={onClose} onSwitch={onSwitch} />}
      </DialogContent>
    </Dialog>
  );
}

function LoginForm({ onClose, onSwitch }: { onClose: () => void; onSwitch: (mode: 'login' | 'register') => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const data = await api.auth.login({ email: email.trim(), password });
      setAuth(data.user, data.token);
      setTimeout(() => onClose(), 100);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 pb-4">
        <TeslaAuthLogo />

        <DialogHeader className="mb-6 mt-4 text-center">
          <DialogTitle className="text-center text-lg font-semibold text-white">Welcome Back</DialogTitle>
          <DialogDescription className="text-center text-sm text-neutral-500">
            Sign in to your TeslaPrimeCapital account
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 rounded-xl border border-red-600/15 bg-red-600/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-4 space-y-2">
          <Label htmlFor="login-email" className="text-xs text-neutral-400 font-medium">Email Address</Label>
          <Input
            id="login-email" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border-white/[0.06] bg-white/[0.02] text-white placeholder:text-neutral-600 focus-visible:border-red-600/30 focus-visible:ring-red-600/10"
            autoComplete="email" disabled={loading}
          />
        </div>

        <div className="mb-2 space-y-2">
          <Label htmlFor="login-password" className="text-xs text-neutral-400 font-medium">Password</Label>
          <div className="relative">
            <Input
              id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-white/[0.06] bg-white/[0.02] pr-10 text-white placeholder:text-neutral-600 focus-visible:border-red-600/30 focus-visible:ring-red-600/10"
              autoComplete="current-password" disabled={loading}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors" tabIndex={-1}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mb-6 flex justify-end">
          <button type="button" className="text-xs text-neutral-500 transition-colors hover:text-red-400">Forgot password?</button>
        </div>

        <Button type="submit" disabled={loading}
          className="h-11 w-full rounded-xl bg-red-600 text-sm font-semibold text-white glow-red-sm hover:bg-red-700 disabled:opacity-50 transition-all">
          {loading ? (<><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Signing in...</>) : 'Sign In'}
        </Button>
      </div>

      <div className="px-6 pb-6">
        <Separator className="mb-4 bg-white/[0.04]" />
        <p className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <button type="button" onClick={() => onSwitch('register')} className="font-medium text-red-500 transition-colors hover:text-red-400">Register</button>
        </p>
      </div>
    </form>
  );
}

function RegisterForm({ onClose, onSwitch }: { onClose: () => void; onSwitch: (mode: 'login' | 'register') => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) { setError('Please fill in all required fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const registerBody: { email: string; password: string; referralCode?: string } = { email: email.trim(), password };
      if (referralCode.trim()) registerBody.referralCode = referralCode.trim();
      await api.auth.register(registerBody);
      const loginData = await api.auth.login({ email: email.trim(), password });
      setAuth(loginData.user, loginData.token);
      setTimeout(() => onClose(), 100);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 pb-4">
        <TeslaAuthLogo />

        <DialogHeader className="mb-6 mt-4 text-center">
          <DialogTitle className="text-center text-lg font-semibold text-white">Create Account</DialogTitle>
          <DialogDescription className="text-center text-sm text-neutral-500">
            Start your investment journey today
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 rounded-xl border border-red-600/15 bg-red-600/5 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <div className="mb-3 space-y-2">
          <Label htmlFor="reg-email" className="text-xs text-neutral-400 font-medium">Email Address <span className="text-red-500">*</span></Label>
          <Input
            id="reg-email" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border-white/[0.06] bg-white/[0.02] text-white placeholder:text-neutral-600 focus-visible:border-red-600/30 focus-visible:ring-red-600/10"
            autoComplete="email" disabled={loading}
          />
        </div>

        <div className="mb-3 space-y-2">
          <Label htmlFor="reg-password" className="text-xs text-neutral-400 font-medium">Password <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-white/[0.06] bg-white/[0.02] pr-10 text-white placeholder:text-neutral-600 focus-visible:border-red-600/30 focus-visible:ring-red-600/10"
              autoComplete="new-password" disabled={loading}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors" tabIndex={-1}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mb-3 space-y-2">
          <Label htmlFor="reg-confirm" className="text-xs text-neutral-400 font-medium">Confirm Password <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="reg-confirm" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter your password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 rounded-xl border-white/[0.06] bg-white/[0.02] pr-10 text-white placeholder:text-neutral-600 focus-visible:border-red-600/30 focus-visible:ring-red-600/10"
              autoComplete="new-password" disabled={loading}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors" tabIndex={-1}>
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mb-5 space-y-2">
          <Label htmlFor="reg-referral" className="text-xs text-neutral-400 font-medium">Referral Code <span className="text-neutral-600">(optional)</span></Label>
          <Input
            id="reg-referral" type="text" placeholder="Enter referral code"
            value={referralCode} onChange={(e) => setReferralCode(e.target.value)}
            className="h-11 rounded-xl border-white/[0.06] bg-white/[0.02] text-white placeholder:text-neutral-600 focus-visible:border-red-600/30 focus-visible:ring-red-600/10"
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading}
          className="h-11 w-full rounded-xl bg-red-600 text-sm font-semibold text-white glow-red-sm hover:bg-red-700 disabled:opacity-50 transition-all">
          {loading ? (<><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Creating Account...</>) : 'Create Account'}
        </Button>
      </div>

      <div className="px-6 pb-6">
        <Separator className="mb-4 bg-white/[0.04]" />
        <p className="text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <button type="button" onClick={() => onSwitch('login')} className="font-medium text-red-500 transition-colors hover:text-red-400">Sign In</button>
        </p>
      </div>
    </form>
  );
}