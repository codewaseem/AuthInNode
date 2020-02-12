require("dotenv").config();
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import UserModel from "./user";

const mongoServer = new MongoMemoryServer();
const userData = {
  name: "TekLoon",
  email: "testuser@gmail.comm",
  password: "test@132465MMD",
};
mongoose.Promise = global.Promise;

describe("User Model", () => {
  let connection: mongoose.Mongoose;
  beforeAll(async () => {
    const uri = await mongoServer.getConnectionString();

    connection = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  });

  test("create & save user successfully", async () => {
    const validUser = new UserModel(userData);
    const savedUser = await validUser.save();
    expect(savedUser.id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
  });

  afterAll(async () => {
    connection.disconnect();
    mongoServer.stop();
  });
});
