'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function TeslaLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 342 35" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 .1a9.7 9.7 0 007 7h11l.5.1v27.6h6.8V7.3L26 7a9.7 9.7 0 007-7H0zm238.6 0h-6.8v34.8h6.8V.1zm-52.3 6.8c-5.3 0-9.7 2.1-12.9 6.2V.1h-6.8v34.8h6.8V19.5c0-7.4 3.8-12.4 10.2-12.4 5.8 0 9.3 4.3 9.3 11.2v16.6h6.8V17c0-6.3-1.8-10.1-4.5-12.6-2.6-2.3-5.4-2.5-8.9-2.5zM293 7.7c-9.7 0-17 7.3-17 18.2s7.3 18.2 17 18.2c9.4 0 16.7-7.3 16.7-18.2S302.4 7.7 293 7.7zm0 6.5c5.8 0 10.1 4.8 10.1 11.7 0 6.8-4.3 11.7-10.1 11.7S283 32.7 283 25.9c0-6.9 4.2-11.7 10-11.7zm-89.3-6.5h-7.5l-11.2 22.8V.1h-6.8v34.8h7.5l11.2-22.8v22.8h6.8V7.7z" fill="#CC0000"/>
    </svg>
  );
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Plans', href: '/plans' },
  { label: 'How to Invest', href: '/how-to-invest' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-tesla-dark text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-tesla-dark/95 backdrop-blur-md border-b border-tesla-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <TeslaLogo />
              <span className="text-white font-bold text-lg tracking-tight">Tesla</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium px-4 py-2 transition-colors">Sign In</Link>
              <Link href="/register" className="bg-[#CC0000] hover:bg-[#a30000] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Get Started</Link>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
              </svg>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-tesla-dark border-t border-tesla-border px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`block text-sm font-medium py-2 ${pathname === link.href ? 'text-white' : 'text-gray-300 hover:text-white'}`}>{link.label}</Link>
            ))}
            <div className="pt-3 border-t border-tesla-border flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-white text-sm font-medium py-2">Sign In</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="bg-[#CC0000] hover:bg-[#a30000] text-white text-sm font-semibold px-5 py-2.5 rounded-lg text-center">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-tesla-border bg-tesla-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TeslaLogo className="w-6 h-6" />
                <span className="text-white font-bold text-sm">Tesla Prime Capital</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">Professional investment management with daily returns you can count on.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Contact</Link></li>
                <li><Link href="/plans" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Investment Plans</Link></li>
                <li><Link href="/how-to-invest" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">How to Invest</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">FAQ</Link></li>
                <li><Link href="/support" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Help Center</Link></li>
                <li><Link href="/market" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Market Data</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms of Service</Link></li>
                <li><Link href="/risk-disclosure" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Risk Disclosure</Link></li>
                <li><Link href="/aml-policy" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">AML Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-tesla-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Tesla Prime Capital. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Twitter</a>
              <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Telegram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
