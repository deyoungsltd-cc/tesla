import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateReferralCode, generateToken } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  referralCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { email, password, referralCode } = parsed.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError('Email already registered', 'EMAIL_EXISTS', 409);
    }

    // Validate referral code if provided
    let referredById: string | undefined;
    if (referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() },
      });
      if (!referrer) {
        return apiError('Invalid referral code', 'INVALID_REFERRAL_CODE', 400);
      }
      referredById = referrer.id;
    }

    const passwordHash = await hashPassword(password);
    const newReferralCode = generateReferralCode();

    const user = await db.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          referralCode: newReferralCode,
          referredById,
          status: 'active',
        },
      });

      // Create profile
      await tx.profile.create({
        data: { userId: newUser.id },
      });

      // Create demo wallet
      await tx.wallet.create({
        data: {
          userId: newUser.id,
          type: 'demo',
          balance: 0,
          availableBalance: 0,
          lockedBalance: 0,
        },
      });

      // Create live wallet
      await tx.wallet.create({
        data: {
          userId: newUser.id,
          type: 'live',
          balance: 0,
          availableBalance: 0,
          lockedBalance: 0,
        },
      });

      // Create referral record if referred
      if (referredById) {
        await tx.referral.create({
          data: {
            referrerId: referredById,
            referredId: newUser.id,
            code: referralCode!.toUpperCase(),
          },
        });
      }

      return newUser;
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return apiResponse(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          status: user.status,
          referralCode: user.referralCode,
          activeMode: user.activeMode,
          kycLevel: user.kycLevel,
          createdAt: user.createdAt,
        },
      },
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return apiError('Email already registered', 'EMAIL_EXISTS', 409);
    }
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}