"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHttp = normalizeHttp;
exports.normalizeGrpc = normalizeGrpc;
const uuid_1 = require("uuid");
function normalizeHttp(payload) {
    return {
        id: (0, uuid_1.v4)(),
        severity: payload.severity,
        service: payload.service,
        message: payload.message,
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        traceId: payload.traceId ?? undefined,
        spanId: payload.spanId ?? undefined,
        metadata: payload.metadata ?? undefined,
    };
}
function normalizeGrpc(payload) {
    return {
        id: (0, uuid_1.v4)(),
        severity: payload.severity,
        service: {
            name: payload.serviceName,
            version: payload.serviceVersion,
            environment: payload.serviceEnvironment ?? "development",
            host: payload.serviceHost ?? undefined,
        },
        message: payload.message,
        timestamp: payload.timestampMs ? new Date(payload.timestampMs) : new Date(),
        traceId: payload.traceId ?? undefined,
        spanId: payload.spanId ?? undefined,
        metadata: payload.metadataJson
            ? JSON.parse(payload.metadataJson)
            : undefined,
    };
}
