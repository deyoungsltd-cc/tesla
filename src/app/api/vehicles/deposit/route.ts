import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const depositSchema = z.object({
  orderId: z.string().min(1),
  cryptoCurrency: z.enum(['BTC', 'ETH', 'USDT']),
  network: z.string().min(1),
  txHash: z.string().min(10, 'Transaction hash must be at least 10 characters'),
  senderAddress: z.string().min(10, 'Sender address must be at least 10 characters').optional(),
});

async function handler(request: NextRequest, _context: any, user: any) {
  try {
    const body = await request.json();
    const parsed = depositSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);

    const { orderId, cryptoCurrency, network, txHash, senderAddress } = parsed.data;

    const order = await db.vehicleOrder.findFirst({
      where: { id: orderId, userId: user.id },
    });
    if (!order) return apiError('Order not found', 'NOT_FOUND', 404);
    if (order.depositPaid) return apiError('Deposit already paid for this order', 'ALREADY_PAID', 400);
    if (order.status === 'cancelled') return apiError('Order is cancelled', 'ORDER_CANCELLED', 400);

    // Check for duplicate tx hash
    const existingPayment = await db.vehicleDepositPayment.findFirst({
      where: { txHash, status: { in: ['pending', 'confirmed'] } },
    });
    if (existingPayment) return apiError('This transaction has already been submitted', 'DUPLICATE_TX', 409);

    const payment = await db.vehicleDepositPayment.create({
      data: {
        orderId: order.id,
        userId: user.id,
        amount: order.depositAmount,
        cryptoCurrency,
        network,
        txHash,
        senderAddress: senderAddress || null,
        status: 'pending',
      },
    });

    await db.notification.create({
      data: {
        userId: user.id,
        type: 'vehicle_order_placed' as any,
        title: 'Deposit Submitted',
        message: `Your ${cryptoCurrency} deposit of $${order.depositAmount.toLocaleString()} for order #${order.orderNumber} is awaiting confirmation.`,
        actionUrl: '/vehicles',
      },
    });

    return apiResponse(payment, 201);
  } catch (error: any) {
    console.error('Vehicle deposit error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireAuth(handler);
