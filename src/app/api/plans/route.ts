import { apiResponse, apiError } from '@/lib/api-helpers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const plans = await db.investmentPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return apiResponse(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}