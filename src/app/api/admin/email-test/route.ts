import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail, getEmailConfig } from '@/lib/email';
import { generateOtpCode } from '@/lib/auth';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

/**
 * POST /api/admin/email-test
 * Body: { email: "user@example.com" }
 * Sends a test OTP email to the specified address.
 * Admin-only — used to verify email delivery is working.
 *
 * Returns full diagnostic info: provider used, messageId, error (if any),
 * so admins can see exactly what happened instead of guessing.
 */
async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return apiError('Email address is required', 'VALIDATION_ERROR', 400);
    }

    const config = getEmailConfig();
    const otp = generateOtpCode();
    console.log(`[EMAIL-TEST] Sending test OTP ${otp} to ${email}`);
    console.log(`[EMAIL-TEST] Config:`, config);

    try {
      const result = await sendVerificationEmail(email, otp, 'Test User');
      console.log(`[EMAIL-TEST] Sent via ${result.provider}, id: ${result.messageId}`);
      return apiResponse({
        message: `Test OTP email sent to ${email} via ${result.provider}`,
        success: true,
        provider: result.provider,
        messageId: result.messageId,
        otp,
        config: {
          provider: config.provider,
          fromEmail: config.fromEmail,
          hasConfig: config.hasConfig,
        },
      });
    } catch (emailErr: any) {
      console.error(`[EMAIL-TEST] FAILED:`, emailErr?.message);
      return apiResponse({
        message: `Failed to send OTP email to ${email}`,
        success: false,
        error: emailErr?.message || 'Unknown error',
        otp,
        config: {
          provider: config.provider,
          fromEmail: config.fromEmail,
          hasConfig: config.hasConfig,
        },
      });
    }
  } catch (error: any) {
    console.error('Email test error:', error);
    return apiError('Internal server error: ' + (error?.message || ''), 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN')(handler);
