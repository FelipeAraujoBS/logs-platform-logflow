import { GrpcLogPayload } from "@log-platform/shared";
import { normalizeGrpc } from "../../normalizer/log.normalizer";
import { pushToQueue } from "../../queue/producer";

export async function ingestLogHandler(
  call: any,
  callback: any
): Promise<void> {
  try {
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

    callback(null, { id: entry.id, sucess: true });
  } catch (error) {
    callback({
      code: 13,
      message: error instanceof Error ? error.message : "Internal error",
    });
  }
}
