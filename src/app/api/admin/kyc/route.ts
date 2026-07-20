import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(_request: NextRequest, _context: any, _user: any) {
  try {
    const verifications = await db.kYCVerification.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            kycLevel: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return apiResponse(verifications);
  } catch (error) {
    console.error('Admin KYC list error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('SUPER_ADMIN', 'ADMIN', 'COMPLIANCE')(handler);