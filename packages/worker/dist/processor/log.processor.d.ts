import { LogEntry } from "@log-platform/shared";
import { Db } from "mongodb";
export declare function makeLogProcessor(db: Db): {
    process(entry: LogEntry): Promise<void>;
    initialize(): Promise<void>;
};
