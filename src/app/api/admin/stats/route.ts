import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(_request: NextRequest, _context: any, _user: any) {
  try {
    const [
      totalUsers,
      totalDepositsResult,
      totalInvestmentsResult,
      activeInvestments,
      pendingKyc,
      pendingWithdrawals,
      recentUsers,
    ] = await Promise.all([
      db.user.count({ where: { deletedAt: null } }),
      db.deposit.aggregate({
        where: { status: 'confirmed' },
        _sum: { amount: true },
      }),
      db.userInvestment.aggregate({
        _sum: { amount: true },
      }),
      db.userInvestment.count({ where: { status: 'active' } }),
      db.kYCVerification.count({ where: { status: 'pending' } }),
      db.withdrawal.count({ where: { status: 'pending' } }),
      db.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, email: true, status: true, createdAt: true, profile: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    return apiResponse({
      totalUsers,
      totalDeposits: totalDepositsResult._sum.amount || 0,
      totalInvestments: totalInvestmentsResult._sum.amount || 0,
      activeInvestments,
      pendingKyc,
      pendingWithdrawals,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('SUPER_ADMIN', 'ADMIN')(handler);