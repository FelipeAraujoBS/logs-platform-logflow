export interface ServiceInfo {
    name: string;
    version: string;
    environment: "development" | "staging" | "production";
    host?: string;
}
