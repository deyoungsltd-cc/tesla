import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(request: NextRequest, context: any, adminUser: any) {
  try {
    const { id } = await context.params;

    const withdrawal = await db.withdrawal.findUnique({
      where: { id },
      include: { user: true, wallet: true },
    });

    if (!withdrawal) {
      return apiError('Withdrawal not found', 'NOT_FOUND', 404);
    }

    if (withdrawal.status !== 'pending') {
      return apiError('Withdrawal is not in pending status', 'INVALID_STATUS', 400);
    }

    await db.$transaction(async (tx) => {
      // Deduct from wallet (the full amount was locked, so reduce both locked and total balance)
      await tx.wallet.update({
        where: { id: withdrawal.walletId },
        data: {
          balance: { decrement: withdrawal.amount },
          lockedBalance: { decrement: withdrawal.amount },
        },
      });

      // Update withdrawal status
      await tx.withdrawal.update({
        where: { id },
        data: {
          status: 'completed',
          processedBy: adminUser.id,
          processedAt: new Date(),
        },
      });

      // Update transaction status
      await tx.transaction.updateMany({
        where: { referenceId: id, type: 'withdrawal' },
        data: { status: 'completed' },
      });

      // Create fee transaction
      await tx.transaction.create({
        data: {
          walletId: withdrawal.walletId,
          type: 'fee',
          status: 'completed',
          amount: withdrawal.fee,
          description: `Withdrawal processing fee (${((withdrawal.fee / withdrawal.amount) * 100).toFixed(0)}%)`,
          referenceId: withdrawal.id,
        },
      });

      // Notify user
      await tx.notification.create({
        data: {
          userId: withdrawal.userId,
          type: 'withdrawal_processed',
          title: 'Withdrawal Processed',
          message: `Your withdrawal of $${withdrawal.netAmount.toFixed(2)} (fee: $${withdrawal.fee.toFixed(2)}) has been processed successfully.`,
        },
      });
    });

    return apiResponse({ message: 'Withdrawal approved successfully' });
  } catch (error: any) {
    console.error('Admin approve withdrawal error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN', 'COMPLIANCE')(handler);