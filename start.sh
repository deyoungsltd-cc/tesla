#!/bin/sh

echo "========================================"
echo "[startup] TeslaPrime - Initializing"
echo "========================================"

# ============================================
# DATABASE_URL VALIDATION (warning only — do not block server start)
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
# SAFETY-NET MIGRATION (idempotent raw SQL, foreground, BLOCKING)
# ============================================
# Runs BEFORE the server starts because TeslaEquity's start.sh does
# NOT run `prisma db push` at all. Without this, schema changes
# (like the kyc_verification_code column added 2026-07-27) never
# reach the live DB, and the build-time Prisma client throws
# "column does not exist" on every db.user.findX — which broke
# login + register.
echo "[startup] Running safety-net migration (idempotent raw SQL, blocking)..."
if [ -n "$DATABASE_URL" ]; then
  node prisma/migrate-safety-net.cjs 2>&1 || {
    echo "[startup] Safety-net migration failed (non-critical, will continue)"
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
# We start the server FIRST so Railway's HTTP probe succeeds immediately.
# Seed and demo-to-live migration run in the background and log to stdout.
# If they fail, the server stays up — only login/DB writes are affected.
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
