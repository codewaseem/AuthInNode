// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User } from "../interfaces";
import UserModel from "./models/UserModel";

export default class UserGateway implements UserDBGateway {
  async getUserByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    let user = await UserModel.findOne({ email }).select("+hashed_password");
    if (!user) return Promise.resolve(null);
    else {
      if (user.isAuthenticated(password)) {
        let userInJSON = user.toJSON();
        delete userInJSON.hashed_password;
        return Promise.resolve(userInJSON);
      } else return Promise.resolve(null);
    }
  }
  async getUserByEmail(email: string): Promise<User | null> {
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
