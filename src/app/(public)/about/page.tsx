'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Image from 'next/image';

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

export default function AboutPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 page-enter">
      {/* Hero with Elon Musk */}
      <FadeIn delay={0}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0505] via-[#2a0a0a] to-tesla-card border border-[#CC0000]/15 mb-16 noise-overlay">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#CC0000] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#CC0000] rounded-full blur-[100px]" />
          </div>
          {/* Gradient border glow effect */}
          <div className="absolute inset-0 rounded-2xl border border-[#CC0000]/0 hover:border-[#CC0000]/30 transition-all duration-500 pointer-events-none" />
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-[#CC0000]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#CC0000]/30 shrink-0 bg-tesla-card shadow-[0_0_30px_rgba(204,0,0,0.15)]">
                <Image src="https://teslapremiumfinance.com/wp-content/uploads/2024/04/1.jpeg" alt="Tesla CEO" width={130} height={130} className="w-full h-full object-cover" unoptimized />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">About <span className="text-[#CC0000]">Tesla Prime Capital</span></h1>
                <p className="text-gray-400 leading-relaxed max-w-lg">Pioneering the future of investment management through technology, transparency, and sustainable wealth creation for investors worldwide.</p>
              </div>
            </div>
          </div>
          {/* Floating orb */}
          <div className="float-orb float-orb-md" style={{ top: '10%', right: '-5%' }} />
        </div>
      </FadeIn>

      {/* Section Divider */}
      <hr className="section-divider" />

      {/* Our Story */}
      <FadeIn delay={100}>
        <section className="mb-14 relative overflow-hidden">
          <div className="float-orb float-orb-sm" style={{ top: '5%', left: '-3%' }} />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>Tesla Prime Capital was founded with a bold vision: to democratize access to institutional-grade investment strategies that were previously available only to ultra-high-net-worth individuals and large financial institutions. Our founders recognized that millions of aspiring investors around the world were being excluded from the most lucrative investment opportunities due to high entry barriers, complex requirements, and opaque fee structures that favored intermediaries over investors.</p>
              <p>Since our inception, we have grown from a small team of passionate financial technologists into a global platform serving over 45,000 active investors across 180+ countries. We have processed more than $2.4 billion in assets under management and have consistently delivered daily returns that exceed industry benchmarks. Our success is built on a foundation of cutting-edge algorithmic trading systems, diversified investment strategies, and an unwavering commitment to transparency and investor protection.</p>
              <p>Today, Tesla Prime Capital stands at the intersection of technology and finance, leveraging artificial intelligence, machine learning, and blockchain technology to optimize investment outcomes while maintaining the highest standards of security and regulatory compliance. Our platform is designed to be intuitive enough for first-time investors while offering the depth and sophistication that experienced traders demand.</p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Section Divider */}
      <hr className="section-divider" />

      {/* Mission & Vision */}
      <FadeIn delay={200}>
        <section className="mb-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="dash-card card-shine noise-overlay p-6 group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000]/0 to-transparent group-hover:via-[#CC0000]/60 transition-all duration-500" />
            <div className="w-12 h-12 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Our Mission</h3>
            <p className="text-gray-400 text-sm leading-relaxed">To provide accessible, transparent, and high-yielding investment opportunities that empower individuals worldwide to achieve their financial goals through professionally managed portfolios and cutting-edge technology.</p>
          </div>
          <div className="dash-card card-shine noise-overlay p-6 group relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000]/0 to-transparent group-hover:via-[#CC0000]/60 transition-all duration-500" />
            <div className="w-12 h-12 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Our Vision</h3>
            <p className="text-gray-400 text-sm leading-relaxed">To become the world&apos;s most trusted and innovative investment platform, where every individual — regardless of background or net worth — has the tools and support to build lasting wealth through intelligent, diversified investing.</p>
          </div>
        </section>
      </FadeIn>

      {/* Section Divider */}
      <hr className="section-divider" />

      {/* Core Values */}
      <FadeIn delay={300}>
        <section className="mb-14 relative overflow-hidden">
          <div className="float-orb float-orb-md" style={{ top: '20%', right: '-8%' }} />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6">Core Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Transparency', desc: 'Every transaction, fee, and return is fully visible and auditable. We believe investors deserve complete visibility into how their capital is being managed and performing at all times.' },
                { title: 'Security', desc: 'We employ bank-grade encryption, multi-factor authentication, cold storage for digital assets, and continuous security monitoring to protect every aspect of your account and investments.' },
                { title: 'Innovation', desc: 'Our platform is built on the latest technologies including AI-driven analytics, real-time market data integration, and automated trading algorithms that adapt to evolving market conditions.' },
                { title: 'Integrity', desc: 'We operate with the highest ethical standards, full regulatory compliance, and honest communication. Your trust is our most valuable asset, and we work daily to earn and maintain it.' },
                { title: 'Accessibility', desc: 'With a minimum investment of just $200 and support for multiple deposit methods including cryptocurrency and gift cards, we have removed traditional barriers that prevent people from investing.' },
                { title: 'Excellence', desc: 'From our user interface to our customer support, every aspect of Tesla Prime Capital is designed to deliver a premium experience that exceeds expectations and sets new industry standards.' },
              ].map((v) => (
                <div key={v.title} className="dash-card card-shine noise-overlay rounded-xl p-5 group tilt-card relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000]/0 to-transparent group-hover:via-[#CC0000]/60 transition-all duration-500" />
                  <h3 className="text-white font-semibold mb-2">{v.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Section Divider */}
      <hr className="section-divider" />

      {/* Key Metrics */}
      <FadeIn delay={400}>
        <section className="mb-14 relative overflow-hidden">
          <div className="float-orb float-orb-sm" style={{ bottom: '10%', left: '-4%' }} />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6">By the Numbers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: '$2.4B+', label: 'Assets Under Management' },
                { value: '45,000+', label: 'Active Investors' },
                { value: '180+', label: 'Countries Served' },
                { value: '99.9%', label: 'Platform Uptime' },
                { value: '10+', label: 'Years of Operations' },
                { value: '$850M+', label: 'Total Payouts to Investors' },
                { value: '24/7', label: 'Expert Support Availability' },
                { value: '0', label: 'Security Breaches' },
              ].map((m) => (
                <div key={m.label} className="dash-card card-shine rounded-xl p-4 text-center group hover:scale-[1.03] transition-transform duration-300 hover:shadow-[0_0_20px_rgba(204,0,0,0.1)]">
                  <p className="text-white text-xl font-bold group-hover:text-[#CC0000] transition-colors duration-300">{m.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Section Divider */}
      <hr className="section-divider" />

      {/* Technology */}
      <FadeIn delay={500}>
        <section className="mb-14 relative overflow-hidden">
          <div className="float-orb float-orb-md" style={{ top: '10%', right: '-5%' }} />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-4 heading-gradient">Our Technology</h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>Tesla Prime Capital&apos;s investment engine is powered by a proprietary combination of artificial intelligence, machine learning, and quantitative analysis. Our algorithms continuously monitor global markets across multiple asset classes — equities, cryptocurrencies, commodities, and derivatives — identifying optimal entry and exit points with precision that exceeds human capabilities.</p>
              <p>Our technology stack includes high-frequency trading systems capable of executing thousands of transactions per second, risk management AI that dynamically adjusts portfolio allocations based on real-time market volatility, and natural language processing models that analyze news sentiment and social media trends to anticipate market movements before they happen.</p>
              <p>All of this is delivered through a modern, responsive web platform built with the latest web technologies, ensuring a seamless experience whether you are managing your investments from a desktop computer or checking your returns on your mobile phone during your commute.</p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Section Divider */}
      <hr className="section-divider" />

      {/* CTA Section */}
      <FadeIn delay={600}>
        <section className="mb-14 relative overflow-hidden">
          <div className="float-orb float-orb-lg" style={{ top: '-20%', left: '30%' }} />
          <div className="relative z-10">
            <div className="animated-border">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/15 via-[#CC0000]/5 to-transparent rounded-2xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#CC0000]/8 rounded-full blur-[120px]" />
                <div className="relative bg-tesla-dark/90 rounded-2xl p-8 sm:p-14 text-center noise-overlay">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative">Ready to Start <span className="gradient-text-animated">Investing</span>?</h2>
                  <p className="text-gray-400 max-w-lg mx-auto mb-8 relative">Join 45,000+ investors worldwide. Stay updated with our latest insights and investment opportunities.</p>
                  {subscribed ? (
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-3 rounded-xl text-sm font-medium">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      You&apos;re subscribed! Check your inbox for confirmation.
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full sm:flex-1 bg-white/5 border border-tesla-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#CC0000]/50 focus:shadow-[0_0_15px_rgba(204,0,0,0.1)] transition-all duration-300"
                      />
                      <button
                        onClick={() => { if (email) setSubscribed(true); }}
                        className="btn-red text-sm whitespace-nowrap pulse-ring"
                      >
                        Subscribe
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
