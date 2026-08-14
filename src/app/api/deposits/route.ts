import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { formatMoney } from '@/lib/decimal';
import { hasPendingOperation, buildIdempotencyKey, checkIdempotency } from '@/lib/idempotency';
import { rateLimit } from '@/lib/rate-limit';
import { logUserAction } from '@/lib/user-audit';
import { z } from 'zod';

const depositSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.enum(['crypto', 'gift_card']),
  cryptoCurrency: z.enum(['BTC', 'ETH', 'USDT']).optional(),
  txHash: z.string().optional(),
  giftCardImage: z.string().optional(),
  giftCardType: z.string().optional(),
  giftCardCode: z.string().optional(),
  giftCardPin: z.string().optional(),
  mode: z.enum(['demo', 'live']).default('live'),
});

const MAX_GIFT_CARD_IMAGE_SIZE = 500000; // 500KB max for base64 gift card image

async function handler(request: NextRequest, _context: any, user: any) {
  // Rate limit: max 10 deposit submissions per minute
  const rl = rateLimit(request, true);
  if (!rl.success) {
    return apiError('Too many deposit requests. Please wait a moment.', 'TOO_MANY_REQUESTS', 429);
  }

  try {
    const body = await request.json();
    const parsed = depositSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { amount, method, cryptoCurrency, txHash, giftCardImage, giftCardType, giftCardCode, giftCardPin, mode } = parsed.data;

    // Idempotency: prevent double-click duplicate deposits
    const idempotencyKey = buildIdempotencyKey(user.id, 'deposit', `${amount}-${method}-${mode}`);
    const { duplicate } = checkIdempotency(idempotencyKey);
    if (duplicate) {
      return apiError('A deposit with similar details is already being processed. Please wait.', 'DUPLICATE_REQUEST', 409);
    }

    // Validate crypto-specific fields
    if (method === 'crypto' && (!cryptoCurrency || !txHash)) {
      return apiError('Crypto currency and transaction hash are required', 'VALIDATION_ERROR', 400);
    }

    // Validate gift card-specific fields
    if (method === 'gift_card') {
      if (!giftCardType) {
        return apiError('Gift card type (brand) is required', 'VALIDATION_ERROR', 400);
      }
      if (!giftCardCode) {
        return apiError('Gift card code is required', 'VALIDATION_ERROR', 400);
      }
      if (!giftCardImage) {
        return apiError('A clear photo of the gift card is required for verification', 'IMAGE_REQUIRED', 400);
      }
    }
    if (giftCardImage && giftCardImage.length > MAX_GIFT_CARD_IMAGE_SIZE) {
      return apiError('Gift card image is too large (max 500KB after compression). Please try a smaller image.', 'FILE_TOO_LARGE', 400);
    }

    // Find wallet
    const wallet = await db.wallet.findFirst({
      where: { userId: user.id, type: mode },
    });

    if (!wallet) {
      return apiError('Wallet not found', 'WALLET_NOT_FOUND', 404);
    }

    // Deposit starts as pending — admin must approve to credit wallet
    const depositStatus = 'pending';
    const txStatus = 'pending';

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
        },
      });

      // FIX: For gift card deposits, ALSO persist a GiftCard row (previously only Deposit was created)
      if (method === 'gift_card') {
        await tx.giftCard.create({
          data: {
            depositId: deposit.id,
            cardType: giftCardType!,
            cardCode: giftCardCode!,
            pinCode: giftCardPin || null,
            amount,
            currency: 'USD',
            imageUrl: giftCardImage || null,
            status: 'pending',
          },
        });
      }

      // Create transaction record (pending until admin approves)
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'deposit',
          status: txStatus,
          amount,
          description: method === 'gift_card'
            ? `Gift card deposit (${giftCardType})`
            : `Deposit via ${method}${cryptoCurrency ? ` (${cryptoCurrency})` : ''}`,
          referenceId: deposit.id,
        },
      });

      // NOTE: Wallet credit and referral commission happen on ADMIN APPROVAL
      // See /api/admin/deposits/[id]/approve

      // Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'deposit_confirmed',
          title: 'Deposit Submitted',
          message: method === 'gift_card'
            ? `Your ${giftCardType} gift card deposit of $${formatMoney(amount)} has been submitted and is pending admin verification.`
            : `Your deposit of $${formatMoney(amount)} has been submitted and is pending admin verification.`,
        },
      });

      return deposit;
    });

    // Log to audit trail
    await logUserAction(user.id, 'create_deposit', {
      resource: 'deposit',
      resourceId: result.id,
      details: { amount, method, cryptoCurrency, mode },
      request,
    });

    return apiResponse(result, 201);
  } catch (error: any) {
    console.error('Create deposit error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);
