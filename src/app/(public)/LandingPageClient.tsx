'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import WithdrawalNotification from '@/components/WithdrawalNotification';

const TradingViewWidget = dynamic(() => import('@/components/TradingViewWidget'), { ssr: false });
const TickerTapeWidget = dynamic(() => import('@/components/TickerTapeWidget'), { ssr: false });

/* ── Shared Components ── */
function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !hasAnimated) { setHasAnimated(true); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasAnimated]);
  const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
  const prefix = value.match(/^[^0-9]*/)?.[0] || '';
  const decimalPlaces = value.includes('.') ? value.split('.')[1]?.replace(/[^0-9]/g, '').length || 0 : 0;
  useEffect(() => {
    if (!hasAnimated || !ref.current) return;
    const duration = 2000;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericPart * eased;
      if (ref.current) {
        let display: string;
        if (decimalPlaces > 0) { display = current.toFixed(decimalPlaces); }
        else if (numericPart >= 1000) { display = Math.round(current).toLocaleString(); }
        else { display = Math.round(current).toString(); }
        ref.current.textContent = prefix + display + suffix;
      }
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [hasAnimated, numericPart, prefix, suffix, decimalPlaces]);
  return <span ref={ref} className="count-up">{prefix}0{suffix}</span>;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

/* ── Data ── */
const plans = [
  { name: 'Basic', badge: 'STARTER', badgeBg: 'bg-gradient-to-r from-gray-600 to-gray-800', min: '$200', max: '$4,999', daily: '0.5%', duration: '30 Days', model: 'Model 3', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=85&auto=format&fit=crop', features: ['Daily profit accrual', 'Capital return included', '24/7 support access'] },
  { name: 'Silver', badge: 'POPULAR', badgeBg: 'bg-gradient-to-r from-[#CC0000] to-[#ff1a1a]', min: '$5,000', max: '$9,999', daily: '0.8%', duration: '21 Days', model: 'Model S', image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&q=85&auto=format&fit=crop', features: ['Higher daily returns', 'Priority withdrawals', 'Dedicated account manager'], popular: true },
  { name: 'Gold', badge: 'PREMIUM', badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-500', min: '$10,000', max: '$49,999', daily: '1.2%', duration: '14 Days', model: 'Model X', image: 'https://images.unsplash.com/photo-1535392432937-a27c36ec07b5?w=800&q=85&auto=format&fit=crop', features: ['Premium daily rates', 'Instant profit withdrawal', 'Portfolio insurance'] },
  { name: 'Platinum', badge: 'ELITE', badgeBg: 'bg-gradient-to-r from-purple-500 to-indigo-500', min: '$50,000', max: '$100,000', daily: '1.8%', duration: '7 Days', model: 'Cybertruck', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=85&auto=format&fit=crop', features: ['Maximum daily returns', 'Zero-fee withdrawals', 'VIP concierge service'] },
];

const stats = [
  { value: '$2.4B', label: 'Assets Under Management', suffix: '+', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { value: '45000', label: 'Active Investors', suffix: '+', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a3 3 0 100-6 3 3 0 000 6z' },
  { value: '99.9', label: 'Platform Uptime', suffix: '%', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { value: '24', label: 'Expert Support', suffix: '/7', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M5.636 18.364l3.536-3.536m0-5.656L5.636 5.636m12.728 0L5.636 18.364M18.364 18.364L5.636 5.636' },
];

const features = [
  { title: 'Managed Portfolios', desc: 'Expert fund managers allocate your capital across diversified strategies for optimal risk-adjusted returns. Our team monitors global markets 24/7 to capitalize on every opportunity.', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { title: 'Daily Profit Accrual', desc: 'Transparent, real-time profit tracking and instant crediting to your account every single day. Watch your capital grow with compound interest reinvestment.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { title: 'Bank-Grade Security', desc: '256-bit encryption, multi-factor authentication, cold storage for digital assets, and full regulatory compliance. Your funds are protected by institutional-grade infrastructure.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { title: 'Instant Withdrawals', desc: 'Access your funds whenever you need. Processed within minutes, not days. Gold and Platinum investors enjoy zero withdrawal fees on all transactions.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up in under 2 minutes with your email. Verify your identity and secure your account with two-factor authentication for maximum protection.', icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a3 3 0 100-6 3 3 0 000 6z' },
  { step: '02', title: 'Choose a Plan', desc: 'Select from four investment tiers — Basic, Silver, Gold, or Platinum — each offering different daily returns, durations, and exclusive premium perks.', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { step: '03', title: 'Earn Returns', desc: 'Your capital starts generating daily returns immediately. Withdraw earnings or reinvest to compound. Track everything from your real-time dashboard.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
];

const testimonials = [
  { name: 'David M.', location: 'New York, USA', plan: 'Gold Investor', text: 'Tesla Prime Capital has completely transformed my investment strategy. The daily returns are consistent and the withdrawal process is seamless. I have been investing for 8 months and the results exceed my expectations.', avatar: 'D', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { name: 'Sarah K.', location: 'London, UK', plan: 'Platinum Investor', text: 'The VIP support and zero-fee withdrawals make Platinum the best plan. My portfolio has grown over 40% in just 3 months. The transparency and real-time tracking give me complete confidence.', avatar: 'S', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
  { name: 'James T.', location: 'Sydney, AU', plan: 'Silver Investor', text: 'As a first-time investor, the platform made everything simple. The 0.8% daily returns are exactly as advertised and my account manager has been incredibly helpful throughout the process.', avatar: 'J', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
  { name: 'Amara O.', location: 'Lagos, NG', plan: 'Gold Investor', text: 'I was skeptical at first but Tesla Prime Capital proved me wrong. The returns are real, the support team responds within minutes, and I have successfully withdrawn multiple times without any issues.', avatar: 'A', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
  { name: 'Robert L.', location: 'Toronto, CA', plan: 'Platinum Investor', text: 'After retiring, I needed a reliable income source. Tesla Prime Capital delivers exactly what they promise. My daily earnings are consistent and the platform is incredibly easy to navigate.', avatar: 'R', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  { name: 'Mei L.', location: 'Singapore', plan: 'Silver Investor', text: 'The referral program is fantastic. I have referred several colleagues and we all earn together. The platform transparency with real-time tracking sets it apart from anything else I have tried.', avatar: 'M', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
];

const faqs = [
  { q: 'How does Tesla Prime Capital generate returns?', a: 'Our fund managers deploy capital across diversified strategies including equities, crypto assets, algorithmic trading, and sustainable energy investments. By spreading risk across multiple asset classes and employing AI-driven analytics, we maintain consistent daily returns while minimizing exposure to any single market downturn.' },
  { q: 'Is my initial investment protected?', a: 'Yes, your principal is returned in full at the end of your plan duration. We maintain a capital reserve fund specifically designated to ensure all investor principals are secured regardless of market conditions. This reserve is regularly audited and maintained at a ratio that exceeds our total outstanding investment obligations.' },
  { q: 'How do I withdraw my earnings?', a: 'Navigate to Withdraw in your dashboard, enter the amount and your receiving wallet address. For verified accounts, withdrawals are processed within minutes. Gold and Platinum plan investors enjoy zero withdrawal fees. All applicable fees are clearly displayed before you confirm any transaction.' },
  { q: 'What deposit methods are accepted?', a: 'We accept Cryptocurrency (Bitcoin, Ethereum, USDT, and other major tokens) and Gift Cards (Amazon, Apple, Google Play, Steam, and other major retailers). Crypto deposits are confirmed within minutes after blockchain confirmation. Gift card deposits are verified and credited within 1-3 business hours.' },
  { q: 'How does the referral program work?', a: 'Share your unique referral link with friends. When they register and make their first deposit, you earn up to 10% commission on their deposit amount. There is no limit to the number of people you can refer, and commissions are credited instantly to your available balance.' },
];

/* ── MAIN COMPONENT ── */
export default function LandingPageClient() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-tesla-dark text-white page-enter">
      <ScrollProgress />
      <TickerTapeWidget />

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-36 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ top: '5%', left: '-8%' }} />
        <div className="float-orb float-orb-md" style={{ top: '25%', right: '-5%' }} />
        <div className="float-orb float-orb-sm" style={{ bottom: '15%', left: '35%' }} />
        <div className="bg-gradient-hero relative z-10">
          <FadeIn>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-3 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-6 py-2.5 mb-8">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                <span className="text-[#CC0000] text-sm font-medium tracking-wide">Trusted by 45,000+ investors worldwide</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8 text-shadow-subtle">
                Invest Smarter.<br />
                <span className="gradient-text-animated">Earn Daily Returns.</span>
              </h1>
              <p className="text-gray-400 text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                Tesla Prime Capital offers professionally managed investment plans with daily returns up to <span className="text-white font-semibold">1.8%</span>. Institutional-grade security meets effortless investing.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link href="/register" className="btn-red text-lg px-10 py-4 pulse-ring magnetic-hover rounded-2xl">
                  Start Investing Now
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
                <Link href="/plans" className="btn-ghost text-lg px-10 py-4 magnetic-hover rounded-2xl">
                  View Investment Plans
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════ STATS BAR ══════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tesla-card/40 border-y border-tesla-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="text-center group">
                  <div className="w-14 h-14 mx-auto bg-[#CC0000]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#CC0000]/20 group-hover:shadow-[0_0_30px_rgba(204,0,0,0.2)] transition-all duration-500">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                  </div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-gray-500 text-sm font-medium tracking-wide">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════ LIVE CHART ══════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-tesla-card/30 relative overflow-hidden">
        <div className="float-orb float-orb-md" style={{ top: '-15%', right: '8%' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="glow-dot" />
                <span className="text-green-400 text-sm font-bold tracking-widest uppercase">Live Market Data</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 heading-gradient">TSLA Live Chart</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">Real-time Tesla stock performance powered by TradingView. Track the market that drives our investment strategy.</p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="glass-card card-shine noise-overlay !p-0 overflow-hidden animated-border">
              <div className="px-6 py-4 border-b border-tesla-border flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold text-lg">NASDAQ:TSLA</span>
                  <span className="text-gray-500 text-sm hidden sm:inline">Tesla, Inc.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="glow-dot" />
                  <span className="text-xs text-gray-500 font-medium">Live</span>
                </div>
              </div>
              <TradingViewWidget />
            </div>
          </FadeIn>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════ INVESTMENT PLANS ══════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ bottom: '-20%', left: '-12%' }} />
        <div className="float-orb float-orb-sm" style={{ top: '10%', right: '-3%' }} />
        <div className="relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 heading-gradient">Investment Plans</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">Choose the plan that fits your investment goals. Higher tiers unlock higher daily returns and exclusive premium perks.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className={`plan-card glass-card card-shine group tilt-card h-full flex flex-col ${plan.popular ? 'ring-1 ring-[#CC0000]/40' : ''}`}>
                  <div className="relative h-56 overflow-hidden bg-black">
                    <img src={plan.image} alt={`${plan.name} Plan - ${plan.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-tesla-dark via-tesla-dark/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                    <span className={`absolute top-4 left-4 ${plan.badgeBg} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide`}>{plan.badge}</span>
                    {plan.popular && <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000] to-transparent" />}
                  </div>
                  <div className="p-6 bg-gradient-card-glow flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <span className="text-gray-500 text-xs font-medium tracking-wider uppercase">{plan.model}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#CC0000] text-3xl font-black">{plan.daily}</span>
                        <span className="text-gray-500 text-xs block">daily</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-5 py-3 px-4 bg-black/30 rounded-xl border border-white/5">
                      <span className="text-gray-300 font-medium">{plan.min} — {plan.max}</span>
                      <span className="text-gray-500">{plan.duration}</span>
                    </div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-gray-300 text-sm">
                          <div className="w-5 h-5 rounded-full bg-[#CC0000]/10 flex items-center justify-center shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/register" className={`block w-full text-center text-sm font-bold py-3.5 rounded-xl transition-all duration-300 ${plan.popular ? 'btn-red pulse-ring' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-[#CC0000]/30'}`}>
                      Invest Now
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link href="/plans" className="inline-flex items-center gap-2 text-[#CC0000] hover:text-[#ff1a1a] font-semibold transition-colors group">
              View Full Plan Details with ROI Calculator
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════ WHY CHOOSE US ══════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-tesla-card/30 relative overflow-hidden">
        <div className="float-orb float-orb-sm" style={{ top: '15%', left: '3%' }} />
        <div className="float-orb float-orb-md" style={{ bottom: '5%', right: '5%' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 heading-gradient">Why Choose Us</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">Cutting-edge technology with institutional-grade fund management. Every feature designed for your success.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="dash-card card-shine noise-overlay p-8 group tilt-card relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000]/0 to-transparent group-hover:via-[#CC0000]/60 transition-all duration-500" />
                  <div className="w-16 h-16 bg-gradient-to-br from-[#CC0000]/20 to-[#CC0000]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(204,0,0,0.3)] transition-all duration-500 group-hover:scale-110">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link href="/about" className="inline-flex items-center gap-2 text-[#CC0000] hover:text-[#ff1a1a] font-semibold transition-colors group">
              Learn More About Our Company
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════ HOW TO START ══════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ top: '-15%', right: '-10%' }} />
        <div className="relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 heading-gradient">How to Get Started</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">Start earning daily returns in three simple steps. No complicated setup, no hidden requirements.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-[72px] left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-[#CC0000]/20 via-[#CC0000]/40 to-[#CC0000]/20" />
            {steps.map((item, i) => (
              <FadeIn key={i} delay={i * 200}>
                <div className="dash-card card-shine p-8 relative group">
                  <span className="text-[#CC0000]/[0.06] text-8xl font-black absolute top-2 right-4 group-hover:text-[#CC0000]/10 transition-colors select-none">{item.step}</span>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#CC0000]/20 to-transparent flex items-center justify-center mb-5 relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 relative">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed relative">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link href="/how-to-invest" className="inline-flex items-center gap-2 text-[#CC0000] hover:text-[#ff1a1a] font-semibold transition-colors group">
              Read the Full Investment Guide
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-tesla-card/30 relative overflow-hidden">
        <div className="float-orb float-orb-md" style={{ top: '10%', left: '-5%' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 heading-gradient">What Investors Say</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">Real feedback from real investors. Join thousands who are already growing their wealth with Tesla Prime Capital.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="dash-card card-shine noise-overlay p-8 group tilt-card h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#CC0000" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-4 pt-5 border-t border-tesla-border">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#CC0000]/30" loading="lazy" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CC0000] to-[#800000] flex items-center justify-center text-white font-bold text-lg">{t.avatar}</div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.location} &middot; {t.plan}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════ FAQ ══════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 heading-gradient">Frequently Asked Questions</h2>
              <p className="text-gray-400 text-base">Get answers to the most common questions about our platform.</p>
            </div>
          </FadeIn>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div
                  className={`bg-tesla-card border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${faqOpen === i ? 'border-[#CC0000]/30 shadow-[0_0_25px_rgba(204,0,0,0.08)]' : 'border-tesla-border hover:border-white/10'}`}
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <div className="flex items-center justify-between p-6">
                    <p className="text-white font-semibold text-sm sm:text-base pr-4">{faq.q}</p>
                    <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${faqOpen === i ? 'bg-[#CC0000]/20 rotate-180' : 'bg-white/5'}`}>
                      <svg className="w-4 h-4 text-gray-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                  </div>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${faqOpen === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-tesla-border pt-5">{faq.a}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link href="/faq" className="inline-flex items-center gap-2 text-[#CC0000] hover:text-[#ff1a1a] font-semibold transition-colors group">
              View All 15+ FAQ Questions
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ══════════ CTA ══════════ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ top: '-25%', left: '30%' }} />
        <FadeIn>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="animated-border">
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/15 via-[#CC0000]/5 to-transparent rounded-3xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#CC0000]/8 rounded-full blur-[120px]" />
                <div className="relative bg-tesla-dark/90 rounded-3xl p-10 sm:p-16 text-center noise-overlay">
                  <div className="inline-flex items-center gap-3 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-6 py-2.5 mb-8">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                    <span className="text-[#CC0000] text-sm font-medium">Join 45,000+ investors today</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5 relative">Ready to Start <span className="gradient-text-animated">Earning</span>?</h2>
                  <p className="text-gray-400 max-w-lg mx-auto mb-10 relative text-base leading-relaxed">Your financial future starts with a single decision. Create a free account and start earning daily returns in under 5 minutes.</p>
                  <div className="flex flex-col sm:flex-row gap-5 justify-center">
                    <Link href="/register" className="btn-red text-lg px-10 py-4 pulse-ring magnetic-hover rounded-2xl">
                      Create Free Account
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </Link>
                    <Link href="/contact" className="btn-ghost text-lg px-10 py-4 magnetic-hover rounded-2xl">
                      Talk to Our Team
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <WithdrawalNotification />
    </div>
  );
}
