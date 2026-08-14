import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';
import { sendAdminNotificationEmail } from '@/lib/email';

const updateVehicleSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  basePrice: z.number().positive().optional(),
  imageUrl: z.string().min(1).optional(),
  description: z.string().optional(),
  specs: z.any().optional(),
  colors: z.any().optional(),
  interior: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  active: z.boolean().optional(),
});

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled']).optional(),
  trackingInfo: z.any().optional(),
  adminNotes: z.string().optional(),
  depositPaid: z.boolean().optional(),
});

// Determine if the ID is a vehicle order (starts with TP-) or a vehicle (UUID)
function isOrderId(id: string) {
  // Vehicle orders have UUIDs, vehicles have UUIDs too, so we need to check the DB
  // We'll try vehicle first, then order
  return id.length > 0; // placeholder
}

async function patchHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }, _user: any) {
  try {
    const { id } = await params;
    const body = await request.json();
    const target = body._target; // 'vehicle' or 'order'

    if (target === 'vehicle') {
      // Update vehicle
      const parsed = updateVehicleSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
      }

      const existing = await db.teslaVehicle.findUnique({ where: { id } });
      if (!existing) return apiError('Vehicle not found', 'VEHICLE_NOT_FOUND', 404);

      const updateData: any = {};
      const fields = ['name', 'slug', 'category', 'basePrice', 'imageUrl', 'description', 'specs', 'colors', 'interior', 'estimatedDelivery', 'featured', 'sortOrder', 'active'];
      for (const f of fields) {
        if (parsed.data[f] !== undefined) updateData[f] = parsed.data[f];
      }

      const vehicle = await db.teslaVehicle.update({ where: { id }, data: updateData });
      return apiResponse(vehicle);
    }

    // Default: update order
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const existing = await db.vehicleOrder.findUnique({ where: { id } });
    if (!existing) return apiError('Order not found', 'ORDER_NOT_FOUND', 404);

    const updateData: any = {};
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.trackingInfo !== undefined) updateData.trackingInfo = parsed.data.trackingInfo;
    if (parsed.data.adminNotes !== undefined) updateData.adminNotes = parsed.data.adminNotes;
    if (parsed.data.depositPaid !== undefined) updateData.depositPaid = parsed.data.depositPaid;

    // Build tracking timeline entry
    if (parsed.data.status && parsed.data.status !== existing.status) {
      const currentInfo = (existing.trackingInfo as any) || {};
      const timeline = currentInfo.timeline || [];
      timeline.push({
        status: parsed.data.status,
        timestamp: new Date().toISOString(),
        note: parsed.data.adminNotes || `Status updated to ${parsed.data.status}`,
      });
      updateData.trackingInfo = { ...currentInfo, timeline, lastUpdated: new Date().toISOString() };
    }

    const order = await db.vehicleOrder.update({
      where: { id },
      data: updateData,
      include: { vehicle: true, user: { select: { id: true, email: true } } },
    });

    // Create notification + email for user on status change
    if (parsed.data.status && parsed.data.status !== existing.status) {
      const statusLabels: Record<string, string> = {
        pending: 'Pending', confirmed: 'Confirmed', in_production: 'In Production',
        shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
      };
      const newStatus = parsed.data.status!;
      const statusLabel = statusLabels[newStatus];
      const vehicleName = order.vehicle?.name || 'your vehicle';

      // Map status to notification type and email type
      const notifTypeMap: Record<string, string> = {
        confirmed: 'vehicle_order_confirmed',
        in_production: 'vehicle_order_confirmed',
        shipped: 'vehicle_order_shipped',
        delivered: 'vehicle_order_delivered',
        cancelled: 'vehicle_order_cancelled',
      };
      const emailTypeMap: Record<string, string> = {
        confirmed: 'deposit_confirmed',
        shipped: 'withdrawal_approved',
        delivered: 'kyc_approved',
        cancelled: 'deposit_rejected',
      };

      await db.notification.create({
        data: {
          userId: existing.userId,
          type: (notifTypeMap[newStatus] || 'custom') as any,
          title: `Order ${statusLabel}`,
          message: `Your ${vehicleName} order #${existing.orderNumber} is now ${statusLabel}.${newStatus === 'shipped' ? ' Track it in real-time from the Track page.' : ''}`,
          actionUrl: '/tracking',
        },
      });

      // Send email (non-blocking)
      const userName = order.user?.email?.split('@')[0] || '';
      const emailType = emailTypeMap[newStatus];
      if (emailType) {
        sendAdminNotificationEmail(order.user.email, userName, {
          type: emailType as any,
          title: `Vehicle Order ${statusLabel}`,
          message: `Your ${vehicleName} order (#${existing.orderNumber}) status has been updated to <strong>${statusLabel}</strong>.${newStatus === 'shipped' ? ' Visit your dashboard Track page to follow the delivery in real-time.' : ''}${newStatus === 'delivered' ? ' Thank you for choosing TeslaPrime!' : ''}`,
          amount: newStatus === 'delivered' ? `$${Number(order.totalPrice).toLocaleString()}` : undefined,
          adminMessage: parsed.data.adminNotes || undefined,
          attachmentUrl: newStatus !== 'cancelled' ? undefined : undefined,
        }).catch((err: any) => console.error('Failed to send vehicle order email:', err));
      }
    }

    return apiResponse(order);
  } catch (error: any) {
    console.error('Update vehicle/order error:', error);
    if (error.code === 'P2002') {
      return apiError('A vehicle with this slug already exists', 'DUPLICATE_SLUG', 409);
    }
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

async function deleteHandler(request: NextRequest, { params }: { params: Promise<{ id: string }> }, _user: any) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target') || 'vehicle';

    if (target === 'vehicle') {
      const existing = await db.teslaVehicle.findUnique({ where: { id } });
      if (!existing) return apiError('Vehicle not found', 'VEHICLE_NOT_FOUND', 404);

      await db.teslaVehicle.delete({ where: { id } });
      return apiResponse({ deleted: true });
    }

    return apiError('Invalid target', 'INVALID_TARGET', 400);
  } catch (error: any) {
    console.error('Delete vehicle error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const PATCH = requireRole('ADMIN', 'SUPER_ADMIN')(patchHandler);
export const DELETE = requireRole('SUPER_ADMIN')(deleteHandler);
