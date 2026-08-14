import { NextRequest } from 'next/server';
import { getSessionUser, apiResponse, apiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    // getSessionUser already fetches user + profile + wallets in one query
    const user = await getSessionUser(request);
    if (!user) {
      return apiError('Authentication required', 'UNAUTHORIZED', 401);
    }

    return apiResponse({
      id: user.id,
      email: user.email,
      status: user.status,
      kycLevel: user.kycLevel,
      kycVerificationCode: user.kycVerificationCode || null,
      activeMode: user.activeMode,
      referralCode: user.referralCode,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      preferredCurrency: user.preferredCurrency,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
      profile: user.profile,
      wallets: user.wallets?.map((w) => ({
        id: w.id,
        type: w.type,
        balance: w.balance,
        availableBalance: w.availableBalance,
        lockedBalance: w.lockedBalance,
      })) || [],
      adminRecord: user.adminRecord ? {
        role: user.adminRecord.role,
      } : null,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}