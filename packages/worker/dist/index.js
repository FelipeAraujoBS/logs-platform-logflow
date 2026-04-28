"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./database/connection");
const log_processor_1 = require("./processor/log.processor");
const log_consumer_1 = require("./consumer/log.consumer");
async function main() {
    try {
        const db = await (0, connection_1.connectDatabase)();
        const processor = (0, log_processor_1.makeLogProcessor)(db);
        await processor.initialize();
        (0, log_consumer_1.makeLogConsumer)(db);
        console.log("Worker rodando — aguardando jobs...");
        process.on("SIGTERM", async () => {
            console.log("Encerrando worker...");
            await (0, connection_1.disconnectDatabase)();
            process.exit(0);
        });
        process.on("SIGINT", async () => {
            console.log("Encerrando worker...");
            await (0, connection_1.disconnectDatabase)();
            process.exit(0);
        });
    }
    catch (error) {
        console.error("Erro ao inicializar o worker:", error);
        process.exit(1);
    }
}
main();
