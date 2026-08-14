import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { toNumber, formatMoney } from '@/lib/decimal';
import { buildIdempotencyKey, checkIdempotency } from '@/lib/idempotency';
import { rateLimit } from '@/lib/rate-limit';
import { logUserAction } from '@/lib/user-audit';
import { z } from 'zod';

const investmentSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  mode: z.enum(['demo', 'live']).default('live'),
});

async function handler(request: NextRequest, _context: any, user: any) {
  // Rate limit: max 10 investment requests per minute
  const rl = rateLimit(request, true);
  if (!rl.success) {
    return apiError('Too many investment requests. Please wait a moment.', 'TOO_MANY_REQUESTS', 429);
  }

  try {
    const body = await request.json();
    const parsed = investmentSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { planId, amount, mode } = parsed.data;

    // Idempotency: prevent double-click duplicate investments
    const idempotencyKey = buildIdempotencyKey(user.id, 'investment', `${planId}-${amount}-${mode}`);
    const { duplicate } = checkIdempotency(idempotencyKey);
    if (duplicate) {
      return apiError('An investment with similar details is already being processed. Please wait.', 'DUPLICATE_REQUEST', 409);
    }

    // Try by ID first, then by slug
    let plan = await db.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      plan = await db.investmentPlan.findUnique({ where: { slug: planId } });
    }

    // Distinct error messages for clearer triage
    if (!plan) {
      return apiError(`Investment plan not found (id/slug: ${planId}). Please refresh the page and try again.`, 'PLAN_NOT_FOUND', 404);
    }
    if (!plan.isActive) {
      return apiError(`The "${plan.name}" is currently unavailable. Please try another plan or contact support.`, 'PLAN_INACTIVE', 400);
    }

    if (amount < toNumber(plan.minAmount)) {
      return apiError(`Minimum investment amount is $${formatMoney(plan.minAmount)}`, 'AMOUNT_BELOW_MIN', 400);
    }
    if (plan.maxAmount && amount > toNumber(plan.maxAmount)) {
      return apiError(`Maximum investment amount is $${formatMoney(plan.maxAmount)}`, 'AMOUNT_ABOVE_MAX', 400);
    }

    const wallet = await db.wallet.findFirst({
      where: { userId: user.id, type: mode },
    });

    if (!wallet) {
      return apiError('Wallet not found', 'WALLET_NOT_FOUND', 404);
    }

    if (toNumber(wallet.availableBalance) < amount) {
      return apiError('Insufficient available balance', 'INSUFFICIENT_BALANCE', 400);
    }

    const dailyReturn = Number((amount * (toNumber(plan.dailyReturnRate) / 100)).toFixed(2));
    const durationDays = plan.durationUnit === 'hours' ? plan.duration / 24 : plan.duration;
    const expectedReturn = Number((dailyReturn * durationDays).toFixed(2));

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
          planId: plan.id,   // FIX: use the actual plan.id (cuid), not the raw planId slug the client sent
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
          message: `Your $${formatMoney(amount)} investment in ${plan.name} plan has been activated. Expected return: $${formatMoney(expectedReturn)}.`,
        },
      });

      return investment;
    });

    // Log to audit trail
    await logUserAction(user.id, 'create_investment', {
      resource: 'investment',
      resourceId: result.id,
      details: { planId: plan.id, planName: plan.name, amount, mode, expectedReturn },
      request,
    });

    return apiResponse(result, 201);
  } catch (error: any) {
    console.error('Create investment error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);