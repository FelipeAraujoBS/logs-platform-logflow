import "dotenv/config";

function requiredString(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variavel de ambiente obrigatória ausente: ${key}`);
  return value;
}

function optionalString(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
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
    port: optionalNumber("HTTP_PORT", 3000),
  },
  grpc: {
    port: optionalNumber("GRPC_PORT", 50051),
  },
  redis: {
    host: optionalString("REDIS_HOST", "localhost"),
    port: optionalNumber("REDIS_PORT", 6379),
  },
  apiKey: requiredString("API_KEY"),
} as const;
