import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const txType = searchParams.get('txType');

    if (!type || !['demo', 'live'].includes(type)) {
      return apiError('Wallet type is required (demo or live)', 'VALIDATION_ERROR', 400);
    }

    const wallet = await db.wallet.findFirst({
      where: { userId: user.id, type: type as 'demo' | 'live' },
    });

    if (!wallet) {
      return apiError('Wallet not found', 'WALLET_NOT_FOUND', 404);
    }

    const where: any = { walletId: wallet.id };
    if (txType) where.type = txType;

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.transaction.count({ where }),
    ]);

    return apiResponse({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Wallet transactions error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);