import mongoose from "mongoose";
import UserModel from "./models/user";
import { Strings } from "../constants/strings";

class AuthDB implements AuthDBGateway {
  private dbConnection!: mongoose.Mongoose;
  async start(dbUri: string) {
    this.dbConnection = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  }

  async stop() {
    this.dbConnection.disconnect();
  }

  async addUser(userData: SignUpData): Promise<User> {
    this.checkConnection();
    let user = new UserModel(userData);
    return <User>await user.save();
  }

  private checkConnection() {
    if (!this.dbConnection) {
      throw new Error(Strings.DBNotConnected);
    }
  }

  getUserByEmail(): Promise<User> {
    throw new Error("Method not implemented.");
  }
  getUserById(): Promise<User> {
    throw new Error("Method not implemented.");
  }
}

export default AuthDB;
