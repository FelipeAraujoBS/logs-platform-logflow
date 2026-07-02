FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/query-api/package*.json ./packages/query-api/

RUN npm install

COPY packages/shared ./packages/shared
COPY packages/query-api ./packages/query-api

RUN npm run build -w @log-platform/shared
RUN npm run build -w @log-platform/query-api

FROM node:20-alpine

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/query-api/package*.json ./packages/query-api/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/query-api/dist ./packages/query-api/dist

USER app

WORKDIR /app/packages/query-api

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health', r => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
