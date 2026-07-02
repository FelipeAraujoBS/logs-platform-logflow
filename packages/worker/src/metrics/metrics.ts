import promClient from "prom-client";
import http from "http";
import pino from "pino";

const logger = pino({ name: "worker-metrics" });

export const registry = new promClient.Registry();

promClient.collectDefaultMetrics({ register: registry });

export const jobsProcessedCounter = new promClient.Counter({
  name: "logflow_jobs_processed_total",
  help: "Total de jobs processados pelo worker",
  registers: [registry],
});

export const jobsFailedCounter = new promClient.Counter({
  name: "logflow_jobs_failed_total",
  help: "Total de jobs que falharam no worker",
  registers: [registry],
});

export const jobProcessingDuration = new promClient.Histogram({
  name: "logflow_job_processing_duration_seconds",
  help: "Duração do processamento de cada job",
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 3, 5],
  registers: [registry],
});

export function startMetricsServer(port: number): void {
  const server = http.createServer(async (req, res) => {
    if (req.url === "/metrics") {
      res.writeHead(200, { "Content-Type": registry.contentType });
      res.end(await registry.metrics());
    } else {
      res.writeHead(200);
      res.end("ok");
    }
  });

  server.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Servidor de métricas rodando");
  });
}
