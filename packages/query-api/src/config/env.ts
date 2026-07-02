import "dotenv/config";

function requiredString(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variavel de ambiente obrigatória ausente: ${key}`);
  return value;
}

function optionalNumber(key: string, fallback: number): number {
  const value = process.env[key];
  if (!value) return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num;
}

export const env = {
  http: {
    port: optionalNumber("HTTP_PORT", 3001),
  },
  mongodb: {
    uri: process.env.MONGODB_URI ?? "mongodb://admin:admin@localhost:27017/logflow?authSource=admin",
    dbName: process.env.MONGODB_DB ?? "logflow",
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost,http://localhost:4200",
  },
  apiKey: requiredString("API_KEY"),
} as const;
