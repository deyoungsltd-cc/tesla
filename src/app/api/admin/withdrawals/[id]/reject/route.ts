import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(3, 'Rejection reason is required'),
});

async function handler(request: NextRequest, context: any, adminUser: any) {
  try {
    const { id } = await context.params;

    const body = await request.json();
    const parsed = rejectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const withdrawal = await db.withdrawal.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      return apiError('Withdrawal not found', 'NOT_FOUND', 404);
    }

    if (withdrawal.status !== 'pending') {
      return apiError('Withdrawal is not in pending status', 'INVALID_STATUS', 400);
    }

    await db.$transaction(async (tx) => {
      // Return locked amount to available balance
      await tx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          availableBalance: { increment: withdrawal.amount },
          lockedBalance: { decrement: withdrawal.amount },
        },
      });

      // Update withdrawal status
      await tx.withdrawal.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectionReason: parsed.data.reason,
          processedBy: adminUser.id,
          processedAt: new Date(),
        },
      });

      // Update transaction status
      await tx.transaction.updateMany({
        where: { referenceId: id, type: 'withdrawal' },
        data: { status: 'reversed' },
      });

      // Notify user
      await tx.notification.create({
        data: {
          userId: withdrawal.userId,
          type: 'withdrawal_rejected',
          title: 'Withdrawal Rejected',
          message: `Your withdrawal of $${withdrawal.netAmount.toFixed(2)} has been rejected. The full amount of $${withdrawal.amount.toFixed(2)} has been returned to your wallet. Reason: ${parsed.data.reason}`,
        },
      });
    });

    return apiResponse({ message: 'Withdrawal rejected successfully' });
  } catch (error) {
    console.error('Admin reject withdrawal error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN', 'COMPLIANCE')(handler);