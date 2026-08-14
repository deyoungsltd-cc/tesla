-- AlterTable: Wallet — money fields Float → Decimal(18,2)
ALTER TABLE "wallets" ALTER COLUMN "balance" TYPE NUMERIC(18,2) USING "balance"::NUMERIC(18,2);
ALTER TABLE "wallets" ALTER COLUMN "available_balance" TYPE NUMERIC(18,2) USING "available_balance"::NUMERIC(18,2);
ALTER TABLE "wallets" ALTER COLUMN "locked_balance" TYPE NUMERIC(18,2) USING "locked_balance"::NUMERIC(18,2);

-- AlterTable: Transaction — amount Float → Decimal(18,2)
ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE NUMERIC(18,2) USING "amount"::NUMERIC(18,2);

-- AlterTable: InvestmentPlan — money fields Float → Decimal
ALTER TABLE "investment_plans" ALTER COLUMN "min_amount" TYPE NUMERIC(18,2) USING "min_amount"::NUMERIC(18,2);
ALTER TABLE "investment_plans" ALTER COLUMN "max_amount" TYPE NUMERIC(18,2) USING "max_amount"::NUMERIC(18,2);
ALTER TABLE "investment_plans" ALTER COLUMN "daily_return_rate" TYPE NUMERIC(8,4) USING "daily_return_rate"::NUMERIC(8,4);

-- AlterTable: UserInvestment — money fields Float → Decimal(18,2)
ALTER TABLE "user_investments" ALTER COLUMN "amount" TYPE NUMERIC(18,2) USING "amount"::NUMERIC(18,2);
ALTER TABLE "user_investments" ALTER COLUMN "daily_return" TYPE NUMERIC(18,2) USING "daily_return"::NUMERIC(18,2);
ALTER TABLE "user_investments" ALTER COLUMN "total_return" TYPE NUMERIC(18,2) USING "total_return"::NUMERIC(18,2);
ALTER TABLE "user_investments" ALTER COLUMN "expected_return" TYPE NUMERIC(18,2) USING "expected_return"::NUMERIC(18,2);

-- AlterTable: Deposit — money fields Float → Decimal(18,2)
ALTER TABLE "deposits" ALTER COLUMN "amount" TYPE NUMERIC(18,2) USING "amount"::NUMERIC(18,2);
ALTER TABLE "deposits" ALTER COLUMN "usd_amount" TYPE NUMERIC(18,2) USING "usd_amount"::NUMERIC(18,2);

-- AlterTable: Withdrawal — money fields Float → Decimal(18,2)
ALTER TABLE "withdrawals" ALTER COLUMN "amount" TYPE NUMERIC(18,2) USING "amount"::NUMERIC(18,2);
ALTER TABLE "withdrawals" ALTER COLUMN "fee" TYPE NUMERIC(18,2) USING "fee"::NUMERIC(18,2);
ALTER TABLE "withdrawals" ALTER COLUMN "net_amount" TYPE NUMERIC(18,2) USING "net_amount"::NUMERIC(18,2);

-- AlterTable: ReferralCommission — Float → Decimal
ALTER TABLE "referral_commissions" ALTER COLUMN "amount" TYPE NUMERIC(18,2) USING "amount"::NUMERIC(18,2);
ALTER TABLE "referral_commissions" ALTER COLUMN "rate" TYPE NUMERIC(8,4) USING "rate"::NUMERIC(8,4);

-- AlterTable: BinaryNode — volume fields Float → Decimal(18,2)
ALTER TABLE "binary_nodes" ALTER COLUMN "volume_left" TYPE NUMERIC(18,2) USING "volume_left"::NUMERIC(18,2);
ALTER TABLE "binary_nodes" ALTER COLUMN "volume_right" TYPE NUMERIC(18,2) USING "volume_right"::NUMERIC(18,2);

-- AlterTable: PromoCode — Float → Decimal(18,2)
ALTER TABLE "promo_codes" ALTER COLUMN "discount_value" TYPE NUMERIC(18,2) USING "discount_value"::NUMERIC(18,2);
ALTER TABLE "promo_codes" ALTER COLUMN "min_deposit" TYPE NUMERIC(18,2) USING "min_deposit"::NUMERIC(18,2);

-- AlterTable: GiftCard — amount Float → Decimal(18,2)
ALTER TABLE "gift_cards" ALTER COLUMN "amount" TYPE NUMERIC(18,2) USING "amount"::NUMERIC(18,2);
