import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  // 1. DATABASE_URL check
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    checks.database = { ok: false, detail: 'DATABASE_URL env var is NOT set. All DB operations will fail. Set it in Railway dashboard.' };
    return NextResponse.json({ status: 'unhealthy', checks, timestamp: new Date().toISOString() }, { status: 503 });
  }
  if (dbUrl.startsWith('file:')) {
    checks.database = { ok: false, detail: `DATABASE_URL is a SQLite path ("${dbUrl}") but schema requires PostgreSQL. Fix: set a postgresql:// URL.` };
    return NextResponse.json({ status: 'unhealthy', checks, timestamp: new Date().toISOString() }, { status: 503 });
  }
  checks.database = { ok: true, detail: `DATABASE_URL present (${dbUrl.substring(0, 30)}...)` };

  // 2. JWT_SECRET check
  const jwtSecret = process.env.JWT_SECRET;
  checks.jwt = {
    ok: !!jwtSecret,
    detail: jwtSecret ? 'JWT_SECRET is set' : 'JWT_SECRET not set — using hardcoded fallback (insecure)',
  };

  // 3. Database connectivity test
  try {
    await db.$queryRaw`SELECT 1 as ok`;
    checks.dbConnect = { ok: true, detail: 'Database connection successful' };
  } catch (err: any) {
    checks.dbConnect = { ok: false, detail: `Database connection failed: ${err.message?.substring(0, 200) || String(err)}` };
  }

  // 4. Check if key tables exist
  try {
    const userCount = await db.user.count();
    checks.usersTable = { ok: true, detail: `Users table exists (${userCount} rows)` };
  } catch (err: any) {
    checks.usersTable = { ok: false, detail: `Users table missing or error: ${err.message?.substring(0, 150) || String(err)}` };
  }

  // 5. Check admin user exists
  try {
    const admin = await db.user.findFirst({
      where: { email: 'admin@tesla.com' },
      include: { adminRecord: true },
    });
    checks.adminUser = {
      ok: !!admin,
      detail: admin
        ? `Admin exists (${admin.email}, role: ${admin.adminRecord?.role || 'none'})`
        : 'Admin user (admin@tesla.com) not found. Run seed.',
    };
  } catch (err: any) {
    checks.adminUser = { ok: false, detail: `Error: ${err.message?.substring(0, 150) || String(err)}` };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    { status: allOk ? 'healthy' : 'unhealthy', checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  );
}
