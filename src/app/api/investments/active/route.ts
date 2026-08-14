import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(_request: NextRequest, _context: any, user: any) {
  try {
    const investments = await db.userInvestment.findMany({
      where: {
        userId: user.id,
        status: 'active',
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(investments);
  } catch (error) {
    console.error('Active investments error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);