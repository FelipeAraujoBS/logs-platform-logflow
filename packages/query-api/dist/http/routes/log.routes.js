"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogRoutes = makeLogRoutes;
const log_repository_1 = require("../../database/repositories/log.repository");
function makeLogRoutes(db) {
    return async function logRoutes(app) {
        const repository = (0, log_repository_1.makeLogRepository)(db);
        app.get('/logs', async (request, reply) => {
            const query = request.query;
            const filters = {
                severity: query.severity,
                serviceName: query.serviceName,
                traceId: query.traceId,
                startDate: query.startDate ? new Date(query.startDate) : undefined,
                endDate: query.endDate ? new Date(query.endDate) : undefined,
            };
            const page = query.page ? Number(query.page) : 1;
            const pageSize = query.pageSize ? Number(query.pageSize) : 50;
            const result = await repository.findMany(filters, page, pageSize);
            return reply.status(200).send(result);
        });
    };
}
