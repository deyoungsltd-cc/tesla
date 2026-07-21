import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

// GET /api/admin/withdrawals — list withdrawals with filters
async function listHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') || '';

    const where: any = {};
    if (status) where.status = status;

    const [withdrawals, total] = await Promise.all([
      db.withdrawal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
        },
      }),
      db.withdrawal.count({ where }),
    ]);

    return apiResponse({ withdrawals, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin list withdrawals error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// PATCH /api/admin/withdrawals — approve or reject a withdrawal
async function updateHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { withdrawalId, action, reason } = body;

    if (!withdrawalId || !action) {
      return apiError('withdrawalId and action are required', 'VALIDATION_ERROR', 400);
    }

    const withdrawal = await db.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { wallet: true },
    });

    if (!withdrawal) return apiError('Withdrawal not found', 'NOT_FOUND', 404);
    if (withdrawal.status !== 'pending') {
      return apiError('Withdrawal is not in a pending state', 'INVALID_STATE', 400);
    }

    if (action === 'approve') {
      const result = await db.$transaction(async (tx) => {
        // Check wallet has enough balance
        const wallet = await tx.wallet.findUnique({ where: { id: withdrawal.walletId } });
        if (!wallet || wallet.availableBalance < withdrawal.amount) {
          throw new Error('Insufficient balance');
        }

        const updated = await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'processing', processedAt: new Date() },
        });

        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            balance: { decrement: withdrawal.amount },
            availableBalance: { decrement: withdrawal.amount },
          },
        });

        await tx.transaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: 'withdrawal',
            status: 'completed',
            amount: withdrawal.amount,
            description: `Withdrawal approved → ${withdrawal.destinationType}`,
            referenceId: withdrawalId,
          },
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            type: 'withdrawal_processed',
            title: 'Withdrawal Processing',
            message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} has been approved and is being processed.`,
          },
        });

        return updated;
      });
      return apiResponse(result);
    }

    if (action === 'reject') {
      const result = await db.$transaction(async (tx) => {
        const updated = await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'rejected', rejectionReason: reason || 'Rejected by admin' },
        });

        // Return funds to wallet
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            lockedBalance: { decrement: withdrawal.amount },
            availableBalance: { increment: withdrawal.amount },
          },
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            type: 'withdrawal_rejected',
            title: 'Withdrawal Rejected',
            message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} has been rejected. Reason: ${reason || 'Not specified'}. Funds returned to wallet.`,
          },
        });

        return updated;
      });
      return apiResponse(result);
    }

    return apiError('Unknown action', 'INVALID_ACTION', 400);
  } catch (error: any) {
    console.error('Admin update withdrawal error:', error);
    if (error.message === 'Insufficient balance') {
      return apiError('User has insufficient balance for this withdrawal', 'INSUFFICIENT_BALANCE', 400);
    }
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('SUPER_ADMIN', 'ADMIN')(listHandler);
export const PATCH = requireRole('SUPER_ADMIN', 'ADMIN')(updateHandler);