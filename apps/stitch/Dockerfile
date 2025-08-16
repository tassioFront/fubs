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
RUN npx prisma generate --schema=./apps/stitch/prisma/schema.prisma

# Build the Stitch app
RUN NX_DAEMON=false yarn nx build stitch --configuration=production

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app



# Install openssl and clean up apt cache
RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4001


# Create user and group in a single RUN
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs


# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/stitch/ ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/stitch/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy package.json for runtime
COPY --from=builder /app/package.json ./package.json

USER nestjs


EXPOSE 4001

# Regenerate Prisma Client in production environment and start the application
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node main.js"]
