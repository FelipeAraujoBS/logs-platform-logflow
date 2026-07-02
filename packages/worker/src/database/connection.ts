import { MongoClient, Db } from "mongodb";
import { env } from "../config/env";
import pino from "pino";

const logger = pino({ name: "worker-db" });

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.mongodb.uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    retryWrites: true,
  });

  await client.connect();
  db = client.db(env.mongodb.dbName);

  logger.info("Conectado ao MongoDB");
  return db;
}

export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info("Desconectado do MongoDB");
  }
}
