"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeLogProcessor = makeLogProcessor;
const log_repository_1 = require("../database/repositories/log.repository");
function makeLogProcessor(db) {
    const repository = (0, log_repository_1.makeLogRepository)(db);
    return {
        async process(entry) {
            await repository.insertOne(entry);
        },
        async initialize() {
            await repository.createIndexes();
            console.log("Índices do MongoDB criado");
        },
    };
}
