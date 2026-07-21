import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

// GET /api/admin/users — list all users with search & pagination
async function listHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { profile: { firstName: { contains: search } } },
        { profile: { lastName: { contains: search } } },
      ];
    }
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, status: true, kycLevel: true, activeMode: true,
          emailVerified: true, twoFactorEnabled: true, createdAt: true, lastLoginAt: true,
          profile: { select: { firstName: true, lastName: true, phone: true, country: true } },
          wallets: { select: { type: true, balance: true, availableBalance: true } },
          _count: { select: { deposits: true, investments: true, withdrawals: true, referrals: true } },
        },
      }),
      db.user.count({ where }),
    ]);

    return apiResponse({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin list users error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// PATCH /api/admin/users — update user status, kyc level, balance adjustments
async function updateHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, value } = body;

    if (!userId || !action) {
      return apiError('userId and action are required', 'VALIDATION_ERROR', 400);
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return apiError('User not found', 'NOT_FOUND', 404);

    if (action === 'status') {
      if (!['active', 'suspended', 'banned', 'closed'].includes(value)) {
        return apiError('Invalid status value', 'VALIDATION_ERROR', 400);
      }
      const updated = await db.user.update({ where: { id: userId }, data: { status: value } });
      return apiResponse({ id: updated.id, status: updated.status });
    }

    if (action === 'kyc_level') {
      if (!['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3'].includes(value)) {
        return apiError('Invalid KYC level', 'VALIDATION_ERROR', 400);
      }
      const updated = await db.user.update({ where: { id: userId }, data: { kycLevel: value } });
      return apiResponse({ id: updated.id, kycLevel: updated.kycLevel });
    }

    if (action === 'email_verify') {
      const updated = await db.user.update({ where: { id: userId }, data: { emailVerified: true, emailVerifiedAt: new Date() } });
      return apiResponse({ id: updated.id, emailVerified: true });
    }

    if (action === 'adjust_balance') {
      const { walletType, amount } = body;
      if (!walletType || amount === undefined) {
        return apiError('walletType and amount are required', 'VALIDATION_ERROR', 400);
      }
      const wallet = await db.wallet.findFirst({ where: { userId, type: walletType } });
      if (!wallet) return apiError('Wallet not found', 'NOT_FOUND', 404);
      const updated = await db.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount }, availableBalance: { increment: Math.max(0, amount) } },
      });
      return apiResponse({ walletId: updated.id, balance: updated.balance });
    }

    if (action === 'delete') {
      const updated = await db.user.update({ where: { id: userId }, data: { deletedAt: new Date(), status: 'closed' } });
      return apiResponse({ id: updated.id, status: 'deleted' });
    }

    return apiError('Unknown action', 'INVALID_ACTION', 400);
  } catch (error) {
    console.error('Admin update user error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('SUPER_ADMIN', 'ADMIN')(listHandler);
export const PATCH = requireRole('SUPER_ADMIN', 'ADMIN')(updateHandler);