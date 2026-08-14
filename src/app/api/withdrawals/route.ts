import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { toNumber, formatMoney } from '@/lib/decimal';
import { buildIdempotencyKey, checkIdempotency } from '@/lib/idempotency';
import { rateLimit } from '@/lib/rate-limit';
import { logUserAction } from '@/lib/user-audit';
import { z } from 'zod';

const WITHDRAWAL_FEE_RATE = 0.10;
const MIN_WITHDRAWAL = 10; // Minimum $10 withdrawal

const withdrawalSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  destinationType: z.enum(['crypto', 'bank']),
  destinationAddress: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  mode: z.enum(['demo', 'live']).default('live'),
});

async function handler(request: NextRequest, _context: any, user: any) {
  // Rate limit: max 5 withdrawal requests per minute
  const rl = rateLimit(request, true);
  if (!rl.success) {
    return apiError('Too many withdrawal requests. Please wait a moment.', 'TOO_MANY_REQUESTS', 429);
  }

  try {
    const body = await request.json();
    const parsed = withdrawalSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { amount, destinationType, destinationAddress, bankName, bankAccountName, bankAccountNumber, mode } = parsed.data;

    // Idempotency: prevent double-click duplicate withdrawals
    const idempotencyKey = buildIdempotencyKey(user.id, 'withdrawal', `${amount}-${destinationType}-${mode}`);
    const { duplicate } = checkIdempotency(idempotencyKey);
    if (duplicate) {
      return apiError('A withdrawal with similar details is already being processed. Please wait.', 'DUPLICATE_REQUEST', 409);
    }

    if (amount < MIN_WITHDRAWAL) {
      return apiError(`Minimum withdrawal amount is ${MIN_WITHDRAWAL}`, 'AMOUNT_BELOW_MIN', 400);
    }

    // KYC Level 3 is required to withdraw funds
    if (user.kycLevel !== 'LEVEL_3') {
      return apiError(
        'Please verify Level 3 KYC before proceeding with withdrawals. Complete all three KYC verification levels to unlock withdrawals.',
        'KYC_LEVEL_3_REQUIRED',
        403
      );
    }

    // Validate destination fields
    if (destinationType === 'crypto' && !destinationAddress) {
      return apiError('Destination address is required for crypto withdrawals', 'VALIDATION_ERROR', 400);
    }
    if (destinationType === 'bank' && (!bankName || !bankAccountName || !bankAccountNumber)) {
      return apiError('Bank name, account name, and account number are required for bank withdrawals', 'VALIDATION_ERROR', 400);
    }

    // Find wallet
    const wallet = await db.wallet.findFirst({
      where: { userId: user.id, type: mode },
    });

    if (!wallet) {
      return apiError('Wallet not found', 'WALLET_NOT_FOUND', 404);
    }

    // Check sufficient available balance
    if (toNumber(wallet.availableBalance) < amount) {
      return apiError('Insufficient available balance', 'INSUFFICIENT_BALANCE', 400);
    }

    const fee = Number((amount * WITHDRAWAL_FEE_RATE).toFixed(2));
    const netAmount = Number((amount - fee).toFixed(2));

    const result = await db.$transaction(async (tx) => {
      // Lock the amount in wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { decrement: amount },
          lockedBalance: { increment: amount },
        },
      });

      // Create withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: user.id,
          walletId: wallet.id,
          amount,
          fee,
          netAmount,
          destinationType,
          destinationAddress: destinationType === 'crypto' ? destinationAddress : null,
          bankName: destinationType === 'bank' ? bankName : null,
          bankAccountName: destinationType === 'bank' ? bankAccountName : null,
          bankAccountNumber: destinationType === 'bank' ? bankAccountNumber : null,
          status: 'pending',
          mode,
        },
      });

      // Create pending transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'withdrawal',
          status: 'pending',
          amount,
          description: `Withdrawal request (${destinationType}) - Fee: $${formatMoney(fee)}`,
          referenceId: withdrawal.id,
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'withdrawal_processed',
          title: 'Withdrawal Requested',
          message: `Your withdrawal of $${formatMoney(netAmount)} (fee: $${formatMoney(fee)}) is being processed.`,
        },
      });

      return withdrawal;
    });

    // Log to audit trail
    await logUserAction(user.id, 'create_withdrawal', {
      resource: 'withdrawal',
      resourceId: result.id,
      details: { amount, fee, netAmount, destinationType, mode },
      request,
    });

    return apiResponse(result, 201);
  } catch (error: any) {
    console.error('Create withdrawal error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);