import "dotenv/config";
export declare const env: {
    readonly redis: {
        readonly host: string;
        readonly port: string;
    };
    readonly mongodb: {
        readonly uri: string;
        readonly dbName: string;
    };
};
