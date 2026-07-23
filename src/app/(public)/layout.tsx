'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Plans', href: '/plans' },
  { label: 'How to Invest', href: '/how-to-invest' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-tesla-dark text-white">
      {/* Top gradient accent bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-gradient-to-r from-transparent via-[#CC0000] to-transparent" />

      {/* Navbar */}
      <nav className={`fixed top-[3px] left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-tesla-dark/95 backdrop-blur-2xl border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.3)]' : 'bg-tesla-dark/70 backdrop-blur-xl border-b border-white/5'}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <svg viewBox="0 0 342 35" className="w-9 h-9 group-hover:drop-shadow-[0_0_12px_rgba(204,0,0,0.6)] transition-all duration-300" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 .1a9.7 9.7 0 007 7h11l.5.1v27.6h6.8V7.3L26 7a9.7 9.7 0 007-7H0zm238.6 0h-6.8v34.8h6.8V.1zm-52.3 6.8c-5.3 0-9.7 2.1-12.9 6.2V.1h-6.8v34.8h6.8V19.5c0-7.4 3.8-12.4 10.2-12.4 5.8 0 9.3 4.3 9.3 11.2v16.6h6.8V17c0-6.3-1.8-10.1-4.5-12.6-2.6-2.3-5.4-2.5-8.9-2.5zM293 7.7c-9.7 0-17 7.3-17 18.2s7.3 18.2 17 18.2c9.4 0 16.7-7.3 16.7-18.2S302.4 7.7 293 7.7zm0 6.5c5.8 0 10.1 4.8 10.1 11.7 0 6.8-4.3 11.7-10.1 11.7S283 32.7 283 25.9c0-6.9 4.2-11.7 10-11.7zm-89.3-6.5h-7.5l-11.2 22.8V.1h-6.8v34.8h7.5l11.2-22.8v22.8h6.8V7.7z" fill="#CC0000"/>
              </svg>
              <span className="text-white font-black text-xl tracking-tight">Tesla<span className="text-[#CC0000]">Prime</span></span>
            </Link>
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-all duration-300 relative ${pathname === link.href ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-[#CC0000] rounded-full shadow-[0_0_8px_rgba(204,0,0,0.5)]" />
                  )}
                </Link>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white text-sm font-semibold px-5 py-2.5 transition-all duration-300 hover:bg-white/5 rounded-xl">Sign In</Link>
              <Link href="/register" className="btn-red text-sm py-2.5 px-7 pulse-ring !rounded-xl">Get Started</Link>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white p-2.5 rounded-xl hover:bg-white/5 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-tesla-dark/98 backdrop-blur-2xl border-t border-white/5 px-6 py-6 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`block text-sm font-semibold py-3 px-4 rounded-xl transition-all ${pathname === link.href ? 'text-white bg-[#CC0000]/10 border-l-2 border-[#CC0000]' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>{link.label}</Link>
            ))}
            <div className="pt-4 mt-3 border-t border-white/5 flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-white text-sm font-semibold py-3 px-4 rounded-xl hover:bg-white/5 text-center">Sign In</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-red text-center text-sm pulse-ring">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-[23px]">{children}</main>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-[#CC0000]/90 hover:bg-[#CC0000] text-white flex items-center justify-center shadow-[0_4px_25px_rgba(204,0,0,0.3)] transition-all duration-300 hover:scale-110 ${showBackTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        aria-label="Back to top"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
      </button>

      {/* Footer */}
      <footer className="border-t border-tesla-border bg-tesla-card/50 relative overflow-hidden mt-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#CC0000]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-20 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <svg viewBox="0 0 342 35" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg"><path d="M0 .1a9.7 9.7 0 007 7h11l.5.1v27.6h6.8V7.3L26 7a9.7 9.7 0 007-7H0zm238.6 0h-6.8v34.8h6.8V.1zm-52.3 6.8c-5.3 0-9.7 2.1-12.9 6.2V.1h-6.8v34.8h6.8V19.5c0-7.4 3.8-12.4 10.2-12.4 5.8 0 9.3 4.3 9.3 11.2v16.6h6.8V17c0-6.3-1.8-10.1-4.5-12.6-2.6-2.3-5.4-2.5-8.9-2.5zM293 7.7c-9.7 0-17 7.3-17 18.2s7.3 18.2 17 18.2c9.4 0 16.7-7.3 16.7-18.2S302.4 7.7 293 7.7zm0 6.5c5.8 0 10.1 4.8 10.1 11.7 0 6.8-4.3 11.7-10.1 11.7S283 32.7 283 25.9c0-6.9 4.2-11.7 10-11.7zm-89.3-6.5h-7.5l-11.2 22.8V.1h-6.8v34.8h7.5l11.2-22.8v22.8h6.8V7.7z" fill="#CC0000"/></svg>
                <span className="text-white font-bold text-sm">Tesla Prime Capital</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Professional investment management with daily returns you can count on. Backed by institutional-grade technology and transparent operations.</p>
              <div className="flex gap-3">
                {[
                  { label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { label: 'LinkedIn', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z' },
                  { label: 'Telegram', path: 'M22 2L11 13M22 2l-7 20-4-9-9-4z' },
                ].map((s) => (
                  <a key={s.label} href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#CC0000]/15 border border-white/5 hover:border-[#CC0000]/30 flex items-center justify-center transition-all duration-300 group" aria-label={s.label}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-[#CC0000] transition-colors"><path d={s.path} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold text-sm mb-5 tracking-wide">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Investment Plans', href: '/plans' },
                  { label: 'How to Invest', href: '/how-to-invest' },
                  { label: 'Blog', href: '/blog' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-500 hover:text-[#CC0000] text-sm transition-colors duration-300 relative group">
                      {l.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#CC0000] group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-bold text-sm mb-5 tracking-wide">Resources</h4>
              <ul className="space-y-3">
                {[
                  { label: 'FAQ', href: '/faq' },
                  { label: 'Support Center', href: '/contact' },
                  { label: 'Market Data', href: '/' },
                  { label: 'Referral Program', href: '/register' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-500 hover:text-[#CC0000] text-sm transition-colors duration-300 relative group">
                      {l.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#CC0000] group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold text-sm mb-5 tracking-wide">Legal</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                  { label: 'Risk Disclosure', href: '/risk-disclosure' },
                  { label: 'AML Policy', href: '/aml-policy' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-500 hover:text-[#CC0000] text-sm transition-colors duration-300 relative group">
                      {l.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#CC0000] group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-bold text-sm mb-5 tracking-wide">Stay Updated</h4>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">Get market insights and investment tips delivered to your inbox weekly.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="your@email.com" className="flex-1 min-w-0 bg-[#1a1a1a] border border-tesla-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
                <button className="btn-red text-xs py-2.5 px-4 shrink-0 !rounded-xl">Subscribe</button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-tesla-border pt-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-5">
              <p className="text-gray-600 text-xs">&copy; {new Date().getFullYear()} Tesla Prime Capital. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  <span className="text-xs">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  <span className="text-xs">256-bit Encryption</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-[10px] mt-5 text-center leading-relaxed max-w-3xl mx-auto">
              Risk Disclaimer: Investing involves risk. Past performance does not guarantee future results. The value of your investment may go up or down. Please read our full risk disclosure before making any investment decisions. Tesla Prime Capital is not a registered broker-dealer or financial advisor.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
