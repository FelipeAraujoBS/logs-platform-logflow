import Fastify, { FastifyInstance } from "fastify";
import { healthRoutes } from "./routes/health.routes";
import { logRoutes } from "./routes/log.routes";

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: "info",
    },
  });

  await app.register(healthRoutes, { prefix: "/api/v1" });
  await app.register(logRoutes, { prefix: "/api/v1" });

  return app;
}
