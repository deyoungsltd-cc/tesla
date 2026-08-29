/**
 * SAFETY-NET MIGRATION
 * ───────────────────
 * Runs on every container startup (called from start.sh) BEFORE the
 * Next.js server boots. Ensures that ALL Prisma schema columns/tables
 * exist in the live database so the Prisma client doesn't throw
 * "column does not exist" errors at runtime.
 *
 * This is critical because `prisma db push` is often skipped during
 * Railway builds (DATABASE_URL not available at build time), meaning
 * schema changes only reach the DB via this script.
 *
 * All statements are idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const STATEMENTS = [
  // ══════════════════════════════════════════════════════════
  // USERS TABLE — every scalar column the Prisma User model defines
  // ══════════════════════════════════════════════════════════
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_verification_code TEXT`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_code TEXT`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMP(3)`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_code_expires_at TIMESTAMP(3)`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_code_purchased BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP(3)`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS active_mode TEXT NOT NULL DEFAULT 'live'`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_currency TEXT NOT NULL DEFAULT 'USD'`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP(3)`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP(3)`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_ip TEXT`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS login_attempt_count INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by_id TEXT`,

  // ══════════════════════════════════════════════════════════
  // WALLETS TABLE
  // ══════════════════════════════════════════════════════════
  `ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS locked_balance DECIMAL(18,2) NOT NULL DEFAULT 0`,

  // ══════════════════════════════════════════════════════════
  // PROFILES TABLE
  // ══════════════════════════════════════════════════════════
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP(3)`,
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT`,
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS street_address TEXT`,
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT`,
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT`,
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS postal_code TEXT`,

  // ══════════════════════════════════════════════════════════
  // ADMINS TABLE
  // ══════════════════════════════════════════════════════════
  `DO $$ BEGIN
    CREATE TABLE IF NOT EXISTS public.admins (
      id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'SUPPORT',
      is_super_admin BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT admins_pkey PRIMARY KEY (id),
      CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
    );
  EXCEPTION WHEN duplicate_table THEN null; END $$`,
  `CREATE UNIQUE INDEX IF NOT EXISTS admins_user_id_key ON public.admins(user_id)`,

  // ══════════════════════════════════════════════════════════
  // SITE SETTINGS
  // ══════════════════════════════════════════════════════════
  `ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS slideshow_models JSONB`,
  `ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_photo_url TEXT`,
  `ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_photo_updated_at TIMESTAMP(3)`,
  `ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS elon_photo_url TEXT`,
  `ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS elon_photo_updated_at TIMESTAMP(3)`,

  // ══════════════════════════════════════════════════════════
  // CHART SPIKE EVENTS TABLE
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS public.chart_spike_events (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    direction TEXT NOT NULL DEFAULT 'up',
    magnitude_pct DECIMAL(8,4) NOT NULL,
    message TEXT,
    consumed BOOLEAN NOT NULL DEFAULT false,
    consumed_at TIMESTAMP(3),
    created_by TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chart_spike_events_pkey PRIMARY KEY (id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_chart_spike_user_unread ON public.chart_spike_events(user_id, consumed, created_at)`,
  `DO $$ BEGIN
    ALTER TABLE public.chart_spike_events ADD CONSTRAINT chart_spike_events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,

  // ══════════════════════════════════════════════════════════
  // VEHICLE TABLES
  // ══════════════════════════════════════════════════════════
  `DO $$ BEGIN CREATE TYPE "VehicleColor" AS ENUM ('pearl_white','solid_black','midnight_silver','deep_blue','red_multi_coat','ultra_red','quick_silver','blue_multi_coat'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN CREATE TYPE "VehicleOrderStatus" AS ENUM ('pending','confirmed','in_production','shipped','delivered','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `CREATE TABLE IF NOT EXISTS public.tesla_vehicles (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT NOT NULL,
    base_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    specs JSONB NOT NULL DEFAULT '{}',
    colors JSONB NOT NULL DEFAULT '[]',
    interior TEXT NOT NULL DEFAULT 'Premium Black',
    estimated_delivery TEXT NOT NULL DEFAULT '',
    featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tesla_vehicles_pkey PRIMARY KEY (id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS tesla_vehicles_slug_key ON public.tesla_vehicles(slug)`,
  `CREATE TABLE IF NOT EXISTS public.vehicle_orders (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    vehicle_id TEXT NOT NULL,
    status "VehicleOrderStatus" NOT NULL DEFAULT 'pending',
    selected_color "VehicleColor" NOT NULL DEFAULT 'pearl_white',
    selected_interior TEXT NOT NULL DEFAULT 'Premium Black',
    total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
    deposit_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    deposit_paid BOOLEAN NOT NULL DEFAULT false,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT,
    address TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    postal_code TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT 'US',
    order_number TEXT NOT NULL,
    tracking_info JSONB,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vehicle_orders_pkey PRIMARY KEY (id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS vehicle_orders_order_number_key ON public.vehicle_orders(order_number)`,
  `CREATE INDEX IF NOT EXISTS idx_vehicle_order_user ON public.vehicle_orders(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_vehicle_order_status ON public.vehicle_orders(status)`,
  `DO $$ BEGIN
    ALTER TABLE public.vehicle_orders ADD CONSTRAINT vehicle_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN
    ALTER TABLE public.vehicle_orders ADD CONSTRAINT vehicle_orders_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.tesla_vehicles(id) ON DELETE RESTRICT ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `CREATE TABLE IF NOT EXISTS public.vehicle_deposit_payments (
    id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    crypto_currency TEXT NOT NULL DEFAULT '',
    network TEXT NOT NULL DEFAULT '',
    tx_hash TEXT,
    sender_address TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    confirmed_by TEXT,
    confirmed_at TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vehicle_deposit_payments_pkey PRIMARY KEY (id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_vehicle_deposit_order ON public.vehicle_deposit_payments(order_id)`,
  `CREATE INDEX IF NOT EXISTS idx_vehicle_deposit_status ON public.vehicle_deposit_payments(status)`,
  `DO $$ BEGIN
    ALTER TABLE public.vehicle_deposit_payments ADD CONSTRAINT vehicle_deposit_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.vehicle_orders(id) ON DELETE RESTRICT ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN
    ALTER TABLE public.vehicle_deposit_payments ADD CONSTRAINT vehicle_deposit_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN null; END $$`,
];

async function run() {
  console.log('[migrate-safety-net] Running idempotent schema checks...');
  let applied = 0;
  let skipped = 0;
  for (const sql of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(sql);
      const label = sql.length > 70 ? sql.slice(0, 67) + '...' : sql;
      console.log(`[migrate-safety-net] OK: ${label}`);
      applied += 1;
    } catch (err) {
      console.error(`[migrate-safety-net] SKIP: ${err.message}`);
      skipped += 1;
    }
  }
  console.log(`[migrate-safety-net] Done. Applied ${applied}, skipped ${skipped}.`);
}

run()
  .catch((e) => {
    console.error('[migrate-safety-net] FATAL (non-blocking):', e.message);
  })
  .finally(() => prisma.$disconnect());
