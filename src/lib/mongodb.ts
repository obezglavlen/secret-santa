import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI не задан");
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}
