import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { sendAdminNotificationEmail } from '@/lib/email';
import { formatMoney } from '@/lib/decimal';

async function handler(request: NextRequest, context: any, adminUser: any) {
  try {
    const { id } = await context.params;

    const deposit = await db.deposit.findUnique({
      where: { id },
      include: { user: { include: { profile: true } }, wallet: true },
    });

    if (!deposit) {
      return apiError('Deposit not found', 'NOT_FOUND', 404);
    }

    if (deposit.status !== 'pending') {
      return apiError('Deposit is not in pending status', 'INVALID_STATUS', 400);
    }

    const result = await db.$transaction(async (tx) => {
      // Update deposit status
      await tx.deposit.update({
        where: { id },
        data: {
          status: 'confirmed',
          verifiedBy: adminUser.id,
          verifiedAt: new Date(),
        },
      });

      // Update transaction status
      await tx.transaction.updateMany({
        where: { referenceId: id, type: 'deposit' },
        data: { status: 'completed' },
      });

      // Credit wallet
      await tx.wallet.update({
        where: { id: deposit.walletId },
        data: {
          balance: { increment: deposit.amount },
          availableBalance: { increment: deposit.amount },
        },
      });

      // Process referral commission (10%)
      if (deposit.user.referredById) {
        const referrerWallet = await tx.wallet.findFirst({
          where: { userId: deposit.user.referredById, type: deposit.mode },
        });

        if (referrerWallet) {
          const commissionAmount = Number(deposit.amount) * 0.1;

          await tx.referralCommission.create({
            data: {
              userId: deposit.user.referredById,
              depositId: deposit.id,
              referrerId: deposit.user.referredById,
              amount: commissionAmount,
              rate: 0.1,
              level: 1,
              type: 'direct',
              status: 'paid',
            },
          });

          await tx.wallet.update({
            where: { id: referrerWallet.id },
            data: {
              balance: { increment: commissionAmount },
              availableBalance: { increment: commissionAmount },
            },
          });

          await tx.transaction.create({
            data: {
              walletId: referrerWallet.id,
              type: 'referral_bonus',
              status: 'completed',
              amount: commissionAmount,
              description: `Referral commission from deposit by ${deposit.user.email}`,
              referenceId: deposit.id,
            },
          });
        }
      }

      // Update gift card status if applicable
      await tx.giftCard.updateMany({
        where: { depositId: id },
        data: {
          status: 'verified',
          verifiedBy: adminUser.id,
          verifiedAt: new Date(),
        },
      });

      // Notify user
      await tx.notification.create({
        data: {
          userId: deposit.userId,
          type: 'deposit_confirmed',
          title: 'Deposit Confirmed',
          message: `Your deposit of $${formatMoney(deposit.amount)} has been confirmed and credited to your ${deposit.mode} wallet.`,
        },
      });

      return { message: 'Deposit approved successfully' };
    });

    // Send email notification asynchronously (non-blocking)
    const userName = deposit.user.profile
      ? `${deposit.user.profile.firstName || ''} ${deposit.user.profile.lastName || ''}`.trim()
      : deposit.user.email;
    sendAdminNotificationEmail(deposit.user.email, userName, {
      type: 'deposit_confirmed',
      title: 'Deposit Confirmed',
      message: `Your deposit of ${formatMoney(deposit.amount)} via ${deposit.method} has been approved and credited to your ${deposit.mode} wallet.`,
      amount: formatMoney(deposit.amount),
    }).catch((err) => console.error('Failed to send deposit approval email:', err));

    return apiResponse(result);
  } catch (error: any) {
    console.error('Admin approve deposit error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN', 'COMPLIANCE')(handler);