import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import * as dotenv from 'dotenv';

dotenv.config({ override: true });
const prisma = new PrismaClient();

async function main() {
  // Create admin user (now teslaprimesupportt@gmail.com per project memory)
  const passwordHash = await hashPassword('Admin@123');

  const admin = await prisma.user.upsert({
    where: { email: 'teslaprimesupportt@gmail.com' },
    update: {
      passwordHash,
      status: 'active',
      emailVerified: true,
      activeMode: 'live',
      kycLevel: 'LEVEL_3',
    },
    create: {
      email: 'teslaprimesupportt@gmail.com',
      passwordHash,
      status: 'active',
      emailVerified: true,
      referralCode: 'ADMIN001',
      activeMode: 'live',
      kycLevel: 'LEVEL_3',
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

  // Create second admin: deyoungsltd@gmail.com (legacy admin, kept for backward compat)
  const deyoungPasswordHash = await hashPassword('Admin@123');
  const deyoung = await prisma.user.upsert({
    where: { email: 'deyoungsltd@gmail.com' },
    update: {
      passwordHash: deyoungPasswordHash,
      status: 'active',
      emailVerified: true,
      activeMode: 'live',
      kycLevel: 'LEVEL_3',
    },
    create: {
      email: 'deyoungsltd@gmail.com',
      passwordHash: deyoungPasswordHash,
      status: 'active',
      emailVerified: true,
      referralCode: 'DYADMIN01',
      activeMode: 'live',
      kycLevel: 'LEVEL_3',
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

  // Create wallets for main admin
  await prisma.wallet.upsert({
    where: { userId_type: { userId: admin.id, type: 'demo' } },
    update: {},
    create: { userId: admin.id, type: 'demo', balance: 0, availableBalance: 0 },
  });
  await prisma.wallet.upsert({
    where: { userId_type: { userId: admin.id, type: 'live' } },
    update: {},
    create: { userId: admin.id, type: 'live', balance: 0, availableBalance: 0 },
  });

  // Create investment plans only
  const plans = [
    { name: 'Basic Plan', slug: 'basic', tierName: 'Basic', minAmount: 200, maxAmount: 4999, dailyReturnRate: 0.5, duration: 30, durationUnit: 'days' as const, sortOrder: 0, isActive: true, features: '["Daily profit accrual","Capital return included","24/7 support access"]' },
    { name: 'Silver Plan', slug: 'silver', tierName: 'Silver', minAmount: 5000, maxAmount: 9999, dailyReturnRate: 0.8, duration: 21, durationUnit: 'days' as const, sortOrder: 1, isActive: true, features: '["Higher daily returns","Priority withdrawals","Dedicated account manager"]' },
    { name: 'Gold Plan', slug: 'gold', tierName: 'Gold', minAmount: 10000, maxAmount: 49999, dailyReturnRate: 1.2, duration: 14, durationUnit: 'days' as const, sortOrder: 2, isActive: true, features: '["Premium daily rates","Instant profit withdrawal","Portfolio insurance"]' },
    { name: 'Platinum Plan', slug: 'platinum', tierName: 'Platinum', minAmount: 50000, maxAmount: 100000, dailyReturnRate: 1.8, duration: 7, durationUnit: 'days' as const, sortOrder: 3, isActive: true, features: '["Maximum daily returns","Zero-fee withdrawals","VIP concierge service"]' },
  ];

  // CRITICAL FIX: update existing plans with isActive: true and current values
  // (previously `update: {}` left disabled plans disabled forever)
  for (const plan of plans) {
    await prisma.investmentPlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        tierName: plan.tierName,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
        dailyReturnRate: plan.dailyReturnRate,
        duration: plan.duration,
        durationUnit: plan.durationUnit,
        sortOrder: plan.sortOrder,
        isActive: true,            // <-- FIX: re-activate any previously disabled plans
        features: plan.features,
      },
      create: plan,
    });
  }

  console.log('Database seeded successfully!');
  console.log('Admin: teslaprimesupportt@gmail.com / Admin@123');
  console.log('Admin: deyoungsltd@gmail.com / Admin@123');
  console.log('Plans: 4 active (Basic, Silver, Gold, Platinum)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
