import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { sendAdminNotificationEmail } from '@/lib/email';
import { z } from 'zod';
import { formatMoney } from '@/lib/decimal';

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
          message: `Your deposit of $${formatMoney(deposit.amount)} has been rejected. Reason: ${parsed.data.reason}`,
        },
      });
    });

    // Send email notification asynchronously
    const depositUser = await db.user.findUnique({ where: { id: deposit.userId }, include: { profile: true } });
    if (depositUser) {
      const userName = depositUser.profile
        ? `${depositUser.profile.firstName || ''} ${depositUser.profile.lastName || ''}`.trim()
        : depositUser.email;
      sendAdminNotificationEmail(depositUser.email, userName, {
        type: 'deposit_rejected',
        title: 'Deposit Rejected',
        message: `Your deposit of $${formatMoney(deposit.amount)} has been rejected.`,
        amount: `${formatMoney(deposit.amount)}`,
        adminMessage: `Rejection reason: ${parsed.data.reason}`,
      }).catch((err) => console.error('Failed to send deposit rejection email:', err));
    }

    return apiResponse({ message: 'Deposit rejected successfully' });
  } catch (error) {
    console.error('Admin reject deposit error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN', 'COMPLIANCE')(handler);