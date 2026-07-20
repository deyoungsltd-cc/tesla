'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  TrendingUp,
  Headphones,
  Wallet,
  Users,
  Zap,
  ChevronRight,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface LandingProps {
  onLogin: () => void;
  onRegister: () => void;
  onShowPlans: () => void;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  minAmount: number;
  maxAmount: number;
  dailyReturn: number;
  duration: number;
  description?: string;
}

const featureItems = [
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Enterprise-grade security with 256-bit encryption and two-factor authentication to protect your investments.',
  },
  {
    icon: TrendingUp,
    title: 'Daily Returns',
    description: 'Earn consistent daily returns on your investments with transparent, real-time tracking of your earnings.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated support team is available around the clock to assist you with any questions or concerns.',
  },
  {
    icon: Wallet,
    title: 'Crypto Payments',
    description: 'Deposit and withdraw using Bitcoin, Ethereum, USDT, and other major cryptocurrencies seamlessly.',
  },
  {
    icon: Users,
    title: 'Referral Bonuses',
    description: 'Earn generous referral commissions by inviting friends and growing your network on our platform.',
  },
  {
    icon: Zap,
    title: 'Instant Withdrawals',
    description: 'Request withdrawals anytime and receive your funds quickly with our streamlined withdrawal process.',
  },
];

const defaultPlans: Plan[] = [
  {
    id: '1',
    name: 'Basic',
    slug: 'basic',
    minAmount: 200,
    maxAmount: 4999,
    dailyReturn: 0.5,
    duration: 30,
  },
  {
    id: '2',
    name: 'Silver',
    slug: 'silver',
    minAmount: 5000,
    maxAmount: 9999,
    dailyReturn: 0.8,
    duration: 30,
  },
  {
    id: '3',
    name: 'Gold',
    slug: 'gold',
    minAmount: 10000,
    maxAmount: 49999,
    dailyReturn: 1.2,
    duration: 30,
  },
  {
    id: '4',
    name: 'Platinum',
    slug: 'platinum',
    minAmount: 50000,
    maxAmount: 100000,
    dailyReturn: 1.8,
    duration: 30,
  },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function getTierGradient(name: string): string {
  switch (name.toLowerCase()) {
    case 'platinum':
      return 'from-gray-400/10 to-gray-600/5';
    case 'gold':
      return 'from-yellow-400/10 to-yellow-600/5';
    case 'silver':
      return 'from-neutral-300/10 to-neutral-400/5';
    default:
      return 'from-red-600/10 to-red-800/5';
  }
}

function getTierBadgeColor(name: string): string {
  switch (name.toLowerCase()) {
    case 'platinum':
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    case 'gold':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'silver':
      return 'bg-neutral-400/20 text-neutral-300 border-neutral-400/30';
    default:
      return 'bg-red-600/20 text-red-400 border-red-600/30';
  }
}

export default function Landing({ onLogin, onRegister, onShowPlans }: LandingProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await api.plans.list();
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        } else if (data.plans && Array.isArray(data.plans)) {
          setPlans(data.plans);
        } else {
          setPlans(defaultPlans);
        }
      } catch {
        setPlans(defaultPlans);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();

    const timer = setTimeout(() => setStatsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-red-600/3 blur-[100px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Top bar */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-red glow-red">
              <span className="text-lg font-bold text-white">T</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              TeslaPrimeCapital
            </span>
          </div>

          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <Badge variant="outline" className="border-red-600/30 bg-red-600/10 px-4 py-1.5 text-xs text-red-400">
              <Zap className="mr-1.5 size-3" />
              Trusted by 5,000+ investors worldwide
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Enterprise Managed
            <br />
            <span className="text-glow-red text-red-500">Investment Plans</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-base text-neutral-400 sm:text-lg md:text-xl">
            Maximize your wealth with professionally managed investment strategies.
            Daily returns, secure platform, instant withdrawals.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={onRegister}
              size="lg"
              className="h-12 w-full rounded-lg bg-red-600 px-8 text-base font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 sm:w-auto"
            >
              Get Started
              <ArrowRight className="ml-1 size-4" />
            </Button>
            <Button
              onClick={onShowPlans}
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-lg border-[#333] px-8 text-base font-semibold text-neutral-300 hover:border-red-600/50 hover:text-white hover:bg-red-600/5 sm:w-auto"
            >
              View Plans
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 sm:gap-12">
            {[
              { value: '$10M+', label: 'Total Investments' },
              { value: '5,000+', label: 'Active Users' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`transition-all duration-700 ${statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              >
                <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-neutral-500 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-[#333] p-1">
            <div className="h-1.5 w-1 animate-bounce rounded-full bg-red-500" />
          </div>
        </div>
      </section>

      {/* ===== PLANS PREVIEW SECTION ===== */}
      <section id="plans" className="relative px-4 py-20 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-red-600/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-14 text-center">
            <Badge variant="outline" className="mb-4 border-red-600/30 bg-red-600/10 px-3 py-1 text-xs text-red-400">
              Investment Plans
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Choose Your <span className="text-red-500">Investment Tier</span>
            </h2>
            <p className="mx-auto max-w-xl text-neutral-400">
              Select a plan that matches your investment goals. Higher tiers unlock greater daily returns.
            </p>
          </div>

          {/* Plan Cards */}
          {plansLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[#262626] bg-gradient-card p-6">
                  <Skeleton className="mb-4 h-6 w-20 bg-[#1a1a1a]" />
                  <Skeleton className="mb-3 h-8 w-32 bg-[#1a1a1a]" />
                  <Skeleton className="mb-2 h-4 w-full bg-[#1a1a1a]" />
                  <Skeleton className="mb-6 h-4 w-3/4 bg-[#1a1a1a]" />
                  <Skeleton className="h-10 w-full rounded-lg bg-[#1a1a1a]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(plans.length > 0 ? plans : defaultPlans).map((plan) => (
                <div
                  key={plan.id}
                  className={`
                    group relative overflow-hidden rounded-xl border border-[#262626] bg-gradient-card p-6
                    transition-all duration-300 hover:border-red-600/30 hover:shadow-lg hover:shadow-red-600/5
                    ${plan.name.toLowerCase() === 'gold' ? 'ring-1 ring-yellow-500/20' : ''}
                    ${plan.name.toLowerCase() === 'platinum' ? 'ring-1 ring-gray-400/20' : ''}
                  `}
                >
                  {/* Top glow on hover */}
                  <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-red-600/0 blur-[60px] transition-all duration-500 group-hover:bg-red-600/10" />

                  <div className="relative z-10">
                    <Badge
                      variant="outline"
                      className={`mb-4 border px-3 py-0.5 text-xs font-medium ${getTierBadgeColor(plan.name)}`}
                    >
                      {plan.name}
                    </Badge>

                    <p className="mb-1 text-3xl font-bold text-red-500">{plan.dailyReturn}%</p>
                    <p className="mb-5 text-sm text-neutral-500">Daily Returns</p>

                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Min Investment</span>
                        <span className="font-medium text-neutral-200">{formatCurrency(plan.minAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Max Investment</span>
                        <span className="font-medium text-neutral-200">{formatCurrency(plan.maxAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Duration</span>
                        <span className="font-medium text-neutral-200">{plan.duration} Days</span>
                      </div>
                    </div>

                    <Button
                      onClick={onRegister}
                      className="h-10 w-full rounded-lg border border-red-600/50 bg-red-600/10 font-medium text-red-400 transition-all duration-200 hover:bg-red-600 hover:text-white"
                    >
                      Invest Now
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-14 text-center">
            <Badge variant="outline" className="mb-4 border-red-600/30 bg-red-600/10 px-3 py-1 text-xs text-red-400">
              Why Choose Us
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Built for <span className="text-red-500">Serious Investors</span>
            </h2>
            <p className="mx-auto max-w-xl text-neutral-400">
              Our platform combines cutting-edge technology with proven investment strategies
              to deliver consistent, reliable returns.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-[#262626] bg-gradient-card p-6 transition-all duration-300 hover:border-red-600/20 hover:shadow-lg hover:shadow-red-600/5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-600/10 transition-colors duration-300 group-hover:bg-red-600/20">
                    <Icon className="size-6 text-red-500" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-red-600/20 bg-gradient-card p-8 sm:p-12">
            {/* Background glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-red-600/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-red-600/5 blur-[60px]" />

            <div className="relative z-10 text-center">
              <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                Ready to grow your wealth?
              </h2>
              <p className="mb-8 text-neutral-400">
                Join thousands of investors who are already earning daily returns with TeslaPrimeCapital.
              </p>
              <Button
                onClick={onRegister}
                size="lg"
                className="h-12 rounded-lg bg-red-600 px-8 text-base font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700"
              >
                Create Free Account
                <ArrowRight className="ml-1 size-4" />
              </Button>
              <p className="mt-4 text-xs text-neutral-600">
                No credit card required. Start investing in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#262626] px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-red">
              <span className="text-xs font-bold text-white">T</span>
            </div>
            <span className="text-sm font-semibold text-white">
              TeslaPrimeCapital
            </span>
          </div>
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} TeslaPrimeCapital. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Login
            </button>
            <button
              onClick={onRegister}
              className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}