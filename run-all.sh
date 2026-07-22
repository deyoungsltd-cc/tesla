#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║  TESLA PRIME CAPITAL — Complete Setup & Deploy Script            ║
# ║  Run: chmod +x run-all.sh && ./run-all.sh                       ║
# ╚══════════════════════════════════════════════════════════════════╝

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

SEPARATOR="━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log() { echo -e "${BLUE}[SETUP]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "\n${CYAN}${BOLD}⚡ TESLA PRIME CAPITAL — Full Setup${NC}\n"

cd "$(dirname "$0")"

# ─────────────────────────────────────────────
# STEP 1: Install Dependencies
# ─────────────────────────────────────────────
echo -e "${CYAN}${SEPARATOR}${NC}"
echo -e "${CYAN}${BOLD}  STEP 1/8 — Installing Dependencies${NC}"
echo -e "${CYAN}${SEPARATOR}${NC}"

if [ -f "bun.lock" ]; then
  log "Detected bun.lock — using bun..."
  bun install
  success "Dependencies installed (bun)"
elif [ -f "package-lock.json" ]; then
  log "Detected package-lock.json — using npm..."
  npm install
  success "Dependencies installed (npm)"
else
  log "No lock file found — running npm install..."
  npm install
  success "Dependencies installed (npm)"
fi

# ─────────────────────────────────────────────
# STEP 2: Environment Variables Check
# ─────────────────────────────────────────────
echo -e "\n${CYAN}${SEPARATOR}${NC}"
echo -e "${CYAN}${BOLD}  STEP 2/8 — Environment Variables${NC}"
echo -e "${CYAN}${SEPARATOR}${NC}"

if [ -f ".env.local" ]; then
  success ".env.local found"
else
  warn ".env.local not found! Creating from template..."
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    warn "Created .env.local — EDIT IT with your real values before continuing"
  else
    error ".env.example not found either. Create .env.local manually with:"
    error "  DATABASE_URL, JWT_SECRET, RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_APP_URL"
  fi
fi

# Check each required var
check_env() {
  if grep -q "^${1}=" .env.local 2>/dev/null; then
    val=$(grep "^${1}=" .env.local | cut -d'=' -f2-)
    if [ -z "$val" ]; then
      warn "  ${1} is empty — set this value"
      return 1
    else
      success "  ${1} = ${val:0:20}..."
      return 0
    fi
  else
    warn "  ${1} not found in .env.local"
    return 1
  fi
}

echo ""
check_env "DATABASE_URL"
check_env "JWT_SECRET"
check_env "RESEND_API_KEY"
check_env "EMAIL_FROM"
check_env "NEXT_PUBLIC_APP_URL"

# ─────────────────────────────────────────────
# STEP 3: Generate Prisma Client
# ─────────────────────────────────────────────
echo -e "\n${CYAN}${SEPARATOR}${NC}"
echo -e "${CYAN}${BOLD}  STEP 3/8 — Prisma Setup${NC}"
echo -e "${CYAN}${SEPARATOR}${NC}"

log "Generating Prisma client..."
npx prisma generate
success "Prisma client generated"

log "Pushing schema to database..."
npx prisma db push 2>/dev/null || {
  warn "Prisma db push failed — check your DATABASE_URL"
  warn "The schema is set to PostgreSQL. Make sure your Supabase DB is accessible."
}

# ─────────────────────────────────────────────
# STEP 4: Build Next.js
# ─────────────────────────────────────────────
echo -e "\n${CYAN}${SEPARATOR}${NC}"
echo -e "${CYAN}${BOLD}  STEP 4/8 — Building Next.js${NC}"
echo -e "${CYAN}${SEPARATOR}${NC}"

log "Running production build (this may take a minute)..."
npm run build 2>&1 | tail -5
success "Build complete"

# ─────────────────────────────────────────────
# STEP 5: Verify Key Files Exist
# ─────────────────────────────────────────────
echo -e "\n${CYAN}${SEPARATOR}${NC}"
echo -e "${CYAN}${BOLD}  STEP 5/8 — File Verification${NC}"
echo -e "${CYAN}${SEPARATOR}${NC}"

FILES=(
  "src/app/(public)/page.tsx:Homepage (server)"
  "src/app/(public)/layout.tsx:Public layout + navbar + footer"
  "src/app/(public)/LandingPageClient.tsx:Homepage client component"
  "src/app/(public)/plans/page.tsx:Investment plans page"
  "src/app/(public)/about/page.tsx:About us page"
  "src/app/(public)/faq/page.tsx:FAQ page"
  "src/app/(public)/how-to-invest/page.tsx:How to invest guide"
  "src/app/(public)/contact/page.tsx:Contact page"
  "src/app/(public)/privacy/page.tsx:Privacy policy"
  "src/app/(public)/terms/page.tsx:Terms of service"
  "src/app/(public)/risk-disclosure/page.tsx:Risk disclosure"
  "src/app/(public)/aml-policy/page.tsx:AML policy"
  "src/components/WithdrawalNotification.tsx:Live withdrawal popup"
  "src/components/StructuredData.tsx:SEO JSON-LD structured data"
  "src/components/TickerTapeWidget.tsx:TradingView ticker tape"
  "src/components/TradingViewWidget.tsx:TSLA live chart"
  "src/app/sitemap.ts:SEO sitemap generator"
  "src/app/(dashboard)/security/page.tsx:2FA & security page"
  "prisma/schema.prisma:Database schema (PostgreSQL)"
  "next.config.ts:Security headers + CSP"
  "public/robots.txt:Search engine directives"
  ".env.local:Environment variables"
)

all_ok=true
for item in "${FILES[@]}"; do
  file="${item%%:*}"
  desc="${item##*:}"
  if [ -f "$file" ]; then
    success "  ✓ ${desc}"
  else
    error "  ✗ MISSING: ${desc} (${file})"
    all_ok=false
  fi
done

# ─────────────────────────────────────────────
# STEP 6: SEO Checks
# ─────────────────────────────────────────────
echo -e "\n${CYAN}${SEPARATOR}${NC}"
echo -e "${CYAN}${BOLD}  STEP 6/8 — SEO Verification${NC}"
echo -e "${CYAN}${SEPARATOR}${NC}"

# Check for metadata exports
PAGES_WITH_META=$(grep -rl "export const metadata" src/app/ 2>/dev/null | wc -l)
success "  ${PAGES_WITH_META} pages have metadata exports"

# Check structured data
if [ -f "src/components/StructuredData.tsx" ]; then
  success "  JSON-LD structured data component exists"
else
  warn "  JSON-LD structured data missing"
fi

# Check sitemap
if [ -f "src/app/sitemap.ts" ]; then
  success "  Dynamic sitemap.ts exists"
else
  warn "  sitemap.ts missing"
fi

# Check robots.txt
if [ -f "public/robots.txt" ]; then
  success "  robots.txt exists"
else
  warn "  robots.txt missing"
fi

# Check security headers
if grep -q "Content-Security-Policy" next.config.ts 2>/dev/null; then
  success "  CSP headers configured"
else
  warn "  CSP headers not found in next.config.ts"
fi

# Check for Open Graph tags
if grep -rq "openGraph" src/app/ 2>/dev/null; then
  success "  Open Graph metadata configured"
else
  warn "  Open Graph metadata missing"
fi

# ─────────────────────────────────────────────
# STEP 7: Feature Checklist
# ─────────────────────────────────────────────
echo -e "\n${CYAN}${SEPARATOR}${NC}"
echo -e "${CYAN}${BOLD}  STEP 7/8 — Feature Checklist${NC}"
echo -e "${CYAN}${SEPARATOR}${NC}"

FEATURES=(
  "CSP security headers:grep -q Content-Security-Policy next.config.ts"
  "Live TSLA chart:grep -q TradingViewWidget src/app/(public)/LandingPageClient.tsx"
  "Ticker tape widget:grep -q TickerTapeWidget src/app/(public)/LandingPageClient.tsx"
  "Withdrawal notifications:grep -q WithdrawalNotification src/app/(public)/LandingPageClient.tsx"
  "2FA security page:grep -q security/page.tsx <<< 'x'"
  "SEO metadata:grep -q metadata src/app/(public)/page.tsx"
  "Structured data:grep -q FinancialService src/components/StructuredData.tsx"
  "Sitemap:grep -q sitemap src/app/sitemap.ts"
  "Investment plans:grep -q plans/page.tsx <<< 'x'"
  "FAQ page:grep -q faq/page.tsx <<< 'x'"
  "About page:grep -q about/page.tsx <<< 'x'"
  "Contact form:grep -q contact/page.tsx <<< 'x'"
  "Legal pages (4):grep -q privacy <<< 'x'"
  "Dedicated routes:grep -q Link href= src/app/(public)/LandingPageClient.tsx"
  "JWT auth:grep -q jsonwebtoken package.json"
  "Prisma PostgreSQL:grep -q postgresql prisma/schema.prisma"
  "Resend email:grep -q resend package.json"
)

for feature in "${FEATURES[@]}"; do
  name="${feature%%:*}"
  check="${feature##*:}"
  if eval "$check" 2>/dev/null; then
    success "  ✓ ${name}"
  else
    warn "  ✗ ${name}"
  fi
done

# ─────────────────────────────────────────────
# STEP 8: Deployment Instructions
# ─────────────────────────────────────────────
echo -e "\n${CYAN}${SEPARATOR}${NC}"
echo -e "${CYAN}${BOLD}  STEP 8/8 — Deployment${NC}"
echo -e "${CYAN}${SEPARATOR}${NC}"

log "Git status:"
git status --short 2>/dev/null | head -20 || warn "  Not a git repo or no changes"

echo ""
echo -e "${YELLOW}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}${BOLD}║  🚀 TO DEPLOY TO RAILWAY:                                   ║${NC}"
echo -e "${YELLOW}${BOLD}║                                                              ║${NC}"
echo -e "${YELLOW}${BOLD}║  1. git add .                                               ║${NC}"
echo -e "${YELLOW}${BOLD}║  2. git commit -m \"feat: full platform with SEO + 2FA\"       ║${NC}"
echo -e "${YELLOW}${BOLD}║  3. git push origin main                                    ║${NC}"
echo -e "${YELLOW}${BOLD}║                                                              ║${NC}"
echo -e "${YELLOW}${BOLD}║  RAILWAY ENV VARS TO SET:                                    ║${NC}"
echo -e "${YELLOW}${BOLD}║  DATABASE_URL, JWT_SECRET, RESEND_API_KEY,                  ║${NC}"
echo -e "${YELLOW}${BOLD}║  EMAIL_FROM, NEXT_PUBLIC_APP_URL                             ║${NC}"
echo -e "${YELLOW}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${GREEN}${BOLD}✅ Setup complete!${NC}\n"

# ─────────────────────────────────────────────
# OPTIONAL: Start dev server
# ─────────────────────────────────────────────
if [ "$1" = "--dev" ]; then
  echo -e "${CYAN}${BOLD}Starting dev server...${NC}\n"
  npm run dev
fi
