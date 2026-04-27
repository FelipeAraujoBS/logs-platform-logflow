import { v4 as uuidv4 } from "uuid";
import { LogEntry, HttpLogPayload, GrpcLogPayload } from "@log-platform/shared";

export function normalizeHttp(payload: HttpLogPayload): LogEntry {
  return {
    id: uuidv4(),
    severity: payload.severity,
    service: payload.service,
    message: payload.message,
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    traceId: payload.traceId ?? undefined,
    spanId: payload.spanId ?? undefined,
    metadata: payload.metadata ?? undefined,
  };
}

export function normalizeGrpc(payload: GrpcLogPayload): LogEntry {
  return {
    id: uuidv4(),
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
