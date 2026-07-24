#!/bin/sh
set -e

echo "========================================"
echo "[startup] Tesla Platform - Initializing"
echo "========================================"

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "[startup] WARNING: DATABASE_URL not set! Skipping DB sync."
else
  echo "[startup] Syncing database schema..."
  npx prisma db push --accept-data-loss 2>&1 || {
    echo "[startup] Schema sync failed, retrying in 5s..."
    sleep 5
    npx prisma db push --accept-data-loss 2>&1 || echo "[startup] Schema sync failed after retry"
  }

  echo "[startup] Seeding database..."
  node prisma/seed.cjs 2>&1 || {
    echo "[startup] Seed failed or already done"
  }
fi

# Create uploads dir in /tmp (writable by nextjs user)
mkdir -p /tmp/uploads

echo "========================================"
echo "[startup] Starting Next.js server..."
echo "========================================"
exec node server.js
