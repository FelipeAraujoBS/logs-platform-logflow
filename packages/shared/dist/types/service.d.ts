export interface ServiceInfo {
    name: string;
    version: string;
    enviroment: "development" | "staging" | "production";
    host?: string;
}
