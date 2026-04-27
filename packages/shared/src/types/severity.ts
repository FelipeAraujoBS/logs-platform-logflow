export type Severity = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export const SEVERITY_LEVEL: Record<Severity, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};
