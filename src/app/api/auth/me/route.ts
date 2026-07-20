import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, apiResponse, apiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return apiError('Authentication required', 'UNAUTHORIZED', 401);
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        wallets: true,
      },
    });

    if (!fullUser) {
      return apiError('User not found', 'NOT_FOUND', 404);
    }

    return apiResponse({
      id: fullUser.id,
      email: fullUser.email,
      status: fullUser.status,
      kycLevel: fullUser.kycLevel,
      activeMode: fullUser.activeMode,
      referralCode: fullUser.referralCode,
      emailVerified: fullUser.emailVerified,
      twoFactorEnabled: fullUser.twoFactorEnabled,
      preferredCurrency: fullUser.preferredCurrency,
      preferredLanguage: fullUser.preferredLanguage,
      createdAt: fullUser.createdAt,
      profile: fullUser.profile,
      wallets: fullUser.wallets.map((w) => ({
        id: w.id,
        type: w.type,
        balance: w.balance,
        availableBalance: w.availableBalance,
        lockedBalance: w.lockedBalance,
      })),
    });
  } catch (error) {
    console.error('Get me error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}