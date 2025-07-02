# Multi-stage build for production optimization
FROM docker.io/node:lts-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
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

# Generate Prisma client
RUN npx prisma generate --schema=./apps/projects/prisma/schema.prisma

# Build the projects application
RUN npx nx build projects --prod

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/projects ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/projects/prisma ./prisma

# Copy package.json for runtime
COPY --from=builder /app/package.json ./package.json

USER nestjs

EXPOSE 3000

# Start the application with Prisma migration
CMD ["sh", "-c", "npx prisma migrate deploy && node main.js"]
