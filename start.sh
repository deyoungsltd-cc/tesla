#!/bin/sh

echo "[startup] Syncing database schema..."
npx prisma db push --accept-data-loss 2>/dev/null || echo "[startup] Schema sync skipped"

echo "[startup] Seeding database..."
node prisma/seed.cjs 2>/dev/null || echo "[startup] Seed skipped"

echo "[startup] Creating uploads directory..."
mkdir -p /app/public/uploads 2>/dev/null

echo "[startup] Starting Next.js server..."
exec node server.js
