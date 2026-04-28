import { Db } from "mongodb";
import { LogEntry } from "@log-platform/shared";

const COLLECTION = "logs";

export function makeLogRepository(db: Db) {
  return {
    async insertOne(entry: LogEntry): Promise<void> {
      const { id, ...rest } = entry;
      await db.collection(COLLECTION).insertOne({
        _id: id as any,
        ...rest,
      });
    },

    async insertMany(entries: LogEntry[]): Promise<void> {
      const docs = entries.map(({ id, ...rest }) => ({
        _id: id as any,
        ...rest,
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
