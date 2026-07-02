import { connectDatabase, disconnectDatabase } from "./database/connection";
import { makeLogProcessor } from "./processor/log.processor";
import { makeLogConsumer } from "./consumer/log.consumer";
import { startMetricsServer } from "./metrics/metrics";
import { env } from "./config/env";
import pino from "pino";

const logger = pino({ name: "worker" });

async function main(): Promise<void> {
  try {
    const db = await connectDatabase();

    const processor = makeLogProcessor(db);
    await processor.initialize();

    const worker = makeLogConsumer(db);

    startMetricsServer(env.worker.metricsPort);

    logger.info("Worker rodando — aguardando jobs...");

    const shutdown = async () => {
      logger.info("Encerrando worker...");
      await worker.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error({ error }, "Erro ao inicializar o worker");
    process.exit(1);
  }
}

main();
