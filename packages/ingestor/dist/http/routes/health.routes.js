"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = healthRoutes;
async function healthRoutes(app) {
    app.get("/health", async (req, res) => {
        return res.status(200).send({
            status: "ok",
            timestamp: new Date().toISOString(),
        });
    });
}
