import { Severity } from "../types/severity";
export interface GrpcLogPayload {
    severity: Severity;
    serviceName: string;
    serviceVersion: string;
    serviceEnvironment: "development" | "staging" | "production";
    serviceHost?: string;
    message: string;
    timestampMs?: number;
    traceId?: string;
    spanId?: string;
    metadataJson?: string;
}
