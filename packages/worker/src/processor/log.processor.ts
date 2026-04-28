import { LogEntry } from "@log-platform/shared";
import { makeLogRepository } from "../database/repositories/log.repository";
import { Db } from "mongodb";

export function makeLogProcessor(db: Db) {
  const repository = makeLogRepository(db);

  return {
    async process(entry: LogEntry): Promise<void> {
      await repository.insertOne(entry);
    },

    async initialize(): Promise<void> {
      await repository.createIndexes();
      console.log("Índices do MongoDB criado");
    },
  };
}
