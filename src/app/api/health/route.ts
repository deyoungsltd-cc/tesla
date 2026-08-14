import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 5; // never let this hang

// Lightweight liveness probe — returns 200 immediately.
// Railway's HTTP probe needs a fast endpoint that doesn't block on DB.
// Detailed DB status is available at /api/health/detailed (separate route).
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'TeslaPrime',
    },
    { status: 200 }
  );
}
