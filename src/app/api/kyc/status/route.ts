import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(_request: NextRequest, _context: any, user: any) {
  try {
    const [verification, documents] = await Promise.all([
      db.kYCVerification.findUnique({
        where: { userId: user.id },
      }),
      db.kYCDocument.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return apiResponse({
      currentLevel: user.kycLevel,
      verification,
      documents,
    });
  } catch (error) {
    console.error('KYC status error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);