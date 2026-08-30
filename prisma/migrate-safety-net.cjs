/**
 * SAFETY-NET MIGRATION — PgBouncer / Supabase Pooler Compatible
 * ─────────────────────────────────────────────
 * Runs on every container startup BEFORE the Next.js server boots.
 * Ensures ALL Prisma schema tables exist in the live database.
 * Required because Railway Hobby skips `prisma db push` (PgBouncer blocks DDL).
 *
 * IMPORTANT: PgBouncer blocks multi-statement transactions (DO $$ ... END $$).
 * Every statement here is a SINGLE DDL statement that PgBouncer allows through.
 * Errors are caught per-statement (idempotent).
 *
 * Connection: Uses DIRECT_URL if set (bypasses PgBouncer), otherwise
 * falls back to DATABASE_URL. Each statement runs individually.
 */
const { PrismaClient } = require('@prisma/client');

const rawDbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const usingDirect = !!process.env.DIRECT_URL;

// Detect if the URL goes through a connection pooler
const isPooler = rawDbUrl.includes('pgbouncer') || rawDbUrl.includes('pooler.supabase.com');

// Append connect_timeout to prevent connection hangs (especially on pooler)
let dbUrl = rawDbUrl;
if (dbUrl && !dbUrl.includes('connect_timeout')) {
  const separator = dbUrl.includes('?') ? '&' : '?';
  dbUrl = `${dbUrl}${separator}connect_timeout=10`;
}

console.log(`[migrate-safety-net] Using ${usingDirect ? 'DIRECT_URL' : 'DATABASE_URL'} (pooler: ${isPooler})`);
console.log(`[migrate-safety-net] URL: ${dbUrl ? dbUrl.slice(0, 50) + '...' : 'EMPTY'}`);

// Prisma 6.x: pool params must be in the URL, NOT in the constructor.
if (isPooler && !dbUrl.includes('connection_limit')) {
  const separator = dbUrl.includes('?') ? '&' : '?';
  dbUrl = `${dbUrl}${separator}connection_limit=1&pool_timeout=15`;
  console.log('[migrate-safety-net] Pooler detected — appended connection_limit=1 to URL');
}

const prisma = new PrismaClient({
  datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  log: ['error'],
});

// Global timeout: 45s hard kill — if DB is up, DDL should complete fast
const GLOBAL_TIMEOUT = setTimeout(() => {
  console.error('[migrate-safety-net] FATAL: 45s global timeout reached, exiting.');
  prisma.$disconnect().then(() => process.exit(1));
}, 45000);

// ── DDL statements: CREATE TABLE and CREATE INDEX use IF NOT EXISTS
// ── Foreign key ALTER TABLE statements are in FK_STATEMENTS (separate try/catch)
const DDL_STATEMENTS = [
  // ══════════════════════════════════════════════════════════
  // ENUM TYPES
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
  // TABLE: users
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'pending_verification',
    "kyc_level" "KycLevel" NOT NULL DEFAULT 'LEVEL_0',
    "active_mode" "UserMode" NOT NULL DEFAULT 'live',
    "referral_code" TEXT NOT NULL,
    "referred_by_id" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "kyc_verification_code" TEXT,
    "verification_code" TEXT,
    "verification_code_expires" TIMESTAMP(3),
    "kyc_code_expires_at" TIMESTAMP(3),
    "kyc_code_purchased" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "login_attempt_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "preferred_currency" TEXT NOT NULL DEFAULT 'USD',
    "preferred_language" TEXT NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: profiles
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "avatar_url" TEXT,
    "country" TEXT,
    "street_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: wallets
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "WalletType" NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "available_balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "locked_balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: transactions
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(18,2) NOT NULL,
    "description" TEXT,
    "reference_id" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: investment_plans
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "investment_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "tier_name" TEXT NOT NULL,
    "min_amount" DECIMAL(18,2) NOT NULL,
    "max_amount" DECIMAL(18,2),
    "daily_return_rate" DECIMAL(8,4) NOT NULL,
    "duration" INTEGER NOT NULL,
    "duration_unit" "DurationUnit" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "investment_plans_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: user_investments
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "user_investments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "mode" "UserMode" NOT NULL DEFAULT 'demo',
    "status" "InvestmentStatus" NOT NULL DEFAULT 'active',
    "daily_return" DECIMAL(18,2) NOT NULL,
    "total_return" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "expected_return" DECIMAL(18,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "last_payout_at" TIMESTAMP(3),
    "payout_status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_investments_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: deposits
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "deposits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "usd_amount" DECIMAL(18,2) NOT NULL,
    "method" "DepositMethod" NOT NULL,
    "crypto_currency" "CryptoCurrency",
    "tx_hash" TEXT,
    "status" "DepositStatus" NOT NULL DEFAULT 'pending',
    "mode" "UserMode" NOT NULL DEFAULT 'demo',
    "rejection_reason" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: withdrawals
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "withdrawals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "fee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(18,2) NOT NULL,
    "destination_type" "WithdrawalDestinationType" NOT NULL,
    "destination_address" TEXT,
    "bank_name" TEXT,
    "bank_account_name" TEXT,
    "bank_account_number" TEXT,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'pending',
    "mode" "UserMode" NOT NULL DEFAULT 'demo',
    "rejection_reason" TEXT,
    "processed_by" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: referrals
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referred_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: referral_commissions
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "referral_commissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "deposit_id" TEXT,
    "referrer_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "rate" DECIMAL(8,4) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "type" "ReferralCommissionType" NOT NULL DEFAULT 'direct',
    "status" "ReferralCommissionStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "referral_commissions_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: binary_nodes
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "binary_nodes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "position" "BinaryPosition" NOT NULL,
    "volume_left" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "volume_right" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "binary_nodes_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: kyc_documents
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "kyc_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "KycDocumentType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" "KycDocumentStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: kyc_verifications
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "kyc_verifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level" "KycLevel" NOT NULL,
    "status" "KycDocumentStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kyc_verifications_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: admins
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "admins" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "AdminRoleName" NOT NULL DEFAULT 'SUPPORT',
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: notifications
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "action_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: support_tickets
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'open',
    "priority" "TicketPriority" NOT NULL DEFAULT 'medium',
    "assigned_to" TEXT,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: audit_logs
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL DEFAULT '',
    "resource_id" TEXT,
    "target" TEXT,
    "details" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: two_factor_auths
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "two_factor_auths" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "two_factor_auths_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: otps
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "type" "OtpType" NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: email_logs
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "email_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'sent',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: promo_codes
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "PromoDiscountType" NOT NULL,
    "discount_value" DECIMAL(18,2) NOT NULL,
    "min_deposit" DECIMAL(18,2),
    "max_uses" INTEGER,
    "current_uses" INTEGER NOT NULL DEFAULT 0,
    "status" "PromoCodeStatus" NOT NULL DEFAULT 'active',
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: user_promos
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "user_promos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "promo_code_id" TEXT NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_promos_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: gift_cards
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "gift_cards" (
    "id" TEXT NOT NULL,
    "deposit_id" TEXT,
    "card_type" TEXT NOT NULL,
    "card_code" TEXT NOT NULL,
    "pin_code" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "image_url" TEXT,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: payment_addresses
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "payment_addresses" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "network" TEXT,
    "address" TEXT NOT NULL,
    "qr_code_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payment_addresses_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: site_settings
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "about_photo_url" TEXT,
    "about_photo_updated_at" TIMESTAMP(3),
    "elon_photo_url" TEXT,
    "elon_photo_updated_at" TIMESTAMP(3),
    "slideshow_models" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: chart_spike_events
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "chart_spike_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'up',
    "magnitudePct" DECIMAL(8,4) NOT NULL,
    "message" TEXT,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "consumed_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chart_spike_events_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: tesla_vehicles
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "tesla_vehicles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "base_price" DOUBLE PRECISION NOT NULL,
    "image_url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specs" JSONB NOT NULL,
    "colors" JSONB NOT NULL,
    "interior" TEXT NOT NULL DEFAULT 'Premium Black',
    "estimated_delivery" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tesla_vehicles_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: vehicle_orders
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "vehicle_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "status" "VehicleOrderStatus" NOT NULL DEFAULT 'pending',
    "selected_color" "VehicleColor" NOT NULL DEFAULT 'pearl_white',
    "selected_interior" TEXT NOT NULL DEFAULT 'Premium Black',
    "total_price" DOUBLE PRECISION NOT NULL,
    "deposit_amount" DOUBLE PRECISION NOT NULL,
    "deposit_paid" BOOLEAN NOT NULL DEFAULT false,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "order_number" TEXT NOT NULL,
    "tracking_info" JSONB,
    "notes" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_orders_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // TABLE: vehicle_deposit_payments
  // ══════════════════════════════════════════════════════════
  `CREATE TABLE IF NOT EXISTS "vehicle_deposit_payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "crypto_currency" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "tx_hash" TEXT,
    "sender_address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmed_by" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_deposit_payments_pkey" PRIMARY KEY ("id")
  )`,

  // ══════════════════════════════════════════════════════════
  // INDEXES
  // ══════════════════════════════════════════════════════════
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_referral_code_key" ON "users"("referral_code")`,
  `CREATE INDEX IF NOT EXISTS "idx_user_status" ON "users"("status")`,
  `CREATE INDEX IF NOT EXISTS "idx_user_kyc_level" ON "users"("kyc_level")`,
  `CREATE INDEX IF NOT EXISTS "idx_user_referred_by" ON "users"("referred_by_id")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "uq_wallet_user_type" ON "wallets"("user_id", "type")`,

  `CREATE INDEX IF NOT EXISTS "idx_tx_wallet" ON "transactions"("wallet_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_tx_type" ON "transactions"("type")`,
  `CREATE INDEX IF NOT EXISTS "idx_tx_status" ON "transactions"("status")`,
  `CREATE INDEX IF NOT EXISTS "idx_tx_reference" ON "transactions"("reference_id")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "investment_plans_slug_key" ON "investment_plans"("slug")`,

  `CREATE INDEX IF NOT EXISTS "idx_invest_user" ON "user_investments"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_invest_status" ON "user_investments"("status")`,

  `CREATE INDEX IF NOT EXISTS "idx_deposit_user" ON "deposits"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_deposit_status" ON "deposits"("status")`,
  `CREATE INDEX IF NOT EXISTS "idx_deposit_wallet" ON "deposits"("wallet_id")`,

  `CREATE INDEX IF NOT EXISTS "idx_withdrawal_user" ON "withdrawals"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_withdrawal_status" ON "withdrawals"("status")`,
  `CREATE INDEX IF NOT EXISTS "idx_withdrawal_wallet" ON "withdrawals"("wallet_id")`,

  `CREATE INDEX IF NOT EXISTS "idx_referral_referrer" ON "referrals"("referrer_id")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "uq_referral_pair" ON "referrals"("referrer_id", "referred_id")`,

  `CREATE INDEX IF NOT EXISTS "idx_commission_user" ON "referral_commissions"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_commission_status" ON "referral_commissions"("status")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "binary_nodes_user_id_key" ON "binary_nodes"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_binary_parent" ON "binary_nodes"("parent_id")`,

  `CREATE INDEX IF NOT EXISTS "idx_kycdoc_user" ON "kyc_documents"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_kycdoc_status" ON "kyc_documents"("status")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "kyc_verifications_user_id_key" ON "kyc_verifications"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_kycverif_status" ON "kyc_verifications"("status")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "admins_user_id_key" ON "admins"("user_id")`,

  `CREATE INDEX IF NOT EXISTS "idx_notif_user" ON "notifications"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_notif_read" ON "notifications"("is_read")`,
  `CREATE INDEX IF NOT EXISTS "idx_notif_created" ON "notifications"("created_at")`,

  `CREATE INDEX IF NOT EXISTS "idx_ticket_user" ON "support_tickets"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_ticket_status" ON "support_tickets"("status")`,

  `CREATE INDEX IF NOT EXISTS "idx_audit_user" ON "audit_logs"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_audit_admin" ON "audit_logs"("admin_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_audit_action" ON "audit_logs"("action")`,
  `CREATE INDEX IF NOT EXISTS "idx_audit_created" ON "audit_logs"("created_at")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "two_factor_auths_user_id_key" ON "two_factor_auths"("user_id")`,

  `CREATE INDEX IF NOT EXISTS "idx_otp_email" ON "otps"("email")`,

  `CREATE INDEX IF NOT EXISTS "idx_email_user" ON "email_logs"("user_id")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "promo_codes_code_key" ON "promo_codes"("code")`,

  `CREATE INDEX IF NOT EXISTS "idx_userpromo_code" ON "user_promos"("promo_code_id")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "uq_userpromo_user_code" ON "user_promos"("user_id", "promo_code_id")`,

  `CREATE INDEX IF NOT EXISTS "idx_giftcard_status" ON "gift_cards"("status")`,
  `CREATE INDEX IF NOT EXISTS "idx_giftcard_deposit" ON "gift_cards"("deposit_id")`,

  `CREATE INDEX IF NOT EXISTS "idx_chart_spike_user_unread" ON "chart_spike_events"("user_id", "consumed", "created_at")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "tesla_vehicles_slug_key" ON "tesla_vehicles"("slug")`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "vehicle_orders_order_number_key" ON "vehicle_orders"("order_number")`,
  `CREATE INDEX IF NOT EXISTS "idx_vehicle_order_user" ON "vehicle_orders"("user_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_vehicle_order_status" ON "vehicle_orders"("status")`,

  `CREATE INDEX IF NOT EXISTS "idx_vehicle_deposit_order" ON "vehicle_deposit_payments"("order_id")`,
  `CREATE INDEX IF NOT EXISTS "idx_vehicle_deposit_status" ON "vehicle_deposit_payments"("status")`,
];

// ── Foreign key constraints — separate array, logged distinctly, errors are non-fatal
const FK_STATEMENTS = [
  `ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  `ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "user_investments" ADD CONSTRAINT "user_investments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "user_investments" ADD CONSTRAINT "user_investments_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "investment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "user_investments" ADD CONSTRAINT "user_investments_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "deposits" ADD CONSTRAINT "deposits_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "referral_commissions" ADD CONSTRAINT "referral_commissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "binary_nodes" ADD CONSTRAINT "binary_nodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "binary_nodes" ADD CONSTRAINT "binary_nodes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "binary_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  `ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("user_id") ON DELETE SET NULL ON UPDATE CASCADE`,
  `ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  `ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "user_promos" ADD CONSTRAINT "user_promos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "user_promos" ADD CONSTRAINT "user_promos_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "chart_spike_events" ADD CONSTRAINT "chart_spike_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "vehicle_orders" ADD CONSTRAINT "vehicle_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "vehicle_orders" ADD CONSTRAINT "vehicle_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "tesla_vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "vehicle_deposit_payments" ADD CONSTRAINT "vehicle_deposit_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "vehicle_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "vehicle_deposit_payments" ADD CONSTRAINT "vehicle_deposit_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
];

async function runStatements(label, statements) {
  let applied = 0;
  let skipped = 0;
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      const short = sql.length > 80 ? sql.slice(0, 77) + '...' : sql;
      console.log(`[m[migrate-safety-net] OK: ${short}`);
      applied += 1;
    } catch (err) {
      const msg = err.message || '';
      const isExpected = msg.includes('already exists') ||
        msg.includes('duplicate');
      if (isExpected) {
        console.log(`[m[migrate-safety-net] SKIP (exists): ${sql.slice(0, 60)}`);
      } else {
        console.error(`[m[migrate-safety-net] ERROR: ${msg} | SQL: ${sql.slice(0, 80)}`);
      }
      skipped += 1;
    }
  }
  return { applied, skipped };
}

async function run() {
  console.log(`[m[migrate-safety-net] Running ${DDL_STATEMENTS.length} DDL + ${FK_STATEMENTS.length} FK statements...`);

  const ddl = await runStatements('DDL', DDL_STATEMENTS);
  const fk = await runStatements('FK', FK_STATEMENTS);

  console.log(`[m[migrate-safety-net] Done. DDL applied: ${ddl.applied}, skipped: ${ddl.skipped}. FK applied: ${fk.applied}, skipped: ${fk.skipped}.`);
}

run()
  .catch((e) => {
    console.error('[m[migrate-safety-net] FATAL (non-blocking):', e.message);
  })
  .finally(() => {
    clearTimeout(GLOBAL_TIMEOUT);
    return prisma.$disconnect();
  });
