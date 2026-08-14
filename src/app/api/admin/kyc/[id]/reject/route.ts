import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { sendAdminNotificationEmail } from '@/lib/email';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(3, 'Rejection reason is required'),
});

async function handler(request: NextRequest, context: any, adminUser: any) {
  try {
    const { id } = await context.params;

    const body = await request.json();
    const parsed = rejectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const verification = await db.kYCVerification.findUnique({
      where: { id },
    });

    if (!verification) {
      return apiError('KYC verification not found', 'NOT_FOUND', 404);
    }

    if (verification.status !== 'pending') {
      return apiError('KYC verification is not in pending status', 'INVALID_STATUS', 400);
    }

    await db.$transaction(async (tx) => {
      await tx.kYCVerification.update({
        where: { id },
        data: {
          status: 'rejected',
          verifiedAt: new Date(),
          notes: parsed.data.reason,
        },
      });

      // Reject all pending documents for this user
      await tx.kYCDocument.updateMany({
        where: { userId: verification.userId, status: 'pending' },
        data: {
          status: 'rejected',
          rejectionReason: parsed.data.reason,
          reviewedBy: adminUser.id,
          reviewedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: verification.userId,
          type: 'kyc_rejected',
          title: 'KYC Verification Rejected',
          message: `Your KYC verification has been rejected. Reason: ${parsed.data.reason}. Please resubmit your documents.`,
        },
      });
    });

    // Send email notification asynchronously
    const kycUser = await db.user.findUnique({ where: { id: verification.userId }, include: { profile: true } });
    if (kycUser) {
      const userName = kycUser.profile
        ? `${kycUser.profile.firstName || ''} ${kycUser.profile.lastName || ''}`.trim()
        : kycUser.email;
      sendAdminNotificationEmail(kycUser.email, userName, {
        type: 'kyc_rejected',
        title: 'KYC Verification Rejected',
        message: 'Your KYC verification has been rejected. Please resubmit your documents for review.',
        adminMessage: `Rejection reason: ${parsed.data.reason}`,
      }).catch((err) => console.error('Failed to send KYC rejection email:', err));
    }

    return apiResponse({ message: 'KYC rejected successfully' });
  } catch (error) {
    console.error('Admin reject KYC error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN', 'COMPLIANCE')(handler);