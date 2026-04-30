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

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/query-api/package*.json ./packages/query-api/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/query-api/dist ./packages/query-api/dist

WORKDIR /app/packages/query-api

CMD ["node", "dist/index.js"]