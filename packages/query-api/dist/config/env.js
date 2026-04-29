"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
function optional(key, fallback) {
    return process.env[key] ?? fallback;
}
exports.env = {
    http: {
        port: Number(optional('HTTP_PORT', '3001'))
    },
    mongodb: {
        uri: optional('MONGODB_URI', 'mongodb://admin:admin@localhost:27017/logflow?authSource=admin'),
        dbName: optional('MONGODB_DB', 'logflow')
    }
};
