import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(_request: NextRequest, _context: any, user: any) {
  try {
    const [referralCount, commissionResult] = await Promise.all([
      db.referral.count({
        where: { referrerId: user.id },
      }),
      db.referralCommission.aggregate({
        where: {
          referrerId: user.id,
          status: 'paid',
        },
        _sum: { amount: true },
      }),
    ]);

    return apiResponse({
      referralCode: user.referralCode,
      totalReferrals: referralCount,
      totalCommissionsEarned: commissionResult._sum.amount || 0,
    });
  } catch (error) {
    console.error('Referral info error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);