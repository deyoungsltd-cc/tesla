import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'How to Invest | Tesla Prime Capital', description: 'Step-by-step guide on how to start investing with Tesla Prime Capital.' };

export default function HowToInvestPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">How to <span className="text-[#CC0000]">Invest</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto">A complete guide to getting started with Tesla Prime Capital and maximizing your investment returns.</p>
      </div>

      {/* Steps */}
      <div className="space-y-12">
        {[
          {
            step: '1',
            title: 'Create & Verify Your Account',
            desc: 'Begin by clicking the "Get Started" button on our homepage. You will need to provide your first name, last name, email address, and create a secure password with at least 8 characters. After submitting the registration form, a 6-digit verification code will be sent to your email address. Enter this code on the verification screen to activate your account. The entire registration and verification process typically takes under 2 minutes.',
            tips: ['Use a strong, unique password that you do not use on other platforms', 'Make sure your email address is correct — this is where your verification code will be sent', 'If you have a referral code from a friend, enter it during registration to earn bonus rewards'],
          },
          {
            step: '2',
            title: 'Complete KYC Verification (Recommended)',
            desc: 'While basic investing is available without KYC, completing the verification process unlocks significantly higher deposit limits and faster withdrawal processing. Navigate to the KYC section in your dashboard and upload a clear photo of your government-issued ID (passport, driver\'s license, or national ID) and a recent utility bill or bank statement showing your name and address. Verification is typically completed within 24 hours.',
            tips: ['Ensure all documents are clearly visible and not expired', 'Accepted proofs of address include utility bills, bank statements, or tax documents dated within the last 3 months', 'KYC verification is a one-time process and unlocks your full account capabilities'],
          },
          {
            step: '3',
            title: 'Fund Your Account',
            desc: 'Go to the Deposit section in your dashboard to add funds to your account. We accept cryptocurrency (Bitcoin, Ethereum, USDT, and other major tokens) and gift cards from major retailers including Amazon, Apple, Google Play, and Steam. For cryptocurrency, simply copy the provided wallet address and transfer from your personal wallet. For gift cards, enter the card details and our system will verify and credit the value to your account. Crypto deposits are confirmed within minutes after blockchain confirmations.',
            tips: ['Double-check the wallet address before sending cryptocurrency — transactions on the blockchain cannot be reversed', 'Start with the minimum amount for your chosen plan to familiarize yourself with the platform', 'Gift card values are credited at market rate with minimal processing fees'],
          },
          {
            step: '4',
            title: 'Select Your Investment Plan',
            desc: 'Navigate to the Investments section to browse available plans. Our four tiers — Basic ($200-$4,999, 0.5% daily), Silver ($5,000-$9,999, 0.8% daily), Gold ($10,000-$49,999, 1.2% daily), and Platinum ($50,000-$100,000, 1.8% daily) — cater to different investment goals and risk appetites. Each plan has a specific duration ranging from 7 to 30 days. Select the plan that aligns with your investment capital and return expectations, then confirm the investment.',
            tips: ['Higher-tier plans offer better daily return rates and additional premium perks', 'Your principal is returned in full at the end of the plan duration', 'You can have multiple active investments across different plans simultaneously'],
          },
          {
            step: '5',
            title: 'Track Your Returns & Withdraw',
            desc: 'Once your investment is active, daily returns are automatically credited to your account balance. You can monitor your total balance, available funds, locked funds (active investments), and accumulated profits in real-time from your dashboard. When you want to withdraw, go to the Withdraw section, enter the amount (up to your available balance), provide your receiving wallet address, and confirm. Verified accounts enjoy withdrawal processing within minutes.',
            tips: ['Profits are credited daily and can be withdrawn or reinvested at any time', 'Reinvesting your daily profits maximizes compound growth over time', 'Gold and Platinum plan investors enjoy zero withdrawal fees'],
          },
        ].map((item) => (
          <div key={item.step} className="relative bg-tesla-card border border-tesla-border rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="shrink-0 w-12 h-12 bg-[#CC0000] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-lg sm:text-xl mb-3">{item.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                <div className="bg-[#1a1a1a] border border-tesla-border rounded-xl p-4">
                  <p className="text-[#CC0000] text-xs font-bold uppercase tracking-wider mb-2">Pro Tips</p>
                  <ul className="space-y-1.5">
                    {item.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-500 text-xs leading-relaxed">
                        <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Referral Bonus Section */}
      <div className="mt-16 bg-gradient-to-br from-[#CC0000]/10 via-tesla-card to-tesla-card border border-[#CC0000]/20 rounded-2xl p-8">
        <h2 className="text-white font-bold text-lg mb-3">Boost Your Earnings with Referrals</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">After setting up your investment, share your unique referral link with friends and family. When they register and deposit, you earn up to 10% commission on their first deposit. There is no limit to the number of people you can refer.</p>
        <Link href="/plans" className="inline-block bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">View Investment Plans</Link>
      </div>
    </div>
  );
}
