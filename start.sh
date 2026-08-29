#!/bin/sh

echo "========================================"
echo "[startup] TeslaPrime - Initializing"
echo "========================================"

# ============================================
# DATABASE_URL VALIDATION
# ============================================
if [ -z "$DATABASE_URL" ]; then
  echo "[startup] WARNING: DATABASE_URL is NOT SET."
  echo "[startup] Login and DB operations will fail until you set it in Railway Variables."
else
  case "$DATABASE_URL" in
    file:*)
      echo "[startup] WARNING: DATABASE_URL looks like SQLite (file:). This project needs PostgreSQL."
      ;;
    postgresql://*|postgres://*)
      echo "[startup] DATABASE_URL OK (PostgreSQL format)"
      ;;
    *)
      echo "[startup] WARNING: DATABASE_URL format unrecognized: ${DATABASE_URL:0:20}..."
      ;;
  esac
fi

# ============================================
# RUNTIME SCHEMA SYNC
# ============================================
# Railway Hobby plan uses PgBouncer which BLOCKS DDL (prisma db push).
# The safety-net migration below handles schema sync, so we SKIP prisma db push
# entirely when PgBouncer is detected (pgbouncer in URL or RAILWAY_ENVIRONMENT set).
# For non-PgBouncer setups, we still run it with a 30s timeout to prevent hangs.
if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    *pgbouncer*)
      echo "[startup] PgBouncer detected in DATABASE_URL — skipping prisma db push (DDL blocked by PgBouncer)."
      ;;
    *)
      if [ -n "$RAILWAY_ENVIRONMENT" ]; then
        echo "[startup] Railway environment detected — skipping prisma db push (PgBouncer likely in use)."
      else
        echo "[startup] Running prisma db push (runtime schema sync, 30s timeout)..."
        timeout 30 ./node_modules/.bin/prisma db push --accept-data-loss --skip-generate 2>&1 || {
          echo "[startup] WARNING: prisma db push failed or timed out. Falling back to safety-net migration."
        }
      fi
      ;;
  esac
else
  echo "[startup] Skipping prisma db push (DATABASE_URL not set)"
fi

# ============================================
# SAFETY-NET MIGRATION (idempotent raw SQL, foreground, BLOCKING)
# ============================================
# Belt-and-suspenders: ensures every column the Prisma client expects
# exists in the DB, even if prisma db push above failed.
echo "[startup] Running safety-net migration (idempotent raw SQL, 130s timeout)..."
if [ -n "$DATABASE_URL" ]; then
  timeout 130 node prisma/migrate-safety-net.cjs 2>&1 || {
    echo "[startup] Safety-net migration failed or timed out (non-critical, will continue)"
  }
else
  echo "[startup] Skipping safety-net migration (DATABASE_URL not set)"
fi

# ============================================
# FILE SYSTEM
# ============================================
mkdir -p /tmp/uploads
echo "[startup] Upload directory ready at /tmp/uploads"

# ============================================
# BACKGROUND TASKS — seed + migration run AFTER server starts
# ============================================
( \
  echo "[bg] Waiting 5s for server to boot before seeding..." && \
  sleep 5 && \
  echo "[bg] Seeding database (timeout 60s, non-fatal)..." && \
  timeout 60 node /app/prisma/seed.cjs 2>&1 || \
  echo "[bg] Seed failed, skipped, or timed out — server still running." \
) &

( \
  echo "[bg] Waiting 10s for server to boot before demo-to-live migration..." && \
  sleep 10 && \
  echo "[bg] Migrating demo users to live mode (timeout 30s, non-fatal)..." && \
  timeout 30 node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function migrate() {
  try {
    var r = await prisma.user.updateMany({ where: { activeMode: 'demo' }, data: { activeMode: 'live' } });
    console.log('[bg] Migrated ' + r.count + ' users from demo to live mode');
  } catch(e) {
    console.error('[bg] Migration failed:', e.message);
  } finally {
    process.exit(0);
  }
}
migrate();
" 2>&1 || echo "[bg] Mode migration skipped (non-critical)" \
) &

# ============================================
# START SERVER — IMMEDIATELY, in foreground
# ============================================
echo "========================================"
echo "[startup] Starting Next.js server NOW..."
echo "[startup] Health check: /api/health"
echo "[startup] Background seed/migration will log with [bg] prefix"
echo "========================================"
exec node server.js
