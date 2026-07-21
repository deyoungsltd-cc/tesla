import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const depositSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.enum(['crypto', 'gift_card']),
  cryptoCurrency: z.enum(['BTC', 'ETH', 'USDT']).optional(),
  txHash: z.string().optional(),
  giftCardImage: z.string().optional(),
  giftCardType: z.string().optional(),
  giftCardCode: z.string().optional(),
  mode: z.enum(['demo', 'live']).default('demo'),
});

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = depositSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { amount, method, cryptoCurrency, txHash, giftCardImage, giftCardType, giftCardCode, mode } = parsed.data;

    // Validate crypto-specific fields
    if (method === 'crypto' && (!cryptoCurrency || !txHash)) {
      return apiError('Crypto currency and transaction hash are required', 'VALIDATION_ERROR', 400);
    }

    // Validate gift card-specific fields
    if (method === 'gift_card' && !giftCardType) {
      return apiError('Gift card type is required', 'VALIDATION_ERROR', 400);
    }

    // Find wallet
    const wallet = await db.wallet.findFirst({
      where: { userId: user.id, type: mode },
    });

    if (!wallet) {
      return apiError('Wallet not found', 'WALLET_NOT_FOUND', 404);
    }

    // For demo mode, auto-approve
    const isDemo = mode === 'demo';
    const depositStatus = isDemo ? 'confirmed' : 'pending';
    const txStatus = isDemo ? 'completed' : 'pending';

    const result = await db.$transaction(async (tx) => {
      // Create deposit
      const deposit = await tx.deposit.create({
        data: {
          userId: user.id,
          walletId: wallet.id,
          amount,
          usdAmount: amount,
          method,
          cryptoCurrency: method === 'crypto' ? cryptoCurrency : null,
          txHash: method === 'crypto' ? txHash : null,
          status: depositStatus,
          mode,
          verifiedBy: isDemo ? 'system' : null,
          verifiedAt: isDemo ? new Date() : null,
        },
      });

      // Create transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'deposit',
          status: txStatus,
          amount,
          description: `Deposit via ${method}${cryptoCurrency ? ` (${cryptoCurrency})` : ''}`,
          referenceId: deposit.id,
        },
      });

      // Credit wallet for demo mode
      if (isDemo) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: amount },
            availableBalance: { increment: amount },
          },
        });

        // Process referral commission (10%)
        if (user.referredById) {
          const referrerWallet = await tx.wallet.findFirst({
            where: { userId: user.referredById, type: mode },
          });

          if (referrerWallet) {
            const commissionAmount = amount * 0.1;

            await tx.referralCommission.create({
              data: {
                userId: user.referredById,
                depositId: deposit.id,
                referrerId: user.referredById,
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
                description: `Referral commission from deposit by ${user.email}`,
                referenceId: deposit.id,
              },
            });
          }
        }

        // Create notification
        await tx.notification.create({
          data: {
            userId: user.id,
            type: 'deposit_confirmed',
            title: 'Deposit Confirmed',
            message: `Your deposit of $${amount.toFixed(2)} has been confirmed and credited to your ${mode} wallet.`,
          },
        });
      }

      return deposit;
    });

    return apiResponse(result, isDemo ? 201 : 201);
  } catch (error: any) {
    console.error('Create deposit error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);