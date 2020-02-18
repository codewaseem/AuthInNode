// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User } from "../interfaces";
import UserModel from "./models/UserModel";

export default class UserGateway implements UserDBGateway {
  async getUserByEmail(email: string) {
    return await UserModel.findOne({ email });
  }
  async getUserById(id: string): Promise<User | null> {
    return await UserModel.findById(id);
  }
  async addUser(data: SignUpData): Promise<User> {
    let user = new UserModel(data);
    return await user.save();
  }
}
