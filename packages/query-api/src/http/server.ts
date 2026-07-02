import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import metricsPlugin from "fastify-metrics";
import { Db } from "mongodb";
import { env } from "../config/env";
import { makeHealthRoutes } from "./routes/health.routes";
import { makeLogRoutes } from "./routes/log.routes";

function authHook(app: FastifyInstance) {
  app.addHook("onRequest", async (req, res) => {
    if (req.url === "/api/v1/health" || req.url === "/metrics") return;
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ") || auth.slice(7) !== env.apiKey) {
      return res.status(401).send({ error: "Unauthorized" });
    }
  });
}

export async function buildServer(db: Db): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: "info",
    },
  });

  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await app.register(cors, {
    origin: env.cors.origin.split(","),
    methods: ["GET"],
  });

  await app.register(websocket);

  await app.register(metricsPlugin, {
    endpoint: "/metrics",
    defaultMetrics: { enabled: true },
    routeMetrics: { enabled: true },
  });

  authHook(app);

  app.setErrorHandler((error: any, _req, res) => {
    app.log.error(error);
    return res.status(error.statusCode ?? 500).send({
      error: error.statusCode === 429 ? "Too many requests" : "Internal server error",
    });
  });

  await app.register(makeHealthRoutes(db), { prefix: "/api/v1" });
  await app.register(makeLogRoutes(db), { prefix: "/api/v1" });

  return app;
}
