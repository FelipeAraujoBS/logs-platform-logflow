import { Severity } from "./severity";
import { ServiceInfo } from "./service";
export interface LogEntry {
    id: string;
    severity: Severity;
    service: ServiceInfo;
    message: string;
    timestamp: Date;
    traceId?: string;
    spanId?: string;
    metadata?: Record<string, unknown>;
}
