import * as grpc from "@grpc/grpc-js";
import { GrpcLogPayload } from "@log-platform/shared";
import { normalizeGrpc } from "../../normalizer/log.normalizer";
import { pushToQueue } from "../../queue/producer";
import { getLogsReceivedCounter } from "../../http/server";

export async function ingestLogHandler(
  call: any,
  callback: any
): Promise<void> {
  try {
    if (!call.request.severity || !call.request.serviceName || !call.request.message) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "severity, serviceName e message são obrigatórios",
      });
    }

    const payload: GrpcLogPayload = {
      severity: call.request.severity,
      serviceName: call.request.serviceName,
      serviceVersion: call.request.serviceVersion,
      serviceEnvironment: call.request.serviceEnvironment as
        | "development"
        | "staging"
        | "production",
      serviceHost: call.request.serviceHost,
      message: call.request.message,
      timestampMs: call.request.timestampMs,
      traceId: call.request.trace_id,
      spanId: call.request.spanId,
      metadataJson: call.request.metadataJson,
    };

    const entry = normalizeGrpc(payload);
    await pushToQueue(entry);
    getLogsReceivedCounter().inc({ protocol: "grpc" });

    callback(null, { id: entry.id, sucess: true });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: error instanceof Error ? error.message : "Internal error",
    });
  }
}
