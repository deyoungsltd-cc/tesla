#!/bin/sh
set -e

echo "[startup] Syncing database schema..."
npx prisma db push --accept-data-loss 2>/dev/null || echo "[startup] Schema sync skipped or already up to date"

echo "[startup] Seeding database (if needed)..."
npx tsx prisma/seed.ts 2>/dev/null || echo "[startup] Seed skipped"

echo "[startup] Starting Next.js server..."
exec node server.js
