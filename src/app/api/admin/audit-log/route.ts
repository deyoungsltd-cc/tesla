import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20') || 20));

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          admin: {
            include: {
              user: {
                select: { email: true },
              },
            },
          },
          user: {
            select: { email: true, profile: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
      db.auditLog.count(),
    ]);

    const formatted = logs.map((log) => ({
      id: log.id,
      action: log.action,
      target: log.target,
      details: log.details,
      createdAt: log.createdAt,
      adminEmail: log.admin?.user?.email || 'Unknown',
      userEmail: log.user?.email || null,
    }));

    return apiResponse({ logs: formatted, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin audit log error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('SUPER_ADMIN', 'ADMIN')(handler);
