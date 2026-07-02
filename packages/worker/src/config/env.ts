import "dotenv/config";

function optionalNumber(key: string, fallback: number): number {
  const value = process.env[key];
  if (!value) return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num;
}

export const env = {
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: optionalNumber("REDIS_PORT", 6379),
  },
  mongodb: {
    uri: process.env.MONGODB_URI ?? "mongodb://admin:admin@localhost:27017/logflow?authSource=admin",
    dbName: process.env.MONGODB_DB ?? "logflow",
  },
  worker: {
    concurrency: optionalNumber("WORKER_CONCURRENCY", 10),
    metricsPort: optionalNumber("WORKER_METRICS_PORT", 9090),
  },
} as const;
