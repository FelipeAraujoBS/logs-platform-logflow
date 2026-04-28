"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongodb_1 = require("mongodb");
const env_1 = require("../config/env");
let client = null;
let db = null;
async function connectDatabase() {
    if (db)
        return db;
    client = new mongodb_1.MongoClient(env_1.env.mongodb.uri);
    await client.connect();
    db = client.db(env_1.env.mongodb.dbName);
    console.log("Conectado ao MongoDB");
    return db;
}
async function disconnectDatabase() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log("Desconectado do MongoDB");
    }
}
