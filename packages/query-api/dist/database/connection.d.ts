import { Db } from 'mongodb';
export declare function connectDatabase(): Promise<Db>;
export declare function disconnectDatabase(): Promise<void>;
