/**
 * SAFETY-NET MIGRATION — PgBouncer Compatible
 * ─────────────────────────────────────────────
 * Runs on every container startup BEFORE the Next.js server boots.
 * Ensures ALL Prisma schema tables/columns exist in the live database.
 *
 * IMPORTANT: PgBouncer (Railway Hobby) blocks multi-statement transactions
 * (DO $$ ... END $$). Every statement here is a SINGLE DDL statement that
 * PgBouncer allows through. Errors are caught per-statement (idempotent).
 *
 * Connection: Uses DIRECT_URL if set (bypasses PgBouncer), otherwise
 * falls back to DATABASE_URL. Each statement runs individually.
 */
const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
console.log(`[migrate-safety-net] Using ${process.env.DIRECT_URL ? 'DIRECT_URL' : 'DATABASE_URL'} (${dbUrl ? dbUrl.slice(0, 40) + '...' : 'EMPTY'})`);

const prisma = new PrismaClient({
  datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  log: ['error'],
});

// Global timeout: 50s hard kill
const GLOBAL_TIMEOUT = setTimeout(() => {
  console.error('[migrate-safety-net] FATAL: Global 50s timeout reached, exiting.');
  prisma.$disconnect().then(() => process.exit(1));
}, 50000);

const STATEMENTS = [
  // ══════════════════════════════════════════════════════════
  // ENUM TYPES (PgBouncer-safe: single CREATE TYPE statements)
  // ══════════════════════════════════════════════════════════
  `CREATE TYPE IF NOT EXISTS "UserStatus" AS ENUM ('pending_verification','active','suspended','banned','closed')`,
  `CREATE TYPE IF NOT EXISTS "KycLevel" AS ENUM ('LEVEL_0','LEVEL_1','LEVEL_2','LEVEL_3')`,
  `CREATE TYPE IF NOT EXISTS "WalletType" AS ENUM ('demo','live')`,
  `CREATE TYPE IF NOT EXISTS "TransactionType" AS ENUM ('deposit','withdrawal','investment','investment_return','referral_bonus','fee','promo_credit','balance_adjustment')`,
  `CREATE TYPE IF NOT EXISTS "TransactionStatus" AS ENUM ('pending','completed','failed','reversed')`,
  `CREATE TYPE IF NOT EXISTS "InvestmentStatus" AS ENUM ('active','completed','failed','cancelled')`,
  `CREATE TYPE IF NOT EXISTS "DepositMethod" AS ENUM ('crypto','gift_card')`,
  `CREATE TYPE IF NOT EXISTS "CryptoCurrency" AS ENUM ('BTC','ETH','USDT')`,
  `CREATE TYPE IF NOT EXISTS "DepositStatus" AS ENUM ('pending','pending_verification','confirmed','rejected','expired')`,
  `CREATE TYPE IF NOT EXISTS "WithdrawalStatus" AS ENUM ('pending','processing','completed','rejected','failed')`,
  `CREATE TYPE IF NOT EXISTS "WithdrawalDestinationType" AS ENUM ('crypto','bank')`,
  `CREATE TYPE IF NOT EXISTS "ReferralCommissionType" AS ENUM ('direct','binary')`,
  `CREATE TYPE IF NOT EXISTS "ReferralCommissionStatus" AS ENUM ('pending','paid','reversed')`,
  `CREATE TYPE IF NOT EXISTS "BinaryPosition" AS ENUM ('left','right')`,
  `CREATE TYPE IF NOT EXISTS "KycDocumentType" AS ENUM ('id_front','id_back','selfie','proof_of_address')`,
  `CREATE TYPE IF NOT EXISTS "KycDocumentStatus" AS ENUM ('pending','approved','rejected','expired')`,
  `CREATE TYPE IF NOT EXISTS "TicketStatus" AS ENUM ('open','in_progress','waiting_user','resolved','closed')`,
  `CREATE TYPE IF NOT EXISTS "TicketPriority" AS ENUM ('low','medium','high','urgent')`,
  `CREATE TYPE IF NOT EXISTS "AdminRoleName" AS ENUM ('SUPER_ADMIN','ADMIN','COMPLIANCE','SUPPORT')`,
  `CREATE TYPE IF NOT EXISTS "NotificationType" AS ENUM ('deposit_confirmed','deposit_rejected','withdrawal_processed','withdrawal_rejected','investment_activated','investment_completed','investment_return_credited','referral_earned','kyc_submitted','kyc_approved','kyc_rejected','kyc_reminder','security_login_detected','security_password_changed','ticket_response','ticket_resolved','system_maintenance','system_announcement','vehicle_order_placed','vehicle_order_confirmed','vehicle_order_shipped','vehicle_order_delivered','vehicle_order_cancelled','custom')`,
  `CREATE TYPE IF NOT EXISTS "OtpType" AS ENUM ('email_verification','password_reset','two_factor_setup','two_factor_disable','withdrawal_confirm')`,
  `CREATE TYPE IF NOT EXISTS "GiftCardStatus" AS ENUM ('pending','verified','rejected','expired')`,
  `CREATE TYPE IF NOT EXISTS "EmailStatus" AS ENUM ('sent','delivered','failed','bounced')`,
  `CREATE TYPE IF NOT EXISTS "PayoutStatus" AS ENUM ('pending','processed','failed')`,
  `CREATE TYPE IF NOT EXISTS "UserMode" AS ENUM ('demo','live')`,
  `CREATE TYPE IF NOT EXISTS "DurationUnit" AS ENUM ('hours','days')`,
  `CREATE TYPE IF NOT EXISTS "PromoDiscountType" AS ENUM ('percentage','fixed')`,
  `CREATE TYPE IF NOT EXISTS "PromoCodeStatus" AS ENUM ('active','inactive','expired','fully_redeemed')`,
  `CREATE TYPE IF NOT EXISTS "VehicleColor" AS ENUM ('pearl_white','solid_black','midnight_silver','deep_blue','red_multi_coat','ultra_red','quick_silver','blue_multi_coat')`,
  `CREATE TYPE IF NOT EXISTS "VehicleOrderStatus" AS ENUM ('pending','confirmed','in_production','shipped','delivered','cancelled')`,

  // ══════════════════════════════════════════════════════════
  // USERS TABLE — add columns (table assumed to exist from prior migrations)
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
  // ADMINS TABLE (PgBouncer-safe: split CREATE TABLE + FK)
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS public.admins (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role "AdminRoleName" NOT NULL DEFAULT 'SUPPORT',
    is_super_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admins_pkey PRIMARY KEY (id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS admins_user_id_key ON public.admins(user_id)`,
  `ALTER TABLE public.admins ADD CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE`,

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
  `ALTER TABLE public.chart_spike_events ADD CONSTRAINT chart_spike_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE`,

  // ══════════════════════════════════════════════════════════
  // VEHICLE TABLES
  // ══════════════════════════════════════════════════════════
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
  `ALTER TABLE public.vehicle_orders ADD CONSTRAINT vehicle_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE public.vehicle_orders ADD CONSTRAINT vehicle_orders_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.tesla_vehicles(id) ON DELETE RESTRICT ON UPDATE CASCADE`,
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
  `ALTER TABLE public.vehicle_deposit_payments ADD CONSTRAINT vehicle_deposit_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.vehicle_orders(id) ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE public.vehicle_deposit_payments ADD CONSTRAINT vehicle_deposit_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
];

async function run() {
  console.log(`[migrate-safety-net] Running ${STATEMENTS.length} idempotent schema checks...`);
  let applied = 0;
  let skipped = 0;
  for (const sql of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(sql);
      const label = sql.length > 80 ? sql.slice(0, 77) + '...' : sql;
      console.log(`[migrate-safety-net] OK: ${label}`);
      applied += 1;
    } catch (err) {
      // Expected errors: duplicate_table, duplicate_object, relation already exists
      const msg = err.message || '';
      const isExpected = msg.includes('already exists') ||
        msg.includes('duplicate') ||
        msg.includes('relation "') && msg.includes('" already exists') ||
        msg.includes('type "') && msg.includes('" already exists');
      if (isExpected) {
        console.log(`[migrate-safety-net] SKIP (exists): ${sql.slice(0, 60)}`);
      } else {
        console.error(`[migrate-safety-net] ERROR: ${msg} | SQL: ${sql.slice(0, 80)}`);
      }
      skipped += 1;
    }
  }
  console.log(`[migrate-safety-net] Done. Applied: ${applied}, Skipped: ${skipped}.`);
}

run()
  .catch((e) => {
    console.error('[migrate-safety-net] FATAL (non-blocking):', e.message);
  })
  .finally(() => {
    clearTimeout(GLOBAL_TIMEOUT);
    return prisma.$disconnect();
  });
