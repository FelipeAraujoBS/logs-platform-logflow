"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogConsumer = makeLogConsumer;
const bullmq_1 = require("bullmq");
const log_processor_1 = require("../processor/log.processor");
function makeLogConsumer(db) {
    const processor = (0, log_processor_1.makeLogProcessor)(db);
    const worker = new bullmq_1.Worker("logs-ingest", async (job) => {
        const entry = job.data;
        await processor.process(entry);
    }, {
        connection: {
            host: process.env.REDIS_HOST ?? "localhost",
            port: Number(process.env.REDIS_PORT ?? 6379),
        },
        concurrency: 10,
    });
    worker.on("completed", (job) => {
        console.log(`Job ${job.id} processado com sucesso`);
    });
    worker.on("failed", (job, error) => {
        console.error(`Job ${job?.id} falhou:`, error.message);
    });
    return worker;
}
