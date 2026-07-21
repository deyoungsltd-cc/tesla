'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  Globe,
  FileText,
  BarChart3,
  MapPin,
  CheckCircle2,
  Play,
  Menu,
  X,
  Bitcoin,
  Landmark,
  Building2,
  Coins,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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

const investmentCategories = [
  {
    icon: BarChart3,
    title: 'Managed Stocks',
    description: 'Diversified stock portfolios managed by expert analysts with proven track records.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    icon: Landmark,
    title: 'Bonds & ETFs',
    description: 'Stable government and corporate bonds with ETFs for balanced, long-term growth.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    icon: Bitcoin,
    title: 'Crypto Assets',
    description: 'Bitcoin, Ethereum, USDT and more. Earn daily returns on your crypto investments.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
  },
  {
    icon: Building2,
    title: 'Real Estate',
    description: 'Fractional real estate investing in premium commercial and residential properties.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
];

const coreFeatures = [
  {
    icon: Wallet,
    title: 'Multiple Payment Options',
    description: 'Deposit via Bitcoin, Ethereum, USDT, or gift cards. Flexible funding for every investor.',
  },
  {
    icon: Lock,
    title: 'Strong Security',
    description: '256-bit encryption, two-factor authentication, and enterprise-grade infrastructure.',
  },
  {
    icon: FileText,
    title: 'Legal Compliance',
    description: 'Fully regulated and compliant with international financial standards and KYC/AML.',
  },
  {
    icon: Globe,
    title: 'Worldwide Coverage',
    description: 'Operating globally with support for investors from over 150 countries worldwide.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Reporting',
    description: 'Real-time dashboards, detailed analytics, and transparent transaction history.',
  },
  {
    icon: Headphones,
    title: '24/7 Dedicated Support',
    description: 'Round-the-clock customer support via live chat, email, and support tickets.',
  },
];

const boardMembers = [
  { name: 'Elon Musk', role: 'Chief Executive Officer', avatar: 'E' },
  { name: 'Jared Birchall', role: 'Chief Operating Officer', avatar: 'J' },
  { name: 'Sarah Chen', role: 'Chief Financial Officer', avatar: 'S' },
];

const defaultPlans: Plan[] = [
  { id: '1', name: 'Basic', slug: 'basic', minAmount: 200, maxAmount: 4999, dailyReturn: 0.5, duration: 30 },
  { id: '2', name: 'Silver', slug: 'silver', minAmount: 5000, maxAmount: 9999, dailyReturn: 0.8, duration: 21 },
  { id: '3', name: 'Gold', slug: 'gold', minAmount: 10000, maxAmount: 49999, dailyReturn: 1.2, duration: 14 },
  { id: '4', name: 'Platinum', slug: 'platinum', minAmount: 50000, maxAmount: 100000, dailyReturn: 1.8, duration: 7 },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return `$${amount.toLocaleString()}`;
}

function getTierConfig(name: string) {
  const n = name.toLowerCase();
  if (n.includes('platinum')) return { badge: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20', ring: 'ring-zinc-500/20', glow: 'hover:shadow-zinc-500/5' };
  if (n.includes('gold')) return { badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', ring: 'ring-yellow-500/20', glow: 'hover:shadow-yellow-500/5' };
  if (n.includes('silver')) return { badge: 'bg-slate-400/10 text-slate-300 border-slate-400/20', ring: 'ring-slate-400/20', glow: 'hover:shadow-slate-400/5' };
  return { badge: 'bg-red-500/10 text-red-400 border-red-500/20', ring: 'ring-red-500/20', glow: 'hover:shadow-red-500/5' };
}

// ─── Tesla Logo Component ──────────────────────────────────────────────────────

function TeslaLogo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizes = { small: { icon: 7, text: 'text-base' }, default: { icon: 9, text: 'text-lg' }, large: { icon: 12, text: 'text-2xl md:text-3xl' } };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-red glow-red" style={size === 'large' ? { width: 48, height: 48, borderRadius: 12 } : {}}>
        <svg viewBox="0 0 24 24" fill="none" className={size === 'large' ? 'w-7 h-7' : 'w-4 h-4'}>
          <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6L12 2z" fill="white" opacity="0.15"/>
          <path d="M12 4L6 7v5c0 4.42 3.13 8.55 6 9.5 2.87-.95 6-5.08 6-9.5V7L12 4z" stroke="white" strokeWidth="1.5" fill="none"/>
          <text x="12" y="15" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="var(--font-dm-sans), sans-serif">T</text>
        </svg>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className={`${s.text} font-bold tracking-tight text-white`} style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          TeslaPrime
        </span>
        <span className={`${s.text} font-bold tracking-tight text-red-500`} style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          Capital
        </span>
      </div>
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────

export default function Landing({ onLogin, onRegister, onShowPlans }: LandingProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await api.plans.list();
        if (Array.isArray(data) && data.length > 0) setPlans(data);
        else if (data.plans && Array.isArray(data.plans)) setPlans(data.plans);
        else setPlans(defaultPlans);
      } catch { setPlans(defaultPlans); }
      finally { setPlansLoading(false); }
    };
    fetchPlans();
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  const navLinks = [
    { label: 'Investments', href: '#categories' },
    { label: 'Plans', href: '#plans' },
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ===== NAVIGATION BAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <TeslaLogo size="small" />

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors duration-200">
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={onLogin} className="text-sm text-neutral-300 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
              <Button onClick={onRegister} className="h-9 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-neutral-400 hover:text-white py-2">
                  {link.label}
                </a>
              ))}
              <Separator className="bg-white/[0.06]" />
              <Button variant="ghost" onClick={() => { onLogin(); setMobileMenuOpen(false); }} className="w-full justify-start text-neutral-300 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
              <Button onClick={() => { onRegister(); setMobileMenuOpen(false); }} className="w-full bg-red-600 hover:bg-red-700 text-white text-sm">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-red-600/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center">
          {/* Status badge */}
          <div className="animate-fade-in-up mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-xs text-neutral-400 font-medium">Trusted by 5,000+ investors worldwide</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', animationDelay: '0.1s', animationFillMode: 'both' }}>
            Want more out of your
            <br />
            <span className="text-glow-red text-red-500">Investment?</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-neutral-400 leading-relaxed mb-10" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            High-tech solutions meet instant execution. Enterprise-grade managed investment plans with daily returns up to{' '}
            <span className="text-white font-semibold">1.8%</span>.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <Button
              onClick={onRegister}
              size="lg"
              className="h-12 w-full sm:w-auto rounded-xl bg-red-600 px-8 text-base font-semibold text-white glow-red hover:bg-red-700 transition-all"
            >
              Start Investing
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              onClick={onShowPlans}
              variant="outline"
              size="lg"
              className="h-12 w-full sm:w-auto rounded-xl border-white/10 bg-white/[0.02] px-8 text-base font-medium text-neutral-300 hover:border-white/20 hover:text-white hover:bg-white/[0.05]"
            >
              View Plans
              <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="animate-fade-in-up grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            {[
              { value: '$10M+', label: 'Total Investments' },
              { value: '5,000+', label: 'Active Investors' },
              { value: '99.9%', label: 'Platform Uptime' },
              { value: '1.8%', label: 'Max Daily Return' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>{stat.value}</p>
                <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-neutral-700 flex items-start justify-center p-1.5">
            <div className="w-1 h-1.5 rounded-full bg-red-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== INVESTMENT CATEGORIES ===== */}
      <section id="categories" ref={(el) => { sectionRefs.current.categories = el; }} className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className={`text-center mb-14 transition-all duration-700 ${isVisible('categories') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge variant="outline" className="mb-4 border-red-600/20 bg-red-600/5 px-4 py-1.5 text-xs text-red-400 font-medium">
              <Coins className="mr-1.5 w-3 h-3" /> Explore Solutions
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              From banking to <span className="text-red-500">wealth management</span>
            </h2>
            <p className="mx-auto max-w-2xl text-neutral-400">
              Diversified investment solutions covering all major sectors. Our teams serve every corner of the financial world with precision and expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {investmentCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className={`group tesla-card rounded-2xl p-6 cursor-pointer transition-all duration-700 ${
                    isVisible('categories') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg} border ${cat.border} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${cat.color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{cat.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{cat.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-red-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn More <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="tesla-divider mx-auto max-w-6xl" />

      {/* ===== PLANS SECTION ===== */}
      <section id="plans" ref={(el) => { sectionRefs.current.plans = el; }} className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-red-600/[0.03] blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className={`text-center mb-14 transition-all duration-700 ${isVisible('plans') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge variant="outline" className="mb-4 border-red-600/20 bg-red-600/5 px-4 py-1.5 text-xs text-red-400 font-medium">
              Investment Plans
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              One of the world&apos;s most
              <br />
              <span className="text-red-500">trusted investment platforms</span>
            </h2>
            <p className="mx-auto max-w-xl text-neutral-400">
              Choose a plan that matches your investment goals. Higher tiers unlock greater daily returns and shorter durations.
            </p>
          </div>

          {plansLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="tesla-card rounded-2xl p-6">
                  <Skeleton className="mb-4 h-5 w-20 bg-neutral-800" />
                  <Skeleton className="mb-3 h-9 w-28 bg-neutral-800" />
                  <Skeleton className="mb-2 h-4 w-full bg-neutral-800" />
                  <Skeleton className="mb-6 h-4 w-3/4 bg-neutral-800" />
                  <Skeleton className="h-10 w-full rounded-xl bg-neutral-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(plans.length > 0 ? plans : defaultPlans).map((plan, i) => {
                const tier = getTierConfig(plan.name);
                const isPopular = plan.name.toLowerCase() === 'gold';
                return (
                  <div
                    key={plan.id}
                    className={`group tesla-card rounded-2xl p-6 relative overflow-hidden transition-all duration-700 ${
                      isVisible('plans') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    } ${isPopular ? 'ring-1 ring-yellow-500/20' : ''}`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                      </div>
                    )}

                    <Badge variant="outline" className={`mb-4 border px-3 py-0.5 text-xs font-medium ${tier.badge}`}>
                      {plan.name}
                    </Badge>

                    <p className="mb-1 text-4xl font-bold text-red-500" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                      {plan.dailyReturn}%
                    </p>
                    <p className="mb-6 text-sm text-neutral-500">Daily Returns</p>

                    <div className="space-y-3 mb-6">
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

                    <div className="bg-neutral-900/50 rounded-xl p-3 mb-6 border border-white/[0.03]">
                      <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Expected Return</p>
                      <p className="text-sm text-white font-semibold">
                        +{((plan.dailyReturn / 100) * plan.minAmount).toFixed(2)}/day
                      </p>
                    </div>

                    <Button
                      onClick={onRegister}
                      className="w-full h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all hover:shadow-lg hover:shadow-red-600/10"
                    >
                      Invest Now <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="tesla-divider mx-auto max-w-6xl" />

      {/* ===== ABOUT US SECTION ===== */}
      <section id="about" ref={(el) => { sectionRefs.current.about = el; }} className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className={`mb-14 transition-all duration-700 ${isVisible('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge variant="outline" className="mb-4 border-red-600/20 bg-red-600/5 px-4 py-1.5 text-xs text-red-400 font-medium">
              About Us
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              Successfully providing business
              <br />
              <span className="text-red-500">solutions for 10+ years</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: About Text */}
            <div className={`transition-all duration-700 delay-100 ${isVisible('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-neutral-400 leading-relaxed mb-6">
                TeslaPrimeCapital is a leading financial services company and pioneer in the online investment management industry. Having facilitated the first-ever electronic managed investment by an individual investor more than 10 years ago, we have grown to become one of the most trusted names in digital finance.
              </p>
              <p className="text-neutral-400 leading-relaxed mb-8">
                Our work draws on more than a decade of experience in global financial markets. Our strategies are delivered by over 200 professionals operating in the world&apos;s most important financial centers, including New York, London, Singapore, and Dubai.
              </p>
              <div className="flex flex-wrap gap-6">
                {[
                  { value: '10+', label: 'Years Experience' },
                  { value: '150+', label: 'Countries Served' },
                  { value: '$10M+', label: 'Assets Managed' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>{stat.value}</p>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Board Members */}
            <div className={`transition-all duration-700 delay-200 ${isVisible('about') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h3 className="text-lg font-semibold text-white mb-6">Our Leadership</h3>
              <div className="space-y-4">
                {boardMembers.map((member) => (
                  <div key={member.name} className="tesla-card rounded-xl p-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-600/10 border border-red-600/20">
                      <span className="text-red-400 font-bold" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>{member.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{member.name}</p>
                      <p className="text-xs text-neutral-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="tesla-divider mx-auto max-w-6xl" />

      {/* ===== CORE FEATURES SECTION ===== */}
      <section id="features" ref={(el) => { sectionRefs.current.features = el; }} className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className={`text-center mb-14 transition-all duration-700 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Badge variant="outline" className="mb-4 border-red-600/20 bg-red-600/5 px-4 py-1.5 text-xs text-red-400 font-medium">
              Core Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              Why we are <span className="text-red-500">above others</span>
            </h2>
            <p className="mx-auto max-w-2xl text-neutral-400">
              Your investment broker holds your funds. It is important you verify it is safe. TeslaPrimeCapital is fully registered, regulated, and compliant with international financial standards. Your funds are always secure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group tesla-card rounded-2xl p-6 transition-all duration-700 ${
                    isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/[0.07] border border-red-600/10 group-hover:bg-red-600/10 group-hover:border-red-600/20 transition-all duration-300">
                    <Icon className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="tesla-divider mx-auto max-w-6xl" />

      {/* ===== PROFIT GRAPH / HOW IT WORKS ===== */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.04] bg-gradient-to-br from-[#0a0a0a] to-[#050505] p-8 sm:p-12 lg:p-16">
            {/* Background glow */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-red-600/[0.04] blur-[100px]" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div>
                <Badge variant="outline" className="mb-4 border-red-600/20 bg-red-600/5 px-4 py-1.5 text-xs text-red-400 font-medium">
                  <TrendingUp className="mr-1.5 w-3 h-3" /> Profit Calculator
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                  TeslaPrimeCapital gives you the best financial solution
                </h2>
                <p className="text-neutral-400 leading-relaxed mb-8">
                  See how your investments grow with our tiered return system. Higher investments unlock higher daily returns and faster maturity periods.
                </p>

                <div className="space-y-4">
                  {[
                    { plan: 'Basic Plan', detail: '0.5% daily for 30 days', color: 'bg-neutral-500' },
                    { plan: 'Silver Plan', detail: '0.8% daily for 21 days', color: 'bg-slate-400' },
                    { plan: 'Gold Plan', detail: '1.2% daily for 14 days', color: 'bg-yellow-500' },
                    { plan: 'Platinum Plan', detail: '1.8% daily for 7 days', color: 'bg-zinc-400' },
                  ].map((item) => (
                    <div key={item.plan} className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                      <span className="text-sm text-neutral-300 font-medium flex-1">{item.plan}</span>
                      <span className="text-sm text-neutral-500">{item.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Visual Return Chart */}
              <div className="relative">
                <div className="bg-black/50 rounded-2xl border border-white/[0.04] p-6">
                  <p className="text-xs text-neutral-600 uppercase tracking-wider mb-4 font-medium">Projected Returns — $10,000 Investment</p>
                  <div className="space-y-3">
                    {[
                      { plan: 'Basic', return: '$1,500', days: '30 days', pct: 15 },
                      { plan: 'Silver', return: '$1,680', days: '21 days', pct: 16.8 },
                      { plan: 'Gold', return: '$1,680', days: '14 days', pct: 16.8 },
                      { plan: 'Platinum', return: '$1,260', days: '7 days', pct: 12.6 },
                    ].map((item) => (
                      <div key={item.plan} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400 font-medium">{item.plan}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-green-400 font-semibold">+{item.return}</span>
                            <span className="text-neutral-600">{item.days}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-1000"
                            style={{ width: `${item.pct * 5}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-600 mt-4">* Returns are projections based on daily rates. Actual results may vary.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="tesla-divider mx-auto max-w-6xl" />

      {/* ===== SECURITY SECTION ===== */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/15 mb-6">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
            Security & Compliance
          </h2>
          <p className="mx-auto max-w-2xl text-neutral-400 leading-relaxed mb-8">
            Your security is our top priority. TeslaPrimeCapital employs industry-leading security measures to ensure your investments and personal data are protected at all times.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: '256-bit Encryption', desc: 'All data encrypted in transit and at rest' },
              { icon: Shield, title: '2FA Authentication', desc: 'Two-factor auth for all accounts' },
              { icon: FileText, title: 'KYC/AML Compliant', desc: 'Full regulatory compliance' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                    <Icon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="tesla-divider mx-auto max-w-6xl" />

      {/* ===== TESTIMONIALS / SOCIAL PROOF ===== */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              Trusted by <span className="text-red-500">thousands</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Michael R.', location: 'New York, USA', text: 'TeslaPrimeCapital has completely transformed my investment strategy. The daily returns are consistent and the platform is incredibly easy to use.', rating: 5 },
              { name: 'Sarah K.', location: 'London, UK', text: 'I have been investing for 3 years now and the Gold plan has exceeded my expectations. The support team is always responsive and helpful.', rating: 5 },
              { name: 'David L.', location: 'Singapore', text: 'The Platinum tier offers amazing returns. I appreciate the transparency and the real-time tracking of all my investments on the dashboard.', rating: 5 },
            ].map((testimonial) => (
              <div key={testimonial.name} className="tesla-card rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-neutral-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-800 p-10 sm:p-14 text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 blur-[60px]" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                Ready to grow your wealth?
              </h2>
              <p className="mx-auto max-w-lg text-red-100/80 mb-8 text-base sm:text-lg">
                Join thousands of investors already earning daily returns. Create your free account and start investing in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={onRegister}
                  size="lg"
                  className="h-12 w-full sm:w-auto rounded-xl bg-white text-red-600 font-semibold px-8 hover:bg-neutral-100 transition-all shadow-lg shadow-black/20"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  onClick={onLogin}
                  size="lg"
                  variant="outline"
                  className="h-12 w-full sm:w-auto rounded-xl border-white/20 text-white hover:bg-white/10 px-8 transition-all"
                >
                  Sign In
                </Button>
              </div>
              <p className="mt-6 text-xs text-red-200/50">No credit card required. Start investing in minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.04] px-4 sm:px-6">
        <div className="mx-auto max-w-6xl py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <TeslaLogo size="small" />
              <p className="mt-4 text-sm text-neutral-500 leading-relaxed">
                Enterprise-grade managed investment platform with daily returns and institutional security.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {['Investment Plans', 'Deposit Funds', 'Withdrawals', 'Referral Program'].map((link) => (
                  <li key={link}>
                    <button onClick={onRegister} className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About Us', 'Contact Support', 'Terms of Service', 'Privacy Policy'].map((link) => (
                  <li key={link}>
                    <span className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer">{link}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {['KYC Verification', 'AML Policy', 'Risk Disclosure', 'Compliance'].map((link) => (
                  <li key={link}>
                    <span className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="tesla-divider mb-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-600">
              &copy; {new Date().getFullYear()} TeslaPrimeCapital. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button onClick={onLogin} className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">Sign In</button>
              <button onClick={onRegister} className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">Create Account</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}