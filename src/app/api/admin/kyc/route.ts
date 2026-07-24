import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { sendAdminNotificationEmail } from '@/lib/email';

// GET /api/admin/kyc — list KYC verifications with filters
async function listHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') || '';

    const where: any = {};
    if (status) where.status = status;

    const [verifications, total] = await Promise.all([
      db.kYCVerification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, country: true } } } },
        },
      }),
      db.kYCVerification.count({ where }),
    ]);

    return apiResponse({ verifications, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin list KYC error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// PATCH /api/admin/kyc — approve or reject KYC
async function updateHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { verificationId, action, reason, adminMessage, attachmentUrl } = body;

    if (!verificationId || !action) {
      return apiError('verificationId and action are required', 'VALIDATION_ERROR', 400);
    }

    const verification = await db.kYCVerification.findUnique({
      where: { id: verificationId },
      include: { user: { include: { profile: true } } },
    });
    if (!verification) return apiError('Verification not found', 'NOT_FOUND', 404);
    if (verification.status !== 'pending') {
      return apiError('Verification is not in a pending state', 'INVALID_STATE', 400);
    }

    const userName = verification.user.profile
      ? `${verification.user.profile.firstName || ''} ${verification.user.profile.lastName || ''}`.trim()
      : verification.user.email;
    const userEmail = verification.user.email;

    if (action === 'approve') {
      const result = await db.$transaction(async (tx) => {
        const updated = await tx.kYCVerification.update({
          where: { id: verificationId },
          data: { status: 'approved', verifiedAt: new Date() },
        });

        const nextLevel = verification.level === 'LEVEL_0' ? 'LEVEL_1' : verification.level;
        await tx.user.update({
          where: { id: verification.userId },
          data: { kycLevel: nextLevel },
        });

        const msg = adminMessage || `Your KYC verification (Level ${verification.level}) has been approved. Your account level is now ${nextLevel}.`;
        await tx.notification.create({
          data: {
            userId: verification.userId,
            type: 'kyc_approved',
            title: 'KYC Approved',
            message: msg,
          },
        });

        return updated;
      });

      // Send email asynchronously (non-blocking)
      sendAdminNotificationEmail(userEmail, userName, {
        type: 'kyc_approved',
        title: 'KYC Verification Approved',
        message: `Your KYC verification (Level ${verification.level}) has been approved. Your account level is now ${verification.level === 'LEVEL_0' ? 'LEVEL_1' : verification.level}. You now have access to higher deposit limits and premium features.`,
        adminMessage,
        attachmentUrl,
      }).catch((err) => console.error('Failed to send KYC approval email:', err));

      return apiResponse(result);
    }

    if (action === 'reject') {
      const result = await db.$transaction(async (tx) => {
        const updated = await tx.kYCVerification.update({
          where: { id: verificationId },
          data: { status: 'rejected', notes: reason || 'Rejected by admin' },
        });

        const msg = adminMessage || `Your KYC verification was rejected. Reason: ${reason || 'Not specified'}. Please resubmit with correct documents.`;
        await tx.notification.create({
          data: {
            userId: verification.userId,
            type: 'kyc_rejected',
            title: 'KYC Rejected',
            message: msg,
          },
        });

        return updated;
      });

      // Send email asynchronously (non-blocking)
      sendAdminNotificationEmail(userEmail, userName, {
        type: 'kyc_rejected',
        title: 'KYC Verification Rejected',
        message: `Your KYC verification was rejected. Reason: ${reason || 'Not specified'}. Please resubmit with correct documents for review.`,
        adminMessage,
        attachmentUrl,
      }).catch((err) => console.error('Failed to send KYC rejection email:', err));

      return apiResponse(result);
    }

    return apiError('Unknown action', 'INVALID_ACTION', 400);
  } catch (error) {
    console.error('Admin update KYC error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('SUPER_ADMIN', 'ADMIN')(listHandler);
export const PATCH = requireRole('SUPER_ADMIN', 'ADMIN')(updateHandler);
