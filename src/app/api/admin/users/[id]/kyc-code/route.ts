import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { sendKycCodeRequiredEmail, sendKycCodeDeliveredEmail } from '@/lib/email';
import { logUserAction } from '@/lib/user-audit';
import { z } from 'zod';

// Step 1: Generate code (NO email sent — waiting for purchase confirmation)
const generateSchema = z.object({
  code: z.string().min(4, 'Code must be at least 4 characters').max(64, 'Code too long'),
  adminMessage: z.string().optional(),
});

// Step 2: Confirm purchase & send code email
const confirmSchema = z.object({
  action: z.literal('confirm_purchase'),
  adminMessage: z.string().optional(),
});

async function handler(request: NextRequest, context: any, adminUser: any) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const actionField = body.action;

    // ── STEP 2: Admin confirms client purchased the code → send email ──
    if (actionField === 'confirm_purchase') {
      const parsed = confirmSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);

      const { adminMessage } = parsed.data;

      const targetUser = await db.user.findUnique({
        where: { id },
        include: { profile: true },
      });
      if (!targetUser) return apiError('User not found', 'NOT_FOUND', 404);
      if (!targetUser.kycVerificationCode) return apiError('No code generated yet. Generate a code first.', 'NO_CODE', 400);
      if (targetUser.kycCodePurchased) return apiError('Code already confirmed and sent.', 'ALREADY_CONFIRMED', 400);

      // Mark as purchased
      await db.user.update({
        where: { id },
        data: { kycCodePurchased: true },
      });

      const fullName = targetUser.profile
        ? `${targetUser.profile.firstName || ''} ${targetUser.profile.lastName || ''}`.trim()
        : '';

      // NOW send the code email
      await sendKycCodeDeliveredEmail(targetUser.email, fullName, {
        code: targetUser.kycVerificationCode,
        adminMessage,
      });

      // Notify client in-app
      await db.notification.create({
        data: {
          userId: targetUser.id,
          type: 'kyc_submitted',
          title: 'KYC Verification Code Issued',
          message: `Your KYC Verification Code has been issued and sent to your email. Check your inbox and use the code to complete your Level 1 KYC verification.`,
        },
      });

      await logUserAction(adminUser.id, 'confirm_kyc_code_purchase', {
        resource: 'user',
        resourceId: targetUser.id,
        details: { code: targetUser.kycVerificationCode },
        request,
      });

      return apiResponse({
        message: 'Purchase confirmed. KYC code has been sent to the client\'s email.',
        userId: targetUser.id,
        confirmed: true,
      });
    }

    // ── STEP 1: Generate code (NO email — just saves to DB) ──
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);

    const { code, adminMessage } = parsed.data;

    const targetUser = await db.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!targetUser) return apiError('User not found', 'NOT_FOUND', 404);

    await db.user.update({
      where: { id },
      data: {
        kycVerificationCode: code.trim(),
        kycCodeExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        kycCodePurchased: false,
      },
    });

    // Send "code required — please purchase" warning email ONLY
    const fullName = targetUser.profile
      ? `${targetUser.profile.firstName || ''} ${targetUser.profile.lastName || ''}`.trim()
      : '';

    sendKycCodeRequiredEmail(targetUser.email, fullName, { adminMessage }).catch((err) =>
      console.error('Failed to send KYC code required email:', err)
    );

    // Notify client in-app: code pending, needs to purchase
    await db.notification.create({
      data: {
        userId: targetUser.id,
        type: 'kyc_submitted',
        title: 'KYC Verification Code — Purchase Required',
        message: 'A KYC Verification Code has been generated for your account. Please contact our admin team via live chat or email to complete your purchase and receive your code.',
      },
    });

    await logUserAction(adminUser.id, 'set_kyc_code', {
      resource: 'user',
      resourceId: targetUser.id,
      details: { code: code.trim(), purchased: false },
      request,
    });

    return apiResponse({
      message: 'KYC code generated. Client has been notified to purchase. Use "Confirm Purchase" to send the code.',
      userId: targetUser.id,
      code: code.trim(),
      purchased: false,
    });
  } catch (error) {
    console.error('Admin KYC code error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN', 'COMPLIANCE')(handler);
