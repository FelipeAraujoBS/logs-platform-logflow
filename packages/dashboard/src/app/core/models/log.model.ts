export type Severity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface ServiceInfo {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  host?: string;
}

export interface LogEntry {
  _id: string;
  severity: Severity;
  service: ServiceInfo;
  message: string;
  timestamp: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, unknown>;
}

export interface LogFilters {
  severity?: Severity;
  serviceName?: string;
  startDate?: string;
  endDate?: string;
  traceId?: string;
}

export interface PaginatedResult {
  data: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
