FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/dashboard/package*.json ./packages/dashboard/

RUN npm ci

COPY packages/dashboard ./packages/dashboard

RUN npm run build --prefix packages/dashboard

FROM nginx:1.25-alpine

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/packages/dashboard/dist/dashboard /usr/share/nginx/html
COPY --from=builder /app/packages/dashboard/nginx.conf /etc/nginx/conf.d/default.conf

USER app

EXPOSE 80
