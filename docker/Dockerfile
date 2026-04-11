# ============================================
# QueuePilot - Multi-stage Production Build
# ============================================

# Stage 1: Install ALL dependencies (with build tools for native modules)
FROM node:22-alpine AS deps
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Stage 2: Build shared package
FROM deps AS build-shared
COPY packages/shared/ ./packages/shared/
COPY tsconfig.base.json ./
RUN pnpm --filter @queuepilot/shared build

# Stage 3: Build frontend
FROM build-shared AS build-web
COPY apps/web/ ./apps/web/
RUN pnpm --filter @queuepilot/web build

# Stage 4: Build backend
FROM build-shared AS build-api
COPY apps/api/ ./apps/api/
RUN pnpm --filter @queuepilot/api build

# Stage 5: Install production-only deps (with build tools, then discard tools)
FROM deps AS prod-deps
ENV CI=true
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Stage 6: Clean production image (NO build tools)
FROM node:22-alpine AS production
RUN apk add --no-cache tini
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/queuepilot.db

RUN mkdir -p /app/data

# Copy only what's needed from build stages
COPY --from=build-api /app/apps/api/dist ./apps/api/dist
COPY --from=build-api /app/apps/api/package.json ./apps/api/
COPY --from=build-web /app/apps/web/dist ./apps/web/dist
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist
COPY --from=build-shared /app/packages/shared/package.json ./packages/shared/
COPY --from=build-shared /app/packages/shared/src ./packages/shared/src
COPY package.json pnpm-workspace.yaml .npmrc ./

# Copy pre-built node_modules (includes compiled native modules)
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3000
VOLUME ["/app/data"]

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/api/dist/main"]
