import "dotenv/config";
export declare const env: {
    readonly http: {
        readonly port: number;
    };
    readonly grpc: {
        readonly port: number;
    };
    readonly redis: {
        readonly host: string;
        readonly port: number;
    };
};
