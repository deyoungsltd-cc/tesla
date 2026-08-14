import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

// GET /api/admin/users — list all users with search & pagination
async function listHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50') || 50)) || 50));
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
async function updateHandler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const { userId, action, value } = body;

    if (!userId || !action) {
      return apiError('userId and action are required', 'VALIDATION_ERROR', 400);
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) return apiError('User not found', 'NOT_FOUND', 404);

    // Get admin record
    const admin = await db.admin.findUnique({ where: { userId: user.id } });

    if (action === 'status') {
      if (!['active', 'suspended', 'banned', 'closed'].includes(value)) {
        return apiError('Invalid status value', 'VALIDATION_ERROR', 400);
      }
      const updated = await db.user.update({ where: { id: userId }, data: { status: value } });
      if (admin) {
        await db.auditLog.create({
          data: {
            adminId: admin.userId,
            action: 'update_status',
            target: userId,
            details: JSON.stringify({ from: targetUser.status, to: value, email: targetUser.email }),
          },
        });
      }
      return apiResponse({ id: updated.id, status: updated.status });
    }

    if (action === 'kyc_level') {
      if (!['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3'].includes(value)) {
        return apiError('Invalid KYC level', 'VALIDATION_ERROR', 400);
      }
      const updated = await db.user.update({ where: { id: userId }, data: { kycLevel: value } });
      if (admin) {
        await db.auditLog.create({
          data: {
            adminId: admin.userId,
            action: 'update_kyc_level',
            target: userId,
            details: JSON.stringify({ from: targetUser.kycLevel, to: value, email: targetUser.email }),
          },
        });
      }
      return apiResponse({ id: updated.id, kycLevel: updated.kycLevel });
    }

    if (action === 'email_verify') {
      const updated = await db.user.update({ where: { id: userId }, data: { emailVerified: true, emailVerifiedAt: new Date() } });
      if (admin) {
        await db.auditLog.create({
          data: {
            adminId: admin.userId,
            action: 'email_verify',
            target: userId,
            details: JSON.stringify({ email: targetUser.email }),
          },
        });
      }
      return apiResponse({ id: updated.id, emailVerified: true });
    }

    if (action === 'adjust_balance') {
      const { walletType, amount } = body;
      if (!walletType || amount === undefined || typeof amount !== 'number') {
        return apiError('walletType and a valid numeric amount are required', 'VALIDATION_ERROR', 400);
      }
      if (amount === 0) {
        return apiError('Amount cannot be zero', 'VALIDATION_ERROR', 400);
      }
      // Wrap in transaction to prevent race conditions
      let wallet = await db.wallet.findFirst({ where: { userId, type: walletType } });
      if (!wallet) {
        // Auto-create wallet if it doesn't exist (e.g. missing demo wallet)
        wallet = await db.wallet.create({
          data: { userId, type: walletType, balance: 0, availableBalance: 0, lockedBalance: 0 },
        });
      }
      
      const updated = await db.$transaction(async (tx) => {
        const w = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: amount },
            availableBalance: amount > 0 ? { increment: amount } : { decrement: Math.min(Math.abs(amount), Number(wallet.availableBalance)) },
          },
        });
        // Create audit transaction record
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'balance_adjustment',
            status: 'completed',
            amount: Math.abs(amount),
            description: `Admin balance adjustment (${amount > 0 ? '+' : ''}${amount})`,
          },
        });
        return w;
      });
      if (admin) {
        await db.auditLog.create({
          data: {
            adminId: admin.userId,
            action: 'adjust_balance',
            target: userId,
            details: JSON.stringify({ walletType, amount, email: targetUser.email }),
          },
        });
      }
      return apiResponse({ walletId: updated.id, balance: Number(updated.balance) });
    }

    if (action === 'set_balance') {
      const { walletType, balance, availableBalance } = body;
      if (!walletType || balance === undefined || typeof balance !== 'number') {
        return apiError('walletType and a valid numeric balance are required', 'VALIDATION_ERROR', 400);
      }
      if (balance < 0) {
        return apiError('Balance cannot be negative', 'VALIDATION_ERROR', 400);
      }
      let wallet = await db.wallet.findFirst({ where: { userId, type: walletType } });
      if (!wallet) {
        wallet = await db.wallet.create({
          data: { userId, type: walletType, balance: 0, availableBalance: 0, lockedBalance: 0 },
        });
      }

      const newAvail = availableBalance !== undefined ? availableBalance : balance;
      if (newAvail < 0) {
        return apiError('Available balance cannot be negative', 'VALIDATION_ERROR', 400);
      }

      const oldBalance = Number(wallet.balance);
      const updated = await db.$transaction(async (tx) => {
        const w = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance,
            availableBalance: newAvail,
          },
        });
        const diff = balance - oldBalance;
        if (diff !== 0) {
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              type: 'balance_adjustment',
              status: 'completed',
              amount: Math.abs(diff),
              description: `Admin set balance to $${balance} (was $${oldBalance}, diff: ${diff > 0 ? '+' : ''}${diff})`,
            },
          });
        }
        return w;
      });
      if (admin) {
        await db.auditLog.create({
          data: {
            adminId: admin.userId,
            action: 'adjust_balance',
            target: userId,
            details: JSON.stringify({ walletType, action: 'set_balance', oldBalance, newBalance: balance, newAvailable: newAvail, email: targetUser.email }),
          },
        });
      }
      return apiResponse({ walletId: updated.id, balance: updated.balance, availableBalance: updated.availableBalance });
    }

    if (action === 'delete') {
      const updated = await db.user.update({ where: { id: userId }, data: { deletedAt: new Date(), status: 'closed' } });
      if (admin) {
        await db.auditLog.create({
          data: {
            adminId: admin.userId,
            action: 'delete_user',
            target: userId,
            details: JSON.stringify({ email: targetUser.email }),
          },
        });
      }
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
