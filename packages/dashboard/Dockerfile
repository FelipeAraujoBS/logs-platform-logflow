FROM node:20-alpine AS builder

WORKDIR /app

COPY packages/dashboard/package*.json ./
COPY packages/dashboard/nginx.conf ./nginx.conf

RUN npm install

COPY packages/dashboard .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist/dashboard /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80