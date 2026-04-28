import { connectDatabase, disconnectDatabase } from "./database/connection";
import { makeLogProcessor } from "./processor/log.processor";
import { makeLogConsumer } from "./consumer/log.consumer";

async function main(): Promise<void> {
  try {
    const db = await connectDatabase();

    const processor = makeLogProcessor(db);
    await processor.initialize();

    makeLogConsumer(db);

    console.log("Worker rodando — aguardando jobs...");

    process.on("SIGTERM", async () => {
      console.log("Encerrando worker...");
      await disconnectDatabase();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("Encerrando worker...");
      await disconnectDatabase();
      process.exit(0);
    });
  } catch (error) {
    console.error("Erro ao inicializar o worker:", error);
    process.exit(1);
  }
}

main();
