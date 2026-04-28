import "dotenv/config";

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  redis: {
    host: optional("REDIS_HOST", "localhost"),
    port: optional("REDIS_PORT", "6379"),
  },
  mongodb: {
    uri: optional(
      "MONGODB_URI",
      "mongodb://admin:admin@localhost:27017/logflow?authSource=admin"
    ),
    dbName: optional("MONGODB_DB", "logflow"),
  },
} as const;
