import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toNumber, formatMoney } from '@/lib/decimal';

let isProcessing = false;

async function processDailyPayouts() {
  console.log(`[${new Date().toISOString()}] Starting daily payout processing...`);

  const activeInvestments = await db.userInvestment.findMany({
    where: { status: 'active' },
    include: { plan: true, wallet: true },
  });

  console.log(`Found ${activeInvestments.length} active investments`);

  let processed = 0;
  let failed = 0;
  const today = new Date();

  for (const inv of activeInvestments) {
    try {
      // Idempotency: skip if already processed today
      if (inv.lastPayoutAt) {
        const lastPay = new Date(inv.lastPayoutAt);
        if (lastPay.getFullYear() === today.getFullYear() &&
            lastPay.getMonth() === today.getMonth() &&
            lastPay.getDate() === today.getDate()) {
          continue; // Already paid today
        }
      }

      const dailyReturn = Number((toNumber(inv.amount) * (toNumber(inv.plan.dailyReturnRate) / 100)).toFixed(2));

      await db.$transaction(async (tx) => {
        await tx.userInvestment.update({
          where: { id: inv.id },
          data: {
            dailyReturn,
            totalReturn: toNumber(inv.totalReturn) + dailyReturn,
            lastPayoutAt: new Date(),
            payoutStatus: 'processed',
          },
        });

        await tx.wallet.update({
          where: { id: inv.walletId },
          data: { balance: { increment: dailyReturn }, availableBalance: { increment: dailyReturn } },
        });

        await tx.transaction.create({
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
          await tx.wallet.update({
            where: { id: inv.walletId },
            data: { balance: { increment: inv.amount }, availableBalance: { increment: inv.amount } },
          });
          await tx.userInvestment.update({ where: { id: inv.id }, data: { status: 'completed' } });
          await tx.transaction.create({
            data: { walletId: inv.walletId, type: 'investment_return', status: 'completed', amount: inv.amount, description: `Principal return - ${inv.plan.name}` },
          });
        }
      });

      processed++;
    } catch (err) {
      console.error(`[Payout] Failed for investment ${inv.id}:`, err);
      failed++;
    }
  }

  return { processed, failed, total: activeInvestments.length };
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Concurrency guard: prevent duplicate payout processing
  if (isProcessing) {
    return NextResponse.json({ error: 'Payout processing already in progress', processing: true }, { status: 409 });
  }
  isProcessing = true;

  try {
    const result = await processDailyPayouts();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Payout processing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    isProcessing = false;
  }
}
