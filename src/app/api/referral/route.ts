import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(_request: NextRequest, _context: any, user: any) {
  try {
    const referrals = await db.referral.findMany({
      where: { referrerId: user.id },
      select: { referredId: true },
    });

    const referredIds = referrals.map((r: { referredId: string }) => r.referredId);

    let kycCompleted = 0;
    let firstDeposit = 0;
    let vehicleOrders = 0;

    if (referredIds.length > 0) {
      const [kycResult, depositUsers, vehicleResult] = await Promise.all([
        db.user.count({
          where: { id: { in: referredIds }, kycLevel: { not: 'LEVEL_0' } },
        }),
        db.deposit.groupBy({
          by: ['userId'],
          where: { userId: { in: referredIds }, status: 'confirmed' },
        }),
        db.vehicleOrder.groupBy({
          by: ['userId'],
          where: { userId: { in: referredIds }, status: { notIn: ['cancelled'] } },
        }),
      ]);
      kycCompleted = kycResult;
      firstDeposit = depositUsers.length;
      vehicleOrders = vehicleResult.length;
    }

    const commissionResult = await db.referralCommission.aggregate({
      where: { referrerId: user.id, status: 'paid' },
      _sum: { amount: true },
    });

    const pendingResult = await db.referralCommission.aggregate({
      where: { referrerId: user.id, status: 'pending' },
      _sum: { amount: true },
    });

    return apiResponse({
      referralCode: user.referralCode,
      totalReferrals: referrals.length,
      totalCommissionsEarned: Number(commissionResult._sum.amount || 0),
      pendingCommissions: Number(pendingResult._sum.amount || 0),
      funnel: { totalReferred: referrals.length, kycCompleted, firstDeposit, vehicleOrders },
    });
  } catch (error) {
    console.error('Referral info error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);
