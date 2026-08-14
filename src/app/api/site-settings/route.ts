import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      return apiResponse({ aboutPhotoUrl: null });
    }
    return apiResponse({
      aboutPhotoUrl: settings.aboutPhotoUrl,
      aboutPhotoUpdatedAt: settings.aboutPhotoUpdatedAt,
    });
  } catch (error) {
    console.error('Get site settings error:', error);
    return apiError('Failed to get settings', 'INTERNAL_ERROR', 500);
  }
}
