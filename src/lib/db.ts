import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const DATABASE_URL = process.env.DATABASE_URL || '';
  
  // Railway Hobby plan uses PgBouncer — adjust connection settings
  // PgBouncer requires specific Prisma config: small pool, short timeouts
  const isPgBouncer = DATABASE_URL.includes('pgbouncer') || 
    process.env.RAILWAY_ENVIRONMENT || 
    process.env.NODE_ENV === 'production';

  return new PrismaClient({
    ...(isPgBouncer ? {
      datasources: {
        db: {
          url: DATABASE_URL,
        },
      },
    } : {}),
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function ensureSchema() {
  // Prisma handles schema via migrations — no runtime init needed
}
