# Multi-stage build for production optimization
FROM node:lts-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock* ./
COPY nx.json tsconfig.base.json ./


# Install dependencies
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client with correct binary targets for production
RUN npx prisma generate --schema=./apps/tasks/prisma/schema.prisma

RUN NX_DAEMON=false yarn nx build tasks --configuration=production

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y openssl

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/tasks/dist/ ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/tasks/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/@prisma/client-tasks ./node_modules/@prisma/client-tasks

# Copy package.json for runtime
COPY --from=builder /app/package.json ./package.json

USER nestjs

EXPOSE 4000

# Regenerate Prisma Client in production environment and start the application
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node main.js"]
