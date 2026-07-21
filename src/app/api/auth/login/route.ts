import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { email, password } = parsed.data;

    const user = await db.user.findUnique({
      where: { email },
      include: { profile: true, adminRecord: true, wallets: true },
    });

    if (!user) {
      return apiError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // Check if user is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / 60000
      );
      return apiError(
        `Account is locked. Try again in ${remainingMinutes} minutes.`,
        'ACCOUNT_LOCKED',
        423
      );
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return apiError('Account has been banned', 'ACCOUNT_BANNED', 403);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      const newAttemptCount = user.loginAttemptCount + 1;
      const shouldLock = newAttemptCount >= MAX_LOGIN_ATTEMPTS;
      const lockedUntil = shouldLock
        ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
        : null;

      await db.user.update({
        where: { id: user.id },
        data: {
          loginAttemptCount: newAttemptCount,
          lockedUntil,
        },
      });

      if (shouldLock) {
        return apiError(
          `Too many failed attempts. Account locked for ${LOCK_DURATION_MINUTES} minutes.`,
          'ACCOUNT_LOCKED',
          423
        );
      }

      return apiError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // Successful login - reset attempts
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await db.user.update({
      where: { id: user.id },
      data: {
        loginAttemptCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
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
    console.error('Login error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}