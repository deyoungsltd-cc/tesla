#!/bin/bash
# =============================================
# TESLA PLATFORM - ONE-CLICK SETUP SCRIPT
# =============================================
# Run this ONCE on your local machine:
#   chmod +x setup.sh
#   ./setup.sh
# Or on Windows (Git Bash / WSL):
#   bash setup.sh
# =============================================

set -e

echo ""
echo "========================================="
echo "  TESLA PLATFORM SETUP"
echo "========================================="
echo ""

# Step 1: Install dependencies
echo "[1/4] Installing dependencies..."
npm install 2>&1 | tail -3
echo "  Done."
echo ""

# Step 2: Generate Prisma client
echo "[2/4] Generating Prisma client..."
npx prisma generate 2>&1 | tail -3
echo "  Done."
echo ""

# Step 3: Push database schema (creates tables)
echo "[3/4] Setting up database (this may take a moment)..."
npx prisma db push 2>&1 | tail -5
echo "  Done."
echo ""

# Step 4: Seed admin + demo user + investment plans
echo "[4/4] Seeding database with admin & demo data..."
npx tsx prisma/seed.ts 2>&1
echo "  Done."
echo ""

echo "========================================="
echo "  SETUP COMPLETE!"
echo "========================================="
echo ""
echo "  Admin login:  admin@tesla.com / Admin@123"
echo "  Demo login:   demo@tesla.com  / Demo@123"
echo ""
echo "  Now run:  npm run dev"
echo "  Then open: http://localhost:3000"
echo ""
echo "========================================="