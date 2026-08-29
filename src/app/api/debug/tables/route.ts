import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET() {
  try {
    const tables = await db.$queryRawUnsafe(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`);
    return NextResponse.json({ tables: (tables as any[]).map((t: any) => t.tablename) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
