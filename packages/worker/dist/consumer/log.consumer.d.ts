import { Worker } from "bullmq";
import { Db } from "mongodb";
export declare function makeLogConsumer(db: Db): Worker<any, any, string>;
