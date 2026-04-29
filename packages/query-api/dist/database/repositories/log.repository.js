"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogRepository = makeLogRepository;
const COLLECTION = 'logs';
function makeLogRepository(db) {
    return {
        async findMany(filters, page = 1, pageSize = 50) {
            const query = {};
            if (filters.severity)
                query['severity'] = filters.severity;
            if (filters.serviceName)
                query['service.name'] = filters.serviceName;
            if (filters.traceId)
                query['traceId'] = filters.traceId;
            if (filters.startDate || filters.endDate) {
                query['timestamp'] = {
                    ...(filters.startDate && { $gte: filters.startDate }),
                    ...(filters.endDate && { $lte: filters.endDate }),
                };
            }
            const skip = (page - 1) * pageSize;
            const [data, total] = await Promise.all([
                db.collection(COLLECTION)
                    .find(query)
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(pageSize)
                    .toArray(),
                db.collection(COLLECTION).countDocuments(query),
            ]);
            return {
                data: data,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        },
    };
}
