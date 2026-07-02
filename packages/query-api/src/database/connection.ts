import { MongoClient, Db } from "mongodb";
import { env } from "../config/env";

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

  return db;
}

export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
