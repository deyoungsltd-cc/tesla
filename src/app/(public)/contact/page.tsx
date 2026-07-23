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

const quickAnswers = [
  { q: 'How long does support take to respond?', a: 'Our live chat provides instant responses 24/7. Email inquiries are typically answered within 1-2 hours during business hours, and within 4 hours during off-peak times.' },
  { q: 'I have a deposit that hasn\'t been credited.', a: 'For cryptocurrency deposits, check the blockchain transaction status first. If confirmed but not credited, contact support with your transaction hash. Gift card deposits may take 1-3 hours for verification.' },
  { q: 'My withdrawal is pending.', a: 'Standard withdrawals are processed within 1-24 hours. If your withdrawal exceeds the expected processing time, contact support with your withdrawal details for immediate assistance.' },
];

export default function ContactPage() {
  const [openQA, setOpenQA] = useState<number | null>(null);

  return (
    <div className="page-enter relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="float-orb float-orb-md" style={{ top: '10%', left: '-10%' }} />
      <div className="float-orb float-orb-lg" style={{ bottom: '15%', right: '-8%' }} />
      <div className="float-orb float-orb-sm" style={{ top: '50%', left: '50%' }} />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <FadeIn>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 heading-gradient">Contact Us</h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">Our dedicated support team is available around the clock to assist you with any questions, concerns, or feedback.</p>
          </div>
        </FadeIn>
      </section>

      {/* Contact Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <FadeIn delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, title: 'Email Support', detail: 'support@teslaprimecapital.com', sub: 'Response within 2 hours' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: 'Live Chat', detail: 'Available on platform', sub: '24/7 instant response' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Business Hours', detail: '24/7/365', sub: 'Always available' },
            ].map((item) => (
              <div key={item.title} className="tilt-card dash-card card-shine noise-overlay bg-tesla-card border border-tesla-border rounded-2xl p-6 text-center hover:border-[#CC0000]/30 transition-all duration-500">
                <div className="w-14 h-14 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#CC0000]/10">
                  {item.icon}
                </div>
                <h3 className="text-white font-bold mb-1">{item.title}</h3>
                <p className="text-white text-sm font-medium">{item.detail}</p>
                <p className="text-gray-500 text-xs mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="section-divider" />
      </div>

      {/* Contact Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <FadeIn delay={200}>
          <div className="dash-card card-shine noise-overlay bg-tesla-card border border-tesla-border rounded-2xl p-8 sm:p-10">
            <h2 className="text-white font-bold text-2xl mb-2">Send Us a Message</h2>
            <p className="text-gray-400 text-sm mb-8">Fill out the form below and our team will get back to you as soon as possible.</p>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000]/50 focus:ring-1 focus:ring-[#CC0000]/20 transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                  <input type="email" placeholder="you@example.com" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000]/50 focus:ring-1 focus:ring-[#CC0000]/20 transition-all duration-300" />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Account Email (if different)</label>
                <input type="email" placeholder="Optional" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000]/50 focus:ring-1 focus:ring-[#CC0000]/20 transition-all duration-300" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
                <select className="w-full bg-[#1a1a1a] border border-tesla-border rounded-xl px-4 py-3.5 text-sm text-gray-400 focus:outline-none focus:border-[#CC0000]/50 focus:ring-1 focus:ring-[#CC0000]/20 transition-all duration-300">
                  <option>General Inquiry</option>
                  <option>Deposit Issue</option>
                  <option>Withdrawal Issue</option>
                  <option>Account Verification</option>
                  <option>Referral Program</option>
                  <option>Technical Problem</option>
                  <option>Complaint</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Message</label>
                <textarea rows={5} placeholder="Describe your issue or question in detail..." className="w-full bg-[#1a1a1a] border border-tesla-border rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000]/50 focus:ring-1 focus:ring-[#CC0000]/20 transition-all duration-300 resize-none" />
              </div>
              <button className="btn-red pulse-ring magnetic-hover bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all duration-300">
                Send Message
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="section-divider" />
      </div>

      {/* FAQ - Quick Answers Accordion */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <FadeIn delay={300}>
          <div className="dash-card card-shine noise-overlay bg-tesla-card border border-tesla-border rounded-2xl p-8 sm:p-10">
            <h2 className="text-white font-bold text-2xl mb-6">Quick Answers</h2>
            <div className="space-y-4">
              {quickAnswers.map((item, idx) => {
                const isOpen = openQA === idx;
                return (
                  <div key={item.q} className={`bg-[#1a1a1a] border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#CC0000]/40 shadow-[0_0_20px_rgba(204,0,0,0.08)]' : 'border-tesla-border'}`}>
                    <button
                      onClick={() => setOpenQA(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-white text-sm font-medium pr-4">{item.q}</span>
                      <svg
                        className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#CC0000]' : 'text-gray-500'}`}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{item.a}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
