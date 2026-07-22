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

    const deposit = await db.deposit.findUnique({
      where: { id },
    });

    if (!deposit) {
      return apiError('Deposit not found', 'NOT_FOUND', 404);
    }

    if (deposit.status !== 'pending') {
      return apiError('Deposit is not in pending status', 'INVALID_STATUS', 400);
    }

    await db.$transaction(async (tx) => {
      await tx.deposit.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectionReason: parsed.data.reason,
          verifiedBy: adminUser.id,
          verifiedAt: new Date(),
        },
      });

      await tx.transaction.updateMany({
        where: { referenceId: id, type: 'deposit' },
        data: { status: 'failed' },
      });

      await tx.giftCard.updateMany({
        where: { depositId: id },
        data: {
          status: 'rejected',
          rejectionReason: parsed.data.reason,
          verifiedBy: adminUser.id,
          verifiedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: deposit.userId,
          type: 'deposit_rejected',
          title: 'Deposit Rejected',
          message: `Your deposit of $${deposit.amount.toFixed(2)} has been rejected. Reason: ${parsed.data.reason}`,
        },
      });
    });

    return apiResponse({ message: 'Deposit rejected successfully' });
  } catch (error) {
    console.error('Admin reject deposit error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN', 'COMPLIANCE')(handler);