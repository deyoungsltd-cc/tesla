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

export default function Auth({ mode, onClose, onSwitch }: AuthProps) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-md border-[#262626] bg-[#0f0f0f] p-0 overflow-hidden sm:max-w-md"
        showCloseButton={false}
      >
        {mode === 'login' && <LoginForm onClose={onClose} onSwitch={onSwitch} />}
        {mode === 'register' && <RegisterForm onClose={onClose} onSwitch={onSwitch} />}
      </DialogContent>
    </Dialog>
  );
}

function LoginForm({
  onClose,
  onSwitch,
}: {
  onClose: () => void;
  onSwitch: (mode: 'login' | 'register') => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.login({ email: email.trim(), password });
      setAuth(data.user, data.token);
      setTimeout(() => onClose(), 100);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 pb-4">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-red glow-red">
            <span className="text-lg font-bold text-white">T</span>
          </div>
          <span className="text-xl font-bold text-white">
            TeslaPrime<span className="text-red-500">Capital</span>
          </span>
        </div>

        <DialogHeader className="mb-6 text-center">
          <DialogTitle className="text-center text-xl font-semibold text-white">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-neutral-500">
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-600/20 bg-red-600/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4 space-y-2">
          <Label htmlFor="login-email" className="text-sm text-neutral-300">
            Email Address
          </Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-lg border-[#333] bg-[#1a1a1a] text-white placeholder:text-neutral-600 focus-visible:border-red-600/50 focus-visible:ring-red-600/20"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="mb-2 space-y-2">
          <Label htmlFor="login-password" className="text-sm text-neutral-300">
            Password
          </Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border-[#333] bg-[#1a1a1a] pr-10 text-white placeholder:text-neutral-600 focus-visible:border-red-600/50 focus-visible:ring-red-600/20"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Forgot password (just visual placeholder) */}
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            className="text-xs text-neutral-500 transition-colors hover:text-red-400"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-red-600 text-sm font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </div>

      <div className="px-6 pb-6">
        <Separator className="mb-4 bg-[#262626]" />
        <p className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitch('register')}
            className="font-medium text-red-500 transition-colors hover:text-red-400"
          >
            Register
          </button>
        </p>
      </div>
    </form>
  );
}

function RegisterForm({
  onClose,
  onSwitch,
}: {
  onClose: () => void;
  onSwitch: (mode: 'login' | 'register') => void;
}) {
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

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const registerBody: { email: string; password: string; referralCode?: string } = {
        email: email.trim(),
        password,
      };
      if (referralCode.trim()) {
        registerBody.referralCode = referralCode.trim();
      }

      await api.auth.register(registerBody);

      // Auto-login after registration
      const loginData = await api.auth.login({ email: email.trim(), password });
      setAuth(loginData.user, loginData.token);
      setTimeout(() => onClose(), 100);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 pb-4">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-red glow-red">
            <span className="text-lg font-bold text-white">T</span>
          </div>
          <span className="text-xl font-bold text-white">
            TeslaPrime<span className="text-red-500">Capital</span>
          </span>
        </div>

        <DialogHeader className="mb-6 text-center">
          <DialogTitle className="text-center text-xl font-semibold text-white">
            Create Account
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-neutral-500">
            Start your investment journey today
          </DialogDescription>
        </DialogHeader>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-600/20 bg-red-600/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4 space-y-2">
          <Label htmlFor="reg-email" className="text-sm text-neutral-300">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-lg border-[#333] bg-[#1a1a1a] text-white placeholder:text-neutral-600 focus-visible:border-red-600/50 focus-visible:ring-red-600/20"
            autoComplete="email"
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="mb-4 space-y-2">
          <Label htmlFor="reg-password" className="text-sm text-neutral-300">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border-[#333] bg-[#1a1a1a] pr-10 text-white placeholder:text-neutral-600 focus-visible:border-red-600/50 focus-visible:ring-red-600/20"
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-4 space-y-2">
          <Label htmlFor="reg-confirm" className="text-sm text-neutral-300">
            Confirm Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 rounded-lg border-[#333] bg-[#1a1a1a] pr-10 text-white placeholder:text-neutral-600 focus-visible:border-red-600/50 focus-visible:ring-red-600/20"
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Referral Code (optional) */}
        <div className="mb-6 space-y-2">
          <Label htmlFor="reg-referral" className="text-sm text-neutral-300">
            Referral Code <span className="text-neutral-600">(optional)</span>
          </Label>
          <Input
            id="reg-referral"
            type="text"
            placeholder="Enter referral code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="h-11 rounded-lg border-[#333] bg-[#1a1a1a] text-white placeholder:text-neutral-600 focus-visible:border-red-600/50 focus-visible:ring-red-600/20"
            disabled={loading}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-red-600 text-sm font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>

      <div className="px-6 pb-6">
        <Separator className="mb-4 bg-[#262626]" />
        <p className="text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitch('login')}
            className="font-medium text-red-500 transition-colors hover:text-red-400"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
}