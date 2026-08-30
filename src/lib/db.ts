import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  let DATABASE_URL = process.env.DATABASE_URL || '';

  // Detect connection pooler (PgBouncer / Supabase Pooler / Railway)
  // - Supabase: pooler.supabase.com in hostname
  // - Railway PgBouncer: 'pgbouncer' in URL or RAILWAY_ENVIRONMENT set
  // Poolers require small connection pools and short timeouts.
  const isPooler =
    DATABASE_URL.includes('pgbouncer') ||
    DATABASE_URL.includes('pooler.supabase.com') ||
    (process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV === 'production');

  const config: any = {
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  };

  if (isPooler) {
    // Append connect_timeout to prevent TCP connection hangs
    if (!DATABASE_URL.includes('connect_timeout')) {
      const sep = DATABASE_URL.includes('?') ? '&' : '?';
      DATABASE_URL = `${DATABASE_URL}${sep}connect_timeout=10`;
    }
    config.datasources = { db: { url: DATABASE_URL } };
    // PgBouncer/Supabase pooler: keep connection pool small
    config.connection_limit = 5;
    config.pool_timeout = 10;
  }

  return new PrismaClient(config);
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function ensureSchema() {
  // Prisma handles schema via migrations — no runtime init needed
}
