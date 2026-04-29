import { FastifyInstance } from 'fastify'
import { Db } from 'mongodb'
import { Severity } from '@log-platform/shared'
import { makeLogRepository, LogFilters } from '../../database/repositories/log.repository'

export function makeLogRoutes(db: Db) {
  return async function logRoutes(app: FastifyInstance): Promise<void> {
    const repository = makeLogRepository(db)

    app.get('/logs', async (request, reply) => {
      const query = request.query as Record<string, string>

      const filters: LogFilters = {
        severity:    query.severity as Severity | undefined,
        serviceName: query.serviceName,
        traceId:     query.traceId,
        startDate:   query.startDate ? new Date(query.startDate) : undefined,
        endDate:     query.endDate   ? new Date(query.endDate)   : undefined,
      }

      const page     = query.page     ? Number(query.page)     : 1
      const pageSize = query.pageSize ? Number(query.pageSize) : 50

      const result = await repository.findMany(filters, page, pageSize)

      return reply.status(200).send(result)
    })
  }
}