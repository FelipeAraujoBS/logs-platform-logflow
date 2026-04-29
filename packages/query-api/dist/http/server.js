"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = buildServer;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const health_routes_1 = require("./routes/health.routes");
const log_routes_1 = require("./routes/log.routes");
async function buildServer(db) {
    const app = (0, fastify_1.default)({
        logger: {
            level: 'info',
        },
    });
    await app.register(cors_1.default, {
        origin: 'http://localhost:4200',
        methods: ['GET'],
    });
    await app.register(websocket_1.default);
    await app.register(health_routes_1.healthRoutes, { prefix: '/api/v1' });
    await app.register((0, log_routes_1.makeLogRoutes)(db), { prefix: '/api/v1' });
    return app;
}
