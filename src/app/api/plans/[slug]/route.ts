import { apiResponse, apiError } from '@/lib/api-helpers';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const plan = await db.investmentPlan.findUnique({
      where: { slug },
    });

    if (!plan) {
      return apiError('Plan not found', 'NOT_FOUND', 404);
    }

    if (!plan.isActive) {
      return apiError('Plan is not available', 'PLAN_INACTIVE', 400);
    }

    return apiResponse(plan);
  } catch (error) {
    console.error('Get plan error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}