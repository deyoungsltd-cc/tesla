'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function SecurityPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  // Email OTP 2FA state
  const [email2faEnabled, setEmail2faEnabled] = useState(false);
  const [email2faLoading, setEmail2faLoading] = useState(false);
  const [email2faMessage, setEmail2faMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Push notification state
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushMessage, setPushMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user 2FA state on mount
  useEffect(() => {
    if (user?.twoFactorEnabled !== undefined) {
      setEmail2faEnabled(user.twoFactorEnabled);
    }
  }, [user]);

  // Compute security score based on real protections
  const isEmailVerified = user?.emailVerified ?? false;
  const hasKyc = (user?.kycLevel && parseInt(user.kycLevel) > 0) ?? false;

  // Score: email verified (35) + email 2FA (40) + KYC (25) = 100
  const securityScore = (isEmailVerified ? 35 : 0) + (email2faEnabled ? 40 : 0) + (hasKyc ? 25 : 0);
  const scoreLabel = securityScore >= 80 ? 'High' : securityScore >= 50 ? 'Good' : 'Medium';
  const scoreColor = securityScore >= 80 ? '#22c55e' : securityScore >= 50 ? '#f59e0b' : '#CC0000';
  const scoreDashArray = `${securityScore}, 100`;

  // ── Email OTP 2FA handlers ──
  const handleToggleEmail2fa = useCallback(async () => {
    setEmail2faLoading(true);
    setEmail2faMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ twoFactorEnabled: !email2faEnabled }),
      });

      const data = await res.json();

      if (data.success) {
        const newState = !email2faEnabled;
        setEmail2faEnabled(newState);
        setEmail2faMessage({
          type: 'success',
          text: newState ? 'Email OTP verification enabled for withdrawals' : 'Email OTP verification disabled',
        });
      } else {
        setEmail2faMessage({ type: 'error', text: data.error?.message || 'Failed to update setting' });
      }
    } catch {
      setEmail2faMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setEmail2faLoading(false);
    }
  }, [email2faEnabled, token]);

  // ── Push notification handlers ──
  const handleTogglePush = useCallback(async () => {
    setPushLoading(true);
    setPushMessage(null);

    try {
      if (!pushEnabled) {
        // Enable push notifications
        if (!('Notification' in window)) {
          setPushMessage({ type: 'error', text: 'Your browser does not support push notifications' });
          setPushLoading(false);
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setPushMessage({ type: 'error', text: 'Notification permission denied. Please allow notifications in your browser settings.' });
          setPushLoading(false);
          return;
        }

        // Register service worker
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
        }

        setPushEnabled(true);
        setPushMessage({ type: 'success', text: 'Push notifications enabled. You will receive browser notifications for important updates.' });
      } else {
        // Disable push notifications
        setPushEnabled(false);
        setPushMessage({ type: 'success', text: 'Push notifications disabled.' });
      }
    } catch (err) {
      setPushMessage({ type: 'error', text: 'Failed to update notification settings.' });
    } finally {
      setPushLoading(false);
    }
  }, [pushEnabled]);

  // Format date for display
  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  // Get user login info from the stored user object
  const userLoginIp = (user as any)?.lastLoginIp || 'Unknown';
  const userLoginAt = (user as any)?.lastLoginAt || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Security</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account security settings and two-factor authentication.</p>
      </div>

      {/* Security Overview */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <h2 className="text-white font-semibold text-lg">Security Score</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1a1a2e" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={scoreColor} strokeWidth="3" strokeDasharray={scoreDashArray} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
              {scoreLabel}
            </span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isEmailVerified ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white text-sm">Email Verified: {isEmailVerified ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${email2faEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white text-sm">Email OTP Verification: {email2faEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hasKyc ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-white text-sm">KYC Level: {hasKyc ? `Level ${user?.kycLevel}` : 'Not Verified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Email OTP Two-Factor Authentication ── */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${email2faEnabled ? 'bg-green-500/10' : 'bg-[#CC0000]/10'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={email2faEnabled ? '#22c55e' : '#CC0000'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Two-Factor Authentication (Email OTP)</h3>
              <p className="text-gray-400 text-xs">
                {email2faEnabled ? 'Email verification is required for sensitive actions' : 'Require email verification before withdrawals and large transactions'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleEmail2fa}
            disabled={email2faLoading}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${email2faEnabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-[#CC0000] text-white hover:bg-[#a30000]'}`}
          >
            {email2faLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : email2faEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {/* Info message */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-blue-400/80 text-xs">When enabled, you&apos;ll need to verify your email via a one-time code before withdrawals and large transactions.</p>
          </div>
        </div>

        {email2faMessage && (
          <div className={`rounded-lg p-3 animate-fade-in ${email2faMessage.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <p className={`text-xs ${email2faMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{email2faMessage.text}</p>
          </div>
        )}
      </div>

      {/* ── Authenticator 2FA — Coming Soon ── */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Two-Factor Authentication (Authenticator App)</h3>
            <p className="text-gray-400 text-xs">Google Authenticator, Authy, or any TOTP-compatible app</p>
          </div>
        </div>
        <div className="bg-tesla-dark border border-tesla-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-amber-400 text-sm font-semibold">Coming Soon</span>
          </div>
          <p className="text-gray-500 text-xs">Authenticator app support is currently under development. Stay tuned for updates.</p>
        </div>
      </div>

      {/* ── Push Notifications ── */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pushEnabled ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pushEnabled ? '#22c55e' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Push Notifications</h3>
              <p className="text-gray-400 text-xs">
                {pushEnabled ? 'Receive browser push notifications for important updates' : 'Get notified about account activity directly in your browser'}
              </p>
            </div>
          </div>
          <button
            onClick={handleTogglePush}
            disabled={pushLoading}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${pushEnabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-[#CC0000] text-white hover:bg-[#a30000]'}`}
          >
            {pushLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : pushEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {pushMessage && (
          <div className={`rounded-lg p-3 animate-fade-in ${pushMessage.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <p className={`text-xs ${pushMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{pushMessage.text}</p>
          </div>
        )}
      </div>

      {/* Current Session — real data */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold">Current Session</h3>
        <div className="flex items-center justify-between p-3 bg-tesla-dark border border-tesla-border rounded-lg">
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
            <div>
              <p className="text-white text-sm">Current Device</p>
              <p className="text-gray-500 text-xs">{userLoginIp} — Active now</p>
            </div>
          </div>
          <span className="text-green-400 text-xs font-medium">Active</span>
        </div>
      </div>

      {/* Recent Login Activity — real data */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold">Recent Login Activity</h3>
        <div className="space-y-2 text-sm">
          {userLoginAt ? (
            <div className="flex items-start gap-3 py-2 border-b border-tesla-border last:border-0">
              <span className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-green-500" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">Login successful</p>
                <p className="text-gray-500 text-xs">IP: {userLoginIp}</p>
              </div>
              <span className="text-gray-600 text-xs shrink-0">{formatDate(userLoginAt)}</span>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No login activity recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
