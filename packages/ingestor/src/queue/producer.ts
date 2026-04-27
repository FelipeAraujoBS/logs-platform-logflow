import { Queue } from "bullmq";
import { LogEntry } from "@log-platform/shared";
import { QUEUE_NAMES } from "@log-platform/shared";
import { env } from "../config/env";

const connection = {
  host: env.redis.host,
  port: env.redis.port,
};

const logQueue = new Queue(QUEUE_NAMES.LOG_INGEST, { connection });

export async function pushToQueue(entry: LogEntry): Promise<void> {
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
