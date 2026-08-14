import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const orders = await db.vehicleOrder.findMany({
      where: { userId: user.id },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(orders);
  } catch (error: any) {
    console.error('Get my vehicle orders error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);
