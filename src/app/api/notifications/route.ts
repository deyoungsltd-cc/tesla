import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function getHandler(_request: NextRequest, _context: any, user: any) {
  try {
    const { searchParams } = new URL(_request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.notification.count({ where: { userId: user.id } }),
    ]);

    return apiResponse({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

async function putHandler(request: NextRequest, _context: any, user: any) {
  try {
    const { searchParams } = new URL(request.url);
    const notifId = searchParams.get('id');
    if (!notifId) {
      return apiError('Notification ID is required', 'VALIDATION_ERROR', 400);
    }

    const notification = await db.notification.findFirst({
      where: { id: notifId, userId: user.id },
    });

    if (!notification) {
      return apiError('Notification not found', 'NOT_FOUND', 404);
    }

    const updated = await db.notification.update({
      where: { id: notifId },
      data: { isRead: true, readAt: new Date() },
    });

    return apiResponse(updated);
  } catch (error) {
    console.error('Mark notification read error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(getHandler);
export const PUT = requireAuth(putHandler);