import { db } from '@/lib/db';
import { apiResponse, apiError } from '@/lib/api-helpers';

// GET active payment addresses (public - used by deposit page)
export async function GET() {
  try {
    const addresses = await db.paymentAddress.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { currency: 'asc' }],
      select: {
        id: true,
        label: true,
        currency: true,
        network: true,
        address: true,
        qrCodeUrl: true,
      },
    });

    return apiResponse({ addresses });
  } catch (error) {
    console.error('Get public payment addresses error:', error);
    return apiError('Failed to get payment addresses', 'INTERNAL_ERROR', 500);
  }
}
