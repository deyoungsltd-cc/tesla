import { NextRequest } from 'next/server';
import { db, ensureSchema } from '@/lib/db';
import { requireAuth, apiResponse, apiError } from '@/lib/api-helpers';

// ──────────────────────────────────────────────
// GET /api/chart-events
// ──────────────────────────────────────────────
// Authenticated user endpoint. Returns all UNCONSUMED ChartSpikeEvent
// rows for the current user, then marks them as consumed so each
// spike only fires once on the client.

async function handler(_request: NextRequest, _context: any, user: any) {
  try {
    await ensureSchema();
    let spikes: any[];
    try {
      // Fetch unconsumed spikes for this user, oldest first (FIFO)
      spikes = await db.chartSpikeEvent.findMany({
        where: {
          userId: user.id,
          consumed: false,
        },
        orderBy: { createdAt: 'asc' },
        take: 10, // safety cap
        select: {
          id: true,
          direction: true,
          magnitudePct: true,
          message: true,
          createdAt: true,
        },
      });
    } catch (findErr: any) {
      // Fallback to raw SQL if Prisma fails
      console.warn('[chart-events] Prisma findMany failed, using raw SQL:', findErr.message);
      const rawSpikes: any[] = await db.$queryRawUnsafe(`
        SELECT id, direction, magnitude_pct as "magnitudePct", message, created_at as "createdAt"
        FROM "chart_spike_events"
        WHERE user_id = $1 AND consumed = false
        ORDER BY created_at ASC
        LIMIT 10
      `, user.id);
      spikes = rawSpikes.map((s: any) => ({
        id: s.id,
        direction: s.direction,
        magnitudePct: Number(s.magnitudePct),
        message: s.message,
        createdAt: s.createdAt,
      }));
    }

    // Mark them consumed so they don't fire again
    if (spikes.length > 0) {
      try {
        await db.chartSpikeEvent.updateMany({
          where: { id: { in: spikes.map((s: any) => s.id) } },
          data: { consumed: true, consumedAt: new Date() },
        });
      } catch (updateErr: any) {
        // Fallback to raw SQL
        console.warn('[chart-events] Prisma updateMany failed, using raw SQL:', updateErr.message);
        await db.$executeRawUnsafe(`
          UPDATE "chart_spike_events"
          SET consumed = true, consumed_at = NOW()
          WHERE id = ANY($1)
        `, spikes.map((s: any) => s.id));
      }
    }

    return apiResponse({
      spikes: spikes.map((s: any) => ({
        id: s.id,
        direction: s.direction,
        magnitudePct: Number(s.magnitudePct),
        message: s.message,
        createdAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Fetch chart events error:', error?.message || error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const GET = requireAuth(handler);
