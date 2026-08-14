import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return apiError('Order ID is required', 'MISSING_ORDER_ID', 400);
    }

    const order = await db.vehicleOrder.findFirst({
      where: { id: orderId, userId: user.id },
      include: { vehicle: true },
    });

    if (!order) {
      return apiError('Order not found', 'ORDER_NOT_FOUND', 404);
    }

    const statusFlow = ['pending', 'confirmed', 'in_production', 'shipped', 'delivered'];
    const currentIdx = statusFlow.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';

    const trackingInfo = (order.trackingInfo as any) || {};
    const timeline = trackingInfo.timeline || [];

    if (timeline.length === 0) {
      timeline.unshift({
        status: 'pending',
        timestamp: order.createdAt,
        note: 'Order placed successfully',
      });
    }

    const orderDate = new Date(order.createdAt);
    const estimatedDates: Record<string, string> = {
      confirmed: new Date(orderDate.getTime() + 2 * 86400000).toISOString(),
      in_production: new Date(orderDate.getTime() + 14 * 86400000).toISOString(),
      shipped: new Date(orderDate.getTime() + 30 * 86400000).toISOString(),
      delivered: new Date(orderDate.getTime() + 45 * 86400000).toISOString(),
    };

    const routeStages = [
      { key: 'pending', label: 'Order Placed', location: 'Online', direction: 'Processing' },
      { key: 'confirmed', label: 'Order Confirmed', location: 'Tesla HQ, Austin TX', direction: 'Processing' },
      { key: 'in_production', label: 'In Production', location: trackingInfo.factoryLocation || 'Tesla Factory, Fremont CA', direction: 'Manufacturing' },
      { key: 'shipped', label: 'In Transit', location: trackingInfo.currentLocation || 'En Route', direction: trackingInfo.shippingDirection || 'To Delivery Center' },
      { key: 'delivered', label: 'Delivered', location: `${order.city}, ${order.state}`, direction: 'Completed' },
    ];

    return apiResponse({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        selectedColor: order.selectedColor,
        selectedInterior: order.selectedInterior,
        totalPrice: order.totalPrice,
        depositAmount: order.depositAmount,
        depositPaid: order.depositPaid,
        fullName: order.fullName,
        createdAt: order.createdAt,
        vehicle: order.vehicle,
      },
      tracking: {
        isCancelled,
        currentStep: isCancelled ? -1 : currentIdx,
        totalSteps: statusFlow.length,
        progress: isCancelled ? 0 : ((currentIdx + 1) / statusFlow.length) * 100,
        vin: trackingInfo.vin || null,
        currentLocation: trackingInfo.currentLocation || null,
        shippingDirection: trackingInfo.shippingDirection || null,
        estimatedDelivery: trackingInfo.estimatedDelivery || estimatedDates.delivered,
        estimatedDates,
        timeline,
        routeStages,
      },
    });
  } catch (error: any) {
    console.error('Get tracking error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);
