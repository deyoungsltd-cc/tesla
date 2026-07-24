// Investment Payout Cron Job API Route
// Trigger via Railway Cron: POST https://your-domain.com/api/cron/payouts
// Security: Protect with CRON_SECRET header in production

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function processDailyPayouts() {
  console.log(`[${new Date().toISOString()}] Starting daily payout processing...`);

  const activeInvestments = await db.userInvestment.findMany({
    where: { status: 'active' },
    include: { plan: true, wallet: true, user: true },
  });

  console.log(`Found ${activeInvestments.length} active investments`);

  let processed = 0;
  let failed = 0;

  for (const inv of activeInvestments) {
    try {
      const dailyReturn = inv.amount * (inv.plan.dailyReturnRate / 100);

      await db.userInvestment.update({
        where: { id: inv.id },
        data: {
          dailyReturn,
          totalReturn: inv.totalReturn + dailyReturn,
          lastPayoutAt: new Date(),
          payoutStatus: 'processed',
        },
      });

      await db.wallet.update({
        where: { id: inv.walletId },
        data: { balance: { increment: dailyReturn }, availableBalance: { increment: dailyReturn } },
      });

      await db.transaction.create({
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
        await db.wallet.update({
          where: { id: inv.walletId },
          data: { balance: { increment: inv.amount }, availableBalance: { increment: inv.amount } },
        });
        await db.userInvestment.update({ where: { id: inv.id }, data: { status: 'completed' } });
        await db.transaction.create({
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
  // Cron secret verification - MUST be present AND correct
  const secret = request.headers.get('x-cron-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processDailyPayouts();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Payout processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
