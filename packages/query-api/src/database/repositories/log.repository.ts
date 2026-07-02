import { Db, WithId, Document } from "mongodb";
import { LogEntry, Severity } from "@log-platform/shared";

const COLLECTION = "logs";

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

function toLogEntry(doc: WithId<Document>): LogEntry {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest } as unknown as LogEntry;
}

const MAX_PAGE_SIZE = 100;

export function makeLogRepository(db: Db) {
  return {
    async findMany(
      filters: LogFilters,
      page: number = 1,
      pageSize: number = 50
    ): Promise<PaginatedResult> {
      const query: Record<string, unknown> = {};

      if (filters.severity) query["severity"] = filters.severity;
      if (filters.serviceName) query["service.name"] = filters.serviceName;
      if (filters.traceId) query["traceId"] = filters.traceId;
      if (filters.startDate || filters.endDate) {
        query["timestamp"] = {
          ...(filters.startDate && { $gte: filters.startDate }),
          ...(filters.endDate && { $lte: filters.endDate }),
        };
      }

      const safePageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
      const skip = (Math.max(1, page) - 1) * safePageSize;

      const [data, total] = await Promise.all([
        db
          .collection(COLLECTION)
          .find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(safePageSize)
          .toArray(),
        db.collection(COLLECTION).countDocuments(query),
      ]);

      return {
        data: data.map(toLogEntry),
        total,
        page,
        pageSize: safePageSize,
        totalPages: Math.ceil(total / safePageSize),
      };
    },
  };
}
