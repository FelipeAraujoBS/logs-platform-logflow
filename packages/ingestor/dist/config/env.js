"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function required(key) {
    const value = process.env[key];
    if (!value)
        throw new Error(`Variavel de ambiente obrigatória ausente: ${key}`);
    return value;
}
function optional(key, fallback) {
    return process.env[key] ?? fallback;
}
exports.env = {
    http: {
        port: Number(optional("HTTP_PORT", "3000")),
    },
    grpc: {
        port: Number(optional("GRPC_PORT", "50051")),
    },
    redis: {
        host: optional("REDIS_HOST", "localhost"),
        port: Number(optional("REDIS_PORT", "6379")),
    },
};
