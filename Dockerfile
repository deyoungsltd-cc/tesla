# =============================================
# TESLA PLATFORM - Dockerfile
# =============================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm install --ignore-scripts && npx prisma generate

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY . .

RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

# Copy prisma for runtime db push
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy seed file
COPY --from=builder /app/prisma/seed.cjs ./prisma/seed.cjs

# Copy node_modules for prisma CLI and bcryptjs at runtime
COPY --from=deps /app/node_modules ./node_modules

# Copy startup script
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x /app/start.sh

# Ensure uploads dir exists and is writable
RUN mkdir -p /tmp/uploads && chown -R nextjs:nodejs /tmp/uploads /app/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]
