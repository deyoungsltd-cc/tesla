import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const modeSchema = z.object({
  mode: z.enum(['demo', 'live']),
});

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = modeSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { activeMode: parsed.data.mode },
      select: { id: true, activeMode: true },
    });

    return apiResponse(updated);
  } catch (error) {
    console.error('Switch mode error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const PUT = requireAuth(handler);