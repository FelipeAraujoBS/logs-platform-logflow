import { FastifyInstance } from "fastify";
import { Db } from "mongodb";

export function makeHealthRoutes(db: Db) {
  return async function healthRoutes(app: FastifyInstance): Promise<void> {
    app.get("/health", async (_request, reply) => {
      let mongoOk = false;
      try {
        await db.admin().ping();
        mongoOk = true;
      } catch {
        mongoOk = false;
      }
      const ok = mongoOk;
      return reply.status(ok ? 200 : 503).send({
        status: ok ? "ok" : "degraded",
        mongodb: mongoOk ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      });
    });
  };
}
