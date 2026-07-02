FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ingestor/package*.json ./packages/ingestor/

RUN npm install

COPY packages/shared ./packages/shared
COPY packages/ingestor ./packages/ingestor

RUN npm run build -w @log-platform/shared
RUN npm run build -w @log-platform/ingestor

FROM node:20-alpine

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ingestor/package*.json ./packages/ingestor/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/ingestor/dist ./packages/ingestor/dist
COPY --from=builder /app/packages/ingestor/proto ./packages/ingestor/proto

USER app

WORKDIR /app/packages/ingestor

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', r => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]
