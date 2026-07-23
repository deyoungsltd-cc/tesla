'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';

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
    <div className="min-h-screen bg-tesla-dark text-white page-enter">
      {/* Hero with Elon Musk */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ top: '5%', right: '-10%' }} />
        <div className="float-orb float-orb-sm" style={{ bottom: '5%', left: '-5%' }} />
        <FadeIn>
          <div className="glass-card noise-overlay relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#CC0000] rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#CC0000] rounded-full blur-[100px]" />
            </div>
            <div className="relative p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#CC0000]/30 shrink-0 bg-tesla-card shadow-[0_0_40px_rgba(204,0,0,0.15)] relative">
                  <img src="https://images.unsplash.com/photo-1534272208726-63db30c70396?w=300&q=80" alt="Elon Musk - Tesla CEO" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/30 to-transparent" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-4">
                    <span className="text-[#CC0000] text-xs font-bold tracking-wider">LEADERSHIP</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3">About <span className="gradient-text-animated">Tesla Prime Capital</span></h1>
                  <p className="text-gray-400 leading-relaxed max-w-xl text-base">Pioneering the future of investment management through technology, transparency, and sustainable wealth creation for investors worldwide.</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <hr className="section-divider" />

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative overflow-hidden">
        <div className="float-orb float-orb-sm" style={{ top: '5%', left: '-3%' }} />
        <FadeIn>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 border border-[#CC0000]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#CC0000] text-xs font-bold tracking-wider">OUR STORY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-8 heading-gradient">Built on Vision, Driven by Results</h2>
            <div className="space-y-5 text-gray-400 text-base leading-relaxed">
              <p>Tesla Prime Capital was founded with a bold vision: to democratize access to institutional-grade investment strategies that were previously available only to ultra-high-net-worth individuals and large financial institutions. Our founders recognized that millions of aspiring investors around the world were being excluded from the most lucrative investment opportunities due to high entry barriers, complex requirements, and opaque fee structures that favored intermediaries over investors.</p>
              <p>Since our inception, we have grown from a small team of passionate financial technologists into a global platform serving over 45,000 active investors across 180+ countries. We have processed more than $2.4 billion in assets under management and have consistently delivered daily returns that exceed industry benchmarks.</p>
              <p>Today, Tesla Prime Capital stands at the intersection of technology and finance, leveraging artificial intelligence, machine learning, and blockchain technology to optimize investment outcomes while maintaining the highest standards of security and regulatory compliance. Our platform is designed to be intuitive enough for first-time investors while offering the depth and sophistication that experienced traders demand.</p>
            </div>
          </div>
        </FadeIn>
      </section>

      <hr className="section-divider" />

      {/* Mission & Vision */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tesla-card/30 relative overflow-hidden">
        <div className="float-orb float-orb-md" style={{ bottom: '10%', right: '-5%' }} />
        <FadeIn>
          <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="dash-card card-shine noise-overlay p-8 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000]/0 to-transparent group-hover:via-[#CC0000]/60 transition-all duration-500" />
              <div className="w-14 h-14 bg-[#CC0000]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#CC0000]/20 transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Our Mission</h3>
              <p className="text-gray-400 text-sm leading-relaxed">To provide accessible, transparent, and high-yielding investment opportunities that empower individuals worldwide to achieve their financial goals through professionally managed portfolios and cutting-edge technology.</p>
            </div>
            <div className="dash-card card-shine noise-overlay p-8 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000]/0 to-transparent group-hover:via-[#CC0000]/60 transition-all duration-500" />
              <div className="w-14 h-14 bg-[#CC0000]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#CC0000]/20 transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <h3 className="text-white font-bold text-xl mb-3">Our Vision</h3>
              <p className="text-gray-400 text-sm leading-relaxed">To become the world&apos;s most trusted and innovative investment platform, where every individual has the tools and support to build lasting wealth through intelligent, diversified investing.</p>
            </div>
          </div>
        </FadeIn>
      </section>

      <hr className="section-divider" />

      {/* Core Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative overflow-hidden">
        <div className="float-orb float-orb-md" style={{ top: '20%', right: '-8%' }} />
        <FadeIn>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-10 heading-gradient">Core Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Transparency', desc: 'Every transaction, fee, and return is fully visible and auditable. Investors deserve complete visibility into how their capital is being managed.' },
                { title: 'Security', desc: 'Bank-grade encryption, multi-factor authentication, cold storage for digital assets, and continuous security monitoring to protect every aspect of your account.' },
                { title: 'Innovation', desc: 'AI-driven analytics, real-time market data integration, and automated trading algorithms that adapt to evolving market conditions for optimal returns.' },
                { title: 'Integrity', desc: 'Operating with the highest ethical standards, full regulatory compliance, and honest communication. Your trust is our most valuable asset.' },
                { title: 'Accessibility', desc: 'Minimum investment of just $200 with support for cryptocurrency and gift cards. We removed traditional barriers that prevent people from investing.' },
                { title: 'Excellence', desc: 'From user interface to customer support, every aspect is designed to deliver a premium experience that exceeds expectations and sets new industry standards.' },
              ].map((v, i) => (
                <FadeIn key={v.title} delay={i * 80}>
                  <div className="dash-card card-shine noise-overlay p-6 group tilt-card relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CC0000]/0 to-transparent group-hover:via-[#CC0000]/60 transition-all duration-500" />
                    <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      <hr className="section-divider" />

      {/* Key Metrics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-tesla-card/30 relative overflow-hidden">
        <FadeIn>
          <div className="max-w-5xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-10 heading-gradient">By the Numbers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { value: '$2.4B+', label: 'Assets Under Management' },
                { value: '45,000+', label: 'Active Investors' },
                { value: '180+', label: 'Countries Served' },
                { value: '99.9%', label: 'Platform Uptime' },
                { value: '10+', label: 'Years of Operations' },
                { value: '$850M+', label: 'Total Payouts' },
                { value: '24/7', label: 'Expert Support' },
                { value: '0', label: 'Security Breaches' },
              ].map((m) => (
                <div key={m.label} className="dash-card card-shine p-6 text-center group hover:scale-[1.03] transition-transform duration-300">
                  <p className="text-white text-2xl font-black group-hover:text-[#CC0000] transition-colors duration-300">{m.value}</p>
                  <p className="text-gray-500 text-xs mt-2 font-medium">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      <hr className="section-divider" />

      {/* Technology */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative overflow-hidden">
        <div className="float-orb float-orb-md" style={{ top: '10%', right: '-5%' }} />
        <FadeIn>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-8 heading-gradient">Our Technology</h2>
            <div className="space-y-5 text-gray-400 text-base leading-relaxed">
              <p>Tesla Prime Capital&apos;s investment engine is powered by a proprietary combination of artificial intelligence, machine learning, and quantitative analysis. Our algorithms continuously monitor global markets across multiple asset classes, identifying optimal entry and exit points with precision that exceeds human capabilities.</p>
              <p>Our technology stack includes high-frequency trading systems capable of executing thousands of transactions per second, risk management AI that dynamically adjusts portfolio allocations based on real-time market volatility, and natural language processing models that analyze news sentiment and social media trends to anticipate market movements before they happen.</p>
              <p>All of this is delivered through a modern, responsive web platform built with the latest web technologies, ensuring a seamless experience whether you are managing your investments from a desktop computer or checking your returns on your mobile phone.</p>
            </div>
          </div>
        </FadeIn>
      </section>

      <hr className="section-divider" />

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative overflow-hidden">
        <div className="float-orb float-orb-lg" style={{ top: '-20%', left: '30%' }} />
        <FadeIn>
          <div className="relative z-10">
            <div className="animated-border">
              <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/15 via-[#CC0000]/5 to-transparent rounded-3xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#CC0000]/8 rounded-full blur-[120px]" />
                <div className="relative bg-tesla-dark/90 rounded-3xl p-10 sm:p-14 text-center noise-overlay">
                  <h2 className="text-3xl sm:text-4xl font-black mb-5 relative">Ready to Start <span className="gradient-text-animated">Investing</span>?</h2>
                  <p className="text-gray-400 max-w-lg mx-auto mb-10 relative text-base leading-relaxed">Join 45,000+ investors worldwide. Stay updated with our latest insights and investment opportunities.</p>
                  {subscribed ? (
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-3 rounded-xl text-sm font-medium">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      You&apos;re subscribed! Check your inbox for confirmation.
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto relative">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full sm:flex-1 bg-white/5 border border-tesla-border rounded-xl px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#CC0000]/50 focus:shadow-[0_0_20px_rgba(204,0,0,0.1)] transition-all duration-300" />
                      <button onClick={() => { if (email) setSubscribed(true); }} className="btn-red text-sm whitespace-nowrap pulse-ring !rounded-xl">Subscribe</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
