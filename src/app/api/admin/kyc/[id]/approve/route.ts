import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { sendAdminNotificationEmail } from '@/lib/email';

async function handler(_request: NextRequest, context: any, adminUser: any) {
  try {
    const { id } = await context.params;

    const verification = await db.kYCVerification.findUnique({
      where: { id },
      include: { user: { include: { profile: true } } },
    });

    if (!verification) {
      return apiError('KYC verification not found', 'NOT_FOUND', 404);
    }

    if (verification.status !== 'pending') {
      return apiError('KYC verification is not in pending status', 'INVALID_STATUS', 400);
    }

    const kycLevelMap: Record<string, string> = {
      LEVEL_0: 'LEVEL_0',
      LEVEL_1: 'LEVEL_1',
      LEVEL_2: 'LEVEL_2',
      LEVEL_3: 'LEVEL_3',
    };

    await db.$transaction(async (tx) => {
      // Approve KYC verification
      await tx.kYCVerification.update({
        where: { id },
        data: {
          status: 'approved',
          verifiedAt: new Date(),
        },
      });

      // Update user KYC level
      await tx.user.update({
        where: { id: verification.userId },
        data: { kycLevel: verification.level as any },
      });

      // Approve all pending documents for this user
      await tx.kYCDocument.updateMany({
        where: { userId: verification.userId, status: 'pending' },
        data: {
          status: 'approved',
          reviewedBy: adminUser.id,
          reviewedAt: new Date(),
        },
      });

      // Notify user
      await tx.notification.create({
        data: {
          userId: verification.userId,
          type: 'kyc_approved',
          title: 'KYC Verification Approved',
          message: `Your Level ${verification.level.replace('LEVEL_', '')} KYC verification has been approved.`,
        },
      });
    });

    // Send email notification asynchronously
    const userName = verification.user.profile
      ? `${verification.user.profile.firstName || ''} ${verification.user.profile.lastName || ''}`.trim()
      : verification.user.email;
    sendAdminNotificationEmail(verification.user.email, userName, {
      type: 'kyc_approved',
      title: 'KYC Verification Approved',
      message: `Congratulations! Your Level ${verification.level.replace('LEVEL_', '')} KYC verification has been approved. You now have access to higher deposit and withdrawal limits.`,
    }).catch((err) => console.error('Failed to send KYC approval email:', err));

    return apiResponse({ message: 'KYC approved successfully' });
  } catch (error) {
    console.error('Admin approve KYC error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN', 'COMPLIANCE')(handler);