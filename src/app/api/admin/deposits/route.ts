import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { sendAdminNotificationEmail } from '@/lib/email';

// GET /api/admin/deposits — list deposits with filters
async function listHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') || '';

    const where: any = {};
    if (status) where.status = status;

    const [deposits, total] = await Promise.all([
      db.deposit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
        },
      }),
      db.deposit.count({ where }),
    ]);

    return apiResponse({ deposits, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin list deposits error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// PATCH /api/admin/deposits — approve or reject a deposit
async function updateHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { depositId, action, reason, adminMessage, attachmentUrl } = body;

    if (!depositId || !action) {
      return apiError('depositId and action are required', 'VALIDATION_ERROR', 400);
    }

    const deposit = await db.deposit.findUnique({
      where: { id: depositId },
      include: { user: true, wallet: true },
    });

    if (!deposit) return apiError('Deposit not found', 'NOT_FOUND', 404);
    if (deposit.status !== 'pending' && deposit.status !== 'pending_verification') {
      return apiError('Deposit is not in a pending state', 'INVALID_STATE', 400);
    }

    const userName = deposit.user.profile
      ? `${deposit.user.profile.firstName || ''} ${deposit.user.profile.lastName || ''}`.trim()
      : deposit.user.email;
    const userEmail = deposit.user.email;
    const amountStr = `$${deposit.amount.toFixed(2)}`;

    if (action === 'approve') {
      const result = await db.$transaction(async (tx) => {
        const updated = await tx.deposit.update({
          where: { id: depositId },
          data: { status: 'confirmed', verifiedAt: new Date() },
        });

        await tx.wallet.update({
          where: { id: deposit.walletId },
          data: {
            balance: { increment: deposit.amount },
            availableBalance: { increment: deposit.amount },
          },
        });

        await tx.transaction.create({
          data: {
            walletId: deposit.walletId,
            type: 'deposit',
            status: 'completed',
            amount: deposit.amount,
            description: `Deposit approved (${deposit.method})`,
            referenceId: depositId,
          },
        });

        const msg = adminMessage || `Your deposit of ${amountStr} has been approved and credited to your account.`;
        await tx.notification.create({
          data: {
            userId: deposit.userId,
            type: 'deposit_confirmed',
            title: 'Deposit Confirmed',
            message: msg,
          },
        });

        return updated;
      });

      // Send email asynchronously (non-blocking)
      sendAdminNotificationEmail(userEmail, userName, {
        type: 'deposit_confirmed',
        title: 'Deposit Confirmed',
        message: `Your deposit of ${amountStr} via ${deposit.method} has been approved and credited to your wallet. You can now use these funds for investments or withdrawals.`,
        amount: amountStr,
        adminMessage,
        attachmentUrl,
      }).catch((err) => console.error('Failed to send deposit confirmation email:', err));

      return apiResponse(result);
    }

    if (action === 'reject') {
      const result = await db.$transaction(async (tx) => {
        const updated = await tx.deposit.update({
          where: { id: depositId },
          data: { status: 'rejected', rejectionReason: reason || 'Rejected by admin' },
        });

        const msg = adminMessage || `Your deposit of ${amountStr} has been rejected. Reason: ${reason || 'Not specified'}.`;
        await tx.notification.create({
          data: {
            userId: deposit.userId,
            type: 'deposit_rejected',
            title: 'Deposit Rejected',
            message: msg,
          },
        });

        return updated;
      });

      // Send email asynchronously (non-blocking)
      sendAdminNotificationEmail(userEmail, userName, {
        type: 'deposit_rejected',
        title: 'Deposit Rejected',
        message: `Your deposit of ${amountStr} via ${deposit.method} has been rejected. Reason: ${reason || 'Not specified'}. Please contact support if you believe this is an error.`,
        amount: amountStr,
        adminMessage,
        attachmentUrl,
      }).catch((err) => console.error('Failed to send deposit rejection email:', err));

      return apiResponse(result);
    }

    return apiError('Unknown action', 'INVALID_ACTION', 400);
  } catch (error) {
    console.error('Admin update deposit error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('SUPER_ADMIN', 'ADMIN')(listHandler);
export const PATCH = requireRole('SUPER_ADMIN', 'ADMIN')(updateHandler);
