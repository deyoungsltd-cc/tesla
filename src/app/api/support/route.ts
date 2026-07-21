import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const ticketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

async function postHandler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = ticketSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { subject, message } = parsed.data;

    const ticket = await db.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        message,
        status: 'open',
        priority: 'medium',
      },
    });

    return apiResponse(ticket, 201);
  } catch (error) {
    console.error('Create ticket error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

async function getHandler(_request: NextRequest, _context: any, user: any) {
  try {
    const { searchParams } = new URL(_request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      db.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.supportTicket.count({ where }),
    ]);

    return apiResponse({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(postHandler);
export const GET = requireAuth(getHandler);