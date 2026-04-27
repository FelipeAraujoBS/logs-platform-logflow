"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./http/server");
const server_2 = require("./grpc/server");
const env_1 = require("./config/env");
async function main() {
    try {
        const app = await (0, server_1.buildServer)();
        await app.listen({
            port: env_1.env.http.port,
            host: "0.0.0.0",
        });
        (0, server_2.startGrpcServer)();
        console.log(`HTTP server rodando na porta ${env_1.env.http.port}`);
        console.log(`gRPC server rodando na porta ${env_1.env.grpc.port}`);
    }
    catch (error) {
        console.error("Erro ao inicializar o ingestor", error);
        process.exit(1);
    }
}
main();
