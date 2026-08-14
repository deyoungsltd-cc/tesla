import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, apiResponse, apiError } from '@/lib/api-helpers';

// GET all payment addresses (admin only)
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return apiError('Authentication required', 'UNAUTHORIZED', 401);
  }
  if (!user.adminRecord) {
    return apiError('Admin access required', 'FORBIDDEN', 403);
  }

  try {
    const addresses = await db.paymentAddress.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return apiResponse({ addresses });
  } catch (error) {
    console.error('Get payment addresses error:', error);
    return apiError('Failed to get payment addresses', 'INTERNAL_ERROR', 500);
  }
}

// POST - Create a new payment address (admin only)
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return apiError('Authentication required', 'UNAUTHORIZED', 401);
  }
  if (!user.adminRecord) {
    return apiError('Admin access required', 'FORBIDDEN', 403);
  }

  try {
    const body = await request.json();
    const { label, currency, network, address, qrCodeUrl, isActive, sortOrder } = body;

    if (!label || !currency || !address) {
      return apiError('Label, currency, and address are required', 'VALIDATION_ERROR', 400);
    }

    const paymentAddress = await db.paymentAddress.create({
      data: {
        label: label.trim(),
        currency: currency.trim().toUpperCase(),
        network: network?.trim() || null,
        address: address.trim(),
        qrCodeUrl: qrCodeUrl?.trim() || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder !== undefined ? sortOrder : 0,
      },
    });

    return apiResponse({ address: paymentAddress }, 201);
  } catch (error) {
    console.error('Create payment address error:', error);
    return apiError('Failed to create payment address', 'INTERNAL_ERROR', 500);
  }
}

// PUT - Update a payment address (admin only)
export async function PUT(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return apiError('Authentication required', 'UNAUTHORIZED', 401);
  }
  if (!user.adminRecord) {
    return apiError('Admin access required', 'FORBIDDEN', 403);
  }

  try {
    const body = await request.json();
    const { id, label, currency, network, address, qrCodeUrl, isActive, sortOrder } = body;

    if (!id) {
      return apiError('Address ID is required', 'VALIDATION_ERROR', 400);
    }

    const existing = await db.paymentAddress.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Payment address not found', 'NOT_FOUND', 404);
    }

    const updateData: any = {};
    if (label !== undefined) updateData.label = label.trim();
    if (currency !== undefined) updateData.currency = currency.trim().toUpperCase();
    if (network !== undefined) updateData.network = network?.trim() || null;
    if (address !== undefined) updateData.address = address.trim();
    if (qrCodeUrl !== undefined) updateData.qrCodeUrl = qrCodeUrl?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const updated = await db.paymentAddress.update({
      where: { id },
      data: updateData,
    });

    return apiResponse({ address: updated });
  } catch (error) {
    console.error('Update payment address error:', error);
    return apiError('Failed to update payment address', 'INTERNAL_ERROR', 500);
  }
}

// DELETE - Delete a payment address (admin only)
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return apiError('Authentication required', 'UNAUTHORIZED', 401);
  }
  if (!user.adminRecord) {
    return apiError('Admin access required', 'FORBIDDEN', 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('Address ID is required', 'VALIDATION_ERROR', 400);
    }

    const existing = await db.paymentAddress.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Payment address not found', 'NOT_FOUND', 404);
    }

    await db.paymentAddress.delete({ where: { id } });

    return apiResponse({ message: 'Payment address deleted successfully' });
  } catch (error) {
    console.error('Delete payment address error:', error);
    return apiError('Failed to delete payment address', 'INTERNAL_ERROR', 500);
  }
}
