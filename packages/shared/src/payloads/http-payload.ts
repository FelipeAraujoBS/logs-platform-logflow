import { Severity } from "../types/severity";
import { ServiceInfo } from "../types/service";

export interface HttpLogPayload {
  severity: Severity;
  service: ServiceInfo;
  message: string;
  timestamp?: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, unknown>;
}
