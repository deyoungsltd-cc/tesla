import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'About Us | Tesla Prime Capital', description: 'Learn about Tesla Prime Capital — our mission, team, and commitment to investor success.' };

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero with Elon Musk */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0505] via-[#2a0a0a] to-tesla-card border border-[#CC0000]/15 mb-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CC0000] rounded-full blur-[120px]" />
        </div>
        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#CC0000]/30 shrink-0 bg-tesla-card">
              <Image src="https://teslapremiumfinance.com/wp-content/uploads/2024/04/1.jpeg" alt="Tesla CEO" width={130} height={130} className="w-full h-full object-cover" unoptimized />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">About <span className="text-[#CC0000]">Tesla Prime Capital</span></h1>
              <p className="text-gray-400 leading-relaxed max-w-lg">Pioneering the future of investment management through technology, transparency, and sustainable wealth creation for investors worldwide.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
        <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
          <p>Tesla Prime Capital was founded with a bold vision: to democratize access to institutional-grade investment strategies that were previously available only to ultra-high-net-worth individuals and large financial institutions. Our founders recognized that millions of aspiring investors around the world were being excluded from the most lucrative investment opportunities due to high entry barriers, complex requirements, and opaque fee structures that favored intermediaries over investors.</p>
          <p>Since our inception, we have grown from a small team of passionate financial technologists into a global platform serving over 45,000 active investors across 180+ countries. We have processed more than $2.4 billion in assets under management and have consistently delivered daily returns that exceed industry benchmarks. Our success is built on a foundation of cutting-edge algorithmic trading systems, diversified investment strategies, and an unwavering commitment to transparency and investor protection.</p>
          <p>Today, Tesla Prime Capital stands at the intersection of technology and finance, leveraging artificial intelligence, machine learning, and blockchain technology to optimize investment outcomes while maintaining the highest standards of security and regulatory compliance. Our platform is designed to be intuitive enough for first-time investors while offering the depth and sophistication that experienced traders demand.</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mb-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6">
          <div className="w-12 h-12 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Our Mission</h3>
          <p className="text-gray-400 text-sm leading-relaxed">To provide accessible, transparent, and high-yielding investment opportunities that empower individuals worldwide to achieve their financial goals through professionally managed portfolios and cutting-edge technology.</p>
        </div>
        <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6">
          <div className="w-12 h-12 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Our Vision</h3>
          <p className="text-gray-400 text-sm leading-relaxed">To become the world&apos;s most trusted and innovative investment platform, where every individual — regardless of background or net worth — has the tools and support to build lasting wealth through intelligent, diversified investing.</p>
        </div>
      </section>

      {/* Core Values */}
      <section className="mb-14">
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
            <div key={v.title} className="bg-tesla-card border border-tesla-border rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{v.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Metrics */}
      <section className="mb-14">
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
            <div key={m.label} className="bg-tesla-card border border-tesla-border rounded-xl p-4 text-center">
              <p className="text-white text-xl font-bold">{m.value}</p>
              <p className="text-gray-500 text-xs mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-white mb-4">Our Technology</h2>
        <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
          <p>Tesla Prime Capital&apos;s investment engine is powered by a proprietary combination of artificial intelligence, machine learning, and quantitative analysis. Our algorithms continuously monitor global markets across multiple asset classes — equities, cryptocurrencies, commodities, and derivatives — identifying optimal entry and exit points with precision that exceeds human capabilities.</p>
          <p>Our technology stack includes high-frequency trading systems capable of executing thousands of transactions per second, risk management AI that dynamically adjusts portfolio allocations based on real-time market volatility, and natural language processing models that analyze news sentiment and social media trends to anticipate market movements before they happen.</p>
          <p>All of this is delivered through a modern, responsive web platform built with the latest web technologies, ensuring a seamless experience whether you are managing your investments from a desktop computer or checking your returns on your mobile phone during your commute.</p>
        </div>
      </section>
    </div>
  );
}
