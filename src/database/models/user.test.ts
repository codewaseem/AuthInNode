require("dotenv").config();
import mongoose from "mongoose";
import UserModel from "./user";
import { startDB, stopDB } from "../setup";

const userData = {
  name: "TekLoon",
  email: "testuser@gmail.comm",
  password: "test@132465MMD",
};
mongoose.Promise = global.Promise;

describe("User Model", () => {
  let authDB: AuthDBGateway;
  beforeAll(async () => {
    authDB = await startDB();
  });
  test("create & save user successfully", async () => {
    const savedUser = await authDB.addUser(userData);
    expect(savedUser.id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
  });

  afterAll(async () => {
    stopDB();
  });
});
