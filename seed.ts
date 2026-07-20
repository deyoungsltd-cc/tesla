import { PrismaClient } from '@prisma/client';
import { hashPassword, generateReferralCode } from './src/lib/auth';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding TeslaPrimeCapital database...');

  // Create Super Admin
  const adminPassword = await hashPassword('Admin@123');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@teslaprimecapital.com' },
    update: {},
    create: {
      email: 'admin@teslaprimecapital.com',
      passwordHash: adminPassword,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: 'active',
      kycLevel: 'LEVEL_3',
      referralCode: generateReferralCode(),
      twoFactorEnabled: false,
    },
  });

  await prisma.admin.upsert({
    where: { userId: superAdmin.id },
    update: {},
    create: {
      userId: superAdmin.id,
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
    },
  });

  await prisma.profile.upsert({
    where: { userId: superAdmin.id },
    update: {},
    create: {
      userId: superAdmin.id,
      firstName: 'Super',
      lastName: 'Admin',
      country: 'US',
    },
  });

  // Create demo user wallets
  const wallets = await prisma.wallet.findMany({ where: { userId: superAdmin.id } });
  if (wallets.length === 0) {
    await prisma.wallet.createMany({
      data: [
        { userId: superAdmin.id, type: 'demo', balance: 10000, availableBalance: 10000, lockedBalance: 0 },
        { userId: superAdmin.id, type: 'live', balance: 0, availableBalance: 0, lockedBalance: 0 },
      ],
    });
  }

  // Create Investment Plans
  const plans = [
    {
      name: 'Basic Plan',
      slug: 'basic',
      tierName: 'Basic',
      minAmount: 200,
      maxAmount: 4999,
      dailyReturnRate: 0.5,
      duration: 30,
      durationUnit: 'days' as const,
      description: 'Perfect for beginners. Start your investment journey with modest returns.',
      features: JSON.stringify(['Daily returns', '24/7 support', 'Basic dashboard access']),
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Silver Plan',
      slug: 'silver',
      tierName: 'Silver',
      minAmount: 5000,
      maxAmount: 9999,
      dailyReturnRate: 0.8,
      duration: 21,
      durationUnit: 'days' as const,
      description: 'Enhanced returns for committed investors looking to grow their portfolio.',
      features: JSON.stringify(['Higher daily returns', 'Priority support', 'Advanced analytics', 'Referral bonuses']),
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Gold Plan',
      slug: 'gold',
      tierName: 'Gold',
      minAmount: 10000,
      maxAmount: 49999,
      dailyReturnRate: 1.2,
      duration: 14,
      durationUnit: 'days' as const,
      description: 'Premium investment tier with significant returns and exclusive benefits.',
      features: JSON.stringify(['Premium daily returns', 'Dedicated account manager', 'VIP support', 'Higher withdrawal limits', 'Binary bonus eligibility']),
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Platinum Plan',
      slug: 'platinum',
      tierName: 'Platinum',
      minAmount: 50000,
      maxAmount: 100000,
      dailyReturnRate: 1.8,
      duration: 7,
      durationUnit: 'days' as const,
      description: 'Elite investment tier with maximum returns and premium features.',
      features: JSON.stringify(['Maximum daily returns', 'Personal advisor', 'Instant withdrawals', 'Exclusive bonuses', 'Binary bonus 3x multiplier', 'Custom investment options']),
      sortOrder: 4,
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.investmentPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('📧 Admin: admin@teslaprimecapital.com / Admin@123');
  console.log('📊 4 investment plans created');
  console.log('💰 Demo wallet: $10,000');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());