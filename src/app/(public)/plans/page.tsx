import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Investment Plans | Tesla Prime Capital', description: 'Explore Tesla Prime Capital investment plans with daily returns up to 1.8%.' };

const plans = [
  {
    name: 'Basic',
    badge: 'STARTER',
    badgeColor: 'bg-gray-600',
    min: 200,
    max: 4999,
    daily: 0.5,
    duration: 30,
    model: 'Model 3',
    image: 'https://cdn.motor1.com/images/mgl/3r5Xj/s1/tesla-model-3.jpg',
    color: 'border-gray-600',
    features: [
      { title: 'Daily Returns', desc: 'Earn 0.5% daily on your invested capital, credited automatically every 24 hours to your account balance.' },
      { title: 'Capital Protection', desc: 'Your full principal investment is returned at the end of the 30-day plan duration, guaranteed by our capital reserve fund.' },
      { title: '24/7 Support Access', desc: 'Get help anytime through our live chat support system, email support, and comprehensive help center documentation.' },
      { title: 'Real-Time Dashboard', desc: 'Monitor your investment performance, profits, and balance in real-time through our intuitive dashboard interface.' },
    ],
    withdrawal: 'Standard processing (1-24 hours)',
    fees: 'Small processing fee applies',
  },
  {
    name: 'Silver',
    badge: 'POPULAR',
    badgeColor: 'bg-[#CC0000]',
    min: 5000,
    max: 9999,
    daily: 0.8,
    duration: 21,
    model: 'Model Y',
    image: 'https://cdn.motor1.com/images/mgl/8N3Eo/s1/tesla-model-y.jpg',
    color: 'border-[#CC0000]',
    features: [
      { title: 'Higher Daily Returns', desc: 'Earn 0.8% daily returns — 60% more than the Basic plan — with profits credited to your available balance every day.' },
      { title: 'Priority Withdrawals', desc: 'Your withdrawal requests are processed ahead of standard queue, significantly reducing processing time for your funds.' },
      { title: 'Dedicated Account Manager', desc: 'A personal account manager is assigned to assist you with any questions, investment decisions, or platform navigation.' },
      { title: 'Reduced Fees', desc: 'Enjoy lower withdrawal processing fees compared to the Basic plan, keeping more of your earnings in your pocket.' },
    ],
    withdrawal: 'Priority processing (1-6 hours)',
    fees: 'Reduced processing fees',
  },
  {
    name: 'Gold',
    badge: 'PREMIUM',
    badgeColor: 'bg-amber-600',
    min: 10000,
    max: 49999,
    daily: 1.2,
    duration: 14,
    model: 'Model S',
    image: 'https://cdn.motor1.com/images/mgl/MY1YN/s1/tesla-model-s.jpg',
    color: 'border-amber-600',
    features: [
      { title: 'Premium Daily Rates', desc: 'Earn 1.2% daily returns — among the highest rates in the industry — credited automatically to your account every 24 hours.' },
      { title: 'Instant Profit Withdrawal', desc: 'Withdraw your accumulated profits at any time with zero delay. Available profits are instantly accessible for withdrawal.' },
      { title: 'Portfolio Insurance', desc: 'Your entire investment portfolio is covered by our insurance protection program, providing an extra layer of financial security.' },
      { title: 'Zero Withdrawal Fees', desc: 'All withdrawals are completely fee-free. Every dollar you withdraw goes directly to your designated wallet or payment method.' },
    ],
    withdrawal: 'Express processing (Under 1 hour)',
    fees: 'No withdrawal fees',
  },
  {
    name: 'Platinum',
    badge: 'ELITE',
    badgeColor: 'bg-purple-600',
    min: 50000,
    max: 100000,
    daily: 1.8,
    duration: 7,
    model: 'Model X',
    image: 'https://cdn.motor1.com/images/mgl/Q0KNR/s1/tesla-model-x.jpg',
    color: 'border-purple-600',
    features: [
      { title: 'Maximum Daily Returns', desc: 'Earn 1.8% daily — the highest return rate available — allowing significant wealth accumulation over the 7-day plan duration.' },
      { title: 'Zero-Fee Everything', desc: 'No withdrawal fees, no deposit fees, no transaction fees. Every cent of your investment and returns belongs entirely to you.' },
      { title: 'VIP Concierge Service', desc: 'Round-the-clock access to a dedicated VIP concierge team for personalized investment advice, priority support, and special requests.' },
      { title: 'Exclusive Opportunities', desc: 'Access to exclusive investment opportunities, early access to new plans, and invitations to private investor events and webinars.' },
    ],
    withdrawal: 'Instant processing (Under 30 minutes)',
    fees: 'No fees whatsoever',
  },
];

function calcReturn(daily: number, min: number, duration: number) {
  const total = min * daily / 100 * duration;
  const net = min + total;
  return { total: total.toFixed(2), net: net.toFixed(2) };
}

export default function PlansPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Investment <span className="text-[#CC0000]">Plans</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto">Choose the plan that fits your investment goals. Every plan guarantees principal return and offers daily profit accrual.</p>
      </div>

      {/* Comparison Table */}
      <div className="mb-16 overflow-x-auto">
        <table className="dark-table min-w-[640px]">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Basic</th>
              <th className="!text-[#CC0000]">Silver ★</th>
              <th>Gold</th>
              <th>Platinum</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Minimum Investment</td><td>$200</td><td>$5,000</td><td>$10,000</td><td>$50,000</td></tr>
            <tr><td>Maximum Investment</td><td>$4,999</td><td>$9,999</td><td>$49,999</td><td>$100,000</td></tr>
            <tr><td>Daily Return</td><td>0.5%</td><td>0.8%</td><td>1.2%</td><td>1.8%</td></tr>
            <tr><td>Duration</td><td>30 Days</td><td>21 Days</td><td>14 Days</td><td>7 Days</td></tr>
            <tr><td>Withdrawal Speed</td><td>1-24 hrs</td><td>1-6 hrs</td><td>Under 1 hr</td><td>Under 30 min</td></tr>
            <tr><td>Withdrawal Fees</td><td>Standard</td><td>Reduced</td><td>Free</td><td>Free</td></tr>
            <tr><td>Account Manager</td><td>—</td><td>✓</td><td>✓</td><td>✓ VIP</td></tr>
          </tbody>
        </table>
      </div>

      {/* Plan Details */}
      <div className="space-y-12">
        {plans.map((plan) => {
          const returns = calcReturn(plan.daily, plan.min, plan.duration);
          return (
            <div key={plan.name} className={`bg-tesla-card border-2 ${plan.color} rounded-2xl overflow-hidden`}>
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="relative h-48 md:h-auto overflow-hidden">
                  <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-tesla-card via-tesla-card/50 to-transparent" />
                  <span className={`absolute top-3 left-3 ${plan.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>{plan.badge}</span>
                </div>
                <div className="md:col-span-2 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-white font-bold text-xl">{plan.name} Plan</h2>
                    <span className="text-gray-500 text-sm">&middot; {plan.model}</span>
                    <span className="text-[#CC0000] text-2xl font-bold">{plan.daily}% daily</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <span className="text-gray-400">Min: <span className="text-white font-medium">${plan.min.toLocaleString()}</span></span>
                    <span className="text-gray-400">Max: <span className="text-white font-medium">${plan.max.toLocaleString()}</span></span>
                    <span className="text-gray-400">Duration: <span className="text-white font-medium">{plan.duration} days</span></span>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-2">
                      <p className="text-gray-500 text-[10px] uppercase">Est. Profit (Min)</p>
                      <p className="text-green-400 font-bold">${returns.total}</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-2">
                      <p className="text-gray-500 text-[10px] uppercase">Total Return (Min)</p>
                      <p className="text-white font-bold">${returns.net}</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-tesla-border rounded-lg px-4 py-2">
                      <p className="text-gray-500 text-[10px] uppercase">Withdrawal</p>
                      <p className="text-white font-medium text-sm">{plan.withdrawal}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {plan.features.map((f) => (
                      <div key={f.title} className="flex items-start gap-2">
                        <svg className="shrink-0 mt-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CC0000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <div>
                          <p className="text-white text-xs font-semibold">{f.title}</p>
                          <p className="text-gray-500 text-[11px] leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/register" className={`inline-block ${plan.badgeColor} text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors hover:opacity-90`}>
                    Invest in {plan.name}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Important Notice */}
      <div className="mt-12 bg-tesla-card border border-tesla-border rounded-2xl p-6">
        <h3 className="text-white font-bold mb-2">Important Information</h3>
        <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
          <li className="flex items-start gap-2"><span className="text-[#CC0000] shrink-0">&bull;</span> All plans guarantee full principal return at the end of the investment duration.</li>
          <li className="flex items-start gap-2"><span className="text-[#CC0000] shrink-0">&bull;</span> Daily returns are automatically credited to your available balance every 24 hours.</li>
          <li className="flex items-start gap-2"><span className="text-[#CC0000] shrink-0">&bull;</span> You may hold multiple active investments across different plans simultaneously.</li>
          <li className="flex items-start gap-2"><span className="text-[#CC0000] shrink-0">&bull;</span> Past performance does not guarantee future results. Please read our <Link href="/risk-disclosure" className="text-[#CC0000] hover:underline">Risk Disclosure</Link> before investing.</li>
        </ul>
      </div>
    </div>
  );
}
