"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushToQueue = pushToQueue;
const bullmq_1 = require("bullmq");
const shared_1 = require("@log-platform/shared");
const env_1 = require("../config/env");
const connection = {
    host: env_1.env.redis.host,
    port: env_1.env.redis.port,
};
const logQueue = new bullmq_1.Queue(shared_1.QUEUE_NAMES.LOG_INGEST, { connection });
async function pushToQueue(entry) {
    await logQueue.add("log", entry, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: {
            count: 100,
        },
    });
}
