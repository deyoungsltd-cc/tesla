import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db, ensureSchema } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';

// ──────────────────────────────────────────────
// POST /api/admin/chart-spike
// ──────────────────────────────────────────────
// Admin-only. Creates a ChartSpikeEvent for a target user.
// The user's ActiveTradeChart will pick up the spike on its next
// poll of /api/chart-events and apply a visible jump in the
// specified direction with the specified magnitude.
//
// Body:
//   {
//     userId:       string,    // target user
//     direction:    'up' | 'down',
//     magnitudePct: number,    // 1-100 (e.g. 10 = 10% jump)
//     message?:     string     // optional admin note
//   }

const SpikeSchema = z.object({
  userId: z.string().min(1),
  direction: z.enum(['up', 'down']).default('up'),
  magnitudePct: z.number().min(0.1).max(100),
  message: z.string().max(280).optional(),
});

async function handler(request: NextRequest, _context: any, admin: any) {
  try {
    await ensureSchema();
    const body = await request.json().catch(() => null);
    if (!body) return apiError('Invalid JSON body', 'INVALID_BODY', 400);

    const parsed = SpikeSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message || 'Invalid input',
        'VALIDATION_ERROR',
        400,
      );
    }

    const { userId, direction, magnitudePct, message } = parsed.data;

    // Verify target user exists
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, deletedAt: true },
    });
    if (!target || target.deletedAt) {
      return apiError('Target user not found', 'USER_NOT_FOUND', 404);
    }

    // Generate ID client-side to avoid any DB-level default issues
    const spikeId = `spk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    let spike: any;
    try {
      spike = await db.chartSpikeEvent.create({
        data: {
          id: spikeId,
          userId: target.id,
          direction,
          magnitudePct,
          message: message?.trim() || null,
          createdBy: admin.id,
        },
      });
    } catch (createErr: any) {
      // Fallback: use raw SQL if Prisma create fails (e.g. schema mismatch)
      console.warn('[chart-spike] Prisma create failed, falling back to raw SQL:', createErr.message);
      await db.$executeRawUnsafe(`
        INSERT INTO "chart_spike_events" ("id", "user_id", "direction", "magnitude_pct", "message", "consumed", "created_by")
        VALUES ($1, $2, $3, $4, $5, false, $6)
      `, spikeId, target.id, direction, magnitudePct, message?.trim() || null, admin.id);
      spike = {
        id: spikeId,
        userId: target.id,
        direction,
        magnitudePct,
        message: message?.trim() || null,
        createdAt: new Date(),
      };
    }

    console.log(
      `[chart-spike] admin ${admin.email} → user ${target.email}: ${direction} ${magnitudePct}% (event ${spike.id})`,
    );

    return apiResponse({
      id: spike.id,
      userId: spike.userId,
      direction: spike.direction,
      magnitudePct: Number(spike.magnitudePct),
      message: spike.message,
      createdAt: spike.createdAt,
      targetEmail: target.email,
    });
  } catch (error: any) {
    console.error('Create chart spike error:', error?.message || error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('ADMIN', 'SUPER_ADMIN')(handler);

// ──────────────────────────────────────────────
// GET /api/admin/chart-spike
// ──────────────────────────────────────────────
// Returns the 50 most recent spikes (any user, any consumed state)
// so the admin panel can show a history of who spiked whom.

async function listHandler(_request: NextRequest, _context: any, _admin: any) {
  try {
    await ensureSchema();
    let spikes: any[];
    try {
      spikes = await db.chartSpikeEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          userId: true,
          direction: true,
          magnitudePct: true,
          message: true,
          consumed: true,
          consumedAt: true,
          createdBy: true,
          createdAt: true,
          user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
        },
      });
    } catch (findErr: any) {
      // Fallback to raw SQL
      console.warn('[chart-spike] Prisma findMany failed, falling back to raw SQL:', findErr.message);
      const rawSpikes: any[] = await db.$queryRawUnsafe(`
        SELECT s.id, s.user_id as "userId", s.direction, s.magnitude_pct as "magnitudePct",
               s.message, s.consumed, s.consumed_at as "consumedAt", s.created_by as "createdBy",
               s.created_at as "createdAt",
               u.email as "userEmail",
               p.first_name as "userFirstName", p.last_name as "userLastName"
        FROM "chart_spike_events" s
        LEFT JOIN public.users u ON u.id = s.user_id
        LEFT JOIN public.profiles p ON p.user_id = u.id
        ORDER BY s.created_at DESC
        LIMIT 50
      `);
      spikes = rawSpikes.map((s: any) => ({
        id: s.userId,
        userId: s.userId,
        userEmail: s.userEmail ?? null,
        userName: [s.userFirstName, s.userLastName].filter(Boolean).join(' ') || null,
        direction: s.direction,
        magnitudePct: Number(s.magnitudePct),
        message: s.message,
        consumed: s.consumed,
        consumedAt: s.consumedAt,
        createdBy: s.createdBy,
        createdAt: s.createdAt,
      }));
    }

    return apiResponse({
      spikes: spikes.map((s: any) => ({
        id: s.id,
        userId: s.userId,
        userEmail: s.user?.email ?? null,
        userName: [s.user?.profile?.firstName, s.user?.profile?.lastName].filter(Boolean).join(' ') || null,
        direction: s.direction,
        magnitudePct: Number(s.magnitudePct),
        message: s.message,
        consumed: s.consumed,
        consumedAt: s.consumedAt,
        createdBy: s.createdBy,
        createdAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('List chart spikes error:', error?.message || error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireRole('ADMIN', 'SUPER_ADMIN')(listHandler);
