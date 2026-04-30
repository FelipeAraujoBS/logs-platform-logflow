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

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/ingestor/package*.json ./packages/ingestor/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/ingestor/dist ./packages/ingestor/dist
COPY --from=builder /app/packages/ingestor/proto ./packages/ingestor/proto

WORKDIR /app/packages/ingestor

CMD ["node", "dist/index.js"]