// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User } from "../../app/interfaces";
import UserModel from "./models/UserModel";
import { UserAlreadyExists } from "../../constants/strings";

export default class UserGateway implements UserDBGateway {
  async getUserByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      let user = await UserModel.findOne({ email }).select("+hashed_password");
      if (!user) return Promise.resolve(null);
      else {
        if (user.isAuthenticated(password)) {
          let userInJSON = user.toJSON();
          delete userInJSON.hashed_password;
          return Promise.resolve(userInJSON);
        } else return Promise.resolve(null);
      }
    } catch (e) {
      return Promise.resolve(null);
    }
  }
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await UserModel.findOne({ email });
    } catch (e) {
      return Promise.resolve(null);
    }
  }
  async getUserById(id: string): Promise<User | null> {
    try {
      return await UserModel.findById(id);
    } catch (e) {
      return Promise.resolve(null);
    }
  }
  async addUser(data: SignUpData): Promise<User> {
    try {
      let user = new UserModel(data);
      return await user.save();
    } catch (e) {
      throw UserAlreadyExists;
    }
  }
}
