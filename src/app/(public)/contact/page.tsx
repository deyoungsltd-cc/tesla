import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact Us | Tesla Prime Capital', description: 'Get in touch with Tesla Prime Capital support team.' };

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Contact <span className="text-[#CC0000]">Us</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto">Our dedicated support team is available around the clock to assist you with any questions, concerns, or feedback.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {[
          { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, title: 'Email Support', detail: 'support@teslaprimecapital.com', sub: 'Response within 2 hours' },
          { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: 'Live Chat', detail: 'Available on platform', sub: '24/7 instant response' },
          { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Business Hours', detail: '24/7/365', sub: 'Always available' },
        ].map((item) => (
          <div key={item.title} className="bg-tesla-card border border-tesla-border rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              {item.icon}
            </div>
            <h3 className="text-white font-bold mb-1">{item.title}</h3>
            <p className="text-white text-sm font-medium">{item.detail}</p>
            <p className="text-gray-500 text-xs mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6 sm:p-8 mb-14">
        <h2 className="text-white font-bold text-xl mb-2">Send Us a Message</h2>
        <p className="text-gray-400 text-sm mb-6">Fill out the form below and our team will get back to you as soon as possible.</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Full Name</label>
              <input type="text" placeholder="John Doe" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Email Address</label>
              <input type="email" placeholder="you@example.com" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Account Email (if different)</label>
            <input type="email" placeholder="Optional" className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Subject</label>
            <select className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-gray-400 focus:outline-none focus:border-[#CC0000] transition-colors">
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
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Message</label>
            <textarea rows={5} placeholder="Describe your issue or question in detail..." className="w-full bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#CC0000] transition-colors resize-none" />
          </div>
          <button className="bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
            Send Message
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-tesla-card border border-tesla-border rounded-2xl p-6 sm:p-8">
        <h2 className="text-white font-bold text-xl mb-4">Quick Answers</h2>
        <div className="space-y-4">
          {[
            { q: 'How long does support take to respond?', a: 'Our live chat provides instant responses 24/7. Email inquiries are typically answered within 1-2 hours during business hours, and within 4 hours during off-peak times.' },
            { q: 'I have a deposit that hasn\'t been credited.', a: 'For cryptocurrency deposits, check the blockchain transaction status first. If confirmed but not credited, contact support with your transaction hash. Gift card deposits may take 1-3 hours for verification.' },
            { q: 'My withdrawal is pending.', a: 'Standard withdrawals are processed within 1-24 hours. If your withdrawal exceeds the expected processing time, contact support with your withdrawal details for immediate assistance.' },
          ].map((item) => (
            <div key={item.q} className="bg-[#1a1a1a] border border-tesla-border rounded-xl p-4">
              <p className="text-white text-sm font-medium mb-1">{item.q}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
