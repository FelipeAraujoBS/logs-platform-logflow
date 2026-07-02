FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/worker/package*.json ./packages/worker/

RUN npm install

COPY packages/shared ./packages/shared
COPY packages/worker ./packages/worker

RUN npm run build -w @log-platform/shared
RUN npm run build -w @log-platform/worker

FROM node:20-alpine

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/worker/package*.json ./packages/worker/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/worker/dist ./packages/worker/dist

USER app

WORKDIR /app/packages/worker

CMD ["node", "dist/index.js"]
