'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Copy,
  Check,
  Users,
  DollarSign,
  Percent,
  Share2,
  Gift,
  Link2,
  Send,
  Loader2,
  Zap,
} from 'lucide-react';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ReferralInfo {
  referralCode: string;
  totalReferrals: number;
  totalCommissions: number;
  commissionRate: number;
  referrals?: Array<{
    id: string;
    email: string;
    status: string;
    createdAt: string;
  }>;
}

export default function Referral() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchInfo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.referral.info();
      setInfo(res.referral || res.data || res);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const referralCode = info?.referralCode || user?.referralCode || 'N/A';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    setApplying(true);
    try {
      await api.referral.apply(promoCode.trim());
      toast.success('Promo code applied successfully!');
      setPromoCode('');
      fetchInfo();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to apply promo code');
    } finally {
      setApplying(false);
    }
  };

  const shareButtons = [
    { label: 'Twitter', icon: <Send className="h-4 w-4" />, color: 'hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-600/30' },
    { label: 'Facebook', icon: <Share2 className="h-4 w-4" />, color: 'hover:bg-indigo-600/20 hover:text-indigo-400 hover:border-indigo-600/30' },
    { label: 'Telegram', icon: <Send className="h-4 w-4" />, color: 'hover:bg-sky-600/20 hover:text-sky-400 hover:border-sky-600/30' },
    { label: 'WhatsApp', icon: <Link2 className="h-4 w-4" />, color: 'hover:bg-green-600/20 hover:text-green-400 hover:border-green-600/30' },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Gift className="h-6 w-6 text-red-500" />
          Referral Program
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Earn 10% commission on every deposit made by your referrals.
        </p>
      </div>

      {/* Referral Code Card */}
      <Card className="border-[#262626] bg-gradient-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
                Your Referral Code
              </p>
              {loading ? (
                <Skeleton className="h-12 w-52 bg-[#1a1a1a]" />
              ) : (
                <p className="text-3xl sm:text-4xl font-bold font-mono tracking-widest text-red-500">
                  {referralCode}
                </p>
              )}
            </div>
            <Button
              onClick={handleCopy}
              className="bg-red-600 hover:bg-red-700 text-white gap-2 h-11 px-6 self-start sm:self-center"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#262626] bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/10">
                <Users className="h-4 w-4 text-red-400" />
              </div>
              <span className="text-xs text-neutral-500">Total Referrals</span>
            </div>
            {loading ? (
              <Skeleton className="h-7 w-20 bg-[#1a1a1a]" />
            ) : (
              <p className="text-2xl font-bold text-white">{info?.totalReferrals ?? 0}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#262626] bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600/10">
                <DollarSign className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-xs text-neutral-500">Commissions Earned</span>
            </div>
            {loading ? (
              <Skeleton className="h-7 w-28 bg-[#1a1a1a]" />
            ) : (
              <p className="text-2xl font-bold text-white">
                ${fmt(info?.totalCommissions ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#262626] bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-600/10">
                <Percent className="h-4 w-4 text-yellow-400" />
              </div>
              <span className="text-xs text-neutral-500">Commission Rate</span>
            </div>
            {loading ? (
              <Skeleton className="h-7 w-16 bg-[#1a1a1a]" />
            ) : (
              <p className="text-2xl font-bold text-white">{info?.commissionRate ?? 10}%</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How It Works + Promo Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* How It Works */}
        <Card className="border-[#262626] bg-gradient-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-500" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/20 border border-red-600/30 text-red-400 font-bold text-sm">
                  1
                </div>
                <div className="w-px h-full bg-[#262626] mt-2" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold text-white">Share Your Code</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Send your unique referral code to friends, family, or on social media.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/20 border border-red-600/30 text-red-400 font-bold text-sm">
                  2
                </div>
                <div className="w-px h-full bg-[#262626] mt-2" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold text-white">Friend Deposits</p>
                <p className="text-xs text-neutral-500 mt-1">
                  When your referral signs up and makes a deposit, they&apos;re linked to your account.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600/20 border border-red-600/30 text-red-400 font-bold text-sm">
                  3
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">You Earn 10%</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Receive 10% commission on every deposit your referrals make, credited instantly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promo Code */}
        <Card className="border-[#262626] bg-gradient-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Gift className="h-4 w-4 text-red-500" />
              Apply Promo Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-neutral-500">
              Have a promo code from a friend? Enter it below to link your account.
            </p>
            <div className="flex gap-2">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code..."
                className="flex-1 bg-[#0a0a0a] border-[#333] text-white placeholder:text-neutral-600 focus:border-red-500/50"
              />
              <Button
                onClick={handleApplyPromo}
                disabled={applying || !promoCode.trim()}
                className="bg-red-600 hover:bg-red-700 text-white gap-2 shrink-0"
              >
                {applying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Apply
              </Button>
            </div>
            <p className="text-[11px] text-neutral-600">
              Note: You can only apply one promo code. This action cannot be reversed.
            </p>

            {/* Share Buttons */}
            <div className="pt-4 border-t border-[#262626]">
              <p className="text-xs text-neutral-500 font-medium mb-3">Share via</p>
              <div className="flex flex-wrap gap-2">
                {shareButtons.map((btn) => (
                  <Button
                    key={btn.label}
                    variant="outline"
                    size="sm"
                    className={`border-[#333] text-neutral-400 text-xs gap-1.5 h-9 ${btn.color} transition-colors`}
                  >
                    {btn.icon}
                    {btn.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}