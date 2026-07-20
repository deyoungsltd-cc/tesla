import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(_request: NextRequest, _context: any, user: any) {
  try {
    const wallets = await db.wallet.findMany({
      where: { userId: user.id },
      orderBy: { type: 'asc' },
    });

    return apiResponse(wallets);
  } catch (error) {
    console.error('Get wallets error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);