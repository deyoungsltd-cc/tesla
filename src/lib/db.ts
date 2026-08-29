import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const DATABASE_URL = process.env.DATABASE_URL || '';

  // Railway Hobby plan uses PgBouncer — detect it properly
  // PgBouncer URL contains 'pgbouncer' or Railway sets RAILWAY_ENVIRONMENT
  const isPgBouncer = DATABASE_URL.includes('pgbouncer') ||
    (process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV === 'production');

  const config: any = {
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  };

  if (isPgBouncer) {
    // PgBouncer requires small connection pool.
    // Prisma 6 removed connection_limit/pool_timeout from constructor.
    // Instead, append connection pool params to the DATABASE_URL.
    let url = DATABASE_URL;
    const sep = url.includes('?') ? '&' : '?';
    url += `${sep}connection_limit=5&pool_timeout=10`;
    config.datasources = {
      db: { url },
    };
  }

  return new PrismaClient(config);
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function ensureSchema() {
  // Prisma handles schema via migrations — no runtime init needed
}
