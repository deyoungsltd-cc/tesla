const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin@123', 12);

  // Admin 1 - teslaprimesupportt@gmail.com
  const admin = await prisma.user.upsert({
    where: { email: 'teslaprimesupportt@gmail.com' },
    update: {
      passwordHash: hash,
      status: 'active',
      emailVerified: true,
      activeMode: 'live',
      kycLevel: 'LEVEL_3',
    },
    create: {
      email: 'teslaprimesupportt@gmail.com',
      passwordHash: hash,
      status: 'active',
      emailVerified: true,
      referralCode: 'ADMIN001',
      activeMode: 'live',
      kycLevel: 'LEVEL_3',
      profile: { create: { firstName: 'Admin', lastName: 'User' } },
    },
  });
  await prisma.admin.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, role: 'SUPER_ADMIN', isSuperAdmin: true },
  });
  await prisma.wallet.upsert({
    where: { userId_type: { userId: admin.id, type: 'demo' } },
    update: {},
    create: { userId: admin.id, type: 'demo', balance: 0, availableBalance: 0, lockedBalance: 0 },
  });
  await prisma.wallet.upsert({
    where: { userId_type: { userId: admin.id, type: 'live' } },
    update: {},
    create: { userId: admin.id, type: 'live', balance: 0, availableBalance: 0, lockedBalance: 0 },
  });

  // Admin 2 - deyoungsltd@gmail.com (shared with TeslaEquity)
  const deyoungHash = await bcrypt.hash('Admin@123', 12);
  const deyoung = await prisma.user.upsert({
    where: { email: 'deyoungsltd@gmail.com' },
    update: {
      passwordHash: deyoungHash,
      status: 'active',
      emailVerified: true,
      activeMode: 'live',
      kycLevel: 'LEVEL_3',
    },
    create: {
      email: 'deyoungsltd@gmail.com',
      passwordHash: deyoungHash,
      status: 'active',
      emailVerified: true,
      referralCode: 'EQADMIN01',
      activeMode: 'live',
      kycLevel: 'LEVEL_3',
      profile: { create: { firstName: 'DeYoung', lastName: 'Admin' } },
    },
  });
  await prisma.admin.upsert({
    where: { userId: deyoung.id },
    update: {},
    create: { userId: deyoung.id, role: 'SUPER_ADMIN', isSuperAdmin: true },
  });
  await prisma.wallet.upsert({
    where: { userId_type: { userId: deyoung.id, type: 'demo' } },
    update: {},
    create: { userId: deyoung.id, type: 'demo', balance: 0, availableBalance: 0, lockedBalance: 0 },
  });
  await prisma.wallet.upsert({
    where: { userId_type: { userId: deyoung.id, type: 'live' } },
    update: {},
    create: { userId: deyoung.id, type: 'live', balance: 0, availableBalance: 0, lockedBalance: 0 },
  });

  // Create site_settings row if not exists
  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  });

  // Investment Plans
  const plans = [
    { name: 'Basic Plan', slug: 'basic', tierName: 'Basic', minAmount: 200, maxAmount: 4999, dailyReturnRate: 0.5, duration: 30, durationUnit: 'days', sortOrder: 0, isActive: true, features: '["Daily profit accrual","Capital return included","24/7 support access"]' },
    { name: 'Silver Plan', slug: 'silver', tierName: 'Silver', minAmount: 5000, maxAmount: 9999, dailyReturnRate: 0.8, duration: 21, durationUnit: 'days', sortOrder: 1, isActive: true, features: '["Higher daily returns","Priority withdrawals","Dedicated account manager"]' },
    { name: 'Gold Plan', slug: 'gold', tierName: 'Gold', minAmount: 10000, maxAmount: 49999, dailyReturnRate: 1.2, duration: 14, durationUnit: 'days', sortOrder: 2, isActive: true, features: '["Premium daily rates","Instant profit withdrawal","Portfolio insurance"]' },
    { name: 'Platinum Plan', slug: 'platinum', tierName: 'Platinum', minAmount: 50000, maxAmount: 100000, dailyReturnRate: 1.8, duration: 7, durationUnit: 'days', sortOrder: 3, isActive: true, features: '["Maximum daily returns","Zero-fee withdrawals","VIP concierge service"]' },
  ];

  for (const plan of plans) {
    await prisma.investmentPlan.upsert({
      where: { slug: plan.slug },
      update: { ...plan, isActive: true },
      create: plan,
    });
  }
  console.log('Investment plans seeded: 4 active');

  // Seed default payment addresses
  const existingAddresses = await prisma.paymentAddress.count();
  if (existingAddresses === 0) {
    await prisma.paymentAddress.createMany({
      data: [
        { label: 'Main Bitcoin Wallet', currency: 'BTC', network: 'Bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', isActive: true, sortOrder: 0 },
        { label: 'Main Ethereum Wallet', currency: 'ETH', network: 'ERC-20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', isActive: true, sortOrder: 1 },
        { label: 'USDT (TRC-20)', currency: 'USDT', network: 'TRC-20', address: 'TN2Y13RDMBCAZQQVYRDMBCAZQQVY4RZHXTM5E5RSTBBBR', isActive: true, sortOrder: 2 },
        { label: 'USDT (ERC-20)', currency: 'USDT', network: 'ERC-20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', isActive: true, sortOrder: 3 },
      ],
      skipDuplicates: true,
    });
    console.log('Default payment addresses seeded.');
  }

  // Tesla Vehicles
  const vehicles = [
    { name: 'Model S', slug: 'model-s', category: 'Sedan', basePrice: 89990, imageUrl: '/images/model-s.jpg', description: 'The Model S sets the benchmark for luxury electric sedans with unparalleled range, acceleration, and technology.', specs: { range: 405, acceleration: '1.99s', topSpeed: '200 mph', horsepower: 670, cargo: '28 cu ft', drivetrain: 'Dual Motor AWD' }, colors: ['pearl_white', 'solid_black', 'midnight_silver', 'deep_blue', 'red_multi_coat', 'ultra_red', 'quick_silver'], interior: 'Premium Black', estimatedDelivery: 'Q3 2025', featured: true, sortOrder: 0, active: true },
    { name: 'Model 3', slug: 'model-3', category: 'Sedan', basePrice: 38990, imageUrl: '/images/model-3.jpg', description: 'The Model 3 is the most affordable Tesla, designed for mass-market appeal with impressive range and technology.', specs: { range: 358, acceleration: '5.8s', topSpeed: '140 mph', horsepower: 283, cargo: '23 cu ft', drivetrain: 'Rear-Wheel Drive' }, colors: ['pearl_white', 'solid_black', 'midnight_silver', 'deep_blue', 'red_multi_coat', 'quick_silver'], interior: 'Premium Black', estimatedDelivery: 'Q2 2025', featured: false, sortOrder: 1, active: true },
    { name: 'Model X', slug: 'model-x', category: 'SUV', basePrice: 94990, imageUrl: '/images/model-x.jpg', description: 'The Model X is Tesla\'s flagship SUV with falcon-wing doors, exceptional cargo space, and unmatched performance.', specs: { range: 348, acceleration: '3.8s', topSpeed: '155 mph', horsepower: 670, cargo: '91 cu ft', drivetrain: 'Dual Motor AWD' }, colors: ['pearl_white', 'solid_black', 'midnight_silver', 'deep_blue', 'red_multi_coat', 'ultra_red'], interior: 'Premium Black', estimatedDelivery: 'Q4 2025', featured: true, sortOrder: 2, active: true },
    { name: 'Model Y', slug: 'model-y', category: 'SUV', basePrice: 44990, imageUrl: '/images/model-y.jpg', description: 'The Model Y is a compact SUV built on the Model 3 platform, offering versatility, space, and Tesla performance.', specs: { range: 310, acceleration: '4.8s', topSpeed: '135 mph', horsepower: 384, cargo: '76 cu ft', drivetrain: 'Dual Motor AWD' }, colors: ['pearl_white', 'solid_black', 'midnight_silver', 'deep_blue', 'red_multi_coat', 'quick_silver'], interior: 'Premium Black', estimatedDelivery: 'Q2 2025', featured: false, sortOrder: 3, active: true },
    { name: 'Cybertruck', slug: 'cybertruck', category: 'Pickup', basePrice: 79990, imageUrl: '/images/cybertruck.jpg', description: 'The Cybertruck is an all-electric pickup with a radical stainless-steel exoskeleton and exceptional utility.', specs: { range: 340, acceleration: '2.6s', topSpeed: '130 mph', horsepower: 845, cargo: '100 cu ft', drivetrain: 'Tri Motor AWD' }, colors: ['solid_black'], interior: 'Premium Black', estimatedDelivery: 'Q1 2026', featured: true, sortOrder: 4, active: true },
    { name: 'Model S Plaid', slug: 'model-s-plaid', category: 'Sedan', basePrice: 109990, imageUrl: '/images/model-s.jpg', description: 'The Model S Plaid is the ultimate performance sedan with tri-motor power, track-level capability, and the fastest acceleration of any production car.', specs: { range: 396, acceleration: '1.99s', topSpeed: '200 mph', horsepower: 1020, cargo: '28 cu ft', drivetrain: 'Tri Motor AWD' }, colors: ['pearl_white', 'solid_black', 'midnight_silver', 'deep_blue', 'red_multi_coat', 'ultra_red', 'quick_silver', 'blue_multi_coat'], interior: 'Premium Black', estimatedDelivery: 'Q3 2025', featured: true, sortOrder: 5, active: true },
  ];

  for (const v of vehicles) {
    await prisma.teslaVehicle.upsert({
      where: { slug: v.slug },
      update: v,
      create: v,
    });
  }
  console.log('Tesla Vehicles seeded: 6 vehicles');

  console.log('Database seeded successfully!');
  console.log('Admin: teslaprimesupportt@gmail.com / Admin@123');
  console.log('Admin: deyoungsltd@gmail.com / Admin@123');
}

main()
  .then(() => {
    console.log('[seed] Done.');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('[seed] Error:', e.message);
    return prisma.$disconnect();
  })
  .finally(() => process.exit(0));
