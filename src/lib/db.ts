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
    // PgBouncer requires small connection pool and short timeouts.
    // Without these, Prisma opens too many connections and PgBouncer drops them.
    config.datasources = {
      db: { url: DATABASE_URL },
    };
    // Prisma 6+ supports these connection pool settings
    // connection_limit: max connections from this process to PgBouncer
    // pool_timeout: how long to wait for an available connection (ms)
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
