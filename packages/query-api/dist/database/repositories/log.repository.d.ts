import { Db } from 'mongodb';
import { LogEntry, Severity } from '@log-platform/shared';
export interface LogFilters {
    severity?: Severity;
    serviceName?: string;
    startDate?: Date;
    endDate?: Date;
    traceId?: string;
}
export interface PaginatedResult {
    data: LogEntry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare function makeLogRepository(db: Db): {
    findMany(filters: LogFilters, page?: number, pageSize?: number): Promise<PaginatedResult>;
};
