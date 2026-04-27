import { LogEntry, HttpLogPayload, GrpcLogPayload } from "@log-platform/shared";
export declare function normalizeHttp(payload: HttpLogPayload): LogEntry;
export declare function normalizeGrpc(payload: GrpcLogPayload): LogEntry;
