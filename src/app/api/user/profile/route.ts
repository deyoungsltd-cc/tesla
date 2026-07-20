import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
});

async function getHandler(_request: NextRequest, _context: any, user: any) {
  try {
    const profile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      const newProfile = await db.profile.create({
        data: { userId: user.id },
      });
      return apiResponse(newProfile);
    }

    return apiResponse(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

async function putHandler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const data: any = { ...parsed.data };
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }

    const profile = await db.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return apiResponse(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(getHandler);
export const PUT = requireAuth(putHandler);