import { Db } from "mongodb";
import { LogEntry } from "@log-platform/shared";

const COLLECTION = "logs";

export function makeLogRepository(db: Db) {
  return {
    async insertOne(entry: LogEntry): Promise<void> {
      await db.collection(COLLECTION).insertOne({
        ...entry,
        _id: entry.id as any,
      });
    },

    async insertMany(entries: LogEntry[]): Promise<void> {
      const docs = entries.map((entry) => ({
        ...entry,
        _id: entry.id as any,
      }));
      await db.collection(COLLECTION).insertMany(docs);
    },

    async createIndexes(): Promise<void> {
      const col = db.collection(COLLECTION);

      await col.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: 60 * 60 * 24 * 30 }
      );

      await col.createIndex({ "service.name": 1, severity: 1, timestamp: -1 });

      await col.createIndex({ traceId: 1 }, { sparse: true });
    },
  };
}
