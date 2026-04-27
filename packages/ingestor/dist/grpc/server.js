"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGrpcServer = buildGrpcServer;
exports.startGrpcServer = startGrpcServer;
const path_1 = __importDefault(require("path"));
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const log_handler_1 = require("./handlers/log.handler");
const env_1 = require("../config/env");
const PROTO_PATH = path_1.default.resolve(__dirname, "../../proto/log.proto");
function buildGrpcServer() {
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: false,
        longs: Number,
        enums: String,
        defaults: true,
        oneofs: true,
    });
    const proto = grpc.loadPackageDefinition(packageDefinition);
    const server = new grpc.Server();
    server.addService(proto.log.LogService.service, {
        ingestLog: log_handler_1.ingestLogHandler,
    });
    return server;
}
function startGrpcServer() {
    const server = buildGrpcServer();
    server.bindAsync(`0.0.0.0:${env_1.env.grpc.port}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error)
            throw error;
        console.log(`gRPC server rodando na porta ${port}`);
    });
}
