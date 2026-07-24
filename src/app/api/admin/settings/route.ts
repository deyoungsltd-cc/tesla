import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, apiResponse, apiError } from '@/lib/api-helpers';

// GET site settings (public - used by landing page and about page)
export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: 'main' } });
    }
    return apiResponse({
      aboutPhotoUrl: settings.aboutPhotoUrl,
      aboutPhotoUpdatedAt: settings.aboutPhotoUpdatedAt,
      elonPhotoUrl: settings.elonPhotoUrl,
      elonPhotoUpdatedAt: settings.elonPhotoUpdatedAt,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return apiError('Failed to get settings', 'INTERNAL_ERROR', 500);
  }
}

// POST - Upload photo and store as base64 data URL in database (persists across deploys)
export async function POST(request: NextRequest) {
  // Auth check
  const user = await getSessionUser(request);
  if (!user) {
    return apiError('Authentication required', 'UNAUTHORIZED', 401);
  }
  if (!user.adminRecord) {
    return apiError('Admin access required', 'FORBIDDEN', 403);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;
    const target = (formData.get('target') as string) || 'about'; // 'about' or 'elon'

    if (!file) {
      return apiError('No photo file provided', 'MISSING_FILE', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return apiError('Invalid file type. Use JPG, PNG, WebP, or GIF.', 'INVALID_FILE_TYPE', 400);
    }

    // Validate file size (max 2MB for DB storage)
    if (file.size > 2 * 1024 * 1024) {
      return apiError('File too large. Maximum 2MB for upload. Use the URL field for larger images.', 'FILE_TOO_LARGE', 400);
    }

    // Convert file to base64 data URL — stored in DB so it persists across deploys
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update database with data URL
    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    const updateData: any = {};
    if (target === 'elon') {
      updateData.elonPhotoUrl = dataUrl;
      updateData.elonPhotoUpdatedAt = new Date();
    } else {
      updateData.aboutPhotoUrl = dataUrl;
      updateData.aboutPhotoUpdatedAt = new Date();
    }
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: 'main', ...updateData } });
    } else {
      settings = await db.siteSettings.update({ where: { id: 'main' }, data: updateData });
    }

    return apiResponse({
      aboutPhotoUrl: settings.aboutPhotoUrl,
      aboutPhotoUpdatedAt: settings.aboutPhotoUpdatedAt,
      elonPhotoUrl: settings.elonPhotoUrl,
      elonPhotoUpdatedAt: settings.elonPhotoUpdatedAt,
      message: 'Photo uploaded and saved successfully',
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return apiError('Failed to upload photo', 'INTERNAL_ERROR', 500);
  }
}

// PUT - Update photo URL (admin only - for external URLs or data URLs)
export async function PUT(request: NextRequest) {
  // Auth check
  const user = await getSessionUser(request);
  if (!user) {
    return apiError('Authentication required', 'UNAUTHORIZED', 401);
  }
  if (!user.adminRecord) {
    return apiError('Admin access required', 'FORBIDDEN', 403);
  }

  try {
    const body = await request.json();
    const { aboutPhotoUrl, elonPhotoUrl } = body;

    const updateData: any = {};
    if (aboutPhotoUrl && typeof aboutPhotoUrl === 'string') {
      updateData.aboutPhotoUrl = aboutPhotoUrl;
      updateData.aboutPhotoUpdatedAt = new Date();
    }
    if (elonPhotoUrl && typeof elonPhotoUrl === 'string') {
      updateData.elonPhotoUrl = elonPhotoUrl;
      updateData.elonPhotoUpdatedAt = new Date();
    }
    if (Object.keys(updateData).length === 0) {
      return apiError('Valid photo URL is required', 'MISSING_URL', 400);
    }

    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: 'main', ...updateData } });
    } else {
      settings = await db.siteSettings.update({ where: { id: 'main' }, data: updateData });
    }

    return apiResponse({
      aboutPhotoUrl: settings.aboutPhotoUrl,
      aboutPhotoUpdatedAt: settings.aboutPhotoUpdatedAt,
      elonPhotoUrl: settings.elonPhotoUrl,
      elonPhotoUpdatedAt: settings.elonPhotoUpdatedAt,
      message: 'Photo URL updated successfully',
    });
  } catch (error) {
    console.error('Update photo URL error:', error);
    return apiError('Failed to update photo URL', 'INTERNAL_ERROR', 500);
  }
}
