'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

function TeslaLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 342 35" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 .1a9.7 9.7 0 007 7h11l.5.1v27.6h6.8V7.3L26 7a9.7 9.7 0 007-7H0zm238.6 0h-6.8v34.8h6.8V.1zm-52.3 6.8c-5.3 0-9.7 2.1-12.9 6.2V.1h-6.8v34.8h6.8V19.5c0-7.4 3.8-12.4 10.2-12.4 5.8 0 9.3 4.3 9.3 11.2v16.6h6.8V17c0-6.3-1.8-10.1-4.5-12.6-2.6-2.3-5.4-2.5-8.9-2.5zM293 7.7c-9.7 0-17 7.3-17 18.2s7.3 18.2 17 18.2c9.4 0 16.7-7.3 16.7-18.2S302.4 7.7 293 7.7zm0 6.5c5.8 0 10.1 4.8 10.1 11.7 0 6.8-4.3 11.7-10.1 11.7S283 32.7 283 25.9c0-6.9 4.2-11.7 10-11.7zm-89.3-6.5h-7.5l-11.2 22.8V.1h-6.8v34.8h7.5l11.2-22.8v22.8h6.8V7.7z" fill="#CC0000"/>
    </svg>
  );
}

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { level: 0, label: 'Too Short', color: 'bg-gray-600' },
    { level: 1, label: 'Weak', color: 'bg-red-500' },
    { level: 2, label: 'Fair', color: 'bg-orange-500' },
    { level: 3, label: 'Good', color: 'bg-yellow-500' },
    { level: 4, label: 'Strong', color: 'bg-green-500' },
  ];
  return levels[score] || levels[0];
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'verify' | 'success'>('form');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', referralCode: '', terms: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const strength = getPasswordStrength(form.password);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.terms) e.terms = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          referralCode: form.referralCode || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegisteredEmail(form.email);
        setStep('verify');
        setResendTimer(60);
      } else {
        setError(data.error?.message || data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setVerifyError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(v => !v);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setVerifyError('Please enter the complete 6-digit code'); return; }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, code, action: 'verify' }),
      });
      const data = await res.json();
      if (res.ok && data.data?.verified) {
        setStep('success');
      } else {
        setVerifyError(data.error?.message || data.error || 'Invalid code. Please try again.');
      }
    } catch {
      setVerifyError('Network error. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setVerifyError('');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, action: 'resend', name: `${form.firstName} ${form.lastName}`.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setVerifyError(data.error?.message || 'Failed to resend code');
      }
    } catch {
      setVerifyError('Network error. Please try again.');
    }
  };

  const inputCls = 'w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors';

  // ── SUCCESS SCREEN ──
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-tesla-dark flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-900/30 border border-green-700/50 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <TeslaLogo className="w-10 h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Account Verified</h1>
          <p className="text-gray-400 text-sm mb-8">Your email has been successfully verified. You can now sign in to your account.</p>
          <Link href="/login" className="inline-block w-full bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold py-3 rounded-lg transition-colors text-sm">
            Sign In Now
          </Link>
        </div>
        <ChatWidget />
      </div>
    );
  }

  // ── OTP VERIFICATION SCREEN ──
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-tesla-dark flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <TeslaLogo className="w-10 h-10 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
            <p className="text-gray-400 text-sm mt-2">
              We sent a 6-digit code to <span className="text-white font-medium">{registeredEmail}</span>
            </p>
          </div>

          <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6 sm:p-8">
            {verifyError && (
              <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">{verifyError}</div>
            )}

            {/* Shield icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#CC0000]/10 border border-[#CC0000]/30 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>

            {/* OTP Inputs */}
            <div className="flex gap-2.5 justify-center mb-6" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 bg-[#1a1a1a] border border-tesla-border rounded-lg text-center text-xl font-bold text-white focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={verifyLoading || otp.join('').length < 6}
              className="w-full bg-[#CC0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              {verifyLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center mt-5">
              {resendTimer > 0 ? (
                <p className="text-gray-500 text-sm">Resend code in <span className="text-white font-medium">{resendTimer}s</span></p>
              ) : (
                <button onClick={handleResend} className="text-[#CC0000] hover:underline text-sm font-medium">
                  Resend Verification Code
                </button>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-tesla-border text-center">
              <p className="text-gray-600 text-xs">
                Wrong email?{' '}
                <button onClick={() => setStep('form')} className="text-gray-400 hover:text-white hover:underline">Go back</button>
              </p>
            </div>
          </div>
        </div>
        <ChatWidget />
      </div>
    );
  }

  // ── REGISTRATION FORM ──
  return (
    <div className="min-h-screen bg-tesla-dark flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <TeslaLogo className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Start your investment journey today</p>
        </div>

        <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="John" className={inputCls} />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Doe" className={inputCls} />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" className={inputCls} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 8 characters" className={inputCls} />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.level ? strength.color : 'bg-gray-700'} transition-colors`} />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-gray-500">{strength.label}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Repeat password" className={inputCls} />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Referral Code <span className="text-gray-600">(optional)</span></label>
              <input type="text" value={form.referralCode} onChange={(e) => update('referralCode', e.target.value)} placeholder="Enter referral code" className={inputCls} />
            </div>
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => update('terms', e.target.checked)}
                className="mt-0.5 accent-[#CC0000]"
              />
              <span className="text-gray-400 text-xs leading-relaxed">
                I agree to the <a href="#" className="text-[#CC0000] hover:underline">Terms of Service</a> and <a href="#" className="text-[#CC0000] hover:underline">Privacy Policy</a>
              </span>
            </div>
            {errors.terms && <p className="text-red-400 text-xs">{errors.terms}</p>}
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full mt-6 bg-[#CC0000] hover:bg-[#a30000] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#CC0000] hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}