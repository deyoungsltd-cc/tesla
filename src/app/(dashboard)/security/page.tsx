'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState<'idle' | 'scanning' | 'verifying' | 'done'>('idle');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnable = () => {
    setStep('scanning');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('verifying');
    }, 2000);
  };

  const handleVerify = () => {
    if (code.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEnabled(true);
      setStep('done');
    }, 1500);
  };

  const handleDisable = () => {
    setEnabled(false);
    setStep('idle');
    setCode('');
  };

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
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={enabled ? '#22c55e' : '#CC0000'} strokeWidth="3" strokeDasharray={enabled ? '80, 100' : '55, 100'} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">{enabled ? 'High' : 'Med'}</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white text-sm">Two-Factor Authentication: {enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-white text-sm">Email Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-white text-sm">KYC Level 0 — Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Card */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-green-500/10' : 'bg-[#CC0000]/10'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={enabled ? '#22c55e' : '#CC0000'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Two-Factor Authentication</h3>
              <p className="text-gray-400 text-xs">{enabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security to your account'}</p>
            </div>
          </div>
          <button
            onClick={enabled ? handleDisable : handleEnable}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${enabled ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-[#CC0000] text-white hover:bg-[#a30000]'}`}
          >
            {enabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {step === 'scanning' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-tesla-dark border border-tesla-border rounded-lg p-4 text-center space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#CC0000] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center p-3">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect x="10" y="10" width="30" height="30" rx="2" fill="#000" />
                      <rect x="15" y="15" width="20" height="20" rx="1" fill="#fff" />
                      <rect x="20" y="20" width="10" height="10" rx="1" fill="#000" />
                      <rect x="60" y="10" width="30" height="30" rx="2" fill="#000" />
                      <rect x="65" y="15" width="20" height="20" rx="1" fill="#fff" />
                      <rect x="70" y="20" width="10" height="10" rx="1" fill="#000" />
                      <rect x="10" y="60" width="30" height="30" rx="2" fill="#000" />
                      <rect x="15" y="65" width="20" height="20" rx="1" fill="#fff" />
                      <rect x="20" y="70" width="10" height="10" rx="1" fill="#000" />
                      <rect x="50" y="50" width="10" height="10" fill="#000" />
                      <rect x="70" y="50" width="10" height="10" fill="#000" />
                      <rect x="50" y="70" width="10" height="10" fill="#000" />
                      <rect x="80" y="70" width="10" height="10" fill="#000" />
                      <rect x="50" y="60" width="5" height="5" fill="#000" />
                      <rect x="60" y="60" width="5" height="5" fill="#000" />
                      <rect x="80" y="60" width="5" height="5" fill="#000" />
                      <rect x="60" y="80" width="5" height="5" fill="#000" />
                      <rect x="70" y="80" width="5" height="5" fill="#000" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white text-sm font-medium">Scan with Authenticator App</p>
                    <p className="text-gray-400 text-xs">Use Google Authenticator, Authy, or any TOTP-compatible app</p>
                  </div>
                  <div className="bg-tesla-card border border-tesla-border rounded-lg px-3 py-2">
                    <code className="text-[#CC0000] text-sm font-mono">JBSW Y3DP EHPK 3NPP</code>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-gray-400 text-sm">Enter the 6-digit code from your authenticator app:</p>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={code[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newCode = code.split('');
                    newCode[i] = val;
                    setCode(newCode.join(''));
                    if (val && i < 5) {
                      e.target.nextElementSibling?.focus();
                    }
                  }}
                  className="w-12 h-14 bg-tesla-dark border border-tesla-border rounded-lg text-center text-white text-xl font-bold focus:border-[#CC0000] focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
                />
              ))}
            </div>
            <button
              onClick={handleVerify}
              disabled={code.length < 6 || loading}
              className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</span> : 'Verify & Enable 2FA'}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span className="text-green-400 font-semibold text-sm">Two-Factor Authentication Enabled</span>
            </div>
            <p className="text-gray-400 text-xs">Your account is now protected with 2FA. You will be asked for a verification code on each login.</p>
          </div>
        )}
      </div>

      {/* Backup Codes */}
      {enabled && (
        <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 5H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h0" /><path d="M14 5h4a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h0" />
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="8 19 12 15 16 19" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Backup Codes</h3>
              <p className="text-gray-400 text-xs">Save these codes in a secure place. Each code can only be used once.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456', 'QRST-7890', 'UVWX-1357'].map((c) => (
              <div key={c} className="bg-tesla-dark border border-tesla-border rounded-lg px-3 py-2">
                <code className="text-gray-300 text-xs font-mono">{c}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold">Active Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-tesla-dark border border-tesla-border rounded-lg">
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              <div>
                <p className="text-white text-sm">Chrome on MacOS</p>
                <p className="text-gray-500 text-xs">192.168.1.x — Current session</p>
              </div>
            </div>
            <span className="text-green-400 text-xs font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-tesla-dark border border-tesla-border rounded-lg">
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
              <div>
                <p className="text-white text-sm">Safari on iPhone</p>
                <p className="text-gray-500 text-xs">10.0.0.x — 2 hours ago</p>
              </div>
            </div>
            <button className="text-red-400 hover:text-red-300 text-xs font-medium">Revoke</button>
          </div>
        </div>
      </div>

      {/* Recent Login Activity */}
      <div className="bg-tesla-card border border-tesla-border rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold">Recent Login Activity</h3>
        <div className="space-y-2 text-sm">
          {[
            { action: 'Login successful', device: 'Chrome MacOS', time: 'Just now', ip: '192.168.1.x' },
            { action: 'Login successful', device: 'Safari iPhone', time: '2 hours ago', ip: '10.0.0.x' },
            { action: 'Password changed', device: 'Chrome MacOS', time: '3 days ago', ip: '192.168.1.x' },
            { action: 'Login failed (wrong password)', device: 'Unknown Device', time: '5 days ago', ip: '203.0.113.x' },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-tesla-border last:border-0">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.action.includes('failed') ? 'bg-red-500' : 'bg-green-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{log.action}</p>
                <p className="text-gray-500 text-xs">{log.device} — {log.ip}</p>
              </div>
              <span className="text-gray-600 text-xs shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
