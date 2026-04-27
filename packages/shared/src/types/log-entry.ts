import { Severity } from "./severity";
import { ServiceInfo } from "./service";

export interface LogEntry {
  id: string; //UUID
  severity: Severity;
  service: ServiceInfo;
  message: string;
  timestamp: Date;
  traceId?: string; //correlacionar logs de uma mesma requisição
  spanId?: string; // distributed tracing
  metadata?: Record<string, unknown>; // dados extras
}
