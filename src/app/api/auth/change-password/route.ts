import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { currentPassword, newPassword } = parsed.data;

    // Fetch fresh user with password hash
    const freshUser = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!freshUser) {
      return apiError('User not found', 'NOT_FOUND', 404);
    }

    const isValid = await verifyPassword(currentPassword, freshUser.passwordHash);
    if (!isValid) {
      return apiError('Current password is incorrect', 'INVALID_PASSWORD', 400);
    }

    const newHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return apiResponse({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);