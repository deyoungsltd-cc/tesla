import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { apiResponse, apiError } from '@/lib/api-helpers';

// GET site settings (public - used by About page)
export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: 'main' } });
    }
    return apiResponse({
      aboutPhotoUrl: settings.aboutPhotoUrl,
      aboutPhotoUpdatedAt: settings.aboutPhotoUpdatedAt,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return apiError('Failed to get settings', 'INTERNAL_ERROR', 500);
  }
}

// POST - Upload about page photo (admin only)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return apiError('No photo file provided', 'MISSING_FILE', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return apiError('Invalid file type. Use JPG, PNG, WebP, or GIF.', 'INVALID_FILE_TYPE', 400);
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return apiError('File too large. Maximum 5MB.', 'FILE_TOO_LARGE', 400);
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `about-photo-${Date.now()}.${ext}`;

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Update database
    const photoUrl = `/uploads/${filename}`;
    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await db.siteSettings.create({
        data: { id: 'main', aboutPhotoUrl: photoUrl, aboutPhotoUpdatedAt: new Date() },
      });
    } else {
      settings = await db.siteSettings.update({
        where: { id: 'main' },
        data: { aboutPhotoUrl: photoUrl, aboutPhotoUpdatedAt: new Date() },
      });
    }

    return apiResponse({
      aboutPhotoUrl: settings.aboutPhotoUrl,
      aboutPhotoUpdatedAt: settings.aboutPhotoUpdatedAt,
      message: 'Photo updated successfully',
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return apiError('Failed to upload photo', 'INTERNAL_ERROR', 500);
  }
}

// PUT - Update about photo URL (admin only - for external URL)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { aboutPhotoUrl } = body;

    if (!aboutPhotoUrl || typeof aboutPhotoUrl !== 'string') {
      return apiError('Valid photo URL is required', 'MISSING_URL', 400);
    }

    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await db.siteSettings.create({
        data: { id: 'main', aboutPhotoUrl, aboutPhotoUpdatedAt: new Date() },
      });
    } else {
      settings = await db.siteSettings.update({
        where: { id: 'main' },
        data: { aboutPhotoUrl, aboutPhotoUpdatedAt: new Date() },
      });
    }

    return apiResponse({
      aboutPhotoUrl: settings.aboutPhotoUrl,
      aboutPhotoUpdatedAt: settings.aboutPhotoUpdatedAt,
      message: 'Photo URL updated successfully',
    });
  } catch (error) {
    console.error('Update photo URL error:', error);
    return apiError('Failed to update photo URL', 'INTERNAL_ERROR', 500);
  }
}
