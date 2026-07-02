import { LogEntry } from "@log-platform/shared";
import { makeLogRepository } from "../database/repositories/log.repository";
import { Db } from "mongodb";
import pino from "pino";
import {
  jobsProcessedCounter,
  jobsFailedCounter,
  jobProcessingDuration,
} from "../metrics/metrics";

const logger = pino({ name: "worker-processor" });

export function makeLogProcessor(db: Db) {
  const repository = makeLogRepository(db);

  return {
    async process(entry: LogEntry): Promise<void> {
      const end = jobProcessingDuration.startTimer();
      try {
        await repository.insertOne(entry);
        jobsProcessedCounter.inc();
      } catch (error) {
        jobsFailedCounter.inc();
        logger.error({ error, entryId: entry.id }, "Falha ao processar log");
        throw error;
      } finally {
        end();
      }
    },

    async initialize(): Promise<void> {
      await repository.createIndexes();
      logger.info("Índices do MongoDB criados");
    },
  };
}
