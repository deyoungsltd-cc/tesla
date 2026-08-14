import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { sendKycCodeRequiredEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const kycSubmitSchema = z.object({
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  verificationCode: z.string().optional(),
  documents: z.array(
    z.object({
      type: z.enum(['id_front', 'id_back', 'selfie', 'proof_of_address']),
      fileUrl: z.string().min(1, 'File URL is required'),
    })
  ).min(1, 'At least one document is required'),
});

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = kycSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { level, documents, verificationCode } = parsed.data;

    const kycLevelMap: Record<number, string> = { 1: 'LEVEL_1', 2: 'LEVEL_2', 3: 'LEVEL_3' };
    const targetLevel = kycLevelMap[level];

    // Check current KYC level progression
    const currentLevelNum = { LEVEL_0: 0, LEVEL_1: 1, LEVEL_2: 2, LEVEL_3: 3 }[user.kycLevel];
    if (level <= currentLevelNum) {
      return apiError(`You have already completed level ${level} verification`, 'ALREADY_VERIFIED', 400);
    }
    if (level > currentLevelNum + 1) {
      return apiError('Please complete the previous KYC level first', 'LEVEL_SKIPPED', 400);
    }

    // Level 1 requires a KYC verification code issued by the admin.
    // The code is a one-time gate — once accepted, it is cleared so future levels don't need it.
    if (level === 1) {
      // Rate limit code verification attempts
      const rateLimit = checkRateLimit(`kyc_code:${user.id}`);
      if (!rateLimit.allowed) {
        return apiError(
          `Too many verification attempts. Please try again in ${rateLimit.resetIn} seconds.`,
          'RATE_LIMITED',
          429
        );
      }

      if (!verificationCode || verificationCode.trim().length < 4) {
        // Send email notification about the code requirement
        const fullName = user.profile
          ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
          : '';
        sendKycCodeRequiredEmail(user.email, fullName, {}).catch((err) =>
          console.error('Failed to send KYC code required email:', err)
        );

        return apiError(
          'A KYC Verification Code is required to begin Level 1 verification. Please contact our admin team via the live chat widget on your dashboard or through our official support email to purchase your verification code. We have sent an email with detailed instructions.',
          'KYC_CODE_REQUIRED',
          403
        );
      }

      // Check if admin has confirmed the purchase (code delivered)
      if (!user.kycCodePurchased) {
        return apiError(
          'Your KYC Verification Code is pending. Please complete the purchase with our admin team. Once confirmed, the code will be sent to your email.',
          'KYC_CODE_NOT_PURCHASED',
          403
        );
      }

      // Check if the KYC code has expired (48-hour window)
      if (user.kycCodeExpiresAt && new Date(user.kycCodeExpiresAt) < new Date()) {
        return apiError(
          'Your KYC Verification Code has expired. Please contact the admin team to request a new code.',
          'KYC_CODE_EXPIRED',
          403
        );
      }

      // Validate the code matches the one stored on the user record
      if (!user.kycVerificationCode || user.kycVerificationCode !== verificationCode.trim()) {
        return apiError(
          'The KYC Verification Code you entered is invalid or has expired. Please contact our admin team via live chat or email to obtain a valid code.',
          'INVALID_KYC_CODE',
          403
        );
      }
    }

    const result = await db.$transaction(async (tx) => {
      // Create KYC documents
      const createdDocs = await Promise.all(
        documents.map((doc) =>
          tx.kYCDocument.create({
            data: {
              userId: user.id,
              type: doc.type,
              fileUrl: doc.fileUrl,
              status: 'pending',
            },
          })
        )
      );

      // Upsert KYC verification
      const verification = await tx.kYCVerification.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          level: targetLevel as any,
          status: 'pending',
          submittedAt: new Date(),
        },
        update: {
          level: targetLevel as any,
          status: 'pending',
          submittedAt: new Date(),
          notes: null,
        },
      });

      // Clear the verification code so it can't be reused
      if (level === 1) {
        await tx.user.update({
          where: { id: user.id },
          data: { kycVerificationCode: null },
        });
      }

      // Notify the client
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'kyc_submitted',
          title: 'KYC Documents Submitted',
          message: `Your Level ${level} KYC verification documents have been submitted for review.`,
        },
      });

      return { documents: createdDocs, verification };
    });

    // Notify ALL admin users about the new KYC submission (outside transaction)
    const admins = await db.admin.findMany({
      include: { user: { select: { id: true } } },
    });
    const userName = user.profile
      ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
      : user.email;

    await Promise.allSettled(
      admins.map((admin) =>
        db.notification.create({
          data: {
            userId: admin.userId,
            type: 'kyc_submitted',
            title: 'New KYC Submission Pending Review',
            message: `${userName} has submitted Level ${level} KYC documents for review. Please review in the admin panel.`,
          },
        })
      )
    );

    return apiResponse(result, 201);
  } catch (error) {
    console.error('KYC submit error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);