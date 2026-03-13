import { MongoClient, ServerApiVersion } from "mongodb";

import { env } from "../config/env.js";

let client;
let db;
let connected = false;

function createClient() {
  return new MongoClient(env.mongoDbConnectionUrl, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

export async function connectToDatabase() {
  if (connected && db) {
    return db;
  }

  if (!env.mongoDbConnectionUrl) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  client = createClient();
  await client.connect();
  db = client.db(env.mongoDbName);
  connected = true;

  console.log(`MongoDB connected (db: ${env.mongoDbName}).`);

  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error(
      "Database not initialized. Call connectToDatabase() first.",
    );
  }

  return db;
}

export function getDatabaseStatus() {
  return connected ? "connected" : "disconnected";
}

export async function closeDatabaseConnection() {
  if (!client) {
    return;
  }

  await client.close();
  connected = false;
  db = undefined;
  client = undefined;
}
