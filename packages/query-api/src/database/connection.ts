import path from "path";
import dotenv from "dotenv";
import { MongoClient, Db } from "mongodb";
import { env } from "../config/env";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.mongodb.uri);
  await client.connect();
  db = client.db(env.mongodb.dbName);

  console.log("Conectado ao MongoDB");
  return db;
}

export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("Desconectado do MongoDB");
  }
}
