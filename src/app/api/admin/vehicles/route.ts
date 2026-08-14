import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

// GET all vehicle orders (admin) + GET all vehicles (admin)
async function handler(request: NextRequest, _context: any, _user: any) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  // List vehicles for management
  if (type === 'vehicles') {
    try {
      const vehicles = await db.teslaVehicle.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      return apiResponse(vehicles);
    } catch (error: any) {
      console.error('Get admin vehicles error:', error);
      return apiError('Internal server error', 'INTERNAL_ERROR', 500);
    }
  }

  // Default: list vehicle orders
  try {
    const status = searchParams.get('status');
    const where: any = {};
    if (status) where.status = status;

    const orders = await db.vehicleOrder.findMany({
      where,
      include: {
        vehicle: true,
        user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(orders);
  } catch (error: any) {
    console.error('Get admin vehicle orders error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// POST create vehicle (admin)
const vehicleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  basePrice: z.number().positive('Price must be positive'),
  imageUrl: z.string().min(1, 'Image URL is required'),
  description: z.string().default(''),
  specs: z.any().optional(),
  colors: z.any().optional(),
  interior: z.string().default('Premium Black'),
  estimatedDelivery: z.string().min(1, 'Estimated delivery is required'),
  featured: z.boolean().optional().default(false),
  sortOrder: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
});

async function createVehicleHandler(request: NextRequest, _context: any, _user: any) {
  try {
    const body = await request.json();
    const parsed = vehicleSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const vehicle = await db.teslaVehicle.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        category: parsed.data.category,
        basePrice: parsed.data.basePrice,
        imageUrl: parsed.data.imageUrl,
        description: parsed.data.description,
        specs: parsed.data.specs || {},
        colors: parsed.data.colors || [],
        interior: parsed.data.interior,
        estimatedDelivery: parsed.data.estimatedDelivery,
        featured: parsed.data.featured,
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
      },
    });

    return apiResponse(vehicle, 201);
  } catch (error: any) {
    console.error('Create vehicle error:', error);
    if (error.code === 'P2002') {
      return apiError('A vehicle with this slug already exists', 'DUPLICATE_SLUG', 409);
    }
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('ADMIN', 'SUPER_ADMIN')(handler);
export const POST = requireRole('SUPER_ADMIN')(createVehicleHandler);
