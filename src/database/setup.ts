import AuthDB from "./authDB";
import { MongoMemoryServer } from "mongodb-memory-server";
const mongoServer = new MongoMemoryServer();
const authDB = new AuthDB();

export async function startDB() {
  const uri = await mongoServer.getConnectionString();
  await authDB.start(uri);
  return authDB;
}

export async function stopDB() {
  await authDB.stop();
  await mongoServer.stop();
}
