import { NextRequest } from 'next/server';
import { InvestmentStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(_request: NextRequest, _context: any, user: any) {
  try {
    const { searchParams } = new URL(_request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const completedStatuses: InvestmentStatus[] = ['completed', 'failed', 'cancelled'];

    const where = {
      userId: user.id,
      status: { in: completedStatuses },
    };

    const [investments, total] = await Promise.all([
      db.userInvestment.findMany({
        where,
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.userInvestment.count({ where }),
    ]);

    return apiResponse({
      investments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Investment history error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);