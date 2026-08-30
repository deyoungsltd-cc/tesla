import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 5;

// Lightweight liveness probe — Railway HTTP probe hits this.
// Returns 200 even if DB is down (so Railway doesn't kill the container).
// Use /api/health/detailed for DB diagnostics.
export async function GET() {
  const dbOk = !!process.env.DATABASE_URL;
  return NextResponse.json(
    {
      status: dbOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'TeslaPrime',
      db: dbOk ? 'configured' : 'no DATABASE_URL',
    },
    { status: dbOk ? 200 : 503 }
  );
}