/**
 * SAFETY-NET MIGRATION
 * ───────────────────
 * Runs on every container startup (called from start.sh) BEFORE the
 * Next.js server boots. Ensures that recently-added Prisma schema
 * elements (columns / tables) exist in the live database so that the
 * Prisma client (which was regenerated at build time to include them)
 * doesn't throw "column does not exist" / "relation does not exist"
 * errors at runtime.
 *
 * This is a belt-and-suspenders fallback in case `npx prisma db push`
 * fails silently on Railway (which has been happening — likely due to
 * non-interactive prompts or engine download issues).
 *
 * All statements are idempotent (IF NOT EXISTS) so they're safe to
 * run repeatedly with no side effects.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const STATEMENTS = [
  // ── kycVerificationCode on User (added in commit 4d3e2dd) ──
  // Required for /api/admin/users/[id]/kyc-code + /api/kyc/submit Level 1 code gate.
  // If this column is missing, EVERY db.user.findUnique / findFirst / findMany
  // throws "column kyc_verification_code does not exist" — which breaks
  // login, register, /api/auth/me, /api/user, /api/admin/users, etc.
  // IMPORTANT: The actual table in the DB is `public.users` (lowercase, plural),
  // NOT `"User"` (capital, singular) as Prisma @@map("User") suggests.
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_verification_code TEXT`,

  // ── site_settings.slideshow_models column ──
  `ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS slideshow_models JSONB`,

  // ── chart_spike_events table (added in commit 81e3ff6) ──
  // Required for /api/admin/chart-spike + /api/chart-events.
  // If this table is missing, db.chartSpikeEvent.findMany throws
  // "relation chart_spike_events does not exist".
  `CREATE TABLE IF NOT EXISTS "chart_spike_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'up',
    "magnitude_pct" DECIMAL(8,4) NOT NULL,
    "message" TEXT,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "consumed_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chart_spike_events_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_chart_spike_user_unread"
     ON "chart_spike_events" ("user_id", "consumed", "created_at")`,
  `ALTER TABLE "chart_spike_events"
     ADD CONSTRAINT IF NOT EXISTS "chart_spike_events_user_id_fkey"
     FOREIGN KEY ("user_id") REFERENCES public.users(id)
     ON DELETE CASCADE ON UPDATE CASCADE`,

  // ── tesla_vehicles table (added for Tesla vehicle buying feature) ──
  // Required for /api/vehicles + vehicle ordering.
  `DO $$ BEGIN CREATE TYPE "VehicleColor" AS ENUM ('pearl_white','solid_black','midnight_silver','deep_blue','red_multi_coat','ultra_red','quick_silver','blue_multi_coat'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN CREATE TYPE "VehicleOrderStatus" AS ENUM ('pending','confirmed','in_production','shipped','delivered','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `CREATE TABLE IF NOT EXISTS "tesla_vehicles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "base_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "image_url" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "specs" JSONB NOT NULL DEFAULT '{}',
    "colors" JSONB NOT NULL DEFAULT '[]',
    "interior" TEXT NOT NULL DEFAULT 'Premium Black',
    "estimated_delivery" TEXT NOT NULL DEFAULT '',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tesla_vehicles_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "tesla_vehicles_slug_key" ON "tesla_vehicles"("slug")`,
  `CREATE TABLE IF NOT EXISTS "vehicle_orders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "status" "VehicleOrderStatus" NOT NULL DEFAULT 'pending',
    "selected_color" "VehicleColor" NOT NULL DEFAULT 'pearl_white',
    "selected_interior" TEXT NOT NULL DEFAULT 'Premium Black',
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deposit_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deposit_paid" BOOLEAN NOT NULL DEFAULT false,
    "full_name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT,
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "postal_code" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'US',
    "order_number" TEXT NOT NULL,
    "tracking_info" JSONB,
    "notes" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_orders_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_orders_order_number_key" ON "vehicle_orders"("order_number")`,
  `CREATE INDEX IF NOT EXISTS "idx_vehicle_order_user" ON "vehicle_orders"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_vehicle_order_status" ON "vehicle_orders"("status")`,
  `DO $$ BEGIN
    ALTER TABLE "vehicle_orders" ADD CONSTRAINT "vehicle_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "vehicle_orders" ADD CONSTRAINT "vehicle_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "tesla_vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,

  // ── vehicle_deposit_payments table ──
  `CREATE TABLE IF NOT EXISTS "vehicle_deposit_payments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "crypto_currency" TEXT NOT NULL DEFAULT '',
    "network" TEXT NOT NULL DEFAULT '',
    "tx_hash" TEXT,
    "sender_address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmed_by" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_deposit_payments_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "idx_vehicle_deposit_order" ON "vehicle_deposit_payments"("order_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_vehicle_deposit_status" ON "vehicle_deposit_payments"("status")`,
  `DO $$ BEGIN
    ALTER TABLE "vehicle_deposit_payments" ADD CONSTRAINT "vehicle_deposit_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "vehicle_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "vehicle_deposit_payments" ADD CONSTRAINT "vehicle_deposit_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,
];

async function run() {
  console.log('[migrate-safety-net] Running idempotent schema checks...');
  let applied = 0;
  let skipped = 0;
  for (const sql of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(sql);
      // Log a short label for each statement so Railway logs are readable.
      const label = sql.length > 70 ? sql.slice(0, 67) + '...' : sql;
      console.log(`[migrate-safety-net] OK: ${label}`);
      applied += 1;
    } catch (err) {
      // Idempotent statements shouldn't fail, but if they do (e.g. column
      // already exists with a different type), log and continue — never
      // block server startup.
      console.error(`[migrate-safety-net] SKIP: ${err.message}`);
      skipped += 1;
    }
  }
  console.log(`[migrate-safety-net] Done. Applied ${applied}, skipped ${skipped}.`);
}

run()
  .catch((e) => {
    // Never throw — startup must continue even if migration fails.
    console.error('[migrate-safety-net] FATAL (non-blocking):', e.message);
  })
  .finally(() => prisma.$disconnect());
