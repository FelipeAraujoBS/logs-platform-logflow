import { FastifyInstance } from "fastify";
import { Db } from "mongodb";
import { Severity, sanitizeFilterValue } from "@log-platform/shared";
import { makeLogRepository, LogFilters } from "../../database/repositories/log.repository";

export function makeLogRoutes(db: Db) {
  return async function logRoutes(app: FastifyInstance): Promise<void> {
    const repository = makeLogRepository(db);

    app.get("/logs", async (request, reply) => {
      try {
        const query = request.query as Record<string, string>;

        const filters: LogFilters = {
          severity: query.severity as Severity | undefined,
          serviceName: query.serviceName ? sanitizeFilterValue(query.serviceName) : undefined,
          traceId: query.traceId ? sanitizeFilterValue(query.traceId) : undefined,
          startDate: query.startDate ? new Date(query.startDate) : undefined,
          endDate: query.endDate ? new Date(query.endDate) : undefined,
        };

        const page = query.page ? Math.max(1, Number(query.page)) : 1;
        const pageSize = query.pageSize ? Math.min(100, Math.max(1, Number(query.pageSize))) : 50;

        const result = await repository.findMany(filters, page, pageSize);
        return reply.status(200).send(result);
      } catch (error) {
        request.log.error(error, "Erro ao buscar logs");
        return reply.status(500).send({ error: "Failed to fetch logs" });
      }
    });
  };
}
