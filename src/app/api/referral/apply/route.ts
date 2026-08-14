import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const applyPromoSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
});

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = applyPromoSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { code } = parsed.data;

    const promo = await db.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return apiError('Invalid promo code', 'INVALID_CODE', 404);
    }

    if (promo.status !== 'active') {
      return apiError('This promo code is not active', 'CODE_INACTIVE', 400);
    }

    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
      return apiError('This promo code has expired', 'CODE_EXPIRED', 400);
    }

    if (promo.validFrom && new Date(promo.validFrom) > new Date()) {
      return apiError('This promo code is not yet valid', 'CODE_NOT_VALID', 400);
    }

    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return apiError('This promo code has been fully redeemed', 'CODE_FULLY_REDEEMED', 400);
    }

    // Check if user already used this code
    const existingUse = await db.userPromo.findFirst({
      where: {
        userId: user.id,
        promoCodeId: promo.id,
      },
    });

    if (existingUse) {
      return apiError('You have already used this promo code', 'ALREADY_USED', 400);
    }

    const result = await db.$transaction(async (tx) => {
      // Record usage
      await tx.userPromo.create({
        data: {
          userId: user.id,
          promoCodeId: promo.id,
          usedAt: new Date(),
        },
      });

      // Increment usage count
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { currentUses: { increment: 1 } },
      });

      // Check if fully redeemed
      if (promo.maxUses && promo.currentUses + 1 >= promo.maxUses) {
        await tx.promoCode.update({
          where: { id: promo.id },
          data: { status: 'fully_redeemed' },
        });
      }

      // Apply credit to live wallet
      const wallet = await tx.wallet.findFirst({
        where: { userId: user.id, type: 'live' },
      });

      if (wallet && promo.discountType === 'fixed') {
        const creditAmount = promo.discountValue;
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: creditAmount },
            availableBalance: { increment: creditAmount },
          },
        });

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'promo_credit',
            status: 'completed',
            amount: creditAmount,
            description: `Promo code credit: ${promo.code}`,
          },
        });
      }

      return {
        applied: true,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
      };
    });

    return apiResponse(result);
  } catch (error) {
    console.error('Apply promo error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);