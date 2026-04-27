export const logSchema = {
  body: {
    type: "object",
    required: ["severity", "service", "message"],
    properties: {
      severity: {
        type: "string",
        enum: ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"],
      },
      service: {
        type: "object",
        required: ["name", "version", "environment"],
        properties: {
          name: { type: "string", minLength: 1 },
          version: { type: "string", minLength: 1 },
          environment: {
            type: "string",
            enum: ["development", "staging", "production"],
          },
          host: { type: "string" },
        },
      },
      message: { type: "string", minLength: 1 },
      timestamp: { type: "string", format: "date-time" },
      traceId: { type: "string" },
      spanId: { type: "string" },
      metadata: { type: "object" },
    },
  },
} as const;
