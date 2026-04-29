"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./database/connection");
const server_1 = require("./http/server");
const handler_1 = require("./websocket/handler");
const env_1 = require("./config/env");
async function main() {
    try {
        const db = await (0, connection_1.connectDatabase)();
        const app = await (0, server_1.buildServer)(db);
        (0, handler_1.registerWebSocket)(app, db);
        await app.listen({
            port: env_1.env.http.port,
            host: '0.0.0.0',
        });
        console.log(`Query API rodando na porta ${env_1.env.http.port}`);
        process.on('SIGTERM', async () => {
            console.log('Encerrando query-api...');
            await app.close();
            await (0, connection_1.disconnectDatabase)();
            process.exit(0);
        });
        process.on('SIGINT', async () => {
            console.log('Encerrando query-api...');
            await app.close();
            await (0, connection_1.disconnectDatabase)();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Erro ao inicializar a query-api:', error);
        process.exit(1);
    }
}
main();
