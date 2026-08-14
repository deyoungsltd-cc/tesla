import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

async function postHandler(request: NextRequest, _context: any, user: any) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return apiError('No file provided', 'VALIDATION_ERROR', 400);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError('Only JPEG, PNG, and WebP images are allowed', 'VALIDATION_ERROR', 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError('Image must be less than 2MB', 'VALIDATION_ERROR', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize to 200x200 and convert to webp
    const processedBuffer = await sharp(buffer)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();

    // Convert to base64 data URL
    const base64 = processedBuffer.toString('base64');
    const avatarUrl = `data:image/webp;base64,${base64}`;

    // Upsert the profile with the new avatar URL
    const profile = await db.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, avatarUrl },
      update: { avatarUrl },
    });

    return apiResponse({ avatarUrl: profile.avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return apiError('Failed to process avatar image', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(postHandler);
