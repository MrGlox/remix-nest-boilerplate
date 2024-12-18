FROM --platform=amd64 node:18-alpine As base

FROM base AS builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install --global turbo
COPY --chown=node:node . .
RUN turbo prune @repo/server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --chown=node:node --from=builder /app/out/json/ .
COPY --chown=node:node --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Uncomment and use build args to enable remote caching
ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM

ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV TZ=Europe/Paris
ENV NODE_ENV="production"

ADD server/prisma server/prisma
RUN cd server && npx prisma generate

RUN npm run build

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remix-api
USER remix-api

# ENV TZ=Europe/Paris
# ENV NODE_ENV="production"

COPY --chown=remix-api:nodejs --from=installer /app/server/package.json ./server/package.json
COPY --chown=remix-api:nodejs --from=installer /app/server/dist ./server/dist
COPY --chown=remix-api:nodejs --from=installer /app/node_modules ./node_modules
COPY --chown=remix-api:nodejs --from=installer /app/node_modules/@repo/web ./node_modules/@repo/web
COPY --chown=remix-api:nodejs --from=installer /app/node_modules/@repo/typescript-config ./node_modules/@repo/typescript-config
COPY --chown=remix-api:nodejs --from=installer /app/node_modules/@repo/eslint-config ./node_modules/@repo/eslint-config
COPY --chown=remix-api:nodejs --from=installer /app/server/prisma ./server/prisma

COPY --chown=remix-api:nodejs --from=builder /app/server/start.sh ./server/start.sh

ENTRYPOINT [ "server/start.sh" ]