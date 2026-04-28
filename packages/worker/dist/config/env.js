"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function optional(key, fallback) {
    return process.env[key] ?? fallback;
}
exports.env = {
    redis: {
        host: optional("REDIS_HOST", "localhost"),
        port: optional("REDIS_PORT", "6379"),
    },
    mongodb: {
        uri: optional("MONGODB_URI", "mongodb://admin:admin@localhost:27017/logflow?authSource=admin"),
        dbName: optional("MONGODB_DB", "logflow"),
    },
};
