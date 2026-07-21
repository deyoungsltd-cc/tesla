import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const investmentSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  mode: z.enum(['demo', 'live']).default('live'),
});

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = investmentSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { planId, amount, mode } = parsed.data;

    // Try by ID first, then by slug
    let plan = await db.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      plan = await db.investmentPlan.findUnique({ where: { slug: planId } });
    }

    if (!plan || !plan.isActive) {
      return apiError('Investment plan not found or inactive', 'PLAN_NOT_FOUND', 404);
    }

    if (amount < plan.minAmount) {
      return apiError(`Minimum investment amount is $${plan.minAmount}`, 'AMOUNT_BELOW_MIN', 400);
    }
    if (plan.maxAmount && amount > plan.maxAmount) {
      return apiError(`Maximum investment amount is $${plan.maxAmount}`, 'AMOUNT_ABOVE_MAX', 400);
    }

    const wallet = await db.wallet.findFirst({
      where: { userId: user.id, type: mode },
    });

    if (!wallet) {
      return apiError('Wallet not found', 'WALLET_NOT_FOUND', 404);
    }

    if (wallet.availableBalance < amount) {
      return apiError('Insufficient available balance', 'INSUFFICIENT_BALANCE', 400);
    }

    const dailyReturn = amount * (plan.dailyReturnRate / 100);
    const durationDays = plan.durationUnit === 'hours' ? plan.duration / 24 : plan.duration;
    const expectedReturn = dailyReturn * durationDays;

    const startDate = new Date();
    const endDate = new Date(startDate.getTime());
    if (plan.durationUnit === 'hours') {
      endDate.setHours(endDate.getHours() + plan.duration);
    } else {
      endDate.setDate(endDate.getDate() + plan.duration);
    }

    const result = await db.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: amount },
          availableBalance: { decrement: amount },
        },
      });

      const investment = await tx.userInvestment.create({
        data: {
          userId: user.id,
          planId,
          walletId: wallet.id,
          amount,
          mode,
          status: 'active',
          dailyReturn,
          expectedReturn,
          startDate,
          endDate,
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'investment',
          status: 'completed',
          amount,
          description: `Investment in ${plan.name} plan`,
          referenceId: investment.id,
        },
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'investment_activated',
          title: 'Investment Activated',
          message: `Your $${amount.toFixed(2)} investment in ${plan.name} plan has been activated. Expected return: $${expectedReturn.toFixed(2)}.`,
        },
      });

      return investment;
    });

    return apiResponse(result, 201);
  } catch (error: any) {
    console.error('Create investment error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);