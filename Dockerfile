# =============================================
# TESLA PLATFORM - Dockerfile
# =============================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install without triggering postinstall, then generate prisma separately
RUN npm install --ignore-scripts && npx prisma generate

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/.prisma ./.prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
