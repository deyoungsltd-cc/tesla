import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const orderSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  selectedColor: z.enum(['pearl_white', 'solid_black', 'midnight_silver', 'deep_blue', 'red_multi_coat', 'ultra_red', 'quick_silver', 'blue_multi_coat']).default('pearl_white'),
  selectedInterior: z.string().default('Premium Black'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().default('US'),
  notes: z.string().optional(),
});

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const data = parsed.data;

    const vehicle = await db.teslaVehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      return apiError('Vehicle not found', 'VEHICLE_NOT_FOUND', 404);
    }
    if (!vehicle.active) {
      return apiError('This vehicle is no longer available', 'VEHICLE_INACTIVE', 400);
    }

    // Check if user already has an active (non-cancelled) order for this vehicle
    const existingOrder = await db.vehicleOrder.findFirst({
      where: { userId: user.id, vehicleId: vehicle.id, status: { notIn: ['cancelled', 'delivered'] } },
    });
    if (existingOrder) {
      return apiError('You already have an active order for this vehicle', 'DUPLICATE_ORDER', 409);
    }

    const depositAmount = Number((vehicle.basePrice * 0.1).toFixed(2));
    const orderNumber = `TP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = await db.vehicleOrder.create({
      data: {
        userId: user.id,
        vehicleId: vehicle.id,
        selectedColor: data.selectedColor,
        selectedInterior: data.selectedInterior,
        totalPrice: vehicle.basePrice,
        depositAmount,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        orderNumber,
        notes: data.notes || null,
      },
      include: { vehicle: true },
    });

    // Notification for the buyer
    await db.notification.create({
      data: {
        userId: user.id,
        type: 'vehicle_order_placed' as any,
        title: 'Vehicle Order Placed',
        message: `Your order for ${vehicle.name} has been placed. Order #${orderNumber}. Deposit required: $${depositAmount.toLocaleString()}.`,
        actionUrl: '/vehicles',
      },
    });

    // Referral commission: if user was referred, give referrer 5% of deposit
    if (user.referredById) {
      try {
        const commissionAmount = Number((depositAmount * 0.05).toFixed(2));
        await db.referralCommission.create({
          data: {
            userId: user.referredById,
            referrerId: user.referredById,
            amount: commissionAmount,
            rate: 0.05,
            level: 1,
            type: 'direct',
            status: 'pending',
          },
        });
        await db.notification.create({
          data: {
            userId: user.referredById,
            type: 'referral_earned',
            title: 'Referral Bonus Earned',
            message: `You earned a $${commissionAmount} referral bonus from a vehicle order.`,
          },
        });
      } catch (refErr) {
        console.error('Vehicle referral commission error:', refErr);
      }
    }

    return apiResponse(order, 201);
  } catch (error: any) {
    console.error('Create vehicle order error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);
