# Multi-stage Dockerfile for Nx monorepo apps
# Usage: docker build --build-arg APP_NAME=workspaces -t fubs-workspaces .

# Build arguments
ARG APP_NAME
ARG NODE_VERSION=20-alpine

# Base image with Node.js
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
# Install dependencies needed for building
RUN apk add --no-cache libc6-compat openssl
COPY package.json yarn.lock ./
COPY nx.json tsconfig.base.json ./
RUN yarn install --frozen-lockfile

# Build stage
FROM base AS builder
ARG APP_NAME
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .

# Build shared libraries first
RUN yarn nx build shared

# Build the specific app and its dependencies
RUN yarn nx build ${APP_NAME}

# Copy Prisma files to build output if they exist
RUN if [ -d "./apps/${APP_NAME}/prisma" ]; then \
  cp -r ./apps/${APP_NAME}/prisma ./dist/apps/${APP_NAME}/; \
  fi

# Production stage
FROM node:${NODE_VERSION} AS runner
ARG APP_NAME
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/${APP_NAME} ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy package.json for dependencies info
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Generate Prisma client if prisma directory exists
RUN if [ -d ./prisma ]; then \
  npx prisma generate; \
  fi

USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start command with potential migrations
CMD ["sh", "-c", "if [ -d ./prisma ]; then npx prisma migrate deploy; fi && node main.js"]
