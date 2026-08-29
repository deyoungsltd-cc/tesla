import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(request: NextRequest, _context: any, user: any) {
  if (request.method === 'GET') {
    const cards = await db.card.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    return apiResponse(cards.map(c => ({ ...c, frozen: c.status === 'frozen' })));
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const { type, cardBrand = 'Visa', color = '#2563EB', planId, shippingAddress, fee = 0 } = body;

    // Check existing card limit
    const existingCards = await db.card.count({ where: { userId: user.id, type } });
    if (type === 'virtual' && existingCards >= 3) return apiError('Maximum 3 virtual cards allowed', 'LIMIT_EXCEEDED', 400);
    if (type === 'physical' && existingCards >= 2) return apiError('Maximum 2 physical cards allowed', 'LIMIT_EXCEEDED', 400);

    const lastFour = String(Math.floor(1000 + Math.random() * 9000));
    const expiryMonth = String(12);
    const expiryYear = String(new Date().getFullYear() + 4).slice(-2);
    const cardNumber = type === 'virtual' ? `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${lastFour}` : null;
    const cvv = type === 'virtual' ? String(Math.floor(100 + Math.random() * 900)) : null;

    const card = await db.card.create({
      data: {
        userId: user.id, type, status: type === 'virtual' ? 'active' : 'ordered',
        lastFour, expiryMonth, expiryYear, cvv, cardBrand, color,
        spendingLimit: type === 'virtual' ? 5000 : 10000,
        shippingStatus: type === 'physical' ? 'ordered' : null,
        orderedAt: new Date(),
      },
    });

    return apiResponse({ ...card, frozen: false, cardNumber, cvv }, 201);
  }

  if (request.method === 'PATCH') {
    const body = await request.json();
    const { cardId, action, spendingLimit } = body;

    const card = await db.card.findFirst({ where: { id: cardId, userId: user.id } });
    if (!card) return apiError('Card not found', 'NOT_FOUND', 404);

    if (action === 'freeze') {
      const updated = await db.card.update({ where: { id: cardId }, data: { status: 'frozen' } });
      return apiResponse({ ...updated, frozen: true });
    }
    if (action === 'unfreeze') {
      const updated = await db.card.update({ where: { id: cardId }, data: { status: 'active' } });
      return apiResponse({ ...updated, frozen: false });
    }
    if (action === 'set_limit' && spendingLimit !== undefined) {
      const updated = await db.card.update({ where: { id: cardId }, data: { spendingLimit } });
      return apiResponse({ ...updated, frozen: updated.status === 'frozen' });
    }
    return apiError('Invalid action', 'INVALID_ACTION', 400);
  }

  return apiError('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);
export const PATCH = requireAuth(handler);
