import { FastifyInstance } from "fastify";
import Redis from "ioredis";
import { env } from "../../config/env";

const redis = new Redis({ host: env.redis.host, port: env.redis.port, lazyConnect: true, maxRetriesPerRequest: 0 });

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_req, res) => {
    let redisOk = false;
    try {
      await redis.ping();
      redisOk = true;
    } catch {
      redisOk = false;
    }
    const ok = redisOk;
    return res.status(ok ? 200 : 503).send({
      status: ok ? "ok" : "degraded",
      redis: redisOk ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  });
}
