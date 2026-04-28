import { Db } from "mongodb";
import { LogEntry } from "@log-platform/shared";
export declare function makeLogRepository(db: Db): {
    insertOne(entry: LogEntry): Promise<void>;
    insertMany(entries: LogEntry[]): Promise<void>;
    createIndexes(): Promise<void>;
};
