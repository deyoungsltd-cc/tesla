import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, generateToken } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const verify2faSchema = z.object({
  pendingToken: z.string().min(1, 'Pending token is required'),
  otpCode: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, true);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many verification attempts. Try again in 1 minute.' } },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  try {
    const body = await request.json();
    const parsed = verify2faSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { pendingToken, otpCode } = parsed.data;

    // Verify the pending token (short-lived, 5 minutes)
    const payload = verifyToken(pendingToken);
    if (!payload) {
      return apiError('Invalid or expired session. Please try logging in again.', 'INVALID_PENDING_TOKEN', 401);
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id: payload.userId, email: payload.email },
      include: { profile: true, adminRecord: true, wallets: true },
    });

    if (!user) {
      return apiError('User not found', 'USER_NOT_FOUND', 404);
    }

    if (!user.twoFactorEnabled) {
      return apiError('2FA is not enabled for this account', '2FA_NOT_ENABLED', 400);
    }

    // Check OTP code
    if (!user.verificationCode) {
      return apiError('No verification code found. Please request a new one.', 'NO_OTP', 400);
    }

    if (user.verificationCodeExpires && new Date(user.verificationCodeExpires) < new Date()) {
      return apiError('Verification code has expired. Please request a new one.', 'OTP_EXPIRED', 400);
    }

    if (user.verificationCode !== otpCode.trim()) {
      return apiError('Invalid verification code', 'INVALID_OTP', 400);
    }

    // Clear verification code and generate real auth token
    await db.user.update({
      where: { id: user.id },
      data: {
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return apiResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        referralCode: user.referralCode,
        activeMode: user.activeMode,
        kycLevel: user.kycLevel,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        lastLoginIp: user.lastLoginIp,
        adminRecord: user.adminRecord ? {
          role: user.adminRecord.role,
          isSuperAdmin: user.adminRecord.isSuperAdmin,
        } : null,
        wallets: user.wallets?.map(w => ({
          id: w.id,
          type: w.type,
          balance: w.balance,
          availableBalance: w.availableBalance,
          lockedBalance: w.lockedBalance,
        })) || [],
        profile: user.profile
          ? {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              avatarUrl: user.profile.avatarUrl,
            }
          : null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
