import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import * as dotenv from 'dotenv';

dotenv.config({ override: true });
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const passwordHash = await hashPassword('Admin@123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tesla.com' },
    update: {},
    create: {
      email: 'admin@tesla.com',
      passwordHash,
      status: 'active',
      emailVerified: true,
      referralCode: 'ADMIN001',
      activeMode: 'live',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  });

  // Make admin
  await prisma.admin.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
    },
  });

  // Create second admin: deyoungsltd@gmail.com
  const deyoungPasswordHash = await hashPassword('Admin@123');
  const deyoung = await prisma.user.upsert({
    where: { email: 'deyoungsltd@gmail.com' },
    update: {},
    create: {
      email: 'deyoungsltd@gmail.com',
      passwordHash: deyoungPasswordHash,
      status: 'active',
      emailVerified: true,
      referralCode: 'DYADMIN01',
      activeMode: 'live',
      profile: {
        create: {
          firstName: 'DeYoung',
          lastName: 'Admin',
        },
      },
    },
  });

  await prisma.admin.upsert({
    where: { userId: deyoung.id },
    update: {},
    create: {
      userId: deyoung.id,
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
    },
  });

  // Create wallets for deyoung admin
  await prisma.wallet.upsert({
    where: { userId_type: { userId: deyoung.id, type: 'demo' } },
    update: {},
    create: { userId: deyoung.id, type: 'demo', balance: 0, availableBalance: 0 },
  });
  await prisma.wallet.upsert({
    where: { userId_type: { userId: deyoung.id, type: 'live' } },
    update: {},
    create: { userId: deyoung.id, type: 'live', balance: 0, availableBalance: 0 },
  });

  // Create demo user
  const demoPasswordHash = await hashPassword('Demo@123');
  const demo = await prisma.user.upsert({
    where: { email: 'demo@tesla.com' },
    update: {},
    create: {
      email: 'demo@tesla.com',
      passwordHash: demoPasswordHash,
      status: 'active',
      emailVerified: true,
      referralCode: 'DEMO2025',
      activeMode: 'demo',
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  });

  // Create wallets for demo user
  await prisma.wallet.upsert({
    where: { userId_type: { userId: demo.id, type: 'demo' } },
    update: { balance: 150000, availableBalance: 150000 },
    create: { userId: demo.id, type: 'demo', balance: 150000, availableBalance: 150000 },
  });

  await prisma.wallet.upsert({
    where: { userId_type: { userId: demo.id, type: 'live' } },
    update: {},
    create: { userId: demo.id, type: 'live', balance: 0, availableBalance: 0 },
  });

  // Create some investment plans
  const plans = [
    { name: 'Basic Plan', slug: 'basic', tierName: 'Basic', minAmount: 200, maxAmount: 4999, dailyReturnRate: 0.5, duration: 30, durationUnit: 'days' as const, sortOrder: 0, isActive: true, features: '["Daily profit accrual","Capital return included","24/7 support access"]' },
    { name: 'Silver Plan', slug: 'silver', tierName: 'Silver', minAmount: 5000, maxAmount: 9999, dailyReturnRate: 0.8, duration: 21, durationUnit: 'days' as const, sortOrder: 1, isActive: true, features: '["Higher daily returns","Priority withdrawals","Dedicated account manager"]' },
    { name: 'Gold Plan', slug: 'gold', tierName: 'Gold', minAmount: 10000, maxAmount: 49999, dailyReturnRate: 1.2, duration: 14, durationUnit: 'days' as const, sortOrder: 2, isActive: true, features: '["Premium daily rates","Instant profit withdrawal","Portfolio insurance"]' },
    { name: 'Platinum Plan', slug: 'platinum', tierName: 'Platinum', minAmount: 50000, maxAmount: 100000, dailyReturnRate: 1.8, duration: 7, durationUnit: 'days' as const, sortOrder: 3, isActive: true, features: '["Maximum daily returns","Zero-fee withdrawals","VIP concierge service"]' },
  ];

  for (const plan of plans) {
    await prisma.investmentPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }

  // Create a sample active investment for demo user
  const goldPlan = await prisma.investmentPlan.findUnique({ where: { slug: 'gold' } });
  const demoWallet = await prisma.wallet.findFirst({ where: { userId: demo.id, type: 'demo' } });

  if (goldPlan && demoWallet) {
    await prisma.userInvestment.upsert({
      where: { id: 'demo-invest-1' },
      update: {},
      create: {
        id: 'demo-invest-1',
        userId: demo.id,
        planId: goldPlan.id,
        walletId: demoWallet.id,
        amount: 100000,
        mode: 'demo',
        status: 'active',
        dailyReturn: 1200,
        totalReturn: 89500,
        expectedReturn: 168000,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        lastPayoutAt: new Date(),
        payoutStatus: 'processed',
      },
    });
  }

  // Create notifications for demo user
  const notifs = [
    { title: 'Investment Confirmed', message: 'Your Gold Plan investment of $100,000 has been confirmed and is now active. Daily returns will begin accruing immediately.', type: 'investment_activated' as const },
    { title: 'KYC Approved', message: 'Your identity verification has been approved. You now have full access to all platform features including withdrawals.', type: 'kyc_approved' as const },
    { title: 'Daily Profit Credited', message: 'Your daily profit of $1,200.00 has been credited to your account from the Gold Plan investment.', type: 'investment_return_credited' as const },
    { title: 'Welcome to Tesla', message: 'Thank you for joining Tesla. Complete your KYC verification to unlock all features and start earning daily returns.', type: 'system_announcement' as const },
  ];

  for (let i = 0; i < notifs.length; i++) {
    await prisma.notification.upsert({
      where: { id: `demo-notif-${i + 1}` },
      update: {},
      create: {
        id: `demo-notif-${i + 1}`,
        userId: demo.id,
        ...notifs[i],
        isRead: i >= 2,
      },
    });
  }

  console.log('Database seeded successfully!');
  console.log('Admin: admin@tesla.com / Admin@123');
  console.log('Admin: deyoungsltd@gmail.com / Admin@123');
  console.log('Demo:  demo@tesla.com / Demo@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());