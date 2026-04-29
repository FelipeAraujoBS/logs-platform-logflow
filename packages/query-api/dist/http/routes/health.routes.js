"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = healthRoutes;
async function healthRoutes(app) {
    app.get('/health', async (request, reply) => {
        return reply.status(200).send({
            status: 'ok',
            timestamp: new Date().toISOString(),
        });
    });
}
