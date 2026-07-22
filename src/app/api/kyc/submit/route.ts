import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const kycSubmitSchema = z.object({
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
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

    const { level, documents } = parsed.data;

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

    return apiResponse(result, 201);
  } catch (error) {
    console.error('KYC submit error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);