// Investment Payout Cron Job API Route
// Trigger via Railway Cron: POST https://your-domain.com/api/cron/payouts
// Security: Protect with CRON_SECRET header in production

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function processDailyPayouts() {
  console.log(`[${new Date().toISOString()}] Starting daily payout processing...`);

  const activeInvestments = await prisma.userInvestment.findMany({
    where: { status: 'active' },
    include: { plan: true, wallet: true, user: true },
  });

  console.log(`Found ${activeInvestments.length} active investments`);

  let processed = 0;
  let failed = 0;

  for (const inv of activeInvestments) {
    try {
      const dailyReturn = inv.amount * (inv.plan.dailyReturnRate / 100);

      await prisma.userInvestment.update({
        where: { id: inv.id },
        data: {
          dailyReturn,
          totalReturn: inv.totalReturn + dailyReturn,
          lastPayoutAt: new Date(),
          payoutStatus: 'processed',
        },
      });

      await prisma.wallet.update({
        where: { id: inv.walletId },
        data: { balance: { increment: dailyReturn }, availableBalance: { increment: dailyReturn } },
      });

      await prisma.transaction.create({
        data: {
          walletId: inv.walletId,
          type: 'investment_return',
          status: 'completed',
          amount: dailyReturn,
          description: `Daily return from ${inv.plan.name} plan`,
        },
      });

      // Check maturity
      if (inv.endDate && new Date() >= inv.endDate) {
        await prisma.wallet.update({
          where: { id: inv.walletId },
          data: { balance: { increment: inv.amount }, availableBalance: { increment: inv.amount } },
        });
        await prisma.userInvestment.update({ where: { id: inv.id }, data: { status: 'completed' } });
        await prisma.transaction.create({
          data: { walletId: inv.walletId, type: 'investment_return', status: 'completed', amount: inv.amount, description: `Principal return - ${inv.plan.name}` },
        });
      }

      processed++;
    } catch {
      failed++;
    }
  }

  return { processed, failed, total: activeInvestments.length };
}

export async function POST(request: NextRequest) {
  // Cron secret verification
  const secret = request.headers.get('x-cron-secret');
  if (secret && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processDailyPayouts();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
