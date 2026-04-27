export declare const logSchema: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["severity", "service", "message"];
        readonly properties: {
            readonly severity: {
                readonly type: "string";
                readonly enum: readonly ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];
            };
            readonly service: {
                readonly type: "object";
                readonly required: readonly ["name", "version", "environment"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly version: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly environment: {
                        readonly type: "string";
                        readonly enum: readonly ["development", "staging", "production"];
                    };
                    readonly host: {
                        readonly type: "string";
                    };
                };
            };
            readonly message: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly timestamp: {
                readonly type: "string";
                readonly format: "date-time";
            };
            readonly traceId: {
                readonly type: "string";
            };
            readonly spanId: {
                readonly type: "string";
            };
            readonly metadata: {
                readonly type: "object";
            };
        };
    };
};
