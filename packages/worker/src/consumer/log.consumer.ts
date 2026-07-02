import { Worker } from "bullmq";
import { LogEntry } from "@log-platform/shared";
import { makeLogProcessor } from "../processor/log.processor";
import { Db } from "mongodb";
import { env } from "../config/env";
import pino from "pino";

const logger = pino({ name: "worker-consumer" });

export function makeLogConsumer(db: Db) {
  const processor = makeLogProcessor(db);

  const worker = new Worker(
    "logs-ingest",
    async (job) => {
      const entry = job.data as LogEntry;
      await processor.process(entry);
    },
    {
      connection: {
        host: env.redis.host,
        port: env.redis.port,
      },
      concurrency: env.worker.concurrency,
    }
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Job processado com sucesso");
  });

  worker.on("failed", (job, error) => {
    logger.error({ jobId: job?.id, error: error.message }, "Job falhou");
  });

  worker.on("error", (error) => {
    logger.error({ error: error.message }, "Erro no worker");
  });

  return worker;
}
