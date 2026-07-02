import Fastify, { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import metricsPlugin from "fastify-metrics";
import { healthRoutes } from "./routes/health.routes";
import { logRoutes } from "./routes/log.routes";
import { env } from "../config/env";
import { Counter } from "prom-client";

let logsReceivedCounter: Counter;

export function getLogsReceivedCounter(): Counter {
  return logsReceivedCounter;
}

function authHook(app: FastifyInstance) {
  app.addHook("onRequest", async (req, res) => {
    if (req.url === "/api/v1/health" || req.url === "/metrics") return;
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ") || auth.slice(7) !== env.apiKey) {
      return res.status(401).send({ error: "Unauthorized" });
    }
  });
}

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: "info",
    },
  });

  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  await app.register(metricsPlugin, {
    endpoint: "/metrics",
    defaultMetrics: { enabled: true },
    routeMetrics: { enabled: true },
  });

  await app.ready();
  logsReceivedCounter = new app.metrics.client.Counter({
    name: "logflow_logs_received_total",
    help: "Total de logs recebidos pelo ingestor",
    labelNames: ["protocol"],
  });

  authHook(app);

  app.setErrorHandler((error: any, _req, res) => {
    app.log.error(error);
    return res.status(error.statusCode ?? 500).send({
      error: error.statusCode === 429 ? "Too many requests" : "Internal server error",
    });
  });

  await app.register(healthRoutes, { prefix: "/api/v1" });
  await app.register(logRoutes, { prefix: "/api/v1" });

  return app;
}
