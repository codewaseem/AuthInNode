import { MongoMemoryServer } from "mongodb-memory-server";
import DBConnector from "../DBConnector";

const mongoServer = new MongoMemoryServer();
let dbConnector = new DBConnector();

export async function startDB() {
  const uri = await mongoServer.getConnectionString();
  await dbConnector.start(uri);
}

export async function stopDB() {
  await dbConnector.stop();
  await mongoServer.stop();
}
