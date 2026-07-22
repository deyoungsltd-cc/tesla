'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  TrendingUp,
  Check,
  Clock,
  Loader2,
  Zap,
  Shield,
  Star,
  Crown,
  Wallet,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  tier?: string;
  tierName?: string;
  description: string;
  dailyReturnRate: number;
  duration: number;
  minInvestment?: number;
  maxInvestment?: number;
  minAmount?: number;
  maxAmount?: number;
  features: string[] | string;
  isActive: boolean;
}

function fmt(n: number | undefined | null): string {
  if (n == null || isNaN(n)) return '0.00';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function tierConfig(tier: string) {
  const t = tier?.toLowerCase() || '';
  if (t.includes('platinum'))
    return {
      badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      icon: <Crown className="h-4 w-4 text-amber-400" />,
      label: 'Platinum',
      glow: 'hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5',
    };
  if (t.includes('gold'))
    return {
      badge: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
      icon: <Star className="h-4 w-4 text-yellow-400" />,
      label: 'Gold',
      glow: 'hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/5',
    };
  if (t.includes('silver'))
    return {
      badge: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
      icon: <Shield className="h-4 w-4 text-slate-300" />,
      label: 'Silver',
      glow: 'hover:border-slate-400/30 hover:shadow-lg hover:shadow-slate-400/5',
    };
  return {
    badge: 'border-neutral-500/30 bg-neutral-500/10 text-neutral-400',
    icon: <Zap className="h-4 w-4 text-neutral-400" />,
    label: 'Basic',
    glow: 'hover:border-neutral-500/30 hover:shadow-lg hover:shadow-neutral-500/5',
  };
}

function parseFeatures(features: string[] | string): string[] {
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed : [features];
    } catch {
      return features.split(',').map((f) => f.trim()).filter(Boolean);
    }
  }
  return [];
}

interface PlansProps {
  navigate: (page: string) => void;
}

export default function Plans({ navigate }: PlansProps) {
  const { user, setUser } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investMode, setInvestMode] = useState<'demo' | 'live'>('demo');
  const [investing, setInvesting] = useState(false);
  const [amountError, setAmountError] = useState('');

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.plans.list();
      const list = res.plans || res.data || res || [];
      setPlans(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load investment plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const demoBalance = user?.wallets?.find((w) => w.type === 'demo')?.availableBalance ?? 0;
  const liveBalance = user?.wallets?.find((w) => w.type === 'live')?.availableBalance ?? 0;
  const selectedBalance = investMode === 'live' ? liveBalance : demoBalance;

  const handleOpenInvest = (plan: Plan) => {
    setSelectedPlan(plan);
    setInvestAmount('');
    setAmountError('');
    setInvestMode(user?.activeMode || 'demo');
    setDialogOpen(true);
  };

  const validateAmount = (val: string): boolean => {
    if (!selectedPlan) return false;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      setAmountError('Please enter a valid amount');
      return false;
    }
    const minInv = selectedPlan.minAmount ?? selectedPlan.minInvestment ?? 0;
    const maxInv = selectedPlan.maxAmount ?? selectedPlan.maxInvestment ?? 0;
    if (num < minInv) {
      setAmountError(`Minimum investment is $${fmt(minInv)}`);
      return false;
    }
    if (maxInv > 0 && num > maxInv) {
      setAmountError(`Maximum investment is $${fmt(maxInv)}`);
      return false;
    }
    if (num > selectedBalance) {
      setAmountError(`Insufficient ${investMode} balance. Available: $${fmt(selectedBalance)}`);
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleAmountChange = (val: string) => {
    setInvestAmount(val);
    if (val) validateAmount(val);
    else setAmountError('');
  };

  const handleConfirmInvest = async () => {
    if (!selectedPlan || !validateAmount(investAmount)) return;

    setInvesting(true);
    try {
      const res = await api.investments.create({
        planId: selectedPlan.id,
        amount: parseFloat(investAmount),
        mode: investMode,
      });

      toast.success('Investment created successfully!', {
        description: `$${fmt(parseFloat(investAmount))} invested in ${selectedPlan.name}`,
      });

      // Refresh wallet data
      try {
        const walletRes = await api.wallet.get();
        if (walletRes.user) setUser({ ...user!, wallets: walletRes.user.wallets || user!.wallets } as any);
        else if (walletRes.wallets) setUser({ ...user!, wallets: walletRes.wallets } as any);
      } catch {
        // silent
      }

      setDialogOpen(false);
      setSelectedPlan(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create investment');
    } finally {
      setInvesting(false);
    }
  };

  const dailyReturn = selectedPlan && investAmount
    ? (parseFloat(investAmount) * selectedPlan.dailyReturnRate) / 100
    : 0;
  const expectedTotalReturn = dailyReturn * (selectedPlan?.duration || 0);

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-white">Investment Plans</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Choose a plan that matches your investment goals and risk appetite.
        </p>
      </div>

      {/* Plan Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-white/[0.04] bg-neutral-900/30">
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-5 w-24 bg-white/[0.03]" />
                <Skeleton className="h-10 w-32 bg-white/[0.03]" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-white/[0.03]" />
                  <Skeleton className="h-3 w-3/4 bg-white/[0.03]" />
                </div>
                <Skeleton className="h-9 w-full bg-white/[0.03]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
          <TrendingUp className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-base">No investment plans available</p>
          <p className="text-sm mt-1">Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans
            .filter((p) => p.isActive !== false)
            .map((plan) => {
              let tier: any;
              let features: string[] = [];
              try {
                tier = tierConfig(plan.tier || plan.tierName || plan.name);
                features = parseFeatures(plan.features);
              } catch (e: any) {
                console.error('Plan render error:', e);
                tier = { badge: 'border-neutral-500/30 bg-neutral-500/10 text-neutral-400', icon: <Zap className="h-4 w-4 text-neutral-400" />, label: plan.name, glow: '' };
              }
              return (
                <Card
                  key={plan.id}
                  className={`border-white/[0.04] bg-neutral-900/30 transition-all cursor-pointer ${tier.glow}`}
                  onClick={() => handleOpenInvest(plan)}
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Tier Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${tier.badge} border text-xs`}>
                        {tier.icon}
                        <span className="ml-1">{tier.label}</span>
                      </Badge>
                      <Clock className="h-3.5 w-3.5 text-neutral-600" />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-xs text-neutral-500 mb-4 line-clamp-2">{plan.description}</p>

                    {/* Daily Return — BIG */}
                    <div className="mb-4">
                      <p className="text-3xl font-black text-red-500">
                        {plan.dailyReturnRate}%
                      </p>
                      <p className="text-xs text-neutral-500">Daily Return</p>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-sm text-neutral-300 mb-4">
                      <Clock className="h-3.5 w-3.5 text-neutral-500" />
                      <span>{plan.duration} Days</span>
                    </div>

                    {/* Min/Max */}
                    <div className="bg-black/30 rounded-xl p-3 mb-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Min Investment</span>
                        <span className="text-white font-medium">${fmt(plan.minAmount ?? plan.minInvestment)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Max Investment</span>
                        <span className="text-white font-medium">
                          {(plan.maxAmount ?? plan.maxInvestment) > 0 ? `$${fmt(plan.maxAmount ?? plan.maxInvestment)}` : 'Unlimited'}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                      <div className="flex-1 mb-4">
                        <ul className="space-y-1.5">
                          {features.slice(0, 4).map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                              <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Invest Button */}
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenInvest(plan);
                      }}
                    >
                      Invest Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Invest Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white/[0.02] border-white/[0.04] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              Invest in {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-neutral-500 text-sm">
              Review the plan details and enter your investment amount.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-5">
              {/* Plan Summary */}
              <div className="bg-black/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Daily Return</span>
                  <span className="text-red-400 font-semibold">{selectedPlan.dailyReturnRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Duration</span>
                  <span className="text-white">{selectedPlan.duration} Days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Min Investment</span>
                  <span className="text-white">${fmt(selectedPlan.minAmount ?? selectedPlan.minInvestment)}</span>
                </div>
                {(selectedPlan.maxAmount ?? selectedPlan.maxInvestment) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Max Investment</span>
                    <span className="text-white">${fmt(selectedPlan.maxAmount ?? selectedPlan.maxInvestment)}</span>
                  </div>
                )}
              </div>

              {/* Mode Selector */}
              <div className="space-y-2">
                <Label className="text-sm text-neutral-300">Investment Mode</Label>
                <RadioGroup
                  value={investMode}
                  onValueChange={(v) => {
                    setInvestMode(v as 'demo' | 'live');
                    if (investAmount) validateAmount(investAmount);
                  }}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                      investMode === 'demo'
                        ? 'border-red-500/50 bg-red-500/5 glow-red-sm'
                        : 'border-white/[0.04] bg-black/30 hover:border-white/[0.08]'
                    }`}
                  >
                    <RadioGroupItem value="demo" className="sr-only" />
                    <Wallet className="h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Demo</p>
                      <p className="text-[10px] text-neutral-500">${fmt(demoBalance)}</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                      investMode === 'live'
                        ? 'border-red-500/50 bg-red-500/5 glow-red-sm'
                        : 'border-white/[0.04] bg-black/30 hover:border-white/[0.08]'
                    }`}
                  >
                    <RadioGroupItem value="live" className="sr-only" />
                    <Wallet className="h-4 w-4 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Live</p>
                      <p className="text-[10px] text-neutral-500">${fmt(liveBalance)}</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-neutral-300">Investment Amount</Label>
                  <span className="text-xs text-neutral-500">
                    Available: <span className="text-green-400">${fmt(selectedBalance)}</span>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={investAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="pl-7 bg-black/30 border-white/[0.04] text-white placeholder:text-neutral-600 focus:border-red-500/50 focus:ring-red-500/20"
                  />
                </div>
                {amountError && (
                  <p className="text-xs text-red-400">{amountError}</p>
                )}
              </div>

              {/* Calculated Returns */}
              {investAmount && !isNaN(parseFloat(investAmount)) && parseFloat(investAmount) > 0 && (
                <div className="bg-black/30 rounded-xl p-4 space-y-2 border border-white/[0.02]">
                  <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
                    Projected Returns
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Daily Return</span>
                    <span className="text-green-400 font-medium">+${fmt(dailyReturn)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Expected Total Return</span>
                    <span className="text-green-400 font-semibold">+${fmt(expectedTotalReturn)}</span>
                  </div>
                  <div className="border-t border-white/[0.02] pt-2 mt-2 flex justify-between text-sm">
                    <span className="text-neutral-300 font-medium">Total at Maturity</span>
                    <span className="text-white font-bold">
                      ${fmt(parseFloat(investAmount) + expectedTotalReturn)}
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmInvest}
                  disabled={investing || !!amountError || !investAmount}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold min-w-[140px]"
                >
                  {investing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Investment'
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}