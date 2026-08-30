import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

export async function GET() {
  const info: Record<string, any> = {
    service: 'TeslaPrime',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    dbUrlSet: !!process.env.DATABASE_URL,
    dbUrlMasked: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@').slice(0, 80) + '...'
      : 'NOT SET',
    directUrlSet: !!process.env.DIRECT_URL,
    directUrlMasked: process.env.DIRECT_URL
      ? process.env.DIRECT_URL.replace(/:([^@]+)@/, ':****@').slice(0, 80) + '...'
      : 'NOT SET',
    poolerDetected: false,
    jwtSecretSet: !!process.env.JWT_SECRET,
    railwayEnv: !!process.env.RAILWAY_ENVIRONMENT,
  };

  // Detect pooler
  const dbUrl = process.env.DATABASE_URL || '';
  info.poolerDetected =
    dbUrl.includes('pgbouncer') ||
    dbUrl.includes('pooler.supabase.com') ||
    (process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV === 'production');

  // Test DB connection
  try {
    const prisma = new PrismaClient({
      connection_limit: 1,
      pool_timeout: 10,
      log: ['error'],
    });

    // Try a simple query
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as ok`;
    info.dbConnectionMs = Date.now() - start;
    info.dbStatus = 'connected';

    // Check if users table exists
    try {
      const result = await prisma.$queryRawUnsafe(
        "SELECT to_regclass('public.users') as exists"
      );
      const rows = result as any[];
      info.usersTableExists = rows?.[0]?.exists !== null;
    } catch (e: any) {
      info.usersTableExists = false;
      info.usersTableError = e.message?.slice(0, 100);
    }

    // Count users if table exists
    if (info.usersTableExists) {
      try {
        const count = await prisma.user.count();
        info.userCount = count;
      } catch (e: any) {
        info.userCountError = e.message?.slice(0, 100);
      }
    }

    await prisma.$disconnect();
  } catch (e: any) {
    info.dbStatus = 'FAILED';
    info.dbError = e.message?.slice(0, 200);
    info.dbErrorCode = e.code;
  }

  return NextResponse.json(info, { status: info.dbStatus === 'connected' ? 200 : 503 });
}
