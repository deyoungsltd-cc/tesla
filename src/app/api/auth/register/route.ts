import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateReferralCode, generateToken, generateOtpCode } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/api-helpers';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  referralCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { email, password, firstName, lastName, referralCode } = parsed.data;

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
        data: { userId: newUser.id, firstName: firstName || null, lastName: lastName || null },
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

    // Send verification email with OTP stored in DB
    const hasEmailService = !!process.env.RESEND_API_KEY;
    if (hasEmailService) {
      try {
        const otp = generateOtpCode();
        await db.user.update({
          where: { id: user.id },
          data: {
            verificationCode: otp,
            verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
          },
        });
        await sendVerificationEmail(email, otp, `${firstName || ''} ${lastName || ''}`.trim() || undefined);
      } catch (emailErr) {
        console.error('Failed to send verification email (non-blocking):', emailErr);
      }
    } else {
      // Auto-verify when email service is not configured
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    }

    return apiResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          status: user.status,
          referralCode: user.referralCode,
          activeMode: user.activeMode,
          kycLevel: user.kycLevel,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        message: 'Account created. Please verify your email to continue.',
      },
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return apiError('Email already registered', 'EMAIL_EXISTS', 409);
    }
    // Expose DB connection errors for diagnosis
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes('connect') || msg.includes('ECONNREFUSED') || msg.includes('prisma')) {
        return apiError('Database connection error. Please ensure DATABASE_URL is configured.', 'DB_CONNECTION_ERROR', 500);
      }
    }
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}