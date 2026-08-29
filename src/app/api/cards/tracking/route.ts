import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(request: NextRequest, _context: any, user: any) {
  const cards = await db.card.findMany({
    where: { userId: user.id, type: 'physical' },
    orderBy: { createdAt: 'desc' },
  });
  return apiResponse(cards.map(c => ({
    id: c.id, lastFour: c.lastFour, cardBrand: c.cardBrand,
    status: c.status, shippingStatus: c.shippingStatus,
    shippingCarrier: c.shippingCarrier, trackingNumber: c.trackingNumber,
    orderedAt: c.orderedAt, shippedAt: c.shippedAt, deliveredAt: c.deliveredAt,
  })));
}

export const GET = requireAuth(handler);
