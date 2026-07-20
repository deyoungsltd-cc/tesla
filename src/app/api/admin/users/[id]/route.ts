import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

async function getHandler(_request: NextRequest, context: any, _user: any) {
  try {
    const { id } = await context.params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        profile: true,
        wallets: true,
        deposits: { orderBy: { createdAt: 'desc' }, take: 10 },
        withdrawals: { orderBy: { createdAt: 'desc' }, take: 10 },
        investments: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        kycDocuments: { orderBy: { createdAt: 'desc' } },
        kycVerifications: true,
        supportTickets: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: {
          select: {
            referrals: true,
            referralCommissions: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      return apiError('User not found', 'NOT_FOUND', 404);
    }

    return apiResponse(user);
  } catch (error) {
    console.error('Admin get user error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

async function putHandler(request: NextRequest, context: any, _user: any) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'suspended', 'banned'].includes(status)) {
      return apiError('Invalid status. Must be: active, suspended, or banned', 'VALIDATION_ERROR', 400);
    }

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError('User not found', 'NOT_FOUND', 404);
    }

    const updated = await db.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, status: true },
    });

    return apiResponse(updated);
  } catch (error) {
    console.error('Admin update user error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

async function deleteHandler(_request: NextRequest, context: any, _user: any) {
  try {
    const { id } = await context.params;

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError('User not found', 'NOT_FOUND', 404);
    }

    await db.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'closed' },
    });

    return apiResponse({ message: 'User soft-deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('SUPER_ADMIN', 'ADMIN')(getHandler);
export const PUT = requireRole('SUPER_ADMIN', 'ADMIN')(putHandler);
export const DELETE = requireRole('SUPER_ADMIN', 'ADMIN')(deleteHandler);