import { Db } from 'mongodb'
import { LogEntry, Severity } from '@log-platform/shared'

const COLLECTION = 'logs'

export interface LogFilters {
  severity?: Severity
  serviceName?: string
  startDate?: Date
  endDate?: Date
  traceId?: string
}

export interface PaginatedResult {
  data: LogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function makeLogRepository(db: Db) {
  return {
    async findMany(
      filters: LogFilters,
      page: number = 1,
      pageSize: number = 50
    ): Promise<PaginatedResult> {
      const query: Record<string, unknown> = {}

      if (filters.severity)    query['severity'] = filters.severity
      if (filters.serviceName) query['service.name'] = filters.serviceName
      if (filters.traceId)     query['traceId'] = filters.traceId
      if (filters.startDate || filters.endDate) {
        query['timestamp'] = {
          ...(filters.startDate && { $gte: filters.startDate }),
          ...(filters.endDate   && { $lte: filters.endDate }),
        }
      }

      const skip = (page - 1) * pageSize

      const [data, total] = await Promise.all([
        db.collection(COLLECTION)
          .find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(pageSize)
          .toArray(),
        db.collection(COLLECTION).countDocuments(query),
      ])

      return {
        data: data as unknown as LogEntry[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    },
  }
}