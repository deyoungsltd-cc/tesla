import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Code must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, true);
  if (!rl.success) {
    return NextResponse.json({ success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many reset attempts. Try again in 1 minute.' } }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { email, code, newPassword } = parsed.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't leak email existence — return same message as invalid code
      return apiError('Invalid or expired reset code. Please request a new one.', 'INVALID_CODE', 400);
    }

    if (!user.verificationCode) {
      return apiError('No reset code found. Please request a new one.', 'NO_CODE', 400);
    }

    if (user.verificationCodeExpires && new Date(user.verificationCodeExpires) < new Date()) {
      await db.user.update({
        where: { email: email.toLowerCase() },
        data: { verificationCode: null, verificationCodeExpires: null },
      });
      return apiError('Reset code has expired. Please request a new one.', 'CODE_EXPIRED', 400);
    }

    if (user.verificationCode !== code.trim()) {
      return apiError('Invalid reset code', 'INVALID_CODE', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await db.user.update({
      where: { email: email.toLowerCase() },
      data: {
        passwordHash,
        verificationCode: null,
        verificationCodeExpires: null,
        loginAttemptCount: 0,
        lockedUntil: null,
      },
    });

    return apiResponse({ message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
