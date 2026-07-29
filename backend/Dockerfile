# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kivis_build
ENV DATABASE_URL=$DATABASE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN npm run build
RUN npm prune --omit=dev

# ---- Production Stage ----
FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app

RUN apk add --no-cache dumb-init openssl

COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/prisma.config.ts ./prisma.config.ts

RUN mkdir -p /app/uploads/room/images && chown -R node:node /app/uploads

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3001), (res) => process.exit(res.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
