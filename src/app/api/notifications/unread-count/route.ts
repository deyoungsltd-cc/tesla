import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(_request: NextRequest, _context: any, user: any) {
  try {
    const count = await db.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return apiResponse({ count });
  } catch (error) {
    console.error('Unread count error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);