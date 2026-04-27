"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRoutes = logRoutes;
const log_schema_1 = require("../schemas/log.schema");
const log_normalizer_1 = require("../../normalizer/log.normalizer");
const producer_1 = require("../../queue/producer");
async function logRoutes(app) {
    app.post("/logs", { schema: log_schema_1.logSchema }, async (req, res) => {
        const entry = (0, log_normalizer_1.normalizeHttp)(req.body);
        await (0, producer_1.pushToQueue)(entry);
        return res.status(202).send({ id: entry.id });
    });
}
