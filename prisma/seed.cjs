const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin@123', 12);

  // Admin 1
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tesla.com' },
    update: {},
    create: {
      email: 'admin@tesla.com',
      passwordHash: hash,
      status: 'active',
      emailVerified: true,
      referralCode: 'ADMIN001',
      activeMode: 'live',
    },
  });
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, firstName: 'Admin', lastName: 'User' },
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

  // Admin 2 - deyoungsltd@gmail.com
  const deyoung = await prisma.user.upsert({
    where: { email: 'deyoungsltd@gmail.com' },
    update: {},
    create: {
      email: 'deyoungsltd@gmail.com',
      passwordHash: hash,
      status: 'active',
      emailVerified: true,
      referralCode: 'DYADMIN01',
      activeMode: 'live',
    },
  });
  await prisma.profile.upsert({
    where: { userId: deyoung.id },
    update: {},
    create: { userId: deyoung.id, firstName: 'DeYoung', lastName: 'Admin' },
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

  // Demo user
  const demoHash = await bcrypt.hash('Demo@123', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@tesla.com' },
    update: {},
    create: {
      email: 'demo@tesla.com',
      passwordHash: demoHash,
      status: 'active',
      emailVerified: true,
      referralCode: 'DEMO2025',
      activeMode: 'demo',
    },
  });
  await prisma.profile.upsert({
    where: { userId: demo.id },
    update: {},
    create: { userId: demo.id, firstName: 'John', lastName: 'Doe' },
  });
  await prisma.wallet.upsert({
    where: { userId_type: { userId: demo.id, type: 'demo' } },
    update: { balance: 150000, availableBalance: 150000 },
    create: { userId: demo.id, type: 'demo', balance: 150000, availableBalance: 150000 },
  });
  await prisma.wallet.upsert({
    where: { userId_type: { userId: demo.id, type: 'live' } },
    update: {},
    create: { userId: demo.id, type: 'live', balance: 0, availableBalance: 0, lockedBalance: 0 },
  });

  // Create site_settings row if not exists
  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  });

  console.log('Database seeded successfully!');
  console.log('Admin: admin@tesla.com / Admin@123');
  console.log('Admin: deyoungsltd@gmail.com / Admin@123');
  console.log('Demo:  demo@tesla.com / Demo@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
