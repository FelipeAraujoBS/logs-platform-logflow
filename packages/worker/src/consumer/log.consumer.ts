import { Worker } from "bullmq";
import { LogEntry } from "@log-platform/shared";
import { makeLogProcessor } from "../processor/log.processor";
import { Db } from "mongodb";

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
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
      concurrency: 10,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} processado com sucesso`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} falhou:`, error.message);
  });

  return worker;
}
