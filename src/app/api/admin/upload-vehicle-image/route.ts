import { NextRequest } from 'next/server';
import { getSessionUser, apiResponse, apiError } from '@/lib/api-helpers';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

// POST - Upload a vehicle image. Tries Cloudinary CDN first, falls back to base64.
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return apiError('Authentication required', 'UNAUTHORIZED', 401);
  }
  if (!user.adminRecord) {
    return apiError('Admin access required', 'FORBIDDEN', 403);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return apiError('No image file provided', 'MISSING_FILE', 400);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return apiError('Invalid file type. Use JPG, PNG, WebP, or GIF.', 'INVALID_FILE_TYPE', 400);
    }

    const maxBytes = isCloudinaryConfigured() ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
    if (file.size > maxBytes) {
      return apiError(`File too large. Maximum ${isCloudinaryConfigured() ? '10MB' : '3MB'}.`, 'FILE_TOO_LARGE', 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try Cloudinary first (CDN delivery, auto-optimization)
    if (isCloudinaryConfigured()) {
      try {
        const result = await uploadToCloudinary(buffer, 'vehicles');
        return apiResponse({ imageUrl: result.url, publicId: result.publicId, storage: 'cloudinary' });
      } catch (cloudErr: any) {
        console.error('Cloudinary upload failed, falling back to base64:', cloudErr.message);
      }
    }

    // Fallback: base64 data URL in DB
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    return apiResponse({ imageUrl: dataUrl, storage: 'base64' });
  } catch (error) {
    console.error('Upload vehicle image error:', error);
    return apiError('Failed to upload image', 'INTERNAL_ERROR', 500);
  }
}
