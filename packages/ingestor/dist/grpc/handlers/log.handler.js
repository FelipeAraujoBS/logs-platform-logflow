"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestLogHandler = ingestLogHandler;
const log_normalizer_1 = require("../../normalizer/log.normalizer");
const producer_1 = require("../../queue/producer");
async function ingestLogHandler(call, callback) {
    try {
        const payload = {
            severity: call.request.severity,
            serviceName: call.request.serviceName,
            serviceVersion: call.request.serviceVersion,
            serviceEnvironment: call.request.serviceEnvironment,
            serviceHost: call.request.serviceHost,
            message: call.request.message,
            timestampMs: call.request.timestampMs,
            traceId: call.request.trace_id,
            spanId: call.request.spanId,
            metadataJson: call.request.metadataJson,
        };
        const entry = (0, log_normalizer_1.normalizeGrpc)(payload);
        await (0, producer_1.pushToQueue)(entry);
        callback(null, { id: entry.id, sucess: true });
    }
    catch (error) {
        callback({
            code: 13,
            message: error instanceof Error ? error.message : "Internal error",
        });
    }
}
