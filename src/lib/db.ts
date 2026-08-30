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
    // Append pool parameters to URL (Prisma 6.x configures pool via URL, not constructor)
    if (!DATABASE_URL.includes('connect_timeout')) {
      const sep = DATABASE_URL.includes('?') ? '&' : '?';
      DATABASE_URL = `${DATABASE_URL}${sep}connect_timeout=10&connection_limit=5&pool_timeout=10`;
    }
    config.datasources = { db: { url: DATABASE_URL } };
  }

  return new PrismaClient(config);
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function ensureSchema() {
  // Prisma handles schema via migrations — no runtime init needed
}
