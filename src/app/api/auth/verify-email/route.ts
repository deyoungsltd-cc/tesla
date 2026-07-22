import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { generateOtpCode } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { apiResponse, apiError } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, action, name } = body;

    if (!email) return apiError('Email is required', 'MISSING_EMAIL', 400);

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return apiError('Account not found', 'USER_NOT_FOUND', 404);

    if (action === 'send' || action === 'resend') {
      // Rate limit: 60 seconds between sends
      if (action === 'resend' && user.verificationCodeExpires) {
        const codeCreatedAt = new Date(user.verificationCodeExpires).getTime() - 10 * 60 * 1000;
        if (Date.now() - codeCreatedAt < 60000) {
          return apiError('Please wait 60 seconds before requesting a new code', 'RATE_LIMITED', 429);
        }
      }

      const otp = generateOtpCode();
      await db.user.update({
        where: { email: email.toLowerCase() },
        data: {
          verificationCode: otp,
          verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      await sendVerificationEmail(email, otp, name || user.profile?.firstName);
      return apiResponse({ message: 'Verification code sent to your email' });
    }

    if (action === 'verify') {
      if (!code) return apiError('Verification code is required', 'MISSING_CODE', 400);

      if (!user.verificationCode) {
        return apiError('No verification code found. Please request a new one.', 'NO_OTP', 400);
      }

      if (user.verificationCodeExpires && new Date(user.verificationCodeExpires) < new Date()) {
        await db.user.update({
          where: { email: email.toLowerCase() },
          data: { verificationCode: null, verificationCodeExpires: null },
        });
        return apiError('Verification code has expired. Please request a new one.', 'OTP_EXPIRED', 400);
      }

      if (user.verificationCode !== code.trim()) {
        return apiError('Invalid verification code', 'INVALID_OTP', 400);
      }

      await db.user.update({
        where: { email: email.toLowerCase() },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          status: 'active',
          verificationCode: null,
          verificationCodeExpires: null,
        },
      });

      return apiResponse({ message: 'Email verified successfully', verified: true });
    }

    return apiError('Invalid action', 'INVALID_ACTION', 400);
  } catch (error: any) {
    console.error('Email verification error:', error);
    return apiError('Failed to process verification', 'INTERNAL_ERROR', 500);
  }
}