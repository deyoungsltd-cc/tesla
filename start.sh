#!/bin/sh

echo "========================================"
echo "[startup] Tesla Platform - Initializing"
echo "========================================"

# ============================================
# DATABASE_URL VALIDATION
# ============================================
if [ -z "$DATABASE_URL" ]; then
  echo "[startup] FATAL: DATABASE_URL environment variable is NOT SET."
  echo "[startup] Without DATABASE_URL, the app cannot connect to any database."
  echo "[startup] ALL login, registration, and data operations WILL FAIL."
  echo "[startup] Please set DATABASE_URL in your Railway environment variables."
  echo "[startup] It should be a PostgreSQL URL like: postgresql://user:pass@host:5432/dbname"
  echo "========================================"
  mkdir -p /tmp/uploads
  exec node server.js
fi

# Check if DATABASE_URL is SQLite format (wrong for this project)
case "$DATABASE_URL" in
  file:*)
    echo "[startup] FATAL: DATABASE_URL starts with 'file:' -- this is SQLite."
    echo "[startup] This project uses PostgreSQL. The DATABASE_URL must start with postgresql://"
    echo "[startup] Please fix DATABASE_URL in Railway environment variables."
    echo "========================================"
    mkdir -p /tmp/uploads
    exec node server.js
    ;;
  postgresql://*|postgres://*)
    echo "[startup] DATABASE_URL appears to be PostgreSQL format"
    ;;
  *)
    echo "[startup] WARNING: DATABASE_URL format unrecognized: ${DATABASE_URL:0:20}..."
    echo "[startup] Proceeding anyway -- if this fails, check your DATABASE_URL."
    ;;
esac

# ============================================
# DATABASE SCHEMA SYNC
# ============================================
echo "[startup] Syncing database schema..."
SYNC_OK=0
npx prisma db push --accept-data-loss 2>&1 && SYNC_OK=1 || {
  echo "[startup] Schema sync failed on first attempt. Retrying in 5s..."
  sleep 5
  npx prisma db push --accept-data-loss 2>&1 && SYNC_OK=1 || {
    echo "[startup] Schema sync failed after retry. Some tables may be missing."
  }
}

if [ "$SYNC_OK" = "1" ]; then
  echo "[startup] Schema sync successful"
fi

# ============================================
# DATABASE SEED
# ============================================
echo "[startup] Seeding database..."
node prisma/seed.cjs 2>&1 || {
  echo "[startup] Seed failed or already done (non-critical)"
}

# ============================================
# FILE SYSTEM
# ============================================
mkdir -p /tmp/uploads
echo "[startup] Upload directory ready at /tmp/uploads"

# ============================================
# START SERVER
# ============================================
echo "========================================"
echo "[startup] Starting Next.js server..."
echo "[startup] Health check available at /api/health"
echo "========================================"
exec node server.js
